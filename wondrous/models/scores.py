#!/usr/bin/env python
# -*- coding: utf-8 -*-

#
# Company: WONDROUS
# Created by: Ziyuan Liu
#
# MODELS/SCORE.PY
#

import logging

import sqlalchemy as sa
import sqlalchemy.orm as sorm
from sqlalchemy.sql import func

from wondrous.models import (
    Base,
    DBSession
)

from wondrous.models.modelmixins import BaseMixin

class PostView(Base, BaseMixin):

    """
        This table is responsible for keeping track 
        of the unique views (i.e., clicks) on posts
    """

    user_id = sa.Column(sa.BigInteger,sa.ForeignKey('user.id'), nullable=False, index=True)
    user = sorm.relationship("User", backref=sorm.backref("post_views"))
    post_id = sa.Column(sa.BigInteger, sa.ForeignKey('post.id'), nullable=False, index=True)
    post = sorm.relationship("Post", backref=sorm.backref("post_views"))
    count = sa.Column(sa.BigInteger, default=1)


    @staticmethod
    def increment_or_create(user_id, post_id):

        """
            PURPOSE: Increment the view count by 1, 
            or create a new view count of 1, if none 
            had existed previously

            USE:
                @staticmethod, call like: PostView.increment_or_create(...)

            PARAMS:
                user_id : int : REQUIRED : The id of the user who uniquely clicked a post
                post_id : int : REQUIRED : The id of the post that got clicked

            RETURNS:
                unique_cnt : int : The unique number of views of a given post

            NOTE: We currently have a maximum threshold of 500 views.
            If the view count exceeds that threshold, we simply return
            our threshold value.
        """

        MAX_THRESHOLD = 500

        unique_cnt = all_cnt = 0
        pv = DBSession.query(PostView).filter_by(post_id=post_id, user_id=user_id).first()
        unique_cnt += DBSession.query(PostView).filter_by(post_id=post_id).count()

        if not pv:
            pv = PostView(post_id=post_id, user_id=user_id)
            unique_cnt += 1
        else:
            pv.count += 1
            all_cnt += 1
        
        DBSession.add(pv)

        if unique_cnt < MAX_THRESHOLD:
            scalar = DBSession.query(func.sum(PostView.count)).filter_by(post_id=post_id).scalar()
            if scalar is None:
                scalar = 1
            all_cnt += int(scalar)
            return MAX_THRESHOLD if all_cnt > MAX_THRESHOLD else all_cnt
        else:
            return unique_cnt
