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

from wondrous.models.admin import (
    Admin,
)

from wondrous.models.comment import (
    ObjectComment,
)

from wondrous.models.content import (
    DeletedContent,
    DeletedObjectComment,
    ReportedContent,
)

from wondrous.models.notification import (
    Notification,
)

from wondrous.models.obj import (
    Object,
    ObjectLink,
    ObjectFile,
    LinkToObject,
    FileToObject,
)

from wondrous.models.post import (
    WallPost,
)

from wondrous.models.page import (
    Page,  # UNUSED
    UserToPage,  # UNUSED
)

from wondrous.models.person import (
    Person,
    UnverifiedEmail,
    WaitingList,
)

from wondrous.models.tag import (
    GlobalTag,
    ObjectTag,
)

from wondrous.models.user import (
    BlockedUser,
    User,
)

from wondrous.models.vote import (
    ObjectVote,
    ObjectBookmarkVote,
    UserVote,
)


def initialize_sql(settings):

    """ Called by the app on startup to setup bindings to the DB """
    
    engine = engine_from_config(settings, 'sqlalchemy.')
    DBSession.configure(bind=engine)
    Base.metadata.bind = engine
