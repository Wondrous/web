#!/usr/bin/env python
# -*- coding: utf-8 -*-

#
# Company: WONDROUS
# Created by: Ziyuan Liu
#
# CONTROLLERS/SEARCHMANAGER.PY
#

from sqlalchemy import or_

from wondrous.models import (
    DBSession,
    Object,
    Post,
    User,
    Tag
)
from wondrous.controllers.votemanager import VoteManager

class SearchManager:

    @staticmethod
    def user_search_json(user,search,page):
        users = User.by_id_like(search, num=15).offset(page*15).limit(15).all()
        retval = []
        for user in users:
            data = user.json()
            if user.picture_object:
                data.update(user.picture_object.json())
            retval.append(data)
        return retval

    @staticmethod
    def post_search_json(user,search,page):
        posts = DBSession.query(Post).join(Object,Post.object_id==Object.id).\
            filter(or_(Object.subject.ilike("%{q}%".format(q=search)),Object.text.ilike("%{q}%".format(q=search)))).\
            filter(Post.set_to_delete==None).offset(page*15).limit(15).all()

        retval = []
        like_dict = VoteManager.get_likes_dict(user.id,posts)
        for post in posts:
            data = post.json()
            data.update({'liked':like_dict[post.id]})
            retval.append(data)
        return retval

    @staticmethod
    def tag_search_json(user,search,page):
        tags = [tag for tag in search.split(' ') if len(tag)]
        posts = DBSession.query(Post).join(Tag, Tag.post_id==Post.id).join(User, User.id==Post.user_id).filter(Post.set_to_delete==None).\
            filter(User.is_private==False).filter(Tag.tag_name.in_(tags)).offset(page*15).limit(15).all()

        retval = []
        like_dict = VoteManager.get_likes_dict(user.id,posts)
        for post in posts:
            data = post.json()
            data.update({'liked':like_dict[post.id]})
            retval.append(data)
        print "retval",posts
        return retval
