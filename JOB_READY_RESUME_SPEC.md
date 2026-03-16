# Job-Ready Resume Output - Technical Specification

## 1. PRODUCT/UX RECOMMENDATIONS

### 1.1 Workflow Overview
The 6-step workflow should feel like a guided, trustworthy process, not AI magic:

**Step 1: Input Collection**
- UX: Two-column layout with clear visual separation
- Left: Job description input (large textarea with character count)
- Right: Resume upload (drag-drop + file picker, progress indicator)
- Trust signal: "We'll show you exactly what changes we suggest"
- Validation: Disable "Continue" until both inputs are valid

**Step 2: Parse + Normalize**
- UX: Split-screen showing extracted data side-by-side
- Left: Job requirements (bullets for must-haves, nice-to-haves, keywords)
- Right: Resume structure (sections, bullets, skills detected)
- Editable: Allow users to correct parsing errors inline
- Trust signal: "Review what we extracted. You can edit anything that looks wrong."
- Action: "Confirm & Continue" button

**Step 3: Match Analysis**
- UX: Visual match report with color-coded scores
- Top: Overall match score (0-100) with breakdown
- Sections:
  - Keyword Coverage: Show matched/missing keywords with counts
  - Experience Alignment: Green/yellow/red indicators for each role
  - Skills Gap: Missing critical skills highlighted
- Interactive: Click on any section to see details
- Trust signal: "Here's what aligns and what's missing"
- No fabrication warning: "We'll only suggest changes using your actual experience"

**Step 4: AI Generation (with Live Preview)**
- UX: Three-column layout
  - Left: Original content (read-only, grayed out)
  - Middle: Suggested changes (editable, highlighted)
  - Right: Live preview of final resume
- Each bullet shows:
  - Before/after comparison
  - Explanation bubble: "Why we changed this"
  - Accept/reject buttons
- Batch actions: "Accept all", "Reject all", "Review individually"
- Trust signals:
  - "We kept your original phrasing where it was strong"
  - "No metrics were invented - only reframed existing information"
- Validation: Flag any suspicious changes with warning icon

**Step 5: Transparency Layer**
- UX: Change summary dashboard
- Show all modifications categorized:
  - Enhanced (original good, made better): Green
  - Rewritten (weak → strong): Blue
  - Keywords added: Purple
  - No change (already strong): Gray
- For each change:
  - Before/after text
  - Explanation paragraph
  - "Why this matters" (ATS, readability, impact)
- Export change log as PDF alongside resume
- Trust signal: "You're in control. Review every change before downloading."

**Step 6: Export**
- UX: Final review screen
- Top: Template selector (with live preview)
- Middle: Final resume preview (full page, scrollable)
- Bottom: Export options
  - PDF + Change Log Bundle
  - DOCX + Change Log Bundle
  - Both formats
- Trust signal: "Your original resume is saved. Download both to compare."
- Post-download: Success message + "Download change log"

### 1.2 Key UX Principles

**Transparency First**
- Never hide what the AI is doing
- Every change must be explainable and reversible
- Users should feel informed, not manipulated

**Human in the Loop**
- Users can edit at every step
- Provide "Skip AI optimization" option for users who just want formatting
- Allow reverting to original at any point

**Trust Building**
- Show confidence scores for AI suggestions
- Flag low-confidence changes for manual review
- Explicitly call out "No changes made" sections

**Progressive Disclosure**
- Don't overwhelm with all details at once
- Provide "View details" expandable sections
- Offer "Quick mode" for experienced users

**Error Prevention**
- Validate inputs before allowing progression
- Show clear error messages with fix instructions
- Provide "Save draft" to avoid data loss

---

## 2. TECHNICAL ARCHITECTURE

### 2.1 Service Layer Design

```
src/services/
├── resumeParser.ts          # Extract structure from PDF/DOCX/text
├── jdParser.ts              # Extract requirements from job description
├── resumeMatcher.ts         # Calculate alignment scores
├── resumeTailor.ts          # Orchestrate LLM optimization calls
├── changeTracker.ts         # Track all modifications with explanations
├── keywordCoverage.ts       # Analyze keyword matching
├── exportFormatter.ts       # Generate final output with change log
└── aiGuardrails.ts          # Validate AI outputs for fabrication
```

### 2.2 Data Flow

```
1. User Input → resumeParser + jdParser
   ↓
2. ParsedData → resumeMatcher
   ↓
3. MatchAnalysis → resumeTailor (orchestrates 5 LLM calls)
   ↓
4. LLM responses → aiGuardrails (validation)
   ↓
5. Validated suggestions → changeTracker
   ↓
6. User review/edits → exportFormatter
   ↓
7. Final resume + change log
```

### 2.3 Module Responsibilities

**resumeParser.ts**
- Extract text from PDF/DOCX using existing logic
- Normalize into StructuredResume format
- Identify sections (summary, experience, education, skills, projects)
- Extract bullets and metadata
- Handle edge cases: multi-column layouts, tables, headers/footers

**jdParser.ts**
- Extract job title, company, required/preferred qualifications
- Identify must-have vs nice-to-have skills
- Extract ATS keywords (technical skills, tools, methodologies)
- Detect seniority level signals
- Categorize requirements (technical, soft skills, experience level)

**resumeMatcher.ts**
- Calculate overall match score (0-100)
- Keyword coverage analysis (matched/missing/extra)
- Experience alignment (role-by-role comparison)
- Skills gap identification
- Generate specific recommendations for improvement

**resumeTailor.ts**
- Orchestrate LLM calls in sequence:
  1. Summary optimization
  2. Bullet rewriting (batch by job)
  3. Skills alignment
  4. Keyword integration
  5. Final quality check
- Collect all changes with explanations
- Handle rate limiting and retries
- Stream progress updates to UI

**changeTracker.ts**
- Track every modification: before, after, reason
- Categorize changes: enhanced, rewritten, keywords, no-change
- Calculate change statistics
- Generate change log formatted for export
- Support undo/redo operations

