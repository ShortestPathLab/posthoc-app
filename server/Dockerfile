FROM node:current-bullseye

USER root

WORKDIR /usr/src/app/

COPY package.json .
RUN npm i

COPY . .

RUN ["chmod", "-R", "777", "."]

ENV PORT=80
EXPOSE 80

CMD ["node", "--experimental-specifier-resolution=node", "--loader", "ts-node/esm/transpile-only", "src/index.ts" ]