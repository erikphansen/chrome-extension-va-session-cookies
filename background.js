function checkForValidUrl(tabId, changeInfo, tab) {
  if (tab.url && tab.url.indexOf('localhost:3001') >= 0) {
    chrome.pageAction.show(tabId);
  }
}

chrome.tabs.onUpdated.addListener(checkForValidUrl);
