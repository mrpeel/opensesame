/*global PassOff, document, window, console, navigator */

//Variables for UI element
var givenName, familyName, passPhrase, domainName, securityQuestion, securityQuestionDiv, userName, userNameDiv, type, resultType, generatePasswordButton, password, passwordCard, copyPasswordDiv, loaderPassword, closePassword, copyPassword, passwordSel, passwordToggle, headerKey, copiedToast;

//Variable for calculations
var passOff, passwordType, fullName, supportsCopy, error, id = 0;


function clearPassword() {
    hideElement(passwordCard);
    password.textContent = "";
    //clearClipboard();
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
                passwordSel.value = passwordValue;
                hideElement(loaderPassword);

                if (supportsCopy) {
                    showElement(copyPasswordDiv);
                    password.scrollIntoView();
                    //Copy password to clipboard after 0.5 second
                    window.setTimeout(function () {
                        copyPasswordToClipboard();
                    }, 500);

                }

            })
            .catch(function (err) {
                error.textContent = err.message;
            });
    }

}

function setPasswordButton() {

    var calculatedDomainName = domainName.value.trim().toLowerCase();

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

/*
function clearClipboard() {
    if (supportsCopy) {
        var focusedElement = document.activeElement;
        passwordSel.value = "Move along.  Nothing to see here.";
        passwordSel.select();
        document.execCommand("Copy", false, null);
        focusedElement.focus();
    }
}*/

function copyPasswordToClipboard() {
    if (supportsCopy === "unknown") {
        //Check if browser supports copy operation
        supportsCopy = document.queryCommandSupported('copy');
    }

    if (supportsCopy) {
        passwordSel.focus();
        passwordSel.select();
        document.execCommand("Copy", false, null);
        copyPassword.focus();
        showToast(copiedToast, copyPasswordDiv);
    }
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
            copiedToast.textContext = "User name copied to Clipboard";
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
            copiedToast.textContext = "PIN copied to Clipboard";
            break;
        case "answer":
            generatePasswordButton.textContent = "Generate Security Answer";
            copyPassword.textContent = "Copy Security Answer";
            copiedToast.textContext = "Answer copied to Clipboard";
            showElement(securityQuestionDiv);
            break;
    }

    clearPassword();
}

function showPasswordToggle() {
    showElement(passwordToggle);
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
    passPhrase.addEventListener("input", clearPassword, false);
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
    supportsCopy = "uknown";
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


    //Set initial type
    setType("long-password");
    headerKey.addEventListener("click", runTests, false);
    generatePasswordButton.addEventListener("click", generatePassword, false);
    passwordToggle.addEventListener("click", togglePasswordView, false);
    copyPassword.addEventListener("click", copyPasswordToClipboard, false);
    closePassword.addEventListener("click", clearPassword, false);

    givenName.focus();

}, false);
