#!/usr/bin/env bash
set -eo pipefail

# Configuration
BACKUP_DIR="./backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/db_backup_${TIMESTAMP}.sql.gz"
TEST_DB="db_restore_verify"

# Ensure backups directory exists
mkdir -p "${BACKUP_DIR}"

echo "Starting PostgreSQL database backup dump..."
if [ -z "${DATABASE_URL}" ]; then
    echo "ERROR: DATABASE_URL environment variable is not defined!"
    exit 1
fi

pg_dump "${DATABASE_URL}" | gzip > "${BACKUP_FILE}"
echo "Backup successfully dumped to: ${BACKUP_FILE}"

echo "Verifying backup integrity (running test restore)..."
if command -v createdb &> /dev/null; then
    if createdb "${TEST_DB}"; then
        if gunzip -c "${BACKUP_FILE}" | psql -d "${TEST_DB}" > /dev/null 2>&1; then
            echo "SUCCESS: Backup integrity check passed. DB restored cleanly."
            dropdb "${TEST_DB}"
        else
            echo "CRITICAL: Backup file is corrupted! Test restore failed."
            dropdb "${TEST_DB}"
            exit 1
        fi
    else
        echo "WARNING: Could not create temporary test DB. Skipping restore verification."
    fi
else
    echo "WARNING: postgres commands (createdb) not found in PATH. Skipping restore verification."
fi

echo "DevOps Backup Completed."
