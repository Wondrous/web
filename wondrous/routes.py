#!/usr/bin/env python
# -*- coding: utf-8 -*-

#
# Company: WONDROUS
# Created by: John Zimmerman
#
# ROUTES.PY
#

""" Create routes here, and they get returned into __init__.py main() """

# This is to prevent a user from
# trying to take the username "signup" or "tag".
# We deem these paths to be already taken.
TAKEN_PATHS = set([
    'ajax',
    'auth',
    'info',
    'login',
    'post',
    'search',
    'signup',
    'tag',
])

def build_routes(config):

    # --- DEV PURPOSES ONLY. *MUST REMOVE FOR PRODUCTION* ---
    config.add_route('exc_sql', '/exc_sql/')

    # AUTH
    # config.add_route('auth_login_handler',                   '/auth/login/{auth_type}/')
    # config.add_route('auth_login_handler2',                  '/auth/login/{auth_type}/{code}/')
    config.add_route('auth_logout_handler',                    '/auth/logout/')
    config.add_route('auth_delete_handler',                    '/auth/delete/')
    config.add_route('auth_verify_handler',                    '/auth/verify/{code}/')
    config.add_route('auth_is_banned_handler',                 '/auth/is_banned/{user_id}/')
    config.add_route('auth_waitlist',                          '/auth/waitlist/{action}/')
    config.add_route('auth_signup_handler',                    '/signup/')
    config.add_route('auth_signup_step_handler',               '/signup/step/{step_num}/')
    config.add_route('login_handler',                          '/login/')

    # SEARCH
    config.add_route('search_handler',                         '/search/')

    # TAG
    config.add_route('tag_handler',                            '/tag/{tag_name}/')

    # SINGLE POST
    config.add_route('post_handler',                           '/post/{object_id}/{object_uuid}/')

    # INFO
    config.add_route('info_about_handler',                     '/info/about/')
    config.add_route('info_tos_handler',                       '/info/tos/')
    config.add_route('info_privacy_handler',                   '/info/privacy/')
    config.add_route('info_feedback_handler',                  '/info/feedback/')
    config.add_route('info_settings_handler',                  '/info/settings/')
    config.add_route('info_delete_handler',                    '/info/delete/')
    config.add_route('info_account_delete_handler',            '/info/delete_account/')

    # AJAX
    config.add_route('ajax_notification',                      '/ajax/notification/{ajax_method}/')

    config.add_route('ajax_delete_comment_handler',            '/ajax/delete_comment/')
    config.add_route('ajax_delete_content_handler',            '/ajax/delete_content/')
    config.add_route('ajax_report_content_handler',            '/ajax/report_content/')
    config.add_route('ajax_hide_tutorial',                     '/ajax/hide_tutorial/')

    config.add_route('ajax_global_tag_vote_handler',           '/ajax/global_tag_vote/{ajax_method}/')
    config.add_route('ajax_object_vote_handler',               '/ajax/object_vote/{ajax_method}/')
    config.add_route('ajax_user_vote_handler',                 '/ajax/user_vote/{ajax_method}/')
    config.add_route('accept_user_request',                     '/ajax/user_vote_accept/')
    config.add_route('ajax_comment_handler',                   '/ajax/comment/')
    config.add_route('ajax_post_handler',                      '/ajax/post/{ajax_method}/')
    config.add_route('ajax_toggle_profile_visibility_handler', '/ajax/toggle_profile_visibility/')
    config.add_route('ajax_load_more_handler',                 '/ajax/load_more/')

    config.add_route('ajax_username_check_handler',            '/ajax/username_check/')

    config.add_route('ajax_async_load_item',                   '/ajax/async_load/')
    config.add_route('ajax_async_get_item_list',               '/ajax/async_get_item_list/{ajax_method}/')

    config.add_route('ajax_search_handler',                    '/ajax/search/')
    config.add_route('ajax_my_info',                           '/ajax/my_info/')
    config.add_route('ajax_upload_file_handler',               '/ajax/upload/{ajax_method}/')

    # INDEX
    config.add_route('index_handler',                          '/')
    config.add_route('index_priority_feed_handler',            '/priority-feed/')

    # PROFILE -- MUST BE AT BOTTOM --
    config.add_route('profile_handler',                        '/{username}/')
    config.add_route('profile_tab_handler',                    '/{username}/{tab}/')

    config.add_static_view('/tmp', 'wondrous:templates')

    return config
