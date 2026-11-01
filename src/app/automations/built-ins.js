/* Parsec · automations · built-ins.js
   The six built-ins of 16.2 (parts in → tell the tech, waiting on the customer, ready to release, ask before starting without the part, past the quote, warranty claims) with their thresholds, who gets told, the What ran log with Undo, and the Automations page.
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   v162Cfg v162E v162Num v162Thr v162ThrSet v162Person v162Foreman v162Advisor v162WaAdmin v162TechOf v162First v162OpN … (47 functions, 7 constants)
   state      autoFired autoLog punches ros
   uses       access/ data/ import/ kit/ pages/ pages/inbox/ pages/triage/ pages/warranty/ ro/ ro-page/ shell/ state/
   at load    on document change · on document keydown · wraps autoApplyActs · wraps autoRun · a timer · wraps doStartPunch · wraps automationsModalBody · wraps amAction · on document click
*/
/* ============================== Parsec 16.2 (A) — better automations ==============================
   Six more built-ins next to Status sync and Parts → status, each with its switch (on by default) and its threshold:
     partsIn   a part comes in (Received / Staged)            → the technician on that operation and the foreman
     waitCust  the RO has waited on the customer 4 h           → the advisor
     ready     the RO is ready to release (Complete – Road test) → the advisor and the foreman
     askStart  Start on an operation whose part isn't in        → asks first ("Start anyway?"); the 14.x part locks still stop a repair
     overQuote a running clock reaches 100 % of the quote        → the foreman
     warranty  a claim near its filing / resubmit deadline, with no answer, or approved and not paid
               (the Warranty page's own days)                   → the warranty admin and the advisor
   Messages go through the Inbox (IB.send), from Parsec, each with Open the RO. A reminder is sent once: its key goes in
   STATE.autoFired and comes out when the condition clears, so it can be sent again the next time. The first look at a
   shop marks what is already true without sending anything.
   The log: every automated action — these six, Status sync, Parts → status, your rules — writes one line to
   STATE.autoLog { id, at, rule, rk, what, roId, opId, undo } (about 500 lines / 30 days). Settings › Automations shows it
   as "What ran" (today, then earlier, newest first, filter by rule) with Undo on each line: a status goes back, a message
   leaves the Inbox, a field gets its old value. When something changed the same thing since, Undo is greyed and says why.
   The page: autoPageHtml() returns it (built-ins, custom rules, What ran); autoPageMount(el) fills an element. */
var V162 = { busy: false, t: 0, last: 0, oks: {}, asking: null, lf: "all", more: 0, page: { type: "automations", edit: null } };
var V162_RULES = [
  ["partsIn", "Parts in → tell the tech", "A part for an open operation comes in → a note to the technician on that operation and the foreman.", "Tells the tech on the op · the foreman"],
  ["waitCust", "Waiting on the customer too long", "The RO has waited on the customer with no update → a reminder to the advisor.", "Tells the advisor"],
  ["ready", "Ready to release → tell the advisor", "The RO is ready to release (Complete – Road test) → a note to the advisor and the foreman.", "Tells the advisor · the foreman"],
  ["askStart", "Starting an op whose part isn’t in", "Start on an operation with a part not in yet asks first — “Op 2’s NOx sensor isn’t in yet (Ordered · ETA Fri). Start anyway?” Once per operation. The part locks still stop a repair.", "Asks whoever starts the clock"],
  ["overQuote", "Past the quoted time, while the clock runs", "A running clock reaches its share of the quote → a note to the foreman.", "Tells the foreman"],
  ["warranty", "Chase warranty claims on time", "A claim close to its filing or resubmit deadline, with no answer, or approved and not paid → a reminder to the warranty admin and the advisor.", "Tells the warranty admin · the advisor"]
];
var V162_LBL = { status: "Status sync", parts: "Parts → status", partsIn: "Parts in → tell the tech", waitCust: "Waiting on the customer", ready: "Ready to release",
  askStart: "Ask before it starts", overQuote: "Past the quoted time", warranty: "Chase warranty claims" };
V162_RULES.forEach(function(r){ AUTO_BUILTINS.push([r[0], r[1], r[2]]); });

