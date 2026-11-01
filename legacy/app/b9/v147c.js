/* ============================== Parsec 14.7 (C) — Completed ROs kept per person · the lunch reminder ==============================
   · STATE.tcDone: one line per operation someone completed — the RO, its customer, truck and unit, the operation, their hours,
     when. Written on every save (and just before an RO is deleted), filled in once from the punches already there. The
     Technician page's Completed section reads it, so an RO stays there after it's transferred or deleted.
   · Lunch · 1 hour (and the 30-minute lunch): no clock-in by itself — when the time's up, a card on every page:
     "Lunch is over" · Clock in now · 5 more minutes. */
var V147C = { scanAt: 0, snz: {}, el: null, t: 0 };
function v147DoneList(){ if(!Array.isArray(STATE.tcDone)) STATE.tcDone = []; return STATE.tcDone; }
function v147Truck(ro){ var t = ""; try{ t = truckLine(ro); }catch(e){} if(!t || t === "this truck") t = [ro.year, ro.make, ro.model].filter(Boolean).join(" "); return t || ""; }
/* the operations of one RO that are complete: who completed each (the punch that stopped as Complete, else the last punch, else the RO's tech) */
function v147Rec(ro, P){
  if(!ro || ro.shop || ro.id === SHOP_RO_ID) return 0;
  var L = v147DoneList(), n = 0, cut = Date.now() - 120 * 864e5, no = "";
  try{ no = tgNum(ro); }catch(e){ no = "RO " + (ro.roNumber || ""); }
  (ro.operations || []).forEach(function(op, i){
    if(!op || op.declined) return; var done = false; try{ done = opDoneNow(op); }catch(e){} if(!done) return;
    var ps = (P ? (P[op.id] || []) : (STATE.punches || []).filter(function(p){ return p.opId === op.id; })).slice().sort(function(a, b){ return new Date(a.start) - new Date(b.start); });
    var cp = ps.filter(function(p){ return p.stop && /^Complete/.test(p.stopReason || ""); }).pop(), lp = ps.filter(function(p){ return p.stop; }).pop();
    var who = (cp && punchWho(cp)) || (lp && punchWho(lp)) || ro.assignedTech || ""; if(!who) return;
    var at = (cp && cp.stop) || (op.jobStatus && /^Complete/.test(op.jobStatus.status || "") && op.jobStatus.setAt) || (lp && lp.stop) || ro.dateClosed || nowIso();
    var k = ro.id + "|" + op.id + "|" + who, e = null; for(var j = 0; j < L.length; j++){ if(L[j].k === k){ e = L[j]; break; } }
    if(!e && +new Date(at) < cut) return;                       /* the first fill-in goes back 120 days */
    var ms = 0; ps.forEach(function(p){ if(techSame(punchWho(p), who)) ms += Math.max(0, (p.stop ? +new Date(p.stop) : Date.now()) - new Date(p.start)); });
    var snap = { k: k, tech: who, roId: ro.id, opId: op.id, no: no, cust: ro.customerName || "", truck: v147Truck(ro), unit: ro.unitNumber || "", opn: i + 1, cmp: op.complaint || "Operation", hrs: Math.round(ms / 36e3) / 100, q: +op.quoted || 0, at: at };
    if(!e){ L.push(snap); n++; }
    else { for(var f in snap) e[f] = snap[f]; }   /* keep it current while the RO is here */
  });
  return n;
}
function v147Scan(force){
  var now = Date.now(); if(!force && now - V147C.scanAt < 1500) return 0; V147C.scanAt = now;
  if(typeof STATE === "undefined" || !STATE || !Array.isArray(STATE.ros)) return 0;
  var P = {}; (STATE.punches || []).forEach(function(p){ (P[p.opId] || (P[p.opId] = [])).push(p); });
  var n = 0; STATE.ros.forEach(function(ro){ try{ n += v147Rec(ro, P); }catch(e){} });
  return n;
}

/* ---------- the lunch reminder ---------- */
function v147LunState(){
  var t = null; try{ var m = PG.me(); t = m && m.tech ? m.tech : null; }catch(e){} if(!t) return null;
  var me = ""; try{ me = String(pcMe() || t); }catch(e){ me = t; }
  try{ if(openShiftOf(me)) return null; }catch(e){ return null; }
  var L = []; try{ L = shiftsOfPerson(todayStr(), me); }catch(e){} var s = L[L.length - 1];
  if(!s || !s.out || s.outReason !== "Lunch" || !s.backBy) return null;
  var now = Date.now(), back = +new Date(s.backBy); if(now < back || now < (V147C.snz[s.id] || 0)) return null;
  return { t: t, me: me, sh: s, out: +new Date(s.out), back: back };
}
function v147HM(ms){ var d = new Date(ms); return String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0"); }
function v147LunHtml(N){
  var nm = ""; try{ nm = PG.first(N.t); }catch(e){ nm = String(N.t).split(" ")[0]; }
  var e = function(x){ return String(x).replace(/[&<>"]/g, function(c){ return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
  return '<div class="v146-card v147-lun" role="status" aria-live="polite"><b>Lunch is over, ' + e(nm) + '</b><small>You clocked out at ' + v147HM(N.out) + ' · back by ' + v147HM(N.back) + '</small><div class="r">'
    + '<button type="button" class="v146-b pri" data-v147="in">Clock in now</button><button type="button" class="v146-b" data-v147="snz">5 more minutes</button></div></div>';
}
function v147Host(){
  if(V147C.el && document.body.contains(V147C.el)) return V147C.el;
  var w = document.createElement("div"); w.id = "v147"; w.className = "v146 v147"; w.hidden = true;
  w.addEventListener("click", function(ev){
    var b = ev.target.closest && ev.target.closest("[data-v147]"); if(!b) return;
    var k = b.getAttribute("data-v147"), N = v147LunState();
    if(k === "in"){ try{ shiftClockIn(); }catch(e){} }
    else if(k === "snz" && N){ V147C.snz[N.sh.id] = Date.now() + 5 * 60000; try{ pushToast("OK — it reminds you again at " + v147HM(V147C.snz[N.sh.id]) + "."); }catch(e){} }
    v147Tick();
  });
  document.body.appendChild(w); V147C.el = w; return w;
}
function v147Tick(){
  var h = "";
  try{ var out = false; try{ out = typeof pxOut === "function" && pxOut(); }catch(e){} if(!out){ var N = v147LunState(); if(N) h = v147LunHtml(N); } }catch(e){ h = ""; }
  if(!h && !V147C.el) return;
  var w = v147Host();
  var o = typeof V146 !== "undefined" && V146.el && !V146.el.hidden && V146.el.offsetHeight ? V146.el.offsetHeight + 24 : 16;   /* above 14.6's cards if they show too */
  w.style.bottom = h && o > 16 ? o + "px" : "";
  if(w.getAttribute("data-h") === h) return;
  w.setAttribute("data-h", h); w.innerHTML = h; w.hidden = !h;
}
function v147Soon(){ clearTimeout(V147C.t); V147C.t = setTimeout(v147Tick, 0); }
setInterval(function(){ try{ v147Tick(); }catch(e){} }, 30000);
