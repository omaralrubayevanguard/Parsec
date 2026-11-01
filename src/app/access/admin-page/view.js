/* Parsec · access/admin-page · view.js
   viewAdmin(): the page module's entry, called by render().
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   viewAdmin (1 function)
   uses       access/
*/
function viewAdmin(){ if(!navAllowed('admin')) return '<div class="tg adm" data-pg="admin"><div class="adm-none" style="padding:40px">The Admin page opens for anyone given “Manage people and PINs”.</div></div>'; return ADMPG.view(); }
