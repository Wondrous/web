#!/usr/bin/env python
# -*- coding: utf-8 -*-

#
# Company: WONDROUS
# Created by: John Zimmerman
#
# MODELS/OBJECT.PY
#

from sqlalchemy import (
    BigInteger,
    Boolean,
    Column,
    ForeignKey,
    Unicode,
)

from sqlalchemy.orm import relationship

from wondrous.models import (
    Base,
    DBSession,
)
from sqlalchemy import or_

from wondrous.models.tag import Tag

from wondrous.utilities.validation_utilities import ValidateLink

from wondrous.models.modelmixins import BaseMixin

class Object(Base, BaseMixin):

    """
        This defines the Object posted,
        objects should not be directly accessible by users
        objects are simply the goods carried by posts (the containing structure)
    """
    # user_id = Column(BigInteger, ForeignKey('user.id'), nullable=False)
    subject = Column(Unicode, default=None, nullable=True)
    text = Column(Unicode, default=None)
    mime_type = Column(Unicode, nullable=True)
    ouuid = Column(Unicode, nullable=True)
    # comments = relationship("Comment",cascade="delete")
    @classmethod
    def by_text_like(cls, text, num=50):

        """
            TODO: Probably should go into its own controllers/personmanager.py file
        """
        return DBSession.query(Object).filter(or_(Object.subject.ilike("%{q}%".format(q=text)),Object.text.ilike("%{q}%".format(q=text)))).limit(num)

    def json(self,level=0):
        data = super(Object,self).json(level)
        if 'id' in data:
            del data['id']
        return data 

class ObjectLink(Base, BaseMixin):

    """
        OBJECT_TYPE: 1 --> LINK
    """
    url = Column(Unicode, nullable=False)
    scheme = Column(Unicode, nullable=False, default=unicode("http"))
    mime_type = Column(Unicode, nullable=True)
    is_dead = Column(Boolean, nullable=False, default=False)

    @classmethod
    def get(cls,url):
        return super(ObjectLink,cls).by_kwargs(url=url).first()

    @classmethod
    def add(object_link_data):

        """
            PURPOSE: Add a new ObjectLink into the database

            USE: Call like: ObjectLink.add(<dict>)

            PARAMS: 1 param, a dict, witch each key as column name:
                - url
                - mime_type

            RETURNS: None
        """

        new_object_link = ObjectLink(**object_link_data)
        DBSession.add(new_object_link)
        DBSession.flush()

        return new_object_link

class ObjectFile(Base, BaseMixin):

    """
        OBJECT_TYPE: 2 --> <FILE>
    """
    file_url  = Column(Unicode, nullable=False)
    original_file_name = Column(Unicode, nullable=False)
    file_size = Column(BigInteger, nullable=True)
    mime_type = Column(Unicode, nullable=False)
    mapped = Column(Boolean, default=False)

    @classmethod
    def get(cls,object_file_id, is_mapped=True):

        """
        """
        return super(ObjectFile,cls).by_kwargs(object_file_id=object_file_id,is_mapped=is_mapped).first()

    @classmethod
    def add(cls,object_file_data):

        """
            TODO
            ==============

            PURPOSE: Add a new ObjectFile into the database

            USE: Call like: ObjectFile.add(<dict>)

            PARAMS: 1 param, a dict, with each key as column name:
                - file_url
                - file_size
                - mime_type

            RETURNS: None
        """

        new_object_file = cls(**object_file_data)
        DBSession.add(new_object_file)
        DBSession.flush()

        return new_object_file

class LinkToObject(Base, BaseMixin):
    object_id = Column(BigInteger, ForeignKey('object.id'), nullable=False)
    object_link_id = Column(BigInteger, ForeignKey('object_link.id'), nullable=False)

    @staticmethod
    def get_all_links_for_object(object_id):

        """
            PURPOSE: Get all the links mapped to an object

            USE: Call like: LinkToObject.get_all_links_for_object(<int>)

            PARAMS: 1 param:
                object_id : int : REQUIRED : The Object.id whose links we're getting

            RETURNS: A list of LinkToObject objects which are mapped to a given Object
        """

        return LinkToObject.query.filter(LinkToObject.object_id == object_id).all()

    @staticmethod
    def add(link_to_object_data):

        """
            PURPOSE: Map an ObjectLink to an Object

            USE: Call like: LinkToObject.add(<dict>)

            PARAMS: 1 param, a dict:
                link_to_object_data : dict : REQUIRED
                    - object_id : int : The Object.id of the object to map
                    - object_link_id : int : The ObjectLink.id of the link to map

            RETURNS: (None)
        """

        new_link_to_object = LinkToObject()

        new_link_to_object.object_id = link_to_object_data['object_id']
        new_link_to_object.object_link_id = link_to_object_data['object_link_id']

        DBSession.add(new_link_to_object)


class FileToObject(Base):

    __tablename__ = 'file_to_object'

    id = Column(BigInteger, primary_key=True, nullable=False)
    object_id = Column(BigInteger, ForeignKey('object.id'), nullable=False)
    object_file_id = Column(BigInteger, ForeignKey('object_file.id'), nullable=False)

    object_file = relationship('ObjectFile', foreign_keys='FileToObject.object_file_id')


    @staticmethod
    def get_all_files_for_object(object_id):

        """
            PURPOSE: Get all the files mapped to an object

            USE: Call like: FileToObject.get_all_files_for_object(<int>)

            PARAMS: 1 param:
                object_id : int : REQUIRED : The Object.id whose files we're getting

            RETURNS: A list of FileToObject objects which are mapped to a given Object
        """

        return FileToObject.query.filter(FileToObject.object_id == object_id).all()

    @staticmethod
    def add(file_to_object_data):

        """
            PURPOSE: Map an ObjectFile to an Object

            USE: Call like: FileToObject.add(<dict>)

            PARAMS: 1 param, a dict:
                file_to_object_data : dict : REQUIRED
                    - object_id : int : The Object.id of the object to map
                    - object_file_id : int : The ObjectFile.id of the link to map

            RETURNS: (None)
        """

        new_file_to_object = FileToObject()

        new_file_to_object.object_id = file_to_object_data['object_id']
        new_file_to_object.object_file_id = file_to_object_data['object_file_id']

        DBSession.add(new_file_to_object)



# TODO: =================
# NEED TO CREATE A "DELETE_OBJECT" FUNCTION
# It will cascade down through other tables
# so that a "reported object" can be taken down
# Note: When a user deletes posted content, any
# "reshares" will NOT also be deleted. (This is
# what Tumblr does, and so do I.)
