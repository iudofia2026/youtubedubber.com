#!/bin/bash
# Startup script for YT Dubber - Starts both API and Worker

echo "🚀 Starting YT Dubber Backend Services..."
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if virtual environment is activated
if [[ -z "$VIRTUAL_ENV" ]]; then
    echo "⚠️  Warning: Virtual environment not activated"
    if [ -d "venv" ]; then
        echo "   Activating venv..."
        source venv/bin/activate
    elif [ -d "../venv" ]; then
        echo "   Activating ../venv..."
        source ../venv/bin/activate
    fi
fi

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Shutting down services..."
    kill $API_PID 2>/dev/null
    kill $WORKER_PID 2>/dev/null
    wait
    echo "✅ All services stopped"
    exit 0
}

# Trap Ctrl+C and call cleanup
trap cleanup INT TERM

# Start the API server
echo -e "${BLUE}[API]${NC} Starting FastAPI server..."
uvicorn app.main:app --reload --port 8000 &
API_PID=$!
echo -e "${GREEN}[API]${NC} Started (PID: $API_PID)"

# Wait a bit for API to start
sleep 2

# Start the background worker
echo -e "${BLUE}[WORKER]${NC} Starting background worker..."
python start_worker.py &
WORKER_PID=$!
echo -e "${GREEN}[WORKER]${NC} Started (PID: $WORKER_PID)"

echo ""
echo "✅ All services running!"
echo ""
echo "   API Server:  http://localhost:8000"
echo "   API Docs:    http://localhost:8000/docs"
echo "   Worker:      Running (PID: $WORKER_PID)"
echo ""
echo "Press Ctrl+C to stop all services"
echo ""

# Wait for both processes
wait
