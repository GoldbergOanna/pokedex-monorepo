FROM node:22-alpine

# Enable pnpm
RUN corepack enable

WORKDIR /app

EXPOSE 3000

# Note: Source code and dependencies will be mounted as volumes
# This allows for hot-reload and works across all platforms
# Auto-initialize database on first run, then start dev server
CMD ["sh", "-c", "pnpm install && cd apps/backend && pnpm run init-db && pnpm run dev"]
