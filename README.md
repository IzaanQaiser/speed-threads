# 🚀 SpeedThreads

**SpeedThreads** is a privacy-first Chrome Extension that injects a "Summarize Thread" button directly into Reddit and X (Twitter) posts. Powered by open-source AI (GPT-OSS), it intelligently summarizes threads with contextual insights — saving you time and surfacing the *actual signal* in the noise.

---

## 🧠 What It Does

SpeedThreads helps you:

- 🔍 Quickly **understand the gist** of long comment threads
- 🧠 Identify the **type** of post (e.g., advice, humor, question)
- 💡 Highlight the **best**, **most controversial**, and **funniest** replies
- 📌 Stay informed faster without having to scroll endlessly

All this — **locally and securely**, powered by GPT-OSS models like `llama3-8b` or `mistral-7b` via Ollama.

---

## 📸 Preview

> _(Insert GIF or screenshots of the summarize button and modal here)_

---

## 🧱 Architecture Overview <br>
  A[Chrome Extension] --> B[Content Script] <br>
  B --> C[Scrape Thread Data] <br>
  C --> D[Send to Backend API] <br>
  D --> E[FastAPI Server (Python)] <br>
  E --> F[Local GPT-OSS Model] <br>
  F --> G[Structured Summary Output] <br>
  G --> H[Rendered Modal in UI] <br>

---

## 🚀 Quick Start

### 1. Load Chrome Extension

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked" and select the `chrome-extension/` folder
4. Visit a Reddit or X thread to see the "✨ Summarize with SpeedThreads" button

### 2. Setup Backend (Optional for testing)

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn src.main:app --reload
```

### 3. Install Ollama (for AI processing)

```bash
# Install Ollama
curl -fsSL https://ollama.ai/install.sh | sh

# Download a model (7b for speed, 13b for quality)
ollama pull llama2:7b
# or
ollama pull llama2:13b
```

---

## 📁 Project Structure

```
speed-threads/
├── chrome-extension/     # Chrome Extension v3
│   ├── manifest.json     # Extension configuration
│   ├── src/             # Source files
│   │   ├── content.js   # Content script
│   │   ├── background.js # Service worker
│   │   ├── popup.html   # Extension popup
│   │   └── content.css  # Styles
│   └── assets/          # Icons and images
├── backend/             # FastAPI backend
│   ├── src/            # Python source
│   ├── prompts/        # AI prompt templates
│   └── requirements.txt
├── shared/             # Shared types and utilities
└── documentation/      # PRD and development docs
```

---

## 🎯 Supported Platforms

- **Reddit**: `reddit.com/r/*/comments/*`
- **X (Twitter)**: `x.com/*/status/*`

---

## 🔧 Development

### Chrome Extension Development

1. Make changes to files in `chrome-extension/src/`
2. Reload the extension in `chrome://extensions/`
3. Test on Reddit or X threads

### Backend Development

```bash
cd backend
uvicorn src.main:app --reload --port 8000
```

---

## 📋 Development Status

- [x] Chrome Extension v3 setup
- [x] Content script with page detection
- [x] Button injection for Reddit and X
- [ ] Reddit thread scraping
- [ ] X thread scraping
- [ ] FastAPI backend with /summarize endpoint
- [ ] Ollama integration for AI processing
- [ ] Summary modal UI
- [ ] Copy-to-clipboard functionality
