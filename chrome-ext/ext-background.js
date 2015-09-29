/*global chrome, alert, console, document, window*/
var extCurrentURL = "";
var extGivenName = "";
var extFamilyName = "";
var extPassPhrase = "";
var extPasswordType = "";
var pageHasPassword = false;
var lastPassGenTimeStamp;

chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if (request.message === "set_password") {
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
        } else if (request.message === "set_page_details") {
            //Store page values
            var pageURL = trimDomainName(request.url);

            //Check if the URL is the same as the last time the pop-up was opened
            // If it's the same URL, re-use the same password type, if not, reset the password type
            //   to the default long-password
            if (extCurrentURL !== pageURL) {
                extPasswordType = "long-password";
            }

            pageHasPassword = request.hasPassword;

            //Supply page values and held values from previously
            chrome.runtime.sendMessage({
                "message": "populate_fields",
                "url": pageURL,
                "hasPassword": pageHasPassword,
                "givenName": extGivenName,
                "familyName": extFamilyName,
                "passPhrase": extPassPhrase,
                "passwordType": extPasswordType
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
            extPassPhrase = "";
        }
    }, 1800000);
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
