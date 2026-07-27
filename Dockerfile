ARG NODE_VER="22-bookworm-slim"

FROM node:${NODE_VER}
WORKDIR /was-ui
COPY . .

RUN npm install
RUN npm run build

EXPOSE 3000
