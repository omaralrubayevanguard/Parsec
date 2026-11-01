/* Parsec · pages/rolist · embed.js
   The ROs tab on Triage, Foreman, Parts, Manager and Technician (14.3): rlEmbed puts the RO list inside another page, with Back.
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   rlEmbed rlEmbedCount rlEmbOk rlEmbOn rlEmbAfter rlBackName rlBack rlCrumbFix rlEmbTab RL_HOSTN (9 functions, 1 constant)
   state      rlLayout
   uses       access/ data/ shell/ state/
*/
/* ============================== Parsec 14.3 — the ROs tab on Triage, Foreman, Parts, Manager and Technician ==============================
   rlEmbed(host) → the RO list's HTML for a host page's body (host = the page's UI.view key: 'triage', 'foreman', 'parts', 'manager', 'tech').
   It is the RO list itself — the same tabs, search, Display, your columns and sort (STATE.rlLayout), one state with the RO list page.
   A row (or Enter) opens the RO page; its crumb reads the host page and goes back to it. While it's on the page the RO list's keys
   work and the host page's own single keys don't (rlEmbOn). rlEmbedCount() → the open-RO count for the tab. rlEmbOk() → may this person see it. */
function rlEmbed(host){ try{ return RL.emb(host); }catch(e){ console.error(e); return ''; } }
function rlEmbedCount(){ try{ return RL.n(); }catch(e){ return 0; } }
function rlEmbOk(){ try{ return typeof navAllowed !== 'function' || navAllowed('rolist'); }catch(e){ return true; } }
function rlEmbOn(){ return UI.view !== 'rolist' && UI.view !== 'ros' && !UI.modal && !!document.querySelector('.rq-emb'); }
function rlEmbAfter(){ try{ if(rlEmbOn()) RL.embAfter(); }catch(e){} }
var RL_HOSTN = { triage: 'Triage', foreman: 'Foreman', parts: 'Parts', manager: 'Manager', tech: 'Technician' };
function rlBackName(){ return UI.roFrom && RL_HOSTN[UI.roFrom] ? RL_HOSTN[UI.roFrom] : 'RO list'; }
function rlBack(){ var h = UI.roFrom && RL_HOSTN[UI.roFrom] ? UI.roFrom : 'rolist'; UI.view = h; UI.modal = null; try{ persistUI(); }catch(e){} render(); window.scrollTo(0, 0); }
function rlCrumbFix(h){ try{ var a = h && h.querySelector('.px-crumb a'); if(!a || a.textContent !== 'RO list' || !UI.roFrom || !RL_HOSTN[UI.roFrom]) return h;
  var a2 = a.cloneNode(true); a2.textContent = rlBackName(); a2.title = 'Back to ' + rlBackName() + ' — its ROs tab'; a2.addEventListener('click', function(e){ e.preventDefault(); e.stopPropagation(); rlBack(); }); a.replaceWith(a2); }catch(e){} return h; }
function rlEmbTab(on){ return 'ROs<em class="rle-n">' + rlEmbedCount() + '</em>'; }
