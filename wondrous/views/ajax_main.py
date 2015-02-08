#!/usr/bin/env python
# -*- coding: utf-8 -*-

#
# Company: WONDROUS
# Created by: John Zimmerman
#
# VIEWS/AJAX_MAIN.PY
#

import logging
import magic
import os
import time
import uuid

from PIL import Image
from unidecode import unidecode

from pyramid.view import view_config

# from pyramid.httpexceptions import HTTPFound
# from pyramid.httpexceptions import HTTPTemporaryRedirect

from wondrous.models.comment import Comment

from wondrous.models.content import (
    DeletedContentManager,
    DeletedComment,
    ReportedContentManager,
)

from wondrous.models.object import (
    Object,
    ObjectFile,
)

from wondrous.models.person import Person

from wondrous.models.post import Post

from wondrous.models.user import (
    # BlockedUser,
    User,
)

# from wondrous.models import Vote

from wondrous.controllers import (
    AccountManager,
    FeedManager,
    NotificationManager,
    PostManager,
    VoteManager,
)

from wondrous.utilities.general_utilities import (
    _IMAGE_MIMES,
    _IMAGE_MIMES_NO_GIF,
    _JPEG_IMAGE_MIMES,
    api_login_required,
    login_required,
    VALID_MIME_TYPES,
    INVLAID_MIME_TYPES,
)

from wondrous.utilities.global_config import GLOBAL_CONFIGURATIONS

from wondrous.utilities.pyexif import ExifEditor

from wondrous.utilities.render_utilities import (
    _linkify,
    # CreateNewPost,
    GetItems,
    HtmlifyComment,
    HtmlifyPost,
    Pagination,
    to_json,
)

from wondrous.utilities.validation_utilities import (
    Sanitize,
    ValidationHelper as vh,
    ValidateLink as vl,
    ValidatePost as vp,
)

from wondrous.views.main import BaseHandler

from collections import defaultdict

class APIViews(BaseHandler):

    """
        # TODO ADD FUCKING XHR
    """

<<<<<<< HEAD
    @view_config(request_method="GET", route_name='api_user_info', renderer='json')
=======
    @property
    def query_kwargs(self):
        kwargs = defaultdict(lambda: None)
        kwargs.update(self.request.params)
        return kwargs

    @view_config(request_method="GET",route_name='api_user_info', renderer='json')
>>>>>>> 35476e9bcc565ffda51f35d422d3db90c8d6bb97
    def api_user_info(self):

        """
            PURPOSE:

            USE:

            PARAMS: (None)

            RETURNS:
        """
        person = self.request.person
        return AccountManager.get_json_by_username(person,**self.query_kwargs)

    @view_config(request_method="GET",route_name='api_user_wall', renderer='json')
    def api_user_wall(self):
        """
        """
        person = self.request.person
        posts = FeedManager.get_wall_posts_json(person,**self.query_kwargs)
        return posts

    @api_login_required
    @view_config(request_method="POST",route_name='api_user_deactivate', renderer='json')
    def api_user_deactivate(self):
        # NEED a password conformation
        person = self.request.person
        return AccountManager.deactivate_json(person,**self.query_kwargs)

    @api_login_required
    @view_config(request_method="POST",route_name='api_user_profile', renderer='json')
    def api_user_profile(self):
        # Deal with shit like username, first_name, last_name
        person = self.request.person
        return AccountManager.change_profile_json(person,**self.query_kwargs)

    @api_login_required
    @view_config(request_method="POST",route_name='api_user_password', renderer='json')
    def api_user_password(self):
        # requires a password to change,
        person = self.request.person
        return AccountManager.change_password_json(person,**self.query_kwargs)

    @api_login_required
    @view_config(request_method="GET",xhr=True,route_name='api_user_feed', renderer='json')
    def api_user_feed(self):

        """
        """
        person = self.request.person
        return FeedManager.get_majority_posts_json(person,**self.query_kwargs)


    @api_login_required
    @view_config(request_method="POST",route_name='api_new_post', renderer='json')
    def api_new_post(self):
        """
        """
        # Basic setup
        p            = self.request.POST
        person       = self.request.person
        tags            = set(t for t in p.getall('tags[]') if vh.valid_tag(t))
        query_kwargs = self.query_kwargs
        del query_kwargs['tags[]']
        query_kwargs.update({'tags':tags})
        # sanitized_post_links = [l for l in p.getall('post_links[]') if vl.sanitize_post_link(l)]

        return PostManager.post_json(person,**query_kwargs)


    @api_login_required
    @view_config(request_method="POST",route_name='api_repost', renderer='json')
    def api_repost(self):

        # Basic setup
        p            = self.request.POST
        person       = self.request.person
        tags            = set(t for t in p.getall('tags[]') if vh.valid_tag(t))
        query_kwargs = self.query_kwargs
        query_kwargs.update({'tags':tags})
        return PostManager.repost_json(person,**query_kwargs)

    @api_login_required
    @view_config(request_method='POST', xhr=True, route_name='api_user_vote', renderer='json')
    def api_user_vote(self):
        person = self.request.person
        return VoteManager.vote_json(person, **self.query_kwargs)

    @api_login_required
    @view_config(request_method='GET', xhr=True,route_name='api_user_notification', renderer='json')
    def api_user_notification(self):
        person = self.request.person
        return NotificationManager.notification_json(person,**self.query_kwargs)


