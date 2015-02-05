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
    PostTagLink
)

from wondrous.utilities.global_config import SYS_CONTEXT_TAGS

class TagManager(object):

    @staticmethod
    def by_post_id(post_id):
        # TODO run core SQL instead, better yet, run Psycopg2 core
        links = PostTagLink.by_kwargs(post_id=post_id).all()
        return [link.tag for link in links]

    @staticmethod
    def by_name(tag_name):
        return Tag.by_kwargs(tag_name=tag_name).first()

    @staticmethod
    def get_all_objects_by_tag_name(tag_name):
        # TODO paginate probably

        tag = Tag.by_kwargs(tag_name=tag_name).first()
        if tag:
            links = PostTagLink.by_kwargs(tag_id=tag.id).all()
            return [link.post_id for link in links]

    @staticmethod
    def by_name_like(name, num=50):
           return Tag.query.filter(Tag.tag_name.ilike("{q}%".format(q=name))).\
                            filter(~Tag.tag_name.in_(SYS_CONTEXT_TAGS)).limit(num).all()
