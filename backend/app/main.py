from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

from app.routes import resume, job

# Load environment variables
load_dotenv()

app = FastAPI(
    title="Resume Tailor AI API",
    description="Backend API for Resume Optimization",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "http://localhost:3000"],  # Frontend URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(resume.router, prefix="/api/resume", tags=["resume"])
app.include_router(job.router, prefix="/api/job", tags=["job"])

@app.get("/")
async def root():
    return {"message": "Resume Tailor AI API", "status": "running"}

@app.get("/health")
async def health():
    return {"status": "healthy"}
