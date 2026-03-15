import type {
  MasterResume,
  MasterExperience,
  Achievement,
  MasterSkill,
  SummaryVariant,
  MasterResumeStats,
  ImportResult,
} from '../types/masterResume';
import type { StructuredResume, Experience, Skill } from '../types/resume';

const STORAGE_KEY = 'master_resume_v1';

/**
 * Master Resume Service
 * Central database for all user experiences, achievements, and skills
 */

// ============================================================================
// CRUD Operations
// ============================================================================

export function getMasterResume(): MasterResume | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;

    const resume = JSON.parse(stored);

    // Parse dates
    resume.createdAt = new Date(resume.createdAt);
    resume.updatedAt = new Date(resume.updatedAt);
    if (resume.lastOptimizedAt) {
      resume.lastOptimizedAt = new Date(resume.lastOptimizedAt);
    }

    // Parse experience dates
    resume.experiences = resume.experiences.map((exp: any) => ({
      ...exp,
      createdAt: new Date(exp.createdAt),
      updatedAt: new Date(exp.updatedAt),
      achievements: exp.achievements.map((ach: any) => ({
        ...ach,
        createdAt: new Date(ach.createdAt),
        updatedAt: new Date(ach.updatedAt),
      })),
    }));

    // Parse skill dates
    resume.skills = resume.skills.map((skill: any) => ({
      ...skill,
      createdAt: new Date(skill.createdAt),
      lastUsedAt: skill.lastUsedAt ? new Date(skill.lastUsedAt) : undefined,
    }));

    return resume;
  } catch (error) {
    console.error('[MasterResume] Error loading master resume:', error);
    return null;
  }
}

export function saveMasterResume(resume: MasterResume): void {
  try {
    resume.updatedAt = new Date();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(resume));
    console.log('[MasterResume] Master resume saved');
  } catch (error) {
    console.error('[MasterResume] Error saving master resume:', error);
    throw new Error('Failed to save master resume');
  }
}

export function updateMasterResume(updates: Partial<MasterResume>): void {
  const resume = getMasterResume();
  if (!resume) {
    throw new Error('No master resume found');
  }

  const updated = { ...resume, ...updates, updatedAt: new Date() };
  saveMasterResume(updated);
}

export function deleteMasterResume(): void {
  localStorage.removeItem(STORAGE_KEY);
  console.log('[MasterResume] Master resume deleted');
}

export function createEmptyMasterResume(basicInfo: {
  name: string;
  email: string;
  phone: string;
  location?: string;
  linkedin?: string;
  website?: string;
}): MasterResume {
  const now = new Date();
  return {
    id: generateId(),
    ...basicInfo,
    experiences: [],
    skills: [],
    education: [],
    projects: [],
    certifications: [],
    summaries: [],
    createdAt: now,
    updatedAt: now,
    totalVersions: 0,
    completionScore: 20, // Has basic info only
  };
}

// ============================================================================
// Experience Management
// ============================================================================

export function addExperience(experience: Omit<MasterExperience, 'id' | 'createdAt' | 'updatedAt'>): string {
  const resume = getMasterResume();
  if (!resume) throw new Error('No master resume found');

  const now = new Date();
  const newExperience: MasterExperience = {
    ...experience,
    id: generateId(),
    createdAt: now,
    updatedAt: now,
  };

  resume.experiences.push(newExperience);
  resume.completionScore = calculateCompletionScore(resume);
  saveMasterResume(resume);

  return newExperience.id;
}

export function updateExperience(id: string, updates: Partial<MasterExperience>): void {
  const resume = getMasterResume();
  if (!resume) throw new Error('No master resume found');

  const index = resume.experiences.findIndex((exp) => exp.id === id);
  if (index === -1) throw new Error('Experience not found');

  resume.experiences[index] = {
    ...resume.experiences[index],
    ...updates,
    updatedAt: new Date(),
  };

  saveMasterResume(resume);
}

export function deleteExperience(id: string): void {
  const resume = getMasterResume();
  if (!resume) throw new Error('No master resume found');

  resume.experiences = resume.experiences.filter((exp) => exp.id !== id);
  resume.completionScore = calculateCompletionScore(resume);
  saveMasterResume(resume);
}

