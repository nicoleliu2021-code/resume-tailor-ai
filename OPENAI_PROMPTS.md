# OpenAI Prompts for Resume Modification

## Overview
This document contains all OpenAI prompts used in the Resume Tailor AI application for parsing, analyzing, and optimizing resumes.

---

## 1. Resume Parsing Prompt

**Endpoint:** `/api/resume/parse`
**Model:** `gpt-4o-mini`
**Temperature:** 0.3
**Response Format:** JSON

### System Prompt
```
You are an expert resume parser. Extract structured data from resumes accurately. Always return valid JSON.
```

### User Prompt Template
```
Parse this resume into structured JSON format.

Resume Text:
{resume_text}

Return a JSON object with this structure:
{
  "summary": "Professional summary or objective",
  "experience": [
    {
      "id": "unique-id",
      "company": "Company Name",
      "role": "Job Title",
      "startDate": "MM/YYYY",
      "endDate": "MM/YYYY or Present",
      "current": boolean,
      "bullets": ["Achievement 1", "Achievement 2"]
    }
  ],
  "education": [
    {
      "id": "unique-id",
      "school": "University Name",
      "degree": "Degree Type",
      "field": "Field of Study",
      "startDate": "MM/YYYY",
      "endDate": "MM/YYYY",
      "gpa": "3.8 (optional)"
    }
  ],
  "skills": [
    {
      "id": "unique-id",
      "name": "Skill Name",
      "category": "technical" | "soft" | "language" | "tool"
    }
  ],
  "projects": [
    {
      "id": "unique-id",
      "name": "Project Name",
      "description": "Brief description",
      "technologies": ["Tech1", "Tech2"]
    }
  ]
}

Generate unique IDs for each item. Extract all relevant information accurately.
```

---

## 2. Job Analysis Prompt

**Endpoint:** `/api/job/analyze`
**Model:** `gpt-4o-mini`
**Temperature:** 0.3
**Response Format:** JSON

### System Prompt
```
You are an expert hiring manager and recruiter who analyzes job descriptions. Always return valid JSON.
```

### User Prompt Template
```
You are a hiring manager analyzing a job description.

Extract the following information:

1. Role title
2. Seniority level
3. Industry
4. Core responsibilities (top 5)
5. Key technical skills
6. Key soft skills
7. Signals that hiring managers care about
8. Keywords important for ATS systems

Return the output as structured JSON with these exact keys:
{
  "roleTitle": "string",
  "seniorityLevel": "string",
  "industry": "string",
  "coreResponsibilities": ["string"],
  "technicalSkills": ["string"],
  "softSkills": ["string"],
  "hiringSignals": ["string"],
  "atsKeywords": ["string"]
}

Job description:
{job_description}
```

---

## 3. Resume Tailoring Prompt

**Endpoint:** `/api/resume/tailor`
**Model:** `gpt-4o-mini`
**Temperature:** 0.7
**Max Tokens:** 3000

### System Prompt
```
You are an expert resume writer who helps job seekers tailor their resumes to specific job descriptions. You maintain honesty while highlighting the most relevant qualifications. Format the resume professionally with clear sections.
```

### User Prompt Template
```
You are an expert resume writer and career coach. Your task is to tailor a resume to match a specific job description.

ORIGINAL RESUME:
{resume_text}

JOB DESCRIPTION:
{job_description}

JOB ANALYSIS:
- Role: {job_analysis.roleTitle} ({job_analysis.seniorityLevel})
- Industry: {job_analysis.industry}
- Key Skills Needed: {', '.join(job_analysis.technicalSkills)}
- Important Keywords: {', '.join(job_analysis.atsKeywords)}

INSTRUCTIONS:
1. Analyze the resume and identify relevant experience matching the job requirements
2. Rewrite the resume to highlight skills and experience that match: {top_5_technical_skills}
3. Incorporate these ATS keywords naturally: {top_10_ats_keywords}
4. Emphasize accomplishments relevant to: {top_3_responsibilities}
5. Maintain the original resume's structure and format
6. Keep all information truthful - do not fabricate experience or skills
7. Use action verbs and quantify achievements where possible
8. Make the resume ATS-friendly and compelling for the {seniorityLevel} {roleTitle} role

Provide ONLY the tailored resume text in a clean, professional format. Do not include any explanations or meta-commentary.
```

