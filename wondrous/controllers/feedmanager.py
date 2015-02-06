#!/usr/bin/env python
# -*- coding: utf-8 -*-

#
# Company: WONDROUS
# Created by: Ziyuan Liu
#
# controllers/feedmanager.PY
#

from sqlalchemy import desc

from wondrous.models import (
    Feed,
    FeedPostLink,
    User,
    Post,
    Object
)

from wondrous.controllers.basemanager import BaseManager
from sqlalchemy.orm import joinedload

class FeedManager(BaseManager):

    @staticmethod
    def get_feed_posts(user_id):
        feed = Feed.by_kwargs(user_id=user_id).first()
        if feed:
            return [feed.post for feed in FeedPostLink.by_kwargs(feed_id=feed.id).all()]

    @classmethod
    def get_majority_posts(cls,feed_id,start=0,per_page=15):
        links = FeedPostLink.query.options(joinedload(FeedPostLink.post).joinedload(Post.object)).\
            order_by(desc(FeedPostLink.created_at)).filter_by(feed_id=feed_id).limit(per_page).offset(start).all()
        return links

    @classmethod
    def get_majority_posts_json(cls,feed_id,start=0,per_page=15):
        links = cls.get_majority_posts(feed_id,start,per_page)
        data = []
        for link in links:
            post = link.post
            post_dict = super(FeedManager,cls).model_to_json(post)
            post_dict.update(super(FeedManager,cls).model_to_json(post.object))
            data.append(post_dict)
        return data

    @classmethod
    def get_wall_posts(cls,start=0,per_page=15,**kwargs):
        posts = Post.query.options(joinedload(Post.object)).order_by(desc(Post.created_at)).\
            filter_by(**kwargs).limit(per_page).offset(start).all()

        return posts

    @classmethod
    def get_wall_posts_json(cls,start=0,per_page=15,**kwargs):
        posts = cls.get_wall_posts(start=start, per_page=per_page, **kwargs)
        data = []
        for post in posts:
            post_dict = super(FeedManager,cls).model_to_json(post)
            post_dict.update(super(FeedManager,cls).model_to_json(post.object))
            data.append(post_dict)
        return data
