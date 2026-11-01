/* Parsec · pages/library · view.js
   viewLibrary() and libOpenFor(): the page module’s entry and opening it narrowed to an RO and operation.
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   viewLibrary libOpenFor (2 functions)
   uses       access/
*/
function viewLibrary(){ if(!navAllowed('library')) return '<div class="tg lib" data-pg="library"><div class="lib-none" style="padding:40px">The Library isn’t on for you — the Admin can turn it on.</div></div>'; return LIBPG.view(); }
/* from an RO or a code chip: the Library narrowed to that truck and operation */
function libOpenFor(ro, op, tab){ LIBPG.openFor(ro, op, tab); }
