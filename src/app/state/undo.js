/* Parsec · state · undo.js
   The Undo stack (UNDO, UNDO_MAX). pushUndo (ro/actions.js) snapshots STATE before a change; undoLast puts it back.
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   UNDO UNDO_MAX (2 constants)
*/
/* ============================== UNDO ============================== */
var UNDO = [];           // [{snapshot, label, at}] — session-only, capped
var UNDO_MAX = 25;
