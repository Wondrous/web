#!/usr/bin/env python
# -*- coding: utf-8 -*-

#
# Company: WONDROUS
# Created by: John Zimmerman
#
# MODELS/TAG.PY
#

from sqlalchemy import (
	BigInteger,
	Column,
	ForeignKey,
	Unicode,
)

from sqlalchemy.orm import relationship

from wondrous.models import Base

from wondrous.models.modelmixins import BaseMixin


class Tag(Base,BaseMixin):
	tag_name = Column(Unicode, nullable=False, unique=True)
	post_id = Column(BigInteger, ForeignKey('post.id'), index=True)

	@classmethod
	def by_name_like(cls, key, num=50):
		return cls.query.filter(cls.tag_name.ilike("%{q}%".format(q=key))).limit(num)
