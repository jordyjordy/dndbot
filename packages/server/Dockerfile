FROM node:18 as builder

WORKDIR /app/server

COPY package*.json ./

RUN yarn install

COPY . .

FROM node:18-bookworm

COPY --from=builder ./app/server .

CMD ["npm", "run", "deploy"]