/* ---------- settings ---------- */
function v162Cfg(){
  var a = autoCfg(), b = a.builtin;
  V162_RULES.forEach(function(r){ if(!Object.prototype.hasOwnProperty.call(b, r[0])) b[r[0]] = true; });
  if(!a.thr || typeof a.thr !== "object" || Array.isArray(a.thr)) a.thr = {};
  if(!(+a.thr.waitH > 0)) a.thr.waitH = 4;
  if(!(+a.thr.overPct > 0)) a.thr.overPct = 100;
  return a;
}
function v162E(t){ return String(t == null ? "" : t).replace(/[&<>"]/g, function(c){ return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
function v162Num(n){ n = Math.round((+n || 0) * 10) / 10; return String(n); }
/* the threshold and who it tells, under each new built-in's words */
function v162Thr(k){
  var r = V162_RULES.filter(function(x){ return x[0] === k; })[0]; if(!r) return "";
  var t = v162Cfg().thr, W = null; try{ W = waCfg(); }catch(e){}
  var inp = function(key, v, lbl, w){ return '<input class="am-in v162-n" data-v162-thr="' + key + '" value="' + v162E(v162Num(v)) + '" inputmode="decimal" aria-label="' + v162E(lbl) + '"' + (w ? ' style="width:' + w + 'px"' : '') + '>'; };
  var h = "";
  if(k === "waitCust") h = 'After ' + inp("waitH", t.waitH, "Hours waiting on the customer") + ' h with no update';
  if(k === "overQuote") h = 'At ' + inp("overPct", t.overPct, "Percent of the quote", 58) + ' % of the quote';
  if(k === "warranty" && W) h = 'No answer for ' + inp("wa.claim", W.claim, "Days with no answer") + ' days · approved, not paid for ' + inp("wa.paid", W.paid, "Days approved and not paid") + ' days<em>Filing and resubmitting: 3 days before the deadline. The same days as the Warranty page’s settings.</em>';
  return '<span class="v162-x">' + (h ? '<span class="v162-thr">' + h + '</span>' : '') + '<span class="v162-to">' + v162E(r[3]) + '</span></span>';
}
function v162ThrSet(t){
  if(typeof can === "function" && viewAsStaff() && !can("a.settings")){ try{ permDeny("a.settings"); }catch(e){} render(); return; }
  var k = t.getAttribute("data-v162-thr"), v = parseFloat(String(t.value || "").replace(",", "."));
  var lim = { waitH: [0.5, 168], overPct: [50, 300], "wa.claim": [1, 120], "wa.paid": [1, 120] }[k]; if(!lim) return;
  if(!(v > 0)){ render(); return; }
  v = Math.max(lim[0], Math.min(lim[1], v)); if(k !== "waitH") v = Math.round(v);
  pushUndo("automation setting");
  if(k === "wa.claim" || k === "wa.paid"){ waCfg()[k.slice(3)] = v; }
  else v162Cfg().thr[k] = v;
  scheduleSave(true); render();
}
document.addEventListener("change", function(e){ var t = e.target; if(t && t.getAttribute && t.getAttribute("data-v162-thr")){ e.stopImmediatePropagation(); v162ThrSet(t); } });
document.addEventListener("keydown", function(e){ var t = e.target; if(e.key === "Enter" && t && t.getAttribute && t.getAttribute("data-v162-thr")){ e.preventDefault(); t.blur(); } });

/* ---------- who ---------- */
function v162Person(role){ try{ return PG.person(role) || ""; }catch(e){ return ""; } }
function v162Foreman(){ return v162Person("Foreman") || v162Person("Manager"); }
function v162Advisor(ro){ var a = ro && ro.advisor; if(a) return a; try{ a = rtPerson("writer"); }catch(e){} return a || v162Person("Service writer"); }
function v162WaAdmin(){ var a = v162Person("Warranty admin"); if(a) return a; try{ return rtPerson("warranty") || ""; }catch(e){ return ""; } }
function v162TechOf(ro, op){
  var w = op && (op.tech || op.assignedTo); if(w) return w;
  var ps = (STATE.punches || []).filter(function(p){ return op && p.opId === op.id && p.by; }).sort(function(a, b){ return new Date(b.start) - new Date(a.start); });
  return (ps[0] && ps[0].by) || (ro && ro.assignedTech) || "";
}
function v162First(n){ try{ return PG.first(n); }catch(e){ return String(n || "").split(/\s+/)[0]; } }
function v162OpN(ro, op){ try{ var n = raN(ro, op); if(n > 0) return n; }catch(e){} return (ro.operations || []).indexOf(op) + 1; }
function v162PartName(p){ return String((p && (p.description || p.partNumber)) || "part").trim(); }
function v162Eta(eta){
  var m = /^(\d{4})-(\d\d)-(\d\d)/.exec(String(eta || "")); if(!m) return "";
  var d = new Date(+m[1], +m[2] - 1, +m[3]), t = new Date(); t.setHours(0, 0, 0, 0);
  var n = Math.round((d - t) / 864e5);
  if(n === 0) return "today"; if(n === 1) return "tomorrow";
  if(n > 1 && n < 7) return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][d.getDay()];
  var md = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return n < 0 ? "was due " + (n === -1 ? "yesterday" : md) : md;
}
function v162PartSt(p){
  var s = (p && p.status) || "Not Ordered";
  if(s === "Not Ordered") return "Not ordered yet";
  return s + (p.eta ? " · ETA " + v162Eta(p.eta) : "");
}
function v162Clk(t){ try{ return PG.clk(t); }catch(e){ return fmtTime(t); } }

/* ---------- the log ---------- */
function v162LogStore(){ if(!Array.isArray(STATE.autoLog)) STATE.autoLog = []; return STATE.autoLog; }
function v162LogPrune(){
  var L = v162LogStore(), lim = Date.now() - 30 * 864e5, keep = L.filter(function(e){ return e && new Date(e.at).getTime() >= lim; });
  if(keep.length > 500) keep = keep.slice(keep.length - 500);
  if(keep.length !== L.length) STATE.autoLog = keep;
}
function v162RuleOf(rk, name){
  if(V162_LBL[rk]) return V162_LBL[rk];
  if(/^r\./.test(rk || "")){ var id = rk.slice(2), r = null; try{ r = autoCfg().rules.filter(function(x){ return x.id === id; })[0]; }catch(e){} return (r && r.name) || name || "Custom rule"; }
  return name || "Automation";
}
/* one line. e = { rk, what, roId, opId, undo } — or, from the custom-rule runner (b9/v162b.js), { kind: "rule", rule, name, how, ro, op, sg } */
function v162Log(e){
  if(!e || typeof STATE === "undefined" || !STATE) return null;
  if(e.kind === "rule"){
    if(e.how !== "suggest" || !e.sg || !e.ro) return null;   /* an Auto rule's change is logged as it is made (autoApplyActs) */
    e = { rk: e.rule, rule: v162RuleOf(e.rule, e.name), what: "Suggested — " + String(e.sg.text || "").replace(/\?$/, ""), roId: e.ro.id, opId: e.sg.op || "", undo: { k: "sg", ro: e.ro.id, id: e.sg.id } };
  }
  var x = { id: uid("al"), at: nowIso(), rule: e.rule || v162RuleOf(e.rk), rk: e.rk || "", what: e.what || "", roId: e.roId || "", opId: e.opId || "", undo: e.undo || null };
  if(e.to) x.to = e.to;
  v162LogStore().push(x); v162LogPrune();
  return x;
}
function v162Quiet(){ var was = AUTO_SILENT; AUTO_SILENT = true; try{ scheduleSave(true); } finally { AUTO_SILENT = was; } }
function v162J(v){ return v === undefined ? "null" : JSON.stringify(v); }
/* what a later change is compared on: a status or job status by its value and time (not who stamped it) */
function v162Sig(v){
  if(v && typeof v === "object" && !Array.isArray(v)){ var o = {}; Object.keys(v).sort().forEach(function(k){ if(k !== "by") o[k] = v[k]; }); return JSON.stringify(o); }
  return v162J(v);
}
var V162_FIELD = { jobStatus: ["op", "the operation’s status"], work: ["op", "the work log"], techNote: ["ro", "the tech note"], autoReminders: ["ro", "the reminders"] };
var V162_ACT_F = { jobStatus: "jobStatus", stamp: "work", note: "techNote", remind: "autoReminders" };
function v162Cap(ro, a){
  if(a.a === "roStatus") return { a: a, f: "status", tg: ro, prev: v162J(ro.status) };
  var f = V162_ACT_F[a.a]; if(!f) return null;
  var tg = V162_FIELD[f][0] === "op" ? (a.op ? getOp(ro.id, a.op) : null) : ro; if(!tg) return null;
  return { a: a, f: f, tg: tg, prev: v162J(tg[f]) };
}
function v162ActWhat(ro, a, c){
  var op = a.op ? getOp(ro.id, a.op) : null, on = op ? "Op " + v162OpN(ro, op) : "", was = null; try{ was = JSON.parse(c.prev); }catch(e){}
  if(a.a === "roStatus") return roLabel(ro) + " → " + a.v + (a.sub ? " · " + a.sub : "") + (was && was.status ? " (was " + was.status + (was.sub ? " · " + was.sub : "") + ")" : "");
  if(a.a === "jobStatus") return roLabel(ro) + " " + on + " → " + a.v + (was && was.status ? " (was " + was.status + ")" : "");
  if(a.a === "stamp") return roLabel(ro) + " " + on + " work log: “" + String(a.v || "").slice(0, 80) + "”";
  if(a.a === "note") return roLabel(ro) + " tech note: “" + String(a.v || "").slice(0, 80) + "”";
  if(a.a === "remind") return roLabel(ro) + " reminder: “" + String(a.v || "").slice(0, 80) + "”";
  return roLabel(ro) + " " + a.a;
}
function v162RkOf(sg){
  var k = String((sg && sg.key) || "").split("|")[0];
  if(k === "ro.auto" || sg.rule === "RO status" || sg.rule === "Status sync") return "status";
  if(/^b\.p/.test(k) || sg.rule === "Parts → status") return "parts";
  return k || "auto";
}
/* every change an automation makes, as it makes it */
autoApplyActs = (function(o){ return function(ro, sg, viaAuto){
  if(!viaAuto || !ro || !sg || !Array.isArray(sg.acts)) return o.apply(this, arguments);
  var caps = sg.acts.map(function(a){ try{ return v162Cap(ro, a); }catch(e){ return null; } });
  var r = o.apply(this, arguments);
  try{
    var rk = v162RkOf(sg), n = 0;
    caps.forEach(function(c){
      if(!c) return;
      var now = c.f === "status" ? ro.status : c.tg[c.f];
      if(v162Sig(now) === v162Sig(JSON.parse(c.prev))) return;   /* it changed nothing (a gated status) */
      v162Log({ rk: rk, rule: v162RuleOf(rk, sg.rule), what: v162ActWhat(ro, c.a, c), roId: ro.id, opId: c.a.op || sg.op || "",
        undo: c.f === "status" ? { k: "status", ro: ro.id, prev: c.prev, now: v162Sig(ro.status) } : { k: "field", ro: ro.id, op: V162_FIELD[c.f][0] === "op" ? c.a.op : "", f: c.f, prev: c.prev, now: v162Sig(now) } });
      n++;
    });
    if(n) v162Quiet();
  }catch(e){ console.error(e); }
  return r;
}; })(autoApplyActs);

/* ---------- the six: what holds right now ---------- */
function v162WaitSince(ro){
  var t = ro.status && ro.status.setAt ? new Date(ro.status.setAt).getTime() : 0;
  (ro.contacts || []).forEach(function(c){ var x = c && c.at ? new Date(c.at).getTime() : 0; if(x > t) t = x; });
  return t || 0;
}
function v162WaLate(ro, op, s){
  var C = waCfg();
  if(s === "ready"){ var l = waFileLeft(ro, op); if(l != null && l <= 3) return { k: "file", left: l }; }
  if(s === "returned"){ var l2 = waResLeft(op); if(l2 != null && l2 <= 3) return { k: "resub", left: l2 }; }
  if(s === "submitted" || s === "appealed"){ var a = waAgo(waAt(op, s)); if(a != null && a >= C.claim) return { k: "claim", days: Math.floor(a) }; }
  if(s === "approved"){ var a2 = waAgo(waAt(op, "approved")); if(a2 != null && a2 >= C.paid) return { k: "paid", days: Math.floor(a2) }; }
  return null;
}
function v162Conds(cfg){
  var L = [], now = Date.now(), thr = cfg.thr;
  (STATE.ros || []).forEach(function(ro){
    if(!ro || ro.id === SHOP_RO_ID || ro.shop || roIsDone(ro)) return;
    var st = roStatus(ro).status;
    if(st === "Waiting – Customer"){ var since = v162WaitSince(ro); if(since && (now - since) / 3600000 >= thr.waitH) L.push({ key: "wc:" + ro.id, rule: "waitCust", go: true, ro: ro, since: since }); }
    if(st === "Complete – Road test") L.push({ key: "rd:" + ro.id, rule: "ready", go: true, ro: ro });
    (ro.operations || []).forEach(function(op){
      if(!op || op.declined) return;
      opRealParts(op).forEach(function(p){
        if(!pxPartIn(p)) return;
        var fresh = p.status === "Received" || p.status === "Staged";
        L.push({ key: "pi:" + p.id, rule: "partsIn", go: fresh, quiet: !fresh, ro: ro, op: op, part: p });
      });
      var q = +op.quoted || 0;
      if(q > 0){
        var c = opCalc(op);
        if(c.burntHrs >= q * thr.overPct / 100 - 1e-9){
          var rp = (STATE.punches || []).filter(function(p){ return p.opId === op.id && !p.stop; })[0];
          L.push({ key: "oq:" + op.id, rule: "overQuote", go: !!rp, ro: ro, op: op, burnt: c.burntHrs, q: q, punch: rp });
        }
      }
    });
  });
  try{ waAllOps().forEach(function(x){ var s = waSt(x.ro, x.op), w = v162WaLate(x.ro, x.op, s); if(w) L.push({ key: "wa:" + x.op.id + ":" + s, rule: "warranty", go: true, ro: x.ro, op: x.op, wa: w, st: s }); }); }catch(e){}
  return L;
}
/* ---------- sending ---------- */
function v162Msgs(c){
  var ro = c.ro, op = c.op, no = tgNum(ro), cu = ro.customerName || "", n = op ? v162OpN(ro, op) : 0, M = [];
  if(c.rule === "partsIn"){
    var p = c.part, t = "Part in for " + no + " — " + v162PartName(p) + (p.bin ? " · " + p.bin : ""), b = "Op " + n + " · " + (op.complaint || "Operation") + (cu ? " · " + cu : "");
    M.push({ to: v162TechOf(ro, op), who: "tech", k: "fyi", src: "parts", t: t, b: b + ". It’s in hand — the job can go ahead." });
    M.push({ to: v162Foreman(), who: "foreman", k: "fyi", src: "parts", t: t, b: b + (v162TechOf(ro, op) ? ". " + v162First(v162TechOf(ro, op)) + " has been told." : ".") });
  }
  if(c.rule === "waitCust"){
    var h = Math.floor((Date.now() - c.since) / 3600000);
    M.push({ to: v162Advisor(ro), who: "advisor", k: "rem", src: "triage", t: no + " has waited on " + (cu || "the customer") + " for " + h + " h",
      b: "Waiting – Customer since " + v162Clk(new Date(c.since).toISOString()) + " with no update. Call them for an answer, then log the call." });
  }
  if(c.rule === "ready"){
    M.push({ to: v162Advisor(ro), who: "advisor", k: "fyi", src: "triage", t: no + " is ready to release", b: (cu ? cu + " — call" : "Call") + " them to pick it up." });
    M.push({ to: v162Foreman(), who: "foreman", k: "fyi", src: "foreman", t: no + " is ready to release", b: (cu ? cu + " · " : "") + "every operation is complete — the advisor has been told." });
  }
  if(c.rule === "overQuote"){
    var tech = c.punch ? (c.punch.by || v162TechOf(ro, op)) : v162TechOf(ro, op), pct = Math.round(c.burnt / c.q * 100);
    M.push({ to: v162Foreman(), who: "foreman", k: "rem", src: "foreman", t: no + " Op " + n + " is past its quote — " + c.burnt.toFixed(1) + " of " + c.q.toFixed(1) + " h",
      b: (tech ? v162First(tech) + "’s" : "The") + " clock is still running" + (c.punch && c.punch.startReason ? " · " + c.punch.startReason : "") + " · " + pct + "% of the quote. " + (op.complaint || "") });
  }
  if(c.rule === "warranty"){
    var w = c.wa, cn = (op.claim && op.claim.claimNo) ? "Claim " + op.claim.claimNo : "The claim", tt, bb;
    if(w.k === "file"){ tt = "File the claim for " + no + " Op " + n + " — " + (w.left < 0 ? "past the deadline" : w.left === 0 ? "due today" : w.left + " day" + (w.left === 1 ? "" : "s") + " left"); bb = "The repair is done and nothing is filed yet. " + (op.complaint || ""); }
    else if(w.k === "resub"){ tt = "Resubmit " + cn.toLowerCase().replace(/^claim /, "claim ") + " for " + no + " — " + (w.left < 0 ? "past the deadline" : w.left === 0 ? "due today" : w.left + " day" + (w.left === 1 ? "" : "s") + " left"); bb = "It came back and isn’t resubmitted yet. " + (op.complaint || ""); }
    else if(w.k === "claim"){ tt = cn + " on " + no + " has had no answer for " + w.days + " days"; bb = "Submitted " + waWhen(waAt(op, c.st)) + " — chase it with Volvo."; }
    else { tt = cn + " on " + no + " is approved but not paid — " + w.days + " days"; bb = "Approved " + waWhen(waAt(op, "approved")) + " — chase the payment."; }
    M.push({ to: v162WaAdmin(), who: "warranty", k: "rem", src: "warranty", t: tt, b: bb });
    M.push({ to: v162Advisor(ro), who: "advisor", k: "rem", src: "warranty", t: tt, b: bb });
  }
  return M;
}
var V162_SAY = {
  partsIn: function(c){ return v162PartName(c.part) + " is in for " + roLabel(c.ro) + " Op " + v162OpN(c.ro, c.op); },
  waitCust: function(c){ return roLabel(c.ro) + " has waited on the customer " + Math.floor((Date.now() - c.since) / 3600000) + " h"; },
  ready: function(c){ return roLabel(c.ro) + " is ready to release"; },
  overQuote: function(c){ return roLabel(c.ro) + " Op " + v162OpN(c.ro, c.op) + " at " + c.burnt.toFixed(1) + " of " + c.q.toFixed(1) + " h with the clock running"; },
  warranty: function(c){ var w = c.wa; return roLabel(c.ro) + " Op " + v162OpN(c.ro, c.op) + " claim — " + (w.k === "file" ? "file it" : w.k === "resub" ? "resubmit it" : w.k === "claim" ? "no answer for " + w.days + " days" : "approved, not paid for " + w.days + " days"); }
};
function v162Fire(c){
  var ids = [], to = [];
  v162Msgs(c).forEach(function(m){
    if(!m.to || to.some(function(x){ return techSame(x, m.to); })) return;
    var it = IB.send({ to: m.to, from: "Parsec", k: m.k, src: m.src, ro: c.ro.id, op: c.op ? c.op.id : null, t: m.t, b: m.b, acts: [["Open the RO", "open"]], x: { auto: "v162", rule: c.rule, who: m.who } });
    if(it){ ids.push(it.id); to.push(m.to); }
  });
  try{ IB.flush(); }catch(e){}
  var names = to.map(v162First);
  v162Log({ rk: c.rule, what: (names.length ? "Told " + (names.length > 1 ? names.slice(0, -1).join(", ") + " and " + names[names.length - 1] : names[0]) + " — " : "No one to tell — ") + V162_SAY[c.rule](c),
    roId: c.ro.id, opId: c.op ? c.op.id : "", undo: ids.length ? { k: "msg", ids: ids } : null, to: to });
  return ids.length;
}
/* look now: send what has come true since the last look, re-arm what has cleared */
function v162Check(force){
  if(V162.busy || typeof STATE === "undefined" || !STATE || !Array.isArray(STATE.ros)) return 0;
  try{ if(TAB_LOCKED) return 0; }catch(e){}
  V162.busy = true; V162.last = Date.now();
  var was = AUTO_SILENT;
  try{
    var cfg = v162Cfg(), b = cfg.builtin, F = STATE.autoFired, seed = false, sent = 0, ch = false, live = {};
    if(!F || typeof F !== "object" || Array.isArray(F)){ F = STATE.autoFired = {}; seed = true; ch = true; }
    AUTO_SILENT = true;
    v162Conds(cfg).forEach(function(c){
      live[c.key] = 1;
      if(F[c.key]) return;
      if(seed || c.quiet){ F[c.key] = Date.now(); ch = true; return; }   /* already true when Parsec first looked: nothing to send */
      if(!c.go) return;
      F[c.key] = Date.now(); ch = true;
      if(!b[c.rule]) return;                                            /* switched off: it passes quietly */
      try{ v162Fire(c); sent++; }catch(e){ console.error(e); }
    });
    Object.keys(F).forEach(function(k){ if(!live[k]){ delete F[k]; ch = true; } });
    if(ch || sent) scheduleSave(true);
    if(sent){ try{ if(UI.view === "inbox" || (UI.modal && UI.modal.type === "automations")) render(); }catch(e){} }
    return sent;
  }finally{ AUTO_SILENT = was; V162.busy = false; }
}
function v162Soon(){ if(V162.t) return; V162.t = setTimeout(function(){ V162.t = 0; try{ v162Check(); }catch(e){ console.error(e); } }, 300); }
autoRun = (function(o){ return function(){ var r = o.apply(this, arguments); v162Soon(); return r; }; })(autoRun);
setInterval(function(){ try{ v162Check(); }catch(e){} }, 30000);

/* ---------- Start on an operation whose part isn't in: ask first ---------- */
function v162AskStart(roId, opId, reason, go){
  try{
    if(!v162Cfg().builtin.askStart || roId === SHOP_RO_ID) return false;
    var ro = getRO(roId), op = ro ? getOp(roId, opId) : null;
    if(!ro || ro.shop || !op || op.declined) return false;
    if(typeof can === "function" && viewAsStaff() && !can("t.own")) return false;   /* the start says no on its own */
    if(opPartLock(op, reason)) return false;                                        /* the 14.x part lock speaks for itself */
    var out = opRealParts(op).filter(function(p){ var s = pxSt(p.status || "Not Ordered", "part"); return !pxPartIn(p) && !(s && s.gone); });
    if(!out.length) return false;
    var key = op.id + "|" + out.map(function(p){ return p.id + ":" + (p.status || ""); }).join(",");
    if(V162.oks[key]) return false;                                                 /* answered once — never asked twice */
    if(V162.asking && V141.el && V141.el._v162 && V141.el.isConnected) return true;   /* the question is already up */
    V162.asking = key;
    var n = v162OpN(ro, op), p = out[0], more = out.length - 1;
    var head = "Op " + n + "’s " + v162PartName(p) + (more ? " and " + more + " more part" + (more > 1 ? "s" : "") + " aren’t" : " isn’t") + " in yet (" + v162PartSt(p) + "). Start anyway?";
    var w = pgAsk({ head: head, sub: roLabel(ro) + (ro.customerName ? " · " + ro.customerName : "") + " — " + (op.complaint || "Operation") + ". You won’t be asked again for this operation.",
      list: more ? out.slice(0, 5).map(function(x){ return [v162PartName(x), v162PartSt(x)]; }) : null,
      buttons: [{ k: "go", l: "Start anyway", pri: true }, { k: "no", l: "Cancel" }],
      icon: '<path d="M21 8l-9-5-9 5 9 5 9-5z"/><path d="M3 8v8l9 5 9-5V8"/><path d="M12 13v8"/>' }, function(k){
      V162.asking = null;
      var ok = k === "go";
      if(ok) V162.oks[key] = Date.now();
      try{ v162Log({ rk: "askStart", what: "Asked before " + roLabel(ro) + " Op " + n + " started — " + v162PartName(p) + " not in (" + v162PartSt(p) + ") · " + (ok ? "started anyway" : "not started"), roId: ro.id, opId: op.id, undo: null }); v162Quiet(); }catch(e){}
      if(ok) try{ go(); }catch(e){ console.error(e); }
    });
    if(w) w._v162 = 1;
    return true;
  }catch(e){ console.error(e); V162.asking = null; return false; }
}
doStartPunch = (function(o){ return function(roId, opId, reason){
  if(v162AskStart(roId, opId, reason, function(){ doStartPunch(roId, opId, reason); })) return;
  return o.apply(this, arguments);
}; })(doStartPunch);

/* ---------- Undo, one line at a time ---------- */
function v162UndoOk(e){
  if(!e.undo) return { ok: false, none: true, why: e.rk === "askStart" ? "It only asked — nothing changed" : "Nothing to undo" };
  if(e.undone) return { ok: false, done: true, why: "Undone " + v162Clk(e.undone) + (e.undoneBy ? " by " + v162First(e.undoneBy) : "") };
  var u = e.undo, ro = u.ro ? getRO(u.ro) : null;
  if(u.k === "msg"){
    var s = IB.store(), live = u.ids.filter(function(id){ return s.items.some(function(x){ return x.id === id; }); });
    if(!live.length) return { ok: false, why: "Already gone from the Inbox" };
    var dn = live.filter(function(id){ return s.st[id] && s.st[id].done; });
    if(dn.length === live.length){ var who = s.items.filter(function(x){ return dn.indexOf(x.id) >= 0; }).map(function(x){ return v162First(x.to); }); return { ok: false, why: "Already marked done by " + who.join(" and ") }; }
    return { ok: true };
  }
  if(!ro) return { ok: false, why: "The RO is gone" };
  if(u.k === "status"){
    if(v162Sig(ro.status) !== u.now){ var cs = roStatus(ro); return { ok: false, why: "The status changed since — it’s " + cs.status + (cs.sub ? " · " + cs.sub : "") + " now" }; }
    return { ok: true };
  }
  if(u.k === "field"){
    var tg = u.op ? getOp(ro.id, u.op) : ro; if(!tg) return { ok: false, why: "The operation is gone" };
    if(v162Sig(tg[u.f]) !== u.now) return { ok: false, why: "Changed again since — " + (V162_FIELD[u.f] ? V162_FIELD[u.f][1] : u.f) + " isn’t what it set" };
    return { ok: true };
  }
  if(u.k === "sg"){
    if(!(ro.suggest || []).some(function(x){ return x.id === u.id; })) return { ok: false, why: "Already accepted or dismissed" };
    return { ok: true };
  }
  return { ok: false, why: "Nothing to undo" };
}
function v162Undo(id){
  var e = v162LogStore().filter(function(x){ return x.id === id; })[0]; if(!e) return false;
  var ok = v162UndoOk(e); if(!ok.ok){ pushToast(ok.why); return false; }
  var u = e.undo, ro = u.ro ? getRO(u.ro) : null;
  autoFlush();
  pushUndo("undo " + (e.rule || "automation"));
  if(u.k === "msg"){ var s = IB.store(); s.items = s.items.filter(function(x){ return u.ids.indexOf(x.id) < 0; }); u.ids.forEach(function(i){ delete s.st[i]; }); try{ IB.flush(); }catch(er){} }
  else if(u.k === "status"){   /* the old status itself, as it was (Working too) — it holds like a status picked by hand */
    var pv = null; try{ pv = JSON.parse(u.prev); }catch(er){} if(!pv || !pv.status) pv = { status: "Hold Tech", sub: null, setAt: nowIso() };
    var cur = roStatus(ro), me0 = ""; try{ me0 = PG.me().name; }catch(er){}
    pv.hand = true; try{ pv.base = roOpsKey(ro); }catch(er){} if(me0) pv.by = me0;
    ro.status = pv;
    try{ audit("status", roLabel(ro) + ": " + cur.status + (cur.sub ? " \u00b7 " + cur.sub : "") + " \u2192 " + pv.status + (pv.sub ? " \u00b7 " + pv.sub : "") + " (Undo in What ran)", ro); }catch(er){}
    try{ markStatusFlip(ro); }catch(er){}
  }
  else if(u.k === "field"){ var tg = u.op ? getOp(ro.id, u.op) : ro, v = null; try{ v = JSON.parse(u.prev); }catch(er){} if(v === null) delete tg[u.f]; else tg[u.f] = v; }
  else if(u.k === "sg"){ var sg = (ro.suggest || []).filter(function(x){ return x.id === u.id; })[0]; ro.suggest = (ro.suggest || []).filter(function(x){ return x.id !== u.id; }); if(sg){ if(!ro.sgSeen || typeof ro.sgSeen !== "object") ro.sgSeen = {}; ro.sgSeen[sg.key] = Date.now(); } }
  var me = ""; try{ me = PG.me().name; }catch(er){}
  e.undone = nowIso(); e.undoneBy = me;
  scheduleSave(true);
  try{ render(); }catch(er){} try{ if(typeof JC !== "undefined" && JC && JC.rerender) JC.rerender(); }catch(er){}
  pushToast("Undone — " + e.what, true);
  return true;
}

/* ---------- What ran ---------- */
function v162When(at){
  if(localDay(at) === todayStr()) return v162Clk(at);
  var d = new Date(at); return d.toLocaleDateString("en-US", { weekday: "short", month: "numeric", day: "numeric" }) + " · " + v162Clk(at);
}
function v162LogRow(e){
  var u = v162UndoOk(e), ro = e.roId ? getRO(e.roId) : null;
  var btn = u.ok ? '<button class="btn btn-sm v162-ub" data-action="am-log-undo" data-id="' + v162E(e.id) + '" title="Put back what this changed">Undo</button>'
    : u.none ? '<span class="v162-un">' + v162E(u.why) + '</span>'
    : '<span class="v162-ug"><button class="btn btn-sm v162-ub" disabled aria-disabled="true" title="' + v162E(u.why) + '">Undo</button><small>' + v162E(u.why) + '</small></span>';
  return '<div class="v162-le' + (e.undone ? ' is-undone' : '') + '" data-id="' + v162E(e.id) + '" data-rk="' + v162E(e.rk || "") + '"><time datetime="' + v162E(e.at) + '">' + v162E(v162When(e.at)) + '</time>'
    + '<span class="v162-tx"><b class="v162-rk">' + v162E(e.rule) + '</b><span class="v162-w">' + v162E(e.what) + '</span>'
    + (ro ? '<button class="v162-ro" data-action="am-log-open" data-ro="' + v162E(ro.id) + '" data-op="' + v162E(e.opId || "") + '" title="Open the RO">' + v162E(roLabel(ro)) + '</button>' : '') + '</span>'
    + '<span class="v162-u">' + btn + '</span></div>';
}
function v162LogHtml(){
  v162LogPrune();
  var L = v162LogStore().slice().reverse(), rules = [];
  L.forEach(function(e){ if(rules.indexOf(e.rule) < 0) rules.push(e.rule); });
  if(V162.lf !== "all" && rules.indexOf(V162.lf) < 0) V162.lf = "all";
  var S = V162.lf === "all" ? L : L.filter(function(e){ return e.rule === V162.lf; }), lim = 40 + V162.more, shown = S.slice(0, lim);
  var h = '<div class="v162-log" id="v162-log"><div class="am-head v162-lh"><b>What ran</b><span class="am-sub">' + (L.length ? L.length + ' in the last 30 days · newest first' : 'the last 30 days') + '</span></div>';
  if(!L.length) return h + '<div class="hint am-empty">Nothing has run yet. When an automation changes something or sends a note, it shows here — with Undo.</div></div>';
  if(rules.length > 1) h += '<div class="v162-lf" role="group" aria-label="Show only one rule">' + ["all"].concat(rules).map(function(r){
    var n = r === "all" ? L.length : L.filter(function(e){ return e.rule === r; }).length;
    return '<button class="' + (V162.lf === r ? 'on' : '') + '" data-action="am-log-f" data-f="' + v162E(r) + '" aria-pressed="' + (V162.lf === r) + '">' + v162E(r === "all" ? "All" : r) + '<em>' + n + '</em></button>'; }).join("") + '</div>';
  var T = shown.filter(function(e){ return localDay(e.at) === todayStr(); }), E = shown.filter(function(e){ return localDay(e.at) !== todayStr(); });
  if(T.length) h += '<div class="v162-lg">Today<span>' + T.length + '</span></div>' + T.map(v162LogRow).join("");
  if(E.length) h += '<div class="v162-lg">Earlier<span>' + E.length + '</span></div>' + E.map(v162LogRow).join("");
  if(S.length > lim) h += '<button class="btn btn-sm v162-more" data-action="am-log-more">Show ' + Math.min(40, S.length - lim) + ' more</button>';
  return h + '</div>';
}
automationsModalBody = (function(o){ return function(m){
  var s = o.apply(this, arguments), i = s.lastIndexOf("</div>");
  return i < 0 ? s + v162LogHtml() : s.slice(0, i) + v162LogHtml() + s.slice(i);
}; })(automationsModalBody);
function v162AmAction(a, t){
  if(a === "am-log-undo"){ v162Undo(t.dataset.id); return true; }
  if(a === "am-log-f"){ V162.lf = t.dataset.f || "all"; V162.more = 0; render(); return true; }
  if(a === "am-log-more"){ V162.more += 40; render(); return true; }
  if(a === "am-log-open"){ var id = t.dataset.ro, op = t.dataset.op || null; if(!getRO(id)) return true; UI.modal = null; V162.page.edit = null; try{ PG.openRo(id, op); }catch(e){ UI.view = "ros"; UI.selectedRo = id; render(); } return true; }
  return false;
}
amAction = (function(o){ return function(a, t){ if(v162AmAction(a, t)) return true; return o.apply(this, arguments); }; })(amAction);

/* ---------- the page (Settings › Automations) ---------- */
function autoPageHtml(){ return '<div class="ap-page" data-v162-page="1">' + automationsModalBody(V162.page) + '</div>'; }
function autoPageMount(el){ if(!el) return null; el.innerHTML = autoPageHtml(); return el; }
/* the page's buttons and fields work the panel's way, with the page standing in for the panel */
function v162InPage(fn){
  var sv = UI.modal, r0 = render, due = false;
  UI.modal = V162.page; render = function(){ due = true; };
  try{ fn(); }
  finally{ render = r0; if(UI.modal && UI.modal.type === "automations") V162.page = UI.modal; else due = true; UI.modal = UI.modal === V162.page ? sv : UI.modal; }
  if(due) render();
}
function v162InPageOf(t){ return !!(t && t.closest && t.closest(".ap-page")) && !(UI.modal && UI.modal.type === "automations"); }
document.addEventListener("click", function(e){
  var t = e.target && e.target.closest ? e.target.closest("[data-action]") : null;
  if(!t || !v162InPageOf(t) || String(t.dataset.action || "").indexOf("am-") !== 0) return;
  e.stopImmediatePropagation();
  v162InPage(function(){ amAction(t.dataset.action, t); });
});
["input", "change"].forEach(function(ev){ document.addEventListener(ev, function(e){
  var t = e.target; if(!t || !t.getAttribute || !t.getAttribute("data-am") || !v162InPageOf(t)) return;
  e.stopImmediatePropagation();
  if(ev === "input" && t.tagName === "SELECT") return;
  if(ev === "change" && t.tagName !== "SELECT") return;
  v162InPage(function(){ amField(t, t.tagName === "SELECT"); });
}); });

var AUTO_STOP_ALL = null;
function amOptionsFor(key){
  if(key === "startReason") return START_REASONS;
  if(key === "stopReason"){ AUTO_STOP_ALL = AUTO_STOP_ALL || STOP_REASONS_EXPLICIT.concat(["Switched job","Pulled to another truck"], STOP_REASONS_BREAK, ["Declined"]); return AUTO_STOP_ALL; }
  if(key === "jobType") return JOB_TYPES.map(function(t){ return [t, jobTypeLabel(t)]; });
  if(key === "jobStatus" || key === "roStatus") return RO_STATUS_OPTIONS.map(function(o){ return o.status; });
  if(key === "partStatus") return AUTO_PART_STATES;
  if(key === "overQuoted") return ["yes","no"];
  if(key === "task") return WF_TASKS.map(function(t){ return [t.id, t.name]; });
  return null;
}
function amOps(f){
  if(f === "customer") return [["contains","contains"],["is","is"]];
  if(f === "hour") return [["after","after"],["before","before"]];
  return [["is","is"],["not","is not"]];
}
function amDefault(k){
  var o = amOptionsFor(k);
  if(o) return Array.isArray(o[0]) ? o[0][0] : o[0];
  if(k === "hour") return "12:00";
  if(k === "stamp") return AUTO_STAMP_DEFAULT;
  return "";
}
