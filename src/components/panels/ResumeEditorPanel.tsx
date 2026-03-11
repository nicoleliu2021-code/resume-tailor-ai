import { useState, useEffect } from 'react';
import { useResume } from '../../contexts/ResumeContext';
import { useSubscription } from '../../contexts/SubscriptionContext';
import { UpgradeModal } from '../modals/UpgradeModal';
import { Edit3, Sparkles, TrendingUp, BarChart3, CheckCircle2, AlertCircle, Save, X, Plus, Download, AlertTriangle } from 'lucide-react';

export function ResumeEditorPanel() {
  const { resume, setResume, jobAnalysis, jobDescription, originalResume } = useResume();
  const { canUseFeature, incrementUsage, getRemainingUsage } = useSubscription();
  const [editingExpId, setEditingExpId] = useState<string | null>(null);
  const [editingBullet, setEditingBullet] = useState<{ expId: string; bulletIdx: number } | null>(null);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeFeatureName, setUpgradeFeatureName] = useState<string>('');
  const [dragOverExpId, setDragOverExpId] = useState<string | null>(null);
  const [dragOverSection, setDragOverSection] = useState<string | null>(null);
  const [improvingBullet, setImprovingBullet] = useState<{ expId: string; bulletIdx: number; action: string } | null>(null);
  const [modifiedBullets, setModifiedBullets] = useState<Set<string>>(new Set());
  const [editingSkills, setEditingSkills] = useState(false);
  const [newSkillName, setNewSkillName] = useState('');

  // Debug logging
  console.log('[ResumeEditorPanel] resume:', resume);
  console.log('[ResumeEditorPanel] jobAnalysis:', jobAnalysis);

  // Detect AI-optimized bullets by comparing with originalResume
  useEffect(() => {
    if (!originalResume || !resume) return;

    const modified = new Set<string>();

    // Check summary changes
    if (originalResume.summary !== resume.summary) {
      modified.add('summary');
    }

    // Check bullet changes
    resume.experience.forEach(exp => {
      const originalExp = originalResume.experience.find(e => e.id === exp.id);
      if (!originalExp) return;

      exp.bullets.forEach((bullet, idx) => {
        const originalBullet = originalExp.bullets[idx];
        if (originalBullet && originalBullet !== bullet) {
          modified.add(`${exp.id}-${idx}`);
        }
      });
    });

    // Check skill changes
    const originalSkillNames = originalResume.skills.map(s => s.name).sort().join(',');
    const currentSkillNames = resume.skills.map(s => s.name).sort().join(',');
    if (originalSkillNames !== currentSkillNames) {
      modified.add('skills');
    }

    setModifiedBullets(modified);
  }, [originalResume, resume]);

  // Analyze bullet quality and keyword match
  const analyzeBullet = (bullet: string) => {
    const hasMetrics = /\d+[%+]?|\$\d+[KMB]?|\d+[KMB]\+?/.test(bullet);
    const wordCount = bullet.split(' ').length;
    const hasActionVerb = /^(Led|Drove|Architected|Implemented|Managed|Spearheaded|Delivered|Achieved|Increased|Reduced|Built|Created|Designed|Developed|Established)/i.test(bullet);

    // Check for keyword matches (compare against jobAnalysis.atsKeywords)
    const keywords = jobAnalysis?.atsKeywords || [];
    const matchedKeywords = keywords.filter(kw =>
      bullet.toLowerCase().includes(kw.toLowerCase())
    ).length;

    const quality = hasMetrics && hasActionVerb && matchedKeywords > 0 ? 'strong' :
                   hasMetrics || hasActionVerb || matchedKeywords > 0 ? 'medium' : 'weak';

    return {
      hasMetrics,
      isTooShort: wordCount < 8,
      isTooLong: wordCount > 30,
      hasActionVerb,
      keywordMatches: matchedKeywords,
      quality
    };
  };

  // Helper function to highlight metrics in text
  const highlightMetrics = (text: string) => {
    // Match numbers with optional % or + or $ or M/K suffixes
    const parts = text.split(/(\d+[%+]?|\$\d+[KMB]?|\d+[KMB]\+?)/g);
    return parts.map((part, idx) => {
      if (/\d/.test(part)) {
        return (
          <span key={idx} className="font-bold text-indigo-700">
            {part}
          </span>
        );
      }
      return part;
    });
  };

  // Export functions
  const exportAsPlainText = () => {
    if (!resume) return;

    // Check subscription limits
    if (!canUseFeature('exportsUsed')) {
      setUpgradeFeatureName('Resume Exports');
      setShowUpgradeModal(true);
      return;
    }

    incrementUsage('exportsUsed');

    let text = '';

    // Header: Name
    const name = resume.name || 'Your Name';
    text += `${name}\n`;

    // Contact Info: City, State | Email | Phone | LinkedIn
    const contactParts = [];
    if (resume.location) contactParts.push(resume.location);
    if (resume.email) contactParts.push(resume.email);
    if (resume.phone) contactParts.push(resume.phone);
    if (resume.linkedin) contactParts.push(resume.linkedin);

    if (contactParts.length > 0) {
      text += `${contactParts.join(' | ')}\n`;
    }
    text += '\n' + '='.repeat(80) + '\n\n';

    // Professional Summary
    if (resume.summary) {
      text += 'PROFESSIONAL SUMMARY\n';
      text += `${resume.summary}\n\n`;
    }

    // Professional Experience
    text += 'PROFESSIONAL EXPERIENCE\n\n';
    resume.experience.forEach(exp => {
      // Company Name
      text += `${exp.company}\n`;
      // Role Title
      text += `${exp.role}\n`;
      // City, State | Start Year – End Year
      const location = exp.location || 'City, State';
      const startYear = exp.startDate.includes(',') ? exp.startDate.split(',')[1].trim() : exp.startDate;
      const endYear = exp.current ? 'Present' : (exp.endDate.includes(',') ? exp.endDate.split(',')[1].trim() : exp.endDate);
      text += `${location} | ${startYear} – ${endYear}\n\n`;
      // Bullets (with blank line before)
      exp.bullets.forEach(bullet => {
        text += `• ${bullet}\n`;
      });
      text += '\n';
    });

    // Core Skills - Grouped by category
    text += 'CORE SKILLS\n\n';
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

    Object.entries(skillsByCategory).forEach(([category, skills]) => {
      const displayName = categoryNames[category] || category;
      text += `${displayName}\n`;
      text += skills.join(' • ') + '\n\n';
    });

    // Education
    text += 'EDUCATION\n\n';
    resume.education.forEach(edu => {
      text += `${edu.degree} in ${edu.field}\n`;
      text += `${edu.school} | ${edu.startDate} – ${edu.endDate}\n`;
      if (edu.gpa) text += `GPA: ${edu.gpa}\n`;
      text += '\n';
    });

    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'resume-ats.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportAsPDF = async () => {
    if (!resume) return;

    // Check subscription limits
    if (!canUseFeature('exportsUsed')) {
      setUpgradeFeatureName('Resume Exports');
      setShowUpgradeModal(true);
      return;
    }

    incrementUsage('exportsUsed');

    try {
      // Dynamic import to avoid bundling if not used
      const jsPDF = (await import('jspdf')).default;
      const doc = new jsPDF();

      let yPos = 25.4; // Start at 1 inch (25.4mm)
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 25.4; // 1 inch margins (25.4mm)
      const maxWidth = pageWidth - (margin * 2);

      // Helper to check if we need a new page
      const checkPageBreak = (requiredSpace: number = 15) => {
        if (yPos + requiredSpace > pageHeight - margin) {
          doc.addPage();
          yPos = margin;
        }
      };

      // Header - Name (18-22pt, centered)
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      const name = resume.name || 'Your Name';
      doc.text(name, pageWidth / 2, yPos, { align: 'center' });
      yPos += 6;

      // Contact Info: City, State | Email | Phone | LinkedIn (centered, single line)
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

      // Professional Summary Section
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

      // Professional Experience Section
      if (resume.experience.length > 0) {
        checkPageBreak(20);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('PROFESSIONAL EXPERIENCE', margin, yPos);
        yPos += 6;

        resume.experience.forEach((exp, idx) => {
          checkPageBreak(30);

          // Company Name (bold, 12pt) - Line 1
          doc.setFontSize(12);
          doc.setFont('helvetica', 'bold');
          doc.text(exp.company, margin, yPos);
          yPos += 5.5;

          // Role Title (bold, 11pt) - Line 2
          doc.setFontSize(11);
          doc.setFont('helvetica', 'bold');
          doc.text(exp.role, margin, yPos);
          yPos += 5;

          // City, State | Start Year – End Year (normal, 10pt) - Line 3
          doc.setFontSize(10);
          doc.setFont('helvetica', 'normal');
          const location = exp.location || 'City, State';
          // Extract just the year from dates
          const startYear = exp.startDate.includes(',') ? exp.startDate.split(',')[1].trim() : exp.startDate;
          const endYear = exp.current ? 'Present' : (exp.endDate.includes(',') ? exp.endDate.split(',')[1].trim() : exp.endDate);
          doc.text(`${location} | ${startYear} – ${endYear}`, margin, yPos);
          yPos += 7;

          // Bullets (11pt, normal) - with blank line before
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

          // Spacing between experience entries
          if (idx < resume.experience.length - 1) {
            yPos += 6;
          }
        });
        yPos += 6;
      }

      // Core Skills Section - Grouped by category
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

          // Category name (11pt, bold)
          doc.setFontSize(11);
          doc.setFont('helvetica', 'bold');
          const displayName = categoryNames[category] || category;
          doc.text(displayName, margin, yPos);
          yPos += 5;

          // Skills list (10pt, normal)
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

      // Education Section
      if (resume.education.length > 0) {
        checkPageBreak(15);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('EDUCATION', margin, yPos);
        yPos += 6;

        resume.education.forEach(edu => {
          checkPageBreak(15);

          // Degree in Field (bold, 11pt)
          doc.setFontSize(11);
          doc.setFont('helvetica', 'bold');
          const degreeText = `${edu.degree} in ${edu.field}`;
          doc.text(degreeText, margin, yPos);
          yPos += 5;

          // School | Start Date – End Date (normal, 10pt)
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

      doc.save('resume.pdf');
      console.log('[ResumeEditorPanel] PDF exported successfully');
    } catch (error) {
      console.error('[ResumeEditorPanel] PDF export error:', error);
      alert(`Failed to export PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const exportAsDOCX = async () => {
    if (!resume) return;

    // Check subscription limits
    if (!canUseFeature('exportsUsed')) {
      setUpgradeFeatureName('Resume Exports');
      setShowUpgradeModal(true);
      return;
    }

    incrementUsage('exportsUsed');

    try {
      // Dynamic import
      const { Document, Packer, Paragraph, TextRun, AlignmentType } = await import('docx');
      const { saveAs } = await import('file-saver');

      const paragraphs: any[] = [];

      // Header - Name (20pt, centered, bold)
      const name = resume.name || 'Your Name';
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: name,
              bold: true,
              size: 40 // 20pt
            })
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 120 }
        })
      );

      // Contact Info: City, State | Email | Phone | LinkedIn (10pt, centered)
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

      // Professional Summary Section (12pt header, 11pt body)
      if (resume.summary) {
        paragraphs.push(
          new Paragraph({
            children: [
              new TextRun({
                text: 'PROFESSIONAL SUMMARY',
                bold: true,
                size: 24 // 12pt
              })
            ],
            spacing: { after: 120, before: 0 }
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: resume.summary,
                size: 22 // 11pt
              })
            ],
            spacing: { after: 240 }
          })
        );
      }

      // Professional Experience Section (12pt header)
      if (resume.experience.length > 0) {
        paragraphs.push(
          new Paragraph({
            children: [
              new TextRun({
                text: 'PROFESSIONAL EXPERIENCE',
                bold: true,
                size: 24 // 12pt
              })
            ],
            spacing: { after: 120, before: 240 }
          })
        );

        resume.experience.forEach((exp, idx) => {
          // Company Name (bold, 12pt) - Line 1
          paragraphs.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: exp.company,
                  bold: true,
                  size: 24 // 12pt
                })
              ],
              spacing: { after: 100 }
            })
          );

          // Role Title (bold, 11pt) - Line 2
          paragraphs.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: exp.role,
                  bold: true,
                  size: 22 // 11pt
                })
              ],
              spacing: { after: 100 }
            })
          );

          // City, State | Start Year – End Year (normal, 10pt) - Line 3
          const location = exp.location || 'City, State';
          // Extract just the year from dates
          const startYear = exp.startDate.includes(',') ? exp.startDate.split(',')[1].trim() : exp.startDate;
          const endYear = exp.current ? 'Present' : (exp.endDate.includes(',') ? exp.endDate.split(',')[1].trim() : exp.endDate);
          paragraphs.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: `${location} | ${startYear} – ${endYear}`,
                  size: 20 // 10pt
                })
              ],
              spacing: { after: 160 } // Blank line before bullets
            })
          );

          // Bullets (11pt, max 4-5 per role) - with proper spacing
          exp.bullets.forEach((bullet, bulletIdx) => {
            paragraphs.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: `• ${bullet}`,
                    size: 22 // 11pt
                  })
                ],
                spacing: { after: bulletIdx === exp.bullets.length - 1 ? 120 : 100 },
                indent: { left: 360 }
              })
            );
          });

          // Space between experience entries
          if (idx < resume.experience.length - 1) {
            paragraphs.push(new Paragraph({ text: '', spacing: { after: 200 } }));
          } else {
            paragraphs.push(new Paragraph({ text: '', spacing: { after: 240 } }));
          }
        });
      }

      // Core Skills Section - Grouped by category (12pt header)
      if (resume.skills.length > 0) {
        paragraphs.push(
          new Paragraph({
            children: [
              new TextRun({
                text: 'CORE SKILLS',
                bold: true,
                size: 24 // 12pt
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

          // Category name (11pt, bold)
          paragraphs.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: displayName,
                  bold: true,
                  size: 22 // 11pt
                })
              ],
              spacing: { after: 100 }
            })
          );

          // Skills list (10pt, normal)
          paragraphs.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: skills.join(' • '),
                  size: 20 // 10pt
                })
              ],
              spacing: { after: isLast ? 240 : 180 }
            })
          );
        });
      }

      // Education Section (12pt header)
      if (resume.education.length > 0) {
        paragraphs.push(
          new Paragraph({
            children: [
              new TextRun({
                text: 'EDUCATION',
                bold: true,
                size: 24 // 12pt
              })
            ],
            spacing: { after: 120, before: 240 }
          })
        );

        resume.education.forEach(edu => {
          // Degree in Field (bold, 11pt)
          paragraphs.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: `${edu.degree} in ${edu.field}`,
                  bold: true,
                  size: 22 // 11pt
                })
              ],
              spacing: { after: 100 }
            })
          );

          // School | Start Date – End Date (normal, 10pt)
          paragraphs.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: `${edu.school} | ${edu.startDate} – ${edu.endDate}`,
                  size: 20 // 10pt
                })
              ],
              spacing: { after: 80 }
            })
          );

          if (edu.gpa) {
            paragraphs.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: `GPA: ${edu.gpa}`,
                    size: 20 // 10pt
                  })
                ],
                spacing: { after: 120 }
              })
            );
          } else {
            paragraphs.push(
              new Paragraph({
                text: '',
                spacing: { after: 120 }
              })
            );
          }
        });
      }

      const doc = new Document({
        sections: [{
          properties: {
            page: {
              margin: {
                top: 1440,    // 1 inch
                right: 1440,  // 1 inch
                bottom: 1440, // 1 inch
                left: 1440    // 1 inch
              }
            }
          },
          children: paragraphs
        }]
      });

      const blob = await Packer.toBlob(doc);
      saveAs(blob, 'resume.docx');
      console.log('[ResumeEditorPanel] DOCX exported successfully');
    } catch (error) {
      console.error('[ResumeEditorPanel] DOCX export error:', error);
      alert(`Failed to export DOCX: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const updateExperience = (expId: string, field: string, value: any) => {
    if (!resume) return;
    const updated = {
      ...resume,
      experience: resume.experience.map(exp =>
        exp.id === expId ? { ...exp, [field]: value } : exp
      )
    };
    setResume(updated);
  };

  const updateBullet = (expId: string, bulletIdx: number, value: string) => {
    if (!resume) return;
    const updated = {
      ...resume,
      experience: resume.experience.map(exp =>
        exp.id === expId
          ? { ...exp, bullets: exp.bullets.map((b, i) => i === bulletIdx ? value : b) }
          : exp
      )
    };
    setResume(updated);
  };

  const addBullet = (expId: string) => {
    if (!resume) return;
    const updated = {
      ...resume,
      experience: resume.experience.map(exp =>
        exp.id === expId
          ? { ...exp, bullets: [...exp.bullets, 'New achievement...'] }
          : exp
      )
    };
    setResume(updated);
  };

  const addSkill = () => {
    if (!resume || !newSkillName.trim()) return;
    const newSkill = {
      id: `skill-${Date.now()}`,
      name: newSkillName.trim(),
      category: 'technical' as 'technical' | 'soft' | 'language' | 'tool'
    };
    const updated = {
      ...resume,
      skills: [...resume.skills, newSkill]
    };
    setResume(updated);
    setNewSkillName('');
  };

  const removeSkill = (skillId: string) => {
    if (!resume) return;
    const updated = {
      ...resume,
      skills: resume.skills.filter(s => s.id !== skillId)
    };
    setResume(updated);
  };

  const handleImproveBullet = async (expId: string, bulletIdx: number, action: string) => {
    if (!resume) return;

    // Check subscription limits for AI improvements
    if (!canUseFeature('aiImprovementsUsed')) {
      setUpgradeFeatureName('AI Improvements');
      setShowUpgradeModal(true);
      return;
    }

    const exp = resume.experience.find(e => e.id === expId);
    if (!exp) return;

    const bullet = exp.bullets[bulletIdx];

    // Set loading state
    setImprovingBullet({ expId, bulletIdx, action });

    try {
      const response = await fetch('/api/resume/improve-bullet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bullet: bullet,
          action: action,
          experienceContext: `${exp.role} at ${exp.company}`,
          jobDescription: jobDescription,
          jobAnalysis: jobAnalysis
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to improve bullet');
      }

      const data = await response.json();

      // Update the bullet with improved version
      updateBullet(expId, bulletIdx, data.improvedBullet);

      // Mark this bullet as AI-modified
      setModifiedBullets(prev => new Set([...prev, `${expId}-${bulletIdx}`]));

      // Increment AI usage
      incrementUsage('aiImprovementsUsed');
    } catch (err) {
      console.error('[ResumeEditor] Error improving bullet:', err);
      alert('Failed to improve bullet. Please try again.');
    } finally {
      setImprovingBullet(null);
    }
  };

  // Drag-and-drop handlers
  const handleDragOver = (e: React.DragEvent, expId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    setDragOverExpId(expId);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverExpId(null);
  };

  const handleDrop = (e: React.DragEvent, expId: string) => {
    e.preventDefault();
    setDragOverExpId(null);

    try {
      const recommendationData = e.dataTransfer.getData('recommendation');
      if (!recommendationData || !resume) return;

      const recommendation = JSON.parse(recommendationData);

      // Insert the recommendation as a new bullet point
      const updated = {
        ...resume,
        experience: resume.experience.map(exp =>
          exp.id === expId
            ? { ...exp, bullets: [...exp.bullets, recommendation.content] }
            : exp
        )
      };
      setResume(updated);
    } catch (err) {
      console.error('Failed to parse dropped recommendation:', err);
    }
  };

  // Skills section drag-and-drop handlers
  const handleSkillsDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    setDragOverSection('skills');
  };

  const handleSkillsDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverSection(null);
  };

  const handleSkillsDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverSection(null);

    try {
      const recommendationData = e.dataTransfer.getData('recommendation');
      if (!recommendationData || !resume) return;

      const recommendation = JSON.parse(recommendationData);

      // Add the skill if it's a skill type recommendation
      if (recommendation.type === 'skill' || recommendation.type === 'keyword') {
        const newSkill = {
          id: `skill-${Date.now()}`,
          name: recommendation.content,
          category: (recommendation.type === 'skill' ? 'technical' : 'soft') as 'technical' | 'soft' | 'language' | 'tool'
        };
        const updated = {
          ...resume,
          skills: [...resume.skills, newSkill]
        };
        setResume(updated);
      }
    } catch (err) {
      console.error('Failed to parse dropped skill:', err);
    }
  };

  if (!resume) {
    return (
      <div className="p-8 flex items-center justify-center h-full">
        <p className="text-gray-400">Upload a resume to start editing</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto overflow-x-hidden">
      {/* Header - Show Resume Source */}
      <div className="mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <p className="text-xs sm:text-sm text-gray-600">
            <span className="font-semibold text-gray-900">Your Uploaded Resume</span>
            {jobAnalysis && (
              <span className="ml-2 text-xs text-gray-500 hidden sm:inline">• Analyzed against job requirements</span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
          {/* Usage Stats */}
          <div className="flex items-center gap-3 text-xs text-gray-600">
            <div className="flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              <span>
                {getRemainingUsage('aiImprovementsUsed') === Infinity
                  ? '∞'
                  : getRemainingUsage('aiImprovementsUsed')} AI
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Download className="w-3.5 h-3.5 text-indigo-600" />
              <span>
                {getRemainingUsage('exportsUsed') === Infinity
                  ? '∞'
                  : getRemainingUsage('exportsUsed')} exports
              </span>
            </div>
          </div>

          {/* Export Button */}
          <div className="relative flex-1 sm:flex-initial">
          <button
            onClick={() => setShowExportMenu(!showExportMenu)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm"
          >
            <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Export Resume</span>
            <span className="sm:hidden">Export</span>
          </button>

          {showExportMenu && (
            <div className="absolute top-12 right-0 bg-white rounded-xl shadow-2xl border border-gray-200 py-2 w-56 z-50">
              <button
                onClick={() => { exportAsPDF(); setShowExportMenu(false); }}
                className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center gap-3"
              >
                <Download className="w-4 h-4 text-red-600" />
                <div>
                  <p className="font-medium text-sm text-gray-900">Export as PDF</p>
                  <p className="text-xs text-gray-500">Print-ready format</p>
                </div>
              </button>
              <button
                onClick={() => { exportAsDOCX(); setShowExportMenu(false); }}
                className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center gap-3"
              >
                <Download className="w-4 h-4 text-blue-600" />
                <div>
                  <p className="font-medium text-sm text-gray-900">Export as DOCX</p>
                  <p className="text-xs text-gray-500">Editable Word document</p>
                </div>
              </button>
              <button
                onClick={() => { exportAsPlainText(); setShowExportMenu(false); }}
                className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center gap-3"
              >
                <Download className="w-4 h-4 text-gray-600" />
                <div>
                  <p className="font-medium text-sm text-gray-900">Export as ATS Text</p>
                  <p className="text-xs text-gray-500">Applicant tracking systems</p>
                </div>
              </button>
            </div>
          )}
          </div>
        </div>
      </div>

      {/* Overall Match Status */}
      {jobAnalysis && (
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl shadow-md p-4 sm:p-6 mb-6 border-2 border-indigo-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">Resume Analysis</h3>
            <span className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-full text-sm font-semibold">
              Needs Improvement
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <div className="bg-white rounded-lg p-3 sm:p-4 border border-gray-200">
              <p className="text-xs text-gray-600 mb-1">Keyword Match</p>
              <p className="text-xl sm:text-2xl font-bold text-orange-600">45%</p>
            </div>
            <div className="bg-white rounded-lg p-3 sm:p-4 border border-gray-200">
              <p className="text-xs text-gray-600 mb-1">Strong Bullets</p>
              <p className="text-xl sm:text-2xl font-bold text-green-600">3/8</p>
            </div>
            <div className="bg-white rounded-lg p-3 sm:p-4 border border-gray-200">
              <p className="text-xs text-gray-600 mb-1">Skills Match</p>
              <p className="text-xl sm:text-2xl font-bold text-indigo-600">60%</p>
            </div>
          </div>
          <p className="mt-4 text-xs sm:text-sm text-gray-700 break-words">
            <AlertTriangle className="w-4 h-4 inline text-orange-600 mr-1 flex-shrink-0" />
            <strong>Action needed:</strong> Add metrics to 5 bullets, include 8 missing keywords, emphasize 3 required skills
          </p>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:p-8 mb-6 overflow-x-hidden">
        {/* Contact Info Section */}
        <div className="mb-8 pb-6 border-b-2 border-gray-200">
          <div className="flex items-center justify-between mb-4 gap-2">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 break-words flex-1 min-w-0">{resume.name || 'Your Name'}</h2>
            <button
              onClick={() => {
                const newName = prompt('Enter your name:', resume.name || '');
                if (newName !== null) {
                  setResume({ ...resume, name: newName });
                }
              }}
              className="text-indigo-600 hover:text-indigo-700"
            >
              <Edit3 className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-gray-600 font-medium text-xs sm:text-sm w-16 sm:w-20 flex-shrink-0">Email:</span>
              <input
                type="email"
                value={resume.email || ''}
                onChange={(e) => setResume({ ...resume, email: e.target.value })}
                placeholder="your.email@example.com"
                className="flex-1 min-w-0 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-xs sm:text-sm"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-gray-600 font-medium text-xs sm:text-sm w-16 sm:w-20 flex-shrink-0">Phone:</span>
              <input
                type="tel"
                value={resume.phone || ''}
                onChange={(e) => setResume({ ...resume, phone: e.target.value })}
                placeholder="(123) 456-7890"
                className="flex-1 min-w-0 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-xs sm:text-sm"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-gray-600 font-medium text-xs sm:text-sm w-16 sm:w-20 flex-shrink-0">LinkedIn:</span>
              <input
                type="url"
                value={resume.linkedin || ''}
                onChange={(e) => setResume({ ...resume, linkedin: e.target.value })}
                placeholder="linkedin.com/in/yourprofile"
                className="flex-1 min-w-0 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-xs sm:text-sm"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-gray-600 font-medium text-xs sm:text-sm w-16 sm:w-20 flex-shrink-0">Location:</span>
              <input
                type="text"
                value={resume.location || ''}
                onChange={(e) => setResume({ ...resume, location: e.target.value })}
                placeholder="City, State"
                className="flex-1 min-w-0 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-xs sm:text-sm"
              />
            </div>
          </div>
        </div>

        {/* Summary Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-gray-900">Professional Summary</h2>
            <button className="text-indigo-600 hover:text-indigo-700">
              <Edit3 className="w-4 h-4" />
            </button>
          </div>
          <div className={`p-3 sm:p-4 rounded-lg border-2 ${
            modifiedBullets.has('summary')
              ? 'bg-gradient-to-r from-yellow-100 to-amber-50 border-yellow-500'
              : 'bg-gray-50 border-yellow-300'
          }`}>
            <p className="text-sm text-gray-700 leading-relaxed break-words">
              {resume.summary || 'No summary provided'}
              {modifiedBullets.has('summary') && (
                <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-200 text-yellow-900 rounded-full text-xs font-semibold border border-yellow-400">
                  <Sparkles className="w-3 h-3" />
                  AI Improved
                </span>
              )}
            </p>
          </div>
          {jobAnalysis && resume.summary && (
            <div className="mt-2 flex items-start gap-2 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold text-yellow-800">Summary needs improvement</p>
                <p className="text-xs text-yellow-700 mt-1">
                  Consider adding these key terms: {jobAnalysis.atsKeywords.slice(0, 3).join(', ')}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Experience Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-gray-900">Experience</h2>
          </div>

          {/* Bullet Quality Legend */}
          {jobAnalysis && (
            <div className="mb-4 p-3 bg-indigo-50 rounded-lg border border-indigo-200">
              <p className="text-xs font-semibold text-gray-800 mb-2">Bullet Analysis:</p>
              <div className="flex flex-wrap gap-2 sm:gap-3 text-xs">
                <span className="flex items-center gap-1 whitespace-nowrap">
                  <div className="w-3 h-3 bg-green-400 rounded flex-shrink-0"></div>
                  <span className="text-gray-700">Strong</span>
                  <span className="text-gray-500 hidden sm:inline">(metrics + action + keywords)</span>
                </span>
                <span className="flex items-center gap-1 whitespace-nowrap">
                  <div className="w-3 h-3 bg-yellow-400 rounded flex-shrink-0"></div>
                  <span className="text-gray-700">Medium</span>
                  <span className="text-gray-500 hidden sm:inline">(partial match)</span>
                </span>
                <span className="flex items-center gap-1 whitespace-nowrap">
                  <div className="w-3 h-3 bg-red-400 rounded flex-shrink-0"></div>
                  <span className="text-gray-700">Weak</span>
                  <span className="text-gray-500 hidden sm:inline">(needs improvement)</span>
                </span>
              </div>
            </div>
          )}

          <div className="space-y-6">
            {resume.experience.map((exp) => {
              const isEditing = editingExpId === exp.id;
              const isDragOver = dragOverExpId === exp.id;
              return (
                <div
                  key={exp.id}
                  className={`p-4 bg-gray-50 rounded-lg border-2 transition-all ${
                    isDragOver
                      ? 'border-indigo-500 bg-indigo-50 shadow-lg scale-[1.02]'
                      : 'border-gray-200 hover:border-indigo-300'
                  }`}
                  onDragOver={(e) => handleDragOver(e, exp.id)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, exp.id)}
                >
                  <div className="flex flex-col sm:flex-row items-start justify-between mb-3 gap-2">
                    <div className="flex-1 min-w-0 w-full">
                      {isEditing ? (
                        <div className="space-y-2">
                          <input
                            type="text"
                            value={exp.role}
                            onChange={(e) => updateExperience(exp.id, 'role', e.target.value)}
                            className="w-full px-3 py-2 border border-indigo-300 rounded-lg focus:ring-2 focus:ring-indigo-500 font-semibold"
                            placeholder="Role Title"
                          />
                          <input
                            type="text"
                            value={exp.company}
                            onChange={(e) => updateExperience(exp.id, 'company', e.target.value)}
                            className="w-full px-3 py-2 border border-indigo-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
                            placeholder="Company Name"
                          />
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={exp.startDate}
                              onChange={(e) => updateExperience(exp.id, 'startDate', e.target.value)}
                              className="flex-1 px-3 py-2 border border-indigo-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
                              placeholder="MM/YYYY"
                            />
                            <span className="text-gray-500">-</span>
                            {exp.current ? (
                              <div className="flex-1 flex items-center gap-2">
                                <span className="px-3 py-2 bg-green-50 text-green-700 rounded-lg text-sm font-medium border border-green-200">Present</span>
                                <button
                                  onClick={() => {
                                    updateExperience(exp.id, 'current', false);
                                    updateExperience(exp.id, 'endDate', 'MM/YYYY');
                                  }}
                                  className="text-xs text-gray-600 hover:text-gray-800"
                                >
                                  Change
                                </button>
                              </div>
                            ) : (
                              <div className="flex-1 flex items-center gap-2">
                                <input
                                  type="text"
                                  value={exp.endDate}
                                  onChange={(e) => updateExperience(exp.id, 'endDate', e.target.value)}
                                  className="flex-1 px-3 py-2 border border-indigo-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
                                  placeholder="MM/YYYY"
                                />
                                <button
                                  onClick={() => updateExperience(exp.id, 'current', true)}
                                  className="text-xs text-indigo-600 hover:text-indigo-800 whitespace-nowrap"
                                >
                                  Set Present
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <>
                          <h3 className="font-semibold text-gray-900 text-base sm:text-lg break-words">{exp.role}</h3>
                          <p className="text-sm text-gray-600 break-words">{exp.company}</p>
                        </>
                      )}
                    </div>
                    <div className="sm:ml-4 flex items-center gap-2 flex-shrink-0">
                      {isEditing ? (
                        <>
                          <button
                            onClick={() => setEditingExpId(null)}
                            className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                          >
                            <Save className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setEditingExpId(null)}
                            className="p-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => setEditingExpId(exp.id)}
                          className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                      )}
                      {!isEditing && (
                        <div className="text-right">
                          <p className="text-sm text-gray-600">
                            {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Drop Zone Indicator */}
                  {isDragOver && (
                    <div className="mt-3 p-4 bg-indigo-100 border-2 border-dashed border-indigo-400 rounded-lg flex items-center justify-center gap-2">
                      <Plus className="w-5 h-5 text-indigo-600" />
                      <span className="text-sm font-semibold text-indigo-700">Drop here to add recommendation</span>
                    </div>
                  )}

                <ul className="space-y-3 mt-3">
                  {exp.bullets.map((bullet, idx) => {
                    const isEditingThis = editingBullet?.expId === exp.id && editingBullet?.bulletIdx === idx;
                    const bulletAnalysis = analyzeBullet(bullet);
                    const isAIOptimized = modifiedBullets.has(`${exp.id}-${idx}`);
                    return (
                      <li key={idx} className="group">
                        <div className={`text-sm text-gray-700 flex items-start gap-2 p-3 rounded-lg transition-all ${
                          isAIOptimized ? 'bg-gradient-to-r from-yellow-100 to-amber-50 border-l-4 border-yellow-500 shadow-md' :
                          bulletAnalysis.quality === 'weak' ? 'bg-red-50 border-l-4 border-red-400' :
                          bulletAnalysis.quality === 'medium' ? 'bg-yellow-50 border-l-4 border-yellow-400' :
                          'bg-green-50 border-l-4 border-green-400'
                        } hover:shadow-md`}>
                          <span className="text-indigo-600 mt-1 flex-shrink-0">•</span>
                          <div className="flex-1 min-w-0">
                            {isEditingThis ? (
                              <div className="flex flex-col sm:flex-row items-start gap-2">
                                <textarea
                                  value={bullet}
                                  onChange={(e) => updateBullet(exp.id, idx, e.target.value)}
                                  className="w-full flex-1 px-3 py-2 border border-indigo-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm resize-none"
                                  rows={3}
                                  autoFocus
                                />
                                <div className="flex gap-1">
                                  <button
                                    onClick={() => setEditingBullet(null)}
                                    className="p-1.5 bg-green-600 text-white rounded hover:bg-green-700"
                                  >
                                    <Save className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => setEditingBullet(null)}
                                    className="p-1.5 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <div
                                  onClick={() => setEditingBullet({ expId: exp.id, bulletIdx: idx })}
                                  className="cursor-text break-words"
                                >
                                  <span className="break-words">{highlightMetrics(bullet)}</span>
                                  {isAIOptimized && (
                                    <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-200 text-yellow-900 rounded-full text-xs font-semibold border border-yellow-400">
                                      <Sparkles className="w-3 h-3" />
                                      AI Improved
                                    </span>
                                  )}
                                </div>

                                {/* Quality Indicators */}
                                <div className="flex items-center gap-2 mt-2 flex-wrap">
                                  {!bulletAnalysis.hasMetrics && (
                                    <span className="flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs">
                                      <AlertTriangle className="w-3 h-3" />
                                      No metrics
                                    </span>
                                  )}
                                  {!bulletAnalysis.hasActionVerb && (
                                    <span className="flex items-center gap-1 px-2 py-0.5 bg-orange-100 text-orange-700 rounded text-xs">
                                      <AlertTriangle className="w-3 h-3" />
                                      Weak action verb
                                    </span>
                                  )}
                                  {bulletAnalysis.keywordMatches === 0 && jobAnalysis && (
                                    <span className="flex items-center gap-1 px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded text-xs">
                                      <AlertCircle className="w-3 h-3" />
                                      Missing JD keywords
                                    </span>
                                  )}
                                  {bulletAnalysis.keywordMatches > 0 && (
                                    <span className="flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs">
                                      <CheckCircle2 className="w-3 h-3" />
                                      {bulletAnalysis.keywordMatches} JD keyword{bulletAnalysis.keywordMatches > 1 ? 's' : ''}
                                    </span>
                                  )}
                                  {bulletAnalysis.isTooShort && (
                                    <span className="flex items-center gap-1 px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs">
                                      <AlertCircle className="w-3 h-3" />
                                      Too brief
                                    </span>
                                  )}
                                </div>

                                <div className="flex items-center gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button
                                    onClick={() => handleImproveBullet(exp.id, idx, 'improve')}
                                    disabled={improvingBullet?.expId === exp.id && improvingBullet?.bulletIdx === idx}
                                    className="flex items-center gap-1 px-2 py-1 bg-purple-600 text-white rounded text-xs hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    <Sparkles className="w-3 h-3" />
                                    {improvingBullet?.expId === exp.id && improvingBullet?.bulletIdx === idx && improvingBullet?.action === 'improve' ? 'Improving...' : 'Improve'}
                                  </button>
                                  <button
                                    onClick={() => handleImproveBullet(exp.id, idx, 'add-metrics')}
                                    disabled={improvingBullet?.expId === exp.id && improvingBullet?.bulletIdx === idx}
                                    className="flex items-center gap-1 px-2 py-1 bg-white border border-gray-300 text-gray-700 rounded text-xs hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    <BarChart3 className="w-3 h-3" />
                                    {improvingBullet?.expId === exp.id && improvingBullet?.bulletIdx === idx && improvingBullet?.action === 'add-metrics' ? 'Adding...' : 'Add Metrics'}
                                  </button>
                                  <button
                                    onClick={() => handleImproveBullet(exp.id, idx, 'rewrite')}
                                    disabled={improvingBullet?.expId === exp.id && improvingBullet?.bulletIdx === idx}
                                    className="flex items-center gap-1 px-2 py-1 bg-white border border-gray-300 text-gray-700 rounded text-xs hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    <TrendingUp className="w-3 h-3" />
                                    {improvingBullet?.expId === exp.id && improvingBullet?.bulletIdx === idx && improvingBullet?.action === 'rewrite' ? 'Rewriting...' : 'Rewrite'}
                                  </button>
                                  <button
                                    onClick={() => setEditingBullet({ expId: exp.id, bulletIdx: idx })}
                                    className="flex items-center gap-1 px-2 py-1 bg-white border border-gray-300 text-gray-700 rounded text-xs hover:bg-gray-50 transition-colors"
                                  >
                                    <Edit3 className="w-3 h-3" />
                                    Edit
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
                <button
                  onClick={() => addBullet(exp.id)}
                  className="mt-3 flex items-center gap-2 px-3 py-2 text-sm text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add bullet point
                </button>
              </div>
              );
            })}
          </div>
        </div>

        {/* Skills Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-gray-900">Skills</h2>
            <div className="flex items-center gap-2">
              {modifiedBullets.has('skills') && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-200 text-yellow-900 rounded-full text-xs font-semibold border border-yellow-400">
                  <Sparkles className="w-3 h-3" />
                  AI Enhanced
                </span>
              )}
              <button
                onClick={() => setEditingSkills(!editingSkills)}
                className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
              >
                <Edit3 className="w-3 h-3" />
                {editingSkills ? 'Done' : 'Edit'}
              </button>
            </div>
          </div>
          <div
            className={`flex flex-wrap gap-2 p-4 rounded-lg border-2 transition-all ${
              dragOverSection === 'skills'
                ? 'border-indigo-500 bg-indigo-50'
                : 'border-transparent'
            }`}
            onDragOver={handleSkillsDragOver}
            onDragLeave={handleSkillsDragLeave}
            onDrop={handleSkillsDrop}
          >
            {dragOverSection === 'skills' && (
              <div className="w-full p-4 bg-indigo-100 border-2 border-dashed border-indigo-400 rounded-lg flex items-center justify-center gap-2">
                <Plus className="w-5 h-5 text-indigo-600" />
                <span className="text-sm font-semibold text-indigo-700">Drop skill or keyword here</span>
              </div>
            )}
            {resume.skills.map((skill) => {
              // Check if skill matches JD requirements
              const matchesJD = jobAnalysis?.technicalSkills.some(jdSkill =>
                jdSkill.toLowerCase().includes(skill.name.toLowerCase()) ||
                skill.name.toLowerCase().includes(jdSkill.toLowerCase())
              ) || false;

              return (
                <span
                  key={skill.id}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-1.5 group ${
                    matchesJD
                      ? 'bg-green-50 text-green-700 border-2 border-green-300'
                      : 'bg-gray-50 text-gray-600 border border-gray-200'
                  }`}
                >
                  {matchesJD ? (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  ) : (
                    <AlertCircle className="w-3.5 h-3.5" />
                  )}
                  {skill.name}
                  {editingSkills && (
                    <button
                      onClick={() => removeSkill(skill.id)}
                      className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3.5 h-3.5 text-red-600 hover:text-red-700" />
                    </button>
                  )}
                </span>
              );
            })}

            {/* Add Skill Input */}
            {editingSkills && (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newSkillName}
                  onChange={(e) => setNewSkillName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      addSkill();
                    }
                  }}
                  placeholder="Add new skill..."
                  className="px-3 py-1.5 border-2 border-indigo-300 rounded-full text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                <button
                  onClick={addSkill}
                  disabled={!newSkillName.trim()}
                  className="p-1.5 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-3">
            <CheckCircle2 className="w-3 h-3 inline text-green-600" /> Matches job requirements  ·
            <AlertCircle className="w-3 h-3 inline text-gray-600 ml-2" /> Not mentioned in JD
          </p>

          {/* Missing Skills Alert */}
          {jobAnalysis && (
            <div className="mt-3 p-3 bg-red-50 rounded-lg border border-red-200">
              <p className="text-xs font-semibold text-red-800 mb-2 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                Missing Required Skills from JD:
              </p>
              <div className="flex flex-wrap gap-2">
                {jobAnalysis.technicalSkills.slice(0, 5).filter(jdSkill =>
                  !resume.skills.some(skill =>
                    skill.name.toLowerCase().includes(jdSkill.toLowerCase()) ||
                    jdSkill.toLowerCase().includes(skill.name.toLowerCase())
                  )
                ).map((missingSkill, idx) => (
                  <span key={idx} className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-medium">
                    {missingSkill}
                  </span>
                ))}
              </div>
              <p className="text-xs text-red-700 mt-2">
                💡 Drag skills from the left panel or add them manually
              </p>
            </div>
          )}
        </div>

        {/* Education Section */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-gray-900">Education</h2>
          </div>
          <div className="space-y-4">
            {resume.education.map((edu) => (
              <div key={edu.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="font-semibold text-gray-900">{edu.degree} in {edu.field}</h3>
                <p className="text-sm text-gray-600">{edu.school}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {edu.startDate} - {edu.endDate}
                  {edu.gpa && ` · GPA: ${edu.gpa}`}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        featureName={upgradeFeatureName}
      />
    </div>
  );
}
