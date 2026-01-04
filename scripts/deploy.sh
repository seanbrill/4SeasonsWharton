#!/usr/bin/env bash
#
# Robust deployment script for Next.js static site to GoDaddy Managed WordPress
# Handles staging, WordPress preservation, html/html nesting detection, and atomic deploys
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
EXIT_BUILD_FAILED=2
EXIT_NO_OUT_DIR=3
EXIT_UPLOAD_FAILED=4
EXIT_DEPLOY_FAILED=5

#
# Step 1: Load and validate environment variables
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
# Step 2: Build the Next.js site
#
info "Building Next.js site..."

if ! npm run build; then
  error "Build failed"
  exit $EXIT_BUILD_FAILED
fi

success "Build completed"

#
# Step 3: Verify out/ directory exists
#
if [[ ! -d "out" ]]; then
  error "out/ directory not found after build"
  error "Ensure next.config.ts has output: 'export'"
  exit $EXIT_NO_OUT_DIR
fi

if [[ ! -f "out/index.html" ]]; then
  error "out/index.html not found - build may have failed"
  exit $EXIT_NO_OUT_DIR
fi

success "Static export verified (out/ directory exists)"

#
# Step 4: Prepare staging directory on server
#
STAGING_DIR="${GODADDY_WEBROOT}.__deploy"

info "Creating staging directory on server: ${STAGING_DIR}"

# Create staging directory and clean it if it exists
expect <<EOF
set timeout 30
log_user 0

spawn ssh -p ${GODADDY_PORT} ${GODADDY_USERNAME}@${GODADDY_HOST} "rm -rf ${STAGING_DIR} && mkdir -p ${STAGING_DIR}"

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
  puts "ERROR: Failed to create staging directory"
  exit $EXIT_DEPLOY_FAILED
}
EOF

if [[ $? -ne 0 ]]; then
  error "Failed to create staging directory"
  exit $EXIT_DEPLOY_FAILED
fi

success "Staging directory created"

#
# Step 5: Upload files to staging directory
#
info "Uploading files to staging directory..."

# Use scp to upload contents of out/ (not the folder itself)
expect <<EOF
set timeout 300
log_user 1

spawn bash -c "cd out && scp -P ${GODADDY_PORT} -r * ${GODADDY_USERNAME}@${GODADDY_HOST}:${STAGING_DIR}/"

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
  puts "ERROR: Upload failed"
  exit $EXIT_UPLOAD_FAILED
}
EOF

if [[ $? -ne 0 ]]; then
  error "Failed to upload files"
  exit $EXIT_UPLOAD_FAILED
fi

success "Files uploaded to staging directory"

#
# Step 6: Create backup of current site and rotate versions
#
info "Creating backup of current site..."

# Create backup script
BACKUP_SCRIPT=$(mktemp)
cat > "$BACKUP_SCRIPT" <<'BACKUP_EOF'
#!/bin/bash
set -euo pipefail

WEBROOT="$1"
ROLLBACK_DIR="${WEBROOT%/html}/rollback"

echo "Setting up rollback directory structure..."
mkdir -p "${ROLLBACK_DIR}"

# Check if there's anything to backup (i.e., if this isn't the first deployment)
if [[ -f "${WEBROOT}/index.html" ]]; then
  echo "Rotating existing backups..."
  
  # Rotate backups: version-3 deleted, version-2 → version-3, version-1 → version-2
  rm -rf "${ROLLBACK_DIR}/version-3" 2>/dev/null || true
  [[ -d "${ROLLBACK_DIR}/version-2" ]] && mv "${ROLLBACK_DIR}/version-2" "${ROLLBACK_DIR}/version-3"
  [[ -d "${ROLLBACK_DIR}/version-1" ]] && mv "${ROLLBACK_DIR}/version-1" "${ROLLBACK_DIR}/version-2"
  
  echo "Creating new backup as version-1..."
  mkdir -p "${ROLLBACK_DIR}/version-1"
  
  # Backup all static files (excluding WordPress folders)
  cd "${WEBROOT}"
  
  # Copy HTML files
  find . -maxdepth 1 -type f -name "*.html" -exec cp {} "${ROLLBACK_DIR}/version-1/" \; 2>/dev/null || true
  
  # Copy static directories if they exist
  [[ -d "_next" ]] && cp -r _next "${ROLLBACK_DIR}/version-1/" 2>/dev/null || true
  [[ -d "assets" ]] && cp -r assets "${ROLLBACK_DIR}/version-1/" 2>/dev/null || true
  [[ -d "images" ]] && cp -r images "${ROLLBACK_DIR}/version-1/" 2>/dev/null || true
  [[ -d "static" ]] && cp -r static "${ROLLBACK_DIR}/version-1/" 2>/dev/null || true
  
  # Copy common static files
  [[ -f "favicon.ico" ]] && cp favicon.ico "${ROLLBACK_DIR}/version-1/" 2>/dev/null || true
  [[ -f "robots.txt" ]] && cp robots.txt "${ROLLBACK_DIR}/version-1/" 2>/dev/null || true
  [[ -f "sitemap.xml" ]] && cp sitemap.xml "${ROLLBACK_DIR}/version-1/" 2>/dev/null || true
  
  echo "✓ Backup created successfully"
else
  echo "No existing site to backup (first deployment)"
fi
BACKUP_EOF

# Upload and execute backup script
BACKUP_SCRIPT_PATH="/tmp/backup_script_$$.sh"

