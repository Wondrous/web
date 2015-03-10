#!/usr/bin/env python
# -*- coding: utf-8 -*-

#
# Company: WONDROUS
# Created by: Ziyuan Liu
#
# CONTROLLERS/FEEDMANAGER.PY
#

from sqlalchemy import desc

from wondrous.controllers.basemanager import BaseManager
from wondrous.controllers.votemanager import VoteManager

from wondrous.models import (
    Feed,
    FeedPostLink,
    Post,
    DBSession,
    User,
)

from wondrous.utilities.general_utilities import title_case

class FeedManager(BaseManager):
    MAJORITY, PRIORITY = range(2)

    @staticmethod
    def get_feed_posts(user_id):
        feed = Feed.by_kwargs(user_id=user_id).first()
        if feed:
            return [feed.post for feed in FeedPostLink.by_kwargs(feed_id=feed.id).all()]

    @classmethod
    def get_majority_posts(cls, feed_id, page=0, per_page=15):

        posts = Post.query.join(FeedPostLink, Post.id==FeedPostLink.post_id).filter(Post.set_to_delete==None).filter(FeedPostLink.feed_id==feed_id).\
            order_by(desc(FeedPostLink.created_at)).filter(Post.is_active==True).distinct().limit(per_page).offset(page*per_page).all()
        return posts


    @classmethod
    def get_majority_posts_json(cls, user, page=0):
        # TODO public view
        if not user:
            return []
        page = int(page)
        feed_id = user.feed.id
        posts = cls.get_majority_posts(feed_id,page)
        data = []
        for post in posts:
            if not post.is_hidden and post.is_active and not post.set_to_delete:
                post_dict = post.json()
                if post_dict:
                    post_dict.update({'liked':VoteManager.is_liking(user.id,post.id)})
                    data.append(post_dict)
        return data

    @classmethod
    def get_priority_posts_json(cls, user, page=0):
        pass

    @classmethod
    def get_feed_posts_json(cls, user, feed_type, page=0):
        page = int(page)
        feed_type = int(feed_type)
        if feed_type == cls.MAJORITY:
            return cls.get_majority_posts_json(user,page)
        elif feed_type == cls.PRIORITY:
            return cls.get_priority_posts_json(user,page)

    @classmethod
    def get_wall_posts(cls, page=0, per_page=15, **kwargs):
        page = int(page)
        posts = DBSession.query(Post).order_by(desc(Post.created_at)).filter_by(**kwargs).filter_by(set_to_delete=None).limit(per_page).offset(page*per_page).all()
        return posts

    @classmethod
    def get_wall_posts_json(cls, user, user_id=None, username=None, page=0):
        page = int(page)
        if (not user_id and not username) or user==None:
            return []
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
            (profile_user.is_private and not profile_user.is_banned and profile_user.is_active and profile_user \
            and VoteManager.is_following(profile_user.id,profile_user.id)):

            posts = cls.get_wall_posts(page=page, user_id=profile_user.id)

        data = []
        for post in posts:
            if not post.is_hidden and post.is_active and not post.set_to_delete:
                post_dict = post.json()
                if post_dict:
                    post_dict.update({'liked':VoteManager.is_liking(user.id,post.id)})
                    data.append(post_dict)
        return data
