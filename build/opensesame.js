/** Passoff class encapsulating the functionality for generating a password.
    Requires cryptofunctions.js which determies whether to use subtle crypto or cryptojs
    and executes the appropriate functions.
*/

/*global CryptoJS, Promise, performance, console, Uint8Array */

/* Functions defined in cryptofunctions.js */
/* global PBKDF2, HMACSHA256, aesEncrypt, aesDecrypt, convertDerivedKeyToHex, convertWordArrayToHex, convertWordArrayToUint8Array, convertUint8ArrayToHex, convertHexToUint8Array, zeroVar, zeroIntArray */

/** 
 * 
 * PassOff uses BKDF2 to generate salted password and HMAC256 to generate a seed.  The seed is then ued to generate a password based on
    a chosen template.
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
/*PassOff.prototype.PBKDF2 = function (password, salt) {
    "use strict";

    return new Promise(function (resolve, reject) {
        var derivedKey = CryptoJS.PBKDF2(password, salt, {
            iterations: 750,
            keySize: 128 / 32
        });

        resolve(derivedKey);
    });

};*/

/**
 * Wraps the CryptoJS HMAC256 function in a promise and returns signed data as a word array
 * @param {Object} queryParams The request parameters.
 * @return {Promise} A promise.
 */

/*PassOff.prototype.HMACSHA256 = function (plainText, key) {
    "use strict";

    return new Promise(function (resolve, reject) {
        var seed = CryptoJS.HmacSHA256(plainText, key);

        resolve(seed);
    });

};*/

/**
 * Converts a word array into a Uint8Array to convert to use as a numeric array. 
 * Assumes wordArray is Big-Endian (because it comes from CryptoJS which is all BE)
 * @param {word array} wordArray .
 * @return {Uint8Array}.
 */
/*PassOff.prototype.convertWordArrayToUint8Array = function (wordArray) {
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
};*/

/**
 * Resets all the values used for calculations
 * @param {None}.
 * @return {None}.
 */

