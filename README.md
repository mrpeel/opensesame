# Open Sesame Password Manager
The Open Sesame Password Manager remembers your passwords without remembering your passwords.  Open Sesame is based on the ideas in the Master Password App ([Lyndir/MasterPassword](https://github.com/Lyndir/MasterPassword)) algorithm (<http://masterpasswordapp.com/algorithm.html>).

It is a standalone web-app ([https://open-sesame-f1f51.firebaseapp.com/]) and a chrome-extension which allows unique passwords to be generated for a website domain.  The generation is deterministic which means that the same set of values will always generate the same password.  This allows Open Sesame to 'remember' your passwords.

## What it does
Open Sesame generates passwords using the combination of fields and password type.  The same combination always generates the same password.  A change to any of the fields or password type will result in a different password being generated.  This means that using the same personal details and pass phrase for different websites will generate a different password for each site.

Open Sesame generates passwords using the following fields:
* Web site domain
* User name
* Open Sesame Pass phrase
* Password type
* Password version
* (Only for security answer) Security question

Open Sesame generates the following types of passwords:
* Maximum password (20 characters)
* Long password (14 characters)
* Medium password (8 characters)
* Basic password (8 characters - only uses letters and numbers)
* Short password (4 characters - only uses letters and numbers)
* Four digit PIN
* Six digit PIN
* Security answer



## How it works
Open sesame uses PBKDF2 and HMAC256 crypto functions.  'window.crypto.subtle' it used when it is supported by the browser, otherwise CryptoJS is loaded.  

The steps to generate a password are:

1. Set the complexity requirements (upper case, lower case, number, symbol) and select character set for the password
2. Use PBKDF2 on the pass phrase with user name (First name + Family Name) as the salt to generate a key
3. Join User name, Domain name, Version and Security question (if present) together and use the key to execute HMAC256 which produces an array of numbers
4. Work through the array using each value to select a character from the available character set
5. Use the first element of the array to select a starting point to check for requried types (upper, lower, number symbol)
6. From the starting point check that each required character type (upper / lower / number / symbol) exists in the password.  If the character type doesn't exist at that point, select the next character a reduced charcter set to ensure it will be the required type.
7. The generated password is returned as a string


## Libraries used
* Material Design Lite


Polyfills:
* CryptoJS (aes.js)
* CryptoJS (pbkdf2.js)
* CryptoJS (hmac-sha256.js)
* Promise.js
