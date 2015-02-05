#!/usr/bin/env python
# -*- coding: utf-8 -*-

#
# Company: WONDROUS
# Created by: John Zimmerman
#
# VIEWS/MAIN.PY
#

from datetime import datetime
from functools import partial

from pyramid.security import forget
from pyramid.security import remember

from pyramid.httpexceptions import HTTPFound

from pyramid.view import view_config

from wondrous.models.object import Object

from wondrous.models.person import Person
from wondrous.models.person import UnverifiedEmailManager

from wondrous.models.user import User
from wondrous.models.user import BlockedUser

from wondrous.controllers import (
    AccountManager,
    VoteManager,
    TagManager
)
from wondrous.utilities.delete_utilities import DisableUser

from wondrous.utilities.general_utilities import login_required
from wondrous.utilities.general_utilities import logout_required
from wondrous.utilities.general_utilities import url_match

from wondrous.utilities.global_config import GLOBAL_CONFIGURATIONS

from wondrous.utilities.render_utilities import GetItems
from wondrous.utilities.render_utilities import Pagination

from wondrous.utilities.validation_utilities import Sanitize
from wondrous.utilities.validation_utilities import ValidationHelper as vh


class BaseHandler(object):

    def __init__(self, request):
        self.request      = request
        self.url_match    = partial(url_match, self)
        self.COMPANY_NAME = "Wondrous"

    def set_pagination_data(self, items, start, user_id=None, PER_PAGE=GLOBAL_CONFIGURATIONS['POSTS_PER_PAGE']):

        """
            PURPOSE: Set all the necessary instance variables
            for use in item pagination.

            USE: Call like: self.set_pagination_data(...)

            NOTE: We no longer use direct pagination; however, in oder to
            implement the infinite scroll, we append the next page's items.
            Infinite scroll is reliant on this data, and is built upon a
            paginated set of posts.

            PARAMS: 4 params, 2 of which are optional
                items : list : The list of items to paginate
                start : The index of items at which we start our pagination
                user_id : int : The id of the profile whose items we are paginating
                PER_PAGE : int : The number of items to render per paginated page

            RETURNS: (None), but we do set many instance variables
        """

        # Make sure our value is an int
        # If it isn't, default to 0
        try:
            start = int(start)
        except ValueError:
            start = 0

        # If we have any negative numbers,
        # default them to 0
        start = 0 if start < 0 else start

        # Obviously, get current user id
        current_user_id = self.request.person.id

        # Create new pagination object to
        # do all the hard work for us
        p = Pagination(start, PER_PAGE)

        # Only show hidden posts if current user
        # is the one who did the posting
        SHOW_HIDDEN = True if user_id and (current_user_id == user_id) else False

        # Assign all relevant data to instance variables for
        # use in the calling method
        self.page_items  = p.load(items, display_hidden=SHOW_HIDDEN)
        self.page_num    = p.current_page_num
        self.has_next    = p.has_next(items)
        self.next_start  = start + PER_PAGE
        self.back_start  = start - PER_PAGE if self.page_num > 1 else None
        self.start       = start


