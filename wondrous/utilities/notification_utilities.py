from pynats import *
import json

CHANNEL_NOTIFICATION = "notification"
DEFAULT_URI = 'nats://104.236.251.250:4222'

c = Connection(url=DEFAULT_URI,verbose=False)
import logging
global CONNECTED

try:
    logging.info("Notification server connected")
    c.connect()
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
        c.publish(CHANNEL_NOTIFICATION,package)
        logging.warn("sent"+str(package))
    except Exception, e:
        logging.warn(e)
        try:
            c.reconnect()
            logging.info("Notification server reconnected")
            c.publish(CHANNEL_NOTIFICATION,package)
        except Exception, e:
            logging.warn(e)
