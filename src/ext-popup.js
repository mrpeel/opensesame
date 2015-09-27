/*global chrome, alert, console, document, givenName, familyName, passPhrase, password, domainName */

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

function generateExtPassword() {

    chrome.runtime.sendMessage({
        "message": "set_password",
        "givenName": givenName.value,
        "familyName": familyName.value,
        "passPhrase": passPhrase.value,
        "password": password.value
    });

}

chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if (request.message === "populate_fields") {
            domainName.value = request.url;
            givenName.value = request.givenName;
            familyName.value = request.familyName;
            passPhrase.value = request.passPhrase;
            extHasPassword.value = request.hasPassword;
        }
    }
);
