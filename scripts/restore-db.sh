#!/usr/bin/env bash
# =========================================================
# CookMantra MongoDB Restoration Script
# =========================================================

set -euo pipefail

if [ -z "${1:-}" ]; then
  echo "Usage: ./scripts/restore-db.sh <path-to-backup-directory>"
  echo "Example: ./scripts/restore-db.sh ./backups/cookmantra_backup_20260805_120000"
  exit 1
fi

BACKUP_TARGET="$1"
MONGODB_URI="${MONGODB_URI:-mongodb://127.0.0.1:27017/cookmantra}"

if [ ! -d "${BACKUP_TARGET}" ]; then
  echo "❌ Error: Backup target directory '${BACKUP_TARGET}' does not exist."
  exit 1
fi

echo "🔄 Restoring CookMantra MongoDB database from '${BACKUP_TARGET}'..."

if command -v mongorestore &> /dev/null; then
    mongorestore --uri="${MONGODB_URI}" "${BACKUP_TARGET}" --gzip --drop
    echo "✅ Database restored successfully!"
else
    echo "❌ Error: 'mongorestore' utility is required for database restoration."
    exit 1
fi
