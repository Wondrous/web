#!/usr/bin/env python
# -*- coding: utf-8 -*-

#
# Company: WONDROUS
# Created by: John Zimmerman
#
# VALIDATION_UTILITIES.PY
#

import base64
import bcrypt
import cgi
import hmac
import re
import time
import urllib
import urllib2
import unicodedata

from datetime import date
from datetime import timedelta
from hashlib import sha1
from urlparse import urlparse

from wondrous.routes import TAKEN_PATHS
from wondrous.utilities.global_config import GLOBAL_CONFIGURATIONS


class UploadManager:
    @staticmethod
    def sign_upload_request(ouuid, mime_type):

        """
            Signs the upload request with our AWS credientials,
            returns the signed request url and the url of the content
        """

        AWS_ACCESS_KEY = 'AKIAJEZN45GB7GPFKF4A'
        AWS_SECRET_KEY = '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'
        AWS_S3_BUCKET  = 'mojorankdev'

        # Generate the timeframe for uploading
        expires = int(time.time()+10)
        amz_headers = 'x-amz-acl:public-read'

        # Generate the PUT request that the js will use
        put_request = "PUT\n\n%s\n%d\n%s\n/%s/%s" % (mime_type, expires, amz_headers, AWS_S3_BUCKET, ouuid)

        # Generate the signature with which the request can be signed:
        signature = base64.encodestring(hmac.new(AWS_SECRET_KEY, put_request, sha1).digest())
        # Remove surrounding whitespace and quote special characters:
        signature = urllib.quote_plus(signature.strip())

        # Build the URL of the file in anticipation of its imminent upload:
        url = 'https://%s.s3.amazonaws.com/%s' % (AWS_S3_BUCKET, ouuid)

        return {'signed_request': '%s?AWSAccessKeyId=%s&Expires=%d&Signature=%s' % (url, AWS_ACCESS_KEY, expires, signature),
                'url': url}

class PasswordManager(object):

    def _set_password(self, password):

        """
            PURPOSE: Hash and set the user's password

            USE: *DO NOT CALL DIRECTLY* This method
            is used as the setter for the password property

            PARAMS: 1 parameter, a str, password

            RETURNS: None
        """

        hashed_password = password

        if isinstance(password, unicode):
            password_8bit = password.encode('UTF-8')
        else:
            password_8bit = password

        # Hash a password for the first time,
        # with a randomly-generated "salt"
        # For more info, look up how bcrypt "salts" data
        salt = bcrypt.gensalt(10)
        hashed_password = bcrypt.hashpw(password_8bit, salt)

        # Make sure the hased password is an UTF-8 object at the end of the
        # process because SQLAlchemy _wants_ a unicode object for Unicode fields
        if not isinstance(hashed_password, unicode):
            hashed_password = hashed_password.decode('UTF-8')

        self._password = hashed_password

    def _get_password(self):

        """
            PURPOSE: Get the user's hashed password

            USE: *DO NOT CALL DIRECTLY* This method
            is used as the getter for the password property

            PARAMS: None

            RETURNS: A String - the hashed password
        """

        return self._password.encode('utf-8')

    def validate_password(self, password):

        """
            PURPOSE: Check the provided password
            against the DB password

            USE: "validate_password" is passed
            1 argument - "password". This is the
            clear text version that we will need to
            match against the hashed one in the database.

            PARAMS: 1 parameter, the password to validate

            RETURNS: A boolean indicating whether or
            not the password is valid
        """

        if self.password and password:
            salt = self.password[:29]
            return bool(self.password == bcrypt.hashpw(password, salt))
        else:
            return False


