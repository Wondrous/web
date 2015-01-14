#!/usr/bin/env python
# -*- coding: utf-8 -*-

#
# Company: WONDROUS
# Created by: John Zimmerman
#
# MODELS/VOTE.PY
#

from datetime import datetime

from sqlalchemy import BigInteger
from sqlalchemy import Boolean
from sqlalchemy import Column
from sqlalchemy import DateTime
from sqlalchemy import ForeignKey
from sqlalchemy import Integer

from sqlalchemy.orm import relationship

from wondrous.models import Base
from wondrous.models import DBSession


class BaseVoteOperations(object):

    @staticmethod
    def _has_voted(this_cls, cls_row, user_id, row_var):

        """
            PURPOSE: Determine whether a particular user
            has voted on a particular object
        
            USE: Call like: BaseVoteOperations._has_voted(<cls_row>,<cls.row>,<int>,<int>)
        
            PARAMS: 4 required params:
                this_cls : The class of the database table being queried from
                cls_row  : The class_name.row_attr (i.e., the column of the table)
                user_id  : The id of the logged-in user
                row_var  : Typically, the id of object potentially voted on
        
            RETURNS: The object that user DID vote on,
                     Or, None if the user didn't vote on it.
        """

        return this_cls.query.filter(this_cls.user_id == user_id).\
                              filter(cls_row == row_var).first()

    @staticmethod
    def _new_vote(vote_data):

        """
            PURPOSE: Add a new vote into the database
        
            USE: Call like: BaseVoteOperations._new_vote(<dict>)

            PARAMS: A dict with 6 params, all required:
                this_cls    : cls : The class of the database table being added to
                cls_row     : cls.row : The row attr (column) of this_cls
                receiver_id : int : The FK to relate the new vote back to its object
                vote_obj    : obj : If the vote already exists, it's this object
                user_id     : int : The id of the logged-in user
                VOTE_TYPE   : int : 2 (double upvote) or 1 (upvote) or -1 (downvote)
        
            RETURNS: None
        """

        this_cls = vote_data['this_cls']
        cls_row = vote_data['cls_row']
        receiver_id = vote_data['receiver_id']
        vote_obj = vote_data['vote_obj']
        user_id = vote_data['user_id']
        VOTE_TYPE = vote_data['VOTE_TYPE']

        if vote_obj:
            vote_obj.vote_type = VOTE_TYPE
            vote_obj.date_voted = datetime.now()
        else:
            new_vote = this_cls()

            setattr(new_vote, cls_row, receiver_id)
            new_vote.user_id = user_id
            new_vote.vote_type = VOTE_TYPE

            DBSession.add(new_vote)

    @staticmethod
    def _del_vote(this_vote):

        """
            PURPOSE: Delete an existing vote object
        
            USE: Call like: BaseVoteOperations._del_vote(<obj>)
        
            PARAMS: 1 required param: the vote
            object of the vote being deleted
        
            RETURNS: None
        """

        if this_vote:
            DBSession.delete(this_vote)

    @staticmethod
    def _double_upvote(this_cls, user_id, receiver_id):

        """
            PURPOSE: Upvote an object, whether the object already
            exists or a new object has to be created
        
            USE: Call like: BaseVoteOperations._upvote(<cls>,<int>,<int>)
        
            PARAMS: 3 required params:
                this_cls    : The class of the database table being added to
                user_id     : The id of the logged-in user
                receiver_id : The FK to relate the new vote back to its object
        
            RETURNS: None
        """

        v = this_cls(user_id, receiver_id)
        v._new_vote(double_upvote=True)

    @staticmethod
    def _upvote(this_cls, user_id, receiver_id):

        """
            PURPOSE: Upvote an object, whether the object already
            exists or a new object has to be created
        
            USE: Call like: BaseVoteOperations._upvote(<cls>,<int>,<int>)
        
            PARAMS: 3 required params:
                this_cls    : The class of the database table being added to
                user_id     : The id of the logged-in user
                receiver_id : The FK to relate the new vote back to its object
        
            RETURNS: None
        """

        v = this_cls(user_id, receiver_id)
        v._new_vote(upvote=True)

    @staticmethod
    def _downvote(this_cls, user_id, receiver_id):

        """
            PURPOSE: Downvote an object, whether the object already
            exists or a new object has to be created
        
            USE: Call like: BaseVoteOperations._downvote(<cls>,<int>,<int>)
        
            PARAMS: 3 required params:
                this_cls    : The class of the database table being added to
                user_id     : The id of the logged-in user
                receiver_id : The FK to relate the new vote back to its object
        
            RETURNS: None
        """

        v = this_cls(user_id, receiver_id)
        v._new_vote(downvote=True)

    @staticmethod
    def _double_downvote(this_cls, user_id, receiver_id):

        """
            PURPOSE: Upvote an object, whether the object already
            exists or a new object has to be created
        
            USE: Call like: BaseVoteOperations._upvote(<cls>,<int>,<int>)
        
            PARAMS: 3 required params:
                this_cls    : The class of the database table being added to
                user_id     : The id of the logged-in user
                receiver_id : The FK to relate the new vote back to its object
        
            RETURNS: None
        """

        v = this_cls(user_id, receiver_id)
        v._new_vote(double_downvote=True)

    @staticmethod
    def _novote(this_cls, user_id, receiver_id):

        """
            PURPOSE: Remove (hard delete) an object vote,
            whether the object already exists or a new
            object has to be created
        
            USE: Call like: BaseVoteOperations._novote(<cls>,<int>,<int>)
        
            PARAMS: 3 required params:
                this_cls    : The class of the database table being added to
                user_id     : The id of the logged-in user
                receiver_id : The FK to relate the new vote back to its object
        
            RETURNS: None
        """

        v = this_cls(user_id, receiver_id)
        v._del_vote()

    @staticmethod
    def _get_vote_type(double_upvote, upvote, downvote, double_downvote):

        """
            PURPOSE: Determine whether a new
            vote is an upvote or a downvote
        
            USE: Call like: BaseVoteOperations._get_vote_type(<int>,<int>,<int>,<int>)
        
            PARAMS: 2 required params:
                double-upvote   : int : 2
                upvote          : int : 1
                downvote        : int : -1
                double-downvote : int : -2
        
            RETURNS: A 2 if a double_upvote, 
                     a 1 if an upvote, 
                     a -1 if a downvote, OR
                     a -2 if a double_downvote
        """

        if double_upvote:
            return 2
        elif upvote:
            return 1
        elif downvote:
            return -1
        elif double_upvote:
            return -2


