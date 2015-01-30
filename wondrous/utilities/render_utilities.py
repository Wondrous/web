#!/usr/bin/env python
# -*- coding: utf-8 -*-

#
# Company: WONDROUS
# Created by: John Zimmerman
#
# RENDER_UTILITIES.PY
#

import re
from urlparse import urlparse
from json import dumps
from datetime import datetime

from wondrous.models.comment import ObjectCommentManager

from wondrous.models.content import ReportedContentManager

from wondrous.models.obj import ObjectManager
from wondrous.models.obj import ObjectFileManager
from wondrous.models.obj import ObjectLinkManager
from wondrous.models.obj import FileToObjectManager
from wondrous.models.obj import LinkToObjectManager

from wondrous.models.post import WallPostManager

from wondrous.models.tag import GlobalTagManager
from wondrous.models.tag import ObjectTagManager

from wondrous.models.user import UserManager

from wondrous.models.vote import ObjectVoteManager
from wondrous.models.vote import UserVote

from wondrous.utilities.validation_utilities import ValidationHelper as vh

from wondrous.utilities.general_utilities import _IMAGE_MIMES
from wondrous.utilities.general_utilities import get_object_url

from wondrous.utilities.global_config import SYS_CONTEXT_TAGS
from wondrous.utilities.global_config import GLOBAL_CONFIGURATIONS


def to_json(model):
    """ Returns a JSON representation of an SQLAlchemy-backed object.
    """
    json = {}
    json['pk'] = getattr(model, 'id')

    for col in model._sa_class_manager.mapper.mapped_table.columns:
        json[col.name] = getattr(model, col.name)
        if isinstance(json[col.name],datetime):
            json[col.name] = json[col.name].strftime("%Y-%m-%d %H:%M:%S")
    return dumps(json)

def delegate_assemble(item_list, current_user_id):

    """
        PURPOSE: To simplify calling the same _AssemblePost... over and over

        USE: Call like: delegate_assemble(<list>, <int>)

        PARAMS: 2 required params:
            item_list : list : REQUIRED : The necessary list of items to get full post data for
            current_user_id : int : REQUIRED : The User.id of the current, logged-in User

        RETURNS: A list of dicts, each one containing a full post's data
    """

    return [_AssemblePost(data, current_user_id).assemble_data() for data in item_list if _AssemblePost(data, current_user_id).assemble_data()]

def _linkify(text):

    """
        PURPOSE: Take the post text and detect all the urls,
        and then for each url, "schemify it, and then "linkify"
        it by wrapping it in an anchor tag.

        USE: Call like: _linkify(<str>)

        PARAMS: 1 required param:
            text : str : REQUIRED : The full text of a post

        RETURNS: The full text of a post with all links
        wrapped in <a href="...">Anchor</a> tags
    """

    pattern = GLOBAL_CONFIGURATIONS['URL_REGEX']
    return re.sub(pattern, (lambda m: r'<a class="post-link" target="_newtab" href="{m_scheme}">{m}</a>'.format(m=m.group(1), m_scheme=_schemify(m.group(1)))), text)

def _schemify(url):

    """
        PURPOSE: Add in the appropriate "http://" to a url if
        the url does not already contain such "scheme"

        USE: Call like: _schemify(<str>)

        * Note: Only called in the above "_linkify" method

        PARAMS: 1 required param:
            url : str : REQUIRED : The url to schemify

        RETURNS: The URL with a scheme prefixed on to it
    """

    p = urlparse(url)
    s = p.scheme
    if not s:
        url = 'http://{url}'.format(url=url).rstrip('.')

    return url

def _hashtagify(text):

    """
        PURPOSE: Take the post text and detect all the urls,
        and then for each url, "schemify it, and then "linkify"
        it by wrapping it in an anchor tag.

        USE: Call like: _hashtagify(<str>)

        PARAMS: 1 required param:
            text : str : REQUIRED : The full text of a post

        RETURNS: The full text of a post with all links
        wrapped in <a href="...">Anchor</a> tags
    """

    pattern = GLOBAL_CONFIGURATIONS['HASHTAG_REGEX_FULL']
    return re.sub(pattern, (lambda t: r'<a class="post-hashtag" href="/tag/{t_url}">{t}</a> '.format(t=t.group(1), t_url=t.group(0)[1::])), text)


