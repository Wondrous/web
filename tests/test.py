import transaction
import unittest
import inspect

from sqlalchemy import create_engine
from webtest import TestApp

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
    VoteManager,
    AccountManager,
    PostManager,
    NotificationManager,
    )

from paste.deploy.loadwsgi import appconfig
from sqlalchemy import engine_from_config
# import logging

settings = appconfig('config:'+'test.ini',relative_to='.')

def setUpModule():
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

def tearDownModule():
    Base.metadata.drop_all()

class ModelTest(unittest.TestCase):
    def setUp(self):
        # self.log= logging.getLogger(__file__)
        # wait a minute this is the first time we've seen transaction isn't it?
        # yes. a transaction sits between the db and the session, if we didn't
        # have this everything we added to the session would be available for
        # all tests, and these tests would fail (and actually hang without
        # completing, I don't know why) but with a transaction begin and abort we can use the
        # session and let the transaction throw everything away for us.
        self.users = []
        transaction.begin()

    def tearDown(self):
        transaction.abort()

    def create_users(self,ran):
        for i in ran:
            email = "email"+str(i)+"@gmail.com"
            username        = "username"+str(i)
            password        = "password"+str(i)
            first_name = "first_name"+str(i)
            last_name  = "last_name"+str(i)

            u = AccountManager.add(first_name,last_name,email,username,password)
            yield u

    def delete_vote(self,user_id,subject_id,vote_type,status):
        if vote_type==Vote.USER:
            # delete the vote for deny/cancel request, then set the notification to not visible
            Vote.delete_by_kwargs(user_id=user_id,subject_id=subject_id,vote_type=vote_type,status=status)
            reason = None

            if status == Vote.PENDING:
                reason = Notification.FOLLOW_REQUEST
            elif status == Vote.FOLLOW:
                reason = Notification.FOLLOWED

            if reason:
                Notification.delete_by_kwargs(from_user_id=user_id, to_user_id=subject_id, subject_id=user_id, reason=reason)

    def testUserCreation(self):
        users = [u for u in self.create_users(range(5))]
        for user in users:

            person = Person.by_kwargs(user_id=user.id).first()
            feed = Feed.by_kwargs(user_id=user.id).first()

            is_following_myself = VoteManager.is_following(user.id,user.id)

            self.assertEquals(Person.by_kwargs(user_id=user.id).count(),1)
            self.assertEquals(feed.user,person.user)
            self.assertEquals(is_following_myself,True)

        self.assertEquals(5,User.count())
        self.assertEquals(5,Person.count())

    def testUserFollow(self):
        """
            Scenario:
                n users will follow each other

                testing for notification
        """
        user1, user2 = (u for u in self.create_users(range(5,7)))

        # Follow
        notified = VoteManager.vote_on_user(user1.id,user2.id,Vote.FOLLOW)
        self.assertEquals(VoteManager.is_following(user1.id,user2.id),True)
        self.assertEquals(VoteManager.is_following(user2.id,user1.id),False)

        note_count = Notification.by_kwargs(from_user_id=user1.id,to_user_id=user2.id,\
            subject_id=user1.id,reason=Notification.FOLLOWED).count()
        self.assertEquals(note_count,1)

        # Unfollow
        notified = VoteManager.vote_on_user(user1.id,user2.id,Vote.UNFOLLOW)

        self.assertEquals(VoteManager.is_following(user1.id,user2.id),False)
        self.assertEquals(VoteManager.is_following(user2.id,user1.id),False)

        # FOLLOW - make sure the second follow isn't notified
        notified = VoteManager.vote_on_user(user1.id,user2.id,Vote.UNFOLLOW)

        # Make sure unseen votes are merged (deleted)
        note_count = Notification.by_kwargs(from_user_id=user1.id,to_user_id=user2.id,\
            subject_id=user1.id,reason=Notification.FOLLOWED).count()
        self.assertEquals(note_count,1)

    def testPrivateUserFollow(self):
        """
            Scenario:
                n users will follow each other
                with private profiles
                testing for notification
        """
        user1, user2 = (u for u in self.create_users(range(7,9)))

        # set user 2 as private
        user2.is_private = True

        # Request to Follow
        notified = VoteManager.vote_on_user(user1.id,user2.id,Vote.FOLLOW)
        self.assertEquals(VoteManager.is_following(user1.id,user2.id),False)

        note_count = Notification.by_kwargs(from_user_id=user1.id,to_user_id=user2.id,\
            subject_id=user1.id,reason=Notification.FOLLOW_REQUEST).count()
        self.assertEquals(note_count,1)

        # Request Accepted
        notified = VoteManager.accept_request(user2.id,user1.id)
        note_count = Notification.by_kwargs(from_user_id=user2.id,to_user_id=user1.id,\
            subject_id=user2.id,reason=Notification.FOLLOW_ACCEPTED).count()
        self.assertEquals(note_count,1)
        self.assertEquals(VoteManager.is_following(user1.id,user2.id),True)

        # take user 1 off from following list
        # need to delete the vote
        notified = VoteManager.vote_on_user(user1.id,user2.id,Vote.UNFOLLOW)
        self.assertEquals(VoteManager.is_following(user1.id,user2.id),False)
        note_count = Notification.by_kwargs(from_user_id=user1.id,to_user_id=user2.id,\
            subject_id=user1.id,reason=Notification.FOLLOWED).count()
        self.assertEquals(note_count,0)

        # Request to Follow
        notified = VoteManager.vote_on_user(user1.id,user2.id,Vote.FOLLOW)
        note_count = Notification.by_kwargs(from_user_id=user1.id,to_user_id=user2.id,\
            subject_id=user1.id,reason=Notification.FOLLOW_REQUEST).count()
        self.assertEquals(note_count,1)
        self.assertEquals(VoteManager.is_following(user1.id,user2.id),False)

        # Delete the request
        self.delete_vote(user_id=user1.id,subject_id=user2.id,vote_type=Vote.USER,status=Vote.FOLLOW)
        self.assertEquals(VoteManager.is_following(user1.id,user2.id),False)
        note_count = Notification.by_kwargs(from_user_id=user1.id,to_user_id=user2.id,\
            subject_id=user1.id,reason=Notification.FOLLOWED).count()
        self.assertEquals(note_count,0)

        # Request to Follow
        notified = VoteManager.vote_on_user(user1.id,user2.id,Vote.FOLLOW)
        note_count = Notification.by_kwargs(from_user_id=user1.id,to_user_id=user2.id,\
            subject_id=user1.id,reason=Notification.FOLLOW_REQUEST).count()
        self.assertEquals(note_count,1)
        self.assertEquals(VoteManager.is_following(user1.id,user2.id),False)

        # Turn user 2 into a public one
        user2.is_private = False

        # Accept Request
        notified = VoteManager.accept_request(user2.id,user1.id)
        note_count = Notification.by_kwargs(from_user_id=user2.id,to_user_id=user1.id,\
            subject_id=user2.id,reason=Notification.FOLLOW_ACCEPTED).count()
        self.assertEquals(note_count,1)
        self.assertEquals(VoteManager.is_following(user1.id,user2.id),True)

        # User 2 block user 1
        notified = VoteManager.vote_on_user(user2.id,user1.id,Vote.BLOCK)
        self.assertEquals(VoteManager.is_following(user2.id,user1.id),False)
        self.assertEquals(VoteManager.is_blocked_by(user1.id,user2.id),True)
        self.assertEquals(VoteManager.is_blocking(user2.id,user1.id),True)

    def testCreatePosts(self):
        """
            Scenario:
                One user will create Posts
        """
        user1 = [u for u in self.create_users(range(7,8))]
        user1 = user1[0]
        tags = set(["tag1","tag2","tag3","tag4","tag5","tag6",])
        kwargs = {
            'user_id'        : user1.id,
            'tags'      : tags,
            'subject'   : "subject",
            'text'      : 'text',
        }

        post = PostManager.add(**kwargs)
        self.assertEquals(len(post.post_tag_links),6)

        for t in tags:
            num_of_objects = len(Tag.by_kwargs(tag_name=t).first().post_tag_links)
            self.assertEquals(num_of_objects,1)

        tags2 = set(["tag2","tag3","tag4","tag5","tag6",])
        kwargs = {
            'user_id'        : user1.id,
            'tags'      : tags2,
            'subject'   : "subject",
            'text'      : 'text',
        }

        # Lets post it ten times more, each tag should now correspond to 11 different articles
        for i in range(10):
            post = PostManager.add(**kwargs)

        for t in tags2:
            num_of_objects = len(Tag.by_kwargs(tag_name=t).first().post_tag_links)
            self.assertEquals(num_of_objects,11)

        tag = Tag.by_kwargs(tag_name="tag2").first()
        self.assertEquals(PostTagLink.by_kwargs(tag_id=tag.id).count(),11)

    def testFeedFollowingPosts(self):
        """
            Scenario:
                19 users - each will follow every one else...
        """
        users = [u for u in self.create_users(range(8,28))]
        for u in users:
            for v in users:
                if u is not v:
                    VoteManager.vote_on_user(u.id,v.id,Vote.FOLLOW)

        # Lets see how many followers do I have
        import random
        rand_int = random.randint(0,19)
        self.assertEquals(VoteManager.get_follower_count(users[rand_int].id),20)

        # Let's populate my feed
        u = users[rand_int]
        tags = set(["tag1","tag2","tag3","tag4","tag5","tag6",])

        post = PostManager.add(user_id=u.id,tags=tags,subject="subject",text="text")

        rand_int = random.randint(0,19)
        u1 = users[rand_int]
        self.assertEquals(len(u1.feed.feed_post_links),1)



if __name__ == '__main__':
    import sys
    # logging.basicConfig(stream=sys.stdout)
    # logging.getLogger(__file__).setLevel(logging.WARN)
    # # logging.getLogger('sqlalchemy.engine').setLevel(logging.INFO)

    unittest.main()
