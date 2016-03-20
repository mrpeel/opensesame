/*global chrome, alert, console, document, window*/
var extCurrentURL = "";
var extGivenName = "";
var extFamilyName = "";
var extPassPhrase = "";
var extPasswordType = "";
var extEncStore = {};
var extEncHash = "";
var pageHasPassword = false;
var lastPassGenTimeStamp;

chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if (request.message === "set_password") {
            /*Populate password into password field on the page - called by pop-up page */
            extGivenName = request.givenName;
            extFamilyName = request.familyName;
            extPassPhrase = request.passPhrase;
            extPasswordType = request.passwordType;

            if (pageHasPassword) {
                chrome.tabs.executeScript(null, {
                    code: "try {document.querySelector('[type=password]').value = '" + request.password + "';  }  catch(e)  { console.log(e);  }"
                });
            }

            //Automatically clear the stored pass phrase after elapsed time
            clearStoredPhrase();
        } else if (request.message === "store_phrase") {
            /*Store encrypted pass phrase values - called by pop-up page */
            lastPassGenTimeStamp = Date.now();

            extEncHash = request.threeCharHash;
            extEncStore = request.phraseStore;

        } else if (request.message === "clear_stored_phrase") {
            /*Remove stored pass phrase values password - called by pop-up page */
            lastPassGenTimeStamp = Date.now();

            zeroVar(extEncHash);
            extEncHash = "";

            if (typeof extEncStore.iv === "string") {
                zeroVar(extEncStore.iv);
                extEncStore.iv = "";
            } else if (extEncStore.iv.constructor.name === "Uint8Array") {
                zeroIntArray(extEncStore.iv);
                extEncStore.iv = [];
            }

            if (typeof extEncStore.ciphertext === "string") {
                zeroVar(extEncStore.ciphertext);
                extEncStore.ciphertext = "";
            } else if (extEncStore.ciphertext.constructor.name === "Uint8Array") {
                zeroIntArray(extEncStore.ciphertext);
                extEncStore.ciphertext = [];
            }

        } else if (request.message === "set_page_details") {
            /*Called by content script when page loads */

            //Store page values
            var pageURL = trimDomainName(request.url);

            //Check if the URL is the same as the last time the pop-up was opened
            // If it's the same URL, re-use the same password type, if not, reset the password type
            //   to the default long-password
            if (extCurrentURL !== pageURL) {
                extPasswordType = "long-password";
            }

            extCurrentURL = pageURL;

            pageHasPassword = request.hasPassword;

            //console.log('Background page populate fields password type: ' + extPasswordType);

            //Supply page values and held values from previously
            chrome.runtime.sendMessage({
                "message": "populate_fields",
                "url": pageURL,
                "hasPassword": pageHasPassword,
                "givenName": extGivenName,
                "familyName": extFamilyName,
                "passPhrase": extPassPhrase,
                "passwordType": extPasswordType,
                "threeCharHash": extEncHash,
                "phraseStore": extEncStore
            });

        }
    }
);

function clearStoredPhrase() {
    var thisPasswordTimeStamp;

    //Set timestamp for last generated password
    lastPassGenTimeStamp = Date.now();
    thisPasswordTimeStamp = lastPassGenTimeStamp;

    //Set function to clear stored pass phrase after 5 minutes if no other activity has occurred
    window.setTimeout(function () {
        //Check of this was the last password generated (timestamp still matches)
        if (thisPasswordTimeStamp === lastPassGenTimeStamp) {
            //Too much time has elapsed without any password activity so clear the stored pass phrase
            zeroVar(extPassPhrase);
            extPassPhrase = "";
        }
    }, 300000);
}

function trimDomainName(domainURL) {
    var posDomain = 0;
    var domainName;

    /*Retrieve domain value and trim the leading http:// or https:// */
    domainName = domainURL.replace(/^https?:\/\//g, "").toLowerCase().trim();

    //Check whether the whole URL is there - remove anything with a '/' onwards
    posDomain = domainName.indexOf("/");
    if (posDomain > 0) {
        domainName = domainName.substr(0, posDomain);
    }

    return domainName;

}

/** Utility function to replace a string's value with all zeroes
 */
function zeroVar(varToZero) {
    return Array(varToZero.length).join("0");

}

/** Utility function to replace an array's value with all zeroes
 */
function zeroIntArray(arrayToZero) {
    var holdingVal = arrayToZero;
    for (var aCounter = 0; aCounter < arrayToZero.length; aCounter++) {
        holdingVal[aCounter] = 0;
    }
    return holdingVal;

}
