// SpeedThreads Background Service Worker
console.log('SpeedThreads background service worker loaded');

// Keep service worker alive
let keepAliveInterval;

// Handle extension installation
chrome.runtime.onInstalled.addListener(async (details) => {
  console.log('SpeedThreads extension installed:', details);
  
  // On first install, open login page
  if (details.reason === 'install') {
    console.log('SpeedThreads: First install detected, opening login page');
    chrome.tabs.create({ 
      url: 'http://localhost:3000/login',
      active: true 
    });
  }
  
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
  
  if (request.type === 'AUTH_SUCCESS') {
    // Store authentication data
    chrome.storage.local.set({
      speedthreads_token: request.token,
      speedthreads_user: request.user,
      speedthreads_authenticated: true
    });
    console.log('SpeedThreads: Auth data stored from background');
    sendResponse({ success: true });
  }
  
  if (request.type === 'AUTH_LOGOUT') {
    // Clear authentication data
    chrome.storage.local.remove([
      'speedthreads_token',
      'speedthreads_user', 
      'speedthreads_authenticated'
    ]);
    console.log('SpeedThreads: Auth data cleared from background');
    sendResponse({ success: true });
  }
  
  if (request.type === 'CHECK_AUTH') {
    // Check if user is authenticated
    chrome.storage.local.get(['speedthreads_authenticated', 'speedthreads_token'])
      .then(result => {
        const isAuth = result.speedthreads_authenticated && result.speedthreads_token;
        sendResponse({ authenticated: isAuth });
      });
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
