#!/usr/bin/env python
# -*- coding: utf-8 -*-

#
# Company: WONDROUS
# Created by: Ziyuan Liu
#
# CONTROLLERS/EMAILMANAGER.PY
#

import logging
import shortuuid
import boto.ses

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

def generate_referral_verification(ref):
    ref.verification_code = random = shortuuid.ShortUUID().random(length=20)
    DBSession.add(ref)
    return random

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
        self.conn = boto.ses.connect_to_region('us-west-2', aws_access_key_id=aws_access_key, aws_secret_access_key=aws_secret_access_key)

    def send_activation_link(self,user=None, email=None):
        if email:
            user = DBSession.query(User).filter_by(email=email).first() if not user else user
        if user:
            code = generate_verification_code(user)
            url = "https://wondrous.co/activate/"+code
            content = """
Hey Friend,
Welcome to Wondrous, your next generation expression platform.

We couldn't be more excited to invite you to be one of the first users on our ever-evolving baby/child/alien from another planet.

The best part about it all? You decide how Wondrous will be used. Do you want to share funny memes? Start meaningful discussions? Show off your art? Repackage and distribute your blog content?

Wondrous gives you the ability to do it all & more in an incredibly simple-to-use experience.

**One thing to remember, "With great power (being one of the first on Wondrous), comes great responsibility." -Spiderman's grandpa or something?

We're looking to you, yes YOU, for feedback on the general experience. What you love, what you hate, what you love and hate, all at the same time.

Please shoot any feedback you have to {0}, and we'll be sure to send over some annoying surveys that we hope a certain % of you fill out, so we can continue to water this plant we call Wondrous.

Here is your verification link: {1}

With so much curiosity and even more love,

The Wondrous Team
(@John + @Tim + @Zi + @Nick) """.format("hello@wondrous.co",url)
            try:
                self.conn.send_email('hello@wondrous.co','Wondrous Verification Email',content,[user.email])
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

    def send_waitlist_signup(self,ref):
        code = generate_referral_verification(ref)
        url = "https://wondrous.co/signup/"+code
        try:
            self.conn.send_email('hello@wondrous.co','Welcome to Wondrous',"You have invited N people!, welcome to wondrous!\n"+url,[ref.email])
        except Exception, e:
            logging.warn(e.message)
            return False
        return True
