/* global chrome, document, passPhrase, password,
  domainName, passwordType, setType, temporaryPhraseStore,
  setPassPhraseScreenState, userName, securityQuestion, */

/* exported generateExtPassword,  extHasPassword, storeExtVals, storeExtPhrase
    clearExtPhrase */

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

        setValuePopulated(passPhrase);
        setPassPhraseScreenState('stored');
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
* When values are populated from the background page to the pop-up page, this
* function sets the is-dirty class to ensure that labels are rendered
* correctly above the inpt fields
* @param {String} pElement - the name if the element being populated
* @param {String} pValue - the value for the element
*/
function populateValue(pElement, pValue) {
  pElement.value = pValue;
  if (pValue.length > 0) {
    pElement.parentElement.classList.add('is-dirty');
  }
}