class AuthHandler(BaseHandler):

    @logout_required
    @view_config(renderer='/login.jinja2', route_name='login_handler')
    def login(self):

        """
            PURPOSE: This method handles the login process for all users
        """

        safe_in  = Sanitize.safe_input
        safe_out = Sanitize.safe_output
        p        = self.request.POST

        error_message = None
        credential    = None
        password      = None

        if 'login_button' in p:
            credential = safe_in(p.get('user_identification'))
            password   = safe_in(p.get('password'), strip=False)

            if Sanitize.is_valid_email(credential):
                this_user = User.by_kwargs(email=credential).first()
            else:
                this_user = User.by_kwargs(username=credential).first()

            if this_user and this_user.validate_password(password) and not this_user.is_banned:

                # Reactivating a user when they log in
                # TODO -- this needs to be more 'offical'
                headers = self._set_session_headers(this_user.person)
                this_user.last_login = datetime.now()
                return HTTPFound(location="/", headers=headers)

            elif this_user and this_user.is_banned:
                return HTTPFound("/auth/is_banned/{uid}/".format(uid=this_person.id))

            # At this point, the login has totally
            # failed. We can safely disarm the this_person
            # object and return appropriate error messages
            this_person = None
            if not this_person:
                error_message = "Invalid email/username or password"

        data = {
            'error_message'       : error_message,
            'user_identification' : safe_out(credential),
        }
        return data

    @logout_required
    @view_config(renderer='/auth/is_banned.jinja2', route_name='auth_is_banned_handler')
    def is_banned(self):

        """
            PURPOSE: This method handles the is_banned view for
            those unfortunate souls who seriously abuse the system.
        """

        user_id   = self.url_match(url_match='user_id', arg_type="int")
        if user_id:

            # Get the user and check if they're banned from the site
            # if they attempt to access this view
            this_person = User.get(user_id, is_active=False)
            if this_person and this_person.user.is_banned:

                # Show the page (note that the
                # page requires no data)
                return {}

        # Otherwise, the user is not banned
        # Or, the user_id could potentially have been invalid
        return HTTPFound("/")

    @login_required
    @view_config(renderer='json', route_name='auth_logout_handler')
    def logout(self):

        """
            PURPOSE: This method handles the logout process for all users
        """

        this_person = self.request.person  # The logged-in user
        this_person.user.last_logout = datetime.now()

        headers = forget(self.request)

        # After every call, we redirect back to index
        return HTTPFound(location="/", headers=headers)

    @login_required
    @view_config(renderer='json', route_name='auth_delete_handler')
    def delete(self):

        """
            PURPOSE: This method handles the SOFT delete process for
            all users should they desire to deactivate their accounts
        """

        secret_number = self.request.POST.get('secret_number')
        bot_detected = self.request.POST.get('off-screen-bot-fucker')
        user_id = self.request.person.id

        # bot_detected is a parameter that when filled in, indicates that
        # the disabling process was performed by 1) a bot who automatically
        # filled in all the form fields, or 2) a total jackass hacker.
        if not bot_detected:

            if secret_number == "666" and user_id:
                d = DisableUser(user_id)
                disable_successful = d.disable()

                if disable_successful:
                    # On a successful disabling, we always finish we a logout
                    return HTTPFound(location="/auth/logout/")

        # If something goes wrong, redirect back to index...
        return HTTPFound(location="/")

    @logout_required
    @view_config(renderer='/auth/waitlist.jinja2', route_name='auth_waitlist')
    def waitlist(self):

        """
            TODO
        """

        safe_in = Sanitize.safe_input
        email = safe_in(self.request.POST.get('email'))
        action = safe_in(self.url_match(url_match='action'))
        success_message = None
        error_message   = None

        if action == "success":

            success_message = """
                You've been added to the waiting list and will
                be notified when you are invited to join {cn}.
                Thanks for your interest!
            """.format(cn=self.COMPANY_NAME)

        elif action == "add":

            valid_email, error_message = UnverifiedEmailManager.validate(email)
            if not error_message:

                email_obj = UnverifiedEmailManager.get(valid_email)
                if email_obj:
                    return HTTPFound("/auth/waitlist/success/")
                else:
                    error_message = "There was an unexpected problem. Sorry :("

        else:
            return HTTPFound("/")

        data = {
            'success_message' : success_message,
            'error_message'   : error_message,
        }
        return data

    @logout_required
    @view_config(renderer='/auth/signup.jinja2', route_name='auth_signup_handler')
    def signup(self):

        """
            PURPOSE: This method handles the signup process for all new users
        """

        safe_in  = Sanitize.safe_input
        p = self.request.params

        # Some helpful constants
        PERSON = 1
        SIGNUP_ROUTE = "/signup/step/1/"

        # The data we need to validate
        error_message = None
        first_name = safe_in(p.get('first_name'))
        last_name  = safe_in(p.get('last_name'))
        email      = safe_in(p.get('email'))
        password   = safe_in(p.get('password'), strip=False)
        username   = safe_in(Sanitize.strip_ampersand(p.get('username')))

        if 'signup_button' in p:

            # Check for presence
            if not first_name:
                error_message = "Please enter your first name."
            elif not last_name:
                error_message = "Please enter your last name."
            elif not email:
                error_message = "Please enter your email."
            elif not password:
                error_message = "Please enter a password."
            elif not username:
                error_message = "Please enter a username."

            if not error_message:

                _s_valid_fn, len_err_fn = Sanitize.length_check(first_name, min_length=1, max_length=30)
                _s_valid_ln, len_err_ln = Sanitize.length_check(last_name, min_length=1, max_length=30)
                _s_valid_pw, len_err_pw = Sanitize.length_check(password, min_length=6, max_length=255)
                _s_valid_em = Sanitize.is_valid_email(email)
                _s_em_taken = User.get(email=email)
                _s_valid_un = Sanitize.is_valid_username(username.lower())
                _s_un_taken = User.get(username=username)

                # Check for validity
                if not _s_valid_fn:
                    error_message = "Your first name is {err}".format(err=len_err_fn)
                elif not _s_valid_ln:
                    error_message = "Your last name is {err}".format(err=len_err_ln)
                elif not _s_valid_em:
                    error_message = "Please enter a valid email address"
                elif _s_em_taken:
                    error_message = "This email has already been used to sign up. Please use a different one."
                elif not _s_valid_pw:
                    error_message = "Your password is {err}".format(err=len_err_pw)
                elif not _s_valid_un:
                    error_message = "Invalid username! Use only alphanumerics, and it cannot be all numbers"
                elif _s_un_taken:
                    error_message = "This username has already been taken. Please use a different one."

            if not error_message:

                new_user = AccountManager.add(first_name,last_name,email,username,password)
                new_person = new_user.person
                headers = self._set_session_headers(new_person)
                new_user.last_login = datetime.now()

                # If we're successful, redirect to the step process
                return HTTPFound(location=SIGNUP_ROUTE, headers=headers)
            else:
                data = {
                    'error_message' : error_message,
                }
        else:
            data = {}

        return data

    @login_required
    @view_config(renderer='/auth/signup_step.jinja2', route_name='auth_signup_step_handler')
    def signup_step(self):

        """
            PURPOSE: This method handles the next steps in the signup process.
            It pushes a user through a sequence of LAST_STEP number of steps
            in order to fully complete a new user's sign up process
        """

        # Update step every time you go to a new level
        url_step_num = self.url_match(url_match='step_num', arg_type="int")
        this_person = self.request.person

        current_step = this_person.signup_step_num
        next_step = current_step + 1
        LAST_STEP = 4  # 4 steps in total

        # If we're not in the signup sequence
        if url_step_num not in [current_step, current_step+1]:
            return HTTPFound(location="/signup/step/{step}/".format(step=current_step))

        # If we're in the sequence, but we're advanced past last step
        elif url_step_num == LAST_STEP+1:
            this_person.signup_step_num += 1  # They've advanced 1 step
            return HTTPFound(location="/")

        # We've completed the full set of steps, so redirect
        # user back to index
        elif url_step_num > LAST_STEP + 1:
            return HTTPFound(location="/")

        # We're at the step we should be at...
        elif url_step_num == current_step:
            pass # No need to update step num

        # Advance the step as long as we're not
        # advancing it past the max step number!
        elif this_person.signup_step_num < LAST_STEP:
            this_person.signup_step_num += 1  # They've advanced 1 step
            current_step = this_person.signup_step_num
            next_step = current_step + 1

        data = {
            'current_step' : current_step,
            'next_step'    : next_step,
            'total_steps'  : LAST_STEP,
        }
        return data

    @logout_required
    @view_config(renderer='/auth/verify_signup.jinja2', route_name='auth_verify_handler')
    def verify(self):

        """
            TODO
        """

        safe_in = Sanitize.safe_input
        code = safe_in(self.url_match(url_match='code'))
        error_message = None

        # Get both/either the active=True or active=False
        # For this page it doesn't matter becasue as soon as the
        # first person actually signs up with the given code, the
        # unverified_email row is deleted. This will allow a user
        # trying to sign up to have multiple attempts at a form submission
        # on the same link.
        email_obj_active   = UnverifiedEmailManager.get(code=code)
        email_obj_inactive = UnverifiedEmailManager.get(code=code, is_active=False)

        if email_obj_active:
            email_obj = email_obj_active
        elif email_obj_inactive:
            email_obj = email_obj_inactive
        else:
            email_obj = None

        if email_obj:
            # Delete the code when user clicks link
            # OR, after <num> days with no activity
            DURATION = 1  # day
            last_attempt = email_obj.most_recent_attempt.date()
            if vh.duration_expired(last_attempt, days=DURATION):
                error_message = """
                    The link you've clicked on has expired.
                    Please re-enter your email on the homepage and try again
                """

                # This time, the link is totally useless. Delete it
                UnverifiedEmailManager.delete(email_obj.email)
            else:
                # In this case, the user may not finish the sign up
                # process. If they don't, we need to have an essentailly
                # dead link. BUT, if they do finish the process, we need to maintain the
                # data in the row to be used in AuthHandler.login()
                # this is why we deactivate() rather than delete()
                UnverifiedEmailManager.deactivate(email_obj.email)
        else:
            error_message = """
                The link you've clicked on is no longer valid.
                Please re-enter your email on the homepage and try again
            """

        data = {
            'verification_code' : code,
            'error_message'     : error_message,
        }
        return data

    def _set_session_headers(self, this_person, MAX_AGE=60 * 60 * 24 * 3):

        """
            PURPOSE: Sets the headers for a user logging in to the site

            USE: Call like: self._set_session_headers(<User object>)

            PARAMS: 2 params, one of which is optional:
                this_person : <Person> : REQUIRED : a Person object to set headers for
                MAX_AGE     : int : default = 60 * 60 * 24 * 3 (3 days) : The max age of the headers before they auto-expire

            NOTE: We use the Primary Key "id" as our identifier once someone has
            authenticated rather than the username.  You can change what is
            returned as the userid by altering what is passed to remember.

            RETURNS: The a header object to be
            used in the HTTPFound(<location>, <headers>)
        """

        headers = remember(
                    self.request,
                    this_person.id,
                    max_age=MAX_AGE,
                )
        return headers


