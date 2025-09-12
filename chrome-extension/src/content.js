// SpeedThreads Content Script
console.log('SpeedThreads content script loaded');

// Filter out noisy CSP font errors from Reddit
const originalError = console.error;
console.error = function(...args) {
  const message = args.join(' ');
  // Filter out Google Fonts CSP errors that are not our fault
  if ((message.includes('Refused to load the font') || 
       message.includes('Refused to load the stylesheet')) && 
      (message.includes('fonts.gstatic.com') || 
       message.includes('fonts.googleapis.com')) && 
      (message.includes('Content Security Policy') || 
       message.includes('CSP'))) {
    return; // Don't log these errors
  }
  originalError.apply(console, args);
};

// Configuration
const CONFIG = {
  REDDIT_PATTERN: /reddit\.com\/r\/[^\/]+\/comments\/[^\/]+/,
  X_PATTERN: /x\.com\/[^\/]+\/status\/\d+/,
  BUTTON_ID: 'speedthreads-summarize-btn',
  MODAL_ID: 'speedthreads-modal',
  CHATBOT_ID: 'speedthreads-chatbot'
};

// Portal and tooltip system for X platform only
function ensurePortal() {
  let p = document.getElementById('st-portal');
  if (!p) {
    p = document.createElement('div');
    p.id = 'st-portal';
    p.setAttribute('data-speedthreads', 'portal');
    Object.assign(p.style, {
      position: 'fixed',
      inset: '0',
      zIndex: String(2147483647),
      pointerEvents: 'none', // allow page to receive pointer events
    });
    document.body.appendChild(p);
  }
  return p;
}

function getTooltip() {
  let t = document.getElementById('st-tooltip');
  if (!t) {
    t = document.createElement('div');
    t.id = 'st-tooltip';
    t.className = 'speedthreads-tooltip';
    t.textContent = 'Summarise threads and replies with SpeedThreads';
    t.style.position = 'fixed';
    t.style.background = 'rgba(0, 0, 0, 0.6)';
    t.style.color = '#fff';
    t.style.padding = '6px 8px';
    t.style.borderRadius = '6px';
    t.style.fontSize = '12px';          // adjust freely
    t.style.fontWeight = '400';
    t.style.whiteSpace = 'nowrap';
    t.style.boxShadow = '0 2px 8px rgba(0,0,0,.3)';
    t.style.pointerEvents = 'none';
    t.style.transform = 'translateX(-50%)';
    t.style.display = 'none';
  }
  return t;
}

function positionTooltipFor(targetEl) {
  const portal = ensurePortal();
  const tip = getTooltip();
  if (!tip.parentElement) portal.appendChild(tip);

  const rect = targetEl.getBoundingClientRect();

  // First, set a provisional position so we can read tip height
  tip.style.left = `${rect.left + rect.width / 2}px`;
  tip.style.top = `${rect.top - 12}px`;
  tip.style.display = 'block';

  const tipH = tip.offsetHeight;
  const gap = 8; // pixels between button and tooltip
  let top = rect.top - tipH - gap;

  const minX = 8;
  const maxX = window.innerWidth - 8;
  const centerX = rect.left + rect.width / 2;

  tip.style.left = `${Math.max(minX, Math.min(maxX, centerX))}px`;
  tip.style.top = `${Math.max(8, top)}px`;
}

function showTooltipFor(targetEl) {
  positionTooltipFor(targetEl);
  activeTooltipTarget = targetEl;
}

function hideTooltip() {
  const tip = document.getElementById('st-tooltip');
  if (tip) tip.style.display = 'none';
  activeTooltipTarget = null;
}

let activeTooltipTarget = null;

// Reposition while visible on scroll/resize (debounced with rAF)
let rafId = 0;
function requestReposition() {
  if (!activeTooltipTarget) return;
  if (rafId) cancelAnimationFrame(rafId);
  rafId = requestAnimationFrame(() => {
    if (activeTooltipTarget) positionTooltipFor(activeTooltipTarget);
  });
}
window.addEventListener('scroll', requestReposition, true);
window.addEventListener('resize', requestReposition, true);

// Reddit tooltip system (CSS-based, traditional tooltips)
function attachRedditTooltipHandlers() {
  const root = document.documentElement;
  let redditTooltipTimeout = null;

  root.addEventListener('mouseover', (e) => {
    const btn = e.target?.closest('.speedthreads-button[data-platform="reddit"]');
    if (btn) {
      // Clear any existing timeout
      if (redditTooltipTimeout) {
        clearTimeout(redditTooltipTimeout);
      }
      // Show Reddit tooltip after 500ms delay
      redditTooltipTimeout = setTimeout(() => {
        btn.setAttribute('data-tooltip', 'true');
      }, 700);
    }
  }, true);

  root.addEventListener('mouseout', (e) => {
    const from = e.target;
    const to = e.relatedTarget || null;
    const leftBtn = from?.closest('.speedthreads-button[data-platform="reddit"]');
    const enteredBtn = to?.closest?.('.speedthreads-button[data-platform="reddit"]');
    if (leftBtn && leftBtn !== enteredBtn) {
      // Clear timeout and hide tooltip
      if (redditTooltipTimeout) {
        clearTimeout(redditTooltipTimeout);
        redditTooltipTimeout = null;
      }
      leftBtn.removeAttribute('data-tooltip');
    }
  }, true);
}

