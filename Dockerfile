# =========================================================
# Multi-stage Fullstack Dockerfile for CookMantra Application
# =========================================================

# Stage 1: Builder stage
FROM node:22-alpine AS builder

WORKDIR /app

# Copy dependency manifests
COPY package.json package-lock.json* bun.lock* ./

# Install dependencies including devDependencies for build
RUN npm ci || npm install

# Copy application source code
COPY . .

# Set production environment for building static assets & backend
ENV NODE_ENV=production

# Build Vite frontend static assets and ESBuild backend server bundle
RUN npm run build

# Stage 2: Production runner stage
FROM node:22-alpine AS runner

WORKDIR /app

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Copy package manifests and install production dependencies only
COPY package.json package-lock.json* ./
RUN npm ci --only=production || npm install --omit=dev

# Copy compiled build output from builder
COPY --from=builder /app/dist ./dist

# Create non-root user for security compliance
RUN addgroup -S cookmantra && adduser -S cookmantra -G cookmantra \
    && chown -R cookmantra:cookmantra /app

USER cookmantra

EXPOSE 3000

# Container healthcheck endpoint
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:3000/api/health || exit 1

CMD ["node", "dist/server.cjs"]
