/** --------------------------------------------------------------------------------------------------------------
  This web app uses the application cache - any change requires the passoff.appcache file to be modified.  
    Modify the timestamp comment in the 2nd line to force browsers to refresh  
  ----------------------------------------------------------------------------------------------------------------
*/
/** Set up global types so JSHint doesn't trigger warnings that they are not defined */

/*global CryptoJS, Promise, performance, console, Uint8Array */

/** 
 * Passoff class encapsulating the functionality for generating a password.
 * Calls the CyrptoJS library for PBKDF2 to generate salted password and HMAC256 for generating seed
 */
var PassOff = function () {
    "use strict";

    // The namespace used in calculateKey
    this.keyNS = "cake.man.passoff";

    // The namespaces used in calculateSeed
    this.passwordNS = "cake.man.passoff.password";
    this.loginNS = "cake.man.passoff.login";
    this.answerNS = "cake.man.passoff.answer";

    //The values which will be populated for creating the password
    this.fullName = '';
    this.passPhrase = '';
    this.domainName = '';
    this.userName = '';
    this.securityQuestion = '';


    // The templates that passwords may be created from
    // The characters map to MPW.passchars
    this.templates = {
        "maximum-password": [
		"anoxxxxxxxxxxxxxxxxx",
		"axxxxxxxxxxxxxxxxxno"
	],
        "long-password": [
		"CvcvnoCvcvCvcv",
		"CvcvCvcvnoCvcv",
		"CvcvCvcvCvcvno",
		"CvccnoCvcvCvcv",
		"CvccCvcvnoCvcv",
		"CvccCvcvCvcvno",
		"CvcvnoCvccCvcv",
		"CvcvCvccnoCvcv",
		"CvcvCvccCvcvno",
		"CvcvnoCvcvCvcc",
		"CvcvCvcvnoCvcc",
		"CvcvCvcvCvccno",
		"CvccnoCvccCvcv",
		"CvccCvccnoCvcv",
		"CvccCvccCvcvno",
		"CvcvnoCvccCvcc",
		"CvcvCvccnoCvcc",
		"CvcvCvccCvccno",
		"CvccnoCvcvCvcc",
		"CvccCvcvnoCvcc",
		"CvccCvcvCvccno"
	],
        "medium-password": [
		"CvcnoCvc",
		"CvcCvcno"
	],
        "basic-password": [
		"aaanaaan",
		"aannaaan",
		"aaannaaa"
	],
        "short-password": [
		"Cvcn"
	],
        pin: [
		"nnnn"
	],
        "pin-6": [
		"nnnnnn"
	],
        login: [
		"cvccvcvcv"
	],
        answer: [
		"cvcc cvc cvccvcv cvc",
		"cvc cvccvcvcv cvcv",
		"cv cvccv cvc cvcvccv"
	]
    };

    // The password character mapping
    // c in template becomes bcdfghjklmnpqrstvwxyz
    this.passchars = {
        V: "AEIOU",
        C: "BCDFGHJKLMNPQRSTVWXYZ",
        v: "aeiou",
        c: "bcdfghjklmnpqrstvwxyz",
        A: "AEIOUBCDFGHJKLMNPQRSTVWXYZ",
        a: "AEIOUaeiouBCDFGHJKLMNPQRSTVWXYZbcdfghjklmnpqrstvwxyz",
        n: "0123456789",
        o: "@&%?,=[]_:-+*$#!'^~;()/.",
        x: "AEIOUaeiouBCDFGHJKLMNPQRSTVWXYZbcdfghjklmnpqrstvwxyz0123456789!@#$%^&*()",
        " ": " "
    };

    // All the country top level domain suffixes - used for determining the domain from a URL
    // N.B. ".io" has been excluded becuase it is used like .com, eg github.io 
    this.countryTLDs = ["ac", "ad", "ae", "af", "ag", "ai", "al", "am", "an", "ao", "aq", "ar", "as", "at", "au", "aw", "ax", "az", "ba",
                        "bb", "bd", "be", "bf", "bg", "bh", "bi", "bj", "bm", "bn", "bo", "br", "bs", "bt", "bv", "bw", "by", "bz", "ca",
                        "cc", "cd", "cf", "cg", "ch", "ci", "ck", "cl", "cm", "cn", "co", "cr", "cs", "cu", "cv", "cw", "cx", "cy", "cz",
                        "dd", "de", "dj", "dk", "dm", "do", "dz", "ec", "ee", "eg", "eh", "er", "es", "et", "eu", "fi", "fj", "fk", "fm",
                        "fo", "fr", "ga", "gb", "gd", "ge", "gf", "gg", "gh", "gi", "gl", "gm", "gn", "gp", "gq", "gr", "gs", "gt", "gu",
                        "gw", "gy", "hk", "hm", "hn", "hr", "ht", "hu", "id", "ie", "il", "im", "in", /*"io",*/ "iq", "ir", "is", "it", "je",
                        "jm", "jo", "jp", "ke", "kg", "kh", "ki", "km", "kn", "kp", "kr", "kw", "ky", "kz", "la", "lb", "lc", "li", "lk",
                        "lr", "ls", "lt", "lu", "lv", "ly", "ma", "mc", "md", "me", "mg", "mh", "mk", "ml", "mm", "mn", "mo", "mp", "mq",
                        "mr", "ms", "mt", "mu", "mv", "mw", "mx", "my", "mz", "na", "nc", "ne", "nf", "ng", "ni", "nl", "no", "np", "nr",
                        "nu", "nz", "om", "pa", "pe", "pf", "pg", "ph", "pk", "pl", "pm", "pn", "pr", "ps", "pt", "pw", "py", "qa", "re",
                        "ro", "rs", "ru", "rw", "sa", "sb", "sc", "sd", "se", "sg", "sh", "si", "sj", "sk", "sl", "sm", "sn", "so", "sr",
                        "ss", "st", "su", "sv", "sx", "sy", "sz", "tc", "td", "tf", "tg", "th", "tj", "tk", "tl", "tm", "tn", "to", "tp",
                        "tr", "tt", "tv", "tw", "tz", "ua", "ug", "uk", "us", "uy", "uz", "va", "vc", "ve", "vg", "vi", "vn", "vu", "wf",
                        "ws", "ye", "yt", "yu", "za", "zm", "zw"];

};

