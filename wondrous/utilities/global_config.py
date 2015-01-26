#!/usr/bin/env python
# -*- coding: utf-8 -*-

#
# Company: WONDROUS
# Created by: John Zimmerman
#
# GLOBAL_CONFIG.PY
#

GLOBAL_CONFIGURATIONS = {
    "POSTS_PER_PAGE"      : 5,

    "POST_TEXT_LENGTH"    : 6000,
    "POST_SUBJECT_LENGTH" : 50,
    "MAX_COMMENT_LENGTH"  : 1100,

    "MAX_TAG_NUM"         : 15,
    "TAG_LENGTH"          : 50,

    "NOTIFICATION_BATCH"  : 10,

    "MAX_CHAR_SHOW_TEXT"  : 670,
    "MAX_BR_SHOW_TEXT"    : 10,

    "URL_REGEX"           : u'((https?:\/\/)?[\w-]+(\.[\w-]+)+\.?(:\d+)?(\/\S*)?)',
    "HASHTAG_REGEX"       : u'^[a-zA-Z0-9]+$',
    "HASHTAG_REGEX_FULL"  : u'(#[a-zA-Z0-9]+)',  # TODO: This REGEX is not robost enough

    "EXIF_IMG_DIR_PATH"   : "~/tmp_exif_img_bucket/",  # Don't change unless you have a death wish
    "MAX_FILE_SIZE"       : 35000000,  # Kilobytes

    "MAX_REPORT_LENGTH"   : 2000,  # The text description of why a post was reported
}

SYS_CONTEXT_TAGS = {
    'wall' : '__wall__',
}

# TODO: Needs to be redone
NOTIFICATION_REASON = [
    "comment_on_my_post",    # 0
    "involved_in_same_post", # 1
    "liked_my_post",         # 2
    "posted_on_my_wall",     # 3 || Can't happen anymore (no posting to other people's walls)
    #"voted_on_me",          # 4
    "follow_request",        # 5
    "accepted_request",      # 6
    #"commented_on_a_post_on_my_wall", # 7
]
