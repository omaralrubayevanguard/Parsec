/* Parsec · pages/manager · view.js
   viewManager(): the page module's entry.
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   viewManager viewFleets (2 functions)
   uses       access/
*/
function viewManager(){ return MG.view(); }
/* Parsec 17.1: the Fleets page — its own page, on the Manager's engine (fleets-page.js) */
function viewFleets(){ if(!navAllowed('fleets')) return '<div class="tg mq" data-pg="fleets"><div class="mq-none" style="padding:40px">The Fleets page isn’t on for you — the Admin can turn it on.</div></div>'; return MG.fleetsView(); }
