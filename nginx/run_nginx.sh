#!/usr/bin/env bash

echo Nginx start at $BLOG_HOST

export DOLLAR='$'
envsubst < /home_nginx/nginx.conf.template > /etc/nginx/nginx.conf # /etc/nginx/conf.d/default.conf
nginx -g "daemon off;"

