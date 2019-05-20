let copyCookiesButton = document.querySelector('button');

function copyPostmanCookieHeader(cookie1, cookie2) {
  navigator.clipboard
    .writeText(`api_session=${cookie1}; vagov_session_dev=${cookie2}`)
    .then(() => {
      alert(`Localhost cookies copied! You can now paste them into a Postman header named 'Cookie'`);
    })
    .catch(err => {
      alert(`Unable to copy the cookies:\n${err}`);
    });
}

copyCookiesButton.onclick = ({ target }) => {
  chrome.cookies.getAll({ domain: 'localhost' }, cookies => {
    let [cookie1] = cookies.filter(cookie => cookie.name === 'api_session');
    let [cookie2] = cookies.filter(
      cookie => cookie.name === 'vagov_session_dev',
    );
    if (!cookie1) {
      alert('Unable to find the `api_session` cookie!');
      return;
    }
    if (!cookie2) {
      alert('Unable to find the `vagov_session_dev` cookie!');
      return;
    }
    copyPostmanCookieHeader(cookie1.value, cookie2.value);
  });
};
