# Open Sesame Password Manager
The Open Sesame Password Manager remembers your passwords without remembering your passwords.  Open Sesame is based on the ideas in the Master Password App ([Lyndir/MasterPassword](https://github.com/Lyndir/MasterPassword)) algorithm (<http://masterpasswordapp.com/algorithm.html>).

It is a standalone web-app ([https://open-sesame-f1f51.firebaseapp.com/]) and a chrome-extension which allows unique passwords to be generated for a website domain.  The generation is deterministic which means that the same set of values will always generate the same password.  This allows Open Sesame to 'remember' your passwords.

## What it does
Open Sesame generates passwords using the combination of fields and password type.  The same combination always generates the same password.  A change to any of the fields or password type will result in a different password being generated.  This means that using the same details and pass phrase for different websites will generate a different password for each site.

Open Sesame generates passwords using the following fields:
* Web site domain
* User name
* Open Sesame pass phrase
* Password type
* Password version
* (Only for security answer) security question

Open Sesame generates the following types of passwords:
* Maximum password (20 characters)
* Long password (14 characters)
* Medium password (8 characters)
* Basic password (8 characters - only uses letters and numbers)
* Short password (4 characters - only uses letters and numbers)
* Four digit PIN
* Six digit PIN
* Security answer



## How password generation works
Open sesame uses PBKDF2 and HMAC256 crypto functions.  'window.crypto.subtle' it used when it is supported by the browser, otherwise CryptoJS is loaded.  

The steps to generate a password are:

1. Set the complexity requirements (upper case, lower case, number, symbol) and select character set for the password.
2. Use PBKDF2 on the pass phrase with user name as the salt to generate a key.
3. Join user name, domain name, password version and (if present) security question together and execute HMAC256 on it using the key generated in step 2.  This returns as an array of numbers.
4. Work through the array using each value to select a character from the available character set.
5. Use the first element of the array to select a starting character to check for required types (upper, lower, number symbol).
6. From the starting character check that each required character type (upper / lower / number / symbol) exists in the password.  If the character type hasn't already been selected, choose the next character from the specific character set required (upper / lower / number / symbol).
7. The generated password is returned as a string.

## Retaining meta-data in firebase
After using the initial version for 6 months as a chrome extension, the only real problem I was having was remembering which sites I had used Open Sesame for, and what settings I had used at the site.  As a result, I decided to add the option to authenticate with firebase using OAuth and a google sign in.

The password generation works whether the user is authenticated or not.  If the user isn't authenticated, then after a password is generated, the process is complete.  However, if the user is authenticated, then the settings will be sent to firebase.  Firebase records:
* Web site domain
* User name
* Password type
* Password version
* (Only for security answer) security question

**Pass phrases and generated passwords are not recorded**.

Although recording meta-data represents a source of potential leakage of important information, without the ability to have this information retained and auto-filled, using Open Sesame can becomes unworkable for infrequently visited sites.  In addition, in terms of password versioning, it was extremely difficult to remember which version I was up to with each username / domain name combination.  For these reasons, it was better to have a centralised place secured by a Google sign in for recording meta-data.

## Libraries used
* Material Design Lite


Polyfills loaded as required:
* CryptoJS (aes.js)
* CryptoJS (pbkdf2.js)
* CryptoJS (hmac-sha256.js)
* Promise.js
