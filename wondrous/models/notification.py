#!/usr/bin/env python
# -*- coding: utf-8 -*-

#
# Company: WONDROUS
# Created by: John Zimmerman
#
# MODELS/NOTIFICATION.PY
#

import logging

from datetime import datetime

from sqlalchemy import BigInteger
from sqlalchemy import Boolean
from sqlalchemy import Column
from sqlalchemy import desc
from sqlalchemy import DateTime
from sqlalchemy import ForeignKey
from sqlalchemy import Integer
from sqlalchemy import or_
from sqlalchemy import Unicode

from sqlalchemy.orm import relationship

from wondrous.models import Base
from wondrous.models import DBSession

from wondrous.utilities.general_utilities import get_object_url

from wondrous.utilities.global_config import GLOBAL_CONFIGURATIONS
from wondrous.models.modelmixins import BaseMixin


class Notification(Base, BaseMixin):
    COMMENTED, UPDATED, LIKED, FOLLOWED, FOLLOW_REQUEST, FOLLOW_ACCEPTED = range(6)

    subject_id = Column(BigInteger)
    from_user_id = Column(BigInteger, ForeignKey('user.id'), nullable=True)  # nul=True -> System notification
    from_user = relationship("User",cascade="delete")

    to_user_id = Column(BigInteger, ForeignKey('user.id'), nullable=False)
    to_user = relationship("User",cascade="delete")
    notification = Column(Unicode, nullable=False)
    reason = Column(Integer, nullable=False)
    is_read = Column(Boolean, nullable=False, default=False)
    is_seen = Column(Boolean, nullable=False, default=False)
    is_hidden = Column(Boolean, default=False)

    @classmethod
    def get_notifications_by_kwargs(cls,start=0, per_page=GLOBAL_CONFIGURATIONS['NOTIFICATION_BATCH'], **kwargs):
        return super(Notification,cls).by_pagination(start=start,per_page=per_page,**kwargs).\
            order_by(desc(Notification.date_added)).all()
