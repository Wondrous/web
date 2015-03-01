#!/usr/bin/env python
# -*- coding: utf-8 -*-

#
# Company: WONDROUS
# Created by: John Zimmerman
#
# USER_UTILITIES.PY
#

from pyramid.security import unauthenticated_userid

from wondrous.models.admin import AdminManager
from wondrous.models.feed import Feed
from wondrous.models.user import User

from sqlalchemy.orm import joinedload

class AuthHelper(object):

    """ Various methods to help with Authenticating a user """

    @staticmethod
    def check_login(request):

        """
            PURPOSE: Check that the user is logged in correctly

            USE: username parameter defaults to None.
            We can check against a given username.

            RETURNS: A boolean True, if valid; False, if not valid
        """

        # request.person is a product of the get_user method below
        return True if request.person else False

    @staticmethod
    def get_user(request):

        """
            PURPOSE: To create a global user object.

            USE: Provide as:

                config.add_request_method(AuthHelper.get_user, 'user', reify=True)

            *** Do not use this method directly ***
            Use: request.person<.db-row (eg. username)> instead.

            RETURNS: A user object if user exists;
                     None if one does not exist
        """

        user_id = unauthenticated_userid(request)
        return User.query.get(user_id) if user_id else None

    @staticmethod
    def get_admin(request):

        """
            PURPOSE: To create a global admin object.

            USE: Provide as:

                config.add_request_method(AuthHelper.get_admin, 'admin', reify=True)

            *** Do not use this method directly ***
            Use: request.admin<.db-row (eg. username)> instead.

            RETURNS: An admin object if admin exists;
                     None if one does not exist
        """

        admin_id = unauthenticated_userid(request)
        return AdminManager.get(admin_id) if admin_id else None
