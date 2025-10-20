# syntax=docker/dockerfile:1

FROM node:20-alpine

WORKDIR /app

# Install pnpm globally and dependencies
RUN corepack enable && apk add --no-cache libc6-compat

# Copy package files and per-app lockfile
COPY frontend/package.json ./package.json
COPY frontend/pnpm-lock.yaml ./pnpm-lock.yaml

# Ensure MSW can sync worker during install by having public present
COPY frontend/public ./public

# Install dependencies with correct architecture
RUN pnpm install --frozen-lockfile --prod=false

# Copy source code only (avoid copying node_modules)
COPY frontend/src ./src
COPY frontend/*.json frontend/*.js frontend/*.mjs frontend/*.ts frontend/*.md ./

# Expose ports for development and Storybook
EXPOSE 3000 6006

# Start development server
CMD ["pnpm", "dev"]
