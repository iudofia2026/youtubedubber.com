#!/bin/bash

# Set default port if not provided
PORT=${PORT:-8000}

# Run database migrations
echo "Running database migrations..."
alembic upgrade head

# Start the FastAPI server
echo "Starting FastAPI server on port $PORT..."
uvicorn app.main:app --host 0.0.0.0 --port $PORT --workers 1