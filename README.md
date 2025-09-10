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