class ObjectVote(Base):

    """
        PURPOSE: Keeps track of likes on objects

        This is equivalently referred to as:
            2  = <Not implemented -- unnecessary>
            1  = "Like (!)"
            (0  = "Unlike (!)")
            -1 = <Not implemented -- unnecessary>
            -2 = <Not implemented -- unnecessary>
    """

    __tablename__ = 'object_vote'

    id = Column(Integer, primary_key=True)
    object_id = Column(Integer, ForeignKey('object.id'), nullable=False)
    user_id = Column(BigInteger, ForeignKey('user.id'), nullable=False)
    vote_type = Column(Integer, nullable=False, default=0)
    date_voted = Column(DateTime, default=datetime.now)

    obj = relationship('Object', foreign_keys='ObjectVote.object_id')


class ObjectVoteManager(BaseVoteOperations):

    """
        PURPOSE: Contains all methods used to keep 
        track of likes on objects
    """

    def __init__(self, user_id, obj_id):        
        self.user_id  = user_id
        self.obj_id   = obj_id
        self.vote_obj = ObjectVoteManager.has_voted(self.user_id, self.obj_id)

    def _new_vote(self, upvote=False):

        """
            PURPOSE: Add a new up/down-vote into the database
        
            USE: *ONLY* called in BaseVoteOperations class
        
            PARAMS: 2 params, one or the other: upvote and downvote
            *One* of them must be set to True. Both default to False
                upvote : bool : default=False : False --> True OR,
        
            RETURNS: None
        """
        double_upvote = downvote = double_downvote = False  # Only upvoted is supported
        VOTE_TYPE = BaseVoteOperations._get_vote_type(double_upvote, upvote, downvote, double_downvote)

        vote_data = {
            'this_cls'    : ObjectVote,
            'cls_row'     : 'object_id',
            'receiver_id' : self.obj_id,
            'vote_obj'    : self.vote_obj,
            'user_id'     : self.user_id,
            'VOTE_TYPE'   : VOTE_TYPE,
        }

        BaseVoteOperations._new_vote(vote_data)

    def _del_vote(self):

        """
            PURPOSE: *HARD DELETE* a vote row from the database
        
            USE: *ONLY* called in BaseVoteOperations class
        
            PARAMS: (None)
        
            RETURNS: (None)

            NOTE: For full documentation, see: BaseVoteOperations._del_vote(...)
        """

        BaseVoteOperations._del_vote(self.vote_obj)

    @staticmethod
    def has_voted(user_id, obj_id):

        """
            Return weather or not a user has voted on a particular object

            For full documentation, see: BaseVoteOperations._has_voted(...)
        """

        cls = ObjectVote
        cls_row = cls.object_id
        return BaseVoteOperations._has_voted(cls, cls_row, user_id, obj_id)

    @classmethod
    def upvote(cls, user_id, obj_id):

        """For full documentation, see: BaseVoteOperations._upvote(...)"""

        BaseVoteOperations._upvote(cls, user_id, obj_id)

    @classmethod
    def novote(cls, user_id, obj_id):

        """For full documentation, see: BaseVoteOperations._novote(...)"""

        BaseVoteOperations._novote(cls, user_id, obj_id)

    @staticmethod   
    def get_like_count(obj_id):

        """
            PURPOSE: Get total upvotes (likes) of an individual object
        
            USE: Call like: ObjectVoteManager.get_like_count(<int>)
        
            PARAMS: 1 param: an int:
                obj_id : int : REQUIRED : The id of the object to get likes
        
            RETURNS: An int, the number of likes to the object
        """

        return ObjectVote.query.filter(ObjectVote.object_id == obj_id).\
                                filter(ObjectVote.vote_type == 1).count()

    @staticmethod
    def get_liked_object_count(profile_user_id):

        """
            PURPOSE: Get total of how many objects user has liked
            
            NOTE: Used on a user's profile: Likes (get_liked_object_count)
        
            USE: Call like: ObjectVoteManager.get_liked_object_count(<int>)
        
            PARAMS: 1 param, an int:
                profile_user_id : int : REQUIRED : The id of the user whose object-count we are querying
        
            RETURNS: An int, the number of liked objects of a particular user
        """

        return ObjectVote.query.filter(ObjectVote.user_id == profile_user_id).\
                                filter(ObjectVote.vote_type == 1).count()

    @staticmethod
    def get_liked_objects_for_user(profile_user_id):

        """
            PURPOSE: Get all objects a user has liked
        
            USE: Call like: ObjectVoteManager.get_liked_objects_for_user(<int>)
        
            PARAMS: 1 param, an int:
                profile_user_id : int : REQUIRED : The id of the user whose object-voting we are querying
        
            RETURNS: An int, the number of liked objects of a particular user
        """

        return ObjectVote.query.filter(ObjectVote.user_id == profile_user_id).\
                                filter(ObjectVote.vote_type == 1).all()

    @staticmethod
    def total_likes_in_system():
        
        """
            PURPOSE: Get total likes in the system
            
            NOTE: Only used for analytics purposes for administers
        
            USE: Call like: ObjectVoteManager.total_likes_in_system(<int>)
        
            PARAMS: (None)
        
            RETURNS: An int, the number of total likes in the system
        """
        
        return ObjectVote.query.filter(ObjectVote.vote_type == 1).count()


