/* Parsec · import/new-ro · fields.js
   The RO's fields as rows of the dialog (SPEC: label, group, source), the operations' rows, what changed vs the existing RO.
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   op1 getF srcF eq fmtF rowOf jobTypeOf opKey memOp txtOf eqv rule … (23 functions, 7 constants)
   uses       access/ data/ kit/ pages/inventory/ ro/
*/
  /* ---------------------------------------------------------------- the RO's fields, as rows */
  var G_CASE = "Case & customer", G_TRUCK = "Truck", G_CCC = "Complaint · cause · correction";
  function op1(ro){ return ro && (ro.operations || []).filter(function(o){ return !o.declined; })[0]; }
  var SPEC = [
    ["caseNumber", "Case #", G_CASE, "caseNo"], ["roNumber", "RO #", G_CASE, "roNumber"], ["customerName", "Customer", G_CASE, "customer"], ["custNo", "Cust #", G_CASE, "custNo"],
    ["status", "Status", G_CASE, "status", { sel: 1 }], ["promisedAt", "ETR → Promised", G_CASE, "etr", { dt: 1 }], ["followUpAt", "Follow-up", G_CASE, "followUp", { dt: 1 }],
    ["createdBy", "Created by", G_CASE, "createdBy"], ["dateOpened", "Checked in → Opened", G_CASE, "checkedIn", { dt: 1 }], ["poNumber", "PO #", G_CASE, "po"], ["authNumber", "Auth #", G_CASE, "auth"],
    ["techSupportCase", "Tech support case", G_CASE, "ts"], ["shopSupplies", "Shop supplies & fees", G_CASE, "supplies", { num: 1, money: 1 }],
    ["contactName", "Contact", G_CASE, "cname"], ["contactPhone", "Phone", G_CASE, "cphone"], ["contactEmail", "Email", G_CASE, "cemail"], ["driverName", "Driver", G_CASE, "dname"], ["driverPhone", "Driver’s phone", G_CASE, "dphone"],   /* Parsec 16.3 */   /* Parsec 14 */
    ["year", "Year", G_TRUCK, "year", { num: 1 }], ["make", "Make", G_TRUCK, "make"], ["model", "Model", G_TRUCK, "model"], ["vin", "VIN", G_TRUCK, "vin", { mono: 1 }], ["unitNumber", "Unit", G_TRUCK, "unit"],
    ["chassis", "Chassis / serial", G_TRUCK, "chassis"], ["engineType", "Engine", G_TRUCK, "engine"], ["engineSerial", "Engine serial", G_TRUCK, "engineSerial"], ["mileage", "Odometer → Miles", G_TRUCK, "miles", { num: 1 }],
    ["engineHours", "Engine hours", G_TRUCK, "engHours", { num: 1 }], ["buildDate", "Build date", G_TRUCK, "built"], ["warrantyStart", "Warranty start", G_TRUCK, "warrStart"], ["keyTag", "Tag → Key tag", G_TRUCK, "tag"], ["location", "Location", G_TRUCK, "location"], ["department", "Department", G_TRUCK, "dept"],
    ["caseComplaint", "Complaint", G_CCC, "complaint", { long: 1 }], ["caseCause", "Cause", G_CCC, "cause", { long: 1 }], ["caseCorrection", "Correction", G_CCC, "correction", { long: 1 }]
  ];
  function getF(ro, k){
    if(!ro) return "";
    if(k === "status") return roStatus(ro).status;
    if(k === "caseComplaint") return ro.caseComplaint || "";
    if(k === "caseCause") return ro.caseCause || "";
    if(k === "caseCorrection") return ro.caseCorrection || "";
    var v = ro[k]; if(k === "buildDate" || k === "warrantyStart") v = cdDayShow(v);   /* Parsec 16: compared and shown as MM-DD-YYYY */
    return v == null ? "" : String(v);
  }
  function srcF(acc, s){ var v = acc.f[s[3]]; if(s[0] === "status") return v ? mapStatus(v) : ""; return v == null ? "" : String(v); }
  function eq(s, a, b){ a = a == null ? "" : String(a); b = b == null ? "" : String(b);
    if((s[4] || {}).dt){ var x = new Date(a), y = new Date(b); return !isNaN(x) && !isNaN(y) ? Math.abs(x - y) < 60000 : a === b; }
    if((s[4] || {}).num) return (parseFloat(a.replace(/,/g, "")) || 0) === (parseFloat(b.replace(/,/g, "")) || 0) && (a === "") === (b === "");
    return nn(a) === nn(b); }
  function fmtF(s, v){ if(!v) return ""; if((s[4] || {}).dt) return whenTxt(v); if((s[4] || {}).money) return usd(v); if(s[0] === "mileage" || s[0] === "engineHours") return Number(v).toLocaleString("en-US"); return String(v); }
  /* one field: what Parsec has, what ASIST says, what the last import wrote → what happens */
  function rowOf(s){
    var ro = D.ro, cur = getF(ro, s[0]), src = srcF(D.acc, s), mem = ro && ro.imp && ro.imp.f ? ro.imp.f[s[0]] : undefined, ed = D.edits[s[0]];
    var r = { s: s, k: s[0], cur: cur, src: src, mem: mem, bd: "", fin: cur, was: "" };
    if(ed !== undefined && !eq(s, ed, D.new ? "" : cur)){ r.fin = ed; r.bd = "edit"; return r; }
    if(!src){ r.bd = D.new ? (cur ? "" : "") : (cur ? "same0" : ""); return r; }
    if(D.new || !cur){ r.fin = src; r.bd = "new"; return r; }
    if(eq(s, cur, src)){ r.bd = "same"; return r; }
    if(mem !== undefined && eq(s, cur, mem)){ r.fin = src; r.was = cur; r.bd = "upd"; return r; }
    if(mem !== undefined && eq(s, src, mem)){ r.bd = "yours"; return r; }
    r.bd = "kept"; return r;
  }
  /* ---------------------------------------------------------------- operations, parts and notes */
  function jobTypeOf(t){ t = String(t || "").toLowerCase(); return /inspection|\bpm\b|service\b|wash/.test(t) ? "PM" : /warrant/.test(t) ? "WARR" : /recall|campaign/.test(t) ? "RECALL" : /^(check|diagnos|advise)|diagnos|fault|code|no start|won'?t start|will not start/.test(t) ? "DIAG" : "OP"; }
  function opKey(o){ return (o.no ? "n" + o.no : "") + ":" + nn(o.name).slice(0, 24); }
  function memOp(ro, o){ var M = ro && ro.imp && ro.imp.ops || {}, k = opKey(o); if(M[k]) return M[k];
    var ks = Object.keys(M).filter(function(x){ var m = M[x]; return (o.no && m.no === o.no && sim(m.name, o.name) >= .34) || nn(m.name) === nn(o.name); }); return ks.length ? M[ks[0]] : null; }
  function txtOf(h){ return String(h || "").replace(/<br\s*\/?>/gi, "\n").replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").trim(); }
  var OPF = [["quoted", "hours", "num"], ["estCost", "price", "num"], ["laborRate", "rateSrc", "num"], ["otherCost", "other", "num"], ["asistApproval", "approval"], ["label", "label"], ["skill", "skill"]];
  var PTF = [["description", "desc"], ["qty", "qty", "num"], ["price", "price", "num"], ["list", "list", "num"], ["disc", "disc"], ["core", "core", "num"], ["salesman", "salesman"]];
  function eqv(t, a, b){ if(t === "num"){ var x = parseFloat(String(a == null ? "" : a).replace(/[$,]/g, "")), y = parseFloat(String(b == null ? "" : b).replace(/[$,]/g, "")); return (isNaN(x) ? 0 : x) === (isNaN(y) ? 0 : y); } return nn(a) === nn(b); }
  /* merge one value by the rule: empty → new, untouched since the last import → updated, changed here → kept */
  function rule(t, cur, src, mem, isNew){
    var has = function(v){ return v !== "" && v != null && !(t === "num" && !parseFloat(v) && String(v) !== "0"); };
    if(!has(src)) return { bd: "", fin: cur };
    if(isNew || !has(cur)) return { bd: "new", fin: src };
    if(eqv(t, cur, src)) return { bd: "same", fin: cur };
    if(mem !== undefined && eqv(t, cur, mem)) return { bd: "upd", fin: src, was: cur };
    if(mem !== undefined && eqv(t, src, mem)) return { bd: "same", fin: cur };
    return { bd: "kept", fin: cur, asist: src };
  }
  function opPlan(o, i, taken){
    var ro = D.ro, M = D.new ? null : memOp(ro, o), ops = ro && !D.new ? ro.operations || [] : [], hit = null;
    if(M) hit = ops.filter(function(x){ return x.id === M.id; })[0] || null;
    if(!hit) hit = ops.filter(function(x){ return !taken[x.id] && nn(x.complaint) === nn(o.name); })[0] || null;
    if(!hit) hit = ops.filter(function(x){ return !taken[x.id] && sim(x.complaint, o.name) >= .5; })[0] || null;
    if(hit) taken[hit.id] = 1;
    /* Parsec 14: the case's labor rate — the operation keeps it only when it isn't the shop's; shop supplies + sublet are its Other */
    var shop = laborRate(); if(o.price == null && o.rate > 0 && o.hours > 0) o.price = cents(o.rate * o.hours);
    o.rateEff = o.rate || (o.hours > 0 && o.price > 0 ? cents(o.price / o.hours) : null);
    o.rateSrc = o.rateEff && Math.abs(o.rateEff - shop) > .004 ? o.rateEff : (hit && +hit.laborRate > 0 && o.rateEff ? shop : "");
    o.other = o.misc != null || o.sublet != null ? cents((o.misc || 0) + (o.sublet || 0)) : "";
    var glued = hit && nn(hit.complaint) === nn(o.name) + " parts";
    var isNew = !hit, mf = M && M.f || {}, P = { glued: glued, o: o, i: i, op: hit, isNew: isNew, on: D.skip[opKey(o)] !== true, f: {}, parts: [], story: null, codes: "", bd: isNew ? "new" : "same" };
    OPF.forEach(function(x){ var cur = hit ? hit[x[0]] : "", r = rule(x[2], cur == null ? "" : cur, o[x[1]], mf[x[0]], isNew); P.f[x[0]] = r; if(!isNew && (r.bd === "upd" || r.bd === "new")) P.bd = "upd"; if(!isNew && r.bd === "kept" && P.bd === "same") P.bd = "kept"; });
    if(o.story){ var w = hit ? txtOf(hit.work) : "", r2 = rule("", w, o.story, M ? M.story : undefined, isNew); P.story = r2; if(!isNew && (r2.bd === "new" || r2.bd === "upd")) P.bd = "upd"; }
    P.pa = paPlan(o, hit);
    if(!isNew && (P.pa.act === "new" || P.pa.act === "upd" || glued)) P.bd = "upd"; else if(!isNew && P.pa.act === "kept" && P.bd === "same") P.bd = "kept";
    P.codes = [o.opCode && "Op code " + o.opCode, o.vmrs && "VMRS " + o.vmrs, o.priceCode && "Price code " + o.priceCode].filter(Boolean).join(" · ");
    P.codesNew = !!P.codes && (!M || M.codes !== P.codes);
    var mp = M && M.parts || {}, have = hit ? hit.parts || [] : [];
    var L = o.parts.slice(); ((D.loose && D.loose.at[i]) || []).forEach(function(p){ L.push(p); });   /* Parsec 14 */
    L.forEach(function(p){
      var k = pKey(p), pm = mp[k], ph = null;
      if(pm) ph = have.filter(function(x){ return x.id === pm.id; })[0] || null;
      if(!ph) ph = have.filter(function(x){ return p.pn ? invPnKey(x.partNumber) === invPnKey(p.pn) : invDescKey(x.description) === invDescKey(p.desc); })[0] || null;
      var q = { p: p, k: k, part: ph, isNew: !ph, f: {}, bd: ph ? "same" : "new" };
      PTF.forEach(function(x){ var cur = ph ? ph[x[0]] : "", r = rule(x[2], cur == null ? "" : cur, p[x[1]], pm && pm.f ? pm.f[x[0]] : undefined, !ph); q.f[x[0]] = r; if(ph && (r.bd === "upd" || r.bd === "new")) q.bd = "upd"; if(ph && r.bd === "kept" && q.bd === "same") q.bd = "kept"; });
      P.parts.push(q); if(!isNew && (q.bd === "new" || q.bd === "upd")) P.bd = "upd";
    });
    return P;
  }
  var STOPW = ["replace", "replaced", "check", "inspect", "service", "repair", "install", "remove", "level", "light", "fault", "front", "rear", "left", "right", "driver", "passenger", "side", "with", "from", "kit", "assembly", "unit", "complete"];
  function pWords(s){ return nn(s).split(" ").filter(function(w){ return w.length >= 4 && STOPW.indexOf(w) < 0 && !/^\d+$/.test(w); }); }
  /* Parsec 14: where each part that came in without its operation goes */
  function looseTo(){
    var ops = D.acc.ops, at = {}, auto = [], rest = [];
    D.acc.parts.forEach(function(p){
      var i = -1, by = "";
      if(p.op) ops.forEach(function(o, j){ if(i < 0 && o.no === p.op){ i = j; by = "ASIST says Op " + p.op; } });
      if(i < 0){ var pw = pWords(p.desc), best = 0; ops.forEach(function(o, j){ var ow = pWords(o.name), n = pw.filter(function(w){ return ow.some(function(x){ return x === w || (w.length >= 5 && x.slice(0, 5) === w.slice(0, 5)); }); }).length; if(n > best){ best = n; i = j; by = "by its name"; } }); }
      if(i > -1){ (at[i] = at[i] || []).push(p); auto.push({ p: p, i: i, by: by }); } else rest.push(p);
    });
    if(!D.lpSet){ var cnt = {}; auto.forEach(function(x){ cnt[x.i] = (cnt[x.i] || 0) + 1; }); var bi = Object.keys(cnt).sort(function(a, b){ return cnt[b] - cnt[a]; })[0]; D.lpTo = bi != null ? +bi : 0; D.lpOff = false; }
    if(!D.lpOff && rest.length) at[D.lpTo] = (at[D.lpTo] || []).concat(rest);
    D.loose = { at: at, auto: auto, rest: rest };
  }
  /* what ASIST's approval does in Parsec — the same op.appr Triage's Approve and Decline write */
  function apState(op){ return op && op.appr && op.appr.s ? op.appr.s : op && op.declined ? "no" : ""; }
  function apHand(op){ return !!op && ((op.appr && op.appr.s && op.appr.how !== "ASIST") || (!op.appr && op.declined)); }
  function paPlan(o, hit){
    var a = normAp(o.approval), want = a === "Approved" ? "ok" : a === "Declined" ? "no" : "", cur = apState(hit), r = { want: want, cur: cur, hand: apHand(hit), act: "" };
    if(!want){ r.act = cur ? "keep" : a ? "needs" : ""; return r; }   /* Pending: needs approval — a Parsec approval already there stays */
    if(cur === want || (want === "ok" && cur === "part")) r.act = "same";
    else if(r.hand) r.act = "kept";
    else r.act = cur ? "upd" : "new";
    return r;
  }
  function paTxt(P){
    var x = P.pa, W = { ok: "approved", part: "partly approved", no: "declined" }; if(!x || !P.on) return "";
    if(x.act === "new" || x.act === "upd") return '<small class="ix-pa ' + (x.want === "no" ? "no" : "ok") + '">→ ' + W[x.want] + ' in Parsec' + (x.act === "upd" ? ' (was ' + W[x.cur] + ')' : '') + '</small>';
    if(x.act === "same") return '<small class="ix-pa">' + W[x.cur] + ' in Parsec</small>';
    if(x.act === "kept") return '<small class="ix-pa kept">Kept yours — ' + W[x.cur] + ' in Parsec' + (P.op && P.op.appr && P.op.appr.who ? ' by ' + esc(P.op.appr.who) : '') + '</small>';
    if(x.act === "keep") return '<small class="ix-pa kept">Kept — already ' + W[x.cur] + ' in Parsec</small>';
    if(x.act === "needs") return '<small class="ix-pa wait">needs approval</small>';
    return "";
  }
  function plan(){
    if(D.acc.ops.length) looseTo(); else D.loose = { at: { 0: D.acc.parts.slice() }, auto: [], rest: [] };
    var taken = {}, ops = D.acc.ops.map(function(o, i){ return opPlan(o, i, taken); });
    if(D.acc.parts.length && !D.acc.ops.length) ops.push(opPlan(blankOp(0, "Parts"), 0, taken));
    var seen = {}; ((D.ro && !D.new && D.ro.extNotes) || []).forEach(function(n){ seen[noteKey(n)] = 1; });
    var mn = D.ro && !D.new && D.ro.imp && D.ro.imp.notes || {};
    var notes = D.acc.notes.map(function(n){ var k = noteKey(n); return { n: n, k: k, bd: seen[k] || mn[k] ? "same" : "new" }; });
    var rows = SPEC.map(rowOf);
    return { rows: rows, ops: ops, notes: notes, people: peopleOf(rows, ops, notes) };
  }
  /* the people the import names, and whether they're on the Team */
  function onTeam(n){ return staffList().some(function(sf){ return sf.name && (techSame(sf.name, n) || nn(sf.name) === nn(n)); }); }
  function peopleOf(rows, ops, notes){
    var out = [], add = function(n, role, why){ n = String(n || "").trim(); if(!n || onTeam(n) || out.some(function(x){ return nn(x.n) === nn(n); })) return; out.push({ n: n, role: role, why: why }); };
    var cb = rows.filter(function(r){ return r.k === "createdBy"; })[0]; if(cb && cb.fin) add(cb.fin, "Service writer", "created the case");
    ops.forEach(function(P){ if(!P.on) return; if(P.o.storyBy) add(P.o.storyBy, "Technician", "wrote the story on Op " + (P.o.no || P.i + 1)); P.parts.forEach(function(q){ if(q.p.salesman) add(q.p.salesman, "Parts", "sold the parts"); }); });
    notes.forEach(function(x){ if(x.n.kind === "user" && x.n.by && x.bd === "new") add(x.n.by, "Other", "wrote a note in ASIST"); });
    return out;
  }
  function counts(Pl){
    var c = { new: 0, upd: 0, kept: 0, same: 0, edit: 0 };
    Pl.rows.forEach(function(r){ if(r.bd === "new") c.new++; else if(r.bd === "upd") c.upd++; else if(r.bd === "kept") c.kept++; else if(r.bd === "same" || r.bd === "yours") c.same++; else if(r.bd === "edit") c.edit++; });
    Pl.ops.forEach(function(P){ if(!P.on) return; if(P.isNew){ c.new += 1 + P.parts.length; return; }
      Object.keys(P.f).forEach(function(k){ var b = P.f[k].bd; if(b === "upd") c.upd++; else if(b === "new") c.new++; else if(b === "kept") c.kept++; });
      if(P.story){ if(P.story.bd === "upd") c.upd++; else if(P.story.bd === "new") c.new++; else if(P.story.bd === "kept") c.kept++; }
      var apF = P.f.asistApproval && (P.f.asistApproval.bd === "upd" || P.f.asistApproval.bd === "new");   /* Parsec 14: one change per op, not two */
      if(P.pa){ if((P.pa.act === "new" || P.pa.act === "upd") && !apF) c.upd++; else if(P.pa.act === "kept" && !apF) c.kept++; } if(P.glued) c.upd++;
      P.parts.forEach(function(q){ if(q.isNew){ c.new++; return; } var u = 0, k = 0; Object.keys(q.f).forEach(function(x){ if(q.f[x].bd === "upd" || q.f[x].bd === "new") u = 1; else if(q.f[x].bd === "kept") k = 1; }); if(u) c.upd++; else if(k) c.kept++; else c.same++; });
      if(P.bd === "same") c.same++; });
    Pl.notes.forEach(function(x){ if(x.bd === "new") c.new++; else c.same++; });
    c.changes = c.new + c.upd + c.edit;
    return c;
  }
