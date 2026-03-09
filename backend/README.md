# Resume Tailor AI - Backend API

FastAPI backend that securely handles OpenAI API calls for resume optimization.

## Setup

1. **Install Python 3.8+**

2. **Create virtual environment:**
```bash
python -m venv venv
source venv/bin/activate  # On Mac/Linux
# OR
venv\Scripts\activate  # On Windows
```

3. **Install dependencies:**
```bash
pip install -r requirements.txt
```

4. **Configure environment:**
   - Edit `backend/.env` file
   - Add your OpenAI API key

## Run Development Server

```bash
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Server will be available at: http://localhost:8000

## API Documentation

Once running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## API Endpoints

- `POST /api/resume/parse` - Parse resume text into structured format
- `POST /api/resume/tailor` - Tailor resume to job description
- `POST /api/job/analyze` - Analyze job description
- `GET /health` - Health check

## Deployment

See main README for deployment instructions.
