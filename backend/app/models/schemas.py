from pydantic import BaseModel, ConfigDict
from typing import List, Optional

class Experience(BaseModel):
    id: str
    company: str
    role: str
    startDate: str
    endDate: str
    current: bool
    bullets: List[str]

class Education(BaseModel):
    id: str
    school: str
    degree: str
    field: str
    startDate: str
    endDate: str
    gpa: Optional[str] = None

class Skill(BaseModel):
    id: str
    name: str
    category: str
    proficiency: Optional[str] = None

class Project(BaseModel):
    id: str
    name: str
    description: str
    technologies: List[str]
    url: Optional[str] = None

class StructuredResume(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    linkedin: Optional[str] = None
    location: Optional[str] = None
    summary: str
    experience: List[Experience]
    education: List[Education]
    skills: List[Skill]
    projects: List[Project]
    rawText: Optional[str] = None

class JobAnalysis(BaseModel):
    roleTitle: str
    seniorityLevel: str
    industry: str
    coreResponsibilities: List[str]
    technicalSkills: List[str]
    softSkills: List[str]
    hiringSignals: List[str]
    atsKeywords: List[str]

class ParseResumeRequest(BaseModel):
    resumeText: str

class AnalyzeJobRequest(BaseModel):
    jobDescription: str

class TailorResumeRequest(BaseModel):
    resumeText: str
    jobDescription: str
    jobAnalysis: JobAnalysis

class WeakArea(BaseModel):
    area: str
    current: str
    suggestion: str

class SuggestedBullet(BaseModel):
    experienceId: str
    experienceTitle: str
    bullets: List[str]
    reasoning: str

class GapAnalysis(BaseModel):
    missingSkills: List[str]
    missingKeywords: List[str]
    missingResponsibilities: List[str]
    weakAreas: List[WeakArea]
    suggestedBullets: List[SuggestedBullet]

class AnalyzeGapsRequest(BaseModel):
    resume: StructuredResume
    jobAnalysis: JobAnalysis

class FetchJobUrlRequest(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    url: str

class ChatMessage(BaseModel):
    role: str  # 'user' or 'assistant'
    content: str

class ChatRequest(BaseModel):
    message: str
    resumeText: Optional[str] = None
    jobDescription: Optional[str] = None
    jobAnalysis: Optional[JobAnalysis] = None
    chatHistory: Optional[List[ChatMessage]] = []

class ChatResponse(BaseModel):
    message: str

class OptimizeResumeRequest(BaseModel):
    resume: StructuredResume
    jobAnalysis: JobAnalysis

class OptimizeResumeResponse(BaseModel):
    optimizedResume: StructuredResume
    changes: List[str]  # Summary of changes made

class ImproveBulletRequest(BaseModel):
    bullet: str
    action: str  # 'improve', 'add-metrics', 'rewrite'
    experienceContext: str  # Role and company for context
    jobDescription: Optional[str] = None
    jobAnalysis: Optional[JobAnalysis] = None

class ImproveBulletResponse(BaseModel):
    improvedBullet: str

class RecommendedJob(BaseModel):
    title: str
    reason: str
    matchScore: int  # Estimated match score 0-100
    keywords: List[str]  # Key skills/keywords for this role

class JobRecommendationsRequest(BaseModel):
    resume: StructuredResume
    currentJobAnalysis: JobAnalysis
    currentMatchScore: int  # Current match score to understand the gap

class JobRecommendationsResponse(BaseModel):
    recommendations: List[RecommendedJob]
    reasoning: str  # Why these alternatives were recommended

# Job Discovery Schemas (Proactive Feature)
class JobTemplate(BaseModel):
    id: str
    title: str
    company: str
    location: str
    remote: bool
    description: str
    requiredSkills: List[str]
    preferredSkills: List[str]
    yearsOfExperience: int
    seniorityLevel: str  # "junior", "mid", "senior", "lead", "executive"
    industry: str
    tools: List[str]
    salary: Optional[str] = None
    jobUrl: Optional[str] = None

class JobMatch(BaseModel):
    job: JobTemplate
    fitScore: int  # 0-100
    matchReasons: List[str]  # Why this job matches
    missingSkills: List[str]  # Skills user doesn't have
    matchType: str  # "direct", "stretch", "adjacent"

class JobDiscoveryRequest(BaseModel):
    resume: StructuredResume

class JobDiscoveryResponse(BaseModel):
    jobs: List[JobMatch]
    totalFound: int
