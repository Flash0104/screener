// Background script for Chrome Extension
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'getScreenId') {
    chrome.desktopCapture.chooseDesktopMedia(
      ['screen', 'window', 'tab', 'audio'],
      sender.tab,
      (streamId) => {
        if (streamId) {
          sendResponse({ streamId: streamId });
        } else {
          sendResponse({ error: 'User cancelled or error occurred' });
        }
      }
    );
    return true; // Keep message channel open for async response
  }
});

// Extension installed
chrome.runtime.onInstalled.addListener(() => {
  console.log('Screener extension installed');
}); 