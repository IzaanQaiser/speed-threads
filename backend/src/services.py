import os
import logging
import json
from openai import OpenAI
from typing import Optional
from .models import ThreadData, SummaryResponse, ChatMessage

# Set up logger for this module
logger = logging.getLogger(__name__)

class OpenAIService:
    def __init__(self):
        logger.info("🔧 Initializing OpenAI service...")
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            logger.error("❌ OPENAI_API_KEY environment variable not found")
            raise ValueError("OPENAI_API_KEY environment variable is required")
        
        logger.info("🔑 OpenAI API key found, creating client...")
        self.client = OpenAI(api_key=api_key)
        self.model = "gpt-4o-mini"
        logger.info(f"✅ OpenAI service initialized with model: {self.model}")
    
    def analyze_thread(self, thread_data: ThreadData) -> SummaryResponse:
        """Analyze a Reddit/X thread and return structured summary"""
        logger.info(f"🔍 Starting thread analysis - Platform: {thread_data.platform}")
        logger.info(f"📊 Thread stats - Replies: {len(thread_data.replies)}, Post length: {len(thread_data.post.text)} chars")
        
        # Format thread data for the prompt
        logger.info("📝 Formatting thread data for AI prompt...")
        thread_text = self._format_thread_data(thread_data)
        logger.info(f"📄 Formatted thread text length: {len(thread_text)} chars")
        
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

CRITICAL: Respond with ONLY valid JSON. The "summary" field MUST be an array of strings, not a single string.

Example format:
{{
    "type": "question",
    "tldr": "One-line summary",
    "summary": ["First key point", "Second key point", "Third key point"],
    "best_answer": "Most helpful reply or null",
    "controversial": "Controversial comment or null", 
    "funny": "Funny comment or null",
    "suggested_reply": "Suggested reply or null",
    "insights": "Additional analysis or null"
}}"""

        try:
            logger.info(f"🤖 Sending request to OpenAI API - Model: {self.model}, Max tokens: 1000")
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are SpeedThreads AI, an expert at analyzing social media threads. Always respond with valid JSON."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                max_tokens=1000
            )
            
            logger.info(f"📥 Received response from OpenAI - Usage: {response.usage}")
            logger.info(f"📄 Response content length: {len(response.choices[0].message.content)} chars")
            
            # Parse the JSON response
            logger.info("🔍 Parsing JSON response...")
            result = json.loads(response.choices[0].message.content)
            logger.info(f"✅ JSON parsed successfully - Keys: {list(result.keys())}")
            
            # Log the actual summary field to debug format issues
            if 'summary' in result:
                logger.info(f"📋 Summary field type: {type(result['summary'])}, Value: {result['summary']}")
            
            return SummaryResponse(**result)
            
        except json.JSONDecodeError as e:
            logger.error(f"❌ JSON parsing failed: {str(e)}")
            logger.error(f"📄 Raw response content: {response.choices[0].message.content[:500]}...")
            # Return a fallback response if JSON parsing fails
            return SummaryResponse(
                type="other",
                tldr="Analysis failed - please try again",
                summary=["Unable to process thread data"],
                insights=f"JSON Error: {str(e)}"
            )
        except Exception as e:
            # Check if it's a Pydantic validation error
            if "validation error" in str(e).lower():
                logger.error(f"❌ Pydantic validation failed: {str(e)}")
                logger.error(f"📄 Raw response content: {response.choices[0].message.content[:500]}...")
                # Try to fix common issues
                if 'summary' in result and isinstance(result['summary'], str):
                    logger.info("🔧 Attempting to fix summary field - converting string to list")
                    result['summary'] = [result['summary']]
                    try:
                        return SummaryResponse(**result)
                    except Exception as fix_error:
                        logger.error(f"❌ Fix attempt failed: {str(fix_error)}")
                
                # Return fallback if fix fails
                return SummaryResponse(
                    type="other",
                    tldr="Analysis failed - format error",
                    summary=["Unable to process thread data"],
                    insights=f"Validation Error: {str(e)}"
                )
            
            logger.error(f"❌ OpenAI API call failed: {str(e)}", exc_info=True)
            # Re-raise other exceptions so they can be handled by the API endpoint
            raise e
    
    def chat_about_thread(self, thread_data: ThreadData, messages: list[ChatMessage], user_message: str) -> str:
        """Continue conversation about a thread"""
        logger.info(f"💬 Starting chat about thread - User message: {user_message[:100]}...")
        logger.info(f"📊 Chat context - Previous messages: {len(messages)}, Thread replies: {len(thread_data.replies)}")
        
        # Format thread data for context
        logger.info("📝 Formatting thread context for chat...")
        thread_context = self._format_thread_data(thread_data)
        logger.info(f"📄 Thread context length: {len(thread_context)} chars")
        
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
        logger.info(f"📝 Building conversation history with {len(messages)} previous messages...")
        for i, msg in enumerate(messages):
            conversation.append({"role": msg.role, "content": msg.content})
            logger.debug(f"   Message {i+1}: {msg.role} - {msg.content[:50]}...")
        
        # Add current user message
        conversation.append({"role": "user", "content": user_message})
        logger.info(f"📄 Total conversation length: {len(conversation)} messages")
        
        try:
            logger.info(f"🤖 Sending chat request to OpenAI - Model: {self.model}, Max tokens: 500")
            response = self.client.chat.completions.create(
                model=self.model,
                messages=conversation,
                temperature=0.7,
                max_tokens=500
            )
            
            logger.info(f"📥 Received chat response - Usage: {response.usage}")
            logger.info(f"📄 Response length: {len(response.choices[0].message.content)} chars")
            
            return response.choices[0].message.content
            
        except Exception as e:
            logger.error(f"❌ Chat request failed: {str(e)}", exc_info=True)
            return f"Sorry, I encountered an error: {str(e)}"
    
    def _format_thread_data(self, thread_data: ThreadData) -> str:
        """Format thread data for AI processing"""
        logger.debug("🔧 Formatting thread data for AI processing...")
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
        
        formatted_text = "\n".join(lines)
        logger.debug(f"✅ Thread data formatted - Total length: {len(formatted_text)} chars")
        return formatted_text
