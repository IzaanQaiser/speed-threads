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
        
        prompt = f"""You are SpeedThreads AI, an expert at analyzing Reddit and X threads. Follow this 3-step process:

**Step 1 — Identify Post Type**
Classify the post as one of these categories:
- **Question** → OP is asking for advice, solutions, or recommendations
- **Opinion/Discussion** → OP is sharing a view, hot take, or starting a debate  
- **Funny/Entertainment** → OP is joking, sharing memes, or looking for laughs
- **News/Info** → OP is sharing an announcement, update, or informational content

**Step 2 — Tailor the Summary**
Write a **Thread Summary** (2–3 sentences) that adapts to the post type:
- **Question posts** → "The OP asked ___, and most answers suggest ___, while others argue ___."
- **Opinion posts** → "The OP shared their take that ___, and the main counterpoints are ___."
- **Funny posts** → "The OP posted a joke about ___, with most replies adding more humor."
- **News posts** → "The OP shared news about ___, and replies focus on ___."

**Step 3 — Classify Replies**
Group the best replies by category with emoji icons. Do NOT include author names - just show the reply text and explanation.

For **Question posts**: 💡 Helpful, ⚡ Controversial, 🔎 Insightful, 😂 Funny
For **Opinion posts**: 👍 Supportive, ⚡ Opposing, 🔎 Insightful, 😂 Funny  
For **Funny posts**: 😂 Funniest, 💡 Clever, ⭐ Popular
For **News posts**: 🔎 Insightful, ⚡ Critical, 👍 Supportive, 😂 Funny

{thread_text}

CRITICAL: 
1. Respond with ONLY valid JSON matching this exact format
2. Do NOT include author names - set author field to empty string ""
3. Focus on the reply content and categorization

{{
    "post_type": "Question",
    "thread_summary": "The OP asked whether to learn Python or JavaScript first. Most answers suggest Python for beginners, though some argue JS is more practical for web development.",
    "key_replies": [
        {{
            "emoji": "💡",
            "name": "Helpful",
            "replies": [
                {{
                    "author": "",
                    "text": "Start with Python. Its syntax is cleaner and you can pick up core concepts faster.",
                    "explanation": "Directly answers OP's question with a clear recommendation"
                }}
            ]
        }},
        {{
            "emoji": "⚡",
            "name": "Controversial", 
            "replies": [
                {{
                    "author": "",
                    "text": "Python is useless unless you want to do AI. JS is the only language worth learning.",
                    "explanation": "Polarizing statement that contradicts most other replies"
                }}
            ]
        }}
    ]
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
            
            # Log the actual fields to debug format issues
            if 'key_replies' in result:
                logger.info(f"📋 Key replies field type: {type(result['key_replies'])}, Count: {len(result['key_replies']) if isinstance(result['key_replies'], list) else 'N/A'}")
            
            return SummaryResponse(**result)
            
        except json.JSONDecodeError as e:
            logger.error(f"❌ JSON parsing failed: {str(e)}")
            logger.error(f"📄 Raw response content: {response.choices[0].message.content[:500]}...")
            # Return a fallback response if JSON parsing fails
            return SummaryResponse(
                post_type="Question",
                thread_summary="Analysis failed - please try again",
                key_replies=[]
            )
        except Exception as e:
            # Check if it's a Pydantic validation error
            if "validation error" in str(e).lower():
                logger.error(f"❌ Pydantic validation failed: {str(e)}")
                logger.error(f"📄 Raw response content: {response.choices[0].message.content[:500]}...")
                # Return fallback if validation fails
                return SummaryResponse(
                    post_type="Question",
                    thread_summary="Analysis failed - format error",
                    key_replies=[]
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