PassOff.prototype.clearPassPhrase = function () {
    "use strict";

    this.passPhrase = zeroVar(this.passPhrase);
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



            //parameters: password, salt, numIterations, keyLength
            return PBKDF2(passOffContext.passPhrase, salt, 750, 128)
                .then(function (key) {
                    //console.log("Derived key: " + key);

                    return HMACSHA256(domainValue, key);
                    /*}).then(function (seed) {
                        //console.log("HMAC result seed hex: " + seed);
                        var seedArray = passOffContext.convertWordArrayToUint8Array(seed);

                        //console.log("HMAC result seed array: " + seedArray);
                        //console.log(performance.now() - t0 + " ms");
                        return seedArray;*/
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

/*global PassOff, document, window, console, navigator, isChromeExtension, extHasPassword, generateExtPassword, clearExtPhrase, storeExtPhrase, zeroVar, zeroIntArray, TemporaryPhraseStore */

//Global variables for UI elements
var passPhrase;
var givenName;
var familyName;
var domainName;
var securityQuestion;
var userName;
var type;
var bodyNode;
var password;
var optionsVisible = false;

var requiredElements = ["given-name", "family-name", "passphrase", "domain"];

//Variable for processing
var passOff, temporaryPhraseStore, passwordType, fullName, passChangeRequiredCount, lastPassPhraseLength, lastPassGenTimeStamp, successPrefix, passPhraseState;

var passwordDescription = "Long password";

//Set-up the service worker
function prepServiceWorker() {

    if (!navigator.serviceWorker) {
        return;
    }

    navigator.serviceWorker.register('sw.js').then(function (reg) {
        if (!navigator.serviceWorker.controller) {
            return;
        }

        if (reg.waiting) {
            updateReady(reg.waiting);
            return;
        }

        if (reg.installing) {
            trackInstalling(reg.installing);
            return;
        }

        reg.addEventListener('updatefound', function () {
            trackInstalling(reg.installing);
        });
    });

    // Ensure refresh is only called once (works around a bug in "force update on reload").
    var refreshing;
    navigator.serviceWorker.addEventListener('controllerchange', function () {
        if (refreshing) {
            return;
        }
        window.location.reload();
        refreshing = true;
    });
}

function trackInstalling(worker) {
    worker.addEventListener('statechange', function () {
        if (worker.state == 'installed') {
            updateReady(worker);
        }
    });
}

function updateReady(worker) {
    var countdownDiv = document.getElementById("update-message");
    var countdownValue = document.getElementById("count-down-value");
    var cdVals = [5, 4, 3, 2, 1];

    countdownDiv.classList.remove("hidden");

    window.setTimeout(function () {
        worker.postMessage({
            action: 'skipWaiting'
        });
    }, 5000);

    cdVals.forEach(function (val) {
        window.setTimeout(function () {
            countdownValue.innerText = val;
        }, (5 - val) * 1000);
    });
}

window.addEventListener("load", function () {

    /*If a change has been detected for the appcache, force an immediate re-load to apply the change
     */
    window.applicationCache.addEventListener('updateready', function (e) {
        if (window.applicationCache.status == window.applicationCache.UPDATEREADY) {
            // Browser downloaded a new app cache.
            window.location.reload();
        }
    }, false);


    /*Set up the classes for password calculation and temporary pass phrase storage */
    passOff = new PassOff();
    temporaryPhraseStore = new TemporaryPhraseStore();

    /*Set-up global variables for the UI elements */
    passPhrase = document.getElementById("passphrase");
    givenName = document.getElementById("given-name");
    familyName = document.getElementById("family-name");
    domainName = document.getElementById("domain");
    securityQuestion = document.getElementById("security-question");
    userName = document.getElementById("user-name");
    type = document.getElementById("type");
    bodyNode = document.querySelector("body");
    password = document.getElementById("password");


    givenName.addEventListener("input", clearPassword, false);
    familyName.addEventListener("input", function () {
        checkRequired("family-name");
        clearPassword();
    }, false);
    passPhrase.addEventListener("input", function () {
        checkRequired("passphrase");
        clearPassword();
    }, false);
    domainName.addEventListener("input", function () {
        checkRequired("domain");
        clearPassword();
    }, false);
    securityQuestion.addEventListener("input", function () {
        checkRequired();
        clearPassword();
    }, false);
    userName.addEventListener("input", function () {
        checkRequired();
        clearPassword();
    }, false);

    //Set the pass phrase viewer button when it receieves the focus
    passPhrase.addEventListener("focus", showPassPhraseDisplayButton, false);
    passPhrase.addEventListener("focusin", showPassPhraseDisplayButton, false);

    //After domain name has been set, trim all the extra information from it
    domainName.addEventListener("focusout", trimDomainName, false);
    domainName.addEventListener("blur", trimDomainName, false);

    //After pass phrase confirmation has been updated, check whether it is OK to decrypt pass phrase
    document.getElementById("confirm-passphrase").addEventListener("input", checkConfirmation, false);

    //Make sure the pass phrase viewer button is hidden when pass phrase doesn't have the foxu
    givenName.addEventListener("focus", hidePassPhraseDisplayButton, false);
    givenName.addEventListener("focusin", hidePassPhraseDisplayButton, false);
    familyName.addEventListener("focus", hidePassPhraseDisplayButton, false);
    familyName.addEventListener("focusin", hidePassPhraseDisplayButton, false);
    domainName.addEventListener("focus", hidePassPhraseDisplayButton, false);
    domainName.addEventListener("focusin", hidePassPhraseDisplayButton, false);
    securityQuestion.addEventListener("focus", hidePassPhraseDisplayButton, false);
    securityQuestion.addEventListener("focusin", hidePassPhraseDisplayButton, false);
    userName.addEventListener("focus", hidePassPhraseDisplayButton, false);
    userName.addEventListener("focusin", hidePassPhraseDisplayButton, false);

    //Add updating for userName 
    userName.addEventListener("focusout", userNameUpdate, false);
    userName.addEventListener("blur", userNameUpdate, false);


    //Add open and close for options section
    document.getElementById("options").addEventListener("click", openCloseOptions, false);

    /* Set up password type click events */
    document.getElementById("password-type").addEventListener("click", function () {
        document.getElementById("password-options").click();
    });

    //Loop through different values within password type drop down and add one listener for each value
    for (var lCounter = 0; lCounter < type.children.length; lCounter++) {
        type.children[lCounter].addEventListener("click", chooseType, false);
    }

    //Run tests when the header is clicked
    document.getElementById("header-key").addEventListener("click", runTests, false);
    //Clear pass phrase button
    document.getElementById("clear-passphrase").addEventListener("click", clearPassPhraseAndStore, false);
    //Toggle the pass phrase view on/off
    document.getElementById("show-passphrase").addEventListener("click", togglePassPhraseView, false);
    //Generate password button
    document.getElementById("generate-password").addEventListener("click", generatePassword, false);
    //Copy password button
    document.getElementById("copy-password").addEventListener("click", copyPasswordToClipboard, false);
    //Close password card button
    document.getElementById("close-password").addEventListener("click", clearPassword, false);
    //Buttons to clear password and close confirm dialog 
    document.getElementById("clear-close-dialog").addEventListener("click", closeDialog, false);
    document.getElementById("close-password-confirm").addEventListener("click", closeDialog, false);

    /* Enable UI elements */
    givenName.disabled = familyName.disabled = passPhrase.disabled = domainName.disabled = userName.disabled = type.disabled = false;

    /*Focus on the given name */
    givenName.focus();

    //Set initial type of password
    if (passwordType === undefined) {
        setType("long-password");
    }

    //Set initial pass phrase state
    if (passPhraseState === undefined) {
        setPassPhraseScreenState("editing");
    }


}, false);

function closeDialog() {
    var dialog = document.getElementById("confirm-dialog");

    clearPassPhraseAndStore();
    dialog.classList.add("hidden");
}

function userNameUpdate() {
    var optsSummary = document.getElementById("options-summary");
    var userText = document.getElementById("user-name").value;

    if (userText.length > 0) {
        userText = ", " + userText;
    }

    optsSummary.innerText = passwordDescription + userText;
}

function checkRequired(currentElement) {
    var stopPosition = -1;

    if (currentElement) {
        stopPosition = requiredElements.indexOf(currentElement);
    }

    if (stopPosition == -1) {
        stopPosition = requiredElements.length;
    }

    for (var elCounter = 0; elCounter < stopPosition; elCounter++) {
        var element = document.getElementById(requiredElements[elCounter]);
        if (element) {
            if (element.value && element.value !== "") {
                element.parentElement.classList.remove("is-invalid");
            } else {
                element.parentElement.classList.add("is-invalid");
            }
        }
    }
}

//Open or close option ssection
function openCloseOptions() {
    optionsVisible = !optionsVisible;

    var optsDiv = document.getElementById("extra-options-div");
    var optsIcon = document.getElementById("options-icon");

    if (optionsVisible) {
        optsDiv.classList.remove("hidden");
        optsIcon.innerHTML = "keyboard_arrow_up";
    } else {
        optsDiv.classList.add("hidden");
        optsIcon.innerHTML = "keyboard_arrow_down";
    }


}

/* Clear the generated password, hide the password card and re-set the UI state */
function clearPassword() {
    hideElement("password-card");
    if (password) {
        password.textContent = zeroVar(password.textContent);
        password.textContent = "";
    }
}

/* Clear the stored pass phrase if it exists */
function clearPassPhraseStore() {
    //Clear any stored values in the phrase store
    temporaryPhraseStore.clearStore();

    //If this is the chrome extension, send the clear_stored_phrase message to the background script    
    if (typeof isChromeExtension !== 'undefined') {
        clearExtPhrase();
    }
    //Store the time stamp of when the change was made
    lastPassGenTimeStamp = Date.now();
}

/* Clear the pass phrase from the UI */
function clearPassPhrase() {
    //Clear pass phrase value from the UI
    if (passPhrase) {
        passPhrase.value = zeroVar(passPhrase.value);
        passPhrase.value = "";
    }
    clearPassword();
}

function clearPassPhraseAndStore() {
    clearPassPhrase();
    clearPassPhraseStore();
    setPassPhraseScreenState("editing");
    passPhrase.focus();
}

/* Set the pass phrase value for the UI */
function setPassPhrase(passPhraseValue) {
    passPhrase.value = passPhraseValue;
    setPassPhraseScreenState("holding");
    passPhraseTimedClear();
}

/* Clear the pass phrase value for the UI after 5 minutes if no other activity */
function passPhraseTimedClear() {
    var thisPasswordTimeStamp;

    //Set timestamp for last generated password
    lastPassGenTimeStamp = Date.now();
    thisPasswordTimeStamp = lastPassGenTimeStamp;

    //Set function to clear stored pass phrase after 5 minutes if no other activity has occurred
    window.setTimeout(function () {
        //Check of this was the last password generated (timestamp still matches)
        if (thisPasswordTimeStamp === lastPassGenTimeStamp) {
            //Too much time has elapsed without any password activity so clear all the values
            clearPassPhrase();
            setPassPhraseScreenState("stored");
        }
    }, 10000);

}

/* Set-up the UI state for the password being generated, and add values to the temporaryStore  */
function passwordGenerated() {
    passPhraseTimedClear();
    //Generate and store the temporaryPhrase values
    temporaryPhraseStore.encryptPhrase(passPhrase.value, fullName)
        .then(function (val) {
            //If this is the chrome extension, send the stored_pass_phrase message to the background script    
            if (typeof isChromeExtension !== 'undefined') {
                storeExtPhrase();
            }

        })
        .catch(function (err) {
            console.log(err);
        });

}

/* Generate the password for the combination of values */
function generatePassword() {

    var password = document.getElementById("password");
    var error = document.getElementById("error");

    hidePassPhraseDisplayButton();

    //hide options if open
    if (optionsVisible) {
        openCloseOptions();
    }


    //hide the copy password div - will be checked after generation to see whether it should be shown
    hideElement("copy-password-div");

    if (!isReadyToGenerate()) {
        return;
    }

    showElement("password-card");
    error.textContent = password.textContent = "";


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
                //Special classes are required when running as an extenstion due to the space limitations of the chrome extension pop-up
                if (passwordType === "answer") {
                    bodyNode.classList.add("ext-answer-generated");

                } else {
                    bodyNode.classList.add("ext-pass-generated");
                }


                password.textContent = passwordValue;
                hideElement("load-bar-ball");

                populateOrCopyPassword();

                passwordGenerated();

                setPassPhraseScreenState("holding");

            })
            .catch(function (err) {
                error.textContent = err.message;
            });
    }

}

