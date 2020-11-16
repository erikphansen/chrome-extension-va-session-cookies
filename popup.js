const copyCookiesButton = document.querySelector('button');
const API_COOKIE_NAME = 'api_session';
let SESSION_COOKIE_NAME;

const DOMAINS = {
  LOCAL: 'localhost',
  DEV: 'dev.va.gov',
  STAGING: 'staging.va.gov',
  PROD: 'www.va.gov',
};

// The cookie domains (where to get the cookies from)
const domainToCookieDomainMap = {
  [DOMAINS.LOCAL]: 'localhost',
  [DOMAINS.DEV]: '.va.gov',
  [DOMAINS.STAGING]: '.va.gov',
  [DOMAINS.PROD]: '.va.gov',
};
// The domains of the API session cookie
const apiSessionCookieDomains = {
  [DOMAINS.LOCAL]: 'localhost',
  [DOMAINS.DEV]: 'dev-api.va.gov',
  [DOMAINS.STAGING]: 'staging-api.va.gov',
  [DOMAINS.PROD]: 'api.va.gov',
};
// The domains of the VAGOV session cookie
const vagovSessionCookieDomains = {
  [DOMAINS.LOCAL]: 'localhost',
  [DOMAINS.DEV]: '.va.gov',
  [DOMAINS.STAGING]: '.va.gov',
  [DOMAINS.PROD]: '.va.gov',
};
// The possible names of the VAGOV session cookie. The cookie name will depend
// on which environment we are running in. Also, for each environment, the
// cookie name might vary based on the user's auth method. The cookie name for
// each environment used to be stable, but the cookie names have changed. For
// example, when testing locally the cookie name used to be 'vagov_session_dev'
// but it is now 'vagov_saml_request_localhost'. I'm not sure if that change
// affects all users or just some, so we are using an array of possible cookie
// names and will use the first cookie that has a value.
const domainToVAGOVSessionCookieMap = {
  [DOMAINS.LOCAL]: ['vagov_session_dev', 'vagov_saml_request_localhost'],
  [DOMAINS.DEV]: ['vagov_session_dev', 'vagov_saml_request_dev'],
  [DOMAINS.STAGING]: ['vagov_session_staging', 'vagov_saml_request_staging'],
  [DOMAINS.PROD]: ['vagov_session', 'vagov_saml_request_prod'],
};

function logIt(val) {
  chrome.extension.getBackgroundPage().console.log(val);
}

/**
 * Takes the two cookie values and creates a string that will serve as a value
 * for the 'Cookie' header in your REST client
 *
 * @param {string} cookie1 the value of the api cookie
 * @param {string} cookie2 the value of the session cookie
 */
function buildCookieHeaderValue(cookie1, cookie2) {
  if (
    !cookie1 ||
    !cookie2 ||
    typeof cookie1 !== 'string' ||
    typeof cookie2 !== 'string'
  ) {
    alert('Please pass two strings to `buildCookieHeaderValue`');
    window.close();
    return;
  }
  return `${API_COOKIE_NAME}=${cookie1}; ${SESSION_COOKIE_NAME}=${cookie2}`;
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
  const sessionCookieNames = domainToVAGOVSessionCookieMap[domain];
  chrome.cookies.getAll(
    { domain: domainToCookieDomainMap[domain] },
    cookies => {
      let apiSessionCookie = cookies.find(
        cookie =>
          cookie.name === API_COOKIE_NAME &&
          cookie.domain === apiSessionCookieDomains[domain],
      );
      let vagovSessionCookie;
      // try getting the session cookie from all the potential cookie names
      sessionCookieNames.forEach((cookieName) => {
        if (!vagovSessionCookie) {
          vagovSessionCookie = cookies.find(
            (cookie) =>
              cookie.name === cookieName &&
              cookie.domain === vagovSessionCookieDomains[domain],
          )
          if (!!vagovSessionCookie) {
            SESSION_COOKIE_NAME = cookieName
          }
        }
      })
      if (!apiSessionCookie) {
        alert(`Unable to find the '${API_COOKIE_NAME}' cookie!`);
        window.close();
        return;
      }
      if (!vagovSessionCookie) {
        alert(`Unable to find any of the '${SESSION_COOKIE_NAME}' cookies!`);
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
