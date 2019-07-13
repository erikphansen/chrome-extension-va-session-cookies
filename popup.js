const copyCookiesButton = document.querySelector('button');
const API_SESSION_COOKIE_NAME = 'api_session';
let VAGOV_SESSION_COOKIE_NAME;

const DOMAINS = {
  LOCAL: 'localhost',
  STAGING: 'staging.va.gov',
  DEV: 'dev.va.gov',
  PROD: 'www.va.gov',
};

// The cookie domains (where to get the cookies from)
const domainToCookieDomainMap = {
  [DOMAINS.LOCAL]: 'localhost',
  [DOMAINS.STAGING]: '.va.gov',
  [DOMAINS.DEV]: '.va.gov',
  [DOMAINS.PROD]: '.va.gov',
};
// The domains of the API session cookie
const apiSessionCookieDomains = {
  [DOMAINS.LOCAL]: 'localhost',
  [DOMAINS.STAGING]: 'staging-api.va.gov',
  [DOMAINS.DEV]: 'dev-api.va.gov',
  [DOMAINS.PROD]: 'api.va.gov',
};
// The domains of the VAGOV session cookie
const vagovSessionCookieDomains = {
  [DOMAINS.LOCAL]: 'localhost',
  [DOMAINS.STAGING]: '.va.gov',
  [DOMAINS.DEV]: '.va.gov',
  [DOMAINS.PROD]: '.va.gov',
};
// The names of the VAGOV session cookie; we look for a different cookie
// depending on which domain/environment we are in
const domainToVAGOVSessionCookieMap = {
  [DOMAINS.LOCAL]: 'vagov_session_dev',
  [DOMAINS.STAGING]: 'vagov_session_staging',
  [DOMAINS.DEV]: 'vagov_session_dev',
  [DOMAINS.PROD]: 'vagov_session',
};

function logIt(val) {
  chrome.extension.getBackgroundPage().console.log(val);
}

/**
 * Takes the two cookie values and creates a string that will serve as a value
 * for the 'Cookie' header in your REST client
 *
 * @param {string} cookie1 the value of the api_session cookie
 * @param {string} cookie2 the value of the vagov_session_dev cookie
 */
function buildCookieHeaderValue(cookie1, cookie2) {
  if (
    !cookie1 ||
    !cookie2 ||
    typeof cookie1 != 'string' ||
    typeof cookie2 != 'string'
  ) {
    alert('Please pass two strings to `buildCookieHeaderValue`');
    window.close();
    return;
  }
  return `${API_SESSION_COOKIE_NAME}=${cookie1}; ${VAGOV_SESSION_COOKIE_NAME}=${cookie2}`;
}

function copyToClipboard(string) {
  navigator.clipboard
    .writeText(string)
    .then(() => {
      copyCookiesButton.innerText = 'Cookies copied!';
      setTimeout(() => {
        window.close();
      }, 2000);
    })
    .catch(err => {
      alert(`Unable to copy the cookies:\n${err}`);
      window.close();
    });
}

// Helper to get just the domain out of a full URL
function getDomainFromURL(url) {
  const withoutProtocol = url.split('//').pop();
  const domain = withoutProtocol.split('/').shift();
  const domainWithoutPort = domain.split(':').shift();
  return domainWithoutPort;
}

function getCookies(url) {
  const domain = getDomainFromURL(url);
  VAGOV_SESSION_COOKIE_NAME = domainToVAGOVSessionCookieMap[domain];
  chrome.cookies.getAll(
    { domain: domainToCookieDomainMap[domain] },
    cookies => {
      let apiSessionCookie = cookies.find(
        cookie =>
          cookie.name === API_SESSION_COOKIE_NAME &&
          cookie.domain === apiSessionCookieDomains[domain],
      );
      let vagovSessionCookie = cookies.find(
        cookie =>
          cookie.name === VAGOV_SESSION_COOKIE_NAME &&
          cookie.domain === vagovSessionCookieDomains[domain],
      );
      if (!apiSessionCookie) {
        alert(`Unable to find the '${API_SESSION_COOKIE_NAME}' cookie!`);
        window.close();
        return;
      }
      if (!vagovSessionCookie) {
        alert(`Unable to find the '${VAGOV_SESSION_COOKIE_NAME}' cookie!`);
        window.close();
        return;
      }
      const cookieValue = buildCookieHeaderValue(
        apiSessionCookie.value,
        vagovSessionCookie.value,
      );
      copyToClipboard(cookieValue);
    },
  );
}

// The click handler that kicks everything off
copyCookiesButton.onclick = () => {
  let url;
  chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
    url = tabs[0].url;
    getCookies(url);
  });
};
