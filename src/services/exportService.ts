import { getTemplateById } from '../data/templates';
import type { ResumeVersion } from '../types/resumeVersion';
import type { ResumeTemplate } from '../types/template';

/**
 * Export Service
 * Handles PDF and DOCX export of resume versions with templates
 */

export interface ExportOptions {
  format: 'pdf' | 'docx';
  fileName?: string;
  templateId: string;
}

export interface ExportProgress {
  status: 'preparing' | 'rendering' | 'exporting' | 'complete' | 'error';
  progress: number; // 0-100
  message: string;
}

/**
 * Export a resume version as PDF
 * Uses html2pdf.js to convert template rendering to PDF
 */
export async function exportToPDF(
  version: ResumeVersion,
  templateId: string,
  onProgress?: (progress: ExportProgress) => void
): Promise<void> {
  try {
    onProgress?.({ status: 'preparing', progress: 10, message: 'Loading template...' });

    const template = getTemplateById(templateId);
    if (!template) {
      throw new Error('Template not found');
    }

    onProgress?.({ status: 'rendering', progress: 30, message: 'Rendering resume...' });

    // Create a temporary container for rendering
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.left = '-9999px';
    container.style.top = '0';
    document.body.appendChild(container);

    // Generate the resume HTML with template styling
    const resumeHTML = generateResumeHTML(version.optimizedContent, template);
    container.innerHTML = resumeHTML;

    onProgress?.({ status: 'exporting', progress: 60, message: 'Generating PDF...' });

    // Use jsPDF with html2canvas for better quality
    const jsPDF = (await import('jspdf')).default;
    const html2canvas = (await import('html2canvas')).default;

    // Capture the HTML as canvas
    const canvas = await html2canvas(container.firstChild as HTMLElement, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    });

    // Create PDF from canvas
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'in',
      format: 'letter',
    });

    const imgWidth = 8.5;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);

    // Download the PDF
    pdf.save(sanitizeFileName(version.name) + '.pdf');

    onProgress?.({ status: 'complete', progress: 100, message: 'Download complete!' });

    // Cleanup
    document.body.removeChild(container);
  } catch (error) {
    console.error('[Export] PDF export error:', error);
    onProgress?.({
      status: 'error',
      progress: 0,
      message: error instanceof Error ? error.message : 'Export failed',
    });
    throw error;
  }
}

/**
 * Generate HTML string for resume with template styling
 */
function generateResumeHTML(resume: any, template: ResumeTemplate): string {
  const { style, sections } = template;
  const sortedSections = [...sections].sort((a, b) => a.order - b.order);

  // Generate header HTML
  const headerHTML = `
    <div style="margin-bottom: 24px; text-align: ${style.headerAlignment}; font-family: ${style.fontFamily}; color: ${style.primaryColor};">
      ${generateHeaderContent(resume, template)}
    </div>
  `;

  // Generate sections HTML
  const sectionsHTML = sortedSections
    .filter((s) => s.enabled)
    .map((section) => generateSectionHTML(section, resume, template))
    .join('');

  return `
    <div style="width: 8.5in; min-height: 11in; padding: 0.75in; background: white; font-family: ${style.fontFamily};">
      ${headerHTML}
      ${sectionsHTML}
    </div>
  `;
}

function generateHeaderContent(resume: any, template: ResumeTemplate): string {
  const { style } = template;

  if (template.style.headerStyle === 'banner') {
    return `
      <div style="padding: 24px 16px; margin: 0 -32px 16px; background: ${style.accentColor}10; border-left: 4px solid ${style.accentColor};">
        <h1 style="font-size: ${style.fontSize.name}px; font-weight: bold; margin: 0 0 4px; color: ${style.primaryColor};">
          ${resume.name || ''}
        </h1>
        <div style="font-size: 12px; color: ${style.secondaryColor};">
          ${[resume.email, resume.phone, resume.location, resume.linkedin]
            .filter(Boolean)
            .join(' • ')}
        </div>
      </div>
    `;
  }

  return `
    <h1 style="font-size: ${style.fontSize.name}px; font-weight: bold; margin: 0 0 8px; color: ${style.primaryColor};">
      ${resume.name || ''}
    </h1>
    <div style="font-size: 12px; color: ${style.secondaryColor};">
      ${[resume.email, resume.phone, resume.location, resume.linkedin]
        .filter(Boolean)
        .join(' • ')}
    </div>
  `;
}

function generateSectionHTML(
  section: any,
  resume: any,
  template: ResumeTemplate
): string {
  const { style } = template;

  const sectionTitleStyle = `
    font-size: ${style.fontSize.sectionTitle}px;
    font-weight: bold;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 12px;
    color: ${style.primaryColor};
    ${style.sectionTitleStyle === 'bold-border' ? `border-bottom: 3px solid ${style.accentColor}; padding-bottom: 6px;` : ''}
    ${style.sectionTitleStyle === 'bold-underline' ? `border-bottom: 2px solid ${style.accentColor}; padding-bottom: 4px;` : ''}
    ${style.sectionTitleStyle === 'bold-background' ? `background: ${style.accentColor}15; padding: 6px 12px; margin-left: -12px; margin-right: -12px;` : ''}
  `;

  let content = '';

  switch (section.key) {
    case 'summary':
      content = generateSummaryHTML(resume, style);
      break;
    case 'experience':
      content = generateExperienceHTML(resume, style);
      break;
    case 'education':
      content = generateEducationHTML(resume, style);
      break;
    case 'skills':
      content = generateSkillsHTML(resume, style);
      break;
    case 'projects':
      content = generateProjectsHTML(resume, style);
      break;
  }

  if (!content) return '';

  return `
    <div style="margin-bottom: 24px;">
      <h2 style="${sectionTitleStyle}">${section.title}</h2>
      ${content}
    </div>
  `;
}

