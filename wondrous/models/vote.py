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
from sqlalchemy import Index

from sqlalchemy.orm import relationship
from sqlalchemy.orm import backref

from wondrous.models import Base
from wondrous.models import DBSession

from wondrous.models.modelmixins import BaseMixin

class Vote(Base, BaseMixin):

    """
        Vote keeps track of relationship status and data
        ALWAYS between an user and user/object

        If VOTE_TYPE is 0, the user is building a relationship with an object
        else 1, the user is building a relationship with another user

        This is always a one to one (one to many abstracted)
        Vote is similar to an intermediary model
    """

    (OBJECT, USER) = xrange(2)

    (UNLIKED,       # 0
     LIKED,         # 1
     BOOKMARKED,    # 2
     BLOCKED,       # 3
     PENDING,       # 4
     UNFOLLOWED,    # 5
     FOLLOWED,      # 6
     TOPFRIEND      # 7
    ) = xrange(8)

    vote_type = Column(Integer, nullable=False)
    status = Column(Integer, nullable=False)
    user_id = Column(BigInteger, ForeignKey('user.id'), nullable=False)
    user = relationship("User", backref=backref("votes"))
    subject_id = Column(BigInteger, index=True)
    __table_args__ = (Index('vote_index', "status", "user_id", "subject_id"), )

    def get_subject(self):
        if self.vote_type==0:
            # object
            return Object.by_id(self.subject_id).first()

        elif self.vote_type==1:
            # user
            return User.by_id(self.subject_id).first()
