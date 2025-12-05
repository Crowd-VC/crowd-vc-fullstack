# ============================================
# Optimized Dockerfile for Next.js 15.5 + React 19
# Multi-stage build for minimal production image
# ============================================

# ============================================
# Stage 1: Base - Common dependencies
# ============================================
FROM node:20-alpine AS base

# Install libc6-compat for Alpine compatibility (required for some npm packages)
RUN apk add --no-cache libc6-compat

# Enable corepack and install pnpm
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@10.19.0 --activate

WORKDIR /app

# ============================================
# Stage 2: Dependencies - Install all deps
# ============================================
FROM base AS deps

# Copy lockfile and workspace configuration first for better layer caching
COPY pnpm-lock.yaml ./
COPY package.json pnpm-workspace.yaml turbo.json ./

# Copy workspace package.json files (maintains monorepo structure)
COPY apps/web/package.json ./apps/web/
COPY packages/abis/package.json ./packages/abis/

# Install dependencies with frozen lockfile
# Using mount cache for faster rebuilds
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile

# ============================================
# Stage 3: Builder - Build the application
# ============================================
FROM base AS builder

WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/web/node_modules ./apps/web/node_modules
COPY --from=deps /app/packages/abis/node_modules ./packages/abis/node_modules

# Copy source code
COPY . .

# Build-time environment variables
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Build using turbo for monorepo optimization
RUN pnpm turbo run build --filter=@crowd-vc/web

# ============================================
# Stage 4: Runner - Minimal production image
# ============================================
FROM node:20-alpine AS runner

WORKDIR /app

# Production environment
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user for security (Next.js convention)
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy public assets (static files served directly)
COPY --from=builder /app/apps/web/public ./public

# Create .next directory with correct ownership
# This is needed for Next.js runtime cache
RUN mkdir .next && chown nextjs:nodejs .next

# Copy standalone build output
# Next.js 15 standalone output includes all necessary dependencies
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./

# Copy static assets to the correct location for standalone mode
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static

# Switch to non-root user
USER nextjs

# Expose port (Next.js default)
EXPOSE 3000

# Runtime environment variables
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Health check for container orchestration
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

# Start the Next.js server
# Using node directly for standalone mode (no npm/pnpm overhead)
CMD ["node", "apps/web/server.js"]
