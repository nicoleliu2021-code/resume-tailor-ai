"""Mock data for testing without OpenAI API calls"""

MOCK_RESUME_STRUCTURE = {
    "summary": "Experienced Software Engineer with 5+ years building scalable web applications. Expert in React, Node.js, and cloud infrastructure.",
    "experience": [
        {
            "id": "exp-1",
            "company": "Tech Corp",
            "role": "Senior Software Engineer",
            "startDate": "01/2020",
            "endDate": "Present",
            "current": True,
            "bullets": [
                "Led development of microservices architecture serving 10M+ users",
                "Reduced API response time by 40% through optimization",
                "Mentored team of 5 junior engineers"
            ]
        },
        {
            "id": "exp-2",
            "company": "StartupXYZ",
            "role": "Full Stack Developer",
            "startDate": "06/2018",
            "endDate": "12/2019",
            "current": False,
            "bullets": [
                "Built responsive web applications using React and Node.js",
                "Implemented CI/CD pipeline reducing deployment time by 60%",
                "Collaborated with design team on user experience improvements"
            ]
        }
    ],
    "education": [
        {
            "id": "edu-1",
            "school": "University of Technology",
            "degree": "Bachelor of Science",
            "field": "Computer Science",
            "startDate": "09/2014",
            "endDate": "05/2018",
            "gpa": "3.8"
        }
    ],
    "skills": [
        {"id": "skill-1", "name": "React", "category": "technical"},
        {"id": "skill-2", "name": "Node.js", "category": "technical"},
        {"id": "skill-3", "name": "Python", "category": "technical"},
        {"id": "skill-4", "name": "AWS", "category": "tool"},
        {"id": "skill-5", "name": "Leadership", "category": "soft"},
        {"id": "skill-6", "name": "Communication", "category": "soft"}
    ],
    "projects": [
        {
            "id": "proj-1",
            "name": "E-commerce Platform",
            "description": "Built full-stack e-commerce solution with payment integration",
            "technologies": ["React", "Express", "PostgreSQL", "Stripe"]
        }
    ],
    "rawText": "Sample resume text..."
}

MOCK_JOB_ANALYSIS = {
    "roleTitle": "Senior Full Stack Engineer",
    "seniorityLevel": "Senior",
    "industry": "Technology",
    "coreResponsibilities": [
        "Design and implement scalable web applications",
        "Lead technical architecture decisions",
        "Mentor junior team members",
        "Collaborate with product and design teams",
        "Ensure code quality and best practices"
    ],
    "technicalSkills": [
        "React",
        "Node.js",
        "TypeScript",
        "AWS",
        "PostgreSQL",
        "Docker",
        "Kubernetes",
        "REST APIs"
    ],
    "softSkills": [
        "Leadership",
        "Communication",
        "Problem-solving",
        "Team collaboration",
        "Agile methodology"
    ],
    "hiringSignals": [
        "5+ years of software development experience",
        "Track record of delivering scalable solutions",
        "Experience mentoring engineers",
        "Strong system design knowledge",
        "Passion for clean code and best practices"
    ],
    "atsKeywords": [
        "Full Stack",
        "React",
        "Node.js",
        "AWS",
        "Microservices",
        "CI/CD",
        "Agile",
        "TypeScript",
        "Docker",
        "PostgreSQL"
    ]
}

MOCK_TAILORED_RESUME = """JOHN DOE
Senior Full Stack Engineer

PROFESSIONAL SUMMARY
Results-driven Senior Software Engineer with 5+ years of experience building scalable, high-performance web applications. Proven expertise in React, Node.js, TypeScript, and AWS cloud infrastructure. Demonstrated leadership in microservices architecture and team mentorship, consistently delivering solutions that serve millions of users.

TECHNICAL SKILLS
Languages & Frameworks: React, Node.js, TypeScript, Python, Express
Cloud & DevOps: AWS, Docker, Kubernetes, CI/CD pipelines
Databases: PostgreSQL, MongoDB
Methodologies: Agile, REST APIs, Microservices Architecture

PROFESSIONAL EXPERIENCE

Senior Software Engineer | Tech Corp | 01/2020 - Present
• Led development of microservices architecture on AWS serving 10M+ users with 99.9% uptime
• Reduced API response time by 40% through systematic performance optimization and caching strategies
• Mentored and coached team of 5 junior engineers on best practices, code quality, and system design
• Implemented CI/CD pipeline using Docker and Kubernetes, reducing deployment time by 60%
• Collaborated cross-functionally with product and design teams in Agile environment

Full Stack Developer | StartupXYZ | 06/2018 - 12/2019
• Built responsive, production-ready web applications using React and Node.js
• Designed and implemented RESTful APIs with PostgreSQL database integration
• Enhanced user experience through close collaboration with design team
• Established CI/CD best practices improving team productivity and code quality

EDUCATION
Bachelor of Science in Computer Science | University of Technology | 2018
GPA: 3.8/4.0

PROJECTS
E-commerce Platform
Built full-stack e-commerce solution with React, Express, PostgreSQL, and Stripe payment integration. Implemented scalable architecture handling thousands of concurrent users.
"""

MOCK_GAP_ANALYSIS = {
    "missingSkills": [
        "TypeScript",
        "Docker",
        "Kubernetes"
    ],
    "missingKeywords": [
        "Agile methodology",
        "System design",
        "Technical leadership",
        "Cross-functional collaboration"
    ],
    "missingResponsibilities": [
        "Leading technical architecture decisions",
        "Driving best practices across the team"
    ],
    "weakAreas": [
        {
            "area": "Leadership Quantification",
            "current": "Mentored team of 5 junior engineers",
            "suggestion": "Add specific outcomes from mentorship, such as promotions, skills developed, or projects delivered"
        },
        {
            "area": "Business Impact",
            "current": "Most bullets focus on technical implementations",
            "suggestion": "Connect technical work to business outcomes like user growth, revenue impact, or cost savings"
        }
    ],
    "suggestedBullets": [
        {
            "experienceId": "exp-1",
            "experienceTitle": "Senior Software Engineer at Tech Corp",
            "bullets": [
                "Drove adoption of TypeScript across 3 microservices, reducing production bugs by 35% and improving developer velocity",
                "Architected Kubernetes deployment strategy for containerized applications, achieving 99.9% uptime across 15+ services",
                "Led cross-functional Agile ceremonies with product and design teams, delivering 12 major features on schedule"
            ],
            "reasoning": "These bullets address missing TypeScript, Docker/Kubernetes, and Agile methodology keywords while staying grounded in your microservices and team leadership experience."
        },
        {
            "experienceId": "exp-2",
            "experienceTitle": "Full Stack Developer at StartupXYZ",
            "bullets": [
                "Collaborated with design team in Agile sprints to improve user experience, increasing user engagement by 25%",
                "Championed Docker containerization for development environments, reducing onboarding time for new engineers by 3 days"
            ],
            "reasoning": "Fills gaps in Agile collaboration and Docker experience using work you likely did at a startup environment."
        }
    ]
}