/**
 * Wraps the CryptoJS PBKDF2 function in a promise and returns a key
 * @param {Object} queryParams The request parameters.
 * @return {Promise} A promise.
 */
PassOff.prototype.PBKDF2 = function (password, salt) {
    "use strict";

    return new Promise(function (resolve, reject) {
        var derivedKey = CryptoJS.PBKDF2(password, salt, {
            iterations: 750,
            keySize: 128 / 32
        });

        resolve(derivedKey);
    });

};

/**
 * Wraps the CryptoJS HMAC256 function in a promise and returns signed data as a word array
 * @param {Object} queryParams The request parameters.
 * @return {Promise} A promise.
 */

PassOff.prototype.HMACSHA256 = function (plainText, key) {
    "use strict";

    return new Promise(function (resolve, reject) {
        var seed = CryptoJS.HmacSHA256(plainText, key);

        resolve(seed);
    });

};

/**
 * Converts a word array into a Uint8Array to convert to use as a numeric array. 
 * Assumes wordArray is Big-Endian (because it comes from CryptoJS which is all BE)
 * @param {word array} wordArray .
 * @return {Uint8Array}.
 */
PassOff.prototype.convertWordArrayToUint8Array = function (wordArray) {
    "use strict";

    var len = wordArray.words.length,
        u8_array = new Uint8Array(len << 2),
        offset = 0,
        word, i;

    for (i = 0; i < len; i++) {
        word = wordArray.words[i];
        u8_array[offset++] = word >> 24;
        u8_array[offset++] = (word >> 16) & 0xff;
        u8_array[offset++] = (word >> 8) & 0xff;
        u8_array[offset++] = word & 0xff;
    }

    return u8_array;
};

/**
 * Resets all the values used for calculations
 * @param {None}.
 * @return {None}.
 */

PassOff.prototype.clearPassPhrase = function (wordArray) {
    "use strict";

    this.passPhrase = "00000000000000000000000000000000000000000000000000000000000000000000000000000";
    this.passPhrase = "";
};
/**
 * Runs the generation of a password by generating a key (PBKDF2) and then using that key to sign (HMAC256) the constructed domain value
 * @param {String} the password type to generate
 * @return {Promise} a promise which will resolve the generated password.
 */

