#!/usr/bin/env python
# -*- coding: utf-8 -*-

#
# Company: WONDROUS
# Created by: John Zimmerman
#
# MODELS/VOTE.PY
#
import logging

from datetime import datetime

from sqlalchemy import BigInteger
from sqlalchemy import Boolean
from sqlalchemy import Column
from sqlalchemy import DateTime
from sqlalchemy import ForeignKey
from sqlalchemy import Integer

from sqlalchemy.orm import relationship
from sqlalchemy.orm import backref

from wondrous.models import Base
from wondrous.models import DBSession

from wondrous.models.modelmixins import BaseMixin

class Vote(Base,BaseMixin):
    """
        Vote keeps track of relationship status and data
        ALWAYS between an user and user/object

        If VOTE_TYPE is 0, the user is building a relationship with an object
        else 1, the user is building a relationship with another user

        This is always a one to one (one to many abstracted)
        Vote is similar to an intermediary model

    """
    OBJECT, USER = range(2)
    UNLIKED, LIKED, BOOKMARKED, BLOCK, PENDING, UNFOLLOW, FOLLOW, TOPFRIEND = range(8)

    vote_type = Column(Integer, nullable=False)
    status = Column(Integer, nullable=False)
    user_id = Column(BigInteger,ForeignKey('user.id'),nullable=False)
    user = relationship("User", backref=backref("votes"))
    subject_id = Column(BigInteger)

    def get_subject(self):
        if self.vote_type==0:
            # object
            return Object.by_id(self.subject_id).first()

        elif self.vote_type==1:
            # user
            return User.by_id(self.subject_id).first()


    @classmethod
    def delete_vote(cls,vote_object):
        """
            PURPOSE: *HARD DELETE* a vote row from the database

            USE: Vote.delete_vote(<Vote>)

            PARAMS: the vote object

            RETURNS: (None)

        """
        DBSession.delete(vote_object)
