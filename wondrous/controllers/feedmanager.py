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
    MAJORITY, PRIORITY = range(2)

    @staticmethod
    def get_feed_posts(user_id):
        feed = Feed.by_kwargs(user_id=user_id).first()
        if feed:
            return [feed.post for feed in FeedPostLink.by_kwargs(feed_id=feed.id).all()]

    @classmethod
    def get_majority_posts(cls,feed_id,page=0,per_page=15):
        links = FeedPostLink.query.options(joinedload(FeedPostLink.post).joinedload(Post.object)).\
            order_by(desc(FeedPostLink.created_at)).filter_by(feed_id=feed_id).filter_by(is_hidden=False).limit(per_page).offset(page).all()
        return links

    @classmethod
    def get_majority_posts_json(cls,person,page=0):
        feed_id = person.user.feed.id
        links = cls.get_majority_posts(feed_id,page)
        data = []
        for link in links:
            post = link.post
            post_dict = super(FeedManager,cls).model_to_json(post)
            post_dict.update(super(FeedManager,cls).model_to_json(post.object))
            data.append(post_dict)
        return data

    @classmethod
    def get_priority_posts_json(cls,person,page=0):
        pass

    @classmethod
    def get_feed_posts_json(cls,person,feed_type,page=0):
        if feed_type == cls.MAJORITY:
            return cls.get_majority_posts_json(person,page)
        elif feed_type == cls.PRIORITY:
            return cls.get_priority_posts_json(person,page)

    @classmethod
    def get_wall_posts(cls,page=0,per_page=15,**kwargs):
        posts = Post.query.order_by(desc(Post.created_at)).filter_by(**kwargs).limit(per_page).offset(page*per_page).all()
        return posts

    @classmethod
    def get_wall_posts_json(cls,person,user_id,page=0):
        user = User.by_id(user_id)
        if not user:
            return []

        posts = []

        # If the user is public, we dont need to check for relationship, else do
        # If we are logged in and the user happens to be private, we have to check for relationship
        if (not user.is_private and not user.is_banned and user.is_active) or\
            (user.is_private and not user.is_banned and user.is_active and person \
            and VoteManager.is_following(person.user.id,user_id)):

            posts = cls.get_wall_posts(page=page, user_id = user_id)

        data = []
        for post in posts:
            post_dict = super(FeedManager,cls).model_to_json(post)
            post_dict.update(super(FeedManager,cls).model_to_json(post.object))
            data.append(post_dict)
        return data
