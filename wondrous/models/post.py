#!/usr/bin/env python
# -*- coding: utf-8 -*-

#
# Company: WONDROUS
# Created by: John Zimmerman
#
# MODELS/POST.PY
#

import logging

from sqlalchemy import (
    BigInteger,
    Boolean,
    Column,
    DateTime,
    desc,
    ForeignKey,
    Unicode,
    Text
)

from sqlalchemy.orm import (
    backref,
    relationship
)

from wondrous.models import Base, DBSession
from wondrous.models.modelmixins import BaseMixin
from wondrous.models.scores import PostView
from wondrous.models.vote import Vote

class Post(Base, BaseMixin):

    """
        This defines the post table
    """

    user_id = Column(BigInteger, ForeignKey('user.id'), nullable=False, index=True)
    user = relationship('User', foreign_keys=user_id, backref="posts")

    recipient_id = Column(BigInteger, ForeignKey('user.id'), nullable=True, index=True)
    recipient = relationship('User', foreign_keys=user_id, backref="wallposts")

    object_id = Column(BigInteger, ForeignKey('object.id'), index= True)
    object = relationship('Object', lazy='joined', backref=backref("post", uselist=False))

    is_active = Column(Boolean, default=True)  # If you want to hide something from your wall
    is_hidden = Column(Boolean, default=False)  # If you want to hide something from your wall

    feed_post_links = relationship("FeedPostLink", backref="post")

    text = Column(Unicode, default=None)
    tags = relationship("Tag", backref="post", lazy='joined')

    # repost section
    repost_id = Column(BigInteger, ForeignKey('post.id'), nullable=True)
    repost = relationship('Post',foreign_keys=repost_id, remote_side="Post.id", backref="reposts")

    original_id = Column(BigInteger, ForeignKey('post.id'), nullable=True)
    original = relationship('Post', foreign_keys=original_id, remote_side="Post.id", backref="all_reposts")

    owner_id = Column(BigInteger, ForeignKey('user.id'), nullable=True)
    owner = relationship('User', foreign_keys=owner_id)

    like_count = Column(BigInteger, default=0, nullable=False)
    view_count = Column(BigInteger, default=1, nullable=False)

    # set to delete
    set_to_delete = Column(DateTime, nullable=True)

    @classmethod
    def get_all(cls, user_id):
        from wondrous.models.object import Object
        return cls.query.join(Object).filter(cls.user_id == user_id).\
                                    order_by(desc(Object.created_at)).all()

    @classmethod
    def toggle_post_visibility(cls, object_id, current_user_id):

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
            post.is_hidden = False if post.is_hidden else True

    def json(self,level=0,getOwner=False):
        post_dict = super(Post,self).json(level)
        if self.object:
            post_dict.update(self.object.json())

        post_dict.update({"name": self.user.ascii_name})

        if getOwner and self.owner:
            post_dict.update({"username": self.owner.username})
        else:
            post_dict.update({"username": self.user.username})

        post_dict.update({"view_count": self.view_count})
        post_dict.update({"comment_count": len(self.comments)})
        picture_object = self.user.picture_object

        if picture_object:
            post_dict.update({"user_ouuid": picture_object.ouuid})

        if self.original:
            # Syntactic sugar, yum
            original_post = self.original.json(getOwner=True)
            post_dict.update({"repost": original_post})

        return post_dict
