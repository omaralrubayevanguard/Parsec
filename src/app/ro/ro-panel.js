/* Parsec · ro · ro-panel.js
   The one RO side panel's shared pieces: the stage line, Time · Parts · Files on one line, the operations, the buttons by role, and the folds each person keeps.
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   rpWho rpFolds rpFold rpFoldSet rpE rpStageHtml rpFactsHtml rpOpsHtml rpActsHtml RP_FOLD0 (9 functions, 1 constant)
   state      punches
   uses       access/ clock/ kit/ pages/ pages/triage/ pages/warranty/ ro-page/ shell/ state/
   at load    on document click
*/
/* ============================== one RO side panel (Parsec 17.1) ==============================
   The RO list's side panel (and the Technician's ROs tab) and the RO page's right column (and Technician › My ROs) are
   one panel, in this order: the RO number · days open; a small truck picture beside the customer; the truck line; the
   status and who has it; the repair stage, under the status; Time · Parts · Files on one line; the operations, with their
   status and hours; the details (Vehicle folded); and the buttons by role at the bottom, always in reach. No Next card.
   These are the pieces both sides draw from (the RO page draws inside its shadow root, so they are plain HTML strings);
   rpFold / rpFoldSet keep what each person folds — the same section folds on every page and every RO. */

/* ---------- what you fold stays folded (per person, this browser) ---------- */
var RP_FOLD0 = { vehicle: true, customer: true, people: false, schedule: false, paperwork: true, money: true, ops: false };
function rpWho(){ try{ var sf = viewAsStaff(); return sf ? sf.id : "admin"; }catch(e){ return "admin"; } }
function rpFolds(){ try{ return JSON.parse(localStorage.getItem("rpfold:" + rpWho()) || "{}") || {}; }catch(e){ return {}; } }
function rpFold(k){ var F = rpFolds(); return F[k] == null ? !!RP_FOLD0[k] : !!F[k]; }   /* true = folded */
function rpFoldSet(k, shut){ var F = rpFolds(); F[k] = !!shut; try{ localStorage.setItem("rpfold:" + rpWho(), JSON.stringify(F)); }catch(e){} }

