FROM node:26-alpine

WORKDIR /app
COPY server.mjs .

CMD ["node", "server.mjs"]