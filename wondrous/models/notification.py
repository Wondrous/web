#!/usr/bin/env python
# -*- coding: utf-8 -*-

#
# Company: WONDROUS
# Created by: John Zimmerman
#
# MODELS/NOTIFICATION.PY
#

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
from wondrous.utilities.global_config import NOTIFICATION_REASON


class Notification(Base):

    __tablename__ = 'notification'

    id = Column(BigInteger, primary_key=True)
    from_user_id = Column(BigInteger, ForeignKey('user.id'), nullable=True)  # nul=True -> System notification
    to_user_id = Column(BigInteger, ForeignKey('user.id'), nullable=False)
    notification = Column(Unicode, nullable=False)
    reason = Column(Integer, nullable=False)
    url = Column(Unicode, nullable=True)
    date_added = Column(DateTime, nullable=False, default=datetime.now)
    is_read = Column(Boolean, nullable=False, default=False)
    is_seen = Column(Boolean, nullable=False, default=False)

    from_user = relationship('User', foreign_keys='Notification.from_user_id')

class NotificationManager(object):

    @staticmethod
    def add(_notification_data):

        """
            PARAMS: 6 params:
                from_user_id : int  : REQUIRED  : The User.id who did the action
                to_user_id   : int  : REQUIRED  : The User.id recieving the notification
                reason       : str  : REQUIRED  : A str stating the reason for the notification
                object_id    : int  : *REQUIRED : The Object.id of the object involved in the action
                object_uuid  : str  : *REQUIRED : The Object.ouuid that is associated with the Object.id

            * Not needed when NOTIFICATION_REASON[4] (i.e., Up/down-voted me)

            An example _notification_data dict: 
                _notification_data = dict(
                    from_user_id=1,
                    to_user_id=5,
                    reason=NOTIFICATION_REASON[4],
                    object_id=10,
                    object_uuid="12bsS3-esdu2-23rhb-234"
                )
        """

        reason, text, url = NotificationManager._construct(_notification_data)

        notification_data = {}
        notification_data['from_user_id'] = _notification_data['from_user_id']
        notification_data['to_user_id']   = _notification_data['to_user_id']
        notification_data['reason']       = reason
        notification_data['notification'] = text
        notification_data['url']          = url

        # Delete overlapping notifications
        if _notification_data['reason'] in [NOTIFICATION_REASON[0], NOTIFICATION_REASON[1]]:
            NotificationManager._merge_unseen_object_comments(_notification_data['from_user_id'],
                                                            _notification_data['to_user_id'],
                                                            url)

        elif _notification_data['reason'] == NOTIFICATION_REASON[2]:
            NotificationManager._merge_unseen_object_votes(_notification_data['from_user_id'],
                                                          _notification_data['to_user_id'],
                                                          url)
        
        elif _notification_data['reason'] == NOTIFICATION_REASON[4]:

            # TODO: Merge follow requests IF the user.is_private = False
            NotificationManager._merge_unseen_user_votes(_notification_data['from_user_id'],
                                                        _notification_data['to_user_id'])

        # Add the new notification after the overlap handling
        NotificationManager._add(notification_data)

    @staticmethod
    def _add(notification_data):
        new_notification = Notification()

        new_notification.from_user_id = notification_data['from_user_id']
        new_notification.to_user_id = notification_data['to_user_id']
        new_notification.reason = notification_data['reason']
        new_notification.notification = notification_data['notification']
        new_notification.url = notification_data['url']

        DBSession.add(new_notification)

    @staticmethod
    def _construct(nd):
        text = ""

        # Set vote type for use in text
        vote_type = "<span style='notification-text-upvote'>upvoted</span>"
        
        # Construct body of text
        if nd['reason'] == NOTIFICATION_REASON[0]:
            text += " commented on your post"
            reason = 0
        
        elif nd['reason'] == NOTIFICATION_REASON[1]:
            text += " commented on a post you were involved in"
            reason = 1
        
        elif nd['reason'] == NOTIFICATION_REASON[2]:
            text += " {vt} your post".format(vt=vote_type)
            reason = 2
        
        elif nd['reason'] == NOTIFICATION_REASON[3]:
            text += " posted to your wall"
            reason = 3
        
        elif nd['reason'] == NOTIFICATION_REASON[4]:
            text += " is now following you"
            reason = 4

        elif nd['reason'] == NOTIFICATION_REASON[5]:
            text += " requested to follow you"
            reason = 5

        elif nd['reason'] == NOTIFICATION_REASON[6]:
            text += " accepted your request"
            reason = 6

        # Set the url
        if nd['reason'] == NOTIFICATION_REASON[4]:

            # TODO
            # Option 1: Change URL to a follow request page
            # Optopn 2: Keep url, but add HTML to accept or deny
            #   - Question: should the HTML be done here? ...prolly not

            url = "/profile/{uid}/".format(
                uid=nd['to_user_id']
            )
        elif nd['reason'] == NOTIFICATION_REASON[6]:
            url = "/profile/{uid}/".format(
                uid=nd['from_user_id']
            )
        else:
            url = get_object_url(nd['object_id'], nd['object_uuid'])

        return reason, text, url

    @staticmethod
    def _merge_unseen_user_votes(from_user_id, to_user_id):

        # TODO: This needs to be changed so that if a profile is
        # set to public, repeat jackassary is not notified.
        overlap_notifications = Notification.query.filter(Notification.from_user_id == from_user_id).\
                                                   filter(Notification.to_user_id == to_user_id).\
                                                   filter(Notification.reason == 4).\
                                                   filter(Notification.is_seen == False).all()
        for n in overlap_notifications:
            DBSession.delete(n)

    @staticmethod
    def _merge_unseen_object_votes(from_user_id, to_user_id, url):

        overlap_notifications = Notification.query.filter(Notification.from_user_id == from_user_id).\
                                                   filter(Notification.to_user_id == to_user_id).\
                                                   filter(Notification.url == url).\
                                                   filter(Notification.reason == 2).\
                                                   filter(Notification.is_seen == False).all()
        for n in overlap_notifications:
            DBSession.delete(n)

    @staticmethod
    def _merge_unseen_object_comments(from_user_id, to_user_id, url):

        overlap_notifications = Notification.query.filter(Notification.from_user_id == from_user_id).\
                                                   filter(Notification.to_user_id == to_user_id).\
                                                   filter(Notification.url == url).\
                                                   filter(or_(Notification.reason == 0, Notification.reason == 1)).\
                                                   filter(Notification.is_seen == False).all()
        for n in overlap_notifications:
            DBSession.delete(n)

    @staticmethod
    def get(notification_id):
        return Notification.query.filter(Notification.id == notification_id).first()

    @staticmethod
    def get_notifications_for_user(user_id, NUM=GLOBAL_CONFIGURATIONS['NOTIFICATION_BATCH']):
        return Notification.query.filter(Notification.to_user_id == user_id).\
                            order_by(desc(Notification.date_added)).limit(NUM).all()

    @staticmethod
    def get_unseen_notification_count_for_user(user_id):
        return Notification.query.filter(Notification.to_user_id == user_id).\
                                  filter(Notification.is_seen == False).count()

    @staticmethod
    def get_unseen_notifications_for_user(user_id):
        return Notification.query.filter(Notification.to_user_id == user_id).\
                                  filter(Notification.is_seen == False).all()

    @staticmethod
    def set_all_seen_for_user(user_id):
        for n in NotificationManager.get_unseen_notifications_for_user(user_id): 
            n.is_seen = True

    @staticmethod
    def mark_as_read(nid, user_id):
        this_n = NotificationManager.get(nid)
        if this_n and this_n.to_user_id == user_id:
            this_n.is_read = True
            this_n.is_seen = True