function generateSummaryHTML(resume: any, style: any): string {
  if (!resume.summary) return '';
  return `<p style="font-size: ${style.fontSize.body}px; color: ${style.textColor}; line-height: 1.6; margin: 0;">${resume.summary}</p>`;
}

function generateExperienceHTML(resume: any, style: any): string {
  if (!resume.experience || resume.experience.length === 0) return '';

  return resume.experience
    .map(
      (exp: any) => `
    <div style="margin-bottom: 16px;">
      <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 4px;">
        <div>
          <h3 style="font-size: ${style.fontSize.body}px; font-weight: 600; margin: 0; color: ${style.primaryColor};">
            ${exp.role || exp.title}
          </h3>
          <div style="font-size: ${style.fontSize.body}px; font-weight: 500; color: ${style.accentColor}; margin-top: 2px;">
            ${exp.company}
          </div>
        </div>
        <div style="text-align: right; font-size: ${style.fontSize.small}px; color: ${style.secondaryColor};">
          <div>${exp.startDate} - ${exp.current ? 'Present' : exp.endDate}</div>
          ${exp.location ? `<div>${exp.location}</div>` : ''}
        </div>
      </div>
      ${
        exp.bullets && exp.bullets.length > 0
          ? `
        <ul style="margin: 8px 0 0 20px; padding: 0; list-style-type: disc;">
          ${exp.bullets
            .map(
              (bullet: string) =>
                `<li style="font-size: ${style.fontSize.body}px; color: ${style.textColor}; line-height: 1.5; margin-bottom: 4px;">${bullet}</li>`
            )
            .join('')}
        </ul>
      `
          : ''
      }
    </div>
  `
    )
    .join('');
}

function generateEducationHTML(resume: any, style: any): string {
  if (!resume.education || resume.education.length === 0) return '';

  return resume.education
    .map(
      (edu: any) => `
    <div style="margin-bottom: 12px;">
      <div style="display: flex; justify-content: space-between; align-items: start;">
        <div>
          <h3 style="font-size: ${style.fontSize.body}px; font-weight: 600; margin: 0; color: ${style.primaryColor};">
            ${edu.school}
          </h3>
          <div style="font-size: ${style.fontSize.body}px; color: ${style.textColor}; margin-top: 2px;">
            ${edu.degree} in ${edu.field}
          </div>
        </div>
        <div style="text-align: right; font-size: ${style.fontSize.small}px; color: ${style.secondaryColor};">
          <div>${edu.startDate} - ${edu.endDate}</div>
          ${edu.gpa ? `<div>GPA: ${edu.gpa}</div>` : ''}
        </div>
      </div>
    </div>
  `
    )
    .join('');
}

function generateSkillsHTML(resume: any, style: any): string {
  if (!resume.skills || resume.skills.length === 0) return '';

  const skillsByCategory = resume.skills.reduce((acc: any, skill: any) => {
    if (!acc[skill.category]) {
      acc[skill.category] = [];
    }
    acc[skill.category].push(skill.name);
    return acc;
  }, {});

  return Object.entries(skillsByCategory)
    .map(
      ([category, skills]: [string, any]) => `
    <div style="margin-bottom: 8px;">
      <span style="font-size: ${style.fontSize.body}px; font-weight: 600; color: ${style.primaryColor}; text-transform: capitalize;">
        ${category}:
      </span>
      <span style="font-size: ${style.fontSize.body}px; color: ${style.textColor};">
        ${skills.join(', ')}
      </span>
    </div>
  `
    )
    .join('');
}

function generateProjectsHTML(resume: any, style: any): string {
  if (!resume.projects || resume.projects.length === 0) return '';

  return resume.projects
    .map(
      (project: any) => `
    <div style="margin-bottom: 12px;">
      <h3 style="font-size: ${style.fontSize.body}px; font-weight: 600; margin: 0; color: ${style.primaryColor};">
        ${project.name}
        ${project.url ? `<span style="font-size: ${style.fontSize.small}px; color: ${style.accentColor}; margin-left: 8px;">(${project.url})</span>` : ''}
      </h3>
      <p style="font-size: ${style.fontSize.body}px; color: ${style.textColor}; line-height: 1.5; margin: 4px 0;">
        ${project.description}
      </p>
      ${
        project.technologies && project.technologies.length > 0
          ? `
        <div style="font-size: ${style.fontSize.small}px; color: ${style.secondaryColor}; margin-top: 4px;">
          Technologies: ${project.technologies.join(', ')}
        </div>
      `
          : ''
      }
    </div>
  `
    )
    .join('');
}

function sanitizeFileName(name: string): string {
  return name.replace(/[^a-z0-9_-]/gi, '_').toLowerCase();
}

/**
 * Export a resume version as DOCX (placeholder - requires docx library)
 */
export async function exportToDOCX(
  version: ResumeVersion,
  templateId: string,
  onProgress?: (progress: ExportProgress) => void
): Promise<void> {
  onProgress?.({ status: 'error', progress: 0, message: 'DOCX export coming soon!' });
  throw new Error('DOCX export not yet implemented');
}
