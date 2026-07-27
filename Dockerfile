ARG NODE_VER="22-bookworm-slim"

FROM node:${NODE_VER} AS build
WORKDIR /was-ui

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM scratch AS artifact
COPY --from=build /was-ui/out /was-ui/out
