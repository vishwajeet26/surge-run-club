#!/usr/bin/env bash
# Production Build Script (for Render, Railway, etc.)
set -o errexit

# 1. Install Backend Dependencies
pip install -r backend/requirements.txt

# 2. Build Frontend Production Assets
cd frontend
npm install
npm run build
cd ..
