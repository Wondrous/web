#!/usr/bin/env python
# -*- coding: utf-8 -*-

#
# Company: WONDROUS
# Created by: John Zimmerman
#
# VIEWS/AJAX_ADMIN.PY
#

from pyramid.view import view_config

from wondrous.models.object import Object

from wondrous.models.user import User

from wondrous.utilities.delete_utilities import DisableUser
from wondrous.utilities.delete_utilities import EnableUser

from wondrous.utilities.general_utilities import SYSTEM_ADMIN_REQUIRED

from wondrous.views.admin import AdminBaseHandler

class AdminAjaxHandler(AdminBaseHandler):

    @SYSTEM_ADMIN_REQUIRED(super_admin=True)
    @view_config(route_name='_admin_ajax_delete_content', xhr=True, renderer='json')
    def _admin_ajax_delete_content(self):
        _object_id = self.request.POST.get('object_id')
        
        error_message = None

        this_object = Object.get(_object_id)
        if this_object:
            
            all_rep_objs = ReportedContentManager.get_all_reports_for_object(this_object.id)
            for obj in all_rep_objs:
                obj.deleted = True

            DeletedContentManager.delete_content(this_object.id)
        else:
            error_message = "There was an error when deleting this post."

        data = dict(
            error_message=error_message,
        )
        return data

    @SYSTEM_ADMIN_REQUIRED(super_admin=True)
    @view_config(route_name='_admin_ajax_ban_user', xhr=False, renderer='json')
    def _admin_ajax_ban_user(self):
        _user_id = self.request.POST.get('user_id')
        
        error_message = success_message = None
        enable_successful = disable_successful = None

        this_user = User.get(_user_id) or User.get(_user_id, is_active=False)
        if this_user:
            
            if this_user.user.banned and not this_user.user.active:
                # Un-ban user
                this_user.user.banned = False

                # Re-enable user
                e = EnableUser(this_user.id)
                enable_successful = e.enable()
                if enable_successful:
                    success_message = "This user was successfully un-banned"
                else:
                    error_message = "There was an error and the user was not un-banned"

            elif not this_user.user.banned and this_user.user.active:
                # ban user
                this_user.user.banned = True

                # disable user
                d = DisableUser(this_user.id)
                disable_successful = d.disable()
                if disable_successful:
                    success_message = "This user was successfully banned"
                else:
                    error_message = "There was an error and the user was not banned"
            else:
                error_message = "This action could not be completed"
        else:
            error_message = "There was an error when deleting this user."

        data = dict(
            error_message=error_message,
            success_message=success_message,
        )
        return data