---

## 4. Gap Analysis Prompt

**Endpoint:** `/api/resume/analyze-gaps`
**Model:** `gpt-4o-mini`
**Temperature:** 0.4
**Response Format:** JSON

### System Prompt
```
You are an expert career coach who helps candidates identify and fill gaps in their resumes. You never fabricate experience but help candidates better articulate what they've already done. Always return valid JSON.
```

### User Prompt Template
```
You are an expert career coach analyzing a resume against job requirements.

RESUME SKILLS: {comma_separated_skills}

RESUME EXPERIENCE:
{experience_summary}

JOB REQUIREMENTS:
- Role: {job_analysis.roleTitle} ({job_analysis.seniorityLevel})
- Industry: {job_analysis.industry}
- Required Technical Skills: {technical_skills}
- Required Soft Skills: {soft_skills}
- Core Responsibilities: {core_responsibilities}
- ATS Keywords: {ats_keywords}

TASK: Identify gaps between the resume and job requirements. For each gap:
1. Missing Skills: Skills mentioned in job requirements that candidate likely HAS but didn't list
2. Missing Keywords: ATS keywords that could be naturally incorporated
3. Missing Responsibilities: Job responsibilities the candidate likely has experience with but didn't emphasize
4. Weak Areas: Aspects of the resume that could be strengthened (with specific suggestions)
5. Suggested Bullets: Generate 2-4 realistic bullet points per experience that fill these gaps

CRITICAL RULES:
- DO NOT fabricate experience or skills the candidate doesn't have
- Base suggestions on what's already in their resume (extrapolate realistically)
- Focus on REFRAMING and EMPHASIZING existing work, not inventing new work
- Use the candidate's actual experience IDs and role titles
- Keep suggestions professional, concise, and achievement-focused

Return JSON with this structure:
{
  "missingSkills": ["skill1", "skill2"],
  "missingKeywords": ["keyword1", "keyword2"],
  "missingResponsibilities": ["responsibility1"],
  "weakAreas": [
    {
      "area": "Leadership Quantification",
      "current": "What they currently have",
      "suggestion": "How to improve it"
    }
  ],
  "suggestedBullets": [
    {
      "experienceId": "exp-1",
      "experienceTitle": "Senior Engineer at CompanyX",
      "bullets": ["Bullet 1", "Bullet 2"],
      "reasoning": "Why these bullets make sense given their background"
    }
  ]
}
```

---

## Best Practices

### 1. **Temperature Settings**
- **Parsing & Analysis (0.3):** Low temperature for consistent, factual extraction
- **Tailoring (0.7):** Higher temperature for creative rewriting while maintaining accuracy

### 2. **Token Limits**
- Resume parsing: ~2000-3000 tokens sufficient
- Resume tailoring: 3000 tokens recommended for full resumes
- Job analysis: ~1500 tokens typical

### 3. **Error Handling**
```python
try:
    response = client.chat.completions.create(...)
    content = response.choices[0].message.content
    return parse_json(content)
except Exception as e:
    raise Exception(f"Failed to process: {str(e)}")
```

### 4. **Mock Mode for Testing**
Set `MOCK_MODE=true` in backend `.env` to test without using OpenAI credits.

---

## Integration Steps

### Step 1: Set OpenAI API Key
```bash
# In backend/.env
OPENAI_API_KEY=sk-proj-your-api-key-here
MOCK_MODE=false
```

### Step 2: Install Dependencies
```bash
cd backend
pip install openai python-dotenv
```

