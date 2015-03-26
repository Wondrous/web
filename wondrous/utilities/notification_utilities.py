from pynats import *
import json

CHANNEL_NOTIFICATION = "notification"

connection = None
import logging


def initialize_message_queue(message_queue_url,**kw):
    global connection
    connection = Connection(url=message_queue_url,verbose=False)
    print message_queue_url
    try:
        logging.info("Notification server connected")
        connection.connect()
    except Exception, e:
        logging.warn(e)


def send_notification(channel,message):
    """
        sends a notification to the specified channel. The channel can be user id
        or any object id. Will fail gracefully if nats system is not connected

        USE: send_notification(154212332,"New Post")

        PARAMS: both parameters are required
            - channel : int : required : The channel to dispatch the message to
            - message : str : required : The message to send (needs to be in str)

        RETURNS: None
    """
    msg = message if channel != -1 else message

    data = {"channel":channel,"message":msg}
    package = json.dumps(data)

    try:
        connection.publish(CHANNEL_NOTIFICATION,package)
        logging.warn("sent"+str(package))
    except Exception, e:
        logging.warn(e)
        try:
            connection.reconnect()
            logging.info("Notification server reconnected")
            connection.publish(CHANNEL_NOTIFICATION,package)
        except Exception, e:
            logging.warn(e)
