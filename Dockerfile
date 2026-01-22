# 1. Base image
FROM node:20-alpine AS base

# 2. Dependencies Stage: Install libraries
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install

# 3. Builder Stage: Build the app
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma Client (Critical for database access)
RUN npx prisma generate

# Build the Next.js application
RUN npm run build

# 4. Runner Stage: The actual running container
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

# Copy only the necessary files for the standalone build
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Open port 3000
EXPOSE 3000

# Start the server
CMD ["node", "server.js"]