/* After the password is generated decide whether to insert it directly or attempt to copy it to the clipboard.
   When running as a chrome extension, check whether the extension detected a single password field on the page.
   When running stand alone, try to copy to the clipboard. N.B. This seems to be disabled in Chrome 46 and onwards.
*/
function populateOrCopyPassword() {
    var executePasswordCopy = false;

    //Check if this is running within a Chrome extension and a password or PIN is being generated
    if (typeof isChromeExtension !== 'undefined') {
        var passwordCardHeader = document.getElementById("password-card-header");
        var successToast = document.getElementById("success-toast");

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
                showToast(successToast, "copy-password-div");
            }, 250);
        }

    } else {
        //Not running in an extension so attempt to copy the password to the cliboard
        executePasswordCopy = true;
    }


    if (executePasswordCopy) {
        showElement("copy-password-div");

        password.scrollIntoView();
        //Copy password to clipboard after 0.2 second
        window.setTimeout(function () {
            copyPasswordToClipboard();
        }, 500);

    }

}

/*Set up the screen state for the pass phrase: 
        editing: pass phrase has been cleared or pass phrase is being edited and no password has been generated with it yet
        holding: pass phrase is being held for a short period - it can be used by it cannot be viewed or edited - must be cleared to edit
        stored: pass phrase is encrypted in temporary storage - requires correct first three characters to decrypt and return 
        failed: pass phrase was encrypted but confirmation of first three characters failed.  Pass phrase was cleared and UI is updated
*/
function setPassPhraseScreenState(passState) {

    passPhraseState = passState;

    if (passState === "editing") {
        //The pass phrase characters are hidden but can be viewed using the show-password button
        //Show the pass phrase with the show password buttton
        //Hide the confirm pass phrase
        showElement("passphrase-div");
        hideElement("confirm-dialog");
        hideElement("clear-passphrase");
    } else if (passState === "holding") {
        //The pass phrase characters are hidden and cannot be viewed but can be used
        //Password can be cleared and edited using the clear-password button
        //Show the pass phrase with the edit password buttton
        //Hide the confirm pass phrase
        showElement("passphrase-div");
        hideElement("confirm-dialog");

    } else if (passState === "stored") {
        //The pass phrase characters have been encrypted.  It can be retrieved using the first three characters. 
        //Password can be cleared and edited using the clear-password button
        //Show the confirm pass phrase with the edit password buttton
        //Hide the pass phrase
        // Showing the dialog
        showElement("confirm-dialog");
        document.getElementById("confirm-passphrase").focus();

    } else if (passState === "failed") {
        //An attempt to confirm the first three characters of the pass phrase failed.
        //The pass phrase characters are hidden but can be viewed using the show-password button
        //Show the pass phrase with the show password buttton but update the UI prompt
        //Hide the confirm pass phrase
        hideElement("confirm-dialog");
        showElement("passphrase-div");
        showToast("failure-toast", "passphrase-div");
        window.setTimeout(function () {
            setPassPhraseScreenState("editing");
            passPhrase.focus();
        }, 5250);

    }
}

