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
