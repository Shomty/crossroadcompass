#!/usr/bin/env bash
# Backup SQLite DB before running prisma migrate (or other schema changes).
# Usage: ./scripts/backup-sqlite.sh [path-to.db]
# Default: resolves DATABASE_URL from .env.local / .env, else prisma/dev.db

set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

DB_PATH="${1:-}"
if [[ -z "$DB_PATH" ]]; then
  DB_URL=""
  for f in .env.local .env; do
    if [[ -f "$f" ]] && grep -q '^DATABASE_URL=' "$f"; then
      DB_URL=$(grep '^DATABASE_URL=' "$f" | head -1 | cut -d= -f2- | tr -d '\r' | sed 's/^["'\'']//;s/["'\'']$//')
      break
    fi
  done
  case "${DB_URL:-}" in
    file:*)
      DB_PATH="${DB_URL#file:}"
      ;;
    *)
      DB_PATH="prisma/dev.db"
      ;;
  esac
fi

if [[ "$DB_PATH" != /* ]]; then
  DB_PATH="$ROOT/$DB_PATH"
fi

if [[ ! -f "$DB_PATH" ]]; then
  echo "No database file at $DB_PATH — nothing to back up."
  exit 0
fi

BACKUP_DIR="$ROOT/prisma/backups"
mkdir -p "$BACKUP_DIR"
STAMP=$(date +%Y%m%d-%H%M%S)
DEST="$BACKUP_DIR/dev-${STAMP}.db"

if command -v sqlite3 >/dev/null 2>&1; then
  sqlite3 "$DB_PATH" ".backup '$DEST'"
else
  cp "$DB_PATH" "$DEST"
fi

echo "SQLite backup written to: $DEST"
