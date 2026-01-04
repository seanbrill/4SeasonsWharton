#!/usr/bin/env bash
#
# Rollback script for Next.js static site deployment
# Restores a previous version from backup while preserving WordPress files
#

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print functions
error() { echo -e "${RED}ERROR: $*${NC}" >&2; }
success() { echo -e "${GREEN}✓ $*${NC}"; }
info() { echo -e "${BLUE}ℹ $*${NC}"; }
warn() { echo -e "${YELLOW}⚠ $*${NC}"; }

# Exit codes
EXIT_MISSING_ENV=1
EXIT_INVALID_VERSION=2
EXIT_VERSION_NOT_FOUND=3
EXIT_ROLLBACK_FAILED=4

#
# Step 1: Parse version parameter
#
VERSION="${1:-1}"

# Validate version parameter
if [[ ! "$VERSION" =~ ^[1-3]$ ]]; then
  error "Invalid version: $VERSION"
  error "Version must be 1, 2, or 3"
  exit $EXIT_INVALID_VERSION
fi

info "Rollback to version: $VERSION"

#
# Step 2: Load and validate environment variables
#
info "Loading environment variables from .env.local..."

if [[ ! -f .env.local ]]; then
  error ".env.local file not found"
  exit $EXIT_MISSING_ENV
fi

set -a
source .env.local
set +a

# Validate required variables
: "${GODADDY_USERNAME:?Missing GODADDY_USERNAME in .env.local}"
: "${GODADDY_HOST:?Missing GODADDY_HOST in .env.local}"
: "${GODADDY_WEBROOT:?Missing GODADDY_WEBROOT in .env.local}"
: "${GODADDY_PASSWORD:?Missing GODADDY_PASSWORD in .env.local}"

# Optional variables with defaults
GODADDY_PORT="${GODADDY_PORT:-22}"

success "Environment variables loaded"
info "  Host: ${GODADDY_USERNAME}@${GODADDY_HOST}:${GODADDY_PORT}"
info "  Webroot: ${GODADDY_WEBROOT}"

#
# Step 3: Check if rollback version exists
#
info "Checking if version $VERSION exists..."

CHECK_SCRIPT=$(mktemp)
cat > "$CHECK_SCRIPT" <<EOF
#!/bin/bash
WEBROOT="$GODADDY_WEBROOT"
ROLLBACK_DIR="\${WEBROOT%/html}/rollback"
VERSION_DIR="\${ROLLBACK_DIR}/version-$VERSION"

if [[ -d "\$VERSION_DIR" ]] && [[ -f "\$VERSION_DIR/index.html" ]]; then
  echo "EXISTS"
else
  echo "NOT_FOUND"
fi
EOF

CHECK_SCRIPT_PATH="/tmp/check_version_$$.sh"

# Upload check script
expect <<EXPECT_EOF
set timeout 30
log_user 0

spawn scp -P ${GODADDY_PORT} ${CHECK_SCRIPT} ${GODADDY_USERNAME}@${GODADDY_HOST}:${CHECK_SCRIPT_PATH}

expect {
  -re "(?i)are you sure you want to continue connecting.*\\?" {
    send "yes\r"
    exp_continue
  }
  -re "(?i)password:" {
    send -- "${GODADDY_PASSWORD}\r"
    exp_continue
  }
  eof
}
EXPECT_EOF

# Execute check script and capture output
VERSION_CHECK=$(expect <<EXPECT_EOF
set timeout 30
log_user 0

spawn ssh -p ${GODADDY_PORT} ${GODADDY_USERNAME}@${GODADDY_HOST} "chmod +x ${CHECK_SCRIPT_PATH} && ${CHECK_SCRIPT_PATH} && rm -f ${CHECK_SCRIPT_PATH}"

expect {
  -re "(?i)are you sure you want to continue connecting.*\\?" {
    send "yes\r"
    exp_continue
  }
  -re "(?i)password:" {
    send -- "${GODADDY_PASSWORD}\r"
    exp_continue
  }
  eof
}

expect eof
catch wait result
set output \$expect_out(buffer)
puts -nonewline \$output
EXPECT_EOF
)

rm -f "$CHECK_SCRIPT"

if [[ "$VERSION_CHECK" == *"NOT_FOUND"* ]]; then
  error "Version $VERSION not found on server"
  error "Available versions can be checked by SSHing to the server and running:"
  error "  ls -la ~/rollback/"
  exit $EXIT_VERSION_NOT_FOUND
fi

success "Version $VERSION found on server"

