/* Parsec · pages/triage · popovers.js
   Triage's pop-overs: release, free spots, search; the sample trucks from the catalog sit beside them.
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   tgPopHtml tgFreeSpots tgRelChecks tgRelQcHtml tgRelPop tgVin tgFind tgSrRow tgSearchHtml TG_REL_COVER (9 functions, 1 constant)
   state      ros
   uses       access/ import/ kit/ pages/ pages/foreman/ ro/ state/
*/
function tgPopHtml(){
  var P = UI.tgPop; if(!P) return ''; var ro = tgRoById(P.ro); if(!ro){ UI.tgPop = null; return ''; }
  var head = function(k){ return '<div class="tg-ph"><b>' + k + '</b><span class="tg-no">' + esc(roLabel(ro)) + '</span><span class="cu">' + esc(ro.customerName || "") + '</span><button class="btn btn-sm ib" data-action="tg-pop-x" aria-label="Close">' + tgI("x", 14) + '</button></div>'; };
  var mi = function(i, inner, act){ return '<button class="tg-mi' + ((P.i || 0) === i ? ' hv' : '') + '" data-action="' + act + '" data-i="' + i + '"><span class="tg-kbd">' + (i + 1) + '</span>' + inner + '</button>'; };
  var ft = function(t){ return '<div class="tg-pft">' + t + '</div>'; };
  var style = UI.tgPopTop != null ? ' style="top:' + UI.tgPopTop + 'px"' : '';
  var h = '';
  if(P.type === "log") h = '<div class="tg-pop" data-tg-keep' + style + '>' + head("Log a contact") + tgLogForm(tgLF("p"), "p", ro) + '</div>';
  else if(P.type === "snooze") h = '<div class="tg-pop menu" data-tg-keep' + style + '>' + head("Snooze until") + tgWhenOpts().map(function(o, i){ return mi(i, o[0] + '<span class="meta">' + tgWhen(o[1]) + '</span>', "tg-snz-pick"); }).join('') + ft("Comes back at the top of its group.") + '</div>';
  else if(P.type === "assign"){ var T = rtTechs(); h = '<div class="tg-pop menu" data-tg-keep' + style + '>' + head("Assign") + (T.length ? T.map(function(n, i){ var c = STATE.ros.filter(function(x){ return !roIsDone(x) && techSame(x.assignedTech, n); }).length; return mi(i, '<span class="tg-av">' + esc(tgIni(n)) + '</span>' + esc(n) + '<span class="meta">' + c + ' open</span>', "tg-as-pick"); }).join('') : '<p class="tg-none" style="padding:8px 10px">No technicians yet — add them under Manager → Staff.</p>') + ft("Sends it to the tech" + (rtCfg().needAccept ? " — they accept it on their Console." : ".")) + '</div>'; }
  else if(P.type === "checkin"){ var F = tgFreeSpots(); h = '<div class="tg-pop menu" data-tg-keep' + style + '>' + head("Check in to") + (F.length ? F.map(function(s, i){ return mi(i, esc(tgZone(s)) + '<span class="meta tg-no">' + esc(tgSpotLbl(s)) + '</span>', "tg-ci-pick"); }).join('') : '<p class="tg-none" style="padding:8px 10px">No free triage lane or bay.</p>') + ft("Then it shows under Ready to go → Assign.") + '</div>'; }
  else if(P.type === "release") h = tgRelPop(ro, head, style);
  else if(P.type === "xfer") h = trxXferPop(ro, head, style);
  else if(P.type === "road") h = trxRoadPop(ro, head, style);
  else if(P.type === "checks") h = trxChecksPop(ro, head, style);
  return h;
}
function tgFreeSpots(){ var ym = yardMap(); return yardSpots().filter(function(s){ return (s.zone === "triage" || s.zone === "bay") && !ym.map[s.id]; }).sort(function(a, b){ return (a.zone === "triage" ? 0 : 1) - (b.zone === "triage" ? 0 : 1) || a.n - b.n; }).slice(0, 5).map(function(s){ return s.id; }); }
function tgRelChecks(ro){
  var cl = tyCloseChecks(ro), st = roStatus(ro), hold = /^Waiting/.test(st.status), gaps = [];
  try{ gaps = roCompleteGaps(ro).filter(function(g){ return !/operation|road test/.test(g); }); }catch(e){}
  var L = cl.map(function(c){ return { k: c.k, ok: c.ok, t: c.t, d: c.d, fix: c.ok ? null : c.k === "ops" ? "Mark complete" : c.k === "parts" ? "Mark installed" : c.k === "notes" ? "Add note" : c.k === "files" ? "Open RO" : "Log road test", op: c.op }; });
  L.push({ k: "hold", ok: !hold, t: "Nothing holding", d: hold ? (st.sub || st.status.replace(/^Waiting – /, "waiting on ")) : "clear", fix: null });
  v141RelLines(ro, L);   /* Parsec 14.1: Story on every operation · Hours */
  var trq = trxRelCheck(ro); if(trq) L.push(trq);   /* Parsec 14: none when the RO needs no road test */
  if(gaps.length) L.push({ k: "gaps", ok: false, t: "Paperwork", d: gaps.join(" · "), fix: "Open RO" });
  /* 17.5: the story and the punch notes are one check */
  var iN = -1, iS = -1; L.forEach(function(c, i){ if(c.k === "notes") iN = i; if(c.k === "story") iS = i; });
  if(iN > -1 && iS > -1){ var cn = L[iN], cs = L[iS], bad = !cs.ok ? cs : !cn.ok ? cn : cs;
    L[iN] = { k: bad.k, ok: cn.ok && cs.ok, t: "Story and notes on every operation", d: cn.ok && cs.ok ? "every operation and punch" : bad.d, fix: bad.fix, op: bad.op }; L.splice(iS, 1); }
  return L;
}
/* 17.5: with truck checks on, Release doesn't list them again — they show as one line, or one box when they're open */
var TG_REL_COVER = { ops: 1, parts: 1, notes: 1, story: 1, files: 1, road: 1, qc: 1 };
function tgRelQcHtml(ro){
  var h = "", rt = ro.roadTest, C = trxQc(ro), done = trxQcDone(ro);
  if(rtNeeded(ro)) h += trxPassed(ro) ? '<div class="tg-rdone"><i>' + tgI("check", 12) + '</i><span><b>Road test passed</b>' + esc((rt.at ? fmtTime(rt.at) : "") + (rt.driver ? " · " + tgFirst(rt.driver) : rt.by ? " · " + tgFirst(rt.by) : "")) + '</span></div>' : "";
  if(done) return h + '<div class="tg-rdone"><i>' + tgI("check", 12) + '</i><span><b>Truck checks done</b>' + esc((C.at ? fmtTime(C.at) : "") + (C.by ? " · " + tgFirst(C.by) : "") + " · " + C.total + " of " + C.total) + '</span></div>';
  var open = C.auto.filter(function(x){ return !x.ok; }).map(function(x){ return x.t; });
  if(C.n < C.of) open.push("walk-around " + C.n + " of " + C.of);
  if(rtNeeded(ro) && !trxPassed(ro) && open.indexOf("Road test passed") < 0) open.unshift("Road test");
  var k = C.total - C.done;
  return h + '<div class="tg-rwarn"><b>' + (k ? "Truck checks aren’t done · " + k + " open" : "Truck checks aren’t marked checked") + '</b>' + (open.length ? '<span>' + esc(open.join(" · ")) + '</span>' : '')
    + '<button class="tg-link" data-action="tg-pop" data-p="checks" data-ro="' + ro.id + '">Finish the checks first ›</button></div>';
}
function tgRelPop(ro, head, style){
  var A = UI.tgRL || (UI.tgRL = {}), C = tgRelChecks(ro), bad = C.filter(function(c){ return !c.ok; }), L = tgPeople(ro), rs = releaseState(ro);
  if(A.to == null){ var di = -1; L.forEach(function(p, i){ if(di < 0 && p.r === "Driver") di = i; }); A.to = di > -1 ? di : L.length ? tgDefTo(ro) : "o"; }
  v141WalkSync(ro); var hand = v141Hand(ro);   /* Parsec 14.1: keys and clean come from the walk-around */
  var handBad = hand.filter(function(x){ return !rs[x[0]]; }), qc = qcNeeded(ro);
  var n = C.length + hand.length, done = n - bad.length - handBad.length, CC = 2 * Math.PI * 9;
  if(qc){ var C1 = C.filter(function(c){ return !TG_REL_COVER[c.k]; }), b1 = C1.filter(function(c){ return !c.ok; }).length + (trxQcDone(ro) ? 0 : 1);   /* 17.5: the truck checks count as one */
    n = C1.length + 1 + hand.length; done = n - b1 - handBad.length; }
  var fixF = function(c){
    if(c.k === "notes") return '<div class="tg-fix"><input data-no-draft data-tg-in="rl-note" placeholder="What was done on that punch" value="' + esc(A.note || "") + '"><button class="btn btn-sm btn-primary" data-action="tg-rl-save" data-k="notes">Save note</button></div>';
    if(c.k === "road") return '<div class="tg-fix"><span class="lb">Result</span><span class="tg-seg3"><button class="' + ((A.road || "Pass") === "Pass" ? 'on ok' : '') + '" data-action="tg-rl" data-f="road" data-v="Pass">Pass</button><button class="' + (A.road === "Fail" ? 'on no' : '') + '" data-action="tg-rl" data-f="road" data-v="Fail">Fail</button></span><input data-no-draft data-tg-in="rl-mi" placeholder="Miles" style="max-width:80px" value="' + esc(A.mi || "") + '"><button class="btn btn-sm btn-primary" data-action="tg-rl-save" data-k="road">Save</button></div>';
    return '<div class="tg-fix"><span class="lb">' + (c.k === "ops" ? 'Marks every open operation complete.' : 'Marks every part on the RO installed.') + '</span><button class="btn btn-sm btn-primary" data-action="tg-rl-save" data-k="' + c.k + '">' + c.fix + '</button></div>'; };
  var CL = qc ? C.filter(function(c){ return !TG_REL_COVER[c.k] && !c.ok; }) : C;   /* 17.5 */
  var cks = (qc ? tgRelQcHtml(ro) : '') + '<div class="tg-cks">' + CL.map(function(c){ return '<div class="tg-ck ' + (c.ok ? 'ok' : 'no') + '"><i></i><span>' + esc(c.t) + '</span><small>' + esc(c.d) + '</small>' + (!c.ok && c.fix && A.fix !== c.k ? (c.k === "gaps" || c.k === "files" || c.k === "story" ? '<button class="tg-link" data-action="goto-ro" data-ro="' + ro.id + '">Open RO</button>' : c.k === "road" || c.k === "qc" ? '<button class="tg-link" data-action="tg-pop" data-p="' + (c.k === "qc" ? 'checks' : 'road') + '" data-ro="' + ro.id + '">' + (c.k === "qc" ? 'Truck checks…' : 'Road test…') + '</button>' : '<button class="tg-link" data-action="tg-rl" data-f="fix" data-v="' + c.k + '">' + c.fix + '</button>') : '') + '</div>' + (A.fix === c.k && !c.ok ? fixF(c) : ''); }).join('') + '</div>';
  var handH = (qc ? '' : v141WalkH(ro)) + '<span class="tg-lbl top">Before it goes</span><div class="tg-r">' + hand.map(function(x){ var on = !!rs[x[0]]; return '<button class="tg-chip tick' + (on ? ' on' : '') + '" data-action="tg-rl" data-f="tick" data-v="' + x[0] + '" title="' + esc(x[1]) + '">' + (on ? tgI("check", 12) : '') + esc({ keys: "Keys back", clean: "Truck clean", invoice: "Invoice closed", notify: "Customer told" }[x[0]] || x[1]) + '</button>'; }).join('') + '</div>';
  var pname = A.to === "o" ? (A.other || "") : (L[A.to] || {}).n || "";
  var ppl = '<span class="tg-lbl top">Picked up by</span><div class="tg-r">' + L.map(function(q, i){ return '<button class="tg-pchip' + (A.to === i ? ' on' : '') + '" data-action="tg-rl" data-f="to" data-v="' + i + '"><span class="tg-av">' + esc(tgIni(q.n)) + '</span><b>' + esc(q.n) + '</b><small>' + esc(q.r || "") + '</small></button>'; }).join('') + '<button class="tg-chip' + (A.to === "o" ? ' on' : '') + '" data-action="tg-rl" data-f="to" data-v="o">' + (L.length ? 'Someone else' : 'Name') + '</button></div>' + (A.to === "o" ? '<input class="tg-wide" data-no-draft data-tg-in="rl-other" placeholder="Who picked it up" value="' + esc(A.other || "") + '">' : '');
  var line = '<div class="tg-rline"><span>' + tgI("key", 13) + 'Key tag <b class="tg-no">' + esc(ro.keyTag || "—") + '</b>' + (pname ? ' to ' + esc(tgFirst(pname)) : '') + '</span><span>' + tgI("pin", 13) + esc(tgSpotLbl(tgSpotOf(ro))) + ' frees up</span><span>' + tgI("check", 13) + 'Moves to Released today</span></div>';
  var tx = L.length ? '<label class="tg-opt"><input type="checkbox" data-tg-ck="rl-text"' + (A.text ? ' checked' : '') + '>Copy the “Ready for pickup” text too</label>' : '';
  var nb = n - done - handBad.length, nh = handBad.length;   /* 17.5: open checks ask why; Before it goes is ticked, not excused */
  var any = nb ? '<div class="tg-any"><span class="tg-lbl">' + (qc && !trxQcDone(ro) ? 'Why release now?' : 'Release with ' + nb + ' open — why?') + '</span><div class="tg-r">' + TG_RSN.map(function(x){ return '<button class="tg-chip' + (A.reason === x ? ' on' : '') + '" data-action="tg-rl" data-f="reason" data-v="' + esc(x) + '">' + esc(x) + '</button>'; }).join('') + '</div><input class="tg-wide" data-no-draft data-tg-in="rl-why" placeholder="' + (v141Hours(ro).bad ? 'Why is nothing clocked? (needed) — ' : '') + 'Note (optional)" value="' + esc(A.why || "") + '"></div>' : '';
  var goOff = nh ? ' disabled data-tip="Not yet — tick Before it goes first"' : nb && !A.reason ? ' disabled data-tip="Pick a reason first"' : '';
  var acts = '<div class="tg-acts"><span class="hint">Completes the RO and releases the truck.</span><button class="btn btn-sm" data-action="tg-pop-x">Cancel<span class="tg-kbd">Esc</span></button><button class="btn btn-sm btn-primary" data-action="tg-rl-go" data-v="' + (nb ? 'any' : 'ok') + '"' + goOff + '>' + tgI("release", 13) + (nb ? 'Release anyway' : 'Release') + '<span class="tg-kbd">↵</span></button></div>';   /* 17.5: one Release button */
  return '<div class="tg-pop rl" data-tg-keep' + style + '>' + head("Release") + '<div class="tg-rsum' + (nb || nh ? ' bad' : '') + '"><svg class="tg-ring' + (nb || nh ? '' : ' ok') + '" width="22" height="22" viewBox="0 0 22 22"><circle class="t" cx="11" cy="11" r="9" style="stroke-width:3"/><circle class="p" cx="11" cy="11" r="9" style="stroke-width:3" stroke-dasharray="' + (CC * done / n).toFixed(1) + ' ' + CC.toFixed(1) + '"/></svg><b>Ready to close</b><small>' + done + ' of ' + n + (nb ? ' · ' + nb + ' open' : '') + '</small>' + v10Ready(done, n) + '</div>' + cks + handH + ppl + line + tx + any + acts + '</div>';
}

