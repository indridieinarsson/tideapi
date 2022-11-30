FROM node:14.17.3-alpine3.14

WORKDIR /usr/src/app

COPY ./package.json ./
RUN npm install
COPY ./index.js ./
COPY ./controllers controllers
COPY ./data data
COPY ./users users

CMD ["npm","start"]
