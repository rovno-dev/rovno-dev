#!/bin/sh
set -eu

log() { printf '%s %s\n' "$(date -u '+%Y-%m-%dT%H:%M:%SZ')" "$*"; }

: "${BACKUP_HOUR:=3}"
: "${BACKUP_MINUTE:=15}"
: "${BACKUP_INTERVAL_SECONDS:=86400}"
: "${BACKUP_ON_START:=true}"
: "${BACKUP_RETRY_SECONDS:=900}"

SLEEP_PID=""

shutdown() {
  if [ -n "$SLEEP_PID" ]; then
    kill "$SLEEP_PID" 2>/dev/null || true
  fi
  exit 0
}
trap shutdown TERM INT

sleep_interruptible() {
  sleep "$1" &
  SLEEP_PID=$!
  wait "$SLEEP_PID" || true
  SLEEP_PID=""
}

run_backup() {
  attempt=1
  while [ "$attempt" -le 2 ]; do
    if /usr/local/bin/backup.sh; then
      log "Scheduled backup finished successfully"
      return 0
    fi
    log "Scheduled backup failed (attempt $attempt)"
    attempt=$((attempt + 1))
    if [ "$attempt" -le 2 ]; then
      log "Retrying in ${BACKUP_RETRY_SECONDS}s"
      sleep_interruptible "$BACKUP_RETRY_SECONDS"
    fi
  done
}

if [ "$BACKUP_ON_START" = "true" ]; then
  log "Running backup once on container start"
  run_backup
fi

while :; do
  if [ "$BACKUP_INTERVAL_SECONDS" != "86400" ]; then
    delay="$BACKUP_INTERVAL_SECONDS"
  else
    # Seconds since midnight UTC. The schedule is deliberately UTC so it
    # does not shift with daylight saving time. Strip leading zeroes so
    # values like "03" are not parsed as octal.
    now_sec=$(( $(date +%s) % 86400 ))
    hour=$(printf '%s' "$BACKUP_HOUR" | sed 's/^0*//')
    minute=$(printf '%s' "$BACKUP_MINUTE" | sed 's/^0*//')
    hour=${hour:-0}
    minute=${minute:-0}
    target=$(( hour * 3600 + minute * 60 ))
    delay=$(( target - now_sec ))
    if [ "$delay" -le 0 ]; then
      delay=$(( delay + 86400 ))
    fi
  fi

  log "Next backup in ${delay}s (schedule ${BACKUP_HOUR}:${BACKUP_MINUTE} UTC)"
  sleep_interruptible "$delay"

  run_backup
done
