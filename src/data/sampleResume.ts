import type { ResumeTemplateData } from '../types/resumeTemplate';

/**
 * Sample resume data for demonstration
 * Shows the complete structure and how to format each section
 */
export const SAMPLE_RESUME: ResumeTemplateData = {
  // Header Information
  name: 'Sarah Johnson',
  email: 'sarah.johnson@email.com',
  phone: '(555) 123-4567',
  location: 'San Francisco, CA',
  linkedin: 'linkedin.com/in/sarahjohnson',
  website: 'sarahjohnson.dev',

  // Target Role (Optional - highlights what you're seeking)
  targetRole: 'Senior Product Manager - AI & Machine Learning',

  // Professional Summary (2-3 sentences, focused on value proposition)
  summary:
    'Results-driven Product Manager with 8+ years of experience leading cross-functional teams to deliver AI-powered products that drive user engagement and revenue growth. Proven track record of launching 0-to-1 products, scaling to 1M+ users, and increasing key metrics by 40%+. Expert in leveraging data analytics and user research to inform product strategy and prioritize feature roadmaps.',

  // Professional Experience
  experience: [
    {
      company: 'TechCorp AI',
      role: 'Senior Product Manager',
      location: 'San Francisco, CA',
      startDate: 'Jan 2022',
      endDate: 'Present',
      bullets: [
        'Led development of AI-powered recommendation engine that increased user engagement by 45% and drove $2M in additional annual revenue',
        'Managed cross-functional team of 12 engineers, designers, and data scientists to deliver 3 major product launches on schedule',
        'Established data-driven product roadmap using A/B testing and user analytics, resulting in 30% improvement in feature adoption',
        'Collaborated with ML engineers to integrate GPT-4 API, reducing customer support tickets by 25% through intelligent chatbot',
        'Presented quarterly product strategy to C-suite executives and secured $500K additional budget for AI initiatives',
      ],
    },
    {
      company: 'InnovateLabs',
      role: 'Product Manager',
      location: 'Remote',
      startDate: 'Mar 2019',
      endDate: 'Dec 2021',
      bullets: [
        'Launched SaaS platform from concept to 10K+ paying customers, generating $1.5M ARR within first year',
        'Conducted 50+ user interviews and competitive analysis to identify market gaps and inform product positioning',
        'Reduced customer churn by 20% through implementation of personalized onboarding flow and in-app tutorials',
        'Built and maintained product roadmap aligned with company OKRs, delivering 95% of committed features on time',
        'Partnered with sales team to create customer success playbook that improved retention rate from 78% to 92%',
      ],
    },
    {
      company: 'StartupXYZ',
      role: 'Associate Product Manager',
      location: 'New York, NY',
      startDate: 'Jun 2017',
      endDate: 'Feb 2019',
      bullets: [
        'Supported 2 senior PMs in shipping mobile app updates that increased DAU by 60% over 18 months',
        'Analyzed user behavior data using SQL and Python to identify friction points, leading to 15% conversion improvement',
        'Created detailed product specifications and user stories for engineering team, reducing scope creep by 30%',
        'Facilitated sprint planning and retrospectives for agile development team of 8 engineers',
      ],
    },
  ],

  // Skills - Grouped by category for easy scanning
  skills: {
    technical: [
      'Product Strategy',
      'Data Analysis (SQL, Python)',
      'A/B Testing',
      'API Integration',
      'Machine Learning Basics',
    ],
    leadership: [
      'Cross-Functional Team Leadership',
      'Stakeholder Management',
      'Agile/Scrum',
      'Product Roadmapping',
      'Go-to-Market Strategy',
    ],
    tools: [
      'Jira',
      'Figma',
      'Google Analytics',
      'Amplitude',
      'Mixpanel',
      'Tableau',
      'Notion',
    ],
  },

  // Education
  education: [
    {
      institution: 'Stanford University',
      degree: 'Master of Science',
      field: 'Computer Science',
      location: 'Stanford, CA',
      graduationDate: 'Jun 2017',
      gpa: '3.8',
      honors: ['Dean\'s List', 'AI Research Fellowship'],
    },
    {
      institution: 'University of California, Berkeley',
      degree: 'Bachelor of Arts',
      field: 'Business Administration',
      location: 'Berkeley, CA',
      graduationDate: 'May 2015',
      gpa: '3.9',
      honors: ['Summa Cum Laude', 'Phi Beta Kappa'],
    },
  ],

  // Optional: Projects
  projects: [
    {
      name: 'AI Resume Optimizer',
      description:
        'Built open-source tool that uses GPT-4 to optimize resumes for ATS systems, achieving 10K+ GitHub stars and featured in ProductHunt top 10.',
      technologies: ['React', 'TypeScript', 'OpenAI API', 'Tailwind CSS'],
      link: 'github.com/user/ai-resume',
      date: '2024',
    },
  ],

  // Optional: Certifications
  certifications: [
    {
      name: 'Certified Scrum Product Owner (CSPO)',
      issuer: 'Scrum Alliance',
      date: '2021',
      credentialId: 'CSPO-123456',
    },
    {
      name: 'Google Analytics Individual Qualification',
      issuer: 'Google',
      date: '2020',
    },
  ],

  // Optional: Publications
  publications: [
    {
      title: 'The Future of AI in Product Management',
      publisher: 'Medium - Towards Data Science',
      date: 'Mar 2024',
      link: 'medium.com/article',
    },
  ],
};

