# Use Python 3.9 slim image
FROM python:3.9-slim

# Set working directory
WORKDIR /app

# Install system dependencies needed for some Python packages
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt.bak requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy the application code
COPY start.py.bak start.py
COPY backend_hidden/ ./backend/

# Set environment variables
ENV PYTHONPATH=/app/backend
ENV PYTHONUNBUFFERED=1

# Railway will set PORT automatically
EXPOSE 8000

# Start the application
CMD ["python", "start.py"]