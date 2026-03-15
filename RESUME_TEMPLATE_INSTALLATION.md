# Resume Template System - Installation & Setup

## Quick Installation

### Step 1: Install Dependencies

```bash
npm install html2canvas jspdf docx file-saver
```

### Step 2: Verify Files Created

All template files have been created in your project:

```
✅ src/types/resumeTemplate.ts
✅ src/components/resume/ResumeTemplate.tsx
✅ src/components/resume/ResumeTemplate.css
✅ src/components/resume/ResumePreview.tsx
✅ src/utils/resumeExport.ts
✅ src/utils/resumeExportDOCX.ts
✅ src/utils/resumeConverter.ts
✅ src/data/sampleResume.ts
✅ RESUME_TEMPLATE_GUIDE.md
```

---

## Integration Options

### Option 1: Add to Optimizer Flow

Integrate the template into your existing optimizer:

```tsx
// In Optimizer.tsx or similar
import { ResumePreview } from './components/resume/ResumePreview';
import { convertStructuredResumeToTemplate } from './utils/resumeConverter';

function Optimizer() {
  const { resume } = useResume();

  // Convert your existing resume format
  const templateData = convertStructuredResumeToTemplate(resume);

  return (
    <div>
      {/* Your existing UI */}

      {/* Add resume preview with export */}
      <ResumePreview
        data={templateData}
        onExport={(format) => {
          console.log(`Resume exported as ${format}`);
          // Track analytics, show success message
        }}
      />
    </div>
  );
}
```

### Option 2: Create New Resume Download Page

Create a dedicated page for resume downloads:

```tsx
// src/pages/ResumeDownload.tsx
import { useState } from 'react';
import { ResumePreview } from '../components/resume/ResumePreview';
import { convertStructuredResumeToTemplate } from '../utils/resumeConverter';
import { useResume } from '../contexts/ResumeContext';

export function ResumeDownload() {
  const { resume } = useResume();
  const templateData = convertStructuredResumeToTemplate(resume);

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Download Your Resume</h1>
      <ResumePreview data={templateData} />
    </div>
  );
}
```

Then add route:
```tsx
// App.tsx
<Route path="/download" element={<ResumeDownload />} />
```

### Option 3: Add Export Buttons to Existing Resume View

Add export functionality to your current resume display:

```tsx
import { useRef } from 'react';
import { ResumeTemplate } from './components/resume/ResumeTemplate';
import {
  exportResumeToPDFViaPrint,
  exportResumeToDOCX,
  exportResumeToPlainText
} from './utils/resumeExport';
import { convertStructuredResumeToTemplate } from './utils/resumeConverter';

function ExistingResumeView() {
  const resumeRef = useRef<HTMLDivElement>(null);
  const { resume } = useResume();
  const templateData = convertStructuredResumeToTemplate(resume);

  const handleExportPDF = () => {
    if (resumeRef.current) {
      exportResumeToPDFViaPrint(resumeRef.current, 'My_Resume.pdf');
    }
  };

  const handleExportDOCX = async () => {
    await exportResumeToDOCX(templateData, 'My_Resume.docx');
  };

  const handleExportTXT = () => {
    exportResumeToPlainText(templateData, 'My_Resume.txt');
  };

  return (
    <div>
      {/* Export Buttons */}
      <div className="flex gap-4 mb-6">
        <button onClick={handleExportPDF}>Export PDF</button>
        <button onClick={handleExportDOCX}>Export DOCX</button>
        <button onClick={handleExportTXT}>Export TXT</button>
      </div>

      {/* Resume Template */}
      <ResumeTemplate ref={resumeRef} data={templateData} />
    </div>
  );
}
```

---

## Test Your Installation

### 1. Test with Sample Data

```tsx
import { SAMPLE_RESUME } from './data/sampleResume';
import { ResumePreview } from './components/resume/ResumePreview';

function TestPage() {
  return <ResumePreview data={SAMPLE_RESUME} />;
}
```

### 2. Test Exports

```tsx
import {
  exportResumeToPDFViaPrint,
  exportResumeToDOCX,
  exportResumeToPlainText
} from './utils/resumeExport';
import { SAMPLE_RESUME } from './data/sampleResume';

// Test PDF
const element = document.getElementById('test-resume');
exportResumeToPDFViaPrint(element, 'test.pdf');

// Test DOCX
await exportResumeToDOCX(SAMPLE_RESUME, 'test.docx');

// Test TXT
exportResumeToPlainText(SAMPLE_RESUME, 'test.txt');
```

