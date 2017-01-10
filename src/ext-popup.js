/* global chrome, document, passPhrase, password, trimDomainName,
  domainName, passwordType, setType, temporaryPhraseStore,
  setPassPhraseScreenState, userName, securityQuestion, populateValue */

/* exported generateExtPassword,  extHasPassword, storeExtVals, storeExtPhrase
    clearExtPhrase, returnExtAuthToken, removeExtAuthToken */

// Extra variable only present for Chrome Extension
let extHasPassword;
isChromeExtension = true;


document.addEventListener('DOMContentLoaded', function() {
  // Send a message to the active tab
  chrome.tabs.query({
    active: true,
    currentWindow: true,
  }, function(tabs) {
    let activeTab = tabs[0];
    chrome.tabs.sendMessage(activeTab.id, {
      'message': 'clicked_browser_action',
    });
  });
});


chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.message === 'populate_fields') {
      populateValue(domainName, request.url || '');
      populateValue(userName, request.userName || '');
      populateValue(securityQuestion, request.securityQuestion || '');
      populateValue(version, request.version || '1');
      extHasPassword = request.hasPassword;

      // console.log('Populate fields password type: ' + request.passwordType);
      setType(request.passwordType);

      // Determine state of password, and set the appropriate values
      if (request.threeCharHash && request.threeCharHash.length > 0 &&
        request.phraseStore &&
        request.phraseStore.iv) {
        /* Pass phrase has been encrypted and requires confirmation of the
          first three characters */
        let eIV;
        let eCiphertext;
        /* Uint8 values get lost in translation.  Values will need to be
          converted back tio Uint8Array */
        if (!(request.phraseStore.iv instanceof Uint8Array)) {
          let iv = Object.keys(request.phraseStore.iv).map(function(key) {
            return request.phraseStore.iv[key];
          });
          eIV = Uint8Array.from(iv);
        } else {
          eIV = request.phraseStore.iv;
        }

        if (!(request.phraseStore.ciphertext instanceof Uint8Array)) {
          let ciphertext = Object.keys(request.phraseStore.ciphertext).map(
            function(key) {
              return request.phraseStore.ciphertext[key];
            });
          eCiphertext = Uint8Array.from(ciphertext);
        } else {
          eCiphertext = request.phraseStore.ciphertext;
        }

        temporaryPhraseStore.storeValues(request.threeCharHash, {
          iv: eIV,
          ciphertext: eCiphertext,
        });

        passPhrase.parentElement.classList.add('is-dirty');
        setPassPhraseScreenState('stored');
        // Call domain name prep function
        trimDomainName();
      } else {
        // Pass phrase is not stored at all and is in standard editing mode
        setPassPhraseScreenState('editing');
      }
    }
  }
);

/**
* Sends a message to background page when the pasword has been setTimeout
* store open sesame parameters for next time the extension is loaded
*/
function generateExtPassword() {
  chrome.runtime.sendMessage({
    'message': 'set_password',
    'userName': userName.value,
    'securityQuestion': securityQuestion.value,
    'password': password.textContent,
    'passwordType': passwordType,
    'version': version.value,
    'threeCharHash': temporaryPhraseStore.threeCharHash,
    'phraseStore': temporaryPhraseStore.encData,
  });
}

/**
* Sends a message to background page to store open sesame parameters
* for next time the extension is loaded
*/
function storeExtVals() {
  chrome.runtime.sendMessage({
    'message': 'set_values',
    'userName': userName.value,
    'securityQuestion': securityQuestion.value,
    'password': password.textContent,
    'passwordType': passwordType,
    'version': version.value,
    'threeCharHash': temporaryPhraseStore.threeCharHash || '',
    'phraseStore': temporaryPhraseStore.encData || {},
  });
}

/**
* Sends a message to background page to store open sesame encrypted pass phrase
*/
function storeExtPhrase() {
  chrome.runtime.sendMessage({
    'message': 'store_phrase',
    'threeCharHash': temporaryPhraseStore.threeCharHash || '',
    'phraseStore': temporaryPhraseStore.encData || {},
  });
}

/**
* Sends a message to background page to clear a stored encrypted pass phrase
*/
function clearExtPhrase() {
  chrome.runtime.sendMessage({
    'message': 'clear_stored_phrase',
  });
}

/**
* Returns a chrome extension auth token to use in firebase
*/
function returnExtAuthToken() {
  // Request an OAuth token from the Chrome Identity API.
  chrome.identity.getAuthToken({
    interactive: true,
  }, function(token) {
    let returnToken = null;
    if (chrome.runtime.lastError) {
      console.error(chrome.runtime.lastError);
    } else if (token) {
      returnToken = token;
    } else {
      console.error('The OAuth Token was null');
    }

    return returnToken;
  });
}

/**
* Removes a cached auth token
* @param {Object} token - the auth token to remove
*/
function removeExtAuthToken(token) {
  chrome.identity.removeCachedAuthToken({
    token: token,
  }, function() {
    startAuth(interactive);
  });
}
