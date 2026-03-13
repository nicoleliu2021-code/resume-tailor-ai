import os
import json
from dotenv import load_dotenv
from openai import OpenAI
from typing import List, Dict
from app.models.schemas import StructuredResume, JobAnalysis, GapAnalysis, ChatMessage
from app.services.mock_data import MOCK_RESUME_STRUCTURE, MOCK_JOB_ANALYSIS, MOCK_TAILORED_RESUME, MOCK_GAP_ANALYSIS
from app.services.elite_prompt import ELITE_SYSTEM_PROMPT, ELITE_OPTIMIZATION_INSTRUCTIONS

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
    """Optimize the structured resume based on job analysis using elite-level optimization - returns improved structured resume"""

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

    # Build comprehensive context for elite optimization
    user_prompt = f"""Apply your elite resume optimization expertise to transform this resume for the target role.

## JOB DESCRIPTION ANALYSIS

**Target Role:** {job_analysis.roleTitle} ({job_analysis.seniorityLevel})
**Industry:** {job_analysis.industry}

**Must-Have Technical Skills:** {', '.join(job_analysis.technicalSkills[:12])}
**Key Soft Skills:** {', '.join(job_analysis.softSkills[:8])}
**Core Responsibilities:** {', '.join(job_analysis.coreResponsibilities[:6])}
**Critical ATS Keywords:** {', '.join(job_analysis.atsKeywords[:15])}
**Hiring Signals:** {', '.join(job_analysis.hiringSignals[:5])}

## CURRENT RESUME TO OPTIMIZE

**Professional Summary:**
{resume.summary}

**Professional Experience:**
{chr(10).join([f'''
{exp.role} at {exp.company}
{exp.startDate} - {exp.endDate if not exp.current else "Present"}
Current bullets:
{chr(10).join(['• ' + b for b in exp.bullets])}
''' for exp in resume.experience])}

**Current Skills:** {', '.join([skill.name for skill in resume.skills])}

**Education:** {chr(10).join([f"{edu.degree} in {edu.field} from {edu.school}" for edu in resume.education])}

## YOUR OPTIMIZATION TASK

{ELITE_OPTIMIZATION_INSTRUCTIONS}

## OUTPUT FORMAT

Return ONLY valid JSON with this exact structure:
{{
  "summary": "Elite-optimized professional summary (3-4 sentences with metrics and keywords)",
  "experience": [
    {{
      "id": "keep-original-id",
      "company": "keep-same",
      "role": "keep-same",
      "startDate": "keep-same",
      "endDate": "keep-same",
      "current": keep-same-boolean,
      "bullets": ["Transformed bullet 1 with ACTION VERB + IMPACT + METRICS + CONTEXT", "bullet 2...", ...]
    }}
  ],
  "skills": [
    {{
      "id": "original-or-new-id",
      "name": "skill name",
      "category": "technical" | "soft" | "tool" | "language"
    }}
  ],
  "education": {json.dumps([e.model_dump() for e in resume.education])},
  "projects": {json.dumps([p.model_dump() for p in resume.projects])},
  "changes": [
    "Summary: Specific change made",
    "Experience - [Company]: Specific improvements made",
    "Skills: What was added/enhanced",
    "Overall: High-level impact of optimization"
  ]
}}

CRITICAL: Every bullet must follow [ACTION VERB] + [WHAT] + [MEASURABLE IMPACT] + [BUSINESS CONTEXT] formula. No exceptions."""

    try:
        response = client.chat.completions.create(
            model="gpt-4o",  # Upgraded to full GPT-4 for elite-quality optimization
            messages=[
                {"role": "system", "content": ELITE_SYSTEM_PROMPT},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.5,  # Slightly lower for more consistent, professional output
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
    """Improve a single bullet point using elite resume optimization standards"""

    # Return mock improved bullet if mock mode is enabled
    if MOCK_MODE:
        if action == 'add-metrics':
            return f"{bullet} - achieved 35% increase in efficiency and reduced costs by $50K"
        elif action == 'rewrite':
            return f"Spearheaded {bullet.lower()} resulting in measurable business impact"
        else:  # improve
            return f"Led {bullet.lower()} driving significant results across the organization"

    # Build context
    context_parts = [f"**Experience Context:** {experience_context}"]
    if job_analysis:
        context_parts.append(f"**Target Role:** {job_analysis.roleTitle} ({job_analysis.seniorityLevel})")
        context_parts.append(f"**Key Technical Skills to Emphasize:** {', '.join(job_analysis.technicalSkills[:8])}")
        context_parts.append(f"**Critical ATS Keywords:** {', '.join(job_analysis.atsKeywords[:10])}")
        context_parts.append(f"**Core Responsibilities:** {', '.join(job_analysis.coreResponsibilities[:4])}")

    context = "\n".join(context_parts)

    # Build elite-level instruction based on action
    if action == 'add-metrics':
        instruction = """Apply elite resume standards to add powerful, specific metrics to this bullet.

**Elite Metrics Examples:**
- Percentages: "grew engagement 156%", "increased retention 34%", "reduced churn by 28%"
- Dollar amounts: "$2.3M annual revenue", "saved $450K", "$8.2M expansion"
- Scale: "500K+ users", "12 markets", "team of 15 engineers"
- Time: "within 6 months", "reduced from 5 days to 2 hours", "90-day sprint"
- Volume: "50M+ data points", "10K qualified leads", "2M transactions"

**Your Task:**
Transform the bullet using [ACTION VERB] + [WHAT YOU DID] + [MEASURABLE IMPACT] + [BUSINESS CONTEXT]

Keep metrics realistic and plausible based on the role level. Make every word count."""

    elif action == 'rewrite':
        instruction = """Completely rewrite this bullet to elite, recruiter-level quality.

**Elite Transformation Standards:**

1. **Start with a UNIQUE power verb** - Never use "Led" or "Managed"
   - Leadership: Orchestrated, Spearheaded, Championed, Directed, Pioneered
   - Achievement: Delivered, Exceeded, Accelerated, Drove, Achieved
   - Innovation: Architected, Transformed, Revolutionized, Engineered, Built
   - Collaboration: Partnered, Facilitated, Aligned, Coordinated

2. **Include ALL components:** [ACTION VERB] + [SPECIFIC ACTION] + [MEASURABLE IMPACT] + [BUSINESS CONTEXT]

3. **Add specificity:**
   - Team size, timeframe, scope, budget
   - Concrete metrics (%, $, team size, users, time saved)

4. **Under 25 words** - recruiters scan, don't read

5. **Naturally incorporate relevant ATS keywords**

**Example Transformation:**
❌ WEAK: "Worked with team to improve product features"
✅ ELITE: "Orchestrated cross-functional roadmap for 3 features with engineering and design, increasing user retention 34% and reducing churn by $2.3M annually"

Make this bullet stand out in a 6-second resume scan."""

    else:  # improve
        instruction = """Elevate this bullet to elite, world-class quality.

**Elite Enhancement Standards:**

1. **Strengthen the action verb** - Use powerful, varied verbs:
   - Spearheaded, Orchestrated, Architected, Championed, Pioneered, Transformed
   - Drove, Delivered, Exceeded, Accelerated, Established, Directed
   - NEVER repeat verbs from other bullets in this experience

2. **Apply the formula:** [ACTION VERB] + [WHAT] + [MEASURABLE IMPACT] + [BUSINESS CONTEXT]

3. **Add/enhance metrics** with:
   - Percentages (45% increase)
   - Dollar amounts ($1.2M saved)
   - Scale (500K+ users, 12 markets)
   - Time (within 90 days, 40% faster)
   - Team size (team of 8)

4. **Make it specific** - eliminate vague words like "various", "multiple", "several"

5. **Naturally incorporate ATS keywords** from the target role

6. **Keep under 25 words** for scannability

Transform this into a bullet that proves clear business impact."""

    elite_system = """You are a world-class resume optimization expert with 15+ years of experience at Fortune 500 companies and top startups. You've reviewed 50,000+ resumes and know exactly what hiring managers look for in elite candidates.

Every bullet point you create answers: "So what? What impact did this have on the business?"

You follow the strict formula: [STRONG ACTION VERB] + [WHAT YOU DID] + [MEASURABLE IMPACT] + [BUSINESS CONTEXT]

You never use weak phrases like "responsible for," "worked on," "helped with," or "assisted." You make every word count."""

    prompt = f"""{context}

**CURRENT BULLET:**
"{bullet}"

**YOUR TASK:**
{instruction}

**CRITICAL RULES:**
- Return ONLY the improved bullet point text (no quotes, no explanations)
- Must be under 25 words
- Must sound authentic and credible, never generic or AI-written
- Must include measurable impact"""

    try:
        response = client.chat.completions.create(
            model="gpt-4o",  # Upgraded for elite-quality individual bullet improvements
            messages=[
                {"role": "system", "content": elite_system},
                {"role": "user", "content": prompt}
            ],
            temperature=0.6,
            max_tokens=150
        )

        improved = response.choices[0].message.content.strip()
        # Remove quotes if AI added them
        improved = improved.strip('"').strip("'")
        return improved

    except Exception as e:
        raise Exception(f"Failed to improve bullet: {str(e)}")
