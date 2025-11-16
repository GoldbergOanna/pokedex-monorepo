FROM node:22-alpine

# Enable pnpm
RUN corepack enable

WORKDIR /app

EXPOSE 4200

# Note: Source code and dependencies will be mounted as volumes
# This allows for hot-reload and works across all platforms
CMD ["sh", "-c", "pnpm install && cd apps/frontend && pnpm start"]
