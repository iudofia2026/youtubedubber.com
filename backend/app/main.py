"""
YouTube Multilingual Dubbing - FastAPI Backend
Main application entry point
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
from contextlib import asynccontextmanager

from app.routers import health, jobs


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager"""
    # Startup
    print("🚀 Starting YouTube Multilingual Dubbing API...")
    
    # Create necessary directories
    os.makedirs("uploads", exist_ok=True)
    os.makedirs("outputs", exist_ok=True)
    
    yield
    
    # Shutdown
    print("🛑 Shutting down YouTube Multilingual Dubbing API...")


# Create FastAPI app
app = FastAPI(
    title="YouTube Multilingual Dubbing API",
    description="API for translating and dubbing YouTube videos with multiple languages",
    version="0.1.0",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(health.router, prefix="/api/v1", tags=["health"])
app.include_router(jobs.router, prefix="/api/v1", tags=["jobs"])

# Mount static files for serving generated content
app.mount("/static", StaticFiles(directory="outputs"), name="static")


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "YouTube Multilingual Dubbing API",
        "version": "0.1.0",
        "docs": "/docs",
        "health": "/api/v1/health"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )