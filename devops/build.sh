#!/bin/bash

# Use Webpack to build the client files and put
# them in the build/ folder.
TARGET=build webpack --bail

# Use Typescript to build the server files and put
# them in the dist/ folder
tsc

# Remove the existing public/ folder from dist/
# This will error if it does not exist - that's okay
rm -rf dist/public/

# Copy the public/ folder and all its subdirectories to
# the same in dist/
cp -R public/ dist/public/

# Remove the existing build/ folder from dist/
# This will error if it does not exist - that's okay
rm -rf dist/build/

# Copy the build/ folder and all its subdirectories to
# the same in dist/
cp -R build/ dist/build/