class CreateNewPost(object):

    """
        WHAT THIS DOES:
            1. It creates a new wall post by performing necessary DB oprations
            2. It returns this new post_obj
            3. This new post_obj gets passed into a _GenerateItemList
            4. The _GenerateItemList feeds the new Post object into __htmlify
            5. __htmlify generates the HTML for the new post and returns this HTML
            6. The returned HTML is outputted as AJAX response and injected into wall HTML

        _AssemblePost vs. CreateNewPost:
            - _AssemblePost: Formulates a post from existing
                            data that has already been posted
            - CreateNewPost: Inserts new data and formulates the raw
                            data for a first-time post
    """

    @staticmethod
    def for_wall(new_post_data):

        """
            PURPOSE: Use this to a post to a wall

            USE: Call like: CreateNewPost.for_wall(<dict>)

            NOTE: Called from ajax_post_handler

            PARAMS: A dict with the following keys:
                -user_id        -hidden_from_community
                -post_tags      -post_text
                -profile_id     -post_links
                -object_file_id -post_subject


            RETURNS: A new WallPost object
        """

        SYS_TAGS = set([SYS_CONTEXT_TAGS['wall']])

        new_obj = CreateNewPost._global_process(new_post_data, SYS_TAGS)

        wall_post_data = {
            'profile_id' : new_post_data['profile_id'],
            'object_id'  : new_obj.id,
        }
        return WallPostManager.add(wall_post_data)

    @staticmethod
    def _global_process(new_post_data, SYS_TAGS):

        """
            PURPOSE: This is called when adding a new post post
            to any context

            NOTE: This also adds the post to the relevant community

            USE: Call like: CreateNewPost._global_process(<dict>,<set>)

            NOTE: Called from ajax_post_handler

            PARAMS: 2 params:

                -A dict with the following keys:
                    -user_id                -post_text
                    -post_tags              -post_links
                    -object_file_id         -post_subject
                    -hidden_from_community
                -A set (the system context tags)

            RETURNS: A new Object object
        """

        # 1. Create a new object
        new_obj = CreateNewPost.__process_new_object(
                    new_post_data['user_id'],
                    new_post_data['post_text'],
                    new_post_data['post_subject'],
                )
        new_obj_id = new_obj.id

        # -- Add rows in object_link/object_file table if necessary ----
        if new_post_data['post_links']:
            for link in new_post_data['post_links']:

                # Check to see if someone has already posted this link
                existing_link = ObjectLinkManager.get(link)
                if existing_link:
                    link_id = existing_link.id
                else:
                    # If link is new, add link to db
                    object_link_data = {
                        'url'       : link,
                        'mime_type' : None,  # TODO
                    }
                    new_link = ObjectLinkManager.add(object_link_data)
                    link_id = new_link.id

                # Map this link to the new post regardelsss
                link_to_object_data = {
                    'object_id'      : new_obj_id,
                    'object_link_id' : link_id,
                }
                LinkToObjectManager.add(link_to_object_data)

        # -- Add in MappingObjectToFile row ----
        if new_post_data['object_file_id']:

            # Map this file to the new post regardelsss
            file_to_object_data = {
                'object_id'      : new_obj_id,
                'object_file_id' : new_post_data['object_file_id'],
            }
            FileToObjectManager.add(file_to_object_data)

            object_file = ObjectFileManager.get(new_post_data['object_file_id'], is_mapped=False)
            if object_file:
                object_file.mapped = True

        # -- Add in final tags ----
        CreateNewPost.__process_final_tags(SYS_TAGS, new_post_data['post_tags'], new_obj_id)

        return new_obj

    @staticmethod
    def __process_new_object(user_id, post_text, post_subject):

        """
            PURPOSE: Add a new object into the database

            USE: Call like: CreateNewPost.__process_new_object(<int>,<bool>,<str>)

            PARAMS: 3 required params:
                user_id   : int : REQUIRED : The User.id of the poster
                post_text : str : REQUIRED : The text of the post

            RETURNS: 1 param:
                new_obj  : Object object : An object of the new Object
        """

        object_data = {
            'subject'   : post_subject,
            'text'      : post_text,
            'poster_id' : user_id,
        }
        new_obj = ObjectManager.add(object_data)
        return new_obj

    @staticmethod
    def __process_final_tags(SYS_TAGS, post_tags, new_obj_id):

        """
            PURPOSE:
                1. For each tag, check if it exists in global_tags table...
                    - If it does, retrieve its global_tag_id
                    - Otherwise, a. create a new row in global_tags table AND
                                 b. retrieve new row's global_tag_id
                2. Create new rows (1 per tag) in object_tags using the
                   global_tag_id from global_tags table and object_id

            USE: Call like: CreateNewPost.__process_final_tags(<set>, <int>)

            PARAMS: 2 params:
                post_tags  : set : REQUIRED : A set of the final tags of a new post
                new_obj_id : int : REQUIRED : The primary id of the new Object

            RETURNS: A set of the final post tags
        """

        final_post_tags = set()

        for tag in SYS_TAGS:

            tag_obj = GlobalTagManager.get(tag_name=tag)
            if not tag_obj:
                global_tag_data = {'tag_name' : tag}
                tag_obj = GlobalTagManager.add(global_tag_data)

            global_tag_id = tag_obj.id
            object_tag_data = {
                'object_id'     : new_obj_id,
                'global_tag_id' : global_tag_id,
            }
            ObjectTagManager.add(object_tag_data)

        for tag in post_tags:

            # If the tag is valid
            if vh.valid_tag(tag):

                tag_obj = GlobalTagManager.get(tag_name=tag)
                if not tag_obj:
                    global_tag_data = {'tag_name' : tag}
                    tag_obj = GlobalTagManager.add(global_tag_data)

                global_tag_id = tag_obj.id
                object_tag_data = {
                    'object_id'     : new_obj_id,
                    'global_tag_id' : global_tag_id,
                }
                ObjectTagManager.add(object_tag_data)
                final_post_tags.add(tag)  # Add tag to final set

        return final_post_tags


