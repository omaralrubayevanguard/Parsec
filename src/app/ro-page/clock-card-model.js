/* Parsec · ro-page · clock-card-model.js
   The operation clock card (Parsec 12.4 / 12.5), the model: the numbers each page counts (ockModel), the shop day, similar jobs and the tech's usual pace, parts on the job, the punches' notes (and each note's time, p.noteAt) and splits.
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   ockCalm ockE ockHms ockMs ockHm ockCd ockClk ockIni ockFirst ockIso ockMe ockSame … (41 functions, 22 constants)
   state      punches ros
   uses       access/ automations/ clock/ data/ kit/ library/ pages/ pages/fixes/ pages/foreman/ pages/warranty/ ro/ shell/ state/
   at load    builds OCK_VIEW (a closure)
*/
/* ============================== Parsec 12.4 / 12.5 — the operation clock card ==============================
   One card on the RO page (inside the RO page's shadow root) and on the Technician page (the main page).
   12.4 (round 1 picks): the ring around Start / Stop, rolling digits, the bar made of the punches in the Time tab's colors,
   over quoted, time left (tap the time), when quoted runs out, the card breathes, hold to stop, who's on the clock, milestones.
   12.5 (round 2 picks): lap marks, focus mode, similar jobs, your usual pace, fix the start, note nudge, parts on this job,
   next up, done badge, lunch and end of day ahead (the clock pauses itself at lunch, starts again after, stops at the end of the day).
   Motion follows the computer's "reduce motion" setting.
   The card is markup (ockHtml) both pages put in; one ticker moves every card in place once a second; the pages hand over
   their own start / stop / reason / quoted edits (OCK_CB.jc, OCK_CB.tc); small edits the card makes itself (a split, a note,
   the start moved back) go through ockCommit. The main page is redrawn by morphing, so the markup always carries the state
   of "now" — a redraw changes nothing the ticker set. What runs once (the check drawing itself, a milestone, the over chip,
   a new person, the done badge) only plays when it just happened. */
