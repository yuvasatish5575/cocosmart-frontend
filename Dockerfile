FROM node:22-bookworm-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
# Baked into the static bundle at build time — the browser calls this URL
# directly, so it must be reachable from the *client's* machine, not just
# from inside the Docker network (docker-compose.yml defaults it to
# http://localhost:4000/api to match the backend's published port).
ARG VITE_API_URL=http://localhost:4000/api
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

FROM nginx:1.27-alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
