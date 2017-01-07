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

  document.getElementById('main-section').addEventListener('focus',
    function() {
      console.log('Focus');
    },
    false);

  /* Enable UI elements */
  domainName.disabled = false;
  userName.disabled = false;
  passPhrase.disabled = false;
  type.disabled = false;

  /* Focus on the given name */
  if (domainName.value.trim() === '') {
    domainName.focus();
  } else {
    userName.focus();
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

  console.log(domainValues);
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

  if (userId) {
    firebase.database().ref('users/' + userId + '/domains/' + domainValue +
      '/usernames/' + userName + '/' + passwordType)
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
    showSnackbar('The entered characters don\'t match your pass phrase. ' +
      'Pass phrase cleared.', 5, true);
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
