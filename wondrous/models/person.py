#!/usr/bin/env python
# -*- coding: utf-8 -*-

#
# Company: WONDROUS
# Created by: John Zimmerman
#
# MODELS/PERSON.PY
#

import uuid
from datetime import datetime
from unidecode import unidecode

from sqlalchemy import BigInteger
from sqlalchemy import Boolean
from sqlalchemy import Column
from sqlalchemy import DateTime
from sqlalchemy import ForeignKey
from sqlalchemy import func
from sqlalchemy import Integer
from sqlalchemy import Unicode

from sqlalchemy.orm import column_property
from sqlalchemy.orm import relationship

from wondrous.models import Base
from wondrous.models import DBSession

from wondrous.utilities.validation_utilities import Sanitize


class UnverifiedEmail(Base):

    """
        Defines the table which stores all emails which
        have been unverified in the signup process
    """
    
    __tablename__ = 'unverified_email'

    id = Column(BigInteger, primary_key=True, nullable=False)
    code = Column(Unicode, nullable=True)
    email = Column(Unicode, nullable=False)
    attempts = Column(Integer, nullable=False, default=1)
    active = Column(Boolean, default=True)
    most_recent_attempt = Column(DateTime, nullable=False, default=datetime.now)
    date_submitted = Column(DateTime, nullable=False, default=datetime.now)


class UnverifiedEmailManager(object):

    @staticmethod
    def get(email=None, code=None, is_active=True):

        """
            PURPOSE: Get an unverified email of a user (Person)
            attempting to sign up for Wondrous

            USE: Call like: UnverifiedEmailManager.get(<str>=None, <str>=None)

            PARAMS: 2 possible params, only 1 of which is required
                email : str : default=None : The unverified email
                code  : str : A UUID, 1-time-use code uniquely identifying a new user sign-up

            RETURNS: If found, an UnverifiedEmail object,
                     Otherwise, None
        """

        if email:
            return UnverifiedEmail.query.filter(
                func.lower(UnverifiedEmail.email) == func.lower(email)
            ).filter(UnverifiedEmail.active == is_active).first()
        elif code:
            return UnverifiedEmail.query.filter(UnverifiedEmail.code == code).\
                                         filter(UnverifiedEmail.active == is_active).first()

    @staticmethod
    def get_all(is_active=True):
        return UnverifiedEmail.query.filter(UnverifiedEmail.active == is_active).all()

    @staticmethod
    def add(unverified_email_data):

        """
            PURPOSE: Add a new unverified_email into the database
        
            USE: Call like: UnverifiedEmailManager.add(<dict>)
        
            PARAMS: 1 param: a dictionary, with each key as a column name:
                email : str : default=None : The new, unverified email
                code  : str : A UUID, 1-time-use code uniquely identifying a new user sign-up
        
            RETURNS: None
        """

        new_unverified_email = UnverifiedEmail()

        new_unverified_email.code  = unverified_email_data['code']
        new_unverified_email.email = unverified_email_data['email']

        DBSession.add(new_unverified_email)


    @staticmethod
    def delete(email, is_active=True):
        email_obj = UnverifiedEmailManager.get(email, is_active=is_active)
        if email_obj:
            DBSession.delete(email_obj)

    @staticmethod
    def deactivate(email):
        email_obj = UnverifiedEmailManager.get(email)
        if email_obj:
            email_obj.active = False

    @staticmethod
    def validate(email):

        # Make sure we have some data
        if not email:
            return None, "Please enter an email"

        # Make sure we have an actual email
        if not Sanitize.is_valid_email(email):
            return None, "Awwww, this isn't an actual email. Please try again."

        email = email.lower()  # Make email all lower-case

            
        # # Add to waitlist
        # wait_listed_email = WaitingListManager.get(email)
        # if not wait_listed_email:
        #   waiting_list_data = dict(email=email)
        #   WaitingListManager.add(waiting_list_data)
        #   return None, """ 
        #       You've been added to the waiting list and will
        #       be notified when you are invited to join Wondrous.
        #       Thanks for your interest!
        #   """
        # else:
        #   return None, """
        #       This email has already been added to the waiting list.
        #       We appreciate your avid interest in Wondrous, and like we said,
        #       we'll let you know when Wondrous is open for you to sign up.
        #       Thanks again!
        #   """

        # Prevent using same email over and over
        # Make sure email has not already been taken
        # and fully signed-up with
        from wondrous.models.user import UserManager
        taken_email = UserManager.get(email=email)
        if taken_email:
            return None, """
                The email you entered has already been taken. Please 
                enter an email which has not already been used to sign up
            """

        # If the email has not been taken, check to see if
        # it is already in the sign-up process. If not,
        # send out new email to new person signing up

        # Delete any deactivated email rows from past attempts.
        # We needed this in case they had completed the sign-up process
        # for the AuthHandler.login(). However, at this point,
        # We can safely delete the deativated row.
        deactivated_email_obj = UnverifiedEmailManager.get(email, is_active=False)
        if deactivated_email_obj:
            UnverifiedEmailManager.delete(deactivated_email_obj.email, is_active=False)

        # Check the currently active rows.
        # This is neessary in case they have entered their
        # email, never signed up, but are now
        # entering the same email again
        email_obj = UnverifiedEmailManager.get(email)
        
        # They are not in the system
        if not email_obj:
            
            # Create code
            CODE = unicode(uuid.uuid4())

            # Insert new row
            unverified_email_data = {
                'email' : email,
                'code'  : CODE,
            }
            UnverifiedEmailManager.add(unverified_email_data)   
            return email, None
        
        # They're already in the system
        else:
            return None, """
                This email has already been added to the waiting list.
                We appreciate your interest in Wondrous, and like we said,
                we'll let you know when Wondrous is open for you to sign up.
                Thanks again!
            """


    @staticmethod
    def _update_for_send(email_obj):
        # Add 1 attempt
        email_obj.attempts += 1

        # Update most recent attempt to NOW!
        email_obj.most_recent_attempt = datetime.now()

        # Insert NEW code
        email_obj.code = unicode(uuid.uuid4())


