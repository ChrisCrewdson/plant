#!/bin/bash

# This script can be used to start the server

# If you have Docker installed then this will setup MongoDB for you.
# If you don't have Docker and already have MongoDB installed then comment out these lines
# If the container is already running then this will print a message that can be ignored.
# docker pull mongo:latest
# docker run -d -p 27017:27017 --name mongodb mongo
# docker start mongodb
# docker ps

# Look at readme to setup your own Facebook (FB) credentials
[ -z "$PLANT_FB_ID" ] && { echo "Need to set PLANT_FB_ID non-empty. See Readme"; exit 1; }
[ -z "$PLANT_FB_SECRET" ] && { echo "Need to set PLANT_FB_SECRET non-empty. See Readme"; exit 1; }
[ -z "$PLANT_GOOGLE_ID" ] && { echo "Need to set PLANT_GOOGLE_ID non-empty. See Readme"; exit 1; }
[ -z "$PLANT_GOOGLE_SECRET" ] && { echo "Need to set PLANT_GOOGLE_SECRET non-empty. See Readme"; exit 1; }

# For testing and dev work you can leave this as it is.
# If you use this script to run a prod server then you need to change this
export PLANT_TOKEN_SECRET=json-web-token-secret

# These generally don't need to be changed for dev work
export PLANT_DB_URL=127.0.0.1:27017
export PLANT_DB_NAME=plant-development

# Set to relevant environment
export NODE_ENV=development

# You can comment out the DEBUG line below if you want fewer terminal messages
export DEBUG=plant:*

tsc
cd dist/
pwd
nodemon server.js
# nodemon server.js --exec babel-node --presets es2015,stage-1
