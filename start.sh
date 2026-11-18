#!/bin/bash
# Surge Run Club Startup Script

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT_DIR"

PORT=${PORT:-8000}

# Export PYTHONPATH so all spawned reloader processes find modules
export PYTHONPATH="$ROOT_DIR:$ROOT_DIR/backend:$PYTHONPATH"

echo "⚡ Starting Surge Run Club on port $PORT..."

# Check if a process is already listening on this port
LISTENER_PIDS=$(lsof -ti :"$PORT" -sTCP:LISTEN 2>/dev/null)
if [ -n "$LISTENER_PIDS" ]; then
  echo "⚠️  Port $PORT is already in use by process(es): $LISTENER_PIDS"
  echo "🔄 Freeing port $PORT..."
  for pid in $LISTENER_PIDS; do
    kill -9 "$pid" 2>/dev/null || true
  done
  sleep 1
fi

# Activate Python Virtual Environment
source backend/venv/bin/activate

# Build frontend if dist doesn't exist
if [ ! -d "frontend/dist" ]; then
  echo "📦 Building frontend production bundle..."
  (cd frontend && npm run build)
fi

echo "🚀 Launching Surge Run Club at http://127.0.0.1:$PORT"
PORT=$PORT python backend/run.py
