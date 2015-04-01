#!/bin/bash

if [ ! -d dist ]; then
	mkdir dist;
fi
npm run build
cp css/style.css dist/style.css
cp js/bundle.min.js dist/bundle.min.js
cp -av pictures/ dist/pictures
cp -av css/fonts dist/fonts
echo "built and copied to dist"
aws s3 sync dist s3://wondrousstatic 

