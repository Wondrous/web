#!/usr/bin/env python
# -*- coding: utf-8 -*-

#
# Company: WONDROUS
# Created by: John Zimmerman
#
# VIEWS/AJAX_MAIN.PY
#

from collections import defaultdict
from unidecode import unidecode

from pyramid.view import view_config
from pyramid.security import forget
from pyramid.security import remember
from wondrous.models.comment import Comment


from wondrous.models.object import (
    Object,
    ObjectFile,
)

from wondrous.models.post import Post

from wondrous.models.user import (
    # BlockedUser,
    User,
)

import wondrous.controllers
from wondrous.controllers import (
    AccountManager,
    FeedManager,
    NotificationManager,
    PostManager,
    VoteManager,
    TagManager,
    SearchManager
)

from wondrous.utilities.general_utilities import (
    api_login_required,
    api_logout_required,
)

from wondrous.utilities.global_config import GLOBAL_CONFIGURATIONS
from wondrous.utilities.notification_utilities import send_notification
# from wondrous.utilities.pyexif import ExifEditor

from wondrous.utilities.validation_utilities import (
    Sanitize,
    ValidationHelper as vh,
    ValidateLink as vl,
    ValidatePost as vp,
)

from wondrous.models.refer import ReferrerManager
from wondrous.views.main import BaseHandler

import json
import logging
import urllib
import shortuuid

