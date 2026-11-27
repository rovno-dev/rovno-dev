# Backups

Production data is backed up daily to an S3-compatible bucket with
[restic](https://restic.net). Restic encrypts and deduplicates client-side, so
the bucket provider never sees plaintext and only changed blocks are uploaded
after the first run.

The backup stack lives in `backup/` and is intentionally a separate Compose
project. It does not start with the application stack, and a failed backup
cannot prevent the site from booting.

## What is backed up

| Snapshot tag | Contents | Why |
|---|---|---|
| `db` | `pg_dump -Fc` of `main_db` plus `pg_dumpall --globals-only` | Consistent database backup, not a copy of live Postgres files |
| `media` | `backend/services/main-service/storage` and `website/public` | Uploaded images/videos and non-git public assets |
| `config` | `.env`, `website/.env`, `letsencrypt/` | Secrets and certificates needed to rebuild the host |

`website/public/order_files` is a bind mount of
`backend/.../storage/order_files`, so it is excluded from the media snapshot to
avoid storing the same files twice. Restoring `backend/.../storage` restores
both paths.

Valkey is not backed up. It is a cache (`appendonly yes`, but fully
rebuildable); losing it only expires sessions and OTP codes. Add a `valkey-cli
--rdb` step if that ever becomes unacceptable.

`backup/.env` is also not backed up: it contains the restic password, and
including it would put the keys to the repository inside the repository.

## One-time setup

### 1. Create a private bucket

Use a dedicated bucket, not one shared with application uploads. Examples:

- AWS S3: `rovno-backups-<random>`
- Yandex Object Storage: `rovno-backups`
- Cloudflare R2: `rovno-backups`
- Backblaze B2: `rovno-backups`

Enable, at minimum:

- **Block all public access.**
- **Default encryption** (SSE-S3, SSE-KMS, or the provider equivalent).
- **Versioning** so an accidental or malicious delete can be recovered.
- **Lifecycle rule** to expire non-current versions after 30–90 days and abort
  incomplete multipart uploads after 7 days.

Optional: **Object Lock / immutability**. Restic's `prune` must delete old
pack files, so a lock that blocks deletes makes `forget --prune` fail. If you
want immutability, enable Object Lock and set `BACKUP_PRUNE=false` in
`backup/.env`; retention then only removes snapshots and a lifecycle rule
expires the old data. For most setups, versioning + lifecycle is the simpler
choice and keeps prunes working. Check the storage cost before enabling.

### 2. Create a bucket-scoped credential

Do not reuse the application's cloud keys. The backup user only needs access to
this one bucket.

Minimal AWS IAM policy (adapt the resource name):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:ListBucket", "s3:GetBucketLocation"],
      "Resource": "arn:aws:s3:::rovno-backups-<random>"
    },
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject",
        "s3:AbortMultipartUpload",
        "s3:ListBucketMultipartUploads",
        "s3:ListMultipartUploadParts"
      ],
      "Resource": "arn:aws:s3:::rovno-backups-<random>/*"
    }
  ]
}
```

If the bucket uses SSE-KMS instead of SSE-S3, also allow
`kms:GenerateDataKey` and `kms:Decrypt` on the bucket's key.

Restic needs `DeleteObject` because `forget --prune` removes old packs. For an
append-only bucket, enable Object Lock, set `BACKUP_PRUNE=false`, and use a
lifecycle rule to expire old data.

### 3. Generate the encryption password

Run this once, save the output in a password manager **and** an offline vault:

```bash
openssl rand -base64 48
```

Losing this password makes every backup unrecoverable. Do not store the only
copy on the production server.

### 4. Configure the backup stack

```bash
cp backup/.env.example backup/.env
chmod 600 backup/.env
```

Edit `backup/.env`:

```dotenv
RESTIC_REPOSITORY=s3:https://storage.yandexcloud.net/rovno-backups
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_DEFAULT_REGION=ru-central1
RESTIC_PASSWORD=<the generated password>
```

The repository URL format is `s3:<endpoint>/<bucket>`. Leave the endpoint out
for AWS (`s3:s3.amazonaws.com/<bucket>`). For R2 use
`AWS_DEFAULT_REGION=auto`.

Useful defaults:

- `BACKUP_ON_START=true` — take a backup immediately when the container starts.
- `BACKUP_HOUR=3`, `BACKUP_MINUTE=15` — daily at 03:15 UTC.
- `KEEP_DAILY=7`, `KEEP_WEEKLY=4`, `KEEP_MONTHLY=6`, `KEEP_YEARLY=1`.
- `BACKUP_PRUNE=true` — set to `false` for immutable/Object Lock buckets.
- `BACKUP_CHECK=true`, `CHECK_READ_DATA_SUBSET=2%` — verify a sample of the
  repository after every run.
- `BACKUP_ALERT_TELEGRAM_TOKEN` / `BACKUP_ALERT_TELEGRAM_CHAT_ID` — optional
  failure alerts.

`MEDIA_PATHS` and `CONFIG_PATHS` normally stay as they are. Paths are
container paths and are word-split, so they must not contain spaces.

### 5. Start it

The production stack must be up first: the backup container joins its
`main-network`.

```bash
docker compose up -d
docker compose -f backup/docker-compose.yml up -d --build
```

Check the first run:

```bash
docker compose -f backup/docker-compose.yml logs -f backup
```

You should see `Repository is not initialized or not readable; attempting init`,
three snapshots (`db`, `media`, `config`), then `Backup complete`. Confirm from
the host:

```bash
docker compose -f backup/docker-compose.yml exec backup \
  /usr/local/bin/restore.sh list
