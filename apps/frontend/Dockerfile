#Base Image
FROM node:22-alpine AS base
WORKDIR /app

# Copy shared workspace files
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./

# Enable pnpm
RUN corepack enable

#Dependencies Layer
FROM base AS deps
COPY apps/frontend/package.json ./apps/frontend/
RUN pnpm install --frozen-lockfile --filter ./apps/frontend...

#Builder Layer
FROM deps AS build
COPY . .
WORKDIR /app/apps/frontend
EXPOSE 4200
CMD ["pnpm", "run", "start"]
