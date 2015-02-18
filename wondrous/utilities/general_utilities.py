#!/usr/bin/env python
# -*- coding: utf-8 -*-

#
# Company: WONDROUS
# Created by: John Zimmerman
#
# GENERAL_UTILITIES.PY
#

import smtplib

from functools import wraps
from pyramid.httpexceptions import HTTPFound

# --- MIMES TYPES ---------------
_APPLICATION_MIMES = [
    'application/pdf',
    'application/x-pdf',

    'application/rtf',
    'application/x-rtf',
]

_AUDIO_MIMES = [
    'audio/aac',

    'audio/mpeg3',
    'audio/x-mpeg-3',

    'audio/mp4',
    'audio/mpeg',

    'audio/ogg',

    'audio/wav',
    'audio/x-wav',

    'audio/webm',
]

_JPEG_IMAGE_MIMES = [
    "image/jpeg",
    "image/pjpeg",
]

_IMAGE_MIMES = [
    "image/gif",
    "image/png",
] + _JPEG_IMAGE_MIMES

# Only used for uploading profile pictures
# and cover pictures. We don't want gifs for these
_IMAGE_MIMES_NO_GIF = [
    "image/png",
] + _JPEG_IMAGE_MIMES

_TEXT_MIMES = [
    'text/csv',

    'text/plain',

    'text/rtf',
    'text/richtext',
]

_VIDEO_MIMES = [
    'video/mp4',
    'video/mpeg',
    'video/x-mpeg',

    'video/ogg',

    'video/webm',
]

_MICROSOFT_MIMES = [
    'application/powerpoint', # .ppt
    'application/mspowerpoint', # .ppt
    'application/x-mspowerpoint', # .ppt
    'application/vnd.ms-powerpoint', # .ppt, .pot, .pps, .ppa
    'application/vnd.openxmlformats-officedocument.presentationml.presentation', # .pptx

    'application/msword', # .doc, .dot
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', # .docx

    'application/excel',  # xls
    'application/x-excel',  # xls
    'application/x-msexcel',  # xls
    'application/vnd.ms-excel', # .xls, .xlt, .xla
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', # .xlsx
]

_DANGEROUS_MIMES = [
    'application/x-msdownload',
    'application/x-msdos-program',
    'application/x-msdos-windows',
    'application/x-download',
    'application/bat',
    'application/x-bat',
    'application/com',
    'application/x-com',
    'application/exe',
    'application/x-exe',
    'application/x-winexe',
    'application/x-winhlp',
    'application/x-winhelp',
    'application/x-javascript',
    'application/hta',
    'application/x-ms-shortcut',
    'application/octet-stream',
    'text/javascript',
    'text/scriptlet',
    'vms/exe',
]

_CORRUPT_MIMES = [
    'application/CDFV2-corrupt',
]

INVLAID_MIME_TYPES = set(
    _CORRUPT_MIMES +
    _DANGEROUS_MIMES
)

VALID_MIME_TYPES = set(
    _APPLICATION_MIMES +
    _AUDIO_MIMES +
    _IMAGE_MIMES +
    _TEXT_MIMES +
    _VIDEO_MIMES +
    _MICROSOFT_MIMES
)

import json

def api_login_required(func):
    @wraps(func)
    def wrapper(self, *args, **kwargs):
        if self.request.person:
            return func(self,*args,**kwargs)
        else:
            resp = self.request.response
            resp.body = json.dumps({'error':'not logged in'})
            resp.content_type = 'application/json'
            return resp
    return wrapper

def login_required(func):

    """
        PURPOSE: A decorator that ensures a view is only
        accesible when a user is logged *in*

        USE: Decorate a handler with:
                @login_required  <---- Decorator
                @view_config(...)
                def my_view_handler():
                    pass  # Do stuff here

        PARAMS: No params when used as a decorator

        RETURNS: A bound function, which gets implicitly
        called via wrapper, i.e., it proceeds with the
        handler method as normal. Or, if user logged out,
        it perfroms a redirect back to index, via HTTPFound("/")
    """

    @wraps(func)
    def wrapper(self, *args, **kwargs):
        return func(self,*args,**kwargs) if self.request.person else HTTPFound("/login/")
    return wrapper

