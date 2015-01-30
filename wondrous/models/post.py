#!/usr/bin/env python
# -*- coding: utf-8 -*-

#
# Company: WONDROUS
# Created by: John Zimmerman
#
# MODELS/POST.PY
#

from sqlalchemy import BigInteger
from sqlalchemy import Boolean
from sqlalchemy import Column
from sqlalchemy import desc
from sqlalchemy import ForeignKey

from sqlalchemy.orm import relationship

from wondrous.models import Base
from wondrous.models import DBSession

import logging

class WallPost(Base):

    """This defines the post table"""

    __tablename__ = 'wall_post'

    id = Column(BigInteger, primary_key=True)
    profile_id = Column(BigInteger, ForeignKey('user.id'), nullable=False)
    object_id = Column(BigInteger, ForeignKey('object.id'), nullable=False)
    hidden = Column(Boolean, default=False)  # If you want to hide something from your wall

    obj = relationship('Object', foreign_keys='WallPost.object_id')
    user = relationship('User', foreign_keys='WallPost.profile_id')


class WallPostManager(object):

    @staticmethod
    def add(wall_post_data):
        new_post = WallPost()

        new_post.profile_id = wall_post_data['profile_id']
        new_post.object_id  = wall_post_data['object_id']

        DBSession.add(new_post)
        DBSession.flush()

        return new_post

    @staticmethod
    def get(object_id):
        return WallPost.query.filter(WallPost.object_id == object_id).first()

    @staticmethod
    def get_all(profile_id):
        from wondrous.models.obj import Object
        return WallPost.query.join(Object).filter(WallPost.profile_id == profile_id).\
                                    order_by(desc(Object.date_posted)).all()

    @staticmethod
    def get_all_subscribed(current_user_id):
        from wondrous.models.obj import Object
        from wondrous.models.vote import UserVote
        upvoted_users = UserVote.query.filter(UserVote.user_id == current_user_id).\
                                       filter(UserVote.active == True).\
                                       filter(UserVote.vote_type == 1).all()

        upvoted_users_id = [user_vote.voted_on_id for user_vote in upvoted_users]
        if len(upvoted_users_id)>0:
            return WallPost.query.join(Object).filter(WallPost.profile_id.in_(upvoted_users_id)).\
                                    order_by(desc(Object.date_posted)).all()
        else:
            return []

    @staticmethod
    def count():

        """Number of posts in the system"""

        return WallPost.query.count()

    @staticmethod
    def toggle_post_visibility(object_id, current_user_id):

        """
            PURPOSE: Hide or show an object accross the site.
            The only prerequisite is that a user can only hide
            or show their own posts. Otherwise, if someone else
            posts something they don't like, they must report
            the post

            USE: Call like: ObjectManager.toggle_object_visibility(<int>,<int>)

            PARAMS: 2 required params
                object_id : int : REQUIRED : The Object.id of the object to hide
                current_user_id : int : REQUIRED : The User.id of the user

            RETURNS: (None)
        """

        wall_post = WallPostManager.get(object_id)
        if wall_post and wall_post.obj.poster_id == current_user_id:
            wall_post.hidden = False if wall_post.hidden else True