class ObjectBookmarkVote(Base):

    """
        PURPOSE: Keeps track of bookmarks on objects

        This is equivalently referred to as:
            2  = <Not implemented -- unnecessary>
            1  = "Bookmark"
            (0  = "Un-bookmak")
            -1 = <Not implemented -- unnecessary>
            -2 = <Not implemented -- unnecessary>
    """

    __tablename__ = 'object_bookmark_vote'

    id = Column(Integer, primary_key=True)
    object_id = Column(Integer, ForeignKey('object.id'), nullable=False)
    user_id = Column(BigInteger, ForeignKey('user.id'), nullable=False)
    vote_type = Column(Integer, nullable=False, default=0)
    date_voted = Column(DateTime, default=datetime.now)

    obj = relationship('Object', foreign_keys='ObjectBookmarkVote.object_id')


class ObjectBookmarkVoteManager(BaseVoteOperations):

    """
        PURPOSE: Contains all methods used to keep 
        track of bookmarks on objects
    """

    def __init__(self, user_id, obj_id):        
        self.user_id  = user_id
        self.obj_id   = obj_id
        self.vote_obj = ObjectBookmarkVoteManager.has_voted(self.user_id, self.obj_id)

    def _new_vote(self, upvote=False):

        """
            PURPOSE: Add a new up/down-vote into the database
        
            USE: *ONLY* called in BaseVoteOperations class
        
            PARAMS: 2 params, one or the other: upvote and downvote
            *One* of them must be set to True. Both default to False
                upvote : bool : default=False : False --> True OR,
        
            RETURNS: None
        """
        double_upvote = downvote = double_downvote = False  # Only upvoted is supported
        VOTE_TYPE = BaseVoteOperations._get_vote_type(double_upvote, upvote, downvote, double_downvote)

        vote_data = {
            'this_cls'    : ObjectBookmarkVote,
            'cls_row'     : 'object_id',
            'receiver_id' : self.obj_id,
            'vote_obj'    : self.vote_obj,
            'user_id'     : self.user_id,
            'VOTE_TYPE'   : VOTE_TYPE,
        }

        BaseVoteOperations._new_vote(vote_data)

    def _del_vote(self):

        """
            PURPOSE: *HARD DELETE* a vote row from the database
        
            USE: *ONLY* called in BaseVoteOperations class
        
            PARAMS: (None)
        
            RETURNS: (None)

            NOTE: For full documentation, see: BaseVoteOperations._del_vote(...)
        """

        BaseVoteOperations._del_vote(self.vote_obj)

    @staticmethod
    def has_voted(user_id, obj_id):

        """
            Return weather or not a user has voted on a particular object

            For full documentation, see: BaseVoteOperations._has_voted(...)
        """

        cls = ObjectBookmarkVote
        cls_row = cls.object_id
        return BaseVoteOperations._has_voted(cls, cls_row, user_id, obj_id)

    @classmethod
    def upvote(cls, user_id, obj_id):

        """For full documentation, see: BaseVoteOperations._upvote(...)"""

        BaseVoteOperations._upvote(cls, user_id, obj_id)

    @classmethod
    def novote(cls, user_id, obj_id):

        """For full documentation, see: BaseVoteOperations._novote(...)"""

        BaseVoteOperations._novote(cls, user_id, obj_id)

    @staticmethod
    def get_bookmarked_object_count(profile_user_id):

        """
            PURPOSE: Get total of how many objects user has bookmarked
            
            NOTE: Used on a user's profile: Read later (get_bookmarked_object_count)
        
            USE: Call like: ObjectBookmarkVoteManager.get_bookmarked_object_count(<int>)
        
            PARAMS: 1 param, an int:
                profile_user_id : int : REQUIRED : The id of the user whose bookmarked-object-count 
                                                   we are querying
        
            RETURNS: An int, the number of bookmarked objects of a particular user
        """

        return ObjectBookmarkVote.query.filter(ObjectBookmarkVote.user_id == profile_user_id).\
                                        filter(ObjectBookmarkVote.vote_type == 1).count()

    @staticmethod
    def get_bookmarked_objects_for_user(profile_user_id):

        """
            PURPOSE: Get all objects a user has bookmarked
        
            USE: Call like: ObjectBookmarkVoteManager.get_bookmarked_objects_for_user(<int>)
        
            PARAMS: 1 param, an int:
                profile_user_id : int : REQUIRED : The id of the user whose bookmarked-object-tag-voting 
                                                   we are querying
        
            RETURNS: An int, the number of bookmarked objects of a particular user
        """

        return ObjectBookmarkVote.query.filter(ObjectBookmarkVote.user_id == profile_user_id).\
                                        filter(ObjectBookmarkVote.vote_type == 1).all()


