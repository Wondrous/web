#!/usr/bin/env python

#
# Company: WONDROUS
# Created by: Ziyuan Liu
#
# TESTS/TESTS.PY
#

import os
import inspect
import transaction
import unittest

from sqlalchemy import create_engine

import wondrous.models
from wondrous.models import (
    Base,
    DBSession,
    Feed,
    Notification,
    Object,
    Post,
    # PostTagLink,
    Tag,
    User,
    Vote,
)

from wondrous.controllers import (
    AccountManager,
    FeedManager,
    NotificationManager,
    PostManager,
    VoteManager,
    VoteAction,
    TagManager,
)

from paste.deploy.loadwsgi import appconfig
from sqlalchemy import engine_from_config


# John, your setting breaks my build :/ im just going to leave yours as a comment, i think
# disparity lies within our virtualenv file structure
# @Zi, agreed. This try/except should do the trick for now
try:
    settings = appconfig('config:'+'test.ini', relative_to=os.getcwd()+'/wondrous/tests/')
except IOError:
    settings = appconfig('config:'+'test.ini', relative_to=os.getcwd()+'/../wondrous/wondrous/tests/')

def setup_module(module):
    # once for all the tests in this module:

    # create an engine bound to the test db
    wondrous.models.engine = engine = engine_from_config(settings, 'sqlalchemy.')

    # first use of DBSession, bind it to our engine
    DBSession.configure(bind=engine)

    # bind our engine to the metadata so we can call drop_all later without
    # having the engine around
    Base.metadata.bind = engine

    # create_all to create tables
    Base.metadata.create_all()

    print ""
    print "Setting up modules"

def teardown_module(module):
    Base.metadata.drop_all()
    print ""
    print "tests finished, tearing down"

