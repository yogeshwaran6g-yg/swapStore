#!/bin/bash
set -e

echo "📦 Installing dependencies..."
pnpm i

echo "🔨 Building client..."
pnpm --filter client build

echo "🔄 Restarting PM2 processes..."
pm2 restart all

echo "✅ Deploy complete!"
