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

class SearchManager:

    @staticmethod
    def user_search_json(user,search_item):
        users = User.by_id_like(search_item,num=15).all()
        return [user.json() for user in users]

    @staticmethod
    def post_search_json(user,search_item):
        posts = Post.by_text_like(search_item,num=20).all()
        return [post.json() for post in posts]
