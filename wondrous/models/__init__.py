#!/usr/bin/env python
# -*- coding: utf-8 -*-

#
# Company: WONDROUS
# Created by: John Zimmerman
#
# MODELS/__INIT__.PY
#

#from sqlalchemy import create_engine
from sqlalchemy import engine_from_config
from sqlalchemy import MetaData

from sqlalchemy.orm import scoped_session
from sqlalchemy.orm import sessionmaker
from sqlalchemy.orm import Query

from sqlalchemy.ext.declarative import declarative_base
from zope.sqlalchemy import ZopeTransactionExtension

Base = declarative_base(metadata=MetaData())
DBSession = scoped_session(sessionmaker(extension=ZopeTransactionExtension()))
Base.query = DBSession.query_property(Query)  # Setup the SQLAlchemy database engine
engine = None

from wondrous.models.admin import (
    Admin,
)

from wondrous.models.comment import (
    Comment,
)


from wondrous.models.feed import (
    Feed,
    FeedPostLink
)
from wondrous.models.notification import (
    Notification,
)

from wondrous.models.object import (
    Object,
    ObjectLink,
    ObjectFile,
    LinkToObject,
    FileToObject,
)

from wondrous.models.post import (
    Post,
)

from wondrous.models.badge import (
    Badge
)

from wondrous.models.tag import (
    Tag,
)

from wondrous.models.user import (
    BlockedUser,
    User,
)

from wondrous.models.reported import (
    ReportedComment,
    ReportedPost,
)

from wondrous.models.vote import (
    Vote
)

from wondrous.models.scores import (
    PostView
)

from wondrous.models.refer import (
    Referrer
)



def initialize_sql(settings, testing=False):
    """ Called by the app on startup to setup bindings to the DB """
    global engine
    engine = engine_from_config(settings, 'sqlalchemy.')
    DBSession.configure(bind=engine)
    Base.metadata.bind = engine
    if testing:
        Base.metadata.create_all()

def reset_sql():
    # FOR TESTING ONLY!
    # RESETS DATABASE!
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    DBSession.flush()
