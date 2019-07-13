const copyCookiesButton = document.querySelector('button');
const API_SESSION_COOKIE_NAME = 'api_session';
const VAGOV_SESSION_COOKIE_DEV = 'vagov_session_dev';
const VAGOV_SESSION_COOKIE_STAGING = 'vagov_session_staging';
let VAGOV_SESSION_COOKIE_NAME;

// The domains of the API session cookie
const apiSessionCookieDomains = {
  localhost: 'localhost',
  'staging.va.gov': 'staging-api.va.gov',
};
const vagoSessionCookieDomains = {
  localhost: 'localhost',
  'staging.va.gov': '.va.gov',
};
// The cookie domains
const domainToCookieDomainMap = {
  localhost: 'localhost',
  'staging.va.gov': '.va.gov',
};
// The names of the VAGOV session cookie; we look for a different cookie
// depending on which domain/environment we are in
const domainToVAGOVSessionCookieMap = {
  localhost: VAGOV_SESSION_COOKIE_DEV,
  'staging.va.gov': VAGOV_SESSION_COOKIE_STAGING,
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
          cookie.domain === vagoSessionCookieDomains[domain],
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
