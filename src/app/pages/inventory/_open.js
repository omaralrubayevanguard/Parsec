/* Parsec · pages/inventory · _open.js
   Opens the Inventory page closure (INVPG): the parts stock.
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   INVPG (1 constant)
   state      inventory
   at load    builds INVPG (a closure)
*/
/* ============================== Inventory (Parsec 12.5) ==============================
   The parts stock, on the Parts list (STATE.inventory): what we have and where it sits, what open ROs still need from it,
   what's coming, what to order. Parts keeps its desk (and its Catalog for quick edits); this page is the home for the stock —
   counts by shelf, receiving, adjustments with a reason, reorder points (min) and order-up-to (max), the reorder list you can
   copy, and every movement. Each item keeps its own history (it.log), so it rides in the shop file with the item. */
var INVPG = (function(){
