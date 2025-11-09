FROM node:22-alpine
WORKDIR /app
COPY ../../pnpm-lock.yaml ../../package.json ./
RUN corepack enable && pnpm install --filter backend
COPY . .
CMD ["pnpm", "run", "dev"]
EXPOSE 3000