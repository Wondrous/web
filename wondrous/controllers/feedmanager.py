#!/usr/bin/env python
# -*- coding: utf-8 -*-

#
# Company: WONDROUS
# Created by: Ziyuan Liu
#
# controllers/feedmanager.PY
#

from wondrous.models import (
    Feed,
    FeedPostLink,
    User
)

class FeedManager(object):

    @staticmethod
    def get_feed_posts(user_id):
        user = User.by_id(user_id)
        if user:
            return FeedPostLink.by_kwargs(feed_id=user.feed.id).all()
