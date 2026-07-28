FROM node:24-alpine AS builder
WORKDIR /app
RUN apk add --no-cache python3 make g++
COPY package*.json ./
RUN --mount=type=cache,target=/root/.npm \
  npm install --no-audit --no-fund --network-timeout=600000
COPY . .
RUN npm run build

FROM node:24-alpine AS runner
WORKDIR /app
RUN apk add --no-cache libstdc++
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY package*.json ./
EXPOSE 3000
CMD ["node", "dist/main.js"]