FROM node:24-alpine AS builder
WORKDIR /app

RUN apk add --no-cache python3 make g++
COPY package*.json ./

# Install ALL packages (Nest CLI needs devDependencies to run compile hooks)
RUN --mount=type=cache,target=/root/.npm \
    npm ci --no-audit --no-fund

# Copy configuration files and source code
COPY nest-cli.json tsconfig.json ./
COPY src/ ./src/

# CRITICAL SECURITY STEP: Force clear legacy structures before compilation
RUN rm -rf dist *.tsbuildinfo

# Run NestJS Compiler (This will now successfully emit files to /app/dist)
RUN npm run build

# Strip devDependencies now that compilation is finished
RUN --mount=type=cache,target=/root/.npm \
    npm prune --omit=dev

# ==========================================
# FINAL MINIMAL PRODUCTION RUNNER
# ==========================================
FROM node:24-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN apk add --no-cache libstdc++

# Copy production assets with correct user ownership properties
COPY --from=builder --chown=node:node /app/node_modules ./node_modules
COPY --from=builder --chown=node:node /app/dist ./dist
COPY --from=builder --chown=node:node /app/src/db/migrations ./src/db/migrations
COPY --from=builder --chown=node:node /app/package*.json ./

USER node
EXPOSE 3000
CMD ["node", "dist/main.js"]
