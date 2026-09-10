# Stage 1: Build Vite React application
FROM node:20-alpine AS builder
WORKDIR /app
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
# The Vite alias `@shared → ../backend/src/shared` requires the shared source
# tree to be accessible from the container's WORKDIR parent.
COPY backend/src/shared/ /backend/src/shared/
# Demo auth is an EXPLICIT build-time opt-in for the local SIH demo stack: when
# compose passes `--build-arg VITE_DEMO_AUTH_ENABLED=true`, Vite inlines the flag
# so the SPA enables demo login and sends `Bearer demo-*` tokens. Omit it (or pass
# any non-"true" value) for a normal deployment — demo auth stays OFF.
ARG VITE_DEMO_AUTH_ENABLED
ENV VITE_DEMO_AUTH_ENABLED=$VITE_DEMO_AUTH_ENABLED
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
