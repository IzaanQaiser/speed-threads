🚀 SpeedThreads Hackathon Overview

1. [DONE] Chrome Extension Setup – Configure permissions, load into Chrome, and inject a “Summarize with SpeedThreads” button into Reddit and X thread pages.
<br>
st-1-1: Reddit bottom right chat window when speedthreads button is pressed
<br>
2. Basic Scraping – Extract post titles, text, and replies (with metadata like usernames and upvotes) from Reddit, then extend support to X.
<br>
3. Backend API (FastAPI) – Build a simple /summarize endpoint with request/response schemas, mock responses, and CORS enabled.
<br>
4. AI Integration (Ollama) – Connect a lightweight local GPT model to FastAPI, define a unified system prompt, and return structured JSON with TL;DR, summary, and highlights.
<br>
5. Frontend Modal UI – Create a popup modal triggered by the button, with sections for post type, TL;DR, bullet summary, and highlights (best answer, controversial, funny).
<br>
6. Data Flow Wiring – Send scraped data to the backend, parse the JSON response, and dynamically render summaries in the modal.
<br>
7. Core Features – Add copy-to-clipboard, loading states, error handling, and fallbacks for failed AI calls.
<br>
8. Polish Phase – Improve scraping accuracy, handle edge cases (nested comments, varied formats), and refine classification + highlights.
<br>
9. UI/UX Enhancements – Improve modal design, add animations, responsiveness, and collapse/expand functionality for cleaner presentation.
<br>
10. Testing & Demo Prep – Test on multiple Reddit and X threads, fix bugs, optimize performance, and finalize a demo-ready flow.