/* Checks when three characters have been typed and then calls the confirmation decryption*/
function checkConfirmation() {
    var confirmPassPhrase = document.getElementById("confirm-passphrase");

    if (confirmPassPhrase.value.length === 3) {
        confirmThreeChars(confirmPassPhrase.value, fullName);
        zeroVar(confirmPassPhrase.value);
        confirmPassPhrase.value = "";
    }
}


/* Attempts to decrypt pass phrase using the first three characters*/
function confirmThreeChars(threeChars, Name) {
    //Attempt decryption - if succesfull set passphrase value 
    temporaryPhraseStore.decryptPhrase(threeChars, Name)
        .then(function (plainText) {
            setPassPhrase(plainText);
            setPassPhraseScreenState("holding");
        })
        .catch(function (err) {
            clearPassPhraseStore();
            clearPassPhrase();
            setPassPhraseScreenState("failed");
        });


}

/*Checks whether required elements are present to generate a password  */
function isReadyToGenerate() {

    //Check for required value highlights
    checkRequired();

    //Make sure the domain name value has been trimmed
    trimDomainName();

    //Trim of any www prefix, eg 'www.'  , 'www1.', 'www-87.' 
    var calculatedDomainName = domainName.value.replace(/^www[\w-]*./g, "").trim().toLowerCase();

    //If the value is only "w", "ww", "www", or "www." then treat as a non-value
    if (calculatedDomainName === "w" || calculatedDomainName === "ww" || calculatedDomainName === "www") {
        calculatedDomainName = "";
    }

    //Check if minimum values have been completed - all types need name and domain
    if ((givenName.value.trim().length > 0 || familyName.value.trim().length > 0) && passPhrase.value.trim().length > 0 && calculatedDomainName.length > 0 &&
        //For an answer type, a question must also be set 
        (passwordType !== "answer" || securityQuestion.value.trim().length > 0)) {
        fullName = givenName.value.trim() + familyName.value.trim();
        return true;
    } else {
        return false;
    }

}

/* Trims the value displayed on the website field to remove the leading http(s):// and anything including and after a forward slash */
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

/* Set the Produce Password button to enabled or disabled depending on the state of the UI elements */
/*function setPasswordButton() {

    generatePasswordButton.disabled = false;

    return;

    if (isReadyToGenerate()) {
        generatePasswordButton.disabled = false;
    } else {
        generatePasswordButton.disabled = true;
    }

    hideElement(copyPasswordDiv);
}*/

/*Removes the hidden class for an element */
function showElement(elementName) {
    var element = document.getElementById(elementName);
    if (element) {
        element.classList.remove("hidden");
    }
}

/*Adds the hidden class for an element */
function hideElement(elementName) {
    var element = document.getElementById(elementName);
    if (element) {
        element.classList.add("hidden");
    }
}

/*Removes the special classes required when running as a chrome extension */
function clearBodyClasses() {
    bodyNode.classList.remove("ext-pass");
    bodyNode.classList.remove("ext-answer");
    bodyNode.classList.remove("ext-pass-generated");
    bodyNode.classList.remove("ext-answer-generated");
}

