/* global firebase,  */

/* exported FBAuth */

// window['FBAuth'] = FBAuth;

'use strict';

/** Firebase auth class to handle the firebase authentication and return the
* firebase user id
*/
class FBAuth {
  /** Sets up the basic connection details to firebase and state change
  *    events
  * @param {Function} childAddedCallback - the callback when new data is added
  * @param {Function} childChangedCallback - the callback when data is changed
  */
  constructor(childAddedCallback, childChangedCallback) {
    let fbAuth = this;
    let config = {
      apiKey: 'AIzaSyCQmNa81aSqSBHExjDXKWkx2uDoAMPexOw',
      authDomain: 'open-sesame-f1f51.firebaseapp.com',
      databaseURL: 'https://open-sesame-f1f51.firebaseio.com',
    };
    // Connect to firebase
    firebase.initializeApp(config);

    // Set fbAuth to null initially
    fbAuth.uid = null;

    // Set-up callbacks if supplied
    fbAuth.childAddedCallback = childAddedCallback || null;
    fbAuth.childChangedCallback = childChangedCallback || null;


    // On auth state change, record the userId
    firebase.auth().onAuthStateChanged(function(user) {
      // console.log('Firebase auth state change');
      // console.log(user);
      if (user) {
        fbAuth.uid = user.uid;

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
      } else {
        fbAuth.uid = null;
      }
    });
  }

  /** Authenticates the user if not already authenticated, and
  *     returns the firebase user Id
  * @return {Promise} - a promise with the user Id on success or an error
  */
  logIn() {
    return new Promise(function(resolve, reject) {
      if (firebase.auth().currentUser) {
        // Already signed in
        resolve(firebase.auth().currentUser.uid);
      } else {
        // Sign in using google
        let provider = new firebase.auth.GoogleAuthProvider();

        firebase.auth().signInWithRedirect(provider);
      }
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
}
