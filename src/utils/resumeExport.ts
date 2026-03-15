import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import type { ResumeTemplateData } from '../types/resumeTemplate';

/**
 * Export resume as PDF
 * Uses html2canvas + jsPDF for accurate rendering
 */
export async function exportResumeToPDF(
  element: HTMLElement,
  filename: string = 'resume.pdf'
): Promise<void> {
  try {
    // Capture the resume as canvas
    const canvas = await html2canvas(element, {
      scale: 2, // Higher quality
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight,
    });

    // Convert canvas to image
    const imgData = canvas.toDataURL('image/png');

    // Calculate PDF dimensions (Letter size: 8.5" x 11")
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'in',
      format: 'letter',
    });

    const pageWidth = 8.5;
    const pageHeight = 11;
    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    // Calculate how many pages we need
    const totalPages = Math.ceil(imgHeight / pageHeight);

    // Add pages
    for (let page = 0; page < totalPages; page++) {
      if (page > 0) {
        pdf.addPage();
      }

      const yOffset = -(page * pageHeight);

      pdf.addImage(
        imgData,
        'PNG',
        0,
        yOffset,
        imgWidth,
        imgHeight,
        undefined,
        'FAST'
      );
    }

    // Save the PDF
    pdf.save(filename);

    console.log('[Export] PDF generated successfully:', filename);
  } catch (error) {
    console.error('[Export] Error generating PDF:', error);
    throw new Error('Failed to generate PDF. Please try again.');
  }
}

/**
 * Alternative: Export using print dialog
 * More reliable for complex layouts, maintains better quality
 */
export function exportResumeToPDFViaPrint(
  element: HTMLElement,
  filename: string = 'resume.pdf'
): void {
  // Create a new window with just the resume content
  const printWindow = window.open('', '_blank');

  if (!printWindow) {
    throw new Error('Please allow pop-ups to export your resume');
  }

  // Get all stylesheets
  const styles = Array.from(document.styleSheets)
    .map((styleSheet) => {
      try {
        return Array.from(styleSheet.cssRules)
          .map((rule) => rule.cssText)
          .join('\n');
      } catch (e) {
        // Handle CORS issues with external stylesheets
        const link = styleSheet.href;
        return link ? `@import url('${link}');` : '';
      }
    })
    .join('\n');

  // Write the content to the new window
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${filename}</title>
        <style>
          ${styles}
          @page {
            size: letter;
            margin: 0.5in;
          }
          body {
            margin: 0;
            padding: 0;
          }
        </style>
      </head>
      <body>
        ${element.outerHTML}
      </body>
    </html>
  `);

  printWindow.document.close();

  // Wait for content to load, then print
  setTimeout(() => {
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  }, 500);

  console.log('[Export] PDF print dialog opened');
}

/**
 * Export resume data as JSON (for backup/transfer)
 */
export function exportResumeToJSON(
  data: ResumeTemplateData,
  filename: string = 'resume-data.json'
): void {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);

  console.log('[Export] JSON exported:', filename);
}

/**
 * Create a plain text version (for ATS systems that only accept text)
 */
export function exportResumeToPlainText(
  data: ResumeTemplateData,
  filename: string = 'resume.txt'
): void {
  let text = '';

  // Header
  text += `${data.name}\n`;
  text += `${data.email} | ${data.phone}`;
  if (data.location) text += ` | ${data.location}`;
  if (data.linkedin) text += ` | ${data.linkedin}`;
  text += '\n\n';

  // Target Role
  if (data.targetRole) {
    text += `${data.targetRole}\n\n`;
  }

  // Summary
  if (data.summary) {
    text += `PROFESSIONAL SUMMARY\n`;
    text += `${data.summary}\n\n`;
  }

  // Experience
  if (data.experience && data.experience.length > 0) {
    text += `EXPERIENCE\n\n`;
    data.experience.forEach((exp) => {
      text += `${exp.company} | ${exp.role}\n`;
      if (exp.location) text += `${exp.location} | `;
      text += `${exp.startDate} - ${exp.endDate}\n`;
      exp.bullets.forEach((bullet) => {
        text += `• ${bullet}\n`;
      });
      text += '\n';
    });
  }

  // Skills
  if (data.skills && Object.keys(data.skills).length > 0) {
    text += `SKILLS\n\n`;
    Object.entries(data.skills).forEach(([category, skills]) => {
      if (skills && skills.length > 0) {
        const label = category.charAt(0).toUpperCase() + category.slice(1);
        text += `${label}: ${skills.join(', ')}\n`;
      }
    });
    text += '\n';
  }

  // Education
  if (data.education && data.education.length > 0) {
    text += `EDUCATION\n\n`;
    data.education.forEach((edu) => {
      text += `${edu.institution}`;
      if (edu.location) text += ` | ${edu.location}`;
      text += ` | ${edu.graduationDate}\n`;
      text += `${edu.degree}`;
      if (edu.field) text += ` in ${edu.field}`;
      if (edu.gpa) text += ` | GPA: ${edu.gpa}`;
      text += '\n';
      if (edu.honors && edu.honors.length > 0) {
        text += `${edu.honors.join(' • ')}\n`;
      }
      text += '\n';
    });
  }

  // Projects
  if (data.projects && data.projects.length > 0) {
    text += `PROJECTS\n\n`;
    data.projects.forEach((project) => {
      text += `${project.name}`;
      if (project.date) text += ` | ${project.date}`;
      text += `\n${project.description}\n`;
      if (project.technologies && project.technologies.length > 0) {
        text += `Technologies: ${project.technologies.join(', ')}\n`;
      }
      text += '\n';
    });
  }

  // Certifications
  if (data.certifications && data.certifications.length > 0) {
    text += `CERTIFICATIONS\n\n`;
    data.certifications.forEach((cert) => {
      text += `${cert.name} | ${cert.issuer} | ${cert.date}\n`;
    });
    text += '\n';
  }

  // Publications
  if (data.publications && data.publications.length > 0) {
    text += `PUBLICATIONS\n\n`;
    data.publications.forEach((pub) => {
      text += `${pub.title}\n`;
      text += `${pub.publisher} | ${pub.date}\n\n`;
    });
  }

  // Create and download
  const blob = new Blob([text], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);

  console.log('[Export] Plain text exported:', filename);
}