/*Copy the password text to the clipboard if supported by the browser */
function copyPasswordToClipboard() {
    var clipboardVal = document.getElementById("clipboard-value");

    clipboardVal.value = password.textContent;
    clipboardVal.select();

    try {
        // Now that we've selected the anchor text, execute the copy command  
        if (document.execCommand('copy')) {
            document.getElementById("success-toast").textContent = successPrefix + " copied to Clipboard";
            showToast("success-toast", "copy-password-div");
        }

    } catch (err) {
        hideElement("copy-password-div");
        console.log("Copy command failed");
    }
}

/*Set password type function for the event listener - uses the id of the drop down control to set the password type */
function chooseType() {
    setType(this.id);
}

/*Set the password type to produce */
function setType(passwordSelection) {
    var generatePasswordButton = document.getElementById("generate-password");
    var copyPasswordButton = document.getElementById("copy-password");
    var passwordCardHeader = document.getElementById("password-card-header");

    copyPasswordButton.textContent = "Copy Password";
    successPrefix = "Password";
    passwordCardHeader.textContent = "Password";
    showElement("user-name-div");
    hideElement("security-question-div");
    passwordType = passwordSelection;

    var passwordLabel = document.getElementById("password-selected");

    switch (passwordSelection) {
        case "login":
            generatePasswordButton.textContent = "User name";
            passwordDescription = "User name";
            copyPasswordButton.textContent = "Copy User name";
            successPrefix = "User name";
            passwordCardHeader.textContent = "User name";
            passwordLabel.innerText = "User name";
            hideElement("user-name-div");
            break;
        case "maximum-password":
            generatePasswordButton.textContent = "Produce Maximum Password";
            passwordDescription = "Maximum password";
            passwordLabel.innerText = "Maximum password (20 characters)";
            break;
        case "long-password":
            generatePasswordButton.textContent = "Produce Long Password";
            passwordDescription = "Long password";
            passwordLabel.innerText = "Long password (14 characters)";
            break;
        case "medium-password":
            generatePasswordButton.textContent = "Produce Medium Password";
            passwordDescription = "Medium password";
            passwordLabel.innerText = "Medium password (8 characters)";
            break;
        case "basic-password":
            generatePasswordButton.textContent = "Produce Basic Password";
            passwordDescription = "Basic password";
            passwordLabel.innerText = "Basic password (8 chars - letters and numbers)";
            break;
        case "short-password":
            generatePasswordButton.textContent = "Produce Short Password";
            passwordDescription = "Short password";
            passwordLabel.innerText = "Short password (4 chars - letters and numbers)";
            break;
        case "pin":
            generatePasswordButton.textContent = "Produce Four Digit PIN";
            passwordDescription = "Four digit PIN";
            copyPasswordButton.textContent = "Copy PIN";
            successPrefix = "PIN";
            passwordCardHeader.textContent = "PIN";
            passwordLabel.innerText = "Four digit PIN";
            break;
        case "pin-6":
            generatePasswordButton.textContent = "Produce Six Digit PIN";
            passwordDescription = "Six digit PIN";
            copyPasswordButton.textContent = "Copy PIN";
            successPrefix = "PIN";
            passwordCardHeader.textContent = "PIN";
            passwordLabel.innerText = "Six digit PIN";
            break;
        case "answer":
            generatePasswordButton.textContent = "Produce Security Answer";
            passwordDescription = "Security answer";
            copyPasswordButton.textContent = "Copy Security Answer";
            successPrefix = "Answer";
            passwordCardHeader.textContent = "Answer";
            showElement("security-question-div");
            passwordLabel.innerText = "Security answer";
            break;
    }

    userNameUpdate();

    clearBodyClasses();
    if (passwordType === "answer") {
        bodyNode.classList.add("ext-answer");

    } else {
        bodyNode.classList.add("ext-pass");
    }

    //Clear password and hide password div
    clearPassword();
}

/*Show the pass phrase viewer button */
function showPassPhraseDisplayButton() {
    if (passPhraseState === "editing" || passPhraseState === "failed") {
        showElement("show-passphrase");
    } else if (passPhraseState === "holding") {
        showElement("clear-passphrase");
    }
}

/*Hide the pass phrase viewer button and make sure the characters are masked */
function hidePassPhraseDisplayButton() {
    hideElement("show-passphrase");
    hideElement("clear-passphrase");
    passPhrase.type = "password";
}

/*Toggle pass phrase between visible as a text area, and obscured like a normal password */
function togglePassPhraseView() {
    var passPhraseDisplayButton = document.getElementById("show-passphrase");

    if (passPhrase.type === "password") {
        passPhrase.type = "text-area";
        passPhraseDisplayButton.innerHTML = '<i class="material-icons">visibility_off</i>';
    } else {
        passPhrase.type = "password";
        passPhraseDisplayButton.innerHTML = '<i class="material-icons">visibility</i>';
    }

    passPhrase.focus();

}

/* Open and run the Jasmine tests page */
function runTests() {
    if (typeof isChromeExtension !== 'undefined') {
        window.open("https://mrpeel.github.io/opensesame/test/opensesame-test.html");
    } else {
        window.open("test/opensesame-test.html");
    }

}

