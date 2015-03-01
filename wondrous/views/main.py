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
from wondrous.models.user import BlockedUser

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

    @logout_required
    @view_config(renderer='index-html.jinja2', route_name='login_handler')
    def login(self):

        """
            PURPOSE: This method handles the login process for all users
        """

        safe_in  = Sanitize.safe_input
        safe_out = Sanitize.safe_output
        p        = self.request.POST

        error_message = None
        credential    = None
        password      = None

        if 'login_button' in p:
            credential = safe_in(p.get('user_identification'))
            password   = safe_in(p.get('password'), strip=False)

            if credential:
                credential = credential.lower()

            if Sanitize.is_valid_email(credential):
                this_user = User.by_kwargs(email=credential).first()
            else:
                this_user = User.by_kwargs(username=credential).first()

            if this_user and this_user.validate_password(password) and not this_user.is_banned:

                # Reactivating a user when they log in
                # TODO -- this needs to be more 'offical'
                headers = self._set_session_headers(this_user)
                this_user.last_login = datetime.now()
                return HTTPFound(location="/", headers=headers)

            elif this_user and this_user.is_banned:
                return HTTPFound("/auth/is_banned/{uid}/".format(uid=this_user.id))

            # At this point, the login has totally
            # failed. We can safely disarm the
            # object and return appropriate error messages
            this_user = None
            if not this_user:
                error_message = "Invalid email/username or password"

        data = {
            'error_message'       : error_message,
            'user_identification' : safe_out(credential),
        }
        return data

    @logout_required
    @view_config(renderer='/auth/is_banned.jinja2', route_name='auth_is_banned_handler')
    def is_banned(self):

        """
            PURPOSE: This method handles the is_banned view for
            those unfortunate souls who seriously abuse the system.
        """

        user_id   = self.url_match(url_match='user_id', arg_type="int")
        if user_id:

            # Get the user and check if they're banned from the site
            # if they attempt to access this view
            this_user = User.get(user_id, is_active=False)
            if this_user and this_user.is_banned:

                # Show the page (note that the
                # page requires no data)
                return {}

        # Otherwise, the user is not banned
        # Or, the user_id could potentially have been invalid
        return HTTPFound("/")

    @login_required
    @view_config(renderer='json', route_name='auth_logout_handler')
    def logout(self):

        """
            PURPOSE: This method handles the logout process for all users
        """

        this_user = self.request.user  # The logged-in user
        this_user.last_logout = datetime.now()

        headers = forget(self.request)

        # After every call, we redirect back to index
        return HTTPFound(location="/", headers=headers)

    @login_required
    @view_config(renderer='json', route_name='auth_delete_handler')
    def delete(self):

        """
            PURPOSE: This method handles the SOFT delete process for
            all users should they desire to deactivate their accounts
        """

        secret_number = self.request.POST.get('secret_number')
        bot_detected = self.request.POST.get('off-screen-bot-fucker')
        user_id = self.request.user.id

        # bot_detected is a parameter that when filled in, indicates that
        # the disabling process was performed by 1) a bot who automatically
        # filled in all the form fields, or 2) a total jackass hacker.
        if not bot_detected:

            if secret_number == "666" and user_id:
                d = DisableUser(user_id)
                disable_successful = d.disable()

                if disable_successful:
                    # On a successful disabling, we always finish we a logout
                    return HTTPFound(location="/auth/logout/")

        # If something goes wrong, redirect back to index...
        return HTTPFound(location="/")

    @logout_required
    @view_config(renderer='/auth/waitlist.jinja2', route_name='auth_waitlist')
    def waitlist(self):

        """
            TODO
        """

        safe_in = Sanitize.safe_input
        email = safe_in(self.request.POST.get('email'))
        action = safe_in(self.url_match(url_match='action'))
        success_message = None
        error_message   = None

        if action == "success":

            success_message = """
                You've been added to the waiting list and will
                be notified when you are invited to join {cn}.
                Thanks for your interest!
            """.format(cn=self.COMPANY_NAME)

        elif action == "add":

            valid_email, error_message = UnverifiedEmailManager.validate(email)
            if not error_message:

                email_obj = UnverifiedEmailManager.get(valid_email)
                if email_obj:
                    return HTTPFound("/auth/waitlist/success/")
                else:
                    error_message = "There was an unexpected problem. Sorry :("

        else:
            return HTTPFound("/")

        data = {
            'success_message' : success_message,
            'error_message'   : error_message,
        }
        return data

    @logout_required
    @view_config(renderer='/index-html.jinja2',route_name='auth_signup_handler')
    def signup(self):

        """
            PURPOSE: This method handles the signup process for all new users
        """

        safe_in  = Sanitize.safe_input
        p = self.request.params

        # Some helpful constants
        PERSON = 1
        # SIGNUP_ROUTE = "/signup/step/1/"

        # The data we need to validate
        error_message = None
        name = safe_in(p.get('name'))
        email      = safe_in(p.get('email'))
        password   = safe_in(p.get('password'), strip=False)
        username   = safe_in(Sanitize.strip_ampersand(p.get('username')))
        if 'signup_button' in p:

            # Check for presence
            if not name:
                error_message = "Please enter your  name."
            elif not email:
                error_message = "Please enter your email."
            elif not password:
                error_message = "Please enter a password."
            elif not username:
                error_message = "Please enter a username."

            if not error_message:

                _s_valid_fn, len_err_fn = Sanitize.length_check(name, min_length=1, max_length=30)
                _s_valid_pw, len_err_pw = Sanitize.length_check(password, min_length=6, max_length=255)
                _s_valid_em = Sanitize.is_valid_email(email)
                _s_em_taken = User.by_kwargs(email=email).first()
                _s_valid_un = Sanitize.is_valid_username(username.lower())
                _s_un_taken = User.by_kwargs(username=username).first()

                # Check for validity
                if not _s_valid_fn:
                    error_message = "Your first name is {err}".format(err=len_err_fn)
                elif not _s_valid_ln:
                    error_message = "Your last name is {err}".format(err=len_err_ln)
                elif not _s_valid_em:
                    error_message = "Please enter a valid email address"
                elif _s_em_taken:
                    error_message = "This email has already been used to sign up. Please use a different one."
                elif not _s_valid_pw:
                    error_message = "Your password is {err}".format(err=len_err_pw)
                elif not _s_valid_un:
                    error_message = "Invalid username! Use only alphanumerics, and it cannot be all numbers"
                elif _s_un_taken:
                    error_message = "This username has already been taken. Please use a different one."

            if not error_message:

                new_user = AccountManager.add(
                                name,
                                email,
                                username,
                                password
                            )
                headers = self._set_session_headers(new_user)
                new_user.last_login = datetime.now()
                logging.warn("registered")
                return HTTPFound(location="/", headers = headers)
            else:

                data = {
                    'error_message' : error_message,
                }
                logging.warn(data)
                return HTTPFound(location="/")
        else:
            logging.warn(" not found")
            data = {}

        return HTTPFound(location="/")

    # @login_required
    # @view_config(route_name='auth_signup_step_handler', renderer='json')
    # def signup_step(self):
    #
    #     """
    #         PURPOSE: This method handles the next steps in the signup process.
    #         It pushes a user through a sequence of LAST_STEP number of steps
    #         in order to fully complete a new user's sign up process
    #     """
    #
    #     # Update step every time you go to a new level
    #     url_step_num = self.url_match(url_match='step_num', arg_type="int")
    #     this_person = self.request.user
    #
    #     current_step = this_person.signup_step_num
    #     next_step = current_step + 1
    #     LAST_STEP = 4  # 4 steps in total
    #
    #     # If we're not in the signup sequence
    #     if url_step_num not in [current_step, current_step+1]:
    #         return HTTPFound(location="/signup/step/{step}/".format(step=current_step))
    #
    #     # If we're in the sequence, but we're advanced past last step
    #     elif url_step_num == LAST_STEP+1:
    #         this_person.signup_step_num += 1  # They've advanced 1 step
    #         return HTTPFound(location="/")
    #
    #     # We've completed the full set of steps, so redirect
    #     # user back to index
    #     elif url_step_num > LAST_STEP + 1:
    #         return HTTPFound(location="/")
    #
    #     # We're at the step we should be at...
    #     elif url_step_num == current_step:
    #         pass # No need to update step num
    #
    #     # Advance the step as long as we're not
    #     # advancing it past the max step number!
    #     elif this_person.signup_step_num < LAST_STEP:
    #         this_person.signup_step_num += 1  # They've advanced 1 step
    #         current_step = this_person.signup_step_num
    #         next_step = current_step + 1
    #
    #     data = {
    #         'current_step' : current_step,
    #         'next_step'    : next_step,
    #         'total_steps'  : LAST_STEP,
    #     }
    #     return data

    @logout_required
    @view_config(renderer='/auth/verify_signup.jinja2', route_name='auth_verify_handler')
    def verify(self):

        """
            TODO
        """

        safe_in = Sanitize.safe_input
        code = safe_in(self.url_match(url_match='code'))
        error_message = None

        # Get both/either the active=True or active=False
        # For this page it doesn't matter becasue as soon as the
        # first person actually signs up with the given code, the
        # unverified_email row is deleted. This will allow a user
        # trying to sign up to have multiple attempts at a form submission
        # on the same link.
        email_obj_active   = UnverifiedEmailManager.get(code=code)
        email_obj_inactive = UnverifiedEmailManager.get(code=code, is_active=False)

        if email_obj_active:
            email_obj = email_obj_active
        elif email_obj_inactive:
            email_obj = email_obj_inactive
        else:
            email_obj = None

        if email_obj:
            # Delete the code when user clicks link
            # OR, after <num> days with no activity
            DURATION = 1  # day
            last_attempt = email_obj.most_recent_attempt.date()
            if vh.duration_expired(last_attempt, days=DURATION):
                error_message = """
                    The link you've clicked on has expired.
                    Please re-enter your email on the homepage and try again
                """

                # This time, the link is totally useless. Delete it
                UnverifiedEmailManager.delete(email_obj.email)
            else:
                # In this case, the user may not finish the sign up
                # process. If they don't, we need to have an essentailly
                # dead link. BUT, if they do finish the process, we need to maintain the
                # data in the row to be used in AuthHandler.login()
                # this is why we deactivate() rather than delete()
                UnverifiedEmailManager.deactivate(email_obj.email)
        else:
            error_message = """
                The link you've clicked on is no longer valid.
                Please re-enter your email on the homepage and try again
            """

        data = {
            'verification_code' : code,
            'error_message'     : error_message,
        }
        return data

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

class IndexHandler(BaseHandler):
    @view_config(renderer='/index-html.jinja2', route_name='stuff1_handler')
    @view_config(renderer='/index-html.jinja2', route_name='stuff_handler')
    def stuff_handler(self):
        return {}

    @view_config(renderer='/index-html.jinja2', route_name='index_handler')
    @view_config(renderer='/index-html.jinja2', route_name='index_priority_feed_handler')
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
        pass
