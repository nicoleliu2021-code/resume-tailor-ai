import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
  TabStopType,
  TabStopPosition,
} from 'docx';
import { saveAs } from 'file-saver';
import type { ResumeTemplateData } from '../types/resumeTemplate';

/**
 * Export resume to DOCX format
 * Uses docx library for proper Word document generation
 */
export async function exportResumeToDOCX(
  data: ResumeTemplateData,
  filename: string = 'resume.docx'
): Promise<void> {
  try {
    const doc = new Document({
      sections: [
        {
          properties: {
            page: {
              margin: {
                top: 720, // 0.5 inch
                right: 720,
                bottom: 720,
                left: 720,
              },
            },
          },
          children: generateDocumentContent(data),
        },
      ],
    });

    // Generate and download
    const blob = await Packer.toBlob(doc);
    saveAs(blob, filename);

    console.log('[Export] DOCX generated successfully:', filename);
  } catch (error) {
    console.error('[Export] Error generating DOCX:', error);
    throw new Error('Failed to generate DOCX. Please try again.');
  }
}

function generateDocumentContent(data: ResumeTemplateData): Paragraph[] {
  const content: Paragraph[] = [];

  // Header - Name
  content.push(
    new Paragraph({
      text: data.name,
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      spacing: { after: 100 },
      border: {
        bottom: {
          color: '000000',
          space: 1,
          style: BorderStyle.SINGLE,
          size: 6,
        },
      },
    })
  );

  // Contact Info
  const contactParts: string[] = [];
  if (data.email) contactParts.push(data.email);
  if (data.phone) contactParts.push(data.phone);
  if (data.location) contactParts.push(data.location);
  if (data.linkedin) contactParts.push(data.linkedin);
  if (data.website) contactParts.push(data.website);

  content.push(
    new Paragraph({
      text: contactParts.join(' • '),
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
    })
  );

  // Target Role (Optional)
  if (data.targetRole) {
    content.push(
      new Paragraph({
        text: data.targetRole,
        alignment: AlignmentType.CENTER,
        bold: true,
        spacing: { after: 200 },
      })
    );
  }

  // Professional Summary
  if (data.summary) {
    content.push(createSectionHeader('PROFESSIONAL SUMMARY'));
    content.push(
      new Paragraph({
        text: data.summary,
        spacing: { after: 200 },
        alignment: AlignmentType.JUSTIFIED,
      })
    );
  }

  // Experience
  if (data.experience && data.experience.length > 0) {
    content.push(createSectionHeader('EXPERIENCE'));

    data.experience.forEach((exp, idx) => {
      // Company | Role
      content.push(
        new Paragraph({
          children: [
            new TextRun({
              text: exp.company,
              bold: true,
            }),
            new TextRun({
              text: ' | ',
            }),
            new TextRun({
              text: exp.role,
              bold: true,
              italics: true,
            }),
          ],
          spacing: { before: idx === 0 ? 0 : 150, after: 50 },
        })
      );

      // Location | Dates
      const metaParts: string[] = [];
      if (exp.location) metaParts.push(exp.location);
      metaParts.push(`${exp.startDate} – ${exp.endDate}`);

      content.push(
        new Paragraph({
          text: metaParts.join(' | '),
          spacing: { after: 100 },
        })
      );

      // Bullets
      exp.bullets.forEach((bullet) => {
        content.push(
          new Paragraph({
            text: bullet,
            bullet: {
              level: 0,
            },
            spacing: { after: 50 },
          })
        );
      });
    });

    content.push(new Paragraph({ text: '', spacing: { after: 100 } }));
  }

  // Skills
  if (data.skills && Object.keys(data.skills).length > 0) {
    content.push(createSectionHeader('SKILLS'));

    Object.entries(data.skills).forEach(([category, skillsList]) => {
      if (!skillsList || skillsList.length === 0) return;

      const categoryLabel = formatSkillCategory(category);
      content.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `${categoryLabel}: `,
              bold: true,
            }),
            new TextRun({
              text: skillsList.join(', '),
            }),
          ],
          spacing: { after: 100 },
        })
      );
    });

    content.push(new Paragraph({ text: '', spacing: { after: 100 } }));
  }

  // Education
  if (data.education && data.education.length > 0) {
    content.push(createSectionHeader('EDUCATION'));

    data.education.forEach((edu, idx) => {
      // Institution | Location
      const headerParts = [edu.institution];
      if (edu.location) headerParts.push(edu.location);

      content.push(
        new Paragraph({
          children: [
            new TextRun({
              text: headerParts.join(' | '),
              bold: true,
            }),
          ],
          spacing: { before: idx === 0 ? 0 : 150, after: 50 },
        })
      );

      // Degree details
      const degreeParts = [edu.degree];
      if (edu.field) degreeParts.push(`in ${edu.field}`);
      if (edu.gpa) degreeParts.push(`GPA: ${edu.gpa}`);

      content.push(
        new Paragraph({
          text: degreeParts.join(' • '),
          italics: true,
          spacing: { after: 50 },
        })
      );

      // Graduation date
      content.push(
        new Paragraph({
          text: edu.graduationDate,
          spacing: { after: edu.honors && edu.honors.length > 0 ? 50 : 0 },
        })
      );

      // Honors
      if (edu.honors && edu.honors.length > 0) {
        content.push(
          new Paragraph({
            text: edu.honors.join(' • '),
            spacing: { after: 100 },
          })
        );
      }
    });

    content.push(new Paragraph({ text: '', spacing: { after: 100 } }));
  }

  // Projects (Optional)
  if (data.projects && data.projects.length > 0) {
    content.push(createSectionHeader('PROJECTS'));

    data.projects.forEach((project, idx) => {
      // Project name | Date
      const headerParts = [project.name];
      if (project.date) headerParts.push(project.date);

      content.push(
        new Paragraph({
          text: headerParts.join(' | '),
          bold: true,
          spacing: { before: idx === 0 ? 0 : 150, after: 50 },
        })
      );

      // Description
      content.push(
        new Paragraph({
          text: project.description,
          spacing: { after: project.technologies ? 50 : 100 },
        })
      );

      // Technologies
      if (project.technologies && project.technologies.length > 0) {
        content.push(
          new Paragraph({
            children: [
              new TextRun({
                text: 'Technologies: ',
                bold: true,
              }),
              new TextRun({
                text: project.technologies.join(', '),
              }),
            ],
            spacing: { after: 100 },
          })
        );
      }
    });

    content.push(new Paragraph({ text: '', spacing: { after: 100 } }));
  }

  // Certifications (Optional)
  if (data.certifications && data.certifications.length > 0) {
    content.push(createSectionHeader('CERTIFICATIONS'));

    data.certifications.forEach((cert) => {
      content.push(
        new Paragraph({
          text: `${cert.name} | ${cert.issuer} | ${cert.date}`,
          spacing: { after: 50 },
        })
      );
    });

    content.push(new Paragraph({ text: '', spacing: { after: 100 } }));
  }

  // Publications (Optional)
  if (data.publications && data.publications.length > 0) {
    content.push(createSectionHeader('PUBLICATIONS'));

    data.publications.forEach((pub) => {
      content.push(
        new Paragraph({
          text: pub.title,
          italics: true,
          bold: true,
          spacing: { after: 50 },
        })
      );

      content.push(
        new Paragraph({
          text: `${pub.publisher} | ${pub.date}`,
          spacing: { after: 100 },
        })
      );
    });
  }

  return content;
}

function createSectionHeader(text: string): Paragraph {
  return new Paragraph({
    text,
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 200, after: 100 },
    border: {
      bottom: {
        color: '000000',
        space: 1,
        style: BorderStyle.SINGLE,
        size: 6,
      },
    },
  });
}

function formatSkillCategory(category: string): string {
  const categoryMap: Record<string, string> = {
    technical: 'Technical',
    leadership: 'Leadership & Management',
    tools: 'Tools & Platforms',
    languages: 'Programming Languages',
    certifications: 'Certifications',
  };

  return (
    categoryMap[category.toLowerCase()] ||
    category
      .split(/[\s_-]+/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ')
  );
}