class _RegexCheck(object):

    @staticmethod
    def name(str_to_check):

        """
            PURPOSE: The checks to see if a given object (str) is
            a valid human name based on regex.

            PARAMS: the supposed name to check

            RETURNS: a boolean value if the username passes the
            regex check.

            Regex Requirements:
                - Can have a-z and A-Z
                - Can have some unicode (primarily standard accented) characters
                - No numbers
                - No special characters (e.g., !, @, $, #, %, ^, &, etc.)
        """

        pattern = u'^[^\^!@#$%&*(){}[\]<>=+_–.,;:\"~`¡™£¢∞§¶•ªº≠«π∑®†˚∆©ƒ∂ßΩ≈√∫µ≤≥÷…€‹›‡·±ˇˆ∏»◊¯¿\\\\0-9]+$'
        return True if str_to_check and re.match(pattern, str_to_check, re.IGNORECASE) else False

    @staticmethod
    def email(str_to_check):

        """
            PURPOSE: The checks to see if a given object (str) is
            a valid email based on regex.

            PARAMS: the supposed email to check

            RETURNS: a boolean value if the email passes the
            regex check.

            Regex Requirements:
                -One @ sign
                -One period after the @ sign...
                -With a character (a-z A-Z 0-9) before and after that period,
                -A letter/period (a-z A-Z 0-9 .) before the @ sign.
                -No spaces

            WARNING: This does NOT return False if:
                -There are consecutive periods preceeding the @ sign
                -The email starts with a period(s)
                -The email ends with a period(s) preceeding the @ sign
        """

        pattern = '[^@]+@[^@]+\.[^@]+'
        return True if str_to_check and re.match(pattern, str_to_check.lower()) else False

    @staticmethod
    def username(str_to_check):

        """
            PURPOSE: The checks to see if a given object (str) is
            a valid username based on regex.

            PARAMS: the supposed username to check

            RETURNS: a boolean value if the username passes the
            regex check.

            Regex Requirements:
                - Must letters a-Z and A-Z, with optional numbers 0-9
                - Can NOT be all digits 0-9
                - No special characters and no periods
                - No spaces
                - A maximum length of 15 characters

            WARNING: This does NOT return False if:
                -Only numbers or only letters (e.g., 345 or abc)
                -Multiple periods (e.g., b.o.b.s.m.i.t.h)
        """

        pattern_username   = '^[a-zA-Z0-9_]{1,15}$'
        pattern_all_digits = '^([0-9])+$'

        # Make sure username is valid and, specifically, is not all digits
        username = re.match(pattern_username, str_to_check, re.IGNORECASE)
        all_digits = re.match(pattern_all_digits, str_to_check, re.IGNORECASE)

        return True if (str_to_check and
                        username and
                        not all_digits and
                        str_to_check.lower() not in TAKEN_PATHS) else False

    @staticmethod
    def link(str_to_check):

        """
            PURPOSE: The checks to see if a given object (str) is
            a valid link based on regex.

            PARAMS: the supposed link to check

            RETURNS: a boolean value if the link passes the
            regex check.

            Regex Requirements:
                - Basically, this works with (http(s)://)__something__.__something__

            WARNING: This does NOT return False if:
                - For example, the extension could be ridiculous
                    stupid.linkfskjdfkdjnfs (will validate)
        """

        pattern = GLOBAL_CONFIGURATIONS['URL_REGEX']
        return True if str_to_check and re.match(pattern, str_to_check, re.IGNORECASE) else False

    @staticmethod
    def tag(str_to_check):

        """
            PURPOSE: The checks to see if a given object (str) is
            a valid tag based on regex.

            PARAMS: the supposed tag to check

            RETURNS: a boolean value if the tag passes the
            regex check.

            Regex Requirements:
                - a-z and A-Z
                - 0-9

            WARNING: This does NOT return False if:
                - The str_to_check contains only numbers
        """

        pattern = GLOBAL_CONFIGURATIONS['HASHTAG_REGEX']
        return True if str_to_check and re.match(pattern, str_to_check, re.IGNORECASE) else False


