import type { ResumeTemplate } from '../types/template';
import type { StructuredResume } from '../types/resume';

interface Props {
  resume: StructuredResume;
  template: ResumeTemplate;
  scale?: number;
  className?: string;
}

export function ResumeRenderer({ resume, template, scale = 1, className = '' }: Props) {
  const { style, sections } = template;
  const sortedSections = [...sections].sort((a, b) => a.order - b.order).filter(s => s.enabled);

  return (
    <div
      className={`bg-white ${className}`}
      style={{
        width: '816px', // 8.5 inches at 96 DPI
        minHeight: '1056px', // 11 inches at 96 DPI
        transform: `scale(${scale})`,
        transformOrigin: 'top left',
        padding: '54px', // 0.75 inches
        fontFamily: style.fontFamily,
        display: 'block',
        overflow: 'visible',
        boxSizing: 'border-box',
      }}
    >
      {/* Header */}
      <div
        style={{
          marginBottom: '20px',
          textAlign: style.headerAlignment as any,
        }}
      >
        {style.headerStyle === 'banner' ? (
          <div
            style={{
              padding: '20px 16px',
              background: `${style.accentColor}15`,
              borderLeft: `4px solid ${style.accentColor}`,
              marginBottom: '16px'
            }}
          >
            <h1
              style={{
                fontSize: `${style.fontSize.name}px`,
                fontWeight: 'bold',
                margin: '0 0 4px',
                color: style.primaryColor,
              }}
            >
              {resume.name || ''}
            </h1>
            <div style={{ fontSize: '11px', color: style.secondaryColor }}>
              {[resume.email, resume.phone, resume.location, resume.linkedin]
                .filter(Boolean)
                .join(' • ')}
            </div>
          </div>
        ) : (
          <>
            <h1
              style={{
                fontSize: `${style.fontSize.name}px`,
                fontWeight: 'bold',
                margin: '0 0 6px',
                color: style.primaryColor,
              }}
            >
              {resume.name || ''}
            </h1>
            <div style={{ fontSize: '11px', color: style.secondaryColor }}>
              {[resume.email, resume.phone, resume.location, resume.linkedin]
                .filter(Boolean)
                .join(' • ')}
            </div>
          </>
        )}
      </div>

      {/* Sections */}
      {sortedSections.map((section) => {
        let content = null;

        switch (section.key) {
          case 'summary':
            if (resume.summary) {
              content = (
                <p
                  style={{
                    fontSize: `${style.fontSize.body}px`,
                    color: style.textColor,
                    lineHeight: '1.6',
                    margin: '0'
                  }}
                >
                  {resume.summary}
                </p>
              );
            }
            break;

          case 'experience':
            if (resume.experience && resume.experience.length > 0) {
              content = resume.experience.map((exp, idx) => (
                <div
                  key={idx}
                  className="experience-entry avoid-page-break"
                  style={{
                    marginBottom: '14px',
                    breakInside: 'avoid',
                    pageBreakInside: 'avoid',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '4px' }}>
                    <div>
                      <h3
                        style={{
                          fontSize: `${style.fontSize.body}px`,
                          fontWeight: '600',
                          margin: '0',
                          color: style.primaryColor
                        }}
                      >
                        {exp.role || (exp as any).title}
                      </h3>
                      <div
                        style={{
                          fontSize: `${style.fontSize.body}px`,
                          fontWeight: '500',
                          color: style.accentColor,
                          marginTop: '2px'
                        }}
                      >
                        {exp.company}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', fontSize: `${style.fontSize.small}px`, color: style.secondaryColor }}>
                      <div>{exp.startDate} - {exp.current ? 'Present' : exp.endDate}</div>
                      {exp.location && <div>{exp.location}</div>}
                    </div>
                  </div>
                  {exp.bullets && exp.bullets.length > 0 && (
                    <ul style={{ margin: '6px 0 0 18px', padding: '0', listStyleType: 'none' }}>
                      {exp.bullets.map((bullet, bidx) => (
                        <li
                          key={bidx}
                          style={{
                            fontSize: `${style.fontSize.body}px`,
                            color: style.textColor,
                            lineHeight: '1.5',
                            marginBottom: '3px',
                            paddingLeft: '10px',
                            position: 'relative'
                          }}
                        >
                          <span
                            style={{
                              position: 'absolute',
                              left: '0',
                              color: style.accentColor
                            }}
                          >
                            {style.bulletStyle === 'disc' ? '•' :
                             style.bulletStyle === 'square' ? '▪' :
                             style.bulletStyle === 'arrow' ? '→' :
                             style.bulletStyle === 'dash' ? '–' : '•'}
                          </span>
                          {bullet}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ));
            }
            break;

          case 'education':
            if (resume.education && resume.education.length > 0) {
              content = resume.education.map((edu, idx) => (
                <div
                  key={idx}
                  className="education-entry avoid-page-break"
                  style={{
                    marginBottom: '12px',
                    breakInside: 'avoid',
                    pageBreakInside: 'avoid',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div>
                      <h3
                        style={{
                          fontSize: `${style.fontSize.body}px`,
                          fontWeight: '600',
                          margin: '0',
                          color: style.primaryColor
                        }}
                      >
                        {edu.school}
                      </h3>
                      <div style={{ fontSize: `${style.fontSize.body}px`, color: style.textColor, marginTop: '2px' }}>
                        {edu.degree} in {edu.field}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', fontSize: `${style.fontSize.small}px`, color: style.secondaryColor }}>
                      <div>{edu.startDate} - {edu.endDate}</div>
                      {edu.gpa && <div>GPA: {edu.gpa}</div>}
                    </div>
                  </div>
                </div>
              ));
            }
            break;

          case 'skills':
            if (resume.skills && resume.skills.length > 0) {
              const skillsByCategory = resume.skills.reduce((acc: any, skill: any) => {
                const category = skill.category || 'Other';
                if (!acc[category]) {
                  acc[category] = [];
                }
                acc[category].push(skill.name);
                return acc;
              }, {});

              content = Object.entries(skillsByCategory).map(([category, skills]: [string, any]) => (
                <div key={category} style={{ marginBottom: '8px' }}>
                  <span style={{ fontSize: `${style.fontSize.body}px`, fontWeight: '600', color: style.primaryColor, textTransform: 'capitalize' }}>
                    {category}:
                  </span>
                  <span style={{ fontSize: `${style.fontSize.body}px`, color: style.textColor, marginLeft: '6px' }}>
                    {skills.join(', ')}
                  </span>
                </div>
              ));
            }
            break;

          case 'projects':
            if (resume.projects && resume.projects.length > 0) {
              content = resume.projects.map((project, idx) => (
                <div
                  key={idx}
                  className="project-entry avoid-page-break"
                  style={{
                    marginBottom: '12px',
                    breakInside: 'avoid',
                    pageBreakInside: 'avoid',
                  }}
                >
                  <h3 style={{ fontSize: `${style.fontSize.body}px`, fontWeight: '600', margin: '0', color: style.primaryColor }}>
                    {project.name}
                    {project.url && (
                      <span style={{ fontSize: `${style.fontSize.small}px`, color: style.accentColor, marginLeft: '8px' }}>
                        ({project.url})
                      </span>
                    )}
                  </h3>
                  {project.description && (
                    <p style={{ fontSize: `${style.fontSize.body}px`, color: style.textColor, lineHeight: '1.5', margin: '4px 0' }}>
                      {project.description}
                    </p>
                  )}
                  {project.technologies && project.technologies.length > 0 && (
                    <div style={{ fontSize: `${style.fontSize.small}px`, color: style.secondaryColor, marginTop: '4px' }}>
                      Technologies: {project.technologies.join(', ')}
                    </div>
                  )}
                </div>
              ));
            }
            break;

          case 'certifications':
            if ((resume as any).certifications && (resume as any).certifications.length > 0) {
              content = (resume as any).certifications.map((cert: any, idx: number) => (
                <div
                  key={idx}
                  className="avoid-page-break"
                  style={{
                    marginBottom: '8px',
                    breakInside: 'avoid',
                    pageBreakInside: 'avoid',
                  }}
                >
                  <span style={{ fontSize: `${style.fontSize.body}px`, fontWeight: '600', color: style.primaryColor }}>
                    {cert.name}
                  </span>
                  {cert.issuer && (
                    <span style={{ fontSize: `${style.fontSize.body}px`, color: style.textColor, marginLeft: '6px' }}>
                      - {cert.issuer}
                    </span>
                  )}
                  {cert.date && (
                    <span style={{ fontSize: `${style.fontSize.small}px`, color: style.secondaryColor, marginLeft: '6px' }}>
                      ({cert.date})
                    </span>
                  )}
                </div>
              ));
            }
            break;
        }

        if (!content) return null;

        return (
          <div
            key={section.id}
            style={{
              marginBottom: '20px',
              breakInside: 'avoid',
              pageBreakInside: 'avoid',
            }}
          >
            <h2
              style={{
                fontSize: `${style.fontSize.sectionTitle}px`,
                fontWeight: 'bold',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '10px',
                color: style.primaryColor,
                borderBottom: 'none',
                paddingBottom: '0',
                background: style.sectionTitleStyle.includes('background') ? `${style.accentColor}15` : 'transparent',
                padding: style.sectionTitleStyle.includes('background') ? '6px 12px' : '0',
                marginLeft: style.sectionTitleStyle.includes('background') ? '-12px' : '0',
                marginRight: style.sectionTitleStyle.includes('background') ? '-12px' : '0',
                breakAfter: 'avoid',
                pageBreakAfter: 'avoid',
              }}
            >
              {section.title}
            </h2>
            {content}
          </div>
        );
      })}
    </div>
  );
}
