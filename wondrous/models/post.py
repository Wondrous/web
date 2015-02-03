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
from sqlalchemy import Unicode

from sqlalchemy.orm import relationship
from sqlalchemy.orm import backref

from wondrous.models import engine
from wondrous.models import Base
from wondrous.models import DBSession
from wondrous.models.feed import Feed
from wondrous.models.object import Object
from wondrous.models.user import User
from wondrous.models.modelmixins import BaseMixin
from wondrous.models.feed import FeedPostLink
import logging

class WallPost(Base,BaseMixin):

    """This defines the post table"""

    user_id = Column(BigInteger, ForeignKey('user.id'), nullable=False)
    to_repost_id = Column(BigInteger, ForeignKey('wall_post.id'))
    object_id = Column(BigInteger, ForeignKey('object.id'), nullable=False)
    hidden = Column(Boolean, default=False)  # If you want to hide something from your wall
    feed_post_links = relationship("FeedPostLink", backref="post")
    text = Column(Unicode)

    object = relationship('Object', backref=backref("wallpost", uselist=False))
    user = relationship('User', backref="wallposts")

    @classmethod
    def add(cls,user_id,tags,subject,text,to_repost_id=None):
        """
            PURPOSE: the purpose of the this method is to allow users to post and
            repost objects

            Params:
                user_id: int : id of the author
                tags    : set : set list of tags
                subject   : str : subject text of the item
                text      : str : text of the post
                to_repost_id : int : optional -- the object id to be reposted

            RETURN: the newly created wallpost
        """

        if to_repost_id:
            # TODO, this is a repost operation
            new_post = cls(user_id=user_id, to_repost_id=to_repost_id)
        else:
            # take it apart
            new_post = cls(user_id=user_id)
            obj = Object.add(tags=tags,subject=subject,text=text)
            new_post.object_id = obj.id

        DBSession.add(new_post)
        DBSession.flush()

        # TODO if we ever reach over 100 followers? Time to work queue it up to a
        # slave server to process all this crap

        for vote in User.get_all_followers(user_id):
            feed_id = vote.user.feed.id
            FeedPostLink.add(feed_id=feed_id, wall_post_id = new_post.id)
        return new_post

    @classmethod
    def get_all(cls,user_id):
        from wondrous.models.object import Object
        return cls.query.join(Object).filter(cls.user_id == user_id).\
                                    order_by(desc(Object.date_posted)).all()


    @classmethod
    def toggle_post_visibility(cls,object_id, current_user_id):

        """
            PURPOSE: Hide or show an object accross the site.
            The only prerequisite is that a user can only hide
            or show their own posts. Otherwise, if someone else
            posts something they don't like, they must report
            the post

            USE: Call like: Object.toggle_object_visibility(<int>,<int>)

            PARAMS: 2 required params
                object_id : int : REQUIRED : The Object.id of the object to hide
                current_user_id : int : REQUIRED : The User.id of the user

            RETURNS: (None)
        """

        wall_post = super(WallPost,cls).by_id(object_id)
        if wall_post and wall_post.obj.user_id == current_user_id:
            wall_post.hidden = False if wall_post.hidden else True
