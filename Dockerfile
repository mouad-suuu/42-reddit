# 1. Base image
FROM oven/bun:1 AS base

# 2. Dependencies Stage: Install libraries
FROM base AS deps
WORKDIR /app
COPY package.json bun.lock ./
# Install dependencies including devDependencies (needed for build)
RUN bun install --frozen-lockfile

# 3. Builder Stage: Build the app
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Pass build-time variables
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY

# Generate Prisma Client
RUN bunx prisma generate

# Build the Next.js application
RUN bun run build

# 4. Runner Stage: The actual running container
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

# Copy only the necessary files for the standalone build
COPY --from=builder /app/public ./public
# Automatically leverages output traces to reduce image size
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Open port 3000
EXPOSE 3000

# Start the server using bun
CMD ["bun", "server.js"]