def SYSTEM_ADMIN_REQUIRED(super_admin=False):
    def wrapper(func):
        def wrapper2(self, *args, **kwargs):
            try:
                if super_admin:
                    return func(self,*args,**kwargs) if self.request.admin and self.request.admin.super_admin else HTTPFound("/")
                else:
                    return func(self,*args,**kwargs) if self.request.admin else HTTPFound("/")
            except AttributeError:
                return HTTPFound("/")
        return wrapper2
    return wrapper

def logout_required(func):

    """
        PURPOSE: A decorator that ensures a view is only
        accesible when a user is logged *out*

        USE: Decorate a handler with:
                @logout_required  <---- Decorator
                @view_config(...)
                def my_view_handler():
                    pass  # Do stuff here

        PARAMS: No params when used as a decorator

        RETURNS: A bound function, which gets implicitly
        called via wrapper, i.e., it proceeds with the
        handler method as normal. Or, if user logged in,
        it perfroms a redirect back to index, via HTTPFound("/")
    """

    @wraps(func)
    def wrapper(self, *args, **kwargs):
        return HTTPFound("/") if self.request.person else func(self,*args,**kwargs)
    return wrapper

def url_match(self, url_match=None, arg_type="str"):

    """
        PURPOSE: A convenient helper method to facilitate
        matching wildcard routes, i.e.,

            config.add_route(my_view_handler, '/some/{page}/')

        USE: Use at te top of each view whose route
        contains a wildcard. Typically, the wildcard is
        named 'page', thus 'page' is the default url_match;
        however, you can specify a custom wildcard name
        as an optional parameter.

            Call like: page = url_match(self, url_match=<name_to_match>[, arg_type="int"])

        PARAMS: 3 params, 1st is 'self', and is required.
        2nd is the optional url_match, which must be the
        same name as the wildcard in the particular view
        method this is being called within. 3rd is
        arg_type, which is optional and defaults to "str"

            arg_type can be either: "str" or "int"

        NOTE: only necessary to provide arg type if an "int"
        is needed.

        RETURNS: If found, the name of the wildcard,
                 If not found, None.
    """

    if not url_match:
        url_match = 'page'

    p = self.request.matchdict.get(url_match, None)

    if arg_type == "int":
        try:
            p = int(p)
        except ValueError:
            p = None

    return p

def send_email(to_email, verification_code):

    """
        PURPOSE: Send a verification email from a
        Cloaky.co Gmail SMTP mail server

        USE: Call like: send_email(<str>,<str>)

        PARAMS: 2 required params:
            to_email : str : The email to which the message is being sent
            verification_code : str : The UUID associated with the unverified email

        RETURNS: If there is an error, it returns a str
                 Otherwise, it returns None
    """

    SERVER = "smtp.gmail.com"
    PORT = 587  # Or port 465

    USER = ""  # TODO
    PW  = ""  # TODO

    FROM       = 'Wondrous <hello@wondrous.com>'
    TO         = [to_email]  # must be a list

    SUBJECT    = "Confirm Email"
    TEXT       = """
Greetings & salutations,

Confirm your email for Wondrous by clicking this link:
http://www.mojorank.com/auth/verify/{code}/
""".format(code=verification_code)

    # Prepare actual message
    MESSAGE = """From: {f}\nTo: {t}\nSubject: {sub}\n\n{txt}""".format(
        f=FROM,
        t=", ".join(TO),
        sub=SUBJECT,
        txt=TEXT
    )

    try:
        server = smtplib.SMTP(SERVER, PORT)
        server.ehlo()
        server.starttls()
        server.login(USER, PW)
        server.sendmail(FROM, TO, MESSAGE)
        server.close()

        error_message = None
    except:
        error_message = "The confirmation email failed to send"

    return error_message

def get_object_url(oid, ouuid):
    return "/post/{oid}/{ouuid}/".format(
        oid=oid,
        ouuid=ouuid,
    )
