#!/usr/bin/env python
# -*- coding: utf-8 -*-

#
# Company: WONDROUS
# Created by: Ziyuan Liu
#
# controllers/accountmanager.PY
#

from wondrous.models import (
    DBSession,
    User,
    Vote,
    Person,
    Feed,
)

from wondrous.controllers.votemanager import VoteManager
from wondrous.controllers.basemanager import BaseManager

from datetime import datetime

class AccountManager(BaseManager):
    """
        This is controller for both person and user models!

        'user_type'       : 1,
        'username'        : "username"+str(i),
        'email'           : email,
        'password'        : "password"+str(i),

        'first_name' : "first_name"+str(i),
        'last_name'  : "last_name"+str(i),

    """

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
    def add(first_name, last_name, email, username, password, user_type=1):

        # First let's create the person object - point of contact for the account
        new_user = User(user_type=user_type, username=username, email=email, password=password, is_active=True)

        DBSession.add(new_user)
        DBSession.flush()

        new_person = Person(first_name=first_name, last_name=last_name, user_id=new_user.id)
        new_feed = Feed(user_id=new_user.id)

        DBSession.add(new_person)
        DBSession.add(new_feed)
        DBSession.flush()

        # Follow yourself
        VoteManager.vote(user_id=new_user.id, subject_id=new_user.id, vote_type=Vote.USER, status=Vote.TOPFRIEND)
        return new_user

    @classmethod
    def get_one_by_kwargs(cls,**kwargs):
        return User.by_kwargs(**kwargs).first()

    @classmethod
    def _get_relationship_stats(cls,user_id):
        follower_count  = VoteManager.get_follower_count(user_id)
        following_count = VoteManager.get_following_count(user_id)

        data = {
            "following_count" : following_count,
            "follower_count"  : follower_count,
        }

        return data

    @classmethod
    def get_json_by_username(cls,person,user_id):
        if not user_id:
            return {}

        # am i querying for myself?
        if person and person.user.id == user_id:
            retval = cls._get_relationship_stats(user_id)
            retval.update(super(AccountManager,cls).model_to_json(person.user,1))
            return retval

        u = User.by_id(user_id).first()
        if not u:
            return {}

        # if the user is public or I am following
        if (not u.is_private and not u.is_banned and u.is_active) or\
            (person and not u.is_banned and u.is_active and VoteManager.is_following(person.user.id,user_id)):
            retval = cls._get_relationship_stats(user_id)
            retval.update(super(AccountManager,cls).model_to_json(u))
            return retval
        elif u.is_private and not u.is_banned and u.is_active:
            return {'is_private':True}

        return None

    @classmethod
    def deactivate_json(cls,person,password):
        user = person.user
        if user and user.validate_password(password):
            user.is_active = False
            return {'status','deactivated'}
        return {'error':'deactivation failed'}

    @classmethod
    def delete_json(cls,person,password):
        user = person.user
        if user and user.validate_password(password):
            user.set_to_delete = datetime.now()
            return {'status','set to delete in x days'}
        return {'error':'deletion failed'}

    @classmethod
    def change_password_json(cls,person,old_password,new_password):
        user = person.user
        if user and user.validate_password(old_password):
            user.password = password
        return {"error":"password change failed"}

    @classmethod
    def change_profile_json(cls,person,field,new_value):
        user = person.user
        exists = getattr(user, field, None)
        if exists:
            setattr(user,field,new_value)
            return {field:new_value}

        return {"error":field+" not found"}
