/* global Uint8Array, Promise  */
/* global pBKDF2, convertDerivedKeyToHex, aesEncrypt, aesDecrypt, zeroVar,
zeroIntArray */
/* global assert */

'use strict';

/** Class to handle temporary storage of passphrase in an encrypted state
*    and subsequent attempt to retrieve the poass phrase.  The first three
*    chars of the passphrase are used to encrypt and decrypt the pass phrase.
*/
class TemporaryPhraseStore {
  /**
  * constructor
  */
  constructor() {
    this.ns = 'cake.man.io';
  }

  /**
  * Encrypts the pass phrase using the name as a salt.  Runs a pBKDF2 500 times
  * on the firsth three characters of the passphrase to generate a key.
  *     Then runs pBKDF2 250 times on the key to generate a hash to store for
  *     comparison later.
  *     The key is used to encrypt the data using AES and the result is stored.
  * @param {String} passphrase
  * @param {String} name
  * @return {promise} A promise which will be resolved with eoither 'Success' or
  *  rejected with an error.
   */
  encryptPhrase(passphrase, name) {
    assert(passphrase !== '',
      'TemporaryPhraseStore.prototype.encryptPhrase passphrase: ' +
      passPhrase);
    assert(name !== '',
      'TemporaryPhraseStore.prototype.encryptPhrase userName: ' + name);


    let aesKey;
    let tempStoreContext = this;
    return new Promise(function(resolve, reject) {
      if (typeof passphrase === 'string' && passphrase.length >= 3) {
        let firstThreeChars = passphrase.substring(0, 3);

        pBKDF2(name + firstThreeChars, name + tempStoreContext.ns, 500, 128)
          .then(function(key) {
            aesKey = convertDerivedKeyToHex(key);

            return pBKDF2(convertDerivedKeyToHex(key), name +
              firstThreeChars, 250, 128);
          }).then(function(verificationHash) {
          tempStoreContext.threeCharHash = convertDerivedKeyToHex(
            verificationHash);

          return aesEncrypt(passphrase, aesKey);
        }).then(function(encryptedData) {
          tempStoreContext.encData = encryptedData;
          resolve('Success');
        }).catch(function(err) {
          reject(err);
        });
      } else {
        reject('Pass phrase must be a sring at least three characters long');
      }
    });
  }

  /**
  *  Descrypts the pass phrase using the first three chars and name.  Runs a
  *   pBKDF2 500 times on the firsth three characters of the passphrase
  * to generate a key.  Then runs pBKDF2 250 times on the key to generate a
  * hash.  The generated hash is compared to the stored hash.  If they
  * match, the key used to decrypt the pass phrase using AES.  If not, the
  * encrypted data and has are cleared.
  * @param {String} firstThreeChars
  * @param {String} name
  * @return {promise} A promise which will be resolved with the pass phrasee or
  *  rejected with an error.
  */
  decryptPhrase(firstThreeChars, name) {
    assert(firstThreeChars !== '',
      'TemporaryPhraseStore.prototype.decryptPhrase firstThreeChars: ' +
      firstThreeChars);
    assert(name !== '', 'TemporaryPhraseStore.prototype.decryptPhrase name: ' +
      name);

    let tempStoreContext = this;
    let aesKey;

    return new Promise(function(resolve, reject) {
      if (typeof tempStoreContext.encData === 'undefined') {
        reject('No encrypted data found');
      } else if (typeof firstThreeChars !== 'string' ||
        firstThreeChars.length !== 3) {
        tempStoreContext.clearStore();

        reject(
          'First three characters parameter is not a 3 character string');
      } else {
        pBKDF2(name + firstThreeChars, name + tempStoreContext.ns, 500, 128)
          .then(function(key) {
            aesKey = convertDerivedKeyToHex(key);
            // console.log('Key: ' + aesKey);

            return pBKDF2(convertDerivedKeyToHex(key), name +
              firstThreeChars, 250, 128);
          }).then(function(verificationHash) {
          // console.log('Stored hash: ' + tempStoreContext.threeCharHash);
          // console.log('Verification hash: ' + convertDerivedKeyToHex(
          // verificationHash));

          if (tempStoreContext.threeCharHash === convertDerivedKeyToHex(
              verificationHash)) {
            // console.log('Encrypted data');
            // console.log(tempStoreContext.encData);

            aesDecrypt(tempStoreContext.encData, aesKey)
              .then(function(plainText) {
                resolve(plainText);
              });
          } else {
            tempStoreContext.clearStore();
            reject('First three characters did not match');
          }
        });
      }
    });
  }

  /** Clears any stored data for the hash and encrypted pass phrase
   */
  clearStore() {
    if (typeof this.threeCharHash !== 'undefined') {
      zeroVar(this.threeCharHash);
      delete this.threeCharHash;
    }

    if (typeof this.encData !== 'undefined') {
      if (typeof this.encData.iv === 'string') {
        zeroVar(this.encData.iv);
        this.encData.iv = '';
      } else if (this.encData.iv.constructor.name === 'Uint8Array') {
        zeroIntArray(this.encData.iv);
        this.encData.iv = [];
      }

      if (typeof this.encData.ciphertext === 'string') {
        zeroVar(this.encData.ciphertext);
        this.encData.ciphertext = '';
      } else if (this.encData.ciphertext.constructor.name === 'Uint8Array') {
        zeroIntArray(this.encData.ciphertext);
        this.encData.ciphertext = [];
      }

      delete this.encData;
    }
  }

  /**
  * Allows values to be stored which were created separately.  This
  *  functionality is required for the chrome extension which stores and returns
  *  values
  * @param {String} threeCharHash
  * @param {Uint8Array} encData
  */
  storeValues(threeCharHash, encData) {
    assert(threeCharHash !== '',
      'TemporaryPhraseStore.prototype.storeValues threeCharHash: ' +
      threeCharHash);
    assert(encData !== '',
      'TemporaryPhraseStore.prototype.storeValues encData: ' +
      encData);

    this.threeCharHash = threeCharHash;
    this.encData = encData;
  }
}

window['TemporaryPhraseStore'] = TemporaryPhraseStore;
