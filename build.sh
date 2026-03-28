#!/bin/bash
# build.sh - Executed by Render during the build phase
set -e  # Exit immediately if any command fails

echo "📦 Installing backend dependencies..."
npm install

echo "📦 Installing frontend dependencies..."
cd frontend
npm install

echo "🏗️ Building frontend (Vite)..."
npm run build

# Verify the output was created
if [ -f "dist/index.html" ]; then
  echo "✅ Build successful! frontend/dist/index.html exists."
  ls -la dist/
else
  echo "❌ BUILD FAILED: frontend/dist/index.html was not created!"
  ls -la . 2>/dev/null || echo "Could not list directory"
  exit 1
fi
