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
    user_id = sa.Column(sa.BigInteger,sa.ForeignKey('user.id'), nullable=False, index = True)
    user = sorm.relationship("User", backref=sorm.backref("views"))
    post_id = sa.Column(sa.BigInteger,sa.ForeignKey('post.id'), nullable=False, index = True)
    post = sorm.relationship("Post", backref=sorm.backref("views"))
