#!/usr/bin/env python
# -*- coding: utf-8 -*-

#
# Company: WONDROUS
# Created by: John Zimmerman
#
# MODELS/CONTENT.PY
#

import operator

from datetime import datetime
from itertools import chain

from sqlalchemy import BigInteger
from sqlalchemy import Boolean
from sqlalchemy import Column
from sqlalchemy import DateTime
from sqlalchemy import desc
from sqlalchemy import ForeignKey
from sqlalchemy import Integer
from sqlalchemy import Unicode

from sqlalchemy.ext.hybrid import hybrid_property

from sqlalchemy.orm import relationship

from wondrous.models import Base
from wondrous.models import DBSession

from wondrous.models.comment import Comment

from wondrous.models.object import FileToObject
from wondrous.models.object import LinkToObject
from wondrous.models.object import Object

from wondrous.models.post import Post

from wondrous.models.tag import Tag

from wondrous.models.vote import Vote

class ReportedContent(Base):

    """Reported content definition"""

    __tablename__ = 'reported_content'

    id = Column(BigInteger, primary_key=True)
    reporter_id = Column(BigInteger, ForeignKey('user.id'), nullable=False)
    user_id = Column(BigInteger, ForeignKey('user.id'), nullable=False)
    object_id = Column(BigInteger, nullable=False)
    why_id = Column(Integer, nullable=False)
    comment = Column(Unicode, nullable=True)
    deleted = Column(Boolean, nullable=True, default=False)
    date_reported = Column(DateTime, default=datetime.now)

    @hybrid_property
    def object(self):
        return Object.get(self.object_id)

    @hybrid_property
    def tags(self):
        return TagManager.by_post_id(self.post_id)

class ReportedContentManager(object):

    @staticmethod
    def get_all_reports_for_object(object_id):

        return ReportedContent.query.filter(ReportedContent.object_id == object_id).all()

    @staticmethod
    def get_top_offenders():

        all_reported_posts = ReportedContentManager.get_all()
        tally = dict()  # key = uid, value = count of their reported posts

        for rp in all_reported_posts:
            user_id = rp.user_id
            if user_id in tally:
                tally[user_id] += 1
            else:
                tally[user_id] = 1

        sorted_tally = sorted(tally.iteritems(), key=operator.itemgetter(1))
        return sorted_tally[::-1]

    @staticmethod
    def get_total_offenses_for_user(user_id):

        return ReportedContent.query.filter(ReportedContent.user_id == user_id).count()

    @staticmethod
    def get_all():

        """
            PURPOSE: Get all reported content from the database

            USE: Call like: ReportedContentManager.get_all()

            PARAMS: (None)

            RETURNS: (None)
        """

        return ReportedContent.query.order_by(desc(ReportedContent.date_reported)).all()

    @staticmethod
    def add(reported_content_data):

        """
            Add a new item to the reported_content table

            Why ID:
                1 ->  It's annoying or not interesting
                2 ->  I'm involved in this post and I don't like it
                3 ->  I think this is inappropriate for MojoRank
                4 ->  It's spam
        """

        new_reported_item = ReportedContent()

        new_reported_item.reporter_id = reported_content_data['reporter_id']
        new_reported_item.user_id   = reported_content_data['user_id']
        new_reported_item.object_id   = reported_content_data['object_id']
        new_reported_item.why_id      = reported_content_data['why_id']
        new_reported_item.comment     = reported_content_data['comment']

        DBSession.add(new_reported_item)

    @staticmethod
    def has_reported(reporter_id, object_id):
        report_exists = ReportedContent.query.filter(ReportedContent.reporter_id == reporter_id).\
                                              filter(ReportedContent.object_id == object_id).first()
        return True if report_exists else False

    @staticmethod
    def count():

        """Number of reported items in the system"""

        return ReportedContent.query.count()


