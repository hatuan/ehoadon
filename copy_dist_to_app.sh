#!/bin/sh

echo "pull app from git server"
cd ~/tmp/app
pwd
git pull origin

echo "copy dist to app"
cd ~/go/src/erpvietnam/ehoadon/dist
pwd
cp -R . ~/tmp/app

echo "push app to git server"
cd ~/tmp/app
pwd
git add -A
git commit -m "update app"
git push origin master

