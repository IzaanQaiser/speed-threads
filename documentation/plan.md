# 🚀 SpeedThreads 48-Hour Hackathon Plan
*Each item = 1 commit*

## **Phase 1: Basic Chrome Extension (Hours 1-8)**

### Hour 1-2: Project Setup
1. Create basic project structure with folders
2. Initialize Chrome extension manifest.json
3. Add basic content script file
4. Test extension loads in Chrome

### Hour 3-4: Button Injection
5. Detect Reddit thread URLs
6. Inject "Summarize" button into Reddit pages
7. Add click handler to button
8. Test button appears and responds

### Hour 5-6: Reddit Scraping
9. Scrape Reddit post title and text
10. Scrape first 5 visible comments
11. Log scraped data to console
12. Test on different Reddit threads

### Hour 7-8: X/Twitter Support
13. Detect X thread URLs
14. Inject button into X pages
15. Scrape X post and replies
16. Test on X threads

---

## **Phase 2: Backend API (Hours 9-16)**

### Hour 9-10: FastAPI Setup
17. Create FastAPI project
18. Add /summarize endpoint
19. Return mock JSON response
20. Test endpoint with Postman

### Hour 11-12: Request/Response
21. Define request schema for thread data
22. Define response schema for summary
23. Update endpoint to use schemas
24. Test with real thread data

### Hour 13-14: Ollama Setup
25. Install Ollama
26. Download small GPT model (7b or 13b)
27. Test model with simple prompt
28. Connect Ollama to FastAPI

### Hour 15-16: Basic AI Integration
29. Create simple summarization prompt
30. Generate TL;DR from thread data
31. Return structured JSON response
32. Test end-to-end flow

---

## **Phase 3: Frontend UI (Hours 17-24)**

### Hour 17-18: Modal HTML
33. Create basic modal HTML structure
34. Add CSS for modal styling
35. Show/hide modal on button click
36. Test modal displays correctly

### Hour 19-20: Display Summary
. Parse JSON response from backend
. Display TL;DR in modal
. Add basic formatting
. Test with real data

### Hour 21-22: Copy Function
. Add copy button to modal
. Implement copy-to-clipboard
. Add success feedback
. Test copy functionality

### Hour 23-24: Error Handling
. Add loading spinner
. Handle API errors gracefully
. Add timeout handling
. Test error scenarios

---

## **Phase 4: Polish & Demo (Hours 25-32)**

### Hour 25-26: Better Scraping
. Improve Reddit comment extraction
. Handle more comment types
. Add metadata (upvotes, usernames)
. Test on complex threads

### Hour 27-28: Enhanced AI
. Add post type detection
. Generate bullet points
. Extract best answer
. Test with various thread types

### Hour 29-30: UI Polish
. Improve modal design
. Add animations
. Make responsive
. Test on different screen sizes

### Hour 31-32: Final Testing
. Test on 10+ different threads
. Fix any remaining bugs
. Optimize performance
. Prepare demo script

---

## **🎯 MVP Success Criteria**
. Button appears on Reddit threads
. Button appears on X threads  
. Clicking button shows loading
. Modal displays AI summary
. Copy button works
. Works on 5+ different threads

---

## **⚡ Quick Commits**
```bash
# Each commit should be:
git add .
git commit -m "Add [specific feature]"
```

**Total: 32 commits over 32 hours = 1 commit per hour**