/* Display a toast message for 5 seconds */
function showToast(toastElementName, coveredElementName) {
    //Show toast element
    hideElement(coveredElementName);
    showElement(toastElementName);

    var toastElement = document.getElementById(toastElementName);

    toastElement.scrollIntoView();
    //Hide again after 5 seconds
    window.setTimeout(function () {
        hideToast(toastElementName, coveredElementName);
    }, 5200);
}

/* Hide a toast message */
function hideToast(toastElementName, coveredElementName) {
    showElement(coveredElementName);
    hideElement(toastElementName);
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
            clearPassPhrase();
        }
    }, 1800000);
}

function changePassPhrase() {
    clearPassword();
    showPassPhraseDisplayButton();
}

/*global CryptoJS, Promise, console, Uint8Array, window, TextEncoder, TextDecoder */

/* Ensure functions are always adressable after minification / compilation */
window['PBKDF2'] = PBKDF2;
window['HMACSHA256'] = HMACSHA256;
window['aesEncrypt'] = aesEncrypt;
window['aesDecrypt'] = aesDecrypt;
window['convertDerivedKeyToHex'] = convertDerivedKeyToHex;
window['convertWordArrayToHex'] = convertWordArrayToHex;
window['convertWordArrayToUint8Array'] = convertWordArrayToUint8Array;
window['convertUint8ArrayToHex'] = convertUint8ArrayToHex;
window['convertHexToUint8Array'] = convertHexToUint8Array;
window['zeroVar'] = zeroVar;
window['zeroIntArray'] = zeroIntArray;

/**
 * Executes the PBKDF2 function.  If crypto subtle is supported it is used.  If not,  the CryptoJS PBKDF2 function is wrapped
 * in a promise.   Either way, it returns the derived key
 * @param {password, salt, numIterations, keylength} the password to perform the function on, the salt to apply, the number of iterations to 
 *     perform, and the length for the derived key
 * @return {Promise} A promise which resolves to the derived key.
 */


function PBKDF2(password, salt, numIterations, keyLength) {
    "use strict";

    if (window.crypto && window.crypto.subtle) {
        //use the subtle crypto functions
        var cryptoTextEncoder = new TextEncoder("utf-8");

        var saltBuffer = cryptoTextEncoder.encode(salt);
        var passwordBuffer = cryptoTextEncoder.encode(password);

        return window.crypto.subtle.importKey('raw', passwordBuffer, {
            name: 'PBKDF2'
        }, false, ['deriveBits']).then(function (key) {
            return window.crypto.subtle.deriveBits({
                name: 'PBKDF2',
                iterations: numIterations,
                salt: saltBuffer,
                hash: 'SHA-1'
            }, key, keyLength);
        });

    } else {
        //use the CryptJS function

        return new Promise(function (resolve, reject) {
            var derivedKey = CryptoJS.PBKDF2(password, salt, {
                iterations: numIterations,
                keySize: keyLength / 32
            });

            resolve(derivedKey);
        });
    }

}

/**
 * Executes the HMAC-SHA256 function.  If crypto subtle is supported it is used.  If not,  the CryptoJS HmacSHA256 function is wrapped
 * in a promise, the converts the Word Array to a Uint8Array.  Returns the MAC as a Uint8Array.
 * @param {plainText, key} The plaintext data to be signed and the key to use for the signing.
 * @return {Promise} A promise which resolves a Uint8Array with the MAC.
 */

function HMACSHA256(plainText, key) {
    "use strict";

    if (window.crypto && window.crypto.subtle) {
        //use the subtle crypto functions
        return new Promise(function (resolve, reject) {

            var cryptoTextEncoder = new TextEncoder("utf-8");
            var plainTextBuffer = cryptoTextEncoder.encode(plainText);

            window.crypto.subtle.importKey("raw", key, {
                    name: "HMAC",
                    hash: {
                        name: "SHA-256"
                    }
                }, false /*not extractable*/ , ["sign"])
                .then(function (importedKey) {

                    return window.crypto.subtle.sign({
                        name: "HMAC",
                        hash: {
                            name: "SHA-256"
                        }
                    }, importedKey, plainTextBuffer);
                })
                .then(function (mac) {
                    var macArray = new Uint8Array(mac);

                    resolve(macArray);
                });
        });

    } else {
        //use the CryptJS function
        return new Promise(function (resolve, reject) {
            var mac = CryptoJS.HmacSHA256(plainText, key);
            var macArray = convertWordArrayToUint8Array(mac);
            //Convert to uInt8Array
            resolve(macArray);
        });
    }
}

/**
 * Executes an AES encryption.  If crypto subtle is supported it is used.  If not,  the CryptoJS AES encryption function is wrapped in a promise.
 * Returns the encrypted data.
 * @param {plainText, key} The plaintext data to be encrypted and the encryption key as a hex string.
 * @return {Promise} A promise which resolves to the encryted data.
 */