var OCK_ST = {}, OCK_CB = {}, OCK_ROOTS = [document], OCK_RAF = 0, OCK_HOLD = 700, OCK_FRESH = 900, OCK_LABMS = 6000;
var OCK_RC = 2 * Math.PI * 23, OCK_INF = { "ock-breathe": 1, "ock-edge": 1, "ock-stripes": 1, "ock-blink": 1, "ock-live": 1, "ock-shim": 1 };
var OCK_PLAY = "M8 5.5 L19 12 L19 12 L8 18.5 Z", OCK_STOP = "M6.5 6.5 L17.5 6.5 L17.5 17.5 L6.5 17.5 Z";
var OCK_MODE = { run: "st-run", wait: "st-wait", done: "st-done", idle: "st-idle", lock: "st-lock" };
var OCK_MS = [[0.5, "Halfway"], [0.75, "Last quarter"], [1, "At quoted"]];
var OCK_VIEW = (function(){ try{ return localStorage.getItem("parsec.ockView") === "left" ? "left" : "el"; }catch(e){ return "el"; } })();
var OCK_RM = null, OCK_FX = null, OCK_SIM = {}, OCK_UP = {}, OCK_LAST = 0, OCK_NUDGE = 45 * 60;
function ockCalm(){ try{ OCK_RM = OCK_RM || window.matchMedia("(prefers-reduced-motion: reduce)"); return !!OCK_RM.matches; }catch(e){ return false; } }
function ockE(s){ return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){ return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
function ockHms(s){ s = Math.max(0, Math.floor(s)); return Math.floor(s / 3600) + ":" + String(Math.floor(s / 60) % 60).padStart(2, "0") + ":" + String(s % 60).padStart(2, "0"); }
function ockMs(s){ s = Math.max(0, Math.floor(s)); return s >= 3600 ? ockHms(s) : Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0"); }
function ockHm(s){ s = Math.max(0, Math.floor(s / 60)); return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0"); }
function ockCd(ms){ var s = ms / 1000; return s >= 60 ? ockHm(s) : Math.max(1, Math.ceil(s)) + " s"; }
function ockClk(t){ try{ if(typeof PG !== "undefined" && PG.clk) return PG.clk(t); }catch(e){} var d = new Date(t), h = d.getHours(); return (h % 12 || 12) + ":" + String(d.getMinutes()).padStart(2, "0") + " " + (h >= 12 ? "pm" : "am"); }
function ockIni(n){ return String(n || "?").trim().split(/\s+/).map(function(x){ return x[0] || ""; }).join("").slice(0, 2).toUpperCase() || "?"; }
function ockFirst(n){ return String(n || "").trim().split(/\s+/)[0] || "—"; }
function ockIso(t){ return new Date(t).toISOString(); }
function ockMe(){ try{ return punchByName() || ""; }catch(e){ return ""; } }
function ockSame(a, b){ if(!a || !b) return false; try{ return techSame(a, b); }catch(e){ return String(a).toLowerCase() === String(b).toLowerCase(); } }
/* Parsec 12.7: a punch is yours when you started it — the card breathes for anyone on it, but Stop, the split, the note,
   fixing the start and next up are about your own clock */
function ockMine(p, me){ if(!p) return false; try{ return sameOwner(punchOwner(p), me); }catch(e){ return ockSame(p.by || "", me) || (!p.by && !me); } }
function ockIc(k){
  var P = { clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>', flag: '<path d="M5.5 20.5V4.5"/><path d="M5.5 5h11l-2 4 2 4h-11"/>', check: '<path d="M5.5 12.5l4 4 9-9.5"/>',
    lock: '<rect x="5.5" y="10.5" width="13" height="9.5" rx="2"/><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5"/>', x: '<path d="M6.5 6.5l11 11M17.5 6.5l-11 11"/>', parts: '<path d="M12 3.5l7.5 4.2v8.6L12 20.5l-7.5-4.2V7.7z"/><path d="M4.8 7.9L12 12l7.2-4.1M12 12v8.3"/>',
    expand: '<path d="M14.5 4.5h5v5M9.5 19.5h-5v-5M19.5 4.5l-6 6M4.5 19.5l6-6"/>', shrink: '<path d="M10.5 18.5v-5h-5M13.5 5.5v5h5M10.5 13.5l-6 6M13.5 10.5l6-6"/>',
    gauge: '<path d="M4.5 16.5a8 8 0 1 1 15 0"/><path d="M12 12.5l3.5-3.5"/><circle cx="12" cy="13" r="1.2"/>', similar: '<rect x="3.5" y="9" width="17" height="6" rx="3"/><path d="M12 6v12"/>',
    moon: '<path d="M19 14.5A7.5 7.5 0 1 1 9.5 5a6 6 0 0 0 9.5 9.5z"/>', sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4"/>',
    note: '<path d="M6 3.5h9l3.5 3.5v13.5H6z"/><path d="M14.5 3.5V7.5h4M9 12h6M9 15.5h4"/>', pencil: '<path d="M4.5 19.5l1-4 10-10 3 3-10 10z"/><path d="M13.5 7.5l3 3"/>',
    next: '<path d="M5 12h12M13 7l5 5-5 5"/>', play: '<path d="M8 5.5v13l10.5-6.5z" fill="currentColor"/>', undo: '<path d="M8.5 7.5L4.5 11.5l4 4"/><path d="M4.5 11.5h10a5 5 0 0 1 0 10h-3"/>' };
  return '<svg class="ock-i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (P[k] || "") + '</svg>';
}
function ockRv(r){ try{ return reasonVar(r); }catch(e){ return "var(--o-ink3)"; } }
function ockState(key){ return OCK_ST[key] || (OCK_ST[key] = { init: 0, hit: {}, whoAt: {} }); }
function ockFresh(at, now, ms){ return !!at && now - at < (ms || OCK_FRESH) && !ockCalm(); }
function ockRoot(r){ if(r && OCK_ROOTS.indexOf(r) < 0) OCK_ROOTS.push(r); }
function ockEach(fn){
  OCK_ROOTS = OCK_ROOTS.filter(function(r){ return r === document || (r.host && r.host.isConnected); });
  OCK_ROOTS.forEach(function(r){ Array.prototype.forEach.call(r.querySelectorAll(".ock[data-op]"), fn); });
}
/* ---------- the numbers: hours the way each page counts them ---------- */
function ockModel(op, hr, fixMin){
  var now = Date.now(), ps = (STATE.punches || []).filter(function(p){ return p.opId === op.id; }).sort(function(a, b){ return new Date(a.start) - new Date(b.start); });
  var ms = 0, runMs = 0, runs = [], fx = (fixMin || 0) * 60000, me = ockMe(), mine = null;
  ps.forEach(function(p){ if(!p.stop && !mine && ockMine(p, me)) mine = p; });
  if(!mine) fx = 0;
  ps.forEach(function(p){ var a = +new Date(p.start) - (p === mine ? fx : 0), b = p.stop ? +new Date(p.stop) : now; ms += Math.max(0, b - a); if(!p.stop){ runs.push(p); runMs += Math.max(0, now - a); } });
  var h;
  if(hr === "tc") h = typeof op.burnt === "number" ? Math.max(0, op.burnt + runMs / 3600000) : ms / 3600000;    /* opCalc's rule (the Technician page) */
  else if(typeof op.burntAdj === "number") h = Math.max(0, op.burntAdj + ms / 3600000);                       /* the RO page's rule */
  else h = Math.max(parseFloat(op.burnt) || 0, ms / 3600000);
  var q = parseFloat(op.quoted) || 0;
  return { op: op, ps: ps, ms: ms, runs: runs, run: runs.length > 0, mine: mine, h: h, q: q, over: q > 0 && h > q + 1e-6, now: now, fx: fx };
}
function ockStName(op){ try{ var s = opStatus(op); return typeof s === "string" ? s : (s && s.status) || ""; }catch(e){ return ""; } }
/* ---------- the shop's day (the Foreman's shop settings: in, lunch, out), weekdays ---------- */
function ockDay(now){
  var d = new Date(now), wd = d.getDay(); if(wd === 0 || wd === 6) return null;
  var c = {}; try{ c = fmCfg() || {}; }catch(e){}
  var a = c.start >= 0 ? c.start : 7, z = c.end > 0 ? c.end : 16, lu = Array.isArray(c.lunch) && c.lunch.length === 2 ? c.lunch : [11.5, 12.5];
  d.setHours(0, 0, 0, 0); var t = function(h){ return d.getTime() + h * 3600000; };
  return { a: t(a), z: t(z), la: t(lu[0]), lz: t(lu[1]) };
}
/* when the remaining hours would run out, counting the lunch the clock sits out and the end of the day */
function ockEndAt(now, remS, run){
  var d = ockDay(now), t = now + remS * 1000;
  if(d && run && now < d.la && t > d.la) t += d.lz - d.la;
  if(d && t > d.z){
    var over = t - d.z, n = new Date(now); n.setHours(0, 0, 0, 0); var k = 0;
    do{ n.setDate(n.getDate() + 1); k++; }while(n.getDay() === 0 || n.getDay() === 6);
    var nd = ockDay(n.getTime()) || { a: n.getTime() + 7 * 3600000, la: 0, lz: 0 }, t2 = nd.a + over;
    if(nd.la && t2 > nd.la) t2 += nd.lz - nd.la;
    return ockClk(Math.round(t2 / 300000) * 300000) + " " + (k === 1 ? "tomorrow" : n.toLocaleDateString(undefined, { weekday: "short" }));
  }
  return ockClk(Math.round(t / 300000) * 300000);
}
/* ---------- similar jobs (the Fixes list: the same complaint, finished) and the tech's usual pace ---------- */
/* similar jobs (17.2): the same fault codes and function group when the operation has codes, the same complaint words when it doesn't;
   the shop's, or only one person's (the card's Mine switch, OCK_SIMW). Under 3 jobs there is no range — the card says why. */
var OCK_SIMW = {};
function ockSimMatch(op){
  var codes = {}, fg = "", key = "", J = [];
  try{ opFaultCodes(op).forEach(function(c){ codes[c] = 1; }); }catch(e){}
  try{ fg = libOpFgrp(op); }catch(e){}
  try{ key = fixKeyOf(op.complaint); }catch(e){}
  var hasC = Object.keys(codes).length > 0;
  try{ fixAll().forEach(function(x){
    if(x.manual || x.opId === op.id || !(x.hours > 0.05)) return;
    var hit = false;
    if(hasC){
      hit = (x.codes || []).some(function(c){ return codes[c]; });
      if(hit && fg){ var g2 = ""; try{ g2 = libOpFgrp(getOp(x.roId, x.opId)); }catch(e){} if(g2 && g2 !== fg) hit = false; }
    } else hit = !!key && fixKeyOf(x.complaint) === key;
    if(hit) J.push({ roId: x.roId, opId: x.opId, ro: x.ro, tech: x.tech || "", h: x.hours, date: x.date || "" });
  }); }catch(e){}
  return { J: J, by: hasC ? "codes" : "words" };
}
function ockSim(op, who){
  var w = who === undefined ? (OCK_SIMW[op.id] || "") : who, ck = op.id + "|" + w, c = OCK_SIM[ck], now = Date.now(); if(c && now - c.at < 60000) return c.v;
  var M = ockSimMatch(op), J = w ? M.J.filter(function(x){ return String(x.tech).split(/,\s*/).some(function(t){ return ockSame(t, w); }); }) : M.J, v = null;
  var hrs = J.map(function(x){ return x.h; }).sort(function(a, b){ return a - b; });
  if(hrs.length >= 3){ var qn = function(p){ var i = (hrs.length - 1) * p, lo = Math.floor(i), hi = Math.ceil(i); return hrs[lo] + (hrs[hi] - hrs[lo]) * (i - lo); }; v = { lo: qn(0.25), hi: qn(0.75), md: qn(0.5), n: hrs.length, J: J, by: M.by, who: w }; }
  OCK_SIM[ck] = { at: now, v: v, few: hrs.length, J: J, by: M.by }; return v;
}
function ockSimInfo(op){ ockSim(op); return OCK_SIM[op.id + "|" + (OCK_SIMW[op.id] || "")] || { few: 0, J: [] }; }
function ockTech(m, ro){ var p = m.mine || m.runs[0] || m.ps[m.ps.length - 1]; return (p && p.by) || (ro && ro.assignedTech) || ""; }
function ockUsual(tech){
  if(!tech) return null; var c = OCK_UP[tech], now = Date.now(); if(c && now - c.at < 120000) return c.v;
  var q = 0, h = 0, n = 0, cut = now - 60 * 86400000;
  try{
    var by = {}; STATE.punches.forEach(function(p){ if(!p.stop) return; var o = by[p.opId] || (by[p.opId] = { n: 0, me: 0, last: 0 }); o.n++; if(ockSame(p.by || "", tech)) o.me++; o.last = Math.max(o.last, +new Date(p.stop)); });
    STATE.ros.forEach(function(ro){ (ro.operations || []).forEach(function(op){
      var o = by[op.id], qq = parseFloat(op.quoted) || 0, hh = +op.burnt || 0;
      if(!o || o.me * 2 < o.n || o.last < cut || qq <= 0 || hh < 0.05 || op.declined) return;
      var done = false; try{ done = opDoneNow(op); }catch(e){ done = /^Complete/.test(ockStName(op)); }
      if(!done) return; q += qq; h += hh; n++;
    }); });
  }catch(e){}
  var v = n >= 3 && h > 0 ? { eff: q / h, n: n } : null;
  OCK_UP[tech] = { at: now, v: v }; return v;
}
/* ---------- parts on this job ---------- */
function ockParts(op){
  var L = []; try{ L = opRealParts(op); }catch(e){ L = op.parts || []; }
  return L.map(function(p){ var inh = false; try{ inh = pxPartIn(p); }catch(e){} return { n: p.description || p.partNumber || "Part", inh: inh, eta: p.eta || "", st: p.status || "Not Ordered" }; });
}
function ockEta(e){
  var t = new Date(String(e).length <= 10 ? e + "T12:00:00" : e); if(isNaN(t)) return String(e);
  var d0 = new Date(); d0.setHours(0, 0, 0, 0); var dd = Math.round((new Date(t.getFullYear(), t.getMonth(), t.getDate()) - d0) / 86400000);
  return dd === 0 ? "today" : dd === 1 ? "tomorrow" : dd > 1 && dd < 7 ? t.toLocaleDateString(undefined, { weekday: "short" }) : t.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
/* ---------- the running punch's notes and splits ---------- */
var OCK_SYS_NOTE = /^(Split \d+ · |Start moved back )/;
function ockNotes(p){
  var E = []; try{ E = noteEntries(p.notes); }catch(e){}
  var st = +new Date(p.start);
  return E.map(function(e){ var mm = /^(\d+):(\d{2})$/.exec(e.ran || ""), tx = String(e.text || "").trim(), sv = ockNoteAt(p, tx);   /* 17.2: a time set by hand wins over the stamp */
    return { at: sv != null ? sv : mm ? st + (+mm[1] * 60 + +mm[2]) * 60000 : st, text: tx, known: !!mm || sv != null }; }).filter(function(x){ return x.text; });
}
function ockLastNote(p){ var L = ockNotes(p).filter(function(x){ return !OCK_SYS_NOTE.test(x.text); }); return L[L.length - 1] || null; }
/* ---------- a note's time (Parsec 17.1): kept beside the note, so its pin sits where it happened on the time bar ----------
   p.noteAt = { "<the note, as saved>": ISO time }. The note's words stay exactly as typed (16.1); the time only places the pin.
   Older notes have none: a stamped one ([10:05 · 0:26]) goes by its stamp, the rest sit at the end of their punch. */
function ockNoteAt(p, text){ var m = p && p.noteAt, v = m && typeof m === "object" ? m[String(text || "").trim()] : null, t = v ? +new Date(v) : NaN; return isNaN(t) ? null : t; }
function ockNoteTime(p, text, at){
  var k = String(text || "").trim(); if(!p || !k) return;
  var a = +new Date(p.start), b = p.stop ? +new Date(p.stop) : Date.now(), t = at == null ? Date.now() : +at;
  if(isNaN(t)) return; if(!isNaN(a)) t = Math.max(a, t); if(!isNaN(b)) t = Math.min(b, t);
  if(!p.noteAt || typeof p.noteAt !== "object") p.noteAt = {};
  p.noteAt[k] = new Date(t).toISOString();
}
function ockSplits(p){ return Array.isArray(p.splits) ? p.splits.map(function(x){ return +new Date(x); }).filter(function(x){ return !isNaN(x); }) : []; }
/* 17.2: a note changed or taken off from its flag — the words where they were written, and its time beside it */
function ockNoteEdit(p, old, neu, at){
  var o = String(old || "").trim(), n = String(neu || "").trim(); if(!p || !o) return false;
  var L = String(p.notes || "").split("\n"), k = -1;
  for(var i = L.length - 1; i >= 0; i--){ if(L[i].trim() === o || L[i].trim().slice(-o.length) === o){ k = i; break; } }
  if(k < 0) return false;
  var m = p.noteAt && typeof p.noteAt === "object" ? p.noteAt : null, was = m ? m[o] : null;
  if(!n){ L.splice(k, 1); if(m) delete m[o]; }
  else { try{ n = autoPunct(n); }catch(e){} var ln = L[k], ix = ln.lastIndexOf(o); L[k] = ln.slice(0, ix) + n + ln.slice(ix + o.length); if(m && n !== o){ delete m[o]; if(was) m[n] = was; } }
  p.notes = L.join("\n");
  if(n && at != null) ockNoteTime(p, n, at);
  return true;
}
function ockAddNote(p, text, at){
  var t = String(text || "").trim(); if(!t) return;
  try{ t = autoPunct(t); }catch(e){}
  p.notes = (String(p.notes || "").trim() ? String(p.notes).replace(/\s+$/, "") + "\n" : "") + t;
  ockNoteTime(p, t, at);   /* now, or the moment picked on the time bar */
}
/* small edits the card makes itself: one undo step, saved, both pages redrawn */
function ockCommit(label, fn){
  try{ pushUndo(label); }catch(e){}
  fn();
  try{ scheduleSave(true); }catch(e){}
  try{ if(typeof PG !== "undefined" && PG.keepScroll) PG.keepScroll(render); else render(); }catch(e){}
  try{ if(typeof JC !== "undefined" && JC && JC.rerender) JC.rerender(); }catch(e){}
}
function ockToast(t, undo){ try{ pushToast(t, !!undo); }catch(e){} }
/* the operation to go to next: the page's own order (the Technician page: the foreman's), else the next open one on this RO */
function ockNext(roId, opId, pg){
  var cb = OCK_CB[pg]; if(cb && cb.next){ try{ return cb.next(roId, opId); }catch(e){ return null; } }
  var ro = null; try{ ro = getRO(roId); }catch(e){} if(!ro) return null;
  var L = ro.operations || [], i = 0; L.forEach(function(o, k){ if(o.id === opId) i = k; });
  for(var k = 1; k < L.length; k++){
    var j = (i + k) % L.length, o = L[j]; if(o.declined) continue;
    if(/^(Complete|Declined)/.test(ockStName(o))) continue;
    if((STATE.punches || []).some(function(p){ return p.opId === o.id && !p.stop; })) continue;
    var pa = ockParts(o), all = pa.every(function(x){ return x.inh; });
    return { roId: ro.id, opId: o.id, t: "Op " + (j + 1) + " · " + (o.complaint || "Operation"), q: parseFloat(o.quoted) || 0, sub: "Same RO" + (pa.length ? (all ? " · parts in hand" : " · not all parts in") : "") };
  }
  return null;
}
/* remember what was on the card, so a redraw doesn't replay what already happened */
function ockTrack(st, m, mode){
  var now = m.now, who = m.runs.map(function(p){ return p.by || "—"; });
  if(!st.init){
    st.init = 1; st.mode = mode; st.modeAt = 0; st.over = m.over; st.overAt = 0; st.lab = null; st.mineOn = !!m.mine;
    OCK_MS.forEach(function(x){ if(m.q > 0 && m.h >= m.q * x[0]) st.hit[x[0]] = 1; });
    who.forEach(function(n){ st.whoAt[n] = 0; });
    return;
  }
  if(mode && mode !== st.mode){ st.mode = mode; st.modeAt = now; }
  if(st.mineOn && !m.mine){ st.stopAt = now; st.nextGone = false; st.nextAt = 0; }
  if(!st.mineOn && m.mine){ st.stopAt = 0; st.fix = null; }
  st.mineOn = !!m.mine;
  if(m.over !== st.over){ st.over = m.over; st.overAt = m.over && m.run ? now : 0; }
  OCK_MS.forEach(function(x){ var hit = m.q > 0 && m.h >= m.q * x[0];
    if(hit && !st.hit[x[0]]){ st.hit[x[0]] = 1; if(m.run) st.lab = { p: x[0], t: x[1], at: now }; }
    else if(!hit && st.hit[x[0]]) delete st.hit[x[0]]; });
  who.forEach(function(n){ if(!(n in st.whoAt)) st.whoAt[n] = now; });
  Object.keys(st.whoAt).forEach(function(n){ if(who.indexOf(n) < 0) delete st.whoAt[n]; });
  if(st.lab && (now - st.lab.at > OCK_LABMS || !st.hit[st.lab.p])) st.lab = null;
}
