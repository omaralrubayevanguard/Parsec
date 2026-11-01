# ---- the RO fields: shop supplies & fees the operations don't carry ----
rep('    ["techSupportCase", "Tech support case", G_CASE, "ts"],',
    '    ["techSupportCase", "Tech support case", G_CASE, "ts"], ["shopSupplies", "Shop supplies & fees", G_CASE, "supplies", { num: 1, money: 1 }],   /* Parsec 14 */')
rep('  function fmtF(s, v){ if(!v) return ""; if((s[4] || {}).dt) return whenTxt(v);',
    '  function fmtF(s, v){ if(!v) return ""; if((s[4] || {}).dt) return whenTxt(v); if((s[4] || {}).money) return usd(v);')
rep('  function rebuild(){ D.acc = blankAcc(); D.pieces.forEach(function(p){ mergeInto(D.acc, p.P); });',
    '  /* Parsec 14: what the Totals show for shop supplies, fees and sublet beyond what the operations carry — it goes on the RO */\n'
    '  function suppliesOf(acc){ var T = acc.totals; delete acc.f.supplies; if(!T || T.misc == null) return; var per = acc.ops.reduce(function(a, o){ return a + (o.misc || 0) + (o.sublet || 0); }, 0), v = cents(T.misc - per); if(v > .004) acc.f.supplies = String(v); }\n'
    '  function rebuild(){ D.acc = blankAcc(); D.pieces.forEach(function(p){ mergeInto(D.acc, p.P); }); suppliesOf(D.acc);')
# ---- operations and parts: the new amounts as fields, merged by the same rule ----
rep('  var OPF = [["quoted", "hours", "num"], ["estCost", "price", "num"], ["asistApproval", "approval"], ["label", "label"], ["skill", "skill"]];',
    '  var OPF = [["quoted", "hours", "num"], ["estCost", "price", "num"], ["laborRate", "rateSrc", "num"], ["otherCost", "other", "num"], ["asistApproval", "approval"], ["label", "label"], ["skill", "skill"]];')
rep('  var PTF = [["description", "desc"], ["qty", "qty", "num"], ["price", "price", "num"], ["core", "core", "num"], ["salesman", "salesman"]];',
    '  var PTF = [["description", "desc"], ["qty", "qty", "num"], ["price", "price", "num"], ["list", "list", "num"], ["disc", "disc"], ["core", "core", "num"], ["salesman", "salesman"]];')
rep('    var isNew = !hit, mf = M && M.f || {}, P = {',
    "    /* Parsec 14: the case's labor rate — the operation keeps it only when it isn't the shop's; shop supplies + sublet are its Other */\n"
    '    var shop = laborRate(); if(o.price == null && o.rate > 0 && o.hours > 0) o.price = cents(o.rate * o.hours);\n'
    '    o.rateEff = o.rate || (o.hours > 0 && o.price > 0 ? cents(o.price / o.hours) : null);\n'
    '    o.rateSrc = o.rateEff && Math.abs(o.rateEff - shop) > .004 ? o.rateEff : (hit && +hit.laborRate > 0 && o.rateEff ? shop : "");\n'
    '    o.other = o.misc != null || o.sublet != null ? cents((o.misc || 0) + (o.sublet || 0)) : "";\n'
    '    var isNew = !hit, mf = M && M.f || {}, P = {')
rep('        if(k === "quoted") op.quoted = parseFloat(v) || 0; else if(k === "estCost"){ if(+v > 0) op.estCost = +v; } else op[k] = String(v); });',
    '        if(k === "quoted") op.quoted = parseFloat(v) || 0; else if(k === "estCost"){ if(+v > 0) op.estCost = +v; }\n'
    '        else if(k === "laborRate"){ if(+v > 0 && Math.abs(+v - laborRate()) > .004) op.laborRate = +v; else delete op.laborRate; }   /* Parsec 14 */\n'
    '        else if(k === "otherCost"){ if(+v >= 0) op.otherCost = String(+v); } else op[k] = String(v); });\n'
    '      var ac = {}; [["hours", o.hours], ["rate", o.rateEff], ["labor", o.price], ["parts", o.partsAmt], ["misc", o.misc], ["sublet", o.sublet], ["total", o.total]].forEach(function(x){ if(x[1] != null && x[1] !== "") ac[x[0]] = +x[1]; });\n'
    "      if(Object.keys(ac).length > 1){ ac.at = nowIso(); op.asist = ac; }   /* Parsec 14: ASIST's own numbers for this operation, kept for the check */")
rep('          if(k === "price" || k === "core"){ if(+v >= 0) part[k] = String(+v); }',
    '          if(k === "price" || k === "core" || k === "list"){ if(+v >= 0) part[k] = String(+v); }')
