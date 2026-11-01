# Parsec 14 (fork X) — the import reads every cost and the engine serial: patch b9/imp1.js from its 13.1 copy
import os, re
H = os.path.dirname(os.path.abspath(__file__))
S = open(os.path.join(H, "b9", "imp1.js.131"), encoding="utf-8").read()
X = lambda f: open(os.path.join(H, "x132", f), encoding="utf-8").read()
def rep(a, b, n=1):
    global S
    c = S.count(a); assert c == n, (a[:100], c); S = S.replace(a, b)
def cut(a, b, new):   # replace from marker a (inclusive) to marker b (exclusive)
    global S
    i = S.index(a); j = S.index(b, i); assert S.count(a) == 1
    S = S[:i] + new + S[j:]

# ---- the engine serial: every label it goes by ----
rep('    ["engineSerial", /^engine\\s*(?:serial|s\\/n|sn)\\s*(?:#|no\\.?|number)?(?=\\s*[:#]|\\s+[A-Z0-9]|\\s*$)/i],',
    '    ["engineSerial", /^(?:eng(?:ine)?\\.?\\s*(?:serial|s\\/n|sn|no\\b\\.?|number|#)(?:\\s*(?:#|no\\b\\.?|number))?|esn)(?=\\s*[:#]|\\s+[A-Z0-9]|\\s*$)/i],   /* Parsec 14: Engine Serial #, Engine S/N, Engine No., ESN */')
rep('    ["engine", /^engine(?:\\s*(?:model|make|type|description))?(?!\\s*(?:serial|s\\/n|sn|hours?))(?=\\s*:|\\s*$|\\s+[A-Z0-9])/i],',
    '    ["engine", /^engine(?:\\s*(?:model|make|type|description))?(?!\\s*(?:serial|s\\/n|sn|hours?|no\\b|number|#))(?=\\s*:|\\s*$|\\s+[A-Z0-9])/i],')
rep('var MID = /(?<!\\b(?:Engine|Asset|Model|On-?site|Support|Key))\\s(?=(?:RO|PO|Auth|Status|ETR|Follow[\\s-]*up|Created by|Checked in|Make|Model|Year|VIN|Unit|Serial|Chassis|Engine(?:\\s*(?:Serial|Hours))?|',
    'var MID = /(?<!\\b(?:Engine|Eng\\.?|Asset|Model|On-?site|Support|Key))\\s(?=(?:RO|PO|Auth|Status|ETR|Follow[\\s-]*up|Created by|Checked in|Make|Model|Year|VIN|Unit|Serial|Chassis|ESN|Eng\\.?\\s*(?:Serial|S\\/N|SN)|Engine(?:\\s*(?:Serial(?:\\s*Number)?|S\\/N|SN|No\\.?|Number|Hours|#))?|')
rep('    if(!f.engHours && (m = /Last Updated:\\s*([\\d,]+)\\s*hours/i.exec(text))) f.engHours = m[1].replace(/,/g, "");',
    '    if(!f.engHours && (m = /Last Updated:\\s*([\\d,]+)\\s*hours/i.exec(text))) f.engHours = m[1].replace(/,/g, "");\n'
    '    if(!f.engineSerial && (m = /\\b(?:ESN|Eng(?:ine)?\\.?\\s*(?:Serial|S\\/N|SN)(?:\\s*(?:#|No\\.?|Number))?)\\s*[:#]?\\s*([A-Z0-9][A-Z0-9\\-]{4,20})\\b/i.exec(text)) && /\\d/.test(m[1])) f.engineSerial = m[1].toUpperCase();   /* Parsec 14 */')
# OCR: "E5N" is ESN
rep('.replace(/\\b(Asset)\\s+[A-Za-z]{5,9}\\s+(In)\\b/g, "$1 Checked $2");',
    '.replace(/\\b(Asset)\\s+[A-Za-z]{5,9}\\s+(In)\\b/g, "$1 Checked $2").replace(/(^|\\t|\\s)E[5$]N(?=\\s*[:#\\t]|\\s+\\d)/g, "$1ESN");')

# ---- parts: the header's columns, list / disc / net / core / ext ----
cut('  var PTH = /', '  function isPn(t){', X("parts_block.js"))
cut('  /* one part line: Part # · Description', '  function readOps(L){', X("partline.js"))

# ---- operations: the header's money columns, and the amounts under an operation ----
rep('    var ops = [], cur = null, cols = null, inOps = false, story = null, loose = [], endAt = -1, lblCol = false;',
    '    var ops = [], cur = null, cols = null, inOps = false, story = null, loose = [], endAt = -1, lblCol = false, ocols = null;')
rep("      if(/\\bop\\s*#|operation\\b.*\\b(labor|approval|hours)/i.test(t) && !OPH.test(t)){ inOps = true; if(/label/i.test(t)) lblCol = true; continue; }   /* the table's own header */",
    "      var oc = opCols(fixLabels(t)); if(oc){ ocols = oc; inOps = true; if(/label/i.test(t)) lblCol = true; continue; }   /* Parsec 14: the operations table's header — which amount is which */\n"
    "      if(/\\bop\\s*#|operation\\b.*\\b(labor|approval|hours)/i.test(t) && !OPH.test(t)){ inOps = true; if(/label/i.test(t)) lblCol = true; continue; }   /* the table's own header */")