class Sanitize(object):

    @staticmethod
    def safe_input(text, strip=True):

        """
            PURPOSE: Make inputted form data 'safe'
            for handling on server side. It converts
            any unicode characters to utf-8 encoding
            so Python 2.x.x doesn't freak out.

            USE: For any inputted, textual data (which
            is almost any POST or GET data), push it through
            this method. Call like: Sanitize.safe_input(my_data [,strip=<True>])
            If you want to encode AND NOT strip leading/trailing
            whitespace, set the optional parameter strip=False.

            PARAMS: 2 params, 1. text, a required string.
            2. strip, optional boolean indicator to NOT strip
            off trailing and leading whitespace. Provide as such:
            safe_input(text, strip=False), otherwise, strip
            defaults to True.

            RETURNS: The encoded and optionally
            stripped inputted string, 'text'.
            If text is not True (i.e. empty or None),
            then this method returns None.
        """

        if not text:
            return None

        safe_text = text.encode('utf-8')

        if strip:
            safe_text = safe_text.strip()

        return safe_text

    @staticmethod
    def safe_output(text):

        """
            PURPOSE: Make outputted form data 'safe'
            for human readers, i.e., decode any ugly
            looking utf-8 encoded strings.

            USE: For any outputted, *textual* data,
            push it through this method.
            Call like: Sanitize.safe_output(my_data).

            NOTE: Using safe_output on a non-primitive
            object (i.e., something that's not a str,
            int, float) will raise an exception.
            Non-primitive objects cannot be "decoded".

            PARAMS: 1 param, a required string, 'text'.

            RETURNS: The decoded string, 'text', or None
        """

        if not text:
            return None

        return text.decode('utf-8')

    @staticmethod
    def strip_ampersand(username):
        pattern_ampersand  = '^([@＠])+$'

        # Test first character for an @
        if username and re.match(pattern_ampersand, username[0], re.IGNORECASE):
            username = username[1:]

        return username


    @staticmethod
    def length_check(object_to_check, min_length=0, max_length=255):

        """
            PURPOSE: Checks to see if a given object (str) is
            a valid length.

            USE: Call like: Sanitize.length_check(object_to_check, min_length=?, max_length=?)

            PARAMS: (
                    <the object to check>,
                    <a minimum length (defaults to 0)>,
                    <a maximum length (defaults to *inclusive* 255, ie. 256 will fail)>
                    )

            RETURNS: 2 values:
                1. a boolean value,
                2. a corresponding error message
        """

        string_length = len(str(object_to_check))

        if string_length < min_length:
            error_message = "too short. It must be at least {num} characters.".format(num=str(min_length))
            return False, error_message

        elif string_length > max_length:
            error_message = "too long. It must be no more than {num} characters.".format(num=str(max_length))
            return False, error_message

        else:
            return True, None

    @staticmethod
    def is_valid_email(object_to_check):

        """
            PURPOSE: The checks to see if a given object (str) is
            a valid email.

            PARAMS: 1 param, the email to check

            RETURNS: A boolean, True if the email passes the
            regex check and the length check, otherwise False
        """

        valid_length, _ = Sanitize.length_check(object_to_check, min_length=5, max_length=255)
        valid_regex = _RegexCheck.email(object_to_check)
        return True if valid_length and valid_regex else False

    @staticmethod
    def is_valid_username(object_to_check):

        """
            PURPOSE: To check to see if a given object (str) is
            a valid username.

            USE: Call like: Sanitize.is_valid_username(<str>)

            PARAMS: 1 param, a str, the username to check

            RETURNS: A boolean, True if the username is valid,
            or False if the username is invalid
        """

        valid_regex = _RegexCheck.username(object_to_check)
        return True if valid_regex else False