// X tooltip system (portal-based)
function attachXTooltipHandlers() {
  const root = document.documentElement;
  let xTooltipTimeout = null;

  root.addEventListener('mouseover', (e) => {
    const btn = e.target?.closest('.speedthreads-button[data-platform="x"]');
    if (btn) {
      // Clear any existing timeout
      if (xTooltipTimeout) {
        clearTimeout(xTooltipTimeout);
      }
      // Show X tooltip after 500ms delay
      xTooltipTimeout = setTimeout(() => {
        showTooltipFor(btn);
      }, 500);
    }
  }, true);

  root.addEventListener('mouseout', (e) => {
    const from = e.target;
    const to = e.relatedTarget || null;
    const leftBtn = from?.closest('.speedthreads-button[data-platform="x"]');
    const enteredBtn = to?.closest?.('.speedthreads-button[data-platform="x"]');
    if (leftBtn && leftBtn !== enteredBtn) {
      // Clear timeout and hide tooltip
      if (xTooltipTimeout) {
        clearTimeout(xTooltipTimeout);
        xTooltipTimeout = null;
      }
      hideTooltip();
    }
  }, true);
}

// Attach both tooltip systems
function attachTooltipHandlers() {
  attachRedditTooltipHandlers();
  attachXTooltipHandlers();
}

// Ensure handlers are active
attachTooltipHandlers();

// Chatbot System
class SpeedThreadsChatbot {
  constructor() {
    this.isOpen = false;
    this.messages = [];
    this.timerInterval = null;
    this.startTime = null;
    this.init();
  }

  init() {
    this.createChatbot();
    this.attachEventListeners();
  }

