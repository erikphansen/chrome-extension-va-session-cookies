function checkForValidUrl(tabId, changeInfo, tab) {
  const validDomains = [
    'localhost:3001',
    'staging.va.gov',
    'dev.va.gov',
    'va.gov',
  ];
  if (tab.url && validDomains.some(domain => tab.url.includes(domain))) {
    chrome.pageAction.show(tabId);
  }
}

chrome.tabs.onUpdated.addListener(checkForValidUrl);
