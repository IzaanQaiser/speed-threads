# 🚀 SpeedThreads 48-Hour Hackathon Plan

## **Phase 1: Project Setup & Chrome Extension (Hours 1-8)**
**Time: 8 hours**

### Hour 1-2: Project Structure
- [ ] Create project folders: `chrome-extension/`, `backend/`, `shared/`
- [ ] Set up Chrome extension manifest v3
- [ ] Initialize basic content script structure
- [ ] Set up TypeScript/React build pipeline

### Hour 3-4: Chrome Extension Core
- [ ] Create manifest.json with proper permissions
- [ ] Build content script that detects Reddit/X URLs
- [ ] Add basic button injection logic
- [ ] Test extension loading in Chrome

### Hour 5-6: DOM Scraping (Reddit)
- [ ] Research Reddit DOM structure
- [ ] Build scraper for main post content
- [ ] Extract visible replies and metadata
- [ ] Test on various Reddit thread types

### Hour 7-8: DOM Scraping (X/Twitter)
- [ ] Research X DOM structure
- [ ] Build scraper for tweets and replies
- [ ] Handle X's dynamic loading
- [ ] Test on various X thread types

---

## **Phase 2: Backend & AI Integration (Hours 9-24)**
**Time: 16 hours**

### Hour 9-12: FastAPI Backend
- [ ] Set up FastAPI project with Python
- [ ] Create `/summarize` endpoint
- [ ] Define request/response schemas
- [ ] Add CORS and basic error handling
- [ ] Test with mock data

### Hour 13-16: GPT-OSS Setup
- [ ] Install and configure Ollama
- [ ] Download GPT-OSS model (20b or smaller for speed)
- [ ] Test model locally with simple prompts
- [ ] Create basic prompt templates

### Hour 17-20: AI Prompting Logic
- [ ] Build post type classification prompt
- [ ] Create TL;DR generation prompt
- [ ] Design bullet-point summary prompt
- [ ] Build highlight extraction prompts
- [ ] Test prompt chain with sample data

### Hour 21-24: Backend Integration
- [ ] Connect FastAPI to Ollama
- [ ] Implement full prompt chain
- [ ] Add JSON response formatting
- [ ] Test end-to-end backend flow
- [ ] Add error handling and fallbacks

---

## **Phase 3: Frontend UI & Integration (Hours 25-40)**
**Time: 16 hours**

### Hour 25-28: React Modal UI
- [ ] Set up React component for summary modal
- [ ] Design modal layout with sections
- [ ] Add loading states and animations
- [ ] Implement copy-to-clipboard functionality

### Hour 29-32: Chrome Extension Integration
- [ ] Connect content script to backend API
- [ ] Handle API calls and responses
- [ ] Add error handling for network issues
- [ ] Test full flow on Reddit threads

### Hour 33-36: UI Polish & Features
- [ ] Style modal with modern CSS
- [ ] Add collapse/expand functionality
- [ ] Implement responsive design
- [ ] Add keyboard shortcuts (ESC to close)

### Hour 37-40: Cross-Platform Testing
- [ ] Test on various Reddit subreddits
- [ ] Test on X threads
- [ ] Handle edge cases (deleted posts, etc.)
- [ ] Optimize performance and loading times

---

## **Phase 4: Final Polish & Demo Prep (Hours 41-48)**
**Time: 8 hours**

### Hour 41-44: Bug Fixes & Optimization
- [ ] Fix any remaining bugs
- [ ] Optimize AI response times
- [ ] Add better error messages
- [ ] Test on different thread types

### Hour 45-48: Demo Preparation
- [ ] Create demo script with example threads
- [ ] Record demo video (if needed)
- [ ] Prepare presentation slides
- [ ] Test everything one final time

---

## **🎯 Critical Success Factors**

### **Must-Have for Demo:**
1. **Working Chrome extension** that injects button
2. **Functional DOM scraping** for both platforms
3. **Working AI summarization** (even if basic)
4. **Clean UI modal** with summary display
5. **End-to-end flow** from click to summary

### **Nice-to-Have:**
- Copy functionality
- Loading animations
- Error handling
- Multiple thread types

### **Time-Saving Tips:**
- Use existing UI libraries (Tailwind CSS)
- Start with simpler AI prompts
- Focus on one platform first (Reddit)
- Use mock data during development
- Test incrementally, not at the end

### **Backup Plan:**
If AI integration takes too long, create a mock summarization service that returns structured fake data to demonstrate the full UI flow.

---

## **📁 Project Structure**
```
speed-threads/
├── chrome-extension/
│   ├── manifest.json
│   ├── content.js
│   ├── popup.html
│   └── background.js
├── backend/
│   ├── main.py
│   ├── requirements.txt
│   └── prompts/
├── shared/
│   └── types.ts
├── documentation/
│   ├── prd.md
│   └── plan.md
└── README.md
```

---

## **🔧 Tech Stack Reminder**
- **Frontend**: TypeScript/JavaScript + React (injected)
- **Extension**: Chrome Extension v3
- **Backend**: FastAPI (Python)
- **AI Model**: GPT-OSS 20b (local via Ollama)
- **UI**: Tailwind CSS (for speed)

---

## **⚡ Quick Start Commands**
```bash
# Backend setup
cd backend
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install fastapi uvicorn ollama

# Chrome extension
cd chrome-extension
# Load unpacked extension in Chrome developer mode
```

**Ready to start? Let's begin with Phase 1!** 🚀
