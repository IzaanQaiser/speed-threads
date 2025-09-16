// SpeedThreads Authentication Utilities
console.log('SpeedThreads auth utilities loaded');

// Backend API configuration
// This is more secure than exposing Supabase credentials directly
const API_CONFIG = {
  baseUrl: 'http://localhost:8000', // Your backend API URL
  endpoints: {
    validateToken: '/auth/validate',
    user: '/auth/user'
  }
};

// Storage keys
const STORAGE_KEYS = {
  TOKEN: 'speedthreads_token',
  USER: 'speedthreads_user',
  AUTHENTICATED: 'speedthreads_authenticated'
};

// Login page URL
const LOGIN_URL = 'http://localhost:3000/login';

/**
 * Check if user is authenticated by checking stored token
 * @returns {Promise<boolean>} True if authenticated, false otherwise
 */
async function isAuthenticated() {
  try {
    // Get stored token from chrome storage
    const result = await chrome.storage.local.get([STORAGE_KEYS.TOKEN, STORAGE_KEYS.USER]);
    const token = result[STORAGE_KEYS.TOKEN];
    const user = result[STORAGE_KEYS.USER];
    
    if (!token || !user) {
      console.log('SpeedThreads: No token or user found in storage');
      return false;
    }
    
    // Check if token is expired (basic JWT expiration check)
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const now = Math.floor(Date.now() / 1000);
      if (payload.exp && payload.exp < now) {
        console.log('SpeedThreads: Token has expired');
        await clearAuthData();
        return false;
      }
    } catch (error) {
      console.log('SpeedThreads: Invalid token format');
      await clearAuthData();
      return false;
    }
    
    console.log('SpeedThreads: User is authenticated');
    return true;
  } catch (error) {
    console.error('SpeedThreads: Authentication check failed:', error);
    return false;
  }
}

/**
 * Validate JWT token with backend API (more secure)
 * @param {string} token - JWT token to validate
 * @returns {Promise<boolean>} True if valid, false otherwise
 */
async function validateToken(token) {
  try {
    const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.validateToken}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ token })
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('SpeedThreads: Token validation successful for user:', result.user?.id);
      return true;
    } else {
      console.log('SpeedThreads: Token validation failed with status:', response.status);
      return false;
    }
  } catch (error) {
    console.error('SpeedThreads: Token validation error:', error);
    return false;
  }
}

/**
 * Store authentication data in chrome storage
 * @param {string} token - JWT token
 * @param {Object} user - User object
 */
async function storeAuthData(token, user) {
  try {
    await chrome.storage.local.set({
      [STORAGE_KEYS.TOKEN]: token,
      [STORAGE_KEYS.USER]: user,
      [STORAGE_KEYS.AUTHENTICATED]: true
    });
    console.log('SpeedThreads: Auth data stored successfully');
  } catch (error) {
    console.error('SpeedThreads: Failed to store auth data:', error);
  }
}

/**
 * Clear authentication data from chrome storage
 */
async function clearAuthData() {
  try {
    await chrome.storage.local.remove([
      STORAGE_KEYS.TOKEN,
      STORAGE_KEYS.USER,
      STORAGE_KEYS.AUTHENTICATED
    ]);
    console.log('SpeedThreads: Auth data cleared');
  } catch (error) {
    console.error('SpeedThreads: Failed to clear auth data:', error);
  }
}

/**
 * Get current user data from storage
 * @returns {Promise<Object|null>} User object or null
 */
async function getCurrentUser() {
  try {
    const result = await chrome.storage.local.get([STORAGE_KEYS.USER]);
    return result[STORAGE_KEYS.USER] || null;
  } catch (error) {
    console.error('SpeedThreads: Failed to get current user:', error);
    return null;
  }
}

/**
 * Get current token from storage
 * @returns {Promise<string|null>} JWT token or null
 */
async function getCurrentToken() {
  try {
    const result = await chrome.storage.local.get([STORAGE_KEYS.TOKEN]);
    return result[STORAGE_KEYS.TOKEN] || null;
  } catch (error) {
    console.error('SpeedThreads: Failed to get current token:', error);
    return null;
  }
}

/**
 * Open login page in new tab
 */
function openLoginPage() {
  chrome.tabs.create({ url: LOGIN_URL });
}

/**
 * Sync authentication data from web app localStorage
 * This function can be called to check if the user is logged in on the web app
 */
async function syncFromWebApp() {
  try {
    // Check if we can access the web app's localStorage
    const tabs = await chrome.tabs.query({ url: 'http://localhost:3000/*' });
    if (tabs.length > 0) {
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
      
      if (results && results[0] && results[0].result) {
        const { token, user } = results[0].result;
        if (token && user) {
          const userObj = JSON.parse(user);
          await storeAuthData(token, userObj);
          console.log('SpeedThreads: Synced auth data from web app');
          return true;
        }
      }
    }
    return false;
  } catch (error) {
    console.error('SpeedThreads: Failed to sync from web app:', error);
    return false;
  }
}

/**
 * Listen for authentication state changes from login page
 */
function setupAuthListener() {
  // Listen for messages from login page
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'AUTH_SUCCESS') {
      console.log('SpeedThreads: Received auth success message');
      storeAuthData(request.token, request.user);
      sendResponse({ success: true });
    } else if (request.type === 'AUTH_LOGOUT') {
      console.log('SpeedThreads: Received logout message');
      clearAuthData();
      sendResponse({ success: true });
    }
  });
}

// Export functions for use in other scripts
window.SpeedThreadsAuth = {
  isAuthenticated,
  validateToken,
  storeAuthData,
  clearAuthData,
  getCurrentUser,
  getCurrentToken,
  openLoginPage,
  setupAuthListener,
  syncFromWebApp
};