class UserVote(Base):

    """
        PURPOSE: Keeps track of who follows who

        This is equivalently referred to as:
            2  = "Top friend" -- BACKLOG (for now until Prioirty feed)
            1  = "Follow"
            (0  = "UnFollowed")
            -1 = "Pending request"
            -2 = "Blocked"
    """

    __tablename__ = 'user_vote'

    id = Column(Integer, primary_key=True)
    user_id = Column(BigInteger, ForeignKey('user.id'), nullable=False)
    voted_on_id = Column(BigInteger, ForeignKey('user.id'), nullable=False)
    vote_type = Column(Integer, nullable=False, default=0)
    date_voted = Column(DateTime, default=datetime.now)
    active = Column(Boolean, default=True)


class UserVoteManager(BaseVoteOperations):
    
    """
        PURPOSE: Contains all methods used to keep 
        track of who follows who on the site
    """

    def __init__(self, user_id, voted_on_id):       
        self.user_id      = user_id  # The current user id, i.e., the voter
        self.voted_on_id  = voted_on_id  # The person being voted on
        self.vote_obj     = UserVoteManager.has_voted(self.user_id, self.voted_on_id)

    def _new_vote(self, double_upvote=False, upvote=False, downvote=False, double_downvote=False):

        """
            PURPOSE: Add a new up/down-vote into the database
        
            USE: *ONLY* called in BaseVoteOperations class
        
            PARAMS: 4 params, double_upvote, upvote, downvote, double_downvote
            *One* of them must be set to True. Both default to False
                double_upvote   : bool : default=False : False --> True OR,
                upvote          : bool : default=False : False --> True OR,
                downvote        : bool : default=False : False --> True OR,
                double_downvote : bool : default=False : False --> True
        
            RETURNS: None
        """

        VOTE_TYPE = BaseVoteOperations._get_vote_type(double_upvote, upvote, downvote, double_downvote)

        vote_data = {
            'this_cls'    : UserVote,
            'cls_row'     : 'voted_on_id',
            'receiver_id' : self.voted_on_id,
            'vote_obj'    : self.vote_obj,
            'user_id'     : self.user_id,
            'VOTE_TYPE'   : VOTE_TYPE,
        }

        BaseVoteOperations._new_vote(vote_data)

    def _del_vote(self):

        """
            PURPOSE: *HARD DELETE* a vote row from the database
        
            USE: *ONLY* called in BaseVoteOperations class
        
            PARAMS: (None)
        
            RETURNS: (None)

            NOTE: For full documentation, see: BaseVoteOperations._del_vote(...)
        """

        BaseVoteOperations._del_vote(self.vote_obj)

    @staticmethod
    def has_voted(user_id, voted_on_id):

        """
            Return weather or not a user has voted a particular user

            For full documentation, see: BaseVoteOperations._has_voted(...)
        """

        cls = UserVote
        cls_row = cls.voted_on_id
        return BaseVoteOperations._has_voted(cls, cls_row, user_id, voted_on_id)

    @classmethod
    def double_upvote(cls, user_id, voted_on_id):

        """
            BACKLOG (for now, until Priority feed is implemented)
            For full documentation, see: BaseVoteOperations._double_upvote(...)
        """ 

        BaseVoteOperations._double_upvote(cls, user_id, voted_on_id)

    @classmethod
    def upvote(cls, user_id, voted_on_id):

        """For full documentation, see: BaseVoteOperations._upvote(...)"""

        BaseVoteOperations._upvote(cls, user_id, voted_on_id)

    @classmethod
    def downvote(cls, user_id, voted_on_id):

        """For full documentation, see: BaseVoteOperations._downvote(...)"""

        BaseVoteOperations._downvote(cls, user_id, voted_on_id)

    @classmethod
    def double_downvote(cls, user_id, voted_on_id):

        """For full documentation, see: BaseVoteOperations._double_downvote(...)"""

        BaseVoteOperations._double_downvote(cls, user_id, voted_on_id)

    @classmethod
    def novote(cls, user_id, voted_on_id):

        """For full documentation, see: BaseVoteOperations._novote(...)"""

        BaseVoteOperations._novote(cls, user_id, voted_on_id)

    @staticmethod
    def get_top_friend_count(profile_user_id):

        """
            NOTE: This is used when a user goes to a profile,
            and we need to display data, BUT, this method is only
            relevant when profile_user_id == current_user_id.

            PURPOSE: Get grand total of how many users a
            particular user has doulbe-upvoted (i.e., "top friended")
        
            USE: Call like: UserVoteManager.get_top_friend_count(<int>)
        
            PARAMS: 1 param, an int:
                profile_user_id : int : REQUIRED : The id of the user whose user-vote-count we are querying
        
            RETURNS: An int, the number of upvoted users (following) of a particular user
        """

        return UserVote.query.filter(UserVote.user_id == profile_user_id).\
                              filter(UserVote.active == True).\
                              filter((UserVote.vote_type == 1) |
                                     (UserVote.vote_type == 2)).count()

    @staticmethod
    def get_following_count(profile_user_id):

        """
            NOTE: This is used when a user goes to a profile,
            and we need to display data

            * People who the profile_user_id are following *

            PURPOSE: Get grand total of how many users a
            particular user has upvoted (i.e., "following")
        
            USE: Call like: UserVoteManager.get_following_count(<int>)
        
            PARAMS: 1 param, an int:
                profile_user_id : int : REQUIRED : The id of the user whose user-vote-count we are querying
        
            RETURNS: An int, the number of upvoted users (following) of a particular user
        """

        return UserVote.query.filter(UserVote.user_id == profile_user_id).\
                              filter(UserVote.active == True).\
                              filter(UserVote.vote_type == 1).count()

    @staticmethod
    def get_follower_count(profile_user_id):

        """
            NOTE: This is used when a user goes to a profile,
            and we need to display data.

            * People who are following the profile_user_id *

            PURPOSE: Get grand total of how many users have upvoted
            another particular user, identified by profile_user_id,
            (i.e., "followers")
        
            USE: Call like: UserVoteManager.get_follower_count(<int>)
        
            PARAMS: 1 param, an int:
                profile_user_id : int : REQUIRED : The id of the user whose upvoted-by-count we are querying
        
            RETURNS: An int, the number of other users
            that have upvoted a particular user (as said before,
            identified by profile_user_id)
        """

        return UserVote.query.filter(UserVote.voted_on_id == profile_user_id).\
                              filter(UserVote.active == True).\
                              filter(UserVote.vote_type == 1).count()
