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
from sqlalchemy import Integer

from sqlalchemy.orm import relationship

from wondrous.models import Base
from wondrous.models import DBSession

from wondrous.models.modelmixins import BaseMixin


class Badge(Base,BaseMixin):
    INFLUENCER = range(1)

    """
        Defines the table which holds all data pertaining
        to comments left on Objects,
    """
    user_id = Column(BigInteger, ForeignKey('user.id'), nullable=False)
    user = relationship('User', foreign_keys=user_id, backref="badges", lazy='joined')
    badge_type = Column(Integer, nullable=False)
    is_public = Column(Boolean, default=True)
