import type { ResumeTemplate } from '../types/template';

interface Props {
  template: ResumeTemplate;
  className?: string;
  height?: number; // Preview container height in px
  cropPercent?: number; // How much of the page to show (0-1), default 0.35 (top 35%)
}

// Sample resume data for preview
const SAMPLE_RESUME_DATA = {
  name: 'John Doe',
  email: 'john@email.com',
  phone: '(555) 123-4567',
  location: 'San Francisco, CA',
  linkedin: 'linkedin.com/in/johndoe',
  summary: 'Experienced professional with 8+ years of expertise in delivering high-impact results and leading cross-functional teams to achieve strategic goals.',
  experience: [
    {
      role: 'Senior Software Engineer',
      company: 'Tech Company Inc.',
      location: 'San Francisco, CA',
      startDate: 'Jan 2020',
      endDate: 'Present',
      current: true,
      bullets: [
        'Led development of key features that improved system performance by 40% and reduced latency',
        'Managed team of 5 engineers and delivered 3 major projects on time and under budget',
        'Implemented CI/CD pipeline that reduced deployment time from 2 hours to 15 minutes'
      ]
    }
  ],
  skills: [
    { name: 'JavaScript', category: 'Programming' },
    { name: 'React', category: 'Frontend' },
    { name: 'Node.js', category: 'Backend' },
    { name: 'Python', category: 'Programming' },
    { name: 'SQL', category: 'Database' }
  ]
};

export function TemplatePreview({ template, className = '', height = 280, cropPercent = 0.35 }: Props) {
  const { style } = template;

  // Full page is 11 inches = 1056px at 96 DPI
  const FULL_PAGE_HEIGHT = 1056;
  const cropHeight = FULL_PAGE_HEIGHT * cropPercent;

  // Calculate scale to fit cropped section into preview height
  // We want to show more detail, so scale up
  const scale = height / cropHeight;

  return (
    <div
      className={`relative overflow-hidden bg-white ${className}`}
      style={{
        height: `${height}px`,
        fontFamily: style.fontFamily,
      }}
    >
      {/* Resume content scaled and cropped */}
      <div
        style={{
          width: '816px', // 8.5 inches at 96 DPI
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          padding: '54px', // 0.75 inches converted to px
        }}
      >
        {/* Header */}
        <div
          style={{
            marginBottom: '20px',
            textAlign: style.headerAlignment as any,
            fontFamily: style.fontFamily,
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
                {SAMPLE_RESUME_DATA.name}
              </h1>
              <div style={{ fontSize: '11px', color: style.secondaryColor }}>
                {SAMPLE_RESUME_DATA.email} • {SAMPLE_RESUME_DATA.phone} • {SAMPLE_RESUME_DATA.location}
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
                {SAMPLE_RESUME_DATA.name}
              </h1>
              <div style={{ fontSize: '11px', color: style.secondaryColor }}>
                {SAMPLE_RESUME_DATA.email} • {SAMPLE_RESUME_DATA.phone} • {SAMPLE_RESUME_DATA.location}
              </div>
            </>
          )}
        </div>

        {/* Summary Section */}
        <div style={{ marginBottom: '20px' }}>
          <h2
            style={{
              fontSize: `${style.fontSize.sectionTitle}px`,
              fontWeight: 'bold',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '10px',
              color: style.primaryColor,
              borderBottom: style.sectionTitleStyle.includes('border') || style.sectionTitleStyle.includes('underline')
                ? `${style.sectionTitleStyle === 'bold-border' ? '3px' : '2px'} solid ${style.accentColor}`
                : 'none',
              paddingBottom: style.sectionTitleStyle.includes('border') || style.sectionTitleStyle.includes('underline') ? '4px' : '0',
              background: style.sectionTitleStyle.includes('background') ? `${style.accentColor}15` : 'transparent',
              padding: style.sectionTitleStyle.includes('background') ? '6px 12px' : '0',
              marginLeft: style.sectionTitleStyle.includes('background') ? '-12px' : '0',
              marginRight: style.sectionTitleStyle.includes('background') ? '-12px' : '0',
            }}
          >
            PROFESSIONAL SUMMARY
          </h2>
          <p
            style={{
              fontSize: `${style.fontSize.body}px`,
              color: style.textColor,
              lineHeight: '1.6',
              margin: '0'
            }}
          >
            {SAMPLE_RESUME_DATA.summary}
          </p>
        </div>

        {/* Experience Section */}
        <div>
          <h2
            style={{
              fontSize: `${style.fontSize.sectionTitle}px`,
              fontWeight: 'bold',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '10px',
              color: style.primaryColor,
              borderBottom: style.sectionTitleStyle.includes('border') || style.sectionTitleStyle.includes('underline')
                ? `${style.sectionTitleStyle === 'bold-border' ? '3px' : '2px'} solid ${style.accentColor}`
                : 'none',
              paddingBottom: style.sectionTitleStyle.includes('border') || style.sectionTitleStyle.includes('underline') ? '4px' : '0',
              background: style.sectionTitleStyle.includes('background') ? `${style.accentColor}15` : 'transparent',
              padding: style.sectionTitleStyle.includes('background') ? '6px 12px' : '0',
              marginLeft: style.sectionTitleStyle.includes('background') ? '-12px' : '0',
              marginRight: style.sectionTitleStyle.includes('background') ? '-12px' : '0',
            }}
          >
            WORK EXPERIENCE
          </h2>
          {SAMPLE_RESUME_DATA.experience.map((exp, idx) => (
            <div key={idx} style={{ marginBottom: '14px' }}>
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
                    {exp.role}
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
              <ul style={{ margin: '6px 0 0 18px', padding: '0', listStyleType: 'none' }}>
                {exp.bullets.slice(0, 2).map((bullet, bidx) => (
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
            </div>
          ))}
        </div>
      </div>

      {/* Bottom gradient to indicate more content below */}
      <div
        className="absolute bottom-0 left-0 right-0 h-12 pointer-events-none"
        style={{
          background: 'linear-gradient(to top, rgba(255,255,255,0.95), transparent)'
        }}
      />
    </div>
  );
}
