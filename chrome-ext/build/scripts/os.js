/* global console */

/* exported assert */

const ASSERT_ENABLED = true;
const ASSERT_ERROR = false;
const ASSERT_VERBOSE = false;

/**
 * Simple assertions - checks global variables to decide whether to run and
 * if it runs whether to throw an error or log a console message
 * @param {Objecy} condition - conditional statement to assess
 * @param {Sring} message - message to log if condition is false
 */
function assert(condition, message) {
  if (ASSERT_ENABLED && !condition) {
    if (ASSERT_ERROR) {
      throw new Error('Assertion failed' + typeof message === 'undefined' ? '' :
        message);
    } else {
      console.log('Assertion failed');
      console.log(typeof message === 'undefined' ? '' : message);
    }
  } else if (ASSERT_VERBOSE && condition) {
    console.log(typeof message === 'undefined' ? '' : message);
  }
}

/* global CryptoJS, Promise, Uint8Array, window, TextEncoder,
TextDecoder */
/* global assert */

/* Ensure functions are always adressable after minification / compilation */
window['pBKDF2'] = pBKDF2;
window['hMACSHA256'] = hMACSHA256;
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
  * Executes the PBKDF2 function.  If crypto subtle is supported it is used.
  *  If not,  the CryptoJS PBKDF2 function is wrapped
  *  in a promise.   Either way, it returns the derived key
  * @param {String} password -  the password to perform the function on
  * @param {String} salt - the salt to apply
  * @param {Integer} numIterations - the number of iterations to perform
  * @param {Integer} keyLength - the length for the derived key
  * @return {Promise} A promise which resolves to the derived key.
 */
function pBKDF2(password, salt, numIterations, keyLength) {
  'use strict';

  assert(password !== '',
    'PBKDF2 password: ' +
    password);
  assert(salt !== '',
    'PBKDF2 salt: ' +
    salt);
  assert(typeof numIterations === 'number',
    'PBKDF2 numIterations: ' +
    numIterations);
  assert(typeof keyLength === 'number',
    'PBKDF2 keyLength: ' +
    keyLength);


  if (window.crypto && window.crypto.subtle) {
    return new Promise(function(resolve, reject) {
      // use the subtle crypto functions
      let cryptoTextEncoder = new TextEncoder('utf-8');

      let saltBuffer = cryptoTextEncoder.encode(salt);
      let passwordBuffer = cryptoTextEncoder.encode(password);

      window.crypto.subtle.importKey('raw', passwordBuffer, {
        name: 'PBKDF2',
      }, false, ['deriveBits'])
        .then(function(key) {
          return window.crypto.subtle.deriveBits({
            name: 'PBKDF2',
            iterations: numIterations,
            salt: saltBuffer,
            hash: 'SHA-1',
          }, key, keyLength);
        })
        .then(function(derivedKey) {
          resolve(derivedKey);
        })
        .catch(function(err) {
          reject(err);
        });
    });
  } else {
    // use the CryptJS function
    return new Promise(function(resolve, reject) {
      let derivedKey = CryptoJS.PBKDF2(password, salt, {
        iterations: numIterations,
        keySize: keyLength / 32,
      });

      resolve(derivedKey);
    });
  }
}

/**
* Executes the HMAC-SHA256 function.  If crypto subtle is supported it is
* used.  If not,  the CryptoJS HmacSHA256 function is wrapped
* in a promise, the converts the Word Array to a Uint8Array.  Returns the
*  MAC as a Uint8Array.
* @param {String} plainText - the plaintext data to be signed
* @param {String} key - the key to use for the signing
* @return {Promise} A promise which resolves a Uint8Array with the MAC.
 */
function hMACSHA256(plainText, key) {
  'use strict';

  if (window.crypto && window.crypto.subtle) {
    // use the subtle crypto functions
    return new Promise(function(resolve, reject) {
      let cryptoTextEncoder = new TextEncoder('utf-8');
      let plainTextBuffer = cryptoTextEncoder.encode(plainText);

      window.crypto.subtle.importKey('raw', key, {
        name: 'HMAC',
        hash: {
          name: 'SHA-256',
        },
      }, false, ['sign']) /* not extractable */
        .then(function(importedKey) {
          return window.crypto.subtle.sign({
            name: 'HMAC',
            hash: {
              name: 'SHA-256',
            },
          }, importedKey, plainTextBuffer);
        })
        .then(function(mac) {
          let macArray = new Uint8Array(mac);

          resolve(macArray);
        });
    });
  } else {
    // use the CryptJS function
    return new Promise(function(resolve, reject) {
      let mac = CryptoJS.HmacSHA256(plainText, key);
      let macArray = convertWordArrayToUint8Array(mac);
      // Convert to uInt8Array
      resolve(macArray);
    });
  }
}

/**
 * Executes an AES encryption.  If crypto subtle is supported it is used.
 *  If not,  the CryptoJS AES encryption function is wrapped in a promise.
 * Returns the encrypted data.
 * @param {String} plainText - the plaintext data to be encrypted
 * @param {String} key - the encryption key as a hex string.
 * @return {Promise} A promise which resolves to the encryted data.
 */
function aesEncrypt(plainText, key) {
  'use strict';
  if (window.crypto && window.crypto.subtle) {
    // use the subtle crypto functions
    return new Promise(function(resolve, reject) {
      let cryptoTextEncoder = new TextEncoder('utf-8');
      let plainTextBuffer = cryptoTextEncoder.encode(plainText);

      // Key will be supplied in hex - so need to convert to Uint8Array
      let aesKey = convertHexToUint8Array(key);

      // Create random initialisation vector
      let iv = window.crypto.getRandomValues(new Uint8Array(16));

      window.crypto.subtle.importKey('raw', aesKey, {
        name: 'AES-CBC',
        length: 128,
      }, false, ['encrypt']) /* not extractable */
        .then(function(importedKey) {
          return window.crypto.subtle.encrypt({
            'name': 'AES-CBC',
            'iv': iv,
          }, importedKey, plainTextBuffer);
        })
        .then(function(encryptedData) {
          let encryptedArray = new Uint8Array(encryptedData);

          resolve({
            'iv': iv,
            'ciphertext': encryptedArray,
          }); // Return an object so the iv is contained with the ciphertext
        });
    });
  } else {
    // use the CryptJS function
    return new Promise(function(resolve, reject) {
      let encrypted = CryptoJS.AES.encrypt(plainText, key);
      resolve(encrypted);
    });
  }
}

/**
 * Executes an AES decryption.  If crypto subtle is supported it is used.
 *    If not,  the CryptoJS AES decryption function is wrapped in a promise.
 * Returns the decrypted data.
 * @param {String} encryptedData - the ciphertext data to be decrypted
 * @param {String} key - the decryption key as a hex string.
 * @return {Promise} A promise which resolves to the plain text data.
 */
function aesDecrypt(encryptedData, key) {
  'use strict';

  if (window.crypto && window.crypto.subtle) {
    // use the subtle crypto functions
    return new Promise(function(resolve, reject) {
      // Key will be supplied in hex - so need to convert to Uint8Array
      // let cryptoTextEncoder = new TextEncoder('utf-8');
      let cryptoTextDecoder = new TextDecoder('utf-8');
      let aesKey = convertHexToUint8Array(key);

      window.crypto.subtle.importKey('raw', aesKey, {
        'name': 'AES-CBC',
        'length': 128,
      }, false, ['decrypt']) /* not extractable */
        .then(function(importedKey) {
          return window.crypto.subtle.decrypt({
            'name': 'AES-CBC',
            'iv': encryptedData.iv, // Same IV as for encryption
          },
            importedKey,
            encryptedData.ciphertext
          );
        })
        .then(function(decryptedData) {
          let decryptedArray = new Uint8Array(decryptedData);
          let plainText = cryptoTextDecoder.decode(decryptedArray);

          resolve(plainText);
        });
    });
  } else {
    // use the CryptJS function
    return new Promise(function(resolve, reject) {
      let decrypted = CryptoJS.AES.decrypt(encyptedData, key);
      let plainText = CryptoJS.enc.Utf8.stringify(decrypted);
      resolve(plainText);
    });
  }
}

/**
 * Converts a derived key to a hex string.  Determines whether using subtle
  *crypto of CryptoJS and uses appropriate function
 * @param {wordArray} derivedKey
 * @return {String}
 */
function convertDerivedKeyToHex(derivedKey) {
  'use strict';

  if (window.crypto && window.crypto.subtle) {
    return convertUint8ArrayToHex(new Uint8Array(derivedKey));
  } else {
    return convertUint8ArrayToHex(convertWordArrayToUint8Array(derivedKey));
  }
}

/**
 * Converts a word array into a Hex String by chaining together canversion to
 *  Uint8Array, then to hex
 * @param {wordArray} wordArray
 * @return {String}
 */
function convertWordArrayToHex(wordArray) {
  'use strict';

  return convertUint8ArrayToHex(convertWordArrayToUint8Array(wordArray));
}

/**
 * Converts a word array into a Uint8Array.
 * @param {wordArray} wordArray
 * @return {Uint8Array}
 */
