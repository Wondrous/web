#!/usr/bin/env python
# -*- coding: utf-8 -*-

#
# Company: WONDROUS
# Created by: Ziyuan Liu
#
# CONTROLLERS/SEARCHMANAGER.PY
#

from sqlalchemy import or_, func
from sqlalchemy.orm import aliased

from wondrous.models import (
    DBSession,
    Object,
    Post,
    User,
    Tag,
    UserTag,
    Vote
)

from wondrous.controllers.accountmanager import AccountManager
from wondrous.controllers.votemanager import VoteManager

class SearchManager:

    @staticmethod
    def user_search_json(user,search,page):
        search = search.lower()
        users = DBSession.query(User).\
                join(Vote,(Vote.subject_id==User.id)&((Vote.status==Vote.FOLLOWED) | (Vote.status==Vote.TOPFRIEND))).\
                filter(\
                    (func.lower(User.username).ilike("%{0}%".format(search)))|\
                    (func.lower(User.email).ilike("%{0}%".format(search)))|\
                    (func.lower(User.description).ilike("%{0}%".format(search)))|\
                    (func.lower(User.name).ilike("%{0}%".format(search)))|\
                    (func.lower(User.ascii_name).ilike("%{0}%".format(search)))\
                ).\
                filter((User.is_private==False)|(Vote.user_id==user.id)).\
                distinct().offset(page*15).limit(15).all()

        retval = []
        for user in users:
            data = user.json()
            if user.picture_object:
                data.update(user.picture_object.json())
            retval.append(data)
        return retval

    @staticmethod
    def post_search_json(user,search,page):
        v1 = aliased(Vote)
        ret = DBSession.query(Post,Vote).\
            join(Object,Post.object_id==Object.id).\
            join(User, User.id==Post.user_id).\
            outerjoin(Vote, (Vote.subject_id==Post.id)&(Vote.user_id==user.id)&(Vote.status==Vote.LIKED)).\
            outerjoin(v1, (((Post.owner_id==v1.subject_id )|(Post.user_id==v1.subject_id))&((v1.status==6) or (v1.status==7)))).\
            filter(or_(Object.subject.ilike("%{q}%".format(q=search)),Object.text.ilike("%{q}%".format(q=search)))).\
            filter(Post.set_to_delete==None).\
            filter((User.is_private==False)|(v1.user_id==user.id)).\
            offset(page*15).limit(15).all()
        retval = []
        for post, vote in ret:
            data = post.json()
            data.update({'liked':vote!=None})

            # Add in the wondrous score
            score = AccountManager.calculate_wondrous_score(post.user)
            if score:
                score, view_count, like_count = score
                data.update({'wondrous_score': score})

            retval.append(data)
        return retval

    @staticmethod
    def user_tag_search_json(user, search, page):
        tags = [tag.lower() for tag in search.split(' ') if len(tag)]
        users = DBSession.query(User).\
                join(UserTag, UserTag.user_id==User.id).\
                join(Vote, (User.is_private==False) | \
                ( (Vote.user_id==user.id) \
                   & ((Vote.subject_id == User.id)) & \
                    ((Vote.status==Vote.FOLLOWED) | (Vote.status==Vote.TOPFRIEND)) ))

        if len(tags) > 0:
            users = users.filter(func.lower(UserTag.tag_name).in_(tags)).distinct()

        users = users.offset(page*15).limit(15).all()

        retval = []
        for u in users:
            data = u.json()
            retval.append(data)

        return retval

    @staticmethod
    def tag_search_json(user,search,page):
        tags = [tag.lower() for tag in search.split(' ') if len(tag)]
        v1 = aliased(Vote)
        ret = DBSession.query(Post,Vote).\
            join(Tag, Tag.post_id==Post.id).\
            join(User, User.id==Post.user_id).\
            outerjoin(Vote, (Vote.subject_id==Post.id)&(Vote.user_id==user.id)&(Vote.status==Vote.LIKED)).\
            outerjoin(v1, (((Post.owner_id==v1.subject_id )|(Post.user_id==v1.subject_id))&((v1.status==6) or (v1.status==7)))).\
            filter(Post.set_to_delete==None).\
            filter((User.is_private==False)|(v1.user_id==user.id)).\
            filter(func.lower(Tag.tag_name).in_(tags)).\
            offset(page*15).limit(15).all()

        retval = []
        for post, vote in ret:
            data = post.json()
            data.update({'liked':vote!=None})

            # Add in the wondrous score
            score = AccountManager.calculate_wondrous_score(post.user)
            if score:
                score, view_count, like_count = score
                data.update({'wondrous_score': score})

            retval.append(data)
        return retval
