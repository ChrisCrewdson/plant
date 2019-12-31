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
# This is because the server is going to start in the dist/
# folder as its root folder and will look for public/
# under there.
cp -R public/ dist/public/

# Remove the existing build/ folder from dist/
# This will error if it does not exist - that's okay
# Same reason as above. Root is dist/ so build needs to
# be in there to provide client bundle file etc.
rm -rf dist/build/

# Copy the build/ folder and all its subdirectories to
# the same in dist/
cp -R build/ dist/build/