/**
 * Sample resume for a Software Engineer
 * Different structure to show flexibility
 */
export const SAMPLE_ENGINEER_RESUME: ResumeTemplateData = {
  name: 'Michael Chen',
  email: 'michael.chen@email.com',
  phone: '(555) 987-6543',
  location: 'Seattle, WA',
  linkedin: 'linkedin.com/in/michaelchen',
  website: 'michaelchen.dev',

  targetRole: 'Senior Full-Stack Engineer - React & Node.js',

  summary:
    'Full-stack software engineer with 6+ years of experience building scalable web applications using React, Node.js, and AWS. Proven ability to architect systems handling 10M+ requests/day, optimize performance by 50%+, and mentor junior developers. Passionate about clean code, automated testing, and delivering exceptional user experiences.',

  experience: [
    {
      company: 'CloudTech Solutions',
      role: 'Senior Software Engineer',
      location: 'Seattle, WA',
      startDate: 'Aug 2021',
      endDate: 'Present',
      bullets: [
        'Architected and deployed microservices-based platform serving 5M+ users with 99.9% uptime using Node.js, TypeScript, and AWS',
        'Improved application load time by 60% through code splitting, lazy loading, and CDN optimization strategies',
        'Mentored 3 junior engineers, conducting code reviews and pair programming sessions to improve team code quality by 40%',
        'Led migration from monolithic architecture to microservices, reducing deployment time from 2 hours to 15 minutes',
        'Implemented comprehensive unit and integration testing with Jest and Cypress, achieving 85% code coverage',
      ],
    },
    {
      company: 'WebDev Innovations',
      role: 'Software Engineer',
      location: 'Remote',
      startDate: 'Jan 2019',
      endDate: 'Jul 2021',
      bullets: [
        'Developed responsive React applications with Redux state management and RESTful API integration for 50K+ users',
        'Built backend services using Node.js and Express, handling 2M+ API requests daily with sub-100ms response times',
        'Designed and optimized PostgreSQL database schemas, improving query performance by 70% through proper indexing',
        'Collaborated with product and design teams in agile environment to deliver 25+ features per quarter',
        'Implemented CI/CD pipelines using GitHub Actions and Docker, reducing bug rate in production by 45%',
      ],
    },
  ],

  skills: {
    languages: ['JavaScript', 'TypeScript', 'Python', 'SQL', 'HTML/CSS'],
    technical: [
      'React',
      'Node.js',
      'Express',
      'Next.js',
      'GraphQL',
      'REST APIs',
    ],
    tools: [
      'AWS (EC2, S3, Lambda)',
      'Docker',
      'Kubernetes',
      'Git',
      'MongoDB',
      'PostgreSQL',
    ],
    testing: ['Jest', 'Cypress', 'React Testing Library', 'Postman'],
  },

  education: [
    {
      institution: 'University of Washington',
      degree: 'Bachelor of Science',
      field: 'Computer Science',
      location: 'Seattle, WA',
      graduationDate: 'May 2018',
      gpa: '3.7',
    },
  ],

  projects: [
    {
      name: 'Open Source Contributor - React Query',
      description:
        'Contributed 15+ pull requests to popular React data-fetching library, including bug fixes and documentation improvements.',
      technologies: ['React', 'TypeScript'],
      link: 'github.com/tanstack/react-query',
    },
  ],

  certifications: [
    {
      name: 'AWS Certified Solutions Architect - Associate',
      issuer: 'Amazon Web Services',
      date: '2022',
    },
  ],
};
