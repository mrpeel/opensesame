/** --------------------------------------------------------------------------------------------------------------
  This web app uses the application cache - any change requires the passoff.appcache file to be modified.  
    Modify the timestamp comment in the 2nd line to force browsers to refresh  
  ----------------------------------------------------------------------------------------------------------------
*/

/*global PassOff, document, window, console, navigator */

//Variables for UI element
var givenName, familyName, passPhrase, domainName, securityQuestion, securityQuestionDiv, userName, userNameDiv, type, resultType, generatePasswordButton, password, passwordCard, passwordCardHeader, copyPasswordDiv, loaderPassword, closePasswordButton, copyPasswordButton, clipboardVal, passwordToggle, headerKey, copiedToast, lastPassGenTimeStamp;

//Variable for calculations
var passOff, passwordType, fullName, error, passChangeRequiredCount, lastPassPhraseLength;


function clearPassword() {
    hideElement(passwordCard);
    password.textContent = "00000000000000000000000000000000000000000000000000000000000000000000000000000";
    password.textContent = "";
    setPasswordButton();
}

function trimDomainName() {
    var posDomain = 0;

    /*Retrieve domain value and trim the leading http:// or https:// */
    domainName.value = domainName.value.replace(/^https?:\/\//g, "").toLowerCase().trim();

    //Check whether the whole URL is there - remove anything with a '/' onwards
    posDomain = domainName.value.indexOf("/");
    if (posDomain > 0) {
        domainName.value = domainName.value.substr(0, posDomain);
    }

}

function clearValues() {
    passPhrase.value = "00000000000000000000000000000000000000000000000000000000000000000000000000000";
    passPhrase.value = "";
    passChangeRequiredCount = 0;

    clearPassword();
}

function generatePassword() {

    hidePasswordToggle();

    showElement(passwordCard);
    error.textContent = password.textContent = "";

    setPasswordButton();

    fullName = givenName.value.trim() + familyName.value.trim();

    if ((fullName === "" || passPhrase.value.trim().length === 0) || (passwordType === "answer" && securityQuestion.value.trim().length === 0)) {
        return;
    }

    if (passwordType === "answer" && securityQuestion.value.trim().length === 0) {
        //Security question must be present to generate an answer
        return;
    }


    //Reset optional values
    passOff.userName = "";
    passOff.securityQuestion = "";

    //Set values required for calculation
    passOff.fullName = fullName;
    passOff.passPhrase = passPhrase.value;
    passOff.domainName = domainName.value.trim();
    if (userName.value.trim().length > 0) {
        passOff.userName = userName.value.trim();
    }

    if (passwordType === "answer" && securityQuestion.value.trim().length > 0) {
        //Remove any punctuation, remove any consecutive spaces and convert to lower case
        passOff.securityQuestion = securityQuestion.value.trim();
    }

    if (passwordType) {
        passOff.generatePassword(passwordType)
            .then(function (passwordValue) {
                password.textContent = passwordValue;
                hideElement(loaderPassword);

                if (document.queryCommandSupported('copy')) {
                    showElement(copyPasswordDiv);
                    password.scrollIntoView();
                    //Copy password to clipboard after 0.2 second
                    window.setTimeout(function () {
                        copyPasswordToClipboard();
                    }, 200);

                }

                setPassChangeRequired();

            })
            .catch(function (err) {
                error.textContent = err.message;
            });
    }

}

function setPassChangeRequired() {
    var thisPasswordTimeStamp;

    //Set the more changes required to 2 
    passChangeRequiredCount = 2;

    //Set the length to the current pass phrase length
    // This is an atttempt to give a little more security - a user can't just type in extra characters to reveal
    //  the password.  Some of the characters need to be changed (still easy to work around)
    lastPassPhraseLength = passPhrase.value.length;

    //Set timestamp for last generated password
    lastPassGenTimeStamp = Date.now();
    thisPasswordTimeStamp = lastPassGenTimeStamp;

    //Set function to clear passwords after 30 minutes if no other activity has occurred
    window.setTimeout(function () {
        //Check of this was the last password generated (timestamp still matches)
        if (thisPasswordTimeStamp === lastPassGenTimeStamp) {
            //Too much time has elapsed without any password activity so clear all the values
            clearValues();
        }
    }, 1800000);
}

function changePassPhrase() {
    clearPassword();

    //Check if the pass phrase needs to be altered before the view toggle can be displayed
    if (lastPassPhraseLength > 0 && passChangeRequiredCount > 0 && passPhrase.value.length <= lastPassPhraseLength) {
        passChangeRequiredCount = passChangeRequiredCount - 1;
    } else if (lastPassPhraseLength === 0 || passChangeRequiredCount === 0) {
        showPasswordToggle();
    }
}

function setPasswordButton() {

    /*Retrieve domain value and trim the leading http:// or https://
    then trim of any www prefix, eg 'www.'  , 'www1.', 'www-87.' */
    var calculatedDomainName = domainName.value.replace("https://", "").replace("http://", "").replace(/^www[\w-]*./g, "").trim().toLowerCase();

    //Ignore the start of www.
    if (calculatedDomainName === "w" || calculatedDomainName === "ww" || calculatedDomainName === "www") {
        calculatedDomainName = "";
    }

    //Check if minimum values have been completed - all types need name and domain
    if ((givenName.value.trim().length > 0 || familyName.value.trim().length > 0) && calculatedDomainName.length > 0 &&
        //For an answer type, a question must also be set 
        (passwordType !== "answer" || securityQuestion.value.trim().length > 0)) {
        generatePasswordButton.disabled = false;
    } else {
        generatePasswordButton.disabled = true;

    }
    hideElement(copyPasswordDiv);
}

function showElement(element) {
    element.classList.remove("hidden");
}

function hideElement(element) {
    element.classList.add("hidden");
}


function copyPasswordToClipboard() {
    clipboardVal.value = password.textContent;
    clipboardVal.select();

    if (document.queryCommandEnabled('copy')) {

        try {
            // Now that we've selected the anchor text, execute the copy command  
            var successful = document.execCommand('copy');
            showToast(copiedToast, copyPasswordDiv);

        } catch (err) {
            console.log("Copy command failed");
        }
    } else {
        console.log("Copy command not enabled");
    }
}

function clearClipboard() {
    clipboardVal.value = "Value cleared";
    clipboardVal.select();
    if (document.queryCommandSupported('copy')) {

        try {
            var successful = document.execCommand('copy');
        } catch (err) {
            console.log("Copy command failed");
        }
    } else {
        console.log("Copy command not enabled");
    }

}

function chooseType() {
    setType(this.id);
}

function setType(passwordSelection) {
    copyPasswordButton.textContent = "Copy Password";
    copiedToast.textContext = "Password copied to Clipboard";
    passwordCardHeader.textContent = "Password";
    showElement(userNameDiv);
    hideElement(securityQuestionDiv);
    passwordType = passwordSelection;


    switch (passwordSelection) {
        case "login":
            generatePasswordButton.textContent = "Generate User name";
            copyPasswordButton.textContent = "Copy User name";
            copiedToast.textContent = "User name copied to Clipboard";
            passwordCardHeader.textContent = "User name";
            hideElement(userNameDiv);
            break;
        case "maximum-password":
            generatePasswordButton.textContent = "Generate Maximum Password";
            break;
        case "long-password":
            generatePasswordButton.textContent = "Generate Long Password";
            break;
        case "medium-password":
            generatePasswordButton.textContent = "Generate Medium Password";
            break;
        case "basic-password":
            generatePasswordButton.textContent = "Generate Basic Password";
            break;
        case "short-password":
            generatePasswordButton.textContent = "Generate Short Password";
            break;
        case "pin":
            generatePasswordButton.textContent = "Generate Four Digit PIN";
            copyPasswordButton.textContent = "Copy PIN";
            copiedToast.textContext = "PIN copied to Clipboard";
            passwordCardHeader.textContent = "PIN";

            break;
        case "pin-6":
            generatePasswordButton.textContent = "Generate Six Digit PIN";
            copyPasswordButton.textContent = "Copy PIN";
            copiedToast.textContent = "PIN copied to Clipboard";
            passwordCardHeader.textContent = "PIN";
            break;
        case "answer":
            generatePasswordButton.textContent = "Generate Security Answer";
            copyPasswordButton.textContent = "Copy Security Answer";
            copiedToast.textContent = "Answer copied to Clipboard";
            passwordCardHeader.textContent = "Answer";
            showElement(securityQuestionDiv);
            break;
    }

    clearPassword();
}

function showPasswordToggle() {
    // Once a pass phrase has been used to generate a values, make sure that it can't be re-displayed
    //  until at least 3 changes are applied.
    // This is not providing much security but it at least stops someone displaying the exact pass phrase  
    //  which was just used.
    if (passChangeRequiredCount === 0) {
        showElement(passwordToggle);
    }
}

function hidePasswordToggle() {
    hideElement(passwordToggle);
    passPhrase.type = "password";
}

function togglePasswordView() {
    //Toggle pass phrase between visible as a text area, and obscured like a normal password
    if (passPhrase.type === "password") {
        passPhrase.type = "text-area";
    } else {
        passPhrase.type = "password";
    }

    passPhrase.focus();

}

function runTests() {
    window.open("test/opensesame-test.html");
}


function showToast(toastElement, coveredElement) {
    //Show toast element
    hideElement(coveredElement);
    showElement(toastElement);

    toastElement.scrollIntoView();
    //Hide again after 5 seconds
    window.setTimeout(function () {
        hideToast(toastElement, coveredElement);
    }, 5200);
}

function hideToast(toastElement, coveredElement) {

    showElement(coveredElement);
    hideElement(toastElement);


}

window.addEventListener("load", function () {

    window.applicationCache.addEventListener('updateready', function (e) {
        if (window.applicationCache.status == window.applicationCache.UPDATEREADY) {
            // Browser downloaded a new app cache.
            window.location.reload();
        }
    }, false);

    passOff = new PassOff();

    headerKey = document.querySelector("[id=header-key]");
    givenName = document.querySelector("[id=given-name]");
    familyName = document.querySelector("[id=family-name]");
    passPhrase = document.querySelector("[id=passphrase]");
    passwordToggle = document.querySelector("[id=show-password]");
    generatePasswordButton = document.querySelector("[id=generate-password]");
    domainName = document.querySelector("[id=domain]");
    securityQuestion = document.querySelector("[id=security-question]");
    securityQuestionDiv = document.querySelector("[id=security-question-div]");
    userName = document.querySelector("[id=user-name]");
    userNameDiv = document.querySelector("[id=user-name-div]");
    type = document.querySelector("[id=type]");
    passwordCard = document.querySelector("[id=password-card]");
    passwordCardHeader = document.querySelector("[id=password-card-header]");
    password = document.querySelector(".password");
    clipboardVal = document.querySelector("[id=clipboard-value]");
    error = document.querySelector(".error");
    copiedToast = document.querySelector("[id=copied-toast]");
    copyPasswordButton = document.querySelector("[id=copy-password]");
    copyPasswordDiv = document.querySelector("[id=copy-password-div]");
    loaderPassword = document.querySelector("[id=load-bar-ball]");
    closePasswordButton = document.querySelector("[id=close-password]");

    givenName.disabled = familyName.disabled = passPhrase.disabled = domainName.disabled = userName.disabled = type.disabled = false;

    givenName.addEventListener("input", clearPassword, false);
    givenName.addEventListener("focus", hidePasswordToggle, false);
    givenName.addEventListener("focusin", hidePasswordToggle, false);
    familyName.addEventListener("input", clearPassword, false);
    familyName.addEventListener("focus", hidePasswordToggle, false);
    familyName.addEventListener("focusin", hidePasswordToggle, false);
    passPhrase.addEventListener("input", changePassPhrase, false);
    passPhrase.addEventListener("focus", showPasswordToggle, false);
    passPhrase.addEventListener("focusin", showPasswordToggle, false);
    securityQuestion.addEventListener("input", clearPassword, false);
    securityQuestion.addEventListener("focus", hidePasswordToggle, false);
    securityQuestion.addEventListener("focusin", hidePasswordToggle, false);
    domainName.addEventListener("input", clearPassword, false);
    domainName.addEventListener("focus", hidePasswordToggle, false);
    domainName.addEventListener("focusin", hidePasswordToggle, false);
    domainName.addEventListener("focusout", trimDomainName, false);
    domainName.addEventListener("blur", trimDomainName, false);
    userName.addEventListener("input", clearPassword, false);
    userName.addEventListener("focus", hidePasswordToggle, false);
    userName.addEventListener("focusin", hidePasswordToggle, false);

    //Loop through different values and add a listener
    for (var lCounter = 0; lCounter < type.children.length; lCounter++) {
        type.children[lCounter].addEventListener("click", chooseType, false);
    }


    //Set the number of changes required to view a password to 0
    passChangeRequiredCount = 0;
    lastPassPhraseLength = 0;

    //Set initial type
    setType("long-password");
    headerKey.addEventListener("click", runTests, false);
    generatePasswordButton.addEventListener("click", generatePassword, false);
    passwordToggle.addEventListener("click", togglePasswordView, false);
    copyPasswordButton.addEventListener("click", copyPasswordToClipboard, false);
    closePasswordButton.addEventListener("click", clearPassword, false);

    givenName.focus();

}, false);
