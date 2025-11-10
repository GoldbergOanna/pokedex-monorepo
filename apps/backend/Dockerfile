FROM node:22-alpine AS base
WORKDIR /app
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
RUN corepack enable

FROM base AS deps
COPY apps/backend/package.json ./apps/backend/
RUN pnpm install --frozen-lockfile --filter ./apps/backend...

FROM deps AS dev
WORKDIR /app/apps/backend
COPY . .
EXPOSE 3000
CMD ["pnpm", "run", "dev"]