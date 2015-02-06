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
    def get_json_by_username(cls,username):
        u = User.by_kwargs(username=username).first()
        if u:
            return super(AccountManager,cls).model_to_json(u)
        return None
