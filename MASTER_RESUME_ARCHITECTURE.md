# Master Resume System & Version Library - Architecture

## Overview

Upgrade from single-resume optimization to a comprehensive workspace where users maintain one master resume and generate tailored versions for each job application.

---

## Current State Analysis

### ✅ Already Built
- **Application Tracking**: Kanban board with stages (Saved → Offer)
- **Job Targeting**: Enhanced job cards with match scores
- **AI Insights**: Before/after optimization analysis
- **Resume Context**: Stores original and optimized resumes
- **Export System**: PDF/DOCX export with templates

### 🚧 Missing Features
1. **Master Resume Database**: No centralized storage of ALL experiences
2. **Smart Experience Selection**: No AI to pick relevant experiences per job
3. **Version Management**: ResumeVersion exists but lacks UI/management
4. **Experience Library**: No way to add/edit experiences independently
5. **Version Comparison**: Can't compare different tailored versions

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     MASTER RESUME LAYER                      │
│  ┌────────────────────────────────────────────────────┐     │
│  │  Master Resume Database (localStorage)              │     │
│  │  - All experiences (current + past)                 │     │
│  │  - All skills (technical + soft)                    │     │
│  │  - All education                                    │     │
│  │  - All projects                                     │     │
│  │  - All certifications                               │     │
│  └────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                  AI SELECTION ENGINE                         │
│  ┌────────────────────────────────────────────────────┐     │
│  │  Job Analysis → Experience Scoring → Selection      │     │
│  │  - Relevance scoring per experience                 │     │
│  │  - Skill matching                                   │     │
│  │  - Keyword alignment                                │     │
│  │  - Role level matching                              │     │
│  └────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                   VERSION LIBRARY                            │
│  ┌────────────────────────────────────────────────────┐     │
│  │  Generated Resume Versions                          │     │
│  │  - PM_Stripe (selected experiences for PM role)     │     │
│  │  - SWE_Google (selected experiences for SWE role)   │     │
│  │  - PM_DataPlatform                                  │     │
│  │  Each version = subset of master + optimization     │     │
│  └────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                 APPLICATION TRACKING                         │
│  Links version → application → status → outcome             │
└─────────────────────────────────────────────────────────────┘
```

---

## Data Schema

### 1. Master Resume Types

```typescript
// src/types/masterResume.ts

export interface MasterExperience {
  id: string;
  company: string;
  role: string;
  location?: string;
  startDate: string;
  endDate: string;
  current: boolean;

  // Achievement Pool - ALL bullets user ever wrote
  achievements: Achievement[];

  // Metadata for AI selection
  skills: string[];
  keywords: string[];
  impactLevel: 'high' | 'medium' | 'low';
  yearsInRole: number;

  // Organization
  category: 'full-time' | 'contract' | 'internship' | 'freelance';
  isArchived: boolean; // Hide old/irrelevant experiences
}

export interface Achievement {
  id: string;
  text: string;
  category: 'leadership' | 'technical' | 'impact' | 'collaboration';
  skills: string[];
  keywords: string[];
  metrics?: {
    type: 'percentage' | 'dollar' | 'count' | 'time';
    value: string;
  };
  relevanceScore?: number; // Computed per job
  usedInVersions: string[]; // Track which versions use this
}

export interface MasterSkill {
  id: string;
  name: string;
  category: 'technical' | 'soft' | 'language' | 'tool';
  proficiency: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  yearsOfExperience: number;
  linkedExperiences: string[]; // Which jobs used this skill
  isCore: boolean; // Always include in resumes
}

export interface MasterResume {
  id: string;
  userId?: string;

  // Core Info
  name: string;
  email: string;
  phone: string;
  location?: string;
  linkedin?: string;
  website?: string;

  // Complete History
  experiences: MasterExperience[];
  skills: MasterSkill[];
  education: Education[]; // Reuse existing type
  projects: Project[]; // Reuse existing type
  certifications?: Certification[];

  // Master Summary Variants
  summaries: {
    [key: string]: string; // 'product-manager', 'engineer', 'data-scientist'
  };

  // Metadata
  createdAt: Date;
  updatedAt: Date;
  lastOptimizedAt?: Date;
  totalVersions: number;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  date: string;
  expirationDate?: string;
  credentialId?: string;
  credentialUrl?: string;
}
```

### 2. Resume Version Types (Enhanced)

```typescript
// src/types/resumeVersion.ts

export interface ResumeVersion {
  id: string;

