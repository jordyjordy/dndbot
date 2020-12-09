FROM node:12-alpine

WORKDIR /app/server

RUN apk add python make g++ --no-cache

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 5000

CMD ["npm", "run", "start"]