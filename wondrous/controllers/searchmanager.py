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
            data.update({"name":post.user.ascii_name})
            data.update({"username":post.user.username})
            data.update({'liked':VoteManager.is_liking(user.id,post.id)})

            picture_object = post.user.picture_object

            if picture_object:
                data.update({"user_ouuid": picture_object.ouuid})

            if post.original:
                original_post = post.original.json()
                original_post.update(post.original.object.json())

                # Title case the post subject
                original_post.update({"subject": post.original.object.subject})
                original_post.update({"name": post.original.user.ascii_name})
                original_post.update({"username": post.original.user.username})

                data.update({"repost": original_post})
            else:
                data.update(obj.json())

            retval.append(data)
        return retval
