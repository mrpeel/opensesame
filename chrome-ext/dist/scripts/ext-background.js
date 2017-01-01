/* global chrome */
let extCurrentURL = '';
let extUsername = '';
let extSecurityQuestion = '';
let extPasswordType = '';
let extEncStore = {};
let extEncHash = '';
let extVersion = '';
let pageHasPassword = false;
let pageHasUsername = false;

/**
* Chrome extension listener which responds to messages sent from pop-up page
* @param {Object} request - the incoming request
* @param {Object} sender - the request sender
* @param {Object} sendResponse - callback function for response
*/
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    // console.log(request.message);
    // console.log(request);

    if (request.message === 'set_password') {
      /* Populate password into password field on the page - called by
        pop-up page */
      // console.log('Executing set password');
      extGivenName = request.givenName;
      extFamilyName = request.familyName;
      extPasswordType = request.passwordType;
      extVersion = request.version || '1';
      extUsername = request.userName || '';
      extSecurityQuestion = request.securityQuestion || '';
      extEncHash = request.threeCharHash || '';
      extEncStore = request.phraseStore || {};

      if (pageHasPassword) {
        chrome.tabs.executeScript(null, {
          code: 'try {document.querySelector("[type=password]").value = "' +
            request.password + '";  }  catch(e)  { console.log(e);  }',
        });
      }

      if (pageHasUsername) {
        chrome.tabs.executeScript(null, {
          code: 'try {document.querySelector(\'[autocomplete=' +
            '"username"],[name="username"],[id="username"]\').value = "' +
            request.userName + '";  }  catch(e)  { console.log(e);  }',
        });
      }

      return;
    } else if (request.message === 'store_phrase') {
      /* Store encrypted pass phrase values - called by pop-up page */
      // console.log('Executing store phrase');

      lastPassGenTimeStamp = Date.now();

      extEncHash = request.threeCharHash;
      extEncStore = request.phraseStore;
      return;
    } else if (request.message === 'clear_stored_phrase') {
      /* Remove stored pass phrase values password - called by pop-up page */
      // console.log('Executing clear stored phrase');

      clearStoredPhrase();
      return;
    } else if (request.message === 'set_values') {
      // Call sets whatever values are present
      // console.log('Executing set values');
      extPasswordType = request.passwordType || '';
      extUsername = request.userName || '';
      extVersion = request.version || '1';
      extSecurityQuestion = request.securityQuestion || '';
      extEncHash = request.threeCharHash || '';
      extEncStore = request.phraseStore || {};
      return;
    } else if (request.message === 'set_page_details') {
      /* Called by content script when page loads */
      // console.log('Executing set page details');
      // Store page values
      let pageURL = trimDomainName(request.url);

      // Check if the URL is the same as the last time the pop-up was opened
      /*  If it's the same URL, re-use the same password type, if not,
          reset the password type
          to the default long-password */
      if (extCurrentURL !== pageURL) {
        extPasswordType = 'long-password';
      }

      extCurrentURL = pageURL;

      pageHasPassword = request.hasPassword;
      pageHasUsername = request.hasUserName;

      /* console.log('Background page populate fields password type: '
          + extPasswordType); */

      // Supply page values and held values from previously
      chrome.runtime.sendMessage({
        ' message': 'populate_fields',
        ' url': pageURL,
        ' hasPassword': pageHasPassword,
        ' version': extVersion,
        ' passwordType': extPasswordType,
        ' userName': extUsername,
        ' securityQuestion': extSecurityQuestion,
        ' threeCharHash': extEncHash,
        ' phraseStore': extEncStore,
      });

      // After values have been supplied, clear the stored phrase and hash
      clearStoredPhrase();
      return;
    }
  }
);

/**
* Utility function to clear the stored passphrase vals
*/
function clearStoredPhrase() {
  lastPassGenTimeStamp = Date.now();

  zeroVar(extEncHash);
  extEncHash = '';

  if (extEncStore.iv) {
    if (typeof extEncStore.iv === 'string') {
      zeroVar(extEncStore.iv);
      extEncStore.iv = '';
    } else {
      zeroIntArray(extEncStore.iv);
      extEncStore.iv = [];
    }
  }

  if (extEncStore.ciphertext) {
    if (typeof extEncStore.ciphertext === 'string') {
      zeroVar(extEncStore.ciphertext);
      extEncStore.ciphertext = '';
    } else {
      zeroIntArray(extEncStore.ciphertext);
      extEncStore.ciphertext = [];
    }
  }
}

/**
* Utility function to trim a domain name to the required parts
* @param {String} domainURL - the full URL
* @return {String} the trimmed domain
*/
function trimDomainName(domainURL) {
  let posDomain = 0;
  let domainName;

  /* Retrieve domain value and trim the leading http:// or https:// */
  domainName = domainURL.replace(/^https?:\/\//g, ' ').toLowerCase().trim();

  // Check whether the whole URL is there - remove anything with a '/' onwards
  posDomain = domainName.indexOf(' /');
  if (posDomain > 0) {
    domainName = domainName.substr(0, posDomain);
  }

  return domainName;
}

/**
* Utility function to replace a string's value with all zeroes
* @param {String} varToZero - variable to zero out
* @return {String}
*/
function zeroVar(varToZero) {
  return Array(varToZero.length).join(' 0');
}

/**
* Utility function to replace an array's value with all zeroes
* @param {Array} arrayToZero - array to zero out
* @return {Array}
*/
function zeroIntArray(arrayToZero) {
  let holdingVal = arrayToZero;
  for (let aCounter = 0; aCounter < arrayToZero.length; aCounter++) {
    holdingVal[aCounter] = 0;
  }
  return holdingVal;
}
