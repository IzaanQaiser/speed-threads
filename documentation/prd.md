# 📄 Product Requirements Document (PRD): SpeedThreads

## 🧠 Product Name

**SpeedThreads** — Instantly summarize Reddit and X (Twitter) threads using local AI (GPT-OSS).

---

## 🎯 Goal

Build a Chrome Extension that injects a “Summarize Thread” button into Reddit and X (Twitter) thread pages. When clicked, the extension:

1. Scrapes the main post and visible replies.
2. Sends the content to a local or remote GPT-OSS backend.
3. Receives and displays a smart, context-aware summary (e.g., TL;DR, post type, best answers).

---

## ✅ MVP Scope (Must-Have Features)

### Chrome Extension (Client-Side)

* Injects content script into Reddit and X thread pages.
* Detects valid threads based on URL patterns.
* Adds an inline “Summarize with SpeedThreads” button below the main post.
* On click:

  * Scrapes the DOM for:

    * Post title/text
    * Visible top-level replies (and optionally nested replies)
    * Metadata: usernames, likes/upvotes (if easily accessible)
  * Sends structured JSON to backend API
* Displays returned summary in a floating modal or expandable box directly on the page.

### Backend (FastAPI)

* Endpoint: `POST /summarize`
* Accepts structured JSON with:

```json
{
  "platform": "reddit" | "x",
  "post": "...",
  "replies": ["...", "...", "..."]
}
```

* Calls GPT-OSS locally (via Ollama or HuggingFace pipeline)
* Chain-of-prompting logic:

  1. Detect post type (e.g. question, humor, advice, discussion)
  2. Generate TL;DR (1-line)
  3. Generate bullet-point summary (3-5 points)
  4. Extract reply highlights:

     * Best Answer
     * Most Controversial
     * Funniest / Unexpected Insight
     * Suggested Reply (optional)
* Responds with JSON:

```json
{
  "type": "question",
  "tldr": "...",
  "summary": ["...", "..."],
  "best_answer": "...",
  "controversial": "...",
  "funny": "..."
}
```

### Prompting Strategy (GPT-OSS)

* Use one unified system prompt for classification and summarization.
* Consider using separate passes if needed for clarity.
* Should work well with OSS-20b for MVP.

### UI Output (injected into thread page)

* Modal includes:

  * Title: “SpeedThreads Summary”
  * Tags: Post Type (e.g. Question)
  * Sections:

    * TL;DR
    * Bullet Summary
    * Highlights

      * Best Answer
      * Controversial Take
      * Funny/Unexpected
  * Buttons:

    * Copy Summary
    * Collapse/Expand
    * Optional: Shareable link (later)

---

## 🚫 Out of Scope for MVP

* Browser login auth
* Nested comment threading logic (deep)
* Account sync/bookmarks
* Mobile support
* Reddit/X APIs (we use DOM scraping only)

---

## 🌐 Supported Platforms

* **Reddit:** `reddit.com/r/*/comments/*`
* **X/Twitter:** `x.com/*/status/*`

---

## 🛠 Tech Stack

* **Frontend**: TS/JS + React (injected)
* **Extension**: Chrome Extension v3 (manifest.json, content.js)
* **Backend**: FastAPI (Python)
* **AI Model**: GPT-OSS 20b (local Ollama or HF inference)
* **Cloud (optional)**: GCP Cloud Run or localhost
* **Storage (optional)**: SQLite or localStorage

---

## 🔐 Permissions Required

```json
"host_permissions": [
  "https://*.reddit.com/*",
  "https://*.x.com/*"
],
"permissions": ["activeTab", "scripting"]
```

---

## 🚀 Dev Milestones

### Phase 1: Core Scraper + UI

* [ ] Set up Chrome extension + manifest
* [ ] Inject content script + button into Reddit/X
* [ ] Scrape main post + replies on button click
* [ ] Send to FastAPI backend
* [ ] Render mocked response in modal

### Phase 2: Backend + GPT-OSS Integration

* [ ] Build `/summarize` endpoint
* [ ] Parse and prompt GPT-OSS for structured output
* [ ] Return JSON summary to client
* [ ] Parse into React modal output

### Phase 3: Final Polish

* [ ] Improve auto-scroll (optional)
* [ ] Copy-to-clipboard + collapse
* [ ] Responsive design
* [ ] Error handling / fallback messages

---

## 🧠 Stretch Goals (Post-MVP)

* Auto-scroll to load deeper replies
* GPT-generated reply ("Write your own")
* Save summaries locally
* Shareable summary link (if backend hosted)
* Multi-platform rollout (YouTube, Hacker News)

---

## 💬 Example User Flow

1. User opens a Reddit or X thread
2. Sees “✨ Summarize with SpeedThreads” button
3. Clicks → sees loading animation
4. After 2-3 seconds → summary modal pops up with:

   * TL;DR
   * Summary bullets
   * Best Answer, Controversial, Funny
   * Option to copy or close
5. Leaves more informed, faster.

---

## 📌 Summary

SpeedThreads makes Reddit and X threads **readable in seconds** using GPT-OSS. It lives where the user already is (inline), summarizes with smart post-type awareness, and gives actual value from the noise. It's fast, intuitive, and privacy-preserving.

This doc serves as the **source of truth** for Cursor agent development. Follow the structure and prompt chains defined here for implementation.
