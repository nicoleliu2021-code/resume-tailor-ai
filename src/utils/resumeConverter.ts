import type { StructuredResume, Skill } from '../types/resume';
import type { ResumeTemplateData } from '../types/resumeTemplate';

/**
 * Convert existing StructuredResume format to new ResumeTemplateData format
 * This allows seamless integration with the existing codebase
 */
export function convertStructuredResumeToTemplate(
  resume: StructuredResume
): ResumeTemplateData {
  return {
    // Header
    name: resume.name || 'Your Name',
    email: resume.email || '',
    phone: resume.phone || '',
    location: resume.location,
    linkedin: resume.linkedin,
    website: undefined,

    // Summary
    summary: resume.summary || '',

    // Experience
    experience: (resume.experience || []).map((exp) => ({
      company: exp.company,
      role: exp.role, // Note: using 'role' not 'title'
      location: exp.location,
      startDate: formatDate(exp.startDate),
      endDate: exp.current ? 'Present' : formatDate(exp.endDate),
      bullets: exp.bullets || [],
    })),

    // Skills - Convert flat array to categorized object
    skills: categorizeSkills(resume.skills || []),

    // Education
    education: (resume.education || []).map((edu) => ({
      institution: edu.school, // Note: using 'school' not 'institution'
      degree: edu.degree,
      field: edu.field,
      location: undefined, // Not in original type
      graduationDate: formatDate(edu.endDate),
      gpa: edu.gpa,
      honors: undefined, // Not in original type
    })),

    // Projects
    projects: (resume.projects || []).map((project) => ({
      name: project.name,
      description: project.description,
      technologies: project.technologies,
      link: project.url, // Note: using 'url' not 'link'
      date: undefined, // Not in original type
    })),
  };
}

/**
 * Categorize skills intelligently based on common patterns
 */
function categorizeSkills(skills: any[]): {
  technical?: string[];
  languages?: string[];
  tools?: string[];
  [key: string]: string[] | undefined;
} {
  if (!skills || skills.length === 0) {
    return {};
  }

  const categories: {
    technical: string[];
    languages: string[];
    tools: string[];
  } = {
    technical: [],
    languages: [],
    tools: [],
  };

  // If skills are already categorized (objects with name/category)
  if (typeof skills[0] === 'object' && 'name' in skills[0]) {
    skills.forEach((skill) => {
      const category = skill.category?.toLowerCase() || 'technical';
      if (!categories[category as keyof typeof categories]) {
        (categories as any)[category] = [];
      }
      (categories as any)[category].push(skill.name);
    });

    // Remove empty categories
    Object.keys(categories).forEach((key) => {
      if (categories[key as keyof typeof categories].length === 0) {
        delete categories[key as keyof typeof categories];
      }
    });

    return categories;
  }

  // If skills are simple strings, categorize intelligently
  const skillStrings = skills.map((s) => (typeof s === 'string' ? s : s.name || ''));

  // Programming languages
  const languagePatterns = [
    'javascript',
    'typescript',
    'python',
    'java',
    'c++',
    'c#',
    'ruby',
    'go',
    'rust',
    'swift',
    'kotlin',
    'php',
    'sql',
  ];

  // Tools and platforms
  const toolPatterns = [
    'aws',
    'azure',
    'gcp',
    'docker',
    'kubernetes',
    'jenkins',
    'git',
    'github',
    'jira',
    'figma',
    'slack',
    'notion',
    'tableau',
    'looker',
  ];

  skillStrings.forEach((skill) => {
    const skillLower = skill.toLowerCase();

    // Check if it's a programming language
    if (languagePatterns.some((lang) => skillLower.includes(lang))) {
      categories.languages.push(skill);
    }
    // Check if it's a tool
    else if (toolPatterns.some((tool) => skillLower.includes(tool))) {
      categories.tools.push(skill);
    }
    // Otherwise, it's a technical skill
    else {
      categories.technical.push(skill);
    }
  });

  // Remove empty categories
  const result: any = {};
  Object.entries(categories).forEach(([key, value]) => {
    if (value.length > 0) {
      result[key] = value;
    }
  });

  return result;
}

/**
 * Format date string for resume template
 * Converts various date formats to "Mon YYYY" format
 */
function formatDate(date: string | Date | undefined): string {
  if (!date) return '';

  const dateObj = typeof date === 'string' ? new Date(date) : date;

  if (isNaN(dateObj.getTime())) {
    // If not a valid date, return as-is
    return typeof date === 'string' ? date : '';
  }

  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];

  return `${months[dateObj.getMonth()]} ${dateObj.getFullYear()}`;
}

/**
 * Convert ResumeTemplateData back to StructuredResume format
 * For backwards compatibility
 */
export function convertTemplateToStructuredResume(
  template: ResumeTemplateData
): StructuredResume {
  // Flatten skills back to array format with proper types
  const skillsArray: Skill[] = Object.entries(template.skills || {}).flatMap(
    ([category, skills]) => {
      return (skills || []).map((skill) => ({
        id: `skill_${Math.random().toString(36).substr(2, 9)}`,
        name: skill,
        category: mapCategoryToSkillType(category),
      }));
    }
  );

  return {
    name: template.name,
    email: template.email,
    phone: template.phone,
    linkedin: template.linkedin,
    location: template.location,
    summary: template.summary,
    experience: (template.experience || []).map((exp, idx) => ({
      id: `exp_${idx}_${Date.now()}`,
      company: exp.company,
      role: exp.role,
      location: exp.location,
      startDate: exp.startDate,
      endDate: exp.endDate === 'Present' ? new Date().toISOString().split('T')[0] : exp.endDate,
      current: exp.endDate === 'Present',
      bullets: exp.bullets,
    })),
    education: (template.education || []).map((edu, idx) => ({
      id: `edu_${idx}_${Date.now()}`,
      school: edu.institution,
      degree: edu.degree,
      field: edu.field || '',
      startDate: '', // Not available in template format
      endDate: edu.graduationDate,
      gpa: edu.gpa,
    })),
    skills: skillsArray,
    projects: (template.projects || []).map((proj, idx) => ({
      id: `proj_${idx}_${Date.now()}`,
      name: proj.name,
      description: proj.description,
      technologies: proj.technologies || [],
      url: proj.link,
    })),
  };
}

// Helper to map template categories to Skill type categories
function mapCategoryToSkillType(
  category: string
): 'technical' | 'soft' | 'language' | 'tool' {
  const lowerCategory = category.toLowerCase();
  if (lowerCategory.includes('language')) return 'language';
  if (lowerCategory.includes('tool') || lowerCategory.includes('platform'))
    return 'tool';
  if (
    lowerCategory.includes('leadership') ||
    lowerCategory.includes('soft') ||
    lowerCategory.includes('management')
  )
    return 'soft';
  return 'technical';
}
