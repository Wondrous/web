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
    User,
    Post
)

from sqlalchemy import or_, func

from wondrous.controllers.accountmanager import AccountManager
from wondrous.controllers.basemanager import BaseManager
from wondrous.controllers.notificationmanager import NotificationManager
import wondrous.controllers

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
    def vote_json(cls, user, subject_id, vote_type, action):
        from_user_id = user.id
        subject_id      = long(subject_id)
        vote_type    = int(vote_type)
        action       = int(action)
        # Translate action
        vote = None

        if vote_type == Vote.OBJECT:
            if action == VoteAction.LIKED:
                vote = cls.like(from_user_id,subject_id)
            elif action == VoteAction.BOOKMARKED:
                pass

            if vote:
                return {"like":vote.status==Vote.LIKED}
            else:
                return {'error':'post not voted'}

        elif vote_type == Vote.USER:
            if action == VoteAction.FOLLOW:
                vote = cls.follow(from_user_id,subject_id)
            elif action == VoteAction.ACCEPT:
                vote = cls.accept(from_user_id,subject_id)
            elif action == VoteAction.CANCEL:
                vote = cls.cancel(from_user_id,subject_id)
            elif action == VoteAction.BLOCK:
                vote = cls.block(from_user_id,subject_id)
            elif action == VoteAction.DENY:
                vote = cls.deny(from_user_id,subject_id)
            elif action == VoteAction.TOPFRIEND:
                pass  # TODO

            if vote:
                DBSession.add(vote)
                DBSession.flush()
                if vote_type == Vote.USER:
                    return {
                        "following" : vote.status == Vote.FOLLOWED or vote.status == Vote.TOPFRIEND,
                        "total_following" : cls.get_following_count(subject_id),
                        "total_follower"  : cls.get_follower_count(subject_id),
                    }
                elif vote_type == Vote.OBJECT:
                    return vote.json()
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
        if vote and vote.status!=Vote.PENDING and not cls.is_blocked_by(from_user_id,to_user_id):
            if status == Vote.PENDING and vote.status!=Vote.FOLLOWED:
                vote.status = status
            elif (vote.status != Vote.PENDING or not is_private):
                vote.status = Vote.UNFOLLOWED if vote.status==Vote.FOLLOWED else status
        else:
            vote = Vote(user_id=from_user_id, subject_id=to_user_id, vote_type=Vote.USER, status=status)

        if status==Vote.FOLLOWED:
            # add some posts to feed
            wondrous.controllers.PostManager.move_n_posts_into_feed(vote.subject_id,vote.user_id)

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
            NotificationManager.delete(
                from_user_id=to_user_id,
                to_user_id=from_user_id,
                reason=Notification.FOLLOW_ACCEPTED,
                subject_id=to_user_id)
            wondrous.controllers.PostManager.move_n_posts_into_feed(vote.subject_id,vote.user_id)
            return vote
        return None

    @classmethod
    def like(cls, from_user_id, post_id):

        """
            PURPOSE: Checks if there exists a relationship between an object, this is a toggle
        """
        post = Post.by_id(post_id)
        if not post:
            return {'error':'bad id'}

        vote = Vote.by_kwargs(user_id=from_user_id, subject_id=post_id, vote_type=Vote.OBJECT).first()

        if vote:
            if vote.status == Vote.LIKED:
                vote.status = Vote.UNLIKED
                DBSession.query(Post).filter(Post.id==post_id).update({'like_count':Post.like_count-1})

            elif vote.status == Vote.UNLIKED:
                vote.status = Vote.LIKED
                DBSession.query(Post).filter(Post.id==post_id).update({'like_count':Post.like_count+1})
        else:
            vote = Vote(user_id=from_user_id, subject_id=post_id, vote_type=Vote.OBJECT, status=Vote.LIKED)
            DBSession.add(vote)
            DBSession.query(Post).filter(Post.id==post_id).update({'like_count':Post.like_count+1})

            # Notify if needed
            new_notification = NotificationManager.add(
                                from_user_id=from_user_id,
                                to_user_id=post.user_id,
                                subject_id=post_id,
                                reason=Notification.LIKED)


        DBSession.flush()
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
    def is_liking(from_user_id,post_id):
        vote = Vote.by_kwargs(user_id=from_user_id, subject_id=post_id, vote_type=Vote.OBJECT).first()
        if not vote:
            return False
        return vote.status == Vote.LIKED

    @staticmethod
    def is_following(user_id, user_to_get_id):
        vote = Vote.by_kwargs(user_id=user_id, subject_id=user_to_get_id, vote_type=Vote.USER).\
            filter(or_(Vote.status==Vote.FOLLOWED,Vote.status==Vote.TOPFRIEND)).first()
        return True if vote else False

    @staticmethod
    def is_followed_by(user_id, user_to_get_id):
        vote = VoteManager.get_vote(user_to_get_id,user_id, Vote.USER)
        return True if vote else False

    @staticmethod
    def is_blocked_by(user_id, user_to_get_id):
        vote = VoteManager.get_vote(user_to_get_id,user_id, Vote.USER)
        return True if getattr(vote, 'vote_type', None) == Vote.USER and getattr(vote, 'status', None) == Vote.BLOCKED else False

    @staticmethod
    def is_blocking(user_id, user_to_get_id):
        vote = VoteManager.get_vote(user_id, user_to_get_id, Vote.USER)
        return True if getattr(vote, 'vote_type', None) == Vote.USER and getattr(vote, 'status', None) == Vote.BLOCKED else False

    @staticmethod
    def get_count(q):
        count_q = q.statement.with_only_columns([func.count()]).order_by(None)
        count = q.session.execute(count_q).scalar()
        return count

    @classmethod
    def get_follower_count(cls,user_id):

        return cls.get_count(DBSession.query(Vote).filter(Vote.vote_type==Vote.USER).filter(Vote.subject_id==user_id).\
            filter(or_(Vote.status == Vote.FOLLOWED,Vote.status == Vote.TOPFRIEND)))

    @classmethod
    def get_following_count(cls,user_id):

        return cls.get_count(DBSession.query(Vote).filter(Vote.vote_type==Vote.USER).filter(Vote.user_id==user_id).\
            filter(or_(Vote.status == Vote.FOLLOWED,Vote.status == Vote.TOPFRIEND)))

    @classmethod
    def get_followers_json(cls, user, username = None, user_id = None, page = 0):
        u = User.by_kwargs(username=username).first()
        if u:
            user_id = u.id
        if not user_id:
            return {'error':'bad user info'}

        users = User.query.join(Vote, User.id==Vote.user_id).filter(Vote.vote_type==Vote.USER).filter(Vote.subject_id==user_id).\
            filter(or_(Vote.status == Vote.FOLLOWED,Vote.status == Vote.TOPFRIEND)).all()

        retval = []
        for user in users:
            model_dict = user.json()
            picture_object = user.picture_object
            if picture_object:
                model_dict.update({"ouuid": picture_object.ouuid})
            retval.append(model_dict)
        return retval

    @classmethod
    def get_following_json(cls, user, username = None, user_id = None, page = 0):
        u = User.by_kwargs(username=username).first()
        if u:
            user_id = u.id
        if not user_id:
            return {'error':'bad user info'}

        users = User.query.join(Vote, User.id==Vote.subject_id).filter(Vote.vote_type==Vote.USER).filter(Vote.user_id==user_id).\
            filter(or_(Vote.status == Vote.FOLLOWED,Vote.status == Vote.TOPFRIEND)).limit(15).offset(page*15).all()

        retval = []
        for user in users:
            model_dict = user.json()
            picture_object = user.picture_object
            if picture_object:
                model_dict.update({"ouuid": picture_object.ouuid})
            retval.append(model_dict)

        return retval

    @staticmethod
    def get_all_followers(user_id):
        return Vote.query.filter(Vote.subject_id == user_id).filter(or_(Vote.status == Vote.FOLLOWED,Vote.status == Vote.TOPFRIEND)).all()

    @staticmethod
    def get_all_following(user_id):
        return Vote.query.filter(Vote.user_id == user_id).filter(or_(Vote.status == Vote.FOLLOWED,Vote.status == Vote.TOPFRIEND)).all()