class ValidationHelper(object):

    @staticmethod
    def duration_expired(start_date, days=1):

        """
            PURPOSE: This determines whether or not there is
            a lock on a signup, based on a certain wait period
            in days between email submissions

            USE: Call like: ValidationHelper.duration_expired(<date>, <int>=1)

            PARAMS: 2 params:
                start_date : date : REQUIRED : The start date of the wait period
                days : int : default=1 : The number of days you must wait

            NOTE: start_date is NOT a datetime object. It is a *** date *** object

            RETURNS: A bool: True if you've waited long enough, False, otherwise

            EXAMPLE:
                - I get locked out on January 1, 3045
                - I must wait 1 day before I can try again
                - The next available day to try is January 3, 3045
                - There was a 1 day wait period -- January 2nd

                - January 3rd - 1 day = January 2nd
                - January 2nd > January 1st, hence I can try again
        """

        wait_period = date.today() - timedelta(days=days)
        return True if wait_period > start_date else False

    @staticmethod
    def valid_profile(user_id):

        """
            PURPOSE: This is basically an alias for the
            User.get() method.

            This checks to see if the user_id (which
            is the user's id) is found in the database.

            USE: Provide a user_id (== user_id) as the parameter.

            RETURNS: If it is, it returns the user object.
                     If not, it returns None.

            NOTE: from wondrous.models import User is included within
            the method to prevent a circular dependency between the
            models.py file and this file (validation_utilities.py).
        """

        from wondrous.models.user import User
        return User.get(user_id)

    @staticmethod
    def valid_tag(tag):

        """
            PURPOSE:
            1. This checks to make sure the tag has:
                Letters a-z and A-Z (i.e., no special characters/unicode),
                Numbers 0-9,
                and no spaces.

            2. Then it ensures the tag is 1 to 30 characters in length.

            USE: Provide the tag name (i.e., "Wondrous2014") as the parameter

            RETURNS: a bool
        """

        # If not valid, it match returns None
        valid_regex = _RegexCheck.tag(tag)
        return True if valid_regex and 1 <= len(tag) <= GLOBAL_CONFIGURATIONS['TAG_LENGTH'] else False

    @staticmethod
    def valid_object_tag(object_id, context_tag_id):
        from wondrous.models.tag import ObjectTagManager
        return ObjectTagManager.get(object_id, context_tag_id)

    @staticmethod
    def valid_start_value(start_value):
        try:
            start_value = int(start_value)
            if start_value < 0:
                start_value = 0

        except (ValueError, TypeError):
            return None

        return start_value


class ValidatePost(object):

    @staticmethod
    def sanitize_post_text(post_text):

        """
            PURPOSE: This checks to make sure the
            post text contains no excess white space.

            USE: Provide post_text as the parameter

            PARAMS: 1 param, a str or None

            RETURNS: the *sanitized* post_text, even if None

            NOTE: This works with None

            NOTE: The <br> tags must have a preceeding
            space or else the _linkify method will treat
            them as part of the url
        """

        if post_text:
            post_text = post_text.strip()  # strip trailing and leading whitespace
            post_text = cgi.escape(post_text)  # escape HTML characters
            # post_text = post_text.replace('\n', " <br/>")  # Replace \n's with <br>'s
            return re.sub("(\s*\n\s*){3,}", ' \n\n', post_text)  # Make 3 or more \n's into maximum 2 \n's
        else:
            return post_text

    @staticmethod
    def _valid_post_text(post_text, text_length=GLOBAL_CONFIGURATIONS['POST_TEXT_LENGTH']):

        """
            PURPOSE:
            This checks to see if the post text is valid:
                Is it None or just empty?
                Is it 6000 characters or less?

            USE: Provide post_text as the parameter

            RETURNS: If so, returns False
                     Otherwise, returns True

            NOTE: *Use in conjunction with sanitize_post_text() above*
        """

        return False if not post_text or len(post_text) > text_length else True

    @staticmethod
    def validate_post_content(post_subject, post_text, post_links, object_file_id):

        """
            PURPOSE: To validate a post's content, and
            return an error message if content is not valid

            USE: Call like: ValidatePost.validate_post_content(...)

            PARAMS: 2 required params
                - post_text  : str : REQUIRED : Optional text of a post
                - post_links : list : REQUIRED : Optional links present in post text
                - object_file_id : int : REQUIRED : Optional file present in post

                NOTE: 1 or more of these must be present and valid

            RETURNS: valid_data_dict, error_message

            NOTE: We do not strip out links from post_text, becasue
            if we have a False positive -- something that looks like
            a link but is not -- we don't want to destroy the flow of
            reading the post. However, becasue we need to verify links,
            filter-by posts with links, and add a mini-rendering of
            valid links, we still need to have the post_link list and
            insert them into the database.
        """

        valid_post_subject = None
        valid_post_text    = None
        valid_post_links   = None

        if post_links:
            valid_post_links = [l for l in post_links if ValidateLink._valid_post_link(l)]

        if post_text:
            valid_post_text = post_text if ValidatePost._valid_post_text(post_text) else None

        if post_subject:
            valid_post_subject = post_subject if ValidatePost._valid_post_text(post_subject, text_length=GLOBAL_CONFIGURATIONS['POST_SUBJECT_LENGTH']) else None

        if object_file_id:
            # We don't need to do anything to it,
            # but I have it here for logical
            # reading flow
            pass

        if valid_post_text or valid_post_links or object_file_id:

            final_post_data = {
                'post_subject'   : valid_post_subject,
                'post_text'      : valid_post_text,
                'post_links'     : valid_post_links,
                'object_file_id' : object_file_id,
            }
            return final_post_data, None

        else:
            return None, "Please post some text, add a link, or upload a delicious file of your choosing!"

