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
    this.messages = [
      {
        id: 1,
        type: 'ai',
        content: 'Hi! I\'m SpeedThreads AI. I can help you summarize and understand complex discussions on Reddit and X.',
        timestamp: new Date(Date.now() - 300000) // 5 minutes ago
      },
      {
        id: 2,
        type: 'user',
        content: 'Can you summarize this Reddit thread for me?',
        timestamp: new Date(Date.now() - 240000) // 4 minutes ago
      },
      {
        id: 3,
        type: 'ai',
        content: 'Of course! I\'ve analyzed the thread and here\'s a summary:\n\n**Main Topic:** Discussion about the latest tech trends\n**Key Points:**\n• User A shared insights about AI developments\n• User B raised concerns about privacy\n• Community consensus on responsible AI use\n\n**TL;DR:** A thoughtful discussion on balancing AI innovation with ethical considerations.',
        timestamp: new Date(Date.now() - 180000) // 3 minutes ago
      },
      {
        id: 4,
        type: 'user',
        content: 'That\'s really helpful! Can you also suggest a good reply?',
        timestamp: new Date(Date.now() - 120000) // 2 minutes ago
      }
    ];
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
          <div class="speedthreads-chatbot-avatar">🤖</div>
          <div>
            <h3>SpeedThreads AI</h3>
            <span class="speedthreads-chatbot-status">Online</span>
          </div>
        </div>
        <button class="speedthreads-chatbot-close">×</button>
      </div>
      <div class="speedthreads-chatbot-messages"></div>
      <div class="speedthreads-chatbot-input-container">
        <input type="text" class="speedthreads-chatbot-input" placeholder="Type your message...">
        <button class="speedthreads-chatbot-send">Send</button>
      </div>
    `;
    
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
      messageEl.innerHTML = `
        <div class="speedthreads-chatbot-message-content">
          ${message.content.replace(/\n/g, '<br>')}
        </div>
      `;
      messagesContainer.appendChild(messageEl);
    });
    
    // Scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }


  toggle() {
    this.isOpen = !this.isOpen;
    const chatbot = document.getElementById(CONFIG.CHATBOT_ID);
    if (chatbot) {
      chatbot.classList.toggle('open', this.isOpen);
    }
  }

  addMessage(content, type = 'user') {
    const newMessage = {
      id: Date.now(),
      type,
      content,
      timestamp: new Date()
    };
    
    this.messages.push(newMessage);
    this.renderMessages();
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
      if (e.target.closest('.speedthreads-chatbot-messages')) {
        e.stopPropagation();
      }
    }, { passive: false });

    // Prevent scroll propagation from chatbot to page
    document.addEventListener('scroll', (e) => {
      if (e.target.closest('.speedthreads-chatbot-messages')) {
        e.stopPropagation();
      }
    }, { passive: false });
  }

  handleSendMessage() {
    const input = document.querySelector('.speedthreads-chatbot-input');
    if (!input) return;
    
    const message = input.value.trim();
    if (!message) return;
    
    // Add user message
    this.addMessage(message, 'user');
    
    // Clear input
    input.value = '';
    
    // Simulate AI response (for demo)
    setTimeout(() => {
      this.addMessage('Thanks for your message! I\'m here to help with thread summaries and analysis.', 'ai');
    }, 1000);
  }
}

// Initialize chatbot
let chatbot = null;

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

// Handle summarize button click
function handleSummarizeClick(event) {
  // Prevent event from bubbling up to parent elements
  event.preventDefault();
  event.stopPropagation();
  event.stopImmediatePropagation();
  
  console.log('SpeedThreads: Summarize button clicked');
  console.log('yooo');
  
  // Show chatbot when button is clicked
  if (!chatbot) {
    chatbot = new SpeedThreadsChatbot();
  }
  chatbot.toggle();
  
  // Return false to prevent any default behavior
  return false;
}

// Initialize when script loads
initialize();
