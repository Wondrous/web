# #!/usr/bin/env python
# # -*- coding: utf-8 -*-
#
# #
# # Company: WONDROUS
# # Created by: John Zimmerman
# #
# # MODELS/ADMIN.PY
# #
#
from datetime import datetime

from sqlalchemy import BigInteger
from sqlalchemy import Boolean
from sqlalchemy import Column
from sqlalchemy import DateTime
from sqlalchemy import func
from sqlalchemy import Integer
from sqlalchemy import Unicode
from sqlalchemy import ForeignKey

from sqlalchemy.orm import synonym, relationship

from wondrous.models import Base
from wondrous.models import DBSession
from wondrous.models.modelmixins import BaseMixin


class AdminTag(Base, BaseMixin):
    (SUPER_ADMIN, ADMIN) = range(2) 
    user_id = Column(BigInteger, ForeignKey('user.id'), index=True)
    user = relationship('User', uselist=False, backref="user")
    level = Column(Integer, nullable=False)

#
# from wondrous.utilities.validation_utilities import PasswordManager
#
# class Admin(Base, PasswordManager):
#
#     __tablename__ = 'admin'
#
#     id = Column(BigInteger, primary_key=True, nullable=False)
#     username = Column(Unicode, nullable=False)
#     _password = Column('password', Unicode(60), nullable=False)
#     active = Column(Boolean, nullable=False, default=True)
#     super_admin = Column(Boolean, nullable=False, default=False)
#     throttle_num = Column(Integer, nullable=False, default=0)
#     last_login = Column(DateTime, nullable=False, default=datetime.now)
#     date_joined = Column(DateTime, nullable=False, default=datetime.now)
#
#     # Make password a property using the _get_password and _set_password methods
#     password = synonym('_password', descriptor=property(PasswordManager._get_password, PasswordManager._set_password))
#
#
# class AdminManager(object):
#
#     @staticmethod
#     def get_all():
#
#         return Admin.query.all()
#
#     @staticmethod
#     def get(admin_id=None, username=None, is_active=True):
#
#         """
#             PURPOSE: Get an Admin from the database
#
#             USE: Call like: AdminManager.get(...)
#
#             PARAMS: provide 1 of the following:
#                 - admin_id : int : default=None : The Admin.id of the admin to get
#                 - username : str : default=None : The Admin.username of the admin to get
#                 - is_active : bool : default=True : Filter only results which are <is_active>
#
#             RETURNS: If Admin obj found, an Admin object
#                      Otherwise, None
#         """
#
#         if admin_id:
#             return Admin.query.filter(Admin.id == admin_id).filter(Admin.active == is_active).first()
#         elif username:
#             return Admin.query.filter(
#                 func.lower(Admin.username) == func.lower(username)
#             ).filter(Admin.active == is_active).first()
#         else:
#             return None
#
#     @staticmethod
#     def add(admin_data):
#
#         """
#             PURPOSE: Add a new Admin to the database
#
#             USE: Call like: AdminManager.add(...)
#
#             PARAMS: 1 param, a dict, with the following keys as column names:
#                 - username : str : The Admin.username of the new admin
#                 - password : str : The Admin.password of the new admin
#
#             RETURNS: (None)
#         """
#
#         username_exists = AdminManager.get(username=admin_data['username'])
#         if username_exists:
#             return
#
#         new_admin = Admin()
#
#         new_admin.username = admin_data['username']  # Make sure we have no duplicates
#         new_admin.password = admin_data['password']
#         new_admin.super_admin = admin_data['super_admin']
#
#         DBSession.add(new_admin)
#         DBSession.flush()
