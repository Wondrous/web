#!/usr/bin/env python
# -*- coding: utf-8 -*-

#
# Company: WONDROUS
# Created by: Ziyuan Liu
#
# CONTROLLERS/ACCOUNTMANAGER.PY
#

import uuid, logging

from datetime import datetime

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
from wondrous.utilities.notification_utilities import send_notification
import shortuuid

class AccountManager(BaseManager):

    """
        This is controller for both user models!

        'user_type'  : 1,
        'username'   : "username"+str(i),
        'email'      : email,
        'password'   : "password"+str(i),

        'name'       : "name"+str(i),
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
        data.update(user.json())
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
    def get_json_by_username(cls, user, user_id = None, username = None, auth = False):
        from wondrous.controllers.postmanager import PostManager
        from wondrous.controllers.votemanager import VoteManager

        if not user_id and not username:
            return {}

        if username:
            profile_user = User.by_kwargs(username=username).first()
        else:
            profile_user = User.by_id(user_id)



        if not profile_user:
            return {'error': 'no users found!'}
        user_id = profile_user.id
        am_following = VoteManager.is_following(user.id,user_id) if user else False

        # Am I querying for myself?
        if profile_user and profile_user.id == user.id:
            retval = cls._get_relationship_stats(user_id)
            retval.update(profile_user.json(1))
            retval.update({"name": profile_user.ascii_name})
            retval.update({"following": am_following})
            retval.update({"unseen_notifications": NotificationManager.get_all_unseen_count(user_id)})
            retval.update({"post_count": PostManager.post_count(user_id)})
            picture_object = profile_user.picture_object

            if picture_object:
                retval.update({"ouuid": picture_object.ouuid})
            if auth:
                key = shortuuid.uuid()
                retval.update({'auth':key})
                send_notification(-1,str(key)+":"+str(user_id))
            return retval

        # If the profile_user is public or I am following
        if (not profile_user.is_private and not profile_user.is_banned and profile_user.is_active) or \
            (profile_user and not profile_user.is_banned and profile_user.is_active and am_following):

            retval = cls._get_relationship_stats(user_id)
            retval.update(super(AccountManager, cls).model_to_json(profile_user))
            retval.update({"name": profile_user.ascii_name})
            retval.update({"following": am_following})
            retval.update({"post_count": PostManager.post_count(user_id)})

            picture_object = profile_user.picture_object
            if picture_object:
                retval.update({"ouuid": picture_object.ouuid})
            return retval

        elif profile_user.is_private and not profile_user.is_banned and profile_user.is_active:
            retval = {}
            retval.update({"username": profile_user.username})
            retval.update({"name": profile_user.ascii_name})
            retval.update({"following": am_following})
            retval.update({'is_private': True})
            retval.update({'id': profile_user.id})
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

            retval = user.json(1)
            return retval
        return {"error": "password change failed"}

    @classmethod
    def change_name_json(cls, user, name):
        data = cls.change_profile_json(user,'name',name)
        data.update(cls.change_profile_json(user,'ascii_name',unicode(name)))

        retval = user.json(1)
        retval.update(data)
        return retval

    @classmethod
    def change_username_json(cls, user, username):
        data = cls.change_profile_json(user,'username',username)
        retval = user.json(1)
        retval.update(data)
        return retval

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
