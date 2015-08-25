/*global PassOff, document, window, console, navigator */

//Variables for UI element
var givenName, familyName, passPhrase, domainName, securityQuestion, securityQuestionDiv, userName, userNameDiv, type, resultType, generatePasswordButton, password, passwordCard, copyPasswordDiv, loaderDetails, loaderPassword, closePassword, copyPassword, passwordSel, passwordToggle;

//Variable for calculations
var passOff, passwordType, fullName, supportsCopy, calculatedDomainName, error, id = 0;


function clearPassword() {
    hideElement(passwordCard);
    password.textContent = "";
    //clearClipboard();
    setPasswordButton();
}

function generatePassword() {

    showElement(passwordCard);
    showElement(loaderDetails);
    error.textContent = password.textContent = "";

    setPasswordButton();

    fullName = givenName.value.trim().toLowerCase() + familyName.value.trim().toLowerCase();

    if ((fullName === "" || passPhrase.value.trim().length === 0) || (passwordType === "answer" && securityQuestion.value.trim().length === 0)) {
        hideElement(loaderDetails);
        return;
    }

    if (passwordType === "answer" && securityQuestion.value.trim().length === 0) {
        //Security question must be present to generate an answer
        hideElement(loaderDetails);
        return;
    }


    //Reset optional values
    passOff.userName = "";
    passOff.securityQuestion = "";

    //Set values required for calculation
    passOff.fullName = fullName;
    passOff.passPhrase = passPhrase.value;
    passOff.domainName = calculatedDomainName;
    if (userName.value.trim().length > 0) {
        passOff.userName = userName.value.trim().toLowerCase();
    }

    if (passwordType === "answer" && securityQuestion.value.trim().length > 0) {
        //Remove any punctuation, remove any consecutive spaces and convert to lower case
        passOff.securityQuestion = securityQuestion.value.trim().replace(/[.,-\/#!$%\^&\*;:{}=\-_`~()?'"]/g, "").replace(/  +/g, ' ').toLowerCase();
    }

    if (passwordType) {
        passOff.generatePassword(passwordType)
            .then(function (passwordValue) {
                password.textContent = passwordValue;
                passwordSel.value = passwordValue;
                hideElement(loaderPassword);

                if (supportsCopy) {
                    showElement(copyPasswordDiv);
                }

            })
            .catch(function (err) {
                error.textContent = err.message;
            });
    }

}

function setPasswordButton() {
    //Check if minimum values have been completed - all types need name and domain
    if ((givenName.value.trim().length > 0 || familyName.value.trim().length > 0) && calculatedDomainName.length > 0 &&
        //For an answer type, a question must also be set 
        (passwordType !== "answer" || securityQuestion.value.trim().length > 0)) {
        generatePasswordButton.disabled = false;
    } else {
        generatePasswordButton.disabled = true;

    }
    hideElement(loaderDetails);
    hideElement(copyPasswordDiv);
}

function showElement(element) {
    element.classList.remove("hidden");
}

function hideElement(element) {
    element.classList.add("hidden");
}

function clearClipboard() {
    if (supportsCopy) {
        var focusedElement = document.activeElement;
        passwordSel.value = "Move along.  Nothing to see here.";
        passwordSel.select();
        document.execCommand("Copy", false, null);
        focusedElement.focus();
    }
}

function copyPasswordToClipboard() {
    if (supportsCopy) {
        passwordSel.focus();
        passwordSel.select();
        document.execCommand("Copy", false, null);
        copyPassword.focus();
    }
}


/*function updatePassword() {
    showElement(loaderPassword);

    error.textContent = password.textContent = "";


    if (userName.value !== '') {
        calculatedDomainName = userName.value + calculatedDomainName;
    }

    if (!mpw || calculatedDomainName === '' || templateType === '' || passwordType === '') {
        hideElement(loaderPassword);
        return;
    }

    var cid = ++id;
    var value;

    showElement(passwordCard);

    if (type.value === "answer") {
        value = mpw.generateAnswer(calculatedDomainName, COUNTER, securityQuestion, templateType);
    } else {
        value = mpw["generate" + passwordType](calculatedDomainName, COUNTER, templateType);
    }

    value.then(function (pass) {
        if (cid === id) {
            password.textContent = pass;
            passwordSel.value = pass;
            hideElement(loaderPassword);
            if (supportsCopy) {
                showElement(copyPasswordDiv);
            }

        }
    }, function (err) {
        hideElement(loaderPassword);
        if (cid === id) {
            error.textContent = err.message;
        }

        console.error(err);
    });
}*/

function chooseType() {
    setType(this.id);
}

function setType(passwordSelection) {
    copyPassword.textContent = "Copy Password";
    showElement(userNameDiv);
    hideElement(securityQuestionDiv);
    passwordType = passwordSelection;


    switch (passwordSelection) {
        case "login":
            generatePassword.textContent = "Generate User name";
            copyPassword.textContent = "Copy User name";
            hideElement(userNameDiv);
            break;
        case "maximum-password":
            generatePassword.textContent = "Generate Maximum Password";
            break;
        case "long-password":
            generatePassword.textContent = "Generate Long Password";
            break;
        case "medium-password":
            generatePassword.textContent = "Generate Medium Password";
            break;
        case "basic-password":
            generatePassword.textContent = "Generate Basic Password";
            break;
        case "short-password":
            generatePassword.textContent = "Generate Short Password";
            break;
        case "pin":
            generatePassword.textContent = "Generate PIN";
            copyPassword.textContent = "Copy PIN";
            break;
        case "answer":
            generatePassword.textContent = "Generate Security Answer";
            copyPassword.textContent = "Copy Security Answer";
            showElement(securityQuestionDiv);
            break;
    }

    clearPassword();
}

function updateDomainName() {
    var posWWW;

    calculatedDomainName = domainName.value.trim().toLowerCase();

    //Ignore the start of www.
    if (calculatedDomainName === "w" || calculatedDomainName === "ww" || calculatedDomainName === "www") {
        calculatedDomainName = "";
    }

    //Trim a leading www. value if present
    posWWW = calculatedDomainName.indexOf("www.");
    if (posWWW === 0) {
        calculatedDomainName = calculatedDomainName.substr(4);
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

window.addEventListener("load", function () {

    passOff = new PassOff();

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
    copyPassword = document.querySelector("[id=copy-password]");
    copyPasswordDiv = document.querySelector("[id=copy-password-div]");
    loaderDetails = document.querySelector("[id=load-bar-details]");
    loaderPassword = document.querySelector("[id=load-bar-ball]");
    closePassword = document.querySelector("[id=close-password]");

    givenName.disabled = familyName.disabled = passPhrase.disabled = domainName.disabled = userName.disabled = type.disabled = false;

    givenName.addEventListener("input", clearPassword, false);
    familyName.addEventListener("input", clearPassword, false);
    passPhrase.addEventListener("input", clearPassword, false);
    passPhrase.addEventListener("focus", showPasswordToggle, false);
    passPhrase.addEventListener("focusin", showPasswordToggle, false);
    passPhrase.addEventListener("blur", hidePasswordToggle, false);
    passPhrase.addEventListener("focusout", hidePasswordToggle, false);
    securityQuestion.addEventListener("input", clearPassword, false);
    domainName.addEventListener("input", updateDomainName, false);
    userName.addEventListener("input", clearPassword, false);

    //Loop through different values and add a listener
    for (var lCounter = 0; lCounter < type.children.length; lCounter++) {
        type.children[lCounter].addEventListener("click", chooseType, false);
    }

    //Check if browser supports copy operation
    //Set to false by default
    supportsCopy = false;
    //Chrome supports copy
    if (navigator.userAgent.indexOf("Chrome") !== -1) {
        supportsCopy = true;
    }

    //Firefox supports copy from Version 41
    if (navigator.userAgent.indexOf("Firefox") !== -1) {
        var versionNum = navigator.userAgent.substring(navigator.userAgent.indexOf("Firefox") + 8);

        if (versionNum >= 41) {
            supportsCopy = true;
        }
    }


    //Set initial type
    calculatedDomainName = "";
    setType("long-password");
    generatePasswordButton.addEventListener("click", generatePassword, false);
    passwordToggle.addEventListener("click", togglePasswordView, false);
    copyPassword.addEventListener("click", copyPasswordToClipboard, false);
    closePassword.addEventListener("click", clearPassword, false);


    /*MPW.test().catch(function (err) {
        console.error(err);
        error.textContent = err.toString();
    });*/

    givenName.focus();

}, false);
