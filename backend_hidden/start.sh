#!/bin/bash

# Set default port if not provided
PORT=${PORT:-8000}

# Print environment info for debugging
echo "=== Starting YT Dubber Backend ==="
echo "Port: $PORT"
echo "Python: $(python --version)"
echo "Working Directory: $(pwd)"
echo "User: $(whoami)"

# Check if required commands exist
echo "Checking dependencies..."
which python && echo "✓ Python found" || echo "✗ Python not found"
which alembic && echo "✓ Alembic found" || echo "✗ Alembic not found"
which uvicorn && echo "✓ Uvicorn found" || echo "✗ Uvicorn not found"

# Validate environment variables
echo ""
echo "Environment Variables:"
echo "DATABASE_URL: ${DATABASE_URL:='NOT SET'}"
echo "SUPABASE_URL: ${SUPABASE_URL:='NOT SET'}"
echo "PYTHONPATH: $PYTHONPATH"

# Test database connection if DATABASE_URL is set
if [ ! -z "$DATABASE_URL" ]; then
    echo ""
    echo "Testing database connection..."
    python -c "
import os
import psycopg2
try:
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    print('✓ Database connection successful')
    conn.close()
except Exception as e:
    print(f'✗ Database connection failed: {e}')
    exit(1)
"
fi

# Run database migrations
echo ""
echo "Running database migrations..."
if alembic upgrade head; then
    echo "✓ Migrations completed"
else
    echo "✗ Migrations failed"
    echo "Continuing without migrations (might be first run)..."
fi

# Start the FastAPI server
echo ""
echo "Starting FastAPI server on port $PORT..."
echo "=== Server starting at $(date) ==="
exec uvicorn app.main:app --host 0.0.0.0 --port $PORT --workers 1 --log-level info