export function archiveExperience(id: string): void {
  updateExperience(id, { isArchived: true });
}

export function unarchiveExperience(id: string): void {
  updateExperience(id, { isArchived: false });
}

// ============================================================================
// Achievement Management
// ============================================================================

export function addAchievement(
  experienceId: string,
  achievement: Omit<Achievement, 'id' | 'createdAt' | 'updatedAt' | 'usedInVersions'>
): string {
  const resume = getMasterResume();
  if (!resume) throw new Error('No master resume found');

  const experience = resume.experiences.find((exp) => exp.id === experienceId);
  if (!experience) throw new Error('Experience not found');

  const now = new Date();
  const newAchievement: Achievement = {
    ...achievement,
    id: generateId(),
    usedInVersions: [],
    createdAt: now,
    updatedAt: now,
  };

  experience.achievements.push(newAchievement);
  experience.updatedAt = new Date();

  saveMasterResume(resume);
  return newAchievement.id;
}

export function updateAchievement(achievementId: string, updates: Partial<Achievement>): void {
  const resume = getMasterResume();
  if (!resume) throw new Error('No master resume found');

  let found = false;
  for (const experience of resume.experiences) {
    const achIndex = experience.achievements.findIndex((ach) => ach.id === achievementId);
    if (achIndex !== -1) {
      experience.achievements[achIndex] = {
        ...experience.achievements[achIndex],
        ...updates,
        updatedAt: new Date(),
      };
      experience.updatedAt = new Date();
      found = true;
      break;
    }
  }

  if (!found) throw new Error('Achievement not found');

  saveMasterResume(resume);
}

export function deleteAchievement(achievementId: string): void {
  const resume = getMasterResume();
  if (!resume) throw new Error('No master resume found');

  for (const experience of resume.experiences) {
    const originalLength = experience.achievements.length;
    experience.achievements = experience.achievements.filter((ach) => ach.id !== achievementId);

    if (experience.achievements.length < originalLength) {
      experience.updatedAt = new Date();
      break;
    }
  }

  saveMasterResume(resume);
}

export function getAchievementsByExperience(experienceId: string): Achievement[] {
  const resume = getMasterResume();
  if (!resume) return [];

  const experience = resume.experiences.find((exp) => exp.id === experienceId);
  return experience?.achievements || [];
}

// ============================================================================
// Skill Management
// ============================================================================

export function addSkill(skill: Omit<MasterSkill, 'id' | 'createdAt'>): string {
  const resume = getMasterResume();
  if (!resume) throw new Error('No master resume found');

  const newSkill: MasterSkill = {
    ...skill,
    id: generateId(),
    createdAt: new Date(),
  };

  resume.skills.push(newSkill);
  resume.completionScore = calculateCompletionScore(resume);
  saveMasterResume(resume);

  return newSkill.id;
}

export function updateSkill(id: string, updates: Partial<MasterSkill>): void {
  const resume = getMasterResume();
  if (!resume) throw new Error('No master resume found');

  const index = resume.skills.findIndex((skill) => skill.id === id);
  if (index === -1) throw new Error('Skill not found');

  resume.skills[index] = {
    ...resume.skills[index],
    ...updates,
  };

  saveMasterResume(resume);
}

export function deleteSkill(id: string): void {
  const resume = getMasterResume();
  if (!resume) throw new Error('No master resume found');

  resume.skills = resume.skills.filter((skill) => skill.id !== id);
  resume.completionScore = calculateCompletionScore(resume);
  saveMasterResume(resume);
}

export function suggestSkillsFromExperiences(): string[] {
  const resume = getMasterResume();
  if (!resume) return [];

  const allSkills = new Set<string>();

  resume.experiences.forEach((exp) => {
    exp.skills.forEach((skill) => allSkills.add(skill));
    exp.achievements.forEach((ach) => {
      ach.skills.forEach((skill) => allSkills.add(skill));
    });
  });

  // Filter out skills already in master skills
  const existingSkills = new Set(resume.skills.map((s) => s.name.toLowerCase()));
  return Array.from(allSkills).filter((skill) => !existingSkills.has(skill.toLowerCase()));
}

// ============================================================================
// Summary Management
// ============================================================================

