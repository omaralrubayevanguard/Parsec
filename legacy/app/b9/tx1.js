/* ============================== Parsec 12.5 — move a person's time to someone else ==============================
   For the days you pick, one person's day clock (clock in / out), their operation punches (with the notes and the
   reasons on them) and, if you ask, the ROs they worked those days go to another person. A preview says what
   moves and what stays and why: a running clock stays (stop it first), approved and locked days stay, a punch that
   overlaps the other person's own punch stays (nobody works two jobs at once), a day clock that overlaps theirs is
   joined into one. One Undo takes it all back; the Activity log keeps a line. Leads and the admin only. */
var TX_IC = (function(){ var sv = function(d, w){ return '<svg class="tx-i" width="' + (w || 14) + '" height="' + (w || 14) + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + d + '</svg>'; };
  return { swap: sv('<path d="M7 7h11l-3-3M17 17H6l3 3"/>', 16), ok: sv('<path d="M5.5 12.5l4 4 9-9.5"/>', 13), no: sv('<circle cx="12" cy="12" r="8.5"/><path d="M8.5 15.5l7-7"/>', 13), info: sv('<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5M12 8h.01"/>', 13) }; })();
var TX_WHY = ["Clocked in under the wrong name", "Covering for someone", "Fixing a mistake"];
function txCan(){ if(typeof can === 'function') return can('t.move'); try{ var m = PG.me(); return !!(m.admin || m.lead); }catch(e){ return true; } }   /* Parsec 13: the permission */
function txFirst(n){ return String(n || "").trim().split(/\s+/)[0] || "—"; }
function txPeople(){
  var L = [], add = function(n){ n = String(n || "").trim(); if(n && !L.some(function(x){ return techSame(x, n); })) L.push(n); };
  try{ rtTechs().forEach(add); }catch(e){}
  staffList().forEach(function(sf){ if(sf && sf.name) add(sf.name); });
  STATE.punches.forEach(function(p){ if(p.by) add(p.by); });
  return L;
}
function txDays(d0, d1){
  if(!d0) d0 = todayStr(); if(!d1 || d1 < d0) d1 = d0;
  var L = [], d = new Date(d0 + "T12:00:00"), n = 0;
  while(n < 93){ var k = todayStr(d); if(k > d1) break; L.push(k); d.setDate(d.getDate() + 1); n++; }
  return L;
}
function txDayLbl(k){ var d = new Date(k + "T12:00:00"); return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][d.getDay()] + " " + (d.getMonth() + 1) + "/" + d.getDate(); }
function txT(iso){ return iso ? fmtTime(iso) : "now"; }
function txH(ms){ var m = Math.round(Math.max(0, ms) / 60000); return Math.floor(m / 60) + ":" + String(m % 60).padStart(2, "0"); }
function txMs(a, b){ return Math.max(0, (b ? new Date(b) : new Date()) - new Date(a)); }
/* whose day clock: the name on it, or (older clocks) whoever punched during it — as the Time Log reads it */
function txShOwners(s){
  if(s.by) return [s.by];
  var a = new Date(s.in).getTime() - 60000, b = s.out ? new Date(s.out).getTime() : Date.now(), W = [];
  STATE.punches.forEach(function(p){ var x = new Date(p.start).getTime(); if(x >= a && x <= b){ var w = punchWho(p); if(w && !W.some(function(y){ return techSame(y, w); })) W.push(w); } });
  return W.length ? W : STATE.techName ? [STATE.techName] : [];
}
function txOwns(s, t){ return txShOwners(s).some(function(n){ return techSame(n, t); }); }
function txLocked(t, k){ try{ return !!(typeof TL !== "undefined" && TL.isLocked && TL.isLocked(t, k)); }catch(e){ return false; } }
function txOver(a0, a1, b0, b1){ var A0 = new Date(a0).getTime(), A1 = a1 ? new Date(a1).getTime() : Date.now(), B0 = new Date(b0).getTime(), B1 = b1 ? new Date(b1).getTime() : Date.now(); return A0 < B1 && B0 < A1; }
/* what would move: { ps: [{p, k, st:'move'|'stay', why}], sh: [{s, k, st:'move'|'join'|'stay', why, with}], ros: [ro], ... } */
function txPlan(M){
  var days = txDays(M.d0, M.d1), inDay = {}; days.forEach(function(k){ inDay[k] = 1; });
  var R = { days: days, ps: [], sh: [], ros: [], roStay: [], ok: !!(M.from && M.to && !techSame(M.from, M.to)) };
  if(!R.ok) return R;
  var to1 = txFirst(M.to);
  var mineP = STATE.punches.filter(function(p){ return techSame(punchWho(p), M.to); });
  if(M.ps !== false) STATE.punches.forEach(function(p){
    var k = localDay(p.start); if(!inDay[k] || !techSame(punchWho(p), M.from)) return;
    var st = "move", why = "";
    if(!p.stop){ st = "stay"; why = "the clock is running — stop it first"; }
    else if(txLocked(M.from, k) || txLocked(M.to, k)){ st = "stay"; why = "approved and locked — reopen the timesheet first"; }
    else { var hit = mineP.filter(function(q){ return txOver(p.start, p.stop, q.start, q.stop); })[0]; if(hit){ st = "stay"; why = "overlaps " + to1 + "’s own punch " + txT(hit.start) + "–" + txT(hit.stop); } }
    R.ps.push({ p: p, k: k, st: st, why: why });
  });
  R.ps.sort(function(a, b){ return new Date(a.p.start) - new Date(b.p.start); });
  if(M.sh !== false){
    var mineS = shiftList().filter(function(s){ return txOwns(s, M.to) && !txOwns(s, M.from); });
    shiftList().forEach(function(s){
      var k = localDay(s.in); if(!inDay[k] || !txOwns(s, M.from)) return;
      var st = "move", why = "", w = [];
      if(txOwns(s, M.to)){ st = "stay"; why = "it’s " + to1 + "’s day clock too"; }
      else if(!s.out){ st = "stay"; why = "the day clock is running — clock out first"; }
      else if(txLocked(M.from, k) || txLocked(M.to, k)){ st = "stay"; why = "approved and locked — reopen the timesheet first"; }
      else { w = mineS.filter(function(q){ return q.out && txOver(s.in, s.out, q.in, q.out); }); var open = mineS.filter(function(q){ return !q.out && txOver(s.in, s.out, q.in, q.out); })[0];
        if(open){ st = "stay"; why = "overlaps " + to1 + "’s running day clock"; w = []; } else if(w.length){ st = "join"; why = "joined with " + to1 + "’s " + w.map(function(q){ return txT(q.in) + "–" + txT(q.out); }).join(", "); } }
      R.sh.push({ s: s, k: k, st: st, why: why, w: w });
    });
    R.sh.sort(function(a, b){ return new Date(a.s.in) - new Date(b.s.in); });
  }
  var seen = {};
  R.ps.forEach(function(x){ if(x.st !== "move" || seen[x.p.roId] || isShopPunch(x.p)) return; seen[x.p.roId] = 1; var ro = getRO(x.p.roId); if(!ro) return;
    if(M.ro && techSame(ro.assignedTech, M.from) && !ro.dateClosed) R.ros.push(ro); else R.roStay.push(ro); });
  R.nP = R.ps.filter(function(x){ return x.st === "move"; }).length;
  R.nS = R.sh.filter(function(x){ return x.st !== "stay"; }).length;
  R.msP = R.ps.reduce(function(a, x){ return a + (x.st === "move" ? txMs(x.p.start, x.p.stop) : 0); }, 0);
  R.msS = R.sh.reduce(function(a, x){ return a + (x.st !== "stay" ? txMs(x.s.in, x.s.out) : 0); }, 0);
  R.nRo = Object.keys(seen).length;
  R.stay = R.ps.filter(function(x){ return x.st === "stay"; }).length + R.sh.filter(function(x){ return x.st === "stay"; }).length;
  return R;
}
function txRange(M){ var D = txDays(M.d0, M.d1); return D.length === 1 ? txDayLbl(D[0]) : txDayLbl(D[0]) + " – " + txDayLbl(D[D.length - 1]); }
function txApply(M){
  var R = txPlan(M); if(!R.ok || !(R.nP + R.nS + R.ros.length)) return null;
  if(!txCan()){ if(typeof permDeny === "function") permDeny("t.move"); return null; }   /* Parsec 13 */
  pushUndo("move time");
  var now = nowIso(), why = M.why === "Other" ? (String(M.other || "").trim() || "Other") : M.why || TX_WHY[0];
  /* the day clocks that say whose they are only by who punched in them get their owner written down first, so moving the punches can't drag them along */
  var days = {}; R.days.forEach(function(k){ days[k] = 1; });
  shiftList().forEach(function(s){ if(!s.by && days[localDay(s.in)]){ var o = txShOwners(s); if(o.length === 1) s.by = o[0]; } });
  R.ps.forEach(function(x){ if(x.st !== "move") return; var p = x.p; p.movedFrom = punchWho(p); p.by = M.to; p.movedAt = now; p.movedWhy = why; });
  R.sh.forEach(function(x){
    var s = x.s; if(x.st === "stay") return;
    if(x.st === "move"){ s.movedFrom = M.from; s.by = M.to; s.movedAt = now; return; }
    var all = [s].concat(x.w), a = Math.min.apply(null, all.map(function(q){ return new Date(q.in).getTime(); })), last = all.slice().sort(function(p, q){ return new Date(q.out) - new Date(p.out); })[0];
    var keep = x.w[0]; keep.in = new Date(a).toISOString(); keep.out = last.out; keep.outReason = last.outReason || keep.outReason || null; keep.by = M.to; keep.joinedFrom = M.from; keep.movedAt = now;
    var gone = [s].concat(x.w.slice(1)); STATE.shifts = shiftList().filter(function(q){ return gone.indexOf(q) < 0; });
  });
  R.ros.forEach(function(ro){ ro.assignedTech = M.to; });
  var rng = txRange(M), what = [R.nS ? R.nS + " day clock" + (R.nS === 1 ? "" : "s") : "", R.nP ? R.nP + " punch" + (R.nP === 1 ? "" : "es") + " (" + txH(R.msP) + " h)" : "", R.ros.length ? R.ros.length + " RO" + (R.ros.length === 1 ? "" : "s") : ""].filter(Boolean).join(", ");
  try{
    audit("time", "Moved " + M.from + "’s time on " + rng + " to " + M.to + " — " + what + ". Why: " + why, null);
    var per = {}; R.ps.forEach(function(x){ if(x.st === "move" && !isShopPunch(x.p)) per[x.p.roId] = (per[x.p.roId] || 0) + txMs(x.p.start, x.p.stop); });
    Object.keys(per).forEach(function(id){ var ro = getRO(id); if(ro) audit("time", txH(per[id]) + " h of " + M.from + "’s time moved to " + M.to + (R.ros.indexOf(ro) > -1 ? " — the RO is " + txFirst(M.to) + "’s now" : "") + ". Why: " + why, ro); });
  }catch(e){}
  try{ if(typeof TL !== "undefined" && TL.flush) TL.flush(); }catch(e){}
  UI.modal = null;
  scheduleSave(true);
  pushToast("Moved " + txFirst(M.from) + "’s time (" + rng + ") to " + M.to + " — " + what + ".", true);
  return R;
}
/* ---------- the dialog ---------- */
function txOpen(from, day){
  if(!txCan()){ if(typeof permDeny === "function") permDeny("t.move"); else pushToast("Moving time is for the foreman, the manager or the admin."); return; }
  var P = txPeople(), f = from || P[0] || "", to = P.filter(function(n){ return !techSame(n, f); })[0] || "", d = day || todayStr();
  UI.modal = { type: "tx-move", from: f, to: to, d0: d, d1: d, sh: true, ps: true, ro: false, why: TX_WHY[0], other: "" };
  render();
}
function txModal(m){
  var P = txPeople(), R = txPlan(m), to1 = txFirst(m.to), fr1 = txFirst(m.from);
  var opts = function(cur, skip){ return P.filter(function(n){ return !skip || !techSame(n, skip); }).map(function(n){ var sf = staffForTech(n); return '<option value="' + esc(n) + '"' + (techSame(n, cur) ? ' selected' : '') + '>' + esc(n) + (sf && sf.role && sf.role !== "Technician" ? ' · ' + esc(sf.role) : '') + '</option>'; }).join(''); };
  var td = todayStr(), yd = (function(){ var d = new Date(); d.setDate(d.getDate() - 1); return todayStr(d); })(), ws = (function(){ var d = new Date(); var k = (d.getDay() + 6) % 7; d.setDate(d.getDate() - k); return todayStr(d); })();
  var q = function(v, t, on){ return '<button class="tx-qb' + (on ? ' on' : '') + '" data-action="tx-day" data-v="' + v + '">' + t + '</button>'; };
  var ck = function(k, b, sm){ return '<label class="tx-ck"><input type="checkbox" data-tx-in="' + k + '"' + (m[k] ? ' checked' : '') + '><span><b>' + b + '</b><small>' + sm + '</small></span></label>'; };
  var body = '<div class="tx">'
    + '<div class="tx-who"><label class="tx-f"><span>From</span><select data-tx-in="from">' + opts(m.from) + '</select></label>'
    + '<button class="tx-sw" data-action="tx-swap" title="Swap the two" aria-label="Swap the two">' + TX_IC.swap + '</button>'
    + '<label class="tx-f"><span>To</span><select data-tx-in="to">' + (m.to ? '' : '<option value="">Pick someone</option>') + opts(m.to, m.from) + '</select></label></div>'
    + '<div class="tx-days"><label class="tx-f"><span>Days</span><span class="tx-dr"><input type="date" data-tx-in="d0" value="' + esc(m.d0) + '" aria-label="First day"><i>–</i><input type="date" data-tx-in="d1" value="' + esc(m.d1) + '" aria-label="Last day"></span></label>'
    + '<div class="tx-q">' + q("today", "Today", m.d0 === td && m.d1 === td) + q("yday", "Yesterday", m.d0 === yd && m.d1 === yd) + q("week", "This week", m.d0 === ws && m.d1 === td) + '</div></div>'
    + '<div class="tx-what">' + ck("sh", "Day clock", "clocked in and out") + ck("ps", "Operation time", "every punch, with its notes and reasons") + ck("ro", "Hand over their ROs too", "the open ROs " + esc(fr1) + " worked those days become " + esc(to1) + "’s") + '</div>';
  if(!R.ok) body += '<div class="tx-sum none">' + (m.to ? 'Pick two different people.' : 'Pick who gets the time.') + '</div>';
  else {
    var n = R.nP + R.nS;
    body += '<div class="tx-sum' + (n ? '' : ' none') + '">' + (n ? 'Moves <b>' + [R.nS ? R.nS + ' day clock' + (R.nS === 1 ? '' : 's') + ' (' + txH(R.msS) + ')' : '', R.nP ? R.nP + ' punch' + (R.nP === 1 ? '' : 'es') + ' (' + txH(R.msP) + ' h' + (R.nRo ? ' on ' + R.nRo + ' RO' + (R.nRo === 1 ? '' : 's') : '') + ')' : ''].filter(Boolean).join('</b> and <b>') + '</b> from ' + esc(fr1) + ' to ' + esc(to1) + (R.ros.length ? ', and hands over <b>' + R.ros.length + ' RO' + (R.ros.length === 1 ? '' : 's') + '</b>' : '') + '.' + (R.stay ? ' <span class="st">' + R.stay + ' stay' + (R.stay === 1 ? 's' : '') + ' — see why below.</span>' : '')
      : (R.ps.length + R.sh.length ? 'Nothing can move — see why below.' : 'No time for ' + esc(fr1) + ' on ' + esc(txRange(m)) + '.')) + '</div>';
    var rows = [];
    R.sh.forEach(function(x){ rows.push({ at: new Date(x.s.in).getTime(), h: '<div class="tx-r ' + x.st + '"><span class="d">' + txDayLbl(x.k) + '</span><span class="t mono">' + txT(x.s.in) + '–' + txT(x.s.out) + '</span><span class="w"><b>Day clock</b>' + (x.s.outReason ? '<small>out: ' + esc(x.s.outReason) + '</small>' : '') + '</span><span class="h mono">' + txH(txMs(x.s.in, x.s.out)) + '</span><span class="s">' + (x.st === "move" ? TX_IC.ok + 'moves' : x.st === "join" ? TX_IC.ok + esc(x.why) : TX_IC.no + esc(x.why)) + '</span></div>' }); });
    R.ps.forEach(function(x){ var p = x.p, ro = getRO(p.roId), op = ro ? (ro.operations || []).filter(function(o){ return o.id === p.opId; })[0] : null, shp = isShopPunch(p);
      rows.push({ at: new Date(p.start).getTime(), h: '<div class="tx-r ' + x.st + '"><span class="d">' + txDayLbl(x.k) + '</span><span class="t mono">' + txT(p.start) + '–' + txT(p.stop) + '</span><span class="w"><b>' + (shp ? 'Shop time' : esc(ro ? tgNum(ro) : 'RO')) + '</b><small>' + esc(shp ? (op ? op.complaint : '') : (op ? op.complaint || 'Operation' : '')) + (p.startReason ? ' · ' + esc(p.startReason) : '') + (noteEntries(p.notes).length ? ' · ' + noteEntries(p.notes).length + ' note' + (noteEntries(p.notes).length === 1 ? '' : 's') : '') + '</small></span><span class="h mono">' + txH(txMs(p.start, p.stop)) + '</span><span class="s">' + (x.st === "move" ? TX_IC.ok + 'moves' : TX_IC.no + esc(x.why)) + '</span></div>' }); });
    rows.sort(function(a, b){ return a.at - b.at; });
    if(rows.length) body += '<div class="tx-list">' + rows.map(function(r){ return r.h; }).join('') + '</div>';
    if(m.ro && R.roStay.length) body += '<div class="tx-nt">' + TX_IC.info + '<span>' + R.roStay.map(function(ro){ return esc(tgNum(ro)); }).join(', ') + ' stay' + (R.roStay.length === 1 ? 's' : '') + ' with ' + (R.roStay.length === 1 ? 'its' : 'their') + ' tech — ' + (R.roStay.length === 1 ? 'it isn’t' : 'they aren’t') + ' ' + esc(fr1) + '’s, or ' + (R.roStay.length === 1 ? 'it’s' : 'they’re') + ' closed.</span></div>';
    body += '<div class="tx-nt">' + TX_IC.info + '<span>A punch that overlaps ' + esc(to1) + '’s own punch stays — nobody works two jobs at once. A day clock that overlaps ' + esc(to1) + '’s is joined into one. Running clocks and approved, locked days stay. One Undo takes it all back.</span></div>';
  }
  body += '<div class="tx-why"><span class="tx-lb">Why</span><div class="tx-chips">' + TX_WHY.concat(["Other"]).map(function(w){ return '<button class="tx-chip' + (m.why === w ? ' on' : '') + '" data-action="tx-why" data-v="' + esc(w) + '">' + esc(w) + '</button>'; }).join('') + '</div>'
    + (m.why === "Other" ? '<input class="tx-oth" data-tx-in="other" value="' + esc(m.other || "") + '" placeholder="Say why — it goes in the Activity log">' : '') + '</div></div>';
  var go = R.ok && (R.nP + R.nS + R.ros.length) > 0;
  var foot = '<button class="btn" data-action="close-modal">Cancel</button><button class="btn btn-primary" data-action="tx-go"' + (go ? '' : ' disabled') + '>Move to ' + esc(to1) + '</button>';
  return { title: "Move time to someone else", body: body, foot: foot };
}
function txAct(a, t){
  var m = UI.modal;
  if(a === "tx-open"){ txOpen(t.dataset.from || "", t.dataset.day || ""); return true; }
  if(!m || m.type !== "tx-move") return false;
  if(a === "tx-day"){ var d = new Date(); if(t.dataset.v === "today"){ m.d0 = m.d1 = todayStr(); } else if(t.dataset.v === "yday"){ d.setDate(d.getDate() - 1); m.d0 = m.d1 = todayStr(d); } else { var k = (d.getDay() + 6) % 7; m.d1 = todayStr(); d.setDate(d.getDate() - k); m.d0 = todayStr(d); } render(); return true; }
  if(a === "tx-swap"){ var x = m.from; m.from = m.to || m.from; m.to = x; render(); return true; }
  if(a === "tx-why"){ m.why = t.dataset.v; render(); if(m.why === "Other"){ var o = document.querySelector(".tx-oth"); if(o) o.focus(); } return true; }
  if(a === "tx-go"){ if(m.why === "Other" && !String(m.other || "").trim()){ var o2 = document.querySelector(".tx-oth"); if(o2) o2.focus(); pushToast("Say why first — it goes in the Activity log."); return true; } txApply(m); return true; }
  return false;
}
document.addEventListener("change", function(e){
  var t = e.target, m = UI.modal; if(!t || !t.dataset || t.dataset.txIn == null || !m || m.type !== "tx-move") return;
  var k = t.dataset.txIn;
  if(t.type === "checkbox") m[k] = !!t.checked; else m[k] = t.value;
  if(k === "from" && techSame(m.from, m.to)) m.to = txPeople().filter(function(n){ return !techSame(n, m.from); })[0] || "";
  if(k === "d0" && (!m.d1 || m.d1 < m.d0)) m.d1 = m.d0;
  if(k === "d1" && m.d1 < m.d0) m.d0 = m.d1;
  if(k !== "other") setTimeout(render, 0);
});
document.addEventListener("input", function(e){ var t = e.target, m = UI.modal; if(t && t.dataset && t.dataset.txIn === "other" && m && m.type === "tx-move") m.other = t.value; });
