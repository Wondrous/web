#!/usr/bin/env python
# -*- coding: utf-8 -*-

#
# Company: WONDROUS
# Created by: John Zimmerman
#
# MODELS/VOTE.PY
#
import logging
import sqlalchemy as sa
import sqlalchemy.orm as sorm
from datetime import datetime


from wondrous.models import (
    Base,
    DBSession
)

from sqlalchemy.sql import func

from wondrous.models.modelmixins import BaseMixin

class PostView(Base, BaseMixin):
    user_id = sa.Column(sa.BigInteger,sa.ForeignKey('user.id'), nullable=False, index = True)
    user = sorm.relationship("User", backref=sorm.backref("post_views"))
    post_id = sa.Column(sa.BigInteger,sa.ForeignKey('post.id'), nullable=False, index = True)
    post = sorm.relationship("Post", backref=sorm.backref("post_views"))
    count = sa.Column(sa.BigInteger,default=1)


    @staticmethod
    def increment_or_create(user_id,post_id):
        unique_ctn = all_ctn = 0
        pv = DBSession.query(PostView).filter_by(post_id=post_id,user_id=user_id).first()
        unique_ctn += DBSession.query(PostView).filter_by(post_id=post_id).count()

        if not pv:
            pv = PostView(post_id=post_id,user_id=user_id)
            unique_ctn += 1
        else:
            pv.count += 1
            all_ctn += 1
        DBSession.add(pv)

        if unique_ctn<500:

            scalar = DBSession.query(func.sum(PostView.count)).filter_by(post_id=post_id).scalar()
            if scalar is None:
                scalar = 1
            all_ctn += int(scalar)
            return 500 if all_ctn>500 else all_ctn
        else:
            return unique_ctn
