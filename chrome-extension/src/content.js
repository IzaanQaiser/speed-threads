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
  
  // Use MutationObserver for robust injection
  const observer = new MutationObserver((mutations, obs) => {
    // Check if button already exists
    if (document.getElementById(CONFIG.BUTTON_ID)) {
      return;
    }
    
    // Check if any new elements were added that might be Reddit action buttons
    let shouldTryInjection = false;
    
    mutations.forEach(mutation => {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            // Check if this looks like a Reddit action button area
            if (node.matches && (
              node.matches('button[aria-label*="Share"]') ||
              node.matches('button[aria-label*="share"]') ||
              node.matches('[data-testid="post-actions"]') ||
              node.matches('.PostActions') ||
              node.matches('div[role="group"]') ||
              node.textContent?.toLowerCase().includes('share')
            )) {
              shouldTryInjection = true;
            }
            
            // Also check children
            if (node.querySelector && (
              node.querySelector('button[aria-label*="Share"]') ||
              node.querySelector('button[aria-label*="share"]') ||
              node.querySelector('[data-testid="post-actions"]') ||
              node.querySelector('.PostActions')
            )) {
              shouldTryInjection = true;
            }
          }
        });
      }
    });
    
    // Try to inject button if we detected relevant changes
    if (shouldTryInjection || mutations.length > 0) {
      if (injectButton()) {
        console.log('SpeedThreads: Button injected via MutationObserver');
        obs.disconnect(); // Stop observing once successful
      }
    }
  });

  // Start observing the document body for changes
  observer.observe(document.body, { 
    childList: true, 
    subtree: true,
    attributes: true,
    attributeFilter: ['class', 'style']
  });

  // Also try immediate injection
  if (!injectButton()) {
    console.log('SpeedThreads: Immediate injection failed, waiting for DOM changes...');
  }

  // Fallback: Try again after a delay
  setTimeout(() => {
    if (!document.getElementById(CONFIG.BUTTON_ID)) {
      console.log('SpeedThreads: Fallback injection attempt');
      injectButton();
    }
  }, 3000);

  // Clean up observer after 30 seconds
  setTimeout(() => {
    observer.disconnect();
    console.log('SpeedThreads: Observer disconnected after timeout');
  }, 30000);
}

// Inject the summarize button
function injectButton() {
  // Check if button already exists
  if (document.getElementById(CONFIG.BUTTON_ID)) {
    return true; // Button already exists
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
  }

  if (targetElement) {
    const button = createButton();
    
    // Try to insert next to share button on Reddit
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
  const button = document.createElement('button');
  button.id = CONFIG.BUTTON_ID;
  button.className = 'button border-md overflow-visible flex flex-row justify-center items-center h-xl font-semibold relative text-12 button-secondary inline-flex items-center px-sm speedthreads-button';
  button.setAttribute('aria-label', 'Summarize with SpeedThreads');
  button.type = 'button';
  button.setAttribute('data-speedthreads', 'true');
  
  // Create the inner structure like Reddit's buttons
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
  // TODO: Implement scraping and API call
  alert('SpeedThreads: Summarize feature coming soon!');
  
  // Return false to prevent any default behavior
  return false;
}

// Initialize when script loads
initialize();
