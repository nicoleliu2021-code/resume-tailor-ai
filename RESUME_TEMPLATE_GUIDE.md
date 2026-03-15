# Professional Resume Template System

## Overview

A complete, ATS-optimized resume template system for the AI resume optimization platform. Designed with recruiter scanning patterns and ATS parsing in mind.

## Features

- ✅ **ATS-Friendly**: Single column, no tables, semantic HTML
- ✅ **Clean Typography**: Inter/Calibri fonts, proper spacing
- ✅ **Export Formats**: PDF, DOCX, Plain Text
- ✅ **Customizable**: Configurable fonts, spacing, margins
- ✅ **React Components**: Easy integration with existing codebase
- ✅ **Type-Safe**: Full TypeScript support

## File Structure

```
src/
├── types/
│   └── resumeTemplate.ts          # Type definitions
├── components/
│   └── resume/
│       ├── ResumeTemplate.tsx     # Main template component
│       ├── ResumeTemplate.css     # ATS-optimized styles
│       └── ResumePreview.tsx      # Preview with export buttons
├── utils/
│   ├── resumeExport.ts            # PDF/TXT export utilities
│   ├── resumeExportDOCX.ts        # DOCX export utility
│   └── resumeConverter.ts         # Format converters
└── data/
    └── sampleResume.ts            # Sample data & examples
```

---

## Quick Start

### 1. Basic Usage

```tsx
import { ResumeTemplate } from './components/resume/ResumeTemplate';
import type { ResumeTemplateData } from './types/resumeTemplate';

const myResume: ResumeTemplateData = {
  name: 'John Doe',
  email: 'john@example.com',
  phone: '(555) 123-4567',
  location: 'New York, NY',
  linkedin: 'linkedin.com/in/johndoe',

  summary: 'Experienced software engineer with 5+ years...',

  experience: [
    {
      company: 'Tech Corp',
      role: 'Senior Engineer',
      startDate: 'Jan 2020',
      endDate: 'Present',
      bullets: [
        'Led team of 5 engineers to deliver project 2 weeks ahead of schedule',
        'Improved performance by 40% through code optimization',
      ],
    },
  ],

  skills: {
    technical: ['React', 'TypeScript', 'Node.js'],
    tools: ['Git', 'Docker', 'AWS'],
  },

  education: [
    {
      institution: 'University of Technology',
      degree: 'Bachelor of Science',
      field: 'Computer Science',
      graduationDate: 'May 2018',
      gpa: '3.8',
    },
  ],
};

function MyApp() {
  return <ResumeTemplate data={myResume} />;
}
```

### 2. With Export Functionality

```tsx
import { ResumePreview } from './components/resume/ResumePreview';

function MyApp() {
  return (
    <ResumePreview
      data={myResume}
      onExport={(format) => {
        console.log(`Exported as ${format}`);
        // Track analytics, show success message, etc.
      }}
    />
  );
}
```

### 3. Custom Configuration

```tsx
import { ResumeTemplate } from './components/resume/ResumeTemplate';
import { DEFAULT_TEMPLATE_CONFIG } from './types/resumeTemplate';

const customConfig = {
  ...DEFAULT_TEMPLATE_CONFIG,
  font: 'Calibri',
  fontSize: 12,
  lineSpacing: 1.4,
  margins: {
    top: 0.75,
    right: 0.75,
    bottom: 0.75,
    left: 0.75,
  },
};

<ResumeTemplate data={myResume} config={customConfig} />
```

---

## Data Structure

### Complete Example

