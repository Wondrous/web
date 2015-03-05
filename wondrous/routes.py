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
    'api',
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
    # config.add_route('auth_signup_step_handler',               '/signup/step/{step_num}/')
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

    # --- API -----
    config.add_route('api_user_login',                         '/api/user/login')       # POST
    config.add_route('api_signup_check',                       '/api/user/signupcheck') # POST
    config.add_route('api_user_vote',                          '/api/user/vote')        # POST

    config.add_route('api_post_vote',                          '/api/post/vote')        # POST

    config.add_route('api_user_name',                          '/api/me/name')          # POST
    config.add_route('api_user_username',                      '/api/me/username')      # POST

    config.add_route('api_user_deactivate',                    '/api/me/deactivate')    # POST
    config.add_route('api_user_password',                      '/api/me/password')      # POST
    config.add_route('api_user_picture',                       '/api/me/picture')       # POST
    config.add_route('api_user_me',                            '/api/me')               # GET

    config.add_route('api_user_info',                          '/api/user')             # GET
    config.add_route('api_user_followers',                     '/api/user/followers')   # GET
    config.add_route('api_user_following',                     '/api/user/following')   # GET
    config.add_route('api_user_visibility_toggle',             '/api/user/visibility')  # POST

    config.add_route('api_user_wall',                          '/api/wall')             # GET
    config.add_route('api_new_post',                           '/api/wall/new')         # POST
    config.add_route('api_repost',                             '/api/wall/repost')      # POST
    config.add_route('api_user_feed',                          '/api/feed')             # GET
    config.add_route('api_user_notification',                  '/api/notification')     # GET
    config.add_route('api_post_delete',                        '/api/post/delete')      # DELETE

    config.add_route('api_new_comment',                        '/api/comment/new')      # POST
    config.add_route('api_comment_delete',                     '/api/comment/delete')   # DELETE
    config.add_route('api_post_comments',                      '/api/post/comment')     # GET
    
    # Waitlist Routes
    config.add_route('api_refer_register',                     '/api/refer')            # POST
    config.add_route('api_refer_progress',                     '/api/refer/progress')   # GET

    # Search routes
    config.add_route('api_search_users',                       '/api/search/user')      # GET
    config.add_route('api_search_posts',                       '/api/search/post')      # GET

    # INDEX
    config.add_route('stuff1_handler',                         '/{stuff}')
    config.add_route('stuff_handler',                          '/{stuff}/{stuff1}')
    config.add_route('index_handler',                          '/')

    config.add_route('index_priority_feed_handler',            '/priority-feed/')

    # PROFILE -- MUST BE AT BOTTOM --
    # config.add_route('profile_handler',                        '/{username}/')
    # config.add_route('profile_tab_handler',                    '/{username}/{tab}/')

    config.add_static_view('/tmp', 'wondrous:templates')

    return config