### Step 3: Use in Application
```typescript
// Frontend: Call the API
const structured = await parseResumeAPI(resumeText);
const analysis = await analyzeJobAPI(jobDescription);
const tailored = await tailorResumeAPI(resumeText, jobDescription, analysis);
```

### Step 4: Monitor Usage
- Track token usage via OpenAI dashboard
- Implement rate limiting if needed
- Cache results where appropriate

---

## Cost Optimization Tips

1. **Use gpt-4o-mini** instead of gpt-4 (90% cheaper, sufficient quality)
2. **Enable MOCK_MODE** during development
3. **Truncate long resumes** to first 5000 characters if needed
4. **Cache job analyses** for popular job postings
5. **Batch requests** when processing multiple resumes

---

## Prompt Engineering Tips

### For Resume Tailoring:
- ✅ Be specific about what to preserve (dates, companies)
- ✅ Emphasize "truthful" and "do not fabricate"
- ✅ Provide examples of desired output format
- ✅ Use system prompt to establish role and constraints

### For Gap Analysis:
- ✅ Explicitly state "extrapolate realistically from existing experience"
- ✅ Provide reasoning field to explain suggestions
- ✅ Use structured JSON for actionable insights
- ✅ Focus on reframing, not inventing

### For Job Analysis:
- ✅ Request specific number of items (top 5, top 10)
- ✅ Categorize skills (technical vs soft)
- ✅ Extract both explicit and implicit requirements
- ✅ Identify ATS keywords specifically

---

## Example API Request

```python
from openai import OpenAI

client = OpenAI(api_key="your-api-key")

response = client.chat.completions.create(
    model="gpt-4o-mini",
    messages=[
        {"role": "system", "content": "You are an expert resume writer..."},
        {"role": "user", "content": "Your prompt here..."}
    ],
    temperature=0.7,
    max_tokens=3000
)

result = response.choices[0].message.content
```

---

## Testing Prompts

Use the FastAPI interactive docs to test prompts:
1. Start backend: `uvicorn app.main:app --reload`
2. Visit: `http://localhost:8000/docs`
3. Test each endpoint with sample data

---

## Security Notes

- ✅ **Never** commit `.env` files with API keys
- ✅ Store API keys in environment variables
- ✅ Use backend-only API calls (never expose keys to frontend)
- ✅ Implement rate limiting on production
- ✅ Validate and sanitize all user inputs

---

## Support

For issues or improvements to prompts:
1. Check OpenAI documentation: https://platform.openai.com/docs
2. Test in OpenAI Playground first
3. Adjust temperature and max_tokens as needed
4. Monitor response quality and iterate

---

## Real-World Examples

### Example 1: Software Engineer Resume Parsing

**Input Resume Text:**
```
JOHN DOE
Full Stack Developer | San Francisco, CA
john.doe@email.com | (555) 123-4567 | linkedin.com/in/johndoe

PROFESSIONAL SUMMARY
Experienced Full Stack Developer with 5+ years building scalable web applications.
Proficient in React, Node.js, Python, and cloud technologies. Passionate about
creating user-centric solutions and optimizing performance.

EXPERIENCE

Senior Software Engineer | Tech Corp | Jan 2021 - Present
• Led development of microservices architecture handling 10M+ monthly active users
• Reduced API response time by 45% through database optimization and caching strategies
• Mentored team of 5 junior developers, improving code quality and deployment velocity
• Implemented CI/CD pipeline cutting deployment time from 2 hours to 15 minutes

Full Stack Developer | StartupXYZ | Jun 2019 - Dec 2020
• Built responsive web applications using React, Node.js, and PostgreSQL
• Designed and implemented RESTful APIs serving 500K+ daily requests
• Collaborated with design team to improve user engagement by 35%

EDUCATION
B.S. Computer Science | University of California, Berkeley | 2015 - 2019 | GPA: 3.8

SKILLS
Languages: JavaScript, Python, TypeScript, SQL
Frameworks: React, Node.js, Express, Django, Next.js
Tools: Git, Docker, AWS, Jenkins, MongoDB, PostgreSQL
```

