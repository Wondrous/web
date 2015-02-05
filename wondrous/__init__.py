#!/usr/bin/env python
# -*- coding: utf-8 -*-

#
# Company: WONDROUS
# Created by: John Zimmerman
#
# __INIT__.PY
#

from os.path import abspath
from os.path import dirname

from pyramid.config import Configurator

from pyramid.authentication import AuthTktAuthenticationPolicy
from pyramid.authorization import ACLAuthorizationPolicy

from wondrous.models import initialize_sql

from wondrous.routes import build_routes
from wondrous.admin_routes import build_admin_routes

from wondrous.utilities.user_utilities import AuthHelper

MAIN_AUTH_TKN  = '23dkjDFJ23jjfSDFJ34jfQWK23jjfSDFDwJzXXZZZ33hsd8s8s8fsdjkfhjh568dfsks'
ADMIN_AUTH_TKN = 'm2kjn23fkjSH345GIIHW122F3EIHGI345DF7G34533HFuhe241wfiug34hfswoihe09209209skhsSDFHSF'

import logging

logging.basicConfig(level=logging.DEBUG,
    format='%(filename)s:%(lineno)-4d: %(message)s'
)

def main_app(global_config, **settings):


    """ This function returns a Pyramid WSGI application. """

    settings['app_root'] = abspath(dirname(dirname(__file__)))
    initialize_sql(settings)

    config = Configurator(settings=settings)
    config = build_routes(config)  # URL map on routes.py

    authn_policy = AuthTktAuthenticationPolicy(MAIN_AUTH_TKN, hashalg='sha512')
    authz_policy = ACLAuthorizationPolicy()

    config.set_authentication_policy(authn_policy)  # Needed for global user object
    config.set_authorization_policy(authz_policy)   # Needed becasue I have an Authentication policy

    config.add_request_method(AuthHelper.get_person, 'person', reify=True)  # GLOBAL USER OBJECT
    config.add_static_view('static', 'static', cache_max_age=3600)
    config.include('pyramid_jinja2')
    config.add_jinja2_search_path("wondrous:templates")

    config.scan(ignore=[
        "wondrous.views.admin",
        "wondrous.views.ajax_admin",
        "wondrous.views.api_views"
    ])

    return config.make_wsgi_app()


def admin_app(global_config, **settings):

    """ This function returns a Pyramid WSGI application. """

    settings['app_root'] = abspath(dirname(dirname(__file__)))
    initialize_sql(settings)

    config = Configurator(settings=settings)
    config = build_admin_routes(config)  # URL map on admin_routes.py

    authn_policy = AuthTktAuthenticationPolicy(ADMIN_AUTH_TKN, hashalg='sha512')
    authz_policy = ACLAuthorizationPolicy()

    config.set_authentication_policy(authn_policy)  # Needed for global user object
    config.set_authorization_policy(authz_policy)   # Needed becasue I have an Authentication policy

    config.add_request_method(AuthHelper.get_admin, 'admin', reify=True)  # GLOBAL ADMIN OBJECT

    config.add_static_view('static', 'static', cache_max_age=3600)
    config.include('pyramid_jinja2')
    config.add_jinja2_search_path("wondrous:templates")

    config.scan(ignore=[
        "wondrous.views.main",
        "wondrous.views.ajax_main",
        "wondrous.views.api_views"
    ])

    return config.make_wsgi_app()
