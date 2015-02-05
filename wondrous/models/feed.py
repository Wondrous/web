#!/usr/bin/env python
# -*- coding: utf-8 -*-

#
# Company: WONDROUS
# Created by: Ziyuan Liu
#
# MODELS/FEED.PY
#

from sqlalchemy import BigInteger
from sqlalchemy import Boolean
from sqlalchemy import Column
from sqlalchemy import desc
from sqlalchemy import ForeignKey
from sqlalchemy import BigInteger

from sqlalchemy.orm import relationship

from wondrous.models import Base
from wondrous.models import DBSession
from wondrous.models.modelmixins import BaseMixin

class FeedPostLink(Base,BaseMixin):
    """
        This is the link for the many to many relationship
        between an object and its post(s)
    """
    feed_id = Column(BigInteger, ForeignKey('feed.id'))
    post_id = Column(BigInteger, ForeignKey('post.id'))

class Feed(Base, BaseMixin):
    """
        This defines the feed table which is responsible for loading
        the primary feed
    """
    user_id = Column(BigInteger, ForeignKey('user.id'), nullable=False)
    feed_post_links = relationship("FeedPostLink", backref="feed")
