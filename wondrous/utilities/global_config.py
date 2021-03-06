#!/usr/bin/env python
# -*- coding: utf-8 -*-

#
# Company: WONDROUS
# Created by: John Zimmerman
#
# GLOBAL_CONFIG.PY
#

from wondrous.utilities._url_regex_pattern import PATTERN

# print PATTERN

GLOBAL_CONFIGURATIONS = {
    "POSTS_PER_PAGE"      : 5,

    "POST_TEXT_LENGTH"    : 55000,  # Chars
    "POST_SUBJECT_LENGTH" : 50,    # Chars
    "MAX_COMMENT_LENGTH"  : 1100,  # Chars

    "MAX_TAG_NUM"         : 15,
    "TAG_LENGTH"          : 50,    # Chars

    "NOTIFICATION_BATCH"  : 10,

    "MAX_CHAR_SHOW_TEXT"  : 670,
    "MAX_BR_SHOW_TEXT"    : 10,

    "URL_REGEX"           : PATTERN,
    "HASHTAG_REGEX"       : u'^[a-zA-Z0-9]+$',  # Excludes the first #
    "HASHTAG_REGEX_FULL"  : u'(#[a-zA-Z0-9]+)',  # TODO: This REGEX is not robost enough
    "NAME_REGEX"          : u'^[^\^!@#$%&*(){}[\]<>=+_–.,;:\"~`¡™£¢∞§¶•ªº≠«π∑®†˚∆©ƒ∂ßΩ≈√∫µ≤≥÷…€‹›‡·±ˇˆ∏»◊¯¿\\\\0-9]+$',
    "EMAIL_REGEX"         : u'[^@]+@[^@]+\.[^@]+',
    "USERNAME_REGEX"      : [u'^[a-zA-Z0-9_]{1,30}$', u'^([0-9])+$'],
    "AMPERSAND_REGEX"     : u'^([@＠])+$',

    "EXIF_IMG_DIR_PATH"   : "~/tmp_exif_img_bucket/",  # Don't change unless you have a death wish
    "MAX_FILE_SIZE"       : 35000000,  # Kilobytes

    "MAX_REPORT_LENGTH"   : 2000,  # The text description of why a post was reported
}

SYS_CONTEXT_TAGS = {
    'wall' : '__wall__',
}