expect <<EOF
set timeout 30
log_user 0

spawn scp -P ${GODADDY_PORT} ${BACKUP_SCRIPT} ${GODADDY_USERNAME}@${GODADDY_HOST}:${BACKUP_SCRIPT_PATH}

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
  puts "ERROR: Failed to upload backup script"
  exit $EXIT_DEPLOY_FAILED
}
EOF

if [[ $? -ne 0 ]]; then
  rm -f "$BACKUP_SCRIPT"
  error "Failed to upload backup script"
  exit $EXIT_DEPLOY_FAILED
fi

# Execute backup script
expect <<EOF
set timeout 60
log_user 1

spawn ssh -p ${GODADDY_PORT} ${GODADDY_USERNAME}@${GODADDY_HOST} "chmod +x ${BACKUP_SCRIPT_PATH} && ${BACKUP_SCRIPT_PATH} ${GODADDY_WEBROOT} && rm -f ${BACKUP_SCRIPT_PATH}"

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
  puts "ERROR: Backup failed"
  exit $EXIT_DEPLOY_FAILED
}
EOF

rm -f "$BACKUP_SCRIPT"

if [[ $? -ne 0 ]]; then
  error "Backup failed"
  exit $EXIT_DEPLOY_FAILED
fi

success "Backup completed"

#
# Step 7: Deploy to production (with WordPress preservation and nesting detection)
#
info "Deploying to production webroot..."

# Create a temporary script file locally
TEMP_SCRIPT=$(mktemp)
cat > "$TEMP_SCRIPT" <<'REMOTE_EOF'
#!/bin/bash
set -euo pipefail

WEBROOT="$1"
STAGING="$2"

echo "Checking for html/html nesting..."
if [[ -d "${WEBROOT}/html" ]]; then
  echo "⚠ WARNING: Detected html/html nesting - fixing..."
  # Move everything from nested html/ up one level
  if [[ -d "${WEBROOT}/html/wp-admin" ]]; then
    # WordPress is in the nested directory, move it up
    mv "${WEBROOT}/html"/* "${WEBROOT}/" 2>/dev/null || true
    rmdir "${WEBROOT}/html" 2>/dev/null || true
    echo "✓ Fixed html/html nesting"
  fi
fi

echo "Preserving WordPress directories..."
# Create temp directory for WordPress folders
WP_TEMP="${WEBROOT}.__wp_backup"
mkdir -p "${WP_TEMP}"

# Backup WordPress folders if they exist
for wp_dir in wp-admin wp-content wp-includes; do
  if [[ -d "${WEBROOT}/${wp_dir}" ]]; then
    echo "  Backing up ${wp_dir}..."
    mv "${WEBROOT}/${wp_dir}" "${WP_TEMP}/"
  fi
done

echo "Cleaning old static files..."
# Remove old static files but preserve WordPress
cd "${WEBROOT}"
# Remove HTML files
find . -maxdepth 1 -type f -name "*.html" -delete 2>/dev/null || true
# Remove common Next.js/static directories
rm -rf _next assets images static favicon.ico robots.txt sitemap.xml 2>/dev/null || true

echo "Moving staged files to production..."
# Move all files from staging to webroot
mv "${STAGING}"/* "${WEBROOT}/" 2>/dev/null || true

echo "Restoring WordPress directories..."
# Restore WordPress folders
for wp_dir in wp-admin wp-content wp-includes; do
  if [[ -d "${WP_TEMP}/${wp_dir}" ]]; then
    echo "  Restoring ${wp_dir}..."
    mv "${WP_TEMP}/${wp_dir}" "${WEBROOT}/"
  fi
done

# Cleanup
rmdir "${WP_TEMP}" 2>/dev/null || true
rmdir "${STAGING}" 2>/dev/null || true

echo "✓ Deployment complete"
REMOTE_EOF

# Upload the script to the server
REMOTE_SCRIPT_PATH="/tmp/deploy_script_$$.sh"

expect <<EOF
set timeout 30
log_user 0

spawn scp -P ${GODADDY_PORT} ${TEMP_SCRIPT} ${GODADDY_USERNAME}@${GODADDY_HOST}:${REMOTE_SCRIPT_PATH}

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
  puts "ERROR: Failed to upload deployment script"
  exit $EXIT_DEPLOY_FAILED
}
EOF

if [[ $? -ne 0 ]]; then
  rm -f "$TEMP_SCRIPT"
  error "Failed to upload deployment script"
  exit $EXIT_DEPLOY_FAILED
fi

# Execute the script on the server
expect <<EOF
set timeout 60
log_user 1

spawn ssh -p ${GODADDY_PORT} ${GODADDY_USERNAME}@${GODADDY_HOST} "chmod +x ${REMOTE_SCRIPT_PATH} && ${REMOTE_SCRIPT_PATH} ${GODADDY_WEBROOT} ${STAGING_DIR} && rm -f ${REMOTE_SCRIPT_PATH}"

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
  puts "ERROR: Deployment failed"
  exit $EXIT_DEPLOY_FAILED
}
EOF

# Clean up local temp file
rm -f "$TEMP_SCRIPT"

if [[ $? -ne 0 ]]; then
  error "Deployment failed"
  exit $EXIT_DEPLOY_FAILED
fi

success "Deployment completed successfully!"
info ""
info "Your site has been deployed to: ${GODADDY_HOST}"
info "WordPress admin should still be accessible at: https://${GODADDY_HOST}/wp-admin"
info ""
