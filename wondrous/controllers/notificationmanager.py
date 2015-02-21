#!/usr/bin/env python
# -*- coding: utf-8 -*-

#
# Company: WONDROUS
# Created by: Ziyuan Liu
#
# CONTROLLERS/NOTIFICATIONMANAGER.PY
#

import logging

from sqlalchemy import desc

from wondrous.controllers.basemanager import BaseManager

from wondrous.models import (
    DBSession,
    Notification,
)

from wondrous.utilities.notification_utilities import send_notification

class NotificationManager(BaseManager):

    @classmethod
    def construct_notification(cls, reason, from_user_id, to_user_id):
        # TODO construct with correct naming
        retval = ''
        if reason == Notification.COMMENTED:
            retval = "commented on your post"
        elif reason == Notification.UPDATED:
            retval = "updated the post"
        elif reason == Notification.LIKED:
            retval = "liked your post"
        elif reason == Notification.FOLLOWED:
            retval = "followed you"
        elif reason == Notification.FOLLOW_REQUEST:
            retval = "sent you a follow request"
        elif reason == Notification.FOLLOW_ACCEPTED:
            retval = "accepted your follow request"
        return retval

    @staticmethod
    def delete(**kwargs):
        note = Notification.by_kwargs(**kwargs).first()
        if note:
            Notification.delete(note)
        DBSession.flush()

    @classmethod
    def add(cls,from_user_id, to_user_id, reason, subject_id):

        """
            PARAMS: 4 params:
                from_user_id : int  : REQUIRED  : The User.id who did the action
                to_user_id   : int  : REQUIRED  : The User.id recieving the notification
                reason       : int  : REQUIRED  : The Notification Index
                subject_id   : int  : *REQUIRED : The Object.id or User.id of the object involved in the action
        """

        try:
            if from_user_id == to_user_id:
                raise Exception("No need to inform myself")
        except Exception, e:
            logging.warn(e)
            return

        # Delete overlapping notifications
        # TODO: Merge follow requests IF the user.is_private = False
        # TODO: Before I change this need_to_send = need_to_send redundancy,
        need_to_alert = cls._merge_unseen_votes(from_user_id=from_user_id,
                                                to_user_id=to_user_id,
                                                reason=reason)

        # Add the new notification after the overlap handling
        notification = cls.construct_notification(reason,from_user_id,to_user_id)
        new_notification = Notification(from_user_id=from_user_id,
                                        to_user_id=to_user_id,
                                        reason=reason,
                                        subject_id=subject_id,
                                        notification=notification)

        # Send to realtime push
        if need_to_alert or reason == Notification.FOLLOW_ACCEPTED or reason == Notification.FOLLOW_REQUEST:
            send_notification(to_user_id, str({
                'from_user_id' : from_user_id,
                'to_user_id'   : to_user_id,
                'reason'       : reason,
                'subject_id'   : subject_id,
                'notification' : notification,
            }))

        logging.debug("need to alert?"+str(need_to_alert))
        logging.debug("new notification?"+str(new_notification.reason))
        if new_notification:
            DBSession.add(new_notification)
        return new_notification

    @classmethod
    def notification_json(cls, person, page=0):
        per_page = 15
        notes = Notification.query.order_by(desc(Notification.created_at)).filter_by(to_user_id=person.user.id).limit(per_page).offset(page*per_page).all()
        data = []
        for note in notes:
            note_dict = super(NotificationManager, cls).model_to_json(note)
            from_user = note.from_user
            to_user = note.to_user

            note_dict.update({"to_user_username":to_user.username});
            note_dict.update({"to_user_firstname":to_user.person.first_name})

            note_dict.update({"from_user_username":from_user.username});
            note_dict.update({"from_user_firstname":from_user.person.first_name})
            data.append(note_dict)
        return data

    @classmethod
    def _merge_unseen_votes(cls, **kwargs):

        # TODO: This needs to be changed so that if a profile is
        # set to public, repeat jackassary is not notified.
        overlap_notifications = Notification.by_kwargs(**kwargs).all()
        send_note = len(overlap_notifications) == 0

        for n in overlap_notifications:
            DBSession.delete(n)

        return send_note

    @staticmethod
    def get_notifications_for_user(user_id):
        return Notification.by_kwargs(to_user_id=user_id).all()

    @staticmethod
    def get_unseen_notification_count_for_user(user_id):
        return Notification.by_kwargs(to_user_id=user_id).count()

    @staticmethod
    def set_seen(nid):
        note = Notification.by_id(id=nid)
        note.is_seen = True

    @staticmethod
    def set_read(nid):
        note = Notification.by_id(id=nid)
        note.is_read = True
        note.is_seen = True

    @classmethod
    def set_all_seen(cls, user_id):
        # TODO OPTIMIZE
        for note in Notification.by_kwargs(is_seen=True).all():
            note.is_seen = True

    @classmethod
    def set_all_read(cls, user_id):
        # TODO OPTIMIZE
        for note in Notification.by_kwargs(is_read=True).all():
            note.is_read = True

    @classmethod
    def get_all_unseen_count(cls,user_id):
        count = Notification.by_kwargs(is_seen=False,to_user_id=user_id).count()
        return count if count else 0
