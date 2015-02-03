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
from wondrous.models import DBSession

from wondrous.models.modelmixins import BaseMixin

class ObjectTagLink(Base,BaseMixin):
    """
        This is the link for the many to many relationship
        between an object and its tag(s)
    """
    tag_id = Column(BigInteger, ForeignKey('tag.id'), primary_key=True)
    object_id = Column(BigInteger, ForeignKey('object.id'), primary_key=True)

    @classmethod
    def add(cls,object_id,tag_id):
        """
            PURPOSE: Add a new ObjectTagLink into the database

            USE: Call like: ObjectTagLink.add(<dict>)

            PARAMS: 1 param, a dict, with the key as column name:
                - object_id : int :the id of the Object that is being linked
                - tag_id : int : the id of the tag that is being linked

            RETURNS: None
        """
        link, created = super(ObjectTagLink,cls).get_one_or_create(object_id=object_id,tag_id=tag_id)
        return link

class Tag(Base,BaseMixin):

    """Tags used on Objects"""
    tag_name = Column(Unicode, nullable=False, unique=True)
    object_tag_links = relationship("ObjectTagLink", backref="tag")

    @classmethod
    def add(cls,object_id,tag_name):

        """
            PURPOSE: Add a new ObjectTag into the database

            USE: Call like: ObjectTagManager.add(<dict>)

            PARAMS: 1 param, a dict, with the key as column name:
                - object_id : the id of the Object that is being tagged
                - tag_name : str : the string of the tag name, #hashtag (no pound sign)

            RETURNS: the link object
        """
        new_tag, created = cls.get_one_or_create(tag_name=tag_name)
        link = ObjectTagLink.add(object_id,new_tag.id)
        return new_tag
