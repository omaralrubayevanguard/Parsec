/* Parsec · ro · ro-panel.js
   The one RO side panel's shared pieces: the stage line, Time · Parts · Files on one line, the operations, the buttons by role, and the folds each person keeps.
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   rpWho rpFolds rpFold rpFoldSet rpE rpStageHtml rpFactsHtml rpOpsHtml rpActsHtml rpPanelHtml rpAnyOpen rpMountRo … (12 functions, 5 constants)
   state      punches
   uses       access/ clock/ kit/ pages/ pages/triage/ pages/warranty/ ro-page/ shell/ state/ trucks/
   at load    2× on document click · on document keydown
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
var RP_ANIM = { k: null, at: 0 };   /* the section just opened glides open (only that one, only then) */
function rpFoldSet(k, shut){ if(!shut){ RP_ANIM.k = k; RP_ANIM.at = Date.now(); } var F = rpFolds(); F[k] = !!shut; try{ localStorage.setItem("rpfold:" + rpWho(), JSON.stringify(F)); }catch(e){} }

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
    var qh = (+o.quoted || 0).toFixed(2); try{ qh = qtHtml(ro, o, o.quoted); }catch(e){}   /* the quote changes in place, as it did on the RO list's pane (14.2) */
    return '<div role="button" tabindex="0" class="rp-op' + (cur === o.id ? " on" : "") + '" data-rp-op="' + rpE(o.id) + '">' + pgSt("ro", os, { iconOnly: 1, noTip: 1 }) + '<span class="n">' + (i + 1) + '</span><span class="t">' + rpE(o.complaint || "Operation") + '</span><span class="h">' + bb.toFixed(2) + " / " + qh + " h</span></div>";
  }).join("");
  var shut = rpFold("ops");
  return '<div class="rp-ops' + (shut ? " shut" : "") + (!shut && RP_ANIM.k === "ops" && Date.now() - RP_ANIM.at < 700 ? " rp-anim" : "") + '"><button type="button" class="rp-gh" data-rp-fold="ops" aria-expanded="' + !shut + '"><i></i><b>Operations</b><small>' + L.length + "</small></button>" + (shut ? "" : '<div class="rp-opl">' + (rows || '<span class="rp-none">No operations yet</span>') + "</div>") + "</div>";
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
  try{ if(trxBtnsOk(ro) && (typeof rtNeeded !== "function" || rtNeeded(ro))) h += trxBtns(ro, "btn btn-sm"); }catch(e){}   /* the road test, unless this truck needs none */
  return '<div class="rp-acts">' + h + "</div>";
}
/* one click handler for the panel's own controls, in the page and inside the RO page's shadow root (composedPath) */
document.addEventListener("click", function(e){
  var t = e.composedPath ? e.composedPath()[0] : e.target; if(!t || !t.closest) return;
  var f = t.closest("[data-rp-fold]");
  if(f){ e.preventDefault(); e.stopPropagation(); var k = f.getAttribute("data-rp-fold"); rpFoldSet(k, !rpFold(k)); try{ render(); }catch(x){} try{ rpMountRo(); }catch(x){} try{ if(typeof JC !== "undefined" && JC.rerender) JC.rerender(); }catch(x){} }
}, true);

/* ---------- 17.1 (b): the whole panel, one HTML for both — the RO list's side panel, and the RO page's right column
   (there it is light DOM slotted into the shadow root: <div slot="rp"> inside .jc-host, so the page's own styles and
   clicks work the same). o = { page: 'list' | 'ro', close, foot } ---------- */
