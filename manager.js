/*global PassOff, document, window, console, navigator */

//Variables for UI element
var givenName, familyName, passPhrase, domainName, securityQuestion, securityQuestionDiv, userName, userNameDiv, type, resultType, generatePasswordButton, password, passwordCard, copyPasswordDiv, loaderPassword, closePassword, copyPassword, passwordSel, passwordToggle, headerKey, copiedToast;

//Variable for calculations
var passOff, passwordType, fullName, supportsCopy, error, passChangeRequiredCount, lastPassPhraseLength;


function clearPassword() {
    hideElement(passwordCard);
    password.textContent = "";
    setPasswordButton();
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
                //passwordSel.value = passwordValue;
                hideElement(loaderPassword);

                if (document.queryCommandSupported('copy')) {
                    showElement(copyPasswordDiv);
                    password.scrollIntoView();
                    //Copy password to clipboard after 0.5 second
                    window.setTimeout(function () {
                        copyPasswordToClipboard();
                    }, 500);

                }

                setPassChangeRequired();

            })
            .catch(function (err) {
                error.textContent = err.message;
            });
    }

}

function setPassChangeRequired() {
    //Set the more changes required to 2 
    passChangeRequiredCount = 2;

    //Set the length to the current pass phrase length
    // This is an atttempt to give a little more security - a user can't just type in extra characters to reveal
    //  the password.  Some of the characters need to be changed (still eassy to work around)
    lastPassPhraseLength = passPhrase.value.length;
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

    var range = document.createRange();
    range.selectNode(password);
    window.getSelection().addRange(range);

    try {
        // Now that we've selected the anchor text, execute the copy command  
        var successful = document.execCommand('copy');
        /*var msg = successful ? 'successful' : 'unsuccessful';
        console.log('Copy email command was ' + msg);*/
        showToast(copiedToast, copyPasswordDiv);

    } catch (err) {
        console.log("Copy command failed");
    }

    // Remove the selections - NOTE: Should use   
    // removeRange(range) when it is supported  
    window.getSelection().removeAllRanges();

}

function chooseType() {
    setType(this.id);
}

function setType(passwordSelection) {
    copyPassword.textContent = "Copy Password";
    copiedToast.textContext = "Password copied to Clipboard";
    showElement(userNameDiv);
    hideElement(securityQuestionDiv);
    passwordType = passwordSelection;


    switch (passwordSelection) {
        case "login":
            generatePasswordButton.textContent = "Generate User name";
            copyPassword.textContent = "Copy User name";
            copiedToast.textContent = "User name copied to Clipboard";
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
            copyPassword.textContent = "Copy PIN";
            copiedToast.textContext = "PIN copied to Clipboard";

            break;
        case "pin-6":
            generatePasswordButton.textContent = "Generate Six Digit PIN";
            copyPassword.textContent = "Copy PIN";
            copiedToast.textContent = "PIN copied to Clipboard";
            break;
        case "answer":
            generatePasswordButton.textContent = "Generate Security Answer";
            copyPassword.textContent = "Copy Security Answer";
            copiedToast.textContent = "Answer copied to Clipboard";
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
    window.open("test/passoff-test.html");
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
    password = document.querySelector(".password");
    error = document.querySelector(".error");
    passwordSel = document.querySelector("[id=password-select]");
    copiedToast = document.querySelector("[id=copied-toast]");
    copyPassword = document.querySelector("[id=copy-password]");
    copyPasswordDiv = document.querySelector("[id=copy-password-div]");
    loaderPassword = document.querySelector("[id=load-bar-ball]");
    closePassword = document.querySelector("[id=close-password]");

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
    userName.addEventListener("input", clearPassword, false);
    userName.addEventListener("focus", hidePasswordToggle, false);
    userName.addEventListener("focusin", hidePasswordToggle, false);

    //Loop through different values and add a listener
    for (var lCounter = 0; lCounter < type.children.length; lCounter++) {
        type.children[lCounter].addEventListener("click", chooseType, false);
    }

    //Set supports copy to unknown until - can't check until a user interaction has occured
    supportsCopy = "unknown";
    //Set to false by default
    /*false;
    //Chrome, IE 9, IE10, IE11 and Edge support copy
    if (navigator.userAgent.indexOf("Chrome") !== -1 || navigator.userAgent.indexOf("MSIE 9") !== -1 ||
        navigator.userAgent.indexOf("MSIE 10") !== -1 || navigator.userAgent.indexOf("rv: 11.0") !== -1) {
        supportsCopy = true;
    } else if (navigator.userAgent.indexOf("Firefox") !== -1) {
        //Firefox supports copy from Version 41
        var versionNum = navigator.userAgent.substring(navigator.userAgent.indexOf("Firefox") + 8);

        if (versionNum >= 41) {
            supportsCopy = true;
        }
    }*/

    //Set the number of changes required to view a password to 0
    passChangeRequiredCount = 0;
    lastPassPhraseLength = 0;

    //Set initial type
    setType("long-password");
    headerKey.addEventListener("click", runTests, false);
    generatePasswordButton.addEventListener("click", generatePassword, false);
    passwordToggle.addEventListener("click", togglePasswordView, false);
    copyPassword.addEventListener("click", copyPasswordToClipboard, false);
    closePassword.addEventListener("click", clearPassword, false);

    givenName.focus();

}, false);