class DeletedContent(Base):

    """
        Table which stores all deleted content for
        a duration for legal purposes only

        origin -> Where it was originally posted (profile, tag, or community)
        tags -> Serialized text of all tags on object
        object_link_ids -> Serialized list of object_link.id's
        object_file_ids -> Serialized list of object_file.id's
    """

    __tablename__ = 'deleted_content'

    id = Column(BigInteger, primary_key=True)
    user_id = Column(BigInteger, nullable=False)
    text = Column(Unicode, default=None)
    upvotes = Column(BigInteger, nullable=False)  # "likes"
    tags = Column(Unicode)
    object_link_ids = Column(Unicode)
    object_file_ids = Column(Unicode)
    created_at = Column(DateTime, nullable=False)
    date_deleted = Column(DateTime, default=datetime.now)


class DeletedContentManager(object):

    @staticmethod
    def add(object_id):

        """
            PURPOSE: This adds in an abbreviated set of data so
            that we can keep track of the deleted data for
            statistical and legal purposes.

            USE: Call like DeletedContentManager.add(...)

            PARAMS:
                object_id | <int> | REQUIRED | The id of the object which is being deleted

            RETURNS: (None)
        """

        object_to_delete = Object.by_id(object_id)

        deleted_content_data = dict()
        deleted_content_data['user_id']       = object_to_delete.user_id
        deleted_content_data['text']            = object_to_delete.text
        deleted_content_data['upvotes']         = ObjectVoteManager.get_like_count(object_id)  # ObjectTagVoteManager.get_total_upvotes_for_object(object_id)
        deleted_content_data['tags']            = ' '.join([o.global_tag.tag_name for o in TagManager.by_object_id(object_id=object_id)])
        deleted_content_data['object_link_ids'] = ' '.join([str(m.object_link_id) for m in LinkToObject.get_all_links_for_object(object_id)])
        deleted_content_data['object_file_ids'] = ' '.join([str(m.object_file_id) for m in FileToObject.get_all_files_for_object(object_id)])
        deleted_content_data['created_at']     = object_to_delete.created_at

        DeletedContentManager._add(deleted_content_data)

    @staticmethod
    def _add(deleted_content_data):

        """
            PURPOSE: Adds a new "deleted" object to the
            deleted_content table. This is primarily for
            legal purposes, with some potentially helpful
            analytics benefits as well

            USE: This is a private method.

            *** DO NOT CALL THIS METHOD INDEPENDANTLY.
            ALWAYS CALLED FROM THE DeletedContentManager.delete_content()
            METHOD ***

            Call like: DeletedContentManager._add(<dict>)

            PARAMS: 1 required dict, with each key as a column name:
                user_id : int : The User.id of the original object poster
                text : str : The Object.text
                upvotes : int : The total number of upvotes on Object across all ObjectTags
                tags : Unicode -> str : A serialized "list" of all str tag names
                object_links : Unicode -> int : A serialized "list" of all object_link.id's
                object_files : Unicode -> int : A serialized "list" of all object_file.id's
                created_at : DateTime : The date the object was originally posted

            RETURNS: (None)

        """

        new_deleted_content = DeletedContent()

        new_deleted_content.user_id       = deleted_content_data['user_id']
        new_deleted_content.text            = deleted_content_data['text']
        new_deleted_content.upvotes         = deleted_content_data['upvotes']
        new_deleted_content.tags            = deleted_content_data['tags']
        new_deleted_content.object_link_ids = deleted_content_data['object_link_ids']
        new_deleted_content.object_file_ids = deleted_content_data['object_file_ids']
        new_deleted_content.created_at     = deleted_content_data['created_at']

        DBSession.add(new_deleted_content)

    @staticmethod
    def _delete(object_id):

        """
            PURPOSE: Delete an Object and all the associated data

            USE: Call like: DeletedContentManager._delete(<int>)

            NOTE: This is a private method.

            *** DO NOT CALL THIS METHOD INDEPENDANTLY.
            ALWAYS CALLED FROM THE DeletedContentManager.delete_content()
            METHOD ***

            Call like: DeletedContentManager._delete(<object_id>)

            PARAMS: 1 required param, the Object.id of the Object to delete

            RETURNS: (None)

            NOTE: It deletes the following, in this order:
                1. Delete mapping rows in LinkToObject table
                2. Delete mapping rows in FileToObject table
                3. Delete from Post table
                4. Delete from ObjectTag table
                5. Delete each ObjectTag for this Object
                6. Delete each ObjectVote for this Object
                7. Delete the Object itself
        """

        # Delete mapping rows to links/files
        all_mapped_links = LinkToObject.get_all_links_for_object(object_id)
        for m in all_mapped_links:
            DBSession.delete(m)

        all_mapped_files = FileToObject.get_all_files_for_object(object_id)
        for m in all_mapped_files:
            DBSession.delete(m)

        # Delete Post rows
        this_post = Post.by_id(object_id)
        if this_post:
            DBSession.delete(this_post)

        # Delete all ObjectTags for object (Tags)
        all_object_tags = TagManager.by_object_id(object_id)
        for ot in all_object_tags:
            DBSession.delete(ot)

        # Delete all ObjectVotes for a given object (Likes)
        for v in ObjectVoteManager.get_like_count(object_id):
            DBSession.delete(v)

        # TODO: Add in the "bookmarks" to delete

        # Delete the actual object now
        this_object = Object.by_id(object_id)
        if this_object:
            DBSession.delete(this_object)


    @staticmethod
    def delete_content(object_id):

        """
            PURPOSE: This is the "pipeline" method to
            add an object to the deleted_content table and
            then delete the object from all associated tables

            USE: Call like: DeletedContentManager.delete_content(<object_id>)

            PARAMS: 1 required param, the Object.id of the Object to delete

            RETURNS: (None)
        """

        # Transfer all data to be deleted
        DeletedComment.add(object_id)
        DeletedContentManager.add(object_id)

        # Delete transferred data
        DeletedComment._delete(object_id)
        DeletedContentManager._delete(object_id)