rep('        cur = { no: +hm[1], name: cjClean(nm), hours: null, price: null, approval: "", label: "", opCode: "", vmrs: "", skill: "", priceCode: "", story: "", storyBy: "", parts: [] };',
    '        cur = blankOp(+hm[1], cjClean(nm));')
rep('        cur.hours = cjHours(after0.replace(AP, " ")); cur.price = cjCost(after0.replace(AP, " "), cur.hours);',
    '        var fv = fitOp(opVals(after0), ocols);   /* Parsec 14: hours, rate, labor, parts, misc, sublet, total */\n'
    '        cur.hours = fv.hours != null ? fv.hours : cjHours(after0.replace(AP, " ")); cur.price = fv.labor != null ? fv.labor : null;\n'
    '        ["rate", "parts", "misc", "sublet", "total"].forEach(function(k){ if(fv[k] != null) cur[k === "parts" ? "partsAmt" : k] = fv[k]; });\n'
    '        if(cur.price == null && !ocols && fv.total != null && cur.partsAmt == null && cur.misc == null && cur.sublet == null){ cur.price = fv.total; delete cur.total; cur.total = null; }')
rep('        var gotCode = grabCodes(cur, t);\n        if(story && !gotCode && !isPartsHead(t)){',
    '        var gotCode = grabCodes(cur, t), gotCost = grabCosts(cur, t);   /* Parsec 14 */\n        if(story && !gotCode && !gotCost && !isPartsHead(t)){')
rep('      parseCaseJobs(L).forEach(function(j, i){ ops.push({ no: i + 1, name: j.name, hours: j.hours, price: j.cost, approval: normAp(j.approval), label: "", opCode: "", vmrs: "", skill: "", priceCode: "", story: "", storyBy: "", parts: [] }); });',
    '      parseCaseJobs(L).forEach(function(j, i){ var o = blankOp(i + 1, j.name); o.hours = j.hours; o.price = j.cost; o.approval = normAp(j.approval); ops.push(o); });')
# merging pieces keeps the new amounts
rep('      else ["hours", "price", "approval", "label", "opCode", "vmrs", "skill", "priceCode", "storyBy"].forEach(function(k){ if(o[k] !== "" && o[k] != null) a[k] = o[k]; });',
    '      else ["hours", "price", "rate", "partsAmt", "misc", "sublet", "total", "approval", "label", "opCode", "vmrs", "skill", "priceCode", "storyBy"].forEach(function(k){ if(o[k] !== "" && o[k] != null) a[k] = o[k]; });')

# ---- totals: every amount on the line, tax on its own, an inline "Totals: Labor $… Parts $… Total $…" ----
cut('  function readTotals(L){', '  /* one piece of text → what it holds */', r'''  var TOTP = /(labou?r|parts?|core(?:\s*charges?)?|shop\s*supplies|supplies|misc(?:ellaneous)?|sublet|environmental(?:\s*fees?)?|fees?|tax(?:es)?|grand\s*total|sub\s*-?\s*total|total)(?![a-z])[^$\d\-\n]{0,24}?(-?\$?\s?[\d,]+\.\d{2})/gi;
  function readTotals(L){
    var T = {}, on = false, got = 0;
    var take = function(s){ var m; TOTP.lastIndex = 0; while((m = TOTP.exec(s))){ var k = m[1].toLowerCase(), v = money(m[2]); if(v == null) continue; got++;
      if(/^labo/.test(k)) T.labor = v; else if(/^part/.test(k)) T.parts = v; else if(/^core/.test(k)) T.core = v; else if(/^tax/.test(k)) T.tax = v;
      else if(/^(grand\s*)?total/.test(k)) T.total = v; else if(/^sub/.test(k) && !/^sublet/.test(k)) T.sub = v; else { T.misc = cents((T.misc || 0) + v); if(/^sublet/.test(k)) T.sublet = v; } } };
    L.forEach(function(l){
      var t = l.trim();
      if(/^totals?(?:\s*summary)?\s*:?$/i.test(t) || /^totals?\s*summary\b/i.test(t)){ on = true; take(t.replace(/^totals?\s*(?:summary)?\s*:?/i, "")); return; }
      if(!on){ var im = /(?:^|\s)totals?\s*(?:summary)?\s*:\s*(.+)$/i.exec(t); if(im && !/(?:op(?:eration)?|line|job|parts?)\s*totals?\s*:/i.test(t)) take(im[1]); return; }   /* Parsec 14: "Totals: Labor $… Parts $… Total $…" on one line */
      if(/^(?:user\s*notes?|system\s*notes?|notes|operations?|print\/pdf|case\s*level)\b/i.test(t)){ on = false; return; }
      take(t);
    });
    return got ? T : null;
  }
''')
exec(open(os.path.join(H, "x132", "plan_patch.py"), encoding="utf-8").read())
open(os.path.join(H, "b9", "imp1.js"), "w", encoding="utf-8").write(S)
print("imp1.js parse side patched")