class AjaxHandler(BaseHandler):

    """
        PURPOSE: This class contains all the methods called via AJAX
        for the main platform
    """

    @view_config(route_name='ajax_username_check_handler', xhr=True, renderer='json')
    def ajax_login_check_handler(self):

        """
            PURPOSE: This method is called on the JS onkeyup event,
            and it dyanmically checks to see if your new username is
            valid and/or is already taken
        """

        safe_in  = Sanitize.safe_input
        success  = None
        error    = None
        username = safe_in(self.request.POST.get('un'))

        valid_un_regex = Sanitize.is_valid_username(username)
        un_is_taken    = AccountManager.is_username_taken(username)

        if valid_un_regex and not un_is_taken:
            success = "Your username looks great!"
        else:
            if not valid_un_regex:
                error = "This is not a valid username"
            else:
                error = "Sorry, this is username is taken"

        return {
            'success' : success,
            'error'   : error,
        }

    @login_required
    @view_config(route_name='ajax_hide_tutorial', xhr=True, renderer='json')
    def ajax_hide_tutorial(self):

        """
            PURPOSE: This method is called when a user clicks
            out of the tutorial. It indicates in the DB that
            the user has completed the mini-tutorial on signup
        """

        current_user = self.request.person
        if current_user:
            current_user.show_tutorial = False
        return {}

    @login_required
    @view_config(route_name='ajax_async_get_item_list', xhr=True, renderer='json')
    def ajax_async_get_item_list(self):

        """
            PURPOSE: This method is used to asynchronously fetch
            item ids to be rendered so that the templates don't do
            any work processing them on the server.

            TODO:
            This needs to be updated to handle the user's dynamically
            aggregated feed.

            We can pass in a few different options:
                - majority_feed : The main index feed
                - priority_feed : The top-user feed
                - profile       : The feed for a given profile (This will come with a username/id)
                - tag           : The posts for a given tag (This will come with a tag-name)
        """

        current_user = self.request.person
        ajax_method = self.url_match(url_match='ajax_method')
        start = self.request.POST.get('start', 0)  # The start-value of the items to get

        retval = []
        if ajax_method == "majority":
            retval = GetItems.feed(current_user.id, 'majority')

        elif ajax_method == "priority":
            pass

        return retval


    @login_required
    @view_config(route_name='ajax_async_load_item', xhr=True, renderer='json')
    def ajax_async_load_item(self):

        """
            PURPOSE: This method is used to asynchronously load each individual
            item once the basic object ids have been fetched via the
            ajax_async_get_item_list() method above.

            TODO:
            This needs to be updated to handle the user's dynamically
            aggregated feed.
        """

        current_user = self.request.person
        ajax_method  = self.url_match(url_match='ajax_method')
        object_id    = self.request.POST.get('oid')
        if object_id:
            obj = Object.by_id(object_id)
            if obj:
                return to_json(obj)

        return None

    @login_required
    @view_config(route_name='ajax_post_handler', xhr=True, renderer='json')
    def ajax_post_handler(self):

        """
            PURPOSE: This method enables a user to make a new post to their wall
        """

        # Basic setup
        p            = self.request.POST
        ajax_method  = self.url_match(url_match='ajax_method')
        current_user = self.request.person
        post_error   = None

        # Relevant POST data
        post_text            = vp.sanitize_post_text(p.get('post_text', ''))
        post_subject         = vp.sanitize_post_text(p.get('post_subject', ''))
        sanitized_post_links = [l for l in p.getall('post_links[]') if vl.sanitize_post_link(l)]
        final_tags      = set(t for t in p.getall('tags[]') if vh.valid_tag(t))
        object_file_id       = p.get('object_file_id')

        # If nothing is present...
        valid_post_data, content_error = vp.validate_post_content(post_subject,
                                                                  post_text,
                                                                  sanitized_post_links,
                                                                  object_file_id)
        if content_error:
            post_error = content_error

        elif object_file_id and not ObjectFile.get(object_file_id, is_mapped=False):
            # Invlaid object file id
            post_error = """
                Gosh darn-it. Stop messing with the system. Nobody likes a rebel.
                Basically, what we're saying is: You have no soul. Thank you, and have a good day.
            """

        # Do we have too many tags?
        elif len(final_tags) > GLOBAL_CONFIGURATIONS['MAX_TAG_NUM']:
            # Too many tags!
            post_error = """
                It'd be appreciated greatly if you'd limit
                the number of tags to no more than 15 at a time.
            """

        # Do we have an error? Let's hope not...
        if not post_error:

            # Core post data
            new_post_data = {
                'user_id'        : current_user.id,
                'tags'      : final_tags,

                'subject'   : valid_post_data['post_subject'],
                'text'      : valid_post_data['post_text'],
                # 'post_links'     : valid_post_data['post_links'],
                # 'object_file_id' : valid_post_data['object_file_id'],
            }

            new_wall_post = PostManager.add(**new_post_data)
            # new_post_obj = CreateNewPost.for_wall(new_post_data)
            new_post_item     = GetItems.new_post(new_wall_post, current_user.id)

            # For use in pagination, when posting to a profile
            valid_profile = current_user if ajax_method == 'profile' else None

            # Get new item from Pagination
            p = Pagination()
            page_items = p.load(new_post_item)  # Where HTMLify occurs
            html_items = HtmlifyPost.get_html_output(page_items, current_user, valid_profile)

            return html_items

        # Or, return an error message...
        return {
            'post_error' : post_error
        }


    @login_required
    @view_config(route_name='ajax_comment_handler', xhr=True, renderer='json')
    def ajax_comment_handler(self):

        """
            PURPOSE: This method enables a user to a comment to a post
        """

        p             = self.request.POST
        this_person   = self.request.person
        comment_error = None
        object_id     = p.get('object_id')
        comment_text  = vp.sanitize_post_text(p.get('comment_text', ''))
        this_object   = Object.by_id(object_id)

        if not comment_text:
            # No comment_text was present
            comment_error = "Really? Please add a comment before you try to add a comment..."

        elif len(comment_text) > GLOBAL_CONFIGURATIONS['MAX_COMMENT_LENGTH']:
            # The comment_text was too long
            comment_error = "We apologize, but your comment exceeded the maximum length number of characters."

        elif not object_id:
            # The object_id was not present
            comment_error = "There was a dreadful error and your comment could not be posted."

        elif not this_object:
            # The object_id provided does not exist
            comment_error = "Wow, you are a soulless. Devious actions are not welcome here."

        if not comment_error:
            user_id      = this_person.id
            this_object_id = this_object.id

            object_comment_data = {
                'object_id' : object_id,
                'user_id' : user_id,
                'text'      : comment_text,
            }
            # Comment.add calls DBSession.flush(),
            # so this newly entered comment will show up in all
            # proceeding queries
            comment_id = Comment.add(object_comment_data)

            # Send to object_poster if someone comments on the post,
            # and that someone is not the object_poster himself
            object_user_id = Object.by_id(object_id).user_id
            if user_id != object_user_id:
                if not ReportedContentManager.has_reported(object_user_id, this_object_id):
                    # NOTIFY REASON[0]
                    _notification_data = {
                        'from_user_id' : user_id,
                        'to_user_id'   : object_user_id,
                        'reason'       : NOTIFICATION_REASON[0],
                        'object_id'    : this_object_id,
                        'object_uuid'  : this_object.ouuid,
                    }
                    NotificationManager.add(_notification_data)

            # Send to ALL people who have previously commented on the post,
            # except for if a previous user_id == object_user_id, AND
            # when we hit the newly entered post's c.user_id == this_person
            sent_list = set()
            for c in Comment.get_all_comments_for_object(object_id):
                if c.user_id not in sent_list:

                    # If you're not the original poster, and you're not
                    # the one posting the content
                    if c.user_id != object_user_id and c.user_id != user_id:

                        # Make sure one of them has not reported the post previously
                        # If they have, we don't want to send them a notification
                        if not ReportedContentManager.has_reported(c.user_id, this_object_id):

                            # NOTIFY REASON[1] (Send to all previous user_ids)
                            _notification_data = {
                                'from_user_id' : user_id,
                                'to_user_id'   : c.user_id,
                                'reason'       : NOTIFICATION_REASON[1],
                                'object_id'    : this_object_id,
                                'object_uuid'  : this_object.ouuid,
                            }
                            NotificationManager.add(_notification_data)
                            sent_list.add(c.user_id)

            # TODO: Commented on a post on my wall
            # post = Post.by_id(this_object_id)
            # if post:
            #   # NOTIFY REASON[1] (Send to all previous user_ids)
            #   _notification_data = {
            #       from_user_id : user_id,
            #       to_user_id   : c.user_id,
            #       reason       : NOTIFICATION_REASON[1],
            #       object_id    : this_object_id,
            #       object_uuid  : this_object.ouuid,
            #   }
            #   NotificationManager.add(_notification_data)

            new_comment = [{
                'comment_id'   : comment_id,
                'user_id'    : user_id,
                'text'         : _linkify(comment_text),
            }]
            return HtmlifyComment.get_html_output(new_comment, this_person)
        else:
            return {
                'comment_error' : comment_error,
            }

    @login_required
    @view_config(route_name='ajax_my_info',xhr=True,renderer='json')
    def ajax_my_info(self):

        """
            PURPOSE: This is the method used to handle basic info handling after login
            has occurred. This is to replace the templating system
        """

        # Logged-in ----------------------
        current_user = self.request.person
        if current_user:

            start = self.request.GET.get('start', 0)  # The start-value of the items to get

            items = []
            self.set_pagination_data(items, start, PER_PAGE=10)

            # Make sure we have a valid tab name
            if self.request.matched_route.name == 'index_priority_feed_handler':
                tab_name = 'priority_feed'
            else:
                tab_name = None

            data = {
                'title'            : u"{cn} | Welcome {name}!".format(cn=self.COMPANY_NAME, name=current_user.name),
                'tab_name'         : tab_name,
                'username'         : current_user.user.username,
                'render_items'     : self.page_items,
                'id'               : current_user.user.id,
                'first_name'       : current_user.first_name,
                'show_tutorial'    : current_user.show_tutorial,
                'profile_picture'  : current_user.user.profile_picture,

                # Vars which deal with pagination (most of
                # these are not in use and need to be cleaned up)
                'current_page_num' : self.page_num,
                'has_next'         : self.has_next,
                'next_start'       : self.next_start,
                'back_start'       : self.back_start,
                'start_item_num'   : self.start,
            }

        # Logged-out ----------------------
        else:
            data = {
                'title' : "Welcome to {cn}".format(cn=self.COMPANY_NAME)
            }

        # *** CRITICALLY IMPORTANT: DO NOT ALTER ***
        data['LOGGED_IN_TEMPLATE']  = "index_li.jinja2"
        data['LOGGED_OUT_TEMPLATE'] = "index_lo.jinja2"

        return data

    @login_required
    @view_config(route_name='ajax_object_vote_handler', xhr=True, renderer='json')
    def ajax_object_vote_handler(self):

        """
            PURPOSE: This is the ajax handler that gets called when
            a user "likes" (!) a post.
        """

        this_person_id = self.request.person.id
        object_id      = self.request.POST.get('object_id')
        valid_object   = Object.by_id(object_id)

        if valid_object:

            has_voted = ovm.has_voted(this_person_id, object_id)

            # Prepare notification
            _notification_data = {
                'from_user_id' : this_person_id,
                'to_user_id'   : valid_object.user_id,
                'reason'       : NOTIFICATION_REASON[2],
                'object_id'    : valid_object.id,
                'object_uuid'  : valid_object.ouuid,
            }

            if has_voted:
                if has_voted.vote_type == 1:
                    ovm.novote(this_person_id, object_id)
                elif has_voted.vote_type == -1:
                    ovm.upvote(this_person_id, object_id)

                    # NOTIFY REASON[2]
                    NotificationManager.add(_notification_data)

            else:
                ovm.upvote(this_person_id, object_id)

                # NOTIFY REASON[2]
                NotificationManager.add(_notification_data)

            vote_data = {
                'total_upvotes'   : ovm.get_liked_object_count(object_id),
                'has_voted'       : getattr(ovm.has_voted(this_person_id, object_id), 'vote_type', False),
            }
            return vote_data
        else:
            return {}

    @login_required
    @view_config(route_name='accept_user_request', xhr=True, renderer='json')
    def accept_user_request(self):
        user_id = int(self.request.POST.get('user_id'))
        accepted = VoteManager.accept_request(self.request.person.user.id,user_id)
        if accepted:
            vote_data = {
                'total_following'    : VoteManager.get_following_count(self.request.person.user.id),
                'total_follower'     : VoteManager.get_follower_count(self.request.person.user.id),
            }
            return vote_data
        else:
            return {}

    @login_required
    @view_config(route_name='ajax_user_vote_handler', xhr=True, renderer='json')
    def ajax_user_vote_handler(self):
        vote_type = int(self.request.POST.get('vote_type'))
        status = int(self.request.POST.get('vote_status'))
        if not VoteManager.validate_vote_args(vote_type=vote_type, status=status):
            return {}

        current_user = self.request.person.user
        user_id = int(self.request.POST.get('user_id'))
        voter_id = str(current_user.id)

        notified = VoteManager.vote_on_user(voter_id,user_id,status)

        if notified:
            vote_data = {
                'total_following'    : VoteManager.get_following_count(user_id),
                'total_follower'     : VoteManager.get_follower_count(user_id),
            }
            return vote_data
        else:
            return {}

    @login_required
    @view_config(route_name='ajax_toggle_profile_visibility_handler', xhr=True, renderer='json')
    def ajax_toggle_profile_visibility_handler(self):

        """
            PURPOSE: This method enables users make their profiles
            either publically accessible, or private.

            If it is publically accessible, they do not need to
            approve followers. If it is private, they must manually
            approve all pending follow requests
        """

        current_user = self.request.person.user
        current_user.is_private = not current_user.is_private
        return {}

    @login_required
    @view_config(route_name='ajax_report_content_handler', xhr=True, renderer='json')
    def ajax_report_content_handler(self):

        """
            PURPOSE: This method enables users to report
            content which they find offensive/spam/etc.
        """

        current_user_id = self.request.person.id

        _object_id = self.request.POST.get('object_id')
        why_id = self.request.POST.get('why_id')
        report_comment = self.request.POST.get('report_comment')

        error_message = success_message = None

        try:
            why_id = int(why_id)
        except ValueError:
            error_message = "There was an error and the post could not be reported"

        if why_id not in [1,2,3,4]:
            error_message = "The selected value was not valid"
        elif not report_comment:
            error_message = "You must enter a comment in addition to selecting a reason why"
        elif len(report_comment) > GLOBAL_CONFIGURATIONS['MAX_REPORT_LENGTH']:
            error_message = "We appreciate your comment, but it has exceeded our length limit of 2,000 characters"

        if not error_message:
            this_object = Object.get(_object_id)
            if this_object:

                if ReportedContentManager.has_reported(current_user_id, this_object.id):
                    success_message = """
                        You have already reported this post, and we are
                        currently looking into it. Thank you for your patience.
                    """
                else:
                    reported_content_data = {
                        'reporter_id' : current_user_id,
                        'user_id'   : this_object.user_id,
                        'object_id'   : this_object.id,
                        'why_id'      : why_id,
                        'comment'     : report_comment,
                    }
                    ReportedContentManager.add(reported_content_data)
                    success_message = "You have reported this post, and it will be reviewed promptly. Thank you."
            else:
                error_message = "There was an error and the post could not be reported"

        data = {
            'success_message' :success_message,
            'error_message'   :error_message,
        }
        return data

    @login_required
    @view_config(route_name='ajax_delete_content_handler', xhr=True, renderer='json')
    def ajax_delete_content_handler(self):

        """
            PURPOSE: This method enables users to delete one of their posts
        """

        current_user_id = self.request.person.id
        _object_id      = self.request.POST.get('object_id')
        my_post         = False
        on_my_wall      = False
        error_message   = None
        this_object     = Object.get(_object_id)

        if this_object:

            post = Post.by_id(this_object.id)
            if post:
                on_my_wall = bool(post.user_id == current_user_id)
            my_post = bool(this_object.user_id == current_user_id)

        if my_post or on_my_wall:
            DeletedContentManager.delete_content(this_object.id)
        else:
            error_message = "There was an error when deleting this post."

        data = {
            'error_message' : error_message,
        }
        return data

    @login_required
    @view_config(route_name='ajax_delete_comment_handler', xhr=True, renderer='json')
    def ajax_delete_comment_handler(self):

        """
            PURPOSE: This method enables users to delete a comment if
            it is either authored by them, or if it on one of their posts
        """

        p               = self.request.POST
        current_user_id = self.request.person.id
        _object_id      = p.get('object_id')
        _comment_id     = p.get('comment_id')
        my_comment      = False
        on_my_wall      = False
        error_message   = None
        this_comment    = Comment.get(_comment_id, _object_id)

        if this_comment:
            this_object = Object.get(_object_id)

            # The post is on my wall, hence, I can control all
            # comments on my wall, even if not from my post.
            post = Post.by_id(this_object.id)
            if post:
                on_my_wall = bool(post.user_id == current_user_id)

            # Or, my comment
            my_comment = bool(this_comment.user_id == current_user_id)

        if my_comment or on_my_wall:
            DeletedComment.delete_comment(this_comment.id)
        else:
            error_message = "There was an error when deleting this comment."

        data = {
            'error_message' : error_message,
        }
        return data

    @login_required
    @view_config(route_name='ajax_search_handler', renderer='json')
    def ajax_search_handler(self):

        """
            PURPOSE: This method controls the autocomplete search bar's results
        """

        safe_in     = Sanitize.safe_input
        query       = safe_in(self.request.GET.get('q')) # The search term
        results     = None
        result_list = []

        if query and "_" not in query:
            if query[0] == "#":
                query = query[1::]
                results = TagManager.get_like(query) if vh.valid_tag(query) else result_list.append({})

                # This is to handle a case when there are
                # no tags for a given searched hashtag
                if not results:
                    results = []

                for result in results:
                    result_list.append({
                        'value'    : "#{t}".format(t=result.tag_name),
                        'data'     : "/tag/{t}".format(t=result.tag_name),
                        'category' : "tag",
                    })
            else:
                if Sanitize.is_valid_email(query):

                    # Given an email, we just look for people
                    results = User.by_kwargs(email=query).all()
                    for result in results:
                        result_list.append({
                            'value'    : "{n}".format(n=result.name),
                            'data'     : "/{un}".format(un=result.user.username),
                            'category' : "person",
                        })
                else:
                    # Add persons
                    query = unidecode(unicode(query))
                    results = Person.by_id_like(query, ascii=True)
                    results = [p for p in results if p.user.is_active]  # filter out deactivated users
                    for result in results:
                        result_list.append({
                            'value'    : "{n}".format(n=result.ascii_name),
                            'data'     : "/{un}".format(un=result.user.username),
                            'category' : "person",
                        })

                    # Add tags
                    results = TagManager.get_like(query)
                    for result in results:
                        result_list.append({
                            'value'    : "#{t}".format(t=result.tag_name),
                            'data'     : "/tag/{t}".format(t=result.tag_name),
                            'category' : "tag",
                        })

        data = {
            'query'       : query,
            'suggestions' : result_list,
        }
        return data

    @login_required
    @view_config(route_name='ajax_notification', xhr=True, renderer='json')
    def ajax_notification(self):

        ajax_method  = self.url_match(url_match='ajax_method')
        current_user = self.request.person
        # batch      = safe_in(self.request.GET.get('batch')) # The search term

        if ajax_method == "count":

            nc = NotificationManager.get_unseen_notification_count_for_user(current_user.id)
            data = {'notification_count' : nc}
            return data

        elif ajax_method == "get":

            # try:
            #   bnum = int(batch) if batch else 1
            # except:
            #   bnum = 1

            all_notifications_for_user = NotificationManager.get_notifications_for_user(current_user.id)
            notification_data = [{
                'nid'        : n.id,
                'from_name'  : User.by_id(n.from_user_id).username,
                'from_photo' : n.from_user.profile_picture,
                'ntext'      : n.notification,
                'url'        : n.url if n.url else "#",
                'is_read'    : n.is_read,
            } for n in all_notifications_for_user]

            data = {
                'notification_data' : notification_data,
            }
            return data

        elif ajax_method == "mark_all_seen":

            NotificationManager.set_all_seen(current_user.id)
            return {}

        else:
            return {}


