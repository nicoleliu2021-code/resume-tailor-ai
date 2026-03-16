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
  let container: HTMLElement | null = null;

  try {
    console.log('[Export] Starting PDF export', { templateId, version });
    onProgress?.({ status: 'preparing', progress: 10, message: 'Loading template...' });

    const template = getTemplateById(templateId);
    if (!template) {
      throw new Error(`Template not found: ${templateId}`);
    }

    if (!version.optimizedContent) {
      throw new Error('No resume content to export');
    }

    console.log('[Export] Template loaded:', template.name);
    onProgress?.({ status: 'rendering', progress: 30, message: 'Rendering resume...' });

    // Create a temporary container for rendering
    container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.left = '-9999px';
    container.style.top = '0';
    container.style.width = '816px'; // 8.5 inches at 96 DPI
    document.body.appendChild(container);

    // Generate the resume HTML with template styling
    const resumeHTML = generateResumeHTML(version.optimizedContent, template);
    console.log('[Export] Generated HTML length:', resumeHTML.length);
    container.innerHTML = resumeHTML;

    if (!container.firstChild) {
      throw new Error('Failed to render resume HTML');
    }

    onProgress?.({ status: 'exporting', progress: 60, message: 'Generating PDF...' });

    // Use jsPDF with html2canvas for better quality
    console.log('[Export] Loading jsPDF and html2canvas...');
    const jsPDF = (await import('jspdf')).default;
    const html2canvas = (await import('html2canvas')).default;

    console.log('[Export] Capturing HTML as canvas...');
    // Capture the HTML as canvas
    const canvas = await html2canvas(container.firstChild as HTMLElement, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: 816,
      windowHeight: 1056,
    });

    console.log('[Export] Canvas created:', canvas.width, 'x', canvas.height);

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
    const fileName = sanitizeFileName(version.name) + '.pdf';
    console.log('[Export] Saving PDF:', fileName);
    pdf.save(fileName);

    onProgress?.({ status: 'complete', progress: 100, message: 'Download complete!' });

    // Cleanup
    if (container && container.parentNode) {
      document.body.removeChild(container);
    }

    console.log('[Export] PDF export complete');
  } catch (error) {
    console.error('[Export] PDF export error:', error);
    console.error('[Export] Error stack:', error instanceof Error ? error.stack : 'No stack');

    // Cleanup on error
    if (container && container.parentNode) {
      try {
        document.body.removeChild(container);
      } catch (cleanupError) {
        console.error('[Export] Cleanup error:', cleanupError);
      }
    }

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
 * Export a resume version as DOCX
 * Uses docx library to create Word documents with template styling
 */
export async function exportToDOCX(
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

    onProgress?.({ status: 'rendering', progress: 30, message: 'Creating document...' });

    // Dynamically import docx and file-saver
    const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, convertInchesToTwip } = await import('docx');
    const { saveAs } = await import('file-saver');

    const resume = version.optimizedContent;
    const { style, sections } = template;
    const sortedSections = [...sections].sort((a, b) => a.order - b.order);

    // Create document sections
    const docSections: any[] = [];

    // Add header
    docSections.push(
      new Paragraph({
        text: resume.name || '',
        heading: HeadingLevel.TITLE,
        alignment:
          style.headerAlignment === 'center' ? AlignmentType.CENTER :
          style.headerAlignment === 'right' ? AlignmentType.RIGHT :
          AlignmentType.LEFT,
        spacing: { after: 200 },
      })
    );

    // Add contact info
    const contactInfo = [resume.email, resume.phone, resume.location, resume.linkedin]
      .filter(Boolean)
      .join(' • ');

    if (contactInfo) {
      docSections.push(
        new Paragraph({
          text: contactInfo,
          alignment:
            style.headerAlignment === 'center' ? AlignmentType.CENTER :
            style.headerAlignment === 'right' ? AlignmentType.RIGHT :
            AlignmentType.LEFT,
          spacing: { after: 400 },
        })
      );
    }

    onProgress?.({ status: 'rendering', progress: 50, message: 'Adding sections...' });

    // Add sections
    for (const section of sortedSections) {
      if (!section.enabled) continue;

      // Section title
      docSections.push(
        new Paragraph({
          text: section.title.toUpperCase(),
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 300, after: 200 },
          border: style.sectionTitleStyle.includes('border') ? {
            bottom: {
              color: style.accentColor.replace('#', ''),
              space: 1,
              style: 'single',
              size: style.sectionTitleStyle === 'bold-border' ? 24 : 12,
            }
          } : undefined,
        })
      );

      // Section content
      switch (section.key) {
        case 'summary':
          if (resume.summary) {
            docSections.push(
              new Paragraph({
                text: resume.summary,
                spacing: { after: 200 },
              })
            );
          }
          break;

        case 'experience':
          if (resume.experience && resume.experience.length > 0) {
            for (const exp of resume.experience) {
              // Job title and dates
              docSections.push(
                new Paragraph({
                  children: [
                    new TextRun({
                      text: exp.role || '',
                      bold: true,
                      size: style.fontSize.body * 2,
                    }),
                  ],
                  spacing: { before: 200, after: 50 },
                })
              );

              // Company and location
              const companyText = [exp.company, exp.location].filter(Boolean).join(' • ');
              const dateText = `${exp.startDate} - ${exp.current ? 'Present' : exp.endDate}`;

              docSections.push(
                new Paragraph({
                  children: [
                    new TextRun({
                      text: companyText,
                      italics: true,
                    }),
                    new TextRun({
                      text: '  |  ',
                    }),
                    new TextRun({
                      text: dateText,
                      color: style.secondaryColor.replace('#', ''),
                    }),
                  ],
                  spacing: { after: 100 },
                })
              );

              // Bullets
              if (exp.bullets && exp.bullets.length > 0) {
                for (const bullet of exp.bullets) {
                  docSections.push(
                    new Paragraph({
                      text: bullet,
                      bullet: { level: 0 },
                      spacing: { after: 50 },
                    })
                  );
                }
              }

              docSections.push(
                new Paragraph({
                  text: '',
                  spacing: { after: 100 },
                })
              );
            }
          }
          break;

        case 'education':
          if (resume.education && resume.education.length > 0) {
            for (const edu of resume.education) {
              docSections.push(
                new Paragraph({
                  children: [
                    new TextRun({
                      text: edu.school,
                      bold: true,
                    }),
                  ],
                  spacing: { before: 200, after: 50 },
                })
              );

              docSections.push(
                new Paragraph({
                  children: [
                    new TextRun({
                      text: `${edu.degree} in ${edu.field}`,
                    }),
                    new TextRun({
                      text: '  |  ',
                    }),
                    new TextRun({
                      text: `${edu.startDate} - ${edu.endDate}`,
                      color: style.secondaryColor.replace('#', ''),
                    }),
                    ...(edu.gpa ? [
                      new TextRun({ text: '  |  ' }),
                      new TextRun({ text: `GPA: ${edu.gpa}` }),
                    ] : []),
                  ],
                  spacing: { after: 100 },
                })
              );
            }
          }
          break;

        case 'skills':
          if (resume.skills && resume.skills.length > 0) {
            const skillsByCategory = resume.skills.reduce((acc: any, skill: any) => {
              if (!acc[skill.category]) {
                acc[skill.category] = [];
              }
              acc[skill.category].push(skill.name);
              return acc;
            }, {});

            for (const [category, skills] of Object.entries(skillsByCategory)) {
              docSections.push(
                new Paragraph({
                  children: [
                    new TextRun({
                      text: `${category.charAt(0).toUpperCase() + category.slice(1)}: `,
                      bold: true,
                    }),
                    new TextRun({
                      text: (skills as string[]).join(', '),
                    }),
                  ],
                  spacing: { after: 100 },
                })
              );
            }
          }
          break;

        case 'projects':
          if (resume.projects && resume.projects.length > 0) {
            for (const project of resume.projects) {
              docSections.push(
                new Paragraph({
                  children: [
                    new TextRun({
                      text: project.name,
                      bold: true,
                    }),
                    ...(project.url ? [
                      new TextRun({
                        text: ` (${project.url})`,
                        color: style.accentColor.replace('#', ''),
                      }),
                    ] : []),
                  ],
                  spacing: { before: 200, after: 50 },
                })
              );

              if (project.description) {
                docSections.push(
                  new Paragraph({
                    text: project.description,
                    spacing: { after: 50 },
                  })
                );
              }

              if (project.technologies && project.technologies.length > 0) {
                docSections.push(
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: 'Technologies: ',
                        italics: true,
                      }),
                      new TextRun({
                        text: project.technologies.join(', '),
                        italics: true,
                        color: style.secondaryColor.replace('#', ''),
                      }),
                    ],
                    spacing: { after: 100 },
                  })
                );
              }
            }
          }
          break;
      }
    }

    onProgress?.({ status: 'exporting', progress: 80, message: 'Generating DOCX file...' });

    // Create document
    const doc = new Document({
      sections: [{
        properties: {
          page: {
            margin: {
              top: convertInchesToTwip(0.75),
              right: convertInchesToTwip(0.75),
              bottom: convertInchesToTwip(0.75),
              left: convertInchesToTwip(0.75),
            },
          },
        },
        children: docSections,
      }],
    });

    // Generate and download
    const blob = await Packer.toBlob(doc);
    saveAs(blob, sanitizeFileName(version.name) + '.docx');

    onProgress?.({ status: 'complete', progress: 100, message: 'Download complete!' });
  } catch (error) {
    console.error('[Export] DOCX export error:', error);
    onProgress?.({
      status: 'error',
      progress: 0,
      message: error instanceof Error ? error.message : 'Export failed',
    });
    throw error;
  }
}
