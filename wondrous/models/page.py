#!/usr/bin/env python
# -*- coding: utf-8 -*-

#
# Company: WONDROUS
# Created by: John Zimmerman
#
# MODELS/PAGE.PY
#

from datetime import datetime

from sqlalchemy import BigInteger
from sqlalchemy import Column
from sqlalchemy import DateTime
from sqlalchemy import ForeignKey
from sqlalchemy import Unicode

from sqlalchemy.orm import relationship

from wondrous.models import Base
from wondrous.models import DBSession

class Page(Base):

    """
        *** CURRENTLY UNUSED ***

        Defines the Page table, which is responsible for mainting data
        for pages -- ex. bands, products, businesses, etc.
    """

    __tablename__ = 'page'

    id = Column(BigInteger, ForeignKey('user.id'), primary_key=True, nullable=False)
    title = Column(Unicode, nullable=False)
    description = Column(Unicode, nullable=True)
    about = Column(Unicode, nullable=True)
    external_url = Column(Unicode, nullable=True)

    # Extremely important
    user = relationship('User', foreign_keys='Page.id')

class PageManager(object):

    @staticmethod
    def _get(user_id):

        """
            PURPOSE: Get a page from the database
        
            USE: Call like: PageManager._get(<int>)
        
            PARAMS: 1 param: an int, the id of the page to get
            
            RETURNS: If found, a Page object
                     Otherwise, None
        """

        return Page.query.filter(Page.id == user_id).first()

 
    @staticmethod
    def _add(page_data):
        
        """
            PURPOSE: Add a new page into the DB
        
            USE: Call like: PageManager._add(<dict>)
        
            PARAMS: 1 param, a dict, with each key as column name:
                -user_id        -about
                -title          -external_url
                -description    -cover_picture
        
            RETURNS: None
        """

        new_page = Page()

        new_page.id            = page_data['user_id']
        new_page.title         = page_data['title']
        new_page.description   = page_data['description']
        new_page.about         = page_data['about']
        new_page.external_url  = page_data['external_url']
        new_page.cover_picture = page_data['cover_picture']

        DBSession.add(new_page)

class UserToPage(Base):

    """
        Defines the UserToPage table, which is responsible for
        mapping users to individual pages. This is to allow
        a page to multiple administrative roles, each with
        cstomizable permissions (TODO).
    """

    __tablename__ = 'user_to_page'

    id = Column(BigInteger, primary_key=True, nullable=False)
    user_person_id = Column(BigInteger, ForeignKey('person.id'), nullable=False)
    user_page_id = Column(BigInteger, ForeignKey('page.id'), nullable=False)
    is_creator = Column(BigInteger, default=False, nullable=False)
    date_added = Column(DateTime, nullable=False, default=datetime.now)


class UserToPageManager(object):

    @staticmethod
    def get(user_person_id, user_page_id):
        return UserToPage.query.filter(UserToPage.user_person_id == user_person_id).\
                                filter(UserToPage.user_page_id == user_page_id).first()

    @staticmethod
    def get_creator(user_page_id):
        
        """
            TODO: Return a Person object, not a UserToPage object
        """
        
        return UserToPage.query.filter(UserToPage.user_page_id == user_page_id).\
                                filter(UserToPage.is_creator == True).first()

    @staticmethod
    def add(user_to_page_data):
        
        new_user_to_page = UserToPage()

        new_user_to_page.user_person_id = user_to_page_data['user_person_id']
        new_user_to_page.user_page_id   = user_to_page_data['user_page_id']
        new_user_to_page.is_creator     = user_to_page_data['is_creator']

        DBSession.add(new_user_to_page)

    @staticmethod
    def remove(user_person_id, user_page_id):
        user_to_page_obj = UserToPageManager.get(user_person_id, user_page_id)
        if user_to_page_obj:
            DBSession.delete(user_to_page_obj)