class APIViews(BaseHandler):

    @property
    def query_kwargs(self):

        """
            TODO
        """

        kwargs = defaultdict(lambda: None)
        kwargs.update(self.request.params)
        try:
            if self.request.body:
                kwargs.update(json.loads(self.request.body))
        except Exception, e:
            pass

        for key in kwargs.keys():
            val = kwargs[key]

            if isinstance(val, str):
                kwargs[key] = val.strip().text.encode('utf-8')

            if key == 'search':
                kwargs[key] = urllib.unquote(kwargs[key]).decode('utf8')

            if key in ['page', 'per_page']:
                try:
                    kwargs[key] = int(val)
                except ValueError:
                    kwargs[key] = None

        if self.request.user:
            kwargs['user'] = self.request.user

        return kwargs

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
        self.request.response.headerlist.extend(headers)

    @api_logout_required
    @view_config(request_method="POST",route_name='api_refer_register',renderer='json')
    def api_refer_register(self):

        """
            PURPOSE: Retrieves/sign up the referrer

            USE: self.query_kwargs to provide all the required inputs.
                email, ref_uuid

            PARAMS: (None)

            RETURNS: The JSON array of the referrer json
        """

        return ReferrerManager.register(**self.query_kwargs)

    @api_logout_required
    @view_config(request_method="GET",route_name='api_refer_progress',renderer='json')
    def api_refer_progress(self):

        """
            PURPOSE: Retrieves the referrer

            USE: self.query_kwargs to provide all the required inputs.
                uuid

            PARAMS: (None)

            RETURNS: The JSON array of the referrer json
        """

        return ReferrerManager.by_uuid(**self.query_kwargs)


    @view_config(request_method="GET",route_name='api_user_followers', renderer='json')
    def api_user_followers(self):

        """
            PURPOSE: Retrieves the user profile posts -- all the posts that
                were created by the respective user

            USE: self.query_kwargs to provide all the required inputs.
                user,user_id or username,page=0 -- last param is optional

            PARAMS: (None)

            RETURNS: The JSON array of the wallpost objects
        """


        posts  = VoteManager.get_followers_json(**self.query_kwargs)
        return posts

    @view_config(request_method="GET",route_name='api_user_following', renderer='json')
    def api_user_following(self):

        """
            PURPOSE: Retrieves the user profile posts -- all the posts that
                were created by the respective user

            USE: self.query_kwargs to provide all the required inputs.
                user,user_id or username,page=0 -- last param is optional

            PARAMS: (None)

            RETURNS: The JSON array of the wallpost objects
        """

        posts  = VoteManager.get_following_json(**self.query_kwargs)
        return posts

    @api_login_required
    @view_config(request_method="GET",route_name='api_user_info', renderer='json')
    def api_user_info(self):

        """
            PURPOSE: Retrieves the user information based on relationship and login
                status

            USE: self.query_kwargs to provide all the required inputs.
                user_id or username

            PARAMS: (None)

            RETURNS: The JSON of the user+user model if valid else {}
        """

        return AccountManager.get_json_by_username(**self.query_kwargs)

    @api_login_required
    @view_config(request_method="GET",route_name='api_user_me', renderer='json')
    def api_user_me(self):

        """
            PURPOSE: Retrieves my user information based on relationship and login
                status

            USE: self.query_kwargs to provide all the required inputs.
                user_id

            PARAMS: (None)

            RETURNS: The JSON of the user+user model if valid else {}
        """

        user = self.query_kwargs['user']
        return AccountManager.get_json_by_username(user, **{'user_id': user.id,'auth':True})

    @api_logout_required
    @view_config(request_method="POST",route_name='api_verify_user', renderer='json')
    def api_verify_user(self):
        u = AccountManager.verify_user(**self.query_kwargs)
        if u:
            # extend the headers
            self._set_session_headers(u)
            return u.json(1)
        else:
            return {'error':'verification failed'}

    @api_logout_required
    @view_config(request_method="POST",route_name='api_request_verify', renderer='json')
    def api_request_verify(self):
        user = AccountManager.request_verify(**self.query_kwargs)
        if user and wondrous.controllers.email_controller.send_activation_link(user=user):
            return {'status':'sent'}
        else:
            return {'error':'account doesn\'t exist or account already verified'}

    @api_logout_required
    @view_config(request_method="POST",route_name='api_reset_password', renderer='json')
    def api_reset_password(self):
        u = AccountManager.verify_user(**self.query_kwargs)
        if u:
            # extend the headers
            return u.json(1)
        else:
            return {'error':'verification failed, your verification might have expired or your password is not strong enough'}

    @api_logout_required
    @view_config(request_method="POST",route_name='api_request_reset', renderer='json')
    def api_request_reset(self):
        if wondrous.controllers.email_controller.send_password_reset(**self.query_kwargs):
            return {'status':'sent'}
        else:
            return {'error':'invalid email addresses'}


    @api_login_required
    @view_config(request_method="POST",route_name='api_user_picture', renderer='json')
    def api_user_picture(self):

        """
            PURPOSE: Changes profile picture

            USE: self.query_kwargs to provide all the required inputs.
                file_type

            PARAMS: (None)

            RETURNS: The JSON of the user+user model if valid else {}
        """

        return AccountManager.upload_picture_json(**self.query_kwargs)

    @api_login_required
    @view_config(request_method="POST", route_name='api_user_visibility_toggle', renderer='json')
    def api_user_visibility_toggle(self):

        """
            PURPOSE: This method enables users make their profiles
            either publically accessible, or private.

            If it is publically accessible, they do not need to
            approve followers. If it is private, they must manually
            approve all pending follow requests
        """

        current_
        current_user.is_private = not current_user.is_private
        return {'is_private': current_user.is_private}

    @api_login_required
    @view_config(request_method="GET",route_name='api_user_wall', renderer='json')
    def api_user_wall(self):

        """
            PURPOSE: Retrieves the user profile posts -- all the posts that
                were created by the respective user

            USE: self.query_kwargs to provide all the required inputs.
                user,user_id or username,page=0 -- last param is optional

            PARAMS: (None)

            RETURNS: The JSON array of the wallpost objects
        """

        posts  = FeedManager.get_wall_posts_json(**self.query_kwargs)
        return posts

    @api_login_required
    @view_config(request_method="POST",route_name='api_user_deactivate', renderer='json')
    def api_user_deactivate(self):

        """
            PURPOSE: Deactivates an account

            USE: self.query_kwargs to provide all the required inputs.
                user,password

            PARAMS: (None)

            RETURNS: The JSON containing either an error or successful status
        """

        return AccountManager.deactivate_json(**self.query_kwargs)

    @api_login_required
    @view_config(request_method="POST",route_name='api_user_name', renderer='json')
    def api_user_name(self):

        """
            PURPOSE: changes account information

            USE: self.query_kwargs to provide all the required inputs.
                user,name


            RETURNS: The JSON containing either an error or successful status
        """

        return AccountManager.change_name_json(**self.query_kwargs)

    @api_login_required
    @view_config(request_method="POST",route_name='api_user_username', renderer='json')
    def api_user_username(self):

        """
            PURPOSE: changes account information

            USE: self.query_kwargs to provide all the required inputs.
                user,username

            PARAMS: (None)

            RETURNS: The JSON containing either an error or successful status
        """

        return AccountManager.change_username_json(**self.query_kwargs)

    @api_login_required
    @view_config(request_method="POST",route_name='api_user_password', renderer='json')
    def api_user_password(self):

        """
            PURPOSE: Changes password

            USE: self.query_kwargs to provide all the required inputs.
                user,old_password,new_password

            PARAMS: (None)

            RETURNS: The JSON containing either an error or successful status
        """

        return AccountManager.change_password_json(**self.query_kwargs)

    @view_config(request_method="GET",route_name='api_user_feed', renderer='json')
    def api_user_feed(self):

        """
            PURPOSE: get different feed posts by the type

            USE: self.query_kwargs to provide all the required inputs.
                user,
                page=0,
                feed_type=0

                can only obtain the feed of the logged in user

            PARAMS: (None)

            RETURNS: The JSON containing the feed posts
        """

        return FeedManager.get_feed_posts_json(**self.query_kwargs)

    @api_login_required
    @view_config(request_method="POST",route_name='api_new_post', renderer='json')
    def api_new_post(self):

        """
            PURPOSE: post a new post

            USE: self.query_kwargs to provide all the required inputs.
                user,subject,text,tags=None

            PARAMS: (None)

            RETURNS: The JSON containing the new post else containing JSON with error
        """

        p            = self.request.POST
        tags         = set(t for t in p.getall('tags[]') if vh.valid_tag(t))
        query_kwargs = self.query_kwargs
        if 'tags[]' in query_kwargs.keys():
            del query_kwargs['tags[]']
            if len(tags) > 0:
                query_kwargs.update({'tags': tags})
        # sanitized_post_links = [l for l in p.getall('post_links[]') if vl.sanitize_post_link(l)]
        logging.warn(query_kwargs)
        retval = PostManager.post_json(**query_kwargs)

        return retval

    @api_login_required
    @view_config(request_method="POST",route_name='api_repost', renderer='json')
    def api_repost(self):

        """
            PURPOSE: issue a repost

            USE: self.query_kwargs to provide all the required inputs.
                user,post_id,tags=None,text=None

            PARAMS: (None)

            RETURNS: The JSON containing the new repost else containing JSON with error
        """

        # Basic setup
        p            = self.request.POST
        user         = self.request.user
        tags         = set(t for t in p.getall('tags[]') if vh.valid_tag(t))
        query_kwargs = self.query_kwargs
        # query_kwargs.update({'tags':tags})
        return PostManager.repost_json(**query_kwargs)

    @api_login_required
    @view_config(request_method='POST', route_name='api_user_vote', renderer='json')
    def api_user_vote(self):

        """
            PURPOSE: uses an action to vote on someone else

            USE: self.query_kwargs to provide all the required inputs.
                user,user_id,action

            PARAMS: (None)

            RETURNS: The JSON containing the following/follower stats
        """

        return VoteManager.vote_json(**self.query_kwargs)

    @view_config(request_method="POST",route_name='api_post_vote', renderer='json')
    def api_post_vote(self):

        """
            PURPOSE: Toggles like/unlike for a post

            USE: self.query_kwargs to provide all the required inputs.
                user,
                post_id

            PARAMS: (None)

            RETURNS: The JSON array of the current post status
        """

        posts  = VoteManager.vote_json(**self.query_kwargs)
        return posts

    @view_config(request_method="GET",route_name='api_get_post', renderer='json')
    def api_get_post(self):

        """
            PURPOSE: Toggles like/unlike for a post

            USE: self.query_kwargs to provide all the required inputs.
                user,
                post_id

            PARAMS: (None)

            RETURNS: The JSON array of the current post status
        """

        posts  = PostManager.get_by_id_json(**self.query_kwargs)
        return posts


    @api_login_required
    @view_config(request_method='GET',route_name='api_user_notification', renderer='json')
    def api_user_notification(self):

        """
            PURPOSE: get a list of notifications for current user

            USE: self.query_kwargs to provide all the required inputs.
                user,
                page=0

            PARAMS: (None)

            RETURNS: The JSON array containing the notifications
        """

        return NotificationManager.notification_json(**self.query_kwargs)

    @view_config(request_method='POST',route_name='api_signup_check', renderer='json')
    def api_signup_check(self):

        """
            PURPOSE: Handle a user sign up

            USE: self.query_kwargs to provide all the required fields
                name,
                password,
                email,
                username

            PARAMS: (None)

            RETURNS: The JSON error response
        """

        error_message = None
        try:
            _s_valid_n, len_err_fn = Sanitize.length_check(self.query_kwargs['name'], min_length=1, max_length=30)
            _s_valid_pw, len_err_pw = Sanitize.length_check(self.query_kwargs['password'], min_length=6, max_length=255)
            _s_valid_em = Sanitize.is_valid_email(self.query_kwargs['email'])
            _s_em_taken = User.by_kwargs(email=self.query_kwargs['email']).first()
            _s_valid_un = Sanitize.is_valid_username(self.query_kwargs['username'].lower())
            _s_un_taken = User.by_kwargs(username=self.query_kwargs['username'].lower()).first()

        except Exception, e:
            error_message = str(e)

        # Check for validity
        if not _s_valid_n:
            error_message = "Your name is {err}".format(err=len_err_fn)
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

        if error_message:
            return {'error': error_message}
        else:
            return {}

    @api_login_required
    @view_config(request_method='DELETE', route_name='api_post_delete', renderer='json')
    def api_post_delete(self):

        """
            PURPOSE: deletes the given post by post_id

            USE: self.query_kwargs to provide all the required inputs.
                user,post_id

            PARAMS: (None)

            RETURNS: The JSON array containing the status of the delete
        """
        return PostManager.delete_post_json(**self.query_kwargs)

    @api_login_required
    @view_config(request_method='POST', route_name='api_new_comment', renderer='json')
    def api_new_comment(self):

        """
            PURPOSE: creates a new comment by post_id

            USE: self.query_kwargs to provide all the required inputs.
                user,
                post_id,
                text

            PARAMS: (None)

            RETURNS: The JSON array containing the comment
        """

        return PostManager.new_comment_json(**self.query_kwargs)

    @api_login_required
    @view_config(request_method='GET', route_name='api_post_comments', renderer='json')
    def api_post_comments(self):

        """
            PURPOSE: get a list of comments for post_id

            USE: self.query_kwargs to provide all the required inputs.
                user, (supplied on server)
                post_id,
                page = 0,
                per_page = 15

            PARAMS: (None)

            RETURNS: The JSON array containing the comment
        """

        return PostManager.get_comments_json(**self.query_kwargs)

    @api_login_required
    @view_config(request_method='DELETE', route_name='api_comment_delete', renderer='json')
    def api_comment_delete(self):

        """
            PURPOSE: delete a comment by user_id

            USE: self.query_kwargs to provide all the required inputs.
                user,
                comment_id

            PARAMS: (None)

            RETURNS: The JSON array containing the comment
        """

        return PostManager.delete_comment_json(**self.query_kwargs)

    @api_login_required
    @view_config(request_method='GET', route_name='api_search_users', renderer='json')
    def api_search_users(self):

        """
            TODO
        """
        return SearchManager.user_search_json(**self.query_kwargs)


    @api_login_required
    @view_config(request_method='GET', route_name='api_search_posts', renderer='json')
    def api_search_posts(self):

        """
            TODO
        """

        return SearchManager.post_search_json(**self.query_kwargs)

    @api_login_required
    @view_config(request_method='POST', route_name='api_seen_notification', renderer='json')
    def api_seen_notification(self):

        """
            TODO
        """

        return NotificationManager.seen_all_json(**self.query_kwargs)

    @api_login_required
    @view_config(request_method='POST', renderer='json', route_name='api_logout')
    def api_logout(self):

        """
            PURPOSE: This method handles the logout process for all users
        """

        headers = forget(self.request)
        self.request.response.headerlist.extend(headers)
        return {'status':True}

    @api_login_required
    @view_config(request_method='POST', renderer='json', route_name='api_report_post')
    def api_report_post(self):

        """
            PURPOSE: This method handles reports for post
        """

        return PostManager.report_post(**self.query_kwargs)

    @api_login_required
    @view_config(request_method='POST', renderer='json', route_name='api_report_comment')
    def api_report_comment(self):

        """
            PURPOSE: This method handles reports for comment
        """

        return PostManager.report_comment(**self.query_kwargs)


    @api_logout_required
    @view_config(request_method='POST', renderer='json', route_name='api_login')
    def api_login(self):

        """
            PURPOSE: This method handles the login process for all users
        """

        safe_in  = Sanitize.safe_input
        safe_out = Sanitize.safe_output
        p        = self.request.POST

        credential = safe_in(self.query_kwargs.get('user_identification'))
        password   = safe_in(self.query_kwargs.get('password'), strip=False)

        if credential:
            credential = credential.lower()

        if Sanitize.is_valid_email(credential):
            this_user = User.by_kwargs(email=credential).first()
        else:
            this_user = User.by_case_insensitive_username(credential).first()

        if this_user and this_user.validate_password(password) and not this_user.is_banned and this_user.verified:
            # Reactivating a user when they log in
            # TODO -- this needs to be more 'offical'
            self._set_session_headers(this_user)
            retval = this_user.json()
            key = shortuuid.uuid()
            retval.update({'auth':key})
            send_notification(-1,str(key)+":"+str(this_user.id))
            if this_user.picture_object:
                retval.update({"ouuid":this_user.picture_object.ouuid})
            return retval

        elif this_user and this_user.is_banned:
            return {'error': 'banned'}
        elif this_user and not this_user.verified:
            return {'error': 'verification'}
        else:
            return {'error': 'Sorry, incorrect username/email or passwrd. Please try again.'}

    @api_logout_required
    @view_config(renderer='json',route_name='api_register')
    def api_register(self):

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
        uuid     = safe_in(self.query_kwargs.get('uuid'))
        name     = safe_in(self.query_kwargs.get('name'))
        email    = safe_in(self.query_kwargs.get('email'))
        password = safe_in(self.query_kwargs.get('password'), strip=False)
        username = safe_in(Sanitize.strip_ampersand(self.query_kwargs.get('username')))


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
            _s_valid_n, len_err_fn = Sanitize.length_check(name, min_length=1, max_length=30)
            _s_valid_pw, len_err_pw = Sanitize.length_check(password, min_length=6, max_length=255)
            _s_valid_em = Sanitize.is_valid_email(email)
            _s_em_taken = User.by_kwargs(email=email).first()
            _s_valid_un = Sanitize.is_valid_username(username.lower())
            _s_un_taken = User.by_kwargs(username=username).first()

            # Check for validity
            if not _s_valid_n:
                error_message = "Your name is {err}".format(err=len_err_fn)
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
                # self._set_session_headers(new_user)
                wondrous.controllers.email_controller.send_activation_link(new_user)
                return new_user.json()
            else:
                return {'error':error_message}
        else:
            return {'error':error_message}
