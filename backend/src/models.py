from pydantic import BaseModel
from typing import List, Optional, Literal

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

class SummaryResponse(BaseModel):
    type: Literal["question", "humor", "advice", "discussion", "rant", "informative", "support", "other"]
    tldr: str
    summary: List[str]
    best_answer: Optional[str] = None
    controversial: Optional[str] = None
    funny: Optional[str] = None
    suggested_reply: Optional[str] = None
    insights: Optional[str] = None

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