**Expected Output:**
```json
{
  "summary": "Experienced Full Stack Developer with 5+ years building scalable web applications. Proficient in React, Node.js, Python, and cloud technologies.",
  "experience": [
    {
      "id": "exp-1",
      "company": "Tech Corp",
      "role": "Senior Software Engineer",
      "startDate": "01/2021",
      "endDate": "Present",
      "current": true,
      "bullets": [
        "Led development of microservices architecture handling 10M+ monthly active users",
        "Reduced API response time by 45% through database optimization and caching strategies",
        "Mentored team of 5 junior developers, improving code quality and deployment velocity",
        "Implemented CI/CD pipeline cutting deployment time from 2 hours to 15 minutes"
      ]
    },
    {
      "id": "exp-2",
      "company": "StartupXYZ",
      "role": "Full Stack Developer",
      "startDate": "06/2019",
      "endDate": "12/2020",
      "current": false,
      "bullets": [
        "Built responsive web applications using React, Node.js, and PostgreSQL",
        "Designed and implemented RESTful APIs serving 500K+ daily requests",
        "Collaborated with design team to improve user engagement by 35%"
      ]
    }
  ],
  "education": [
    {
      "id": "edu-1",
      "school": "University of California, Berkeley",
      "degree": "Bachelor of Science",
      "field": "Computer Science",
      "startDate": "09/2015",
      "endDate": "05/2019",
      "gpa": "3.8"
    }
  ],
  "skills": [
    {"id": "skill-1", "name": "JavaScript", "category": "technical"},
    {"id": "skill-2", "name": "Python", "category": "technical"},
    {"id": "skill-3", "name": "React", "category": "technical"},
    {"id": "skill-4", "name": "Node.js", "category": "technical"},
    {"id": "skill-5", "name": "AWS", "category": "tool"},
    {"id": "skill-6", "name": "Docker", "category": "tool"}
  ],
  "projects": []
}
```

---

### Example 2: Job Description Analysis

**Input Job Description:**
```
Senior Frontend Engineer - Remote

We're seeking a talented Senior Frontend Engineer to join our growing team.
You'll be responsible for building intuitive, high-performance web applications
that delight millions of users worldwide.

Responsibilities:
- Architect and develop complex React applications with TypeScript
- Collaborate with designers to implement pixel-perfect UI/UX
- Optimize application performance and ensure accessibility standards
- Mentor junior developers and conduct code reviews
- Drive technical decision-making for frontend architecture

Requirements:
- 5+ years of professional frontend development experience
- Expert-level proficiency in React, TypeScript, and modern JavaScript
- Strong understanding of web performance optimization techniques
- Experience with state management libraries (Redux, Zustand, or similar)
- Familiarity with testing frameworks (Jest, React Testing Library)
- Excellent communication skills and ability to work in cross-functional teams
- Bachelor's degree in Computer Science or equivalent experience

Nice to Have:
- Experience with Next.js and server-side rendering
- Knowledge of GraphQL and Apollo Client
- Contributions to open-source projects
- Experience with design systems and component libraries
```

