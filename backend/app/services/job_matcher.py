"""
Job Matching Service
Implements relevance scoring algorithm to match resumes with jobs
"""

from typing import List, Dict, Tuple
from app.models.schemas import StructuredResume, JobTemplate, JobMatch
from app.services.job_templates import JOB_TEMPLATES


def calculate_years_of_experience(resume: StructuredResume) -> int:
    """Calculate total years of experience from resume"""
    if not resume.experience:
        return 0

    # Simple heuristic: count number of experiences
    # More sophisticated version would parse dates
    return len(resume.experience) * 2  # Assume average 2 years per role


def extract_job_titles(resume: StructuredResume) -> List[str]:
    """Extract all job titles from resume"""
    return [exp.role.lower() for exp in resume.experience]


def extract_skills(resume: StructuredResume) -> List[str]:
    """Extract all skills from resume"""
    return [skill.name.lower() for skill in resume.skills]


def calculate_title_match(resume_titles: List[str], job_title: str) -> float:
    """
    Calculate how well resume titles match job title
    Returns score 0-40
    """
    job_title_lower = job_title.lower()

    # Direct match: job title appears in resume
    for resume_title in resume_titles:
        if job_title_lower in resume_title or resume_title in job_title_lower:
            return 40.0

        # Partial match: key words overlap
        job_keywords = set(job_title_lower.split())
        resume_keywords = set(resume_title.split())
        overlap = job_keywords.intersection(resume_keywords)

        if len(overlap) >= 2:  # At least 2 words match
            return 30.0
        elif len(overlap) == 1:  # 1 word matches
            return 15.0

    return 0.0


def calculate_skill_match(resume_skills: List[str], required_skills: List[str]) -> float:
    """
    Calculate skill overlap
    Returns score 0-30
    """
    if not required_skills:
        return 15.0  # Neutral score if no required skills listed

    resume_skills_set = set(resume_skills)
    required_skills_set = set([s.lower() for s in required_skills])

    matched_skills = resume_skills_set.intersection(required_skills_set)
    match_ratio = len(matched_skills) / len(required_skills_set)

    return match_ratio * 30.0


def calculate_seniority_match(resume: StructuredResume, job_seniority: str) -> float:
    """
    Calculate if resume seniority matches job seniority
    Returns score 0-15
    """
    years_exp = calculate_years_of_experience(resume)

    # Map years to seniority
    if years_exp <= 2:
        resume_seniority = "junior"
    elif years_exp <= 5:
        resume_seniority = "mid"
    elif years_exp <= 9:
        resume_seniority = "senior"
    else:
        resume_seniority = "lead"

    # Exact match
    if resume_seniority == job_seniority:
        return 15.0

    # Adjacent levels (within 1 level)
    seniority_order = ["junior", "mid", "senior", "lead", "executive"]
    try:
        resume_idx = seniority_order.index(resume_seniority)
        job_idx = seniority_order.index(job_seniority)

        if abs(resume_idx - job_idx) == 1:
            return 10.0  # Adjacent level
        elif abs(resume_idx - job_idx) == 2:
            return 5.0   # 2 levels apart
    except ValueError:
        pass

    return 0.0


def calculate_industry_match(resume: StructuredResume, job_industry: str) -> float:
    """
    Calculate industry alignment
    Returns score 0-10
    """
    # Simple heuristic: check if job industry keywords appear in resume
    resume_text = " ".join([exp.company.lower() for exp in resume.experience])
    resume_text += " " + resume.summary.lower()

    industry_keywords = {
        "saas": ["saas", "software", "cloud", "platform"],
        "fintech": ["fintech", "financial", "banking", "payments"],
        "tech": ["tech", "software", "engineering", "startup"],
        "enterprise software": ["enterprise", "b2b", "corporate"],
        "finance": ["finance", "banking", "investment"]
    }

    job_industry_lower = job_industry.lower()
    if job_industry_lower in industry_keywords:
        keywords = industry_keywords[job_industry_lower]
        for keyword in keywords:
            if keyword in resume_text:
                return 10.0

    # Partial match
    if job_industry_lower in resume_text:
        return 7.0

    return 0.0


def calculate_tool_match(resume: StructuredResume, job_tools: List[str]) -> float:
    """
    Calculate tool/technology overlap
    Returns score 0-5
    """
    if not job_tools:
        return 2.5  # Neutral

    # Extract tools from resume (from skills and experience bullets)
    resume_tools = set()
    for skill in resume.skills:
        resume_tools.add(skill.name.lower())

    for exp in resume.experience:
        for bullet in exp.bullets:
            resume_tools.add(bullet.lower())

    job_tools_set = set([t.lower() for t in job_tools])
    matched_tools = 0

    for job_tool in job_tools_set:
        for resume_tool in resume_tools:
            if job_tool in resume_tool or resume_tool in job_tool:
                matched_tools += 1
                break

    if not job_tools:
        return 2.5

    match_ratio = matched_tools / len(job_tools_set)
    return match_ratio * 5.0


