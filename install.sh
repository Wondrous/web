#!/bin/bash -e

BASEDIR=`dirname $0`/..

if [ ! -d "$BASEDIR/pyramidenv" ]; then
    virtualenv -q $BASEDIR/pyramidenv --no-site-packages
    echo "Virtualenv created."
fi

if [ ! -f "$BASEDIR/pyramidenv/updated" -o $BASEDIR/requirements.pip -nt $BASEDIR/pyramidenv/updated ]; then
    pip install -r $BASEDIR/requirements.pip -e $BASEDIR/pyramidenv
    touch $BASEDIR/pyramidenv/updated
    echo "Requirements installed."
fi
