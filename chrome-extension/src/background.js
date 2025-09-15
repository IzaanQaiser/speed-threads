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
    checkAuthenticationStatus().then(isAuth => {
      sendResponse({ authenticated: isAuth });
    });
    return true; // Keep message channel open for async response
  }
  
  // TODO: Handle API calls to backend
});

// Check authentication status with fallback to web app sync
async function checkAuthenticationStatus() {
  try {
    console.log('SpeedThreads: Checking authentication status...');
    
    // First check if we have auth data in extension storage
    const result = await chrome.storage.local.get(['speedthreads_authenticated', 'speedthreads_token', 'speedthreads_user']);
    console.log('SpeedThreads: Stored auth data:', result);
    
    const hasStoredAuth = result.speedthreads_authenticated && result.speedthreads_token;
    
    if (hasStoredAuth) {
      // Check if token is expired
      try {
        const payload = JSON.parse(atob(result.speedthreads_token.split('.')[1]));
        const now = Math.floor(Date.now() / 1000);
        if (payload.exp && payload.exp < now) {
          console.log('SpeedThreads: Stored token has expired');
          await chrome.storage.local.remove(['speedthreads_token', 'speedthreads_user', 'speedthreads_authenticated']);
          return await syncFromWebApp();
        }
        console.log('SpeedThreads: Using stored authentication');
        return true;
      } catch (error) {
        console.log('SpeedThreads: Invalid stored token format');
        await chrome.storage.local.remove(['speedthreads_token', 'speedthreads_user', 'speedthreads_authenticated']);
        return await syncFromWebApp();
      }
    }
    
    // If no stored auth, try to sync from web app
    console.log('SpeedThreads: No stored auth, attempting to sync from web app');
    return await syncFromWebApp();
  } catch (error) {
    console.error('SpeedThreads: Authentication check failed:', error);
    return false;
  }
}

// Sync authentication data from web app localStorage
async function syncFromWebApp() {
  try {
    console.log('SpeedThreads: Attempting to sync from web app...');
    
    // Check if we can access the web app's localStorage
    const tabs = await chrome.tabs.query({ url: 'http://localhost:3000/*' });
    console.log('SpeedThreads: Found web app tabs:', tabs.length);
    
    if (tabs.length > 0) {
      console.log('SpeedThreads: Injecting script into web app tab:', tabs[0].id);
      
      // Inject script to get localStorage data
      const results = await chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        func: () => {
          return {
            token: localStorage.getItem('speedthreads_token'),
            user: localStorage.getItem('speedthreads_user')
          };
        }
      });
      
      console.log('SpeedThreads: Script execution results:', results);
      
      if (results && results[0] && results[0].result) {
        const { token, user } = results[0].result;
        console.log('SpeedThreads: Retrieved from web app - token:', !!token, 'user:', !!user);
        
        if (token && user) {
          const userObj = JSON.parse(user);
          await chrome.storage.local.set({
            speedthreads_token: token,
            speedthreads_user: userObj,
            speedthreads_authenticated: true
          });
          console.log('SpeedThreads: Synced auth data from web app successfully');
          return true;
        } else {
          console.log('SpeedThreads: No auth data found in web app localStorage');
        }
      }
    } else {
      console.log('SpeedThreads: No web app tabs found');
    }
    return false;
  } catch (error) {
    console.error('SpeedThreads: Failed to sync from web app:', error);
    return false;
  }
}

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