function rpPanelHtml(ro, o){
  o = o || {};
  var opened = ro.dateOpened ? new Date(ro.dateOpened) : null, days = opened ? Math.max(0, Math.floor((Date.now() - opened) / 864e5)) : null;
  var s = roStatus(ro) || { status: "Hold Tech" }, sub = s.sub ? "· " + ((typeof PGST_PART !== "undefined" && PGST_PART[pgStKey("part", s.sub)]) ? pgStLabel("part", s.sub) : s.sub) : "";
  var mayS = typeof can !== "function" || can("ro.status"), tech = ro.assignedTech || "";
  var veh = ""; try{ var tm = truckYM(ro); veh = (tm && tm.line) || [ro.year, ro.make, ro.model].filter(Boolean).join(" "); }catch(e){}
  var spot = ""; try{ var sp = spotOf(ro.location); spot = sp ? tgSpotLbl(sp) : (ro.location || ""); }catch(e){ spot = ro.location || ""; }
  var pill = pgSt("ro", s.status, { of: ro, ofKind: "ro", menu: mayS ? 1 : 0, sub: sub, attrs: mayS ? (o.page === "ro" ? 'data-rp-st="1"' : 'data-a="status" data-id="' + rpE(ro.id) + '"') + ' title="Set status (S)"' : "" });   /* on the RO page: its own status menu */
  var av = tech ? '<span class="tg-av" title="' + rpE(tech) + '"' + (typeof v149eAvAttr === "function" ? v149eAvAttr(tech) : "") + ">" + rpE(PG.ini(tech)) + "</span>" : "";
  var det = ""; try{ det = roDetailsHtml(ro); }catch(e){}
  var anim = Date.now() - RP_ANIM.at < 700 ? RP_ANIM.k : null;
  if(anim) det = det.replace('<div class="rod-g"><button type="button" class="rod-gh" data-rod-g="' + anim + '"', '<div class="rod-g rp-anim"><button type="button" class="rod-gh" data-rod-g="' + anim + '"');
  return '<aside class="rq-peek rp rp-' + (o.page || "list") + '" data-rp-ro="' + rpE(ro.id) + '"><div class="rq-peek__top"><span class="id">' + rpE(roLabelFull(ro)) + "</span><span>·</span><span>" + (ro.dateClosed ? "closed" : days == null ? "" : days === 0 ? "opened today" : days + " days open") + "</span>"
    + (o.close ? '<button class="btn btn-sm ib tg-gh" data-a="peekx" title="Close (Esc)">' + tgI("x", 15) + "</button>" : "") + "</div>"
    + '<div class="rp-nm">' + (typeof trkThumb === "function" ? trkThumb(ro) : "") + "<h2>" + rifHtml(ro, "customerName", ro.customerName || "", "Customer") + '</h2></div><div class="sub">' + rifVeh(ro, veh) + (spot && spot !== "—" ? " · " + rpE(spot) : "") + v149KeySeg(ro) + "</div>"
    + '<div class="rq-strow">' + pill + (tech ? '<span class="rq-with">with ' + av + " " + rpE(tech) + "</span>" : '<span class="rq-with">No tech yet</span>') + "</div>"
    + rpStageHtml(ro) + (o.page === "ro" ? "<!--rp-split-->" : "") + rpOpsHtml(ro)
    + '<div class="rp-allw"><button type="button" class="rp-all" data-rp-all="1">' + (rpAnyOpen() ? RP_CHEV_U + "Collapse all" : RP_CHEV_D + "Expand all") + "</button></div>"
    + det
    + (o.foot === false ? "" : '<div class="rp-foot">' + rpActsHtml(ro, { open: o.page !== "ro" }) + "</div>") + "</aside>";
}
var RP_CHEV_U = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6.5 14.5L12 9l5.5 5.5"/></svg>', RP_CHEV_D = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6.5 9.5L12 15l5.5-5.5"/></svg>';
var RP_KEYS = ["ops", "vehicle", "customer", "people", "schedule", "paperwork"];
function rpAnyOpen(){ return RP_KEYS.some(function(k){ return !rpFold(k); }); }
/* the RO page: the panel goes into its right column, slotted */
function rpMountRo(){
  var pane = document.querySelector(".ro-detail-pane[data-jc]"), host = pane && pane.querySelector(":scope > .jc-host"), ro = pane && getRO(pane.getAttribute("data-jc"));
  if(!host || !ro) return;
  /* 17.3: two pieces — the top (name, status, stages) above the contact and the buttons, the rest below them */
  var mk = function(slot, cls){ var b = host.querySelector(':scope > .rp-host[slot="' + slot + '"]'); if(!b){ b = document.createElement("div"); b.className = "rp-host tg rq" + cls; b.setAttribute("data-pg", "rolist"); b.setAttribute("slot", slot); host.appendChild(b); } return b; };
  var box = mk("rp", ""), box2 = mk("rp2", " rp-host2");
  var a = document.activeElement, typing = a && (box.contains(a) || box2.contains(a)) && /^(INPUT|SELECT|TEXTAREA)$/.test(a.tagName);
  var h = rpPanelHtml(ro, { page: "ro", foot: false }), cut = h.indexOf("<!--rp-split-->");
  var h1 = cut > -1 ? h.slice(0, cut) + "</aside>" : h, h2 = cut > -1 ? '<aside class="rq-peek rp rp-ro rp-rest" data-rp-ro="' + rpE(ro.id) + '">' + h.slice(cut + 15) : "";
  if(typing) return;
  [[box, h1], [box2, h2]].forEach(function(x){ var b = x[0], hh = x[1]; if(b.__h === hh) return;   /* only what changed is touched: the picture, the folds and the hover stay put */
    if(b.__h != null && typeof morphChildren === "function"){ var tmp = document.createElement("div"); tmp.innerHTML = hh; morphChildren(b, tmp); } else b.innerHTML = hh;
    b.__h = hh; });
}
document.addEventListener("click", function(e){
  var t = e.composedPath ? e.composedPath()[0] : e.target; if(t && t.nodeType !== 1) t = t.parentElement; if(!t || !t.closest) return;
  if(t.closest(".qte, .rif")) return;   /* a quote or a field changes in place (ro/truck-card-words.js) */
  var b = t.closest("[data-rp-all]");
  if(b){ e.preventDefault(); e.stopPropagation(); var open = !rpAnyOpen(); RP_KEYS.forEach(function(k){ rpFoldSet(k, !open); }); try{ render(); }catch(x){} try{ rpMountRo(); }catch(x){} return; }
  var ps = t.closest("[data-rp-st]");
  if(ps){ e.preventDefault(); e.stopPropagation(); try{ JC.statusMenu(ps); }catch(x){} return; }
  var th = t.closest(".rp-nm .trk-th");   /* the picture opens Truck & photos, as the big one did */
  if(th){ var pr = th.closest("[data-rp-ro]"), rr = pr && getRO(pr.getAttribute("data-rp-ro")); if(rr && typeof trkDlgOpen === "function"){ e.preventDefault(); e.stopPropagation(); trkDlgOpen(rr, th); } return; }
  var op = t.closest("[data-rp-op]");
  if(op){ var p = op.closest("[data-rp-ro]"); if(!p) return; e.preventDefault(); e.stopPropagation(); var rid = p.getAttribute("data-rp-ro");
    if(typeof openRoAt === "function") openRoAt(rid, op.getAttribute("data-rp-op")); else if(typeof PG !== "undefined") PG.openRo(rid); }
}, true);
/* an operation in the panel opens with Enter or Space too */
document.addEventListener("keydown", function(e){
  if(e.key !== "Enter" && e.key !== " ") return;
  var t = e.composedPath ? e.composedPath()[0] : e.target; if(!t || !t.matches || !t.matches("[data-rp-op]")) return;
  e.preventDefault(); e.stopPropagation(); t.click();
}, true);
