from pynats import *
import json

CHANNEL_NOTIFICATION = "notification"
DEFAULT_URI = 'nats://0.0.0.0:4222'

c = Connection(url=DEFAULT_URI,verbose=False)

global CONNECTED

try:
    c.connect()
    CONNECTED = True
except Exception, e:
    CONNECTED = False

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
    if CONNECTED:
        data = {"channel":channel,"message":message}
        package = json.dumps(data, ensure_ascii=False)
        c.publish(CHANNEL_NOTIFICATION,package)
    else:
        # NOT CONNECTED
        pass

for i in range(1000):
    send_notification(1,"hello world!")