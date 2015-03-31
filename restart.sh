#!/usr/bin/env bash

source ../bin/activate
kill -9 $(cat pserve_5000.pid)
kill -9 $(cat pserve_5001.pid)
pserve --daemon --pid-file=pserve_5000.pid production.ini http_port=5000 && pserve --daemon --pid-file=pserve_5001.pid production.ini http_port=5001

