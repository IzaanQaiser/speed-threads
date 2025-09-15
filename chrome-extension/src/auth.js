// SpeedThreads Authentication Utilities
console.log('SpeedThreads auth utilities loaded');

// Supabase configuration for extension
const SUPABASE_CONFIG = {
  url: 'https://ftevaxiungavygbabslo.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ0ZXZheGl1bmdhdnlnYmFic2xvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5Mzg0MjcsImV4cCI6MjA3MzUxNDQyN30.OKKTl_Fb6CTrl4uQMY6FWgHUXzCrzVq1zx_IaIOERRI'
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
 * Check if user is authenticated by validating stored token
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
    
    // Validate token with Supabase
    const isValid = await validateToken(token);
    if (!isValid) {
      console.log('SpeedThreads: Token validation failed');
      // Clear invalid token
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
 * Validate JWT token with Supabase
 * @param {string} token - JWT token to validate
 * @returns {Promise<boolean>} True if valid, false otherwise
 */
async function validateToken(token) {
  try {
    const response = await fetch(`${SUPABASE_CONFIG.url}/auth/v1/user`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'apikey': SUPABASE_CONFIG.anonKey
      }
    });
    
    if (response.ok) {
      const user = await response.json();
      console.log('SpeedThreads: Token validation successful for user:', user.id);
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
  setupAuthListener
};
