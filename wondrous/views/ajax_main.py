#!/usr/bin/env python
# -*- coding: utf-8 -*-

#
# Company: WONDROUS
# Created by: John Zimmerman
#
# VIEWS/AJAX_MAIN.PY
#

import json

from collections import defaultdict
from unidecode import unidecode

from pyramid.view import view_config

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

from wondrous.controllers import (
    AccountManager,
    FeedManager,
    NotificationManager,
    PostManager,
    VoteManager,
    TagManager,
)

from wondrous.utilities.general_utilities import (
    api_login_required,
    login_required,
)

from wondrous.utilities.global_config import GLOBAL_CONFIGURATIONS

# from wondrous.utilities.pyexif import ExifEditor

from wondrous.utilities.validation_utilities import (
    Sanitize,
    ValidationHelper as vh,
    ValidateLink as vl,
    ValidatePost as vp,
)

from wondrous.views.main import BaseHandler

from wondrous.models.refer import ReferrerManager
import logging

class APIViews(BaseHandler):

    @property
    def query_kwargs(self):
        kwargs = defaultdict(lambda: None)
        kwargs.update(self.request.params)

        for key in kwargs.keys():
            val = kwargs[key]

            if isinstance(val,str):
                kwargs[key] = val.strip().text.encode('utf-8')

            if key in ['page','per_page']:
                try:
                    kwargs[key] = int(val)
                except ValueError:
                    kwargs[key] = None

        if self.request.user:
            kwargs['user'] = self.request.user

        return kwargs

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
        return AccountManager.get_json_by_username(user,**{'user_id': user.id})

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

    @login_required
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
                user,page=0,feed_type=0

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
        user       = self.request.user
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
        user       = self.request.user
        tags            = set(t for t in p.getall('tags[]') if vh.valid_tag(t))
        query_kwargs = self.query_kwargs
        # query_kwargs.update({'tags':tags})
        return PostManager.repost_json(user,**query_kwargs)

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
                user,post_id

            PARAMS: (None)

            RETURNS: The JSON array of the current post status
        """


        posts  = VoteManager.vote_json(**self.query_kwargs)
        return posts

    @api_login_required
    @view_config(request_method='GET',route_name='api_user_notification', renderer='json')
    def api_user_notification(self):
        """
            PURPOSE: get a list of notifications for current user

            USE: self.query_kwargs to provide all the required inputs.
                user,page=0

            PARAMS: (None)

            RETURNS: The JSON array containing the notifications
        """


        return NotificationManager.notification_json(**self.query_kwargs)

    @view_config(request_method='POST',route_name='api_signup_check', renderer='json')
    def api_signup_check(self):
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
            return {'error':error_message}
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

        return PostManager.delete_post_json(user,**self.query_kwargs)

    @api_login_required
    @view_config(request_method='DELETE', route_name='api_new_comment', renderer='json')
    def api_new_comment(self):
        """
            PURPOSE: creates a new comment by post_id

            USE: self.query_kwargs to provide all the required inputs.
                user,post_id, text

            PARAMS: (None)

            RETURNS: The JSON array containing the comment
        """
        return PostManager.new_comment_json(self.request.user,**self.query_kwargs)

    @api_login_required
    @view_config(request_method='DELETE', route_name='api_post_comments', renderer='json')
    def api_post_comments(self):
        """
            PURPOSE: get a list of comments for post_id

            USE: self.query_kwargs to provide all the required inputs.
                user,post_id, page=0, per_page = 15

            PARAMS: (None)

            RETURNS: The JSON array containing the comment
        """
        return PostManager.get_comments_json(self.request.user,**self.query_kwargs)

    @api_login_required
    @view_config(request_method='DELETE', route_name='api_comment_delete', renderer='json')
    def api_comment_delete(self):
        """
            PURPOSE: delete a comment by user_id

            USE: self.query_kwargs to provide all the required inputs.
                user,comment_id

            PARAMS: (None)

            RETURNS: The JSON array containing the comment
        """
        return PostManager.delete_comment_json(self.request.user,**self.query_kwargs)