/* ---------- the pieces ---------- */
function rpE(t){ return String(t == null ? "" : t).replace(/[&<>"]/g, function(c){ return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
/* the repair stage, small: the bars, the stage, when it'll be ready */
function rpStageHtml(ro){
  var f = null, M = null; try{ f = roForecast(ro); }catch(e){} try{ M = roStages(ro, f); }catch(e){}
  if(!M || !M.list) return "";
  var live = M.list.filter(function(x){ return x.state !== "x"; }), ci = -1;
  live.forEach(function(x, n){ if(ci < 0 && (x.state === "c" || x.state === "n" || x.state === "w")) ci = n; });
  var cur = live[ci];
  var bars = live.map(function(x){ return '<i class="' + (x.state === "d" ? "d" : x.state === "w" ? "w" : (x.state === "c" || x.state === "n") ? "c" : "") + '" title="' + rpE(x.name) + '"></i>'; }).join("");
  var ready = f ? (f.ready ? "ready now" : "ready about " + fcWhen(f.likely)) : "";
  return '<div class="rp-stg"><span class="rp-bars">' + bars + '</span><span>' + (cur ? "<b>" + rpE(cur.name) + "</b> · stage " + (ci + 1) + " of " + live.length : "All stages done") + (ready ? " · " + rpE(ready) : "") + "</span></div>";
}
/* Time · Parts · Files, one line */
function rpFactsHtml(ro){
  var b = 0, q = 0, parts = [], files = (ro.attachments || []).length + (ro.bulletins || []).reduce(function(s, x){ return s + ((x.files || []).length); }, 0);
  (ro.operations || []).forEach(function(o){ if(!o || o.declined) return; try{ b += opCalc(o).burntHrs || 0; }catch(e){} q += +o.quoted || 0; try{ opRealParts(o).forEach(function(p){ parts.push(p); }); }catch(e){} });
  var pin = parts.filter(function(p){ return p.status === "Received" || p.status === "Installed" || p.sup === "stock"; }).length;
  return '<div class="rp-facts"><span title="Hours on the clock / quoted"><b>' + b.toFixed(2) + "</b> / " + q.toFixed(2) + ' h</span><i>·</i><span title="Parts in hand / on the RO">parts <b>' + pin + "</b> / " + parts.length + '</span><i>·</i><span><b>' + files + "</b> " + (files === 1 ? "file" : "files") + "</span></div>";
}
/* the operations: status, number, the complaint, hours */
function rpOpsHtml(ro, cur){
  var run = STATE.punches.filter(function(p){ return !p.stop && p.roId === ro.id; }), L = (ro.operations || []).filter(function(o){ return o && o.id; });
  var rows = L.map(function(o, i){
    var bb = 0; try{ bb = opCalc(o).burntHrs || 0; }catch(e){}
    var os = "Hold Tech"; try{ var s0 = opStatus(o); os = (typeof s0 === "string" ? s0 : s0 && s0.status) || os; }catch(e){}
    if(run.some(function(p){ return p.opId === o.id; })) os = "Working"; else if(o.declined) os = "Declined"; else { try{ if(opDoneNow(o)) os = "Complete"; }catch(e){} }
    return '<button type="button" class="rp-op' + (cur === o.id ? " on" : "") + '" data-rp-op="' + rpE(o.id) + '">' + pgSt("ro", os, { iconOnly: 1, noTip: 1 }) + '<span class="n">' + (i + 1) + '</span><span class="t">' + rpE(o.complaint || "Operation") + '</span><span class="h">' + bb.toFixed(2) + " / " + (+o.quoted || 0).toFixed(2) + " h</span></button>";
  }).join("");
  var shut = rpFold("ops");
  return '<div class="rp-ops' + (shut ? " shut" : "") + '"><button type="button" class="rp-gh" data-rp-fold="ops" aria-expanded="' + !shut + '"><i></i><b>Operations</b><small>' + L.length + "</small></button>" + (shut ? "" : '<div class="rp-opl">' + (rows || '<span class="rp-none">No operations yet</span>') + "</div>") + "</div>";
}
/* the buttons by role, for the pages outside the RO page (the RO page builds its own with the same rules) */
function rpActsHtml(ro, o){
  o = o || {};
  var me = null; try{ me = PG.me(); }catch(e){}
  var tech = !!(me && me.role === "Technician"), h = "";
  if(o.open) h += '<button class="btn btn-sm btn-primary" data-a="open" data-id="' + rpE(ro.id) + '">Open RO<span class="tg-kbd">↵</span></button>';
  if(tech && !ro.dateClosed){
    var mine = STATE.punches.filter(function(p){ return !p.stop && p.roId === ro.id && (function(){ try{ return sameOwner(punchOwner(p), pcMe()); }catch(e){ return false; } })(); })[0];
    var next = (ro.operations || []).filter(function(op){ return op && op.id && !op.declined && !(function(){ try{ return opDoneNow(op); }catch(e){ return false; } })(); })[0];
    if(mine){ var n0 = (ro.operations || []).map(function(x){ return x.id; }).indexOf(mine.opId) + 1; h += '<button class="btn btn-sm" data-action="open-stop-punch">■ Stop Op ' + n0 + "</button>"; }
    else if(next) h += '<button class="btn btn-sm" data-action="open-start-punch" data-ro="' + rpE(ro.id) + '" data-op="' + rpE(next.id) + '">▶ Start Op ' + ((ro.operations || []).indexOf(next) + 1) + "</button>";
  }
  if(!tech || o.xfer) h += '<button class="btn btn-sm" data-a="pop" data-p="xfer" data-id="' + rpE(ro.id) + '">Transfer…</button>';
  try{ if(trxBtnsOk(ro) && rtOn(ro)) h += trxBtns(ro, "btn btn-sm"); }catch(e){}
  return '<div class="rp-acts">' + h + "</div>";
}
/* one click handler for the panel's own controls, in the page and inside the RO page's shadow root (composedPath) */
document.addEventListener("click", function(e){
  var t = e.composedPath ? e.composedPath()[0] : e.target; if(!t || !t.closest) return;
  var f = t.closest("[data-rp-fold]");
  if(f){ e.preventDefault(); e.stopPropagation(); var k = f.getAttribute("data-rp-fold"); rpFoldSet(k, !rpFold(k)); try{ render(); }catch(x){} try{ if(typeof JC !== "undefined" && JC.rerender) JC.rerender(); }catch(x){} }
}, true);
