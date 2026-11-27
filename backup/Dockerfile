FROM alpine:3.22

# postgresql15-client matches postgres:15-alpine in backend/docker-compose.yml.
# A newer pg_dump writes an archive the DB container's pg_restore cannot read.
RUN apk add --no-cache \
      ca-certificates \
      curl \
      postgresql15-client \
      restic \
      tzdata

COPY backup.sh restore.sh entrypoint.sh /usr/local/bin/
RUN chmod 0755 \
      /usr/local/bin/backup.sh \
      /usr/local/bin/restore.sh \
      /usr/local/bin/entrypoint.sh

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
