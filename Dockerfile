FROM node:10.12.0-alpine

WORKDIR /app

COPY . .
RUN npm install