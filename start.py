#!/usr/bin/env python3
"""
Railway startup script for YT Dubber FastAPI backend
"""
import sys
import os

# Add backend directory to Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

# Change to backend directory for relative imports
os.chdir(os.path.join(os.path.dirname(__file__), 'backend'))

if __name__ == "__main__":
    import uvicorn
    from app.main import app

    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)