class _AssemblePost(object):

    """
        Process items data and assemble an
        individual post's data for output to HTML
    """

    def __init__(self, data, current_user_id, profile_user_id=None):

        """
            PURPOSE: Process items data for output to HTML
            (Create and return a dict of the necessary info)

            USE: Instantiate like: p = _AssemblePost(<dict>,<int>)
                 Call like: final_post_data = p.assemble_data()

            PARAMS: Provide 2 required parameters and 1 optional:
                data            : dict : REQUIRED : a dict() of item data, or the vote_obj
                current_user_id : int  : REQUIRED : the id of the currently logged-in user
                profile_user_id : int  : default=None : the id of the user whose profile the current_user_id is on

            * NOTE: When getting a user's upvoted items, the profile_user_id
            MUST be included. In other words, specifying the profile_user_id
            is not necessary unless getting the user's upvoted posts

            RETURNS: a dict() of all the necessary
            data for each post to be rendered
                On a profile, this includes:
                    -object_id (int)                -date_posted (datetime)
                    -text (str)                     -hidden (bool)
                    -context_tag_id (int)           -context_tag_name (str)
                    -profile_user_id (int)          -upvotes (int)
                    -profile_user_name (str)        -downvotes (int)
                    -posted_by_profile_owner (bool) -poster_id (int)
                    -my_profile (bool)              -object_links (list of dicts with keys: url, scheme, mime_type, is_dead)
                    -tags (list)                    -has_voted (1 or -1)

            FOR TAGS: Given an object_id
            FOR PROFILE: Given a profile_id - Keep in mind we also need the post info, not just object
        """

        self.final_data = {}

        # Get *upvoted* posts to be seen on a profile
        # This is only entered when viewing the
        # upvoted tab on a user profile
        if profile_user_id:
            self.profile_user_id = profile_user_id
            self.object_id       = data.object_id

        # Otherwise, get all posts for
        # a tag, profile, or community
        else:
            self.profile_user_id = None
            self.object_id       = data.get('object_id')
            self.global_tag_id   = data.get('global_tag_id') # One...
            self.profile_id      = data.get('profile_id')    # Or the other.


        # These are always needed, regardless
        # of where the post is being rendered
        self.this_object     = ObjectManager.get(self.object_id)
        self.poster_id       = self.this_object.poster_id
        self.date_posted     = self.this_object.date_posted
        self.current_user_id = current_user_id

    def assemble_data(self):

        """
            PURPOSE: To call methods which assemble a post's final data

            USE: Use this to actually get the final post data.

            Call like: _AssemblePost(...).assemble_data()

            PARAMS: None

            RETURNS: A dictionary of the post's final data
        """

        # IF THE OBJECT IS DEACTIVATED WE IGNORE IT
        if not self.this_object.active:
            return None

        # IF THE USER HAS REPORTED THIS OBJECT, WE IGNORE IT
        elif ReportedContentManager.has_reported(self.current_user_id, self.object_id):
            return None

        # Some configurations...
        MAX_CHAR_SHOW_TEXT = GLOBAL_CONFIGURATIONS['MAX_CHAR_SHOW_TEXT']
        MAX_BR_SHOW_TEXT   = GLOBAL_CONFIGURATIONS['MAX_BR_SHOW_TEXT']

        # No matter what, we want to process a str. By
        # default, if no text is found, we would get a
        # value of None. None cannot be used in any of
        # our methods here, so we just use an empty str
        # '' instead of None so that everything works
        # nicely and our variable uses a consistent
        # data type
        object_text = self.this_object.text if self.this_object.text else ''

        # If a post contains too many line <br>s, we can
        # assume that the post takes up too much vertical
        # space. Therefore, we need to set the _see_more
        # dict value to True.
        text_line_count = len(object_text.split('<br>'))

        self.final_data['object_id'] = self.object_id
        self.final_data['poster_id'] = self.poster_id
        self.final_data['text']      = _hashtagify(_linkify(object_text))
        self.final_data['_see_more'] = True if (len(object_text) > MAX_CHAR_SHOW_TEXT or text_line_count > MAX_BR_SHOW_TEXT) else False
        self.final_data['_font_size'], self.final_data['_line_height'] = self._get_font_attrs(object_text)
        self.final_data['subject']   = self.this_object.subject
        self.final_data['is_poster'] = bool(self.poster_id == self.current_user_id)
        self.final_data['url']       = "www.wondrous.co{p}".format(p=get_object_url(self.object_id, self.this_object.ouuid))
        self.final_data['post_comments'] = [{
            'comment_id'   : c.id,
            'poster_id'    : c.poster_id,
            'text'         : _linkify(c.text),
        } for c in ObjectCommentManager.get_all_comments_for_object(self.object_id)]

        self._set_object_type()

        # If we're getting upvoted items,
        # we do NOT also get any profile-info
        if not self.profile_user_id:
            self._set_profile_info()

        self._set_all_tags()
        self._set_vote_data()

        return self.final_data

    def _set_object_type(self):

        """
            PURPOSE: Set the post object's appropriate object type (link vs. file)

            USE: *PRIVATE - only call in the self.assemble_data() method
            Call like: self._set_object_type()

            PARAMS: None

            RETURNS: None
        """

        links_to_object = LinkToObjectManager.get_all_links_for_object(self.object_id)
        self.final_data['object_links'] = [{
            'url'       : l.link.url,
            'scheme'    : l.link.scheme,
            'mime_type' : l.link.mime_type,
            'is_dead'   : l.link.is_dead
        } for l in links_to_object]

        files_to_object = FileToObjectManager.get_all_files_for_object(self.object_id)
        self.final_data['object_files'] = [{
            'original_file_name' : f.object_file.original_file_name,
            'mime_type'          : f.object_file.mime_type,
            'file_size'          : f.object_file.file_size / float(1000000),
            'is_img'             : bool(f.object_file.mime_type in _IMAGE_MIMES),
            'file_url'           : f.object_file.file_url,
        } for f in files_to_object]

    def _set_profile_info(self):

        """
            PURPOSE: Set the post object's appropriate profile info
            This is not always called, for example, when
            querying for tag items

            USE: *PRIVATE - only call in the self.assemble_data() method
            Call like: self._set_profile_info()

            PARAMS: None

            RETURNS: None
        """

        posted_by_profile_owner = False  # Initialize to False
        if self.profile_id and self.poster_id:

            wall_post_ob = WallPostManager.get(self.object_id)
            self.final_data['date_posted'] = str(self.date_posted)
            self.final_data['hidden']      = wall_post_ob.hidden

            if str(self.profile_id) == str(self.poster_id):
                posted_by_profile_owner = True
                self.final_data['profile_user_name'] = UserManager.get(self.profile_id).name
                self.final_data['profile_user_id']   = self.profile_id

        self.final_data['posted_by_profile_owner'] = posted_by_profile_owner
        self.final_data['my_profile'] = bool(str(self.current_user_id) == str(self.profile_id))

    def _set_all_tags(self):

        """
            PURPOSE: Set all of a post's object tags and context tag

            USE: *PRIVATE - only call in the self.assemble_data() method
            Call like: self._set_all_tags()

            PARAMS: None

            RETURNS: None
        """

        # Get the object tags
        tag_objs = ObjectTagManager.get_all(self.object_id)

        # Create a list (of tags) for this value in the dict
        self.final_data['tags'] = []

        # This is not needed when get the
        # upvoted items which require the
        # self.profile_user_id
        if not self.profile_user_id:
            # If we are viewing a GlobalTag
            if self.global_tag_id:
                global_tag_name = GlobalTagManager.get(tag_id=self.global_tag_id).tag_name
            else:
                global_tag_name = SYS_CONTEXT_TAGS['wall']

        # Add all relevant object-tags
        assemble_on_tag = False
        for tag in tag_objs:
            tag_name = tag.global_tag.tag_name

            if not self.profile_user_id:
                assemble_on_tag = bool(tag_name.lower() == global_tag_name.lower())

            # Set the context tag IF we're rendering to a tag
            if assemble_on_tag:

                # These only need to be set once. But all this needs to
                # be fixed up, so I didn't put too much time into it....
                self.final_data['context_tag_id'] = tag.id
                self.final_data['context_tag_name'] = tag_name

            # Add in all other tags
            if tag_name not in SYS_CONTEXT_TAGS.values():
                if assemble_on_tag:
                    self.final_data['tags'].insert(0, tag_name)  # Put context tag at front of tag-list
                else:
                    self.final_data['tags'].append(tag_name)  # Just add it to the list sequentially

    def _set_vote_data(self):

        """
            PURPOSE: Set the vote information for a
            post (i.e., upvotes, downvotes, has_voted)

            USE: *PRIVATE - only call in the self.assemble_data() method
            Call like: self._set_vote_data()

            PARAMS: None

            RETURNS: None
        """

        object_id = self.final_data['object_id']
        total_upvotes = ObjectVoteManager.get_like_count(object_id) # context_tag_id
        has_voted = getattr(ObjectVoteManager.has_voted(self.current_user_id, object_id), 'vote_type', False) # context_tag_id

        self.final_data['upvotes']   = total_upvotes
        self.final_data['has_voted'] = has_voted

    def _get_font_attrs(self, text):

        """
            PURPOSE: This is used if we want to change the font size
            depending on the amount of text in the post.

            USE: Call like: self._get_font_attrs(...)

            PARAMS:
                text | <str> | REQUIRED | The text of the post

            RETURNS: 2 variables
                FONT_SIZE   | <int> | The font size of the HTML text
                LINE_HEIGHT | <int> | The line height of the HTML text
        """

        if len(text) < 100:
            FONT_SIZE   = 40
            LINE_HEIGHT = 45
        elif len(text) < 200:
            FONT_SIZE   = 38
            LINE_HEIGHT = 44
        elif len(text) < 300:
            FONT_SIZE   = 36
            LINE_HEIGHT = 43
        elif len(text) < 400:
            FONT_SIZE   = 34
            LINE_HEIGHT = 41
        elif len(text) < 500:
            FONT_SIZE   = 32
            LINE_HEIGHT = 39
        elif len(text) < 600:
            FONT_SIZE   = 30
            LINE_HEIGHT = 37
        elif len(text) < 700:
            FONT_SIZE   = 28
            LINE_HEIGHT = 35
        elif len(text) < 800:
            FONT_SIZE   = 26
            LINE_HEIGHT = 33
        elif len(text) < 900:
            FONT_SIZE   = 24
            LINE_HEIGHT = 31
        else:
            FONT_SIZE   = 24
            LINE_HEIGHT = 31

        return FONT_SIZE, LINE_HEIGHT


