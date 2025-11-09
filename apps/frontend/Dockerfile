FROM node:22-alpine
WORKDIR /app
COPY ../../pnpm-lock.yaml ../../package.json ./
RUN corepack enable && pnpm install --filter frontend
COPY . .
CMD ["pnpm", "run", "start"]
EXPOSE 4200
