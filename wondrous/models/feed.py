#!/usr/bin/env python
# Ziyuan Liu @ Wondrous


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
    feed_id = Column(BigInteger, ForeignKey('feed.id'), primary_key=True)
    wall_post_id = Column(BigInteger, ForeignKey('wall_post.id'), primary_key=True)

    @classmethod
    def add(cls,feed_id,wall_post_id):
        """
            PURPOSE: Add a new FeedPostLink into the database

            USE: Call like: FeedPostLink.add(<dict>)

            PARAMS: 1 param, a dict, with the key as column name:
                - feed_id : int :the id of the Object that is being linked
                - wall_post_id : int : the id of the tag that is being linked

            RETURNS: None
        """
        link, created = cls.get_one_or_create(feed_id=feed_id,wall_post_id=wall_post_id)
        return link

class Feed(Base, BaseMixin):
    """
        This defines the feed table which is responsible for loading
        the primary feed
    """
    user_id = Column(BigInteger, ForeignKey('user.id'))
    feed_post_links = relationship("FeedPostLink", backref="feed")

    def get_subscribed_posts(self,start=0,to_load=15):
        if start > len(self.posts):
            return []
        return self.posts.limit(to_load).offset(start).all()

    @classmethod
    def add(cls, **kwargs):
        new_feed = cls(**kwargs)
        DBSession.add(new_feed)
        return new_feed
