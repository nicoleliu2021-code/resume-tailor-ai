import os
import json
from dotenv import load_dotenv
from openai import OpenAI
from typing import List, Dict
from app.models.schemas import (
    StructuredResume, JobAnalysis, GapAnalysis, ChatMessage,
    BulletChange, ExperienceChanges, SummaryChange, OptimizationMetadata
)
from app.services.mock_data import MOCK_RESUME_STRUCTURE, MOCK_JOB_ANALYSIS, MOCK_TAILORED_RESUME, MOCK_GAP_ANALYSIS
from app.services.elite_prompt import ELITE_SYSTEM_PROMPT, ELITE_OPTIMIZATION_INSTRUCTIONS
from app.services import structured_prompts

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
  "name": "Full Name (if present)",
  "email": "email@example.com (if present)",
  "phone": "Phone number (if present)",
  "linkedin": "LinkedIn URL (if present)",
  "location": "City, State (if present)",
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

IMPORTANT: Extract contact information (name, email, phone, linkedin, location) if present at the top of the resume.
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


async def optimize_resume_with_guardrails(resume: StructuredResume, job_analysis: JobAnalysis):
    """
    Enhanced resume optimization with detailed change tracking, fabrication risk scoring, and explanations.
    Returns structured data showing before/after for every change with confidence scores and risk assessment.
    """
    print(f"[OPTIMIZE] Starting optimization with guardrails for: {resume.name}")
    print(f"[OPTIMIZE] Target role: {job_analysis.roleTitle}")
    print(f"[OPTIMIZE] MOCK_MODE: {MOCK_MODE}")

    if MOCK_MODE:
        # Return mock data with enhanced structure
        optimized = resume.model_copy(deep=True)
        if optimized.experience and len(optimized.experience) > 0:
            first_exp = optimized.experience[0]
            if first_exp.bullets and len(first_exp.bullets) > 0:
                first_exp.bullets[0] = first_exp.bullets[0] + " - increased efficiency by 40%"

        # Mock detailed changes
        summary_change = SummaryChange(
            originalSummary=resume.summary or "",
            optimizedSummary=resume.summary or "",
            changeType="enhanced",
            explanation="Added keywords for better ATS matching",
            keywordsAdded=["leadership", "data-driven"],
            metricsAdded=[],
            confidenceScore=85,
            fabricationRisk="none",
            reasoning="High confidence, no new facts added",
            warningFlags=[]
        )

        experience_changes = []
        metadata = OptimizationMetadata(
            totalBulletsChanged=3,
            totalKeywordsAdded=5,
            averageConfidenceScore=82.0,
            highRiskChanges=0,
            mediumRiskChanges=1,
            blockedChanges=0,
            overallAuthenticityScore=88,
            atsImprovementEstimate=15
        )

        return optimized, ["Mock changes applied"], summary_change, experience_changes, metadata

    # Calculate context
    years_experience = len(resume.experience)
    current_role = resume.experience[0].role if resume.experience else "Not specified"
    demonstrated_skills = list(set([skill.name for skill in resume.skills]))
    industry = job_analysis.industry

    # Step 1: Optimize Summary
    summary_change = None
    optimized_summary = resume.summary

    if resume.summary:
        try:
            summary_prompt = structured_prompts.get_summary_optimization_prompt(
                original_summary=resume.summary,
                job_title=job_analysis.roleTitle,
                company="",
                must_have_skills=job_analysis.technicalSkills[:8],
                key_requirements=job_analysis.coreResponsibilities[:5],
                years_experience=years_experience,
                current_role=current_role,
                demonstrated_skills=demonstrated_skills,
                industry=industry
            )

            response = client.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {"role": "system", "content": ELITE_SYSTEM_PROMPT},
                    {"role": "user", "content": summary_prompt}
                ],
                temperature=0.3,
                response_format={"type": "json_object"}
            )

            summary_data = json.loads(response.choices[0].message.content)
            summary_change = SummaryChange(**summary_data)

            # Use optimized summary if not marked as KEEP_ORIGINAL
            if summary_change.optimizedSummary != "KEEP_ORIGINAL":
                optimized_summary = summary_change.optimizedSummary

        except Exception as e:
            print(f"Summary optimization error: {str(e)}")
            # Keep original if optimization fails
            pass

    # Step 2: Optimize Experience Bullets
    experience_changes_list = []
    optimized_experience = []

    for exp in resume.experience:
        # Calculate role level
        role_title_lower = exp.role.lower()
        if any(word in role_title_lower for word in ['senior', 'lead', 'principal', 'staff']):
            role_level = 'senior'
        elif any(word in role_title_lower for word in ['junior', 'associate', 'entry']):
            role_level = 'junior'
        else:
            role_level = 'mid'

        # Calculate years in role
        try:
            from datetime import datetime
            start = datetime.strptime(exp.startDate, "%m/%Y")
            if exp.current:
                end = datetime.now()
            else:
                end = datetime.strptime(exp.endDate, "%m/%Y")
            years_in_role = (end - start).days / 365.25
        except:
            years_in_role = 1.0

        try:
            bullet_prompt = structured_prompts.get_bullet_optimization_prompt(
                job_role=exp.role,
                company=exp.company,
                start_date=exp.startDate,
                end_date=exp.endDate,
                is_current=exp.current,
                bullets=exp.bullets,
                target_job_title=job_analysis.roleTitle,
                must_have_skills=job_analysis.technicalSkills[:10],
                key_responsibilities=job_analysis.coreResponsibilities[:5],
                ats_keywords=job_analysis.atsKeywords[:15],
                role_level=role_level,
                years_in_role=years_in_role,
                industry=industry
            )

            response = client.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {"role": "system", "content": ELITE_SYSTEM_PROMPT},
                    {"role": "user", "content": bullet_prompt}
                ],
                temperature=0.3,
                response_format={"type": "json_object"}
            )

            bullets_response = json.loads(response.choices[0].message.content)

            # Handle response - might be array directly or wrapped in object
            if isinstance(bullets_response, list):
                bullets_data = bullets_response
            elif 'bullets' in bullets_response:
                bullets_data = bullets_response['bullets']
            elif 'bulletChanges' in bullets_response:
                bullets_data = bullets_response['bulletChanges']
            else:
                # Assume it's wrapped in an object, take first array value
                bullets_data = next((v for v in bullets_response.values() if isinstance(v, list)), [])

            bullet_changes = [BulletChange(**b) for b in bullets_data]

            # Build optimized bullets
            optimized_bullets = []
            for change in bullet_changes:
                if change.optimizedBullet == "KEEP_ORIGINAL" or change.changeType == "no_change":
                    optimized_bullets.append(change.originalBullet)
                else:
                    optimized_bullets.append(change.optimizedBullet)

            # Store experience changes
            exp_change = ExperienceChanges(
                experienceId=exp.id,
                experienceTitle=exp.role,
                company=exp.company,
                bulletChanges=bullet_changes
            )
            experience_changes_list.append(exp_change)

            # Create optimized experience entry
            optimized_exp = exp.model_copy(deep=True)
            optimized_exp.bullets = optimized_bullets
            optimized_experience.append(optimized_exp)

        except Exception as e:
            print(f"Bullet optimization error for {exp.company}: {str(e)}")
            import traceback
            traceback.print_exc()
            # Keep original if optimization fails
            optimized_experience.append(exp.model_copy(deep=True))
            # Add empty change tracking for this experience
            experience_changes_list.append(ExperienceChanges(
                experienceId=exp.id,
                experienceTitle=exp.role,
                company=exp.company,
                bulletChanges=[]
            ))

    # Step 3: Calculate Metadata
    total_bullets_changed = sum(
        len([bc for bc in exp.bulletChanges if bc.changeType != "no_change"])
        for exp in experience_changes_list
    )

    all_bullet_changes = [bc for exp in experience_changes_list for bc in exp.bulletChanges]
    total_keywords_added = sum(len(bc.keywordsAdded) for bc in all_bullet_changes)

    if all_bullet_changes:
        avg_confidence = sum(bc.confidenceScore for bc in all_bullet_changes) / len(all_bullet_changes)
    else:
        avg_confidence = 0.0

    high_risk_count = sum(1 for bc in all_bullet_changes if bc.fabricationRisk == "high")
    medium_risk_count = sum(1 for bc in all_bullet_changes if bc.fabricationRisk == "medium")
    blocked_count = sum(1 for bc in all_bullet_changes if bc.fabricationRisk == "high" and bc.optimizedBullet == "KEEP_ORIGINAL")

    # Estimate authenticity score (higher is better)
    authenticity_score = 100
    if high_risk_count > 0:
        authenticity_score -= high_risk_count * 15
    if medium_risk_count > 0:
        authenticity_score -= medium_risk_count * 5
    authenticity_score = max(0, min(100, authenticity_score))

    # Estimate ATS improvement
    ats_improvement = min(25, total_keywords_added * 2)

    metadata = OptimizationMetadata(
        totalBulletsChanged=total_bullets_changed,
        totalKeywordsAdded=total_keywords_added,
        averageConfidenceScore=round(avg_confidence, 1),
        highRiskChanges=high_risk_count,
        mediumRiskChanges=medium_risk_count,
        blockedChanges=blocked_count,
        overallAuthenticityScore=authenticity_score,
        atsImprovementEstimate=ats_improvement
    )

    # Build optimized resume
    optimized_resume = resume.model_copy(deep=True)
    optimized_resume.summary = optimized_summary
    optimized_resume.experience = optimized_experience

    # Generate summary of changes (backwards compatible)
    changes_summary = []
    if summary_change and summary_change.changeType != "no_change":
        changes_summary.append(f"Summary: {summary_change.changeType} - {len(summary_change.keywordsAdded)} keywords added")

    for exp_change in experience_changes_list:
        changed_bullets = [bc for bc in exp_change.bulletChanges if bc.changeType != "no_change"]
        if changed_bullets:
            changes_summary.append(
                f"{exp_change.company}: {len(changed_bullets)} bullets optimized"
            )

    if metadata.totalKeywordsAdded > 0:
        changes_summary.append(f"Total keywords added: {metadata.totalKeywordsAdded}")

    if metadata.highRiskChanges > 0:
        changes_summary.append(f"⚠️ {metadata.highRiskChanges} high-risk changes flagged for review")

    print(f"[OPTIMIZE] Optimization complete!")
    print(f"[OPTIMIZE] Total changes: {len(changes_summary)}")
    print(f"[OPTIMIZE] Bullets changed: {metadata.totalBulletsChanged}")
    print(f"[OPTIMIZE] Keywords added: {metadata.totalKeywordsAdded}")
    print(f"[OPTIMIZE] Authenticity score: {metadata.overallAuthenticityScore}/100")

    return optimized_resume, changes_summary, summary_change, experience_changes_list, metadata


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

        # Preserve original contact info and rawText
        parsed_data['name'] = resume.name
        parsed_data['email'] = resume.email
        parsed_data['phone'] = resume.phone
        parsed_data['linkedin'] = resume.linkedin
        parsed_data['location'] = resume.location
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


