#!/usr/bin/env python
# -*- coding: utf-8 -*-

#
# Company: WONDROUS
# Created by: John Zimmerman
#
# MODELS/COMMENT.PY
#

from datetime import datetime

from sqlalchemy import asc
from sqlalchemy import BigInteger
from sqlalchemy import Boolean
from sqlalchemy import Column
from sqlalchemy import DateTime
from sqlalchemy import ForeignKey
from sqlalchemy import Unicode

from sqlalchemy.orm import relationship

from wondrous.models import Base
from wondrous.models import DBSession

from wondrous.models.modelmixins import BaseMixin


class Comment(Base,BaseMixin):

    """
        Defines the table which holds all data pertaining
        to comments left on Objects, for either a person or page
    """

    object_id = Column(BigInteger, ForeignKey('object.id'), nullable=False)
    user_id = Column(BigInteger, ForeignKey('user.id'), nullable=False)
    text = Column(Unicode, nullable=False)
    anonymous = Column(Boolean, nullable=False, default=True)
    active = Column(Boolean, nullable=False, default=True)
    date_added = Column(DateTime, nullable=False, default=datetime.now)

    @staticmethod
    def add(object_comment_data):

        """
            PURPOSE:

            USE:

            PARAMS:

            RETURNS:
        """

        new_object_comment = Comment()

        new_object_comment.object_id = object_comment_data['object_id']
        new_object_comment.user_id = object_comment_data['user_id']
        new_object_comment.text = object_comment_data['text']
        new_object_comment.anonymous = object_comment_data['anonymous']

        DBSession.add(new_object_comment)
        DBSession.flush()

        return new_object_comment.id

    @staticmethod
    def get(comment_id, object_id=None, is_active=True):

        base_query = Comment.query.filter(Comment.id == comment_id).\
                                   filter(Comment.active == is_active)

        if object_id:
            base_query = base_query.filter(Comment.object_id == object_id)

        return base_query.first()


    @staticmethod
    def get_all_comments_for_object(object_id, is_active=True):

        """
            PURPOSE:

            USE:

            PARAMS:

            RETURNS:
        """

        return Comment.query.filter(Comment.object_id == object_id).\
                                    filter(Comment.active == is_active).\
                                    order_by(asc(Comment.date_added)).all()

    @staticmethod
    def get_all_comments_for_user(user_id, is_active=True):

        """
            PURPOSE:

            USE:

            PARAMS:

            RETURNS:
        """

        return Comment.query.filter(Comment.user_id == user_id).all()