function aesEncrypt(plainText, key) {
    "use strict";

    if (window.crypto && window.crypto.subtle) {
        //use the subtle crypto functions
        return new Promise(function (resolve, reject) {
            var cryptoTextEncoder = new TextEncoder("utf-8");
            var plainTextBuffer = cryptoTextEncoder.encode(plainText);

            //Key will be supplied in hex - so need to convert to Uint8Array
            var aesKey = convertHexToUint8Array(key);

            //Create random initialisation vector
            var iv = window.crypto.getRandomValues(new Uint8Array(16));

            window.crypto.subtle.importKey("raw", aesKey, {
                    name: "AES-CBC",
                    length: 128
                }, false /*not extractable*/ , ["encrypt"])
                .then(function (importedKey) {


                    return window.crypto.subtle.encrypt({
                        "name": "AES-CBC",
                        iv: iv
                    }, importedKey, plainTextBuffer);
                })
                .then(function (encryptedData) {
                    var encryptedArray = new Uint8Array(encryptedData);

                    resolve({
                        iv: iv,
                        ciphertext: encryptedArray
                    }); //Return an object so the iv is contained with the ciphertext
                });
        });
    } else {
        //use the CryptJS function
        return new Promise(function (resolve, reject) {
            var encrypted = CryptoJS.AES.encrypt(plainText, key);
            resolve(encrypted);
        });
    }

}

/**
 * Executes an AES decryption.  If crypto subtle is supported it is used.  If not,  the CryptoJS AES decryption function is wrapped in a promise.
 * Returns the decrypted data.
 * @param {cipherText, key} The ciphertext data to be decrypted and the decryption key as a hex string.
 * @return {Promise} A promise which resolves to the plain text data.
 */
function aesDecrypt(encyptedData, key) {
    "use strict";


    if (window.crypto && window.crypto.subtle) {
        //use the subtle crypto functions
        return new Promise(function (resolve, reject) {
            //Key will be supplied in hex - so need to convert to Uint8Array
            var cryptoTextEncoder = new TextEncoder("utf-8");
            var cryptoTextDecoder = new TextDecoder("utf-8");
            var aesKey = convertHexToUint8Array(key);

            window.crypto.subtle.importKey("raw", aesKey, {
                    name: "AES-CBC",
                    length: 128
                }, false /*not extractable*/ , ["decrypt"])
                .then(function (importedKey) {

                    return window.crypto.subtle.decrypt({
                            name: "AES-CBC",
                            iv: encyptedData.iv // Same IV as for encryption
                        },
                        importedKey,
                        encyptedData.ciphertext
                    );
                })
                .then(function (decryptedData) {
                    var decryptedArray = new Uint8Array(decryptedData);
                    var plainText = cryptoTextDecoder.decode(decryptedArray);

                    resolve(plainText);
                });
        });

    } else {
        //use the CryptJS function
        return new Promise(function (resolve, reject) {
            var decrypted = CryptoJS.AES.decrypt(encyptedData, key);

            //var decryptedArray = cryptoContext.convertWordArrayToUint8Array(decrypted);
            //var plainText = cryptoContext.cryptoTextDecoder.decode(decryptedArray);

            var plainText = CryptoJS.enc.Utf8.stringify(decrypted);
            resolve(plainText);
        });
    }


}

/**
 * Converts a derived key to a hex string.  Determines whether using subtle crypto of CryptoJS and uses appropriate function
 * @param {wordArray / bufffer} derivedKey.
 * @return {String}.
 */
function convertDerivedKeyToHex(derivedKey) {
    "use strict";

    if (window.crypto && window.crypto.subtle) {
        return convertUint8ArrayToHex(new Uint8Array(derivedKey));

    } else {
        return convertUint8ArrayToHex(convertWordArrayToUint8Array(derivedKey));

    }


}

/**
 * Converts a word array into a Hex String by chaining together canversion to Uint8Array, then to hex 
 * @param {word array} wordArray .
 * @return {String}.
 */
function convertWordArrayToHex(wordArray) {
    "use strict";

    return convertUint8ArrayToHex(convertWordArrayToUint8Array(wordArray));

}

/**
 * Converts a word array into a Uint8Array. 
 * @param {word array} wordArray .
 * @return {Uint8Array}.
 */
