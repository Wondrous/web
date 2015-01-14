#!/usr/bin/env python
# -*- coding: utf-8 -*-

#
# Company: WONDROUS
# Created by: John Zimmerman
#
# MODELS/TAG.PY
#

from datetime import datetime

from sqlalchemy import BigInteger
from sqlalchemy import Column
from sqlalchemy import DateTime
from sqlalchemy import ForeignKey
from sqlalchemy import func
from sqlalchemy import Unicode

from sqlalchemy.orm import relationship

from wondrous.models import Base
from wondrous.models import DBSession

from wondrous.utilities.global_config import SYS_CONTEXT_TAGS

SYS_CONTEXT_TAGS = SYS_CONTEXT_TAGS.values()

class ObjectTag(Base):

	"""Tags used on Objects"""

	__tablename__ = 'object_tag'

	id = Column(BigInteger, primary_key=True)
	object_id = Column(BigInteger, ForeignKey('object.id'), nullable=False)
	global_tag_id = Column(BigInteger, ForeignKey('global_tag.id'), nullable=False)

	global_tag = relationship('GlobalTag', foreign_keys='ObjectTag.global_tag_id')

class ObjectTagManager(object):

	@staticmethod
	def add(object_tag_data):
		
		"""
			PURPOSE: Add a new ObjectTag into the database

			USE: Call like: ObjectTagManager.add(<dict>)

			PARAMS: 1 param, a dict, with the key as column name:
				- object_id : the id of the Object that is being tagged
				- global_tag_id : the id of the global-tag
								  which is being tagged to an object

			RETURNS: None
		"""

		new_object_tag = ObjectTag()

		new_object_tag.object_id 	 = object_tag_data['object_id']
		new_object_tag.global_tag_id = object_tag_data['global_tag_id']

		DBSession.add(new_object_tag)

	@staticmethod
	def get(object_id, context_tag_id):

		"""
			PURPOSE: Get a ObjectTag from the database based
			on boths the object.id and that objects context

			USE: Call like: ObjectTagManager.get(<int>, <int>)

			PARAMS: 2 required parameters:
				- object_id   	 : int : REQUIRED : The id of the object that was tagged
				- context_tag_id : int : REQUIRED : The id of the current context, which
													is utimately the ObjectTag.id

			RETURNS: If found, a ObjectTag object
					 If not found, None
		"""

		return ObjectTag.query.filter(ObjectTag.object_id == object_id).\
							   filter(ObjectTag.id == context_tag_id).first()

	@staticmethod
	def get_all(object_id=None, global_tag_id=None):

		"""
			PURPOSE: Get all the object tags of a particular object
		
			USE: Call like: ObjectTagManager.get_all(<int>)
		
			PARAMS: 1 param: an int, id of the object whose tags you want to get
		
			RETURNS: A 'list' of all object-tags for a particular object,
					 Or, None if 1. object doesn't exist, 2. If object has no object tags
		"""

		if object_id:
			return ObjectTag.query.filter(ObjectTag.object_id == object_id).all()
		elif global_tag_id:
			return ObjectTag.query.filter(ObjectTag.global_tag_id == global_tag_id).all()

	@staticmethod
	def count():

		"""
			PURPOSE: Get the number of object-tags in the system
		
			USE: Call like: ObjectTagManager.count()
		
			PARAMS: None
		
			RETURNS: An int, the number of object-tags in the system
		"""

		return ObjectTag.query.count()


class GlobalTag(Base):

	"""Global tag definition"""

	__tablename__ = 'global_tag'

	id = Column(BigInteger, primary_key=True)
	tag_name = Column(Unicode, nullable=False)
	date_created = Column(DateTime, default=datetime.now)


class GlobalTagManager(object):

	@staticmethod
	def add(global_tag_data):

		"""
			PURPOSE: Add a new GlobalTag into the database

			USE: Call like: GlobalTagManager.add(<dict>)

			PARAMS: 1 param, a dict, with the key as column name:
				- tag_name

				* Mainly out of convention in
				this case to use a dict()

			RETURNS: The newly created GlobalTag object

		"""

		new_global_tag = GlobalTag()
		new_global_tag.tag_name = global_tag_data['tag_name']

		DBSession.add(new_global_tag)
		DBSession.flush()  # Lets us get id of new row

		return new_global_tag

	@staticmethod
	def get(tag_id=None, tag_name=None):

		"""
			PURPOSE: Get a GlobalTag from the database based
			on either it's id or name

			USE: Call like: GlobalTagManager.get(<int>=None, <str>=None)

			PARAMS: Provide 1 of 2 possible parameters:
				- tag_id   : int : default=None : The id of the GlobalTag to get
				- tag_name : str : default=None : The tag_name of the GlobalTag to get

			RETURNS: If found, a GlobalTag object
					 If not found, None
		"""

		if tag_id:
			return GlobalTag.query.filter(GlobalTag.id == tag_id).first()
		elif tag_name:
			return GlobalTag.query.filter(func.lower(GlobalTag.tag_name) == func.lower(tag_name)).first()


	@staticmethod
	def get_all_global_tags():

		"""
			PURPOSE: Get all GlobalTags from the database
		
			USE: Call like: GlobalTagManager.get_all_global_tags()
		
			PARAMS: None
		
			RETURNS: A 'list' of all GlobalTags returned
		"""

		return GlobalTag.query.filter(~GlobalTag.tag_name.in_(SYS_CONTEXT_TAGS)).all()

	# @staticmethod
	# def get_name(tag_id):
	# 	global_tag_object = GlobalTag.query.filter(GlobalTag.id == tag_id).first()
	# 	return getattr(global_tag_object, 'tag_name', None)

	@staticmethod
	def count():

		"""
			PURPOSE: Get the number of global-tags in the system
		
			USE: Call like: GlobalTagManager.count()
		
			PARAMS: None
		
			RETURNS: An int, the number of global-tags in the system
		"""

		return GlobalTag.query.count() - len(SYS_CONTEXT_TAGS)

	@staticmethod
	def get_like(query, num=50):
		return GlobalTag.query.filter(GlobalTag.tag_name.ilike("{q}%".format(q=query))).\
							   filter(~GlobalTag.tag_name.in_(SYS_CONTEXT_TAGS)).limit(num).all()

# class UserTag(Base):

# 	"""Tags used on users"""

# 	__tablename__ = 'user_tag'

# 	id = Column(BigInteger, primary_key=True)
# 	user_id = Column(BigInteger, nullable=False)
# 	tag_id = Column(Integer, nullable=False)
