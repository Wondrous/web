#!/usr/bin/env python
# -*- coding: utf-8 -*-

#
# Company: WONDROUS
# Created by: John Zimmerman
#
# DELETE_UTILITIES.PY
#

from wondrous.models.comment import Comment
from wondrous.models.object import Object
from wondrous.models.user import User
from wondrous.models.vote import Vote

class DisableUser(object):

    """
        1. Remove profile from view
        <Keep votes on objects in place to retain ranking>
        2. "Remove" up and down votes on users
        (Consequently, this removes the "upvoted by")

        Call like this:
        d = DisableUser(user_id)
        d.disable()
    """

    def __init__(self, user_id):
        self.user_obj = User.by_id(user_id)

    def disable(self):

        """
            1. Transfer the user to disabled_users table
            2. If successful, remove user-votes and return True
               Otherwise, do nothing and return False
        """

        deletion_successful = self.__disable_user()

        if deletion_successful:
            self.__remove_user_votes()
            self.__remove_user_objects()
            self.__remove_user_comments()

        return deletion_successful

    def __disable_user(self):

        """
            PURPOSE: (Soft) delete a user and record this deletion

            USE: NEVER CALL BY ITSELF. Always call within the disable() method

            NOTE:
                1. Set User.active = False
                2. Verify user deletion and return a boolean
                indicating the success of said deletion

                If step #1 fails, un-delete the row from disabled_users table and return False
                Otherwise, return True

            PARAMS: None

            RETURNS: A boolean, True if delete successful
                                False if delete not successful
        """

        # Step 1
        User._soft_delete(self.user_obj.id)

        # Step 2
        deleted_user = User.by_kwargs(user_id=self.user_obj.id, is_active=False)

        return True if deleted_user else False

    def __remove_user_votes(self):

        """
            PURPOSE: To remove all of a disabled user's votes

            USE: NEVER CALL BY ITSELF. Always call within the disable() method

            PARAMS: (None)

            RETURNS: (None)
        """

        deleted_user_id = self.user_obj.id
        all_following   = UserVote.query.filter(UserVote.user_id == deleted_user_id).all()
        all_followed_by = UserVote.query.filter(UserVote.voted_on_id == deleted_user_id).all()

        if all_following:
            for vote in all_following:
                vote.active = False

        if all_followed_by:
            for vote in all_followed_by:
                vote.active = False

    def __remove_user_objects(self):

        """
            PURPOSE: To deactivate (i.e., remove) all of
            a disabled user's posted objects

            USE: NEVER CALL BY ITSELF. Always call within the disable() method

            PARAMS: (None)

            RETURNS: (None)
        """

        deleted_user_id = self.user_obj.id
        all_user_objects = Object.get_all_objects_for_user(deleted_user_id)
        for obj in all_user_objects:
            obj.active = False

    def __remove_user_comments(self):

        """
            PURPOSE: To deactivate (i.e., remove) all of
            a disabled user's posted comments

            USE: NEVER CALL BY ITSELF. Always call within the disable() method

            PARAMS: (None)

            RETURNS: (None)
        """

        deleted_user_id = self.user_obj.id
        all_user_comments = Comment.get_all_comments_for_user(deleted_user_id)
        for oc in all_user_comments:
            oc.active = False


class EnableUser(object):

    """
        1. Adds profile to view
        2. Activates up and down votes on users
        (Consequently, this adds the "upvoted by")

        Call like this in ***Models.User.add_user()***:
        e = EnableUser(<user_id_required>)
        e.enable()
    """

    def __init__(self, user_id):
        self.user_obj = User.by_kwargs(user_id=user_id, is_active=False)

    def enable(self):

        """
            1. ADD USER FROM LOGIN
            2. If successful, add user-votes and return True
               Otherwise, do nothing and return False
        """

        enable_successful = self.__enable_user()

        if enable_successful:
            self.__add_user_objects()
            self.__add_user_votes()
            self.__add_user_comments()

        return enable_successful

    def __enable_user(self):

        """
            PURPOSE: un-delete a previously (soft) deleted user

            USE: NEVER CALL BY ITSELF. Always call within the enable() method

            NOTE:
                1. Set User.active = True
                3. Verify user un-deletion

            PARAMS: (None)

            RETURNS: A boolean, True if delete successful
                                False if delete not successful
        """

        # Step 1
        User._undelete(self.user_obj.id)

        # Step 2
        activated_user = User.by_id(self.user_obj.id)

        return True if activated_user else False

    def __add_user_votes(self):

        """
            PURPOSE: To add back all of a re-enabled user's votes

            USE: NEVER CALL BY ITSELF. Always call within the enable() method

            PARAMS: (None)

            RETURNS: (None)
        """

        enabled_user    = self.user_obj.id
        all_following   = UserVote.query.filter(UserVote.user_id == enabled_user).all()
        all_followed_by = UserVote.query.filter(UserVote.voted_on_id == enabled_user).all()

        if all_following:
            for vote in all_following:
                vote.active = True

        if all_followed_by:
            for vote in all_followed_by:
                vote.active = True

    def __add_user_objects(self):

        """
            PURPOSE: To re-activate (i.e., add back) all of
            a re-enabled user's posted objects

            USE: NEVER CALL BY ITSELF. Always call within the enable() method

            PARAMS: (None)

            RETURNS: (None)
        """

        enabled_user = self.user_obj.id
        all_user_objects = Object.get_all_objects_for_user(enabled_user)
        for obj in all_user_objects:
            obj.active = True

    def __add_user_comments(self):

        """
            PURPOSE: To re-activate (i.e., add back) all of
            a re-enabled user's posted comments

            USE: NEVER CALL BY ITSELF. Always call within the enable() method

            PARAMS: (None)

            RETURNS: (None)
        """

        enabled_user = self.user_obj.id
        all_user_comments = Comment.get_all_comments_for_user(enabled_user)
        for oc in all_user_comments:
            oc.active = True