function convertWordArrayToUint8Array(wordArray) {
    "use strict";

    var words = wordArray.words;
    var sigBytes = wordArray.sigBytes;

    // Convert
    var u8 = new Uint8Array(sigBytes);
    for (var i = 0; i < sigBytes; i++) {
        var byte = (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
        u8[i] = byte;
    }

    return u8;

}

/**
 * Converts a Uint8Array into a Uint8Array to a hex string. 
 * @param {u8Array} Uint8Array.
 * @return {String}.
 */
function convertUint8ArrayToHex(u8Array) {
    var i;
    var len;
    var hex = '';
    var c;

    for (i = 0, len = u8Array.length; i < len; i += 1) {
        c = u8Array[i].toString(16);
        if (c.length < 2) {
            c = '0' + c;
        }
        hex += c;
    }

    return hex;
}


/**
 * Converts a Hex string into a Uint8Array. 
 * @param {hex} String.
 * @return {Uint8Array}.
 */
function convertHexToUint8Array(hex) {
    var i;
    var byteLen = hex.length / 2;
    var arr;
    var j = 0;

    if (byteLen !== parseInt(byteLen, 10)) {
        throw new Error("Invalid hex length '" + hex.length + "'");
    }

    arr = new Uint8Array(byteLen);

    for (i = 0; i < byteLen; i += 1) {
        arr[i] = parseInt(hex[j] + hex[j + 1], 16);
        j += 2;
    }

    return arr;
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

/*global  console, CryptoJS, Uint8Array, Promise, performance, TextEncoder, TextDecoder, window, webcrypto, crypto, CryptoFunctions */
/*global PBKDF2, convertDerivedKeyToHex, aesEncrypt, aesDecrypt, zeroVar, zeroIntArray */


var TemporaryPhraseStore = function () {
    this.ns = "cake.man.io";
};

/* Encrypts the pass phrase using the name as a salt.  Runs a PBKDF2 500 times on the firsth three characters of the passphrase to generate a key.  
 *     Then runs PBKDF2 250 times on the key to generate a hash to store for comparison later.
 *     The key is used to encrypt the data using AES and the result is stored.
 * @param {passphrase, name} strings.
 * @return {promise} A promise which will be resolved with eoither "Success" or rejected with an error.     
 */
TemporaryPhraseStore.prototype.encryptPhrase = function (passphrase, name) {
    "use strict";

    var aesKey;
    var tempStoreContext = this;
    return new Promise(function (resolve, reject) {

        if (typeof passphrase === "string" && passphrase.length >= 3) {
            var firstThreeChars = passphrase.substring(0, 3);


            PBKDF2(name + firstThreeChars, name + tempStoreContext.ns, 500, 128)
                .then(function (key) {
                    aesKey = convertDerivedKeyToHex(key);

                    return PBKDF2(convertDerivedKeyToHex(key), name + firstThreeChars, 250, 128);
                }).then(function (verificationHash) {
                    tempStoreContext.threeCharHash = convertDerivedKeyToHex(verificationHash);

                    return aesEncrypt(passphrase, aesKey);
                }).then(function (encryptedData) {
                    tempStoreContext.encData = encryptedData;
                    resolve("Success");
                }).catch(function (err) {
                    reject(err);
                });
        } else {
            reject("Pass phrase must be a sring at least three characters long");
        }
    });

};

/* Descrypts the pass phrase using the first three chars and name.  Runs a PBKDF2 500 times on the firsth three characters of the passphrase
 * to generate a key.  Then runs PBKDF2 250 times on the key to generate a hash.  The generated hash is compared to the stored hash.  If they 
 * match, the key used to decrypt the pass phrase using AES.  If not, the encrypted data and has are cleared.
 * @param {firstThreeChars, name} strings.
 * @return {promise} A promise which will be resolved with the pass phrasee or rejected with an error.     
 */
TemporaryPhraseStore.prototype.decryptPhrase = function (firstThreeChars, name) {
    "use strict";

    var tempStoreContext = this;
    var aesKey;

    return new Promise(function (resolve, reject) {

        if (typeof tempStoreContext.encData === "undefined") {
            reject("No encrypted data found");

        } else if (typeof firstThreeChars !== "string" || firstThreeChars.length !== 3) {
            tempStoreContext.clearStore();

            reject("First three characters parameter is not a 3 character string");

        } else {


            PBKDF2(name + firstThreeChars, name + tempStoreContext.ns, 500, 128)
                .then(function (key) {
                    aesKey = convertDerivedKeyToHex(key);

                    return PBKDF2(convertDerivedKeyToHex(key), name + firstThreeChars, 250, 128);
                }).then(function (verificationHash) {
                    if (tempStoreContext.threeCharHash === convertDerivedKeyToHex(verificationHash)) {

                        aesDecrypt(tempStoreContext.encData, aesKey)
                            .then(function (plainText) {
                                resolve(plainText);
                            });

                    } else {
                        tempStoreContext.clearStore();
                        reject("First three characters did not match");
                    }

                });
        }
    });
};

/* Clears any stored data for the hash and encrypted pass phrase
 * @param {none}
 * @return {none}
 */
TemporaryPhraseStore.prototype.clearStore = function () {
    "use strict";

    if (typeof this.threeCharHash !== "undefined") {
        zeroVar(this.threeCharHash);
        delete this.threeCharHash;
    }

    if (typeof this.encData !== "undefined") {

        if (typeof this.encData.iv === "string") {
            zeroVar(this.encData.iv);
            this.encData.iv = "";
        } else if (this.encData.iv.constructor.name === "Uint8Array") {
            zeroIntArray(this.encData.iv);
            this.encData.iv = [];
        }

        if (typeof this.encData.ciphertext === "string") {
            zeroVar(this.encData.ciphertext);
            this.encData.ciphertext = "";
        } else if (this.encData.ciphertext.constructor.name === "Uint8Array") {
            zeroIntArray(this.encData.ciphertext);
            this.encData.ciphertext = [];
        }

        delete this.encData;
    }

};

/* Allows values to be stored which were created separately.  This functionality is required for the chrome extension which stores and returns values. 
 * @param {threeCharHash, encData} String, Uint8Array
 * @return {none}
 */
TemporaryPhraseStore.prototype.storeValues = function (threeCharHash, encData) {
    "use strict";


    this.threeCharHash = threeCharHash;
    this.encData = encData;

};
