/* Parsec · shell · dept-tabs.js
   Time Log and Career as tabs on each department page: the title becomes the tabs; the department they sit on (UI.dHome); who gets Career.
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   dpIs dpHome dpCareerOk dpLabel dpTitle DP_PAGES (5 functions, 1 constant)
   uses       access/ kit/ pages/ state/
*/
/* ============================== Time Log and Career on your department page (Parsec 17.1) ==============================
   Career and Time Log are no longer pages on the side bar: they are tabs on each department page — the title becomes
   “Technician · Time Log · Career”. Everyone has a Time Log (their own time); Career is for the people who clock on ROs
   (technicians, foremen) and for anyone who can see other people’s time (t.others: the foreman and the manager).
   The two views keep their own modules (UI.view “timelog” / “career”); UI.dHome remembers the department they belong to,
   so the side bar keeps that page lit and the title tabs lead back to it. Service writers work from Triage. */
var DP_PAGES = ["tech", "triage", "foreman", "parts", "warranty", "manager"];
function dpIs(v){ return DP_PAGES.indexOf(v) > -1; }
/* the department page Time Log and Career sit on: the last one opened, else the person's home page, else the first they have */
function dpHome(){
  var h = UI.dHome; if(h && dpIs(h) && navAllowed(h)) return h;
  var sf = viewAsStaff(), v = sf && PG.HOME ? PG.HOME[sf.role] : null; if(v && dpIs(v) && navAllowed(v)) return v;
  for(var i = 0; i < DP_PAGES.length; i++) if(navAllowed(DP_PAGES[i])) return DP_PAGES[i];
  return null;
}
/* Career: the people who clock on ROs, and whoever may see other people's time */
function dpCareerOk(){ var sf = viewAsStaff(); if(!sf) return true; return sf.role === "Technician" || sf.role === "Foreman" || can("t.others"); }
function dpLabel(k){ for(var i = 0; i < NAV_PAGES.length; i++) if(NAV_PAGES[i][0] === k) return NAV_PAGES[i][1]; return k; }
/* the page's title becomes the tabs: the department, Time Log, Career — the one you're on is the title */
function dpTitle(html){
  var v = UI.view, home = dpIs(v) ? v : (v === "timelog" || v === "career") ? dpHome() : null;
  if(!home) return html;
  var m = /<h1 class="tg-h1">([^<]*)<\/h1>/.exec(html); if(!m || m.index > 4000) return html;
  var T = [[home, dpLabel(home)], ["timelog", "Time Log"]].concat(dpCareerOk() ? [["career", "Career"]] : []);
  var h = '<nav class="dp-tabs" aria-label="' + esc(dpLabel(home)) + ' pages">' + T.map(function(t){
    return t[0] === v ? '<h1 class="tg-h1 dp-on">' + esc(t[1]) + '</h1>' : '<button class="dp-t" data-action="nav" data-view="' + t[0] + '">' + esc(t[1]) + '</button>';
  }).join('') + '</nav>';
  var rest = html.slice(m.index + m[0].length), lk = /^<span class="mq-lock"[^>]*>[\s\S]*?<\/span>/.exec(rest);   /* the Manager's lock stays beside “Manager” */
  if(lk){ rest = rest.slice(lk[0].length); h = h.replace(/(<\/h1>|<\/button>)/, '$1' + lk[0]); }
  return html.slice(0, m.index) + h + rest;
}
