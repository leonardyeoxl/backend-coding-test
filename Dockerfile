FROM node:8.7-alpine

WORKDIR /app

COPY package.json .
RUN npm install