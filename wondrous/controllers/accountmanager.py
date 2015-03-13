#!/usr/bin/env python
# -*- coding: utf-8 -*-

#
# Company: WONDROUS
# Created by: Ziyuan Liu
#
# CONTROLLERS/ACCOUNTMANAGER.PY
#

import uuid, logging

from datetime import datetime

from wondrous.models import (
    DBSession,
    Feed,
    User,
    Vote,
    Object,
    Badge,
    Post,
    Comment,
    Notification
)
import transaction


from wondrous.controllers.basemanager import BaseManager
from wondrous.controllers.notificationmanager import NotificationManager

from wondrous.utilities.validation_utilities import UploadManager
from wondrous.utilities.notification_utilities import send_notification
from wondrous.utilities.validation_utilities import (
    Sanitize
)
import shortuuid
from datetime import datetime, timedelta
from sqlalchemy import func, distinct, or_, case
from sqlalchemy.orm import aliased


class AccountManager(BaseManager):

    """
        This is controller for both user models!

        'user_type'  : 1,
        'username'   : "username"+str(i),
        'email'      : email,
        'password'   : "password"+str(i),

        'name'       : "name"+str(i),
    """

    DYNAMIC_FIELDS = ['username', 'name', 'ascii_name']  # TODO Should this be a set?

    @staticmethod
    def verify_user(verification_code, password = None):
        u = DBSession.query(User).filter_by(verification_code=verification_code).first()
        if u:
            #check the time
            verification_date = u.verification_date
            if (datetime.utcnow()-verification_date<timedelta(1)):
                if password:
                    _s_valid_pw, len_err_pw = Sanitize.length_check(password, min_length=6, max_length=255)
                    if not _s_valid_pw:
                        return None
                    u.password = password
                else:
                    u.verified = True

            u.verification_code = None
            u.verification_date = None
            DBSession.add(u)
            return u
        else:
            return None

    @staticmethod
    def request_verify(email):
        user = DBSession.query(User).filter_by(email=email).first()
        if user and not user.verified:
            return user
        return None

    @staticmethod
    def is_username_taken(username):
        return True if User.by_kwargs(username=username).count() > 0 else False

    @staticmethod
    def is_active(user_id):
        u = User.by_id(user_id)
        if u:
            return not u.is_active
        return False # safe than sorry

    @staticmethod
    def is_private(user_id):
        u = User.by_id(user_id)
        if u:
            return u.is_private
        return True

    @classmethod
    def add_badge_benefits(cls,user):
        scores = 0
        for badge in user.badges:
            if badge.badge_type == Badge.INFLUENCER:
                scores += 75
        return scores

    @classmethod
    def calculate_wondrous_score(cls,user):
        #TODO probably background it in the future

        last_updated = user.last_calculated
        if not last_updated:
            last_updated = datetime(year=2,month=2,day=2,hour=2,minute=2,second=2)
        if (datetime.now()-last_updated>timedelta(hours=0)):
            wondrous_score = 0

            try:
                ret = DBSession.execute("""Select
                    (select count(*)
                    from vote
                    where vote.subject_id=:user_id) as follower_count,

                    (select count(*)
                    from vote
                    where vote.user_id=:user_id and (vote.status=6 or vote.status=7)) as following_count,

                    (select count(*)
                    from post
                    where post.user_id=:user_id and post.set_to_delete is NULL) as post_count,

                    (select sum(post.like_count)
                    from post
                    where post.user_id=:user_id) as like_count,

                    (select sum(post.view_count)
                    from post
                    where post.user_id=:user_id) as view_count,

                    (select count(*)
                    from comment
                    join post
                    on  post.user_id=:user_id and comment.post_id = post.id and post.set_to_delete is Null) as comment_count""",{'user_id':user.id})

            except Exception, e:
                return user.wondrous_score
            ret = ret.fetchall()[0]
            if ret:
                follower_count, following_count, post_count, like_count, view_count, comment_count = ret

                wondrous_score = float(comment_count*1 + follower_count*5 + following_count*1 + post_count*1 + view_count*5 + like_count*5)
                wondrous_score/=10.0
                logging.warn(wondrous_score)
                logging.warn("%i %i %i %i %i %i"%(comment_count, follower_count, following_count, post_count, view_count, like_count))
                wondrous_score+=cls.add_badge_benefits(user)
                user.wondrous_score = wondrous_score
                user.last_calculated = datetime.now()
            return wondrous_score
        return None

    @classmethod
    def add(cls, name, email, username, password):
        # First let's create the object object - point of contact for the account
        new_user = User(name=name, username=username, email=email, password=password, is_active=True)

        DBSession.add(new_user)
        DBSession.flush()

        new_feed = Feed(user_id=new_user.id)

        DBSession.add(new_feed)

        # Follow yourself
        vote = Vote(user_id=new_user.id, subject_id=new_user.id, vote_type=Vote.USER, status=Vote.TOPFRIEND)

        DBSession.add(vote)

        cls.add_influencer(new_user)

        DBSession.flush()

        return new_user

    @staticmethod
    def add_influencer(user):
        if (datetime.now()<datetime(year=2015,month=4,day=15)):
            #TODO determine the datetime we can automatically endorse influencers
            try:
                b = Badge(user_id=user.id,badge_type=Badge.INFLUENCER)
                DBSession.add(b)
                DBSession.flush()
            except Exception, e:
                DBSession.rollback()

    @classmethod
    def upload_picture_json(cls, user, file_type):
        picture_object = user.picture_object
        if not picture_object:
            picture_object = Object(subject=str(user.id), text="profile_picture")
            DBSession.add(picture_object)
            DBSession.flush()
            user.picture_object_id = picture_object.id

        # TODO DELETE OLD PHOTO -- picture_object.ouuid
        picture_object.ouuid = str(picture_object.id)+'-'+unicode(uuid.uuid4()).lower()
        picture_object.mime_type = file_type
        data = UploadManager.sign_upload_request(picture_object.ouuid, picture_object.mime_type)
        data.update(user.json())
        data.update({"ouuid":picture_object.ouuid})

        return data

    @classmethod
    def get_one_by_kwargs(cls, **kwargs):
        return User.by_kwargs(**kwargs).first()

    @classmethod
    def _get_relationship_stats(cls, user_id):
        v1 = aliased(Vote)
        v2 = aliased(Vote)
        follower_count, following_count = DBSession.query(func.count(v1.id.distinct()),func.count(v2.id.distinct())).filter(v1.subject_id==user_id).filter(or_(v1.status==Vote.FOLLOWED,v1.status==Vote.TOPFRIEND)).\
        filter(v2.user_id==user_id).filter(or_(v2.status==Vote.FOLLOWED,v2.status==Vote.TOPFRIEND)).first()

        data = {
            "following_count" : following_count,
            "follower_count"  : follower_count,
        }

        return data

    @classmethod
    def get_json_by_username(cls, user, user_id = None, username = None, auth = False):
        if not user_id and not username:
            return {}

        if username:
            profile_user = User.by_kwargs(username=username).first()
        else:
            profile_user = User.by_id(user_id)

        if not profile_user:
            return {'error': 'no users found!'}

        user_id = profile_user.id

        #TODO combine the two sql calls 
        cls.calculate_wondrous_score(profile_user)

        try:
            ret = DBSession.execute("""Select
                (select count(*)
                from vote
                where vote.subject_id=:user_id) as follower_count,

                (select count(*)
                from vote
                where vote.user_id=:user_id and (vote.status=6 or vote.status=7)) as following_count,

                (select count(*)
                from vote
                where vote.user_id=:my_user_id and vote.subject_id=:user_id and (vote.status=6 or vote.status=7)) as am_following,

                (select count(*)
                from post
                where post.user_id=:user_id and post.set_to_delete is NULL) as post_count,

                (select count(*)
                from notification
                where notification.to_user_id=:user_id and notification.is_seen = false) as unseen_count

                """,{'user_id':profile_user.id,'my_user_id':user.id})
        except Exception, e:
            return {'error': 'no users found!'}
        ret = ret.fetchall()[0]

        follower_count, following_count, am_following, post_count, unseen_notification_count = ret

        follow_data = {
            "following_count" : following_count,
            "follower_count"  : follower_count,
            "following": am_following!=0,
            "post_count": post_count
        }

        # Am I querying for myself?
        if profile_user and profile_user.id == user.id:
            retval = follow_data

            retval.update(profile_user.json(1))
            retval.update({"name": profile_user.ascii_name})
            retval.update({"unseen_notifications": unseen_notification_count})
            picture_object = profile_user.picture_object

            cls.add_influencer(profile_user)
            if picture_object:
                retval.update({"ouuid": picture_object.ouuid})
            if auth:
                key = shortuuid.uuid()
                retval.update({'auth':key})
                send_notification(-1,str(key)+":"+str(user_id))
            return retval

        # If the profile_user is public or I am following
        if (not profile_user.is_private and not profile_user.is_banned and profile_user.is_active) or \
            (profile_user and not profile_user.is_banned and profile_user.is_active and am_following):

            retval = follow_data
            retval.update(super(AccountManager, cls).model_to_json(profile_user))
            retval.update({"name": profile_user.ascii_name})

            picture_object = profile_user.picture_object
            if picture_object:
                retval.update({"ouuid": picture_object.ouuid})
            return retval

        elif profile_user.is_private and not profile_user.is_banned and profile_user.is_active:
            retval = {}
            retval.update({"username": profile_user.username})
            retval.update({"name": profile_user.ascii_name})
            retval.update({'is_private': True})
            retval.update({'id': profile_user.id})
            return retval

        return {'error':'no users found!'}

    @classmethod
    def deactivate_json(cls, user, password):
        from wondrous.controllers.postmanager import PostManager

        if user and user.validate_password(password):
            user.is_active = False
            PostManager.deactivate_by_userid(user.id)
            return {'status': 'deactivated'}
        return {'error': 'deactivation failed'}

    @classmethod
    def delete_json(cls, user, password):

        if user and user.validate_password(password):
            user.set_to_delete = datetime.now()
            cls.deactivate_json(user,password)
            return {'status': 'set to delete in x days'}
        return {'error': 'deletion failed'}

    @classmethod
    def change_password_json(cls, user, old_password, new_password):

        if user and user.validate_password(old_password.encode('utf-8')):
            user.password = new_password
            DBSession.flush()

            retval = user.json(1)
            return retval
        return {"error": "password change failed"}

    @classmethod
    def change_name_json(cls, user, name):
        data = cls.change_profile_json(user,'name',name)
        data.update(cls.change_profile_json(user,'ascii_name',unicode(name)))

        retval = user.json(1)
        retval.update(data)
        return retval

    @classmethod
    def change_username_json(cls, user, username):
        data = cls.change_profile_json(user,'username',username)
        retval = user.json(1)
        retval.update(data)
        return retval

    @classmethod
    def change_profile_json(cls, user, field, new_value):
        if field not in cls.DYNAMIC_FIELDS:
            return {"error": field + " not found"}

        exists = getattr(user, field, None)
        if exists:
            setattr(user, field, new_value)
            try:
                DBSession.flush()
            except Exception, e:
                return {'error':str(e)}
            return {field: new_value}

        return {"error": field + " not found"}