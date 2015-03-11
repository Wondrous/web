#!/usr/bin/env python
# -*- coding: utf-8 -*-

#
# Company: WONDROUS
# Created by: Ziyuan Liu
#
# CONTROLLERS/EMAILMANAGER.PY
#

import boto, logging
import shortuuid
from datetime import datetime

from wondrous.models import (
    User,
    DBSession
)

def verify_verification_code(uuid):
    u = DBSession.query(User).filter(User.verification==uuid).first()
    margin = datetime.timedelta(hours=12)
    if u and (datetime.now()-margin < u.verification_date < datetime.now()+margin):
        return u.uuid == uuid
    else:
        return False

def generate_verification_code(user):

    """
        12 hours to activate
        format = "random stored in user.verification_random"

    """

    user.verification_date = datetime.now()
    user.verification_code = random = shortuuid.ShortUUID().random(length=20)
    DBSession.add(user)
    return random

class EmailManager:

    def __init__(self, aws_access_key, aws_secret_access_key, **kwargs):
        self.conn = boto.connect_ses(aws_access_key, aws_secret_access_key)

    def send_activation_link(self,user=None, email=None):
        if email:
            user = DBSession.query(User).filter_by(email=email).first() if not user else user
        if user:
            code = generate_verification_code(user)
            url = "https://wondrous.co/activate/"+code
            try:
                self.conn.send_email('hello@wondrous.co','Wondrous Verification Email',url,[user.email])
            except Exception, e:
                logging.warn(e.message)
                return False
            return True
        return False

    def send_password_reset(self,email):
        user = DBSession.query(User).filter_by(email=email).first()
        if user:
            code = generate_verification_code(user)
            url = "https://wondrous.co/reset/"+code
            try:
                self.conn.send_email('hello@wondrous.co','Reset Password',url,[email])
            except Exception, e:
                logging.warn(e.message)
                return False
            return True
        else:
            return False

    def send_waitlist_confirmation(self,uuid,email):
        url = "https://wondrous.co/progress/"+uuid
        try:
            self.conn.send_email('hello@wondrous.co',\
                'Something wonderful is coming',"thank you for signing up for wondrous you check on your status "+url,\
                [email])
            return True
        except Exception, e:
            logging.warn(e.message)
            return False 

    def send_waitlist_signup(self,ref_uuid,email):
        pass