```

The service has `restart: unless-stopped`, so it comes back after a reboot as
long as Docker is enabled.

## Scheduling and retention

The container runs `backup.sh` once on start (if `BACKUP_ON_START=true`) and
then every day at `BACKUP_HOUR:BACKUP_MINUTE` UTC. Set
`BACKUP_INTERVAL_SECONDS` to a value other than `86400` to use a fixed interval
instead (for example `21600` for every six hours).

On a cold start the script waits up to `DB_WAIT_SECONDS` (default 300) for
Postgres. A failed run is retried once after `BACKUP_RETRY_SECONDS` (default
900); after that the next daily run tries again.

Retention is applied per group (host + paths), so each of the `db`, `media`,
and `config` snapshot groups keeps its own daily/weekly/monthly/yearly set.
`restic prune` then removes unreferenced data. The optional integrity check
runs after retention.

Manual run (useful after a migration or before risky maintenance):

```bash
docker compose -f backup/docker-compose.yml exec backup \
  /usr/local/bin/backup.sh
```

## Safety checklist

- [ ] Bucket is private, encrypted, versioned, and has a lifecycle rule.
- [ ] Credentials are dedicated to this bucket; no application keys are reused.
- [ ] `backup/.env` is `chmod 600` and never committed (it is git-ignored).
- [ ] The restic password exists in a password manager and an offline vault.
- [ ] A failure alert is configured (Telegram or an external log monitor).
- [ ] A restore has been tested into a scratch database and directory.
- [ ] The host has enough free disk for the temporary `pg_dump` file
      (`docker system df`, `df -h`).
- [ ] Backups are monitored: a container that is "running" is not proof that
      the last backup succeeded.

Defense in depth: the restic password and S3 keys live on the production host
because scheduled backups need them. If the host is fully compromised, an
attacker can read them and delete the repository. Bucket versioning, Object
Lock, and a separate cloud account are what make that deletion recoverable.
For stronger isolation, run the backup from a different host with its own
credentials and pull from the production database/media over a private
network.

## Restore

Always restore into a scratch location first. `restore.sh` never writes into
the live application paths.

### List snapshots

```bash
docker compose -f backup/docker-compose.yml exec backup \
  /usr/local/bin/restore.sh list
```

Snapshots are tagged `db`, `media`, and `config`. `latest` means the latest
snapshot in that tag.

### Restore the database

Extract the dump to a host directory:

```bash
mkdir -p /tmp/rovno-restore
docker compose -f backup/docker-compose.yml run --rm \
  -v /tmp/rovno-restore:/restore \
  --entrypoint /usr/local/bin/restore.sh \
  backup db latest /restore
```

The files are created as root with mode `600`; use `sudo` for the next steps.

Verify the dump in a throwaway database before touching production:

```bash
sudo chmod 644 /tmp/rovno-restore/main_db.dump

docker compose exec -T main-db createdb -U root main_db_restore_check
docker compose exec -T main-db pg_restore -U root -d main_db_restore_check \
  --no-owner < /tmp/rovno-restore/main_db.dump
docker compose exec -T main-db psql -U root -d main_db_restore_check -c '\dt'
```

Then cut over. Take a fresh on-disk dump of the current database first, stop
the writers, and restore:

```bash
docker compose exec -T main-db pg_dump -U root -Fc main_db > /tmp/pre-restore.dump

docker compose stop main-service tg-bot
docker compose exec -T main-db dropdb -U root --force main_db
docker compose exec -T main-db createdb -U root -O root main_db
docker compose exec -T main-db pg_restore -U root -d main_db \
  --no-owner < /tmp/rovno-restore/main_db.dump
docker compose start main-service tg-bot
```

`globals.sql` contains roles and password hashes. Apply it only on a fresh
cluster, before restoring the database:

```bash
docker compose exec -T main-db psql -U root -d postgres \
  < /tmp/rovno-restore/globals.sql
```

### Restore media

```bash
mkdir -p /tmp/rovno-restore
docker compose -f backup/docker-compose.yml run --rm \
  -v /tmp/rovno-restore:/restore \
  --entrypoint /usr/local/bin/restore.sh \
  backup media latest /restore
```

The result is under `/tmp/rovno-restore/media/backend` and
`/tmp/rovno-restore/media/website-public`.

Merge it back (keeps files created after the snapshot):

```bash
sudo rsync -a /tmp/rovno-restore/media/backend/ \
  backend/services/main-service/storage/
sudo rsync -a /tmp/rovno-restore/media/website-public/ \
  website/public/
