/*global chrome, alert, console, document, givenName, familyName, passPhrase, password, domainName, passwordType, setType, temporaryPhraseStore, setPassPhraseScreenState, setPassPhrase */

//Extra variable only present for Chrome Extension
var isChromeExtension = true;
var extHasPassword;


document.addEventListener('DOMContentLoaded', function () {
    // Send a message to the active tab
    chrome.tabs.query({
        active: true,
        currentWindow: true
    }, function (tabs) {
        var activeTab = tabs[0];
        chrome.tabs.sendMessage(activeTab.id, {
            "message": "clicked_browser_action"
        });
    });

});


chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if (request.message === "populate_fields") {
            domainName.value = request.url;
            givenName.value = request.givenName;
            familyName.value = request.familyName;
            extHasPassword = request.hasPassword;

            //console.log('Populate fields password type: ' + request.passwordType);
            setType(request.passwordType);
        }

        if (domainName.value.length > 0) {
            setValuePopulated(domainName);
        }
        if (givenName.value.length > 0) {
            setValuePopulated(givenName);
        }
        if (familyName.value.length > 0) {
            setValuePopulated(familyName);
        }
        //Determine state of password, and set the appropriate values
        if (request.passPhrase.length > 0) {
            //Pass phrase is still being held
            setValuePopulated(passPhrase);
            setPassPhrase(request.passPhrase);
            setPassPhraseScreenState("holding");
        } else if (request.threeCharHash.length > 0 && typeof request.phraseStore.iv !== "undefined") {
            //Pass phrase has been encrypted and requires confirmation of the first three characters
            temporaryPhraseStore.storeValues(request.threeCharHash, request.phraseStore);
            setPassPhraseScreenState("stored");
        } else {
            //Pass phrase is not stored at all and is in standard editing mode
            setPassPhraseScreenState("editing");
        }

    }
);

function generateExtPassword() {

    chrome.runtime.sendMessage({
        "message": "set_password",
        "givenName": givenName.value,
        "familyName": familyName.value,
        "passPhrase": passPhrase.value,
        "password": password.textContent,
        "passwordType": passwordType
    });

}

function storeExtPhrase() {

    chrome.runtime.sendMessage({
        "message": "store_phrase",
        "threeCharHash": temporaryPhraseStore.threeCharHash,
        "phraseStore": temporaryPhraseStore.encData
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