  // Naming & Organization
  name: string; // User-editable: "PM_Stripe", "SWE_Google"
  slug: string; // URL-safe: "pm-stripe", "swe-google"
  targetRole: string; // "Senior Product Manager"
  targetCompany?: string; // "Stripe"

  // Content - Selected from Master Resume
  selectedExperienceIds: string[];
  selectedAchievementIds: string[]; // Specific bullets chosen
  selectedSkillIds: string[];
  selectedProjectIds: string[];

  // Optimization
  optimizedContent: StructuredResume; // Final optimized version
  optimizationInsights?: OptimizationInsights;

  // Job Context
  jobDescription?: string;
  jobUrl?: string;
  applicationId?: string; // Link to application if applied

  // Metadata
  createdAt: Date;
  updatedAt: Date;
  lastExportedAt?: Date;
  exportCount: number;

  // Status
  status: 'draft' | 'optimized' | 'exported' | 'applied';
  matchScore?: number;
}

export interface VersionComparison {
  version1: ResumeVersion;
  version2: ResumeVersion;
  differences: {
    experiences: {
      added: string[];
      removed: string[];
      modified: string[];
    };
    achievements: {
      added: Achievement[];
      removed: Achievement[];
    };
    skills: {
      added: string[];
      removed: string[];
    };
  };
}
```

### 3. AI Selection Types

```typescript
// src/types/aiSelection.ts

export interface ExperienceRelevanceScore {
  experienceId: string;
  relevanceScore: number; // 0-100
  reasons: string[];
  matchedSkills: string[];
  matchedKeywords: string[];
  recommendation: 'must-include' | 'should-include' | 'optional' | 'skip';
}

export interface AchievementRelevanceScore {
  achievementId: string;
  relevanceScore: number;
  reasons: string[];
  matchedKeywords: string[];
  recommendation: 'must-include' | 'should-include' | 'optional';
}

export interface SelectionRecommendation {
  jobTitle: string;
  targetRole: string;

  // Recommended Content
  recommendedExperiences: ExperienceRelevanceScore[];
  recommendedAchievements: AchievementRelevanceScore[];
  recommendedSkills: string[];
  recommendedSummary: string;

  // Reasoning
  selectionStrategy: string;
  keyFactors: string[];

  // Optimization Hints
  suggestedVersionName: string; // "PM_Stripe"
  estimatedMatchScore: number;
}
```

---

## Component Architecture

### 1. Master Resume Management

```
src/components/master-resume/
├── MasterResumeEditor.tsx           # Main editor
├── ExperienceLibrary.tsx            # List of all experiences
├── ExperienceEditor.tsx             # Edit single experience
├── AchievementPool.tsx              # All achievements for an experience
├── AchievementEditor.tsx            # Edit single achievement
├── SkillsLibrary.tsx                # Manage all skills
├── MasterResumeStats.tsx            # Stats: 5 experiences, 47 achievements
└── ImportFromVersion.tsx            # Import content from existing version
```

### 2. Resume Version Management

```
src/components/versions/
├── VersionLibrary.tsx               # Grid/list of all versions
├── VersionCard.tsx                  # Single version card
├── VersionEditor.tsx                # Create/edit version
├── VersionComparison.tsx            # Compare two versions
├── SelectionReview.tsx              # Review AI-selected content
└── VersionTimeline.tsx              # History of edits/exports
```

### 3. AI Selection Interface

```
src/components/selection/
├── SmartSelectionPanel.tsx          # Main AI selection interface
├── ExperienceScoreCard.tsx          # Show relevance score per experience
├── AchievementSelector.tsx          # Choose from scored achievements
├── SelectionSummary.tsx             # Summary of AI choices
└── ManualOverride.tsx               # Add/remove AI selections
```

---

## User Flow

### Flow 1: Initial Setup - Build Master Resume

```
1. User uploads existing resume
   ↓
2. Parse into master resume structure
   ↓
3. Prompt: "Add any past experiences not on this resume?"
   ↓
4. User adds old jobs, more bullets, additional skills
   ↓
5. Master Resume created with complete history
```

### Flow 2: Create Tailored Version

```
1. User on Jobs page → clicks "Tailor Resume" on job card
   ↓
2. Open Smart Selection Panel
   ↓
3. AI analyzes job → scores all experiences/achievements
   ↓
4. Show recommendation:
   "We recommend these 3 experiences and 12 achievements"
   [Must Include] [Should Include] [Optional]
   ↓
