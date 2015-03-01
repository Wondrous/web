#!/usr/bin/env python
# -*- coding: utf-8 -*-

#
# Company: WONDROUS
# Created by: John Zimmerman
#
# VIEWS/ADMIN.PY
#

from datetime import datetime
from functools import partial

from pyramid.security import remember

from pyramid.httpexceptions import HTTPFound

from pyramid.view import view_config

from wondrous.models.admin import AdminManager

from wondrous.models.content import ReportedContentManager

from wondrous.models.object import Object

from wondrous.models.person import Person

from wondrous.models.user import User

from wondrous.utilities.general_utilities import SYSTEM_ADMIN_REQUIRED
from wondrous.utilities.general_utilities import url_match

from wondrous.utilities.validation_utilities import Sanitize

class AdminBaseHandler(object):

    def __init__(self, request):
        self.request = request
        self.url_match = partial(url_match, self)

        try:
            self.SUPER_ADMIN = self.request.admin.super_admin
        except AttributeError:
            self.SUPER_ADMIN = False

class AdminAuthHandler(AdminBaseHandler):

    @view_config(renderer='/__admin__/admin_login.jinja2', route_name='_admin_handler_login')
    def admin_handler_login(self):


        # TODO:
        # Fix Post to Community

        safe_in = Sanitize.safe_input
        p = self.request.params
        error_message = None
        this_admin = None

        if 'admin-login-button' in p:

            username = safe_in(p.get('username'))
            password = safe_in(p.get('password'), strip=False)
            if username and password:

                this_admin = AdminManager.get(username=username)
                if this_admin and this_admin.throttle_num < 3:

                    valid_attr_list = all([
                        this_admin,
                        this_admin.validate_password(password),
                        this_admin.active,
                    ])

                    if valid_attr_list:
                        # We use the Primary Key "id" as our identifier once someone has
                        # authenticated rather than the username.  You can change what is
                        # returned as the userid by altering what is passed to remember.
                        headers = remember(
                                    self.request,
                                    this_admin.id,
                                    max_age=60 * 60 * 5 # max_age is 5 hours
                                )

                        this_admin.last_login = datetime.now()
                        this_admin.throttle_num = 0

                        return HTTPFound(location="/_admin/", headers=headers)
                    else:
                        this_admin.throttle_num += 1

            # We don't care about telling user what
            # was wrong with the login
            # This is more of a security percaution
            error_message = "There was an error with your login credentials/account"

            if this_admin and this_admin.throttle_num >= 3:
                error_message = "You've been locked out of your account. Contact a sytem admin to resolve this issue."

        data = dict(
            error_message=error_message,
        )
        return data


