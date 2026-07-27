FROM node:24-alpine

WORKDIR /app

# Copy package files first for caching
COPY package*.json ./
RUN npm ci

# Copy source
COPY . .

# Build
RUN npm run build

EXPOSE 3000

CMD ["node", "dist/main.js"]