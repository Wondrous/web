import transaction
import inspect
import unittest


from sqlalchemy import create_engine
import unittest

import wondrous.models
from wondrous.models import (
    DBSession,
    User,
    Person,
    Base,
    Feed,
    Vote,
    Notification,
    Object,
    Post,
    Tag,
    PostTagLink
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

settings = appconfig('config:'+'test.ini',relative_to='./wondrous/tests')

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
        assert json['total_following']==1
        assert json['total_follower']==1
