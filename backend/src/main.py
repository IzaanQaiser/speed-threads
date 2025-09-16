from fastapi import FastAPI, HTTPException, Request, Depends
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os
import logging
import time
from .models import ThreadData, SummaryResponse, ChatRequest, ChatResponse, ConversationRequest, ConversationResponse
from .services import OpenAIService
from .mongo_service import MongoService
from supabase import create_client, Client

# Load environment variables
load_dotenv()

# Initialize Supabase client (optional)
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")

# Configure logging first
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler('speedthreads.log')
    ]
)
logger = logging.getLogger(__name__)

# Initialize Supabase client (optional)
supabase = None
if SUPABASE_URL and SUPABASE_ANON_KEY:
    try:
        # Create client without proxy parameter to avoid compatibility issues
        supabase = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)
        logger.info("✅ Supabase client initialized successfully")
    except Exception as e:
        logger.warning(f"⚠️ Supabase client initialization failed: {e}")
        logger.warning("Authentication features will be disabled")
        supabase = None
else:
    logger.warning("⚠️ SUPABASE_URL and SUPABASE_ANON_KEY not set - Authentication features disabled")

app = FastAPI(
    title="SpeedThreads API",
    description="AI-powered Reddit and X thread analysis",
    version="1.0.0"
)

# Request logging middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    
    # Log incoming request
    logger.info(f"📥 {request.method} {request.url.path} - Client: {request.client.host if request.client else 'unknown'}")
    
    # Process request
    response = await call_next(request)
    
    # Calculate processing time
    process_time = time.time() - start_time
    
    # Log response
    logger.info(f"📤 {request.method} {request.url.path} - Status: {response.status_code} - Time: {process_time:.3f}s")
    
    return response

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
    logger.info("Initializing OpenAI service...")
    openai_service = OpenAIService()
    logger.info("OpenAI service initialized successfully")
except ValueError as e:
    logger.error(f"Failed to initialize OpenAI service: {e}")
    openai_service = None

# Initialize MongoDB service
try:
    logger.info("Initializing MongoDB service...")
    mongo_service = MongoService()
    logger.info("MongoDB service initialized successfully")
except ValueError as e:
    logger.error(f"Failed to initialize MongoDB service: {e}")
    mongo_service = None

@app.get("/")
async def root():
    return {"message": "SpeedThreads API is running", "status": "healthy"}

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "openai_configured": openai_service is not None,
        "supabase_configured": supabase is not None,
        "mongodb_configured": mongo_service is not None
    }