async def get_job_recommendations(
    resume: StructuredResume,
    current_job: JobAnalysis,
    match_score: int
) -> Dict:
    """
    Generate alternative job recommendations when current match score is low.
    Uses AI to suggest better-fit roles based on user's skills and experience.
    """

    # Return mock data if mock mode is enabled
    if MOCK_MODE:
        return {
            "recommendations": [
                {
                    "title": "Senior Frontend Engineer",
                    "reason": "Your React and TypeScript skills are a perfect match",
                    "matchScore": 85,
                    "keywords": ["React", "TypeScript", "JavaScript", "CSS", "Redux"]
                },
                {
                    "title": "Full Stack Developer",
                    "reason": "Your combination of frontend and backend experience aligns well",
                    "matchScore": 80,
                    "keywords": ["Node.js", "React", "PostgreSQL", "API Design"]
                }
            ],
            "reasoning": "These roles better match your core technical skills and experience level."
        }

    # Extract user's top skills and experience
    top_skills = [skill.name for skill in resume.skills[:15]]
    experience_summary = "\n".join([
        f"- {exp.role} at {exp.company} ({exp.startDate} - {exp.endDate})"
        for exp in resume.experience[:3]
    ])

    prompt = f"""You are a career advisor analyzing why a candidate has a LOW match score ({match_score}%) with their target role.

## CANDIDATE PROFILE

**Recent Experience:**
{experience_summary}

**Top Skills:**
{', '.join(top_skills)}

**Education:**
{', '.join([f"{edu.degree} in {edu.field}" for edu in resume.education])}

## CURRENT TARGET ROLE (LOW MATCH)

**Role:** {current_job.roleTitle}
**Seniority:** {current_job.seniorityLevel}
**Industry:** {current_job.industry}
**Required Skills:** {', '.join(current_job.technicalSkills[:10])}
**Key Responsibilities:** {', '.join(current_job.coreResponsibilities[:5])}

**Match Score:** {match_score}/100 ⚠️ (Below threshold)

## YOUR TASK

Recommend 3-5 alternative job titles/roles that would be a BETTER fit for this candidate based on their actual skills and experience.

For each recommendation, provide:
1. **Job Title** - Specific role name (e.g., "Senior Product Manager", "DevOps Engineer")
2. **Match Reason** - WHY this role is a better fit (be specific about skill alignment)
3. **Estimated Match Score** - Realistic score 70-95% based on their profile
4. **Key Keywords** - 4-6 critical skills/keywords for this role

**IMPORTANT GUIDELINES:**
- Recommend roles at appropriate seniority level (don't overshoot or undershoot)
- Focus on roles that match their PROVEN skills and experience
- Consider adjacent roles that leverage their existing strengths
- Be realistic about match scores (70-85% is realistic, 95%+ is unrealistic)
- Prioritize roles where they can succeed immediately

Return ONLY valid JSON in this format:
{{
  "recommendations": [
    {{
      "title": "Specific Job Title",
      "reason": "Why this role matches their skills better (be specific)",
      "matchScore": 75,
      "keywords": ["Skill1", "Skill2", "Skill3", "Skill4"]
    }}
  ],
  "reasoning": "1-2 sentence summary of why these alternatives were recommended over the current low-match role"
}}"""

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",  # Cost-efficient for recommendations
            messages=[
                {
                    "role": "system",
                    "content": "You are an expert career advisor who helps candidates find roles that match their actual skills and experience. You give realistic, actionable recommendations."
                },
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            response_format={"type": "json_object"}
        )

        content = response.choices[0].message.content
        result = json.loads(content)

        # Validate and cap recommendations at 5
        if len(result.get('recommendations', [])) > 5:
            result['recommendations'] = result['recommendations'][:5]

        return result

    except Exception as e:
        raise Exception(f"Failed to generate job recommendations: {str(e)}")
