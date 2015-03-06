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
        to comments left on Objects,
    """

    post_id = Column(BigInteger, ForeignKey('post.id'), nullable=False)
    user_id = Column(BigInteger, ForeignKey('user.id'), nullable=False)
    text = Column(Unicode, nullable=False)
    # anonymous = Column(Boolean, nullable=False, default=True)
    active = Column(Boolean, nullable=False, default=True)
    date_added = Column(DateTime, nullable=False, default=datetime.now)


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
