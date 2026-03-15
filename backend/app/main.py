from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

from app.routes import resume, job, chat

# Load environment variables
load_dotenv()

app = FastAPI(
    title="Resume Tailor AI API",
    description="Backend API for Resume Optimization",
    version="1.0.1"
)

# Configure CORS
# Allow localhost for development and production domains
allowed_origins = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175",
    "http://localhost:4173",  # Vite preview
    "http://localhost:3000",
    "https://resume-tailor.vercel.app",
    "https://resume-tailor-ai-nine.vercel.app",
    "https://resume-tailor-nu-six.vercel.app",
    "https://v0-resume-tailor-ai.vercel.app",  # Vercel deployment
    "https://resumeoptimizer-ai.netlify.app",  # Netlify deployment
]

# In development, allow all origins for easier testing
if os.getenv("ENVIRONMENT") == "development":
    allowed_origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(resume.router, prefix="/api/resume", tags=["resume"])
app.include_router(job.router, prefix="/api/job", tags=["job"])
app.include_router(chat.router, prefix="/api/chat", tags=["chat"])

@app.get("/")
async def root():
    return {"message": "Resume Tailor AI API", "status": "running"}

@app.get("/health")
async def health():
    return {"status": "healthy"}