rep('    mem.at = nowIso(); mem.n = (mem.n || 0) + 1; mem.by = me; ro.imp = mem;',
    "    if(D.acc.totals) ro.asistTotals = Object.assign({ at: nowIso() }, D.acc.totals);   /* Parsec 14: ASIST's totals, for the check on the RO */\n"
    '    mem.at = nowIso(); mem.n = (mem.n || 0) + 1; mem.by = me; ro.imp = mem;')
rep('    if(D.acc.parts.length && !D.acc.ops.length) ops.push(opPlan({ no: 0, name: "Parts", hours: null, price: null, approval: "", label: "", opCode: "", vmrs: "", skill: "", priceCode: "", story: "", storyBy: "", parts: [] }, 0, taken));',
    '    if(D.acc.parts.length && !D.acc.ops.length) ops.push(opPlan(blankOp(0, "Parts"), 0, taken));')
cut('  function opCard(P){', '  function notesHtml(Pl){', X("opcard.js"))
rep('  return { open: open, close: close, parse: parse,', '  return { partsTable: partsTable, open: open, close: close, parse: parse,')
rep("<h4>Operations <em>labor hours, price, ASIST’s approval (shown only) — parts under each</em></h4>", "<h4>Operations <em>hours × rate = labor, parts, shop supplies, sublet, the op total, ASIST’s approval (shown only) — parts under each</em></h4>")
rep('      case "engine": v = v.replace(/\\b(?:serial|s\\/n|engine\\s*hours)\\b.*$/i, "").trim();',
    '      case "engine": v = v.replace(/\\b(?:serial|s\\/n|engine\\s*hours)\\b.*$/i, "").replace(/\\bD[Il|](\\d)(?=\\b|[A-Z])/g, "D1$1").trim();   /* Parsec 14: the reader\'s "DI3" is the D13 */')
# ---- screenshot text: money the reader split or dotted, the RO number split, "Engine Sorlel #" ----
rep('  function parse(raw){\n    var text = fixLabels(cleanOcrText(String(raw || "")).replace(/\\r/g, "").replace(/\\u00a0/g, " "));',
    '  /* Parsec 14: "$ 165.00" → "$165.00", "$2 14.50" → "$214.50", "$1.62 1.50" → "$1,621.50", "1.302.00" → "1,302.00" */\n'
    '  function fixMoney(t){\n'
    '    return String(t).replace(/\\$[ ]+(?=\\d)/g, "$")\n'
    '      .replace(/\\$(\\d{1,3})(?:([.,])(\\d{1,3}))? (\\d{1,3})((?:[.,]\\d{3})*[.,]\\d{2})(?![\\d.,])/g, function(m, a, sep, af, bi, br){ if(af == null) return "$" + a + bi + br; if(af.length + bi.length === 3) return "$" + a + "," + af + bi + br; return m; })\n'
    '      .replace(/(\\d{1,3})\\.(\\d{3})(?=[.,]\\d{2}(?!\\d))/g, "$1,$2");\n'
    '  }\n'
    '  function parse(raw){\n    var text = fixMoney(fixLabels(cleanOcrText(String(raw || "")).replace(/\\r/g, "").replace(/\\u00a0/g, " ")));')
rep('    var L = cleanOcrText(String(raw || "")).replace(/\\r/g, "").split("\\n"), cols = null, out = [];',
    '    var L = fixMoney(cleanOcrText(String(raw || ""))).replace(/\\r/g, "").split("\\n"), cols = null, out = [];')
rep('      case "roNumber": m = /\\b(R[AO][\\s-]?\\d{4,12}|\\d{5,12})\\b/i.exec(v.replace(/[Oo](?=\\d)/g, "0"));',
    '      case "roNumber": v = v.replace(/[Oo](?=\\d)/g, "0").replace(/\\b(R[AO]\\d{4,10}) (\\d{1,6})\\b/i, function(m, a, b){ return (a + b).length <= 14 ? a + b : m; });   /* the reader\'s "RA0001241 190" */\n'
    '        m = /\\b(R[AO][\\s-]?\\d{4,12}|\\d{5,12})\\b/i.exec(v);')
rep('.replace(/(^|\\t|\\s)E[5$]N(?=\\s*[:#\\t]|\\s+\\d)/g, "$1ESN");',
    '.replace(/(^|\\t|\\s)E[5$]N(?=\\s*[:#\\t]|\\s+\\d)/g, "$1ESN").replace(/\\b(Engine|Eng\\.?)\\s+([Ss5][A-Za-z0-9]{4,6})\\b/g, function(m, a, w){ return w.toLowerCase() !== "serial" && lev(w.toLowerCase().replace(/[1l|]/g, "i").replace(/5/g, "s"), "serial") <= 3 ? a + " Serial" : m; });   /* "Engine Sorlel #" */')
