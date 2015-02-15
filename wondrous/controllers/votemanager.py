#!/usr/bin/env python
# -*- coding: utf-8 -*-

#
# Company: WONDROUS
# Created by: Ziyuan Liu
#
# CONTROLLERS/VOTEMANAGER.PY
#

import logging

from wondrous.models import (
    DBSession,
    Notification,
    Vote,
)

from sqlalchemy import or_

from wondrous.controllers.accountmanager import AccountManager
from wondrous.controllers.basemanager import BaseManager
from wondrous.controllers.notificationmanager import NotificationManager

class VoteAction:
    LIKED, BOOKMARKED, CANCEL, FOLLOW, ACCEPT, BLOCK, DENY, TOPFRIEND = range(8)


class VoteManager(BaseManager):

    @staticmethod
    def validate_vote_args(vote_type=None, status=None):
        retval = vote_type or status
        if vote_type:
            retval = retval and vote_type in [Vote.USER, Vote.OBJECT]

        if status:
            retval = retval and status in [
                                    Vote.UNLIKED,
                                    Vote.LIKED,
                                    Vote.BOOKMARKED,
                                    Vote.BLOCKED,
                                    Vote.PENDING,
                                    Vote.UNFOLLOWED,
                                    Vote.FOLLOWED,
                                    Vote.TOPFRIEND]
        return retval

    @classmethod
    def vote_json(cls, person, user_id, vote_type, action):
        from_user_id = person.user.id
        user_id      = long(user_id)
        vote_type    = int(vote_type)
        action       = int(action)
        # Translate action
        vote = None
        if vote_type == Vote.OBJECT:
            if action == VoteAction.LIKED:
                vote = cls.like(from_user_id,user_id)
            elif action == VoteAction.BOOKMARKED:
                pass
        elif vote_type == Vote.USER:
            if action == VoteAction.FOLLOW:
                vote = cls.follow(from_user_id,user_id)
            elif action == VoteAction.ACCEPT:
                vote = cls.accept(from_user_id,user_id)
            elif action == VoteAction.CANCEL:
                vote = cls.cancel(from_user_id,user_id)
            elif action == VoteAction.BLOCK:
                vote = cls.block(from_user_id,user_id)
            elif action == VoteAction.DENY:
                vote = cls.deny(from_user_id,user_id)
            elif action == VoteAction.TOPFRIEND:
                pass  # TODO

        if vote:
            DBSession.add(vote)
            DBSession.flush()
            if vote_type == Vote.USER:
                return {
                    "total_following" : cls.get_following_count(user_id),
                    "total_follower"  : cls.get_follower_count(user_id),
                }
            elif vote_type == Vote.OBJECT:
                return super(VoteManager, cls).model_to_json(vote)
        else:
            return {'error': 'invalid inputs'}

    @classmethod
    def follow(cls, from_user_id, to_user_id):
        """
            PURPOSE: This is a toggle method, follow -> unfollow, vice versa
        """
        # If profile is private, request, else follow
        is_private = AccountManager.is_private(to_user_id)
        if is_private:
            # we need to re-request
            status = Vote.PENDING
            reason = Notification.FOLLOW_REQUEST
        else:
            status = Vote.FOLLOWED
            reason = Notification.FOLLOWED

        # Notify if needed
        new_notification = NotificationManager.add(
                            from_user_id=from_user_id,
                            to_user_id=to_user_id,
                            subject_id=from_user_id,
                            reason=reason)

        # Change the current one if it exists
        vote = Vote.by_kwargs(user_id=from_user_id, subject_id=to_user_id, vote_type=Vote.USER).first()
        if vote:
            if not cls.is_blocked_by(from_user_id,to_user_id) and (vote.status != Vote.PENDING or not is_private):
                vote.status = status
        else:
            vote = Vote(user_id=from_user_id, subject_id=to_user_id, vote_type=Vote.USER, status=status)

        return vote

    @classmethod
    def topfriend(cls, from_user_id, to_user_id):
        
        """
            PURPOSE: TOPFRIEND only if public or already following
        """

        vote = Vote.by_kwargs(user_id=from_user_id, subject_id=to_user_id, vote_type=Vote.USER).first()
        if vote:
            if vote.status == Vote.TOPFRIEND:
                vote.status = Vote.FOLLOWED
            elif vote.status == Vote.FOLLOWED:
                vote.status = Vote.TOPFRIEND
            return vote
        return None

    @classmethod
    def cancel(cls, from_user_id, to_user_id):
        
        """
            PURPOSE: This is the method used to cancel requests, if there are any
        """

        vote = Vote.by_kwargs(user_id=to_user_id, subject_id=from_user_id, vote_type=Vote.USER).first()
        if vote.status == Vote.PENDING:
            NotificationManager.delete(
                from_user_id=from_user_id,
                to_user_id=to_user_id,
                reason=Notification.FOLLOW_REQUEST,
                subject_id=from_user_id)

            vote.status = Vote.UNFOLLOWED
            return vote
        return None


    @classmethod
    def accept(cls, from_user_id, to_user_id):
        
        """
            PURPOSE: In order to accept a request, there must be one
        """

        vote = Vote.by_kwargs(user_id=to_user_id, subject_id=from_user_id, vote_type=Vote.USER).first()
        if vote.status == Vote.PENDING:
            vote.status = Vote.FOLLOWED
            return vote
        return None

    @classmethod
    def like(cls, from_user_id, object_id):
        
        """
            PURPOSE: Checks if there exists a relationship between a person and an object, this is a toggle
        """

        vote = Vote.by_kwargs(user_id=from_user_id, subject_id=object_id, vote_type=Vote.OBJECT).first()

        if vote:
            if vote.status == Vote.LIKED:
                vote.status = Vote.UNLIKED
            elif vote.status == Vote.UNLIKED:
                vote.status = Vote.LIKED
        else:
            vote = Vote(user_id=from_user_id, subject_id=object_id, vote_type=Vote.OBJECT, status=Vote.LIKED)

        return vote

    @classmethod
    def deny(cls, from_user_id, to_user_id):
        
        """
            PURPOSE: In order to deny a request, there must be one
        """

        vote = Vote.by_kwargs(user_id=to_user_id, subject_id=from_user_id, vote_type=Vote.USER).first()
        if vote and vote.status == Vote.PENDING:
            vote.status = Vote.UNFOLLOWED
            return vote
        return None

    @classmethod
    def block(cls, from_user_id, user_id):
        
        """
            PURPOSE: Check if the user is already blocking another, this is a toggle
        """

        vote = Vote.by_kwargs(user_id=from_user_id, subject_id=user_id, vote_type=Vote.USER).first()
        reverse_vote = Vote.by_kwargs(user_id=user_id, subject_id=from_user_id, vote_type=Vote.USER).first()

        if vote:
            if vote.status == Vote.BLOCKED:
                vote.status = Vote.UNFOLLOWED
            else:
                vote.status = Vote.BLOCKED

        else:
            vote = Vote(user_id=from_user_id, subject_id=user_id, vote_type=Vote.USER, status=Vote.BLOCKED)

        if reverse_vote:
            reverse_vote.status = Vote.UNFOLLOWED
        else:
            reverse_vote = Vote(user_id=user_id, subject_id=from_user_id, vote_type=Vote.USER, status=Vote.UNFOLLOWED)

        return vote

    @staticmethod
    def get_vote(user_id, subject_id, vote_type):

        """
            Return whether or not a user has voted on a particular object
        """

        vote = Vote.by_kwargs(user_id=user_id, subject_id=subject_id, vote_type=vote_type).first()
        return vote if vote else None


    @classmethod
    def get_like_count(cls, subject_id):

        """
        """

        return cls.get_count_by_type(subject_id,Vote.OBJECT,Vote.LIKED)

    @classmethod
    def get_liked_objects_for_user(cls, user_id):

        """
        """

        return Vote.by_kwargs(user_id=user_id, vote_type=Vote.OBJECT, status=Vote.LIKED)

    @staticmethod
    def get_count_by_type(user_id, vote_type, status, following_me=True):

        """
            PURPOSE: Get the number of votes

            USE: Vote.get_count_by_type(<id>,<int>,<)

            PARAMS: 4 params
                user_id: int : the id of the user or subject
                vote_type: int : the type of the vote it is
                status: int or string : the status int

            RETURNS: An integer -- the count of votes
        """

        field = "subject_id"
        if vote_type == Vote.USER and (status == Vote.FOLLOWED or status == Vote.TOPFRIEND):
            if not following_me:
                field = "user_id"

        kw = {
            field       : user_id,
            'vote_type' : vote_type,
            'status'    : status
        }
        return Vote.by_kwargs(**kw).count()

    @staticmethod
    def is_following(user_id, user_to_get_id):
        vote = VoteManager.get_vote(user_id, user_to_get_id, Vote.USER)
        return True if getattr(vote, 'vote_type', None) == Vote.USER and getattr(vote, 'status', None) in [Vote.FOLLOWED,Vote.TOPFRIEND] else False

    @staticmethod
    def is_followed_by(user_id, user_to_get_id):
        vote = VoteManager.get_vote(user_to_get_id,user_id, Vote.USER)
        return True if getattr(vote, 'vote_type', None) == Vote.USER and getattr(vote, 'status', None) in [Vote.FOLLOWED,Vote.TOPFRIEND] else False

    @staticmethod
    def is_blocked_by(user_id, user_to_get_id):
        vote = VoteManager.get_vote(user_to_get_id,user_id, Vote.USER)
        return True if getattr(vote, 'vote_type', None) == Vote.USER and getattr(vote, 'status', None) == Vote.BLOCKED else False

    @staticmethod
    def is_blocking(user_id, user_to_get_id):
        vote = VoteManager.get_vote(user_id, user_to_get_id, Vote.USER)
        return True if getattr(vote, 'vote_type', None) == Vote.USER and getattr(vote, 'status', None) == Vote.BLOCKED else False

    @staticmethod
    def get_follower_count(user_id):
        return Vote.query.filter(Vote.subject_id == user_id).filter(or_(Vote.status == Vote.FOLLOWED,Vote.status == Vote.TOPFRIEND)).count()

    @staticmethod
    def get_following_count(user_id):
        return Vote.query.filter(Vote.user_id == user_id).filter(or_(Vote.status == Vote.FOLLOWED,Vote.status == Vote.TOPFRIEND)).count()

    @staticmethod
    def get_all_followers(user_id):
        return Vote.query.filter(Vote.subject_id == user_id).filter(or_(Vote.status == Vote.FOLLOWED,Vote.status == Vote.TOPFRIEND)).all()

    @staticmethod
    def get_all_following(user_id):
        return Vote.query.filter(Vote.user_id == user_id).filter(or_(Vote.status == Vote.FOLLOWED,Vote.status == Vote.TOPFRIEND)).all()
