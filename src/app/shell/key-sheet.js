/* Parsec · shell · key-sheet.js
   The ? key sheet: one list of the keys that work everywhere, then the page's own (pxKeyGroups).
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   pxKeyGroups pxKeySheet pxIsAdmin (3 functions)
   uses       access/ kit/ pages/foreman/ pages/triage/ pages/warranty/
*/
/* ---------- keys: one sheet, the same keys everywhere, then the page's own ---------- */
function pxKeyGroups(view){
  var ev = [["Ctrl K", "Search, or jump to an RO"], ["[", "Open or close the sidebar"], ["Space", "Start or stop the clock"], ["?", "Keyboard shortcuts"], ["Esc", "Close a menu, popover or dialog"], ["Ctrl Z", "Undo"]];
  if(navAllowed("ros")) ev.splice(1, 0, ["N", "New repair order"]);
  var drop = /^(\?|Ctrl\+Z|Esc)$/;
  var page = null, name = "";
  if(view === "triage"){ page = TG_KEYS; name = "Triage"; }
  else if(view === "foreman"){ page = FM_KEYS; name = "Foreman"; }
  else if(view === "warranty"){ page = WA_KEYS; name = "Warranty"; }
  else if(view === "ros" || view === "rolist"){ name = "Repair order"; page = [["← →  or  J K", "Previous / next operation"], ["↑ ↓", "Previous / next repair order"], ["P", "Quick-add a part to the operation"],
    ["1  2  3", "Parts · Time punches · Files panel (again to close)"], ["0", "Close the panel"], ["D", "RO details"], ["S", "Set the RO status"], ["/", "Jump to the RO filter"]]; }
  var g = [["Everywhere", ev]];
  if(page) g.push([name, page.filter(function(r){ return !drop.test(String(r[0]).trim()); })]);
  return g;
}
function pxKeySheet(view){
  return '<div class="keysheet px-ks">' + pxKeyGroups(view).map(function(g){
    return '<div class="px-ksh">' + esc(g[0]) + '</div>' + g[1].map(function(r){ return '<div class="keyrow"><span class="keycap">' + esc(r[0]) + '</span><span class="keywhat">' + esc(r[1]) + '</span></div>'; }).join('');
  }).join('') + '</div><p class="hint" style="margin:11px 0 0">Shortcuts are off while you are typing in a field.</p>';
}

function pxIsAdmin(){ var me = viewAsStaff(); return !me || me.role === "Manager"; }
