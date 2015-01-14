#!/usr/bin/env python

#
# Company: WONDROUS
# Created by: John Zimmerman
#
# MODELS/USER.PY
#

from datetime import datetime

from sqlalchemy import BigInteger
from sqlalchemy import Boolean
from sqlalchemy import Column
from sqlalchemy import DateTime
from sqlalchemy import desc
from sqlalchemy import func
from sqlalchemy import Integer
from sqlalchemy import Unicode

from sqlalchemy.ext.hybrid import hybrid_method
from sqlalchemy.orm import synonym

from wondrous.models import Base
from wondrous.models import DBSession

from wondrous.utilities.validation_utilities import PasswordManager

DEFAULT_PROFILE_PICTURE_PATH = "/static/pictures/defaults/p.default-profile-picture.jpg"

class User(Base, PasswordManager):

	"""
		Defines a core user object:
			Person : A Person on the site
			Page   : A page on the site.

		NOTE: Pages can act like Users. They can:
			Upvote,
			Downvote,
			Post,
			Comment,
			etc.
	"""

	__tablename__ = 'user'

	id = Column(BigInteger, primary_key=True, nullable=False)
	user_type = Column(Integer, nullable=False) # 1 = Person, 2 = Page
	
	username = Column(Unicode, nullable=True, unique=True)  # nullable=True for FBAuth users
	email = Column(Unicode, nullable=False)
	_password = Column('password', Unicode(255), nullable=False)
	profile_picture = Column(Unicode, nullable=True, default=unicode(DEFAULT_PROFILE_PICTURE_PATH))  # nullable=True for FBAuth users

	active = Column(Boolean, nullable=False, default=True)  # Used to deactivate a user
	is_banned = Column(Boolean, nullable=True, default=False)  # Is this user banned from the enire system?
	is_private = Column(Boolean, nullable=False, default=False)  # Is the profile private or public?
 	
 	last_login = Column(DateTime, nullable=False, default=datetime.now)
	date_joined = Column(DateTime, nullable=False, default=datetime.now)

	# Make password a property using the _get_password and _set_password methods
	password = synonym('_password', descriptor=property(PasswordManager._get_password, PasswordManager._set_password))

	# @hybrid_property
	# def upvotes(self):
	# 	from wondrous.models.vote import UserVoteManager
	# 	return UserVoteManager.get_total_upvotes(self.id)

	# @hybrid_property
	# def downvotes(self):
	# 	from wondrous.models.vote import UserVoteManager
	# 	return UserVoteManager.get_total_downvotes(self.id)

	@hybrid_method
	def is_following(self, user_to_get_id):
		from wondrous.models.vote import UserVoteManager
		vote = UserVoteManager.has_voted(self.id, user_to_get_id)
		return True if vote in [1,2] else False


