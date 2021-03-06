#!/usr/bin/env python
# -*- coding: utf-8 -*-

#
# Company: WONDROUS
# Created by: Ziyuan Liu
#
# MODELS/FEED.PY
#

from sqlalchemy import (
    BigInteger,
    Column,
    ForeignKey,
)

from sqlalchemy.orm import relationship

from wondrous.models import Base

from wondrous.models.modelmixins import BaseMixin

class FeedPostLink(Base, BaseMixin):

    """
        This is the link for the many to many relationship
        between an object and its post(s)
    """

    feed_id = Column(BigInteger, ForeignKey('feed.id'), index=True)
    post_id = Column(BigInteger, ForeignKey('post.id'), index=True)
    #TODO Ideally unique constraint, but too much work for everyone

class Feed(Base, BaseMixin):

    """
        This defines the feed table which is responsible for loading
        the primary (Majority) feed
    """

    user_id = Column(BigInteger, ForeignKey('user.id'), nullable=False, index=True)
    feed_post_links = relationship("FeedPostLink", backref="feed")
