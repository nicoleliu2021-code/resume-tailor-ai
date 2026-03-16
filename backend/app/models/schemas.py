from pydantic import BaseModel, ConfigDict
from typing import List, Optional

class Experience(BaseModel):
    id: str
    company: str
    role: str
    startDate: Optional[str] = None
    endDate: Optional[str] = None
    current: bool = False
    bullets: List[str] = []

class Education(BaseModel):
    id: str
    school: Optional[str] = None
    degree: Optional[str] = None
    field: Optional[str] = None
    startDate: Optional[str] = None
    endDate: Optional[str] = None
    gpa: Optional[str] = None

class Skill(BaseModel):
    id: str
    name: str
    category: Optional[str] = None
    proficiency: Optional[str] = None

class Project(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    technologies: List[str] = []
    url: Optional[str] = None

class StructuredResume(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    linkedin: Optional[str] = None
    location: Optional[str] = None
    summary: Optional[str] = None
    experience: List[Experience] = []
    education: List[Education] = []
    skills: List[Skill] = []
    projects: List[Project] = []
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

class BulletChange(BaseModel):
    """Detailed information about a single bullet point change"""
    bulletIndex: int
    originalBullet: str
    optimizedBullet: str
    changeType: str  # "no_change" | "enhanced" | "rewritten" | "keyword_added"
    explanation: str
    keywordsAdded: List[str]
    metricsAdded: List[str]
    confidenceScore: int  # 0-100
    fabricationRisk: str  # "none" | "low" | "medium" | "high"
    reasoning: str
    warningFlags: List[str]
    impactOnATS: Optional[str] = None

class ExperienceChanges(BaseModel):
    """Changes for a single experience entry"""
    experienceId: str
    experienceTitle: str
    company: str
    bulletChanges: List[BulletChange]

class SummaryChange(BaseModel):
    """Detailed information about summary optimization"""
    originalSummary: str
    optimizedSummary: str
    changeType: str  # "no_change" | "enhanced" | "rewritten" | "keyword_added"
    explanation: str
    keywordsAdded: List[str]
    metricsAdded: List[str]
    confidenceScore: int
    fabricationRisk: str
    reasoning: str
    warningFlags: List[str]

class OptimizationMetadata(BaseModel):
    """Overall optimization statistics and quality metrics"""
    totalBulletsChanged: int
    totalKeywordsAdded: int
    averageConfidenceScore: float
    highRiskChanges: int  # Count of high fabrication risk changes
    mediumRiskChanges: int
    blockedChanges: int  # Changes that were blocked due to high risk
    overallAuthenticityScore: int  # 0-100
    atsImprovementEstimate: int  # Estimated ATS score improvement

class OptimizeResumeResponse(BaseModel):
    optimizedResume: StructuredResume
    changes: List[str]  # Summary of changes made (backwards compatible)
    summaryChange: Optional[SummaryChange] = None
    experienceChanges: List[ExperienceChanges] = []
    metadata: Optional[OptimizationMetadata] = None

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
