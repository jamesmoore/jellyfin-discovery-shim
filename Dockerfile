FROM node:25-alpine

WORKDIR /app
COPY server.mjs .

CMD ["node", "server.mjs"]