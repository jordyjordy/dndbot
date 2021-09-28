FROM node:16-alpine

WORKDIR /app/newbot

RUN apk add python make g++ --no-cache

COPY package*.json ./

RUN npm install

COPY . .

run npm install -g typescript

CMD ["npm","run","start"]