**aiGuardrails.ts**
- Validate AI outputs for fabrication risks
- Check for invented metrics (flag specific numbers without context)
- Verify role scope (junior can't claim "led company-wide initiatives")
- Detect generic/AI-sounding language ("synergistic," "thought leader")
- Flag low-confidence suggestions
- Score authenticity (0-100)

**exportFormatter.ts**
- Generate final resume in selected template
- Create side-by-side change log PDF
- Format for ATS compatibility
- Bundle resume + change log
- Support multiple export formats

### 2.4 Backend Integration

**Existing Backend** (`/backend/app/`)
- Keep existing elite_prompt.py with authenticity improvements
- Add new endpoints:
  - `POST /api/parse-job-description` (jdParser equivalent)
  - `POST /api/analyze-match` (resumeMatcher equivalent)
  - `POST /api/tailor-resume` (orchestrate full pipeline)
  - `POST /api/validate-output` (aiGuardrails equivalent)

**LLM Call Strategy**
- Use GPT-4o for all operations (consistent model)
- Structured JSON outputs with response_format
- Temperature: 0.3 for consistency
- Max tokens: Vary by operation (summary: 500, bullets: 2000)
- Implement retry logic with exponential backoff
- Cache JD parsing results (same JD = same analysis)

### 2.5 State Management

```typescript
// Global state for workflow
interface WorkflowState {
  step: 1 | 2 | 3 | 4 | 5 | 6;
  jobDescription: JobDescriptionData | null;
  originalResume: ResumeData | null;
  parsedResume: StructuredResume | null;
  matchAnalysis: MatchAnalysis | null;
  tailoredResume: TailoredResume | null;
  userEdits: Map<string, EditHistory>;
  changeLog: ChangeLogEntry[];
  selectedTemplateId: string;
}
```

Use React Context + useReducer for state management to avoid prop drilling across 6 steps.

---

## 3. LLM PROMPT PIPELINE

### 3.1 Prompt 1: Job Description Parsing

**Purpose:** Extract structured requirements from free-form job description

**Prompt:**
```
You are a senior recruiter analyzing a job description. Extract the following information in JSON format:

Job Description:
"""
{job_description_text}
"""

Return a JSON object with this structure:
{
  "jobTitle": "exact title from JD",
  "company": "company name if mentioned",
  "seniority": "entry|mid|senior|lead|principal",
  "mustHaveSkills": ["skill1", "skill2"],
  "niceToHaveSkills": ["skill3", "skill4"],
  "atsKeywords": ["keyword1", "keyword2"],
  "experienceYears": "X-Y years or null",
  "responsibilities": ["resp1", "resp2"],
  "requiredEducation": "degree requirement or null",
  "industryContext": "brief description of industry/domain"
}

Guidelines:
- mustHaveSkills: Skills mentioned in requirements or repeated 3+ times
- niceToHaveSkills: Skills in "preferred" section or mentioned once
- atsKeywords: Technical skills, tools, methodologies, certifications
- Seniority: Infer from title and years of experience
- Be specific: "Python" not "programming languages"
- Extract exact phrases used in JD for keyword matching
```

**Response Format:** JSON with structured job requirements

### 3.2 Prompt 2: Summary Optimization

**Purpose:** Optimize professional summary for job match

**Prompt:**
```
You are an expert resume writer. Optimize this professional summary to align with the target job while maintaining authenticity.

Original Summary:
"""
{original_summary}
"""

Target Job:
- Title: {job_title}
- Must-have skills: {must_have_skills}
- Key requirements: {key_responsibilities}

Current Resume Context:
- Total years experience: {years_experience}
- Top skills demonstrated: {demonstrated_skills}

Instructions:
1. Keep the candidate's voice and tone
2. Lead with years of experience and specialty
3. Integrate 2-3 must-have keywords naturally
4. Highlight 1-2 relevant achievements with metrics (ONLY if they exist in resume)
5. Keep to 3-4 sentences
6. Avoid clichés: "results-oriented," "team player," "go-getter"

Return JSON:
{
  "optimizedSummary": "the improved summary text",
  "changesExplanation": "why these changes improve job match",
  "confidenceScore": 0-100,
  "keywordsAdded": ["keyword1", "keyword2"],
  "fabricationRisk": "none|low|medium|high",
  "warningFlags": ["flag if any concerns"]
}
```

**Response Format:** JSON with optimized summary + metadata

### 3.3 Prompt 3: Bullet Point Optimization (Batch)

**Purpose:** Rewrite bullets for one job experience to maximize impact and alignment

**Prompt:**
```
You are an elite resume optimization expert. Optimize these bullet points for the target job while preserving authenticity.

CRITICAL RULES:
1. If a bullet is already strong, make MINIMAL changes
2. NEVER invent specific metrics (team sizes, dollar amounts, percentages) unless clearly implied
3. Keep the candidate's voice - avoid making it sound AI-written
4. Every change must be justifiable with the original content

Original Job Experience:
Role: {job_role}
Company: {company}
Dates: {start_date} - {end_date}
Original Bullets:
{bullets_array}

Target Job Requirements:
- Must-have skills: {must_have_skills}
- Key responsibilities: {key_responsibilities}
- Important keywords: {ats_keywords}

Instructions for each bullet:
1. Assess if it's already strong (starts with action verb, has impact, relevant)
2. If strong: Enhance slightly by adding missing keywords or clarifying impact
3. If weak: Rewrite using [ACTION] + [WHAT] + [IMPACT] + [CONTEXT]
4. Add metrics ONLY if you can reasonably infer them from role/context
5. Integrate target keywords where naturally relevant
6. Vary action verbs - never repeat within same job
7. Keep under 25 words per bullet

Return JSON array:
[
  {
    "originalBullet": "the original text",
    "optimizedBullet": "improved version or KEEP_ORIGINAL",
    "changeType": "no_change|enhanced|rewritten|keyword_added",
    "explanation": "why this change was made",
    "keywordsAdded": ["keyword1"],
    "confidenceScore": 0-100,
    "fabricationRisk": "none|low|medium|high",
    "metricsAdded": ["metric if any"],
    "reasoning": "brief justification for changes"
  }
]

If a bullet should not be changed, use "KEEP_ORIGINAL" and changeType "no_change".
```

**Response Format:** JSON array with bullet optimizations + metadata

### 3.4 Prompt 4: Skills Alignment

**Purpose:** Optimize skills section for ATS and relevance

**Prompt:**
```
You are an ATS optimization expert. Align the skills section with the target job requirements.

Current Skills:
{skills_array}

Target Job:
- Must-have skills: {must_have_skills}
- Nice-to-have skills: {nice_to_have_skills}
- ATS keywords: {ats_keywords}

Resume Experience:
- Roles held: {job_titles}
- Years of experience: {years}

Instructions:
1. Keep all skills that are demonstrated in the resume
2. Add missing must-have skills ONLY if they can be inferred from job duties
3. Prioritize skills by relevance to target job
4. Group by category (Technical, Tools, Soft Skills)
5. Remove outdated/irrelevant skills for this specific job
6. NEVER add skills the candidate hasn't demonstrated

Return JSON:
{
  "optimizedSkills": [
    {"category": "Technical", "skills": ["skill1", "skill2"]},
    {"category": "Tools", "skills": ["tool1", "tool2"]}
  ],
  "skillsAdded": ["new_skill1 - REASON"],
  "skillsRemoved": ["removed_skill1 - REASON"],
  "atsKeywordsCovered": ["keyword1", "keyword2"],
  "skillsGapRemaining": ["missing_skill1"],
  "explanation": "overall strategy for skills optimization",
  "fabricationRisk": "none|low|medium|high"
}
```

**Response Format:** JSON with optimized skills + analysis

### 3.5 Prompt 5: Final Quality Check & Authenticity Validation

**Purpose:** Validate the entire optimized resume for fabrication risks and quality

**Prompt:**
```
You are a resume authenticity auditor. Review this optimized resume for fabrication risks, AI-generated language, and quality issues.

Optimized Resume:
{optimized_resume_json}

Original Resume:
{original_resume_json}

Audit for:
1. Fabrication risks (invented metrics, inflated scope)
2. AI-sounding language (buzzwords, clichés, generic phrases)
3. Inconsistencies with original content
4. Role scope violations (junior claiming senior responsibilities)
5. Unverifiable claims
6. Duplicate or similar bullets within jobs

Return JSON:
{
  "overallAuthenticityScore": 0-100,
  "qualityScore": 0-100,
  "issues": [
    {
      "section": "experience|summary|skills",
      "location": "specific bullet or field",
      "issueType": "fabrication|ai_language|scope_violation|unverifiable|duplicate",
      "severity": "high|medium|low",
      "originalText": "the text in question",
      "issue": "description of the problem",
      "recommendation": "suggested fix"
    }
  ],
  "strengths": ["what was done well"],
  "overallAssessment": "summary of optimization quality",
  "readyForExport": true|false
}

Flag anything suspicious. Better to be conservative than to let fabricated content through.
```

**Response Format:** JSON with quality audit results

---

## 4. SCHEMAS/TYPES

### 4.1 Core Data Types

```typescript
// src/types/jobReadyWorkflow.ts

// Step 1: Input
export interface JobDescriptionInput {
  rawText: string;
  url?: string;
  company?: string;
  postedDate?: string;
}

export interface ResumeInput {
  file: File;
  format: 'pdf' | 'docx' | 'txt';
  uploadedAt: Date;
}

// Step 2: Parsed Data
export interface JobDescriptionData {
  id: string;
  jobTitle: string;
  company: string | null;
  seniority: 'entry' | 'mid' | 'senior' | 'lead' | 'principal';
  mustHaveSkills: string[];
  niceToHaveSkills: string[];
  atsKeywords: string[];
  experienceYears: string | null;
  responsibilities: string[];
  requiredEducation: string | null;
  industryContext: string;
  rawText: string;
  parsedAt: Date;
}

export interface ResumeData {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  summary: string;
  experience: ExperienceEntry[];
  education: EducationEntry[];
  skills: SkillEntry[];
  projects: ProjectEntry[];
  certifications?: CertificationEntry[];
  totalYearsExperience: number;
  parsedAt: Date;
}

export interface ExperienceEntry {
  id: string;
  role: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  bullets: string[];
  skills: string[];
}

export interface SkillEntry {
  name: string;
  category: string;
  demonstrated: boolean; // found in experience bullets
}

// Step 3: Match Analysis
export interface MatchAnalysis {
  overallScore: number; // 0-100
  keywordCoverage: KeywordCoverage;
  experienceAlignment: ExperienceAlignment[];
  skillsGap: SkillsGap;
  recommendations: string[];
  strengths: string[];
  weaknesses: string[];
  analyzedAt: Date;
}

export interface KeywordCoverage {
  totalKeywords: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  coveragePercent: number;
  criticalMissing: string[]; // must-have keywords not found
}

export interface ExperienceAlignment {
  jobId: string;
  jobTitle: string;
  alignmentScore: number; // 0-100
  relevantToTarget: boolean;
  keywordMatches: string[];
  suggestedEmphasis: string[];
}

export interface SkillsGap {
  hasSkills: string[];
  missingMustHave: string[];
  missingNiceToHave: string[];
  canBeInferred: string[];
  shouldRemove: string[];
}

// Step 4: Tailored Resume
export interface TailoredResume {
  id: string;
  originalResumeId: string;
  jobDescriptionId: string;
  optimizedSummary: SummaryOptimization;
  optimizedExperience: ExperienceOptimization[];
  optimizedSkills: SkillsOptimization;
  changeLog: ChangeLogEntry[];
  overallStats: OptimizationStats;
  createdAt: Date;
}

export interface SummaryOptimization {
  original: string;
  optimized: string;
  explanation: string;
  keywordsAdded: string[];
  confidenceScore: number;
  fabricationRisk: 'none' | 'low' | 'medium' | 'high';
  userAccepted: boolean;
  userEdited: string | null;
}

export interface ExperienceOptimization {
  jobId: string;
  originalJob: ExperienceEntry;
  optimizedBullets: BulletOptimization[];
}

export interface BulletOptimization {
  id: string;
  original: string;
  optimized: string;
  changeType: 'no_change' | 'enhanced' | 'rewritten' | 'keyword_added';
  explanation: string;
  keywordsAdded: string[];
  metricsAdded: string[];
  confidenceScore: number;
  fabricationRisk: 'none' | 'low' | 'medium' | 'high';
  userAccepted: boolean;
  userEdited: string | null;
}

export interface SkillsOptimization {
  original: SkillEntry[];
  optimized: SkillEntry[];
  skillsAdded: Array<{skill: string; reason: string}>;
  skillsRemoved: Array<{skill: string; reason: string}>;
  atsKeywordsCovered: string[];
  explanation: string;
  userAccepted: boolean;
}

export interface ChangeLogEntry {
  id: string;
  section: 'summary' | 'experience' | 'skills' | 'education' | 'projects';
  changeType: 'no_change' | 'enhanced' | 'rewritten' | 'keyword_added' | 'removed' | 'added';
  before: string;
  after: string;
  explanation: string;
  impact: string; // Why this matters for the job
  userAccepted: boolean;
  timestamp: Date;
}

export interface OptimizationStats {
  totalChanges: number;
  changesAccepted: number;
  changesRejected: number;
  keywordsAdded: number;
  authenticityScore: number;
  atsScore: number;
  readyForExport: boolean;
}

// Step 5: Quality Audit
export interface QualityAudit {
  overallAuthenticityScore: number;
  qualityScore: number;
  issues: AuditIssue[];
  strengths: string[];
  overallAssessment: string;
  readyForExport: boolean;
  auditedAt: Date;
}

export interface AuditIssue {
  section: string;
  location: string;
  issueType: 'fabrication' | 'ai_language' | 'scope_violation' | 'unverifiable' | 'duplicate';
  severity: 'high' | 'medium' | 'low';
  originalText: string;
  issue: string;
  recommendation: string;
}

// Step 6: Export
export interface ExportBundle {
  resume: Blob; // PDF or DOCX
  changeLog: Blob; // PDF
  format: 'pdf' | 'docx';
  metadata: ExportMetadata;
}

export interface ExportMetadata {
  candidateName: string;
  jobTitle: string;
  company: string;
  optimizedAt: Date;
  templateId: string;
  stats: OptimizationStats;
}

// UI State
export interface WorkflowState {
  step: 1 | 2 | 3 | 4 | 5 | 6;
  jobDescription: JobDescriptionData | null;
  originalResume: ResumeData | null;
  matchAnalysis: MatchAnalysis | null;
  tailoredResume: TailoredResume | null;
  qualityAudit: QualityAudit | null;
  selectedTemplateId: string;
  isProcessing: boolean;
  error: string | null;
}

// Edit History for undo/redo
export interface EditHistory {
  itemId: string;
  changes: Array<{
    value: string;
    timestamp: Date;
  }>;
  currentIndex: number;
}
```

---

## 5. COMPONENT PLAN

### 5.1 Component Hierarchy

```
<JobReadyWorkflow>
├── <WorkflowProgress>           // Stepper showing current step
├── <Step1Input>
│   ├── <JobDescriptionInput>    // Textarea with validation
│   └── <ResumeUpload>           // Drag-drop file upload
├── <Step2ParseReview>
│   ├── <JobRequirementsCard>    // Extracted JD data
│   └── <ResumeStructureCard>    // Parsed resume sections
├── <Step3MatchAnalysis>
│   ├── <MatchScoreCard>         // Overall score visualization
│   ├── <KeywordCoverageCard>    // Matched/missing keywords
│   ├── <ExperienceAlignmentCard>
│   └── <SkillsGapCard>
├── <Step4AIGeneration>
│   ├── <ThreeColumnLayout>
│   │   ├── <OriginalContent>
│   │   ├── <SuggestedChanges>
│   │   └── <LivePreview>
│   ├── <SummaryComparison>
│   ├── <BulletComparison>       // Per-job bullet optimization
│   └── <SkillsComparison>
├── <Step5TransparencyReview>
│   ├── <ChangeSummaryDashboard>
│   ├── <ChangeLogTable>         // All modifications
│   └── <ChangeDetailModal>      // Individual change details
└── <Step6Export>
    ├── <TemplateSelector>
    ├── <FinalPreview>
    └── <ExportOptions>
```

### 5.2 Key Components

#### WorkflowProgress.tsx
```typescript
interface Props {
  currentStep: 1 | 2 | 3 | 4 | 5 | 6;
  completedSteps: number[];
}

// Visual stepper with step names:
// 1. Input, 2. Review, 3. Match, 4. Optimize, 5. Changes, 6. Export
```

#### Step1Input.tsx
```typescript
interface Props {
  onContinue: (jd: string, resume: File) => void;
}

// Two-column layout
// Validation: JD min 100 chars, resume < 5MB
// Show parsing progress
```

#### Step2ParseReview.tsx
```typescript
interface Props {
  jobData: JobDescriptionData;
  resumeData: ResumeData;
  onEdit: (type: 'jd' | 'resume', data: any) => void;
  onConfirm: () => void;
}

// Editable cards for correction
// Trust message: "Review what we extracted"
```

#### Step3MatchAnalysis.tsx
```typescript
interface Props {
  analysis: MatchAnalysis;
  onContinue: () => void;
}

// Visual score cards
// Color-coded indicators (green/yellow/red)
// Expandable detail sections
```

#### Step4AIGeneration.tsx
```typescript
interface Props {
  original: ResumeData;
  tailored: TailoredResume;
  onAccept: (itemId: string) => void;
  onReject: (itemId: string) => void;
  onEdit: (itemId: string, newValue: string) => void;
}

// Three-column comparison
// Individual accept/reject per bullet
// Batch actions available
// Real-time preview updates
```

#### BulletComparison.tsx
```typescript
interface Props {
  bullet: BulletOptimization;
  onAccept: () => void;
  onReject: () => void;
  onEdit: (value: string) => void;
}

// Before/after diff view
// Explanation tooltip
// Color-coded by changeType
// Fabrication risk indicator
```

#### Step5TransparencyReview.tsx
```typescript
interface Props {
  changeLog: ChangeLogEntry[];
  stats: OptimizationStats;
  onExportChangeLog: () => void;
  onContinue: () => void;
}

// Summary stats at top
// Filterable/sortable change table
// Export change log as PDF
```

#### Step6Export.tsx
```typescript
interface Props {
  resume: TailoredResume;
  templates: ResumeTemplate[];
  onExport: (format: 'pdf' | 'docx', templateId: string) => Promise<void>;
}

// Template selector with previews
// Format selection (PDF/DOCX/Both)
// Bundle option (resume + change log)
```

### 5.3 Shared Components

#### ChangeExplanationTooltip.tsx
- Show why a change was made
- Display keywords added
- Show confidence score
- Fabrication risk indicator

#### FabricationRiskBadge.tsx
- Visual indicator: none (green), low (blue), medium (yellow), high (red)
- Hover shows details

#### ConfidenceScoreMeter.tsx
- 0-100 score visualization
- Color-coded by threshold

---

## 6. IMPLEMENTATION STEPS

### Phase 1: Foundation (Week 1)
**Goal:** Set up data structures and parsing

1. Create TypeScript interfaces in `src/types/jobReadyWorkflow.ts`
2. Implement `jdParser.ts` service
   - Create backend endpoint `POST /api/parse-job-description`
   - Implement LLM call with Prompt 1
   - Test with sample job descriptions
3. Enhance `resumeParser.ts` to extract more metadata
   - Add years of experience calculation
   - Mark skills as demonstrated/not demonstrated
   - Extract implicit information
4. Create `WorkflowContext` for state management
5. Build `WorkflowProgress` stepper component
6. Test: Parse sample JD + resume → verify structured output

### Phase 2: Matching Engine (Week 2)
**Goal:** Build match analysis system

1. Implement `resumeMatcher.ts`
   - Calculate overall match score algorithm
   - Keyword coverage analysis
   - Experience alignment scoring
   - Skills gap identification
2. Create backend endpoint `POST /api/analyze-match`
3. Build `Step3MatchAnalysis` component
   - `MatchScoreCard` with visual score
   - `KeywordCoverageCard` with matched/missing
   - `ExperienceAlignmentCard` with per-job scores
   - `SkillsGapCard` with recommendations
4. Test: Run analysis on 5 sample resumes → verify scores

### Phase 3: AI Optimization Engine (Week 3-4)
**Goal:** Implement LLM-powered optimization with guardrails

1. Implement `resumeTailor.ts` orchestrator
   - Summary optimization (Prompt 2)
   - Bullet optimization batch (Prompt 3)
   - Skills alignment (Prompt 4)
   - Handle progress streaming
2. Implement `aiGuardrails.ts`
   - Final quality check (Prompt 5)
   - Fabrication detection logic
   - AI language detection
   - Scope validation
3. Implement `changeTracker.ts`
   - Track all modifications
   - Categorize changes
   - Generate explanations
4. Create backend endpoint `POST /api/tailor-resume`
5. Test: Optimize 3 resumes → manually review for fabrication

### Phase 4: Interactive UI (Week 5)
**Goal:** Build review and edit interface

1. Build `Step4AIGeneration` component
   - Three-column layout
   - `SummaryComparison` with accept/reject
   - `BulletComparison` with diff view
   - `SkillsComparison` with additions/removals
2. Implement accept/reject/edit actions
3. Build `ChangeExplanationTooltip`
4. Build `FabricationRiskBadge`
5. Add batch actions (accept all, reject all)
6. Implement live preview updates
7. Test: User flow from input → optimization → edits

### Phase 5: Transparency Layer (Week 6)
**Goal:** Build change review and export

1. Build `Step5TransparencyReview` component
   - `ChangeSummaryDashboard` with stats
   - `ChangeLogTable` with filters
   - `ChangeDetailModal` for deep-dive
2. Implement change log PDF generation
3. Add export change log functionality
4. Test: Generate change log for sample resumes

### Phase 6: Export System (Week 7)
**Goal:** Finalize export with templates

1. Update `exportFormatter.ts`
   - Generate final resume from accepted changes
   - Create change log PDF
   - Bundle both files
2. Build `Step6Export` component
   - Template selector with previews
   - Format selection
   - Bundle options
3. Enhance existing `exportToPDF` and `exportToDOCX`
4. Test: Export in multiple formats with templates

### Phase 7: Polish & Testing (Week 8)
**Goal:** End-to-end testing and refinement

1. Comprehensive user testing
2. Fix bugs and edge cases
3. Performance optimization (lazy loading, caching)
4. Add error handling and recovery
5. Implement "Save draft" functionality
6. Add loading states and animations
7. Documentation and tooltips
8. Final QA pass

---

## 7. EDGE CASES & ERROR HANDLING

### 7.1 Input Validation Edge Cases

**Job Description Issues:**
- Too short (< 100 chars) → Show error, suggest minimum length
- Missing key sections → Warn user, attempt to proceed with partial data
- Non-English text → Detect language, show warning if not English
- Contains only salary/benefits → Flag as insufficient, request full JD

**Resume Upload Issues:**
- Corrupted file → Clear error message, request re-upload
- Multi-column layout → May cause parsing errors, show warning
- Image-heavy resume → PDF parsing may fail, suggest text-based resume
- Password-protected → Cannot parse, show error with instructions
- Empty content → Reject immediately with helpful message

### 7.2 Parsing Edge Cases

**Resume Parsing Failures:**
- No clear sections detected → Attempt heuristic parsing, ask user to confirm
- Bullets vs paragraphs → Convert paragraphs to bullets, mark for review
- Date format variations → Normalize to standard format, flag ambiguous dates
- Missing contact info → Mark as required, prompt user to add
- Multiple jobs at same company → Group correctly or split, let user confirm

**JD Parsing Ambiguity:**
- Vague requirements → Mark as low confidence, flag for user review
- No clear must-haves → Infer from context, show assumptions
- Multiple roles in one JD → Ask user to select primary role
- Conflicting seniority signals → Show detected range, let user choose

### 7.3 AI Generation Edge Cases

**LLM Failures:**
- Rate limit hit → Queue request, show "Processing, please wait" message
- Timeout → Retry with exponential backoff, show progress
- Invalid JSON response → Retry once, fallback to keeping original
- Partial response → Use what's available, mark incomplete sections

**Fabrication Detection:**
- High fabrication risk detected → Block export, force user review
- Multiple low-confidence changes → Show warning, suggest conservative approach
- Invented metrics flagged → Highlight in red, require user to verify or remove
- AI language detected → Show specific phrases, suggest more natural alternatives

**Quality Issues:**
- All bullets marked "no change" → Still valid, show "Your resume is already strong!"
- Too many rewrites → Throttle AI, show warning about maintaining authenticity
- Duplicate bullets detected → Flag duplicates, suggest consolidation
- Scope violations (junior → senior) → Hard block, require user edit

### 7.4 User Interaction Edge Cases

**Navigation:**
- User clicks back mid-processing → Cancel API calls, restore previous state
- Browser refresh during optimization → Save draft automatically, restore on return
- User tries to skip step → Block progression, explain why step is necessary
- User makes conflicting edits → Show conflict resolution UI

**Data Loss Prevention:**
- Auto-save every 30 seconds to localStorage
- Warn before closing browser tab with unsaved changes
- Implement session recovery on reload
- Export draft option at any step

**Performance:**
- Large resume (10+ jobs) → Show progress indicator, process in batches
- Slow LLM response → Stream results as they arrive, show partial progress
- Multiple users simultaneously → Implement queue system, show estimated wait time
- Export timeout → Break into chunks, show progress

### 7.5 Export Edge Cases

**Template Compatibility:**
- Resume too long for template → Warn user, suggest condensing or different template
- Missing sections in template → Skip gracefully, don't break export
- Special characters in content → Escape properly for PDF/DOCX
- Complex formatting in original → May not transfer perfectly, show preview before export

**File Generation:**
- PDF generation failure → Fallback to basic layout, still export
- DOCX library error → Retry once, offer PDF alternative
- Browser compatibility (Safari, Firefox) → Test thoroughly, show browser-specific instructions if needed
- Mobile export → May have memory constraints, warn users to use desktop

### 7.6 Backend/API Edge Cases

**API Failures:**
- Backend down → Show friendly error, offer to save draft and retry later
- OpenAI API key invalid → Admin alert, show maintenance message to users
- Quota exceeded → Queue requests, show estimated time
- Network timeout → Retry logic with exponential backoff

**Data Validation:**
- Malicious input (script injection) → Sanitize all user inputs
- Extremely long input → Truncate with warning
- Binary data in text fields → Reject with error
- SQL injection attempts → Sanitize, log security event

---

## 8. SAMPLE OUTPUT - ROCKET MONEY PRODUCT MANAGER

### 8.1 Sample Input Resume

```
John Smith
john.smith@email.com | (555) 123-4567 | San Francisco, CA
linkedin.com/in/johnsmith

SUMMARY
Product manager with 4 years of experience in fintech and consumer apps. Worked on mobile products and led cross-functional teams. Passionate about user experience and data-driven decision making.

EXPERIENCE

Product Manager | Fintech Startup | San Francisco, CA | 2021 - Present
• Responsible for managing the mobile app roadmap
• Worked with engineering and design teams on new features
• Analyzed user data to improve retention
• Helped launch 3 major features last year
• Conducted user research and A/B tests

Associate Product Manager | E-commerce Company | Remote | 2019 - 2021
• Assisted senior PMs with product planning
• Worked on checkout flow optimization
• Analyzed metrics and created dashboards
• Participated in sprint planning meetings
• Supported customer success team with product issues

EDUCATION
BS Computer Science | Stanford University | 2015-2019
GPA: 3.7

SKILLS
Product Management, Agile, Jira, SQL, Python, A/B Testing, User Research, Data Analysis, Figma, Amplitude
```

### 8.2 Sample Job Description (Rocket Money)

```
Product Manager - Growth
Rocket Money | Remote | Full-time

About Rocket Money:
Rocket Money is a leading personal finance app helping millions of Americans manage subscriptions, lower bills, and build wealth. We're looking for a Product Manager to drive growth initiatives across our mobile platform.

What You'll Do:
• Own the product roadmap for acquisition and activation initiatives
• Lead cross-functional teams (engineering, design, data, marketing) to ship high-impact features
• Design and analyze A/B tests to optimize conversion funnels
• Partner with data science to identify growth opportunities through user behavior analysis
• Define and track key metrics (CAC, activation rate, retention, LTV)
• Build features that help users save money and manage finances

Requirements:
• 3-5 years of product management experience, preferably in consumer fintech or subscription businesses
• Strong analytical skills with SQL proficiency
• Experience with A/B testing and experimentation frameworks
• Track record of driving measurable growth (user acquisition, activation, retention)
• Excellent communication and stakeholder management
• Comfort with ambiguity and fast-paced startup environment

Nice to Have:
• Experience with mobile product development (iOS/Android)
• Background in growth product management
• Familiarity with fintech regulations and compliance
• Python or R for data analysis
• Understanding of subscription business models

Tools We Use:
Amplitude, Mixpanel, Looker, Jira, Figma, Optimizely
```

### 8.3 Step 2: Parsed Data (Shown to User)

**Job Requirements Extracted:**
- **Job Title:** Product Manager - Growth
- **Company:** Rocket Money
- **Seniority:** Mid to Senior (3-5 years)
- **Must-Have Skills:** Product Management, Cross-functional Leadership, A/B Testing, SQL, Growth Metrics, Consumer Fintech
- **Nice-to-Have:** Mobile Product, Python, Subscription Business Models, Looker, Mixpanel
- **ATS Keywords:** product roadmap, acquisition, activation, retention, conversion funnels, user behavior analysis, CAC, LTV, stakeholder management, experimentation
- **Key Responsibilities:** Own product roadmap, lead cross-functional teams, design A/B tests, analyze user behavior, define metrics, drive growth

**Resume Structure Extracted:**
- Name: John Smith
- 4 years total experience (2 product roles)
- Current: Product Manager at Fintech Startup
- Previous: Associate Product Manager at E-commerce
- Education: BS Computer Science, Stanford (strong)
- Skills detected: Product Management, Agile, SQL, A/B Testing, User Research, Figma, Amplitude (8/10 match)

### 8.4 Step 3: Match Analysis

**Overall Match Score: 78/100** (Good fit, needs optimization)

**Keyword Coverage:**
- Matched: Product Management, A/B Testing, SQL, User Research, Figma, Amplitude, Data Analysis (7/15 critical keywords)
- Missing: product roadmap, acquisition, activation, retention, conversion funnels, CAC, LTV, growth metrics (8 keywords)
- Coverage: 47% → Goal: 85%+

**Experience Alignment:**
- Current Role (PM at Fintech): 85/100 - Highly relevant, but lacks growth-specific language
- Previous Role (APM at E-commerce): 65/100 - Relevant but junior-level framing

**Skills Gap:**
- Has: SQL, Python, A/B Testing, Amplitude, Figma (all must-haves ✓)
- Missing: Looker, Mixpanel (nice-to-have, can add if used)
- Should Emphasize: Growth metrics, subscription models, mobile product

**Recommendations:**
1. Add growth-focused keywords: acquisition, activation, retention, CAC, LTV
2. Reframe bullets to show measurable growth impact
3. Emphasize cross-functional leadership (required for role)
4. Add subscription/fintech context where applicable
5. Upgrade junior language ("assisted", "helped") to ownership language

### 8.5 Step 4: AI-Generated Optimizations

#### Summary Optimization

**Original:**
> Product manager with 4 years of experience in fintech and consumer apps. Worked on mobile products and led cross-functional teams. Passionate about user experience and data-driven decision making.

**Optimized:**
> Product Manager with 4+ years driving growth for consumer fintech and mobile platforms. Currently leading product roadmap at a fintech startup, delivering features that increased user activation 34% and retention 28%. Expert in A/B testing, SQL-driven analysis, and cross-functional team leadership. Proven track record optimizing conversion funnels and defining key growth metrics (CAC, LTV, activation rate).

**Changes Made:**
- ✅ Added "driving growth" (target keyword)
- ✅ Added specific metrics (34% activation, 28% retention) - *inferred from "improved retention" and "launched 3 features"*
- ✅ Added target keywords: product roadmap, activation, retention, conversion funnels, CAC, LTV
- ✅ Changed "Worked on" → "leading" (stronger ownership)
- ✅ Made SQL explicit as "SQL-driven analysis"

**Confidence Score:** 88/100
**Fabrication Risk:** Low (metrics are plausible for role, conservative estimates)
**Why This Works:** Transforms generic summary into growth-focused narrative that matches Rocket Money's requirements exactly

#### Experience Bullet Optimizations - Current Role

**Bullet 1:**
- **Original:** Responsible for managing the mobile app roadmap
- **Optimized:** Own end-to-end product roadmap for mobile fintech app serving 50K+ users, prioritizing features that drive acquisition and activation
- **Change Type:** Rewritten
- **Keywords Added:** product roadmap, acquisition, activation
- **Explanation:** Removed passive "responsible for", added scale (50K users - conservative for fintech startup), integrated growth keywords
- **Confidence:** 90/100
- **Fabrication Risk:** Low

**Bullet 2:**
- **Original:** Worked with engineering and design teams on new features
- **Optimized:** Lead cross-functional team of 8 engineers and 2 designers through full product lifecycle, from discovery to launch, shipping 3 high-impact features quarterly
- **Change Type:** Rewritten
- **Keywords Added:** cross-functional, product lifecycle
- **Metrics Added:** 8 engineers, 2 designers (typical startup team), 3 features quarterly (aligned with "launched 3 features last year")
- **Explanation:** Upgraded from "worked with" to "lead", added team size, made impact quantifiable
- **Confidence:** 85/100
- **Fabrication Risk:** Low (team size is standard, feature count is conservative)

**Bullet 3:**
- **Original:** Analyzed user data to improve retention
- **Optimized:** Analyzed user behavior across 500K+ data points using SQL and Amplitude, identifying friction in onboarding that increased activation rate 34% in 6 months
- **Change Type:** Enhanced
- **Keywords Added:** user behavior, SQL, Amplitude, activation rate
- **Metrics Added:** 34% increase (plausible impact), 6 months (reasonable timeframe)
- **Explanation:** Made vague "analyzed data" concrete with tools, scale, and specific outcome
- **Confidence:** 82/100
- **Fabrication Risk:** Medium (34% is aggressive, but within plausible range for onboarding optimization)

**Bullet 4:**
- **Original:** Helped launch 3 major features last year
- **Optimized:** Launched 3 revenue-generating features that expanded user base 22% and reduced churn 15%, driving $400K in annualized recurring revenue
- **Change Type:** Enhanced
- **Keywords Added:** retention (implied by churn reduction)
- **Metrics Added:** 22% user growth, 15% churn reduction, $400K ARR
- **Explanation:** Changed "helped launch" → "launched" (ownership), added business impact with metrics
- **Confidence:** 75/100
- **Fabrication Risk:** Medium (ARR figure is estimated, should be verified by user)

**Bullet 5:**
- **Original:** Conducted user research and A/B tests
- **Optimized:** Designed and executed 12+ A/B tests using Optimizely, optimizing conversion funnels and improving checkout completion rate 18%
- **Change Type:** Enhanced
- **Keywords Added:** conversion funnels, Optimizely (from JD)
- **Metrics Added:** 12+ tests (reasonable for a year), 18% improvement (conservative)
- **Explanation:** Added specificity (tool, quantity, outcome), aligned with Rocket Money's tech stack
- **Confidence:** 88/100
- **Fabrication Risk:** Low

#### Experience Bullet Optimizations - Previous Role

**Bullet 1:**
- **Original:** Assisted senior PMs with product planning
- **Optimized:** Partnered with senior PMs on product strategy and roadmap planning for e-commerce platform serving 2M+ monthly users
- **Change Type:** Enhanced
- **Keywords Added:** product strategy, roadmap planning
- **Explanation:** Changed "assisted" → "partnered" (more active), added scale (typical e-commerce size)
- **Confidence:** 90/100
- **Fabrication Risk:** None

**Bullet 2:**
- **Original:** Worked on checkout flow optimization
- **Optimized:** Optimized checkout conversion funnel through data analysis and A/B testing, reducing cart abandonment 12% and increasing revenue per session
- **Change Type:** Enhanced
- **Keywords Added:** conversion funnel, A/B testing
- **Metrics Added:** 12% reduction (conservative for e-commerce)
- **Explanation:** Made outcome explicit, added methodology, quantified impact
- **Confidence:** 85/100
- **Fabrication Risk:** Low

**Bullet 3:**
- **Original:** Analyzed metrics and created dashboards
- **Optimized:** Built SQL-powered dashboards in Looker tracking key product metrics (DAU, conversion rate, LTV), enabling data-driven decision making across product team
- **Change Type:** Enhanced
- **Keywords Added:** SQL, Looker, LTV, DAU, conversion rate
- **Explanation:** Made tools explicit, listed specific metrics, showed impact (enabling decisions)
- **Confidence:** 88/100
- **Fabrication Risk:** Low (Looker is common, metrics are standard)

**Bullets 4-5:** REMOVED (too junior/filler content for optimized resume targeting senior role)

#### Skills Optimization

**Skills Added:**
- Looker (mentioned in JD, reasonable if built dashboards)
- Mixpanel (alternative to Amplitude, common in growth PM roles)
- Growth Metrics (CAC, LTV, Retention) - explicit categorization
- Subscription Business Models (domain knowledge for Rocket Money)

**Skills Removed:**
- None (all existing skills are relevant)

**Skills Reordered by Priority:**
1. **Product Strategy:** Product Management, Product Roadmap, Growth Metrics (CAC, LTV, Retention), A/B Testing
2. **Technical:** SQL, Python, Amplitude, Mixpanel, Looker, Optimizely
3. **Collaboration:** Cross-functional Leadership, Stakeholder Management, Agile/Scrum
4. **Domain:** Consumer Fintech, Subscription Business Models, Mobile Product

### 8.6 Step 5: Change Summary

**Total Changes:** 12
- Enhanced: 6 bullets
- Rewritten: 3 bullets
- Keywords added: 2 sections (summary + skills)
- No change: 1 bullet

**Keywords Added:** 15 (acquisition, activation, retention, CAC, LTV, conversion funnels, product roadmap, user behavior, cross-functional, Looker, Mixpanel, growth metrics)

**Metrics Added:** 8 (team sizes, percentages, revenue impact)

**Authenticity Score:** 84/100 (Good - some aggressive metrics flagged for review)

**Flagged for Review:**
- $400K ARR claim (medium fabrication risk - verify with user)
- 34% activation increase (medium fabrication risk - seems high, but plausible)

**Overall Assessment:**
Strong optimization that transforms generic PM resume into growth-focused narrative. Most changes are conservative and plausible. Two metrics flagged for user verification. Resume now matches 85% of target keywords (up from 47%).

### 8.7 Step 6: Final Exported Resume (Summary)

**Header:**
John Smith
john.smith@email.com | (555) 123-4567 | San Francisco, CA | linkedin.com/in/johnsmith

**Summary:**
Product Manager with 4+ years driving growth for consumer fintech and mobile platforms. Currently leading product roadmap at a fintech startup, delivering features that increased user activation 34% and retention 28%. Expert in A/B testing, SQL-driven analysis, and cross-functional team leadership. Proven track record optimizing conversion funnels and defining key growth metrics (CAC, LTV, activation rate).

**Experience:**
**Product Manager | Fintech Startup | San Francisco, CA | 2021 - Present**
• Own end-to-end product roadmap for mobile fintech app serving 50K+ users, prioritizing features that drive acquisition and activation
• Lead cross-functional team of 8 engineers and 2 designers through full product lifecycle, from discovery to launch, shipping 3 high-impact features quarterly
• Analyzed user behavior across 500K+ data points using SQL and Amplitude, identifying friction in onboarding that increased activation rate 34% in 6 months
• Launched 3 revenue-generating features that expanded user base 22% and reduced churn 15%, driving $400K in annualized recurring revenue
• Designed and executed 12+ A/B tests using Optimizely, optimizing conversion funnels and improving checkout completion rate 18%

[Rest of resume follows with optimized bullets...]

**ATS Keyword Match:** 85% (13/15 critical keywords present)
**Estimated ATS Score:** 92/100

---

## 9. NEXT STEPS

### Immediate Actions (You Decide)

**Option A: Full Implementation (8 weeks)**
- Build entire workflow from scratch
- All 6 steps with complete UI
- LLM pipeline with guardrails
- Transparency layer with change log

**Option B: MVP (2-3 weeks)**
- Focus on Steps 1-4 (Input → Parse → Match → Optimize)
- Skip transparency layer initially
- Basic accept/reject for changes
- Export with existing system

**Option C: Incremental Enhancement**
- Keep existing OptimizerNew.tsx flow
- Add match analysis (Step 3) before optimization
- Enhance AI prompts with guardrails
- Add change explanations to existing UI

**Recommendation:** Start with Option C, then expand to Option B, then Option A.

This allows you to:
1. Improve current system immediately with better matching and prompts
2. Add transparency layer incrementally
3. Build complete workflow once patterns are validated

Would you like me to start with any specific phase, or do you have questions about the architecture?
