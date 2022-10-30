#!/bin/bash
git pull origin master
cd ../
npm run bootstrap
cd ./deployment || return 1;
docker build -t dndbot-client ../packages/client
docker build -t dndbot-server ../packages/server