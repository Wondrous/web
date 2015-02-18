#!/usr/bin/env python
# -*- coding: utf-8 -*-

#
# Company: WONDROUS
# Created by: Ziyuan Liu
#
# CONTROLLERS/BASEMANAGER.PY
#

import datetime
from sqlalchemy.orm import class_mapper

class BaseManager(object):

    SENSITIVE_KW = [
        ['_password','password','is_banned', 'email', 'last_login'],
        ['_password','password','is_banned']
    ]

    @classmethod
    def model_to_json(cls, model, level=0):

        """
            PURPOSE: Transforms a model into a dictionary which can be dumped to JSON.

            USE: Call like: <cls>.model_to_json(...)

            PARAMS: Three params:
                cls : <ClassObject> : REQUIRED : Default first argument which is a Class object of the calling class
                model : <ClassObject> : REQUIRED : The Class Object of the model that we're converting to JSON
                level : int : default=0 : The index of items in SENSITIVE_KW (see above)

            RETURNS: A dict (which is the equivalent JSON)
            of a given model's attributes.
        """

        # First we get the names of all the columns on your model
        columns = [c.key for c in class_mapper(model.__class__).columns]
        # Then we return their values in a dict
        data = {}
        for c in columns:
            if c in cls.SENSITIVE_KW[level]:
                continue
            try:
                val = getattr(model, c)
                if isinstance(val, datetime.datetime):
                    val = val.isoformat()
                data[c] = val
            except Exception, e:
                pass
        return data