**Expected Output:**
```json
{
  "roleTitle": "Senior Frontend Engineer",
  "seniorityLevel": "Senior",
  "industry": "Technology/Software",
  "coreResponsibilities": [
    "Architect and develop complex React applications with TypeScript",
    "Collaborate with designers to implement pixel-perfect UI/UX",
    "Optimize application performance and ensure accessibility",
    "Mentor junior developers and conduct code reviews",
    "Drive technical decision-making for frontend architecture"
  ],
  "technicalSkills": [
    "React",
    "TypeScript",
    "JavaScript",
    "Redux",
    "Jest",
    "React Testing Library",
    "Next.js",
    "GraphQL"
  ],
  "softSkills": [
    "Communication",
    "Mentorship",
    "Collaboration",
    "Cross-functional teamwork",
    "Technical leadership"
  ],
  "hiringSignals": [
    "5+ years frontend development experience",
    "Expert-level React proficiency",
    "Performance optimization experience",
    "Code review and mentorship",
    "Bachelor's in Computer Science or equivalent"
  ],
  "atsKeywords": [
    "React",
    "TypeScript",
    "JavaScript",
    "Frontend",
    "Redux",
    "Jest",
    "Performance optimization",
    "Accessibility",
    "Mentorship",
    "Code review",
    "Next.js",
    "GraphQL"
  ]
}
```

---

## Cost Calculator

### Token Estimation Guide

**Average Token Counts:**
- 1 page resume: ~800-1200 tokens
- 2 page resume: ~1500-2000 tokens
- Job description: ~400-800 tokens
- Structured resume output: ~600-1000 tokens
- Gap analysis output: ~400-600 tokens

### Pricing (as of March 2026)

**gpt-4o-mini:**
- Input: $0.150 per 1M tokens
- Output: $0.600 per 1M tokens

**gpt-4o:**
- Input: $2.50 per 1M tokens
- Output: $10.00 per 1M tokens

### Cost Per Operation

#### Using gpt-4o-mini (Recommended)

| Operation | Input Tokens | Output Tokens | Cost per Request |
|-----------|--------------|---------------|------------------|
| Resume Parse | 1,500 | 800 | $0.00071 |
| Job Analysis | 600 | 400 | $0.00033 |
| Resume Tailor | 2,500 | 2,000 | $0.00158 |
| Gap Analysis | 2,000 | 500 | $0.00060 |
| **Full Workflow** | 6,600 | 3,700 | **$0.00322** |

#### Using gpt-4o (Not Recommended for this use case)

| Operation | Full Workflow Cost |
|-----------|--------------------|
| gpt-4o | $0.0538 per request |

**Savings:** Using gpt-4o-mini saves ~94% compared to gpt-4o

### Monthly Cost Projections

**Low Volume (100 resumes/month):**
- gpt-4o-mini: $0.32/month
- gpt-4o: $5.38/month

**Medium Volume (1,000 resumes/month):**
- gpt-4o-mini: $3.22/month
- gpt-4o: $53.80/month

**High Volume (10,000 resumes/month):**
- gpt-4o-mini: $32.20/month
- gpt-4o: $538.00/month

**Enterprise (100,000 resumes/month):**
- gpt-4o-mini: $322/month
- gpt-4o: $5,380/month

### Cost Optimization Strategies

1. **Cache Job Analyses** - Same job posting analyzed multiple times
   - Savings: ~$0.00033 per duplicate analysis

2. **Implement Resume Length Limits** - Truncate to 2000 tokens max
   - Savings: ~30% on long resumes

3. **Batch Similar Requests** - Process during off-peak hours
   - No cost savings but better rate limit management

4. **Use MOCK_MODE in Development** - Zero cost for testing
   - Savings: 100% during development

5. **Implement Caching Layer** - Redis for recent analyses
   - Potential savings: 40-60% with good cache hit rate

---

## Industry-Specific Prompt Variations

### Tech Industry

**Enhanced Technical Skills Extraction:**
```
Additional focus areas:
- Programming languages and frameworks (with version numbers when mentioned)
- Cloud platforms (AWS, Azure, GCP) and specific services
- Development methodologies (Agile, Scrum, DevOps)
- Architecture patterns (microservices, serverless, monolithic)
- Performance metrics (latency, throughput, scale numbers)
- Open source contributions and GitHub activity
```