class TestModel:
    def setup(self):
        transaction.begin()

    def teardown(self):
        transaction.abort()

    def test_private_follow(self):
        user1 = AccountManager.add('first', 'user', 'user1@wondrous.co', 'user1', 'password')
        user2 = AccountManager.add('second', 'user', 'user2@wondrous.co', 'user2', 'password')

        user2.is_private = True

        person1 = user1.person
        person2 = user2.person

        #change first_name, last_name, password
        current_password = user1.password

        AccountManager.change_password_json(person1,"password","new_password")
        DBSession.refresh(user1)
        assert current_password!=user1.password

        current_password = user1.password

        # change back
        AccountManager.change_password_json(person1,"new_password","password")
        DBSession.refresh(user1)
        assert current_password!=user1.password

        #change to new name
        first_name, last_name, username = person1.first_name, person1.last_name, user1.username
        AccountManager.change_profile_json(person1,'first_name',"new_value")
        AccountManager.change_profile_json(person1,'last_name',"new_value")
        AccountManager.change_profile_json(person1,'username',"new_value")
        DBSession.refresh(user1)

        assert first_name!=person1.first_name
        assert last_name!=person1.last_name
        assert username!=user1.username

        # user2 is private, user1 will issue a follow request
        json = VoteManager.vote_json(person1,user2.id,1,VoteAction.FOLLOW)

        # there shouldn't be any new followers
        assert json['total_following']==1
        assert json['total_follower']==1

        # user1 shouldn't be following user2 yet
        is_following = VoteManager.is_following(user1.id, user2.id)
        assert is_following==False

        # the vote status should just revert to PENDING
        vote = VoteManager.get_vote(user1.id, user2.id, Vote.USER)
        assert vote.status == Vote.PENDING

        # user2 should have received 1 notification
        note1 = NotificationManager.notification_json(person2,0)
        assert len(note1)==1

        # user2 is going to deny the request
        json = VoteManager.vote_json(person2,user1.id,1,VoteAction.DENY)
        assert json['total_following']==1
        assert json['total_follower']==1

        # the vote status should just revert to UNFOLLOW
        vote = VoteManager.get_vote(user1.id, user2.id, Vote.USER)
        assert vote.status == Vote.UNFOLLOWED

        # user1 should have received 0 notification
        json = NotificationManager.notification_json(person1,0)
        assert len(json)==0

        # user1 is going to be persistent and request again!
        json = VoteManager.vote_json(person1,user2.id,1,VoteAction.FOLLOW)
        assert json['total_following']==1
        assert json['total_follower']==1

        # user2 should have received 1 notification, a new one though
        note2 = NotificationManager.notification_json(person2,0)
        assert len(note2)==1

        old_note = note1[0]
        new_note = note2[0]
        assert Notification.query.count()==1

        # user2 is annoyed, going to block user1
        json = VoteManager.vote_json(person2,user1.id,1,VoteAction.BLOCK)
        assert json['total_following']==1
        assert json['total_follower']==1

        # is user1 blocked?
        is_blocked = VoteManager.is_blocked_by(user1.id, user2.id)
        assert is_blocked == True

        # user2 is going to unblock
        json = VoteManager.vote_json(person2,user1.id,1,VoteAction.BLOCK)
        assert json['total_following']==1
        assert json['total_follower']==1

        # the vote status should just revert to UNFOLLOW
        vote = VoteManager.get_vote(user2.id, user1.id, Vote.USER)
        assert vote.status == Vote.UNFOLLOWED

        # is user1 blocked?
        is_blocked = VoteManager.is_blocked_by(user1.id, user2.id)
        assert is_blocked == False

        # user1 is going to be persistent and request again!
        json = VoteManager.vote_json(person1,user2.id,1,VoteAction.FOLLOW)
        is_following = VoteManager.is_following(user1.id,user2.id)
        assert is_following==False
        assert json['total_following']==1
        assert json['total_follower']==1

        # user2 decides to turn profile into a public one
        user2.is_private = False
        DBSession.flush()

        # user1 is going to be persistent and request again!
        json = VoteManager.vote_json(person1,user2.id,1,VoteAction.FOLLOW)
        is_following = VoteManager.is_following(user1.id,user2.id)
        assert is_following==True

    def test_feed(self):
        user1 = AccountManager.add('first', 'user', 'user1@wondrous.co', 'user1', 'password')
        user2 = AccountManager.add('second', 'user', 'user2@wondrous.co', 'user2', 'password')
        person1 = user1.person
        person2 = user2.person

        # user1 is going to follow user2
        json = VoteManager.vote_json(person1,user2.id,1,VoteAction.FOLLOW)
        is_following = VoteManager.is_following(user1.id,user2.id)
        assert is_following==True

        # First post by user2
        post_json = PostManager.post_json(person2,"subject","text",tags=set(['tag1','tag2','tag3','tag4']))
        assert len(post_json)>0

        feed_json = FeedManager.get_feed_posts_json(person1,FeedManager.MAJORITY,page=0)
        assert len(feed_json)==1

        wall_json = FeedManager.get_wall_posts_json(person2,person2.user.id,page=0)
        assert len(wall_json)==1

        # user2 is annoyed, going to block user1
        json = VoteManager.vote_json(person2,user1.id,1,VoteAction.BLOCK)
        assert json['total_following']==1
        assert json['total_follower']==1

        # is user1 blocked?
        is_blocked = VoteManager.is_blocked_by(user1.id, user2.id)
        assert is_blocked == True

        # user2 will post something
        post_json = PostManager.post_json(person2,"subject","text",tags=None)

        wall_json = FeedManager.get_wall_posts_json(person2,person2.user.id,page=0)
        assert len(wall_json)==2

        feed_json = FeedManager.get_feed_posts_json(person1,FeedManager.MAJORITY,page=0)
        assert len(feed_json)==1

        # user2 is unblocks user1
        json = VoteManager.vote_json(person2,user1.id,1,VoteAction.BLOCK)
        assert json['total_following']==1
        assert json['total_follower']==1

        # user1 is going to follow user2
        json = VoteManager.vote_json(person1,user2.id,1,VoteAction.FOLLOW)
        is_following = VoteManager.is_following(user1.id,user2.id)
        assert is_following==True

        # repost by user1
        repost_json = PostManager.repost_json(person1,1,tags=set(["tag6"]),text='LOL')
        tags = TagManager.by_post_id(repost_json['id'])
        tags  = [tag.tag_name for tag in tags]
        assert 'tag6' in tags

        # user2 will post something
        post_json = PostManager.post_json(person2,"subject","text",tags=None)
        feed_json = FeedManager.get_feed_posts_json(person1,FeedManager.MAJORITY,page=0)
        assert len(feed_json)==3

        # user2 is not following user1, thus no feed from user 1
        feed_json = FeedManager.get_feed_posts_json(person2,FeedManager.MAJORITY,page=0)
        for post_json in feed_json:
            assert post_json['user_id']!=person1.user.id
        assert len(feed_json)==3

        # User2 will deactive itself
        json = AccountManager.deactivate_json(person2,"password")
        feed_json = FeedManager.get_feed_posts_json(person1,FeedManager.MAJORITY,page=0)
        assert len(feed_json)==1

        PostManager.reactivate_by_userid(person2.user.id)
        feed_json = FeedManager.get_feed_posts_json(person1,FeedManager.MAJORITY,page=0)
        assert len(feed_json)==3

        # user2 will delete itself
        json = AccountManager.delete_json(person2,"password")
        feed_json = FeedManager.get_feed_posts_json(person1,FeedManager.MAJORITY,page=0)
        assert len(feed_json)==1
        DBSession.refresh(user2)
        assert user2.set_to_delete != None
