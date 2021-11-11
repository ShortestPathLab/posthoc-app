FROM node:current-bullseye

USER root

WORKDIR /usr/src/app/

COPY package.json .
RUN npm i

COPY . .

ENV PORT=80
EXPOSE 80

CMD ["node", "-r", "ts-node/register/transpile-only", "src/index.ts" ]