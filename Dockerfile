FROM node:10.12.0-alpine

WORKDIR /app

COPY package.json .
RUN npm install