export interface Experience {
  id: string;
  company: string;
  role: string;
  location?: string; // City, State format
  startDate: string;
  endDate: string;
  current: boolean;
  bullets: string[];
}

export interface Education {
  id: string;
  school: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
  gpa?: string;
}

export interface Skill {
  id: string;
  name: string;
  category: 'technical' | 'soft' | 'language' | 'tool';
  proficiency?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
}

export interface Project {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  url?: string;
}

export interface StructuredResume {
  name?: string;
  email?: string;
  phone?: string;
  linkedin?: string;
  location?: string;
  summary: string;
  experience: Experience[];
  education: Education[];
  skills: Skill[];
  projects: Project[];
  rawText?: string;
}

export interface JobAnalysis {
  roleTitle: string;
  seniorityLevel: string;
  industry: string;
  coreResponsibilities: string[];
  technicalSkills: string[];
  softSkills: string[];
  hiringSignals: string[];
  atsKeywords: string[];
}

export interface MatchScore {
  overall: number;
  keywordCoverage: number;
  skillAlignment: number;
  responsibilityAlignment: number;
  atsCompatibility: number;
}

export interface KeywordGap {
  missing: string[];
  present: string[];
  suggestions: { keyword: string; context: string }[];
}

export interface SkillCoverage {
  skill: string;
  required: boolean;
  coverage: number; // 0-100
  inResume: boolean;
}

// Job Discovery Types
export interface JobTemplate {
  id: string;
  title: string;
  company: string;
  location: string;
  remote: boolean;
  description: string;
  requiredSkills: string[];
  preferredSkills: string[];
  yearsOfExperience: number;
  seniorityLevel: string;
  industry: string;
  tools: string[];
  salary?: string;
}

export interface JobMatch {
  job: JobTemplate;
  fitScore: number;
  matchReasons: string[];
  missingSkills: string[];
  matchType: 'direct' | 'stretch' | 'adjacent';
}

export interface JobDiscoveryResponse {
  jobs: JobMatch[];
  totalFound: number;
}
