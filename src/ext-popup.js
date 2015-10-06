/*global chrome, alert, console, document, givenName, familyName, passPhrase, password, domainName, passwordType, setType, setPassChangeRequired */

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
            passPhrase.value = request.passPhrase;
            extHasPassword = request.hasPassword;
            console.log('Populate fields password type: ' + request.passwordType);
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
        if (passPhrase.value.length > 0) {
            setValuePopulated(passPhrase);
            setPassChangeRequired();
        }
    }
);

function generateExtPassword() {

    chrome.runtime.sendMessage({
        "message": "set_password",
        "givenName": givenName.value,
        "familyName": familyName.value,
        "passPhrase": passPhrase.value,
        "password": password.value,
        "passwordType": passwordType
    });

}

function setValuePopulated(pElement) {

    pElement.parentElement.classList.add("is-dirty");

}