class HtmlifyComment(object):

    @staticmethod
    def __htmlify(item_data, current_user):

        """
            PURPOSE: Feed a single item's data (as a dict()) from
            a list (of dicts) into this method so that its final
            HTML can be generated. This comment's HTML is then added
            to a list in the HtmlifyComment.get_html_output.

            USE: Provide a dict() of item's data, and if rendering posts on
            a user's profile, provide that user's user_id. If not provided,
            it defaults to None, in which case, it assumes you are rendering
            posts for a tag.

            RETURNS: A big string of the final, comment HTML

            NOTE: This is cool. It takes the item_data and feeds it into a
            jinja2 template to avoid rewriting the comment-template or doing
            anything client-side. Very simple. Very effective.

            item_data must be a dict, which consists of the following:
                items_data = dict(
                    poster_id = <int>,
                    text = <str>,
                )
        """

        from jinja2 import Environment, PackageLoader
        env = Environment(loader=PackageLoader('wondrous','templates'))

        template = env.get_template('includes/posts/inc._post_comments.jinja2')
        html_output = template.render(
            current_user=current_user,
            item={'post_comments' : [item_data]},
            get_item_owner=UserManager.get,  # unbound method
        )

        return html_output

    @staticmethod
    def get_html_output(items, current_user):

        """
            PURPOSE: For the load_more_handler, take the list of dicts()
            from the GetItems and pass the list into
            this method to generate the final html ouput.

            USE: Provide a list of items from the
            _GenerateItemList.get_items method below.

            PARAMS: 2 required params, 1 optional param:
                items : list : REQUIRED : A list of dicts which contain necessary info to fill out Jinja2 template
                current_user : obj : REQUIRED : A User object of the current, logged in user

            RETURNS: a list of html items. Each item is raw html.
            And, each item is a post (rendered for a given tag or profile).
        """

        html_items = []
        for item_data in items:
            htmlify = HtmlifyComment.__htmlify(item_data, current_user)
            html_items.append(htmlify)
        return html_items


