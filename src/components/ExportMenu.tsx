import { useState } from 'react';
import { Download, CheckCircle, ExternalLink } from 'lucide-react';
import type { StructuredResume } from '../types/resume';
import { useSubscription } from '../contexts/SubscriptionContext';

interface ExportMenuProps {
  resume: StructuredResume | null;
  onUpgradeNeeded?: () => void;
  jobUrl?: string;
}

export function ExportMenu({ resume, onUpgradeNeeded, jobUrl }: ExportMenuProps) {
  const { canUseFeature, incrementUsage } = useSubscription();
  const [showMenu, setShowMenu] = useState(false);
  const [justExported, setJustExported] = useState(false);

  const exportAsPDF = async () => {
    if (!resume) return;

    // Check subscription limits
    if (!canUseFeature('exportsUsed')) {
      onUpgradeNeeded?.();
      return;
    }

    incrementUsage('exportsUsed');

    try {
      const jsPDF = (await import('jspdf')).default;
      const doc = new jsPDF();

      let yPos = 25.4;
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 25.4;
      const maxWidth = pageWidth - (margin * 2);

      const checkPageBreak = (requiredSpace: number = 15) => {
        if (yPos + requiredSpace > pageHeight - margin) {
          doc.addPage();
          yPos = margin;
        }
      };

      // Header - Name
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      const name = resume.name || 'Your Name';
      doc.text(name, pageWidth / 2, yPos, { align: 'center' });
      yPos += 6;

      // Contact Info
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const contactParts = [];
      if (resume.location) contactParts.push(resume.location);
      if (resume.email) contactParts.push(resume.email);
      if (resume.phone) contactParts.push(resume.phone);
      if (resume.linkedin) contactParts.push(resume.linkedin);

      if (contactParts.length > 0) {
        const contactText = contactParts.join(' | ');
        doc.text(contactText, pageWidth / 2, yPos, { align: 'center' });
        yPos += 8;
      } else {
        yPos += 5;
      }

      // Professional Summary
      if (resume.summary) {
        checkPageBreak(20);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('PROFESSIONAL SUMMARY', margin, yPos);
        yPos += 6;

        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        const summaryLines = doc.splitTextToSize(resume.summary, maxWidth);
        summaryLines.forEach((line: string) => {
          checkPageBreak();
          doc.text(line, margin, yPos);
          yPos += 5;
        });
        yPos += 6;
      }

      // Professional Experience
      if (resume.experience.length > 0) {
        checkPageBreak(20);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('PROFESSIONAL EXPERIENCE', margin, yPos);
        yPos += 6;

        resume.experience.forEach((exp, idx) => {
          checkPageBreak(30);

          // Company Name
          doc.setFontSize(12);
          doc.setFont('helvetica', 'bold');
          doc.text(exp.company, margin, yPos);
          yPos += 5.5;

          // Role Title
          doc.setFontSize(11);
          doc.setFont('helvetica', 'bold');
          doc.text(exp.role, margin, yPos);
          yPos += 5;

          // Location | Dates
          doc.setFontSize(10);
          doc.setFont('helvetica', 'normal');
          const location = exp.location || 'City, State';
          const startYear = exp.startDate.includes(',') ? exp.startDate.split(',')[1].trim() : exp.startDate;
          const endYear = exp.current ? 'Present' : (exp.endDate.includes(',') ? exp.endDate.split(',')[1].trim() : exp.endDate);
          doc.text(`${location} | ${startYear} – ${endYear}`, margin, yPos);
          yPos += 7;

          // Bullets
          doc.setFontSize(11);
          doc.setFont('helvetica', 'normal');
          exp.bullets.forEach(bullet => {
            checkPageBreak(8);
            const bulletLines = doc.splitTextToSize(`• ${bullet}`, maxWidth - 3);
            bulletLines.forEach((line: string, lineIdx: number) => {
              checkPageBreak();
              if (lineIdx === 0) {
                doc.text(line, margin + 2, yPos);
              } else {
                doc.text(line.trim(), margin + 5, yPos);
              }
              yPos += 5;
            });
          });

          if (idx < resume.experience.length - 1) {
            yPos += 6;
          }
        });
        yPos += 6;
      }

      // Core Skills
      if (resume.skills.length > 0) {
        checkPageBreak(15);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('CORE SKILLS', margin, yPos);
        yPos += 6;

        const categoryNames: Record<string, string> = {
          'technical': 'Technical',
          'tool': 'Tools & Technologies',
          'soft': 'Professional Skills',
          'language': 'Languages'
        };

        const skillsByCategory = resume.skills.reduce((acc, skill) => {
          const category = skill.category || 'technical';
          if (!acc[category]) acc[category] = [];
          acc[category].push(skill.name);
          return acc;
        }, {} as Record<string, string[]>);

        Object.entries(skillsByCategory).forEach(([category, skills], idx) => {
          checkPageBreak(10);

          doc.setFontSize(11);
          doc.setFont('helvetica', 'bold');
          const displayName = categoryNames[category] || category;
          doc.text(displayName, margin, yPos);
          yPos += 5;

          doc.setFontSize(10);
          doc.setFont('helvetica', 'normal');
          const skillsText = skills.join(' • ');
          const skillLines = doc.splitTextToSize(skillsText, maxWidth);
          skillLines.forEach((line: string) => {
            checkPageBreak();
            doc.text(line, margin, yPos);
            yPos += 5;
          });

          if (idx < Object.keys(skillsByCategory).length - 1) {
            yPos += 3;
          }
        });
        yPos += 6;
      }

      // Education
      if (resume.education.length > 0) {
        checkPageBreak(15);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('EDUCATION', margin, yPos);
        yPos += 6;

        resume.education.forEach(edu => {
          checkPageBreak(15);

          doc.setFontSize(11);
          doc.setFont('helvetica', 'bold');
          const degreeText = `${edu.degree} in ${edu.field}`;
          doc.text(degreeText, margin, yPos);
          yPos += 5;

          doc.setFontSize(10);
          doc.setFont('helvetica', 'normal');
          const eduLine = `${edu.school} | ${edu.startDate} – ${edu.endDate}`;
          doc.text(eduLine, margin, yPos);
          yPos += 4;

          if (edu.gpa) {
            doc.text(`GPA: ${edu.gpa}`, margin, yPos);
            yPos += 4;
          }
          yPos += 2;
        });
      }

      doc.save(`${name.replace(/\s+/g, '_')}_Resume.pdf`);
      setJustExported(true);
      setTimeout(() => setJustExported(false), 3000);
    } catch (error) {
      console.error('PDF export error:', error);
      alert(`Failed to export PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const exportAsDOCX = async () => {
    if (!resume) return;

    if (!canUseFeature('exportsUsed')) {
      onUpgradeNeeded?.();
      return;
    }

    incrementUsage('exportsUsed');

    try {
      const { Document, Packer, Paragraph, TextRun, AlignmentType } = await import('docx');
      const { saveAs } = await import('file-saver');

      const paragraphs: any[] = [];

      // Header - Name
      const name = resume.name || 'Your Name';
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: name,
              bold: true,
              size: 40
            })
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 120 }
        })
      );

      // Contact Info
      const contactParts = [];
      if (resume.location) contactParts.push(resume.location);
      if (resume.email) contactParts.push(resume.email);
      if (resume.phone) contactParts.push(resume.phone);
      if (resume.linkedin) contactParts.push(resume.linkedin);

      if (contactParts.length > 0) {
        paragraphs.push(
          new Paragraph({
            text: contactParts.join(' | '),
            alignment: AlignmentType.CENTER,
            spacing: { after: 240 }
          })
        );
      }

      // Professional Summary
      if (resume.summary) {
        paragraphs.push(
          new Paragraph({
            children: [
              new TextRun({
                text: 'PROFESSIONAL SUMMARY',
                bold: true,
                size: 24
              })
            ],
            spacing: { after: 120, before: 0 }
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: resume.summary,
                size: 22
              })
            ],
            spacing: { after: 240 }
          })
        );
      }

      // Professional Experience
      if (resume.experience.length > 0) {
        paragraphs.push(
          new Paragraph({
            children: [
              new TextRun({
                text: 'PROFESSIONAL EXPERIENCE',
                bold: true,
                size: 24
              })
            ],
            spacing: { after: 120, before: 240 }
          })
        );

        resume.experience.forEach((exp, idx) => {
          // Company Name
          paragraphs.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: exp.company,
                  bold: true,
                  size: 24
                })
              ],
              spacing: { after: 100 }
            })
          );

          // Role Title
          paragraphs.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: exp.role,
                  bold: true,
                  size: 22
                })
              ],
              spacing: { after: 100 }
            })
          );

          // Location | Dates
          const location = exp.location || 'City, State';
          const startYear = exp.startDate.includes(',') ? exp.startDate.split(',')[1].trim() : exp.startDate;
          const endYear = exp.current ? 'Present' : (exp.endDate.includes(',') ? exp.endDate.split(',')[1].trim() : exp.endDate);
          paragraphs.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: `${location} | ${startYear} – ${endYear}`,
                  size: 20
                })
              ],
              spacing: { after: 160 }
            })
          );

          // Bullets
          exp.bullets.forEach((bullet, bulletIdx) => {
            paragraphs.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: `• ${bullet}`,
                    size: 22
                  })
                ],
                spacing: { after: bulletIdx === exp.bullets.length - 1 ? 120 : 100 },
                indent: { left: 360 }
              })
            );
          });

          if (idx < resume.experience.length - 1) {
            paragraphs.push(new Paragraph({ text: '', spacing: { after: 200 } }));
          } else {
            paragraphs.push(new Paragraph({ text: '', spacing: { after: 240 } }));
          }
        });
      }

      // Core Skills
      if (resume.skills.length > 0) {
        paragraphs.push(
          new Paragraph({
            children: [
              new TextRun({
                text: 'CORE SKILLS',
                bold: true,
                size: 24
              })
            ],
            spacing: { after: 120, before: 240 }
          })
        );

        const categoryNames: Record<string, string> = {
          'technical': 'Technical',
          'tool': 'Tools & Technologies',
          'soft': 'Professional Skills',
          'language': 'Languages'
        };

        const skillsByCategory = resume.skills.reduce((acc, skill) => {
          const category = skill.category || 'technical';
          if (!acc[category]) acc[category] = [];
          acc[category].push(skill.name);
          return acc;
        }, {} as Record<string, string[]>);

        Object.entries(skillsByCategory).forEach(([category, skills], idx) => {
          const displayName = categoryNames[category] || category;
          const isLast = idx === Object.keys(skillsByCategory).length - 1;

          paragraphs.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: displayName,
                  bold: true,
                  size: 22
                })
              ],
              spacing: { after: 100 }
            })
          );

          paragraphs.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: skills.join(' • '),
                  size: 20
                })
              ],
              spacing: { after: isLast ? 240 : 180 }
            })
          );
        });
      }

      // Education
      if (resume.education.length > 0) {
        paragraphs.push(
          new Paragraph({
            children: [
              new TextRun({
                text: 'EDUCATION',
                bold: true,
                size: 24
              })
            ],
            spacing: { after: 120, before: 240 }
          })
        );

        resume.education.forEach(edu => {
          paragraphs.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: `${edu.degree} in ${edu.field}`,
                  bold: true,
                  size: 22
                })
              ],
              spacing: { after: 100 }
            })
          );

          paragraphs.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: `${edu.school} | ${edu.startDate} – ${edu.endDate}`,
                  size: 20
                })
              ],
              spacing: { after: edu.gpa ? 80 : 180 }
            })
          );

          if (edu.gpa) {
            paragraphs.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: `GPA: ${edu.gpa}`,
                    size: 20
                  })
                ],
                spacing: { after: 180 }
              })
            );
          }
        });
      }

      const doc = new Document({
        sections: [{
          properties: {},
          children: paragraphs
        }]
      });

      const blob = await Packer.toBlob(doc);
      saveAs(blob, `${name.replace(/\s+/g, '_')}_Resume.docx`);
      setJustExported(true);
      setTimeout(() => setJustExported(false), 3000);
    } catch (error) {
      console.error('DOCX export error:', error);
      alert(`Failed to export DOCX: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="relative flex-1 sm:flex-initial">
      <button
        onClick={() => setShowMenu(!showMenu)}
        disabled={!resume}
        className={`w-full sm:w-auto flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-bold
          disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl text-sm sm:text-base ${
          justExported
            ? 'bg-green-600 hover:bg-green-700 text-white'
            : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white'
        }`}
      >
        {justExported ? (
          <>
            <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Resume Ready!</span>
          </>
        ) : (
          <>
            <Download className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">Ready to Apply!</span>
            <span className="sm:hidden">Export</span>
          </>
        )}
      </button>

      {showMenu && resume && (
        <div className="absolute top-12 sm:top-14 right-0 bg-white rounded-xl shadow-2xl border-2 border-indigo-200 py-2 w-64 sm:w-80 z-50">
          {/* Quick Info Banner */}
          <div className="px-4 py-3 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-indigo-100">
            <p className="text-xs font-semibold text-indigo-900">
              ✨ Your tailored resume with your contact info
            </p>
            <p className="text-xs text-indigo-700 mt-0.5">
              Ready to send: {resume.name || 'Your Name'}
            </p>
          </div>

          {/* Export Options */}
          <div className="py-2">
            <button
              onClick={() => { exportAsPDF(); setShowMenu(false); }}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 text-left hover:bg-gray-50 transition-colors flex items-center gap-2 sm:gap-3"
            >
              <Download className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-xs sm:text-sm text-gray-900">Export as PDF</p>
                <p className="text-xs text-gray-500">Professional print-ready format</p>
              </div>
            </button>
            <button
              onClick={() => { exportAsDOCX(); setShowMenu(false); }}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 text-left hover:bg-gray-50 transition-colors flex items-center gap-2 sm:gap-3"
            >
              <Download className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-xs sm:text-sm text-gray-900">Export as DOCX</p>
                <p className="text-xs text-gray-500">Editable Word document</p>
              </div>
            </button>
          </div>

          {/* Apply Now CTA - if job URL exists */}
          {jobUrl && (
            <div className="border-t border-gray-200 p-3">
              <a
                href={jobUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setShowMenu(false)}
                className="block w-full py-2.5 px-4 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors text-sm flex items-center justify-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Apply on LinkedIn →</span>
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
