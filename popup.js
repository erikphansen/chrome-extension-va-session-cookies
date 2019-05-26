const API_SESSION_COOKIE = 'api_session';
const VAGOV_SESSION_COOKIE = 'vagov_session_dev';
const copyCookiesButton = document.querySelector('button');

/**
 * A simple helper that shows an alert to the user and then executes a callback
 * after the alert has been dismissed. This is a workaround to deal with the
 * fact that there is no way to pass a callback to window.alert().
 *
 * @param {string} msg The string to pass to the window.alert() call
 * @param {function} callback Optional callback to execute after the alert has
 * been dismissed
 */
function alert(msg, callback = () => {}) {
  new Promise(resolve => {
    window.alert(msg);
    resolve();
  }).then(callback);
}

/**
 *
 * @param {string} alertMsg the message to pass to the JS alert()
 */
function showAlertAndClosePopup(alertMsg) {
  alert(alertMsg, window.close);
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
    throw new TypeError('Please pass two strings to `buildCookieHeaderValue`');
  }
  return `${API_SESSION_COOKIE}=${cookie1}; ${VAGOV_SESSION_COOKIE}=${cookie2}`;
}

function copyToClipboard(string) {
  navigator.clipboard
    .writeText(string)
    .catch(err => {
      alert(`Unable to copy the cookies:\n${err}`);
    })
    .finally(window.close);
}

/**
 * This is where the magic happens: the click handler for the extension's
 * button. It attempts to find the relevant cookies in the browser and then copy
 * them to the clipboard.
 */
copyCookiesButton.onclick = () => {
  chrome.cookies.getAll({ domain: 'localhost' }, cookies => {
    let cookie1 = cookies.find(cookie => cookie.name === API_SESSION_COOKIE);
    let cookie2 = cookies.find(cookie => cookie.name === VAGOV_SESSION_COOKIE);
    if (!cookie1) {
      showAlertAndClosePopup(
        `Unable to find the '${API_SESSION_COOKIE}' cookie!`,
      );
      return;
    }
    if (!cookie2) {
      showAlertAndClosePopup(
        `Unable to find the '${VAGOV_SESSION_COOKIE}' cookie!`,
      );
      return;
    }
    const cookieValue = buildCookieHeaderValue(cookie1.value, cookie2.value);
    copyToClipboard(cookieValue);
  });
};
