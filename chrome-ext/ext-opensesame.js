/* global console */

/* exported assert */

let ASSERT_ENABLED = true;
let ASSERT_ERROR = false;
let ASSERT_VERBOSE = false;

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

/* global Uint8Array, Promise  */
/* global PBKDF2, convertDerivedKeyToHex, aesEncrypt, aesDecrypt, zeroVar,
zeroIntArray */
/* global assert */


/**
* constructor
*/
let TemporaryPhraseStore = function() {
  this.ns = 'cake.man.io';
};

/**
* Encrypts the pass phrase using the name as a salt.  Runs a PBKDF2 500 times
* on the firsth three characters of the passphrase to generate a key.
*     Then runs PBKDF2 250 times on the key to generate a hash to store for
*     comparison later.
*     The key is used to encrypt the data using AES and the result is stored.
* @param {String} passphrase
* @param {String} name
* @return {promise} A promise which will be resolved with eoither 'Success' or
*  rejected with an error.
 */
TemporaryPhraseStore.prototype.encryptPhrase = function(passphrase, name) {
  'use strict';

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

      PBKDF2(name + firstThreeChars, name + tempStoreContext.ns, 500, 128)
        .then(function(key) {
          aesKey = convertDerivedKeyToHex(key);

          return PBKDF2(convertDerivedKeyToHex(key), name +
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
};

/**
*  Descrypts the pass phrase using the first three chars and name.  Runs a
*   PBKDF2 500 times on the firsth three characters of the passphrase
* to generate a key.  Then runs PBKDF2 250 times on the key to generate a
* hash.  The generated hash is compared to the stored hash.  If they
* match, the key used to decrypt the pass phrase using AES.  If not, the
* encrypted data and has are cleared.
* @param {String} firstThreeChars
* @param {String} name
* @return {promise} A promise which will be resolved with the pass phrasee or
*  rejected with an error.
*/
TemporaryPhraseStore.prototype.decryptPhrase = function(firstThreeChars, name) {
  'use strict';

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
    } else if (typeof firstThreeChars !== 'string' || firstThreeChars.length !==
      3) {
      tempStoreContext.clearStore();

      reject(
        'First three characters parameter is not a 3 character string');
    } else {
      PBKDF2(name + firstThreeChars, name + tempStoreContext.ns, 500, 128)
        .then(function(key) {
          aesKey = convertDerivedKeyToHex(key);
          // console.log('Key: ' + aesKey);

          return PBKDF2(convertDerivedKeyToHex(key), name +
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
};

/* Clears any stored data for the hash and encrypted pass phrase
 * @param {none}
 * @return {none}
 */
TemporaryPhraseStore.prototype.clearStore = function() {
  'use strict';

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
};

/**
* Allows values to be stored which were created separately.  This
*  functionality is required for the chrome extension which stores and returns
*  values
* @param {String} threeCharHash
* @param {Uint8Array} encData
*/
TemporaryPhraseStore.prototype.storeValues = function(threeCharHash, encData) {
  'use strict';

  assert(threeCharHash !== '',
    'TemporaryPhraseStore.prototype.storeValues threeCharHash: ' +
    threeCharHash);
  assert(encData !== '',
    'TemporaryPhraseStore.prototype.storeValues encData: ' +
    encData);

  this.threeCharHash = threeCharHash;
  this.encData = encData;
};

/* global OpenSesame, document, window, console, navigator, extHasPassword,
  generateExtPassword, clearExtPhrase,  storeExtVals, zeroVar,
   TemporaryPhraseStore */

/* exported prepServiceWorker, changePassPhrase, setPassChangeRequired */

// Global variables for UI elements
let passPhrase;
// let givenName;
// let familyName;
let domainName;
let securityQuestion;
let userName;
let type;
let bodyNode;
let password;
let optionsVisible = false;
let isChromeExtension;

let requiredElements = ['domain', 'user-name', 'passphrase'];

// Variable for processing
let openSesame;
let temporaryPhraseStore;
let passwordType;
let lastPassGenTimeStamp;
let successPrefix;
let passPhraseState;

let passwordDescription = 'Long password';

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


  /* Set up the classes for password calculation and temporary pass
    phrase storage */
  openSesame = new OpenSesame();
  temporaryPhraseStore = new TemporaryPhraseStore();

  /* Set-up global variables for the UI elements */
  domainName = document.getElementById('domain');
  userName = document.getElementById('user-name');
  passPhrase = document.getElementById('passphrase');
  securityQuestion = document.getElementById('security-question');
  type = document.getElementById('type');
  bodyNode = document.querySelector('body');
  password = document.getElementById('password');


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


  // Set the pass phrase viewer button when it receieves the focus
  passPhrase.addEventListener('focus', showPassPhraseDisplayButton, false);
  passPhrase.addEventListener('focusin', showPassPhraseDisplayButton, false);
  passPhrase.addEventListener('focusout', passPhraseUpdated, false);
  passPhrase.addEventListener('blur', passPhraseUpdated, false);

  /* After pass phrase confirmation has been updated, check whether it is OK
   to decrypt pass phrase */
  document.getElementById('confirm-passphrase').addEventListener('input',
    checkConfirmation, false);

  /* Make sure the pass phrase viewer button is hidden when pass phrase
    doesn't have the foxu */
  userName.addEventListener('focus', hidePassPhraseDisplayButton, false);
  userName.addEventListener('focusin', hidePassPhraseDisplayButton, false);
  userName.addEventListener('focusout', function() {
    userNameUpdate();
    sendValsToExt();
  }, false);
  userName.addEventListener('blur', function() {
    userNameUpdate();
    sendValsToExt();
  }, false);

  domainName.addEventListener('focus', hidePassPhraseDisplayButton, false);
  domainName.addEventListener('focusin', hidePassPhraseDisplayButton, false);
  domainName.addEventListener('focusout', function() {
    trimDomainName();
    sendValsToExt();
  }, false);
  domainName.addEventListener('blur', function() {
    trimDomainName();
    sendValsToExt();
  }, false);

  securityQuestion.addEventListener('focus', hidePassPhraseDisplayButton,
    false);
  securityQuestion.addEventListener('focusin', hidePassPhraseDisplayButton,
    false);
  securityQuestion.addEventListener('focusout', sendValsToExt, false);
  securityQuestion.addEventListener('blur', sendValsToExt, false);

  // Add open and close for options section
  document.getElementById('options').addEventListener('click',
    openCloseOptions, false);

  /* Set up password type click events
     Loop through different values within password type drop down and add one
     listener for each value */
  for (let lCounter = 0; lCounter < type.children.length; lCounter++) {
    type.children[lCounter].addEventListener('click', chooseType, false);
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

  /* Enable UI elements */
  domainName.disabled = false;
  userName.disabled = falase;
  passPhrase.disabled = false;
  type.disabled = false;

  /* Focus on the given name */
  userName.focus();

  // Set initial type of password
  if (passwordType === undefined) {
    setType('long-password');
  }

  // Set initial pass phrase state
  if (passPhraseState === undefined) {
    setPassPhraseScreenState('editing');
  }
}, false);

/**
* Close the dialog element
*/
function closeDialog() {
  let dialog = document.getElementById('confirm-dialog');

  clearPassPhraseAndStore();
  dialog.classList.add('hidden');
}

/**
* Record username change in options summary
*/
function userNameUpdate() {
  let optsSummary = document.getElementById('options-summary');
  let userText = document.getElementById('user-name').value;

  if (userText.length > 0) {
    userText = ', ' + userText;
  }

  optsSummary.innerText = 'Options: ' + passwordDescription + userText;
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
  optionsVisible = !optionsVisible;

  let optsDiv = document.getElementById('extra-options-div');
  let optsIcon = document.getElementById('options-icon');

  if (optionsVisible) {
    optsDiv.classList.remove('hidden');
    optsIcon.innerHTML = 'keyboard_arrow_up';
    bodyNode.classList.add('ext-pass-generated');
  } else {
    optsDiv.classList.add('hidden');
    optsIcon.innerHTML = 'keyboard_arrow_down';
  }
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
  if (passPhrase.value.length > 0 && userName.length > 0) {
    // Generate and store the temporaryPhrase values
    temporaryPhraseStore.encryptPhrase(passPhrase.value, userName)
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
* Set-up the UI state for the password being generated, and add values
*  to the temporaryStore
*/
function passwordGenerated() {
  passPhraseTimedClear();
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
  let passPhrase = passPhrase.value;
  let domainName = domainName.value.trim();
  let userName = userName.value.trim();
  let securityQuestion = '';
  let version = 1;

  if (passwordType === 'answer' && securityQuestion.value.trim().length > 0) {
    /* Remove any punctuation, remove any consecutive spaces and convert to
      lower case */
    securityQuestion = securityQuestion.value.trim();
  }

  if (passwordType) {
    openSesame.generatePassword(userName, passPhrase, domainName, passwordType,
      version, securityQuestion)
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
        hideElement('load-bar-ball');

        populateOrCopyPassword();

        passwordGenerated();

        setPassPhraseScreenState('holding');

        // Clear the generated password after 30 seconds on the screen
        window.setTimeout(clearPassword, 30000);
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
    let successToast = document.getElementById('success-toast');

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
      successToast.textContent = successPrefix + ' inserted';
      window.setTimeout(function() {
        showToast(successToast, 'copy-password-div');
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
    showToast('failure-toast', 'passphrase-div');
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
  fullName = givenName.value.trim() + familyName.value.trim();

  if (confirmPassPhrase.value.length === 3) {
    confirmThreeChars(confirmPassPhrase.value, fullName);
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

  // Make sure the domain name value has been trimmed
  trimDomainName();

  // Trim of any www prefix, eg 'www.'  , 'www1.', 'www-87.'
  let calculatedDomainName = domainName.value.replace(/^www[\w-]*./g, '').trim()
    .toLowerCase();

  // If the value is only 'w', 'ww', 'www', or 'www.' then treat as a non-value
  if (calculatedDomainName === 'w' || calculatedDomainName === 'ww' ||
    calculatedDomainName === 'www') {
    calculatedDomainName = '';
  }

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
  let posDomain = 0;

  /* Retrieve domain value and trim the leading http:// or https:// */
  domainName.value = domainName.value.replace(/^https?:\/\//g, '').toLowerCase()
    .trim();

  // Check whether the whole URL is there - remove anything with a '/' onwards
  posDomain = domainName.value.indexOf('/');
  if (posDomain > 0) {
    domainName.value = domainName.value.substr(0, posDomain);
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
      document.getElementById('success-toast').textContent = successPrefix +
        ' copied to Clipboard';
      showToast('success-toast', 'copy-password-div');
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

  copyPasswordButton.textContent = 'Copy Password';
  successPrefix = 'Password';
  passwordCardHeader.textContent = 'Password';
  generatePasswordButton.textContent = 'Produce password';
  showElement('user-name-div');
  hideElement('security-question-div');
  passwordType = passwordSelection;

  let passwordLabel = document.getElementById('password-selected');

  switch (passwordSelection) {
    case 'maximum-password':
      passwordDescription = 'Maximum password';
      passwordLabel.innerText = 'Maximum password (20 characters)';
      break;
    case 'long-password':
      passwordDescription = 'Long password';
      passwordLabel.innerText = 'Long password (14 characters)';
      break;
    case 'medium-password':
      passwordDescription = 'Medium password';
      passwordLabel.innerText = 'Medium password (8 characters)';
      break;
    case 'basic-password':
      passwordDescription = 'Basic password';
      passwordLabel.innerText = 'Basic password (8 letters / numbers)';
      break;
    case 'short-password':
      passwordDescription = 'Short password';
      passwordLabel.innerText = 'Short password (4 letters / numbers)';
      break;
    case 'pin':
      generatePasswordButton.textContent = 'Produce PIN';
      passwordDescription = 'Four digit PIN';
      copyPasswordButton.textContent = 'Copy PIN';
      successPrefix = 'PIN';
      passwordCardHeader.textContent = 'PIN';
      passwordLabel.innerText = 'Four digit PIN';
      break;
    case 'pin-6':
      generatePasswordButton.textContent = 'Produce PIN';
      passwordDescription = 'Six digit PIN';
      copyPasswordButton.textContent = 'Copy PIN';
      successPrefix = 'PIN';
      passwordCardHeader.textContent = 'PIN';
      passwordLabel.innerText = 'Six digit PIN';
      break;
    case 'answer':
      generatePasswordButton.textContent = 'Produce security answer';
      passwordDescription = 'Security answer';
      copyPasswordButton.textContent = 'Copy Security Answer';
      successPrefix = 'Answer';
      passwordCardHeader.textContent = 'Answer';
      showElement('security-question-div');
      passwordLabel.innerText = 'Security answer';
      break;
  }

  userNameUpdate();

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
* Display a toast message for 5 seconds
* @param {String} toastElementName - the element to display as a toast
* @param {String} coveredElementName - the element to cover with the toast
*/
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
}

/**
* Hide a toast message
* @param {String} toastElementName - the element being displayed as a toast
* @param {String} coveredElementName - the element covered with the toast
*/
function hideToast(toastElementName, coveredElementName) {
  showElement(coveredElementName);
  hideElement(toastElementName);
}

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

/* global chrome, document, givenName, familyName, passPhrase, password,
  domainName, passwordType, setType, temporaryPhraseStore,
  setPassPhraseScreenState, userName, securityQuestion, */

/* exported generateExtPassword,  extHasPassword, storeExtVals, storeExtPhrase
    clearExtPhrase */

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
      domainName.value = request.url || '';
      givenName.value = request.givenName || '';
      familyName.value = request.familyName || '';
      userName.value = request.userName || '';
      securityQuestion.value = request.securityQuestion || '';
      extHasPassword = request.hasPassword;

      // console.log('Populate fields password type: ' + request.passwordType);
      setType(request.passwordType);

      if (domainName.value.length > 0) {
        setValuePopulated(domainName);
      }
      if (givenName.value.length > 0) {
        setValuePopulated(givenName);
      }
      if (familyName.value.length > 0) {
        setValuePopulated(familyName);
      }
      if (securityQuestion.value.length > 0) {
        setValuePopulated(securityQuestion);
      }
      if (userName.value.length > 0) {
        setValuePopulated(userName);
      }
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

        setValuePopulated(passPhrase);
        setPassPhraseScreenState('stored');
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
* When values are populated from the background page to the pop-up page, this
* function sets the is-dirty class to ensure that labels are rendered
* correctly above the inpt fields
* @param {String} pElement - the name if the element being populated
*/
function setValuePopulated(pElement) {
  pElement.parentElement.classList.add('is-dirty');
}

/* global CryptoJS, Promise, Uint8Array, window, TextEncoder,
TextDecoder */
/* global assert */

/* Ensure functions are always adressable after minification / compilation */
window['pBKDF2'] = pBKDF2;
window['HMACSHA256'] = hMACSHA256;
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
    // use the subtle crypto functions
    let cryptoTextEncoder = new TextEncoder('utf-8');

    let saltBuffer = cryptoTextEncoder.encode(salt);
    let passwordBuffer = cryptoTextEncoder.encode(password);

    return window.crypto.subtle.importKey('raw', passwordBuffer, {
      name: 'PBKDF2',
    }, false, ['deriveBits']).then(function(key) {
      return window.crypto.subtle.deriveBits({
        name: 'PBKDF2',
        iterations: numIterations,
        salt: saltBuffer,
        hash: 'SHA-1',
      }, key, keyLength);
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
