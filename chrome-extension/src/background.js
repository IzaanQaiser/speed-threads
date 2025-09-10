// SpeedThreads Background Service Worker
console.log('SpeedThreads background service worker loaded');

// Keep service worker alive
let keepAliveInterval;

// Handle extension installation
chrome.runtime.onInstalled.addListener((details) => {
  console.log('SpeedThreads extension installed:', details);
  startKeepAlive();
});

// Handle messages from content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Background received message:', request);
  
  if (request.type === 'KEEP_ALIVE') {
    // Respond to keep-alive messages
    sendResponse({ status: 'alive' });
    return true; // Keep message channel open for async response
  }
  
  // TODO: Handle API calls to backend
});

// Start keep-alive mechanism
function startKeepAlive() {
  // Clear any existing interval
  if (keepAliveInterval) {
    clearInterval(keepAliveInterval);
  }
  
  // Send keep-alive message every 20 seconds
  keepAliveInterval = setInterval(() => {
    chrome.runtime.getPlatformInfo((info) => {
      // This keeps the service worker alive
      console.log('SpeedThreads: Keep-alive ping');
    });
  }, 20000);
}

// Start keep-alive when service worker starts
startKeepAlive();
