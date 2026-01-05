# Load environment variables
if [[ -f .env.local ]]; then
  set -a
  source .env.local
  set +a
else
  echo "Error: .env.local not found"
  exit 1
fi

expect <<EOF
set timeout 30
log_user 1

spawn ssh -p $GODADDY_PORT $GODADDY_USERNAME@$GODADDY_HOST
expect {
  -re "(?i)password:" {
    send -- "$GODADDY_PASSWORD\r"
    exp_continue
  }
  -re "(\\\$|#|%|>) $" {
    # Send return to clear line
    send -- "\r"
    expect -re "(\\\$|#|%|>) $"
    
    # Try generic wp, then specific paths
    send -- "if command -v wp >/dev/null; then wp cache flush --path=$GODADDY_WEBROOT; elif [ -f /usr/local/bin/wp ]; then /usr/local/bin/wp cache flush --path=$GODADDY_WEBROOT; else echo 'WP-CLI not found'; exit 1; fi; exit\r"
  }
  eof
}

lassign [wait] pid spawnid os_error_flag exit_code
if {\$exit_code != 0} {
  puts "ERROR: Flush command failed"
  exit 1
}
EOF