class HtmlifyPost(object):

    @staticmethod
    def __htmlify(item_data, current_user, profile_user=None):

        """
            PURPOSE: Feed a single item's data (as a dict()) from
            a list (of dicts) into this method so that its final
            HTML can be generated. This post's HTML is then added
            to a list in the HtmlifyPost.get_html_output.

            USE: Provide a dict() of item's data, and if rendering posts on
            a user's profile, provide that user's user_id. If not provided,
            it defaults to None, in which case, it assumes you are rendering
            posts for a tag.

            RETURNS: A big string of the final, post HTML

            NOTE: This is cool. It takes the item_data and feeds it into a
            jinja2 template to avoid rewriting the post-template or doing
            anything client-side. Very simple. Very effective.
        """

        from jinja2 import Environment, PackageLoader
        env = Environment(loader=PackageLoader('wondrous','templates'))

        if profile_user:
            template = env.get_template('includes/posts/inc.posts_profile.jinja2')
            html_output = template.render(
                profile_user=profile_user,
                current_user=current_user,
                render_items=[item_data],
                get_item_owner=UserManager.get,  # unbound method
            )
        else:
            template = env.get_template('includes/posts/inc.posts_tag.jinja2')
            html_output = template.render(
                current_user=current_user,
                render_items=[item_data],
                get_item_owner=UserManager.get,  # unbound method
            )

        return html_output

    @staticmethod
    def get_html_output(items, current_user, profile_user=None):

        """
            PURPOSE: For the load_more_handler, take the list of dicts()
            from the GetItems and pass the list into
            this method to generate the final html ouput.

            USE: Provide a list of items from the
            _GenerateItemList.get_items method below.

            PARAMS: 2 required params, 1 optional param:
                items : list : REQUIRED : A list of dicts which contain necessary info to fill out Jinja2 template
                current_user : obj : REQUIRED : A User object of the current, logged in user
                profile_user : obj : default=None : If getting HTML of posts on profile, a User object of the profile owner

            RETURNS: a list of html items. Each item is raw html.
            And, each item is a post (rendered for a given tag or profile).
        """

        html_items = []
        for item_data in items:
            htmlify = HtmlifyPost.__htmlify(item_data, current_user, profile_user)
            html_items.append(htmlify)
        return html_items


