#!/bin/bash

# Build WebSocket handlers for AWS SAM deployment
# This script installs dependencies for TypeScript handlers with AWS SDK v3

set -e

echo "Building WebSocket handlers for AWS SAM deployment..."

# Navigate to websocket-handlers directory
cd websocket-handlers/

# Install dependencies
if [ ! -f "package.json" ]; then
  echo "❌ package.json not found in websocket-handlers directory"
  exit 1
fi

echo "Installing dependencies..."
pnpm install

echo "Building TypeScript handlers..."
pnpm run build

cd ..

echo "✅ WebSocket handlers built successfully!"
echo "📁 Dependencies installed in websocket-handlers/"
echo "📝 SAM will compile TypeScript files automatically during build"