#!/bin/bash
# Start YT Dubber backend - ensures correct backend is running

echo "🔍 Checking port 8000..."

# Kill any existing process on port 8000
if lsof -ti:8000 > /dev/null 2>&1; then
    echo "⚠️  Port 8000 is in use, killing existing process..."
    lsof -ti:8000 | xargs kill -9
    sleep 2
fi

# Verify we're in the correct directory
if [ ! -f "app/main.py" ]; then
    echo "❌ Error: Not in the correct directory. Please run from backend directory."
    exit 1
fi

echo "✅ Port 8000 is clear"
echo "🚀 Starting YT Dubber API..."

# Start the backend
./venv/bin/python -m uvicorn app.main:app --reload --port 8000 --host 0.0.0.0

# Note: This runs in foreground so you can see logs
# If you want to run in background, use: ./venv/bin/python -m uvicorn app.main:app --reload --port 8000 --host 0.0.0.0 &
