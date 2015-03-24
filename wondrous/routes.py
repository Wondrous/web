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
    "activate",
    "ajax",
    "api",
    "auth",
    "info",
    "landing",
    "login",
    "post",
    "progress",
    "refer",
    "reset",
    "reset_request",
    "search",
    "settings",
    "signup",
    "tag",
])

def build_routes(config):
    # --- DEV PURPOSES ONLY. *MUST REMOVE FOR PRODUCTION* ---
    config.add_route('exc_sql', '/exc_sql/')

    # AUTH
    # config.add_route('auth_login_handler',                   '/auth/login/{auth_type}/')
    # config.add_route('auth_login_handler2',                  '/auth/login/{auth_type}/{code}/')

    config.add_route('auth_verify_handler',                    '/auth/verify/{code}/')

    # SEARCH
    # config.add_route('search_handler',                         '/search/')

    # TAG
    # config.add_route('tag_handler',                            '/tag/{tag_name}/')

    # SINGLE POST
    # config.add_route('post_handler',                           '/post/{object_id}/{object_uuid}/')

    # INFO
    config.add_route('info_about_handler',                     '/info/about/')
    config.add_route('info_tos_handler',                       '/info/tos/')
    config.add_route('info_privacy_handler',                   '/info/privacy/')
    config.add_route('info_feedback_handler',                  '/info/feedback/')
    config.add_route('info_settings_handler',                  '/info/settings/')
    config.add_route('info_delete_handler',                    '/info/delete/')
    config.add_route('info_account_delete_handler',            '/info/delete_account/')

    # --- API -----
    config.add_route('api_user_login',                         '/api/user/login')       # POST
    config.add_route('api_signup_check',                       '/api/user/signupcheck') # POST
    config.add_route('api_user_vote',                          '/api/user/vote')        # POST

    config.add_route('api_logout',                             '/api/auth/logout')         # POST
    config.add_route('api_login',                              '/api/auth/login')          # POST
    config.add_route('api_register',                           '/api/auth/register')       # POST

    config.add_route('api_get_post',                           '/api/post')             # GET
    config.add_route('api_post_vote',                          '/api/post/vote')        # POST
    config.add_route('api_post_delete',                        '/api/post/delete')      # DELETE
    config.add_route('api_post_comments',                      '/api/post/comment')     # GET
    config.add_route('api_post_liked_users',                   '/api/post/likes')       # GET

    config.add_route('api_user_name',                          '/api/me/name')          # POST
    config.add_route('api_user_username',                      '/api/me/username')      # POST

    config.add_route('api_user_deactivate',                    '/api/me/deactivate')    # POST
    config.add_route('api_user_password',                      '/api/me/password')      # POST
    config.add_route('api_user_picture',                       '/api/me/picture')       # POST
    config.add_route('api_user_description',                       '/api/me/description')       # POST
    config.add_route('api_user_me',                            '/api/me')               # GET

    config.add_route('api_verify_user',                        '/api/me/verify')        # POST
    config.add_route('api_request_verify',                     '/api/me/verify/request')         # POST
    config.add_route('api_reset_password',                     '/api/me/reset')         # POST
    config.add_route('api_request_reset',                      '/api/me/reset/request')         # POST

    config.add_route('api_user_info',                          '/api/user')             # GET
    config.add_route('api_user_followers',                     '/api/user/followers')   # GET
    config.add_route('api_user_following',                     '/api/user/following')   # GET
    config.add_route('api_user_visibility_toggle',             '/api/user/visibility')  # POST

    config.add_route('api_user_wall',                          '/api/wall')             # GET
    config.add_route('api_new_post',                           '/api/wall/new')         # POST
    config.add_route('api_repost',                             '/api/wall/repost')      # POST
    config.add_route('api_user_feed',                          '/api/feed')             # GET

    config.add_route('api_user_notification',                  '/api/notification')     # GET
    config.add_route('api_seen_notification',                  '/api/notification/seen')     # POST

    config.add_route('api_new_comment',                        '/api/comment/new')      # POST
    config.add_route('api_comment_delete',                     '/api/comment/delete')   # DELETE

    # Waitlist Routes
    config.add_route('api_refer_register',                     '/api/refer')            # POST
    config.add_route('api_refer_progress',                     '/api/refer/progress')   # GET

    # Search routes
    config.add_route('api_search_users',                       '/api/search/user')      # GET
    config.add_route('api_search_posts',                       '/api/search/post')      # GET
    config.add_route('api_search_tags',                        '/api/search/tags')      # GET
    config.add_route('api_search_user_tags',                   '/api/search/users')      # GET

    config.add_route('api_global_trending',                     '/api/trending')      # GET
    config.add_route('api_user_discover',                       '/api/users')      # GET

    # Reported Comment/Post
    config.add_route('api_report_post',                         '/api/report/post')      # POST
    config.add_route('api_report_comment',                      '/api/report/comment')      # POST

    # ADMIN
    config.add_route('api_admin_auth',                          '/api/admin/auth')          # POST
    config.add_route('api_admin_query',                         '/api/admin/execute_query') # POST
    config.add_route('api_admin_reported_comment',              '/api/admin/reported_comments') # GET
    config.add_route('api_admin_reported_post',                 '/api/admin/reported_posts') # GET

    # INDEX
    config.add_route('index_handler1',                          '/{a}')
    config.add_route('index_handler3',                          '/{a}/')
    config.add_route('index_handler2',                          '/{a}/{b}')
    config.add_route('index_handler',                           '/')

    # config.add_route('index_priority_feed_handler',            '/priority-feed/')

    # PROFILE -- MUST BE AT BOTTOM --
    # config.add_route('profile_handler',                        '/{username}/')
    # config.add_route('profile_tab_handler',                    '/{username}/{tab}/')

    return config
