import os
import json
from dotenv import load_dotenv
from openai import OpenAI
from app.models.schemas import StructuredResume, JobAnalysis, GapAnalysis
from app.services.mock_data import MOCK_RESUME_STRUCTURE, MOCK_JOB_ANALYSIS, MOCK_TAILORED_RESUME, MOCK_GAP_ANALYSIS

load_dotenv()

# Check if mock mode is enabled
MOCK_MODE = os.getenv("MOCK_MODE", "false").lower() == "true"

if not MOCK_MODE:
    client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
else:
    client = None

async def parse_resume_structure(resume_text: str) -> StructuredResume:
    """Parse resume text into structured format using OpenAI"""

    # Return mock data if mock mode is enabled
    if MOCK_MODE:
        mock_data = MOCK_RESUME_STRUCTURE.copy()
        mock_data["rawText"] = resume_text
        return StructuredResume(**mock_data)

    prompt = f"""Parse this resume into structured JSON format.

Resume Text:
{resume_text}

Return a JSON object with this structure:
{{
  "summary": "Professional summary or objective",
  "experience": [
    {{
      "id": "unique-id",
      "company": "Company Name",
      "role": "Job Title",
      "startDate": "MM/YYYY",
      "endDate": "MM/YYYY or Present",
      "current": boolean,
      "bullets": ["Achievement 1", "Achievement 2"]
    }}
  ],
  "education": [
    {{
      "id": "unique-id",
      "school": "University Name",
      "degree": "Degree Type",
      "field": "Field of Study",
      "startDate": "MM/YYYY",
      "endDate": "MM/YYYY",
      "gpa": "3.8 (optional)"
    }}
  ],
  "skills": [
    {{
      "id": "unique-id",
      "name": "Skill Name",
      "category": "technical" | "soft" | "language" | "tool"
    }}
  ],
  "projects": [
    {{
      "id": "unique-id",
      "name": "Project Name",
      "description": "Brief description",
      "technologies": ["Tech1", "Tech2"]
    }}
  ]
}}

Generate unique IDs for each item. Extract all relevant information accurately."""

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are an expert resume parser. Extract structured data from resumes accurately. Always return valid JSON."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
            response_format={"type": "json_object"}
        )

        content = response.choices[0].message.content
        parsed_data = json.loads(content)
        parsed_data["rawText"] = resume_text

        return StructuredResume(**parsed_data)
    except Exception as e:
        raise Exception(f"Failed to parse resume: {str(e)}")


async def analyze_job_description(job_description: str) -> JobAnalysis:
    """Analyze job description and extract key information"""

    # Return mock data if mock mode is enabled
    if MOCK_MODE:
        return JobAnalysis(**MOCK_JOB_ANALYSIS)

    prompt = f"""You are a hiring manager analyzing a job description.

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
{{
  "roleTitle": "string",
  "seniorityLevel": "string",
  "industry": "string",
  "coreResponsibilities": ["string"],
  "technicalSkills": ["string"],
  "softSkills": ["string"],
  "hiringSignals": ["string"],
  "atsKeywords": ["string"]
}}

Job description:
{job_description}"""

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are an expert hiring manager and recruiter who analyzes job descriptions. Always return valid JSON."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
            response_format={"type": "json_object"}
        )

        content = response.choices[0].message.content
        return JobAnalysis(**json.loads(content))
    except Exception as e:
        raise Exception(f"Failed to analyze job: {str(e)}")


async def tailor_resume(resume_text: str, job_description: str, job_analysis: JobAnalysis) -> str:
    """Tailor resume to match job description"""

    # Return mock data if mock mode is enabled
    if MOCK_MODE:
        return MOCK_TAILORED_RESUME

    prompt = f"""You are an expert resume writer and career coach. Your task is to tailor a resume to match a specific job description.

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
2. Rewrite the resume to highlight skills and experience that match: {', '.join(job_analysis.technicalSkills[:5])}
3. Incorporate these ATS keywords naturally: {', '.join(job_analysis.atsKeywords[:10])}
4. Emphasize accomplishments relevant to: {', '.join(job_analysis.coreResponsibilities[:3])}
5. Maintain the original resume's structure and format
6. Keep all information truthful - do not fabricate experience or skills
7. Use action verbs and quantify achievements where possible
8. Make the resume ATS-friendly and compelling for the {job_analysis.seniorityLevel} {job_analysis.roleTitle} role

Provide ONLY the tailored resume text in a clean, professional format. Do not include any explanations or meta-commentary."""

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are an expert resume writer who helps job seekers tailor their resumes to specific job descriptions. You maintain honesty while highlighting the most relevant qualifications. Format the resume professionally with clear sections."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=3000
        )

        return response.choices[0].message.content.strip()
    except Exception as e:
        raise Exception(f"Failed to tailor resume: {str(e)}")


async def analyze_resume_gaps(resume: StructuredResume, job_analysis: JobAnalysis) -> GapAnalysis:
    """Analyze gaps between resume and job requirements, suggest realistic improvements"""

    # Return mock data if mock mode is enabled
    if MOCK_MODE:
        return GapAnalysis(**MOCK_GAP_ANALYSIS)

    # Extract resume information for analysis
    resume_skills = [skill.name for skill in resume.skills]
    resume_experience_summary = "\n".join([
        f"- {exp.role} at {exp.company}: {', '.join(exp.bullets[:2])}"
        for exp in resume.experience
    ])

    prompt = f"""You are an expert career coach analyzing a resume against job requirements.

RESUME SKILLS: {', '.join(resume_skills)}

RESUME EXPERIENCE:
{resume_experience_summary}

JOB REQUIREMENTS:
- Role: {job_analysis.roleTitle} ({job_analysis.seniorityLevel})
- Industry: {job_analysis.industry}
- Required Technical Skills: {', '.join(job_analysis.technicalSkills)}
- Required Soft Skills: {', '.join(job_analysis.softSkills)}
- Core Responsibilities: {', '.join(job_analysis.coreResponsibilities)}
- ATS Keywords: {', '.join(job_analysis.atsKeywords)}

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
{{
  "missingSkills": ["skill1", "skill2"],
  "missingKeywords": ["keyword1", "keyword2"],
  "missingResponsibilities": ["responsibility1"],
  "weakAreas": [
    {{
      "area": "Leadership Quantification",
      "current": "What they currently have",
      "suggestion": "How to improve it"
    }}
  ],
  "suggestedBullets": [
    {{
      "experienceId": "exp-1",
      "experienceTitle": "Senior Engineer at CompanyX",
      "bullets": ["Bullet 1", "Bullet 2"],
      "reasoning": "Why these bullets make sense given their background"
    }}
  ]
}}"""

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are an expert career coach who helps candidates identify and fill gaps in their resumes. You never fabricate experience but help candidates better articulate what they've already done. Always return valid JSON."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.4,
            response_format={"type": "json_object"}
        )

        content = response.choices[0].message.content
        parsed_data = json.loads(content)
        return GapAnalysis(**parsed_data)
    except Exception as e:
        raise Exception(f"Failed to analyze gaps: {str(e)}")
