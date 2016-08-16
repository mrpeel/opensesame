/*global chrome, alert, console, document, givenName, familyName, passPhrase, password, domainName, passwordType, setType, temporaryPhraseStore, setPassPhraseScreenState, setPassPhrase, userName, securityQuestion, isChromeExtension */

//Extra variable only present for Chrome Extension
var extHasPassword;
isChromeExtension = true;


document.addEventListener('DOMContentLoaded', function() {
  // Send a message to the active tab
  chrome.tabs.query({
    active: true,
    currentWindow: true
  }, function(tabs) {
    var activeTab = tabs[0];
    chrome.tabs.sendMessage(activeTab.id, {
      "message": "clicked_browser_action"
    });
  });

});


chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.message === "populate_fields") {
      domainName.value = request.url || "";
      givenName.value = request.givenName || "";
      familyName.value = request.familyName || "";
      userName.value = request.userName || "";
      securityQuestion.value = request.securityQuestion || "";
      extHasPassword = request.hasPassword;

      //console.log('Populate fields password type: ' + request.passwordType);
      setType(request.passwordType);

      if (domainName.value.length > 0) {
        setValuePopulated(domainName);
      }
      if (givenName.value.length > 0) {
        setValuePopulated(givenName);
      }
      if (familyName.value.length > 0) {
        setValuePopulated(familyName);
      }
      if (securityQuestion.value.length > 0) {
        setValuePopulated(securityQuestion);
      }
      if (userName.value.length > 0) {
        setValuePopulated(userName);
      }
      //Determine state of password, and set the appropriate values
      /*if (request.passPhrase.length > 0) {
          //Pass phrase is still being held
          setValuePopulated(passPhrase);
          setPassPhrase(request.passPhrase);
          setPassPhraseScreenState("holding");
      } else */
      if (request.threeCharHash && request.threeCharHash.length > 0 &&
        request.phraseStore &&
        request.phraseStore.iv) {
        //Pass phrase has been encrypted and requires confirmation of the first three characters
        var eIV, eCiphertext;
        //Uint8 values get lost in translation.  Values will need to be converted back tio Uint8Array
        if (!(request.phraseStore.iv instanceof Uint8Array)) {
          var iv = Object.keys(request.phraseStore.iv).map(function(key) {
            return request.phraseStore.iv[key];
          });
          eIV = Uint8Array.from(iv);
        } else {
          eIV = request.phraseStore.iv;
        }

        if (!(request.phraseStore.ciphertext instanceof Uint8Array)) {
          var ciphertext = Object.keys(request.phraseStore.ciphertext).map(
            function(key) {
              return request.phraseStore.ciphertext[key];
            });
          eCiphertext = Uint8Array.from(ciphertext);
        } else {
          eCiphertext = request.phraseStore.ciphertext;
        }


        temporaryPhraseStore.storeValues(request.threeCharHash, {
          iv: eIV,
          ciphertext: eCiphertext
        });

        setValuePopulated(passPhrase);
        setPassPhraseScreenState("stored");
      } else {
        //Pass phrase is not stored at all and is in standard editing mode
        setPassPhraseScreenState("editing");
      }
    }
  }
);

function generateExtPassword() {

  chrome.runtime.sendMessage({
    "message": "set_password",
    "givenName": givenName.value,
    "familyName": familyName.value,
    "userName": userName.value,
    "securityQuestion": securityQuestion.value,
    "password": password.textContent,
    "passwordType": passwordType,
    "threeCharHash": temporaryPhraseStore.threeCharHash,
    "phraseStore": temporaryPhraseStore.encData
  });

}

function storeExtVals() {

  chrome.runtime.sendMessage({
    "message": "set_values",
    "givenName": givenName.value,
    "familyName": familyName.value,
    "userName": userName.value,
    "securityQuestion": securityQuestion.value,
    "password": password.textContent,
    "passwordType": passwordType,
    "threeCharHash": temporaryPhraseStore.threeCharHash || "",
    "phraseStore": temporaryPhraseStore.encData || {}
  });


}

function storeExtPhrase() {

  chrome.runtime.sendMessage({
    "message": "store_phrase",
    "threeCharHash": temporaryPhraseStore.threeCharHash || "",
    "phraseStore": temporaryPhraseStore.encData || {}
  });

}


function clearExtPhrase() {

  chrome.runtime.sendMessage({
    "message": "clear_stored_phrase"
  });

}



function setValuePopulated(pElement) {

  pElement.parentElement.classList.add("is-dirty");

}