def calculate_fit_score(resume: StructuredResume, job: Dict) -> float:
    """
    Calculate overall fit score (0-100)

    Formula:
    - Title Match: 40%
    - Skill Match: 30%
    - Seniority Match: 15%
    - Industry Match: 10%
    - Tool Match: 5%
    """
    resume_titles = extract_job_titles(resume)
    resume_skills = extract_skills(resume)

    title_score = calculate_title_match(resume_titles, job["title"])
    skill_score = calculate_skill_match(resume_skills, job["requiredSkills"])
    seniority_score = calculate_seniority_match(resume, job["seniorityLevel"])
    industry_score = calculate_industry_match(resume, job["industry"])
    tool_score = calculate_tool_match(resume, job["tools"])

    total_score = title_score + skill_score + seniority_score + industry_score + tool_score

    return min(100.0, total_score)


def generate_match_reasons(resume: StructuredResume, job: Dict, fit_score: float) -> List[str]:
    """Generate human-readable reasons for why this job matches"""
    reasons = []

    resume_titles = extract_job_titles(resume)
    resume_skills = extract_skills(resume)
    years_exp = calculate_years_of_experience(resume)

    # Title match
    job_title_lower = job["title"].lower()
    for resume_title in resume_titles:
        if job_title_lower in resume_title or resume_title in job_title_lower:
            reasons.append(f"Matches your {resume_title.title()} experience")
            break

    # Skills match
    resume_skills_set = set(resume_skills)
    required_skills_set = set([s.lower() for s in job["requiredSkills"]])
    matched_skills = resume_skills_set.intersection(required_skills_set)

    if matched_skills:
        skill_list = ", ".join(list(matched_skills)[:3])
        reasons.append(f"You have required skills: {skill_list}")

    # Seniority/Years of experience
    job_years = job["yearsOfExperience"]
    if years_exp >= job_years:
        reasons.append(f"Requires {job_years}+ YOE (You have ~{years_exp})")
    elif years_exp >= job_years - 2:
        reasons.append(f"Close to required {job_years} YOE (You have ~{years_exp})")

    # Tools
    resume_tools = set([s.name.lower() for s in resume.skills])
    job_tools_set = set([t.lower() for t in job.get("tools", [])])
    matched_tools = resume_tools.intersection(job_tools_set)

    if matched_tools:
        tool_list = ", ".join(list(matched_tools)[:2])
        reasons.append(f"Familiar with: {tool_list}")

    # If not many reasons, add generic ones
    if len(reasons) < 2:
        if fit_score >= 70:
            reasons.append("Strong overall profile match")
        elif fit_score >= 60:
            reasons.append("Good foundational skills for this role")

    return reasons[:3]  # Return top 3 reasons


def find_missing_skills(resume: StructuredResume, job: Dict) -> List[str]:
    """Identify skills user is missing for this job"""
    resume_skills = set(extract_skills(resume))
    required_skills = set([s.lower() for s in job["requiredSkills"]])

    missing = required_skills - resume_skills
    return list(missing)[:3]  # Return top 3 missing skills


def determine_match_type(fit_score: float) -> str:
    """Determine if job is direct match, stretch, or adjacent"""
    if fit_score >= 85:
        return "direct"
    elif fit_score >= 70:
        return "stretch"
    else:
        return "adjacent"


def match_jobs(resume: StructuredResume, limit: int = 5, min_score: float = 60.0) -> List[JobMatch]:
    """
    Match resume against all job templates
    Returns top N jobs sorted by fit score
    """
    matches = []

    for job_data in JOB_TEMPLATES:
        fit_score = calculate_fit_score(resume, job_data)

        # Only include jobs above minimum score
        if fit_score < min_score:
            continue

        # Create JobTemplate object
        job_template = JobTemplate(**job_data)

        # Generate match details
        match_reasons = generate_match_reasons(resume, job_data, fit_score)
        missing_skills = find_missing_skills(resume, job_data)
        match_type = determine_match_type(fit_score)

        # Create JobMatch object
        job_match = JobMatch(
            job=job_template,
            fitScore=int(fit_score),
            matchReasons=match_reasons,
            missingSkills=missing_skills,
            matchType=match_type
        )

        matches.append(job_match)

    # Sort by fit score (highest first)
    matches.sort(key=lambda x: x.fitScore, reverse=True)

    # Return top N matches
    return matches[:limit]
