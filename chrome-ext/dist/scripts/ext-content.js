/* global chrome, document */

chrome.runtime.onMessage.addListener(
  /**
   * Chrome extension listener which checks whether a page contains
   * a username and password field
   * @param {String} request
   * @param {String} sender
   * @param {Object} sendResponse
   */
  function(request, sender, sendResponse) {
    if (request.message === 'clicked_browser_action') {
      let hasPassword = false;
      let hasUserName = false;
      let passwordFields = document.querySelectorAll('[type=password]');
      let userNameFields = document.querySelectorAll('[autocomplete=' +
        '"username"],[name="username"],[id="username"]');

      // console.log(document.URL);
      if (passwordFields.length === 1) {
        // console.log('Found password field:' + passwordFields[0].id);
        hasPassword = true;
      }

      if (userNameFields.length === 1) {
        // console.log('Found password field:' + passwordFields[0].id);
        hasUserName = true;
      }

      chrome.runtime.sendMessage({
        'message': 'set_page_details',
        'url': document.URL,
        'hasPassword': hasPassword,
        'hasUserName': hasUserName,
      });
    }
  }
);
