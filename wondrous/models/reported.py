#!/usr/bin/env python
# -*- coding: utf-8 -*-

#
# Company: WONDROUS
# Created by: John Zimmerman
#
# MODELS/COMMENT.PY
#

from datetime import datetime

from sqlalchemy import asc
from sqlalchemy import BigInteger
from sqlalchemy import Boolean
from sqlalchemy import Column
from sqlalchemy import DateTime
from sqlalchemy import ForeignKey
from sqlalchemy import Unicode
from sqlalchemy import Integer
from sqlalchemy import UniqueConstraint

from sqlalchemy.orm import relationship

from wondrous.models import Base
from wondrous.models import DBSession

from wondrous.models.modelmixins import BaseMixin


class ReportedReason:
    (
        UNINTERESTING,      # 0
        MATURE,             # 1
        COPYRIGHT,          # 2
        SPAM                # 3
    ) = xrange(4)

class ReportedPost(Base,BaseMixin):
    post_id = Column(BigInteger, ForeignKey('post.id'), nullable=False, index=True)
    post = relationship("Post",backref="reports")
    user_id = Column(BigInteger, ForeignKey('user.id'), nullable=False, index=True)
    reason = Column(Integer, nullable=False)
    text = Column(Unicode, nullable=True)

    __table_args__ = (UniqueConstraint('user_id', 'post_id', name='user_reported_post'),)

class ReportedComment(Base,BaseMixin):
    comment_id = Column(BigInteger, ForeignKey('comment.id'), nullable=False, index=True)
    comment = relationship("Comment",backref="reports")
    user_id = Column(BigInteger, ForeignKey('user.id'), nullable=False, index=True)
    reason = Column(Integer, nullable=False)
    text = Column(Unicode, nullable=True)

    __table_args__ = (UniqueConstraint('user_id', 'comment_id', name='user_reported_comment'),)
