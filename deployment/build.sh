#!/bin/bash
git pull origin master
npm install
docker build -t dndbot-client ../client
docker build -t dndbot-server ../server
