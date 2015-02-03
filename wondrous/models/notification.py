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

from wondrous.utilities.notification_utilities import send_notification

class Notification(Base, BaseMixin):
    COMMENTED, UPDATED, LIKED, FOLLOWED, FOLLOW_REQUEST, FOLLOW_ACCEPTED = range(6)

    subject_id = Column(BigInteger)
    from_user_id = Column(BigInteger, ForeignKey('user.id'), nullable=True)  # nul=True -> System notification
    to_user_id = Column(BigInteger, ForeignKey('user.id'), nullable=False)
    notification = Column(Unicode, nullable=False)
    reason = Column(Integer, nullable=False)
    is_read = Column(Boolean, nullable=False, default=False)
    is_seen = Column(Boolean, nullable=False, default=False)
    is_hidden = Column(Boolean, default=False)

    @classmethod
    def construct_notification(cls,reason):
        retval = ''
        if reason == cls.COMMENTED:
            retval = "commented on your post"
        elif reason == cls.UPDATED:
            retval = "updated the post"
        elif reason == cls.LIKED:
            retval = "liked your post"
        elif reason == cls.FOLLOWED:
            retval = "followed you"
        elif reason == cls.FOLLOW_REQUEST:
            retval = "sent you a follow request"
        elif reason == cls.FOLLOW_ACCEPTED:
            retval = "accepted your follow request"
        return retval

    @classmethod
    def add(cls,**kwargs):

        """
            PARAMS: 6 params:
                from_user_id : int  : REQUIRED  : The User.id who did the action
                to_user_id   : int  : REQUIRED  : The User.id recieving the notification
                reason       : int  : REQUIRED  : The Notification Index
                subject_id    : int  : *REQUIRED : The Object.id or User.id of the object involved in the action
        """

        try:
            if kwargs['from_user_id']==kwargs['to_user_id']:
                raise Exception("no need to inform myself")
        except Exception, e:
            logging.warn(e)
            return

        logging.info("making notification {0}".format(kwargs))
        need_to_send = False

        # Delete overlapping notifications
        # TODO: Merge follow requests IF the user.is_private = False
        # TODO: Before I change this need_to_send = need_to_send redundancy,
        # was this intentional? Am I missing something?
        need_to_alert = cls._merge_unseen_votes(\
            from_user_id=kwargs['from_user_id'],to_user_id=kwargs['to_user_id'],\
            reason=kwargs['reason'])

        # Add the new notification after the overlap handling
        kwargs['notification'] = cls.construct_notification(kwargs['reason'])
        new_notification = cls(**kwargs)
        DBSession.add(new_notification)

        # Send to realtime push
        if need_to_alert or kwargs['reason'] == cls.FOLLOW_ACCEPTED:
            send_notification(kwargs['to_user_id'],str(kwargs))

        return new_notification

    @classmethod
    def _merge_unseen_votes(cls,**kwargs):

        # TODO: This needs to be changed so that if a profile is
        # set to public, repeat jackassary is not notified.
        overlap_notifications = super(Notification,cls).by_kwargs(**kwargs).all()
        send_note = len(overlap_notifications) == 0
        logging.info("sending notification {0}".format(len(overlap_notifications)))
        for n in overlap_notifications:
            DBSession.delete(n)

        return send_note

    @classmethod
    def get_notifications_by_kwargs(cls,start=0, per_page=GLOBAL_CONFIGURATIONS['NOTIFICATION_BATCH'], **kwargs):

        return super(Notification,cls).by_pagination(start=start,per_page=per_page,**kwargs).\
            order_by(desc(Notification.date_added)).all()

    @classmethod
    def set_all_seen_for_user(cls,user_id):
        # TODO: use sqlalchemy core to optimize
        for n in cls.get_notifications_by_kwargs(user_id=user_id,is_seen=True,per_page=-1):
            n.is_seen = True

    @classmethod
    def mark_as_read(cls, nid, user_id):
        # TODO: use sqlalchemy core to optimize
        note = super(Notification,cls).by_id(nid)
        if note and note.to_user_id == user_id:
            note.is_read = True
            note.is_seen = True
