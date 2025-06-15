// Content script for Chrome Extension
window.getScreenStreamId = function() {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({type: 'getScreenId'}, function(response) {
      if (response && response.streamId) {
        resolve(response.streamId);
      } else {
        reject(new Error(response?.error || 'Failed to get stream ID'));
      }
    });
  });
};

// Inject extension capability flag
window.isScreenerExtension = true;

console.log('Screener extension content script loaded'); 