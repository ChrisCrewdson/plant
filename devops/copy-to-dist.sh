#!/bin/bash

# Remove the existing public/ folder from dist/
# This will error if it does not exist - that's okay
rm -rf dist/public/

# Copy the public/ folder and all its subdirectories to
# the same in dist/
cp -R public/ dist/public/