5. User reviews, adds/removes content
   ↓
6. Click "Generate Version"
   ↓
7. AI optimizes selected content
   ↓
8. Show insights modal
   ↓
9. User names version: "PM_Stripe"
   ↓
10. Version saved to library
   ↓
11. Option: "Apply Now" or "Save for Later"
```

### Flow 3: Manage Versions

```
1. User navigates to "My Versions" page
   ↓
2. See grid of all versions:
   - PM_Stripe (exported 2x, match: 89%)
   - SWE_Google (applied, match: 82%)
   - PM_DataPlatform (draft, match: 76%)
   ↓
3. Click version → opens editor
   ↓
4. Can:
   - Re-export
   - Edit/re-optimize
   - Duplicate for similar job
   - Compare with other versions
   - Delete
```

---

## Service Layer

### 1. Master Resume Service

```typescript
// src/services/masterResume.ts

export class MasterResumeService {
  // CRUD
  static getMasterResume(): MasterResume | null
  static saveMasterResume(resume: MasterResume): void
  static updateMasterResume(updates: Partial<MasterResume>): void

  // Experiences
  static addExperience(experience: MasterExperience): void
  static updateExperience(id: string, updates: Partial<MasterExperience>): void
  static deleteExperience(id: string): void
  static archiveExperience(id: string): void

  // Achievements
  static addAchievement(experienceId: string, achievement: Achievement): void
  static updateAchievement(id: string, updates: Partial<Achievement>): void
  static deleteAchievement(id: string): void

  // Skills
  static addSkill(skill: MasterSkill): void
  static updateSkill(id: string, updates: Partial<MasterSkill>): void
  static deleteSkill(id: string): void
  static suggestSkillsFromExperiences(): string[]

  // Import/Export
  static importFromStructuredResume(resume: StructuredResume): MasterResume
  static exportToStructuredResume(selectedIds: string[]): StructuredResume

  // Stats
  static getStats(): {
    totalExperiences: number
    totalAchievements: number
    totalSkills: number
    totalVersions: number
  }
}
```

### 2. AI Selection Service

```typescript
// src/services/aiSelection.ts

export class AISelectionService {
  // Main Selection
  static async analyzeAndSelect(
    masterResume: MasterResume,
    jobDescription: string,
    jobTitle: string
  ): Promise<SelectionRecommendation>

  // Scoring
  static async scoreExperiences(
    experiences: MasterExperience[],
    jobDescription: string
  ): Promise<ExperienceRelevanceScore[]>

  static async scoreAchievements(
    achievements: Achievement[],
    jobDescription: string
  ): Promise<AchievementRelevanceScore[]>

  static async scoreSkills(
    skills: MasterSkill[],
    requiredSkills: string[]
  ): Promise<{ skillId: string; score: number }[]>

  // Strategy
  static determineSelectionStrategy(
    jobTitle: string,
    seniorityLevel: string
  ): 'breadth' | 'depth' | 'leadership' | 'technical'

  // Suggestions
  static suggestVersionName(
    jobTitle: string,
    company?: string
  ): string // "PM_Stripe"
}
```

### 3. Resume Version Service

```typescript
// src/services/resumeVersions.ts

export class ResumeVersionService {
  // CRUD
  static getAllVersions(): ResumeVersion[]
  static getVersion(id: string): ResumeVersion | null
  static saveVersion(version: ResumeVersion): void
  static updateVersion(id: string, updates: Partial<ResumeVersion>): void
  static deleteVersion(id: string): void
  static duplicateVersion(id: string, newName: string): ResumeVersion

  // Organization
  static getVersionsByStatus(status: ResumeVersion['status']): ResumeVersion[]
  static searchVersions(query: string): ResumeVersion[]
  static getRecentVersions(limit: number): ResumeVersion[]

  // Comparison
  static compareVersions(id1: string, id2: string): VersionComparison

  // Application Integration
  static linkToApplication(versionId: string, applicationId: string): void
  static getVersionForApplication(applicationId: string): ResumeVersion | null