---

## TypeScript Configuration

Ensure your `tsconfig.json` allows these imports:

```json
{
  "compilerOptions": {
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "skipLibCheck": true
  }
}
```

---

## Styling Integration

The template includes its own CSS file. Make sure it's imported:

```tsx
// In ResumeTemplate.tsx - already done
import './ResumeTemplate.css';
```

If you're using CSS modules or styled-components, the template will work alongside them without conflicts.

---

## Font Setup

The template uses **Inter** by default. Add to your `index.html` or `App.tsx`:

### Option 1: Google Fonts (Recommended)

```html
<!-- In public/index.html -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
```

### Option 2: Self-hosted

Download Inter font and add to your project:

```css
/* In your global CSS */
@font-face {
  font-family: 'Inter';
  src: url('/fonts/Inter-Regular.woff2') format('woff2');
  font-weight: 400;
}

@font-face {
  font-family: 'Inter';
  src: url('/fonts/Inter-SemiBold.woff2') format('woff2');
  font-weight: 600;
}

@font-face {
  font-family: 'Inter';
  src: url('/fonts/Inter-Bold.woff2') format('woff2');
  font-weight: 700;
}
```

### Option 3: Use System Fonts

If you prefer Calibri or don't want to load fonts:

```tsx
<ResumeTemplate
  data={resumeData}
  config={{ font: 'Calibri' }}
/>
```

---

## Verification Checklist

- [ ] All npm packages installed
- [ ] All files present in correct locations
- [ ] Fonts loading correctly
- [ ] Sample resume renders without errors
- [ ] PDF export works
- [ ] DOCX export works
- [ ] Plain text export works
- [ ] Converter functions work with your existing data
- [ ] No TypeScript errors

---

## Common Issues & Solutions

### Issue: "Cannot find module 'html2canvas'"
**Solution:** Run `npm install html2canvas jspdf docx file-saver`

### Issue: "forwardRef is not defined"
**Solution:** Ensure React version is 16.8+: `npm install react@latest`

### Issue: Font not loading
**Solution:** Add Google Fonts link to index.html or use system font (Calibri)

### Issue: PDF/DOCX export not working
**Solution:** Check browser console for errors. Ensure pop-ups are allowed for PDF export.

### Issue: TypeScript errors
**Solution:** Run `npm install --save-dev @types/file-saver`

---

## Next Steps

1. ✅ Install dependencies
2. ✅ Test with sample data
3. ✅ Integrate into your app (choose one option above)
4. ✅ Test all export formats
5. ✅ Customize styling if needed
6. ✅ Add analytics tracking for exports
7. ✅ Test with real resume data

---

## Support Resources

- **Full Guide:** See `RESUME_TEMPLATE_GUIDE.md`
- **Sample Data:** See `src/data/sampleResume.ts`
- **Type Definitions:** See `src/types/resumeTemplate.ts`

---

## Performance Tips

### Optimize PDF Export
```tsx
// Use print dialog method for better quality
exportResumeToPDFViaPrint(element, filename);
```

### Lazy Load Export Libraries
```tsx
// Only load when user clicks export
const handleExport = async () => {
  const { exportResumeToDOCX } = await import('./utils/resumeExportDOCX');
  await exportResumeToDOCX(data, filename);
};
```

### Memoize Converted Data
```tsx
const templateData = useMemo(
  () => convertStructuredResumeToTemplate(resume),
  [resume]
);
```

---

## Production Checklist

Before deploying:

- [ ] Test exports in production build (not just dev)
- [ ] Verify fonts load on production domain
- [ ] Test on multiple browsers (Chrome, Firefox, Safari)
- [ ] Test on mobile devices
- [ ] Check print preview appearance
- [ ] Verify CORS settings for external fonts
- [ ] Add error handling for export failures
- [ ] Add loading states for async exports
- [ ] Test with various data edge cases
- [ ] Verify ATS compatibility with online tools

---

## Ready to Go! 🚀

Your professional resume template system is now installed and ready to use. Choose an integration option above and start exporting beautiful, ATS-optimized resumes!
