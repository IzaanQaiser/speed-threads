from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os
from .models import ThreadData, SummaryResponse, ChatRequest, ChatResponse
from .services import OpenAIService

# Load environment variables
load_dotenv()

app = FastAPI(
    title="SpeedThreads API",
    description="AI-powered Reddit and X thread analysis",
    version="1.0.0"
)

# CORS middleware for Chrome extension
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your extension's origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize OpenAI service
try:
    openai_service = OpenAIService()
except ValueError as e:
    print(f"Warning: {e}")
    openai_service = None

@app.get("/")
async def root():
    return {"message": "SpeedThreads API is running", "status": "healthy"}

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "openai_configured": openai_service is not None
    }

@app.post("/summarize", response_model=SummaryResponse)
async def summarize_thread(thread_data: ThreadData):
    """Analyze and summarize a Reddit or X thread"""
    if not openai_service:
        raise HTTPException(
            status_code=500, 
            detail="OpenAI service not configured. Please check your API key."
        )
    
    try:
        result = openai_service.analyze_thread(thread_data)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@app.post("/chat", response_model=ChatResponse)
async def chat_about_thread(request: ChatRequest):
    """Continue conversation about a thread"""
    if not openai_service:
        raise HTTPException(
            status_code=500, 
            detail="OpenAI service not configured. Please check your API key."
        )
    
    try:
        # Get AI response
        ai_message = openai_service.chat_about_thread(
            request.thread_data, 
            request.messages, 
            request.user_message
        )
        
        # Check if this is the first message (no previous analysis)
        has_analysis = any(msg.role == "assistant" and "analysis" in msg.content.lower() for msg in request.messages)
        
        # If it's the first message, also provide analysis
        analysis = None
        if not has_analysis and len(request.messages) <= 1:
            analysis = openai_service.analyze_thread(request.thread_data)
        
        return ChatResponse(
            message=ai_message,
            analysis=analysis
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