class AjaxFileUpload(BaseHandler):

    @login_required
    @view_config(route_name='ajax_upload_file_handler', xhr=True, renderer='json')
    def ajax_upload_file_handler(self):

        """
            PURPOSE: This method handles the uploading of files for files
            attached to a post body, and the profile photo for users

            NOTE: Traditionally, we had allowed numerous different MIME types;
            however, we're streamlining it down to just the major file
            types: PDFs, JPGs, PNGs for uploads attached to a post, and just
            PNGs and JPGs for profile photos.

            Also, very important to note, this only handles 1 file upload at
            a time. If we want to ever allow a user to upload numerous items
            at once, we need to adjust this, and its associated Javascript.
        """

        safe_in = Sanitize.safe_input
        ajax_method = safe_in(self.url_match(url_match='ajax_method'))

        # for name, fieldStorage in self.request.POST.items():
        #   cgi_file_obj = fieldStorage
        #   break
        cgi_file_obj   = self.request.POST['files[]']
        object_file_id = None

        if ajax_method == "file":
            file_url, original_file_name, file_size, mime_type, error_message = self._process_file(cgi_file_obj)
            if not error_message:

                object_file_data = {
                    'file_url'           : file_url,
                    'original_file_name' : original_file_name,
                    'file_size'          : file_size,
                    'mime_type'          : mime_type,
                }
                new_object_file = ObjectFile.add(object_file_data)
                object_file_id = new_object_file.id

        elif ajax_method == "profile":
            file_url, original_file_name, file_size, mime_type, error_message = self._process_file(cgi_file_obj, image_only=True)
            if not error_message:
                # Make ImageThumbnail
                object_file_data = {
                    'file_url'           : file_url,
                    'original_file_name' : original_file_name,
                    'file_size'          : file_size,
                    'mime_type'          : mime_type,
                }

                # Add to ProfilePictureHistory table
                #new_object_file = CoverPhotoManager.add(object_file_data)
                object_file_id = new_object_file.id

        return {
            'object_file_id' : object_file_id,
            'file_url'       : file_url,
            'is_img'         : bool(mime_type in _IMAGE_MIMES),
            'error_message'  : error_message,
        }

    def _process_file(self, cgi_file_obj, image_only=False):

        """
            PURPOSE: This handles the actual uploading of the file and saving
            it to the AWS S3 bucket.

            USE: Call like: self._process_file(...)

            PARAMS:
                cgi_file_obj : <Fieldstorage> : REQUIRED : The byte stream of the file to upload (it's a File object)
                image_only   : bool : default=False : Do we allow non-images to be uploaded (e.g., PDFs)?

            RETURNS: 5 variables:
                file_url : str : The static Amazon S3 url of the uploaded file
                original_fname : str : The file's original name
                file_size : int : The number of kilobytes of the file
                mime_type : str : The MIME type of the uploaded file
                error_message : str : Any associated error involved with the file upload, otherwise None

            NOTE: To optimize this, we can split some of the image processing
            off into a seperate thread/processes. For example, getting the size of the file is
            an independent computation that can take as long as we need up until we
            add the file into the database. The rest of the image EXIF manipulation
            can be done independently of the file size, and likewwise, can be delegated
            to a seperate thread/process as well. This is primarily useful in the case we have multiple
            uploads per single post wherein we don't want to sequentially process each upload,
            but rather, tackle them all at once.
        """

        file_url       = None
        mime_type      = None
        error_message  = None
        original_fname = cgi_file_obj.filename
        file_size      = self._get_file_size(cgi_file_obj.file)

        if file_size < GLOBAL_CONFIGURATIONS['MAX_FILE_SIZE']:  # 35 MB => 35 000 000 B

            mime_list = magic.from_buffer(cgi_file_obj.file.read(), mime=True),
            mime_type = mime_list[0] if mime_list else None

            # Determine which set of MIMES we accept
            if image_only:
                ACCEPT_MIMES = _IMAGE_MIMES_NO_GIF
            else:
                ACCEPT_MIMES = VALID_MIME_TYPES

            # Let's be hyper secure about the type of file we're about to process...
            if mime_type in ACCEPT_MIMES and mime_type not in INVLAID_MIME_TYPES:

                if mime_type in _JPEG_IMAGE_MIMES:
                    file_object, is_error = self._exif_reset_orientation(cgi_file_obj)
                    if not is_error:
                        cgi_file_obj.file = file_object

                try:
                    file_name = self.request.storage.save(cgi_file_obj, randomize=True, replace=False)
                    file_url  = self.request.storage.url(file_name)
                except:
                    error_message = "Sorry, your file could not be uploaded. Hint: You may need to add its file extension if it doesn't have one! Or, your file may not be one of our allowed types :("
            else:
                error_message = "Sorry, you cannot upload files that are \"{mt}\"".format(mt=mime_type)
        else:
            error_message = "This file is too big. Your file must be less than 35MB"

        return file_url, original_fname, file_size, mime_type, error_message

    def _get_file_size(self, file_object):

        """
            PURPOSE: Get the size of a given file in BYTES

            USE: Call like: self._get_file_size(...)

            PARAMS: 1 required param
                file_object : <cgi_file_obj.file> : REQUIRED : The CGI File Object file

            RETURNS: This returns the number of BYTES of a file
        """

        file_object.seek(0,2)  # move file cursor to end of file
        size = file_object.tell()
        file_object.seek(0)  # move file cursor back to start
        return size

    def _exif_reset_orientation(self, cgi_file_obj):

        """
            PURPOSE: Rotate the image according to the exif
            tag if it exists and then delete or modify this
            tag to '1'

            USE: Call like: self._exif_reset_orientation(<Fieldstorage>)

            PARAMS: 1 param...
                cgi_file_obj : <FieldStorage> : REQUIRED : A FieldStorage object with a .file that
                                                           contains the JPEG image bytes

            RETURNS: 2 params:
                file_object : <Fieldstorage> : The fully updated Fieldstorage object
                is_error : bool : A boolean value indicating if an error occurred
        """

        is_error = False
        file_object = cgi_file_obj.file
        tmp_file_name = str(uuid.uuid4()) + str(uuid.uuid4())
        file_object.seek(0)

        # Write file to disk for exiftool
        temp_fn = os.path.basename(tmp_file_name)
        IMG_DISK_LOCATION = os.path.expanduser(GLOBAL_CONFIGURATIONS['EXIF_IMG_DIR_PATH']) + temp_fn
        with open(IMG_DISK_LOCATION, 'wb') as f:
            f.write(cgi_file_obj.file.read())

            # This is gross, but necessry. Set a timeout for a
            # worst-case-scenario write to disk.
            # If the file still hasn't been written to disk after X seconds,
            # quit the process and return None, True
            secs = 0
            while not os.path.isfile(IMG_DISK_LOCATION):
                time.sleep(0.5)
                if secs >= 20.0:
                    return None, True
                secs += 0.5

            try:
                # Get the orientation if it exists
                e = ExifEditor(IMG_DISK_LOCATION)
                orientation = e.getOrientation()
                if orientation != 1:
                    e.setOrientation(1)
                else:
                    # If the orientation == 1, we
                    # don't need to do anything to it.
                    # Delete the file from the tmp dir

                    os.remove(IMG_DISK_LOCATION)
                    return None, True

                f.seek(0)  # Set file cursor back to beginning

                # Now rotate the image using PIL
                img = Image.open(IMG_DISK_LOCATION)

                if orientation == 6:
                    img = img.transpose(Image.ROTATE_270)
                elif orientation == 8:
                    img = img.transpose(Image.ROTATE_90)
                elif orientation == 3:
                    img = img.transpose(Image.ROTATE_180)
                elif orientation == 2:
                    img = img.transpose(Image.FLIP_LEFT_RIGHT)
                elif orientation == 5:
                    img = img.transpose(Image.FLIP_TOP_BOTTOM).transpose(Image.ROTATE_90)
                elif orientation == 7:
                    img = img.transpose(Image.FLIP_TOP_BOTTOM).transpose(Image.ROTATE_270)
                elif orientation == 4:
                    img = img.transpose(Image.FLIP_TOP_BOTTOM)

                # Write new img to FieldStorage.file
                file_object = cgi_file_obj.make_file()
                img.save(file_object, "JPEG")

            except TypeError as e:
                is_error = True

            # Delete the file from the tmp dir
            os.remove(IMG_DISK_LOCATION)

            # Return full Fieldstorage CGI file object
            return file_object, is_error
