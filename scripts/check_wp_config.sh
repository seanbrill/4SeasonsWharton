#!/bin/bash
set -euo pipefail

if [[ -f .env.local ]]; then
  set -a
  source .env.local
  set +a
fi

expect <<EOF
set timeout 10
log_user 1

spawn ssh -p $GODADDY_PORT $GODADDY_USERNAME@$GODADDY_HOST
expect "password:"
send "$GODADDY_PASSWORD\r"
expect "$ "
send "ls -la html/ | head -n 20; echo '---CHECKING WP-CONFIG---'; grep 'WP_DEBUG' html/wp-config.php; echo '---CHECKING LOGS DIR---'; ls -la logs/ 2>/dev/null; exit\r"
expect eof
EOF
