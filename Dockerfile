# FROM node:10.12.0-alpine
FROM node:14.16.0-alpine3.13

WORKDIR /app

COPY . .
RUN npm install