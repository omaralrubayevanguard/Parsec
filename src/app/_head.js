/* Parsec · app · _head.js
   Opens the one closure the whole app runs in. Everything in src/app shares this scope: a top-level function in any file can call one in any other.
   Flow: the browser runs this script last; the closure body runs top to bottom in manifest order (constants and closures first, listeners as they come, boot/init.js last).
*/
/* Technician Execution Console — app script (page operation only; RO and shop data live in your data folder / browser storage) */
(function(){
"use strict";
