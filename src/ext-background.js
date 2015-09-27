/*global chrome, alert, console, document, window*/
var currentURL = "";
var givenName = "";
var familyName = "";
var passPhrase = "";
var pageHasPassword = false;
var lastPassGenTimeStamp;

chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if (request.message === "set_password") {
            givenName = request.givenName;
            familyName = request.familyName;
            passPhrase = request.passPhrase;

            if (pageHasPassword) {
                chrome.tabs.executeScript(null, {
                    code: "try {document.querySelector('[type=password]').value = '" + request.password + "';  }  catch(e)  { console.log(e);  }"
                });
            }

            //Automatically clear the stored pass phrase after elapsed time
            clearStoredPhrase();
        } else if (request.message === "set_page_details") {
            //Store page values
            currentURL = request.url;
            pageHasPassword = request.hasPassword;

            //Supply page values and held values from previously
            chrome.runtime.sendMessage({
                "message": "populate_fields",
                "url": currentURL,
                "hasPassword": pageHasPassword,
                "givenName": givenName,
                "familyName": familyName,
                "passPhrase": passPhrase
            });

        }
    }
);

function clearStoredPhrase() {
    var thisPasswordTimeStamp;

    //Set timestamp for last generated password
    lastPassGenTimeStamp = Date.now();
    thisPasswordTimeStamp = lastPassGenTimeStamp;

    //Set function to clear passwords after 30 minutes if no other activity has occurred
    window.setTimeout(function () {
        //Check of this was the last password generated (timestamp still matches)
        if (thisPasswordTimeStamp === lastPassGenTimeStamp) {
            //Too much time has elapsed without any password activity so clear the stored pass phrase
            passPhrase = "";
        }
    }, 1800000);
}
