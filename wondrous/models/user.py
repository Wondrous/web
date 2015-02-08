#!/usr/bin/env python

#
# Company: WONDROUS
# Created by: John Zimmerman
#
# MODELS/USER.PY
#

from datetime import datetime

from sqlalchemy import (
    BigInteger,
    Boolean,
    Column,
    DateTime,
    Integer,
    Unicode,
)

from sqlalchemy.orm import (
    synonym,
    relationship,
)

from wondrous.models import (
    Base,
    DBSession,
)

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
    comments = relationship("Comment",cascade="delete")

    feed = relationship("Feed",uselist=False,backref="user",cascade="delete")
    set_to_delete = Column(DateTime)

    @classmethod
    def get_all_banned_users(cls):
        return cls.by_kwargs(is_banned == True).all()


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
