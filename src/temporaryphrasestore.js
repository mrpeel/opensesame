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