export function addSummary(summary: Omit<SummaryVariant, 'id'>): string {
  const resume = getMasterResume();
  if (!resume) throw new Error('No master resume found');

  const newSummary: SummaryVariant = {
    ...summary,
    id: generateId(),
  };

  resume.summaries.push(newSummary);
  saveMasterResume(resume);

  return newSummary.id;
}

export function updateSummary(id: string, updates: Partial<SummaryVariant>): void {
  const resume = getMasterResume();
  if (!resume) throw new Error('No master resume found');

  const index = resume.summaries.findIndex((sum) => sum.id === id);
  if (index === -1) throw new Error('Summary not found');

  resume.summaries[index] = {
    ...resume.summaries[index],
    ...updates,
  };

  saveMasterResume(resume);
}

export function deleteSummary(id: string): void {
  const resume = getMasterResume();
  if (!resume) throw new Error('No master resume found');

  resume.summaries = resume.summaries.filter((sum) => sum.id !== id);
  saveMasterResume(resume);
}

// ============================================================================
// Import/Export
// ============================================================================

export function importFromStructuredResume(resume: StructuredResume): ImportResult {
  try {
    const warnings: string[] = [];

    const masterResume: MasterResume = {
      id: generateId(),
      name: resume.name || '',
      email: resume.email || '',
      phone: resume.phone || '',
      location: resume.location,
      linkedin: resume.linkedin,
      website: undefined,
      experiences: convertExperiences(resume.experience),
      skills: convertSkills(resume.skills),
      education: resume.education,
      projects: resume.projects,
      certifications: [],
      summaries: resume.summary
        ? [
            {
              id: generateId(),
              name: 'default',
              content: resume.summary,
              targetRoles: [],
              isPrimary: true,
            },
          ]
        : [],
      createdAt: new Date(),
      updatedAt: new Date(),
      totalVersions: 0,
      completionScore: 0,
    };

    masterResume.completionScore = calculateCompletionScore(masterResume);

    return {
      success: true,
      masterResume,
      warnings,
    };
  } catch (error) {
    console.error('[MasterResume] Import error:', error);
    return {
      success: false,
      errors: [error instanceof Error ? error.message : 'Import failed'],
    };
  }
}

export function exportToStructuredResume(selectedExperienceIds: string[], selectedSkillIds: string[]): StructuredResume {
  const resume = getMasterResume();
  if (!resume) throw new Error('No master resume found');

  const selectedExperiences = resume.experiences.filter((exp) => selectedExperienceIds.includes(exp.id));
  const selectedSkills = resume.skills.filter((skill) => selectedSkillIds.includes(skill.id));

  return {
    name: resume.name,
    email: resume.email,
    phone: resume.phone,
    linkedin: resume.linkedin,
    location: resume.location,
    summary: resume.summaries.find((s) => s.isPrimary)?.content || '',
    experience: selectedExperiences.map((exp) => convertToExperience(exp)),
    skills: selectedSkills.map((skill) => convertToSkill(skill)),
    education: resume.education,
    projects: resume.projects,
  };
}

// ============================================================================
// Stats & Analytics
// ============================================================================

export function getStats(): MasterResumeStats {
  const resume = getMasterResume();
  if (!resume) {
    return {
      totalExperiences: 0,
      activeExperiences: 0,
      archivedExperiences: 0,
      totalAchievements: 0,
      averageAchievementsPerExperience: 0,
      totalSkills: 0,
      coreSkills: 0,
      totalVersions: 0,
      completionScore: 0,
      lastUpdated: new Date(),
    };
  }

  const activeExperiences = resume.experiences.filter((exp) => !exp.isArchived);
  const archivedExperiences = resume.experiences.filter((exp) => exp.isArchived);
  const totalAchievements = resume.experiences.reduce((sum, exp) => sum + exp.achievements.length, 0);

  return {
    totalExperiences: resume.experiences.length,
    activeExperiences: activeExperiences.length,
    archivedExperiences: archivedExperiences.length,
    totalAchievements,
    averageAchievementsPerExperience: resume.experiences.length > 0 ? totalAchievements / resume.experiences.length : 0,
    totalSkills: resume.skills.length,
    coreSkills: resume.skills.filter((skill) => skill.isCore).length,
    totalVersions: resume.totalVersions,
    completionScore: resume.completionScore,
    lastUpdated: resume.updatedAt,
  };
}

