#!/usr/bin/env python

#
# Company: WONDROUS
# Created by: John Zimmerman
#
# MODELS/USER.PY
#

import unidecode, logging
from datetime import datetime

from sqlalchemy import (
    BigInteger,
    Boolean,
    Column,
    DateTime,
    or_,
    Unicode,
    ForeignKey,
    Integer
)

from sqlalchemy.orm import (
    synonym,
    relationship,
    backref
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
        NOTE: Pages can act like Users. They can:
            Upvote,
            Downvote,
            Post,
            Comment,
            etc.
    """

    name = Column(Unicode, nullable=False)
    ascii_name = Column(Unicode, nullable=False)
    username = Column(Unicode, nullable=True, unique=True)  # nullable=True for FBAuth users
    email = Column(Unicode, nullable=False)
    _password = Column('password', Unicode(255), nullable=False)

    # profile_picture = Column(Unicode, nullable=True, default=unicode(DEFAULT_PROFILE_PICTURE_PATH))  # nullable=True for FBAuth users
    verification_date = Column(DateTime, default=datetime.now(), nullable=True)
    verification_code = Column(Unicode, unique=True, nullable=True)

    verified = Column(Boolean, default=False)
    picture_object_id = Column(BigInteger,ForeignKey('object.id'), nullable=True)

    is_active = Column(Boolean, nullable=False, default=True)  # Used to deactivate a user
    is_banned = Column(Boolean, nullable=True, default=False)  # Is this user banned from the enire system?
    is_private = Column(Boolean, nullable=False, default=False)  # Is the profile private or public?

    last_login = Column(DateTime, nullable=False, default=datetime.now)
    set_to_delete = Column(DateTime, nullable=True)

    # Make password a property using the _get_password and _set_password methods
    password = synonym('_password', descriptor=property(PasswordManager._get_password, PasswordManager._set_password))
    comments = relationship("Comment")
    feed = relationship("Feed", uselist=False, backref="user")
    picture_object = relationship('Object',lazy='joined', backref=backref("user", uselist=False))

    #Wondrous score
    base_score = Column(Integer, default=0)
    wondrous_score = Column(Integer, default=0)
    last_calculated = Column(DateTime, default=datetime.now)

    def __init__(self, *args, **kwargs):
        super(User,self).__init__(*args, **kwargs)
        self.ascii_name = unidecode.unidecode("{0}".format(self.name).decode('utf-8'))

    @classmethod
    def by_id_like(cls, key, ascii=False, num=50):

        """
            TODO: Probably should go into its own controllers/personmanager.py file
        """

        if not ascii:
            base = cls.query.filter(cls.name.ilike("%{q}%".format(q=key)))
        elif ascii:
            base = cls.query.filter(cls.name.ilike("%{q}%".format(q=key)))

        return base.filter(cls.is_active==True).\
                    filter(cls.is_banned==False).limit(num)  # ascii_name

    @classmethod
    def get_all_banned_users(cls):
        return cls.by_kwargs(cls.is_banned == True).all()

    def json(self,level=0):
        retval = super(User,self).json(level)
        retval['badges'] = [badge.badge_type for badge in self.badges]
        picture_object = self.picture_object
        if picture_object:
            retval.update({"ouuid": picture_object.ouuid})
        return retval


class BlockedUser(Base, BaseMixin):

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

        return super(BlockedUser, cls).by_kwargs(blocked_user_id=blocked_user_id, blocker_id=blocker_id).first()

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
