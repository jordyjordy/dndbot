#!/bin/bash
git pull origin master
npm install
docker build -t dndbot-client ../packages/client
docker build -t dndbot-server ../packages/server
