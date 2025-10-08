FROM node:22 as builder

WORKDIR /app/server

COPY package*.json ./

RUN yarn install

COPY . .

RUN npm run build

FROM node:22-bookworm-slim

COPY --from=builder ./app/server .

CMD ["npm", "run", "deploy"]