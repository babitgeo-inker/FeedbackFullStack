#!/bin/sh

# Startup script for Render deployment with error handling

echo "🚀 Starting WhatsApp Feedback Collection System..."

# Check if Prisma client is generated
if [ ! -d "./generated/prisma" ]; then
  echo "⚠️  Prisma client not found, generating..."
  npx prisma generate
fi

# Run database migrations if in production
if [ "$NODE_ENV" = "production" ]; then
  echo "🗄️  Running database migrations..."
  npx prisma migrate deploy || echo "⚠️  Migration failed or no migrations to run"
fi

# Check if public directory exists (frontend build)
if [ ! -d "./public" ]; then
  echo "⚠️  Frontend build not found in public directory"
  mkdir -p ./public
  echo '{"error": "Frontend not built"}' > ./public/index.html
fi

# Start the application
echo "✅ Starting Node.js server..."
exec node server.js