  // Stats
  static getVersionStats(): {
    total: number
    byStatus: Record<ResumeVersion['status'], number>
    mostExported: ResumeVersion
    highestMatchScore: ResumeVersion
  }
}
```

---

## UI/UX Design

### Dashboard Layout

```
┌────────────────────────────────────────────────────────────┐
│  AI Resume Workspace                    [User Menu]        │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  Quick Stats                                               │
│  ┌──────────────┬──────────────┬──────────────┬─────────┐│
│  │ 📋 Master    │ 📑 Versions  │ 📤 Applied   │ 🎯 Avg  ││
│  │    Resume    │              │              │   Match ││
│  │   Complete   │      7       │     12       │   84%   ││
│  └──────────────┴──────────────┴──────────────┴─────────┘│
│                                                            │
│  Recent Versions                          [View All →]     │
│  ┌──────────────────────────────────────────────────────┐│
│  │ PM_Stripe        89% match    Exported 2x   [Edit]   ││
│  │ SWE_Google       82% match    Applied       [View]   ││
│  │ PM_DataPlatform  76% match    Draft         [Edit]   ││
│  └──────────────────────────────────────────────────────┘│
│                                                            │
│  Active Applications                      [View Board →]   │
│  ┌──────────────────────────────────────────────────────┐│
│  │ 5 Saved  |  3 Tailored  |  8 Applied  |  2 Interview ││
│  └──────────────────────────────────────────────────────┘│
│                                                            │
│  Suggested Jobs                          [Discover More]  │
│  ┌──────────────────────────────────────────────────────┐│
│  │ 🎯 Senior PM - Stripe        89%    [Tailor Resume]  ││
│  │ 🚀 PM - Google               82%    [Tailor Resume]  ││
│  └──────────────────────────────────────────────────────┘│
└────────────────────────────────────────────────────────────┘
```

### Master Resume Editor

```
┌────────────────────────────────────────────────────────────┐
│  Master Resume                                [Save]       │
├────────────────────────────────────────────────────────────┤
│  📊 Stats: 5 Experiences • 47 Achievements • 23 Skills    │
│                                                            │
│  Experiences                              [+ Add New]      │
│  ┌──────────────────────────────────────────────────────┐│
│  │ ✏️ Google - Senior PM (2020-Present)     [Edit] [⚙️] ││
│  │    12 achievements  •  Skills: PM, Strategy, Data     ││
│  │    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  ││
│  │    [Expand to view all achievements]                  ││
│  └──────────────────────────────────────────────────────┘│
│  ┌──────────────────────────────────────────────────────┐│
│  │ ✏️ Meta - PM (2018-2020)                 [Edit] [⚙️] ││
│  │    8 achievements  •  Skills: Product, Analytics      ││
│  └──────────────────────────────────────────────────────┘│
│                                                            │
│  Skills                                   [+ Add Skill]    │
│  ┌──────────────────────────────────────────────────────┐│
│  │ [Product Strategy] [Data Analysis] [SQL] [Python]    ││
│  │ [Leadership] [A/B Testing] [Roadmapping] ...         ││
│  └──────────────────────────────────────────────────────┘│
└────────────────────────────────────────────────────────────┘
```

### Smart Selection Panel

```
┌────────────────────────────────────────────────────────────┐
│  AI Resume Selection - Senior PM at Stripe                │
├────────────────────────────────────────────────────────────┤
│  📊 Analyzing your master resume against job requirements  │
│                                                            │
│  Recommended Experiences (3 of 5)         [Select All]    │
│  ┌──────────────────────────────────────────────────────┐│
│  │ ✅ Google - Senior PM              Must Include  95%  ││
│  │    Strong match: PM experience, data-driven           ││
│  │    ┌────────────────────────────────────────────────┐││
│  │    │ ✅ Led 5-person team (89% relevant)            │││
│  │    │ ✅ Increased revenue by $2M (92% relevant)     │││
│  │    │ ⬜ Managed stakeholders (45% relevant)         │││
│  │    │ ✅ Launched 3 products (88% relevant)          │││
│  │    └────────────────────────────────────────────────┘││
│  └──────────────────────────────────────────────────────┘│
│  ┌──────────────────────────────────────────────────────┐│
│  │ ✅ Meta - PM                      Should Include  78% ││
│  │    Good match: PM fundamentals, cross-functional      ││
│  └──────────────────────────────────────────────────────┘│
│  ┌──────────────────────────────────────────────────────┐│
│  │ ⬜ Amazon - APM                       Optional  45%   ││
│  │    Too junior for this role                           ││
│  └──────────────────────────────────────────────────────┘│
│                                                            │
│  [Back]  [Generate Resume Version →]                      │
└────────────────────────────────────────────────────────────┘
```

### Version Library

```
┌────────────────────────────────────────────────────────────┐
│  Resume Versions                      [+ Create New]       │
├────────────────────────────────────────────────────────────┤
│  Filter: [All] [Draft] [Applied]    Sort: [Recent]        │
│                                                            │
│  ┌───────────────┬───────────────┬───────────────┐       │
│  │ PM_Stripe     │ SWE_Google    │ PM_DataPlatform       │
│  │ 89% match     │ 82% match     │ 76% match     │       │
│  │ Exported 2x   │ Applied ✓     │ Draft         │       │
│  │ Updated 2d ago│ Updated 5d ago│ Updated 1w ago│       │
│  │ [Edit] [⚙️]   │ [View] [⚙️]   │ [Edit] [⚙️]   │       │
│  └───────────────┴───────────────┴───────────────┘       │
│                                                            │
│  ┌───────────────┬───────────────┬───────────────┐       │
│  │ PM_Airbnb     │ DS_Netflix    │ PM_Uber       │       │
│  │ 84% match     │ 79% match     │ 81% match     │       │
│  │ Applied ✓     │ Draft         │ Exported 1x   │       │
│  │ [View] [⚙️]   │ [Edit] [⚙️]   │ [Edit] [⚙️]   │       │
│  └───────────────┴───────────────┴───────────────┘       │
└────────────────────────────────────────────────────────────┘
```

---

## Implementation Priority

### Phase 1: Master Resume Foundation (Week 1)
- [ ] Create master resume types
- [ ] Build master resume service with localStorage
- [ ] Create MasterResumeEditor component
- [ ] Build ExperienceLibrary and AchievementPool
- [ ] Add import from existing resume

### Phase 2: AI Selection Engine (Week 2)
- [ ] Build AI selection service
- [ ] Implement experience/achievement scoring
- [ ] Create SmartSelectionPanel component
- [ ] Add manual override capabilities

### Phase 3: Version Management (Week 2)
- [ ] Enhance version types and service
- [ ] Build VersionLibrary component
- [ ] Create VersionEditor
- [ ] Add version comparison
- [ ] Integrate with applications

### Phase 4: Integration & Polish (Week 3)
- [ ] Update optimizer flow to use master resume
- [ ] Connect versions to application tracker
- [ ] Build unified dashboard
- [ ] Add version analytics
- [ ] User testing and refinement

---

## Technical Considerations

### Data Migration Strategy

```typescript
// Migrate existing users
export function migrateToMasterResume(
  existingResume: StructuredResume
): MasterResume {
  return {
    id: generateId(),
    name: existingResume.name || '',
    email: existingResume.email || '',
    phone: existingResume.phone || '',
    experiences: existingResume.experience.map(convertToMasterExperience),
    skills: existingResume.skills.map(convertToMasterSkill),
    education: existingResume.education,
    projects: existingResume.projects,
    summaries: {
      default: existingResume.summary
    },
    createdAt: new Date(),
    updatedAt: new Date(),
    totalVersions: 0
  };
}
```

### Performance Optimizations

1. **Lazy Loading**: Load experiences/achievements on demand
2. **Indexing**: Index by skills/keywords for fast filtering
3. **Caching**: Cache AI scoring results for 24 hours
4. **Pagination**: Paginate achievement lists for large experiences
5. **Debouncing**: Debounce autosave in editors

### Storage Strategy

```typescript
// LocalStorage Keys
const STORAGE_KEYS = {
  MASTER_RESUME: 'master_resume_v1',
  VERSIONS: 'resume_versions_v1',
  SELECTION_CACHE: 'ai_selection_cache_v1',
  VERSION_STATS: 'version_stats_v1'
};

// Data size estimation
// Master Resume: ~50KB (5 experiences, 50 achievements)
// Versions: ~10KB each × 20 versions = 200KB
// Total: ~250KB (well under 5MB localStorage limit)
```

---

## Success Metrics

### User Engagement
- Master resume completion rate: >80%
- Average achievements per experience: >8
- Versions created per user: >5
- Version reuse rate: >30%

### Quality Metrics
- AI selection accuracy: >85%
- User override rate: <20%
- Match score improvement: +15% average
- Time to create version: <3 minutes

### Business Metrics
- User retention: +40%
- Session duration: +60%
- Feature adoption: >70%
- Subscription conversion: +25%

---

## Next Steps

1. **Review this architecture** with team
2. **Start Phase 1** implementation
3. **Create UI mockups** for key screens
4. **Set up AI selection prompts** for OpenAI
5. **Plan data migration** for existing users
