FROM node:16

WORKDIR /app/server

COPY package*.json ./

RUN yarn install

COPY . .

EXPOSE 5000

CMD ["npm", "run", "start"]