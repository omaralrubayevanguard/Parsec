/* Parsec · ro-page · clock-card-draw.js
   The clock card's pieces, markup and ticker: the big time, the ring, segments and facts; focus mode (the big shop-floor view); ockTick updates every card in place each second; the time bar's initials and note pins, and the note added where you click (17.1).
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   ockCls ockBigTxt ockShape ockDigits ockLbl ockFxLbl ockRing ockScale ockPct ockSegs ockSegHtml ockHasWho … (71 functions)
   state      punches
   uses       access/ clock/ data/ kit/ pages/ pages/warranty/ ro/ state/
   at load    a delayed start
*/
/* ---------- the pieces (the same for the markup and for the ticker) ---------- */
function ockCls(m, mode){ return "ock" + (m.run ? " run" : "") + (m.over ? " over" : "") + " " + (OCK_MODE[mode] || "st-idle") + (m.q > 0 ? "" : " noq"); }
function ockBigTxt(m){ if(OCK_VIEW === "left" && m.q > 0){ var l = (m.q - m.h) * 3600; return l >= 0 ? ockHms(Math.ceil(l - 1e-6)) : "+" + ockHms(-l); } return ockHms(m.h * 3600); }
function ockShape(t){ return t.replace(/\d/g, "0"); }
function ockDigits(txt){
  var n = txt.length, out = "";
  for(var i = 0; i < n; i++){
    var c = txt.charAt(i), fe = n - 1 - i;
    if(/\d/.test(c)){
      var b = fe === 1 || fe === 4 ? 6 : 10, v = +c, cells = "";
      for(var k = 0; k <= b; k++) cells += "<span>" + (k % b) + "</span>";
      out += '<span class="d"><span class="dc" data-b="' + b + '" data-v="' + v + '" style="transform:translateY(' + (-v) + 'em)">' + cells + "</span></span>";
    } else out += '<span class="c' + (c === ":" ? " k" : "") + '">' + ockE(c) + "</span>";
  }
  return out;
}
function ockLbl(m, mode, n, can, st){
  if(OCK_VIEW === "left" && m.q > 0) return m.h <= m.q ? "Time left · of <b>" + ockHms(m.q * 3600) + "</b> quoted" : "Over quoted · <b>" + ockHms(m.q * 3600) + "</b> quoted";
  var h = (mode === "lock" ? "Locked until the part is in · " : '<span class="ock-lp">On this operation · </span>') + n + " entr" + (n === 1 ? "y" : "ies");
  if(m.run && m.runs[0]){ var r0 = m.mine || m.runs[0], s0 = +new Date(r0.start) - (r0 === m.mine ? m.fx : 0);
    h += ' · <span class="ock-since">since <b>' + ockE(ockClk(s0)) + "</b>" + (can && m.mine ? '<button type="button" class="ock-pen' + (st && st.fix ? " on" : "") + '" data-ock="pen" title="Fix the start — forgot to clock on?" aria-label="Fix the start">' + ockIc("pencil") + "</button>" : "") + "</span>"; }
  return h + (m.q > 0 ? '<span class="ock-tip"> · <b>tap the time</b> for time left</span>' : "");
}
function ockFxLbl(m){ return m.q > 0 ? (m.h <= m.q ? "<b>" + ockHm((m.q - m.h) * 3600) + "</b> left of " + ockHm(m.q * 3600) + " quoted" : "<b>+" + ockHm((m.h - m.q) * 3600) + "</b> over quoted") : "<b>" + ockHm(m.h * 3600) + "</b> on this operation"; }
function ockRing(m){ var p = m.q > 0 ? Math.min(1, m.h / m.q) : 0; return { off: (OCK_RC * (1 - p)).toFixed(2), col: p >= 1 ? "var(--o-bad)" : p >= 0.9 ? "var(--o-warn)" : "var(--o-good)" }; }
function ockScale(m, sim){ var top = m.q > 0 ? m.q * 1.12 : Math.max(m.h * 1.05, 0.25); if(sim) top = Math.max(top, sim.hi * 1.06); return Math.max(top, m.h * 1.03); }
function ockPct(x, sc){ return Math.max(0, x / sc * 100).toFixed(3) + "%"; }
/* the bar: one piece per punch in its start reason's color (typed-in time first, in grey); past quoted the stripes take over */
function ockSegs(m, sc){ /* Parsec 12.7: only your own running punch moves when you fix the start */
  var hrs = m.ms / 3600000, L = [], k = hrs > 0 && m.h < hrs ? m.h / hrs : 1, extra = m.h - hrs;
  if(extra > 0.004) L.push({ h: extra, c: "var(--o-ink4)", t: "Typed in by hand · " + ockHm(extra * 3600), live: 0 });
  m.ps.forEach(function(p){ var a = +new Date(p.start) - (p === m.mine ? m.fx : 0), b = p.stop ? +new Date(p.stop) : m.now, d = Math.max(0, b - a) / 3600000 * k;
    L.push({ h: d, c: ockRv(p.startReason), t: (p.by ? ockFirst(p.by) + " · " : "") + (p.startReason || "Working") + (p.stop ? " → " + (p.stopReason || "stopped") : " · on the clock") + " · " + ockHm(d * 3600), live: !p.stop, by: p.by || "" }); });
  var cap = m.q > 0 ? m.q : Infinity, acc = 0;
  L.forEach(function(x, i){ var w = Math.max(0, Math.min(x.h, cap - acc)); acc += x.h; x.w = w; x.z = w / sc * 100 < 0.15; x.css = "--c:" + x.c + ";width:max(0px, calc(" + ockPct(w, sc) + " - " + (i < L.length - 1 ? 2 : 0) + "px))";
    x.ini = x.by && w / sc * 100 >= 3.5 ? ockIni(x.by) : ""; });   /* Parsec 17.1: who worked each piece, in initials over it */
  return L;
}
function ockSegHtml(L){ return L.map(function(x){ return '<i class="' + (x.live ? "live" : "") + (x.z ? " z" : "") + '" style="' + x.css + '" title="' + ockE(x.t) + '"' + (x.ini ? ' data-w="' + ockE(x.ini) + '"' : "") + "></i>"; }).join(""); }
function ockHasWho(m){ return m.ps.some(function(p){ return !!p.by; }); }
/* ---------- notes on the time bar (Parsec 17.1) ----------
   Each note is a pin where it was written along the time worked; pointing at it shows the note, who wrote it and when.
   Clicking the bar where something happened adds a note at that moment, to the punch under the pointer. */