class Pagination(object):

    """A class the helps with the pagination of items"""

    def __init__(self, start=None, per_page=None):

        """
            NOTE: If both start and per_page are None,
            we assume we want everything. This is
            applicable when getting a user's upvoted
            tags. Gerenrally, we don't want
            to paginate this.
        """

        self.start = start
        self.per_page = per_page

    def load(self, item_list, display_hidden=False):

        """
            PURPOSE: Calls the necessary methods to get
            the item list and then data-chunk

            USE: Call like: self.load(...)

            PARAMS: 2 params,
                item_list : list : REQUIRED : The list of item ids to paginate
                display_hidden : bool : default=False : Do we show hidden items?

            RETURNS: A list which is a slice of the
            original, i.e., the chunk of items for a particular page

            NOTE: display_hidden=True when viewing posts on your own wall
        """

        if not item_list:
            return None

        full_list = self._get_item_list(item_list, display_hidden)
        return self._get_data_chunk(full_list)

    def _compensate_for_hidden_items(self, item_list):

        """
            PURPOSE: Needs to remove hidden items from item_list
            so that when _get_data_chunk() is called,
            we can easily slice out the data we want.
            This copies the data over to a new dict, omitting
            items that are not hidden

            USE: Call like: self._compensate_for_hidden_items(...)

            PARAMS:
                item_list : list : REQUIRED : The list of item ids to paginate

            RETURNS: A list of items which are not visible

            NOTE: We use getattr becasue not all data will have
            a 'hidden' attribute. When this is the case and hidden
            is not present, we default to False (i.e., not hidden)
        """

        return [i for i in item_list if not getattr(i,'hidden', False)]

    def _get_item_list(self, item_list, display_hidden):

        """
            PURPOSE: Get the list of items to be further processed

            USE: Call like: self._get_item_list(...)

            PARAMS:
                item_list : list : REQUIRED : The list of item ids to paginate
                display_hidden : bool : REQUIRED : A boolean to determine if we display hidden items

            RETURNS: A list of ints of items to be paginated
        """

        if not display_hidden:
            item_list = self._compensate_for_hidden_items(item_list)
        return item_list

    def _get_data_chunk(self, item_list):

        """
            PURPOSE: Slices a finalized item list to get
            only the items needed to be rendered
            to a particular page

            USE: Call like: self._get_data_chunk(...)

            PARAMS:
                item_list : list : REQUIRED : The list of item ids to paginate

            RETURNS: A (sliced) list of items to be paginated
        """

        end = self.start+self.per_page if (self.start and self.per_page) is not None else None
        return item_list[self.start:end]

    @property
    def current_page_num(self):

        """
            PURPOSE: Gets the current page number, so
            we can show the user what page of data
            he/she is currently viewing

            USE: Call like:
                p = Pagination(...)
                p.current_page_num

            PARAMS: (None)

            RETURNS: An int representing the current page number
        """

        return int(self.start / self.per_page) + 1

    def has_next(self, item_list):

        """
            PURPOSE: Returns a boolean indicating whether
            or not there is another page of data left to be
            viewed

            USE: Call like:
                p = Pagination(...)
                p.has_next

            PARAMS:
                item_list : list : REQUIRED : The list of item ids to paginate

            RETURNS: A bool, indicating whether or not
            there is another page of data left to be
            viewed
        """

        return True if (self.start + self.per_page) < len(item_list) else False


