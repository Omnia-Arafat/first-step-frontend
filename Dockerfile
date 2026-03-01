# -------- Base image --------
FROM node:20-slim AS base

ENV NEXT_TELEMETRY_DISABLED 1

# Create app directory
WORKDIR /app

# -------- Dependencies --------
FROM base AS deps

# Install system dependencies required by Sharp
RUN apt-get update && apt-get install -y \
    python3 make g++ \
    libcairo2-dev libjpeg-dev libpango1.0-dev libgif-dev librsvg2-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci --legacy-peer-deps

# -------- Build --------
FROM base AS builder

# Copy deps
COPY --from=deps /app/node_modules ./node_modules

# Copy rest of app
COPY . .

# Set environment variables used at build time
ENV NEXT_PUBLIC_API_BASE_URL=https://back.firststep-app.com/api

ENV NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyCEvfzLs71gr1SNqVBl6y_1j7e20znB068
ENV NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=first-step-60186.firebaseapp.com
ENV NEXT_PUBLIC_FIREBASE_PROJECT_ID=first-step-60186
ENV NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=first-step-60186.firebasestorage.app
ENV NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=920460640742
ENV NEXT_PUBLIC_FIREBASE_APP_ID=1:920460640742:web:e29833fc1debf3e5fad627

ENV NEXT_PUBLIC_PUSHER_KEY=d96caeb137f6e3295d24
ENV NEXT_PUBLIC_PUSHER_CLUSTER=ap2



# Build Next.js app
RUN npm run build --force

# -------- Runner --------
FROM base AS runner

# Add a non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

WORKDIR /app

# Copy necessary files
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder /app/next.config.ts ./

# Use non-root user
USER nextjs

# Expose and run
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

CMD ["node", "server.js"]
