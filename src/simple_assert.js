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
