import os
import sys
import transaction

from sqlalchemy import engine_from_config

from pyramid.paster import get_appsettings
from pyramid.paster import setup_logging

from wondrous.models import (
    DBSession,
    Base,
    initialize_sql,

    Admin,

    ObjectComment,

    ReportedContent,
    DeletedContent,

    Object,
    ObjectLink,
    ObjectFile,
    LinkToObject,
    FileToObject,

    WallPost,

    Page,  # UNUSED
    UserToPage,  # UNUSED

    Person,
    UnverifiedEmail,  # UNUSED
    # VerifiedEmail,  # UNUSED
    WaitingList,  # UNUSED  

    GlobalTag,
    ObjectTag,

    User,
    BlockedUser,

    ObjectVote,
    ObjectBookmarkVote,
    UserVote,
)


def usage(argv):
    cmd = os.path.basename(argv[0])
    print('usage: %s <config_uri>\n'
          '(example: "%s development.ini")' % (cmd, cmd))
    sys.exit(1)


def main(argv=sys.argv):
    if len(argv) != 2:
        usage(argv)
        
    config_uri = argv[1]
    setup_logging(config_uri)
    settings = get_appsettings(config_uri)
    initialize_sql(settings)
    engine = Base.metadata.bind
    Base.metadata.create_all(engine)

    from alembic.config import Config
    from alembic import command
    alembic_cfg = Config("alembic.ini")
    command.stamp(alembic_cfg, "head")
    
if __name__ == '__main__':
    main()
