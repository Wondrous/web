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

from wondrous.models.modelmixins import BaseMixin

class PostView(Base, BaseMixin):

    """
        Vote keeps track of relationship status and data
        ALWAYS between an user and user/object

        If VOTE_TYPE is 0, the user is building a relationship with an object
        else 1, the user is building a relationship with another user

        This is always a one to one (one to many abstracted)
        Vote is similar to an intermediary model

    """
    user_id = sa.Column(sa.BigInteger,sa.ForeignKey('user.id'), nullable=False)
    user = sorm.relationship("User", backref=sorm.backref("views"))
    post_id = sa.Column(sa.BigInteger,sa.ForeignKey('post.id'), nullable=False)
    post = sorm.relationship("Post", backref=sorm.backref("views"))
