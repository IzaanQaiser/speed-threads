// SpeedThreads Background Service Worker
console.log('SpeedThreads background service worker loaded');

// Handle extension installation
chrome.runtime.onInstalled.addListener((details) => {
  console.log('SpeedThreads extension installed:', details);
});

// Handle messages from content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Background received message:', request);
  // TODO: Handle API calls to backend
});