@app.post("/summarize", response_model=SummaryResponse)
async def summarize_thread(thread_data: ThreadData):
    """Analyze and summarize a Reddit or X thread"""
    logger.info(f"🔍 Starting thread analysis - Platform: {thread_data.platform}, Title: {thread_data.post.title[:50] if thread_data.post.title else 'No title'}...")
    logger.info(f"📊 Thread data: {len(thread_data.replies)} replies, Post length: {len(thread_data.post.text)} chars")
    
    if not openai_service:
        logger.error("❌ OpenAI service not configured")
        raise HTTPException(
            status_code=500, 
            detail="OpenAI service not configured. Please check your API key."
        )
    
    try:
        logger.info("🤖 Calling OpenAI service for thread analysis...")
        result = openai_service.analyze_thread(thread_data)
        logger.info(f"✅ Analysis completed successfully - Post Type: {result.post_type}, Summary: {result.thread_summary[:100]}...")
        return result
    except Exception as e:
        logger.error(f"❌ Analysis failed: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@app.post("/chat", response_model=ChatResponse)
async def chat_about_thread(request: ChatRequest):
    """Continue conversation about a thread"""
    logger.info(f"💬 Starting chat - User message: {request.user_message[:100]}..., Previous messages: {len(request.messages)}")
    
    if not openai_service:
        logger.error("❌ OpenAI service not configured for chat")
        raise HTTPException(
            status_code=500, 
            detail="OpenAI service not configured. Please check your API key."
        )
    
    try:
        # Get AI response
        logger.info("🤖 Getting AI response for chat...")
        ai_message = openai_service.chat_about_thread(
            request.thread_data, 
            request.messages, 
            request.user_message
        )
        
        # Check if this is the first message (no previous analysis)
        has_analysis = any(msg.role == "assistant" and "analysis" in msg.content.lower() for msg in request.messages)
        logger.info(f"📋 Has previous analysis: {has_analysis}, Message count: {len(request.messages)}")
        
        # If it's the first message, also provide analysis
        analysis = None
        if not has_analysis and len(request.messages) <= 1:
            logger.info("🔍 First message detected, generating analysis...")
            analysis = openai_service.analyze_thread(request.thread_data)
        
        logger.info(f"✅ Chat completed - Response length: {len(ai_message)} chars, Analysis provided: {analysis is not None}")
        return ChatResponse(
            message=ai_message,
            analysis=analysis
        )
        
    except Exception as e:
        logger.error(f"❌ Chat failed: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Chat failed: {str(e)}")

# MongoDB test endpoint (no auth required)
@app.post("/test/mongo")
async def test_mongo_connection():
    """Test MongoDB connection and save a test document"""
    if not mongo_service:
        logger.warning("❌ MongoDB not available")
        raise HTTPException(status_code=503, detail="MongoDB service not available")
    
    try:
        # Test saving a user
        test_uid = "test-user-" + str(int(time.time()))
        success = mongo_service.save_user_to_mongo(test_uid, "Test User")
        
        if success:
            # Test saving a conversation
            conversation_id = mongo_service.save_conversation(
                uid=test_uid,
                post_url="https://test.com/example",
                ai_messages=["Test AI message"],
                user_messages=["Test user message"]
            )
            
            if conversation_id:
                logger.info(f"✅ MongoDB test successful - User: {test_uid}, Conversation: {conversation_id}")
                return {
                    "success": True,
                    "message": "MongoDB test successful",
                    "user_id": test_uid,
                    "conversation_id": conversation_id
                }
            else:
                logger.error("❌ MongoDB conversation test failed")
                return {"success": False, "message": "Conversation save failed"}
        else:
            logger.error("❌ MongoDB user test failed")
            return {"success": False, "message": "User save failed"}
            
    except Exception as e:
        logger.error(f"❌ MongoDB test error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"MongoDB test failed: {str(e)}")

@app.post("/conversations/save-simple")
async def save_conversation_simple(request: ConversationRequest):
    """Save a conversation to MongoDB without authentication (for testing)"""
    if not mongo_service:
        logger.warning("❌ MongoDB not available - conversation storage disabled")
        raise HTTPException(status_code=503, detail="MongoDB service not available")
    
    try:
        # Use a test UID for now
        test_uid = "test-user-simple"
        
        # Save user first
        mongo_service.save_user_to_mongo(test_uid, "Test User Simple")
        
        # Save conversation
        conversation_id = mongo_service.save_conversation(
            uid=test_uid,
            post_url=request.post_url,
            ai_messages=request.ai_messages,
            user_messages=request.user_messages
        )
        
        if conversation_id:
            logger.info(f"✅ Simple conversation saved successfully - ID: {conversation_id}")
            return ConversationResponse(
                conversation_id=conversation_id,
                message="Conversation saved successfully"
            )
        else:
            logger.error("❌ Failed to save simple conversation")
            raise HTTPException(status_code=500, detail="Failed to save conversation")
            
    except Exception as e:
        logger.error(f"❌ Save simple conversation error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to save conversation: {str(e)}")

# MongoDB endpoints
@app.post("/user/save")
async def save_user_to_mongo(request: dict):
    """Save or update user in MongoDB when they sign up or log in"""
    if not mongo_service:
        logger.warning("❌ MongoDB not available - user storage disabled")
        raise HTTPException(status_code=503, detail="MongoDB service not available")
    
    uid = request.get("uid")
    display_name = request.get("display_name")
    
    if not uid:
        raise HTTPException(status_code=400, detail="UID is required")
    
    try:
        logger.info(f"💾 Saving user to MongoDB - UID: {uid}, Display Name: {display_name}")
        success = mongo_service.save_user_to_mongo(uid, display_name)
        
        if success:
            logger.info(f"✅ User saved successfully - UID: {uid}")
            return {"success": True, "message": "User saved successfully"}
        else:
            logger.error(f"❌ Failed to save user - UID: {uid}")
            raise HTTPException(status_code=500, detail="Failed to save user")
            
    except Exception as e:
        logger.error(f"❌ Save user error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to save user: {str(e)}")

@app.post("/conversations/save", response_model=ConversationResponse)
async def save_conversation(request: ConversationRequest, authorization: str = None):
    """Save a conversation to MongoDB"""
    if not mongo_service:
        logger.warning("❌ MongoDB not available - conversation storage disabled")
        raise HTTPException(status_code=503, detail="MongoDB service not available")
    
    if not supabase:
        logger.warning("❌ Supabase not available - authentication required")
        raise HTTPException(status_code=503, detail="Authentication service not available")
    
    # Get user from token
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Authorization header required")
    
    token = authorization.replace("Bearer ", "")
    
    try:
        # Validate token and get user
        response = supabase.auth.get_user(token)
        if not response.user:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        uid = response.user.id
        display_name = response.user.user_metadata.get("name") if response.user.user_metadata else None
        
        # Save user to MongoDB (upsert)
        mongo_service.save_user_to_mongo(uid, display_name)
        
        # Save conversation
        conversation_id = mongo_service.save_conversation(
            uid=uid,
            post_url=request.post_url,
            ai_messages=request.ai_messages,
            user_messages=request.user_messages
        )
        
        if conversation_id:
            logger.info(f"✅ Conversation saved successfully - ID: {conversation_id}")
            return ConversationResponse(
                conversation_id=conversation_id,
                message="Conversation saved successfully"
            )
        else:
            logger.error("❌ Failed to save conversation")
            raise HTTPException(status_code=500, detail="Failed to save conversation")
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Save conversation error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to save conversation: {str(e)}")

@app.get("/conversations")
async def get_user_conversations(authorization: str = None, limit: int = 10):
    """Get user's conversations from MongoDB"""
    if not mongo_service:
        logger.warning("❌ MongoDB not available - conversation retrieval disabled")
        raise HTTPException(status_code=503, detail="MongoDB service not available")
    
    if not supabase:
        logger.warning("❌ Supabase not available - authentication required")
        raise HTTPException(status_code=503, detail="Authentication service not available")
    
    # Get user from token
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Authorization header required")
    
    token = authorization.replace("Bearer ", "")
    
    try:
        # Validate token and get user
        response = supabase.auth.get_user(token)
        if not response.user:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        uid = response.user.id
        
        # Get conversations
        conversations = mongo_service.get_user_conversations(uid, limit)
        
        logger.info(f"✅ Retrieved {len(conversations)} conversations for user - UID: {uid}")
        return {"conversations": conversations}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Get conversations error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get conversations: {str(e)}")

# Authentication endpoints for Chrome extension
@app.post("/auth/validate")
async def validate_token(request: dict):
    """Validate JWT token with Supabase (secure backend endpoint)"""
    if not supabase:
        logger.warning("❌ Supabase not available - authentication disabled")
        return {"valid": False, "error": "Authentication service not available"}
    
    token = request.get("token")
    if not token:
        raise HTTPException(status_code=400, detail="Token is required")
    
    try:
        # Use Supabase to validate the token
        response = supabase.auth.get_user(token)
        
        if response.user:
            logger.info(f"✅ Token validation successful for user: {response.user.id}")
            return {
                "valid": True,
                "user": {
                    "id": response.user.id,
                    "email": response.user.email,
                    "user_metadata": response.user.user_metadata
                }
            }
        else:
            logger.warning("❌ Token validation failed - no user found")
            return {"valid": False, "error": "Invalid token"}
            
    except Exception as e:
        logger.error(f"❌ Token validation error: {str(e)}")
        return {"valid": False, "error": "Token validation failed"}

@app.get("/auth/user")
async def get_user_info(authorization: str = None):
    """Get user information from token"""
    if not supabase:
        logger.warning("❌ Supabase not available - authentication disabled")
        raise HTTPException(status_code=503, detail="Authentication service not available")
    
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Authorization header required")
    
    token = authorization.replace("Bearer ", "")
    
    try:
        response = supabase.auth.get_user(token)
        
        if response.user:
            return {
                "id": response.user.id,
                "email": response.user.email,
                "user_metadata": response.user.user_metadata
            }
        else:
            raise HTTPException(status_code=401, detail="Invalid token")
            
    except Exception as e:
        logger.error(f"❌ Get user error: {str(e)}")
        raise HTTPException(status_code=401, detail="Authentication failed")

if __name__ == "__main__":
    import uvicorn
    logger.info("🚀 Starting SpeedThreads API server...")
    logger.info("📊 Logging configured - Check console and speedthreads.log file")
    uvicorn.run(app, host="0.0.0.0", port=8000)