# ---- an operation's total read one digit off: the cells it adds up from win ----
rep('    ops.forEach(function(o){ o.story = o.story.replace(/\\s+/g, " ").trim(); if(o.story) o.story = sentenceCase(o.story); });',
    '    ops.forEach(function(o){ o.story = o.story.replace(/\\s+/g, " ").trim(); if(o.story) o.story = sentenceCase(o.story);\n'
    '      var parts0 = ["price", "partsAmt", "misc", "sublet"].filter(function(k){ return o[k] != null; });\n'
    '      if(o.total != null && parts0.length >= 2){ var sum = cents(parts0.reduce(function(a, k){ return a + o[k]; }, 0)), a1 = o.total.toFixed(2), a2 = sum.toFixed(2);\n'
    '        if(a1 !== a2 && a1.length === a2.length && a1.split("").filter(function(ch, i){ return ch !== a2[i]; }).length === 1) o.total = sum; } });   /* Parsec 14: $782.50 read for $762.50 */')
rep('    if(!f.roNumber && (m = /\\b(R[AO]\\d{6,12})\\b/.exec(text.replace(/\\bR([AO])O(?=\\d)/g, "R$10")))) f.roNumber = m[1];',
    '    if(!f.roNumber && (m = /\\b(R[AO]\\d{6,12})\\b/.exec(text.replace(/\\bR([AO])O(?=\\d)/g, "R$10").replace(/\\b(R[AO]\\d{4,9}) (\\d{1,6})\\b/g, function(x, a, b){ return (a + b).length === 12 ? a + b : x; })))) f.roNumber = m[1];   /* Parsec 14: "RA0001241 190" */')
# ======================= the review's two bugs =======================
# ---- 1 · a "Parts" heading ends the operations — never glued onto the last name; a case-level parts block goes where it belongs ----
rep('      var oc = opCols(fixLabels(t)); if(oc){ ocols = oc;',
    '      var c0 = splitCells(t);   /* Parsec 14: a "Parts" heading (alone, or the first cell of a line) ends the operations */\n'
    '      if(/^parts?\\s*:?$/i.test(c0[0] || "") && !/\\$|\\d\\.\\d{2}/.test(t) && !isPartsHead(t)){ if(cur){ ops.push(cur); cur = null; } inOps = false; story = null; continue; }\n'
    '      var oc = opCols(fixLabels(t)); if(oc){ ocols = oc;')
rep("        if(!cur.parts.length && !story && /^[a-z][a-z ,\\-]{2,30}$/i.test(t) && t.split(/\\s+/).length <= 4 && !labelOf(t) &&",
    "        if(!cur.parts.length && !story && /^[a-z][a-z ,\\-]{2,30}$/i.test(t) && t.split(/\\s+/).length <= 4 && !labelOf(t) && !HEAD.test(t) &&")
# loose parts: the op ASIST names, else the op whose name shares a word, else the bucket (the op most of them matched, or the one picked)
rep('  function plan(){\n    var taken = {}, ops = D.acc.ops.map(function(o, i){ return opPlan(o, i, taken); });',
    r'''  var STOPW = ["replace", "replaced", "check", "inspect", "service", "repair", "install", "remove", "level", "light", "fault", "front", "rear", "left", "right", "driver", "passenger", "side", "with", "from", "kit", "assembly", "unit", "complete"];
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
  function plan(){
    if(D.acc.ops.length) looseTo(); else D.loose = { at: { 0: D.acc.parts.slice() }, auto: [], rest: [] };
    var taken = {}, ops = D.acc.ops.map(function(o, i){ return opPlan(o, i, taken); });''')
rep('    var L = o.parts.slice(); if(i === D.lpTo && !D.lpOff) D.acc.parts.forEach(function(p){ L.push(p); });',
    '    var L = o.parts.slice(); ((D.loose && D.loose.at[i]) || []).forEach(function(p){ L.push(p); });   /* Parsec 14 */')
rep('''var lpSel = D.acc.parts.length && D.acc.ops.length ? '<div class="ix-lp">' + ic("parts", 13) + '<span>' + D.acc.parts.length + ' part' + (D.acc.parts.length === 1 ? '' : 's') + ' came in without their operation — they go on</span><select data-ix="lp" class="ix-in">' ''',
    '''var LZ = D.loose || { auto: [], rest: [] }, lpTxt = (LZ.auto.length ? LZ.auto.map(function(x){ return esc(x.p.desc || x.p.pn) + ' → Op ' + (D.acc.ops[x.i].no || x.i + 1) + ' (' + esc(x.by) + ')'; }).join(", ") + (LZ.rest.length ? '; ' : '') : '') + (LZ.rest.length ? LZ.rest.length + ' part' + (LZ.rest.length === 1 ? '' : 's') + ' with no operation named go on' : '');
    var lpSel = D.acc.parts.length && D.acc.ops.length ? '<div class="ix-lp">' + ic("parts", 13) + '<span>' + (LZ.rest.length ? '' : 'Parts listed apart from their operations: ') + lpTxt + '</span>' + (LZ.rest.length ? '<select data-ix="lp" class="ix-in">' ''')
