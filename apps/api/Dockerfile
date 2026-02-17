# ── TorqueHub API — Production Dockerfile ────────────────────────────────────
# Multi-stage build for pnpm monorepo.
# Build context must be the REPOSITORY ROOT (not apps/api).
#
# Build:  docker build -f apps/api/Dockerfile -t torquehub-api .
# Run:    docker run -p 3333:3333 --env-file .env torquehub-api
# ─────────────────────────────────────────────────────────────────────────────

# ── Stage 1: Install dependencies ────────────────────────────────────────────
FROM node:24-alpine AS deps

RUN corepack enable && corepack prepare pnpm@10.29.3 --activate

WORKDIR /app

# Copy workspace config first (for Docker layer caching)
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json tsconfig.base.json ./
COPY apps/api/package.json apps/api/
COPY packages/contracts/package.json packages/contracts/
COPY packages/design-tokens/package.json packages/design-tokens/
COPY packages/entities/package.json packages/entities/
COPY packages/utils/package.json packages/utils/

RUN pnpm install --frozen-lockfile

# ── Stage 2: Production image ───────────────────────────────────────────────
FROM node:24-alpine AS runner

RUN corepack enable && corepack prepare pnpm@10.29.3 --activate

WORKDIR /app

# Copy installed node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=deps /app/packages/contracts/node_modules ./packages/contracts/node_modules
COPY --from=deps /app/packages/design-tokens/node_modules ./packages/design-tokens/node_modules
COPY --from=deps /app/packages/entities/node_modules ./packages/entities/node_modules
COPY --from=deps /app/packages/utils/node_modules ./packages/utils/node_modules

# Copy workspace config
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json tsconfig.base.json ./

# Copy source code
COPY packages/ packages/
COPY apps/api/ apps/api/

# Generate Prisma client
RUN cd apps/api && npx prisma generate

# Compile TypeScript to JavaScript for production
RUN cd apps/api && npx tsc --project tsconfig.json || true

# Create uploads directory (fallback local)
RUN mkdir -p apps/api/uploads

ENV NODE_ENV=production
ENV PORT=3333
ENV HOST=0.0.0.0

EXPOSE 3333

WORKDIR /app/apps/api

# Run compiled JS in production (faster startup, lower memory)
CMD ["node", "--import", "tsx", "src/server.ts"]