class IndexHandler(BaseHandler):

    @view_config(renderer='/index_fork.jinja2', route_name='index_handler')
    @view_config(renderer='/index_fork.jinja2', route_name='index_priority_feed_handler')
    def index(self):

        """
            PURPOSE: This method handles the index page for users who are
            logged in AND logged out.
        """

        # Logged-in ----------------------
        current_user = self.request.person
        if current_user:

            start = self.request.GET.get('start', 0)  # The start-value of the items to get

            items = []
            self.set_pagination_data(items, start, PER_PAGE=10)

            # Make sure we have a valid tab name
            if self.request.matched_route.name == 'index_priority_feed_handler':
                tab_name = 'priority_feed'
            else:
                tab_name = None

            data = {
                'title'            : u"{cn} | Welcome {name}!".format(cn=self.COMPANY_NAME, name=current_user.name),
                'tab_name'         : tab_name,
                'current_user'     : current_user,
                'render_items'     : self.page_items,

                # Vars which deal with pagination
                'current_page_num' : self.page_num,
                'has_next'         : self.has_next,
                'next_start'       : self.next_start,
                'back_start'       : self.back_start,
                'start_item_num'   : self.start,
            }

        # Logged-out ----------------------
        else:
            data = {
                'title' : "Welcome to {cn}".format(cn=self.COMPANY_NAME)
            }

        # *** CRITICALLY IMPORTANT: DO NOT ALTER ***
        data['LOGGED_IN_TEMPLATE']  = "index_li.jinja2"
        data['LOGGED_OUT_TEMPLATE'] = "index_lo.jinja2"

        return data