class UserManager(object):

	@staticmethod
	def get(user_id=None, username=None, email=None, is_active=True):

		"""
			PURPOSE: Get the user of the action -- person vs. page
		
			USE: Call like: UserManager.get(user_id=None, username=None, email=None, is_active=True)
		
			PARAMS: Provide only 1 of 3 query parameters, with
			the last parameter optional, and defaulting to True:
				user_id   : int  : REQUIRED : The User.id of the person/page/etc.
				username  : str  : REQUIRED : The username of the person/page/etc.
				email 	  : str  : REQUIRED : The email used to register the person/page/etc.
				is_active : bool : OPTIONAL : If True, get only rows with Active=True
								   			  If False, get only rows with Active=False

			RETURNS: If found, a person/page/etc. object
				 	 If not found, None.
		"""

		from wondrous.models.page import PageManager
		from wondrous.models.person import PersonManager

		user_obj = None
		if user_id:
			user_obj = User.query.filter(User.id == user_id).\
								  filter(User.active == is_active).first()
		elif username:
			user_obj = User.query.filter(func.lower(User.username) == func.lower(username)).\
								  filter(User.active == is_active).first()
		elif email:
			user_obj = User.query.filter(User.email == email).\
								  filter(User.active == is_active).first()					

		if user_obj:
			if user_obj.user_type == 1:
				return PersonManager._get(user_obj.id)
			elif user_obj.user_type == 2:
				return PageManager._get(user_obj.id)
		else:
			return None

	@staticmethod
	def get_all_persons():

		"""
			PURPOSE: Get all persons in the database
		
			USE: Call like: UserManager.get_all_persons()
		
			PARAMS: None
		
			RETURNS: A 'list' of all Person objects
		"""

		from wondrous.models.person import PersonManager

		all_persons = User.query.filter(User.active == True).\
						  		 filter(User.user_type == 1).all()

		return [PersonManager._get(p.id) for p in all_persons]

	@staticmethod
	def get_recent_persons(num=50):

		"""
			*** CURRENTLY UNUSED ***

			PURPOSE: Get <num> (defaults to 50) of the most recent persons
		
			USE: Call like: UserManager.get_recent_persons()
		
			PARAMS: 1 optional parameter: num, which defaults to 50
		
			RETURNS: A 'list' of the <num> most recent Person objects
		"""

		from wondrous.models.person import PersonManager

		all_persons = User.query.filter(User.active == True).\
						filter(User.user_type == 1).\
						order_by(desc(User.date_joined)).limit(num).all()

		return [PersonManager._get(p.id) for p in all_persons]

	@staticmethod
	def get_recent_pages(num=50):

		"""
			*** CURRENTLY UNUSED ***

			PURPOSE: Get <num> (defaults to 50) of the most recent pages
		
			USE: Call like: UserManager.get_recent_pages()
		
			PARAMS: 1 optional parameter: num, which defaults to 50
		
			RETURNS: A 'list' of the <num> most recent Page objects
		"""

		from wondrous.models.page import PageManager

		all_pages = User.query.filter(User.active == True).\
						filter(User.user_type == 1).\
						order_by(desc(User.date_joined)).limit(num).all()

		return [PageManager._get(p.id) for p in all_pages]

	@staticmethod
	def get_all_banned_users():
		
		return User.query.filter(User.is_banned == True).all()

	@staticmethod
	def add(user_data, user_type_data):

		"""
			PURPOSE: Add a new user (person/page/etc.) into the DB
		
			USE: Call like: UserManager.add(<dict>,<dict>)
		
			PARAMS: 2 parameters, with each key as a column name:
				--- USER DATA -------------------------------------
				-user_type 	 : int : 1 => Person; 2 => Page;
				-username    : str : Username of the user/page/etc.
				-email 		 : str : Email used to register the user/page/etc.
				-profile_picture : TODO

				--- 'NODE' DATA ------------------------------------
				If a new Person being added:
					-user_id *
					-first_name
					-last_name
					-password
					-gender
					-locale
					-birthday

				If a new Page being added:
					-user_id *
					-title
					-description
					-external_url
					-cover_picture

				* Dynamically added, and not necessary to provide in the
				initial dict passed to User.add(<dict>)
		
			RETURNS: None
		"""

		from wondrous.models.page import PageManager
		from wondrous.models.person import PersonManager

		new_user = User()

		new_user.user_type 		 = user_data['user_type']
		new_user.username 		 = user_data['username']
		new_user.email 		   	 = user_data['email']
		new_user.password 		 = user_data['password']
		new_user.profile_picture = user_data['profile_picture']

		DBSession.add(new_user)
		DBSession.flush()

		user_type_data['user_id'] = new_user.id
		if user_data['user_type'] == 1:
			PersonManager._add(user_type_data)
		elif user_data['user_type'] == 2:
			PageManager._add(user_type_data)


	@staticmethod
	def _soft_delete(user_id):

		"""
			PURPOSE: (Soft) delete a user from users table
			
			USE: Call like: UserManager._soft_delete(<int>)

			PARAMS: 1 param: an int, user_id, the id of the
			user to be deleted

			NOTE: This method is private with name-mangling
			becasue changing the active column on a User
			is a critical operation.

			RETURNS: None
		"""

		node_obj = UserManager.get(user_id)
		if node_obj:
			node_obj.user.active = False

	@staticmethod
	def _undelete(user_id):

		"""
			PURPOSE: Un-delete (re-enable) a previously
			deleted user from users table
			
			USE: Call like: UserManager._undelete(<int>)

			PARAMS: 1 param: an int, user_id, the id of the
			user to be deleted

			NOTE: This method is private with name-mangling
			becasue changing the active column on a User
			is a critical operation.

			RETURNS: None
		"""

		disabled_node_obj = UserManager.get(user_id, is_active=False)
		if disabled_node_obj:
			disabled_node_obj.user.active = True

	@staticmethod
	def count(person=False, page=False, is_active=True):

		"""
			PURPOSE: Get the total count of all ACTIVE persons, pages, or both.
		
			USE: Call like UserManager.count(person=False, page=False)
		
			PARAMS: 2 params, both boolean. Provide only 1, or neither
				person 	  : bool : SEMI-OPTIONAL : person=True to get count of persons
				page   	  : bool : SEMI-OPTIONAL : page=True to get count of pages
				<Neither> 		 : Get both persons and pages
				is_active : bool : OPTIONAL : is_active=True to get only active rows
 		
			RETURNS: An integer of the total count
		"""

		if person:
			return User.query.filter(User.user_type == 1).filter(User.active == is_active).count()
		elif page:
			return User.query.filter(User.user_type == 2).filter(User.active == is_active).count()
		else:
			return User.query.filter(User.active == is_active).count()

	@staticmethod
	def get_like(query, email=False, username=False):
		 if username:
		 	COL = username
		 elif email:
		 	COL = email
		 else:
		 	COL = None

		 if COL:
		 	return User.query.filter(User.COL.ilike("{q}%".format(q=query))).all()
		 else:
		 	return None


