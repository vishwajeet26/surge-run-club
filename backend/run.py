import os
import sys
import uvicorn

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
WORKSPACE_DIR = os.path.dirname(BASE_DIR)

for path in [BASE_DIR, WORKSPACE_DIR]:
    if path not in sys.path:
        sys.path.insert(0, path)

# Ensure spawned reloader child processes inherit python paths
os.environ["PYTHONPATH"] = f"{BASE_DIR}:{WORKSPACE_DIR}:{os.environ.get('PYTHONPATH', '')}"

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "0.0.0.0")
    uvicorn.run("app.main:app", host=host, port=port, reload=True, app_dir=BASE_DIR)

