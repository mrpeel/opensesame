/*global chrome, alert, console, document*/

chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if (request.message === "clicked_browser_action") {
            var hasPassword = false;
            var passwordFields = document.querySelectorAll("[type=password]");

            //console.log(document.URL);

            if (passwordFields.length === 1) {
                //console.log("Found password field:" + passwordFields[0].id);
                hasPassword = true;
            }


            chrome.runtime.sendMessage({
                "message": "set_page_details",
                "url": document.URL,
                "hasPassword": hasPassword
            });

        }
    }
);
