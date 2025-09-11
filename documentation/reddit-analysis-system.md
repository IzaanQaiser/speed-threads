# Reddit Thread Analysis System

## Overview

The Reddit Thread Analysis System is a sophisticated AI-powered tool that goes beyond simple summarization to provide intelligent analysis of Reddit threads. Instead of just creating TL;DR summaries, the system analyzes post types, predicts expected outcomes, and evaluates actual results from community responses.

## Core Functionality

### 1. Post Type Classification
The system automatically classifies Reddit posts into categories such as:
- **Question** - User seeking information or help
- **Advice** - User asking for guidance or recommendations
- **Informative** - User sharing knowledge or updates
- **Rant** - User expressing frustration or complaints
- **Discussion** - User starting a conversation or debate
- **Humor** - User sharing jokes or funny content
- **Support** - User seeking emotional or practical support

### 2. Expected Outcome Prediction
Based on the post type, the system determines what the ideal resolution would be:
- **Questions** → Clear, helpful answers
- **Advice** → Practical solutions and recommendations
- **Informative** → Community engagement and additional insights
- **Rants** → Validation, empathy, or constructive feedback
- **Discussions** → Diverse perspectives and healthy debate
- **Humor** → Community laughter and related jokes
- **Support** → Empathy, encouragement, and helpful resources

### 3. Actual Outcome Analysis
The system analyzes the replies to determine:
- What actually happened in the thread
- Whether the expected outcome was achieved
- Quality of community responses
- Consensus or disagreement patterns
- Most helpful or insightful comments

### 4. Conversational Interface
After analysis, users can ask follow-up questions about:
- Specific aspects of the thread
- Individual comments or responses
- Community sentiment
- Post outcomes
- Related topics

## Technical Implementation

### Frontend (Chrome Extension)
```javascript
// When speedthreads button is pressed
const REDDIT_ANALYSIS_PROMPT = `I am going to give you the title, post, and replies of a Reddit thread. Please:

1. **Classify the post type**: question, advice, informative, rant, discussion, etc.
2. **Determine expected outcome**: What would be the ideal resolution for this post type?
3. **Analyze actual outcome**: What actually happened based on the replies?
4. **Provide insights**: Key takeaways, best responses, consensus, etc.

After analysis, be ready to answer follow-up questions about the thread.

Here's the Reddit thread data:`;

// Send to backend
const response = await fetch('/api/analyze-reddit', {
  method: 'POST',
  body: JSON.stringify({
    prompt: REDDIT_ANALYSIS_PROMPT,
    threadData: scrapedData
  })
});
```

### Backend (FastAPI)
```python
from fastapi import FastAPI
from pydantic import BaseModel
import ollama

app = FastAPI()

class ThreadData(BaseModel):
    title: str
    post: str
    replies: list[str]

@app.post("/analyze-reddit")
async def analyze_reddit(thread_data: ThreadData):
    prompt = REDDIT_ANALYSIS_PROMPT + format_thread_data(thread_data)
    response = await ollama.generate(prompt)
    return {"analysis": response}
```

### Data Flow
1. **User clicks "speedthreads" button** on Reddit post
2. **Extension scrapes** title, post text, and first 20 replies
3. **Data sent to backend** with analysis prompt
4. **AI processes** the thread and provides analysis
5. **Results displayed** in chat interface
6. **User can ask follow-up questions** about the analysis

## Example Analysis

### Input Thread
**Title:** "My son put something in the belt lock of our car and it doesn't lock anymore"

**Post:** "Bonus: the whole seat needs to be put out and the lock needs to be exchanged. It is not meant to be disassembled as it is a safety feature."

**Replies:**
1. "Kid thought you had too much free time and money."
2. "I'm sitting here since an hour lol"
3. "If the wire hanger and pliers don't work. Get a pair of precision kelly hemostat forceps..."
4. "Buddy too late for the wire hanger."
5. "I horrified my husband when our then-2 year old toddled in the room holding a hanger..."

### Expected Analysis
**Post Type:** Rant/Complaint
**Expected Outcome:** Empathy, validation, and practical solutions
**Actual Outcome:** Community provided both emotional support (humor, shared experiences) and practical advice (specific tools, techniques)
**Key Insights:** Thread successfully balanced commiseration with helpful solutions, showing Reddit's strength in both emotional support and problem-solving

## Benefits Over Simple Summarization

### Traditional TL;DR
- "Kid broke car seatbelt lock, needs expensive repair"
- Lists main points
- No context or analysis

### Thread Analysis System
- **Contextual understanding** of post type and community response
- **Outcome evaluation** - did the community help effectively?
- **Sentiment analysis** - how did people react?
- **Quality assessment** - were the responses helpful?
- **Interactive follow-up** - ask specific questions about the thread

## Future Enhancements

### Phase 1: Basic Analysis
- Post type classification
- Expected vs actual outcome analysis
- Basic insights and takeaways

### Phase 2: Advanced Features
- Sentiment analysis of replies
- Quality scoring of responses
- Community consensus detection
- Thread trend analysis

### Phase 3: Predictive Features
- Outcome prediction for ongoing threads
- Community response quality prediction
- Thread success likelihood assessment

## Use Cases

### For Reddit Users
- **Quick thread understanding** without reading all comments
- **Quality assessment** of community responses
- **Learning from successful threads** (what makes a good post?)
- **Finding the best advice** in advice threads

### For Content Creators
- **Understanding community preferences** and response patterns
- **Learning what types of posts get good engagement**
- **Analyzing successful vs unsuccessful threads**

### For Researchers
- **Community behavior analysis**
- **Social dynamics in online forums**
- **Information quality assessment in crowdsourced responses**

## Technical Requirements

### Backend
- FastAPI server
- Ollama or similar local AI model
- Python 3.8+
- Pydantic for data validation

### Frontend
- Chrome Extension (already implemented)
- Content script for Reddit scraping
- Chat interface for AI interaction

### AI Model
- Local model (Ollama) for privacy
- 7B-13B parameter model recommended
- Fine-tuned for Reddit analysis tasks

## Privacy Considerations

- **Local AI processing** - no data sent to external services
- **No data storage** - analysis happens in real-time
- **User control** - users can see exactly what data is being analyzed
- **Transparent processing** - all analysis steps are visible to the user

## Success Metrics

### User Engagement
- Time spent in chat interface
- Number of follow-up questions asked
- User satisfaction with analysis quality

### Analysis Quality
- Accuracy of post type classification
- Relevance of outcome predictions
- Usefulness of insights provided

### Technical Performance
- Response time for analysis
- Success rate of data scraping
- Chat interface responsiveness

---

*This document outlines the vision for the Reddit Thread Analysis System, a sophisticated AI-powered tool that provides intelligent analysis of Reddit threads beyond simple summarization.*
