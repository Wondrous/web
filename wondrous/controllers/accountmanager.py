#!/usr/bin/env python
# -*- coding: utf-8 -*-

#
# Company: WONDROUS
# Created by: Ziyuan Liu
#
# CONTROLLERS/ACCOUNTMANAGER.PY
#

from datetime import datetime
import uuid

from wondrous.models import (
    DBSession,
    Feed,
    User,
    Vote,
    Object
)

from wondrous.controllers.basemanager import BaseManager
from wondrous.controllers.notificationmanager import NotificationManager
from wondrous.utilities.validation_utilities import UploadManager
import logging

class AccountManager(BaseManager):

    """
        This is controller for both user models!

        'user_type'  : 1,
        'username'   : "username"+str(i),
        'email'      : email,
        'password'   : "password"+str(i),

        'name'  : "name"+str(i),
    """

    DYNAMIC_FIELDS = ['username', 'name', 'ascii_name']  # TODO Should this be a set?

    @staticmethod
    def is_username_taken(username):
        return True if User.by_kwargs(username=username).count() > 0 else False

    @staticmethod
    def is_active(user_id):
        u = User.by_id(user_id)
        if u:
            return not u.is_active
        return False # safe than sorry

    @staticmethod
    def is_private(user_id):
        u = User.by_id(user_id)
        if u:
            return u.is_private
        return True

    @classmethod
    def add(cls, name, email, username, password):
        # First let's create the object object - point of contact for the account
        new_user = User(name=name, username=username, email=email, password=password, is_active=True)

        DBSession.add(new_user)
        DBSession.flush()

        new_feed = Feed(user_id=new_user.id)

        DBSession.add(new_feed)

        # Follow yourself
        vote = Vote(user_id=new_user.id, subject_id=new_user.id, vote_type=Vote.USER, status=Vote.TOPFRIEND)
        DBSession.add(vote)
        DBSession.flush()

        return new_user

    @classmethod
    def upload_picture_json(cls, user, file_type):
        picture_object = user.picture_object
        if not picture_object:
            picture_object = Object(subject=str(user.id), text="profile_picture")
            DBSession.add(picture_object)
            DBSession.flush()
            user.picture_object_id = picture_object.id

        # TODO DELETE OLD PHOTO -- picture_object.ouuid
        picture_object.ouuid = str(picture_object.id)+'-'+unicode(uuid.uuid4()).lower()
        picture_object.mime_type = file_type
        data = UploadManager.sign_upload_request(picture_object.ouuid, picture_object.mime_type)
        data.update({"ouuid":picture_object.ouuid})
        return data

    @classmethod
    def get_one_by_kwargs(cls, **kwargs):
        return User.by_kwargs(**kwargs).first()

    @classmethod
    def _get_relationship_stats(cls, user_id):
        from wondrous.controllers.votemanager import VoteManager

        follower_count  = VoteManager.get_follower_count(user_id)
        following_count = VoteManager.get_following_count(user_id)

        data = {
            "following_count" : following_count,
            "follower_count"  : follower_count,
        }

        return data

    @classmethod
    def get_json_by_username(cls, user, user_id = None, username = None):
        from wondrous.controllers.votemanager import VoteManager
        if not user_id and not username:
            return {}

        if username:
            user = User.by_kwargs(username=username).first()
        else:
            user = User.by_id(user_id)

        if not user:
            return {'error':'no users found!'}
        user_id = user.id
        am_following = VoteManager.is_following(user.id,user_id) if user else False

        # Am i querying for myself?
        if user and user.id == user_id:
            retval = cls._get_relationship_stats(user_id)
            retval.update(user.json(1))
            retval.update({"name": user.ascii_name})
            retval.update({"following":am_following})
            retval.update({"unseen_notifications":NotificationManager.get_all_unseen_count(user_id)})
            picture_object = user.picture_object

            if picture_object:
                retval.update({"ouuid": picture_object.ouuid})

            return retval

        # if the user is public or I am following
        if (not user.is_private and not user.is_banned and user.is_active) or \
            (user and not user.is_banned and user.is_active and am_following):

            retval = cls._get_relationship_stats(user_id)
            retval.update(super(AccountManager, cls).model_to_json(user))
            retval.update({"name": user.ascii_name})
            retval.update({"following":am_following})
            picture_object = user.picture_object
            if picture_object:
                retval.update({"ouuid": picture_object.ouuid})
            return retval

        elif user.is_private and not user.is_banned and user.is_active:
            retval = {}
            retval.update({"name": user.ascii_name})
            retval.update({"following":am_following})
            retval.update({'is_private': True})
            retval.update({'id':user.id})
            return retval

        return {'error':'no users found!'}

    @classmethod
    def deactivate_json(cls, user, password):
        from wondrous.controllers.postmanager import PostManager

        if user and user.validate_password(password):
            user.is_active = False
            PostManager.deactivate_by_userid(user.id)
            return {'status': 'deactivated'}
        return {'error': 'deactivation failed'}

    @classmethod
    def delete_json(cls, user, password):

        if user and user.validate_password(password):
            user.set_to_delete = datetime.now()
            cls.deactivate_json(user,password)
            return {'status': 'set to delete in x days'}
        return {'error': 'deletion failed'}

    @classmethod
    def change_password_json(cls, user, old_password, new_password):

        if user and user.validate_password(old_password.encode('utf-8')):
            user.password = new_password
            DBSession.flush()
            return {"status": "new password set"}
        return {"error": "password change failed"}

    @classmethod
    def change_name_json(cls, user, name):
        data = cls.change_profile_json(user,'name',name)
        data.update(cls.change_profile_json(user,'ascii_name',unicode(name)))
        return data

    @classmethod
    def change_username_json(cls, user, username):
        data = cls.change_profile_json(user,'username',username)
        return data

    @classmethod
    def change_profile_json(cls, user, field, new_value):
        if field not in cls.DYNAMIC_FIELDS:
            return {"error": field + " not found"}

        exists = getattr(user, field, None)
        if exists:
            setattr(user, field, new_value)
            try:
                DBSession.flush()
            except Exception, e:
                return {'error':str(e)}
            return {field: new_value}

        return {"error": field + " not found"}