**Tech Resume Tailoring Emphasis:**
```
TECH-SPECIFIC INSTRUCTIONS:
- Highlight system design and architecture experience
- Quantify impact with metrics (users served, performance improvements, uptime %)
- Emphasize collaboration with cross-functional teams (Product, Design, QA)
- Include technical leadership and mentorship
- Showcase problem-solving with specific technologies
- Use industry-standard terminology (CI/CD, microservices, containers)
```

---

### Healthcare/Medical

**Healthcare Keywords Focus:**
```
Additional extraction focus:
- HIPAA compliance and healthcare regulations
- Electronic Health Records (EHR) systems (Epic, Cerner)
- Medical terminology and clinical workflows
- Patient care experience and outcomes
- Healthcare IT systems and standards (HL7, FHIR)
- Quality improvement and patient safety initiatives
```

**Healthcare Resume Tailoring:**
```
HEALTHCARE-SPECIFIC INSTRUCTIONS:
- Emphasize patient-first language and care outcomes
- Highlight compliance with healthcare regulations
- Showcase experience with medical systems and workflows
- Include certifications (nursing licenses, medical certifications)
- Focus on collaboration with clinical staff
- Mention quality metrics and patient satisfaction scores
```

---

### Finance/Banking

**Finance Keywords Focus:**
```
Additional extraction focus:
- Financial regulations and compliance (SOX, Dodd-Frank, Basel III)
- Financial systems and trading platforms
- Risk management and audit experience
- Financial modeling and analysis tools
- Certifications (CFA, CPA, Series 7)
- Quantitative analysis and statistical methods
```

**Finance Resume Tailoring:**
```
FINANCE-SPECIFIC INSTRUCTIONS:
- Emphasize accuracy, attention to detail, and risk management
- Highlight regulatory compliance experience
- Showcase financial impact with dollar amounts and percentages
- Include relevant certifications prominently
- Demonstrate analytical and problem-solving skills
- Use industry terminology (P&L, ROI, risk-adjusted returns)
```

---

### Marketing/Creative

**Marketing Keywords Focus:**
```
Additional extraction focus:
- Marketing tools and platforms (HubSpot, Salesforce, Google Analytics)
- Campaign metrics (CTR, conversion rates, ROI)
- Content creation and brand strategy
- Social media platforms and engagement metrics
- Creative software proficiency (Adobe Creative Suite)
- Growth hacking and digital marketing techniques
```

**Marketing Resume Tailoring:**
```
MARKETING-SPECIFIC INSTRUCTIONS:
- Lead with results and campaign performance metrics
- Showcase creativity and innovative thinking
- Highlight multi-channel campaign experience
- Emphasize brand storytelling and audience engagement
- Include portfolio links and campaign examples
- Use action-oriented, persuasive language
```

---

### Education/Academia

**Education Keywords Focus:**
```
Additional extraction focus:
- Teaching methodologies and pedagogical approaches
- Curriculum development and instructional design
- Educational technology and learning management systems
- Research publications and academic achievements
- Student outcomes and assessment methods
- Academic certifications and teaching licenses
```

**Education Resume Tailoring:**
```
EDUCATION-SPECIFIC INSTRUCTIONS:
- Emphasize student success and learning outcomes
- Highlight curriculum development and innovation
- Showcase community engagement and collaboration
- Include research and publications prominently
- Demonstrate commitment to continuous learning
- Use educator-friendly language and terminology
```

---

### Sales/Business Development

**Sales Keywords Focus:**
```
Additional extraction focus:
- Sales metrics (quota attainment, revenue growth, deal size)
- CRM systems (Salesforce, HubSpot)
- Sales methodologies (SPIN, Challenger, Solution Selling)
- Pipeline management and forecasting
- Client relationship building and account management
- Negotiation and closing techniques
```

**Sales Resume Tailoring:**
```
SALES-SPECIFIC INSTRUCTIONS:
- Lead with revenue numbers and quota performance (%, $)
- Highlight client acquisition and retention rates
- Showcase relationship-building and communication skills
- Emphasize consultative selling and solution-oriented approach
- Include awards and top performer recognition
- Use confident, results-driven language
```