class AdminHandler(AdminBaseHandler):

    @SYSTEM_ADMIN_REQUIRED()
    @view_config(renderer='/__admin__/admin_panel.jinja2', route_name='_admin_handler')
    def _admin_handler(self):

        admin = self.request.admin

        user_count = User.count()
        object_count = Object.count()
        global_tag_count = TagManager.count()

        big_data = dict(
            user_count=user_count,
            object_count=object_count,
            global_tag_count=global_tag_count,
        )

        data = dict(
            current_page='dashboard',
            admin=admin,
            big_data=big_data,
            SUPER_ADMIN=self.SUPER_ADMIN,
        )
        return data

    @SYSTEM_ADMIN_REQUIRED()
    @view_config(renderer='/__admin__/admin_stats.jinja2', route_name='_admin_handler_stats')
    def _admin_handler_stats(self):

        admin = self.request.admin

        user_count = User.count()
        object_count = Object.count()
        object_tag_count = ObjectTagManager.count()
        global_tag_count = TagManager.count()

        avg_posts_per_user = object_count / float(user_count)
        avg_tags_per_post = object_tag_count / float(object_count)
        avg_unique_tags_per_post = global_tag_count / float(object_count)
        tag_reuse = avg_unique_tags_per_post / float(avg_tags_per_post)
        avg_posts_per_global_tag = object_tag_count / float(global_tag_count)

        # object_tag_up_vote_count = ObjectTagVoteManager.object_tag_vote_count(up=True)
        # object_tag_down_vote_count = ObjectTagVoteManager.object_tag_vote_count(down=True)
        # object_tag_total_vote_count = ObjectTagVoteManager.object_tag_vote_count()
        object_up_vote_count = ObjectVoteManager.total_likes_in_system()
        object_total_vote_count = ObjectVoteManager.total_likes_in_system()
        avg_votes_on_object_per_individual_object_tag = object_total_vote_count / float(object_count)
        avg_votes_per_object = object_total_vote_count / float(object_tag_count)

        reported_object_count = ReportedContentManager.count()
        disabled_user_count = User.count(is_active=False)

        stats_package = dict(
            # Core
            user_count=user_count,
            object_count=object_count,
            global_tag_count=global_tag_count,

            # Basic
            avg_posts_per_user=avg_posts_per_user,
            avg_tags_per_post=avg_tags_per_post,
            avg_unique_tags_per_post=avg_unique_tags_per_post,
            tag_reuse=tag_reuse,
            avg_posts_per_global_tag=avg_posts_per_global_tag,

            # Object tags / votes
            object_up_vote_count=object_up_vote_count,
            object_total_vote_count=object_total_vote_count,
            avg_votes_on_object_per_individual_object_tag=avg_votes_on_object_per_individual_object_tag,
            avg_votes_per_object=avg_votes_per_object,

            # Bad things like reported content and disabled users
            reported_object_count=reported_object_count,
            disabled_user_count=disabled_user_count,

        )

        data = dict(
            current_page='statistics',
            admin=admin,
            stats_package=stats_package,
            SUPER_ADMIN=self.SUPER_ADMIN,
        )
        return data

    @SYSTEM_ADMIN_REQUIRED(super_admin=True)
    @view_config(renderer='/__admin__/new_admin.jinja2', route_name='_admin_handler_manage_admin')
    def _admin_handler_manage_admin(self):

        admin = self.request.admin

        p = self.request.params
        safeIn = Sanitize.safe_input

        error_message = success_message = None
        username = safeIn(p.get('username'))
        password = safeIn(p.get('password'), strip=False)
        super_admin = safeIn(p.get('super_admin'))

        if 'new-admin-button' in p:
            if username and password and super_admin in ["True", "False"]:

                exists = AdminManager.get(username=username)
                if exists:
                    error_message = "This username is already taken."

                if not error_message:

                    # Convert super admin to a bool
                    if super_admin == "True":
                        super_admin = True
                    elif super_admin == "False":
                        super_admin = False

                    # Add new admin
                    new_admin_data = dict(
                        username=username,
                        password=password,
                        super_admin=super_admin,
                    )
                    AdminManager.add(new_admin_data)
                    success_message = "Admin successfully added"
            else:
                error_message = "Please enter a username and password, and select value for super-admin"


        data = dict(
            current_page='manage_admin',
            admin=admin,
            error_message=error_message,
            success_message=success_message,
            all_admins=AdminManager.get_all(),
            SUPER_ADMIN=self.SUPER_ADMIN,
        )
        return data

    @SYSTEM_ADMIN_REQUIRED(super_admin=True)
    @view_config(renderer='/__admin__/admin_manage_reported.jinja2', route_name='_admin_handler_manage_reported')
    def _admin_handler_manage_reported(self):

        admin = self.request.admin

        all_reported_posts = ReportedContentManager.get_all()

        data = dict(
            current_page='manage_reported',
            admin=admin,
            render_items=all_reported_posts,
            top_offenders=ReportedContentManager.get_top_offenders(),
            get_user=Person.by_id,  # unbound method
            get_num_offenses=ReportedContentManager.get_total_offenses_for_user,  # unbound method
            SUPER_ADMIN=self.SUPER_ADMIN,
        )
        return data

    @SYSTEM_ADMIN_REQUIRED(super_admin=True)
    @view_config(renderer='/__admin__/admin_manage_users.jinja2', route_name='_admin_handler_manage_users')
    def _admin_handler_manage_users(self):

        admin = self.request.admin
        p = self.request.params
        error_message = None

        if 'search-user-id-button' in p:
            search_user_id = p.get('search_user_id')
            try:
                search_user_id = int(search_user_id)
            except ValueError:
                search_user_id = None

            if search_user_id:
                valid_user = User.get(search_user_id) or User.get(search_user_id, is_active=False)
                if valid_user:
                    return HTTPFound("/_admin/manage/users/{uid}/".format(uid=valid_user.id))
                else:
                    error_message = "This user could not be found"
            else:
                error_message = "Please enter a user ID to search for"

        data = dict(
            current_page='manage_users',
            admin=admin,
            all_banned_users=User.get_all_banned_users(),
            get_user=Person.by_id,  # unbound method
            get_num_offenses=ReportedContentManager.get_total_offenses_for_user,  # unbound method
            SUPER_ADMIN=self.SUPER_ADMIN,
            error_message=error_message,
        )
        return data

    @SYSTEM_ADMIN_REQUIRED(super_admin=True)
    @view_config(renderer='/__admin__/admin_manage_users_specific.jinja2', route_name='_admin_handler_manage_users_specific')
    def _admin_handler_manage_users_specific(self):

        user_id = self.url_match(url_match='user_id', arg_type="int")
        admin = self.request.admin

        valid_user = User.get(user_id) or User.get(user_id, is_active=False)
        if valid_user:
            data = dict(
                current_page='manage_users',
                admin=admin,
                user=valid_user,
                num_offenses=ReportedContentManager.get_total_offenses_for_user(valid_user.id),
                SUPER_ADMIN=self.SUPER_ADMIN,
            )
            return data
        else:
            return HTTPFound("/")