PassOff.prototype.generatePassword = function (passwordType) {
    "use strict";

    var t0 = performance.now();
    var passNS;

    if (this.fullName.length === 0) {
        return Promise.reject(new Error("Name not present"));
    }

    if (this.passPhrase.length === 0) {
        return Promise.reject(new Error("Passphrase not present"));
    }

    if (this.domainName.length === 0) {
        return Promise.reject(new Error("Domain name not present"));
    }

    if (passwordType === "answer" && this.securityQuestion.length === 0) {
        return Promise.reject(new Error("Security question not present"));
    }


    try {
        var passOffContext = this;

        //return promise which resolves to the generated password
        return new Promise(function (resolve, reject) {

            passNS = passOffContext.passwordNS;

            if (passwordType === "answer") {
                passNS = passOffContext.answerNS;
            } else if (passwordType == "login") {
                passNS = passOffContext.loginNS;
            }

            //Set up parameters for PBKDF2 and HMAC functions
            var fullNameValue = passOffContext.fullName.trim().toLowerCase();
            var salt = passNS + "." + fullNameValue;
            var userNameValue = passOffContext.userName.trim().toLowerCase();
            var posDomain = 0;
            var domainElements;
            var domainCountryCode = "";

            /*Retrieve domain value and trim the leading http:// or https:// */
            var domainValue = passOffContext.domainName.replace(/^https?:\/\//g, "").toLowerCase();

            /* trim of any www prefix, eg 'www.'  , 'www1.', 'www-87.' */
            //domainValue = domainValue.replace(/^www*./g, "").trim();


            //Check whether the whole URL is there - remove anything with a '/' onwards
            posDomain = domainValue.indexOf("/");
            if (posDomain > 0) {
                domainValue = domainValue.substr(0, posDomain);
            }

            //Split base domain into its individual elements
            domainElements = domainValue.split(".");

            //Check whether the last domain element is a country code suffix, eg mrpeeel.com.au
            if (domainElements.length > 1 && passOffContext.countryTLDs.indexOf(domainElements[domainElements.length - 1]) >= 0) {
                //Save the country code and remove from domain elements array
                domainCountryCode = "." + domainElements[domainElements.length - 1];
                domainElements = domainElements.slice(0, -1);
            }

            //if there are more than 2 elements remaining, only keep the last two
            //eg photos.google.com = google.com, mail.google.com = google.com
            if (domainElements.length > 2) {
                domainElements = domainElements.slice(-2);
            }

            //Re-assemble base domain into final value with country code
            domainValue = domainElements.join(".") + domainCountryCode;

            var securityQuestionValue = "";

            //If  a specific user has been specified, then add to domain value
            if (userNameValue && userNameValue.length > 0) {
                domainValue = userNameValue + "@" + domainValue;
            }

            //For an answer, add the security question to domain value

            if (passwordType === "answer") {
                //Strip out any punctuation or multiple spaces and convert to lower case 
                securityQuestionValue = passOffContext.securityQuestion.replace(/[.,-\/#!$%\^&\*;:{}=\-_`~()?'"]/g, "").replace(/  +/g, ' ').trim().toLowerCase();
                domainValue = domainValue + ":" + securityQuestionValue;
            }


            return passOffContext.PBKDF2(passOffContext.passPhrase, salt)
                .then(function (key) {
                    //console.log("Derived key: " + key);

                    return passOffContext.HMACSHA256(domainValue, key);
                }).then(function (seed) {
                    //console.log("HMAC result seed hex: " + seed);
                    var seedArray = passOffContext.convertWordArrayToUint8Array(seed);

                    //console.log("HMAC result seed array: " + seedArray);
                    //console.log(performance.now() - t0 + " ms");
                    return seedArray;
                }).then(function (seedArray) {
                    // Find the selected template array
                    var templateType = passOffContext.templates[passwordType];

                    // Select the specific template based on seed[0]
                    var template = templateType[seedArray[0] % templateType.length];
                    //console.log("Selected template: " + template);
                    //console.log(performance.now() - t0 + " ms");

                    // Split the template string
                    var password = template.split("").map(function (c, i) {
                        // Use the available passchars to map the template string
                        // to characters (e.g. c -> bcdfghjklmnpqrstvwxyz)
                        var chars = passOffContext.passchars[c];

                        // Select the character using seed[i + 1]
                        return chars[seedArray[i + 1] % chars.length];
                    }).join(""); /*Re-join as password*/
                    //console.log("Generated password: " + password);
                    //console.log(performance.now() - t0 + " ms");
                    //console.log("All done");

                    //Clear seedArray
                    for (var seedCounter = 0; seedCounter < seedArray.length; seedCounter++) {
                        seedArray[seedCounter] = 0;
                    }


                    //Clear pass phrase values
                    passOffContext.clearPassPhrase();

                    resolve(password);
                })
                .catch(function (e) {
                    return Promise.reject(e);
                });

        });

    } catch (e) {
        return Promise.reject(e);
    }

};

/** --------------------------------------------------------------------------------------------------------------
  This web app uses the application cache - any change requires the passoff.appcache file to be modified.  
    Modify the timestamp comment in the 2nd line to force browsers to refresh  
  ----------------------------------------------------------------------------------------------------------------
*/

/*global PassOff, document, window, console, navigator, isChromeExtension, extHasPassword, generateExtPassword */

//Variables for UI element
var givenName, familyName, passPhrase, domainName, securityQuestion, securityQuestionDiv, userName, userNameDiv, type, resultType, generatePasswordButton, password, passwordCard, passwordCardHeader, copyPasswordDiv, loaderPassword, closePasswordButton, copyPasswordButton, bodyNode, clipboardVal, passwordToggle, headerKey, successToast, lastPassGenTimeStamp, successPrefix;

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
                clearBodyClasses();
                if (passwordType === "answer") {
                    bodyNode.classList.add("ext-answer-generated");

                } else {
                    bodyNode.classList.add("ext-pass-generated");
                }


                password.textContent = passwordValue;
                hideElement(loaderPassword);

                populateOrCopyPassword();

                setPassChangeRequired();

            })
            .catch(function (err) {
                error.textContent = err.message;
            });
    }

}

