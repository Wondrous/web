#!/usr/bin/env python
# -*- coding: utf-8 -*-

#
# Company: WONDROUS
# Created by: Ziyuan Liu
#
# controllers/votemanager.PY
#

from wondrous.models import (
    Vote,
    User,
    Notification,
    DBSession,
)

from wondrous.controllers.notificationmanager import NotificationManager
from sqlalchemy import or_
from wondrous.controllers.basemanager import BaseManager

class VoteManager(BaseManager):
    @classmethod
    def _follow_user(cls,voter_id,valid_user,status):
        # If you want to follow, check if valid user is private, if so, put it as pending
        if status in [Vote.FOLLOW,Vote.TOPFRIEND]:
            if valid_user.is_private:
                vote = VoteManager.vote(voter_id,valid_user.id,Vote.USER,Vote.PENDING)
                reason = Notification.FOLLOW_REQUEST

            else:
                vote = VoteManager.vote(voter_id,valid_user.id,Vote.USER,status)
                reason = Notification.FOLLOWED

            new_notification = NotificationManager.add(from_user_id=voter_id,to_user_id=valid_user.id,subject_id=voter_id,reason=reason)
            if new_notification:
                DBSession.add(new_notification)
            return vote

        return None

    @classmethod
    def accept_request(cls,user_id,voter_id):
        existing_vote = Vote.by_kwargs(subject_id=user_id, user_id=voter_id, vote_type=Vote.USER, status=Vote.PENDING).first()
        if existing_vote:
            existing_vote.status = Vote.FOLLOW
            reason = Notification.FOLLOW_ACCEPTED
            new_notification = NotificationManager.add(from_user_id=user_id,to_user_id=voter_id,subject_id=user_id,reason=reason)
            if new_notification:
                DBSession.add(new_notification)

            return True
        return False

    @classmethod
    def vote_on_user(cls,voter_id,user_id,status):
        if VoteManager.is_blocked_by(voter_id,user_id):
            # You've been blocked
            logging.info("you have been blocked")
            return False

        valid_user = User.by_id(user_id)
        if valid_user and user_id != voter_id and status:
            existing_vote = VoteManager.get_vote(voter_id, user_id, Vote.USER)  # This is the vote_object, not a boolean

            if existing_vote:

                if existing_vote.status == Vote.BLOCK and status != Vote.BLOCK:
                    # You blocked the other user, but now you want to unblock!
                    logging.info("you unblocked someone and performed another action")

                    vote = VoteManager.vote(voter_id,user_id, Vote.USER, status)
                    return False

                elif existing_vote.status==Vote.PENDING and status in [Vote.UNFOLLOW, Vote.BLOCK]:
                    # Take back your request, you can either cancel or block
                    # DELETE Notification
                    NotificationManager.delete(from_user_id = voter_id, to_user_id = user_id, \
                        reason = Notification.FOLLOW_REQUEST, subject_id = voter_id)

                elif cls._follow_user(voter_id,valid_user,status):
                    return True

                existing_vote.status = status
            else:
                # If you want to follow, check if valid user is private, if so, put it as pending
                if cls._follow_user(voter_id,valid_user,status):
                    return True

                else:
                    # Other ops
                    vote = VoteManager.vote(voter_id,user_id, Vote.USER, status)
                    return False

        return False

    @staticmethod
    def vote(user_id,subject_id, vote_type, status):
        vote = VoteManager.get_vote(user_id=user_id,subject_id=subject_id,vote_type=vote_type)
        if vote:
            # already created / just changing
            vote.status = status
        else:
            vote = Vote(user_id=user_id,subject_id=subject_id,vote_type=vote_type,status=status)
        DBSession.add(vote)
        return vote


    @staticmethod
    def validate_vote_args(vote_type=None,status=None):
        retval = vote_type or status
        if vote_type:
            retval = retval and vote_type in [Vote.USER, Vote.OBJECT]

        if status:
            retval = retval and status in \
                [Vote.UNLIKED, Vote.LIKE, Vote.BOOKMARKED, Vote.BLOCK, \
                Vote.PENDING, Vote.UNFOLLOW, Vote.FOLLOW, Vote.TOPFRIEN]
        return retval

    @staticmethod
    def get_vote(user_id, subject_id, vote_type):
        """
            Return whether or not a user has voted on a particular object

        """
        vote = Vote.by_kwargs(user_id=user_id,subject_id=subject_id,vote_type=vote_type).first()
        return vote if vote else None


    @classmethod
    def get_like_count(cls,subject_id):
        return cls.get_count_by_type(subject_id,Vote.OBJECT,Vote.LIKE)

    @classmethod
    def get_liked_objects_for_user(cls,user_id):
        return Vote.by_kwargs(user_id=user_id,vote_type=Vote.OBJECT,status=Vote.LIKE)

    @staticmethod
    def get_count_by_type(user_id,vote_type,status, following_me=True):
        """
            PURPOSE: get the number of votes based on spec

            USE: Vote.get_count_by_type(<id>,<int>,<)

            PARAMS: 4 params
                user_id: int : the id of the user or subject
                vote_type: int : the type of the vote it is
                status: int or string : the status int

            RETURNS: (None)

        """
        field = "subject_id"
        if vote_type == Vote.USER and (status==Vote.FOLLOW or status==Vote.TOPFRIEND):
            if not following_me:
                field = "user_id"

        kw = {
            field:user_id,
            'vote_type':vote_type,
            'status':status,
        }
        return Vote.by_kwargs(**kw).count()

    @staticmethod
    def is_following(user_id,user_to_get_id):
        vote = VoteManager.get_vote(user_id, user_to_get_id,Vote.USER)
        return True if getattr(vote, 'vote_type', None)==Vote.USER and getattr(vote, 'status', None) in [Vote.FOLLOW,Vote.TOPFRIEND] else False

    @staticmethod
    def is_followed_by(user_id,user_to_get_id):
        vote = VoteManager.get_vote(user_to_get_id,user_id,Vote.USER)
        return True if getattr(vote, 'vote_type', None)==Vote.USER and getattr(vote, 'status', None) in [Vote.FOLLOW,Vote.TOPFRIEND] else False

    @staticmethod
    def is_blocked_by(user_id,user_to_get_id):
        vote = VoteManager.get_vote(user_to_get_id,user_id,Vote.USER)
        return True if getattr(vote, 'vote_type', None)==Vote.USER and getattr(vote, 'status', None)==Vote.BLOCK else False

    @staticmethod
    def is_blocking(user_id,user_to_get_id):
        vote = VoteManager.get_vote(user_id, user_to_get_id,Vote.USER)
        return True if getattr(vote, 'vote_type', None)==Vote.USER and getattr(vote, 'status', None)==Vote.BLOCK else False

    @staticmethod
    def get_follower_count(user_id):
        return Vote.query.filter(Vote.subject_id==user_id).filter(or_(Vote.status==Vote.FOLLOW,Vote.status==Vote.TOPFRIEND)).count()

    @staticmethod
    def get_following_count(user_id):
        return Vote.query.filter(Vote.user_id==user_id).filter(or_(Vote.status==Vote.FOLLOW,Vote.status==Vote.TOPFRIEND)).count()

    @staticmethod
    def get_all_followers(user_id):
        return Vote.query.filter(Vote.subject_id==user_id).filter(or_(Vote.status==Vote.FOLLOW,Vote.status==Vote.TOPFRIEND)).all()

    @staticmethod
    def get_all_following(user_id):
        return Vote.query.filter(Vote.user_id==user_id).filter(or_(Vote.status==Vote.FOLLOW,Vote.status==Vote.TOPFRIEND)).all()
