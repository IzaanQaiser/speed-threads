from pydantic import BaseModel
from typing import List, Optional, Literal
from datetime import datetime

class PostData(BaseModel):
    title: Optional[str] = ""
    text: str
    author: Optional[str] = ""
    upvotes: Optional[int] = 0
    url: Optional[str] = ""

class ReplyData(BaseModel):
    text: str
    author: Optional[str] = ""
    upvotes: Optional[int] = 0
    isTopLevel: Optional[bool] = True

class ThreadData(BaseModel):
    platform: Literal["reddit", "x"]
    post: PostData
    replies: List[ReplyData]

class KeyReply(BaseModel):
    author: str
    text: str
    explanation: str

class ReplyCategory(BaseModel):
    emoji: str
    name: str
    replies: List[KeyReply]

class SummaryResponse(BaseModel):
    post_type: Literal["Question", "Opinion/Discussion", "Funny/Entertainment", "News/Info"]
    thread_summary: str
    key_replies: List[ReplyCategory]

class ChatMessage(BaseModel):
    role: Literal["user", "assistant", "system"]
    content: str

class ChatRequest(BaseModel):
    thread_data: ThreadData
    messages: List[ChatMessage]
    user_message: str

class ChatResponse(BaseModel):
    message: str
    analysis: Optional[SummaryResponse] = None

# MongoDB Models
class UserDocument(BaseModel):
    supabase_uid: str
    display_name: Optional[str] = None
    created_at: datetime
    updated_at: datetime

class ConversationDocument(BaseModel):
    uid: str  # Supabase UID
    post_url: str
    ai_messages: List[str]
    user_messages: List[str]
    created_at: datetime
    updated_at: datetime

class ConversationRequest(BaseModel):
    post_url: str
    ai_messages: List[str]
    user_messages: List[str]

class ConversationResponse(BaseModel):
    conversation_id: str
    message: str
