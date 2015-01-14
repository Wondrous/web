#!/usr/bin/env python
# -*- coding: utf-8 -*-

#
# Company: WONDROUS
# Created by: John Zimmerman
#
# MODELS/OBJ.PY
#

import uuid

from datetime import datetime

from sqlalchemy import BigInteger
from sqlalchemy import Boolean
from sqlalchemy import Column
from sqlalchemy import DateTime
from sqlalchemy import ForeignKey
from sqlalchemy import func
from sqlalchemy import Unicode

from sqlalchemy.orm import relationship

from wondrous.models import Base
from wondrous.models import DBSession

from wondrous.utilities.validation_utilities import ValidateLink


class Object(Base):

    """
        This defines the Object posted
    """

    __tablename__ = 'object'

    id = Column(BigInteger, primary_key=True)
    poster_id = Column(BigInteger, ForeignKey('user.id'), nullable=False)
    subject = Column(Unicode, default=None, nullable=True)
    text = Column(Unicode, default=None)
    active = Column(Boolean, default=True)  # only used for disabling/re-enabling an account
    ouuid = Column(Unicode, nullable=True)
    date_posted = Column(DateTime, default=datetime.now)


class ObjectManager(object):

    @staticmethod
    def get(object_id):

        """
            PURPOSE: Get an Object from the database

            USE: Call like: ObjectManager.get(<int>)

            PARAMS: 1 param: an int, object_id

            RETURNS: If found, an Object
                     If not found, None
        """

        return Object.query.filter(Object.id == object_id).first()

    @staticmethod
    def get_all_objects_for_user(user_id):
        
        """
            PURPOSE: Get all Objects that a specified User has posted

            USE: Call like: ObjectManager.get_all_objects_for_user(<int>)

            PARAMS: 1 required param, an int, user_id of the User.id

            RETURNS: A list of all a User's posted objects
        """

        return Object.query.filter(Object.poster_id == user_id).all()

    @staticmethod
    def add(object_data):
        
        """
            PURPOSE: Add a new Object into the database

            USE: Call like: ObjectManager.add(<dict>)

            *NOTE: ALWAYS call this method from PostSequence
            Without doing so, we cannot ensure all tables
            were updated and rows were created. This is very bad.

            PARAMS: 1 param, a dict with the keys as column names:
                - text : str : Any text present in a post
                - subject : str : The subject (title) of a post
                - object_type : The type of object, i.e., image, link, video, etc.

            RETURNS: The newly created Object object
        """

        new_object = Object()

        new_object.text        = object_data['text']
        new_object.subject     = object_data['subject']
        new_object.poster_id   = object_data['poster_id']
        new_object.ouuid       = unicode(uuid.uuid4())

        DBSession.add(new_object)
        DBSession.flush()

        return new_object

    @staticmethod
    def count(is_active=True):
        return Object.query.filter(Object.active == is_active).count()


class ObjectLink(Base):

    """
        OBJECT_TYPE: 1 --> LINK
    """

    __tablename__ = 'object_link'

    id = Column(BigInteger, primary_key=True)
    url = Column(Unicode, nullable=False)
    scheme = Column(Unicode, nullable=False, default=unicode("http"))
    mime_type = Column(Unicode, nullable=True)
    is_dead = Column(Boolean, nullable=False, default=False)


class ObjectLinkManager(object):

    @staticmethod
    def get(url):

        return ObjectLink.query.filter(
            func.lower(ObjectLink.url) == func.lower(url)
        ).first()

    @staticmethod
    def add(object_link_data):

        """
            PURPOSE: Add a new ObjectLink into the database
        
            USE: Call like: ObjectLinkManager.add(<dict>)
        
            PARAMS: 1 param, a dict, witch each key as column name:
                - url
                - mime_type
        
            RETURNS: None
        """

        new_object_link = ObjectLink()

        new_object_link.url  = object_link_data['url']
        new_object_link.mime_type = object_link_data['mime_type']
        new_object_link.scheme = ValidateLink.get_scheme(object_link_data['url'])

        DBSession.add(new_object_link)
        DBSession.flush()

        return new_object_link


class ObjectFile(Base):

    """
        OBJECT_TYPE: 2 --> <FILE>
    """

    __tablename__ = 'object_file'

    id = Column(BigInteger, primary_key=True)
    file_url  = Column(Unicode, nullable=False)
    original_file_name = Column(Unicode, nullable=False)
    file_size = Column(BigInteger, nullable=True)
    mime_type = Column(Unicode, nullable=False)
    date_uploaded = Column(DateTime, default=datetime.now)
    mapped = Column(Boolean, default=False)


class ObjectFileManager(object):

    @staticmethod
    def get(object_file_id, is_mapped=True):

        """
        """

        return ObjectFile.query.filter(ObjectFile.id == object_file_id).\
                                filter(ObjectFile.mapped == is_mapped).first()

    @staticmethod
    def add(object_file_data):

        """
            TODO
            ==============

            PURPOSE: Add a new ObjectFile into the database
        
            USE: Call like: ObjectFileManager.add(<dict>)
        
            PARAMS: 1 param, a dict, with each key as column name:
                - file_url
                - file_size
                - mime_type
        
            RETURNS: None
        """

        new_object_file = ObjectFile()

        new_object_file.file_url  = object_file_data['file_url']
        new_object_file.original_file_name = object_file_data['original_file_name']
        new_object_file.file_size = object_file_data['file_size']
        new_object_file.mime_type = object_file_data['mime_type']

        DBSession.add(new_object_file)
        DBSession.flush()
        
        return new_object_file


class LinkToObject(Base):

    __tablename__ = 'link_to_object'


    id = Column(BigInteger, primary_key=True, nullable=False)
    object_id = Column(BigInteger, ForeignKey('object.id'), nullable=False)
    object_link_id = Column(BigInteger, ForeignKey('object_link.id'), nullable=False)

    link = relationship('ObjectLink', foreign_keys='LinkToObject.object_link_id')


class LinkToObjectManager(object):

    @staticmethod
    def get_all_links_for_object(object_id):

        """
            PURPOSE: Get all the links mapped to an object
        
            USE: Call like: LinkToObjectManager.get_all_links_for_object(<int>)
        
            PARAMS: 1 param:
                object_id : int : REQUIRED : The Object.id whose links we're getting
        
            RETURNS: A list of LinkToObject objects which are mapped to a given Object
        """

        return LinkToObject.query.filter(LinkToObject.object_id == object_id).all()

    @staticmethod
    def add(link_to_object_data):

        """
            PURPOSE: Map an ObjectLink to an Object

            USE: Call like: LinkToObjectManager.add(<dict>)

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


class FileToObjectManager(object):

    @staticmethod
    def get_all_files_for_object(object_id):

        """
            PURPOSE: Get all the files mapped to an object
        
            USE: Call like: FileToObjectManager.get_all_files_for_object(<int>)
        
            PARAMS: 1 param:
                object_id : int : REQUIRED : The Object.id whose files we're getting
        
            RETURNS: A list of FileToObject objects which are mapped to a given Object
        """

        return FileToObject.query.filter(FileToObject.object_id == object_id).all()

    @staticmethod
    def add(file_to_object_data):

        """
            PURPOSE: Map an ObjectFile to an Object

            USE: Call like: FileToObjectManager.add(<dict>)

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
