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

import wondrous.controllers
from wondrous.models.modelmixins import BaseMixin
import shortuuid
import base64
import re
import logging

from datetime import datetime

def get_a_uuid():
    return shortuuid.uuid().lower()

def check_email(str_to_check):
    pattern = '[^@]+@[^@]+\.[^@]+'
    return True if str_to_check and re.match(pattern, str_to_check.lower()) else False

class Referrer(Base, BaseMixin):
    uuid = Column(Unicode, unique=True)
    ref_uuid = Column(Unicode, nullable=True)
    email = Column(Unicode, unique=True)
    verification_code = Column(Unicode, unique=True, nullable=True)
    invitation_sent = Column(DateTime, nullable=True)
    link_sent = Column(DateTime, nullable=True)
    used = Column(Boolean, default=False)

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

        uuid = get_a_uuid()
        while DBSession.query(Referrer).filter_by(uuid=uuid).count()>0:
            uuid = get_a_uuid()

        ref = Referrer(email=email,ref_uuid=ref_uuid, uuid=uuid)
        DBSession.add(ref)
        DBSession.flush()

        #send an email
        sent = wondrous.controllers.email_controller.send_waitlist_confirmation(ref.uuid,ref.email)
        if sent:
            ref.link_sent = datetime.now()
            DBSession.add(ref)

        #lastly check if the original referring user has reached the amount to join
        if ref_uuid:
            ctn = Referrer.by_kwargs(ref_uuid=ref_uuid).count()
            if ctn>=25:
                ref = Referrer.by_kwargs(uuid=ref_uuid).first()
                if ref and False==ref.used and wondrous.controllers.email_controller.send_waitlist_signup(ref):
                    ref.invitation_sent = datetime.now()

        return {'email':ref.email,'uuid':ref.uuid, 'referred':0}

    @staticmethod
    def by_uuid(uuid):
        r = Referrer.by_kwargs(uuid=uuid).first()
        if r:
            ctn = Referrer.by_kwargs(ref_uuid=r.uuid).count()
            return {'email':r.email, 'uuid':r.uuid, 'referred':ctn}
        else:
            return {'error':'invalid uuid'}

    @staticmethod
    def by_verification_code(code):
        r = Referrer.by_kwargs(verification_code=code).first()
        return r
