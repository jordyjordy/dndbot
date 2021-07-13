FROM node:12-alpine as build-stage

WORKDIR /app/client

RUN apk add python make g++ --no-cache

COPY package-lock.json ./
COPY package.json ./
RUN ls
RUN pwd
RUN npm install

COPY . .

RUN npm run build

FROM nginx:alpine as production-stage
COPY /.nginx/nginx.conf /etc/nginx/nginx.conf
RUN rm -rf /usr/share/nginx/html/*

COPY --from=build-stage /app/client/dist /usr/share/nginx/html
EXPOSE 80
ENTRYPOINT ["nginx", "-g", "daemon off;"]
