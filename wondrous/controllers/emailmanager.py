#!/usr/bin/env python
# -*- coding: utf-8 -*-

#
# Company: WONDROUS
# Created by: Ziyuan Liu
#
# CONTROLLERS/EMAILMANAGER.PY
#

import boto
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
    user.verification_random = random = shortuuid.ShortUUID().random(length=20)
    DBSession.add(user)
    return random

class EmailManager:

    def __init__(self, aws_access_key, aws_secret_access_key, **kwargs):
        self.conn = boto.connect_ses(aws_access_key, aws_secret_access_key)

    def send_activation_link(self,user):
        code = generate_verification_code(user)
        url = "https://wondrous.co/activate/"+code
        # conn.send_email('hello@wondrous.co','verification email','something something something',['z@wondrous.co'])

    def send_password_reset(self,user):
        code = generate_verification_code(user)
        url = "https://wondrous.co/reset/"+code

    def send_waitlist_confirmation(self,user):
        code = generate_verification_code(user)
        url = "https://wondrous.co/signup?link="+code
