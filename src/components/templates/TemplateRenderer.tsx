import type { ResumeTemplate } from '../../types/template';
import type { StructuredResume } from '../../types/resume';

interface TemplateRendererProps {
  template: ResumeTemplate;
  resume: StructuredResume;
  scale?: number;
}

export function TemplateRenderer({ template, resume, scale = 1 }: TemplateRendererProps) {
  const { style, sections } = template;

  // Sort sections by order
  const sortedSections = [...sections].sort((a, b) => a.order - b.order);

  // Render header
  const renderHeader = () => {
    return (
      <div
        className={`mb-6 ${
          style.headerAlignment === 'center'
            ? 'text-center'
            : style.headerAlignment === 'right'
            ? 'text-right'
            : 'text-left'
        }`}
        style={{
          fontFamily: style.fontFamily,
          color: style.primaryColor,
        }}
      >
        {style.headerStyle === 'banner' && (
          <div
            className="py-6 px-4 mb-4 -mx-8"
            style={{
              backgroundColor: `${style.accentColor}10`,
              borderLeft: `4px solid ${style.accentColor}`,
            }}
          >
            <h1
              className="font-bold mb-1"
              style={{
                fontSize: `${style.fontSize.name}px`,
                color: style.primaryColor,
              }}
            >
              {resume.name}
            </h1>
            <div
              className="flex flex-wrap items-center justify-center gap-3 text-sm"
              style={{ color: style.secondaryColor }}
            >
              {resume.email && <span>{resume.email}</span>}
              {resume.phone && <span>• {resume.phone}</span>}
              {resume.location && <span>• {resume.location}</span>}
              {resume.linkedin && <span>• {resume.linkedin}</span>}
            </div>
          </div>
        )}

        {style.headerStyle === 'simple' && (
          <>
            <h1
              className="font-bold mb-2"
              style={{
                fontSize: `${style.fontSize.name}px`,
                color: style.primaryColor,
              }}
            >
              {resume.name}
            </h1>
            <div
              className="flex flex-wrap items-center gap-3 text-sm"
              style={{
                color: style.secondaryColor,
                justifyContent:
                  style.headerAlignment === 'center'
                    ? 'center'
                    : style.headerAlignment === 'right'
                    ? 'flex-end'
                    : 'flex-start',
              }}
            >
              {resume.email && <span>{resume.email}</span>}
              {resume.phone && <span>• {resume.phone}</span>}
              {resume.location && <span>• {resume.location}</span>}
              {resume.linkedin && <span>• {resume.linkedin}</span>}
            </div>
          </>
        )}

        {style.headerStyle === 'split' && (
          <div className="flex items-start justify-between">
            <div className="text-left">
              <h1
                className="font-bold mb-1"
                style={{
                  fontSize: `${style.fontSize.name}px`,
                  color: style.primaryColor,
                }}
              >
                {resume.name}
              </h1>
              {resume.email && (
                <div style={{ fontSize: `${style.fontSize.small}px`, color: style.secondaryColor }}>
                  {resume.email}
                </div>
              )}
            </div>
            <div className="text-right">
              {resume.phone && (
                <div style={{ fontSize: `${style.fontSize.small}px`, color: style.secondaryColor }}>
                  {resume.phone}
                </div>
              )}
              {resume.location && (
                <div style={{ fontSize: `${style.fontSize.small}px`, color: style.secondaryColor }}>
                  {resume.location}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render section title
  const renderSectionTitle = (title: string) => {
    const baseClasses = 'mb-3 font-bold uppercase tracking-wide';

    return (
      <h2
        className={baseClasses}
        style={{
          fontSize: `${style.fontSize.sectionTitle}px`,
          color: style.primaryColor,
          ...(style.sectionTitleStyle === 'bold-underline' && {
            borderBottom: `2px solid ${style.accentColor}`,
            paddingBottom: '4px',
          }),
          ...(style.sectionTitleStyle === 'bold-border' && {
            borderBottom: `3px solid ${style.accentColor}`,
            paddingBottom: '6px',
          }),
          ...(style.sectionTitleStyle === 'bold-background' && {
            backgroundColor: `${style.accentColor}15`,
            padding: '6px 12px',
            marginLeft: '-12px',
            marginRight: '-12px',
          }),
        }}
      >
        {title}
      </h2>
    );
  };

  // Render summary section
  const renderSummary = () => {
    if (!resume.summary) return null;
    return (
      <div>
        <p
          style={{
            fontSize: `${style.fontSize.body}px`,
            color: style.textColor,
            lineHeight: '1.6',
          }}
        >
          {resume.summary}
        </p>
      </div>
    );
  };

  // Render experience section
  const renderExperience = () => {
    if (!resume.experience || resume.experience.length === 0) return null;
    return (
      <div className="space-y-4">
        {resume.experience.map((exp, index) => (
          <div key={index}>
            <div className="flex items-start justify-between mb-1">
              <div>
                <h3
                  className="font-semibold"
                  style={{
                    fontSize: `${style.fontSize.body}px`,
                    color: style.primaryColor,
                  }}
                >
                  {exp.role}
                </h3>
                <div
                  className="font-medium"
                  style={{
                    fontSize: `${style.fontSize.body}px`,
                    color: style.accentColor,
                  }}
                >
                  {exp.company}
                </div>
              </div>
              <div
                className="text-right"
                style={{
                  fontSize: `${style.fontSize.small}px`,
                  color: style.secondaryColor,
                }}
              >
                <div>
                  {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                </div>
                {exp.location && <div>{exp.location}</div>}
              </div>
            </div>
            {exp.bullets && exp.bullets.length > 0 && (
              <ul
                className="space-y-1 ml-5"
                style={{
                  listStyleType: style.bulletStyle === 'disc' ? 'disc' : 'none',
                }}
              >
                {exp.bullets.map((bullet, i) => (
                  <li
                    key={i}
                    style={{
                      fontSize: `${style.fontSize.body}px`,
                      color: style.textColor,
                      lineHeight: '1.5',
                      ...(style.bulletStyle !== 'disc' && {
                        paddingLeft: '1em',
                        textIndent: '-1em',
                      }),
                    }}
                  >
                    {style.bulletStyle === 'arrow' && '→ '}
                    {style.bulletStyle === 'dash' && '— '}
                    {style.bulletStyle === 'square' && '▪ '}
                    {bullet}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    );
  };

  // Render education section
  const renderEducation = () => {
    if (!resume.education || resume.education.length === 0) return null;
    return (
      <div className="space-y-3">
        {resume.education.map((edu, index) => (
          <div key={index}>
            <div className="flex items-start justify-between">
              <div>
                <h3
                  className="font-semibold"
                  style={{
                    fontSize: `${style.fontSize.body}px`,
                    color: style.primaryColor,
                  }}
                >
                  {edu.school}
                </h3>
                <div
                  style={{
                    fontSize: `${style.fontSize.body}px`,
                    color: style.textColor,
                  }}
                >
                  {edu.degree} in {edu.field}
                </div>
              </div>
              <div
                className="text-right"
                style={{
                  fontSize: `${style.fontSize.small}px`,
                  color: style.secondaryColor,
                }}
              >
                <div>
                  {edu.startDate} - {edu.endDate}
                </div>
                {edu.gpa && <div>GPA: {edu.gpa}</div>}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Render skills section
  const renderSkills = () => {
    if (!resume.skills || resume.skills.length === 0) return null;

    // Group skills by category
    const skillsByCategory = resume.skills.reduce((acc, skill) => {
      if (!acc[skill.category]) {
        acc[skill.category] = [];
      }
      acc[skill.category].push(skill.name);
      return acc;
    }, {} as Record<string, string[]>);

    return (
      <div className="space-y-2">
        {Object.entries(skillsByCategory).map(([category, skills], index) => (
          <div key={index}>
            <span
              className="font-semibold capitalize"
              style={{
                fontSize: `${style.fontSize.body}px`,
                color: style.primaryColor,
              }}
            >
              {category}:{' '}
            </span>
            <span
              style={{
                fontSize: `${style.fontSize.body}px`,
                color: style.textColor,
              }}
            >
              {skills.join(', ')}
            </span>
          </div>
        ))}
      </div>
    );
  };

  // Render projects section
  const renderProjects = () => {
    if (!resume.projects || resume.projects.length === 0) return null;
    return (
      <div className="space-y-3">
        {resume.projects.map((project, index) => (
          <div key={index}>
            <h3
              className="font-semibold"
              style={{
                fontSize: `${style.fontSize.body}px`,
                color: style.primaryColor,
              }}
            >
              {project.name}
              {project.url && (
                <span
                  className="ml-2"
                  style={{
                    fontSize: `${style.fontSize.small}px`,
                    color: style.accentColor,
                  }}
                >
                  ({project.url})
                </span>
              )}
            </h3>
            <p
              style={{
                fontSize: `${style.fontSize.body}px`,
                color: style.textColor,
                lineHeight: '1.5',
              }}
            >
              {project.description}
            </p>
            {project.technologies && project.technologies.length > 0 && (
              <div
                className="mt-1"
                style={{
                  fontSize: `${style.fontSize.small}px`,
                  color: style.secondaryColor,
                }}
              >
                Technologies: {project.technologies.join(', ')}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  // Render section content
  const renderSection = (section: typeof sections[0]) => {
    if (!section.enabled) return null;

    const content = (() => {
      switch (section.key) {
        case 'summary':
          return renderSummary();
        case 'experience':
          return renderExperience();
        case 'education':
          return renderEducation();
        case 'skills':
          return renderSkills();
        case 'projects':
          return renderProjects();
        default:
          return null;
      }
    })();

    if (!content) return null;

    return (
      <div key={section.id} className="mb-6">
        {renderSectionTitle(section.title)}
        {content}
      </div>
    );
  };

  return (
    <div
      className="bg-white shadow-lg mx-auto overflow-hidden"
      style={{
        width: '8.5in',
        minHeight: '11in',
        padding: '0.75in',
        transform: `scale(${scale})`,
        transformOrigin: 'top left',
        fontFamily: style.fontFamily,
      }}
    >
      {renderHeader()}

      {style.columns === 1 ? (
        // Single column layout
        <div>{sortedSections.map(renderSection)}</div>
      ) : (
        // Two column layout
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2">
            {sortedSections
              .filter((s) => s.columnSpan === 2)
              .map(renderSection)}
          </div>
          <div>
            {sortedSections
              .filter((s) => s.columnSpan === 1)
              .map(renderSection)}
          </div>
        </div>
      )}
    </div>
  );
}
