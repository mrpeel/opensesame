/*global  console, CryptoJS, Uint8Array, Promise, performance, TextEncoder, TextDecoder, window, webcrypto, crypto, CryptoFunctions */
/*global PBKDF2, convertDerivedKeyToHex, aesEncrypt, aesDecrypt, zeroVar, zeroIntArray */


var TemporaryPhraseStore = function () {
    this.ns = "cake.man.io";
};


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



TemporaryPhraseStore.prototype.decryptPhrase = function (firstThreeChars, name) {
    "use strict";

    var tempStoreContext = this;
    var aesKey;

    return new Promise(function (resolve, reject) {

        if (typeof tempStoreContext.encData === "undefined") {
            reject("No encrypted data found");

        } else if (typeof firstThreeChars !== "string" || firstThreeChars.length !== 3) {
            delete tempStoreContext.encData;
            delete tempStoreContext.threeCharHash;

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
                        zeroVar(tempStoreContext.threeCharHash);
                        tempStoreContext.threeCharHash = "";

                        if (typeof tempStoreContext.encData.iv === "string") {
                            zeroVar(tempStoreContext.encData.iv);
                            tempStoreContext.encData.iv = "";
                        } else if (tempStoreContext.encData.iv.constructor.name === "Uint8Array") {
                            zeroIntArray(tempStoreContext.encData.iv);
                            tempStoreContext.encData.iv = [];
                        }

                        if (typeof tempStoreContext.encData.ciphertext === "string") {
                            zeroVar(tempStoreContext.encData.ciphertext);
                            tempStoreContext.encData.ciphertext = "";
                        } else if (tempStoreContext.encData.ciphertext.constructor.name === "Uint8Array") {
                            zeroIntArray(tempStoreContext.encData.ciphertext);
                            tempStoreContext.encData.ciphertext = [];
                        }

                        delete tempStoreContext.encData;
                        delete tempStoreContext.threeCharHash;

                        reject("First three characters did not match");
                    }

                });
        }
    });
};
