import os
import json
from dotenv import load_dotenv
from openai import OpenAI
from typing import List, Dict
from app.models.schemas import StructuredResume, JobAnalysis, GapAnalysis, ChatMessage
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

BULLET POINT QUALITY RULES:
- AVOID repetitive action verbs - vary your verbs (Led, Drove, Spearheaded, Architected, Established, Pioneered, Orchestrated, Championed, etc.)
- DO NOT duplicate similar experiences - each bullet should be unique and cover different aspects
- Each bullet should tell a different story or highlight a distinct achievement
- Vary sentence structure and approach (metrics-first, outcome-first, method-first)
- Use diverse power verbs: achievement verbs (Achieved, Delivered, Exceeded), leadership verbs (Directed, Guided, Mentored), innovation verbs (Pioneered, Transformed, Revolutionized), collaboration verbs (Partnered, Aligned, Facilitated)

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


async def chat_assistant(
    user_message: str,
    resume_text: str = None,
    job_description: str = None,
    job_analysis: JobAnalysis = None,
    chat_history: List[Dict] = None
) -> str:
    """Chat with AI assistant about resume optimization"""

    # Return mock response if mock mode is enabled
    if MOCK_MODE:
        return "This is a mock response. In production, I'll provide personalized advice based on your resume and job description. Try asking about specific sections like experience, skills, or how to quantify achievements!"

    # Build context about the resume and job
    context_parts = []

    if resume_text:
        context_parts.append(f"USER'S RESUME:\n{resume_text[:2000]}")  # Limit to avoid token limits

    if job_description:
        context_parts.append(f"\nTARGET JOB DESCRIPTION:\n{job_description[:1500]}")

    if job_analysis:
        context_parts.append(f"\nKEY JOB REQUIREMENTS:")
        context_parts.append(f"- Role: {job_analysis.roleTitle}")
        context_parts.append(f"- Skills needed: {', '.join(job_analysis.technicalSkills[:8])}")
        context_parts.append(f"- Important keywords: {', '.join(job_analysis.atsKeywords[:10])}")

    context = "\n".join(context_parts)

    # Build system prompt
    system_prompt = """You are an expert resume coach and career advisor. You help job seekers optimize their resumes for specific positions.

Your role:
- Provide specific, actionable advice based on the user's actual resume and target job
- Help rewrite bullet points to be more impactful with action verbs and metrics
- Identify missing keywords and suggest how to naturally incorporate them
- Give honest feedback on weak areas and how to strengthen them
- Keep responses concise, practical, and encouraging

Guidelines:
- Always reference specific content from their resume when giving advice
- Suggest realistic improvements based on what they already have
- Never fabricate experience or skills
- Use bullet points and formatting for clarity
- Be supportive and constructive"""

    # Build messages for the API
    messages = [{"role": "system", "content": system_prompt}]

    # Add context as first message if available
    if context:
        messages.append({
            "role": "system",
            "content": f"Context for this conversation:\n{context}"
        })

    # Add chat history
    if chat_history:
        for msg in chat_history[-6:]:  # Keep last 6 messages for context
            messages.append({
                "role": msg.get("role"),
                "content": msg.get("content")
            })

    # Add current user message
    messages.append({"role": "user", "content": user_message})

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=messages,
            temperature=0.7,
            max_tokens=500
        )

        return response.choices[0].message.content.strip()
    except Exception as e:
        raise Exception(f"Failed to get chat response: {str(e)}")


