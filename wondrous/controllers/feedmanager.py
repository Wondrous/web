#!/usr/bin/env python
# -*- coding: utf-8 -*-

#
# Company: WONDROUS
# Created by: Ziyuan Liu
#
# CONTROLLERS/FEEDMANAGER.PY
#

from sqlalchemy import desc
from sqlalchemy.orm import aliased

from wondrous.controllers.basemanager import BaseManager
from wondrous.controllers.votemanager import VoteManager

from wondrous.models import (
    Feed,
    FeedPostLink,
    Post,
    DBSession,
    User,
    Vote
)

class FeedManager(BaseManager):
    MAJORITY, PRIORITY = range(2)

    @classmethod
    def get_majority_posts_json(cls, user, page=0):
        if not user:
            return []
        page = int(page)
        feed_id = user.feed.id
        v1 = aliased(Vote)
        retval = DBSession.query(Post, Vote).\
            join(FeedPostLink, (FeedPostLink.post_id==Post.id)&(FeedPostLink.feed_id==feed_id)).\
            join(User, (User.id==Post.user_id)|(User.id==Post.owner_id)).\
            outerjoin(Vote, (Vote.subject_id==Post.id)&(Vote.user_id==user.id)&(Vote.status==Vote.LIKED)).\
            outerjoin(v1, (((Post.owner_id==v1.subject_id )|(Post.user_id==v1.subject_id))&((v1.status==6) or (v1.status==7)))).\
            filter((User.is_private==False)|(v1.user_id==user.id)).\
            filter(Post.set_to_delete==None).\
            order_by(desc(Post.created_at)).distinct().limit(15).offset(page*15).all()


        data = []

        for post, vote in retval:
            if not post.is_hidden and post.is_active and not post.set_to_delete:
                post_dict = post.json()
                post_dict.update({'liked':vote!=None})
                data.append(post_dict)
        return data

    @classmethod
    def get_priority_posts_json(cls, user, page=0):
        pass

    @classmethod
    def get_public_posts_json(cls):
        posts = DBSession.query(Post).join(User,((User.id==Post.user_id)|(User.id==Post.owner_id))&(User.is_private==False)).\
            filter(User.is_private==False).\
            filter(Post.set_to_delete==None).\
            filter(Post.is_active==True).\
            filter(Post.is_hidden==False).\
            order_by(desc(Post.view_count)).limit(20).offset(0).all()
        data = []
        for post in posts:
            post_dict = post.json()
            data.append(post_dict)
        return data

    @classmethod
    def get_feed_posts_json(cls, feed_type, page=0, user = None):
        if not user:
            return cls.get_public_posts_json()

        page = int(page)
        feed_type = int(feed_type)
        if feed_type == cls.MAJORITY:
            return cls.get_majority_posts_json(user,page)
        elif feed_type == cls.PRIORITY:
            return cls.get_priority_posts_json(user,page)

    @classmethod
    def get_wall_posts_json(cls, user=None, user_id=None, username=None, page=0):
        page = int(page)

        if (not user_id and not username):
            return []

        if user:
            my_user_id = user.id
        else:
            my_user_id = -1

        if user_id:
            profile_user = User.by_id(user_id)
        elif username:
            profile_user = User.by_kwargs(username=username).first()

        if not profile_user:
            return []

        posts = []


        # If the profile_user is public, we dont need to check for relationship, else do
        # If we are logged in and the profile_user happens to be private, we have to check for relationship
        if (not profile_user.is_private and not profile_user.is_banned and profile_user.is_active) or \
            (profile_user.is_private and not profile_user.is_banned and profile_user.is_active and profile_user):
            v1 = aliased(Vote)

            # based on
            # SELECT DISTINCT post.id AS post_id, v1.id AS vote_id
            # FROM post
            # JOIN "user" ON "user".id = post.owner_id or "user".id = post.user_id
            # JOIN Vote as v2
            #     ON
            #     (post.owner_id is null) or
            #     (post.owner_id is not null and post.owner_id="user".id and "user".is_private=false) or
            #     ((post.owner_id is not null) and (v2.user_id=17) AND (v2.subject_id = post.owner_id) and (v2.status=6 or v2.status=7))
            #
            # LEFT OUTER JOIN vote as v1
            #     ON v1.subject_id = post.id AND v1.user_id = 17 AND v1.status = 1
            #
            # WHERE post.user_id = 1 AND post.set_to_delete IS NULL ;
            #

            retval = DBSession.query(Post,Vote).\
                join(User, (User.id==Post.user_id)|(User.id==Post.owner_id)).\
                outerjoin(Vote, (Vote.subject_id==Post.id)&(Vote.user_id==my_user_id)&(Vote.status==Vote.LIKED)).\
                outerjoin(v1, (((Post.owner_id==v1.subject_id )|(Post.user_id==v1.subject_id))&((v1.status==6) or (v1.status==7)))).\
                filter(Post.user_id==profile_user.id).\
                filter((User.is_private==False)|(v1.user_id==user.id)).\
                filter(Post.set_to_delete==None).\
                order_by(desc(Post.created_at)).distinct().limit(15).offset(page*15).all()

            for post, vote in retval:
                if not post.is_hidden and post.is_active and not post.set_to_delete:
                    post_dict = post.json()
                    post_dict.update({'liked':vote!=None})
                    posts.append(post_dict)
        return posts
