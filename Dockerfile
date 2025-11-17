# Use Python 3.10 slim image for smaller footprint
FROM python:3.10-slim

# Set working directory
WORKDIR /app

# Install system dependencies in single layer for better caching
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

# Copy requirements first for better Docker layer caching
COPY requirements.txt.bak requirements.txt

# Upgrade pip and install dependencies in single layer
RUN pip install --upgrade pip --no-cache-dir && \
    pip install --no-cache-dir -r requirements.txt && \
    rm requirements.txt

# Copy application code (separate layer for code changes)
COPY start.py.bak start.py
COPY backend_hidden/ ./backend/

# Set environment variables
ENV PYTHONPATH=/app/backend \
    PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1

# Use non-root user for security
RUN useradd --create-home --shell /bin/bash app && chown -R app:app /app
USER app

# Expose port
EXPOSE 8000

# Health check for better container management
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD python -c "import requests; requests.get('http://localhost:8000/health')" || exit 1

# Start the application
CMD ["python", "start.py"]