function convertWordArrayToUint8Array(wordArray) {
  'use strict';

  let words = wordArray.words;
  let sigBytes = wordArray.sigBytes;

  // Convert
  let u8 = new Uint8Array(sigBytes);
  for (let i = 0; i < sigBytes; i++) {
    let byte = (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
    u8[i] = byte;
  }

  return u8;
}

/**
 * Converts a Uint8Array into a Uint8Array to a hex string.
 * @param {Uint8Array} u8Array
 * @return {String}.
 */
function convertUint8ArrayToHex(u8Array) {
  let i;
  let len;
  let hex = '';
  let c;

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
 * @param {String} hex
 * @return {Uint8Array}
 */
function convertHexToUint8Array(hex) {
  let i;
  let byteLen = hex.length / 2;
  let arr;
  let j = 0;

  if (byteLen !== parseInt(byteLen, 10)) {
    throw new Error('Invalid hex length ' + hex.length);
  }

  arr = new Uint8Array(byteLen);

  for (i = 0; i < byteLen; i += 1) {
    arr[i] = parseInt(hex[j] + hex[j + 1], 16);
    j += 2;
  }

  return arr;
}

/**
* Utility function to replace a string's value with all zeroes
* @param {String} varToZero
* @return {String}
 */
function zeroVar(varToZero) {
  return Array(varToZero.length).join('0');
}

/**
 * Utility function to replace an array's value with all zeroes
 * @param {Array} arrayToZero
 * @return {Array}
 */
function zeroIntArray(arrayToZero) {
  let holdingVal = arrayToZero;
  for (let aCounter = 0; aCounter < arrayToZero.length; aCounter++) {
    holdingVal[aCounter] = 0;
  }
  return holdingVal;
}

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
      passphrase);
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

/** OpenSesame class encapsulating the functionality for generating a password.
    Requires cryptofunctions.js which determies whether to use subtle crypto
     or cryptojs and executes the appropriate functions.
*/

/* global Promise, zeroVar  */
'use strict';

/**
 *
 * OpenSesame uses BKDF2 to generate salted password and HMAC256 to generate a
* seed.  The seed is then ued to generate a password based on a chosen template.
 */
class OpenSesame {
  /**
   * Constructor.  Sets up all the base values required for password
   *  generation
   */
  constructor() {
    //  The namespace used in calculateKey
    this.keyNS = 'cake.man.opensesame';

    //  The namespaces used in calculateSeed
    this.passwordNS = 'cake.man.opensesame.password';
    this.loginNS = 'cake.man.opensesame.login';
    this.answerNS = 'cake.man.opensesame.answer';

    //  The values which will be populated for creating the password
    this.lowerChars = 'abcdefghijklmnopqrstuvwxyz';
    this.upperChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    this.numberChars = '0123456789';
    this.symbolChars = '!@#$%^&*()';

    //  The templates that passwords may be created from
    //  The characters map to MPW.passchars
    this.passwordTypes = {
      'maximum-password': {
        'charSet': this.upperChars + this.lowerChars + this.numberChars +
          this.symbolChars,
        'length': 20,
        'needsUpper': true,
        'needsLower': true,
        'needsNumber': true,
        'needsSymbol': true,
      },
      'long-password': {
        'charSet': this.upperChars + this.lowerChars + this.numberChars +
          this.symbolChars,
        'length': 14,
        'needsUpper': true,
        'needsLower': true,
        'needsNumber': true,
        'needsSymbol': true,
      },
      'medium-password': {
        'charSet': this.upperChars + this.lowerChars + this.numberChars +
          this.symbolChars,
        'length': 8,
        'needsUpper': true,
        'needsLower': true,
        'needsNumber': true,
        'needsSymbol': true,
      },
      'basic-password': {
        'charSet': this.upperChars + this.lowerChars + this.numberChars,
        'length': 8,
        'needsUpper': true,
        'needsLower': true,
        'needsNumber': true,
      },
      'short-password': {
        'charSet': this.upperChars + this.lowerChars + this.numberChars,
        'length': 6,
        'needsUpper': true,
        'needsLower': true,
        'needsNumber': true,
      },
      'pin': {
        'charSet': this.numberChars,
        'length': 4,
      },
      'pin-6': {
        'charSet': this.numberChars,
        'length': 6,
      },
      'answer': {
        'charSet': this.lowerChars,
        'length': 16,
        /* Spaces will split the generated answer into chunks which look like
           word by making specific characters spaces */
        'spaces': [3, 6, 12],
      },
    };


    /* All the country top level domain suffixes - used for determining the
      domain from a URL N.B. '.io' has been excluded becuase it is used like
       .com, eg github.io */
    this.countryTLDs = ['ac', 'ad', 'ae', 'af', 'ag', 'ai', 'al', 'am', 'an',
      'ao', 'aq', 'ar', 'as', 'at', 'au', 'aw', 'ax', 'az', 'ba', 'bb', 'bd',
      'be', 'bf', 'bg', 'bh', 'bi', 'bj', 'bm', 'bn', 'bo', 'br', 'bs', 'bt',
      'bv', 'bw', 'by', 'bz', 'ca', 'cc', 'cd', 'cf', 'cg', 'ch', 'ci', 'ck',
      'cl', 'cm', 'cn', 'co', 'cr', 'cs', 'cu', 'cv', 'cw', 'cx', 'cy', 'cz',
      'dd', 'de', 'dj', 'dk', 'dm', 'do', 'dz', 'ec', 'ee', 'eg', 'eh', 'er',
      'es', 'et', 'eu', 'fi', 'fj', 'fk', 'fm', 'fo', 'fr', 'ga', 'gb', 'gd',
      'ge', 'gf', 'gg', 'gh', 'gi', 'gl', 'gm', 'gn', 'gp', 'gq', 'gr', 'gs',
      'gt', 'gu', 'gw', 'gy', 'hk', 'hm', 'hn', 'hr', 'ht', 'hu', 'id', 'ie',
      'il', 'im', 'in', 'iq', 'ir', 'is', 'it', 'je', 'jm', 'jo', 'jp',
      'ke', 'kg', 'kh', 'ki', 'km', 'kn', 'kp', 'kr', 'kw', 'ky', 'kz', 'la',
      'lb', 'lc', 'li', 'lk', 'lr', 'ls', 'lt', 'lu', 'lv', 'ly', 'ma', 'mc',
      'md', 'me', 'mg', 'mh', 'mk', 'ml', 'mm', 'mn', 'mo', 'mp', 'mq', 'mr',
      'ms', 'mt', 'mu', 'mv', 'mw', 'mx', 'my', 'mz', 'na', 'nc', 'ne', 'nf',
      'ng', 'ni', 'nl', 'no', 'np', 'nr', 'nu', 'nz', 'om', 'pa', 'pe', 'pf',
      'pg', 'ph', 'pk', 'pl', 'pm', 'pn', 'pr', 'ps', 'pt', 'pw', 'py', 'qa',
      're', 'ro', 'rs', 'ru', 'rw', 'sa', 'sb', 'sc', 'sd', 'se', 'sg', 'sh',
      'si', 'sj', 'sk', 'sl', 'sm', 'sn', 'so', 'sr', 'ss', 'st', 'su', 'sv',
      'sx', 'sy', 'sz', 'tc', 'td', 'tf', 'tg', 'th', 'tj', 'tk', 'tl', 'tm',
      'tn', 'to', 'tp', 'tr', 'tt', 'tv', 'tw', 'tz', 'ua', 'ug', 'uk', 'us',
      'uy', 'uz', 'va', 'vc', 've', 'vg', 'vi', 'vn', 'vu', 'wf', 'ws', 'ye',
      'yt', 'yu', 'za', 'zm', 'zw'];
  }

  /**
   * Prepares a supplied domain name into its base domain
   * @param {String} domainName the starting domain
   * @return {String} the prepared domain
   */
  prepareDomain(domainName) {
    let posDomain = 0;
    let domainParts;
    let calculatedDomain = '';
    let domainCountryCode = '';

    let openSesame = this;

    /* Retrieve domain value and trim the leading http://  or https://  */
    let fullDomain = domainName.trim().replace(/^https?:\/\//g, '')
      .toLowerCase();

    /* Check whether the whole URL is there - remove anything with a '/'
      onwards */
    posDomain = fullDomain.indexOf('/');
    if (posDomain > 0) {
      fullDomain = fullDomain.substr(0, posDomain);
    }

    // Split base domain into its individual elements
    domainParts = fullDomain.split('.');

    /* Check whether the last domain element is a country code suffix, eg
        mrpeeel.com.au, if so record it and remove it from the main compoments
    */
    if (domainParts.length > 1 &&
      openSesame.countryTLDs.indexOf(domainParts[domainParts.length - 1])
      >= 0) {
      // Save the country code and remove from domain elements array
      domainCountryCode = '.' + domainParts[domainParts.length - 1];
      domainParts = domainParts.slice(0, -1);
    }

    // if there are more than 2 elements remaining, only keep the last two
    // eg photos.google.com = google.com, mail.google.com = google.com
    if (domainParts.length > 2) {
      domainParts = domainParts.slice(-2);
    }

    // Re-assemble base domain into final value with country code
    calculatedDomain = domainParts.join('.') + domainCountryCode;

    return calculatedDomain;
  }

  /**
   * Prepares a supplied user name into its base value - trimmed and lower case
   * @param {String} userName the starting user name
   * @return {String} the prepared user name
   */
  prepareUserName(userName) {
    return userName.trim().toLowerCase();
  }

  /**
   * Prepares a supplied security question into its base value
   *    remove punctuation
   *    remove consecutive spaces
   *    trim the text
   *    make lower case
   * @param {String} securityQuestion the starting security question
   * @return {String} the prepared security question
   */
  prepareSecurityQuestion(securityQuestion) {
    return securityQuestion
      .replace(/[.,-\/#!$%\^&\*;:{}=\-_`~()?''"?]/g, '')
      .replace(/  +/g, ' ')
      .trim()
      .toLowerCase();
  }

  /**
   * Runs the generation of a password by generating a key (PBKDF2) and then
    using that key to sign (HMAC256) the constructed domain value
   * @param {String} userName the website username
   * @param {String} passPhrase the open sesame pass phrase
   * @param {String} domainName the website domain
   * @param {String} passwordType password type to generate
   * @param {String} vers the version of the password (defaults to 1)
   * @param {String} securityQuestion the security question for generating
   *                                  an answer
   * @return {Promise} a promise which will resolve the generated password.
   */
  generatePassword(userName, passPhrase,
    domainName, passwordType, vers, securityQuestion) {
    'use strict';

    let passNS = '';
    let version = vers || 1;
    let securityQuestionValue = securityQuestion || '';


    if (!passPhrase || passPhrase.length === 0) {
      return Promise.reject(new Error('Passphrase not present'));
    }

    if (!domainName || domainName.length === 0) {
      return Promise.reject(new Error('Domain name not present'));
    }

    if (!userName || userName.length === 0) {
      return Promise.reject(new Error('User name not present'));
    }

    if (!passwordType || passwordType.length === 0) {
      return Promise.reject(new Error('Password type not present'));
    }

    if (passwordType && passwordType === 'answer' &&
      securityQuestion.length === 0) {
      return Promise.reject(new Error('Security question not present'));
    }

    try {
      let openSesame = this;

      // return promise which resolves to the generated password
      return new Promise(function(resolve, reject) {
        passNS = openSesame.passwordNS;

        if (passwordType === 'answer') {
          passNS = openSesame.answerNS;
        } else if (passwordType == 'login') {
          passNS = openSesame.loginNS;
        }

        // Set up parameters for PBKDF2 and HMAC functions
        let userNameValue = openSesame.prepareUserName(userName);
        let salt = passNS + '.' + userNameValue;

        // Convert domain name to calulated domain
        let calculatedDomain = openSesame.prepareDomain(domainName);
        // Add user to domain value
        calculatedDomain = userNameValue + version + '@' + calculatedDomain;

        // For an answer, add the security question to domain value
        if (passwordType === 'answer') {
          securityQuestionValue = openSesame.prepareSecurityQuestion(
            securityQuestionValue);
          calculatedDomain = calculatedDomain + ':' + securityQuestionValue;
        }


        // parameters: password, salt, numIterations, keyLength
        pBKDF2(passPhrase, salt, 750, 128)
          .then(function(key) {
            // console.log('Derived key: ' + key);

            return hMACSHA256(calculatedDomain, key);
          }).then(function(seedArray) {
          //  Set up passowrd length and any spaces for generated value
          let passLength = openSesame.passwordTypes[passwordType].length;
          let passAdjLength = passLength - 1;
          let spaces = openSesame.passwordTypes[passwordType].spaces || [];
          let charSet = openSesame.passwordTypes[passwordType].charSet;
          let password = '';
          // Variables to check for password complexity
          let needsUpper = openSesame.passwordTypes[passwordType].needsUpper
            || false;
          let needsLower = openSesame.passwordTypes[passwordType].needsLower
            || false;
          let needsNumber = openSesame.passwordTypes[passwordType].needsNumber
            || false;
          let needsSymbol = openSesame.passwordTypes[passwordType].needsSymbol
            || false;

          /* Determine the character number to start checking for minimum
            password complexity */
          let upperCheck = seedArray[0] % passAdjLength;
          let lowerCheck = upperCheck + 1;
          let numberCheck = upperCheck + 2;
          let symbolCheck = upperCheck + 3;

          // Select the chars and clear seedArray
          for (let s = 0; s < seedArray.length; s++) {
            // Within the password length, so add next char to password
            let newChar;

            if (s < passLength) {
              // Check if this character must be a space (for security answers)
              if (spaces.indexOf(s) >= 0) {
                // This position is a defined space
                newChar = ' ';
              } else if (needsUpper && s === upperCheck % passAdjLength) {
                // Must select character from upper character set
                newChar = openSesame.upperChars[seedArray[s] %
                (openSesame.upperChars.length - 1)];
              } else if (needsLower && s === lowerCheck % passAdjLength) {
                // Must select character from lower character set
                newChar = openSesame.lowerChars[seedArray[s] %
                (openSesame.lowerChars.length - 1)];
              } else if (needsNumber && s === numberCheck % passAdjLength) {
                // Must select character from number character set
                newChar = openSesame.numberChars[seedArray[s] %
                (openSesame.numberChars.length - 1)];
              } else if (needsSymbol && s === symbolCheck % passAdjLength) {
                // Must select character from symbol character set
                newChar = openSesame.symbolChars[seedArray[s] %
                (openSesame.symbolChars.length - 1)];
              } else {
                // Select character from normal character set
                newChar = charSet[seedArray[s] % (charSet.length - 1)];
              }

              password = password + newChar;

              // Check which character set this belongs to and record
              if (openSesame.upperChars.indexOf(newChar) >= 0) {
                needsUpper = false;
              } else if (openSesame.lowerChars.indexOf(newChar) >= 0) {
                needsLower = false;
              } else if (openSesame.numberChars.indexOf(newChar) >= 0) {
                needsNumber = false;
              } else if (openSesame.symbolChars.indexOf(newChar) >= 0) {
                needsSymbol = false;
              }
            }

            // Re-set the seed array value
            seedArray[s] = 0;
          }

          // Clear pass phrase values
          passPhrase = zeroVar(passPhrase);

          resolve(password);
        })
          .catch(function(e) {
            return Promise.reject(e);
          });
      });
    } catch (e) {
      return Promise.reject(e);
    }
  }
}

window['OpenSesame'] = OpenSesame;

/* global firebase,  */

/* exported FBAuth */

'use strict';

/** Firebase auth class to handle the firebase authentication and return the
* firebase user id
*/
class FBAuth {
  /** Sets up the basic connection details to firebase and state change
  *    events
  * @param {Function} signInCallback - the callback when sign in occurs -
  *                                     returns user id,  photoURL, name & email
  * @param {Function} signOutCallBack - the callback when sign out occurs
  * @param {Function} childAddedCallback - the callback when new data is added -
  *                                         returns all data
  * @param {Function} childChangedCallback - the callback when data is changed -
  *                                         returns all data
  */
  constructor(signInCallback, signOutCallBack,
    childAddedCallback, childChangedCallback) {
    let fbAuth = this;
    let config = {
      apiKey: 'AIzaSyCQmNa81aSqSBHExjDXKWkx2uDoAMPexOw',
      authDomain: 'open-sesame-f1f51.firebaseapp.com',
      databaseURL: 'https://open-sesame-f1f51.firebaseio.com',
    };
    // Connect to firebase
    firebase.initializeApp(config);

    // Set user variables to null initially
    fbAuth.uid = null;
    fbAuth.photoURL = null;
    fbAuth.name = null;
    fbAuth.email = null;


    // Set-up callbacks if supplied
    fbAuth.signInCallback = signInCallback || null;
    fbAuth.signOutCallback = signOutCallBack || null;
    fbAuth.childAddedCallback = childAddedCallback || null;
    fbAuth.childChangedCallback = childChangedCallback || null;


    // On auth state change, record the userId
    firebase.auth().onAuthStateChanged(function(user) {
      // console.log('Firebase auth state change');
      // console.log(user);
      if (user) {
        fbAuth.uid = user.uid;
        fbAuth.photoURL = user.photoURL || null;
        fbAuth.name = user.displayName;
        fbAuth.email = user.email;

        let userRef = firebase.database().ref('users/' + user.uid);

        // Once authenticated, register the correct callbacks if supplied
        if (fbAuth.childAddedCallback) {
          userRef.on('child_added', function(data) {
            fbAuth.childAddedCallback(data.val());
          });
        }

        if (fbAuth.childChangedCallback) {
          userRef.on('child_changed', function(data) {
            fbAuth.childChangedCallback(data.val());
          });
        }

        // If supplied, call the sign in callback
        if (fbAuth.signInCallback) {
          fbAuth.signInCallback({
            userId: fbAuth.uid,
            photoURL: fbAuth.photoURL,
            name: fbAuth.name,
            email: fbAuth.email,
          });
        }
      } else {
        fbAuth.uid = null;
        fbAuth.photoURL = null;
        fbAuth.name = null;
        fbAuth.email = null;

        // If supplied, call the sign out callback
        if (fbAuth.signOutCallback) {
          fbAuth.signOutCallback();
        }
      }
    });
  }

  /** Authenticates the user if not already authenticated
  * @return {Promise} - a promise with the result of calling sign in
  */
  logIn() {
    if (!firebase.auth().currentUser) {
      // Already signed in
      // Sign in using google
      let provider = new firebase.auth.GoogleAuthProvider();

      return firebase.auth().signInWithRedirect(provider);
    }
  }

  /** Authenticates the user if not already authenticated using supplied token
  * @param {Object} token - the auth token to use
  * @return {Promise} - a promise with the result of calling sign in
  */
  logInWithToken(token) {
    if (!firebase.auth().currentUser) {
      let credential = firebase.auth.GoogleAuthProvider.credential(null, token);
      return firebase.auth().signInWithCredential(credential);
    }
  }

  /** Check result of redirect logIn
  * @return {Promise} result of whether user is authenticated
  */
  isAuthenticated() {
    return new Promise(function(resolve, reject) {
      firebase.auth().getRedirectResult().then(function(result) {
        resolve(true);
      }).catch(function(error) {
        reject(error);
      });
    });
  }

  /** Returns current user's Id or null if not authenticated
  *
  * @return {String} - the userId or null if not authenticated
  */
  getUserId() {
    let fbAuth = this;

    if (fbAuth.uid) {
      return fbAuth.uid;
    } else {
      return null;
    }
  }

  /** Returns current user's photo or null if not authenticated / no photo
  *
  * @return {String} - the URL for the user's photo
  */
  getUserPhotoURL() {
    let fbAuth = this;

    if (fbAuth.uid && fbAuth.photoURL) {
      return fbAuth.photoURL;
    } else {
      return null;
    }
  }

  /** Logs user out
  */
  logOut() {
    if (firebase.auth().currentUser) {
      firebase.auth().signOut();
    }
  }
}

window['FBAuth'] = FBAuth;

/* global OpenSesame, document, window, console, navigator, extHasPassword,
  generateExtPassword, clearExtPhrase,  storeExtVals, zeroVar,
   TemporaryPhraseStore */

/* exported prepServiceWorker, changePassPhrase, setPassChangeRequired */

window['prepServiceWorker'] = prepServiceWorker;
window['changePassPhrase'] = changePassPhrase;
window['setPassChangeRequired'] = setPassChangeRequired;

// Global variables for UI elements
let passPhrase;
let domainName;
let securityQuestion;
let userName;
let userNameDropDown;
let type;
let version;
let bodyNode;
let password;
let signedInSection;
let signInButton;
let signOutButton;
let userCard;
let loader;
let optionsVisible = false;
let isChromeExtension;

let requiredElements = ['domain', 'user-name', 'passphrase'];

// Variable for processing

/* Set up the classes for password calculation and temporary pass
  phrase storage */
let openSesame;
let temporaryPhraseStore;
let fbAuth;

let passwordType;
let domainValues;
let lastPassGenTimeStamp;
let successPrefix;
let passPhraseState;


/**
* Set-up the service worker
*/
function prepServiceWorker() {
  if (!navigator.serviceWorker) {
    return;
  }

  navigator.serviceWorker.register('sw.js').then(function(reg) {
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

    reg.addEventListener('updatefound', function() {
      trackInstalling(reg.installing);
    });
  });

  /* Ensure refresh is only called once (works around a bug in
  'force update on reload'). */
  let refreshing;
  navigator.serviceWorker.addEventListener('controllerchange', function() {
    if (refreshing) {
      return;
    }
    window.location.reload();
    refreshing = true;
  });
}

/**
* Track whether service worker is installing
* @param {Object} worker - the service worker to check
*/
function trackInstalling(worker) {
  worker.addEventListener('statechange', function() {
    if (worker.state == 'installed') {
      updateReady(worker);
    }
  });
}

/**
* Checker whether service worker update is ready
* @param {Object} worker - the service worker to check
*/
function updateReady(worker) {
  let countdownDiv = document.getElementById('update-message');
  let countdownValue = document.getElementById('count-down-value');
  let cdVals = [5, 4, 3, 2, 1];

  countdownDiv.classList.remove('hidden');

  window.setTimeout(function() {
    worker.postMessage({
      action: 'skipWaiting',
    });
  }, 5000);

  cdVals.forEach(function(val) {
    window.setTimeout(function() {
      countdownValue.innerText = val;
    }, (5 - val) * 1000);
  });
}

window.addEventListener('load', function() {
  /* If a change has been detected for the appcache, force an immediate
  re-load to apply the change
   */
  window.applicationCache.addEventListener('updateready', function(e) {
    if (window.applicationCache.status == window.applicationCache.UPDATEREADY) {
      // Browser downloaded a new app cache.
      window.location.reload();
    }
  }, false);

  openSesame = new OpenSesame();
  temporaryPhraseStore = new TemporaryPhraseStore();

  /* Set-up global variables for the UI elements */
  domainName = document.getElementById('domain');
  userName = document.getElementById('user-name');
  userNameDropDown = document.getElementById('username-dropdown');
  passPhrase = document.getElementById('passphrase');
  securityQuestion = document.getElementById('security-question');
  type = document.getElementById('type');
  bodyNode = document.querySelector('body');
  password = document.getElementById('password');
  version = document.getElementById('version');
  signInButton = document.getElementById('sign-in');
  signedInSection = document.getElementById('signed-in');
  signOutButton = document.getElementById('sign-out');
  userCard = document.getElementById('user-card');
  loader = document.getElementById('loader');

  /* Add input events which check if a previous required field has been
    skipped, and ensure that the generated password card has been cleared
    and hidden */
  domainName.addEventListener('input', function() {
    checkRequired('domain');
    clearPassword();
  }, false);
  userName.addEventListener('input', function() {
    checkRequired('user-name');
    clearPassword();
  }, false);
  passPhrase.addEventListener('input', function() {
    checkRequired('passphrase');
    clearPassword();
  }, false);
  securityQuestion.addEventListener('input', function() {
    checkRequired();
    clearPassword();
  }, false);

  version.addEventListener('input', function() {
    checkRequired();
    clearPassword();
  }, false);

  // version.addEventListener('focusout', checkVersion, false);
  version.addEventListener('blur', checkVersion, false);

  // Set the pass phrase viewer button when it receieves the focus
  passPhrase.addEventListener('focus', showPassPhraseDisplayButton, false);
  /* passPhrase.addEventListener('focusin', showPassPhraseDisplayButton, false);
  passPhrase.addEventListener('focusout', passPhraseUpdated, false); */
  passPhrase.addEventListener('blur', passPhraseUpdated, false);

  /* After pass phrase confirmation has been updated, check whether it is OK
   to decrypt pass phrase */
  document.getElementById('confirm-passphrase').addEventListener('input',
    checkConfirmation, false);

  /* Make sure the pass phrase viewer button is hidden when pass phrase
    doesn't have the foxu */
  userName.addEventListener('focus', hidePassPhraseDisplayButton, false);
  /* userName.addEventListener('focusin', hidePassPhraseDisplayButton, false);
  userName.addEventListener('focusout', function() {
    userNameUpdate();
    sendValsToExt();
  }, false); */
  userName.addEventListener('blur', function() {
    userNameUpdate();
    sendValsToExt();
  }, false);

  domainName.addEventListener('focus', hidePassPhraseDisplayButton, false);
  /* domainName.addEventListener('focusin', hidePassPhraseDisplayButton, false);
  domainName.addEventListener('focusout', function() {
    trimDomainName();
    sendValsToExt();
  }, false); */
  domainName.addEventListener('blur', function() {
    trimDomainName();
    sendValsToExt();
  }, false);

  securityQuestion.addEventListener('focus', hidePassPhraseDisplayButton,
    false);
  /* securityQuestion.addEventListener('focusin', hidePassPhraseDisplayButton,
    false);
  securityQuestion.addEventListener('focusout', sendValsToExt, false); */
  securityQuestion.addEventListener('blur', sendValsToExt, false);

  // Add open and close for options section
  /* document.getElementById('options').addEventListener('click',
    openCloseOptions, false); */

  /* Set up password type click events
     Loop through different values within password type drop down and add one
     listener for each value */
  for (let lCounter = 0; lCounter < type.children.length; lCounter++) {
    if (type.children[lCounter].nodeName === 'LI') {
      type.children[lCounter].addEventListener('click', chooseType, false);
    }
  }

  // Run tests when the header is clicked
  document.getElementById('header-key').addEventListener('click', runTests,
    false);
  // Clear pass phrase button
  document.getElementById('clear-passphrase').addEventListener('click',
    clearPassPhraseAndStore, false);
  // Toggle the pass phrase view on/off
  document.getElementById('show-passphrase').addEventListener('click',
    togglePassPhraseView, false);
  // Generate password button
  document.getElementById('generate-password').addEventListener('click',
    generatePassword, false);
  // Copy password button
  document.getElementById('copy-password').addEventListener('click',
    copyPasswordToClipboard, false);
  // Close password card button
  document.getElementById('close-password').addEventListener('click',
    clearPassword, false);
  // Buttons to clear password and close confirm dialog
  document.getElementById('clear-close-dialog').addEventListener('click',
    closeDialog, false);
  document.getElementById('close-password-confirm').addEventListener(
    'click', closeDialog, false);

  // Set-up auth buttons
  signedInSection.addEventListener('click', function() {
    userCard.classList.remove('hidden');
  }, false);
  signInButton.addEventListener('click', googleSignIn, false);
  signOutButton.addEventListener('click', googleSignOut, false);

  /* Enable UI elements */
  domainName.disabled = false;
  userName.disabled = false;
  passPhrase.disabled = false;
  type.disabled = false;

  /* Put focus on first unpopulated field */
  if (domainName.value.trim() === '') {
    domainName.focus();
  } else if (userName.value.trim() === '') {
    userName.focus();
  } else if (passPhrase.value.trim() === '') {
    passPhrase.focus();
  }

  // Set initial pass phrase state
  if (passPhraseState === undefined) {
    setPassPhraseScreenState('editing');
  }

  // Set initial type of password
  if (passwordType === undefined) {
    window.setTimeout(function() {
      setType('long-password');
    });
  }

  /* Attempt to set-up firebase auth - this will fail if there is no
     network connection */
  try {
    fbAuth = new FBAuth(firebaseSignInCallback, firebaseSignOutCallback,
      firebaseDataCallback, firebaseDataCallback);


    // Check current auth state
    if (!fbAuth.getUserId()) {
      firebaseSignOutCallback();
    }
  } catch (err) {
    console.log('Cannot create firebase object');
    console.log(err);
  }
}, false);

/**
* Callback function to receive data when firebase data is loaded
*
* @param {String} firebaseDomainValues - the domain values retrieved from
*                                        firebase
*/
function firebaseDataCallback(firebaseDomainValues) {
  let domainString = JSON.stringify(firebaseDomainValues)
    .replace(/--dot--/g, '.');
  domainValues = JSON.parse(domainString);

  if (domainName.value !== '') {
    setDomainUserNames(openSesame.prepareDomain(domainName.value));
  }
}

/**
* If user is authenticated, retrieves and sets user names(s) associated with the
* domain
* @param {String} domain - the domain
*/
function setDomainUserNames(domain) {
  // Clear any user names listed
  clearUserNames();

  if (domainValues && domainValues[domain] &&
    domainValues[domain]['usernames']) {
    // Set user name values
    let domainUsers = domainValues[domain]['usernames'];
    let userNames = [];
    let mostRecentTimeStamp = 0;
    let mostRecentUserName = '';

    // Retrieve unique user name values
    Object.keys(domainUsers).forEach(function(domainUser) {
      if (domainUser.indexOf(domainUser) === 0) {
        userNames.push(domainUser);
      }
      let passwordTypeVals = domainValues[domain].usernames[domainUser];

      /* Retrieve individual password values to check the timestamps
         for the most recent username */
      Object.keys(passwordTypeVals).forEach(function(passwordType) {
        // Check if this is the most recently used user name
        if (passwordTypeVals[passwordType].lastUsed > mostRecentTimeStamp) {
          mostRecentTimeStamp = passwordTypeVals[passwordType].lastUsed;
          mostRecentUserName = domainUser;
        }
      });
    });

    if (mostRecentUserName !== '') {
      populateValue(userName, mostRecentUserName);
    }

    // Load user names into drop down list
    loadUserNames(userNames);

    if (userName.value !== '') {
      userNameUpdate();
    }
  } else {
    setType('long-password');
    version.value = 1;
  }
}

/**
* If user is authenticated, retrieves and sets the password types
* for the domain & user name combination
* @param {String} domain - the domain
* @param {String} userName - the userName
*/
function setUserNamePasswordTypes(domain, userName) {
  // Clear any user names listed
  resetPasswordTypesUsed();

  if (domainValues && domainValues[domain] &&
    domainValues[domain].usernames[userName]) {
    // Set user name values
    let passwordTypeVals = domainValues[domain].usernames[userName];
    let mostRecentTimeStamp = 0;
    let mostRecentPasswordType = '';

    // Retrieve unique user name values
    Object.keys(passwordTypeVals).forEach(function(passwordType) {
      let typeReference = document.getElementById(passwordType);
      let typeTooltip = document.getElementById(passwordType + '-tooltip');

      if (typeReference) {
        typeReference.classList.add('green-text');
        typeTooltip.classList.remove('hidden');
        // Check if this is the most recently used password type
        if (passwordTypeVals[passwordType].lastUsed > mostRecentTimeStamp) {
          mostRecentTimeStamp = passwordTypeVals[passwordType].lastUsed;
          typeTooltip.innerText = relativeDate(passwordTypeVals[passwordType]
            .lastUsed);
          mostRecentPasswordType = passwordType;
        }
      }
    });

    // If a most recent password type exists, set it as the default type
    if (mostRecentPasswordType !== '') {
      setType(mostRecentPasswordType);
    }
  } else {
    setType('long-password');
    version.value = 1;
  }
}

/**
* If user is authenticated, retrieves the version to use with a supplied
* for the domain,  user name and password type combination
* @param {String} domain - the domain
* @param {String} userName - the userName
* @param {String} passwordType - the password type
*/
function setUserNamePasswordTypeVersion(domain, userName, passwordType) {
  if (domainValues && domainValues[domain] &&
    domainValues[domain].usernames[userName]) {
    // Loop through values and set the version when the correct value is found
    let passwordTypeVals = domainValues[domain].usernames[userName];

    Object.keys(passwordTypeVals).forEach(function(passwordTypeKey) {
      if (passwordTypeKey === passwordType &&
        passwordTypeVals[passwordTypeKey].passwordVersion) {
        version.value = passwordTypeVals[passwordTypeKey].passwordVersion;
        return;
      }
    });
  } else {
    version.value = 1;
  }
}

/**
* Clears colors from drop down list items for password types
*/
function resetPasswordTypesUsed() {
  // Clear any password types used
  for (let lCounter = 0; lCounter < type.children.length; lCounter++) {
    if (type.children[lCounter].nodeName === 'LI') {
      // Remove text highlighting
      type.children[lCounter].classList.remove('green-text');
    } else {
      // Hide tool tip
      type.children[lCounter].classList.add('hidden');
    }
  }
}

/**
* If user is authenticated, retrieves the value(s) associated with the user
* @return {Promise}  - promise which contains the user values or null
*                       if the user is not auhtenticated

function retrieveUserValues() {
  return new Promise(function(resolve, reject) {
    let userId = fbAuth.getUserId();

    if (userId) {
      return firebase.database().ref('/users/' + userId)
        .once('value')
        .then(function(snapshot) {
          resolve(snapshot.val());
        });
    } else {
      resolve(null);
    }
  });
}*/

/**
* When a password is generated, if the user is authenticated
*  the meta-data is sent to firebase
* @param {String} domain - the domain name
* @param {String} userName - the username
* @param {String} passwordType - the type of password generated
* @param {String} passwordVersion - the version of password generated
*/
function recordGeneration(domain, userName, passwordType, passwordVersion) {
  // Firebase may not load at all if network connectivity problem
  if (!fbAuth) {
    return;
  }

  let userId = fbAuth.getUserId();

  let domainValue = domain.replace('.', '--dot--');
  let userNameValue = userName.replace('.', '--dot--');

  if (userId) {
    firebase.database().ref('users/' + userId + '/domains/' + domainValue +
      '/usernames/' + userNameValue + '/' + passwordType)
      .update({
        passwordVersion: passwordVersion,
        lastUsed: Date.now(),
      });
  }
}

/**
* When values are populated from the background page to the pop-up page, this
* function sets the is-dirty class to ensure that labels are rendered
* correctly above the inpt fields
* @param {String} pElement - the name if the element being populated
* @param {String} pValue - the value for the element
*/
function populateValue(pElement, pValue) {
  pElement.value = pValue;
  if (pValue.length > 0) {
    pElement.parentElement.classList.add('is-dirty');
  }
}

/**
* Close the dialog element
*/
function closeDialog() {
  let dialog = document.getElementById('confirm-dialog');

  clearPassPhraseAndStore();
  dialog.classList.add('hidden');
}

/**
* Check version number entered.  Must be an integer between 1 - 999.  Remove
*  any non-numeric input
*/
function checkVersion() {
  let versionVal = version.value;
  versionVal = versionVal.replace(/[^0-9]/g, '');
  if (versionVal === '') {
    populateValue(version, '1');
    versionVal = '1';
  } else if (versionVal.length > 3) {
    versionVal = versionVal.substring(0, 3);
  }
  populateValue(version, versionVal);
  version.parentElement.classList.remove('is-invalid');
}


/**
* Set the used password types where appropriate
*/
function userNameUpdate() {
  if (domainName.value !== '' && userName.value !== '') {
    setUserNamePasswordTypes(domainName.value, userName.value);
  }
}

/**
* Check whether the elemets required for generation have been completed
* @param {Sring} currentElement - the element which was just edited
*/
function checkRequired(currentElement) {
  let stopPosition = -1;

  if (currentElement) {
    stopPosition = requiredElements.indexOf(currentElement);
  }

  if (stopPosition == -1) {
    stopPosition = requiredElements.length;
  }

  for (let elCounter = 0; elCounter < stopPosition; elCounter++) {
    let element = document.getElementById(requiredElements[elCounter]);
    if (element) {
      if (element.value && element.value !== '') {
        element.parentElement.classList.remove('is-invalid');
      } else {
        element.parentElement.classList.add('is-invalid');
      }
    }
  }
}

/**
* Store values in Chrom extension (if applicable)
 */
function sendValsToExt() {
  if (isChromeExtension) {
    storeExtVals();
  }
}

/**
* Open or close option ssection
*/
function openCloseOptions() {
  /* optionsVisible = !optionsVisible;

  let optsDiv = document.getElementById('extra-options-div');
  let optsIcon = document.getElementById('options-icon');

  if (optionsVisible) {
    optsDiv.classList.remove('hidden');
    optsIcon.innerHTML = 'keyboard_arrow_up';
    bodyNode.classList.add('ext-pass-generated');
  } else {
    optsDiv.classList.add('hidden');
    optsIcon.innerHTML = 'keyboard_arrow_down';
  } */
}

/**
* Clear the generated password, hide the password card and re-set the UI
*    state
 */
function clearPassword() {
  hideElement('password-card');
  if (password) {
    password.textContent = zeroVar(password.textContent);
    password.textContent = '';
  }
}

/**
* Clear the stored pass phrase if it exists
 */
function clearPassPhraseStore() {
  // Clear any stored values in the phrase store
  temporaryPhraseStore.clearStore();

  /* If this is the chrome extension, send the clear_stored_phrase message to
      the background script */
  if (isChromeExtension) {
    clearExtPhrase();
  }
  // Store the time stamp of when the change was made
  lastPassGenTimeStamp = Date.now();
}

/**
* Clear the pass phrase from the UI
 */
function clearPassPhrase() {
  // Clear pass phrase value from the UI
  if (passPhrase) {
    passPhrase.value = zeroVar(passPhrase.value);
    passPhrase.value = '';
  }
  clearPassword();
}

/**
* Clear the pass phrase from memory and the pass phrase store
 */
function clearPassPhraseAndStore() {
  clearPassPhrase();
  clearPassPhraseStore();
  setPassPhraseScreenState('editing');
  passPhrase.focus();
}

/**
* Set the pass phrase value for the UI
* @param {String} passPhraseValue - the value to set on the UI
*/
function setPassPhrase(passPhraseValue) {
  passPhrase.value = passPhraseValue;
  setPassPhraseScreenState('holding');
  passPhraseTimedClear();
}

/**
* Clear the pass phrase value for the UI after 5 minutes if no other
*  activity
*/
function passPhraseTimedClear() {
  let thisPasswordTimeStamp;

  // Set timestamp for last generated password
  lastPassGenTimeStamp = Date.now();
  thisPasswordTimeStamp = lastPassGenTimeStamp;

  /* Set function to clear stored pass phrase after 5 minutes if no other
      activity has occurred */
  window.setTimeout(function() {
    // Check of this was the last password generated (timestamp still matches)
    if (thisPasswordTimeStamp === lastPassGenTimeStamp) {
      /* Too much time has elapsed without any password activity so
          clear all the values */
      clearPassPhrase();
      setPassPhraseScreenState('stored');
    }
  }, 300000);
}

/**
* Set-up the phrase store with the updated pass phrase value
*/
function passPhraseUpdated() {
  // Check if required values are present to create pass phrase
  if (passPhrase.value.length > 0 && userName.value.length > 0) {
    // Generate and store the temporaryPhrase values
    temporaryPhraseStore.encryptPhrase(passPhrase.value, userName.value.trim())
      .then(function(val) {
        // If this is the chrome extension, send values to chrome extension
        sendValsToExt();
      })
      .catch(function(err) {
        console.log(err);
      });
  } else {
    temporaryPhraseStore.clearStore();
    sendValsToExt();
  }
}

/**
* Generate the password for the combination of values
*/
function generatePassword() {
  let password = document.getElementById('password');
  let error = document.getElementById('error');

  hidePassPhraseDisplayButton();

  // Hide options if open
  if (optionsVisible) {
    openCloseOptions();
  }


  /* Hide the copy password div - will be checked after generation to see
      whether it should be shown */
  hideElement('copy-password-div');

  if (!isReadyToGenerate()) {
    return;
  }

  showElement('password-card');
  error.textContent = password.textContent = '';

  // Set values required for calculation
  let gPassPhrase = passPhrase.value;
  let gDomainName = domainName.value.trim();
  let gUserName = userName.value.trim();
  let gSecurityQuestion = '';
  let gVersion = version.value;

  if (passwordType === 'answer' && securityQuestion.value.trim().length > 0) {
    /* Remove any punctuation, remove any consecutive spaces and convert to
      lower case */
    gSecurityQuestion = securityQuestion.value.trim();
  }

  if (passwordType) {
    openSesame.generatePassword(gUserName, gPassPhrase, gDomainName,
      passwordType, gVersion, gSecurityQuestion)
      .then(function(passwordValue) {
        clearBodyClasses();
        /* Special classes are required when running as an extenstion
        due to the space limitations of the chrome extension pop-up */
        if (passwordType === 'answer') {
          bodyNode.classList.add('ext-answer-generated');
        } else {
          bodyNode.classList.add('ext-pass-generated');
        }


        password.textContent = passwordValue;

        populateOrCopyPassword();

        passPhraseTimedClear();

        setPassPhraseScreenState('holding');

        // Clear the generated password after 30 seconds on the screen
        window.setTimeout(function() {
          // Record meta-data
          recordGeneration(gDomainName, gUserName, passwordType, gVersion);
          // Clear password from the screen
          clearPassword();
        }, 30000);
      })
      .catch(function(err) {
        error.textContent = err.message;
      });
  }
}

/**
* After the password is generated decide whether to insert it directly
*    or attempt to copy it to the clipboard.
*   When running as a chrome extension, check whether the extension detected
*    a single password field on the page.
*   When running stand alone, try to copy to the clipboard. N.B. This seems
*   to be disabled in Chrome 46 and onwards.
*/
function populateOrCopyPassword() {
  let executePasswordCopy = false;

  /* Check if this is running within a Chrome extension and a password or
    PIN is being generated */
  if (isChromeExtension) {
    // let successToast = document.getElementById('success-toast');

    // Call the extension password set function
    generateExtPassword();

    /* Check whether the extension can directly set the password or PIN
      and if it the correct type
      If password can't be set or it is another type (user name or answer)
      it will just copy to cliboard instead */
    if (extHasPassword !== true || passwordType === 'login' || passwordType ===
      'answer') {
      executePasswordCopy = true;
    } else {
      /* Password will be directly inserted by ext-backgrounf.js,
        so show a password / pin inserted toast */
      window.setTimeout(function() {
        showSnackbar(successPrefix + ' inserted', 5, false);
      }, 250);
    }
  } else {
    /* Not running in an extension so attempt to copy the password to
        the cliboard */
    executePasswordCopy = true;
  }


  if (executePasswordCopy) {
    showElement('copy-password-div');

    password.scrollIntoView();
    // Copy password to clipboard after 0.2 second
    window.setTimeout(function() {
      copyPasswordToClipboard();
    }, 500);
  }
}

/**
* Set up the screen state for the pass phrase:
* @param {String} passState
*        editing: pass phrase has been cleared or pass phrase is being edited
*                and no password has been generated with it yet
*        holding: pass phrase is being held for a short period - it can be
*                used by it cannot be viewed or edited - must be cleared to edit
*        stored: pass phrase is encrypted in temporary storage - requires
*                correct first three characters to decrypt and return
*        failed: pass phrase was encrypted but confirmation of first three
*                characters failed.  Pass phrase was cleared and UI is updated
*/
function setPassPhraseScreenState(passState) {
  passPhraseState = passState;

  if (passState === 'editing') {
    /* The pass phrase characters are hidden but can be viewed using the
        show-password button
          Show the pass phrase with the show password buttton
          Hide the confirm pass phrase */
    showElement('passphrase-div');
    hideElement('confirm-dialog');
    hideElement('clear-passphrase');
  } else if (passState === 'holding') {
    /* The pass phrase characters are hidden and cannot be viewed but
        can be used
          Password can be cleared and edited using the clear-password button
          Show the pass phrase with the edit password buttton
          Hide the confirm pass phrase */
    showElement('passphrase-div');
    hideElement('confirm-dialog');
  } else if (passState === 'stored') {
    /* The pass phrase characters have been encrypted.  It can be retrieved
      using the first three characters.
        Password can be cleared and edited using the clear-password button
        Show the confirm pass phrase with the edit password buttton
        Hide the pass phrase */
    // Showing the dialog
    showElement('confirm-dialog');
    // Set the focus to the confirmation
    window.setTimeout(function() {
      document.getElementById('confirm-passphrase').focus();
    }, 0);
  } else if (passState === 'failed') {
    /* An attempt to confirm the first three characters of the pass phrase
      failed.
        The pass phrase characters are hidden but can be viewed using the
        show-password button
        Show the pass phrase with the show password buttton but update the UI
        prompt */

    // Hide the confirm pass phrase
    hideElement('confirm-dialog');
    showElement('passphrase-div');
    showSnackbar('Characters entered don\'t match the saved pass phrase. ' +
      'Pass phrase cleared.', 8, true);
    window.setTimeout(function() {
      setPassPhraseScreenState('editing');
      passPhrase.focus();
    }, 5250);
  }
}

/**
* Checks when three characters have been typed and then calls the
* confirmation decryption
*/
function checkConfirmation() {
  let confirmPassPhrase = document.getElementById('confirm-passphrase');

  if (confirmPassPhrase.value.length === 3) {
    confirmThreeChars(confirmPassPhrase.value, userName.value.trim());
    zeroVar(confirmPassPhrase.value);
    confirmPassPhrase.value = '';
  }
}


/**
* Attempts to decrypt pass phrase using the first three characters
* @param {String} threeChars - the three characters as a key
* @param {String} userName - the username
*/
function confirmThreeChars(threeChars, userName) {
  // Attempt decryption - if succesfull set passphrase value
  temporaryPhraseStore.decryptPhrase(threeChars, userName)
    .then(function(plainText) {
      setPassPhrase(plainText);
      setPassPhraseScreenState('holding');
    })
    .catch(function(err) {
      clearPassPhraseStore();
      clearPassPhrase();
      setPassPhraseScreenState('failed');
    });
}

/**
* Checks whether required elements are present to generate a password
* @return {Boolean}
*/
function isReadyToGenerate() {
  // Check for required value highlights
  checkRequired();

  let calculatedDomainName = openSesame.prepareDomain(domainName.value);

  /**
  * Check if minimum values have been completed - all types need name and
  *    domain
  */
  if (userName.value.trim().length > 0 && passPhrase.value.trim().length > 0
    && calculatedDomainName.length > 0 &&
    // For an answer type, a question must also be set
    (passwordType !== 'answer' || securityQuestion.value.trim().length > 0)) {
    return true;
  } else {
    return false;
  }
}

/**
* Trims the value displayed on the website field to remove the leading
*  http(s):// and anything including and after a forward slash
*/
function trimDomainName() {
  domainName.value = openSesame.prepareDomain(domainName.value);

  if (domainName.value !== '') {
    setDomainUserNames(domainName.value);
  }
}

/**
* Removes the hidden class for an element
* @param {String} elementName - the element to show
*/
function showElement(elementName) {
  let element = document.getElementById(elementName);
  if (element) {
    element.classList.remove('hidden');
  }
}

/**
* Adds the hidden class for an element
* @param {String} elementName
*/
function hideElement(elementName) {
  let element = document.getElementById(elementName);
  if (element) {
    element.classList.add('hidden');
  }
}

/**
* Removes the special classes required when running as a chrome extension
*/
function clearBodyClasses() {
  bodyNode.classList.remove('ext-pass');
  bodyNode.classList.remove('ext-answer');
  bodyNode.classList.remove('ext-pass-generated');
  bodyNode.classList.remove('ext-answer-generated');
}

/**
* Copy the password text to the clipboard if supported by the browser
*/
function copyPasswordToClipboard() {
  let clipboardVal = document.getElementById('clipboard-value');

  clipboardVal.value = password.textContent;
  clipboardVal.select();

  try {
    // Now that we've selected the anchor text, execute the copy command
    if (document.execCommand('copy')) {
      showSnackbar(successPrefix + ' copied to Clipboard', 5, false);
    }
  } catch (err) {
    hideElement('copy-password-div');
    console.log('Copy command failed');
  }
}

/**
* Set password type function for the event listener - uses the id of the
*  drop down control to set the password type
*/
function chooseType() {
  setType(this.id);
}

/**
* Set the password type to produce
* @param {String} passwordSelection - the type of password chosen
*/
function setType(passwordSelection) {
  let generatePasswordButton = document.getElementById('generate-password');
  let copyPasswordButton = document.getElementById('copy-password');
  let passwordCardHeader = document.getElementById('password-card-header');
  let passwordText = document.getElementById('password-type-text');

  copyPasswordButton.textContent = 'Copy Password';
  successPrefix = 'Password';
  passwordCardHeader.textContent = 'Password';
  generatePasswordButton.textContent = 'Produce password';
  showElement('user-name-div');
  hideElement('security-question-div');
  passwordType = passwordSelection;

  setUserNamePasswordTypeVersion(domain.value, userName.value,
    passwordSelection);

  let passwordLabel = document.getElementById('password-selected');

  switch (passwordSelection) {
    case 'maximum-password':
      passwordDescription = 'Maximum password';
      passwordText.innerText = 'Maximum password (20 characters)';
      break;
    case 'long-password':
      passwordDescription = 'Long password';
      passwordText.innerText = 'Long password (14 characters)';
      break;
    case 'medium-password':
      passwordDescription = 'Medium password';
      passwordText.innerText = 'Medium password (8 characters)';
      break;
    case 'basic-password':
      passwordDescription = 'Basic password';
      passwordText.innerText = 'Basic password (8 letters / numbers)';
      break;
    case 'short-password':
      passwordDescription = 'Short password';
      passwordText.innerText = 'Short password (6 letters / numbers)';
      break;
    case 'pin':
      generatePasswordButton.textContent = 'Produce PIN';
      passwordDescription = 'Four digit PIN';
      copyPasswordButton.textContent = 'Copy PIN';
      successPrefix = 'PIN';
      passwordCardHeader.textContent = 'PIN';
      passwordText.innerText = 'Four digit PIN';
      break;
    case 'pin-6':
      generatePasswordButton.textContent = 'Produce PIN';
      passwordDescription = 'Six digit PIN';
      copyPasswordButton.textContent = 'Copy PIN';
      successPrefix = 'PIN';
      passwordCardHeader.textContent = 'PIN';
      passwordText.innerText = 'Six digit PIN';
      break;
    case 'answer':
      generatePasswordButton.textContent = 'Produce security answer';
      passwordDescription = 'Security answer';
      copyPasswordButton.textContent = 'Copy Security Answer';
      successPrefix = 'Answer';
      passwordCardHeader.textContent = 'Answer';
      showElement('security-question-div');
      passwordText.innerText = 'Security answer';
      break;
  }

  passwordLabel.parentElement.classList.add('is-dirty');

  clearBodyClasses();
  if (passwordType === 'answer') {
    bodyNode.classList.add('ext-answer');
  } else {
    bodyNode.classList.add('ext-pass');
  }
  // Clear password and hide password div
  clearPassword();
}

/**
* Clears the list of usernames in the drop down and hides arrow button
*/
function clearUserNames() {
  let userNames = document.getElementById('loaded-usernames');
  while (userNames.firstChild) {
    userNames.removeChild(userNames.firstChild);
  }
  userNameDropDown.classList.add('hidden');
}

/**
* Populates  the list of usernames in the drop down and makes it visible
* @param {Array} names - the names to list in the drop down
*/
function loadUserNames(names) {
  if (names.length) {
    let userNames = document.getElementById('loaded-usernames');
    names.forEach(function(name) {
      let nameItem = document.createElement('li');
      nameItem.appendChild(document.createTextNode(name));
      nameItem.setAttribute('id', name);
      nameItem.classList.add('mdl-menu__item', 'menu-dropdown');
      userNames.appendChild(nameItem);
      nameItem.addEventListener('click', chooseName, false);
    });
    userNameDropDown.classList.remove('hidden');
  }

  if (userName.value === '') {
    populateValue(userName, names[0]);
  }
}

/**
* Calls the setUserName to set the function to the value of the current
*  drop-down list item
*/
function chooseName() {
  setUserName(this.id);
}

/**
* Sets the username
* @param {Array} name - the user name
*/
function setUserName(name) {
  let userNames = document.getElementById('loaded-usernames');

  populateValue(userName, name);
  passPhrase.focus();
  userNames.MaterialMenu.hide();
  // Call the logic to reload password types and versions
  userNameUpdate();
}

/**
* Show the pass phrase viewer button
*/
function showPassPhraseDisplayButton() {
  if (passPhraseState === 'editing' || passPhraseState === 'failed') {
    showElement('show-passphrase');
  } else if (passPhraseState === 'holding') {
    showElement('clear-passphrase');
  }
}

/**
* Hide the pass phrase viewer button and make sure the characters are masked
*/
function hidePassPhraseDisplayButton() {
  hideElement('show-passphrase');
  hideElement('clear-passphrase');
  passPhrase.type = 'password';
}

/**
* Toggle pass phrase between visible as a text area, and obscured like a
*  normal password
*/
function togglePassPhraseView() {
  let passPhraseDisplayButton = document.getElementById('show-passphrase');

  if (passPhrase.type === 'password') {
    passPhrase.type = 'text-area';
    passPhraseDisplayButton.innerHTML = '<i class="material-icons">' +
      'visibility_off</i>';
  } else {
    passPhrase.type = 'password';
    passPhraseDisplayButton.innerHTML = '<i class="material-icons">' +
      'visibility</i>';
  }

  passPhrase.focus();
}

/**
* Open and run the Jasmine tests page
*/
function runTests() {
  if (isChromeExtension) {
    window.open('https://mrpeel.github.io/opensesame/test/opensesame-test.html');
  } else {
    window.open('test/opensesame-test.html');
  }
}

/**
* Display a snackbar message
* @param {String} message - the message to display
* @param {Integer} numberSeconds - the number of seconds to display the toast
* @param {Boolean} isError - if this is an erro, the colour will be set
*/
function showSnackbar(message, numberSeconds, isError) {
  // Show toast element
  let notification = document.getElementById('open-sesame-snackbar');
  let data = {
    message: message,
    timeout: (numberSeconds * 1000),
  };
  notification.MaterialSnackbar.showSnackbar(data);

  let snackbarText = document.getElementById('open-sesame-snackbar-text');
  if (isError) {
    snackbarText.classList.add('snackbar-error');
  } else {
    snackbarText.classList.remove('snackbar-error');
  }
}

/**
* Display a toast message for 5 seconds
* @param {String} toastElementName - the element to display as a toast
* @param {String} coveredElementName - the element to cover with the toast
*/
/*
function showToast(toastElementName, coveredElementName) {
  // Show toast element
  hideElement(coveredElementName);
  showElement(toastElementName);

  let toastElement = document.getElementById(toastElementName);

  toastElement.scrollIntoView();
  // Hide again after 5 seconds
  window.setTimeout(function() {
    hideToast(toastElementName, coveredElementName);
  }, 5200);
}*/

/**
* Hide a toast message
* @param {String} toastElementName - the element being displayed as a toast
* @param {String} coveredElementName - the element covered with the toast
*/
/*
function hideToast(toastElementName, coveredElementName) {
  showElement(coveredElementName);
  hideElement(toastElementName);
}*/

/**
* Determine whether the pass phrase can be displayed or not based on
* whether it has been changed
*/
function setPassChangeRequired() {
  let thisPasswordTimeStamp;

  // Set the more changes required to 2
  passChangeRequiredCount = 2;

  /* Set the length to the current pass phrase length
   This is an atttempt to give a little more security - a user can't just
   type in extra characters to reveal the password.  Some of the characters
   need to be changed (still easy to work around) */
  lastPassPhraseLength = passPhrase.value.length;

  // Set timestamp for last generated password
  lastPassGenTimeStamp = Date.now();
  thisPasswordTimeStamp = lastPassGenTimeStamp;

  /* Set function to clear passwords after 30 minutes if no other activity has
    occurred */
  window.setTimeout(function() {
    // Check if this was the last password generated (timestamp still matches)
    if (thisPasswordTimeStamp === lastPassGenTimeStamp) {
      /* Too much time has elapsed without any password activity so clear all
        the values */
      clearPassPhrase();
    }
  }, 180000);
}

/**
* Clear the password from the UI and toggle the display button on
*/
function changePassPhrase() {
  clearPassword();
  showPassPhraseDisplayButton();
}

/**
* Takes a unix timestamp date and generates a relative date phrase for it
* @param {Integer} timestamp - the unix timestamp
* @return {String} a relative date phrase
*/
function relativeDate(timestamp) {
  let date = new Date(timestamp);
  let nowDate = new Date();
  let diff = ((nowDate.getTime() - date.getTime()) / 1000);
  let dayDiff = Math.floor(diff / 86400);
  // Check if less than 24 hours but yesterday
  if (dayDiff === 0 && (nowDate.getDate() - date.getDate()) > 0) {
    dayDiff = 1;
  }
  /* Use 334 as the year calculation because over 11 months should appear like
      a year */
  let yearDiff = Math.floor(dayDiff / 334);
  let year = date.getFullYear();
  let monthDesc = ['January', 'February', 'March', 'Aprail', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

  // Greater than 4 weeks ago
  if (isNaN(dayDiff) || dayDiff < 0 || dayDiff > 31)
    // Check how many years ago
    if (yearDiff > 0) {
      // More than 11 month ago, so quote month and year
      return monthDesc[date.getMonth()] + ' ' + year;
    } else {
      // Within the last year, so use 'Last June' format
      return 'last ' + monthDesc[date.getMonth()];
  }

  if (dayDiff == 0 && diff < 60) {
    return 'just now';
  } else if (dayDiff == 0 && diff < 120) {
    return 'a minute ago';
  } else if (dayDiff == 0 && diff < 3600) {
    return Math.floor(diff / 60) + ' minutes ago';
  } else if (dayDiff == 0 && diff < 7200) {
    return 'an hour ago';
  } else if (dayDiff == 0) {
    return Math.floor(diff / 7200) + ' hours ago';
  } else if (dayDiff == 1) {
    return 'yesterday';
  } else if (dayDiff < 7) {
    return dayDiff + ' days ago';
  } else if (dayDiff >= 7 && dayDiff < 10) {
    return 'a week ago';
  } else if (dayDiff <= 31) {
    return Math.ceil(dayDiff / 7) + ' weeks ago';
  }
}

/**
 * Sign user in with Google redirect
 */
function googleSignIn() {
  // Firebase may not load at all if network connectivity problem
  if (!fbAuth) {
    return;
  }

  showLoader();
  if (isChromeExtension) {
    // Retrieve chrome extension auth token
    returnExtAuthToken().then(function(token) {
      return fbAuth.logInWithToken(token);
    }).then(function() {
      hideLoader();
    }).catch(function(err) {
      // The OAuth token might have been invalidated. Remove it from cache.
      if (err.code === 'auth/invalid-credential') {
        removeExtAuthToken(token);
      }
      console.log(err);
      hideLoader();
    });
  } else {
    // Use normal auth
    fbAuth.logIn().catch(function(err) {
      hideLoader();
      if (err.code = 'auth/network-request-failed') {
        showSnackbar('No internet connection', 5, true);
      } else {
        showSnackbar('Cannot connect', 5, true);
        console.log(error);
      }
    });
  }
}

/**
 * Sign user out of Google
 */
function googleSignOut() {
  // Firebase may not load at all if network connectivity problem
  if (fbAuth) {
    fbAuth.logOut();
  }
  closeUserCard();
}

/**
 * Displays the UI for a signed in user.
 * @param {Object} user - contains basic user details:
 √ {
   userId: fbAuth.uid,
   photoURL: fbAuth.photoURL,
   name: fbAuth.name,
   email: fbAuth.email,
  }
 */
function firebaseSignInCallback(user) {
  let photo = document.getElementById('photo');
  let cardPhoto = document.getElementById('card-photo');
  let name = document.getElementById('display-name');
  let email = document.getElementById('display-email');

  signInButton.classList.add('hidden');
  signedInSection.classList.remove('hidden');
  hideLoader();

  if (user.photoURL) {
    photo.src = user.photoURL;
    photo.classList.remove('hidden');
    cardPhoto.src = user.photoURL;
    cardPhoto.classList.remove('hidden');
  } else {
    photo.classList.add('hidden');
    cardPhoto.classList.add('hidden');
  }

  if (user.name && user.name !== '') {
    name.innerText = user.name;
    name.classList.remove('hidden');
  } else {
    name.classList.add('hidden');
  }

  if (user.email && user.email !== '') {
    email.innerText = user.email;
    email.classList.remove('hidden');
  } else {
    email.classList.add('hidden');
  }
}

/**
 * Displays the UI for a signed out user.
 */
function firebaseSignOutCallback() {
  // Reset domain values - make sure other processes have completed
  window.setTimeout(function() {
    if (!signInButton) {
      signInButton = document.getElementById('sign-in');
    }
    if (!signedInSection) {
      signedInSection = document.getElementById('signed-in');
    }
    hideLoader();
    domainValues = null;
    signInButton.classList.remove('hidden');
    signedInSection.classList.add('hidden');

    closeUserCard();
  }, 0);
}

/**
 * Closes the user card
 */
function closeUserCard() {
  if (!userCard) {
    userCard = document.getElementById('user-card');
  }
  userCard.classList.add('hidden');
}


/**
 * Shows loading spinner
 */
function showLoader() {
  if (!loader) {
    loader = document.getElementById('loader');
  }
  loader.classList.add('is-active');
}

/**
 * Hides loading spinner
 */
function hideLoader() {
  if (!loader) {
    loader = document.getElementById('loader');
  }
  loader.classList.remove('is-active');
}

/* global chrome, document, passPhrase, password, trimDomainName,
  domainName, passwordType, setType, temporaryPhraseStore,
  setPassPhraseScreenState, userName, securityQuestion, populateValue */

/* exported generateExtPassword,  extHasPassword, storeExtVals, storeExtPhrase
    clearExtPhrase, returnExtAuthToken, removeExtAuthToken */

// Extra variable only present for Chrome Extension
let extHasPassword;
isChromeExtension = true;


document.addEventListener('DOMContentLoaded', function() {
  // Send a message to the active tab
  chrome.tabs.query({
    active: true,
    currentWindow: true,
  }, function(tabs) {
    let activeTab = tabs[0];
    chrome.tabs.sendMessage(activeTab.id, {
      'message': 'clicked_browser_action',
    });
  });
});


chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.message === 'populate_fields') {
      populateValue(domainName, request.url || '');
      populateValue(userName, request.userName || '');
      populateValue(securityQuestion, request.securityQuestion || '');
      populateValue(version, request.version || '1');
      extHasPassword = request.hasPassword;

      // console.log('Populate fields password type: ' + request.passwordType);
      setType(request.passwordType);

      // Determine state of password, and set the appropriate values
      if (request.threeCharHash && request.threeCharHash.length > 0 &&
        request.phraseStore &&
        request.phraseStore.iv) {
        /* Pass phrase has been encrypted and requires confirmation of the
          first three characters */
        let eIV;
        let eCiphertext;
        /* Uint8 values get lost in translation.  Values will need to be
          converted back tio Uint8Array */
        if (!(request.phraseStore.iv instanceof Uint8Array)) {
          let iv = Object.keys(request.phraseStore.iv).map(function(key) {
            return request.phraseStore.iv[key];
          });
          eIV = Uint8Array.from(iv);
        } else {
          eIV = request.phraseStore.iv;
        }

        if (!(request.phraseStore.ciphertext instanceof Uint8Array)) {
          let ciphertext = Object.keys(request.phraseStore.ciphertext).map(
            function(key) {
              return request.phraseStore.ciphertext[key];
            });
          eCiphertext = Uint8Array.from(ciphertext);
        } else {
          eCiphertext = request.phraseStore.ciphertext;
        }

        temporaryPhraseStore.storeValues(request.threeCharHash, {
          iv: eIV,
          ciphertext: eCiphertext,
        });

        passPhrase.parentElement.classList.add('is-dirty');
        setPassPhraseScreenState('stored');
        // Call domain name prep function
        trimDomainName();
      } else {
        // Pass phrase is not stored at all and is in standard editing mode
        setPassPhraseScreenState('editing');
      }
    }
  }
);

/**
* Sends a message to background page when the pasword has been setTimeout
* store open sesame parameters for next time the extension is loaded
*/
function generateExtPassword() {
  chrome.runtime.sendMessage({
    'message': 'set_password',
    'userName': userName.value,
    'securityQuestion': securityQuestion.value,
    'password': password.textContent,
    'passwordType': passwordType,
    'version': version.value,
    'threeCharHash': temporaryPhraseStore.threeCharHash,
    'phraseStore': temporaryPhraseStore.encData,
  });
}

/**
* Sends a message to background page to store open sesame parameters
* for next time the extension is loaded
*/
function storeExtVals() {
  chrome.runtime.sendMessage({
    'message': 'set_values',
    'userName': userName.value,
    'securityQuestion': securityQuestion.value,
    'password': password.textContent,
    'passwordType': passwordType,
    'version': version.value,
    'threeCharHash': temporaryPhraseStore.threeCharHash || '',
    'phraseStore': temporaryPhraseStore.encData || {},
  });
}

/**
* Sends a message to background page to store open sesame encrypted pass phrase
*/
function storeExtPhrase() {
  chrome.runtime.sendMessage({
    'message': 'store_phrase',
    'threeCharHash': temporaryPhraseStore.threeCharHash || '',
    'phraseStore': temporaryPhraseStore.encData || {},
  });
}

/**
* Sends a message to background page to clear a stored encrypted pass phrase
*/
function clearExtPhrase() {
  chrome.runtime.sendMessage({
    'message': 'clear_stored_phrase',
  });
}

/**
* Returns a chrome extension auth token to use in firebase
* @return {Promise} - a promise which will resolve with the token
*/
function returnExtAuthToken() {
  // Request an OAuth token from the Chrome Identity API.
  return new Promise(function(resolve, reject) {
    chrome.identity.getAuthToken({
      interactive: true,
    }, function(token) {
      console.log(token);
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      }

      if (!token) {
        reject('The OAuth token was null');
      } else {
        resolve(token);
      }
    });
  });
}

/**
* Removes a cached auth token
* @param {Object} token - the auth token to remove
*/
function removeExtAuthToken(token) {
  chrome.identity.removeCachedAuthToken({
    token: token,
  }, function() {
    startAuth(interactive);
  });
}
