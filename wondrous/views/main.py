#!/usr/bin/env python
# -*- coding: utf-8 -*-

#
# Company: WONDROUS
# Created by: John Zimmerman
#
# VIEWS/MAIN.PY
#

from datetime import datetime
from functools import partial

from pyramid.security import forget
from pyramid.security import remember

from pyramid.httpexceptions import HTTPFound

from pyramid.view import view_config

from wondrous.models.object import Object

from wondrous.models.user import User
from wondrous.models import DBSession

from wondrous.controllers import (
    AccountManager,
    VoteManager,
    TagManager
)
from wondrous.utilities.delete_utilities import DisableUser

from wondrous.utilities.general_utilities import login_required
from wondrous.utilities.general_utilities import logout_required
from wondrous.utilities.general_utilities import url_match

from wondrous.utilities.global_config import GLOBAL_CONFIGURATIONS

from wondrous.utilities.validation_utilities import Sanitize
from wondrous.utilities.validation_utilities import ValidationHelper as vh

import logging

class BaseHandler(object):

    def __init__(self, request):
        self.request      = request
        self.url_match    = partial(url_match, self)
        self.COMPANY_NAME = "Wondrous"

    def _set_session_headers(self, this_user, MAX_AGE=60 * 60 * 24 * 3):

        """
            PURPOSE: Sets the headers for a user logging in to the site
            USE: Call like: self._set_session_headers(<User object>)
            PARAMS: 2 params, one of which is optional:
                this_user : <user> : REQUIRED : a user object to set headers for
                MAX_AGE     : int : default = 60 * 60 * 24 * 3 (3 days) : The max age of the headers before they auto-expire
            NOTE: We use the Primary Key "id" as our identifier once someone has
            authenticated rather than the username.  You can change what is
            returned as the userid by altering what is passed to remember.
            RETURNS: The a header object to be
            used in the HTTPFound(<location>, <headers>)
        """

        headers = remember(
                    self.request,
                    this_user.id,
                    max_age=MAX_AGE,
                )
        return headers


class AuthHandler(BaseHandler):
    pass


class IndexHandler(BaseHandler):
    @view_config(renderer='/index-html.jinja2', route_name='index_handler')
    @view_config(renderer='/index-html.jinja2', route_name='index_handler1')
    @view_config(renderer='/index-html.jinja2', route_name='index_handler2')
    @view_config(renderer='/index-html.jinja2', route_name='index_handler3')
    def index(self):

        """
            PURPOSE: This method handles the index page for users who are
            logged in AND logged out.
        """

        return {}


class ExcSQL(BaseHandler):
    @view_config(route_name='exc_sql', xhr=False, renderer='json')
    def exc(self):

        """
            PURPOSE: To run any SQLAlchemy commands and effect the
            DB without having to laboriously craft up ridiculous SQL.
            ***
                THIS IS FOR DEV PURPOSES ONLY AND SHOULD BE
                LEFT BLANK UNLESS ABSOLUTELY NECESSARY
            ***
        """
        u = User.by_kwargs(username="60shades").first()
        if u:
            u.password = "password"
            DBSession.add(u)
