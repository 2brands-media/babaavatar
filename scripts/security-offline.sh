#!/usr/bin/env bash
# Developed by 2Brands Media GmbH
set -euo pipefail
TASK_SECURITY_TMP=$(mktemp -d)
trap 'rm -rf "$TASK_SECURITY_TMP"' EXIT
export OSV_SCANNER_LOCAL_DB_CACHE_DIRECTORY="$TASK_SECURITY_TMP/db"
curl --fail --location --silent --show-error --max-time 120 https://github.com/google/osv-scanner/releases/download/v2.3.8/osv-scanner_linux_amd64 -o "$TASK_SECURITY_TMP/osv-scanner"
printf '%s  %s\n' bc98e15319ed0d515e3f9235287ba53cdc5535d576d24fd573978ecfe9ab92dc "$TASK_SECURITY_TMP/osv-scanner" | sha256sum --check --status
chmod 700 "$TASK_SECURITY_TMP/osv-scanner"
python3 scripts/refresh-security-database.py
TASK_SCAN_STATUS=0
"$TASK_SECURITY_TMP/osv-scanner" scan source --offline --no-resolve --format sarif --lockfile package-lock.json > "$TASK_SECURITY_TMP/report.sarif" || TASK_SCAN_STATUS=$?
OSV_SCAN_EXIT="$TASK_SCAN_STATUS" node scripts/check-osv-report.mjs "$TASK_SECURITY_TMP/report.sarif"
