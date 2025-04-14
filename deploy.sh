#!/bin/bash

#set -e

M=$1
if [ "$M" == "" ];then
    M="up"
    echo "usage: ./deploy.sh commit message"
fi

find . -name "*.sh" -exec chmod +x {} +

git add -A
git commit -m $M
git pull origin main
git push -u origin main
