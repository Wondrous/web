#!/usr/bin/env python
# -*- coding: utf-8 -*-

#
# Company: WONDROUS
# Created by: Ziyuan Liu
#
# controllers/tagmanager.PY
#

from wondrous.models import (
    Tag,
    ObjectTagLink
)

class TagManager(object):

    @staticmethod
    def by_object_id(object_id):
        # TODO run core SQL instead, better yet, run Psycopg2 core
        links = ObjectTagLink.by_kwargs(object_id=object_id).all()
        return [link.tag for link in links]

    @staticmethod
    def by_name(tag_name):
        return Tag.by_kwargs(tag_name=tag_name).all()
