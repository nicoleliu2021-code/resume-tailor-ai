# Deployment Guide

## Prerequisites
- GitHub account
- OpenAI API key
- Domain name (optional)

## Option 1: Vercel + Railway (Recommended)

### Deploy Backend to Railway

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin YOUR_GITHUB_REPO_URL
   git push -u origin main
   ```

2. **Deploy on Railway**
   - Go to [railway.app](https://railway.app)
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your repository
   - Set root directory: `backend`
   - Add environment variables:
     - `OPENAI_API_KEY`: your-openai-api-key
   - Click "Deploy"
   - Copy your backend URL (e.g., `https://your-app.up.railway.app`)

### Deploy Frontend to Vercel

1. **Deploy on Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Import Project"
   - Select your GitHub repository
   - Framework: Vite
   - Root Directory: `/` (leave as default)
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Add environment variable:
     - `VITE_API_URL`: https://your-backend-url.railway.app
   - Click "Deploy"

2. **Done!** Your app will be live at `https://your-app.vercel.app`

## Option 2: Render (Single Platform)

### Deploy Backend

1. Go to [render.com](https://render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - Name: `resume-tailor-api`
   - Root Directory: `backend`
   - Environment: `Python 3`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Add environment variable:
   - `OPENAI_API_KEY`: your-openai-api-key
6. Click "Create Web Service"
7. Copy your backend URL

### Deploy Frontend

1. Click "New +" → "Static Site"
2. Connect same repository
3. Configure:
   - Name: `resume-tailor`
   - Build Command: `npm install && npm run build`
   - Publish Directory: `dist`
4. Add environment variable:
   - `VITE_API_URL`: your-backend-url-from-step-7
5. Click "Create Static Site"

## Option 3: Docker (Self-Hosted)

### Backend Dockerfile
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY backend/requirements.txt .
RUN pip install -r requirements.txt
COPY backend/ .
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Frontend Dockerfile
```dockerfile
FROM node:20-alpine as build
WORKDIR /app
COPY package*.json .
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## Environment Variables

### Backend (.env)
```
OPENAI_API_KEY=sk-...
PORT=8000
```

### Frontend (.env.production)
```
VITE_API_URL=https://your-backend-domain.com
```

## Post-Deployment

1. **Test the deployment**
   - Upload a resume
   - Paste a job description
   - Click "Analyze Job"
   - Test the Gap Fix feature

2. **Monitor logs**
   - Railway: Check logs in dashboard
   - Vercel: Check function logs
   - Render: Check logs in service dashboard

3. **Set up custom domain** (optional)
   - In Vercel/Render dashboard
   - Add your custom domain
   - Update DNS records as instructed

## Troubleshooting

### CORS Issues
Make sure backend `main.py` includes your frontend domain:
```python
allow_origins=["https://your-frontend-domain.vercel.app"]
```

### API Connection Failed
- Check `VITE_API_URL` environment variable
- Ensure backend is running and accessible
- Check backend CORS settings

### Build Failures
- Ensure all dependencies are in package.json/requirements.txt
- Check Node.js version (should be 18+)
- Check Python version (should be 3.11+)
