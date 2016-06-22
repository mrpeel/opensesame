/*global console*/

/**
 * Simple assertions - checks global variables to decide whether to run and if it runs whether to throw an error or log a console message

 */

var ASSERT_ENABLED = true;
var ASSERT_ERROR = true;
var ASSERT_VERBOSE = true;

function assert(condition, message) {
  if (ASSERT_ENABLED && !condition) {

    if (ASSERT_ERROR) {
      throw new Error('Assertion failed' + typeof message === "undefined" ? '' :
        message);
    } else {
      console.log('Assertion failed');
      console.log(typeof message === "undefined" ? '' : message);
    }
  } else if (ASSERT_VERBOSE && condition) {
    console.log(typeof message === "undefined" ? '' : message);
  }
}
