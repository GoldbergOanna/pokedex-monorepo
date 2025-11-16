FROM node:22-alpine

WORKDIR /app

# Enable pnpm
RUN corepack enable

# Copy workspace config files
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./

# Copy shared types package
COPY libs ./libs

# Copy frontend package.json
COPY apps/frontend/package.json ./apps/frontend/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy frontend source
COPY apps/frontend ./apps/frontend

WORKDIR /app/apps/frontend

EXPOSE 4200

CMD ["pnpm", "run", "start"]