class _GenerateItemList(object):

    @staticmethod
    def single_object(obj, current_user_id):

        """
            PURPOSE: Load a single item to viewed on the /post/.../ route.

            USE: Call like: _GenerateItemList.single_object(<obj>)

            PARAMS:
                post_obj : obj : REQUIRED : A post_object of the post for which we
                                            must get the full post's data
                current_user_id : int : REQUIRED : The id of the current logged-in user

            RETURNS: A dict of the post's data
        """

        # A single item
        item_list = [{
            'object_id' : obj.id,
        }]

        return delegate_assemble(item_list, current_user_id)

    @staticmethod
    def new_wall_post(post_obj, current_user_id):

        """
            PURPOSE: Load the new Post when a user posts to a wall

            USE: Call like: _GenerateItemList.new_wall_post(<obj>)

            PARAMS:
                post_obj : obj : REQUIRED : A post_object of the post for which we
                                            must get the full post's data
                current_user_id : int : REQUIRED : The id of the current logged-in user

            RETURNS: A dict of the post's data
        """

        # A single item
        item_list = [{
            'object_id'  : post_obj.object_id,
            'profile_id' : post_obj.profile_id,
        }]

        return delegate_assemble(item_list, current_user_id)

    @staticmethod
    def wall_items(profile_id):

        """
            PURPOSE: Load a profile items

            USE: Call like: _GenerateItemList.wall_items(<int>)

            PARAMS: 1 required parameter:
                profile_id : int : REQUIRED : The id of the profile's user whose items we want to get

            RETURNS: A list of dicts of a chunk of posts on that profile
        """

        item_list = []
        post_objs = WallPostManager.get_all(profile_id)

        for post in post_objs:
            item_list.append({
                'object_id'  : post.object_id,
                'profile_id' : post.profile_id,
                'hidden'     : post.hidden,
            })

        # NOTE: When viewing items on profile, we don't rank them
        # hence, the lack of RankUtilities.rank_items(...)
        return item_list

    @staticmethod
    def majority_feed_items(current_user_id):
        """
            PURPOSE: Load the following feed for the current user

            USE: Call like: _GenerateItemList.majority_feed_items(<int>)

            PARAMS: 1 required parameter:
                current_user_id : int : REQUIRED : The id of the current user

            RETURNS: A list of dicts of a chunk of posts for the current user
        """
        item_list = []
        post_objs = WallPostManager.get_all_subscribed(current_user_id)
        for post in post_objs:
            item_list.append({
                'object_id'  : post.object_id,
                'profile_id' : post.profile_id,
                'hidden'     : post.hidden,
            })

        # NOTE: When viewing items on profile, we don't rank them
        # hence, the lack of RankUtilities.rank_items(...)
        return item_list


    @staticmethod
    def tag_items(global_tag_name, current_user_id):

        """
            PURPOSE: Generate the list of id's to be sorted

            USE: Call like: _GenerateItemList.tag_items(<str>)

            PARAMS:
                global_tag_name : str : REQUIRED : The name of the tag to get items for
                current_user_id : int : REQUIRED : The id of the current logged-in user

            RETURNS: the list of id's, item_list

            NOTE: If global_tag_obj parameter, the list is ranked from highest to lowest.
            Otherwise, the list is ordered by descending date (newest to oldest)
        """

        item_list = []
        global_tag_obj = GlobalTagManager.get(tag_name=global_tag_name)

        if global_tag_obj:

            global_tag_id = global_tag_obj.id
            tag_objs = ObjectTagManager.get_all(global_tag_id=global_tag_id)

            for tag in tag_objs:
                item_list.append({
                    'object_id'     : tag.object_id,
                    'global_tag_id' : global_tag_id,
                })

            # We are NOT currently using anything from the
            # rank_utilities file, but this is kept so that
            # if we want to, in the future, algorithmically rank items
            # and them put them in the feed, we have the infrastructure to
            # do so (within reason...)
            # item_list = RankUtilities.rank_items(item_list)

            return delegate_assemble(item_list, current_user_id)

    @staticmethod
    def get_liked_posts(current_user_id, profile_user_id):

        """
            PURPOSE: Get all of a user's upvoted posts
            to be visible in the Upvoted-->Posts tab
            on the profile

            USE: Call like: _GenerateItemList.get_liked_posts(<int>,<int>)

            PARAMS: 2 required params:
                current_user_id : int : The id of the current logged-in user
                profile_user_id : int : The id of the user whose profile is being viewed

            RETURNS: A list of dicts, with each dict containing a full post's info
        """

        object_upvotes = ObjectVoteManager.get_liked_objects_for_user(profile_user_id)
        upvoted_posts_list = []
        for data in object_upvotes:
            p = _AssemblePost(data, current_user_id, profile_user_id=profile_user_id).assemble_data()
            if p:
                upvoted_posts_list.append(p)

        return upvoted_posts_list

    @staticmethod
    def get_following(profile_user_id):

        """
            PURPOSE: Get all the users a particular other user
            user has followed, indicated by profile_user_id

            USE: Call like: _GenerateItemList.get_following(<int>)

            PARAMS:
                profile_user_id : int : The id of the user whose profile is being viewed

            RETURNS: A list of dicts, with each dict containg an upvoted user's info
        """

        upvoted_users = UserVote.query.filter(UserVote.user_id == profile_user_id).\
                                       filter(UserVote.active == True).\
                                       filter(UserVote.vote_type == 1).all()

        upvoted_users_list = []
        for user_vote in upvoted_users:
            user_obj = UserManager.get(user_vote.voted_on_id)
            if user_obj:
                upvoted_users_list.append(user_obj)

        return upvoted_users_list

    @staticmethod
    def get_followers(profile_user_id):

        """
            PURPOSE: Get all the users a particular other user
            user has been followed by, indicated by profile_user_id

            USE: Call like: _GenerateItemList.get_followers(<int>)

            PARAMS:
                profile_user_id : int : The id of the user whose profile is being viewed

            RETURNS: A list of dicts, with each dict containg an upvoted-by user's info
        """

        upvoted_by_users = UserVote.query.filter(UserVote.voted_on_id == profile_user_id).\
                                          filter(UserVote.active == True).\
                                          filter(UserVote.vote_type == 1).all()

        upvoted_by_users_list = []
        for user_vote in upvoted_by_users:
            user_obj = UserManager.get(user_vote.user_id)
            if user_obj:
                upvoted_by_users_list.append(user_obj)

        return upvoted_by_users_list

    @staticmethod
    def get_wall_posts(current_user_id, profile_user_id):

        """
            PURPOSE: Iterate through each element in the data fragment
            returned by the _get_item_range() method.

            USE: Add each processed item to an item_list.
            When we exhaust the data, add the stop_iteration key to dict
            with value set to True.

            PARAMS:
                current_user_id : int : REQUIRED : The id of the current logged-in user
                profile_user_id : int : REQUIRED : The id of the whose items to get

            RETURNS: This list of post_objects will be sent to Ajax success
        """

        # Generate the item list for a profile's wall posts
        item_list = _GenerateItemList.wall_items(profile_user_id)

        # For each post data in list, get the full posts data
        return delegate_assemble(item_list, current_user_id)


