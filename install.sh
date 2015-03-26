#!/bin/bash -e

BASEDIR=`dirname $0`

PYRAMIDENV = `dirname $0`/../pyramidenv

if [ ! -d "$PYRAMIDENV" ]; then
    virtualenv -q $PYRAMIDENV --no-site-packages
    echo "Virtualenv created."
fi

if [ ! -f "$PYRAMIDENV/updated" -o $BASEDIR/requirements.txt -nt $PYRAMIDENV/updated ]; then
    pip install -r $BASEDIR/requirements.txt -e $PYRAMIDENV
    touch $PYRAMIDENV/updated
    echo "Requirements installed."
fi
