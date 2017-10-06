# This script can be used to start the server

# If you have Docker installed then this will setup MongoDB for you.
# If you don't have Docker and already have MongoDB installed then comment out these lines
# If the container is already running then this will print a message that can be ignored.
# docker pull mongo:latest
# docker run -d -p 27017:27017 --name mongodb mongo
# docker start mongodb
# docker ps

# Set to relevant environment
export NODE_ENV=development

# You can comment out the DEBUG line below if you want fewer terminal messages
export DEBUG=plant:*
export PLANT_DB_URL=127.0.0.1:27017
export PLANT_DB_NAME=plant-test

# node_modules/mocha/bin/_mocha test/**/*.js --recursive --require babel-core/register --require test/setup.js

nyc --require babel-register mocha ./test/**/*.js --exit
