#!/usr/bin/env python
# -*- coding: utf-8 -*-

#
# Company: WONDROUS
# Created by: Ziyuan Liu
#
# MODELS/PERSON.PY
#

import uuid
import unidecode
import re

from datetime import datetime
from sqlalchemy import BigInteger
from sqlalchemy import Boolean
from sqlalchemy import Column
from sqlalchemy import DateTime
from sqlalchemy import ForeignKey
from sqlalchemy import func
from sqlalchemy import Integer
from sqlalchemy import Unicode

from sqlalchemy.ext.declarative import declared_attr
from sqlalchemy.sql.expression import ClauseElement
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm.exc import NoResultFound

from wondrous.models import DBSession

first_cap_re = re.compile('(.)([A-Z][a-z]+)')
all_cap_re = re.compile('([a-z0-9])([A-Z])')

def convert_camel(name):
    """
        PURPOSE: Converts CamelCase or camelCase to camel_case

        USE: Call like: UnverifiedEmailManager.get(<str>=None, <str>=None)

        PARAMS: 1 Possible param
            name : str : required : a string in camel case

        RETURNS: return the lower case version of name with _ to delimit each word
    """
    s1 = first_cap_re.sub(r'\1_\2', name)
    return all_cap_re.sub(r'\1_\2', s1).lower()

class BaseMixin(object):
    """
        BaseMixin functions as the basic mixin for most of the models in Wondrous
        All common fields and functions are gathered here.

        WARNING: cannot be used alone
    """
    id = Column(BigInteger, primary_key=True)
    created_at = Column(DateTime, default=func.now())

    @declared_attr
    def __tablename__(cls):
        """
            Dynamic table naming system through declared_attr
            we dont need to manually name every model - this perserves
            consistency
        """
        return convert_camel(cls.__name__)

    @classmethod
    def _add(cls,**kwargs):
        return cls(**kwargs)

    @classmethod
    def by_id(cls,key):
        return cls.query.get(key)

    @classmethod
    def by_kwargs(cls,**kwargs):
        return cls.query.filter_by(**kwargs)

    @classmethod
    def by_pagination(cls,start=0,per_page=15,**kwargs):
        """
            Purpose: Provides very easy pagination

            PARAMS: 6 params:
                start       : int   : REQUIRED  : the offset
                per_page    : int   : REQUIRED  : number of obj/page -1 for do not user
                kwargs      : dict  : REQUIRED  : A dictionary object with all the query fields

            Returns query object
        """
        if per_page ==-1:
            return cls.by_kwargs(**kwargs).offset(start)
        return cls.by_kwargs(**kwargs).limit(per_page).offset(start)


    @classmethod
    def count(cls):
        return cls.query.count()

    @classmethod
    def get_one_or_create(cls, defaults=None, **kwargs):
        try:
            return cls.query.filter_by(**kwargs).one(), False
        except NoResultFound:
            params = dict((k, v) for k, v in kwargs.iteritems() if not isinstance(v, ClauseElement))
            params.update(defaults or {})
            instance = cls(**params)
            try:
                DBSession.add(instance)
                DBSession.flush()
                return instance, True
            except IntegrityError, e:
                DBSession.rollback()
                return cls.query.filter_by(**kwargs).one(), False

    @classmethod
    def delete(cls,obj):
        DBSession.delete(obj)

    @classmethod
    def delete_by_kwargs(cls, **kwargs):
        obj = cls.by_kwargs(**kwargs).first()
        if obj:
            cls.delete(obj)
