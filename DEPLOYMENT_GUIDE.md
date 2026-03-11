# 🚀 Deployment Guide - Resume AI

Your app is ready for production! This guide covers deploying both frontend and backend.

## Quick Deploy (Recommended)

### Frontend → Vercel ✅ Already Connected!
### Backend → Render (Free Tier)

---

## Step 1: Deploy Backend to Render

**1. Create Render Account**
- Go to https://render.com
- Sign up with GitHub

**2. Create New Web Service**
- Click "New +" → "Web Service"
- Connect your GitHub repository
- Select `resume-tailor` repo

**3. Configure Service**
```
Name: resume-ai-backend
Region: Oregon (or closest to you)
Branch: main
Root Directory: backend
Runtime: Python 3
Build Command: pip install -r requirements.txt
Start Command: uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

**4. Add Environment Variables**
Click "Environment" tab and add:
```
OPENAI_API_KEY=your-openai-api-key-here
MOCK_MODE=false
```

**5. Deploy**
- Click "Create Web Service"
- Wait 2-3 minutes for deployment
- Copy your backend URL (e.g., `https://resume-ai-backend.onrender.com`)

---

## Step 2: Update Frontend to Use Production Backend

**Option A: Use Environment Variable (Recommended)**

Create `.env.production` in your project root:
```bash
VITE_API_URL=https://your-backend-url.onrender.com
```

**Option B: Update vite.config.ts**

Update the API proxy to point to production:
```typescript
server: {
  proxy: {
    '/api': {
      target: 'https://your-backend-url.onrender.com',
      changeOrigin: true,
      secure: true,
    }
  }
}
```

---

## Step 3: Redeploy Frontend to Vercel

```bash
# Commit changes
git add .
git commit -m "Update backend URL for production"
git push origin main

# Vercel auto-deploys on push!
```

Or manually:
```bash
vercel --prod
```

---

## Alternative: Deploy Backend to Railway

**1. Install Railway CLI**
```bash
npm install -g @railway/cli
```

**2. Login**
```bash
railway login
```

**3. Initialize Project**
```bash
cd backend
railway init
```

**4. Add Environment Variables**
```bash
railway variables set OPENAI_API_KEY=your-key-here
railway variables set MOCK_MODE=false
```

**5. Deploy**
```bash
railway up
```

**6. Get URL**
```bash
railway domain
```

---

## Alternative: Deploy Backend to Fly.io

Your backend already has a `fly.toml` config!

**1. Install Fly CLI**
```bash
brew install flyctl
```

**2. Login**
```bash
fly auth login
```

**3. Deploy**
```bash
cd backend
fly launch --no-deploy  # Review config
fly secrets set OPENAI_API_KEY=your-key-here
fly deploy
```

---

## Post-Deployment Checklist

### Frontend (Vercel)
- [ ] Build succeeds
- [ ] PWA install works
- [ ] Icons display correctly
- [ ] All routes work (React Router)
- [ ] HTTPS enabled ✓ (automatic)

### Backend (Render/Railway/Fly)
- [ ] Health check passes: `/health`
- [ ] API docs accessible: `/docs`
- [ ] CORS configured for your domain
- [ ] Environment variables set
- [ ] OpenAI API key working

### Integration
- [ ] Frontend can reach backend
- [ ] Resume upload works
- [ ] Job analysis works
- [ ] AI optimization works
- [ ] Export (PDF/DOCX) works

---

## Testing Production Deployment

**1. Test Backend**
```bash
curl https://your-backend-url.onrender.com/health
```

Expected: `{"status":"healthy"}`

**2. Test Frontend**
- Visit your Vercel URL
- Upload a resume
- Paste job description
- Verify AI optimization works
- Test PWA install

**3. Test PWA Installation**
- Open in Chrome/Edge
- Click install icon in address bar
- Verify app installs correctly
- Test offline mode

---

## Environment Variables Reference

### Frontend (.env.production)
```bash
VITE_API_URL=https://your-backend-url.com
```