class ProfileHandler(BaseHandler):

    @login_required
    @view_config(renderer='/profile.jinja2', route_name='profile_handler')
    @view_config(renderer='/profile.jinja2', route_name='profile_tab_handler')
    def profile(self):

        """
            PURPOSE: This method handles the profile view for any given user
        """

        safe_in       = Sanitize.safe_input
        profile_un    = self.url_match(url_match='username')
        tab           = self.url_match(url_match='tab')
        start         = self.request.GET.get('start', 0)  # The start-value of the items to get
        current_person  = self.request.person  # The logged-in user

        # valid_person  = vh.valid_profile(user_id)  # The profile's "owner"
        valid_user = User.by_kwargs(username=profile_un).first()

        if valid_user:
            current_user_id = current_person.user.id
            user_id = valid_user.id

            # TODO: Manage notification
            # notification_id = safe_in(self.request.GET.get('nrid'))
            # print "notification", notification_id
            # if notification_id:
            #     NotificationManager.mark_as_read(notification_id, current_user_id)

            # Handle profile tab
            tab = self._get_profile_tab(tab) # PUT ON HOLD FOR NOW: arg[1] = bool(user_id != current_user_id)

            # Get the items to render based off the given parameter(s)
            items = GetItems.profile(user_id, tab=tab)

            # Set all data needed for pagination
            num_items = 15
            self.set_pagination_data(items, start, user_id, PER_PAGE=num_items)
            following_count = VoteManager.get_following_count(user_id)
            follower_count  = VoteManager.get_follower_count(user_id)
            blocked_user = BlockedUser.get(current_user_id,user_id)

            data = {
                'title'              : u"{cn} | {name}".format(cn=self.COMPANY_NAME, name=valid_user.username),

                'current_user'       : current_person,
                'profile_user'       : valid_user,
                'is_blocked'         : blocked_user,
                'is_following'       : VoteManager.is_following(user_id,valid_user.id),
                'is_private'         : valid_user.is_private,
                'is_my_profile'      : bool(valid_user.id == current_user_id),
                'tab'                : tab,
                'get_item_owner'     : User.by_id,  # unbound method

                'render_items'       : self.page_items,
                'current_page_num'   : self.page_num,
                'has_next'           : self.has_next,
                'next_start'         : self.next_start,
                'back_start'         : self.back_start,
                'start_item_num'     : self.start,

                'following_count'    : following_count,
                'follower_count'     : follower_count,
            }
            return data

        # If not a valid username...
        else:
            return HTTPFound("/")

    def _get_profile_tab(self, tab):  # Arg[1] = is_not_my_profile

        """
            PURPOSE: Get the appropriate profile tab

            USE: Call like: self._get_profile_tab(...)

            PARAMS: 1 parameter
                tab : str : REQUIRED : The profile route match for a tab

            RETURNS: None if the tab is invalid (i.e., you get sent to the root
            profile route), or the actual string tab of the profile
                str  : The tab if valid
                    or
                None : None if tab invalid
        """

        VALID_PROFILE_TABS = set([
            'followers',
            'following',
            'likes',
            #'bookmarked',  # PUT ON HOLD. This is a private tab
        ])

        # Handle the profile tabbing
        tab = tab.lower() if tab else None

        if tab:
            if tab not in VALID_PROFILE_TABS:
                tab = None  # Profile tab is invalid

            # PUT ON HOLD FOR NOW
            # if tab == "bookmarked" and is_not_my_profile:
            #     tab = None  # You can only view the bookmarks on your own profile

        return tab


