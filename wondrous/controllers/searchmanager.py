import logging

from sqlalchemy import or_

from wondrous.models import (
    DBSession,
    FeedPostLink,
    Object,
    Post,
    PostTagLink,
    Tag,
    Notification,
    Comment,
    User
    # Vote,
)

from wondrous.controllers import VoteManager

class SearchManager:

    @staticmethod
    def user_search_json(user,search,page):
        users = User.by_id_like(search,num=15).offset(page*15).all()
        retval = []
        for user in users:
            data = user.json()
            if user.picture_object:
                data.update(user.picture_object.json())
            retval.append(data)
        return retval

    @staticmethod
    def post_search_json(user,search,page):
        objs = Object.by_text_like(search,num=20).offset(page*15).all()
        retval = []
        for obj in objs:
            post = obj.post
            data = post.json()

            retval.append(data)
        return retval
