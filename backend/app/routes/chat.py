from fastapi import APIRouter, HTTPException
from app.models.schemas import ChatRequest, ChatResponse
from app.services.openai_service import chat_assistant

router = APIRouter()

@router.post("/message", response_model=ChatResponse)
async def chat_message(request: ChatRequest):
    """Send a message to the AI chat assistant"""
    try:
        # Convert JobAnalysis to dict if present
        job_analysis = request.jobAnalysis if request.jobAnalysis else None

        # Convert chat history to list of dicts
        chat_history = [
            {"role": msg.role, "content": msg.content}
            for msg in request.chatHistory
        ] if request.chatHistory else []

        response = await chat_assistant(
            user_message=request.message,
            resume_text=request.resumeText,
            job_description=request.jobDescription,
            job_analysis=job_analysis,
            chat_history=chat_history
        )

        return ChatResponse(message=response)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