class TagHandler(BaseHandler):

    @login_required
    @view_config(renderer='/tag.jinja2', route_name='tag_handler')
    def tag(self):

        """
            PURPOSE: This method handles the rendering of all #tags
        """

        tag_name = self.url_match(url_match='tag_name')
        start    = self.request.GET.get('start', 0) # The start-value of the items to get

        is_valid_tag = vh.valid_tag(tag_name)
        tag_obj      = TagManager.by_name(tag_name=tag_name)
        this_person  = self.request.person

        # Check credentials
        if is_valid_tag and tag_obj:
            tag_name = tag_obj.tag_name

            # Get the items to render based off the given parameter(s)
            items = GetItems.global_tag(tag_name, this_person.id)

            # Set all data needed for pagination
            self.set_pagination_data(items, start)

            data = {
                'title'            : u"{cn} | {tn}".format(cn=self.COMPANY_NAME, tn=tag_name),

                'current_user'     : this_person,
                'context_tag'      : tag_name,
                'valid_tag'        : tag_obj,
                'get_item_owner'   : User.by_id,  # unbound method

                'render_items'     : self.page_items,
                'current_page_num' : self.page_num,
                'has_next'         : self.has_next,
                'next_start'       : self.next_start,
                'back_start'       : self.back_start,
                'start_item_num'   : self.start,
            }
            return data
        else:
            return HTTPFound("/tag/")


