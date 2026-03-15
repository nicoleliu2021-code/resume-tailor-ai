export interface ResumeTemplateData {
  // Header
  name: string;
  email: string;
  phone: string;
  location?: string;
  linkedin?: string;
  website?: string;

  // Target Role (Optional highlight)
  targetRole?: string;

  // Professional Summary
  summary: string;

  // Experience
  experience: ExperienceEntry[];

  // Skills
  skills: SkillsSection;

  // Education
  education: EducationEntry[];

  // Optional Sections
  projects?: ProjectEntry[];
  certifications?: CertificationEntry[];
  publications?: PublicationEntry[];
}

export interface ExperienceEntry {
  company: string;
  role: string;
  location?: string;
  startDate: string; // "Jan 2023"
  endDate: string; // "Present" or "Dec 2024"
  bullets: string[];
}

export interface SkillsSection {
  technical?: string[]; // Technical skills
  leadership?: string[]; // Leadership & management
  tools?: string[]; // Tools & platforms
  languages?: string[]; // Programming languages
  certifications?: string[]; // Inline certifications
  [key: string]: string[] | undefined; // Allow custom categories
}

export interface EducationEntry {
  institution: string;
  degree: string;
  field?: string;
  location?: string;
  graduationDate: string; // "May 2020"
  gpa?: string;
  honors?: string[];
}

export interface ProjectEntry {
  name: string;
  description: string;
  technologies?: string[];
  link?: string;
  date?: string;
}

export interface CertificationEntry {
  name: string;
  issuer: string;
  date: string;
  credentialId?: string;
}

export interface PublicationEntry {
  title: string;
  publisher: string;
  date: string;
  link?: string;
}

// Template styling options
export interface TemplateConfig {
  font: 'Inter' | 'Calibri' | 'Arial';
  fontSize: number; // 10-12pt
  lineSpacing: number; // 1.2-1.4
  margins: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  sectionSpacing: number; // spacing between sections
}

export const DEFAULT_TEMPLATE_CONFIG: TemplateConfig = {
  font: 'Inter',
  fontSize: 11,
  lineSpacing: 1.3,
  margins: {
    top: 0.5,
    right: 0.5,
    bottom: 0.5,
    left: 0.5,
  },
  sectionSpacing: 16,
};