```typescript
const resume: ResumeTemplateData = {
  // HEADER (Required)
  name: 'Sarah Johnson',
  email: 'sarah@email.com',
  phone: '(555) 123-4567',

  // Optional header fields
  location: 'San Francisco, CA',
  linkedin: 'linkedin.com/in/sarah',
  website: 'sarah.dev',

  // TARGET ROLE (Optional - emphasizes what you're seeking)
  targetRole: 'Senior Product Manager - AI & ML',

  // SUMMARY (Required)
  summary: '8+ years of experience leading cross-functional teams...',

  // EXPERIENCE (Required)
  experience: [
    {
      company: 'Company Name',
      role: 'Job Title',
      location: 'City, ST',          // Optional
      startDate: 'Jan 2020',
      endDate: 'Present',
      bullets: [
        'Action verb + achievement + metric',
        'Led 5-person team to deliver project, increasing revenue by 40%',
        'Implemented new process that reduced costs by $500K annually',
      ],
    },
  ],

  // SKILLS (Required - use categories)
  skills: {
    technical: ['Skill 1', 'Skill 2'],
    leadership: ['Leadership skill 1', 'Leadership skill 2'],
    tools: ['Tool 1', 'Tool 2'],
    // Custom categories allowed
    certifications: ['Cert 1', 'Cert 2'],
  },

  // EDUCATION (Required)
  education: [
    {
      institution: 'University Name',
      degree: 'Bachelor of Science',
      field: 'Computer Science',      // Optional
      location: 'City, ST',           // Optional
      graduationDate: 'May 2020',
      gpa: '3.8',                     // Optional
      honors: ['Dean\'s List'],       // Optional
    },
  ],

  // OPTIONAL SECTIONS
  projects: [
    {
      name: 'Project Name',
      description: 'Brief description of project impact',
      technologies: ['Tech 1', 'Tech 2'],  // Optional
      link: 'github.com/user/project',     // Optional
      date: '2024',                        // Optional
    },
  ],

  certifications: [
    {
      name: 'Certification Name',
      issuer: 'Issuing Organization',
      date: '2023',
      credentialId: 'ID123',          // Optional
    },
  ],

  publications: [
    {
      title: 'Publication Title',
      publisher: 'Publisher Name',
      date: 'Mar 2024',
      link: 'url',                    // Optional
    },
  ],
};
```

---

## Export Functions

### PDF Export

```typescript
import { exportResumeToPDFViaPrint } from './utils/resumeExport';

// Using print dialog (recommended - better quality)
const handleExport = () => {
  const element = document.getElementById('resume');
  exportResumeToPDFViaPrint(element, 'John_Doe_Resume.pdf');
};
```

### DOCX Export

```typescript
import { exportResumeToDOCX } from './utils/resumeExportDOCX';

// Export to Microsoft Word format
const handleExport = async () => {
  await exportResumeToDOCX(resumeData, 'John_Doe_Resume.docx');
};
```

### Plain Text Export

```typescript
import { exportResumeToPlainText } from './utils/resumeExport';

// For ATS systems that only accept text
const handleExport = () => {
  exportResumeToPlainText(resumeData, 'John_Doe_Resume.txt');
};
```

---

## Integration with Existing Code

### Convert StructuredResume to Template

```typescript
import { convertStructuredResumeToTemplate } from './utils/resumeConverter';

// Your existing resume format
const existingResume: StructuredResume = { /* ... */ };

// Convert to new template format
const templateData = convertStructuredResumeToTemplate(existingResume);

// Now use with template
<ResumeTemplate data={templateData} />
```

### Convert Template back to StructuredResume

```typescript
import { convertTemplateToStructuredResume } from './utils/resumeConverter';

// If you need backwards compatibility
const structuredResume = convertTemplateToStructuredResume(templateData);
```

---

## Best Practices

### Writing Bullet Points

✅ **Good Examples:**
- "Led 5-person engineering team to deliver React dashboard 2 weeks ahead of schedule, improving user engagement by 35%"
- "Reduced API response time by 60% through database query optimization and Redis caching implementation"
- "Increased monthly revenue by $2M by launching personalized recommendation engine using machine learning"

❌ **Bad Examples:**
- "Responsible for managing team" (no metrics, passive voice)
- "Worked on various projects" (too vague)
- "Helped improve performance" (no specifics, weak verb)

