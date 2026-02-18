#!/usr/bin/env bash
# Simple helper to run Cloudflare Tunnel to local server
# Usage: ./start-cloudflared.sh

set -euo pipefail

# Check for cloudflared
if ! command -v cloudflared >/dev/null 2>&1; then
  echo "cloudflared not found. Install it first: https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation"
  exit 2
fi

# Default port
PORT=3000
URL="http://127.0.0.1:${PORT}"

echo "Starting Cloudflare Tunnel to ${URL} (ephemeral)"
# Run ephemeral tunnel and write pid + log
# This will print a URL like https://xxxxx.trycloudflare.com
/usr/local/bin/cloudflared tunnel --url "${URL}" > /tmp/cloudflared.log 2>&1 &
echo $! > /tmp/cloudflared.pid
echo "cloudflared started, pid=$(cat /tmp/cloudflared.pid)"
echo "See /tmp/cloudflared.log for the public URL"
