#!/bin/bash

npm run build
cp css/style.css dist/style.css
cp js/bundle.min.js dist/bundle.min.js
echo "built and copied to dist"