  createChatbot() {
    // Create chatbot container
    const chatbot = document.createElement('div');
    chatbot.id = CONFIG.CHATBOT_ID;
    chatbot.className = 'speedthreads-chatbot';
    chatbot.setAttribute('data-platform', getPlatform());
    
    // Create toggle button
    const toggleButton = document.createElement('button');
    toggleButton.className = 'speedthreads-chatbot-toggle';
    toggleButton.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `;
    
    // Create chat window
    const chatWindow = document.createElement('div');
    chatWindow.className = 'speedthreads-chatbot-window';
    chatWindow.innerHTML = `
      <div class="speedthreads-chatbot-header">
        <div class="speedthreads-chatbot-title">
          <span>speedthreads</span>
        </div>
        <div class="speedthreads-chatbot-actions">
          <button class="speedthreads-chatbot-close">×</button>
        </div>
      </div>
      <div class="speedthreads-chatbot-content">
        <div class="speedthreads-chatbot-messages"></div>
        <div class="speedthreads-chatbot-input-container">
          <input type="text" class="speedthreads-chatbot-input" placeholder="Ask about this thread...">
          <button class="speedthreads-chatbot-send">Send</button>
        </div>
      </div>
      <div class="speedthreads-analyzing-overlay" style="display: none;">
        <div class="speedthreads-analyzing-content">
          <div class="thinking-animation">
            <div class="thinking-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
          <div class="analyzing-text">Analyzing thread with GPT-4o mini...</div>
          <div class="analyzing-timer">00:00</div>
        </div>
      </div>
    `;
    
    // Add scroll event handling to messages container
    const messagesContainer = chatWindow.querySelector('.speedthreads-chatbot-messages');
    if (messagesContainer) {
      messagesContainer.addEventListener('wheel', (e) => {
        e.stopPropagation();
        // Allow normal scrolling within the messages container
      }, { passive: true });
      
      messagesContainer.addEventListener('scroll', (e) => {
        e.stopPropagation();
      }, { passive: true });
    }
    
    chatbot.appendChild(toggleButton);
    chatbot.appendChild(chatWindow);
    
    // Add to portal
    const portal = ensurePortal();
    portal.appendChild(chatbot);
    
    // Render messages
    this.renderMessages();
  }

  renderMessages() {
    const messagesContainer = document.querySelector('.speedthreads-chatbot-messages');
    if (!messagesContainer) return;
    
    messagesContainer.innerHTML = '';
    
    this.messages.forEach(message => {
      const messageEl = document.createElement('div');
      messageEl.className = `speedthreads-chatbot-message ${message.type}`;
      messageEl.setAttribute('data-message-id', message.id);
      
      if (message.isThinking) {
        messageEl.innerHTML = `
          <div class="speedthreads-chatbot-message-content thinking-message">
            <div class="thinking-animation">
              <div class="thinking-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
            <span class="thinking-text">${message.content}</span>
          </div>
        `;
      } else {
        if (message.hasRetry) {
          messageEl.innerHTML = `
            <div class="speedthreads-chatbot-message-content">
              ${this.formatMessageContent(message.content)}
            </div>
            <div class="speedthreads-retry-container">
              <button class="speedthreads-retry-button" data-message-id="${message.id}">
                🔄 Retry Analysis
              </button>
            </div>
          `;
        } else {
          messageEl.innerHTML = `
            <div class="speedthreads-chatbot-message-content">
              ${this.formatMessageContent(message.content)}
            </div>
          `;
        }
      }
      
      messagesContainer.appendChild(messageEl);
    });
    
    // Scroll to bottom for vertical layout
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  formatMessageContent(content) {
    // Convert markdown-style formatting to HTML
    let formatted = content
      // Convert **bold** to <strong>bold</strong>
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // Convert *italic* to <em>italic</em>
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      // Convert line breaks
      .replace(/\n/g, '<br>')
      // Convert bullet points
      .replace(/^• /gm, '• ')
      // Convert numbered lists
      .replace(/^\d+\. /gm, (match) => match);
    
    return formatted;
  }


  toggle() {
    // Check if the SpeedThreads button is visible before showing popup
    const button = document.getElementById(CONFIG.BUTTON_ID);
    if (!button || !button.isConnected || button.offsetParent === null) {
      console.log('SpeedThreads: Button not visible, hiding popup');
      this.isOpen = false;
      const chatbot = document.getElementById(CONFIG.CHATBOT_ID);
      if (chatbot) {
        chatbot.classList.remove('open');
      }
      return;
    }

    this.isOpen = !this.isOpen;
    const chatbot = document.getElementById(CONFIG.CHATBOT_ID);
    if (chatbot) {
      chatbot.classList.toggle('open', this.isOpen);
    }
  }

  addMessage(content, type = 'user', id = null, isThinking = false, hasRetry = false) {
    const newMessage = {
      id: id || Date.now(),
      type,
      content,
      timestamp: new Date(),
      isThinking,
      hasRetry
    };
    
    this.messages.push(newMessage);
    this.renderMessages();
  }

  removeMessage(id) {
    this.messages = this.messages.filter(msg => msg.id !== id);
    this.renderMessages();
  }

  showAnalyzing() {
    const overlay = document.querySelector('.speedthreads-analyzing-overlay');
    const timerElement = document.querySelector('.analyzing-timer');
    
    if (overlay) {
      overlay.style.display = 'flex';
      
      // Start timer
      this.startTime = Date.now();
      if (timerElement) {
        timerElement.textContent = '00:00';
      }
      
      // Update timer every second
      this.timerInterval = setInterval(() => {
        if (this.startTime && timerElement) {
          const elapsed = Date.now() - this.startTime;
          const seconds = Math.floor(elapsed / 1000) % 60;
          const minutes = Math.floor(elapsed / (1000 * 60));
          const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
          timerElement.textContent = formattedTime;
        }
      }, 1000);
    }
  }

  hideAnalyzing() {
    const overlay = document.querySelector('.speedthreads-analyzing-overlay');
    const timerElement = document.querySelector('.analyzing-timer');
    
    if (overlay) {
      overlay.style.display = 'none';
      
      // Clear timer
      if (this.timerInterval) {
        clearInterval(this.timerInterval);
        this.timerInterval = null;
      }
      this.startTime = null;
      
      if (timerElement) {
        timerElement.textContent = '00:00';
      }
    }
  }

  handleRetryAnalysis(messageId) {
    // Remove the error message
    this.removeMessage(messageId);
    
    // Get current thread data and retry
    const platform = getPlatform();
    let threadData;
    
    if (platform === 'reddit') {
      threadData = scrapeRedditContent();
    } else {
      threadData = {
        platform: 'x',
        post: { title: '', text: 'X thread analysis not yet implemented', author: '', upvotes: 0, url: window.location.href },
        replies: []
      };
    }
    
    if (threadData) {
      analyzeThread(threadData);
    } else {
      this.addMessage('Sorry, I couldn\'t get the thread data for retry. Please try again.', 'ai');
    }
  }

  attachEventListeners() {
    // Toggle button
    document.addEventListener('click', (e) => {
      if (e.target.closest('.speedthreads-chatbot-toggle')) {
        e.preventDefault();
        e.stopPropagation();
        this.toggle();
      }
    });

    // Close button
    document.addEventListener('click', (e) => {
      if (e.target.closest('.speedthreads-chatbot-close')) {
        e.preventDefault();
        e.stopPropagation();
        this.isOpen = false;
        const chatbot = document.getElementById(CONFIG.CHATBOT_ID);
        if (chatbot) {
          chatbot.classList.remove('open');
        }
      }
    });


    // Send button and Enter key
    document.addEventListener('click', (e) => {
      if (e.target.closest('.speedthreads-chatbot-send')) {
        e.preventDefault();
        e.stopPropagation();
        this.handleSendMessage();
      }
    });

    document.addEventListener('keypress', (e) => {
      if (e.target.closest('.speedthreads-chatbot-input') && e.key === 'Enter') {
        e.preventDefault();
        e.stopPropagation();
        this.handleSendMessage();
      }
    });

    // Prevent scroll propagation from chatbot to page
    document.addEventListener('wheel', (e) => {
      if (e.target.closest('.speedthreads-chatbot')) {
        e.preventDefault();
        e.stopPropagation();
      }
    }, { passive: false });

    // Prevent scroll propagation from chatbot to page
    document.addEventListener('scroll', (e) => {
      if (e.target.closest('.speedthreads-chatbot')) {
        e.preventDefault();
        e.stopPropagation();
      }
    }, { passive: false });

    // Additional scroll prevention for touch events
    document.addEventListener('touchmove', (e) => {
      if (e.target.closest('.speedthreads-chatbot')) {
        e.preventDefault();
        e.stopPropagation();
      }
    }, { passive: false });

    // Retry button event listener
    document.addEventListener('click', (e) => {
      if (e.target.closest('.speedthreads-retry-button')) {
        e.preventDefault();
        e.stopPropagation();
        const messageId = parseInt(e.target.getAttribute('data-message-id'));
        this.handleRetryAnalysis(messageId);
      }
    });
  }

  async handleSendMessage() {
    const input = document.querySelector('.speedthreads-chatbot-input');
    if (!input) return;
    
    const message = input.value.trim();
    if (!message) return;
    
    // Add user message
    this.addMessage(message, 'user');
    
    // Clear input
    input.value = '';
    
    // Show loading message
    const loadingId = Date.now();
    this.addMessage('Thinking...', 'ai', loadingId);
    
    try {
      // Get current thread data
      const platform = getPlatform();
      let threadData;
      
      if (platform === 'reddit') {
        threadData = scrapeRedditContent();
      } else {
        threadData = {
          platform: 'x',
          post: { title: '', text: 'X thread analysis not yet implemented', author: '', upvotes: 0, url: window.location.href },
          replies: []
        };
      }
      
      if (!threadData) {
        this.removeMessage(loadingId);
        this.addMessage('Sorry, I couldn\'t get the thread data. Please try again.', 'ai');
        return;
      }
      
      // Prepare chat request
      const chatRequest = {
        thread_data: threadData,
        messages: this.messages.slice(0, -1).map(msg => ({ // Exclude the loading message
          role: msg.type === 'user' ? 'user' : 'assistant',
          content: msg.content
        })),
        user_message: message
      };
      
      // Send to backend
      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(chatRequest)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      // Remove loading message
      this.removeMessage(loadingId);
      
      // Add AI response
      this.addMessage(result.message, 'ai');
      
      // If this is the first message and we got analysis, show it
      if (result.analysis && this.messages.length <= 3) {
        const analysis = result.analysis;
        let analysisText = `**${analysis.type.toUpperCase()}**\n\n`;
        analysisText += `**TL;DR:** ${analysis.tldr}\n\n`;
        analysisText += `**Summary:**\n`;
        analysis.summary.forEach((point, i) => {
          analysisText += `• ${point}\n`;
        });
        
        if (analysis.best_answer) {
          analysisText += `\n**Best Answer:** ${analysis.best_answer}`;
        }
        if (analysis.controversial) {
          analysisText += `\n\n**Controversial:** ${analysis.controversial}`;
        }
        if (analysis.funny) {
          analysisText += `\n\n**Funny:** ${analysis.funny}`;
        }
        if (analysis.insights) {
          analysisText += `\n\n**Insights:** ${analysis.insights}`;
        }
        
        this.addMessage(analysisText, 'ai');
      }
      
    } catch (error) {
      console.error('Chat error:', error);
      this.removeMessage(loadingId);
      this.addMessage(`Sorry, I encountered an error: ${error.message}. Make sure the backend is running!`, 'ai');
    }
  }
}

// Initialize chatbot
let chatbot = null;

// Function to check if button is visible and hide popup if not
function checkButtonVisibility() {
  const button = document.getElementById(CONFIG.BUTTON_ID);
  const chatbotEl = document.getElementById(CONFIG.CHATBOT_ID);
  
  if (!button || !button.isConnected || button.offsetParent === null) {
    // Button is not visible, hide popup if it's open
    if (chatbotEl && chatbotEl.classList.contains('open')) {
      console.log('SpeedThreads: Button not visible, hiding popup');
      chatbotEl.classList.remove('open');
      if (chatbot) {
        chatbot.isOpen = false;
      }
    }
  }
}

// Check if we're on a supported page
function isSupportedPage() {
  const url = window.location.href;
  return CONFIG.REDDIT_PATTERN.test(url) || CONFIG.X_PATTERN.test(url);
}

// Get platform type
function getPlatform() {
  const url = window.location.href;
  if (CONFIG.REDDIT_PATTERN.test(url)) return 'reddit';
  if (CONFIG.X_PATTERN.test(url)) return 'x';
  return null;
}

// Find the views element in X posts
function findViewsElement(tweetElement) {
  // Look for spans that contain "Views" text
  const spans = tweetElement.querySelectorAll('span');
  for (const span of spans) {
    if (span.textContent && span.textContent.includes('Views')) {
      return span;
    }
  }
  
  // Fallback: look for elements with common X views patterns
  const viewsSelectors = [
    '[data-testid="tweet-text"] + div span', // Common pattern after tweet text
    'div[dir="ltr"] span', // Direction-based selector
    'time + span' // After timestamp
  ];
  
  for (const selector of viewsSelectors) {
    const elements = tweetElement.querySelectorAll(selector);
    for (const element of elements) {
      if (element.textContent && element.textContent.includes('Views')) {
        return element;
      }
    }
  }
  
  return null;
}

// Find the share button in X posts interaction row
function findXShareButton(tweetElement) {
  // Look for the share button in the interaction row
  const shareSelectors = [
    '[data-testid="tweet"] [role="group"] a[aria-label*="Share"]',
    '[data-testid="tweet"] [role="group"] a[aria-label*="share"]',
    'article[role="article"] [role="group"] a[aria-label*="Share"]',
    'article[role="article"] [role="group"] a[aria-label*="share"]',
    '[data-testid="tweet"] [role="group"] a[href*="intent/tweet"]',
    'article[role="article"] [role="group"] a[href*="intent/tweet"]'
  ];
  
  for (const selector of shareSelectors) {
    const shareButton = tweetElement.querySelector(selector);
    if (shareButton) {
      return shareButton;
    }
  }
  
  // Fallback: look for any link in the interaction row that might be share
  const interactionRow = tweetElement.querySelector('[role="group"]');
  if (interactionRow) {
    const links = interactionRow.querySelectorAll('a');
    for (const link of links) {
      const ariaLabel = link.getAttribute('aria-label');
      const href = link.getAttribute('href');
      if ((ariaLabel && ariaLabel.toLowerCase().includes('share')) || 
          (href && href.includes('intent/tweet'))) {
        return link;
      }
    }
  }
  
  return null;
}

// Track current URL for SPA navigation detection
let currentUrl = window.location.href;

// Set up URL change detection for SPA navigation
function setupUrlChangeDetection() {
  // Check for URL changes every 500ms
  setInterval(() => {
    const newUrl = window.location.href;
    if (newUrl !== currentUrl) {
      console.log('SpeedThreads: URL changed from', currentUrl, 'to', newUrl);
      currentUrl = newUrl;
      
      // Check if we're now on a supported page
      if (isSupportedPage()) {
        console.log('SpeedThreads: Navigated to supported page, re-initializing...');
        // Remove existing button if it exists
        const existingButton = document.getElementById(CONFIG.BUTTON_ID);
        if (existingButton) {
          existingButton.remove();
        }
        // Re-initialize injection
        setTimeout(() => {
          initializeInjection();
        }, 1000); // Give the page time to load
      }
    }
  }, 500);
  
  // Also listen for popstate events (back/forward navigation)
  window.addEventListener('popstate', () => {
    setTimeout(() => {
      const newUrl = window.location.href;
      if (newUrl !== currentUrl && isSupportedPage()) {
        console.log('SpeedThreads: Popstate navigation to supported page');
        currentUrl = newUrl;
        const existingButton = document.getElementById(CONFIG.BUTTON_ID);
        if (existingButton) {
          existingButton.remove();
        }
        setTimeout(() => {
          initializeInjection();
        }, 1000);
      }
    }, 100);
  });
}

// Initialize when DOM is ready
function initialize() {
  const platform = getPlatform();
  console.log(`SpeedThreads: ${platform} page detected`);
  
  // Keep service worker alive
  sendKeepAlive();
  
  // Set up URL change detection for SPA navigation
  setupUrlChangeDetection();
  
  // If we're on a supported page, inject immediately
  if (isSupportedPage()) {
    console.log('SpeedThreads: On supported page, initializing injection');
    // Try immediate injection
    initializeInjection();
    
    // Also try after DOM is fully loaded (for refresh cases)
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        console.log('SpeedThreads: DOM loaded, ensuring injection');
        setTimeout(() => {
          if (!document.getElementById(CONFIG.BUTTON_ID)) {
            console.log('SpeedThreads: Button not found after DOM load, re-injecting');
            initializeInjection();
          }
        }, 1000);
      });
    }
  } else {
    console.log('SpeedThreads: On feed page, waiting for navigation to supported page');
  }
}

// Initialize injection logic (separated for re-use)
function initializeInjection() {
  console.log('SpeedThreads: initializeInjection() called');
  
  // Check if we're on a supported page before setting up observer
  if (!isSupportedPage()) {
    console.log('SpeedThreads: Not on supported page, skipping injection setup');
    return;
  }
  
  // Use MutationObserver for robust injection
  const observer = new MutationObserver((mutations, obs) => {
    // Check if any new elements were added that might be Reddit action buttons or X posts
    let shouldTryInjection = false;
    const platform = getPlatform();
    
    mutations.forEach(mutation => {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            if (platform === 'reddit') {
              // Check if this looks like a Reddit action button area or post
              if (node.matches && (
                node.matches('button[aria-label*="Share"]') ||
                node.matches('button[aria-label*="share"]') ||
                node.matches('[data-testid="post-actions"]') ||
                node.matches('.PostActions') ||
                node.matches('div[role="group"]') ||
                node.matches('shreddit-post') ||
                node.matches('article') ||
                node.textContent?.toLowerCase().includes('share')
              )) {
                shouldTryInjection = true;
              }
              
              // Also check children
              if (node.querySelector && (
                node.querySelector('button[aria-label*="Share"]') ||
                node.querySelector('button[aria-label*="share"]') ||
                node.querySelector('[data-testid="post-actions"]') ||
                node.querySelector('.PostActions') ||
                node.querySelector('shreddit-post') ||
                node.querySelector('article')
              )) {
                shouldTryInjection = true;
              }
            } else if (platform === 'x') {
              // Check if this looks like an X post or contains views element
              if (node.matches && (
                node.matches('article[role="article"]') ||
                node.matches('[data-testid="tweet"]') ||
                node.textContent?.includes('Views')
              )) {
                shouldTryInjection = true;
              }
              
              // Also check children for X posts
              if (node.querySelector && (
                node.querySelector('article[role="article"]') ||
                node.querySelector('[data-testid="tweet"]') ||
                node.querySelector('span')?.textContent?.includes('Views')
              )) {
                shouldTryInjection = true;
              }
            }
          }
        });
      }
    });
    
    // Try to inject button if we detected relevant changes
    if (shouldTryInjection || mutations.length > 0) {
      // Always try injection on mutations - let injectButton() handle duplicates
      if (injectButton()) {
        console.log('SpeedThreads: Button injected via MutationObserver');
        // Don't disconnect observer - keep it running for dynamic content
      }
    }
  });

  // Start observing the document body for changes
  try {
    if (document.body) {
      observer.observe(document.body, { 
        childList: true, 
        subtree: true,
        attributes: true,
        attributeFilter: ['class', 'style']
      });
      console.log('SpeedThreads: MutationObserver started');
    } else {
      console.log('SpeedThreads: document.body not ready, waiting...');
      // Wait for document.body to be available
      const checkBody = setInterval(() => {
        if (document.body) {
          clearInterval(checkBody);
          try {
            observer.observe(document.body, { 
              childList: true, 
              subtree: true,
              attributes: true,
              attributeFilter: ['class', 'style']
            });
            console.log('SpeedThreads: MutationObserver started after delay');
          } catch (error) {
            console.error('SpeedThreads: Error starting MutationObserver after delay:', error);
          }
        }
      }, 100);
      
      // Stop trying after 10 seconds
      setTimeout(() => {
        clearInterval(checkBody);
        console.log('SpeedThreads: MutationObserver setup timeout');
      }, 10000);
    }
  } catch (error) {
    console.error('SpeedThreads: Error setting up MutationObserver:', error);
  }

  // Also try immediate injection
  if (!injectButton()) {
    console.log('SpeedThreads: Immediate injection failed, waiting for DOM changes...');
  }

  // Multiple fallback attempts for dynamic loading
  const fallbackAttempts = [1000, 3000, 5000, 10000];
  fallbackAttempts.forEach(delay => {
    setTimeout(() => {
      if (!document.getElementById(CONFIG.BUTTON_ID)) {
        console.log(`SpeedThreads: Fallback injection attempt after ${delay}ms`);
        injectButton();
      }
    }, delay);
  });

  // Periodic re-injection for dynamic content (every 5 seconds for SPA navigation)
  setInterval(() => {
    const button = document.getElementById(CONFIG.BUTTON_ID);
    if (!button || !button.isConnected || button.offsetParent === null) {
      console.log('SpeedThreads: Periodic re-injection attempt');
      injectButton();
    }
    
    // Check button visibility and hide popup if needed
    checkButtonVisibility();
  }, 5000);
  
  // Also check on page visibility change (for SPA navigation)
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      setTimeout(() => {
        const button = document.getElementById(CONFIG.BUTTON_ID);
        if (!button || !button.isConnected || button.offsetParent === null) {
          console.log('SpeedThreads: Re-injection on visibility change');
          injectButton();
        }
        
        // Check button visibility and hide popup if needed
        checkButtonVisibility();
      }, 1000);
    }
  });
  
  // Send periodic keep-alive messages to prevent service worker from going inactive
  setInterval(() => {
    sendKeepAlive();
  }, 30000); // Every 30 seconds
  
  // Additional SPA navigation detection - check for major content changes
  let lastContentHash = '';
  setInterval(() => {
    const platform = getPlatform();
    let contentHash = '';
    
    if (platform === 'reddit') {
      const postElement = document.querySelector('shreddit-post') || document.querySelector('article');
      if (postElement) {
        contentHash = postElement.innerHTML.length + postElement.textContent.length;
      }
    } else if (platform === 'x') {
      const tweetElement = document.querySelector('[data-testid="tweet"]') || document.querySelector('article[role="article"]');
      if (tweetElement) {
        contentHash = tweetElement.innerHTML.length + tweetElement.textContent.length;
      }
    }
    
    if (contentHash && contentHash !== lastContentHash) {
      console.log('SpeedThreads: Content changed, attempting injection');
      lastContentHash = contentHash;
      setTimeout(() => {
        injectButton();
      }, 500);
    }
  }, 2000); // Check every 2 seconds
  
  // Aggressive button check for post pages (every 1 second)
  if (isSupportedPage()) {
    setInterval(() => {
      const button = document.getElementById(CONFIG.BUTTON_ID);
      if (!button || !button.isConnected || button.offsetParent === null) {
        console.log('SpeedThreads: Post page - button missing, re-injecting');
        injectButton();
      }
      
      // Check button visibility and hide popup if needed
      checkButtonVisibility();
    }, 1000); // Check every 1 second on post pages
    
    // Additional safety net for post page refreshes
    window.addEventListener('load', () => {
      console.log('SpeedThreads: Window loaded on post page, ensuring button exists');
      setTimeout(() => {
        if (!document.getElementById(CONFIG.BUTTON_ID)) {
          console.log('SpeedThreads: Button missing after window load, injecting');
          initializeInjection();
        }
      }, 2000);
    });
  }
}

// Send keep-alive message to background script
function sendKeepAlive() {
  try {
    chrome.runtime.sendMessage({ type: 'KEEP_ALIVE' }, (response) => {
      if (chrome.runtime.lastError) {
        console.log('SpeedThreads: Keep-alive failed:', chrome.runtime.lastError);
      } else {
        console.log('SpeedThreads: Keep-alive sent');
      }
    });
  } catch (error) {
    console.log('SpeedThreads: Keep-alive error:', error);
  }
}

// Inject the summarize button
function injectButton() {
  // Check if button already exists
  const existingButton = document.getElementById(CONFIG.BUTTON_ID);
  if (existingButton) {
    // Check if button is still visible and properly attached
    if (existingButton.isConnected && existingButton.offsetParent !== null) {
      return true; // Button already exists and is visible
    } else {
      // Button exists but is not visible, remove it and re-inject
      console.log('SpeedThreads: Removing orphaned button');
      existingButton.remove();
    }
  }

  const platform = getPlatform();
  let targetElement;

  if (platform === 'reddit') {
    // Look for the main post container
    targetElement = document.querySelector('shreddit-post') ||
                   document.querySelector('article') ||
                   document.querySelector('main') ||
                   document.querySelector('[role="main"]');
    
    if (targetElement) {
      // Look for the action bar with share button specifically
      const actionBar = targetElement.querySelector('[data-testid="post-actions"]') ||
                       targetElement.querySelector('.PostActions') ||
                       targetElement.querySelector('[data-click-id="actions"]') ||
                       targetElement.querySelector('div[role="group"]');
      
      if (actionBar) {
        targetElement = actionBar;
      } else {
        // Fallback: Look for share button anywhere in the post
        const shareButton = targetElement.querySelector('button[aria-label*="Share"]') ||
                           targetElement.querySelector('button[aria-label*="share"]') ||
                           Array.from(targetElement.querySelectorAll('button')).find(btn => 
                             btn.textContent && btn.textContent.toLowerCase().includes('share')
                           );
        
        if (shareButton && shareButton.parentNode) {
          targetElement = shareButton.parentNode;
        }
      }
    }
    
  } else if (platform === 'x') {
    // Find X post container
    targetElement = document.querySelector('[data-testid="tweet"]') ||
                   document.querySelector('article[role="article"]');
    
    if (targetElement) {
      // Look for the share button in the interaction row
      const shareButton = findXShareButton(targetElement);
      if (shareButton && shareButton.parentNode) {
        targetElement = shareButton.parentNode; // This should be the interaction row
      } else {
        // Fallback: look for the interaction row directly
        const interactionRow = targetElement.querySelector('[role="group"]');
        if (interactionRow) {
          targetElement = interactionRow;
        }
      }
    }
  }

  if (targetElement) {
    const button = createButton();
    
    // Try to insert next to share button on Reddit or views element on X
    if (platform === 'reddit') {
      const shareButton = targetElement.querySelector('button[aria-label*="Share"]') ||
                         targetElement.querySelector('button[aria-label*="share"]') ||
                         Array.from(targetElement.querySelectorAll('button')).find(btn => 
                           btn.textContent && btn.textContent.toLowerCase().includes('share')
                         );
      
      if (shareButton && shareButton.parentNode) {
        // Insert the button right after the share button with no extra spacing
        shareButton.parentNode.insertBefore(button, shareButton.nextSibling);
        console.log('SpeedThreads: Button inserted next to share button');
      } else {
        targetElement.appendChild(button);
        console.log('SpeedThreads: Button appended to target element');
      }
    } else if (platform === 'x') {
      // For X, try to insert next to the share button in the interaction row
      const tweetElement = document.querySelector('[data-testid="tweet"]') || 
                          document.querySelector('article[role="article"]');
      const shareButton = findXShareButton(tweetElement);
      
      if (shareButton && shareButton.parentNode) {
        // Insert the button right after the share button
        shareButton.parentNode.insertBefore(button, shareButton.nextSibling);
        console.log('SpeedThreads: Button inserted next to share button in interaction row');
        
        // Ensure the parent container (interaction row) allows inline elements
        const parent = shareButton.parentNode;
        if (parent.style.display === 'block') {
          parent.style.display = 'flex';
          parent.style.alignItems = 'center';
          parent.style.gap = '8px'; // Increased gap for better spacing
          parent.style.flexWrap = 'nowrap';
          console.log('SpeedThreads: Changed parent display to flex for X interaction row');
        }
      } else {
        // Fallback: append to the interaction row
        targetElement.appendChild(button);
        console.log('SpeedThreads: Button appended to interaction row');
      }
    } else {
      targetElement.appendChild(button);
      console.log('SpeedThreads: Button appended to target element');
    }
    
    console.log('SpeedThreads: Button injected successfully');
    return true;
  } else {
    console.log('SpeedThreads: Could not find target element for button injection');
    return false;
  }
}

// Create the summarize button
function createButton() {
  const platform = getPlatform();
  const button = document.createElement('button');
  button.id = CONFIG.BUTTON_ID;
  button.className = 'button border-md overflow-visible flex flex-row justify-center items-center h-xl font-semibold relative text-12 button-secondary inline-flex items-center px-sm speedthreads-button';
  button.setAttribute('aria-label', 'Summarize with SpeedThreads');
  button.type = 'button';
  button.setAttribute('data-speedthreads', 'true');
  button.setAttribute('data-platform', platform);
  
  // Create the inner structure
  const span = document.createElement('span');
  span.className = 'flex items-center';
  span.textContent = 'speedthreads';
  
  button.appendChild(span);
  
  
  // Add click event listener with capture phase to ensure we handle it first
  button.addEventListener('click', handleSummarizeClick, true);
  
  return button;
}

// Reddit Content Scraper
function scrapeRedditContent() {
  console.log('SpeedThreads: Starting Reddit content scraping...');
  
  try {
    // Find the main post container
    const postElement = document.querySelector('shreddit-post') || 
                       document.querySelector('article[data-testid="post-container"]') ||
                       document.querySelector('article');
    
    if (!postElement) {
      console.error('SpeedThreads: Could not find Reddit post container');
      return null;
    }

    // Extract post content
    const postData = extractRedditPost(postElement);
    
    // Extract replies/comments
    const replies = extractRedditReplies();
    
    const threadData = {
      platform: 'reddit',
      post: postData,
      replies: replies
    };
    
    console.log('SpeedThreads: Reddit content scraped successfully:', threadData);
    return threadData;
    
  } catch (error) {
    console.error('SpeedThreads: Error scraping Reddit content:', error);
    return null;
  }
}

// Simplified scraper - no upvotes or type detection

// Extract main Reddit post data
function extractRedditPost(postElement) {
  const post = {
    title: '',
    text: '',
    author: '',
    url: window.location.href
  };

  console.log('SpeedThreads: Extracting post data...');

  // Extract title
  const titleElement = postElement.querySelector('[data-testid="post-content"] h1') ||
                      postElement.querySelector('h1[slot="title"]') ||
                      postElement.querySelector('h1') ||
                      postElement.querySelector('[slot="title"]');
  
  if (titleElement) {
    post.title = titleElement.textContent?.trim() || '';
  }

  // Extract post text content
  const textElement = postElement.querySelector('[data-testid="post-content"] [slot="text-body"]') ||
                     postElement.querySelector('[slot="text-body"]') ||
                     postElement.querySelector('[data-testid="post-content"] p') ||
                     postElement.querySelector('.post-content') ||
                     postElement.querySelector('[data-click-id="text-body"]');
  
  if (textElement) {
    post.text = textElement.textContent?.trim() || '';
  }

  // Skip author extraction - not needed
  post.author = '';

  console.log(`SpeedThreads: Post title: "${post.title}"`);
  console.log(`SpeedThreads: Post text: "${post.text.substring(0, 100)}..."`);

  return post;
}

// Extract Reddit replies/comments
function extractRedditReplies() {
  const replies = [];
  
  console.log('SpeedThreads: Extracting comments...');
  
  // Try multiple selectors for comments
  const commentSelectors = [
    'div[data-testid="comment"]',
    'shreddit-comment',
    '[data-testid="comment"]',
    '.Comment',
    '[data-click-id="comment"]'
  ];
  
  let commentElements = [];
  
  for (const selector of commentSelectors) {
    commentElements = document.querySelectorAll(selector);
    if (commentElements.length > 0) {
      console.log(`SpeedThreads: Found ${commentElements.length} comments using selector: ${selector}`);
      break;
    }
  }
  
  if (commentElements.length === 0) {
    console.log('SpeedThreads: No comments found with any selector');
    return replies;
  }

  // Process each comment (limit to first 20 for performance)
  const maxComments = Math.min(commentElements.length, 20);
  
  for (let i = 0; i < maxComments; i++) {
    const commentElement = commentElements[i];
    const reply = extractRedditComment(commentElement);
    
    if (reply && reply.text.trim()) {
      replies.push(reply);
    }
  }
  
  console.log(`SpeedThreads: Extracted ${replies.length} replies`);
  return replies;
}

// Extract individual Reddit comment
function extractRedditComment(commentElement) {
  const reply = {
    text: '',
    author: ''
  };

  // Extract comment text using the correct selector
  const textElement = commentElement.querySelector('p');
  if (textElement) {
    reply.text = textElement.textContent?.trim() || '';
  }

  // Skip author extraction - not needed
  reply.author = '';

  return reply;
}

// Backend API configuration
const API_BASE_URL = 'http://localhost:8000';

// Test function for DevTools console
window.testSpeedThreads = async function() {
  console.log('🚀 Testing SpeedThreads with GPT-4o mini...');
  
  const platform = getPlatform();
  if (!platform) {
    console.error('❌ Not on a supported page (Reddit or X)');
    return;
  }
  
  console.log(`📱 Platform: ${platform}`);
  
  // Scrape content
  let threadData;
  if (platform === 'reddit') {
    threadData = scrapeRedditContent();
  } else {
    console.log('⚠️ X scraping not implemented yet');
    return;
  }
  
  if (!threadData) {
    console.error('❌ Failed to scrape thread data');
    return;
  }
  
  console.log('📊 Scraped data:', threadData);
  
  try {
    // Test API connection
    console.log('🔌 Testing API connection...');
    const healthResponse = await fetch(`${API_BASE_URL}/health`);
    const health = await healthResponse.json();
    console.log('✅ API Health:', health);
    
    if (!health.openai_configured) {
      console.error('❌ OpenAI not configured. Check your API key in backend/.env');
      return;
    }
    
    // Send to backend for analysis
    console.log('🤖 Sending to GPT-4o mini for analysis...');
    const response = await fetch(`${API_BASE_URL}/summarize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(threadData)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const analysis = await response.json();
    console.log('🎉 Analysis complete!', analysis);
    
    // Display in a nice format
    console.log('\n📋 SPEEDTHREADS ANALYSIS:');
    console.log(`📌 Type: ${analysis.type}`);
    console.log(`⚡ TL;DR: ${analysis.tldr}`);
    console.log('📝 Summary:');
    analysis.summary.forEach((point, i) => {
      console.log(`   ${i + 1}. ${point}`);
    });
    
    if (analysis.best_answer) {
      console.log(`💡 Best Answer: ${analysis.best_answer}`);
    }
    if (analysis.controversial) {
      console.log(`🔥 Controversial: ${analysis.controversial}`);
    }
    if (analysis.funny) {
      console.log(`😄 Funny: ${analysis.funny}`);
    }
    if (analysis.insights) {
      console.log(`🧠 Insights: ${analysis.insights}`);
    }
    
    return analysis;
    
  } catch (error) {
    console.error('❌ Error:', error);
    console.log('💡 Make sure the backend is running: cd backend && uvicorn src.main:app --reload');
    return null;
  }
};