class BlockedUser(Base):

	"""
		Keeps track of who did the blocking
	"""

	__tablename__ = 'blocked_user'

	id = Column(BigInteger, primary_key=True, nullable=False)
	blocked_user_id = Column(BigInteger, nullable=False) # The user who got blocked
	blocker_id = Column(BigInteger, nullable=False)  # The user you did the blocking
	date_blocked = Column(DateTime, nullable=False, default=datetime.now)


class BlockedUserManager(object):

	@staticmethod
	def get(blocked_user_id, blocker_id):

			"""
				PURPOSE: To get/check for a particular blocked user
			
				USE: Call like: BlockedUserManager.get(<int>,<int>)
			
				PARAMS: 2 params,
					blocked_user_id : int : REQUIRED : The user_id of the user who got blocked
					blocker_id  	: int : REQUIRED : The user_id of the user who did the blocking
			
				RETURNS: A BlockedUser object if found, otherwise None.
			"""

			return BlockedUser.query.filter(BlockedUser.blocked_user_id == blocked_user_id).\
									 filter(BlockedUser.blocker_id == blocker_id).first()

	@staticmethod
	def add(blocked_user_data):

		"""
			PURPOSE: Add a new blocked user (person/page/etc.) into the DB
		
			USE: Call like: BlockedUserManager.add(<dict>)
		
			PARAMS: 1 parameter, with each key as a column name:
				blocked_user_id : int : The user_id of the user who got blocked
				blocker_id  	: int : The user_id of the user who did the blocking
		
			RETURNS: None
		"""

		new_blocked_user = BlockedUser()

		new_blocked_user.blocked_user_id = blocked_user_data['blocked_user_id']
		new_blocked_user.blocker_id = blocked_user_data['blocker_id']

		DBSession.add(new_blocked_user)

	@staticmethod
	def delete(blocked_user_object):

		if blocked_user_object:
			DBSession.delete(blocked_user_object)


