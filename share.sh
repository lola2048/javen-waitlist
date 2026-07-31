#!/bin/bash
# 启动 Waitlist 并生成公网链接，发给朋友即可访问
set -e
cd "$(dirname "$0")"

PORT=8787
CF="./tools/cloudflared"

if ! curl -sf "http://127.0.0.1:${PORT}/api/health" >/dev/null 2>&1; then
  echo "Starting waitlist server on port ${PORT}..."
  python3 server.py &
  sleep 2
fi

if [ ! -x "$CF" ]; then
  echo "Downloading cloudflared..."
  mkdir -p tools
  curl -sL "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-darwin-arm64.tgz" \
    | tar -xz -C tools
  chmod +x "$CF"
fi

echo ""
echo "Public URL will appear below — share it with friends:"
echo ""
exec "$CF" tunnel --url "http://127.0.0.1:${PORT}" --no-autoupdate
