# 🚀 SpeedThreads 48-Hour Hackathon Plan
*Each item = 1 commit*

## **Phase 1: Basic Chrome Extension (Hours 1-8)**

### Hour 1-2: Project Setup
3. Add proper host_permissions for Reddit and X
4. Add activeTab and scripting permissions
5. Test extension loads in Chrome

### Hour 3-4: Button Injection
1. Detect Reddit thread URLs
2. Inject "✨ Summarize with SpeedThreads" button into Reddit pages
3. Add click handler to button
4. Test button appears and responds

### Hour 5-6: Reddit Scraping
1. Scrape Reddit post title and text
2. Scrape first 5 visible comments
3. Extract metadata (usernames, upvotes)
4. Log scraped data to console
5. Test on different Reddit threads

### Hour 7-8: X/Twitter Support
1. Detect X thread URLs
2. Inject button into X pages
3. Scrape X post and replies
4. Test on X threads

---

## **Phase 2: Backend API (Hours 9-16)**

### Hour 9-10: FastAPI Setup
1. Create FastAPI project
2. Add /summarize endpoint
3. Define request schema (platform, post, replies)
4. Return mock JSON response
5. Test endpoint with Postman

### Hour 11-12: Request/Response
1. Define response schema (type, tldr, summary, best_answer, controversial, funny)
2. Update endpoint to use schemas
3. Test with real thread data
4. Add CORS headers

### Hour 13-14: Ollama Setup
1. Install Ollama
2. Download small GPT model (7b or 13b)
3. Test model with simple prompt
4. Connect Ollama to FastAPI

### Hour 15-16: Basic AI Integration
1. Create unified system prompt for classification and summarization
2. Generate TL;DR (1-line)
3. Generate bullet-point summary (3-5 points)
4. Return structured JSON response
5. Test end-to-end flow

---

## **Phase 3: Frontend UI (Hours 17-24)**

### Hour 17-18: Modal HTML
1. Create modal with title "SpeedThreads Summary"
2. Add post type tags section
3. Add TL;DR section
4. Add bullet summary section
5. Add highlights section (Best Answer, Controversial, Funny)
6. Show/hide modal on button click

### Hour 19-20: Display Summary
1. Parse JSON response from backend
2. Display post type tag
3. Display TL;DR in modal
4. Display bullet points
5. Display highlights with proper formatting
6. Test with real data

### Hour 21-22: Copy Function
1. Add copy button to modal
2. Implement copy-to-clipboard
3. Add success feedback
4. Test copy functionality

### Hour 23-24: Error Handling
1. Add loading spinner
2. Handle API errors gracefully
3. Add timeout handling
4. Add fallback messages
5. Test error scenarios

---

## **Phase 4: Polish & Demo (Hours 25-32)**

### Hour 25-26: Better Scraping
1. Improve Reddit comment extraction
2. Handle more comment types
3. Add metadata (upvotes, usernames)
4. Test on complex threads

### Hour 27-28: Enhanced AI
1. Add post type detection (question, humor, advice, discussion)
2. Generate bullet points (3-5 points)
3. Extract best answer
4. Extract controversial take
5. Extract funny/unexpected insight

### Hour 29-30: UI Polish
1. Improve modal design
2. Add collapse/expand functionality
3. Add animations
4. Make responsive
5. Test on different screen sizes

### Hour 31-32: Final Testing
1. Test on 10+ different threads
2. Fix any remaining bugs
3. Optimize performance
4. Prepare demo script

---

## **🎯 MVP Success Criteria**
1. Button appears on Reddit threads
2. Button appears on X threads  
3. Clicking button shows loading
4. Modal displays "SpeedThreads Summary" with all sections
5. Shows post type tag
6. Shows TL;DR, bullet points, and highlights
7. Copy button works
8. Works on 5+ different threads

---

## **⚡ Quick Commits**
```bash
# Each commit should be:
git add .
git commit -m "Add [specific feature]"
```

**Total: 32 commits over 32 hours = 1 commit per hour**