### Backend (Render/Railway/Fly)
```bash
OPENAI_API_KEY=sk-proj-...
MOCK_MODE=false
HOST=0.0.0.0
PORT=8000  # Or $PORT for Render
```

---

## CORS Configuration

If you get CORS errors, update `backend/app/main.py`:

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://your-app.vercel.app",
        "http://localhost:5173",  # Dev
        "http://localhost:4173",  # Preview
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## Monitoring & Logs

### Vercel
- Dashboard: https://vercel.com/dashboard
- Logs: Click your project → "Deployments" → Select deployment → "Logs"

### Render
- Dashboard: https://dashboard.render.com
- Logs: Select service → "Logs" tab
- Metrics: "Metrics" tab shows CPU/Memory

### Railway
```bash
railway logs
```

### Fly.io
```bash
fly logs
```

---

## Troubleshooting

### "Failed to fetch" Error
**Problem:** Frontend can't reach backend

**Solutions:**
1. Check backend URL in frontend config
2. Verify backend is running (check health endpoint)
3. Check CORS configuration
4. Verify environment variables are set

### PWA Not Installing
**Problem:** Install prompt doesn't appear

**Solutions:**
1. Ensure HTTPS is enabled (Vercel provides this)
2. Check all icons exist in `public/icons/`
3. Verify `manifest.json` is accessible
4. Check browser console for errors
5. Try in Chrome/Edge (best PWA support)

### Backend Timeout
**Problem:** API requests timeout

**Solutions:**
1. Check backend logs for errors
2. Verify OpenAI API key is valid
3. Check if free tier has rate limits
4. Consider upgrading backend plan

### Build Fails
**Problem:** Vercel build fails

**Solutions:**
1. Check TypeScript errors locally: `npm run build`
2. Ensure all dependencies are in `package.json`
3. Check Vercel build logs for specific errors
4. Clear Vercel cache and rebuild

---

## Cost Breakdown

### Free Tier (Good for Testing)
- **Vercel**: Free (Hobby plan)
  - Unlimited deployments
  - 100GB bandwidth
  - HTTPS included

- **Render**: Free
  - Spins down after 15 min inactivity
  - 750 hours/month
  - 512MB RAM

- **Railway**: $5 credit/month free
  - Sleep after inactivity
  - Good performance

### Paid Recommendations (For Production)
- **Vercel Pro**: $20/month
  - Better performance
  - More bandwidth

- **Render Starter**: $7/month
  - Always on
  - Better performance
  - 512MB RAM

- **Railway**: Pay per use
  - ~$5-10/month typical
  - Better than Render free tier

---

## Scaling Tips

### When You Need More Performance

**Backend:**
1. Upgrade to paid tier on Render ($7/month)
2. Use caching for frequently requested data
3. Implement request queuing for AI calls
4. Consider serverless functions (Vercel Functions)

**Frontend:**
1. Enable Vercel Analytics
2. Implement lazy loading for heavy components
3. Use CDN for static assets
4. Optimize bundle size (already warned in build)

**Database (Future):**
1. Add PostgreSQL for user accounts
2. Store resume history
3. Cache AI responses
4. Track analytics

---

## Support

**Questions?**
- Check logs first (Vercel/Render dashboard)
- Test locally with production backend URL
- Verify environment variables
- Check CORS configuration

**Need Help?**
- Vercel Docs: https://vercel.com/docs
- Render Docs: https://render.com/docs
- Railway Docs: https://docs.railway.app
- Fly.io Docs: https://fly.io/docs

---

## Next Steps After Deployment

1. **Add Custom Domain** (Optional)
   - Vercel: Settings → Domains
   - Point your domain to Vercel

2. **Set Up Analytics**
   - Vercel Analytics (free)
   - Google Analytics

3. **Add Monitoring**
   - Sentry for error tracking
   - LogRocket for session replay

4. **Implement Features**
   - User authentication
   - Resume history
   - Payment integration (Stripe)
   - Email notifications

---

Your app is production-ready! 🎉

Backend: ⏳ Deploy to Render
Frontend: ✅ Already on Vercel
Icons: ✅ Generated
Build: ✅ Successful
