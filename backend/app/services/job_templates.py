"""
Job Templates Database
Contains curated job descriptions for common roles across industries
"""

JOB_TEMPLATES = [
    # Product Management
    {
        "id": "pm-001",
        "title": "Senior Product Manager",
        "company": "TechCo",
        "location": "San Francisco, CA",
        "remote": True,
        "description": """We're seeking a Senior Product Manager to lead our B2B SaaS product strategy. You'll define the roadmap, work with engineering and design teams, and drive product-market fit.

Key Responsibilities:
- Own product roadmap and strategy
- Define and track key product metrics
- Conduct user research and competitive analysis
- Write PRDs and user stories
- Lead cross-functional teams (Engineering, Design, Marketing)

Requirements:
- 5+ years of product management experience
- Strong analytical and problem-solving skills
- Experience with B2B SaaS products
- Excellent communication and stakeholder management
- Data-driven decision making""",
        "requiredSkills": ["Product Strategy", "Roadmapping", "User Research", "Data Analysis", "Stakeholder Management"],
        "preferredSkills": ["SQL", "A/B Testing", "Agile", "Figma"],
        "yearsOfExperience": 5,
        "seniorityLevel": "senior",
        "industry": "SaaS",
        "tools": ["Jira", "Figma", "SQL", "Google Analytics"],
        "salary": "$140K - $180K"
    },

    # Software Engineering
    {
        "id": "swe-001",
        "title": "Senior Software Engineer",
        "company": "StartupCo",
        "location": "Remote",
        "remote": True,
        "description": """Join our engineering team to build scalable web applications. You'll work on our full stack (React, Node.js, PostgreSQL) and mentor junior engineers.

Key Responsibilities:
- Design and implement new features
- Write clean, maintainable code
- Review code and mentor team members
- Optimize application performance
- Collaborate with Product and Design teams

Requirements:
- 5+ years of software engineering experience
- Strong proficiency in JavaScript/TypeScript
- Experience with React and Node.js
- Understanding of database design and SQL
- Strong problem-solving skills""",
        "requiredSkills": ["JavaScript", "React", "Node.js", "SQL", "API Design"],
        "preferredSkills": ["TypeScript", "PostgreSQL", "AWS", "Docker"],
        "yearsOfExperience": 5,
        "seniorityLevel": "senior",
        "industry": "Tech",
        "tools": ["React", "Node.js", "PostgreSQL", "Git"],
        "salary": "$150K - $190K"
    },

    {
        "id": "swe-002",
        "title": "Full Stack Engineer",
        "company": "FinTech Inc",
        "location": "New York, NY",
        "remote": False,
        "description": """We're looking for a Full Stack Engineer to build financial technology products. You'll work across our entire stack and ship features that impact millions of users.

Key Responsibilities:
- Build and maintain web applications (frontend & backend)
- Implement secure, scalable APIs
- Write automated tests
- Deploy and monitor production systems
- Work in an Agile environment

Requirements:
- 3+ years of full stack development experience
- Experience with modern JavaScript frameworks (React, Vue, or Angular)
- Backend experience with Python, Node.js, or Java
- Understanding of RESTful APIs and microservices
- Strong CS fundamentals""",
        "requiredSkills": ["JavaScript", "Python", "REST APIs", "Database Design", "Git"],
        "preferredSkills": ["React", "FastAPI", "PostgreSQL", "Redis", "Kubernetes"],
        "yearsOfExperience": 3,
        "seniorityLevel": "mid",
        "industry": "FinTech",
        "tools": ["React", "Python", "PostgreSQL", "Docker"],
        "salary": "$120K - $160K"
    },

    # Data Science
    {
        "id": "ds-001",
        "title": "Data Scientist",
        "company": "DataCo",
        "location": "Seattle, WA",
        "remote": True,
        "description": """Join our data science team to build ML models and drive insights. You'll work with large datasets, develop predictive models, and present findings to stakeholders.

Key Responsibilities:
- Build and deploy machine learning models
- Analyze large datasets to extract insights
- Create data visualizations and dashboards
- Collaborate with engineering to productionize models
- Present findings to business stakeholders

Requirements:
- 3+ years of data science experience
- Strong Python skills (pandas, scikit-learn, TensorFlow)
- SQL expertise
- Statistical modeling and A/B testing
- Excellent communication skills""",
        "requiredSkills": ["Python", "Machine Learning", "SQL", "Statistics", "Data Visualization"],
        "preferredSkills": ["TensorFlow", "PyTorch", "Spark", "Tableau"],
        "yearsOfExperience": 3,
        "seniorityLevel": "mid",
        "industry": "Tech",
        "tools": ["Python", "SQL", "Jupyter", "Tableau"],
        "salary": "$130K - $170K"
    },

    # DevOps
    {
        "id": "devops-001",
        "title": "DevOps Engineer",
        "company": "CloudTech",
        "location": "Austin, TX",
        "remote": True,
        "description": """We're seeking a DevOps Engineer to build and maintain our cloud infrastructure. You'll automate deployments, monitor systems, and ensure reliability.

Key Responsibilities:
- Design and maintain CI/CD pipelines
- Manage AWS infrastructure (EC2, RDS, S3, Lambda)
- Implement monitoring and alerting
- Automate infrastructure with Terraform
- Ensure system security and compliance

Requirements:
- 4+ years of DevOps/SRE experience
- Strong AWS expertise
- Experience with Docker and Kubernetes
- Infrastructure as Code (Terraform or CloudFormation)
- Scripting skills (Python or Bash)""",
        "requiredSkills": ["AWS", "Docker", "Kubernetes", "CI/CD", "Terraform"],
        "preferredSkills": ["Python", "Bash", "Monitoring", "Security"],
        "yearsOfExperience": 4,
        "seniorityLevel": "mid",
        "industry": "Tech",
        "tools": ["AWS", "Docker", "Kubernetes", "Terraform", "Jenkins"],
        "salary": "$135K - $175K"
    },

    # Technical Product Manager
    {
        "id": "tpm-001",
        "title": "Technical Product Manager",
        "company": "API Platform",
        "location": "Remote",
        "remote": True,
        "description": """Lead product strategy for our developer-focused API platform. You'll work closely with engineering to prioritize features and drive adoption.

Key Responsibilities:
- Define API product roadmap
- Write technical specifications and API documentation
- Analyze product metrics and user feedback
- Prioritize feature requests
- Work with engineering on technical feasibility

Requirements:
- 4+ years of product management experience
- Technical background (CS degree or engineering experience)
- Understanding of APIs and developer tools
- Strong analytical skills
- Experience with B2B developer products""",
        "requiredSkills": ["Product Management", "API Design", "Technical Writing", "Data Analysis", "Developer Tools"],
        "preferredSkills": ["SQL", "REST APIs", "GraphQL", "OpenAPI"],
        "yearsOfExperience": 4,
        "seniorityLevel": "mid",
        "industry": "SaaS",
        "tools": ["Jira", "Postman", "SQL", "Swagger"],
        "salary": "$135K - $170K"
    },

    # UX Designer
    {
        "id": "ux-001",
        "title": "Senior UX Designer",
        "company": "DesignCo",
        "location": "Los Angeles, CA",
        "remote": True,
        "description": """We're looking for a Senior UX Designer to create intuitive, user-centered experiences. You'll lead design projects from research to final mockups.

Key Responsibilities:
- Conduct user research and usability testing
- Create wireframes, prototypes, and high-fidelity designs
- Design information architecture and user flows
- Collaborate with Product and Engineering teams
- Maintain design system

Requirements:
- 5+ years of UX design experience
- Portfolio demonstrating UX process
- Expert in Figma
- Strong understanding of user-centered design
- Experience with design systems""",
        "requiredSkills": ["UX Design", "User Research", "Wireframing", "Prototyping", "Figma"],
        "preferredSkills": ["UI Design", "Design Systems", "Usability Testing", "HTML/CSS"],
        "yearsOfExperience": 5,
        "seniorityLevel": "senior",
        "industry": "Tech",
        "tools": ["Figma", "Miro", "UserTesting", "Sketch"],
        "salary": "$130K - $165K"
    },

    # Marketing Manager
    {
        "id": "mkt-001",
        "title": "Product Marketing Manager",
        "company": "GrowthCo",
        "location": "Boston, MA",
        "remote": True,
        "description": """Join our marketing team to drive product adoption and growth. You'll create go-to-market strategies, messaging, and content.

Key Responsibilities:
- Develop go-to-market strategies for new features
- Create product messaging and positioning
- Conduct competitive analysis
- Collaborate with Sales on enablement materials
- Track and optimize marketing campaigns

Requirements:
- 4+ years of product marketing experience
- B2B SaaS marketing background
- Excellent writing and communication skills
- Data-driven approach to marketing
- Experience with marketing automation tools""",
        "requiredSkills": ["Product Marketing", "Go-to-Market Strategy", "Messaging", "Content Creation", "Marketing Analytics"],
        "preferredSkills": ["SEO", "Email Marketing", "HubSpot", "Google Analytics"],
        "yearsOfExperience": 4,
        "seniorityLevel": "mid",
        "industry": "SaaS",
        "tools": ["HubSpot", "Google Analytics", "Salesforce", "Figma"],
        "salary": "$110K - $145K"
    },

    # Solutions Architect
    {
        "id": "sa-001",
        "title": "Solutions Architect",
        "company": "Enterprise Tech",
        "location": "Chicago, IL",
        "remote": True,
        "description": """We're seeking a Solutions Architect to design technical solutions for our enterprise customers. You'll work pre-sales and post-sales to ensure successful implementations.

Key Responsibilities:
- Design technical architectures for enterprise customers
- Lead technical discovery and scoping sessions
- Create technical proposals and presentations
- Support sales team with technical expertise
- Ensure successful customer implementations

Requirements:
- 6+ years of software engineering or solutions architecture experience
- Strong understanding of cloud architecture (AWS, Azure, or GCP)
- Experience with enterprise software integrations
- Excellent presentation and communication skills
- Customer-facing experience""",
        "requiredSkills": ["System Architecture", "Cloud Architecture", "API Integration", "Technical Presentations", "Customer Success"],
        "preferredSkills": ["AWS", "Microservices", "Security", "DevOps"],
        "yearsOfExperience": 6,
        "seniorityLevel": "senior",
        "industry": "Enterprise Software",
        "tools": ["AWS", "Azure", "Kubernetes", "Terraform"],
        "salary": "$155K - $195K"
    },

    # Engineering Manager
    {
        "id": "em-001",
        "title": "Engineering Manager",
        "company": "ScaleUp Inc",
        "location": "San Francisco, CA",
        "remote": True,
        "description": """Lead a team of 5-8 engineers building our core product. You'll balance hands-on technical work with people management and team development.

Key Responsibilities:
- Manage and mentor engineering team
- Plan sprints and manage technical roadmap
        - Conduct 1:1s, performance reviews, and hiring
- Collaborate with Product on feature prioritization
- Ensure code quality and best practices

Requirements:
- 7+ years of software engineering experience
- 2+ years of people management experience
- Strong technical skills (still code 20-30% of time)
- Experience scaling engineering teams
- Excellent communication and mentorship skills""",
        "requiredSkills": ["Engineering Management", "Team Leadership", "Software Engineering", "Agile", "Hiring"],
        "preferredSkills": ["System Design", "Performance Management", "React", "Node.js"],
        "yearsOfExperience": 7,
        "seniorityLevel": "lead",
        "industry": "Tech",
        "tools": ["Git", "Jira", "Slack", "GitHub"],
        "salary": "$180K - $230K"
    },

    # Frontend Engineer
    {
        "id": "fe-001",
        "title": "Frontend Engineer",
        "company": "UICo",
        "location": "Remote",
        "remote": True,
        "description": """Build beautiful, performant web applications with React. You'll work closely with designers to create pixel-perfect UIs.

Key Responsibilities:
- Build responsive web applications with React
- Implement designs from Figma mockups
- Optimize frontend performance
- Write automated tests
- Collaborate with backend engineers on API integration

Requirements:
- 3+ years of frontend development experience
- Strong React and TypeScript skills
- CSS expertise (Tailwind or styled-components)
- Understanding of web performance
- Eye for design and UX details""",
        "requiredSkills": ["React", "JavaScript", "CSS", "TypeScript", "Web Performance"],
        "preferredSkills": ["Next.js", "Tailwind CSS", "GraphQL", "Jest"],
        "yearsOfExperience": 3,
        "seniorityLevel": "mid",
        "industry": "Tech",
        "tools": ["React", "TypeScript", "Tailwind CSS", "Figma"],
        "salary": "$115K - $155K"
    },

    # Backend Engineer
    {
        "id": "be-001",
        "title": "Backend Engineer",
        "company": "API Solutions",
        "location": "Denver, CO",
        "remote": True,
        "description": """Build scalable backend systems and APIs. You'll work with Python, PostgreSQL, and AWS to power our platform.

Key Responsibilities:
- Design and implement RESTful APIs
- Optimize database queries and schema design
- Build background job systems
- Ensure system reliability and performance
- Write comprehensive tests

Requirements:
- 4+ years of backend development experience
- Strong Python skills (FastAPI or Django)
- PostgreSQL expertise
- Understanding of system design
- Experience with cloud infrastructure (AWS)""",
        "requiredSkills": ["Python", "API Design", "PostgreSQL", "System Design", "AWS"],
        "preferredSkills": ["FastAPI", "Redis", "Docker", "Celery"],
        "yearsOfExperience": 4,
        "seniorityLevel": "mid",
        "industry": "Tech",
        "tools": ["Python", "PostgreSQL", "AWS", "Docker"],
        "salary": "$125K - $165K"
    },

    # Customer Success Manager
    {
        "id": "csm-001",
        "title": "Customer Success Manager",
        "company": "SaaS Growth",
        "location": "Remote",
        "remote": True,
        "description": """Ensure our enterprise customers succeed with our platform. You'll drive adoption, retention, and expansion.

Key Responsibilities:
- Manage portfolio of enterprise accounts
- Drive product adoption and engagement
- Conduct business reviews and success planning
- Identify expansion opportunities
- Collect and share customer feedback

Requirements:
- 3+ years of customer success or account management experience
- B2B SaaS background
- Strong relationship-building skills
- Data-driven approach to customer health
- Excellent communication skills""",
        "requiredSkills": ["Customer Success", "Account Management", "Relationship Building", "SaaS", "Communication"],
        "preferredSkills": ["Salesforce", "Gainsight", "Product Knowledge", "Upselling"],
        "yearsOfExperience": 3,
        "seniorityLevel": "mid",
        "industry": "SaaS",
        "tools": ["Salesforce", "Gainsight", "Slack", "Zoom"],
        "salary": "$90K - $120K"
    },

    # Technical Writer
    {
        "id": "tw-001",
        "title": "Technical Writer",
        "company": "DevTools Co",
        "location": "Remote",
        "remote": True,
        "description": """Create developer documentation for our API platform. You'll write guides, tutorials, and API reference docs.

Key Responsibilities:
- Write clear, comprehensive technical documentation
- Create code examples and tutorials
- Maintain API reference documentation
- Collaborate with engineering on technical accuracy
- Improve documentation based on user feedback

Requirements:
- 3+ years of technical writing experience
- Developer tools or API documentation experience
- Understanding of software development
- Excellent writing and editing skills
- Familiarity with Markdown and Git""",
        "requiredSkills": ["Technical Writing", "API Documentation", "Developer Tools", "Markdown", "Git"],
        "preferredSkills": ["REST APIs", "OpenAPI", "JavaScript", "React"],
        "yearsOfExperience": 3,
        "seniorityLevel": "mid",
        "industry": "Tech",
        "tools": ["Markdown", "Git", "Postman", "ReadMe"],
        "salary": "$95K - $130K"
    },

    # QA Engineer
    {
        "id": "qa-001",
        "title": "QA Engineer",
        "company": "QualityCo",
        "location": "Remote",
        "remote": True,
        "description": """Build and maintain automated test suites for our web applications. You'll ensure quality across our entire product.

Key Responsibilities:
- Write automated end-to-end tests
- Build test frameworks and infrastructure
- Perform manual exploratory testing
- Work with developers on testability
- Track and report bugs

Requirements:
- 3+ years of QA or test automation experience
- Experience with automated testing tools (Cypress, Selenium, or Playwright)
- Understanding of CI/CD pipelines
- Strong attention to detail
- Programming skills (JavaScript or Python)""",
        "requiredSkills": ["Test Automation", "QA", "Cypress", "JavaScript", "CI/CD"],
        "preferredSkills": ["Playwright", "Jest", "API Testing", "Performance Testing"],
        "yearsOfExperience": 3,
        "seniorityLevel": "mid",
        "industry": "Tech",
        "tools": ["Cypress", "JavaScript", "Git", "Jenkins"],
        "salary": "$100K - $135K"
    },

    # Business Analyst
    {
        "id": "ba-001",
        "title": "Business Analyst",
        "company": "Analytics Inc",
        "location": "New York, NY",
        "remote": False,
        "description": """Analyze business data and provide insights to drive decisions. You'll work with SQL, Excel, and BI tools.

Key Responsibilities:
- Analyze business metrics and trends
- Create dashboards and reports
- Conduct ad-hoc analysis for stakeholders
- Collaborate with Product and Engineering teams
- Present insights to leadership

Requirements:
- 3+ years of business analysis experience
- Strong SQL skills
- Experience with BI tools (Tableau or Looker)
- Excellent Excel skills
- Strong analytical and communication skills""",
        "requiredSkills": ["Business Analysis", "SQL", "Data Visualization", "Excel", "Communication"],
        "preferredSkills": ["Tableau", "Looker", "Python", "Statistics"],
        "yearsOfExperience": 3,
        "seniorityLevel": "mid",
        "industry": "Finance",
        "tools": ["SQL", "Tableau", "Excel", "Google Sheets"],
        "salary": "$85K - $115K"
    },

    # Sales Engineer
    {
        "id": "se-001",
        "title": "Sales Engineer",
        "company": "EnterpriseTech",
        "location": "San Francisco, CA",
        "remote": True,
        "description": """Support our sales team with technical expertise. You'll deliver demos, answer technical questions, and help close deals.

Key Responsibilities:
- Deliver product demos to prospects
- Answer technical questions during sales process
- Create proof-of-concepts for enterprise deals
- Collaborate with engineering on custom solutions
- Provide technical training to sales team

Requirements:
- 4+ years of technical experience (engineering or solutions architecture)
- Strong presentation and communication skills
- Customer-facing experience
- Understanding of enterprise software sales
- Ability to translate technical concepts for non-technical audiences""",
        "requiredSkills": ["Technical Presentations", "Product Demos", "Customer Communication", "Solution Design", "Sales Support"],
        "preferredSkills": ["API Integration", "Cloud Architecture", "CRM", "Proof-of-Concepts"],
        "yearsOfExperience": 4,
        "seniorityLevel": "mid",
        "industry": "Enterprise Software",
        "tools": ["Salesforce", "Zoom", "Slack", "Postman"],
        "salary": "$120K - $160K + commission"
    },

    # Project Manager
    {
        "id": "pjm-001",
        "title": "Technical Project Manager",
        "company": "AgileTeam",
        "location": "Seattle, WA",
        "remote": True,
        "description": """Lead technical projects across engineering and product teams. You'll manage timelines, resources, and stakeholder communication.

Key Responsibilities:
- Manage technical project timelines and deliverables
- Coordinate across engineering, product, and design teams
- Run Agile ceremonies (standups, retros, planning)
- Identify and mitigate project risks
- Report project status to stakeholders

Requirements:
- 4+ years of project management experience
- Technical background (CS degree or engineering experience)
- Agile/Scrum certification preferred
- Strong organizational and communication skills
- Experience with project management tools""",
        "requiredSkills": ["Project Management", "Agile", "Stakeholder Management", "Risk Management", "Technical Communication"],
        "preferredSkills": ["Scrum", "Jira", "Gantt Charts", "Budget Management"],
        "yearsOfExperience": 4,
        "seniorityLevel": "mid",
        "industry": "Tech",
        "tools": ["Jira", "Asana", "Confluence", "Slack"],
        "salary": "$105K - $140K"
    },

    # Security Engineer
    {
        "id": "sec-001",
        "title": "Security Engineer",
        "company": "SecureTech",
        "location": "Remote",
        "remote": True,
        "description": """Ensure our platform is secure and compliant. You'll perform security audits, implement security controls, and respond to incidents.

Key Responsibilities:
- Conduct security assessments and penetration testing
- Implement security controls and monitoring
- Respond to security incidents
- Ensure SOC 2 / ISO 27001 compliance
- Educate teams on security best practices

Requirements:
- 4+ years of security engineering experience
- Understanding of web application security (OWASP Top 10)
- Experience with security tools (SIEM, IDS, vulnerability scanners)
- Strong knowledge of cloud security (AWS or Azure)
- Security certifications preferred (CISSP, CEH)""",
        "requiredSkills": ["Security Engineering", "Penetration Testing", "Compliance", "Cloud Security", "Incident Response"],
        "preferredSkills": ["CISSP", "AWS Security", "SIEM", "Threat Modeling"],
        "yearsOfExperience": 4,
        "seniorityLevel": "mid",
        "industry": "Tech",
        "tools": ["AWS", "Splunk", "Burp Suite", "Terraform"],
        "salary": "$140K - $180K"
    },

    # HR Manager
    {
        "id": "hr-001",
        "title": "People Operations Manager",
        "company": "StartupHR",
        "location": "Austin, TX",
        "remote": True,
        "description": """Lead people operations for our growing startup. You'll manage recruiting, onboarding, and employee experience.

Key Responsibilities:
- Manage full-cycle recruiting
- Design and run onboarding programs
- Implement HR policies and processes
- Support employee growth and development
- Partner with leadership on people strategy

Requirements:
- 5+ years of HR or people operations experience
- Startup experience preferred
- Strong recruiting background
- Understanding of HR compliance
- Excellent interpersonal skills""",
        "requiredSkills": ["HR Management", "Recruiting", "Onboarding", "Employee Relations", "HR Compliance"],
        "preferredSkills": ["HRIS", "Performance Management", "Compensation", "Benefits"],
        "yearsOfExperience": 5,
        "seniorityLevel": "senior",
        "industry": "Tech",
        "tools": ["Lever", "BambooHR", "Slack", "Google Workspace"],
        "salary": "$110K - $145K"
    }
]
