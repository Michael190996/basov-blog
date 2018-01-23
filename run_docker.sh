#!/bin/bash

if [ ! -L "dist/static" ]; then
    cp -r dist/static dist/views /var/www/blog
    rm -r dist/static dist/views
    ln -s /var/www/blog/static dist
    ln -s /var/www/blog/views dist
fi

npm run start