#!/bin/sh
set -eu

log() { printf '%s %s\n' "$(date -u '+%Y-%m-%dT%H:%M:%SZ')" "$*"; }

: "${MAIN_DB_HOST:=main-db}"
: "${MAIN_DB_PORT:=5432}"
: "${MAIN_DB_USER:?MAIN_DB_USER is required}"
: "${MAIN_DB_PASSWORD:?MAIN_DB_PASSWORD is required}"
: "${MAIN_DB_NAME:?MAIN_DB_NAME is required}"
: "${RESTIC_REPOSITORY:?RESTIC_REPOSITORY is required}"
: "${RESTIC_PASSWORD:?RESTIC_PASSWORD is required}"

: "${MEDIA_PATHS:=/media/backend /media/website-public}"
: "${CONFIG_PATHS:=/config/app.env /config/website.env /config/letsencrypt}"
: "${BACKUP_TMP_DIR:=/tmp/rovno-backup}"

: "${KEEP_DAILY:=7}"
: "${KEEP_WEEKLY:=4}"
: "${KEEP_MONTHLY:=6}"
: "${KEEP_YEARLY:=1}"
: "${BACKUP_CHECK:=true}"
: "${CHECK_READ_DATA_SUBSET:=2%}"
: "${BACKUP_PRUNE:=true}"
: "${BACKUP_NOTIFY_SUCCESS:=false}"
: "${DB_WAIT_SECONDS:=300}"

export PGPASSWORD="$MAIN_DB_PASSWORD"
export PGHOST="$MAIN_DB_HOST"
export PGPORT="$MAIN_DB_PORT"
export PGUSER="$MAIN_DB_USER"
export PGDATABASE="$MAIN_DB_NAME"
export RESTIC_HOST="${RESTIC_HOST:-rovno-dev}"

STAGE=""

notify() {
  token="${BACKUP_ALERT_TELEGRAM_TOKEN:-}"
  chat="${BACKUP_ALERT_TELEGRAM_CHAT_ID:-}"
  [ -n "$token" ] || return 0
  [ -n "$chat" ] || return 0
  curl -fsS --max-time 10 \
    --data-urlencode "chat_id=$chat" \
    --data-urlencode "text=$1" \
    "https://api.telegram.org/bot${token}/sendMessage" >/dev/null || true
}

cleanup() {
  code=$?
  trap - EXIT
  if [ -n "$STAGE" ]; then
    rm -rf "$STAGE" || true
  fi
  if [ "$code" -ne 0 ]; then
    log "Backup FAILED (exit $code)"
    notify "Rovno.dev backup FAILED (exit $code). Check: docker compose -f backup/docker-compose.yml logs --tail=100 backup"
  fi
  exit "$code"
}
trap cleanup EXIT

# Overlapping runs would fight over the repository lock. Fail fast instead
# of leaving the second job hanging.
if command -v flock >/dev/null 2>&1; then
  exec 9>/run/rovno-backup.lock
  if ! flock -n 9; then
    log "Another backup is already running; skipping this run"
    exit 0
  fi
fi

if restic cat config >/dev/null 2>&1; then
  log "Repository ready: $RESTIC_REPOSITORY"
else
  log "Repository is not initialized or not readable; attempting init: $RESTIC_REPOSITORY"
  restic init
fi

STAGE="$BACKUP_TMP_DIR"
rm -rf "$STAGE"
mkdir -p "$STAGE"

waited=0
while ! pg_isready --quiet; do
  if [ "$waited" -ge "$DB_WAIT_SECONDS" ]; then
    log "Database $MAIN_DB_HOST:$MAIN_DB_PORT not ready after ${DB_WAIT_SECONDS}s"
    exit 1
  fi
  log "Waiting for database $MAIN_DB_HOST:$MAIN_DB_PORT"
  sleep 10
  waited=$((waited + 10))
done

log "Dumping database $MAIN_DB_NAME from $MAIN_DB_HOST:$MAIN_DB_PORT"
pg_dump --format=custom --compress=6 --no-password --file="$STAGE/main_db.dump"
pg_dumpall --globals-only --no-password --file="$STAGE/globals.sql"
chmod 600 "$STAGE/main_db.dump" "$STAGE/globals.sql"

log "Snapshotting database dump"
restic backup --host "$RESTIC_HOST" --tag db "$STAGE"

if [ -n "$MEDIA_PATHS" ]; then
  log "Snapshotting media: $MEDIA_PATHS"
  # Paths are intentionally word-split from MEDIA_PATHS.
  # shellcheck disable=SC2086
  restic backup --host "$RESTIC_HOST" --tag media \
    --exclude '**/.DS_Store' \
    --exclude '**/Thumbs.db' \
    --exclude '/media/website-public/order_files' \
    $MEDIA_PATHS
fi

if [ -n "$CONFIG_PATHS" ]; then
  log "Snapshotting config: $CONFIG_PATHS"
  # shellcheck disable=SC2086
  restic backup --host "$RESTIC_HOST" --tag config $CONFIG_PATHS
fi

log "Applying retention: daily=$KEEP_DAILY weekly=$KEEP_WEEKLY monthly=$KEEP_MONTHLY yearly=$KEEP_YEARLY"
if [ "$BACKUP_PRUNE" = "true" ]; then
  restic forget --host "$RESTIC_HOST" \
    --keep-daily "$KEEP_DAILY" \
    --keep-weekly "$KEEP_WEEKLY" \
    --keep-monthly "$KEEP_MONTHLY" \
    --keep-yearly "$KEEP_YEARLY" \
    --prune
else
  # Immutable buckets reject deletes; leave the data for a lifecycle rule.
  restic forget --host "$RESTIC_HOST" \
    --keep-daily "$KEEP_DAILY" \
    --keep-weekly "$KEEP_WEEKLY" \
    --keep-monthly "$KEEP_MONTHLY" \
    --keep-yearly "$KEEP_YEARLY"
fi

if [ "$BACKUP_CHECK" = "true" ]; then
  log "Checking repository integrity"
  if [ -n "$CHECK_READ_DATA_SUBSET" ]; then
    restic check --read-data-subset="$CHECK_READ_DATA_SUBSET"
  else
    restic check
  fi
fi

log "Backup complete"
if [ "$BACKUP_NOTIFY_SUCCESS" = "true" ]; then
  notify "Rovno.dev backup complete"
fi
