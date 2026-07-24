#!/usr/bin/env bash
# Backup di database e foto per 3DPrintSW.
# Uso: ./scripts/backup.sh
# Consigliato in cron: 0 3 * * * /percorso/3dprintSW/scripts/backup.sh

set -euo pipefail

APP_DIR="${APP_DIR:-$(cd "$(dirname "$0")/.." && pwd)}"
BACKUP_DIR="${BACKUP_DIR:-$APP_DIR/backups}"
KEEP_DAYS="${KEEP_DAYS:-14}"
STAMP="$(date +%Y%m%d-%H%M%S)"
ARCHIVE="$BACKUP_DIR/3dprintsw-$STAMP.tar.gz"

mkdir -p "$BACKUP_DIR"

tar -czf "$ARCHIVE" \
  -C "$APP_DIR" \
  dev.db \
  public/uploads \
  2>/dev/null || tar -czf "$ARCHIVE" -C "$APP_DIR" dev.db

find "$BACKUP_DIR" -name '3dprintsw-*.tar.gz' -mtime +"$KEEP_DAYS" -delete

echo "Backup creato: $ARCHIVE"
