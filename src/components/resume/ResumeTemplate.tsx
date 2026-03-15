import { forwardRef } from 'react';
import type { ResumeTemplateData, TemplateConfig } from '../../types/resumeTemplate';
import { DEFAULT_TEMPLATE_CONFIG } from '../../types/resumeTemplate';
import './ResumeTemplate.css';

interface ResumeTemplateProps {
  data: ResumeTemplateData;
  config?: Partial<TemplateConfig>;
  className?: string;
}

export const ResumeTemplate = forwardRef<HTMLDivElement, ResumeTemplateProps>(
  ({ data, config, className }, ref) => {
    const finalConfig = { ...DEFAULT_TEMPLATE_CONFIG, ...config };

    return (
      <div
        ref={ref}
        className={`resume-template ${className || ''}`}
        style={{
          fontFamily: finalConfig.font === 'Inter' ? "'Inter', sans-serif" : finalConfig.font,
          fontSize: `${finalConfig.fontSize}pt`,
          lineHeight: finalConfig.lineSpacing,
          padding: `${finalConfig.margins.top}in ${finalConfig.margins.right}in ${finalConfig.margins.bottom}in ${finalConfig.margins.left}in`,
        }}
      >
        {/* Header Section */}
        <header className="resume-header">
          <h1 className="resume-name">{data.name}</h1>
          <div className="resume-contact">
            {data.email && <span className="contact-item">{data.email}</span>}
            {data.phone && <span className="contact-separator">•</span>}
            {data.phone && <span className="contact-item">{data.phone}</span>}
            {data.location && <span className="contact-separator">•</span>}
            {data.location && <span className="contact-item">{data.location}</span>}
            {data.linkedin && <span className="contact-separator">•</span>}
            {data.linkedin && <span className="contact-item">{data.linkedin}</span>}
            {data.website && <span className="contact-separator">•</span>}
            {data.website && <span className="contact-item">{data.website}</span>}
          </div>
        </header>

        {/* Target Role (Optional Highlight) */}
        {data.targetRole && (
          <section className="resume-section target-role">
            <div className="target-role-content">{data.targetRole}</div>
          </section>
        )}

        {/* Professional Summary */}
        {data.summary && (
          <section className="resume-section">
            <h2 className="section-heading">PROFESSIONAL SUMMARY</h2>
            <p className="summary-content">{data.summary}</p>
          </section>
        )}

        {/* Experience */}
        {data.experience && data.experience.length > 0 && (
          <section className="resume-section">
            <h2 className="section-heading">EXPERIENCE</h2>
            <div className="experience-list">
              {data.experience.map((exp, idx) => (
                <div key={idx} className="experience-entry">
                  <div className="experience-header">
                    <div className="experience-title">
                      <span className="company-name">{exp.company}</span>
                      <span className="title-separator"> | </span>
                      <span className="role-name">{exp.role}</span>
                    </div>
                    <div className="experience-meta">
                      {exp.location && (
                        <>
                          <span className="location">{exp.location}</span>
                          <span className="meta-separator"> | </span>
                        </>
                      )}
                      <span className="dates">
                        {exp.startDate} – {exp.endDate}
                      </span>
                    </div>
                  </div>
                  <ul className="bullet-list">
                    {exp.bullets.map((bullet, bulletIdx) => (
                      <li key={bulletIdx} className="bullet-item">
                        {bullet}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Skills */}
        {data.skills && Object.keys(data.skills).length > 0 && (
          <section className="resume-section">
            <h2 className="section-heading">SKILLS</h2>
            <div className="skills-content">
              {Object.entries(data.skills).map(([category, skillsList]) => {
                if (!skillsList || skillsList.length === 0) return null;
                const categoryLabel = formatSkillCategory(category);
                return (
                  <div key={category} className="skill-category">
                    <span className="skill-label">{categoryLabel}:</span>{' '}
                    <span className="skill-items">{skillsList.join(', ')}</span>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Education */}
        {data.education && data.education.length > 0 && (
          <section className="resume-section">
            <h2 className="section-heading">EDUCATION</h2>
            <div className="education-list">
              {data.education.map((edu, idx) => (
                <div key={idx} className="education-entry">
                  <div className="education-header">
                    <div className="education-title">
                      <span className="institution-name">{edu.institution}</span>
                      {edu.location && (
                        <>
                          <span className="title-separator"> | </span>
                          <span className="location">{edu.location}</span>
                        </>
                      )}
                    </div>
                    <div className="education-date">{edu.graduationDate}</div>
                  </div>
                  <div className="education-details">
                    <span className="degree">{edu.degree}</span>
                    {edu.field && <span className="field"> in {edu.field}</span>}
                    {edu.gpa && <span className="gpa"> • GPA: {edu.gpa}</span>}
                  </div>
                  {edu.honors && edu.honors.length > 0 && (
                    <div className="education-honors">
                      {edu.honors.join(' • ')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Projects (Optional) */}
        {data.projects && data.projects.length > 0 && (
          <section className="resume-section">
            <h2 className="section-heading">PROJECTS</h2>
            <div className="projects-list">
              {data.projects.map((project, idx) => (
                <div key={idx} className="project-entry">
                  <div className="project-header">
                    <span className="project-name">{project.name}</span>
                    {project.date && <span className="project-date"> | {project.date}</span>}
                  </div>
                  <p className="project-description">{project.description}</p>
                  {project.technologies && project.technologies.length > 0 && (
                    <div className="project-tech">
                      <span className="tech-label">Technologies:</span>{' '}
                      {project.technologies.join(', ')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Certifications (Optional) */}
        {data.certifications && data.certifications.length > 0 && (
          <section className="resume-section">
            <h2 className="section-heading">CERTIFICATIONS</h2>
            <div className="certifications-list">
              {data.certifications.map((cert, idx) => (
                <div key={idx} className="certification-entry">
                  <span className="cert-name">{cert.name}</span>
                  <span className="cert-separator"> | </span>
                  <span className="cert-issuer">{cert.issuer}</span>
                  <span className="cert-separator"> | </span>
                  <span className="cert-date">{cert.date}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Publications (Optional) */}
        {data.publications && data.publications.length > 0 && (
          <section className="resume-section">
            <h2 className="section-heading">PUBLICATIONS</h2>
            <div className="publications-list">
              {data.publications.map((pub, idx) => (
                <div key={idx} className="publication-entry">
                  <div className="pub-title">{pub.title}</div>
                  <div className="pub-meta">
                    {pub.publisher} | {pub.date}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    );
  }
);

ResumeTemplate.displayName = 'ResumeTemplate';

// Helper function to format skill category names
function formatSkillCategory(category: string): string {
  const categoryMap: Record<string, string> = {
    technical: 'Technical',
    leadership: 'Leadership & Management',
    tools: 'Tools & Platforms',
    languages: 'Programming Languages',
    certifications: 'Certifications',
  };

  return categoryMap[category.toLowerCase()] || capitalizeWords(category);
}

function capitalizeWords(str: string): string {
  return str
    .split(/[\s_-]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}