async def optimize_resume_structure(resume: StructuredResume, job_analysis: JobAnalysis):
    """Optimize the structured resume based on job analysis - returns improved structured resume"""

    # Return mock optimized resume if mock mode is enabled
    if MOCK_MODE:
        # Just add some mock changes
        optimized = resume.model_copy(deep=True)
        if optimized.experience and len(optimized.experience) > 0:
            # Add metrics to first bullet if missing
            first_exp = optimized.experience[0]
            if first_exp.bullets and len(first_exp.bullets) > 0:
                first_exp.bullets[0] = first_exp.bullets[0] + " - increased efficiency by 40%"

        changes = [
            "Added metrics to experience bullets",
            "Incorporated ATS keywords from job description",
            "Strengthened action verbs in experience section"
        ]
        return optimized, changes

    # Build optimization prompt
    prompt = f"""You are an expert resume optimizer. Optimize this resume for the target job by improving bullets, summary, and skills while keeping all information truthful.

TARGET JOB:
- Role: {job_analysis.roleTitle} ({job_analysis.seniorityLevel})
- Industry: {job_analysis.industry}
- Required Skills: {', '.join(job_analysis.technicalSkills[:10])}
- ATS Keywords: {', '.join(job_analysis.atsKeywords[:10])}
- Core Responsibilities: {', '.join(job_analysis.coreResponsibilities[:5])}

CURRENT RESUME:
Summary: {resume.summary}

Experience:
{chr(10).join([f"- {exp.role} at {exp.company}: {chr(10).join(['  * ' + b for b in exp.bullets])}" for exp in resume.experience])}

Skills: {', '.join([skill.name for skill in resume.skills])}

OPTIMIZATION INSTRUCTIONS:
1. Improve the professional summary to align with the {job_analysis.roleTitle} role
2. Enhance each experience bullet point by:
   - Adding metrics where plausible based on the role
   - Incorporating relevant ATS keywords naturally: {', '.join(job_analysis.atsKeywords[:8])}
   - Using stronger action verbs (Led, Drove, Architected, etc.)
   - Emphasizing accomplishments that match: {', '.join(job_analysis.coreResponsibilities[:3])}
3. Add missing technical skills from requirements if applicable: {', '.join([s for s in job_analysis.technicalSkills if s not in [skill.name for skill in resume.skills]][:5])}
4. Keep all changes realistic and truthful - only extrapolate what's reasonable from existing experience
5. Maintain the exact structure with same IDs

CRITICAL QUALITY REQUIREMENTS:
- VARY ACTION VERBS: Don't repeat "Led" or "Managed" in multiple bullets. Use diverse verbs: Spearheaded, Orchestrated, Championed, Architected, Pioneered, Drove, Directed, Established, Transformed, Delivered, Executed, etc.
- AVOID DUPLICATE EXPERIENCES: Each bullet should highlight a DIFFERENT achievement or responsibility
- ENSURE UNIQUENESS: No two bullets should tell the same story or use similar phrasing
- MIX SENTENCE STRUCTURES: Vary how you start bullets (action verb, metric-first, outcome-first)
- BE SPECIFIC: Generic bullets like "Led team to deliver project" are too vague - add specifics about what, how, and impact

Return JSON with:
{{
  "summary": "optimized professional summary",
  "experience": [
    {{
      "id": "same-id-as-input",
      "company": "same",
      "role": "same",
      "startDate": "same",
      "endDate": "same",
      "current": same,
      "bullets": ["optimized bullet 1", "optimized bullet 2", ...]
    }}
  ],
  "skills": [
    {{
      "id": "same-or-new-for-added",
      "name": "skill name",
      "category": "technical/soft/tool"
    }}
  ],
  "education": {json.dumps([e.model_dump() for e in resume.education])},
  "projects": {json.dumps([p.model_dump() for p in resume.projects])},
  "changes": ["Summary: Added focus on X", "Experience 1: Added metric about Y", "Skills: Added Z"]
}}"""

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are an expert resume optimizer who improves resumes for specific jobs while keeping all information truthful. Always return valid JSON."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.6,
            response_format={"type": "json_object"}
        )

        content = response.choices[0].message.content
        parsed_data = json.loads(content)

        # Extract changes list
        changes = parsed_data.pop('changes', [])

        # Keep original rawText
        parsed_data['rawText'] = resume.rawText

        optimized_resume = StructuredResume(**parsed_data)
        return optimized_resume, changes

    except Exception as e:
        raise Exception(f"Failed to optimize resume: {str(e)}")


async def improve_bullet_point(
    bullet: str,
    action: str,
    experience_context: str,
    job_description: str = None,
    job_analysis: JobAnalysis = None
) -> str:
    """Improve a single bullet point based on action type"""

    # Return mock improved bullet if mock mode is enabled
    if MOCK_MODE:
        if action == 'add-metrics':
            return f"{bullet} - achieved 35% increase in efficiency and reduced costs by $50K"
        elif action == 'rewrite':
            return f"Spearheaded {bullet.lower()} resulting in measurable business impact"
        else:  # improve
            return f"Led {bullet.lower()} driving significant results across the organization"

    # Build context
    context_parts = []
    if job_analysis:
        context_parts.append(f"Target Role: {job_analysis.roleTitle}")
        context_parts.append(f"Key Skills: {', '.join(job_analysis.technicalSkills[:8])}")
        context_parts.append(f"ATS Keywords: {', '.join(job_analysis.atsKeywords[:8])}")

    context = "\n".join(context_parts) if context_parts else ""

    # Build prompt based on action
    if action == 'add-metrics':
        instruction = """Add quantifiable metrics to this bullet point. Make it measurable and impactful.
Examples:
- Add percentages (increased by 40%)
- Add dollar amounts ($2M revenue)
- Add team sizes (team of 8)
- Add time savings (reduced from 5 days to 2 days)
Keep the improvement realistic based on the role."""

    elif action == 'rewrite':
        instruction = """Completely rewrite this bullet point to be more impactful.
- Start with a UNIQUE action verb - avoid overused ones like "Led" or "Managed". Try: Orchestrated, Spearheaded, Architected, Championed, Pioneered, Transformed, Delivered, Executed, Established, Drove, Directed
- Focus on achievements and results, not just tasks
- Make it concise and powerful (1-2 lines max)
- Include metrics if the original has any
- Naturally incorporate relevant keywords
- Make it stand out from typical resume bullets"""

    else:  # improve
        instruction = """Improve this bullet point by:
- Using a stronger action verb if needed (AVOID overused verbs like "Led" or "Managed" - use Spearheaded, Orchestrated, Architected, Championed, Drove, Pioneered, etc.)
- Making the language more impactful and professional
- Adding or enhancing any metrics present
- Ensuring it highlights achievements over responsibilities
- Incorporating relevant keywords naturally
- Making it distinct from typical resume bullets - be specific and unique"""

    prompt = f"""You are an expert resume writer.

CONTEXT:
{experience_context}

{context}

CURRENT BULLET:
"{bullet}"

TASK:
{instruction}

Return ONLY the improved bullet point text. No explanations or meta-commentary."""

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are an expert resume writer who creates impactful, ATS-friendly bullet points. Always be concise and professional."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=150
        )

        improved = response.choices[0].message.content.strip()
        # Remove quotes if AI added them
        improved = improved.strip('"').strip("'")
        return improved

    except Exception as e:
        raise Exception(f"Failed to improve bullet: {str(e)}")
