#!/usr/bin/env bash
# Stop cloudflared started by start-cloudflared.sh
set -euo pipefail

if [ -f /tmp/cloudflared.pid ]; then
  PID=$(cat /tmp/cloudflared.pid)
  echo "Stopping cloudflared pid=${PID}"
  kill "$PID" 2>/dev/null || pkill -f cloudflared || true
  rm -f /tmp/cloudflared.pid
  echo "Stopped"
else
  echo "No /tmp/cloudflared.pid found — attempting to pkill"
  pkill -f cloudflared || true
  echo "Done"
fi
