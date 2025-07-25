FROM node:18-alpine AS builder

RUN mkdir -p /app
WORKDIR /app

COPY package.json ./
COPY package-lock.json ./
RUN yarn install

COPY . .

EXPOSE 80
CMD [ "yarn", "run", "start" ]