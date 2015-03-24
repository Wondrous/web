import uuid, logging, re

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
    Notification,
    AdminTag,
    UserTag
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
from sqlalchemy import func, distinct, or_, case, func
from sqlalchemy.orm import aliased

from wondrous.utilities.general_utilities import round_num


class AdminManager:

    @staticmethod
    def auth_json(user):
        tag = DBSession.query(AdminTag).filter(AdminTag.user_id==user.id).first()
        if tag:
            return tag.json()
        else:
            return {'error':'not authorized'}

    @staticmethod
    def reported_post_json(user):
        pass

    @staticmethod
    def reported_comment_json(user):
        pass
