// SpeedThreads Content Script
console.log('SpeedThreads content script loaded');

// Check if we're on a supported page
function isSupportedPage() {
  const url = window.location.href;
  return url.includes('reddit.com/r/') && url.includes('/comments/') ||
         url.includes('x.com/') && url.includes('/status/');
}

// Initialize when page loads
if (isSupportedPage()) {
  console.log('SpeedThreads: Supported page detected');
  // TODO: Add button injection logic here
} else {
  console.log('SpeedThreads: Unsupported page');
}
