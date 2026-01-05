#!/usr/bin/env bash
set -euo pipefail

# Load .env.local and export vars so expect can read them
set -a
source .env.local
set +a

: "${GODADDY_USERNAME:?Missing GODADDY_USERNAME in .env.local}"
: "${GODADDY_PASSWORD:?Missing GODADDY_PASSWORD in .env.local}"

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Run the expect script
exec expect "${SCRIPT_DIR}/ssh-connect.exp"
