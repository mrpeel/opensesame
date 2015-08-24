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

    if (this.passPhrase.length === 0) {
        return Promise.reject(new Error("Pass phrase not present"));
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
            var salt = passNS + "." + passOffContext.fullName;
            var domainValue = passOffContext.domainName;

            //If  a specific user has been specified, then add to domain value
            if (passOffContext.userName && passOffContext.userName.length) {
                domainValue = passOffContext.userName + "@" + domainValue;
            }

            //If a security question has been specified, add to domain value
            if (passOffContext.securityQuestion && passOffContext.securityQuestion.length) {
                domainValue = domainValue + ":" + passOffContext.securityQuestion;
            }



            return passOffContext.PBKDF2(passOffContext.passPhrase, salt)
                .then(function (key) {
                    console.log("Derived key: " + key);

                    return passOffContext.HMACSHA256(domainValue, key);
                }).then(function (seed) {
                    console.log("HMAC result seed hex: " + seed);
                    var seedArray = passOffContext.convertWordArrayToUint8Array(seed);

                    console.log("HMAC result seed array: " + seedArray);
                    console.log(performance.now() - t0 + " ms");
                    return seedArray;
                }).then(function (seedArray) {
                    // Find the selected template array
                    var templateType = passOffContext.templates[passwordType];

                    // Select the specific template based on seed[0]
                    var template = templateType[seedArray[0] % templateType.length];
                    console.log("Selected template: " + template);
                    console.log(performance.now() - t0 + " ms");

                    // Split the template string
                    var password = template.split("").map(function (c, i) {
                        // Use the available passchars to map the template string
                        // to characters (e.g. c -> bcdfghjklmnpqrstvwxyz)
                        var chars = passOffContext.passchars[c];

                        // Select the character using seed[i + 1]
                        return chars[seedArray[i + 1] % chars.length];
                    }).join(""); /*Re-join as password*/
                    console.log("Generated password: " + password);
                    console.log(performance.now() - t0 + " ms");
                    console.log("All done");

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


/*PassOff.prototype.test() {
    // Pretty simple test here
    return new MPW("user", "password").generate("example.com", 1, null, "long", MPW.NS).then(function (password) {
        console.assert(password === "Zugf8.RuqeLugu", `Self-test failed; expected: Zugf8.RuqeLugu; got: ${password}`);
        return password === "Zugf8.RuqeLugu" ? Promise.resolve() : Promise.reject(new Error(`Self-test failed; expected: ZedaFaxcZaso9*; got: ${password}`));
    });
};*/
