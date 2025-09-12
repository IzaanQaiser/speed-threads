import os
from openai import OpenAI
from typing import Optional
from .models import ThreadData, SummaryResponse, ChatMessage

class OpenAIService:
    def __init__(self):
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise ValueError("OPENAI_API_KEY environment variable is required")
        
        self.client = OpenAI(api_key=api_key)
        self.model = "gpt-4o-mini"
    
    def analyze_thread(self, thread_data: ThreadData) -> SummaryResponse:
        """Analyze a Reddit/X thread and return structured summary"""
        
        # Format thread data for the prompt
        thread_text = self._format_thread_data(thread_data)
        
        prompt = f"""You are SpeedThreads AI, an expert at analyzing Reddit and X threads. Analyze this thread and provide a structured summary.

{thread_text}

Please analyze this thread and provide:
1. **Post Type**: Classify as question, humor, advice, discussion, rant, informative, support, or other
2. **TL;DR**: One-line summary of the main point
3. **Summary**: 3-5 bullet points covering key points
4. **Best Answer**: The most helpful or insightful reply (if any)
5. **Controversial**: Any controversial or divisive comments (if any)
6. **Funny**: Any humorous or entertaining comments (if any)
7. **Insights**: Additional analysis about community response, sentiment, or patterns

Respond in JSON format matching this structure:
{{
    "type": "question|humor|advice|discussion|rant|informative|support|other",
    "tldr": "One-line summary",
    "summary": ["Point 1", "Point 2", "Point 3"],
    "best_answer": "Most helpful reply or null",
    "controversial": "Controversial comment or null", 
    "funny": "Funny comment or null",
    "suggested_reply": "Suggested reply or null",
    "insights": "Additional analysis or null"
}}"""

        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are SpeedThreads AI, an expert at analyzing social media threads. Always respond with valid JSON."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                max_tokens=1000
            )
            
            # Parse the JSON response
            import json
            result = json.loads(response.choices[0].message.content)
            
            return SummaryResponse(**result)
            
        except Exception as e:
            # Return a fallback response if parsing fails
            return SummaryResponse(
                type="other",
                tldr="Analysis failed - please try again",
                summary=["Unable to process thread data"],
                insights=f"Error: {str(e)}"
            )
    
    def chat_about_thread(self, thread_data: ThreadData, messages: list[ChatMessage], user_message: str) -> str:
        """Continue conversation about a thread"""
        
        # Format thread data for context
        thread_context = self._format_thread_data(thread_data)
        
        # Build conversation history
        conversation = [
            {"role": "system", "content": f"""You are SpeedThreads AI, an expert at analyzing Reddit and X threads. 

Here's the thread we're discussing:
{thread_context}

You can answer questions about:
- The post content and meaning
- Individual comments and their significance  
- Community sentiment and patterns
- Post outcomes and effectiveness
- Related topics and context
- Suggestions for engagement

Be helpful, insightful, and conversational."""}
        ]
        
        # Add previous messages
        for msg in messages:
            conversation.append({"role": msg.role, "content": msg.content})
        
        # Add current user message
        conversation.append({"role": "user", "content": user_message})
        
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=conversation,
                temperature=0.7,
                max_tokens=500
            )
            
            return response.choices[0].message.content
            
        except Exception as e:
            return f"Sorry, I encountered an error: {str(e)}"
    
    def _format_thread_data(self, thread_data: ThreadData) -> str:
        """Format thread data for AI processing"""
        lines = []
        
        # Platform and post info
        lines.append(f"Platform: {thread_data.platform.upper()}")
        lines.append(f"Title: {thread_data.post.title or 'No title'}")
        lines.append(f"Post: {thread_data.post.text}")
        if thread_data.post.author:
            lines.append(f"Author: {thread_data.post.author}")
        if thread_data.post.upvotes:
            lines.append(f"Upvotes: {thread_data.post.upvotes}")
        lines.append("")
        
        # Replies
        lines.append(f"Replies ({len(thread_data.replies)}):")
        for i, reply in enumerate(thread_data.replies, 1):
            lines.append(f"{i}. {reply.text}")
            if reply.author:
                lines.append(f"   - {reply.author}")
            if reply.upvotes:
                lines.append(f"   - {reply.upvotes} upvotes")
            lines.append("")
        
        return "\n".join(lines)
