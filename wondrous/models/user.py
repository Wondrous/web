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
from sqlalchemy.orm import relationship
from sqlalchemy import or_

from wondrous.models import Base
from wondrous.models import DBSession
from wondrous.models.vote import Vote
from wondrous.models.feed import Feed
from wondrous.models.person import Person
from wondrous.models.modelmixins import BaseMixin

from wondrous.utilities.validation_utilities import PasswordManager

DEFAULT_PROFILE_PICTURE_PATH = "/static/pictures/defaults/p.default-profile-picture.jpg"


class User(Base, PasswordManager, BaseMixin):
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
    user_type = Column(Integer, nullable=False) # 1 = Person, 2 = Page

    username = Column(Unicode, nullable=True, unique=True)  # nullable=True for FBAuth users
    email = Column(Unicode, nullable=False)
    _password = Column('password', Unicode(255), nullable=False)
    profile_picture = Column(Unicode, nullable=True, default=unicode(DEFAULT_PROFILE_PICTURE_PATH))  # nullable=True for FBAuth users

    is_active = Column(Boolean, nullable=False, default=True)  # Used to deactivate a user
    is_banned = Column(Boolean, nullable=True, default=False)  # Is this user banned from the enire system?
    is_private = Column(Boolean, nullable=False, default=False)  # Is the profile private or public?

    last_login = Column(DateTime, nullable=False, default=datetime.now)

    # Make password a property using the _get_password and _set_password methods
    password = synonym('_password', descriptor=property(PasswordManager._get_password, PasswordManager._set_password))
    comments = relationship("ObjectComment")

    feed = relationship("Feed",uselist=False,backref="user")

    # TODO convert to by_kwargs to check if following/blocking
    @hybrid_method
    def is_following(self, user_to_get_id):
        vote = Vote.get_vote(self.id, user_to_get_id,Vote.USER)
        return True if getattr(vote, 'vote_type', None)==Vote.USER and getattr(vote, 'status', None) in [Vote.FOLLOW,Vote.TOPFRIEND] else False

    def is_blocked_by(self,user_to_get_id):
        vote = Vote.get_vote(user_to_get_id,self.id,Vote.USER)
        return True if getattr(vote, 'vote_type', None)==Vote.USER and getattr(vote, 'status', None)==Vote.BLOCK else False

    def is_blocking(self,user_to_get_id):
        vote = Vote.get_vote(self.id, user_to_get_id,Vote.USER)
        return True if getattr(vote, 'vote_type', None)==Vote.USER and getattr(vote, 'status', None)==Vote.BLOCK else False

    @classmethod
    def get_all_followers(cls,user_id):
        return Vote.query.filter(Vote.subject_id==user_id).filter(or_(Vote.status==Vote.FOLLOW,Vote.status==Vote.TOPFRIEND)).all()

    @classmethod
    def get_number_of_followers(cls,user_id):
        return Vote.query.filter(Vote.subject_id==user_id).filter(or_(Vote.status==Vote.FOLLOW,Vote.status==Vote.TOPFRIEND)).count()

    @classmethod
    def get(cls,**kwargs):
        """
            PURPOSE: Get the user of the action -- person vs. page

            USE: Call like: User.get(user_id=None, username=None, email=None, is_active=True)

            PARAMS: Provide only 1 of 3 query parameters in a dict, with
            the last parameter optional, and defaulting to True:
                user_id   : int  : REQUIRED : The User.id of the person/page/etc.
                username  : str  : REQUIRED : The username of the person/page/etc.
                email     : str  : REQUIRED : The email used to register the person/page/etc.
                is_active : bool : OPTIONAL : If True, get only rows with Active=True
                                              If False, get only rows with Active=False

            RETURNS: If found, a person/page/etc. object
                     If not found, None.
        """
        if "is_active" not in kwargs.keys():
            kwargs.update({"is_active":True})

        user_object = super(User,cls).by_kwargs(**kwargs).first()
        return user_object.person if user_object else None

    @classmethod
    def get_all_banned_users(cls):
        return cls.by_kwargs(is_banned == True).all()

    @classmethod
    def add(cls,user_data, user_type_data):

        """
            PURPOSE: Add a new user (person/page/etc.) into the DB

            USE: Call like: User.add(<dict>,<dict>)

            PARAMS: 2 parameters, with each key as a column name:
                --- USER DATA -------------------------------------
                -user_type   : int : 1 => Person; 2 => Page;
                -username    : str : Username of the user/page/etc.
                -email       : str : Email used to register the user/page/etc.
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

            RETURNS: the newly created user
        """
        new_user = cls(**user_data)
        DBSession.add(new_user)
        DBSession.flush()

        # Feed yourself
        f = Feed.add(user_id=new_user.id)
        user_type_data['user_id'] = new_user.id
        if user_data['user_type'] == 1:
            Person.add(user_type_data)

        # Follow yourself
        Vote.add(user_id=new_user.id,subject_id=new_user.id,vote_type=Vote.USER,status=Vote.TOPFRIEND)
        return new_user

    @classmethod
    def _soft_delete(cls,user_id):

        """
            PURPOSE: (Soft) delete a user from users table

            USE: Call like: User._soft_delete(<int>)

            PARAMS: 1 param: an int, user_id, the id of the
            user to be deleted

            NOTE: This method is private with name-mangling
            because changing the active column on a User
            is a critical operation.

            RETURNS: None
        """

        node_obj = cls.get(user_id=user_id)
        if node_obj:
            node_obj.user.active = False

    @classmethod
    def _undelete(cls,user_id):

        """
            PURPOSE: Un-delete (re-enable) a previously
            deleted user from users table

            USE: Call like: User._undelete(<int>)

            PARAMS: 1 param: an int, user_id, the id of the
            user to be deleted

            NOTE: This method is private with name-mangling
            becasue changing the active column on a User
            is a critical operation.

            RETURNS: None
        """

        disabled_node_obj = cls.get(user_id=user_id, is_active=False)
        if disabled_node_obj:
            disabled_node_obj.user.active = True

class BlockedUser(Base,BaseMixin):

    """
        Keeps track of who did the blocking
    """
    blocked_user_id = Column(BigInteger, nullable=False) # The user who got blocked
    blocker_id = Column(BigInteger, nullable=False)  # The user you did the blocking

    @classmethod
    def get(cls,blocked_user_id, blocker_id):

        """
            PURPOSE: To get/check for a particular blocked user

            USE: Call like: BlockedUser.get(<int>,<int>)

            PARAMS: 2 params,
                blocked_user_id : int : REQUIRED : The user_id of the user who got blocked
                blocker_id      : int : REQUIRED : The user_id of the user who did the blocking

            RETURNS: A BlockedUser object if found, otherwise None.
        """
        return super(BlockedUser,cls).by_kwargs(blocked_user_id=blocked_user_id,blocker_id=blocker_id).first()

    @classmethod
    def add(cls,blocked_user_data):

        """
            PURPOSE: Add a new blocked user (person/page/etc.) into the DB

            USE: Call like: BlockedUser.add(<dict>)

            PARAMS: 1 parameter, with each key as a column name:
                blocked_user_id : int : The user_id of the user who got blocked
                blocker_id      : int : The user_id of the user who did the blocking

            RETURNS: None
        """
        new_user = cls(**blocked_user_data)
        DBSession.add(new_blocked_user)
        DBSession.flush()

    @staticmethod
    def delete(blocked_user_object):
        if blocked_user_object:
            DBSession.delete(blocked_user_object)
