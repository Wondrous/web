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

from sqlalchemy.orm import relationship

from wondrous.models import Base
from wondrous.models import DBSession

from wondrous.models.modelmixins import BaseMixin


class ReportedPost(Base,BaseMixin):
    post_id = Column(BigInteger, ForeignKey('post.id'), nullable=False)
    post = relationship("Post",backref="reports")
    user_id = Column(BigInteger, ForeignKey('user.id'), nullable=False)
    additional_detail = Column(Unicode, nullable=False)

class ReportedComment(Base,BaseMixin):
    comment_id = Column(BigInteger, ForeignKey('comment.id'), nullable=False)
    comment = relationship("Comment",backref="reports")
    user_id = Column(BigInteger, ForeignKey('user.id'), nullable=False)
    additional_detail = Column(Unicode, nullable=False)
