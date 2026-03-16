import { ResumeTemplate } from '../types/template';

interface Props {
  template: ResumeTemplate;
  className?: string;
}

export function TemplatePreview({ template, className = '' }: Props) {
  const { style } = template;

  return (
    <div
      className={`relative overflow-hidden bg-white rounded-lg border border-gray-200 ${className}`}
      style={{
        fontFamily: style.fontFamily,
        aspectRatio: '8.5/11',
      }}
    >
      {/* Mini Resume Preview */}
      <div className="p-3 scale-[0.4] origin-top-left" style={{ width: '250%' }}>
        {/* Header */}
        <div
          className="mb-4"
          style={{
            textAlign: style.headerAlignment as any,
            borderBottom: style.sectionTitleStyle.includes('border') ? `2px solid ${style.accentColor}` : 'none',
            paddingBottom: '8px'
          }}
        >
          <h1
            className="font-bold mb-1"
            style={{
              fontSize: `${style.fontSize.name}px`,
              color: style.primaryColor,
            }}
          >
            John Doe
          </h1>
          <div
            className="text-xs"
            style={{ color: style.secondaryColor }}
          >
            john@email.com | 123-456-7890 | linkedin.com/in/johndoe
          </div>
        </div>

        {/* Summary Section */}
        <div className="mb-4">
          <h2
            className="font-bold mb-2"
            style={{
              fontSize: `${style.fontSize.sectionTitle}px`,
              color: style.primaryColor,
              borderBottom: style.sectionTitleStyle.includes('border') || style.sectionTitleStyle.includes('underline')
                ? `2px solid ${style.accentColor}`
                : 'none',
              backgroundColor: style.sectionTitleStyle.includes('background')
                ? `${style.accentColor}20`
                : 'transparent',
              padding: style.sectionTitleStyle.includes('background') ? '4px 8px' : '0',
              marginBottom: '8px'
            }}
          >
            PROFESSIONAL SUMMARY
          </h2>
          <p
            style={{
              fontSize: `${style.fontSize.body}px`,
              color: style.textColor,
              lineHeight: '1.4'
            }}
          >
            Experienced professional with expertise in delivering results...
          </p>
        </div>

        {/* Experience Section */}
        <div className="mb-4">
          <h2
            className="font-bold mb-2"
            style={{
              fontSize: `${style.fontSize.sectionTitle}px`,
              color: style.primaryColor,
              borderBottom: style.sectionTitleStyle.includes('border') || style.sectionTitleStyle.includes('underline')
                ? `2px solid ${style.accentColor}`
                : 'none',
              backgroundColor: style.sectionTitleStyle.includes('background')
                ? `${style.accentColor}20`
                : 'transparent',
              padding: style.sectionTitleStyle.includes('background') ? '4px 8px' : '0',
              marginBottom: '8px'
            }}
          >
            WORK EXPERIENCE
          </h2>
          <div className="mb-3">
            <div className="flex justify-between items-baseline mb-1">
              <h3
                className="font-semibold"
                style={{
                  fontSize: `${style.fontSize.body + 1}px`,
                  color: style.primaryColor
                }}
              >
                Senior Software Engineer
              </h3>
              <span
                style={{
                  fontSize: `${style.fontSize.small}px`,
                  color: style.secondaryColor
                }}
              >
                2020 - Present
              </span>
            </div>
            <div
              className="mb-2"
              style={{
                fontSize: `${style.fontSize.small}px`,
                color: style.secondaryColor
              }}
            >
              Tech Company Inc.
            </div>
            <ul className="space-y-1">
              <li
                className="flex items-start gap-2"
                style={{
                  fontSize: `${style.fontSize.body}px`,
                  color: style.textColor
                }}
              >
                <span style={{ color: style.accentColor }}>
                  {style.bulletStyle === 'disc' ? '•' :
                   style.bulletStyle === 'square' ? '▪' :
                   style.bulletStyle === 'arrow' ? '→' :
                   style.bulletStyle === 'dash' ? '–' : '•'}
                </span>
                <span className="flex-1">Led development of key features that improved metrics by 40%</span>
              </li>
              <li
                className="flex items-start gap-2"
                style={{
                  fontSize: `${style.fontSize.body}px`,
                  color: style.textColor
                }}
              >
                <span style={{ color: style.accentColor }}>
                  {style.bulletStyle === 'disc' ? '•' :
                   style.bulletStyle === 'square' ? '▪' :
                   style.bulletStyle === 'arrow' ? '→' :
                   style.bulletStyle === 'dash' ? '–' : '•'}
                </span>
                <span className="flex-1">Managed team of 5 engineers and delivered projects on time</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Skills Section */}
        <div>
          <h2
            className="font-bold mb-2"
            style={{
              fontSize: `${style.fontSize.sectionTitle}px`,
              color: style.primaryColor,
              borderBottom: style.sectionTitleStyle.includes('border') || style.sectionTitleStyle.includes('underline')
                ? `2px solid ${style.accentColor}`
                : 'none',
              backgroundColor: style.sectionTitleStyle.includes('background')
                ? `${style.accentColor}20`
                : 'transparent',
              padding: style.sectionTitleStyle.includes('background') ? '4px 8px' : '0',
              marginBottom: '8px'
            }}
          >
            SKILLS
          </h2>
          <div
            className="flex flex-wrap gap-2"
            style={{
              fontSize: `${style.fontSize.body}px`,
              color: style.textColor
            }}
          >
            {['JavaScript', 'React', 'Node.js', 'Python', 'SQL'].map(skill => (
              <span
                key={skill}
                className="px-2 py-1 rounded"
                style={{
                  backgroundColor: `${style.accentColor}15`,
                  color: style.primaryColor,
                  fontSize: `${style.fontSize.small}px`
                }}
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Subtle overlay to indicate it's a preview */}
      <div className="absolute inset-0 pointer-events-none border-2 border-transparent group-hover:border-gray-300 rounded-lg transition-colors" />
    </div>
  );
}