class GetItems(object):
    @staticmethod
    def feed(current_user_id, feed_type=None):

        # Not logged in/ public feed
        if not current_user_id and not feed_type:
            pass

        elif current_user_id:
            # Logged in / load majority feed AKA following feed
            if feed_type == "majority":
                return _GenerateItemList.majority_feed_items(current_user_id)

            # Logged in / load majority
            elif feed_type == "priority":
                pass

    @staticmethod
    def profile(profile_user_id, current_user_id=None, tab=None):

        # Get profile's following
        if tab == "following":
            item_list = _GenerateItemList.get_following(profile_user_id)

        # Get profile's followers
        elif tab == "followers":
            item_list = _GenerateItemList.get_followers(profile_user_id)

        # Get a user's liked items
        elif tab == "likes":
            item_list = _GenerateItemList.get_liked_posts(current_user_id, profile_user_id)

        # Get main profile items for wall
        else:
            item_list = _GenerateItemList.get_wall_posts(current_user_id, profile_user_id)

        return item_list

    @staticmethod
    def new_wall_post(new_post_obj, current_user_id):
        return _GenerateItemList.new_wall_post(new_post_obj, current_user_id)

    @staticmethod
    def global_tag(global_tag_name, current_user_id):
        return _GenerateItemList.tag_items(global_tag_name, current_user_id)

    @staticmethod
    def single_object(obj, current_user_id):
        return _GenerateItemList.single_object(obj, current_user_id)
