#!/usr/bin/env python
# -*- coding: utf-8 -*-

#
# Company: WONDROUS
# Created by: Ziyuan Liu
#
# CONTROLLERS/TAGMANAGER.PY
#

from wondrous.controllers.basemanager import BaseManager

from wondrous.models import (
    DBSession,
    Post,
    Tag,
)

from wondrous.utilities.global_config import SYS_CONTEXT_TAGS

from datetime import datetime, timedelta

from sqlalchemy import func, desc

class TagManager(BaseManager):

    ## DEPRECATED
    @staticmethod
    def by_post_id(post_id):
        # TODO run core SQL instead, better yet, run Psycopg2 core
        links = Tag.by_kwargs(post_id=post_id).all()
        return [link.tag for link in links]

    @staticmethod
    def by_name(tag_name):
        return Tag.by_kwargs(tag_name=tag_name).first()

    @staticmethod
    def by_name_like(name, page=0, per_page=50):
           return Tag.query.filter(Tag.tag_name.ilike("{q}%".format(q=name))).\
                            filter(~Tag.tag_name.in_(SYS_CONTEXT_TAGS)).limit(per_page).offset(page*per_page).all()
    # END DEPRECATED


    @staticmethod
    def get_trending_tags_json(user, time=timedelta(hours=6000),per_page=10,page=0):
        earliest = datetime.now()-time
        retval = []
        for count, tag_name in DBSession.query(func.count(func.lower(Tag.tag_name)), func.lower(Tag.tag_name)).\
            join(Post, Post.id==Tag.post_id).\
            filter(Post.set_to_delete==None).\
            filter(Tag.created_at>earliest).\
            group_by(func.lower(Tag.tag_name)).\
            order_by(desc(func.count(func.lower(Tag.tag_name)))).\
            limit(per_page).offset(per_page*page).all():
            retval.append({"tag_name":tag_name,"count":count})
        # print retval
        return retval
