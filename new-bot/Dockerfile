FROM node:16-alpine

WORKDIR /app/new-bot

COPY package*.json ./

RUN npm install

COPY . .

run npm install -g typescript

CMD ["npm","run","start"]