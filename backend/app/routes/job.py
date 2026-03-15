from fastapi import APIRouter, HTTPException
from app.models.schemas import (
    AnalyzeJobRequest,
    JobAnalysis,
    FetchJobUrlRequest,
    JobRecommendationsRequest,
    JobRecommendationsResponse,
    RecommendedJob,
    JobDiscoveryRequest,
    JobDiscoveryResponse
)
from app.services.openai_service import analyze_job_description, get_job_recommendations
from app.services.job_matcher import match_jobs
import requests
from bs4 import BeautifulSoup

router = APIRouter()

@router.post("/analyze", response_model=JobAnalysis)
async def analyze_job(request: AnalyzeJobRequest):
    """Analyze job description and extract key information"""
    try:
        result = await analyze_job_description(request.jobDescription)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/fetch-url")
async def fetch_job_url(request: FetchJobUrlRequest):
    """Fetch job description from URL"""
    try:
        print(f"[DEBUG] Received request: {request}")
        print(f"[DEBUG] URL value: {request.url}")
        print(f"[DEBUG] URL type: {type(request.url)}")

        # Set headers to mimic a browser
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
        }

        # Fetch the URL
        print(f"[DEBUG] Sending request...")
        response = requests.get(request.url, headers=headers, timeout=10)
        print(f"[DEBUG] Response status: {response.status_code}")
        response.raise_for_status()

        # Parse HTML content
        print(f"[DEBUG] Parsing HTML...")
        soup = BeautifulSoup(response.text, 'html.parser')

        # Remove script and style elements
        for script in soup(['script', 'style', 'nav', 'header', 'footer']):
            script.decompose()

        # Get text content
        text = soup.get_text(separator='\n', strip=True)

        # Clean up whitespace
        lines = [line.strip() for line in text.split('\n') if line.strip()]
        cleaned_text = '\n'.join(lines)

        print(f"[DEBUG] Successfully extracted {len(cleaned_text)} characters")

        return {
            "success": True,
            "text": cleaned_text,
            "url": request.url
        }
    except requests.exceptions.Timeout:
        print(f"[ERROR] Request timed out")
        raise HTTPException(
            status_code=408,
            detail="Request timed out. The website took too long to respond."
        )
    except requests.exceptions.RequestException as e:
        print(f"[ERROR] Request failed: {str(e)}")
        raise HTTPException(
            status_code=400,
            detail=f"Failed to fetch URL. Please check the URL and try again. Error: {str(e)}"
        )
    except Exception as e:
        print(f"[ERROR] Unexpected error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error processing the page. Error: {str(e)}"
        )

@router.post("/recommendations", response_model=JobRecommendationsResponse)
async def recommend_jobs(request: JobRecommendationsRequest):
    """
    Recommend alternative jobs when current job match score is low.
    Uses AI to suggest better-fit roles based on user's skills and experience.
    """
    try:
        print(f"[DEBUG] Generating job recommendations for match score: {request.currentMatchScore}")

        # Only recommend if match score is below 60%
        if request.currentMatchScore >= 60:
            return JobRecommendationsResponse(
                recommendations=[],
                reasoning="Your current job match score is good (60% or higher). No alternative recommendations needed."
            )

        result = await get_job_recommendations(
            resume=request.resume,
            current_job=request.currentJobAnalysis,
            match_score=request.currentMatchScore
        )

        print(f"[DEBUG] Generated {len(result['recommendations'])} recommendations")
        return result

    except Exception as e:
        print(f"[ERROR] Failed to generate job recommendations: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate job recommendations: {str(e)}"
        )

@router.post("/discover", response_model=JobDiscoveryResponse)
async def discover_jobs(request: JobDiscoveryRequest):
    """
    Discover relevant jobs based on resume (proactive feature).
    Returns curated job matches ranked by relevance score.
    """
    try:
        print(f"[DEBUG] Discovering jobs for resume with {len(request.resume.experience)} experiences")

        # Match resume against job templates
        job_matches = match_jobs(
            resume=request.resume,
            limit=5,  # Return top 5 matches
            min_score=60.0  # Only show jobs with 60%+ match
        )

        print(f"[DEBUG] Found {len(job_matches)} matching jobs")

        # Log top matches for debugging
        for match in job_matches[:3]:
            print(f"  - {match.job.title}: {match.fitScore}% match")

        return JobDiscoveryResponse(
            jobs=job_matches,
            totalFound=len(job_matches)
        )

    except Exception as e:
        print(f"[ERROR] Failed to discover jobs: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=f"Failed to discover jobs: {str(e)}"
        )
