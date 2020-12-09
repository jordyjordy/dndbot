FROM node:12-alpine

WORKDIR /app/bot

RUN apk add python make g++ --no-cache

COPY package*.json ./

RUN npm install

COPY . .

CMD ["npm","run","start"]