/* ---------- search: where is it? ---------- */
function tgVin(ro){ return String(ro.vin || "").toUpperCase(); }
function tgFind(q){
  q = String(q || "").trim().toLowerCase().replace(/^(where('?s| is)?|unit|ro|truck|vin)\s+/, "").trim(); if(!q) return { q: q, L: [], R: [] };
  var sc = function(ro){ var sp = tgSpotOf(ro), sl = sp ? tgSpotLbl(sp).toLowerCase() : "", n = String(ro.roNumber || "").toLowerCase(), u = String(ro.unitNumber || "").toLowerCase(), v = tgVin(ro).toLowerCase(), c = String(ro.customerName || "").toLowerCase();
    if(sl && sl === q) return 100; if(sp && sp.toLowerCase() === q) return 100; if(u === q) return 90; if(n.replace(/\D/g, "").indexOf(q.replace(/\D/g, "")) === 0 && /\d/.test(q)) return 80; if(n.indexOf(q) > -1) return 78;
    if(q.length >= 4 && v.indexOf(q) > -1) return 75; if(c.split(/\s+/).some(function(w){ return w.indexOf(q) === 0; })) return 60; if(c.indexOf(q) > -1) return 40; if(u.indexOf(q) > -1) return 30; return 0; };
  var L = tgYard().map(function(r){ return [r, sc(r)]; }).filter(function(x){ return x[1]; }).sort(function(a, b){ return b[1] - a[1]; }).slice(0, 6).map(function(x){ return x[0]; });
  var R = tyReleasedToday().filter(function(r){ return String(r.roNumber || "").toLowerCase().indexOf(q) > -1 || String(r.customerName || "").toLowerCase().indexOf(q) > -1 || String(r.unitNumber || "").toLowerCase() === q; });
  return { q: q, L: L, R: R };
}
function tgSrRow(ro, i, q){ var arr = tyCat(ro) === "arr", vm = q.length >= 4 && tgVin(ro).toLowerCase().indexOf(q) > -1, um = String(ro.unitNumber || "").toLowerCase() === q, sp = tgSpotOf(ro);
  var wh = arr ? '<span class="wh arr"><span class="w1">' + tgI("inArrow", 13) + (tgEta(ro).eta ? 'Arriving ~' + tgWhen(tgEta(ro).eta) : 'Waiting arrival') + '</span><span class="w2">held ' + esc(tgSpotLbl(sp)) + '</span></span>'
    : '<span class="wh"><span class="w1">' + tgI("pin", 13) + esc(sp ? tgZone(sp) : (ro.location || "No spot")) + (sp ? ' <b class="tg-no">' + esc(tgSpotLbl(sp)) + '</b>' : '') + '</span><span class="w2">Key tag <b class="tg-no">' + esc(ro.keyTag || "—") + '</b></span></span>';
  return '<div class="tg-sr' + (i === (UI.tgSri || 0) ? ' k' : '') + '" data-action="tg-sr-pick" data-ro="' + ro.id + '">' + tgSq(tyCat(ro)) + '<b class="tg-no">' + esc(tgNum(ro)) + '</b><b class="cu">' + esc(ro.customerName || "") + '</b><small>' + (um ? '<mark>Unit ' + esc(ro.unitNumber) + '</mark>' : 'Unit ' + esc(ro.unitNumber || "—")) + ' · ' + (vm ? 'VIN …<mark>' + esc(tgVin(ro).slice(-6)) + '</mark>' : esc(tgCatLbl(ro))) + '</small>' + wh + '<button class="btn btn-sm ib tg-sry" data-action="tg-sr-yard" data-ro="' + ro.id + '" title="Show on the yard  ⇧↵">' + tgI("pin", 14) + '</button></div>'; }
function tgSearchHtml(){
  var raw = UI.tgQ || "", F = tgFind(raw), q = F.q;
  var ft = '<div class="tg-pft"><span><span class="tg-kbd">↑</span><span class="tg-kbd">↓</span> move</span><span><span class="tg-kbd">↵</span> open</span><span><span class="tg-kbd">⇧</span><span class="tg-kbd">↵</span> show on the yard</span><span><span class="tg-kbd">Esc</span> close</span></div>';
  if(!q){ var rc = tgFlat().slice(0, 4).map(tgRoById).filter(Boolean), nx = tgYard().filter(function(r){ return tyCat(r) === "arr"; }).slice(0, 2), i = 0;
    return '<div class="h">Recent</div>' + rc.map(function(r){ return tgSrRow(r, i++, ""); }).join('') + (nx.length ? '<div class="h">Arriving next</div>' + nx.map(function(r){ return tgSrRow(r, i++, ""); }).join('') : '') + ft; }
  if(!F.L.length && !F.R.length) return '<div class="nores">No RO, unit, customer, VIN or spot matches “' + esc(raw) + '”.</div>' + ft;
  return (F.L.length ? '<div class="h">' + F.L.length + ' on the yard</div>' : '') + F.L.map(function(r, i){ return tgSrRow(r, i, q); }).join('')
    + (F.R.length ? '<div class="h">Released today</div>' + F.R.map(function(r){ var rr = r.releaseRec; return '<div class="tg-sr rel"><b class="tg-no">' + esc(tgNum(r)) + '</b><b class="cu">' + esc(r.customerName || "") + '</b><span class="wh"><span class="w1">Released ' + fmtTime(r.status && r.status.setAt) + '</span>' + (rr && rr.to ? '<span class="w2">to ' + esc(rr.to) + '</span>' : '') + '</span></div>'; }).join('') : '') + ft;
}
