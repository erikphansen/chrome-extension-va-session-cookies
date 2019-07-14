function checkForValidUrl(tabId, changeInfo, tab) {
  // The list of domains where the extension should be enabled
  const validDomains = [
    // the site runs on port 3001 by default but since that could conceivably
    // change, let's allow this to try to grab the cookies from any localhost
    // port
    'localhost',
    'staging.va.gov',
    'dev.va.gov',
    'va.gov',
  ];
  if (tab.url && validDomains.some(domain => tab.url.includes(domain))) {
    chrome.pageAction.show(tabId);
  }
}

chrome.tabs.onUpdated.addListener(checkForValidUrl);