function populateOrCopyPassword() {
    var executePasswordCopy = false;

    //Check if this is running within a Chrome extension and a password or PIN is being generated
    if (typeof isChromeExtension !== 'undefined') {
        //Call the extension password set function
        generateExtPassword();

        //Check whether the extension can directly set the password or PIN and if it the correct type
        //If password can't be set or it is another type (user name or answer) it will just copy to cliboard instead
        if (extHasPassword !== true || passwordCardHeader.textContent === "User name" || passwordCardHeader.textContent === "Answer") {
            executePasswordCopy = true;
        } else {
            //Password will be directly inserted by ext-backgrounf.js, so show a password / pin inserted toast
            successToast.textContent = successPrefix + " inserted";
            window.setTimeout(function () {
                showToast(successToast, copyPasswordDiv);
            }, 250);
        }

    } else if (document.queryCommandSupported('copy')) {
        //Not running in an extension so check the copy capability of the browser
        executePasswordCopy = true;
    }

    if (executePasswordCopy) {
        showElement(copyPasswordDiv);
        password.scrollIntoView();
        //Copy password to clipboard after 0.2 second
        window.setTimeout(function () {
            copyPasswordToClipboard();
        }, 200);

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

function clearBodyClasses() {
    bodyNode.classList.remove("ext-pass");
    bodyNode.classList.remove("ext-answer");
    bodyNode.classList.remove("ext-pass-generated");
    bodyNode.classList.remove("ext-answer-generated");
}

function copyPasswordToClipboard() {
    clipboardVal.value = password.textContent;
    clipboardVal.select();

    if (document.queryCommandEnabled('copy')) {

        try {
            // Now that we've selected the anchor text, execute the copy command  
            var successful = document.execCommand('copy');
            successToast.textContent = successPrefix + " copied to Clipboard";
            showToast(successToast, copyPasswordDiv);

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
    successPrefix = "Password";
    passwordCardHeader.textContent = "Password";
    showElement(userNameDiv);
    hideElement(securityQuestionDiv);
    passwordType = passwordSelection;


    switch (passwordSelection) {
        case "login":
            generatePasswordButton.textContent = "Generate User name";
            copyPasswordButton.textContent = "Copy User name";
            successPrefix = "User name";
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
            successPrefix = "PIN";
            passwordCardHeader.textContent = "PIN";
            break;
        case "pin-6":
            generatePasswordButton.textContent = "Generate Six Digit PIN";
            copyPasswordButton.textContent = "Copy PIN";
            successPrefix = "PIN";
            passwordCardHeader.textContent = "PIN";
            break;
        case "answer":
            generatePasswordButton.textContent = "Generate Security Answer";
            copyPasswordButton.textContent = "Copy Security Answer";
            successPrefix = "Answer";
            passwordCardHeader.textContent = "Answer";
            showElement(securityQuestionDiv);
            break;
    }

    clearBodyClasses();
    if (passwordType === "answer") {
        bodyNode.classList.add("ext-answer");

    } else {
        bodyNode.classList.add("ext-pass");
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
    successToast = document.querySelector("[id=success-toast]");
    copyPasswordButton = document.querySelector("[id=copy-password]");
    copyPasswordDiv = document.querySelector("[id=copy-password-div]");
    loaderPassword = document.querySelector("[id=load-bar-ball]");
    closePasswordButton = document.querySelector("[id=close-password]");
    bodyNode = document.querySelector("body");

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
