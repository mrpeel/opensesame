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
