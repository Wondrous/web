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
    PostManager,
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
    @view_config(renderer='/index.jinja2', route_name='index_handler')
    @view_config(renderer='/index.jinja2', route_name='index_handler1')
    @view_config(renderer='/index.jinja2', route_name='index_handler2')
    @view_config(renderer='/index.jinja2', route_name='index_handler3')
    def index(self):

        """
            PURPOSE: This method handles the index page for users who are
            logged in AND logged out.
        """

        base_url = 'http://mojorankdev.s3.amazonaws.com/'
        req_md   = self.request.matchdict
        retval   = {'page_title': None, 'page_url': None, 'page_content': None, 'page_image': None, 'social_page': True}
        
        if 'cat' in req_md.keys() and 'post_id' in req_md.keys():
            # see if it is post
            retval['social_page'] = req_md['cat'].lower()=='post'
            try:
                post_id = int(req_md['post_id'])
                post_json = PostManager.get_by_id_json(post_id)
                if 'error' in post_json.keys():
                    retval['social_page'] = False
                else:
                    retval['page_title']   = post_json['subject']
                    retval['page_url']     = "https://wondrous.co/post/{0}".format(post_json['id'])
                    retval['page_content'] = post_json['text']
                    retval['page_image']   = base_url + post_json['ouuid']+'-med'

            except Exception, e:
                retval['social_page'] = False

        elif ('cat' in req_md.keys() and
              req_md['cat'] not in ['favicon.ico','signup','login','settings','ws']):
            # is an user
            username  = req_md['cat']
            user_json = AccountManager.get_json_by_username(username=username)

            if 'error' in user_json.keys():
                retval['social_page'] = False
            elif user_json['is_private']:
                retval['page_title']   = "{0} @{1}".format(user_json['name'],user_json['username'])
                retval['page_url']     = "https://wondrous.co/{0}".format(user_json['username'])
                retval['page_content'] = "This profile is private"
                retval['page_image']   = "https://s3-us-west-2.amazonaws.com/wondrousstatic/pictures/defaults/p.default-profile-picture.jpg"
            else:
                retval['page_title']   = "{0} @{1}".format(user_json['name'],user_json['username'])
                retval['page_url']     = "https://wondrous.co/{0}".format(user_json['username'])
                retval['page_content'] = user_json['description']
                retval['page_image']   = base_url + user_json['ouuid']+'-dim150x150'

        else:
            retval['social_page'] = False


        return retval


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
