/* Parsec · pages/assets · view.js
   viewAssets() and asOpenFor(): the page module's entry and opening a truck from elsewhere.
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   asTrucks asOpenFor viewAssets (3 functions)
   uses       access/
*/
function asTrucks(){ return ASPG.trucks(); }
function asOpenFor(ro){ ASPG.openFor(ro); }
function viewAssets(){ if(!navAllowed('assets')) return '<div class="tg ast" data-pg="assets"><div class="ast-none" style="padding:40px">The Assets page isn’t on for you — the Admin can turn it on.</div></div>'; return ASPG.view(); }
