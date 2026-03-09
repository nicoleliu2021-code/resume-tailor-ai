# Testing Guide for Resume Tailor AI

## Overview
This guide will help you test your Resume Tailor AI application before publishing it. The app now has a **Mock Mode** that lets you test all features without using OpenAI API credits.

---

## Current Status
✅ **Mock Mode is ENABLED** - You can test the entire app without OpenAI credits
✅ Backend server running on http://localhost:8000
✅ Frontend running on http://localhost:5174

---

## How to Test

### Option 1: Quick Test with Mock Data (NO API CREDITS NEEDED)

Mock mode is currently **ENABLED** in `backend/.env`. This means:
- No OpenAI API calls are made
- Instant responses using realistic test data
- Perfect for testing the UI and user flow

**Testing Steps:**

1. **Open the app**: Go to http://localhost:5174

2. **Test Resume Upload**:
   - Click "Resume Optimizer" in the sidebar
   - Click "Choose File" or drag-and-drop
   - Upload: `test-data/sample-resume.txt` (or any .txt/.docx/.pdf file)
   - Click "Upload & Analyze Resume"
   - ✅ **Expected**: Resume is parsed and displayed in structured format

3. **Test Job Analysis**:
   - In the Job Description panel, paste the content from: `test-data/sample-job-description.txt`
   - Click "Analyze Job Description"
   - ✅ **Expected**: Job insights appear showing skills, keywords, and requirements

4. **Test Resume Tailoring**:
   - After both steps above, click "Tailor Resume"
   - ✅ **Expected**: A tailored resume is generated and displayed

5. **Test Download** (if implemented):
   - Click "Download Tailored Resume"
   - ✅ **Expected**: PDF or text file downloads

---

### Option 2: Test with Real OpenAI API (REQUIRES CREDITS)

Once you add credits to your OpenAI account, you can test with real AI:

1. **Add OpenAI credits**:
   - Go to https://platform.openai.com/account/billing
   - Add $5-10 (gpt-4o-mini is very cheap: ~$0.15 per 1M tokens)

2. **Disable Mock Mode**:
   ```bash
   # Edit backend/.env
   MOCK_MODE=false  # Change from "true" to "false"
   ```

3. **Restart the backend**:
   ```bash
   cd backend
   source venv/bin/activate
   uvicorn app.main:app --host 0.0.0.0 --port 8000
   ```

4. **Test with your own resume and job descriptions**

---

## Test Checklist

Use this checklist to verify all features work:

### Core Features
- [ ] Upload resume (.txt, .pdf, or .docx)
- [ ] Resume is parsed into structured format
- [ ] Experience, education, skills display correctly
- [ ] Job description analysis works
- [ ] Job insights show role, skills, keywords
- [ ] Resume tailoring generates new version
- [ ] Tailored resume highlights relevant experience

### UI/UX
- [ ] Sidebar navigation works
- [ ] Page transitions are smooth
- [ ] Loading states show during API calls
- [ ] Error messages display clearly
- [ ] Responsive design works on different screen sizes

### Error Handling
- [ ] Error message shows if resume upload fails
- [ ] Error message shows if job analysis fails
- [ ] Empty state messages display properly
- [ ] File type validation works

---

## Sample Test Data

I've created test files in the `test-data/` folder:

1. **`sample-resume.txt`** - A realistic software engineer resume
2. **`sample-job-description.txt`** - A senior full stack engineer job posting

You can use these to test the app without needing to prepare your own data.

---

## Troubleshooting

### Backend won't start
```bash
cd backend
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### Frontend won't start
```bash
cd /Users/nliu/resume-tailor
npm install
npm run dev
```

### "CORS error" in browser console
- Make sure backend is running on port 8000
- Check that frontend URL is in `backend/app/main.py` CORS settings

### API errors even with Mock Mode enabled
- Verify `MOCK_MODE=true` in `backend/.env`
- Restart the backend server
- Check browser console for specific errors

---

## Switch Between Modes

### Enable Mock Mode (No API credits needed)
```bash
# In backend/.env
MOCK_MODE=true
```

### Disable Mock Mode (Use real OpenAI)
```bash
# In backend/.env
MOCK_MODE=false
```

**Always restart the backend** after changing `.env` settings.

---

## Performance Testing

### Test with different file types:
1. `.txt` files - Should work instantly
2. `.docx` files - Test with Microsoft Word documents
3. `.pdf` files - Test with PDF resumes

### Test with different sizes:
1. Short resume (1 page) - Should process quickly
2. Long resume (3+ pages) - Should handle gracefully
3. Very large files - Should show appropriate error messages

---

## Before Publishing

Once testing is complete:

1. **Security Check**:
   - [ ] `.env` file is in `.gitignore`
   - [ ] No API keys exposed in frontend code
   - [ ] CORS is configured for production domains

2. **Set Mock Mode to False**:
   ```bash
   # In backend/.env for production
   MOCK_MODE=false
   ```

3. **Add production OpenAI API key** with sufficient credits

4. **Test one more time** with real API before deploying

---

## Next Steps

After successful testing:
1. Deploy backend (Render, Railway, or Heroku)
2. Deploy frontend (Vercel, Netlify, or Cloudflare Pages)
3. Update frontend `.env.local` with production backend URL
4. Configure production environment variables
5. Test the live site

---

## Questions?

If you encounter any issues during testing, check:
1. Browser console for frontend errors
2. Backend terminal for API errors
3. Network tab in browser DevTools to see API requests/responses

Common issues and solutions are in the Troubleshooting section above.