class ValidateLink(object):
    
    @staticmethod
    def sanitize_post_link(post_link):

        """
            PURPOSE: This checks to make sure the
            post link contains no excess white space.
            And, it converts any of link's unicode to ascii.

            USE: Provide post_text as the parameter

            RETURNS: the *sanitized* post_text, even if None

            NOTE: This works with None
        """

        if post_link:
            post_link = post_link.strip()
            post_link = ValidateLink._to_ascii(unicode(post_link))
        return post_link

    @staticmethod
    def _valid_post_link(link):
        return True if _RegexCheck.link(link) else False

    @staticmethod
    def get_scheme(url):

        """
            PURPOSE: Get the http or https from URL

            USE: Call like: ValidateLink.get_scheme(...)

            PARAMS: 1 param, a str, the url to parse

            RETURNS: A str with the scheme if found, or '' if not
        """

        return urlparse(url).scheme

    @staticmethod
    def _to_ascii(string):
        return unicodedata.normalize('NFKD', string).encode('ascii','ignore')

    @staticmethod
    def get_content_type(valid_link):
        try:
            user_agent = "Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.9.0.7) Gecko/2009021910 Firefox/3.0.7"
            req = urllib2.Request(valid_link, headers={'User-Agent' : user_agent})
            response = urllib2.urlopen(req)
            http_message = response.info()
            return http_message.type.lower()
        except urllib2.URLError:
            return None

# --- TEST --------
# link = u"http://en.wikipedia.org/wiki/Ötzi"
# code = ValidateLink.valid_post_link(link)
# print code

#link = "http://design-milk.com/interior-design-12-concrete-interiors/concrete-fireplace-surround-robert-mills-2/"
#link = "https://www.gravatar.com/avatar/9ed3a8f933cd2db54b688e34a3818bec?s=32&d=identicon&r=PG"
#link = "http://thesmashable.com/wp-content/uploads/2012/06/james-bond-skyfall-007-wallpapers-desktop-backgrounds-james-bond-hd-wallpapers-007-2012-4.jpg"
#print ValidateLink.get_content_type(link)
# print ValidationHelper.valid_tag("#123123123123123123123123123123123123123123123123123123")

#print _RegexCheck.link(None)
# un = "SpaceX"
# print _RegexCheck.username(un)