#
# Step 4: Perform rollback
#
info "Rolling back to version $VERSION..."

# Create rollback script
ROLLBACK_SCRIPT=$(mktemp)
cat > "$ROLLBACK_SCRIPT" <<'ROLLBACK_EOF'
#!/bin/bash
set -euo pipefail

WEBROOT="$1"
VERSION="$2"
ROLLBACK_DIR="${WEBROOT%/html}/rollback"
VERSION_DIR="${ROLLBACK_DIR}/version-${VERSION}"

echo "Starting rollback to version ${VERSION}..."

# Preserve WordPress directories
echo "Preserving WordPress directories..."
WP_TEMP="${WEBROOT}.__wp_backup"
mkdir -p "${WP_TEMP}"

for wp_dir in wp-admin wp-content wp-includes; do
  if [[ -d "${WEBROOT}/${wp_dir}" ]]; then
    echo "  Backing up ${wp_dir}..."
    mv "${WEBROOT}/${wp_dir}" "${WP_TEMP}/"
  fi
done

# Remove current static files
echo "Removing current static files..."
cd "${WEBROOT}"
find . -maxdepth 1 -type f -name "*.html" -delete 2>/dev/null || true
rm -rf _next assets images static favicon.ico robots.txt sitemap.xml 2>/dev/null || true

# Restore files from backup version
echo "Restoring files from version ${VERSION}..."
cp -r "${VERSION_DIR}"/* "${WEBROOT}/" 2>/dev/null || true

# Restore WordPress directories
echo "Restoring WordPress directories..."
for wp_dir in wp-admin wp-content wp-includes; do
  if [[ -d "${WP_TEMP}/${wp_dir}" ]]; then
    echo "  Restoring ${wp_dir}..."
    mv "${WP_TEMP}/${wp_dir}" "${WEBROOT}/"
  fi
done

# Cleanup
rmdir "${WP_TEMP}" 2>/dev/null || true

echo "✓ Rollback to version ${VERSION} completed successfully"
ROLLBACK_EOF

# Upload rollback script
ROLLBACK_SCRIPT_PATH="/tmp/rollback_script_$$.sh"

expect <<EOF
set timeout 30
log_user 0

spawn scp -P ${GODADDY_PORT} ${ROLLBACK_SCRIPT} ${GODADDY_USERNAME}@${GODADDY_HOST}:${ROLLBACK_SCRIPT_PATH}

expect {
  -re "(?i)are you sure you want to continue connecting.*\\?" {
    send "yes\r"
    exp_continue
  }
  -re "(?i)password:" {
    send -- "${GODADDY_PASSWORD}\r"
    exp_continue
  }
  eof
}

lassign [wait] pid spawnid os_error_flag exit_code
if {\$exit_code != 0} {
  puts "ERROR: Failed to upload rollback script"
  exit $EXIT_ROLLBACK_FAILED
}
EOF

if [[ $? -ne 0 ]]; then
  rm -f "$ROLLBACK_SCRIPT"
  error "Failed to upload rollback script"
  exit $EXIT_ROLLBACK_FAILED
fi

# Execute rollback script
expect <<EOF
set timeout 60
log_user 1

spawn ssh -p ${GODADDY_PORT} ${GODADDY_USERNAME}@${GODADDY_HOST} "chmod +x ${ROLLBACK_SCRIPT_PATH} && ${ROLLBACK_SCRIPT_PATH} ${GODADDY_WEBROOT} ${VERSION} && rm -f ${ROLLBACK_SCRIPT_PATH}"

expect {
  -re "(?i)are you sure you want to continue connecting.*\\?" {
    send "yes\r"
    exp_continue
  }
  -re "(?i)password:" {
    send -- "${GODADDY_PASSWORD}\r"
    exp_continue
  }
  eof
}

lassign [wait] pid spawnid os_error_flag exit_code
if {\$exit_code != 0} {
  puts "ERROR: Rollback failed"
  exit $EXIT_ROLLBACK_FAILED
}
EOF

rm -f "$ROLLBACK_SCRIPT"

if [[ $? -ne 0 ]]; then
  error "Rollback failed"
  exit $EXIT_ROLLBACK_FAILED
fi

success "Rollback completed successfully!"
info ""
info "Your site has been rolled back to version $VERSION"
info "WordPress admin should still be accessible at: https://${GODADDY_HOST}/wp-admin"
info ""
warn "Note: The current version has been lost. If you need to restore it,"
warn "you would need to redeploy from your local source."
info ""
