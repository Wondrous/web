#!/usr/bin/env python
# -*- coding: utf-8 -*-

#
# Company: WONDROUS
# Created by: Ziyuan Liu
#
# CONTROLLERS/POSTMANAGER.PY
#


# import json
# import logging
# import os
# import time
# import urllib
import uuid, logging
import re, string
from datetime import datetime

from sqlalchemy import (
    desc,
    asc,
    func,
    or_,
)

from wondrous.controllers.accountmanager import AccountManager
from wondrous.controllers.basemanager import BaseManager
from wondrous.controllers.notificationmanager import NotificationManager
from wondrous.controllers.votemanager import VoteManager

from wondrous.models import (
    DBSession,
    FeedPostLink,
    Object,
    Post,
    PostTagLink,
    Tag,
    Notification,
    Comment,
    User,
    PostView
    # Vote,
)

from wondrous.utilities.validation_utilities import UploadManager
from wondrous.utilities.validation_utilities import ValidatePost


class PostManager(BaseManager):

    @staticmethod
    def delete_comment_json(user,comment_id):
        c = Comment.by_id(comment_id)
        if c:
            p = Post.by_id(c.post_id)
            if (p and p.user_id == user.id) or c.user_id==user.id:
                DBSession.delete(c)
                DBSession.flush()
                return {'status': True}
        else:
            return {'error': 'failed to delete comment'}

    @staticmethod
    def get_comments_json(user, post_id, page=0, per_page=10):
        retval = []
        exists = DBSession.query(Post).filter(Post.id==post_id).filter(Post.set_to_delete==None).first()
        if not exists:
            return retval
        for comment_user, comment in DBSession.query(User, Comment).filter(Comment.post_id==post_id).\
            filter(Comment.user_id==User.id).order_by(desc(Comment.created_at)).offset(page*per_page).limit(per_page).all():

            data = comment_user.json()
            if comment_user.picture_object:
                data.update(comment_user.picture_object.json())
            data.update(comment.json())
            retval.append(data)
        return retval

    @staticmethod
    def post_count(user_id):
        return DBSession.query(Post).filter_by(user_id=user_id).filter_by(set_to_delete=None).count()

    @staticmethod
    def new_comment_json(user,post_id,text):
        p = Post.query.get(post_id)
        if not p:
            return {'error': 'post not found'}

        # am i following them?
        am_following = VoteManager.is_following(user.id,p.user_id)
        is_private = AccountManager.is_private(p.user_id)
        if am_following or not is_private:
            new_comment = Comment(user_id = user.id, post_id=post_id, text=text)
            DBSession.add(new_comment)
            DBSession.flush()

            retval= user.json()
            if user.picture_object:
                retval.update(user.picture_object.json())
            retval.update(new_comment.json())

            # Notify if needed
            new_notification = NotificationManager.add(
                                from_user_id=user.id,
                                to_user_id=p.user_id,
                                subject_id=post_id,
                                reason=Notification.COMMENTED)

            usernames = [re.sub(r'\W+', '', un.lower()) for un in list(set(re.findall('\s*@\s*(\w+)', text)))]
            if len(usernames)>0:
                for user_id in DBSession.query(User.id).filter(func.lower(User.username).in_(usernames)).distinct():
                    u_id = user_id[0]
                    # Notify if needed
                    if u_id!=p.user_id:
                        new_notification = NotificationManager.add(
                                            from_user_id=user.id,
                                            to_user_id=u_id,
                                            subject_id=post_id,
                                            reason=Notification.MENTIONED)
            return retval
        else:
            return {'error':'bad permission'}

    @staticmethod
    def _move_post_into_feeds(post_id, user_id):
        # TODO if we ever reach over 100 followers? Time to work queue it up to a
        # slave server to process all this crap
        # TODO USER CORE SQL TO BULK ADD!!!!!!!
        for vote in VoteManager.get_all_followers(user_id):
            feed_id = vote.user.feed.id
            link = FeedPostLink(feed_id=feed_id, post_id=post_id)
            DBSession.add(link)

    @staticmethod
    def _process_tags(tags, post_id):
        # Add the tags
        for t in tags:
            new_tag, created = Tag.get_one_or_create(tag_name=t)
            link = PostTagLink(post_id=post_id, tag_id=new_tag.id)
            DBSession.add(link)

    @classmethod
    def add(cls, user_id, tags, subject, text, repost_id=None, file_type=None):

        """
            PURPOSE: the purpose of the this method is to allow users to post and
            repost objects

            Params:
                user_id   : int : id of the author
                tags      : set : set list of tags
                subject   : str : subject text of the item
                text      : str : text of the post
                repost_id : int : optional -- the object id to be reposted

            RETURN: the newly created Post
        """

        if repost_id:
            old_post = Post.by_id(repost_id)
            new_post = Post(user_id=user_id, repost_id=repost_id)

            if old_post.repost_id:
                # this is a repost of there must exists an original
                new_post.original_id = old_post.original_id
                new_post.owner_id = old_post.owner_id
            else:
                new_post.original_id = repost_id
                new_post.owner_id = old_post.owner_id

        else:
            # take it apart
            # First create the post container, then the object

            text = ValidatePost.sanitize_post_text(text)
            new_post = Post(user_id=user_id)
            new_object = Object(subject=subject, text=text)

            DBSession.add(new_object)
            DBSession.flush()

            if file_type:
                new_object.ouuid = str(new_object.id)+'-'+unicode(uuid.uuid4()).lower()
                new_object.mime_type = file_type

            new_post.object_id = new_object.id

        DBSession.add(new_post)
        DBSession.flush()

        if tags and len(tags)>0:
            cls._process_tags(tags, new_post.id)

        cls._move_post_into_feeds(new_post.id, user_id)
        DBSession.flush()

        return new_post

    @classmethod
    def repost_json(cls, user, post_id, tags=None, text=None):
        if not user:
            return {'error': 'insufficient data'}
        post = PostManager.add(user.id, tags, None, text, repost_id=post_id)
        data = post.json()

        # Notify if needed
        new_notification = NotificationManager.add(
                            from_user_id=user.id,
                            to_user_id=post.original.user_id,
                            subject_id=post.id,
                            reason=Notification.REPOSTED)
        return data

    @classmethod
    def post_json(cls, user, subject, text, tags=None, file_type=None):
        if not user or not subject or not text:
            return {'error': 'insufficient data'}

        post = PostManager.add(user.id, tags, subject, text, repost_id=None, file_type=file_type)
        object = post.object

        data = {}

        if file_type:
            data.update(UploadManager.sign_upload_request(object.ouuid, object.mime_type))

        data.update(post.json())
        return data

    @classmethod
    def get_by_id_json(cls,user,post_id):
        post = Post.by_id(post_id)
        if post:
            # logging.warn(str(post.json()))
            if not post.is_hidden and post.is_active and not post.set_to_delete:
                post_dict = post.json()
                if post_dict:
                    post_dict.update({'liked':VoteManager.is_liking(user.id,post.id)})

                pv = DBSession.query(PostView).filter_by(post_id=post.id, user_id=user.id).first()

                if not pv:
                    pv = PostView(post_id=post.id, user_id=user.id)
                    DBSession.query(Post).filter(Post.id==post.id).update({'view_count':Post.view_count+1})
                    DBSession.add(pv)
                elif pv.count < 10:
                    DBSession.query(Post).filter(Post.id==post.id).update({'view_count':Post.view_count+1})
                    DBSession.query(PostView).filter(PostView.id==pv.id).update({'count':PostView.count+1})

                return post_dict
            else:
                return {'error':'post not found'}
        else:
            return {'error':'post not found'}

    @classmethod
    def delete_post_json(cls, user, post_id):
        user_id = user.id
        post = Post.by_id(post_id)

        if post and post.user_id == user_id:
            post.set_to_delete = datetime.now()
            post.is_active = False
            return {"id": post.id}
        else:
            return {"error": "insufficient data"}

    @classmethod
    def deactivate_by_userid(cls,user_id):
        Post.query.filter(or_(Post.user_id == user_id,Post.owner_id == user_id)).update({'is_active': False})
        DBSession.flush()

    @classmethod
    def reactivate_by_userid(cls,user_id):
        Post.query.filter(or_(Post.user_id == user_id,Post.owner_id == user_id)).update({'is_active': True})
        DBSession.flush()