function ockBarMap(m){   /* where each punch sits along the bar, in hours (the same walk ockSegs makes) */
  var hrs = m.ms / 3600000, k = hrs > 0 && m.h < hrs ? m.h / hrs : 1, ex = m.h - hrs, acc = ex > 0.004 ? ex : 0;
  return m.ps.map(function(p){ var a = +new Date(p.start) - (p === m.mine ? m.fx : 0), b = p.stop ? +new Date(p.stop) : m.now, d = Math.max(0, b - a) / 3600000 * k, r = { p: p, a: a, b: b, k: k, h0: acc, d: d }; acc += d; return r; });
}
function ockPins(m, sc){
  var L = [];
  ockBarMap(m).forEach(function(x){
    ockNotes(x.p).forEach(function(n){ if(OCK_SYS_NOTE.test(n.text)) return;
      var t = n.known ? n.at : x.b, off = Math.max(0, Math.min(x.d, (t - x.a) / 3600000 * x.k));
      var pc = Math.min(100, (x.h0 + off) / sc * 100);
      L.push({ left: "left:" + pc.toFixed(3) + "%", side: pc < 14 ? " l" : pc > 86 ? " r" : "", t: t, known: n.known, text: n.text, by: x.p.by || "", a: x.a, b: x.b, pid: x.p.id }); });
  });
  return L;
}
function ockPinWhen(x){
  var d = new Date(x.t), day = d.toDateString() === new Date().toDateString() ? "" : d.toLocaleDateString(undefined, { weekday: "short" }) + " ";
  return x.known ? day + ockClk(x.t) : "during " + day + ockClk(x.a) + "–" + ockClk(x.b);
}
function ockPinsKey(L){ return L.map(function(x){ return x.pid + ":" + x.text.length + ":" + (x.known ? 1 : 0); }).join("|"); }
function ockPinsHtml(L){
  return L.map(function(x){ var who = x.by ? ockFirst(x.by) : "", when = ockPinWhen(x);
    return '<button type="button" class="ock-pin' + x.side + '" data-ock="pin" style="' + x.left + '" aria-label="' + ockE("Note" + (who ? " by " + who : "") + ", " + when + ": " + x.text) + '"><span class="ock-pn" aria-hidden="true"><b>' + ockE((who ? who + " · " : "") + when) + "</b>" + ockE(x.text) + "</span></button>"; }).join("");
}
/* the moment under the pointer: the punch it falls in and the time it was */
function ockBarAt(m, sc, frac){
  var h = Math.max(0, frac) * sc, M = ockBarMap(m), hit = null, slack = sc * 0.012;
  M.forEach(function(x){ if(!hit && x.d > 0 && h >= x.h0 - slack && h <= x.h0 + x.d + slack) hit = x; });
  if(!hit) return null;
  var off = Math.max(0, Math.min(hit.d, h - hit.h0));
  return { p: hit.p, at: Math.round(hit.a + off / hit.k * 3600000), pct: Math.min(100, (hit.h0 + off) / sc * 100) };
}
function ockNaddHtml(st){
  var x = st.nadd; if(!x) return "";
  var p = (STATE.punches || []).filter(function(q){ return q.id === x.pid; })[0]; if(!p){ st.nadd = null; return ""; }
  return '<span class="ock-npt" style="left:' + x.pct.toFixed(2) + '%"></span><div class="ock-nadd" style="--x:' + x.pct.toFixed(2) + '%"><b>Note at ' + ockE(ockClk(x.at)) + (p.by ? " · " + ockE(ockFirst(p.by)) + "’s punch" : "") + '</b><div class="ock-nf"><input type="text" data-ock-na value="' + ockE(x.v || "") + '" placeholder="What happened here?" aria-label="A note at ' + ockE(ockClk(x.at)) + '" enterkeyhint="done"><button type="button" class="ock-btn pri" data-ock="nas">Save</button><button type="button" class="ock-btn" data-ock="nax">Cancel</button></div></div>';
}
function ockBar(m, sc, sim, up){
  var q = m.q;
  return { ov: "left:" + ockPct(q, sc) + ";width:" + (m.over ? ockPct(m.h - q, sc) : "0%"), gh: "left:" + ockPct(Math.min(m.h, q), sc) + ";width:" + (q > 0 && m.h < q ? ockPct(q - m.h, sc) : "0%"),
    qt: "left:" + ockPct(q, sc), ms: [0.5, 0.75].map(function(p){ return "left:" + ockPct(q * p, sc); }),
    band: sim ? "left:" + ockPct(sim.lo, sc) + ";width:" + ockPct(Math.max(sim.hi - sim.lo, sc * 0.006), sc) : "display:none", bu: sim ? "left:" + ockPct(sim.md, sc) : "display:none",
    here: sim ? "left:" + ockPct(m.h, sc) : "display:none", up: up ? "left:" + ockPct(up.fu, sc) : "display:none" };
}
function ockWhoKey(m){ return m.runs.map(function(p){ return p.by || "—"; }).join("|"); }
function ockWhoHtml(m, st){
  return m.runs.map(function(p){ var n = p.by || "—", me = false; try{ me = PG.isMe(n); }catch(e){}
    return '<span class="ock-who' + (ockFresh(st.whoAt[n], m.now) ? " in" : "") + '" title="' + ockE(n) + " — on the clock since " + ockE(ockClk(new Date(p.start))) + '"><span class="av">' + ockE(ockIni(n)) + "</span><b>" + ockE(me ? "You" : ockFirst(n)) + '</b><span class="m">' + ockMs((m.now - new Date(p.start) + (p === m.mine ? m.fx : 0)) / 1000) + "</span></span>"; }).join("");
}
/* the one-line facts: when quoted runs out, the usual pace, similar jobs, lunch and the end of the day */
function ockFact(k, ic, txt){ return txt ? ockIc(ic) + "<span>" + txt + "</span>" : ""; }
function ockPace(m){
  if(!(m.q > 0)) return "";
  if(m.run && !m.over) return "Quoted runs out about <b>" + ockE(ockEndAt(m.now, (m.q - m.h) * 3600, true)) + "</b>";
  if(m.run) return "Quoted ran out at <b>" + ockE(ockClk(m.now - (m.h - m.q) * 3600000)) + "</b>";
  if(!m.over) return "<b>" + ockHm((m.q - m.h) * 3600) + "</b> left on the quote";
  return "";
}
function ockUpInfo(m, ro){
  if(!(m.q > 0)) return null; var t = ockTech(m, ro), u = ockUsual(t); if(!u || !(u.eff > 0)) return null;
  var me = false; try{ me = PG.isMe(t); }catch(e){}
  return { fu: m.q / u.eff, pct: Math.round(u.eff * 100), who: me ? "your" : ockFirst(t) + "’s", t: t };
}
function ockUpTxt(m, up){
  if(!up) return { z: "", t: "" };
  var rem = up.fu - m.h;
  if(rem > 0) return { z: "a", t: m.run ? "At " + ockE(up.who) + " usual <b>" + up.pct + "%</b>: done about <b>" + ockE(ockEndAt(m.now, rem * 3600, true)) + "</b>" : "<b>" + ockHm(rem * 3600) + "</b> more at " + ockE(up.who) + " usual " + up.pct + "%" };
  var past = (m.h - up.fu) * 3600;
  return { z: "b", t: "Past " + ockE(up.who) + " usual finish — <b>" + (past < 3600 ? Math.max(1, Math.floor(past / 60)) + " min" : ockHm(past)) + "</b> beyond the " + up.pct + "% pace" };
}
function ockBandTxt(m, sim){
  if(!sim) return { z: "", t: "" };
  var r = "<b>" + sim.lo.toFixed(1) + "–" + sim.hi.toFixed(1) + " h</b>", z = m.h < sim.lo ? "lo" : m.h > sim.hi ? "hi" : "in";
  return { z: z, t: z === "hi" ? "Past most similar jobs — " + sim.n + " ran " + r : "Similar jobs " + r + " · usually " + sim.md.toFixed(1) + " — " + (z === "in" ? "you’re in range" : "you’re under it") };
}
function ockLunchTxt(m, mineRun){
  var d = ockDay(m.now); if(!d) return "";
  var last = m.ps[m.ps.length - 1], ap = !m.run && last && last.autoPause, now = m.now;
  if(ap === "lunch" && now >= d.la && now < d.lz) return "Lunch — the clock starts itself again at <b>" + ockE(ockClk(d.lz)) + "</b>";
  if(ap === "eod" && now >= d.z && new Date(last.stop).toDateString() === new Date(now).toDateString()) return "End of day — the clock stopped itself at <b>" + ockE(ockClk(d.z)) + "</b>";
  if(now < d.a - 3600000) return "";
  if(now < d.la) return "Lunch in <b>" + ockCd(d.la - now) + "</b>" + (mineRun ? " — the clock pauses itself" : "");
  if(now < d.lz) return "Lunch until <b>" + ockE(ockClk(d.lz)) + "</b>";
  if(now < d.z) return "End of day in <b>" + ockCd(d.z - now) + "</b>" + (mineRun ? " — your clock keeps running" : "");
  return "After hours";
}
function ockOvTxt(m){ return "+" + ockMs((m.h - m.q) * 3600) + " over"; }
function ockOvHtml(m, st){ return m.over ? '<span class="ock-ovl' + (ockFresh(st.overAt, m.now) ? " in" : "") + '">' + ockIc("flag") + "<span>" + ockOvTxt(m) + "</span></span>" : ""; }
function ockMlHtml(m, st){ var l = st.lab; return l && m.now - l.at < OCK_LABMS ? '<span class="ock-mlb' + (ockFresh(l.at, m.now) ? " in" : "") + '" data-p="' + l.p + '">' + ockIc("check") + ockE(l.t) + "</span>" : ""; }
function ockBackHtml(m){ var p = m.mine; return p && p.autoResume && m.now - new Date(p.start) < 8000 ? '<span class="ock-mlb ock-back' + (ockCalm() ? "" : " in") + '">' + ockIc("sun") + "Back from lunch — clock on again</span>" : ""; }
function ockNudgeInfo(m, can, st){
  var p = m.mine; if(!p || !can || st.noteOpen) return null;
  var ln = ockLastNote(p), since = ln ? ln.at : +new Date(p.start) - m.fx, gap = (m.now - since) / 1000;
  return gap >= OCK_NUDGE ? { min: Math.floor(gap / 60) } : null;
}
function ockNudgeHtml(n, st, now){ if(!n) return ""; if(!st.nudgeAt) st.nudgeAt = now; return '<button type="button" class="ock-nudge' + (ockFresh(st.nudgeAt, now, 1200) ? " in" : "") + '" data-ock="nopen">' + ockIc("note") + "<span>No note for " + n.min + " min — add one?</span></button>"; }
function ockPartsHtml(op, st, now){
  var P = ockParts(op); if(!P.length) return "";
  var all = P.every(function(x){ return x.inh; });
  if(all){
    if(ockFresh(st.allInAt, now, 8000)) return P.map(function(x){ return '<span class="ock-pt in">' + ockIc("check") + ockE(x.n) + "</span>"; }).join("") + '<span class="ock-pt all' + (ockFresh(st.allInAt, now, 1500) ? " fl" : "") + '">' + ockIc("parts") + "All parts in</span>";
    return '<span class="ock-pt in all">' + ockIc("check") + "Parts · " + (P.length === 1 ? "in hand" : "all " + P.length + " in hand") + "</span>";
  }
  var out = P.filter(function(x){ return !x.inh; }), n = P.length - out.length;
  return out.slice(0, 3).map(function(x){ return '<span class="ock-pt eta' + (/^Back/i.test(x.st) ? " bo" : "") + '" title="' + ockE(x.n + " · " + x.st) + '"><i></i>' + ockE(x.n) + " · " + ockE(x.eta ? "ETA " + ockEta(x.eta) : String(x.st).toLowerCase()) + "</span>"; }).join("")
    + (out.length > 3 ? '<span class="ock-pt">+' + (out.length - 3) + " more</span>" : "") + (n ? '<span class="ock-pt in">' + ockIc("check") + n + " in hand</span>" : "");
}
function ockDoneHtml(m, mode, st){
  if(mode !== "done" || !(m.q > 0) || m.h > m.q + 1e-6 || m.h < 0.02) return "";
  var pop = ockFresh(st.modeAt, m.now, 1500), burst = "";
  if(pop){ var C = ["var(--o-good)", "var(--rc-diag,#6C69C8)", "var(--o-warn)", "var(--rc-wforeman,#C0662F)", "var(--rc-lunch,#e0566b)", "var(--o-acc)"];
    for(var i = 0; i < 16; i++){ var a = i / 16 * 2 * Math.PI + (i % 2) * 0.2, rx = 70 + (i % 3) * 14, ry = 22 + (i % 4) * 7; burst += '<i style="--dx:' + (Math.cos(a) * rx).toFixed(0) + "px;--dy:" + (Math.sin(a) * ry).toFixed(0) + "px;--c:" + C[i % C.length] + ";animation-delay:" + (100 + (i % 4) * 30) + 'ms"></i>'; } }
  return '<span class="ock-done' + (pop ? " pop" : "") + '">' + ockIc("check") + "Done in " + ockHm(m.h * 3600) + " · " + Math.round(m.q / m.h * 100) + "%" + (pop ? '<span class="ock-burst" aria-hidden="true">' + burst + "</span>" : "") + "</span>";
}
/* Parsec 12.8: a completed operation reopens — Reopen puts it back to Hold tech with the clock off; once reopened, the card says so */
function ockReoHtml(op, mode, can, now){
  if(mode === "done") return can ? '<button type="button" class="ock-reb" data-ock="reo" title="Reopen it — back to Hold tech, the clock stays off">' + ockIc("undo") + "Reopen</button>" : "";
  var r = typeof opReopenedLast === "function" ? opReopenedLast(op) : null; if(!r) return "";
  var t = +new Date(r.at); if(!(now - t < 3 * 86400000)) return "";
  var d = new Date(t), today = d.toDateString() === new Date(now).toDateString();
  return '<span class="ock-reod" title="Reopened by ' + ockE(r.by || "") + " · " + ockE(d.toLocaleString()) + '">' + ockIc("undo") + "Reopened " + (today ? "" : ockE(d.toLocaleDateString(undefined, { weekday: "short" })) + " ") + ockE(ockClk(t)) + (r.by ? " · " + ockE(String(r.by).split(" ")[0]) : "") + "</span>";
}
function ockLapsHtml(m){
  var p = m.mine; if(!p) return ""; var S = ockSplits(p); if(!S.length) return "";
  var st0 = +new Date(p.start), L = S.map(function(t, i){ return { n: i + 1, d: (t - (i ? S[i - 1] : st0)) / 1000, at: t }; }), V = L.slice(-3);
  return (L.length > 3 ? '<span class="ock-lap more">+' + (L.length - 3) + "</span>" : "") + V.map(function(x){ return '<span class="ock-lap">' + ockIc("flag") + "<b>Split " + x.n + "</b>" + ockHms(x.d) + "<small>" + ockE(ockClk(x.at)) + "</small></span>"; }).join("")
    + '<span class="ock-lap cur" data-ock="lapc">' + ockLapCur(m) + "</span>";
}
function ockLapCur(m){ var p = m.mine; if(!p) return ""; var S = ockSplits(p); return "Split " + (S.length + 1) + " · " + ockHms((m.now - (S.length ? S[S.length - 1] : +new Date(p.start))) / 1000); }
function ockKv(m){
  var q = m.q, h = m.h, over = m.over, ef = q > 0 && h >= 0.05 ? Math.round(q / h * 100) : null;
  return { b: h.toFixed(2) + "<em>h</em>", lk: over ? "Over" : "Left", l: q > 0 ? (over ? "+" + (h - q).toFixed(2) : (q - h).toFixed(2)) + "<em>h</em>" : "—", lc: over ? "r" : q > 0 && q - h < 0.5 ? "w" : "",
    e: ef == null ? "—" : ef + "<em>%</em>", ec: ef == null ? "" : ef >= 100 ? "g" : ef >= 85 ? "w" : "r" };
}
function ockStops(p){ if(p && typeof isShopPunch === "function" && isShopPunch(p)) return ["Done", "Switched job"]; var L = []; try{ L = STOP_REASONS_BREAK.concat(STOP_REASONS_EXPLICIT); }catch(e){ L = ["Lunch", "End of day", "Waiting – Parts", "Complete"]; } return L; }
/* the reasons after a hold: only while that punch is still this operation's last one and nothing runs */
function ockRsnOk(st, m){ var r = st.rsn; if(!r) return null; var me = ockMe(), L = m.ps.filter(function(p){ return ockMine(p, me); }), last = L[L.length - 1]; if(m.mine || !last || last.id !== r.pid || !last.stop){ st.rsn = null; return null; } return last; }
function ockRsnHtml(st, m){
  var rp = ockRsnOk(st, m); if(!rp) return "";
  return '<span class="ock-rq">Why did it stop?</span>' + ockStops(rp).map(function(r, i){ return '<button type="button" class="ock-r' + (rp.stopReason === r ? " on" : "") + (ockFresh(st.rsn.at, m.now) ? " in" : "") + '" data-ock-r="' + ockE(r) + '" style="--c:' + ockRv(r) + ";--d:" + (i * 35) + 'ms"><i></i>' + ockE(r) + "</button>"; }).join("")
    + '<button type="button" class="ock-rx" data-ock="rx" title="Leave it as it is" aria-label="Leave it as it is">' + ockIc("x") + "</button>";
}
function ockFixWho(p){ try{ return punchOwner(p); }catch(e){ return p.by || ""; } }
function ockFixSame(x, w){ try{ return sameOwner(punchOwner(x), w); }catch(e){ return ockSame(x.by || "", w) || (!x.by && !w); } }
function ockFixMax(p){ var s = +new Date(p.start), prev = 0, w = ockFixWho(p); (STATE.punches || []).forEach(function(x){ if(x.id === p.id || !ockFixSame(x, w)) return; var a = +new Date(x.start); if(a < s && a > prev) prev = a; }); var lim = 60; if(prev) lim = Math.min(lim, Math.floor((s - prev) / 60000) - 1); return Math.max(0, lim); }
function ockFixPrev(p, ns){ var w = ockFixWho(p); return (STATE.punches || []).filter(function(x){ return x.id !== p.id && ockFixSame(x, w) && x.stop && +new Date(x.stop) > ns && +new Date(x.start) < +new Date(p.start); })[0] || null; }
function ockFixHtml(m, st){
  var p = m.mine; if(!p || !st.fix) return "";
  var d = st.fix.d || 0, mx = ockFixMax(p), ns = +new Date(p.start) - d * 60000, pv = d ? ockFixPrev(p, ns) : null, sh = null; try{ sh = openShiftOf(punchOwner(p)); }catch(e){ try{ sh = openShift(); }catch(e2){} }
  var ro = pv ? getRO(pv.roId) : null, w = !d ? (mx ? "Drag left to move the start earlier — up to " + mx + " min." : "Nothing earlier to take — the punch before this one starts right before it.")
    : (pv ? "Trims the " + (ro ? "RO " + ockE(String(ro.roNumber || "").slice(-4)) : "") + " punch before it to " + ockE(ockClk(ns)) + ". " : "") + (sh && +new Date(sh.in) > ns ? "Your day clock starts at " + ockE(ockClk(ns)) + " too." : "");
  return '<span class="ock-fl1">' + ockIc("pencil") + 'Started</span><input type="range" min="0" max="' + mx + '" step="1" value="' + d + '" dir="rtl" data-ock-fr aria-label="Move the start earlier, up to ' + mx + ' min"><span class="ock-fv"><b>' + ockE(ockClk(ns)) + "</b>" + (d ? " · +" + d + " min" : "") + '</span><span class="ock-fbt"><button type="button" class="ock-btn pri" data-ock="fs">Save</button><button type="button" class="ock-btn" data-ock="fu">Cancel</button></span><small>' + w + "</small>";
}
function ockNoteHtml(m, can, st){
  var p = m.mine; if(!p || !can) return "";
  var ln = ockLastNote(p); if(!ln && !st.noteOpen) return "";
  return (st.noteOpen ? '<div class="ock-nf"><input type="text" data-ock-in placeholder="What are you on right now?" aria-label="A note on this punch" enterkeyhint="done"><button type="button" class="ock-btn pri" data-ock="ns">Save</button><button type="button" class="ock-btn" data-ock="nx">Cancel</button></div>' : "")
    + '<div class="ock-nl">' + ockIc("note") + "<span>" + (ln ? "Last note <b>" + ockE(ockClk(ln.at)) + "</b> · " + ockE(ln.text) : "No note on this punch yet") + "</span>" + (st.noteOpen ? "" : '<button type="button" class="ock-lk" data-ock="nopen">Add a note</button>') + "</div>";
}
function ockNextHtml(roId, opId, o, m, mode, st){
  if(!o.can || m.mine || !st.stopAt || st.nextGone || st.rsn || mode === "lock" || ockDimHtml(m)) return "";
  var n = ockNext(roId, opId, o.pg); if(!n) return "";
  if(!st.nextAt) st.nextAt = m.now;
  return '<div class="ock-next' + (ockFresh(st.nextAt, m.now, 1200) ? " in" : "") + '"><span class="ock-nxi">' + ockIc("next") + '</span><span class="ock-nxt">Next: <b>' + ockE(n.t) + "</b>" + (n.q ? " · " + n.q.toFixed(1) + " h" : "") + "<small>" + ockE(n.sub || "") + '</small></span><button type="button" class="ock-btn pri" data-ock="nxs" data-nro="' + ockE(n.roId) + '" data-nop="' + ockE(n.opId) + '">' + ockIc("play") + 'Start</button><button type="button" class="ock-rx" data-ock="nxx" title="Not now" aria-label="Not now">' + ockIc("x") + "</button></div>";
}
function ockDimHtml(m){
  var d = ockDay(m.now), last = m.ps[m.ps.length - 1]; if(!d || m.run || !last || !last.autoPause) return "";
  if(last.autoPause === "lunch" && m.now >= d.la && m.now < d.lz) return '<div class="ock-dim"><div class="ock-dimc">' + ockIc("moon") + "<span><b>Lunch</b><small>back " + ockE(ockClk(d.lz)) + " — the clock starts itself again</small></span></div></div>";
  if(last.autoPause === "eod" && m.now >= d.z && new Date(last.stop).toDateString() === new Date(m.now).toDateString()) return '<div class="ock-dim"><div class="ock-dimc">' + ockIc("moon") + "<span><b>End of day</b><small>the clock stopped itself at " + ockE(ockClk(d.z)) + "</small></span></div></div>";
  return "";
}
function ockSide(m, st, mode, o, nm, fx){
  var can = !!o.can, run = !!m.mine, rg = ockRing(m), side;
  var title = run ? "Stop your clock — press and hold" : mode === "lock" ? o.lock : o.off || (m.run ? "Start your clock on this operation too" : "Start the clock on this operation");
  var sq = run || (!can && m.run), ico = mode === "lock" ? ockIc("lock") : '<svg class="ock-ic" viewBox="0 0 24 24" aria-hidden="true"><path d="' + (sq ? OCK_STOP : OCK_PLAY) + '" style="d:path(\'' + (sq ? OCK_STOP : OCK_PLAY) + '\')"/></svg>';
  var shim = !run && mode !== "done" && ockFresh(st.allInAt, m.now, 60000);
  if(mode === "done") side = can && !o.off   /* Parsec 12.8: the check is a button — it reopens the operation and starts your clock */
    ? '<button type="button" class="ock-ck reo' + (ockFresh(st.modeAt, m.now) ? " draw" : "") + '" data-ock="go" data-reo="1" title="' + ockE(nm || "Complete") + ' — click to reopen it and start your clock" aria-label="Reopen and start the clock"><svg class="ck" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 12.5l4 4 8-9"/></svg><svg class="pl" viewBox="0 0 24 24" aria-hidden="true"><path d="' + OCK_PLAY + '"/></svg></button>'
    : '<span class="ock-ck' + (ockFresh(st.modeAt, m.now) ? " draw" : "") + '" title="' + ockE(nm || "Complete") + '"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 12.5l4 4 8-9"/></svg></span>';
  else if(mode === "wait") side = can && !o.off ? '<button type="button" class="ock-wt" data-ock="go" title="' + ockE(nm) + ' — click to start the clock anyway">WAIT</button>' : '<span class="ock-wt" title="' + ockE(nm) + '">WAIT</span>';
  else side = '<div class="ock-rg' + (st.holding ? " holding" : "") + '"><svg class="ock-ring" viewBox="0 0 52 52" aria-hidden="true"><circle class="t" cx="26" cy="26" r="23"/>'
    + (m.q > 0 ? '<circle class="p" cx="26" cy="26" r="23" style="stroke-dasharray:' + OCK_RC.toFixed(2) + ";stroke-dashoffset:" + rg.off + ";--rc:" + rg.col + '"/>' : "")
    + '<circle class="h" cx="26" cy="26" r="23" style="stroke-dasharray:' + OCK_RC.toFixed(2) + ";stroke-dashoffset:" + OCK_RC.toFixed(2) + '"/></svg>'
    + (can ? '<button type="button" class="ock-pb' + (run ? " on" : "") + (mode === "lock" ? " lk" : "") + (shim ? " shim" : "") + '" data-ock="go"' + (o.off && !run ? " disabled" : "") + ' title="' + ockE(title) + '" aria-label="' + ockE(title) + '"' + (mode === "lock" ? ' aria-disabled="true"' : "") + ">" + ico + "</button>"
      : '<span class="ock-pb ro' + (m.run ? " on" : "") + '" title="' + (m.run ? "On the clock" : "Not running") + '">' + ico + "</span>") + "</div>";
  var hint = st.holding ? "Keep holding…" : st.hint && st.hint.until > m.now ? st.hint.t : run && can ? "Hold to stop" : "";
  var tools = fx ? "" : '<span class="ock-tools"><button type="button" class="ock-tl" data-ock="focus" title="Focus mode — the big view" aria-label="Focus mode">' + ockIc("expand") + "</button>"
    + (run && can ? '<button type="button" class="ock-tl" data-ock="lap" title="Mark a split" aria-label="Mark a split">' + ockIc("flag") + "</button>" : "") + "</span>";
  return '<div class="ock-side" data-mode="' + mode + '"><span class="ock-hint">' + ockE(hint) + "</span>" + tools + side + "</div>";
}
/* ---------- the markup ---------- */
function ockPrep(roId, opId, o){
  var op = null; try{ op = getOp(roId, opId); }catch(e){}
  if(!op) return null;
  var key = roId + "|" + opId, st = ockState(key), hr = o.hr || "jc";
  if(st.fix && st.fix.d){ var mm = ockModel(op, hr); if(!mm.mine) st.fix = null; }
  var m = ockModel(op, hr, st.fix ? st.fix.d : 0), nm = ockStName(op);
  var mode = m.run ? "run" : /^Complete/.test(nm) ? "done" : /^Waiting/.test(nm) ? "wait" : o.lock ? "lock" : "idle";
  ockTrack(st, m, mode);
  var P = ockParts(op), all = P.length > 0 && P.every(function(x){ return x.inh; });
  if(st.allIn === undefined) st.allIn = all; else if(all && !st.allIn){ st.allIn = true; st.allInAt = m.now; } else if(!all) st.allIn = false;
  var ro = null; try{ ro = getRO(roId); }catch(e){}
  return { op: op, ro: ro, key: key, st: st, m: m, nm: nm, mode: mode, hr: hr };
}
function ockAttrs(roId, opId, o, x){
  return ' data-ro="' + ockE(roId) + '" data-op="' + ockE(opId) + '" data-hr="' + x.hr + '" data-ockp="' + ockE(o.pg || "") + '" data-mode="' + x.mode + '" data-can="' + (o.can ? 1 : 0) + '" data-off="' + ockE(o.off || "") + '" data-lock="' + ockE(o.lock || "") + '" data-eq="' + (o.editQ ? 1 : 0) + '" style="--o-wt:' + ockRv(x.mode === "wait" ? x.nm : "Waiting – Parts") + '"';
}
function ockBigHtml(m, txt){ return '<div class="ock-tm"><button type="button" class="ock-big" data-ock="big" data-t="' + txt + '" data-sh="' + ockShape(txt) + '" title="' + (m.q > 0 ? "Tap to switch between the time on it and the time left" : "The time on this operation") + '" aria-label="' + txt + '"><span class="rd" aria-hidden="true">' + ockDigits(txt) + "</span></button></div>"; }
function ockHtml(roId, opId, o){
  o = o || {};
  var x = ockPrep(roId, opId, o); if(!x) return "";
  var m = x.m, st = x.st, mode = x.mode, can = !!o.can, n = m.ps.length, txt = ockBigTxt(m), kv = ockKv(m);
  var sim = ockSim(x.op), up = ockUpInfo(m, x.ro), sc = ockScale(m, sim), bar = ockBar(m, sc, sim, up), L = ockSegs(m, sc);
  var mineRun = m.run && m.runs.some(function(p){ return ockSame(p.by || "", ockMe()); });
  var bt = ockBandTxt(m, sim), ut = ockUpTxt(m, up); st.bandZ = bt.z; st.upZ = ut.z;
  var lab = st.lab && m.now - st.lab.at < 1200 && !ockCalm() ? st.lab.p : 0;
  var h = '<div class="' + ockCls(m, mode) + '" data-key="ock-' + ockE(opId) + '"' + ockAttrs(roId, opId, o, x) + ">";
  h += ockBigHtml(m, txt);
  h += '<div class="ock-lbl">' + ockLbl(m, mode, n, can, st) + "</div>";
  h += ockSide(m, st, mode, o, x.nm, false);
  h += '<div class="ock-fix">' + ockFixHtml(m, st) + "</div>";
  var pins = ockPins(m, sc);
  h += '<div class="ock-bar' + (ockHasWho(m) ? " has-w" : "") + (can ? " can" : "") + '" role="group"' + (can ? ' data-ock="bar"' : "") + ' aria-label="' + (m.q > 0 ? Math.round(m.h / m.q * 100) + "% of quoted" : m.h.toFixed(2) + " h, no quote") + '"><span class="ock-band" style="' + bar.band + '" title="' + (sim ? "Similar jobs " + sim.lo.toFixed(1) + "–" + sim.hi.toFixed(1) + " h (" + sim.n + ")" : "") + '"></span><span class="ock-bu" style="' + bar.bu + '" title="' + (sim ? "Similar jobs usually " + sim.md.toFixed(1) + " h" : "") + '"></span>'
    + '<span class="ock-segs">' + ockSegHtml(L) + '</span><span class="ock-ov" style="' + bar.ov + '"></span><span class="ock-gh" style="' + bar.gh + '"></span>'
    + [0.5, 0.75].map(function(p, i){ return '<span class="ock-ms' + (st.hit[p] ? " hit" : "") + (lab === p ? " pop" : "") + '" data-p="' + p + '" style="' + bar.ms[i] + '"></span>'; }).join("")
    + '<span class="ock-up' + (up && m.h >= up.fu ? " hit" : "") + '" style="' + bar.up + '" title="' + (up ? "Where " + ockE(up.who) + " usual pace would finish" : "") + '"></span><span class="ock-qt' + (lab === 1 ? " pop" : "") + '" style="' + bar.qt + '" title="Quoted"></span><span class="ock-here' + (sim && bt.z !== "in" ? " out" : "") + '" style="' + bar.here + '"></span>'
    + '<span class="ock-pins" data-k="' + ockE(ockPinsKey(pins)) + '">' + ockPinsHtml(pins) + '</span>' + (can ? '<span class="ock-gst" aria-hidden="true"></span>' : "") + ockNaddHtml(st) + "</div>";
  h += '<div class="ock-fa"><span class="ock-f" data-f="pace">' + ockFact("pace", "clock", ockPace(m)) + '</span><span class="ock-f" data-f="up">' + ockFact("up", "gauge", ut.t) + '</span><span class="ock-f" data-f="band">' + ockFact("band", "similar", bt.t) + '</span><span class="ock-f" data-f="lunch">' + ockFact("lunch", "moon", ockLunchTxt(m, mineRun)) + "</span></div>";
  h += '<div class="ock-x"><span class="ock-dn">' + ockDoneHtml(m, mode, st) + '</span><span class="ock-reo">' + ockReoHtml(x.op, mode, can, m.now) + '</span><span class="ock-whos" data-k="' + ockE(ockWhoKey(m)) + '">' + ockWhoHtml(m, st) + '</span><span class="ock-pts">' + ockPartsHtml(x.op, st, m.now) + '</span><span class="ock-ovs">' + ockOvHtml(m, st) + '</span><span class="ock-mls">' + ockMlHtml(m, st) + '</span><span class="ock-bk">' + ockBackHtml(m) + '</span><span class="ock-ng">' + ockNudgeHtml(ockNudgeInfo(m, can, st), st, m.now) + "</span></div>";
  h += '<div class="ock-laps">' + ockLapsHtml(m) + "</div>";
  h += '<div class="ock-note">' + ockNoteHtml(m, can, st) + "</div>";
  h += '<div class="ock-rsn">' + ockRsnHtml(st, m) + "</div>";
  h += ockNextHtml(roId, opId, o, m, mode, st);
  h += '<div class="ock-kv"><div class="ock-k' + (o.editQ ? ' ed" data-ock="q" role="button" tabindex="0" title="Quoted hours — click to change"' : '"') + "><small>Quoted</small><b>" + (m.q > 0 ? m.q.toFixed(2) + "<em>h</em>" : "—") + "</b></div>"
    + '<div class="ock-k"><small>Burnt</small><b data-ock="kb">' + kv.b + '</b></div><div class="ock-k"><small data-ock="kk">' + kv.lk + '</small><b data-ock="kl" class="' + kv.lc + '">' + kv.l + '</b></div><div class="ock-k"><small>Efficiency</small><b data-ock="ke" class="' + kv.ec + '">' + kv.e + "</b></div></div>";
  if(mode === "lock" && o.lock) h += '<div class="ock-lock">' + ockIc("parts") + "<span>" + ockE(o.lock) + "</span></div>";
  h += ockDimHtml(m);
  h += "</div>";
  if(!OCK_RAF) OCK_RAF = requestAnimationFrame(ockSync);
  return h;
}
/* ---------- focus mode: the card grows into a big shop-floor view ---------- */
function ockCardOpts(card){ return { pg: card.getAttribute("data-ockp"), hr: card.getAttribute("data-hr"), can: card.getAttribute("data-can") === "1", off: card.getAttribute("data-off") || "", lock: card.getAttribute("data-lock") || "", editQ: card.getAttribute("data-eq") === "1" }; }
function ockFxHtml(roId, opId, o){
  var x = ockPrep(roId, opId, o); if(!x) return "";
  var m = x.m, st = x.st, mode = x.mode, ro = x.ro, op = x.op, txt = ockBigTxt(m), ix = ro ? (ro.operations || []).indexOf(op) + 1 : 0;
  var t = [ro && ro.roNumber ? (/^RO/i.test(String(ro.roNumber)) ? "" : "RO ") + ro.roNumber : "", ix ? "Op " + ix : "", op.complaint || "", ro && ro.unitNumber ? "Unit " + ro.unitNumber : ""].filter(Boolean).join(" · ");
  var sig = mode + "|" + (m.mine ? 1 : 0) + "|" + (st.rsn ? st.rsn.pid : "") + "|" + (o.can ? 1 : 0) + "|" + m.q + "|" + m.ps.length;
  return '<div class="' + ockCls(m, mode) + ' ock-fxp" role="dialog" aria-modal="true" aria-label="Focus view" data-sig="' + ockE(sig) + '"' + ockAttrs(roId, opId, o, x) + ">"
    + '<div class="ock-fxt">' + ockE(t) + "</div>" + ockBigHtml(m, txt) + '<div class="ock-lbl">' + ockFxLbl(m) + "</div>" + ockSide(m, st, mode, o, x.nm, true)
    + '<div class="ock-rsn">' + ockRsnHtml(st, m) + '</div><div class="ock-fxk">Esc or tap anywhere to shrink back</div><button type="button" class="ock-fxx" data-ock="fxx" title="Shrink back (Esc)" aria-label="Shrink back (Esc)">' + ockIc("shrink") + "</button></div>";
}
function ockFlip(a, z){ return "translate(" + (a.left - z.left).toFixed(1) + "px," + (a.top - z.top).toFixed(1) + "px) scale(" + (a.width / z.width).toFixed(4) + "," + (a.height / z.height).toFixed(4) + ")"; }
function ockFindCard(key){ var f = null; ockEach(function(c){ if(!f && !c.classList.contains("ock-fxp") && c.getAttribute("data-ro") + "|" + c.getAttribute("data-op") === key) f = c; }); return f; }
function ockFocusOpen(card, anim){
  if(OCK_FX) ockFocusClose(true);
  var root = card.getRootNode ? card.getRootNode() : document, host = root === document || !root.host ? document.body : root;
  var key = card.getAttribute("data-ro") + "|" + card.getAttribute("data-op"), o = ockCardOpts(card);
  var w = document.createElement("div"); w.className = "ock-fx"; w.setAttribute("data-fxk", key);
  w.innerHTML = '<div class="ock-fxs" data-ock="fxx"></div>' + ockFxHtml(card.getAttribute("data-ro"), card.getAttribute("data-op"), o);
  host.appendChild(w); OCK_FX = { key: key, w: w, o: o };
  var p = w.querySelector(".ock-fxp"); if(!p) return;
  if(anim !== false && !ockCalm()){ var a = card.getBoundingClientRect(), z = p.getBoundingClientRect(); p.style.transformOrigin = "0 0"; p.style.transition = "none"; p.style.transform = ockFlip(a, z); p.getBoundingClientRect(); p.style.transition = ""; requestAnimationFrame(function(){ w.classList.add("go"); p.style.transform = ""; }); }
  else w.classList.add("go");
  var x = p.querySelector('[data-ock="fxx"]'); if(x) try{ x.focus({ preventScroll: true }); }catch(e){}
  ockSync();
}
function ockFocusClose(now){
  var F = OCK_FX; if(!F) return; OCK_FX = null;
  var w = F.w, p = w.querySelector(".ock-fxp"), card = ockFindCard(F.key);
  w.style.pointerEvents = "none";
  if(now || ockCalm() || !card || !p){ w.remove(); return; }
  var z = p.getBoundingClientRect(), a = card.getBoundingClientRect(); w.classList.remove("go"); p.style.transformOrigin = "0 0"; p.style.transform = ockFlip(a, z);
  setTimeout(function(){ w.remove(); }, 460);
  var fb = card.querySelector('[data-ock="focus"]'); if(fb) try{ fb.focus({ preventScroll: true }); }catch(e){}
}
/* after a redraw: the focus view follows the card (a new state rebuilds it; the card gone closes it) */
function ockFocusSync(){
  var F = OCK_FX; if(!F) return;
  var card = ockFindCard(F.key);
  if(!card){ if(!F.w.isConnected){ OCK_FX = null; } return; }
  var o = ockCardOpts(card), rk = card.getAttribute("data-ro"), ok = card.getAttribute("data-op");
  if(!F.w.isConnected){ OCK_FX = null; ockFocusOpen(card, false); return; }
  var p = F.w.querySelector(".ock-fxp"), tmp = document.createElement("div"); tmp.innerHTML = ockFxHtml(rk, ok, o);
  var np = tmp.firstElementChild; if(!np) return;
  if(!p || p.getAttribute("data-sig") !== np.getAttribute("data-sig")){ if(p) p.replaceWith(np); else F.w.appendChild(np); np.style.transform = ""; }
  F.o = o;
}
/* ---------- the ticker: every card, in place, on the second ---------- */
function ockSet(el, prop, v){ if(!el) return; if(prop === "cls"){ if(el.className !== v) el.className = v; return; } if(el["_ock" + prop] !== v){ el["_ock" + prop] = v; if(prop === "html") el.innerHTML = v; else el.setAttribute(prop, v); } }
function ockCol(col, v){
  var p = +col.getAttribute("data-v"), b = +col.getAttribute("data-b"); if(p === v) return;
  col.setAttribute("data-v", v);
  var put = function(x){ col.style.transform = "translateY(" + (-x) + "em)"; };
  if(ockCalm()){ put(v); return; }
  if(p === b - 1 && v === 0){ put(b); setTimeout(function(){ if(col.getAttribute("data-v") !== "0") return; col.style.transition = "none"; put(0); void col.offsetHeight; col.style.transition = ""; }, 480); }
  else if(p === 0 && v === b - 1){ col.style.transition = "none"; put(b); void col.offsetHeight; col.style.transition = ""; put(v); }
  else put(v);
}
function ockRoll(big, txt){
  if(big.getAttribute("data-t") === txt) return;
  var rd = big.querySelector(".rd"), cols = rd ? rd.querySelectorAll(".dc") : [];
  big.setAttribute("data-t", txt); big.setAttribute("aria-label", txt);
  if(!rd || big.getAttribute("data-sh") !== ockShape(txt)){ big.setAttribute("data-sh", ockShape(txt)); if(rd) rd.innerHTML = ockDigits(txt); return; }
  var k = 0; txt.split("").forEach(function(c){ if(/\d/.test(c)){ if(cols[k]) ockCol(cols[k], +c); k++; } });
}
function ockFlipFact(el){ if(!el || ockCalm()) return; el.classList.remove("fl"); void el.offsetWidth; el.classList.add("fl"); setTimeout(function(){ el.classList.remove("fl"); }, 500); }
function ockTick(card){
  var roId = card.getAttribute("data-ro"), opId = card.getAttribute("data-op"), op = null; try{ op = getOp(roId, opId); }catch(e){}
  if(!op) return;
  var st = ockState(roId + "|" + opId), mode = card.getAttribute("data-mode"), fx = card.classList.contains("ock-fxp"), can = card.getAttribute("data-can") === "1";
  var m = ockModel(op, card.getAttribute("data-hr"), st.fix ? st.fix.d : 0);
  if(m.run !== (mode === "run")) return;                                   /* a redraw is on its way */
  var gob = card.querySelector('.ock-pb[data-ock="go"]'); if(gob && !!m.mine !== gob.classList.contains("on")) return;
  ockTrack(st, m, null);
  ockSet(card, "cls", ockCls(m, mode) + (fx ? " ock-fxp" : ""));
  var big = card.querySelector('[data-ock="big"]'); if(big) ockRoll(big, ockBigTxt(m));
  var lb = card.querySelector(".ock-lbl"); if(lb) ockSet(lb, "html", fx ? ockFxLbl(m) : ockLbl(m, mode, m.ps.length, can, st));
  var p = card.querySelector(".ock-ring .p"); if(p){ var rg = ockRing(m); p.style.strokeDashoffset = rg.off; p.style.setProperty("--rc", rg.col); }
  var hn = card.querySelector(".ock-hint"); if(hn && !st.holding){ var ht = st.hint && st.hint.until > m.now ? st.hint.t : m.mine && card.querySelector('.ock-pb[data-ock="go"]') ? "Hold to stop" : ""; if(hn.textContent !== ht) hn.textContent = ht; }
  if(fx) return;
  var ro = null; try{ ro = getRO(roId); }catch(e){}
  var sim = ockSim(op), up = ockUpInfo(m, ro), sc = ockScale(m, sim), q;
  var sg = card.querySelector(".ock-segs");
  if(sg){ var L = ockSegs(m, sc);
    if(sg.children.length !== L.length) sg.innerHTML = ockSegHtml(L);
    else L.forEach(function(x, i){ var e = sg.children[i]; e.style.cssText = x.css; e.classList.toggle("live", !!x.live); e.classList.toggle("z", !!x.z); if(e.getAttribute("title") !== x.t) e.setAttribute("title", x.t); if((e.getAttribute("data-w") || "") !== x.ini){ if(x.ini) e.setAttribute("data-w", x.ini); else e.removeAttribute("data-w"); } }); }
  var pw = card.querySelector(".ock-pins");
  if(pw){ var PN = ockPins(m, sc), pk = ockPinsKey(PN);
    if(pw.getAttribute("data-k") !== pk){ pw.setAttribute("data-k", pk); pw.innerHTML = ockPinsHtml(PN); }
    else PN.forEach(function(x, i){ var e = pw.children[i], v = x.left.slice(5); if(e && e.style.left !== v) e.style.left = v; }); }
  var bar = ockBar(m, sc, sim, up);
  ["ov", "gh", "qt", "band", "bu", "here", "up"].forEach(function(k){ var e = card.querySelector(".ock-" + k); if(e) e.style.cssText = bar[k]; });
  var bt = ockBandTxt(m, sim), ut = ockUpTxt(m, up);
  if((q = card.querySelector(".ock-here"))) q.classList.toggle("out", !!sim && bt.z !== "in");
  if((q = card.querySelector(".ock-up"))){ var uh = !!up && m.h >= up.fu; if(uh && !q.classList.contains("hit")){ q.classList.add("hit"); if(st.upZ === "a") ockFlipFact(q); } else if(!uh) q.classList.remove("hit"); }
  var popAt = st.lab && m.now - st.lab.at < 1200 && !ockCalm() ? st.lab.p : 0;
  [0.5, 0.75].forEach(function(pp, i){ var e = card.querySelector('.ock-ms[data-p="' + pp + '"]'); if(!e) return; e.style.cssText = bar.ms[i]; e.classList.toggle("hit", !!st.hit[pp]);
    if(popAt === pp && !e.classList.contains("pop")) e.classList.add("pop"); else if(popAt !== pp) e.classList.remove("pop"); });
  if((q = card.querySelector(".ock-qt"))){ if(popAt === 1) q.classList.add("pop"); else q.classList.remove("pop"); }
  var ba = card.querySelector(".ock-bar"); if(ba) ba.setAttribute("aria-label", m.q > 0 ? Math.round(m.h / m.q * 100) + "% of quoted" : m.h.toFixed(2) + " h, no quote");
  /* the facts: a fact that changes its sense flips */
  var mineRun = m.run && m.runs.some(function(r){ return ockSame(r.by || "", ockMe()); });
  var fp = card.querySelector('[data-f="pace"]'); if(fp) ockSet(fp, "html", ockFact("pace", "clock", ockPace(m)));
  var fu = card.querySelector('[data-f="up"]'); if(fu){ ockSet(fu, "html", ockFact("up", "gauge", ut.t)); if(st.upZ && ut.z && st.upZ !== ut.z) ockFlipFact(fu); st.upZ = ut.z; }
  var fb = card.querySelector('[data-f="band"]'); if(fb){ ockSet(fb, "html", ockFact("band", "similar", bt.t)); if(st.bandZ && bt.z && st.bandZ !== bt.z) ockFlipFact(fb); st.bandZ = bt.z; }
  var fl = card.querySelector('[data-f="lunch"]'); if(fl) ockSet(fl, "html", ockFact("lunch", "moon", ockLunchTxt(m, mineRun)));
  /* the chips are patched, not rebuilt, so their animations run once */
  var wb = card.querySelector(".ock-whos");
  if(wb){ var wk = ockWhoKey(m); if(wb.getAttribute("data-k") !== wk){ wb.setAttribute("data-k", wk); wb.innerHTML = ockWhoHtml(m, st); }
    else m.runs.forEach(function(r, i){ var t = wb.children[i] && wb.children[i].querySelector(".m"), v = ockMs((m.now - new Date(r.start) + (r === m.mine ? m.fx : 0)) / 1000); if(t && t.textContent !== v) t.textContent = v; }); }
  var ov = card.querySelector(".ock-ovs");
  if(ov){ var chip = ov.firstElementChild; if(m.over && !chip) ov.innerHTML = ockOvHtml(m, st); else if(!m.over && chip) ov.innerHTML = ""; else if(chip){ var s2 = chip.querySelector("span"), ot = ockOvTxt(m); if(s2 && s2.textContent !== ot) s2.textContent = ot; } }
  var ml = card.querySelector(".ock-mls");
  if(ml){ var cur = ml.firstElementChild, want = st.lab && m.now - st.lab.at < OCK_LABMS ? String(st.lab.p) : "";
    if(want !== (cur ? cur.getAttribute("data-p") : "")) ml.innerHTML = want ? ockMlHtml(m, st) : ""; }
  var bk = card.querySelector(".ock-bk"); if(bk && bk.firstElementChild && !ockBackHtml(m)) bk.innerHTML = "";
  var ng = card.querySelector(".ock-ng");
  if(ng){ var ni = ockNudgeInfo(m, can, st), nb = ng.firstElementChild;
    if(ni && !nb) ng.innerHTML = ockNudgeHtml(ni, st, m.now); else if(!ni && nb){ ng.innerHTML = ""; st.nudgeAt = 0; } else if(ni && nb){ var ns = nb.querySelector("span"), nt = "No note for " + ni.min + " min — add one?"; if(ns && ns.textContent !== nt) ns.textContent = nt; } }
  var lc = card.querySelector('[data-ock="lapc"]'); if(lc){ var lt = ockLapCur(m); if(lc.textContent !== lt) lc.textContent = lt; }
  var kv = ockKv(m), kb = card.querySelector('[data-ock="kb"]'), kk = card.querySelector('[data-ock="kk"]'), kl = card.querySelector('[data-ock="kl"]'), ke = card.querySelector('[data-ock="ke"]');
  if(kb) ockSet(kb, "html", kv.b); if(kk && kk.textContent !== kv.lk) kk.textContent = kv.lk;
  if(kl){ ockSet(kl, "html", kv.l); if(kl.className !== kv.lc) kl.className = kv.lc; }
  if(ke){ ockSet(ke, "html", kv.e); if(ke.className !== kv.ec) ke.className = kv.ec; }
}
/* the endless ones (breathing, the live edge, the stripes, the colons, the live dot, the shimmer) keep one beat: a redraw that
   makes a new element picks up where the old one was instead of starting over */
