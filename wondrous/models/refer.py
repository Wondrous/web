from datetime import datetime

from sqlalchemy import (
    BigInteger,
    Boolean,
    Column,
    DateTime,
    Integer,
    Unicode,
    ForeignKey,
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
import shortuuid
import base64
import re

def get_a_uuid(ref_id):
    return shortuuid.uuid().lower()

def check_email(str_to_check):
    pattern = '[^@]+@[^@]+\.[^@]+'
    return True if str_to_check and re.match(pattern, str_to_check.lower()) else False

class Referrer(Base, BaseMixin):
    uuid = Column(Unicode, unique=True)
    ref_uuid = Column(Unicode, nullable=True)
    email = Column(Unicode, unique=True)
    invitation_sent = Column(Boolean, default=False)

class ReferrerManager():
    @staticmethod
    def register(email, ref_uuid=None):
        if not check_email(email):
            return {'error':'bad email format'}

        ref = Referrer.by_kwargs(email=email).first()
        if ref:
            # already register/checking status
            ctn = Referrer.by_kwargs(ref_uuid=ref.uuid).count()
            return {'email':ref.email,'uuid':ref.uuid, 'referred':ctn}

        ref = Referrer(email=email,ref_uuid=ref_uuid)
        DBSession.add(ref)
        DBSession.flush()
        ref.uuid = get_a_uuid(ref.id)
        return {'email':ref.email,'uuid':ref.uuid, 'referred':0}

    @staticmethod
    def by_uuid(uuid):
        r = Referrer.by_kwargs(uuid=uuid).first()
        if r:
            ctn = Referrer.by_kwargs(ref_uuid=ref.uuid).count()
            return {'email':r.email, 'uuid':r.uuid, 'referred':ctn}
        else:
            return {'error':'invalid uuid'}
