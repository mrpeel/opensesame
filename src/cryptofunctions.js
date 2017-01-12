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
