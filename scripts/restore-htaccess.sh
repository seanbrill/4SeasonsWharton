#!/usr/bin/env bash
set -euo pipefail

# Load environment variables
if [[ ! -f .env.local ]]; then
  echo "ERROR: .env.local file not found"
  exit 1
fi

set -a
source .env.local
set +a

echo "Restoring .htaccess file to support Next.js static site + WordPress..."

# Correct .htaccess content for Next.js static site + WordPress
HTACCESS_CONTENT='# BEGIN WordPress and Static Site
<IfModule mod_rewrite.c>
RewriteEngine On
RewriteRule .* - [E=HTTP_AUTHORIZATION:%{HTTP:Authorization}]
RewriteBase /

# Serve root as static index.html (Next.js homepage)
RewriteRule ^$ index.html [L]

# Serve static Next.js pages (extensionless URLs -> .html files)
# But exclude WordPress paths
RewriteCond %{REQUEST_URI} !^/wp-
RewriteCond %{REQUEST_FILENAME}.html -f
RewriteRule ^(.*)$ $1.html [L]

# WordPress: If physical file or directory exists, serve it directly
RewriteCond %{REQUEST_FILENAME} -f [OR]
RewriteCond %{REQUEST_FILENAME} -d
RewriteRule ^ - [L]

# WordPress: Route everything else through index.php
# This includes REST API (/wp-json/*) and other WordPress virtual URLs
RewriteRule ^ index.php [L]
</IfModule>
# END WordPress and Static Site'

# Create a temporary .htaccess file locally
TEMP_HTACCESS=$(mktemp)
export TEMP_HTACCESS
export GODADDY_WEBROOT
cat > "$TEMP_HTACCESS" << 'HTACCESS_EOF'
# BEGIN WordPress and Static Site
<IfModule mod_rewrite.c>
RewriteEngine On
RewriteRule .* - [E=HTTP_AUTHORIZATION:%{HTTP:Authorization}]
RewriteBase /

# Serve root as static index.html (Next.js homepage)
RewriteRule ^$ index.html [L]

# Serve static Next.js pages (extensionless URLs -> .html files)
# But exclude WordPress paths
RewriteCond %{REQUEST_URI} !^/wp-
RewriteCond %{REQUEST_FILENAME}.html -f
RewriteRule ^(.*)$ $1.html [L]

# WordPress: If physical file or directory exists, serve it directly
RewriteCond %{REQUEST_FILENAME} -f [OR]
RewriteCond %{REQUEST_FILENAME} -d
RewriteRule ^ - [L]

# WordPress: Route everything else through index.php
# This includes REST API (/wp-json/*) and other WordPress virtual URLs
RewriteRule ^ index.php [L]
</IfModule>
# END WordPress and Static Site
HTACCESS_EOF

echo "Creating .htaccess file on server..."

# Use SSH to create the file directly
expect <<'EOF'
set timeout 30
log_user 1

set user $env(GODADDY_USERNAME)
set pass $env(GODADDY_PASSWORD)
set host $env(GODADDY_HOST)
set port $env(GODADDY_PORT)

spawn ssh -p $port $user@$host "cat > html/.htaccess << 'HTACCESS_EOF'
# BEGIN WordPress and Static Site
<IfModule mod_rewrite.c>
RewriteEngine On
RewriteRule .* - \[E=HTTP_AUTHORIZATION:%{HTTP:Authorization}\]
RewriteBase /

# Serve root as static index.html (Next.js homepage)
RewriteRule ^\$ index.html \[L\]

# Serve static Next.js pages (extensionless URLs -> .html files)
# But exclude WordPress paths
RewriteCond %{REQUEST_URI} !^/wp-
RewriteCond %{REQUEST_FILENAME}.html -f
RewriteRule ^(.*)\$ \$1.html \[L\]

# WordPress: If physical file or directory exists, serve it directly
RewriteCond %{REQUEST_FILENAME} -f \[OR\]
RewriteCond %{REQUEST_FILENAME} -d
RewriteRule ^ - \[L\]

# WordPress: Route everything else through index.php
# This includes REST API (/wp-json/*) and other WordPress virtual URLs
RewriteRule ^ index.php \[L\]
</IfModule>
# END WordPress and Static Site
HTACCESS_EOF
chmod 644 html/.htaccess
echo '✓ .htaccess file created'
ls -la html/.htaccess"

expect {
  -re "(?i)are you sure you want to continue connecting.*\\?" {
    send "yes\r"
    exp_continue
  }
  -re "(?i)password:" {
    send -- "$pass\r"
    exp_continue
  }
  eof
}

lassign [wait] pid spawnid os_error_flag exit_code
if {$exit_code != 0} {
  puts "ERROR: Failed to create .htaccess"
  exit 1
}
EOF

RESULT=$?
rm -f "$TEMP_HTACCESS"

if [[ $RESULT -ne 0 ]]; then
  echo "ERROR: Failed to create .htaccess file"
  exit 1
fi

if [[ $? -eq 0 ]]; then
  echo ""
  echo "✓ Success! The .htaccess file has been restored."
  echo ""
  echo "The WordPress REST API should now work at: https://4seasonswharton.com/wp-json/"
  echo "Try editing the dinner-menu page again in wp-admin."
else
  echo "ERROR: Failed to restore .htaccess file"
  exit 1
fi