### Action Verbs by Category

**Leadership:** Led, Managed, Directed, Mentored, Coordinated, Supervised
**Achievement:** Achieved, Delivered, Launched, Increased, Reduced, Improved
**Creation:** Built, Developed, Designed, Created, Implemented, Established
**Analysis:** Analyzed, Evaluated, Researched, Investigated, Assessed

### Skills Organization

```typescript
skills: {
  // Group related skills together
  technical: ['Primary skill 1', 'Primary skill 2', 'Primary skill 3'],

  // Separate tools/platforms
  tools: ['Tool 1', 'Tool 2', 'Tool 3'],

  // Leadership & soft skills if relevant
  leadership: ['Skill 1', 'Skill 2'],

  // Programming languages separate
  languages: ['JavaScript', 'Python', 'SQL'],
}
```

---

## ATS Optimization Checklist

✅ **Do:**
- Use standard section headings (Experience, Skills, Education)
- Include keywords from job description naturally
- Use simple, common fonts (Inter, Calibri, Arial)
- Keep formatting clean and consistent
- Save as PDF to preserve formatting
- Use bullet points with • symbol
- Include email and phone number
- List dates in consistent format (Mon YYYY)

❌ **Don't:**
- Use tables or columns
- Add images, icons, or graphics
- Use headers/footers
- Include horizontal lines (except section borders)
- Use text boxes
- Apply unusual fonts or colors
- Use abbreviations without spelling out first
- Put important information in headers/footers

---

## Customization Examples

### Change Font

```typescript
const config = {
  font: 'Calibri',  // 'Inter', 'Calibri', or 'Arial'
  fontSize: 11,     // 10-12pt recommended
};
```

### Adjust Spacing

```typescript
const config = {
  lineSpacing: 1.3,      // 1.2-1.4 recommended
  sectionSpacing: 16,    // pixels between sections
  margins: {
    top: 0.5,            // inches
    right: 0.5,
    bottom: 0.5,
    left: 0.5,
  },
};
```

### Custom Skill Categories

```typescript
skills: {
  // Standard categories
  technical: [...],
  tools: [...],

  // Custom categories - will be formatted automatically
  'data analysis': ['SQL', 'Python', 'R'],
  'project management': ['Agile', 'Scrum', 'Jira'],
}
```

---

## Troubleshooting

### PDF looks different than preview
- Ensure all fonts are loaded before exporting
- Use `exportResumeToPDFViaPrint` for better accuracy
- Check browser print settings (margins, scale)

### DOCX formatting issues
- DOCX export uses simpler formatting for compatibility
- Some visual styles may differ from web version
- Test opening in Microsoft Word, Google Docs, LibreOffice

### ATS not parsing correctly
- Verify using an ATS checker tool
- Ensure using standard section headings
- Remove any special characters or symbols
- Use plain text export for maximum compatibility

---

## Dependencies

Required npm packages:

```json
{
  "dependencies": {
    "html2canvas": "^1.4.1",
    "jspdf": "^2.5.1",
    "docx": "^8.5.0",
    "file-saver": "^2.0.5"
  }
}
```

Install with:
```bash
npm install html2canvas jspdf docx file-saver
```

---

## Examples

See `src/data/sampleResume.ts` for complete working examples:
- Product Manager resume
- Software Engineer resume

---

## Support

For issues or questions:
1. Check this guide first
2. Review sample data in `src/data/sampleResume.ts`
3. Test with provided export functions
4. Verify ATS compatibility with online tools

---

## Future Enhancements

Potential improvements:
- [ ] Multiple template styles (Modern, Classic, Minimal)
- [ ] Real-time ATS score calculation
- [ ] Auto-formatting of bullet points
- [ ] AI-powered content suggestions
- [ ] Multi-page resume support
- [ ] LaTeX export option