rep('''+ '<option value="-1"' + (D.lpOff ? ' selected' : '') + '>Leave them out</option></select></div>' : '';''',
    '''+ '<option value="-1"' + (D.lpOff ? ' selected' : '') + '>Leave them out</option></select>' : '') + '</div>' : '';''')
rep('      if(t.getAttribute("data-ix") === "lp"){ var v = +t.value; D.lpOff = v < 0; if(v >= 0) D.lpTo = v; draw(); return; }',
    '      if(t.getAttribute("data-ix") === "lp"){ var v = +t.value; D.lpOff = v < 0; if(v >= 0) D.lpTo = v; D.lpSet = true; draw(); return; }')
# an operation imported before with "Parts" glued on its name gets its name back
rep('    var isNew = !hit, mf = M && M.f || {}, P = {',
    '    var glued = hit && nn(hit.complaint) === nn(o.name) + " parts";\n'
    '    var isNew = !hit, mf = M && M.f || {}, P = { glued: glued,')
# ---- 2 · ASIST's approval becomes Parsec's: Approved → approved, Declined → declined, Pending → needs approval; a hand-set one wins ----
rep('    P.codes = [o.opCode && "Op code " + o.opCode,',
    '    P.pa = paPlan(o, hit);\n    if(!isNew && (P.pa.act === "new" || P.pa.act === "upd" || glued)) P.bd = "upd"; else if(!isNew && P.pa.act === "kept" && P.bd === "same") P.bd = "kept";\n'
    '    P.codes = [o.opCode && "Op code " + o.opCode,')
rep('  function plan(){\n    if(D.acc.ops.length) looseTo();',
    r'''  /* what ASIST's approval does in Parsec — the same op.appr Triage's Approve and Decline write */
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
    if(D.acc.ops.length) looseTo();''')
rep('''      P.parts.forEach(function(q){ if(q.isNew){ c.new++; return; }''',
    '''      var apF = P.f.asistApproval && (P.f.asistApproval.bd === "upd" || P.f.asistApproval.bd === "new");   /* Parsec 14: one change per op, not two */
      if(P.pa){ if((P.pa.act === "new" || P.pa.act === "upd") && !apF) c.upd++; else if(P.pa.act === "kept" && !apF) c.kept++; } if(P.glued) c.upd++;
      P.parts.forEach(function(q){ if(q.isNew){ c.new++; return; }''')
rep("      if(Object.keys(ac).length > 1){ ac.at = nowIso(); op.asist = ac; }",
    "      if(Object.keys(ac).length > 1){ ac.at = nowIso(); op.asist = ac; }\n"
    "      if(P.glued) op.complaint = o.name;   /* Parsec 14: \"PM service - level A Parts\" → its own name */\n"
    "      if(P.pa && (P.pa.act === \"new\" || P.pa.act === \"upd\")){ var apw = String(get(\"createdBy\").fin || \"\").trim() || \"ASIST\";   /* Parsec 14: as Triage's Approve / Decline */\n"
    "        op.appr = { s: P.pa.want, by: \"ASIST\", at: nowIso(), who: apw, role: \"From ASIST\", how: \"ASIST\", po: P.pa.want === \"no\" ? \"\" : String(ro.poNumber || \"\"), amt: 0, reason: P.pa.want === \"no\" ? \"Declined in ASIST\" : \"\" };\n"
    "        op.declined = P.pa.want === \"no\"; apprN++;\n"
    "        try{ audit(\"approval\", roLabel(ro) + \" Op \" + raN(ro, op) + \": \" + (P.pa.want === \"no\" ? \"declined\" : \"approved\") + \" in ASIST — \" + apw + \" (ASIST)\", ro); }catch(e){} }")
rep('    var rn2 = ro.roNumber;', '    var rn2 = ro.roNumber, apprN = 0;')
rep("    if(D.acc.totals) ro.asistTotals = Object.assign({ at: nowIso() }, D.acc.totals);",
    "    if(D.acc.totals) ro.asistTotals = Object.assign({ at: nowIso() }, D.acc.totals);\n"
    "    try{ if(apprN && typeof tgSettle === \"function\") tgSettle(ro); }catch(e){}   /* Parsec 14: approved ops put the RO back on the board, as Triage does */")