// ============================================================================
// Helper Functions
// ============================================================================

function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
}

function calculateCompletionScore(resume: MasterResume): number {
  let score = 0;

  // Basic info (20 points)
  if (resume.name) score += 5;
  if (resume.email) score += 5;
  if (resume.phone) score += 5;
  if (resume.location) score += 5;

  // Experiences (30 points)
  if (resume.experiences.length > 0) score += 10;
  if (resume.experiences.length >= 3) score += 10;
  if (resume.experiences.length >= 5) score += 10;

  // Achievements (20 points)
  const totalAchievements = resume.experiences.reduce((sum, exp) => sum + exp.achievements.length, 0);
  if (totalAchievements > 0) score += 5;
  if (totalAchievements >= 10) score += 10;
  if (totalAchievements >= 20) score += 5;

  // Skills (15 points)
  if (resume.skills.length > 0) score += 5;
  if (resume.skills.length >= 10) score += 5;
  if (resume.skills.length >= 20) score += 5;

  // Education (10 points)
  if (resume.education.length > 0) score += 10;

  // Summary (5 points)
  if (resume.summaries.length > 0) score += 5;

  return Math.min(score, 100);
}

function convertExperiences(experiences: Experience[]): MasterExperience[] {
  const now = new Date();

  return experiences.map((exp) => ({
    id: generateId(),
    company: exp.company,
    role: exp.role,
    location: exp.location,
    startDate: exp.startDate,
    endDate: exp.endDate,
    current: exp.current,
    achievements: exp.bullets.map((bullet) => ({
      id: generateId(),
      text: bullet,
      category: categorizeAchievement(bullet),
      skills: [],
      keywords: extractKeywords(bullet),
      usedInVersions: [],
      createdAt: now,
      updatedAt: now,
    })),
    skills: [],
    keywords: [],
    impactLevel: 'medium',
    yearsInRole: calculateYears(exp.startDate, exp.endDate),
    category: 'full-time',
    isArchived: false,
    createdAt: now,
    updatedAt: now,
  }));
}

function convertSkills(skills: Skill[]): MasterSkill[] {
  return skills.map((skill) => ({
    id: generateId(),
    name: skill.name,
    category: skill.category,
    proficiency: skill.proficiency || 'intermediate',
    yearsOfExperience: 0,
    linkedExperiences: [],
    isCore: false,
    createdAt: new Date(),
  }));
}

function convertToExperience(masterExp: MasterExperience): Experience {
  return {
    id: masterExp.id,
    company: masterExp.company,
    role: masterExp.role,
    location: masterExp.location,
    startDate: masterExp.startDate,
    endDate: masterExp.endDate,
    current: masterExp.current,
    bullets: masterExp.achievements.map((ach) => ach.text),
  };
}

function convertToSkill(masterSkill: MasterSkill): Skill {
  return {
    id: masterSkill.id,
    name: masterSkill.name,
    category: masterSkill.category,
    proficiency: masterSkill.proficiency,
  };
}

function categorizeAchievement(text: string): Achievement['category'] {
  const lower = text.toLowerCase();

  if (lower.match(/\b(led|managed|directed|mentored|coordinated)\b/)) {
    return 'leadership';
  }
  if (lower.match(/\b(built|developed|implemented|designed|created)\b/)) {
    return 'technical';
  }
  if (lower.match(/\b(increased|reduced|improved|achieved|delivered)\b/)) {
    return 'impact';
  }
  return 'collaboration';
}

function extractKeywords(text: string): string[] {
  // Simple keyword extraction - could be enhanced with NLP
  const words = text.toLowerCase().split(/\W+/);
  const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by']);
  return words.filter((word) => word.length > 3 && !stopWords.has(word)).slice(0, 10);
}

function calculateYears(startDate: string, endDate: string): number {
  try {
    const start = new Date(startDate);
    const end = endDate === 'Present' ? new Date() : new Date(endDate);
    const years = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
    return Math.max(0, Math.round(years * 10) / 10);
  } catch {
    return 0;
  }
}
