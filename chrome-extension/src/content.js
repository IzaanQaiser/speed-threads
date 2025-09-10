// SpeedThreads Content Script
console.log('SpeedThreads content script loaded');

// Configuration
const CONFIG = {
  REDDIT_PATTERN: /reddit\.com\/r\/[^\/]+\/comments\/[^\/]+/,
  X_PATTERN: /x\.com\/[^\/]+\/status\/\d+/,
  BUTTON_ID: 'speedthreads-summarize-btn',
  MODAL_ID: 'speedthreads-modal'
};

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

// Initialize when DOM is ready
function initialize() {
  if (!isSupportedPage()) {
    console.log('SpeedThreads: Unsupported page');
    return;
  }

  const platform = getPlatform();
  console.log(`SpeedThreads: ${platform} page detected`);
  
  // Wait for page to be fully loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(injectButton, 1000); // Wait a bit for dynamic content
    });
  } else {
    setTimeout(injectButton, 1000);
  }
}

// Inject the summarize button
function injectButton() {
  // Check if button already exists
  if (document.getElementById(CONFIG.BUTTON_ID)) {
    return;
  }

  const platform = getPlatform();
  let targetElement;

  if (platform === 'reddit') {
    // Find Reddit post container
    targetElement = document.querySelector('[data-testid="post-content"]') || 
                   document.querySelector('.Post') ||
                   document.querySelector('[data-testid="post-container"]');
  } else if (platform === 'x') {
    // Find X post container
    targetElement = document.querySelector('[data-testid="tweet"]') ||
                   document.querySelector('article[role="article"]');
  }

  if (targetElement) {
    const button = createButton();
    targetElement.appendChild(button);
    console.log('SpeedThreads: Button injected successfully');
  } else {
    console.log('SpeedThreads: Could not find target element for button injection');
  }
}

// Create the summarize button
function createButton() {
  const button = document.createElement('button');
  button.id = CONFIG.BUTTON_ID;
  button.className = 'speedthreads-button';
  button.innerHTML = '✨ Summarize with SpeedThreads';
  button.addEventListener('click', handleSummarizeClick);
  return button;
}

// Handle summarize button click
function handleSummarizeClick() {
  console.log('SpeedThreads: Summarize button clicked');
  // TODO: Implement scraping and API call
  alert('SpeedThreads: Summarize feature coming soon!');
}

// Initialize when script loads
initialize();
