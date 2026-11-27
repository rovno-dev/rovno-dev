#!/bin/sh
set -eu

# Restore helper. It never writes into the live application directories: it
# extracts into a target directory so an operator can inspect the result
# before copying anything into production.
#
#   restore.sh list
#   restore.sh db     [snapshot] [target]
#   restore.sh media  [snapshot] [target]
#   restore.sh config [snapshot] [target]
#
# snapshot defaults to "latest" within the requested tag.
# target defaults to /restore.

log() { printf '%s %s\n' "$(date -u '+%Y-%m-%dT%H:%M:%SZ')" "$*" >&2; }

: "${RESTIC_REPOSITORY:?RESTIC_REPOSITORY is required}"
: "${RESTIC_PASSWORD:?RESTIC_PASSWORD is required}"

export RESTIC_HOST="${RESTIC_HOST:-rovno-dev}"
: "${BACKUP_TMP_DIR:=/tmp/rovno-backup}"

umask 077
tmp_db=""
tmp_globals=""
cleanup() {
  [ -n "$tmp_db" ] && rm -f "$tmp_db" || true
  [ -n "$tmp_globals" ] && rm -f "$tmp_globals" || true
}
trap cleanup EXIT

cmd="${1:-}"
case "$cmd" in
  list)
    restic snapshots --host "$RESTIC_HOST"
    ;;
  db|media|config)
    snapshot="${2:-latest}"
    target="${3:-/restore}"
    mkdir -p "$target"

    case "$cmd" in
      db)
        log "Extracting database dump ($snapshot) into $target"
        tmp_db="$target/.main_db.dump.$$"
        tmp_globals="$target/.globals.sql.$$"
        restic dump --host "$RESTIC_HOST" --tag db "$snapshot" \
          "$BACKUP_TMP_DIR/main_db.dump" > "$tmp_db"
        restic dump --host "$RESTIC_HOST" --tag db "$snapshot" \
          "$BACKUP_TMP_DIR/globals.sql" > "$tmp_globals"
        chmod 600 "$tmp_db" "$tmp_globals"
        mv "$tmp_db" "$target/main_db.dump"
        mv "$tmp_globals" "$target/globals.sql"
        tmp_db=""
        tmp_globals=""
        log "Done: $target/main_db.dump and $target/globals.sql"
        ;;
      media)
        log "Restoring media ($snapshot) into $target"
        restic restore --host "$RESTIC_HOST" --tag media "$snapshot" \
          --target "$target"
        log "Done: $target/media/backend and $target/media/website-public"
        ;;
      config)
        log "Restoring config ($snapshot) into $target"
        restic restore --host "$RESTIC_HOST" --tag config "$snapshot" \
          --target "$target"
        log "Done: $target/config"
        ;;
    esac
    ;;
  *)
    echo "Usage: $0 {list|db|media|config} [snapshot] [target]" >&2
    exit 2
    ;;
esac
