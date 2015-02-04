#!/usr/bin/env python
# -*- coding: utf-8 -*-

#
# Company: WONDROUS
# Created by: John Zimmerman
#
# MODELS/TAG.PY
#

from datetime import datetime

from sqlalchemy import BigInteger
from sqlalchemy import Column
from sqlalchemy import DateTime
from sqlalchemy import ForeignKey
from sqlalchemy import func
from sqlalchemy import Unicode

from sqlalchemy.orm import relationship

from wondrous.models import Base

from wondrous.models.modelmixins import BaseMixin

class ObjectTagLink(Base,BaseMixin):
    """
        This is the link for the many to many relationship
        between an object and its tag(s)
    """
    tag_id = Column(BigInteger, ForeignKey('tag.id'), primary_key=True)
    object_id = Column(BigInteger, ForeignKey('object.id'), primary_key=True)

class Tag(Base,BaseMixin):

    """Tags used on Objects"""
    tag_name = Column(Unicode, nullable=False, unique=True)
    object_tag_links = relationship("ObjectTagLink", backref="tag")
