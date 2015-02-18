#!/usr/bin/env python
# -*- coding: utf-8 -*-

#
# Company: WONDROUS
# Created by: Ziyuan Liu
#
# CONTROLLERS/FEEDMANAGER.PY
#

from sqlalchemy import desc
from sqlalchemy.orm import joinedload

from wondrous.controllers.basemanager import BaseManager
from wondrous.controllers.votemanager import VoteManager

from wondrous.models import (
    Feed,
    FeedPostLink,
    Post,
    User,
)

import logging

class FeedManager(BaseManager):
    MAJORITY, PRIORITY = range(2)

    @staticmethod
    def get_feed_posts(user_id):
        feed = Feed.by_kwargs(user_id=user_id).first()
        if feed:
            return [feed.post for feed in FeedPostLink.by_kwargs(feed_id=feed.id).all()]

    @classmethod
    def get_majority_posts(cls, feed_id, page=0, per_page=15):
        links = FeedPostLink.query.options(joinedload(FeedPostLink.post).joinedload(Post.object)).\
            order_by(desc(FeedPostLink.created_at)).filter_by(feed_id=feed_id).limit(per_page).offset(page).all()
        return links

    @classmethod
    def get_majority_posts_json(cls, person, page=0):
        # TODO public view
        if not person:
            return []
        feed_id = person.user.feed.id
        links = cls.get_majority_posts(feed_id,page)
        data = []
        for link in links:
            post = link.post
            if not post.is_hidden and post.is_active:
                post_dict = super(FeedManager, cls).model_to_json(post)
                post_dict.update({"name": post.user.person.ascii_name})
                post_dict.update({"username": post.user.username})

                if post.object:
                    post_dict.update(super(FeedManager, cls).model_to_json(post.object))
                data.append(post_dict)
        return data

    @classmethod
    def get_priority_posts_json(cls, person, page=0):
        pass

    @classmethod
    def get_feed_posts_json(cls, person, feed_type, page=0):
        feed_type = int(feed_type)
        if feed_type == cls.MAJORITY:
            return cls.get_majority_posts_json(person,page)
        elif feed_type == cls.PRIORITY:
            return cls.get_priority_posts_json(person,page)

    @classmethod
    def get_wall_posts(cls, page=0, per_page=15, **kwargs):
        posts = Post.query.order_by(desc(Post.created_at)).filter_by(**kwargs).limit(per_page).offset(page*per_page).all()
        return posts

    @classmethod
    def get_wall_posts_json(cls, person, user_id=None, username=None, page=0):
        if (not user_id and not username) or person==None:
            return []
        if user_id:
            user = User.by_id(user_id)
        elif username:
            user = User.by_kwargs(username=username).first()


        if not user:
            return []

        posts = []

        # If the user is public, we dont need to check for relationship, else do
        # If we are logged in and the user happens to be private, we have to check for relationship
        if (not user.is_private and not user.is_banned and user.is_active) or \
            (user.is_private and not user.is_banned and user.is_active and person \
            and VoteManager.is_following(person.user.id,user.id)):

            posts = cls.get_wall_posts(page=page, user_id=user.id)

        data = []
        for post in posts:
            post_dict = super(FeedManager,cls).model_to_json(post)
            post_dict.update(super(FeedManager,cls).model_to_json(post.object))
            post_dict.update({"name":post.user.person.ascii_name})
            post_dict.update({"username":post.user.username})
            data.append(post_dict)
        return data
