#!/usr/bin/env bash
# =========================================================
# CookMantra Production Server Startup Script
# =========================================================

set -euo pipefail

export NODE_ENV=production

echo "🟢 Launching CookMantra Production Application Server..."

# Run database schema migrations if available
if [ -f "dist/server/migrations/runner.js" ]; then
  echo "⚙️ Executing pending MongoDB database migrations..."
  node dist/server/migrations/runner.js || true
fi

# Execute Node bundled CJS server
exec node dist/server.cjs
