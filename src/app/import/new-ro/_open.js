/* Parsec · import/new-ro · _open.js
   Opens the New RO import closure (IMPX): paste the ASIST case page, or drop screenshots, and get an RO with its fields and operations.
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   IMPX (1 constant)
   at load    builds IMPX (a closure)
*/
/* ============================== Parsec 12 — the New RO import from ASIST ==============================
   Paste the case page or drop screenshots (or the PDF) into New RO, or into Import on an open RO. Every piece is read
   on this computer and merged into what was read so far; Parsec finds the RO (RO #, case #, VIN, unit), then shows what
   would change — New (was empty), Updated (ASIST changed it and nobody touched it here), Kept yours (changed here by hand;
   ASIST's value shows beside it), Same — and nothing changes until Create RO or Apply. The RO remembers what each import
   wrote (ro.imp), so the next import knows which values are ASIST's and which are yours. */
var IMPX = (function(){
