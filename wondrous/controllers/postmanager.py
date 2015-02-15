#!/usr/bin/env python
# -*- coding: utf-8 -*-

#
# Company: WONDROUS
# Created by: Ziyuan Liu
#
# CONTROLLERS/POSTMANAGER.PY
#

import base64
import hmac
# import json
# import os
import time
import urllib
import uuid

from datetime import datetime
from hashlib import sha1

from sqlalchemy import or_

from wondrous.models import (
    DBSession,
    FeedPostLink,
    Object,
    Post,
    PostTagLink,
    Tag,
    # User,
    # Vote,
)

from wondrous.controllers.votemanager import VoteManager
from wondrous.controllers.basemanager import BaseManager


class PostManager(BaseManager):

    @staticmethod
    def _move_post_into_feeds(post_id, user_id):
        # TODO if we ever reach over 100 followers? Time to work queue it up to a
        # slave server to process all this crap
        # TODO USER CORE SQL TO BULK ADD!!!!!!!
        for vote in VoteManager.get_all_followers(user_id):
            feed_id = vote.user.feed.id
            link = FeedPostLink(feed_id=feed_id, post_id=post_id)
            DBSession.add(link)

    @staticmethod
    def _process_tags(tags, post_id):
        # Add the tags
        for t in tags:
            new_tag, created = Tag.get_one_or_create(tag_name=t)
            link = PostTagLink(post_id=post_id, tag_id=new_tag.id)
            DBSession.add(link)

    @classmethod
    def add(cls, user_id, tags, subject, text, repost_id=None, file_type=None):
        """
            PURPOSE: the purpose of the this method is to allow users to post and
            repost objects

            Params:
                user_id: int : id of the author
                tags      : set : set list of tags
                subject   : str : subject text of the item
                text      : str : text of the post
                repost_id : int : optional -- the object id to be reposted

            RETURN: the newly created Post
        """
        if repost_id:
            old_post = Post.by_id(repost_id)
            new_post = Post(user_id=user_id, repost_id=repost_id)

            if old_post.repost_id:
                # this is a repost of there must exists an original
                new_post.original_id = old_post.original_id
            else:
                new_post.original_id = repost_id
            if text:
                new_post.text = text

        else:
            # take it apart
            # First create the post container, then the object
            new_post = Post(user_id=user_id)
            new_object = Object(subject=subject, text=text)
            DBSession.add(new_object)
            DBSession.flush()

            if file_type:
                new_object.ouuid = str(new_object.id)+'-'+unicode(uuid.uuid4()).lower()
                new_object.mime_type = file_type

            new_post.object_id = new_object.id

        DBSession.add(new_post)
        DBSession.flush()

        if tags and len(tags)>0:
            cls._process_tags(tags, new_post.id)

        cls._move_post_into_feeds(new_post.id, user_id)
        DBSession.flush()

        return new_post

    @classmethod
    def repost_json(cls, person, post_id, tags=None, text=None):
        if not person:
            return {'error': 'insufficient data'}
        post = PostManager.add(person.user.id, tags, None, text, repost_id=post_id)
        data = PostManager.model_to_json(post)
        return data

    @classmethod
    def _sign_upload_request(cls, ouuid, mime_type):
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

    @classmethod
    def post_json(cls, person, subject, text, tags=None, file_type=None):
        if not person or not subject or not text:
            return {'error': 'insufficient data'}

        post = PostManager.add(person.user.id,tags,subject,text,repost_id=None, file_type=file_type)
        object = post.object

        data = PostManager.model_to_json(object)
        if file_type:
            data.update(cls._sign_upload_request(object.ouuid, object.mime_type))

        data.update(PostManager.model_to_json(post))
        return data

    @classmethod
    def delete_post_json(cls, person, post_id):
        user_id = person.user.id
        post = Post.by_id(post_id)
        if post and post.user_id == user_id:
            post.set_to_delete = datetime.now()
            post.is_active = False
            return {"status": "set to delete"}
        else:
            return {"error": "insufficient data"}

    @classmethod
    def deactivate_by_userid(cls,user_id):
        Post.query.filter(or_(Post.user_id == user_id,Post.owner_id == user_id)).update({'is_active': False})
        DBSession.flush()

    @classmethod
    def reactivate_by_userid(cls,user_id):
        Post.query.filter(or_(Post.user_id == user_id,Post.owner_id == user_id)).update({'is_active': True})
        DBSession.flush()
