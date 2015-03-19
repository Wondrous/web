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
    Tag,
    Vote
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
        ret = DBSession.query(Post,Vote).\
            join(Object,Post.object_id==Object.id).\
            outerjoin(Vote, (Vote.subject_id==Post.id)&(Vote.user_id==user.id)&(Vote.status==Vote.LIKED)).\
            filter(or_(Object.subject.ilike("%{q}%".format(q=search)),Object.text.ilike("%{q}%".format(q=search)))).\
            filter(Post.set_to_delete==None).\
            offset(page*15).limit(15).all()
        retval = []
        for post, vote in ret:
            data = post.json()
            data.update({'liked':vote!=None})
            retval.append(data)
        return retval

    @staticmethod
    def tag_search_json(user,search,page):
        tags = [tag for tag in search.split(' ') if len(tag)]
        ret = DBSession.query(Post,Vote).\
            join(Tag, Tag.post_id==Post.id).\
            join(User, User.id==Post.user_id).\
            outerjoin(Vote, (Vote.subject_id==Post.id)&(Vote.user_id==user.id)&(Vote.status==Vote.LIKED)).\
            filter(Post.set_to_delete==None).\
            filter(User.is_private==False).\
            filter(Tag.tag_name.in_(tags)).\
            offset(page*15).limit(15).all()

        retval = []
        for post, vote in ret:
            data = post.json()
            data.update({'liked':vote!=None})
            retval.append(data)
        return retval