---

## Advanced Prompt Techniques

### Few-Shot Learning Example

For better resume parsing accuracy, provide examples:

```
Here are 2 examples of correct parsing:

Example 1:
Input: "Software Engineer at Google, 2020-Present"
Output: {"company": "Google", "role": "Software Engineer", "startDate": "01/2020", "endDate": "Present", "current": true}

Example 2:
Input: "Marketing Manager | Meta | June 2019 - Dec 2021"
Output: {"company": "Meta", "role": "Marketing Manager", "startDate": "06/2019", "endDate": "12/2021", "current": false}

Now parse this resume:
{resume_text}
```

### Chain-of-Thought Prompting

For gap analysis, encourage reasoning:

```
Before providing your analysis, think through:
1. What skills does the candidate currently demonstrate?
2. Which job requirements align with their experience?
3. What gaps exist that could be filled by reframing existing work?
4. What specific improvements would make the resume stronger?

Then provide your structured JSON response.
```

### Temperature Experimentation Guide

| Task | Conservative (0.1-0.3) | Balanced (0.4-0.6) | Creative (0.7-0.9) |
|------|----------------------|-------------------|-------------------|
| Resume Parsing | ✅ Best | ⚠️ Acceptable | ❌ Too variable |
| Job Analysis | ✅ Best | ⚠️ Acceptable | ❌ Too variable |
| Resume Tailoring | ❌ Too rigid | ✅ Best | ⚠️ Acceptable |
| Gap Analysis | ⚠️ Acceptable | ✅ Best | ❌ Too creative |

---

## Troubleshooting Common Issues

### Issue 1: Resume Parsing Misses Experience

**Problem:** AI skips some work experience or education

**Solution:** Add explicit instruction:
```
IMPORTANT: Extract ALL work experience entries, even if they seem less relevant.
Include internships, contract work, and part-time positions.
```

### Issue 2: Generated Bullet Points Too Generic

**Problem:** Gap analysis suggestions lack specificity

**Solution:** Add to prompt:
```
For each suggested bullet point:
- Include specific numbers, metrics, or outcomes
- Reference actual technologies or methodologies from the resume
- Keep suggestions realistic based on the candidate's actual role
```

### Issue 3: Job Analysis Missing Industry Keywords

**Problem:** ATS keywords too generic or missing domain-specific terms

**Solution:** Add industry context:
```
Pay special attention to:
- Industry-specific jargon and acronyms
- Technical certifications mentioned
- Compliance and regulatory requirements
- Domain-specific tools and platforms
```

### Issue 4: Resume Tailoring Changes Too Much

**Problem:** Tailored resume strays too far from original

**Solution:** Add constraints:
```
STRICT RULES:
- Preserve all company names, job titles, and dates exactly as written
- Only reorder or rephrase bullet points, never add fictitious achievements
- Maintain the candidate's authentic voice and tone
- Flag any changes that significantly alter meaning for review
```

---

## API Rate Limits & Best Practices

### OpenAI Rate Limits (Tier 1)

- **gpt-4o-mini:** 200 requests/minute, 2M tokens/minute
- **gpt-4o:** 500 requests/minute, 30K tokens/minute

### Recommended Implementation

```python
import time
from functools import wraps

def rate_limit(calls_per_minute=60):
    min_interval = 60.0 / calls_per_minute
    last_called = [0.0]

    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            elapsed = time.time() - last_called[0]
            wait_time = min_interval - elapsed
            if wait_time > 0:
                time.sleep(wait_time)
            last_called[0] = time.time()
            return await func(*args, **kwargs)
        return wrapper
    return decorator

@rate_limit(calls_per_minute=50)
async def parse_resume_structure(resume_text: str):
    # Your implementation
    pass
```

---

**Last Updated:** 2026-03-10
**OpenAI Model:** gpt-4o-mini
**API Version:** 1.0
