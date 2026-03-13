FROM node:24-alpine AS base
RUN corepack enable && corepack prepare pnpm@10.30.3 --activate

# Build stage
FROM base AS build
WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN apk add --no-cache python3 make g++ && \
    pnpm install --frozen-lockfile

COPY . .
RUN pnpm build

# Export the Alpine-compiled better-sqlite3 to a known path
RUN node -e "\
  const path = require('path'), fs = require('fs');\
  let d = path.dirname(require.resolve('better-sqlite3'));\
  while (!fs.existsSync(path.join(d, 'package.json'))) d = path.dirname(d);\
  fs.cpSync(d, '/tmp/better-sqlite3', { recursive: true, dereference: true });\
"

# Production stage
FROM node:24-alpine AS production
WORKDIR /app

COPY --from=build /app/.output ./
COPY --from=build /app/server/database/migrations ./server/database/migrations

# Use the Alpine-compiled better-sqlite3 from the build stage (Nitro only copies runtime JS, not the native binary)
COPY --from=build /tmp/better-sqlite3 /app/server/node_modules/better-sqlite3/

VOLUME ["/app/data"]
EXPOSE 3000

ENV NODE_ENV=production
ENV TILLER_DB_PATH=/app/data/tiller.db
ENV NUXT_HOST=0.0.0.0
ENV NUXT_PORT=3000

CMD ["node", "/app/server/index.mjs"]