// Handle summarize button click
function handleSummarizeClick(event) {
  // Prevent event from bubbling up to parent elements
  event.preventDefault();
  event.stopPropagation();
  event.stopImmediatePropagation();
  
  console.log('SpeedThreads: Summarize button clicked');
  
  // Show chatbot when button is clicked
  if (!chatbot) {
    chatbot = new SpeedThreadsChatbot();
  }
  chatbot.toggle();
  
  // Scrape content and send to backend
  const platform = getPlatform();
  if (platform === 'reddit') {
    const threadData = scrapeRedditContent();
    if (threadData) {
      // Send to backend for analysis
      analyzeThread(threadData);
    } else {
      chatbot.addMessage('Sorry, I couldn\'t scrape the Reddit content. Please try again.', 'ai');
    }
  } else if (platform === 'x') {
    chatbot.addMessage('X/Twitter analysis coming soon! For now, you can test Reddit threads.', 'ai');
  }
  
  // Return false to prevent any default behavior
  return false;
}

// Analyze thread with backend
async function analyzeThread(threadData) {
  try {
    // Show analyzing overlay
    chatbot.showAnalyzing();
    
    const response = await fetch(`${API_BASE_URL}/summarize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(threadData)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const analysis = await response.json();
    
    // Hide analyzing overlay
    chatbot.hideAnalyzing();
    
    // Format analysis for display
    let analysisText = `**${analysis.type.toUpperCase()}**\n\n`;
    analysisText += `**TL;DR:** ${analysis.tldr}\n\n`;
    analysisText += `**Summary:**\n`;
    analysis.summary.forEach((point, i) => {
      analysisText += `• ${point}\n`;
    });
    
    if (analysis.best_answer) {
      analysisText += `\n**Best Answer:** ${analysis.best_answer}`;
    }
    if (analysis.controversial) {
      analysisText += `\n\n**Controversial:** ${analysis.controversial}`;
    }
    if (analysis.funny) {
      analysisText += `\n\n**Funny:** ${analysis.funny}`;
    }
    if (analysis.insights) {
      analysisText += `\n\n**Insights:** ${analysis.insights}`;
    }
    
    chatbot.addMessage(analysisText, 'ai');
    
  } catch (error) {
    console.error('Analysis error:', error);
    // Hide analyzing overlay on error
    chatbot.hideAnalyzing();
    chatbot.addMessage(`Sorry, analysis failed: ${error.message}. Make sure the backend is running!`, 'ai', null, false, true);
  }
}

// Test function to simulate analysis failure
window.testSpeedThreadsFailure = function() {
  console.log('🧪 Testing retry functionality with simulated failure...');
  
  // Show chatbot if not already open
  if (!chatbot) {
    chatbot = new SpeedThreadsChatbot();
  }
  chatbot.toggle();
  
  // Simulate an error message with retry button
  chatbot.addMessage('**OTHER**\n\n**TL;DR:** Analysis failed - please try again\n\n**Summary:**\n• Unable to process thread data\n• Simulated error for testing\n\n**Insights:** Error: Simulated failure for testing retry functionality', 'ai', null, false, true);
  
  console.log('✅ Simulated error message added with retry button. Click the "🔄 Retry Analysis" button to test!');
};

// Initialize when script loads
initialize();

