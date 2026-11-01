/* Parsec · pages/rolist · _open.js
   Opens the RO list closure (RL): one flat list of ROs and a peek pane.
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   RL (1 constant)
   at load    builds RL (a closure)
*/
/* ============================== RO list (RO list mock-up, layout C: the list and a peek pane) ==============================
   Open is one flat list, oldest first, the status at the start of the complaint; Mine · Working · Waiting · Hold · Done
   group by status (or stage, or tech). Click a row and the RO opens in a pane beside the list — Enter or Open RO goes to
   the RO page. Select rows for Set status · Transfer · Print. Display picks List or Board, grouping and sort. */
var RL = (function(){