```

Use `rsync -a --delete` only when you intend an exact rollback to the snapshot
state; it deletes files created after the backup.

### Restore config

```bash
mkdir -p /tmp/rovno-restore
docker compose -f backup/docker-compose.yml run --rm \
  -v /tmp/rovno-restore:/restore \
  --entrypoint /usr/local/bin/restore.sh \
  backup config latest /restore
```

Files land under `/tmp/rovno-restore/config/`:

```bash
sudo cp /tmp/rovno-restore/config/app.env .env
sudo cp /tmp/rovno-restore/config/website.env website/.env
sudo cp -a /tmp/rovno-restore/config/letsencrypt/. letsencrypt/
sudo chmod 600 .env website/.env
```

### Full disaster recovery

1. Install Docker and clone the repository on the new host.
2. Create the paths that the backup container bind-mounts. Without this,
   Docker creates missing file mounts as directories, and the config restore
   cannot replace them:

   ```bash
   touch .env website/.env
   mkdir -p letsencrypt
   ```

3. Recreate `backup/.env` with the same `RESTIC_REPOSITORY` and
   `RESTIC_PASSWORD`.
4. Recreate the external network: `docker network create main-network`.
5. Build the backup image and restore the `config` snapshot to
   `/tmp/rovno-restore`:

   ```bash
   docker compose -f backup/docker-compose.yml build
   mkdir -p /tmp/rovno-restore
   docker compose -f backup/docker-compose.yml run --rm \
     -v /tmp/rovno-restore:/restore \
     --entrypoint /usr/local/bin/restore.sh \
     backup config latest /restore
   ```

6. Copy the restored config into place:

   ```bash
   sudo cp /tmp/rovno-restore/config/app.env .env
   sudo cp /tmp/rovno-restore/config/website.env website/.env
   sudo cp -a /tmp/rovno-restore/config/letsencrypt/. letsencrypt/
   sudo chmod 600 .env website/.env
   ```

7. Restore the `media` snapshot and rsync it into the repository paths:

   ```bash
   docker compose -f backup/docker-compose.yml run --rm \
     -v /tmp/rovno-restore:/restore \
     --entrypoint /usr/local/bin/restore.sh \
     backup media latest /restore

   sudo rsync -a /tmp/rovno-restore/media/backend/ \
     backend/services/main-service/storage/
   sudo rsync -a /tmp/rovno-restore/media/website-public/ \
     website/public/
   ```

8. Start only the database:

   ```bash
   docker compose up -d main-db
   ```

9. Restore the `db` snapshot into `main_db` (the container creates the empty
   database from `MAIN_DB_*` on first boot):

   ```bash
   docker compose -f backup/docker-compose.yml run --rm \
     -v /tmp/rovno-restore:/restore \
     --entrypoint /usr/local/bin/restore.sh \
     backup db latest /restore

   docker compose exec -T main-db pg_restore -U root -d main_db \
     --no-owner < /tmp/rovno-restore/main_db.dump
   ```

10. Start everything: `docker compose up -d`.
11. Start backups: `docker compose -f backup/docker-compose.yml up -d`.
12. Run the smoke checks in `docs/TESTING.md` and verify an uploaded order
    image opens.

## Operations

**Change schedule or retention:** edit `backup/.env`, then

```bash
docker compose -f backup/docker-compose.yml up -d
```

**Update the backup image/scripts:**

```bash
git pull
docker compose -f backup/docker-compose.yml up -d --build
```

If `backend/docker-compose.yml` upgrades `postgres:15-alpine`, change the
matching `postgresql15-client` package in `backup/Dockerfile` and rebuild.
Using an older `pg_dump` than the server is unsupported; using a newer
`pg_dump` writes an archive the database container's `pg_restore` may not
read.

**Rotate S3 keys:** create a new key, update `backup/.env`, run
`up -d` (env changes require recreating the container), confirm the next
backup, then disable the old key.

**Rotate the restic password:**

```bash
docker compose -f backup/docker-compose.yml exec backup restic key add
docker compose -f backup/docker-compose.yml exec backup restic key remove <old-key-id>
```

Update `backup/.env` immediately and keep the old password until the new one is
verified in a restore.

**Stop the backup stack before tearing down production.** The backup container
is attached to `main-network`, so:

```bash
docker compose -f backup/docker-compose.yml down
docker compose down
```

Bring them back in the opposite order.

## Troubleshooting

| Symptom | Check |
|---|---|
| `Repository is not initialized or not readable` then an auth error | `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, region, bucket name, and bucket policy |
| `Fatal: unable to open config file` | Wrong `RESTIC_REPOSITORY` URL or the restic password is wrong |
| `pg_dump: error: connection ... failed` | `main-db` is not running/healthy, or `MAIN_DB_*` values changed |
| Backup exits with a permission error on media | Host files are not readable by root; check ownership under `backend/.../storage` and `website/public` |
| `Another backup is already running` | A previous run is still in progress; wait for it or check `docker compose ... ps` |
| Container is up but no recent snapshots | Read the logs. A silent failure is what alerts are for. |

Check disk use and repository size:

```bash
docker compose -f backup/docker-compose.yml exec backup restic stats
docker compose -f backup/docker-compose.yml exec backup restic snapshots
```
