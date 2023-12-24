FROM node:20-alpine
RUN npm i -g pnpm ts-node
USER node
WORKDIR /usr/src/app
COPY --chown=node:node package*.json ./
RUN pnpm i
COPY --chown=node:node . .
RUN pnpm run build
CMD pnpm run migration:run && pnpm run start:prod
EXPOSE 3000