#!/usr/bin/env bash
# =========================================================
# CookMantra Zero-Downtime Production Deployment Script
# =========================================================

set -euo pipefail

echo "🚀 Starting CookMantra Automated Production Deployment..."

# 1. Validate Environment File
echo "🔍 Validating environment variables configuration..."
if [ ! -f .env ] && [ ! -f .env.production ]; then
    echo "⚠️ Warning: No .env or .env.production file found. Initializing from .env.example..."
    cp .env.example .env
fi

# 2. Build Docker Containers
echo "🏗️ Building production Docker images via Docker Compose..."
docker-compose -f docker-compose.yml build --parallel

# 3. Spin up infrastructure services
echo "⚡ Bootstrapping database & caching layer (MongoDB + Redis)..."
docker-compose -f docker-compose.yml up -d mongodb redis

# 4. Wait for MongoDB health readiness
echo "⏳ Verifying MongoDB health readiness..."
until docker-compose -f docker-compose.yml exec -T mongodb mongosh --eval "db.adminCommand('ping')" &>/dev/null; do
    echo "   Waiting for MongoDB container..."
    sleep 2
done
echo "✅ MongoDB container is online and healthy."

# 5. Launch Application Services
echo "🌐 Launching CookMantra Backend API and Frontend SPA..."
docker-compose -f docker-compose.yml up -d --remove-orphans

echo "========================================================="
echo "🎉 CookMantra Production Deployment Completed!"
echo "   Frontend UI:  http://localhost:8080"
echo "   Backend API:  http://localhost:3000/api/v1"
echo "   Health Check: http://localhost:3000/api/health/extended"
echo "========================================================="
