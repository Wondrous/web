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
    Tag,
    Notification,
    Comment,
    User,
    Vote,
    PostView,
    Notification,
    ReportedComment,
    ReportedPost
    # Vote,
)

import wondrous.utilities.validation_utilities as UploadManager
from wondrous.utilities.validation_utilities import ValidatePost
from wondrous.utilities.notification_utilities import send_notification

class PostManager(BaseManager):
    @staticmethod
    def get_liked_users_json(user,post_id,page=0,per_page=15):
        users = DBSession.query(User).join(Vote,User.id==Vote.user_id).\
            filter(Vote.status==Vote.LIKED).filter(Vote.subject_id==post_id).limit(per_page).\
            offset(page).all()
        return [user.json() for user in users]

    @staticmethod
    def report_comment(user,comment_id,reason,text=None):
        user_id = user.id

        try:
            rc = ReportedComment(user_id = user_id, comment_id = comment_id, reason = reason, text = text)
            DBSession.add(rc)
            DBSession.flush()
            return {"status": "Comment reported"}
        except Exception, e:
            return {"error": "Already submitted"+e.message}

    @staticmethod
    def report_post(user,post_id,reason,text=None):
        user_id = user.id
        try:
            rp = ReportedPost(user_id = user_id, post_id = post_id, reason = reason, text = text)
            DBSession.add(rp)
            DBSession.flush()
            return {"status": "Post reported"}
        except Exception, e:
            return {"error": "Already submitted"+e.message}

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
            return {'error': 'Failed to delete comment'}

    @staticmethod
    def get_comments_json(user, post_id, page=0, per_page=10):
        try:
            post_id = int(post_id)
        except Exception, e:
            return {'error':'post not found'}

        retval = []
        exists = DBSession.query(Post).filter(Post.id==post_id).filter(Post.set_to_delete==None).first()
        if not exists:
            return retval
        for comment_user, comment in DBSession.query(User, Comment).\
            filter(Comment.post_id==post_id).\
            filter(Comment.user_id==User.id).\
            order_by(desc(Comment.created_at)).offset(page*per_page).limit(per_page).all():

            data = comment_user.json()
            if comment_user.picture_object:
                data.update(comment_user.picture_object.json())
            data.update(comment.json())
            retval.append(data)
        return retval

    @staticmethod
    def post_count(user_id):
        return DBSession.query(Post).filter_by(user_id=user_id).filter_by(set_to_delete=None).count()

    @classmethod
    def edit_comment_json(cls,user,text,comment_id=None):
        c = DBSession.query(Comment).filter(Comment.user_id==user.id).\
            filter(Comment.id==comment_id).first()
        c.text = text
        DBSession.add(c)
        DBSession.flush()

        retval= user.json()
        if user.picture_object:
            retval.update(user.picture_object.json())
        retval.update(c.json())
        return retval

    @classmethod
    def comment_json(cls,user,text,post_id=None,comment_id=None):

        if comment_id:
            return cls.edit_comment_json(user,text,comment_id)

        p = Post.query.get(post_id)
        if not p:
            return {'error': "We're sorry, this post was not found :("}

        # TODO room for perform enhancement - 2 roundtrips currently
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
            NotificationManager.add(
                from_user_id=user.id,
                to_user_id=p.user_id,
                subject_id=post_id,
                reason=Notification.COMMENTED,
            )

            cls.send_mentions(p, user, text)

            return retval
        else:
            return {'error': 'Bad permission'}

    @staticmethod
    def send_mentions(post,user,text):
        usernames = [re.sub(r'\W+', '', un.lower()) for un in list(set(re.findall('\s*@\s*(\w+)', text)))]
        if len(usernames)>0:
            for user_id in DBSession.query(User.id).filter(func.lower(User.username).in_(usernames)).distinct():
                u_id = user_id[0]
                # Notify if needed
                if u_id!=post.user_id:
                    new_notification = NotificationManager.add(
                                        from_user_id=user.id,
                                        to_user_id=u_id,
                                        subject_id=post.id,
                                        reason=Notification.MENTIONED)

    @staticmethod
    def notify_followers(post_id,user_id):
        new_notification = Notification(
                            from_user_id=user_id,
                            to_user_id=0,
                            subject_id=post_id,
                            notification="",
                            reason=Notification.FEED,
                            is_seen=True)
        send_notification(0, new_notification.json())

    @classmethod
    def move_n_posts_into_feed(cls,from_user_id,to_user_id,n=5):
        posts = DBSession.query(Post).filter(Post.user_id==from_user_id).order_by(desc(Post.created_at)).distinct().limit(n).all()
        to_user = DBSession.query(User).get(to_user_id)
        if posts and to_user:
            for post in posts:
                link = FeedPostLink(feed_id=to_user.feed.id, post_id=post.id)
                DBSession.add(link)
            DBSession.flush()

    @staticmethod
    def _move_post_into_feeds(post_id, user_id):
        # TODO if we ever reach over 100 followers? Time to work queue it up to a
        # slave server to process all this crap
        # TODO USER CORE SQL TO BULK ADD!!!!!!!
        for vote in VoteManager.get_all_followers(user_id):
            feed_id = vote.user.feed.id
            link = FeedPostLink(feed_id=feed_id, post_id=post_id)
            DBSession.add(link)
        DBSession.flush()

    @staticmethod
    def _process_tags(tags, post_id):
        # Add the tags
        for t in tags:
            new_tag = Tag(tag_name=t,post_id=post_id)
            DBSession.add(new_tag)

    @classmethod
    def create_new_object(cls,subject,text,file_type=None,height=None,width=None,is_cover=None):
        new_object = Object(subject=subject, text=text)

        DBSession.add(new_object)
        DBSession.flush()

        if file_type:
            new_object.ouuid = str(new_object.id)+'-'+unicode(uuid.uuid4()).lower()
            new_object.mime_type = file_type

            try:
                if height and width:
                    new_object.height = int(height)
                    new_object.width = int(width)
                    new_object.is_cover = is_cover if not None else True
            except Exception, e:
                new_object.height = None
                new_object.width = None
                new_object.is_cover = None

        return new_object

    @classmethod
    def add(cls, user_id, subject, text, repost_id=None, file_type=None, is_cover=None, height=None, width=None):

        """
            PURPOSE: the purpose of the this method is to allow users to post and
            repost objects

            Params:
                user_id   : int : id of the author
                subject   : str : subject text of the item
                text      : str : text of the post
                repost_id : int : optional -- the object id to be reposted

            RETURN: the newly created Post
        """

        if repost_id:
            # only allow the user to do that if he/she hasn't done it before
            old_post = Post.by_id(repost_id)
            new_post = Post(user_id=user_id, repost_id=repost_id)

            o_id = old_post.repost_id if old_post.repost_id else repost_id
            print "reposting",o_id, user_id
            p = Post.by_kwargs(repost_id=o_id,user_id=user_id,set_to_delete=None).first()
            if p:
                return {'error':'You have already reposted this item!'}

            if old_post.repost_id:
                # this is a repost of there must exists an original
                new_post.original_id = old_post.original_id
                new_post.owner_id = old_post.owner_id
            else:
                new_post.original_id = repost_id
                new_post.owner_id = old_post.user_id

        else:
            # take it apart
            # First create the post container, then the object

            text = ValidatePost.sanitize_post_text(text)
            new_post = Post(user_id=user_id)
            new_object = cls.create_new_object(subject,text,file_type,height,width,is_cover)

            new_post.object_id = new_object.id

        DBSession.add(new_post)
        DBSession.flush()

        cls.notify_followers(new_post.id,user_id)
        if text:
            tags = [re.sub(r'\W+', '', tag) for tag in list(set(re.findall('\s*#\s*(\w+)', text)))]
            if len(tags)>0:
                cls._process_tags(tags,new_post.id)

        cls._move_post_into_feeds(new_post.id, user_id)
        DBSession.flush()

        return new_post

    @classmethod
    def repost_json(cls, user, post_id, text=None):
        if not user:
            return {'error': 'Insufficient data'}
        post = PostManager.add(user.id, None, text, repost_id=post_id)
        try:
            data = post.json()
        except Exception, e:
            return post
            # return an error


        # Notify if needed
        new_notification = NotificationManager.add(
                            from_user_id=user.id,
                            to_user_id=post.original.user_id,
                            subject_id=post.id,
                            reason=Notification.REPOSTED)
        cls.notify_followers(post.id,user.id)
        return data

    @classmethod
    def edit_post_json(cls,user,subject,text,post_id,file_type=None, is_cover=None, height=None, width=None):
        post = DBSession.query(Post).filter((Post.id==post_id)&(Post.user_id==user.id)).first()
        retval = {}
        if post:
            obj = post.object
            ouuid = obj.ouuid
            obj.set_to_delete = datetime.now()

            obj = cls.create_new_object(subject,text,file_type,height,width,is_cover)
            if not file_type:
                obj.ouuid = ouuid

            post.object_id = obj.id
            DBSession.add(post)

            for tag in post.tags:
                DBSession.delete(tag)

            tags = [re.sub(r'\W+', '', tag) for tag in list(set(re.findall('\s*#\s*(\w+)', text)))]
            if len(tags)>0:
                cls._process_tags(tags,post.id)

            if file_type:
                file_names = ["%s"%(obj.ouuid),"%s-med"%(obj.ouuid)]
                retval.update(UploadManager.sign_upload_request(file_names, obj.mime_type))

            DBSession.flush()
            DBSession.refresh(post)
            retval.update(post.json())
            return retval
        else:
            return {'error':"Invalid post_id or user_id"}

    @classmethod
    def post_json(cls, user, subject, text, file_type=None, is_cover=None, height=None, width=None, post_id=None):
        if not user or not subject or not text:
            return {'error': 'Insufficient data'}

        if post_id:
            print "edit"
            # this is an edit
            return cls.edit_post_json(user,subject, text, post_id, file_type, is_cover, height, width)

        post = PostManager.add(user.id,  subject, text, repost_id=None, file_type=file_type,is_cover=is_cover, height=height, width=width)

        obj = post.object

        data = {}

        if file_type:
            file_names = ["%s"%(obj.ouuid),"%s-med"%(obj.ouuid)]
            data.update(UploadManager.sign_upload_request(file_names, obj.mime_type))

        # For now, let's not allow @mentions in the post subject,
        # let's keep them to comments and the post-text
        cls.send_mentions(post, user, text)  # To add @mentions back to subject: +" "+subject
        data.update(post.json())
        return data

    @classmethod
    def get_by_id_json(cls,post_id,user=None):
        try:
            post_id = int(post_id)
        except Exception, e:
            return {'error': "We're sorry, this post was not found :("}

        post = None
        if user:
            ret = DBSession.query(Post, Vote).\
                    outerjoin(Vote, (Vote.subject_id==Post.id)&(Vote.user_id==user.id)&(Vote.status==Vote.LIKED)).\
                    filter(Post.id==post_id).first()
            if ret:
                post, voted = ret
        else:
            post = Post.by_id(post_id)

        if post:
            if not user and post.user.is_private:
                return {'error': 'This user is private'}

            if user and (post.user.is_private and not VoteManager.is_following(user.id,post.user_id)):
                return {'error': 'This user is private'}

            if not post.is_hidden and post.is_active and not post.set_to_delete:
                post_dict = post.json()

                if not user:
                    return post_dict

                post_dict.update({'liked':voted!=None})

                pv = DBSession.query(PostView).filter_by(post_id=post.id, user_id=user.id).first()

                if not pv:
                    pv = PostView(post_id=post.id, user_id=user.id)
                    DBSession.query(Post).filter(Post.id==post.id).update({'view_count': Post.view_count+1})
                    DBSession.add(pv)
                elif pv.count < 10:
                    DBSession.query(Post).filter(Post.id==post.id).update({'view_count': Post.view_count+1})
                    DBSession.query(PostView).filter(PostView.id==pv.id).update({'count': PostView.count+1})

                return post_dict
            else:
                return {'error': "We're sorry, this post was not found :("}
        else:
            return {'error': "We're sorry, this post was not found :("}

    @classmethod
    def delete_post_json(cls, user, post_id):
        user_id = user.id
        post = Post.by_id(post_id)

        if post and post.user_id == user_id:
            post.set_to_delete = datetime.now()
            post.is_active = False
            return {"id": post.id}
        else:
            return {"error": "Insufficient data"}

    @classmethod
    def deactivate_by_userid(cls,user_id):
        Post.query.filter(or_(Post.user_id == user_id,Post.owner_id == user_id)).update({'is_active': False})
        DBSession.flush()

    @classmethod
    def reactivate_by_userid(cls,user_id):
        Post.query.filter(or_(Post.user_id == user_id,Post.owner_id == user_id)).update({'is_active': True})
        DBSession.flush()
