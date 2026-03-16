import { getTemplateById } from '../data/templates';
import type { ResumeVersion } from '../types/resumeVersion';
import { createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { ResumeRenderer } from '../components/ResumeRenderer';

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
    container.style.zIndex = '-9999';
    document.body.appendChild(container);

    // Create a wrapper div for the resume
    const resumeWrapper = document.createElement('div');
    container.appendChild(resumeWrapper);

    // Render React component into the wrapper
    console.log('[Export] Rendering React component...');
    const root = createRoot(resumeWrapper);

    // Render and wait for it to complete
    await new Promise<void>((resolve) => {
      root.render(
        createElement(ResumeRenderer, {
          resume: version.optimizedContent,
          template: template,
          scale: 1,
        })
      );
      // Give React time to render
      setTimeout(resolve, 500);
    });

    console.log('[Export] React component rendered');

    if (!resumeWrapper.firstChild) {
      throw new Error('Failed to render resume component');
    }

    onProgress?.({ status: 'exporting', progress: 60, message: 'Generating PDF...' });

    // Use jsPDF with html2canvas for better quality
    console.log('[Export] Loading jsPDF and html2canvas...');
    const jsPDF = (await import('jspdf')).default;
    const html2canvas = (await import('html2canvas')).default;

    console.log('[Export] Capturing HTML as canvas...');
    // Capture the React-rendered element directly (not iframe)
    const canvas = await html2canvas(resumeWrapper.firstChild as HTMLElement, {
      scale: 2,
      useCORS: true,
      logging: true,
      backgroundColor: '#ffffff',
      allowTaint: false,
      foreignObjectRendering: false,
    });

    console.log('[Export] Canvas created:', canvas.width, 'x', canvas.height);

    // Create PDF from canvas
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'in',
      format: 'letter',
    });

    const imgWidth = 8.5; // Letter width in inches
    const pageHeight = 11; // Letter height in inches

    // Calculate scaling - canvas width should fit within 8.5 inches
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    console.log('[Export] Image dimensions:', imgWidth, 'x', imgHeight, 'inches');

    // If content fits on one page, add it directly
    if (imgHeight <= pageHeight) {
      const imgData = canvas.toDataURL('image/png');
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
    } else {
      // Multi-page: split the canvas into page-sized chunks
      const pageCount = Math.ceil(imgHeight / pageHeight);
      console.log('[Export] Multi-page resume, splitting into', pageCount, 'pages');

      // Calculate pixels per page
      const pageHeightPixels = Math.floor((canvas.height * pageHeight) / imgHeight);

      for (let page = 0; page < pageCount; page++) {
        // Create a temporary canvas for this page
        const pageCanvas = document.createElement('canvas');
        pageCanvas.width = canvas.width;
        pageCanvas.height = Math.min(pageHeightPixels, canvas.height - (page * pageHeightPixels));

        const pageCtx = pageCanvas.getContext('2d');
        if (!pageCtx) {
          throw new Error('Failed to get canvas context');
        }

        // Copy the relevant portion of the main canvas
        pageCtx.drawImage(
          canvas,
          0, page * pageHeightPixels, // Source x, y
          canvas.width, pageCanvas.height, // Source width, height
          0, 0, // Destination x, y
          canvas.width, pageCanvas.height // Destination width, height
        );

        // Convert page canvas to image
        const pageImgData = pageCanvas.toDataURL('image/png');

        // Add new page if not the first page
        if (page > 0) {
          pdf.addPage();
        }

        // Calculate height for this page in inches
        const thisPageHeight = (pageCanvas.height * imgWidth) / canvas.width;

        // Add the image to the PDF page
        pdf.addImage(pageImgData, 'PNG', 0, 0, imgWidth, thisPageHeight);

        console.log(`[Export] Added page ${page + 1}/${pageCount}`);
      }
    }

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
