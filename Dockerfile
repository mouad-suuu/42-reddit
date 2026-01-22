# 1. Base image
FROM oven/bun:1 AS base

# 2. Dependencies Stage: Install libraries
FROM base AS deps
WORKDIR /app
COPY package.json bun.lock ./
# Copy prisma directory because "postinstall": "prisma generate" needs it
COPY prisma ./prisma
# Install dependencies including devDependencies
RUN bun install --frozen-lockfile

# 3. Builder Stage: Build the app
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Pass build-time variables
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ARG DATABASE_URL
ARG DIRECT_URL
ARG FORTYTWO_CLIENT_ID
ARG FORTYTWO_CLIENT_SECRET
ARG JWT_SECRET

ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY
ENV DATABASE_URL=$DATABASE_URL
ENV DIRECT_URL=$DIRECT_URL
ENV FORTYTWO_CLIENT_ID=$FORTYTWO_CLIENT_ID
ENV FORTYTWO_CLIENT_SECRET=$FORTYTWO_CLIENT_SECRET
ENV JWT_SECRET=$JWT_SECRET

# Generate Prisma Client (Just to be safe, though postinstall ran it)
RUN bunx prisma generate

# Build the Next.js application
RUN bun run build

# 4. Runner Stage: The actual running container
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV HOSTNAME="0.0.0.0"

# Copy only the necessary files for the standalone build
COPY --from=builder /app/public ./public
# Automatically leverages output traces to reduce image size
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Open port 3000
EXPOSE 3000

# Start the server using bun
CMD ["bun", "server.js"]