class DeletedComment(Base):

    """
        Defines the table which holds all data pertaining
        to comments left on Objects, for either a person or page
    """

    __tablename__ = 'deleted_object_comment'

    id = Column(BigInteger, primary_key=True, nullable=False)
    object_id = Column(BigInteger, nullable=False)
    user_id = Column(BigInteger, nullable=False)
    text = Column(Unicode, nullable=False)
    date_added = Column(DateTime, nullable=False)
    date_deleted = Column(DateTime, default=datetime.now)


class DeletedComment(object):

    @staticmethod
    def add(object_id):

        all_object_comments_active = Comment.get_all_comments_for_object(object_id)
        all_object_comments_inactive = Comment.get_all_comments_for_object(object_id, is_active=False)

        for oc in chain(all_object_comments_active, all_object_comments_inactive):
            object_comment_data = dict(
                object_id=oc.object_id,
                user_id=oc.user_id,
                text=oc.text,
                date_added=oc.date_added,
            )
            DeletedComment._add(object_comment_data)

    @staticmethod
    def _add(object_comment_data):

        new_deleted_object_comment = DeletedComment()

        new_deleted_object_comment.object_id  = object_comment_data['object_id']
        new_deleted_object_comment.user_id  = object_comment_data['user_id']
        new_deleted_object_comment.text       = object_comment_data['text']
        new_deleted_object_comment.date_added = object_comment_data['date_added']

        DBSession.add(new_deleted_object_comment)

    @staticmethod
    def _delete(object_id):

        # Delete all comments for object
        all_object_comments_active   = Comment.get_all_comments_for_object(object_id)
        all_object_comments_inactive = Comment.get_all_comments_for_object(object_id, is_active=False)

        for oc in chain(all_object_comments_active, all_object_comments_inactive):
            DBSession.delete(oc)

    @staticmethod
    def delete_comment(comment_id):

        oc = Comment.get(comment_id)
        if oc:
            # Transfer the comment to deletion table
            comment_data = dict(
                object_id=oc.object_id,
                user_id=oc.user_id,
                text=oc.text,
                date_added=oc.date_added,
            )
            DeletedComment._add(comment_data)

            # Delete the originla comment
            DBSession.delete(oc)
