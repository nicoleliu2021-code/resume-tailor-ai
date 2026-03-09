from fastapi import APIRouter, HTTPException
from app.models.schemas import ParseResumeRequest, StructuredResume, TailorResumeRequest, AnalyzeGapsRequest, GapAnalysis
from app.services.openai_service import parse_resume_structure, tailor_resume, analyze_resume_gaps

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