class SearchHandler(BaseHandler):

    @login_required
    @view_config(renderer='/search.jinja2', route_name='search_handler')
    def search(self):

        """
            PURPOSE: This method handles the static search view (not
            the ajax live search feature.)
        """

        safe_in     = Sanitize.safe_input
        safe_out    = Sanitize.safe_output
        this_person = self.request.person
        query       = safe_in(self.request.GET.get('q'))
        results     = None
        result_list = []

        # NOTE: We must ignore any system tags,
        # which are prefiexed and postfixed by
        # __double_undersocres__
        # So, the "_" cannot be in the query.
        if query and "_" not in query:

            # If we're explicitly searching for a #tag
            if query[0] == "#":
                query = query[1::]
                results = TagManager.get_like(query) if vh.valid_tag(query) else result_list.append({})
                if results:
                    result_list = [{
                        'results'     : results,
                        'result_type' : "tag"
                    }]

            # Otherwise, we could be searching
            # for a person OR tag
            else:

                # Are we searching a person by email?
                if Sanitize.is_valid_email(query):

                    # Given an email, we just look for people
                    results = User.get(email=query)
                    if results:
                        result_list = [{
                            'results'     : [results],
                            'result_type' : 'person'
                        }]
                else:
                    # Add persons and use only ascii chars for search
                    results = Person.by_id_like(query, ascii=True)
                    if results:
                        results = [p for p in results if p.user.active]  # filter out deactivated users
                        result_list.append({
                            'results'     : results,
                            'result_type' : 'person'
                        })

                    # Add all #tags
                    results = TagManager.get_like(query)
                    if results:
                        result_list.append({
                            'results'     : results,
                            'result_type' : 'tag'
                        })

        data = {
            'title'        : "{cn} | Search".format(cn=self.COMPANY_NAME),
            'current_user' : this_person,
            'query'        : safe_out(query),
            'result_list'  : result_list,
        }
        return data


