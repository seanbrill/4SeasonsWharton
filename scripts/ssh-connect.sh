#!/usr/bin/env bash
set -euo pipefail

# Load .env.local and export vars so expect can read them
set -a
source .env.local
set +a

: "${GODADDY_USERNAME:?Missing GODADDY_USERNAME in .env.local}"
: "${GODADDY_PASSWORD:?Missing GODADDY_PASSWORD in .env.local}"

HOST="${GODADDY_HOST:-o5f.997.myftpupload.com}"
PORT="${GODADDY_PORT:-22}"

expect <<'EOF'
  set timeout 20

  # Pull env vars from the environment (not bash variables)
  set user $env(GODADDY_USERNAME)
  set pass $env(GODADDY_PASSWORD)
  set host $env(GODADDY_HOST)
  set port $env(GODADDY_PORT)

  # Start ssh
  spawn ssh -p $port $user@$host

  # Handle prompts
  expect {
    -re "(?i)are you sure you want to continue connecting.*\\?" {
      send "yes\r"
      exp_continue
    }
    -re "(?i)password:" {
      send -- "$pass\r"
      exp_continue
    }
    -re "(?i)permission denied" {
      puts "ERROR: Permission denied (bad username/password?)"
      exit 2
    }
    timeout {
      puts "ERROR: Timed out waiting for ssh prompts"
      exit 3
    }
    eof {
      puts "ERROR: SSH exited unexpectedly"
      exit 4
    }
  }

  # Hand over to you after login
  interact
EOF
