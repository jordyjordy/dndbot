FROM node:16 as builder

WORKDIR /app/server

COPY package*.json ./

RUN yarn install

COPY . .

RUN npm run build

FROM node:16-alpine

COPY --from=builder ./app/server .

CMD ["npm", "run", "deploy"]