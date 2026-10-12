# Base stage with pnpm
FROM node:24-alpine AS base
WORKDIR /app

# Install pnpm (pinned to match CI; newer majors ignore the package.json "pnpm" field)
RUN npm install -g pnpm@9

# Dependencies stage
FROM base AS deps

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies (ignore prepare script as it requires git)
RUN pnpm install --frozen-lockfile --ignore-scripts

# Development stage
FROM base AS development

# Copy dependencies
COPY --from=deps /app/node_modules ./node_modules
COPY package.json pnpm-lock.yaml ./

# Copy source code
COPY . .

# Expose port
EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Run development server
CMD ["pnpm", "dev"]

# Build stage
FROM base AS build

# Copy dependencies
COPY --from=deps /app/node_modules ./node_modules
COPY package.json pnpm-lock.yaml ./

# Copy source code
COPY . .

# Accept build arguments for environment variables
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# Build application
RUN pnpm build

# Runtime stage
FROM base AS production

# Create non-root user
RUN addgroup -S nodejs && adduser -S nextjs -G nodejs

# Copy built assets from build stage
COPY --from=build --chown=nextjs:nodejs /app/.next ./.next
COPY --from=build --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=build --chown=nextjs:nodejs /app/package.json ./package.json

# Fix: Set ownership of /app directory to allow Next.js to write generated files
# Next.js production mode writes: next-env.d.ts, tsconfig.tsbuildinfo, cache files
RUN chown nextjs:nodejs /app

USER nextjs

# Expose port
EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Health check (check if Next.js server is responding)
HEALTHCHECK --interval=10s --timeout=5s --start-period=30s --retries=5 \
  CMD node -e "require('http').get('http://localhost:3000', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})" || exit 1

# Run application
CMD ["pnpm", "start"]