class PostHandler(BaseHandler):

    @login_required
    @view_config(renderer='/post.jinja2', route_name='post_handler')
    def post(self):

        """
            PURPOSE: This method handles the view for a single post.
        """

        safe_in        = Sanitize.safe_input
        this_person    = self.request.person
        this_person_id = this_person.id  # I hate redundant dot operator lookups...
        object_id      = self.url_match(url_match='object_id')
        object_uuid    = self.url_match(url_match='object_uuid')

        valid_object = Object.by_id(object_id)
        if valid_object and valid_object.ouuid == object_uuid:

            new_post_item = GetItems.single_object(valid_object, this_person_id)

            # Manage notifications if we got here via a notification
            notification_id = safe_in(self.request.GET.get('nrid'))
            if notification_id:
                NotificationManager.mark_as_read(notification_id, this_person_id)

            # Get new item from Pagination
            p = Pagination()
            page_items = p.load(new_post_item)  # Where HTMLify occurs

            data = {
                'title'          : "{cn} | Post".format(cn=self.COMPANY_NAME),
                'current_user'   : this_person,
                'get_item_owner' : User.get,  # unbound method
                'render_items'   : page_items,
            }
            return data
        else:
            return HTTPFound("/")

class InfoHandler(BaseHandler):

    @view_config(renderer='/info/about.jinja2', route_name='info_about_handler')
    def about(self):
        data = {
            'title'        : "About {cn}".format(cn=self.COMPANY_NAME),
            'current_user' : getattr(self.request, 'user', None),
        }
        return data

    @view_config(renderer='/info/tos.jinja2', route_name='info_tos_handler')
    def tos(self):

        """
            NOTE: This page is publically accessible without a
            login, and therefore is associated with the /info/info_base.jinja2
            template, not the /base.jinja2 template.
        """

        data = {
            'title'        : "{cn} | Terms of Service".format(cn=self.COMPANY_NAME),
            'current_user' : self.request.person
        }
        return data

    @view_config(renderer='/info/privacy.jinja2', route_name='info_privacy_handler')
    def privacy(self):

        """
            NOTE: This page is publically accessible without a
            login, and therefore is associated with the /info/info_base.jinja2
            template, not the /base.jinja2 template.
        """

        data = {
            'title'        : "{cn} | Privacy Policy".format(cn=self.COMPANY_NAME),
            'current_user' : self.request.person
        }
        return data

    @login_required
    @view_config(renderer='/info/feedback.jinja2', route_name='info_feedback_handler')
    def feedback(self):
        data = {
            'current_user' : self.request.person
        }
        return data

    @login_required
    @view_config(renderer='/info/settings.jinja2', route_name='info_settings_handler')
    def settings(self):
        data = {
            'current_user' : self.request.person
        }
        return data

    @login_required
    @view_config(renderer='/info/delete_account.jinja2', route_name='info_account_delete_handler')
    def delete(self):
        data = {
            'current_user' : self.request.person
        }
        return data

def create_user(first_name,last_name,username,password,email):
    user_data = {
        'user_type'       : 1,
        'username'        : username,
        'email'           : email,
        'password'        : password,
        'profile_picture' : None,  # This is default
    }

    # For the person/page (in this case person) table
    user_type_data = {
        'first_name' : first_name,
        'last_name'  : last_name,
        'gender'     : None,  # Optional data to add later
        'locale'     : None,  # Optional data to add later
        'birthday'   : None,  # Optional data to add later
    }

    User.add(user_data, user_type_data) # This adds to Person table as well

class ExcSQL(BaseHandler):
    @view_config(route_name='exc_sql', xhr=False, renderer='json')
    def exc(self):

        """
            PURPOSE: To run any SQLAlchemy commands and effect the
            DB without having to laboriously craft up ridiculous SQL.

            ***
                THIS IS FOR DEV PURPOSES ONLY AND SHOULD BE
                LEFT BLANK UNLESS ABSOLUTELY NECESSARY
            ***
        """
        from wondrous.models import reset_sql

        # CREATE ADMIN
        from wondrous.models.admin import AdminManager
        new_admin_data = dict(
          username="root",
          password="password",
          super_admin=True,
        )
        AdminManager.add(new_admin_data)

        # Create two users
        u = AccountManager.add("first","user","user1@wondrous.co","user1","password")
        u = AccountManager.add("second","user","user2@wondrous.co","user2","password")

        return {}
