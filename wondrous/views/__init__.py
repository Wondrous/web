#!/usr/bin/env python
# -*- coding: utf-8 -*-

#
# Company: WONDROUS
# Created by: John Zimmerman
#
# VIEWS/__INIT__.PY
#

import os

from pyramid.response import Response

from pyramid.view import notfound_view_config
from pyramid.view import view_config

@notfound_view_config(append_slash=True)
def page_not_found(request):
    return Response("""
            <b>WONDROUS: 404 Error</b><br><br>
            You broke the internet! JK....Wondrous just can't find the page
            you're looking for. Sorry!
        """)

_here = os.path.dirname(__file__)
_robots = open(os.path.join(_here, '../static', 'robots.txt')).read()
_robots_response = Response(content_type='text/plain', body=_robots)

@view_config(name='robots.txt')
def robotstxt_view(context, request):
    return _robots_response