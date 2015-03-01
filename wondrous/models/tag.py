#!/usr/bin/env python
# -*- coding: utf-8 -*-

#
# Company: WONDROUS
# Created by: John Zimmerman
#
# MODELS/TAG.PY
#

from sqlalchemy import (
	BigInteger,
	Column,
	ForeignKey,
	Unicode,
)

from sqlalchemy.orm import relationship

from wondrous.models import Base

from wondrous.models.modelmixins import BaseMixin

class PostTagLink(Base,BaseMixin):
    """
        This is the link for the many to many relationship
        between an object and its tag(s)
    """
    tag_id = Column(BigInteger, ForeignKey('tag.id'), primary_key=True)
    post_id = Column(BigInteger, ForeignKey('post.id'), primary_key=True)

class Tag(Base,BaseMixin):

    """Tags used on Objects"""

    tag_name = Column(Unicode, nullable=False, unique=True)
    post_tag_links = relationship("PostTagLink", backref="tag")

    @classmethod
    def by_name_like(cls, key, num=50):

        """
            TODO: Probably should go into its own controllers file
        """

        return cls.query.filter(cls.tag_name.ilike("%{q}%".format(q=key))).limit(num)
