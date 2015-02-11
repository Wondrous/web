#!/usr/bin/env python
# -*- coding: utf-8 -*-

#
# Company: WONDROUS
# Created by: Ziyuan Liu
#
# controllers/postmanager.PY
#

from wondrous.models import (
    DBSession,
    User,
    Post,
    Object,
    Tag,
    Vote,
    PostTagLink,
    FeedPostLink
)

from sqlalchemy import or_

from wondrous.controllers.votemanager import VoteManager
from wondrous.controllers.basemanager import BaseManager

import uuid

class PostManager(BaseManager):

    @staticmethod
    def _move_post_into_feeds(post_id,user_id):
        # TODO if we ever reach over 100 followers? Time to work queue it up to a
        # slave server to process all this crap
        # TODO USER CORE SQL TO BULK ADD!!!!!!!
        for vote in VoteManager.get_all_followers(user_id):
            feed_id = vote.user.feed.id
            link = FeedPostLink(feed_id=feed_id,post_id=post_id)
            DBSession.add(link)

    @staticmethod
    def _process_tags(tags,post_id):
        # Add the tags
        for t in tags:
            new_tag, created = Tag.get_one_or_create(tag_name=t)
            link = PostTagLink(post_id=post_id,tag_id=new_tag.id)
            DBSession.add(link)

    @classmethod
    def add(cls,user_id,tags,subject,text,repost_id=None):
        """
            PURPOSE: the purpose of the this method is to allow users to post and
            repost objects

            Params:
                user_id: int : id of the author
                tags    : set : set list of tags
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

            new_object = Object(subject=subject,text=text)
            new_object.ouuid = unicode(uuid.uuid4())
            DBSession.add(new_object)
            DBSession.flush()

            new_post.object_id = new_object.id

        DBSession.add(new_post)
        DBSession.flush()

        if tags and len(tags)>0:
            cls._process_tags(tags,new_post.id)

        cls._move_post_into_feeds(new_post.id,user_id)
        DBSession.flush()

        return new_post

    @classmethod
    def repost_json(cls,person,post_id,tags=None,text=None):
        if not person:
            return {'error':'insufficient data'}
        post = PostManager.add(person.user.id,tags,None,text,repost_id=post_id)
        data = PostManager.model_to_json(post)
        return data

    @classmethod
    def post_json(cls,person,subject,text,tags=None):
        if not person or not subject or not text:
            return {'error':'insufficient data'}

        post = PostManager.add(person.user.id,tags,subject,text,repost_id=None)
        object = post.object

        data = PostManager.model_to_json(object)
        data.update(PostManager.model_to_json(post))
        return data

    @classmethod
    def deactivate_by_userid(cls,user_id):
        Post.query.filter(or_(Post.user_id==user_id,Post.owner_id==user_id)).update({'is_active':False})
        DBSession.flush()

    @classmethod
    def reactivate_by_userid(cls,user_id):
        Post.query.filter(or_(Post.user_id==user_id,Post.owner_id==user_id)).update({'is_active':True})
        DBSession.flush()