function ockSync(){
  OCK_RAF = 0;
  try{ ockFocusSync(); }catch(e){ console.error(e); }
  ockEach(function(card){ if(!card.getAnimations) return; card.getAnimations({ subtree: true }).forEach(function(a){ if(OCK_INF[a.animationName] && !a._ockL){ a._ockL = 1; try{ a.startTime = 0; }catch(e){} } }); });
}
function ockTickAll(){ ockEach(function(c){ try{ ockTick(c); }catch(e){ console.error(e); } }); ockSync(); }
/* ---------- lunch and the end of the day: your running clock pauses itself at lunch and starts again after; the end of the day only says so (Parsec 14.9) ---------- */
function ockAuto(){
  var now = Date.now(), prev = OCK_LAST; OCK_LAST = now;
  if(!prev || now - prev > 120000 || now <= prev) return;          /* only while the page is open and awake */
  var d = ockDay(now), me = ockMe(); if(!d || !me) return;
  var rp = null; try{ rp = runningPunch(); }catch(e){}
  var mine = rp && ockSame(rp.by || "", me);
  /* Parsec 15: the shop's lunch time pauses nothing — the Lunch time reminder asks after 4 hours on the clock (b9/v150b.js) */
  if(mine && prev < d.z && now >= d.z){ ockToast("The shift ended at " + ockClk(d.z) + " — your clock keeps running. Stop it when you’re done."); return; }   /* Parsec 14.9: the end of the shift stops nothing */
  if(false && !rp && prev < d.lz && now >= d.lz){   /* Parsec 15: nothing paused it, so nothing starts it again */
    var L = (STATE.punches || []).filter(function(p){ return p.autoPause === "lunch" && p.stop && ockSame(p.by || "", me) && Math.abs(new Date(p.stop) - d.la) < 180000; });
    var p = L[L.length - 1]; if(!p) return;
    if((STATE.punches || []).some(function(x){ return x !== p && ockSame(x.by || "", me) && new Date(x.start) >= new Date(p.stop); })) return;
    try{ doStartPunch(p.roId, p.opId, p.startReason); }catch(e){ return; }
    var np = null; try{ np = runningPunch(); }catch(e){}
    if(np && np.opId === p.opId){ np.autoResume = true; try{ scheduleSave(true); }catch(e){} var op = null; try{ op = getOp(p.roId, p.opId); }catch(e){} ockToast("Back from lunch — your clock started again" + (op && op.complaint ? " on " + op.complaint : "") + ".", true); }
    try{ if(typeof JC !== "undefined" && JC && JC.rerender) JC.rerender(); }catch(e){}
  }
}
(function ockLoop(){ setTimeout(function(){ try{ if(typeof STATE !== "undefined" && STATE){ ockAuto(); ockTickAll(); } }catch(e){} ockLoop(); }, 1000 - (Date.now() % 1000) + 8); })();
