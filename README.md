# 🎯 Resume Tailor AI

A production-ready SaaS application that uses AI to optimize resumes for specific job descriptions.

## 🏗️ Architecture

```
Frontend (React + TypeScript)
    ↓ HTTP Requests
Backend (FastAPI + Python)
    ↓ Secure API Calls
OpenAI GPT-4
```

**Security:** OpenAI API key is stored securely on the backend and never exposed to the browser.

## ✨ Features

- 📄 **Resume Upload & Parsing** - PDF/DOCX support
- 🎯 **Job Description Analysis** - AI-powered requirement extraction
- ✍️ **Resume Tailoring** - Optimize resume for specific jobs
- 📊 **3-Panel Dashboard** - Job insights, resume editor, AI suggestions
- 🔒 **Secure Backend** - API keys protected server-side
- 🎨 **Modern UI** - Beautiful Tailwind CSS design

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.8+
- OpenAI API Key

### 1. Setup Backend

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Mac/Linux
# venv\Scripts\activate  # On Windows

# Install dependencies
pip install -r requirements.txt

# Configure API key in backend/.env file

# Run backend server
uvicorn app.main:app --reload --port 8000
```

Backend runs at: **http://localhost:8000**

### 2. Setup Frontend

```bash
# In a new terminal, from project root
npm install

# Run frontend
npm run dev
```

Frontend runs at: **http://localhost:5173**

## 🔐 Environment Variables

### Frontend (`.env.local`)
```
VITE_API_URL=http://localhost:8000
```

### Backend (`backend/.env`)
```
OPENAI_API_KEY=your-key-here
```

## 🌐 Deployment

### Backend: Render.com (Free)
1. Push to GitHub
2. Create new Web Service on Render
3. Connect GitHub repo
4. Add environment variable: `OPENAI_API_KEY`
5. Deploy command: `pip install -r requirements.txt && uvicorn app.main:app --host 0.0.0.0`

### Frontend: Vercel (Free)
1. Push to GitHub
2. Import project to Vercel
3. Set `VITE_API_URL` to your backend URL
4. Deploy

## 📁 Project Structure

```
resume-tailor/
├── src/                # Frontend source
│   ├── components/
│   ├── pages/
│   ├── services/
│   └── contexts/
├── backend/           # Python backend
│   ├── app/
│   │   ├── routes/
│   │   ├── services/
│   │   └── models/
│   └── requirements.txt
└── README.md
```

## 🛠️ Tech Stack

**Frontend:** React, TypeScript, Tailwind CSS v4, React Router
**Backend:** FastAPI, Python, OpenAI SDK
**AI:** OpenAI GPT-4

---

Built with Claude Code 🚀
