#!/bin/bash
git pull origin master
npm install
docker build -t dndbot-client ../client
docker build -t dndbot-server ../server
docker build -t dndbot-newbot ../new-bot
