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
send "ls -la; echo '---'; find . -maxdepth 3 -name \"error_log\" -o -name \"*.log\"; exit\r"
expect eof
EOF
