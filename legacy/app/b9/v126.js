/* ============================== Parsec 12.6 — parts stages on the Parts and Foreman pages ==============================
   From the parts stages mock-up's picks: steps like the Warranty page — To order · Ordered · Received · Staged · Picked up ·
   Installed — below the RO's details. The part that's furthest behind sets the stage (a backorder counts as further behind
   than ordered, and turns the Ordered step red). Under each step: how many parts, their ETA, how long the oldest has sat
   there (amber at 2 days, red at 5). "All in by Fri" at the end; the part that holds the stage named under the track and
   highlighted in the parts list; click a step to show only its parts, point at one for its parts; the current step carries
   its action; each operation gets its own mini stage; the Parts page's Needs action rows get a stage pill.
   Every step is in its part status color. Parts on operations still waiting for the customer's approval don't count. */
var PST_RANK = ["Not Ordered", "Backordered", "Ordered", "Received", "Staged", "Picked up", "Installed"];
var PST_L = [["to", "Not ordered", ["Not Ordered"]], ["ord", "Ordered", ["Ordered", "Backordered"]], ["rcv", "Received", ["Received"]], ["stg", "Staged", ["Staged"]], ["pk", "Picked up", ["Picked up"]], ["ins", "Installed", ["Installed"]]];
var PST_C = { "Not Ordered": "var(--tg-st-hold)", "Backordered": "var(--tg-st-problem)", "Ordered": "var(--tg-st-support)", "Received": "var(--tg-st-working)", "Staged": "var(--tg-acc)", "Picked up": "var(--tg-st-customer)", "Installed": "var(--tg-st-working)" };   /* Parsec 14: the status colors (st14) */
var PST_N = { "Not Ordered": "Not ordered" };
function pstE(s){ return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){ return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
function pstCol(st){ return PST_C[st] || "var(--tg-ink3)"; }
function pstName(st){ return typeof pgStLabel === "function" ? pgStLabel("part", st) : PST_N[st] || st; }
/* Parsec 14: a part status in the shop’s one look — icon + word (st14) */
function pstSt(st, o){ return typeof pgSt === "function" ? pgSt("part", st, o) : pstE(pstName(st)); }
function pstStepOf(st){ for(var i = 0; i < PST_L.length; i++) if(PST_L[i][2].indexOf(st) >= 0) return i; return -1; }
function pstNeedAppr(op){ var jt = "OP"; try{ jt = opJobType(op); }catch(e){} return !op.appr && +op.quoted > 0 && ["WARR", "RECALL"].indexOf(jt) < 0; }
function pstOps(ro){ var L = []; try{ L = raLive(ro); }catch(e){ L = (ro.operations || []).filter(function(o){ return !o.declined; }); } return L; }
function pstDays(p, ro){ var t = p.statusChangedAt || (ro && ro.dateOpened) || ""; var ms = t ? Date.now() - new Date(t).getTime() : 0; return ms > 0 ? Math.floor(ms / 86400000) : 0; }
function pstEtaMs(e){ if(!e) return 0; var t = new Date(String(e).length <= 10 ? e + "T12:00:00" : e); return isNaN(t) ? 0 : t.getTime(); }
function pstDay(e){
  var t = pstEtaMs(e); if(!t) return String(e || "");
  var d0 = new Date(); d0.setHours(0, 0, 0, 0); var d = new Date(t); d.setHours(0, 0, 0, 0); var dd = Math.round((d - d0) / 86400000);
  return dd === 0 ? "today" : dd === 1 ? "tomorrow" : dd === -1 ? "yesterday" : dd > 1 && dd < 7 ? d.toLocaleDateString(undefined, { weekday: "short" }) : d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
/* the parts of one RO (or one operation) and where they stand */
function pstItems(ro, op){
  var out = [], ops = op ? [op] : pstOps(ro), pend = 0;
  ops.forEach(function(o, i){
    var P = []; try{ P = opRealParts(o); }catch(e){ P = o.parts || []; }
    var wait = !op && pstNeedAppr(o);   /* Parsec 14: once a part is ordered it’s in the flow, approval or not */
    P.forEach(function(p){ var st = p.status || "Not Ordered"; if(wait && st === "Not Ordered"){ pend++; return; } if(st === "Returned" || PST_RANK.indexOf(st) < 0) return; out.push({ p: p, st: st, op: o, n: (ro.operations || []).indexOf(o) + 1, name: p.description || p.partNumber || "Part", eta: p.eta || "", age: pstDays(p, ro) }); });
  });
  out.pend = pend;
  return out;
}
function pstOf(ro, op){
  if(!ro) return null;
  var items = pstItems(ro, op); if(!items.length) return { none: true, pend: items.pend };
  var min = Math.min.apply(null, items.map(function(x){ return PST_RANK.indexOf(x.st); })), least = items.filter(function(x){ return PST_RANK.indexOf(x.st) === min; }), lst = least[0].st;
  var at = PST_L.map(function(s, i){ return items.filter(function(x){ return pstStepOf(x.st) === i; }); });
  var done = items.every(function(x){ return x.st === "Installed"; });
  var inHand = items.filter(function(x){ return PST_RANK.indexOf(x.st) >= 3; }).length;
  return { items: items, at: at, least: least, lst: lst, ci: pstStepOf(lst), done: done, col: done ? pstCol("Installed") : pstCol(lst), prob: lst === "Backordered", inHand: inHand, pend: items.pend };
}
function pstEtaRange(L){
  var e = L.filter(function(x){ return pstEtaMs(x.eta); }).sort(function(a, b){ return pstEtaMs(a.eta) - pstEtaMs(b.eta); });
  if(!e.length) return L.some(function(x){ return x.st === "Backordered"; }) ? "no date" : "";
  var a = pstDay(e[0].eta), z = pstDay(e[e.length - 1].eta); return "ETA " + (a === z ? a : a + "–" + z);
}
function pstAgeCls(d){ return d >= 5 ? "a2" : d >= 2 ? "a1" : ""; }
function pstUnder(S, i){
  var at = S.at[i]; if(!at.length) return "";
  var b = [at.length + " part" + (at.length === 1 ? "" : "s")];
  if(i < 2){ var e = pstEtaRange(at); if(e) b.push(e); }
  if(!S.done && i < 5){ var a = Math.max.apply(null, at.map(function(x){ return x.age || 0; })); if(a) b.push('<span class="' + pstAgeCls(a) + '">' + a + " d</span>"); }
  return "<small>" + b.join(" · ") + "</small>";
}
function pstPromise(S){
  if(S.done) return '<span class="pst-pr ok">' + pstIc("check") + "<b>All installed</b></span>";
  var out = S.items.filter(function(x){ return PST_RANK.indexOf(x.st) < 3; });
  if(!out.length) return '<span class="pst-pr ok">' + pstIc("check") + "<b>All in hand</b></span>";
  if(out.some(function(x){ return x.st === "Not Ordered"; })) return '<span class="pst-pr r">' + pstIc("clock") + "<b>No date yet</b> — not ordered</span>";
  if(out.some(function(x){ return !pstEtaMs(x.eta); })) return '<span class="pst-pr r">' + pstIc("clock") + "<b>No date yet</b>" + (out.some(function(x){ return x.st === "Backordered"; }) ? " — backordered" : "") + "</span>";
  var last = out.slice().sort(function(a, b){ return pstEtaMs(b.eta) - pstEtaMs(a.eta); })[0], late = pstEtaMs(last.eta) < new Date().setHours(0, 0, 0, 0);
  return '<span class="pst-pr' + (out.some(function(x){ return x.st === "Backordered"; }) || late ? " r" : "") + '">' + pstIc("clock") + (late ? "Due <b>" + pstE(pstDay(last.eta)) + "</b> — late" : "All in by <b>" + pstE(pstDay(last.eta)) + "</b>") + "</span>";
}
function pstIc(k){
  var P = { check: '<path d="M5.5 12.5l4 4 9-9.5"/>', clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>', x: '<path d="M6.5 6.5l11 11M17.5 6.5l-11 11"/>' };
  return '<svg class="pst-i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (P[k] || "") + "</svg>";
}
function pstNameOf(x){ return x.name + (x.n ? " · Op " + x.n : ""); }
function pstHeld(S){
  if(S.done) return "";
  var L = S.least, one = L.length === 1, x = L[0];
  var what = one ? "<b>" + pstE(x.name) + "</b>" + (x.n ? " (Op " + x.n + ")" : "") : "<b>" + L.length + " parts</b> — " + pstE(L.map(function(y){ return y.name; }).join(", "));
  var tail = " · " + pstE(pstName(S.lst)) + (one && pstEtaMs(x.eta) ? " · ETA " + pstE(pstDay(x.eta)) : one && x.st === "Backordered" ? " · no date" : "") + (one && x.age >= 2 ? ' · <span class="' + pstAgeCls(x.age) + '">' + x.age + " d</span>" : "");
  return '<div class="pst-held" style="--sc:' + S.col + '"><i></i><span>Held by ' + what + tail + "</span></div>";
}
function pstPop(S, i){
  if(!S.at[i].length) return "";
  return '<span class="pst-pop" role="tooltip"><b>' + pstE(PST_L[i][1]) + "</b>" + S.at[i].map(function(x){ return "<span>" + pstE(pstNameOf(x)) + (x.st === "Backordered" ? ' · <em class="r">backordered</em>' : "") + (pstEtaMs(x.eta) && PST_RANK.indexOf(x.st) < 3 ? " · ETA " + pstE(pstDay(x.eta)) : "") + "</span>"; }).join("") + "</span>";
}
/* the filter: one step at a time, per page (not saved) */
function pstFilt(roId, pg){ var f = UI.pstF; return f && f.ro === roId && f.pg === pg ? f.i : null; }
/* the track; o: { pg, act: function(S) → the current step's button } */
function pstTrack(ro, o){
  o = o || {}; var S = pstOf(ro);
  if(!S) return "";
  if(S.none) return '<div class="pst-q">' + pstIc("check") + (S.pend ? "Parts · <b>waiting on the customer’s approval</b> — " + S.pend + " part" + (S.pend === 1 ? "" : "s") + " not ordered yet" : "<b>No parts on this RO</b>") + "</div>";
  var pg = o.pg || "", F = pstFilt(ro.id, pg);
  var lbl = S.done ? "Installed" : PST_L[S.ci][1] + (S.prob ? " · backordered" : "");
  var h = '<div class="pst" data-pst-ro="' + pstE(ro.id) + '" data-pst-pg="' + pstE(pg) + '">';
  h += '<div class="pst-h" style="--sc:' + S.col + '"><b>Parts</b><span class="lbl">' + pstSt(S.done ? "Installed" : S.lst, { cls: "sm" }) + "</span><span>· " + S.inHand + " of " + S.items.length + " in hand</span>" + (S.pend ? '<span class="pst-pend">+' + S.pend + " waiting on approval</span>" : "") + '<span class="sp"></span>' + pstPromise(S) + "</div>";
  var act = o.act && !S.done ? o.act(S) || "" : "";
  h += '<ol class="pst-t">' + PST_L.map(function(s, i){
    var cls = S.done || i < S.ci ? "d" : i === S.ci ? "c" : "f", fo = F === i, n = S.at[i].length;
    var dc = pstCol(s[2][0]);
    return '<li class="' + cls + (cls === "c" && S.prob ? " prob" : "") + (fo ? " fo" : "") + (n ? " has" : "") + '" style="--sc:' + S.col + ";--dc:" + dc + '"><button type="button" class="pst-stp" data-pst-step="' + i + '" aria-pressed="' + fo + '" title="' + (n ? (fo ? "Show every part" : "Show only these " + n) : "No parts here") + '"><span class="dot">' + (cls === "d" ? '<svg viewBox="0 0 24 24"><path d="M6 12.5l4 4 8-9"/></svg>' : "") + '</span><span class="lb">' + pstE(s[1]) + "</span>" + pstUnder(S, i) + "</button>" + (cls === "c" && act ? '<span class="pst-act">' + act + "</span>" : "") + pstPop(S, i) + "</li>"; }).join("") + "</ol>";
  h += pstHeld(S);
  if(o.list && F != null){
    var L = S.at[F];
    h += '<div class="pst-list"><div class="pst-lh">Parts at <b>' + pstE(PST_L[F][1]) + "</b> · " + L.length + '<span class="sp"></span><button type="button" class="pst-clr" data-pst-clr="1">' + pstIc("x") + "Close</button></div>"
      + (L.length ? L.map(function(x){ return '<div class="pst-li" style="--sc:' + pstCol(x.st) + '">' + pstSt(x.st, { cls: "sm pst-chip", size: 12 }) + '<b>' + pstE(x.name) + "</b><small>" + pstE((x.n ? "Op " + x.n + " · " : "") + (x.p.partNumber || "")) + (pstEtaMs(x.eta) && PST_RANK.indexOf(x.st) < 3 ? " · ETA " + pstE(pstDay(x.eta)) : "") + (x.age ? " · " + x.age + " d" : "") + "</small></div>"; }).join("") : '<div class="pst-none">Nothing here.</div>') + "</div>";
  }
  return h + "</div>";
}
/* the Parts page: a filter bar over the parts, the rows' highlight, the operation's mini stage, the Needs action pill */
function pstFbar(S, F, roId, pg){ if(!S || S.none || F == null) return ""; var n = S.at[F].length; return '<div class="pst-fbar" data-pst-ro="' + pstE(roId) + '" data-pst-pg="' + pstE(pg) + '">Showing <b>' + pstE(PST_L[F][1]) + "</b> · " + n + " part" + (n === 1 ? "" : "s") + '<span class="sp"></span><button type="button" class="pst-clr" data-pst-clr="1">Show all</button></div>'; }
function pstRow(S, F, pid){
  if(!S || S.none) return "";
  var x = null; S.items.forEach(function(y){ if(y.p.id === pid) x = y; });
  if(!x) return F != null ? " pst-gone" : "";
  return (!S.done && S.least.indexOf(x) >= 0 ? " pst-hl" : "") + (F != null && pstStepOf(x.st) !== F ? " pst-gone" : "");
}
function pstHold(S, pid){ if(!S || S.none || S.done) return ""; var hit = S.least.some(function(y){ return y.p.id === pid; }); return hit ? '<span class="pst-hold" style="--sc:' + S.col + '">holds the stage</span>' : ""; }
function pstOpMini(ro, op){
  var S = pstOf(ro, op); if(!S || S.none) return "";
  var l = S.done ? "Installed" : PST_L[S.ci][1] + (S.prob ? " · backordered" : "");
  return pstSt(S.done ? "Installed" : S.lst, { cls: "sm pst-om", size: 12, title: "Parts on this operation: " + l + " · " + S.inHand + " of " + S.items.length + " in hand" });
}
function pstPill(ro){
  var S = pstOf(ro); if(!S) return "";
  if(S.none) return '<span class="pst-rp0">' + (S.pend ? "Waiting on approval" : "No parts") + "</span>";   /* Parsec 14: not a part status — said plainly */
  var st = S.done ? "Installed" : S.lst;
  return pstSt(st, { cls: "sm pst-rp", size: 12, title: "Parts: " + pstName(st) + " · " + S.inHand + " of " + S.items.length + " in hand" });
}
/* "Tell the tech": a note to the RO's tech that the parts are ready (and where) */
function pstTell(roId){
  var ro = getRO(roId); if(!ro) return;
  var tech = ro.assignedTech || ""; if(!tech){ pushToast("No technician on this RO yet — assign one first."); return; }
  var S = pstOf(ro), L = S && !S.none ? S.items.filter(function(x){ return x.st === "Staged" || x.st === "Received"; }) : [], bins = {};
  L.forEach(function(x){ if(x.p.bin) bins[x.p.bin] = 1; });
  var b = Object.keys(bins), what = L.length === 1 ? L[0].name : L.length + " parts";
  try{ IB.send({ to: tech, k: "fyi", src: "parts", ro: ro.id, t: "Your parts are ready — " + tgNum(ro), b: what + (b.length ? " in bin " + b.join(", ") : "") + ". Come get them when you’re ready." }); }catch(e){}
  pushUndo("tell the tech");
  ro.pstTold = { at: nowIso(), to: tech };
  scheduleSave(true);
  pushToast("Told " + String(tech).split(" ")[0] + " — " + what + (b.length ? " in bin " + b.join(", ") : "") + ".");
  PG.keepScroll(render);
}
function pstTellBtn(ro){
  var t = ro.pstTold, tx = t && t.at && new Date(t.at).toDateString() === new Date().toDateString() ? "Told " + String(t.to || "").split(" ")[0] + " · " + fmtTime(t.at) : "";
  return '<button type="button" class="btn btn-sm pst-go" data-pst-act="tell" data-pst-r="' + pstE(ro.id) + '"' + (tx ? ' title="Tell again"' : "") + ">" + (tx ? pstIc("check") + pstE(tx) : "Tell the tech") + "</button>";
}
/* the Foreman's step actions: ask Parts while it isn't in hand, tell the tech once it's in */
function fmPstAct(ro, S){
  if(S.lst === "Not Ordered" || S.lst === "Ordered" || S.lst === "Backordered") return '<button type="button" class="btn btn-sm pst-go" data-action="fm-pop" data-p="xfer" data-ro="' + pstE(ro.id) + '">' + (S.lst === "Backordered" ? "Chase with Parts…" : S.lst === "Not Ordered" ? "Ask Parts…" : "Ask Parts…") + "</button>";
  if(S.lst === "Received" || S.lst === "Staged") return pstTellBtn(ro);
  return "";
}
document.addEventListener("click", function(e){
  var t = e.target && e.target.closest ? e.target : null; if(!t) return;
  var a = t.closest("[data-pst-act]");
  if(a){ e.preventDefault(); e.stopPropagation(); if(a.getAttribute("data-pst-act") === "tell") pstTell(a.getAttribute("data-pst-r")); return; }
  var s = t.closest("[data-pst-step],[data-pst-clr]"); if(!s) return;
  var box = s.closest("[data-pst-ro]"); if(!box) return;
  e.preventDefault(); e.stopPropagation();
  var ro = box.getAttribute("data-pst-ro"), pg = box.getAttribute("data-pst-pg");
  if(s.hasAttribute("data-pst-clr")){ UI.pstF = null; PG.keepScroll(render); return; }
  var i = +s.getAttribute("data-pst-step"), S = pstOf(getRO(ro));
  if(!S || S.none) return;
  if(!S.at[i].length && pstFilt(ro, pg) !== i){ pushToast("No parts at " + PST_L[i][1].toLowerCase() + " on this RO."); return; }
  UI.pstF = pstFilt(ro, pg) === i ? null : { ro: ro, pg: pg, i: i };
  PG.keepScroll(render);
}, true);
