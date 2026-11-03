/* Parsec · import/new-ro · create.js
   Create RO / Apply: setF writes each accepted field through the RO details table; operations and parts are added or updated.
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   setF extrasOf attachExtras applyInv applyLib apply D OCRF NOW (6 functions, 3 constants)
   uses       access/ automations/ data/ kit/ library/ pages/ pages/inventory/ pages/triage/ pages/warranty/ phone/ ro/ ro-page/ shell/ state/ trucks/
*/
  /* ---------------------------------------------------------------- Create RO / Apply */
  var D = null, OCRF = null, NOW = null;   /* NOW: which screenshot of how many is being read */   /* OCRF: a stand-in reader for the tests */
  function setF(ro, s, v){
    var k = s[0];
    if(k === "status"){ var st = String(v || ""); if(!roStatusOption(st)) return; var prev = roStatus(ro).status; if(prev === st) return;
      ro.status = { status: st, sub: null, setAt: nowIso() }; ro._lastKnownStatus = st; try{ audit("status", roLabel(ro) + ": " + prev + " → " + st + " (from ASIST)", ro); }catch(e){} return; }
    if(k === "year"){ var y = +String(v).replace(/\D/g, ""); if(y >= 1980 && y <= new Date().getFullYear() + 2){ if(ro.year !== y){ ro.year = y; delete ro.trkBody; delete ro.trkTrim; } } return; }
    if(k === "model" || k === "make"){ if(String(ro[k] || "") !== String(v)){ ro[k] = String(v); delete ro.trkBody; delete ro.trkTrim; } return; }
    if(k === "buildDate" || k === "warrantyStart"){ ro[k] = cdDay(String(v)); return; }   /* Parsec 16 */
    if((s[4] || {}).money){ ro[k] = cdMoney(String(v).replace(/[^\d.]/g, "")); return; }   /* Parsec 16: dollars, a number */
    if((s[4] || {}).num){ ro[k] = String(v).replace(/[^\d.]/g, ""); return; }
    if(k === "vin"){ ro.vin = String(v).toUpperCase().replace(/\s/g, ""); return; }
    if(k === "caseCause" || k === "caseCorrection"){ ro[k] = String(v); var o1 = op1(ro), kind = k === "caseCause" ? "cause" : "fix";
      if(o1 && !opStory(o1, kind)){ if(!Array.isArray(o1.log)) o1.log = []; o1.log.push({ id: uid("lg"), at: nowIso(), kind: kind, text: String(v) }); } return; }
    ro[k] = String(v);
  }
  /* 17.3: the photos and documents read with the case — they go with the RO, not into its fields */
  function extrasOf(){ var x = { ph: [], docs: [] }; (D.pieces || []).forEach(function(p){ if(p.off || !p.file) return; if(p.role === "photo") x.ph.push(p.file); else if(p.role === "doc") x.docs.push(p.file); }); return x; }
  function attachExtras(ro, x){
    if(!ro || (!x.ph.length && !x.docs.length)) return;
    setTimeout(function(){
      try{ if(x.ph.length && typeof JC !== "undefined" && JC.addFilesTo) JC.addFilesTo(ro, "pics", x.ph); }catch(e){ console.error(e); }
      if(x.docs.length && typeof libIntake === "function") libIntake(x.docs, { ro: ro }, function(res){ try{ if(res && res.plain.length && JC.addFilesTo) JC.addFilesTo(ro, "report", res.plain); }catch(e){ console.error(e); } });
    }, 250);
  }
  /* 17.3: aimed at Inventory — every part read goes on the Parts list; at the Library — the documents are filed, asked first */
  function applyInv(){
    var L = lyParts(); if(!L.length) return;
    pushUndo("parts to inventory");
    L.slice().reverse().forEach(function(p){ var it = invBlank(false); it.desc = p.desc || p.pn || "Part"; it.pn = p.pn || ""; it.qty = String(p.qty || "1"); if(p.price != null) it.price = p.price; if(p.core) it.core = p.core; if(p.list != null) it.list = p.list; invList().unshift(it); });
    scheduleSave(true); close(); try{ render(); }catch(e){}
    pushToast(L.length + " part" + (L.length === 1 ? "" : "s") + " added to the inventory", true);
  }
  function applyLib(){ var x = extrasOf(); if(!x.docs.length) return; close(); libIntake(x.docs, {}, function(){ try{ render(); }catch(e){} }); }
  function apply(){
    if(!D) return;
    if(D.target === "inv"){ applyInv(); return; }
    if(D.target === "lib"){ applyLib(); return; }
    var XS = extrasOf();
    var Pl = plan(), C = counts(Pl), get = function(k){ return Pl.rows.filter(function(r){ return r.k === k; })[0]; };
    if(D.new){
      var rn = String(get("roNumber").fin || "").trim(), cn = String(get("customerName").fin || "").trim(), miss = [];
      if(!rn) miss.push("RO #"); if(!cn) miss.push("Customer");
      if(miss.length){ D.err = "Still needed: " + miss.join(", ") + "."; draw(); var q = document.querySelector('#imp-dlg [data-ixf="' + (rn ? "customerName" : "roNumber") + '"]'); if(q) q.focus(); return; }
      if(realRos().some(function(r){ return nzRo(r.roNumber) === nzRo(rn); })){ D.err = "RO " + rn + " already exists."; draw(); return; }
    } else if(!C.changes && !Pl.people.length && (XS.ph.length || XS.docs.length)){ var ro0 = D.ro; close(); attachExtras(ro0, XS); return; }
    else if(!C.changes && !Pl.people.length){ close(); pushToast("Nothing to change — RO " + tgNum(D.ro) + " already has what ASIST shows."); return; }
    pushUndo(D.new ? "new RO from ASIST" : "import from ASIST");
    var ro = D.new ? addRO({ roNumber: get("roNumber").fin, customerName: get("customerName").fin, caseNumber: get("caseNumber").fin || "", dateOpened: get("dateOpened").fin || nowIso() }) : D.ro;
    var me = punchByName() || (typeof pxMeName === "function" ? pxMeName() : "") || "Admin";
    var mem = ro.imp || { f: {}, ops: {}, notes: {} }; mem.f = mem.f || {}; mem.ops = mem.ops || {}; mem.notes = mem.notes || {};
    /* the fields */
    Pl.rows.forEach(function(r){
      if(r.bd === "new" || r.bd === "upd" || r.bd === "edit"){ if(!(D.new && (r.k === "roNumber" || r.k === "customerName" || r.k === "caseNumber" || r.k === "dateOpened"))) setF(ro, r.s, r.fin); }
      if(r.src) mem.f[r.k] = r.src;
    });
    /* the operations and their parts */
    var rn2 = ro.roNumber, apprN = 0;
    Pl.ops.forEach(function(P){
      if(!P.on) return;
      var o = P.o, op = P.op, mk = opKey(o);
      if(!op){ op = { id: uid("op"), complaint: o.name || "Operation", cause: "", correction: "", quoted: parseFloat(o.hours) || 0, isStandard: false, standardName: null, declined: false, parts: [], burnt: 0, work: "", log: [] };
        op.jobType = jobTypeOf(o.name); ro.operations.push(op); }
      Object.keys(P.f).forEach(function(k){ var r = P.f[k]; if(r.bd !== "new" && r.bd !== "upd") return; var v = r.fin;
        if(k === "quoted") op.quoted = parseFloat(v) || 0; else if(k === "estCost"){ if(+v > 0) op.estCost = +v; }
        else if(k === "laborRate"){ if(+v > 0 && Math.abs(+v - laborRate()) > .004) op.laborRate = +v; else delete op.laborRate; }   /* Parsec 14 */
        else if(k === "otherCost"){ if(+v >= 0) op.otherCost = +v; } else op[k] = String(v); });
      var ac = {}; [["hours", o.hours], ["rate", o.rateEff], ["labor", o.price], ["parts", o.partsAmt], ["misc", o.misc], ["sublet", o.sublet], ["total", o.total]].forEach(function(x){ if(x[1] != null && x[1] !== "") ac[x[0]] = +x[1]; });
      if(Object.keys(ac).length > 1){ ac.at = nowIso(); op.asist = ac; }
      if(P.glued) op.complaint = o.name;   /* Parsec 14: "PM service - level A Parts" → its own name */
      if(P.pa && (P.pa.act === "new" || P.pa.act === "upd")){ var apw = String(get("createdBy").fin || "").trim() || "ASIST";   /* Parsec 14: as Triage's Approve / Decline */
        op.appr = { s: P.pa.want, by: "ASIST", at: nowIso(), who: apw, role: "From ASIST", how: "ASIST", po: P.pa.want === "no" ? "" : String(ro.poNumber || ""), amt: 0, reason: P.pa.want === "no" ? "Declined in ASIST" : "" };
        op.declined = P.pa.want === "no"; apprN++;
        try{ audit("approval", roLabel(ro) + " Op " + raN(ro, op) + ": " + (P.pa.want === "no" ? "declined" : "approved") + " in ASIST — " + apw + " (ASIST)", ro); }catch(e){} }   /* Parsec 14: ASIST's own numbers for this operation, kept for the check */
      if(P.story && (P.story.bd === "new" || P.story.bd === "upd")) op.work = esc(P.story.fin);
      if(P.codes && P.codesNew){ op.offNotes = (Array.isArray(op.offNotes) ? op.offNotes : []).concat([{ id: "on" + uid("x"), at: nowIso(), text: "From ASIST — " + P.codes, by: "ASIST" }]); }
      var M = mem.ops[mk] = mem.ops[mk] || { parts: {} }; M.id = op.id; M.no = o.no; M.name = o.name; M.f = M.f || {}; M.parts = M.parts || {};
      OPF.forEach(function(x){ if(o[x[1]] !== "" && o[x[1]] != null) M.f[x[0]] = o[x[1]]; });
      if(o.story) M.story = o.story; if(P.codes) M.codes = P.codes;
      P.parts.forEach(function(q){
        var p = q.p, part = q.part;
        if(!part){ part = { id: uid("pt"), description: p.desc || p.pn, partNumber: p.pn || "", qty: String(p.qty || "1"), status: "Not Ordered", eta: "", statusChangedAt: nowIso() }; if(!Array.isArray(op.parts)) op.parts = []; op.parts.push(part); }
        Object.keys(q.f).forEach(function(k){ var r = q.f[k]; if(r.bd !== "new" && r.bd !== "upd") return; var v = r.fin;
          if(k === "price" || k === "core" || k === "list"){ if(+v >= 0) part[k] = String(+v); } else if(k === "qty") part.qty = String(parseFloat(v) || 1); else part[k] = String(v); });
        var PM = M.parts[q.k] = M.parts[q.k] || {}; PM.id = part.id; PM.f = PM.f || {}; PTF.forEach(function(x){ if(p[x[1]] !== "" && p[x[1]] != null) PM.f[x[0]] = p[x[1]]; });
        /* the Parts list learns the part, and ASIST's price */
        try{ invAddFromPart(part, rn2); var it = invHasPart(part.partNumber, part.description); if(it && priceOf(part.price) && priceOf(it.price) !== priceOf(part.price)){ it.price = priceOf(part.price); it.editedAt = nowIso(); } }catch(e){}
      });
    });
    /* ASIST's notes */
    if(!Array.isArray(ro.extNotes)) ro.extNotes = [];
    Pl.notes.forEach(function(x){ if(x.bd !== "new") return; ro.extNotes.push({ id: uid("xn"), at: x.n.at, by: x.n.by || "", text: x.n.text, kind: x.n.kind, src: "ASIST" }); mem.notes[x.k] = 1; });
    Pl.notes.forEach(function(x){ mem.notes[x.k] = 1; });
    ro.extNotes.sort(function(a, b){ return new Date(a.at) - new Date(b.at); });
    /* people ASIST names who aren't on the Team: they join it — no pages, no sign-in */
    Pl.people.forEach(function(p){ staffList().push({ id: uid("st"), name: p.n, role: p.role, pages: {}, ext: "ASIST", noSignIn: true, addedAt: nowIso(), why: p.why }); try{ audit("staff", p.n + " added to the Team from ASIST (" + p.why + ")", ro); }catch(e){} });
    if(!ro.assignedTech){ var tb = Pl.ops.map(function(P){ return P.o.storyBy; }).filter(Boolean)[0]; if(tb) ro.assignedTech = tb; }
    if(D.acc.totals) ro.asistTotals = Object.assign({ at: nowIso() }, D.acc.totals);
    try{ if(apprN && typeof tgSettle === "function") tgSettle(ro); }catch(e){}   /* Parsec 14: approved ops put the RO back on the board, as Triage does */   /* Parsec 14: ASIST's totals, for the check on the RO */
    mem.at = nowIso(); mem.n = (mem.n || 0) + 1; mem.by = me; ro.imp = mem;
    try{ trkAutoPick(ro); }catch(e){}   /* Parsec 12.2: the truck picture, by the year and model ASIST gave */
    var sum = [C.new ? C.new + " new" : "", C.upd ? C.upd + " updated" : "", C.kept ? C.kept + " kept" : "", C.edit ? C.edit + " typed" : ""].filter(Boolean).join(", ") || "nothing new";
    var v14typed = D.new && !(D.pieces && D.pieces.length);   /* Parsec 14: nothing came from ASIST — typed by hand */
    try{ autoHist(ro, { at: Date.now(), k: "import", t: v14typed ? "Created" : D.new ? "Created from ASIST" : "Imported from ASIST", o: "", n: v14typed ? "typed by hand" : sum, op: "", by: me }); }catch(e){}
    try{ audit(v14typed ? "ro" : "import", roLabel(ro) + ": " + (v14typed ? "created by hand" : (D.new ? "created from ASIST" : "imported from ASIST") + " — " + sum), ro); }catch(e){}
    scheduleSave(true);
    var wasNew = D.new, id = ro.id; close(); attachExtras(ro, XS);
    if(wasNew){ UI.view = "ros"; UI.selectedRo = id; UI.roFilter = ""; UI.modal = null; setTimeout(function(){ try{ v141Comeback(getRO(id)); }catch(e){ console.error(e); } }, 150); }
    render(); try{ if(typeof JC !== "undefined" && JC.rerender) JC.rerender(); }catch(e){}
    pushToast(v14typed ? "Created RO " + tgNum(ro) + "." : (wasNew ? "Created RO " + tgNum(ro) + " from ASIST" : "Imported from ASIST — RO " + tgNum(ro)) + " · " + sum + (Pl.people.length ? " · " + Pl.people.length + " joined the Team" : "") + ".", true);
  }
