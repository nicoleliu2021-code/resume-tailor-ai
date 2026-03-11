from fastapi import APIRouter, HTTPException
from app.models.schemas import ParseResumeRequest, StructuredResume, TailorResumeRequest, AnalyzeGapsRequest, GapAnalysis, OptimizeResumeRequest, OptimizeResumeResponse, ImproveBulletRequest, ImproveBulletResponse
from app.services.openai_service import parse_resume_structure, tailor_resume, analyze_resume_gaps, optimize_resume_structure, improve_bullet_point

router = APIRouter()

@router.post("/parse", response_model=StructuredResume)
async def parse_resume(request: ParseResumeRequest):
    """Parse resume text into structured format"""
    try:
        result = await parse_resume_structure(request.resumeText)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/tailor")
async def tailor_resume_endpoint(request: TailorResumeRequest):
    """Tailor resume to match job description"""
    try:
        result = await tailor_resume(
            request.resumeText,
            request.jobDescription,
            request.jobAnalysis
        )
        return {"tailoredResume": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/analyze-gaps", response_model=GapAnalysis)
async def analyze_gaps_endpoint(request: AnalyzeGapsRequest):
    """Analyze gaps between resume and job requirements"""
    try:
        result = await analyze_resume_gaps(request.resume, request.jobAnalysis)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/optimize", response_model=OptimizeResumeResponse)
async def optimize_resume_endpoint(request: OptimizeResumeRequest):
    """Optimize resume structure based on job analysis"""
    try:
        optimized_resume, changes = await optimize_resume_structure(request.resume, request.jobAnalysis)
        return OptimizeResumeResponse(optimizedResume=optimized_resume, changes=changes)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/improve-bullet", response_model=ImproveBulletResponse)
async def improve_bullet_endpoint(request: ImproveBulletRequest):
    """Improve a single bullet point"""
    try:
        improved = await improve_bullet_point(
            bullet=request.bullet,
            action=request.action,
            experience_context=request.experienceContext,
            job_description=request.jobDescription,
            job_analysis=request.jobAnalysis
        )
        return ImproveBulletResponse(improvedBullet=improved)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
