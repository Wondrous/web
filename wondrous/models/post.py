#!/usr/bin/env python
# -*- coding: utf-8 -*-

#
# Company: WONDROUS
# Created by: John Zimmerman
#
# MODELS/POST.PY
#

from sqlalchemy import (
    BigInteger,
    Boolean,
    Column,
    desc,
    ForeignKey,
    Unicode,
)

from sqlalchemy.orm import relationship
from sqlalchemy.orm import backref

from wondrous.models import Base

import wondrous.models
from wondrous.models.feed import (
    Feed,
    # FeedPostLink,
)

from wondrous.models.modelmixins import BaseMixin
# from wondrous.models.object import Object
# from wondrous.models.user import User

class Post(Base,BaseMixin):

    """This defines the post table"""

    user_id = Column(BigInteger, ForeignKey('user.id'), nullable=False)
    repost_id = Column(BigInteger, ForeignKey('post.id'))
    original_id = Column(BigInteger, ForeignKey('post.id'))
    object_id = Column(BigInteger, ForeignKey('object.id'), nullable=False)
    hidden = Column(Boolean, default=False)  # If you want to hide something from your wall
    feed_post_links = relationship("FeedPostLink", backref="post")
    text = Column(Unicode)

    post_tag_links = relationship("PostTagLink", backref="object")

    object = relationship('Object', lazy='joined', backref=backref("post", uselist=False))
    user = relationship('User', backref="posts")

    @classmethod
    def get_all(cls,user_id):
        from wondrous.models.object import Object
        return cls.query.join(Object).filter(cls.user_id == user_id).\
                                    order_by(desc(Object.created_at)).all()


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

        post = super(Post,cls).by_id(object_id)
        if post and post.obj.user_id == current_user_id:
            post.hidden = False if post.hidden else True
