#!/bin/bash
git pull origin dockerize
npm install
docker build -t dndbot-bot ../bot
docker build -t dndbot-client ../client
docker build -t dndbot-server ../server
