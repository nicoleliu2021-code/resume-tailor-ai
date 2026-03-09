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