class WaitingList(Base):
    
    """
        Defines all emails which have been submitted but
        are not allowed into Wondrous yet
    """

    __tablename__ = 'waiting_list'

    id = Column(BigInteger, primary_key=True, nullable=False)
    email = Column(Unicode, nullable=False)
    date_submitted = Column(DateTime, nullable=True, default=datetime.now)


class WaitingListManager(object):

    @staticmethod
    def get(email):
        return WaitingList.query.filter(
            func.lower(WaitingList.email) == func.lower(email)
        ).first()

    @staticmethod
    def add(waiting_list_data):
        new_waiting_list = WaitingList()
        new_waiting_list.email = waiting_list_data['email']
        DBSession.add(new_waiting_list)


class Person(Base):

    __tablename__ = 'person'

    id = Column(BigInteger, ForeignKey('user.id'), primary_key=True, nullable=False)
    first_name = Column(Unicode, nullable=False)
    last_name = Column(Unicode, nullable=False)
    ascii_name = Column(Unicode, nullable=False)
    gender = Column(Unicode, nullable=True)
    locale = Column(Unicode, nullable=True)
    birthday = Column(DateTime, nullable=True)
    show_tutorial = Column(Boolean, default=True, nullable=True)
    signup_step_num = Column(Integer, default=1, nullable=False)

    # Extremely important
    name = column_property(first_name + " " + last_name)
    user = relationship('User', foreign_keys='Person.id')


class PersonManager(object):

    @staticmethod
    def _get(user_id):

        """
            PURPOSE: Get a person from the database
        
            USE: Call like: PersonManager._get(<int>)
        
            PARAMS: 1 param: an int, the id of the User to get
            
            RETURNS: If found, a Person object
                     Otherwise, None
        """

        return Person.query.filter(Person.id == user_id).first()

 
    @staticmethod
    def _add(person_data):

        """
            PURPOSE: Add a new person into the DB
        
            USE: Call like: PersonManager._add(<dict>)
        
            PARAMS: 1 param, a dict, with each key as column name:
                -user_id
                -first_name
                -last_name
                -gender
                -locale
                -birthday
        
            RETURNS: None
        """

        new_person = Person()

        new_person.id           = person_data['user_id']
        new_person.first_name   = person_data['first_name']
        new_person.last_name    = person_data['last_name']
        new_person.ascii_name   = unidecode("{fn} {ln}".format(fn=new_person.first_name, ln=new_person.last_name).decode('utf-8'))
        new_person.gender       = person_data['gender']
        new_person.locale       = person_data['locale']
        new_person.birthday     = person_data['birthday']

        DBSession.add(new_person)
        DBSession.flush()

    @staticmethod
    def get_like(query, num=50, ascii=False):
        if not ascii:
            return Person.query.filter(Person.name.ilike("%{q}%".format(q=query))).limit(num).all()
        elif ascii:
            return Person.query.filter(Person.ascii_name.ilike("%{q}%".format(q=query))).limit(num).all()
