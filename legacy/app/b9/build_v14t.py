# Parsec 14 (T) — the road test toggle (ro.noRoadTest), an RO closes only at release, one Undo for a release,
# "No tech yet", one stage label everywhere, the work done reads Complete – Road test (never Hold tech for want of a road test),
# and the base pages' statuses in the shared look (b9/st14.js). Helpers: b9/v14t.js, styles b9/v14t.css.
# Runs inside build12.py: uses js, rep, b9, json, EXTRA_CSS, HOOK_NAMES, LOG.
js = rep(js, "\nvar PG = (function(){\n", "\n" + b9("v14t.js") + "\nvar PG = (function(){\n")
EXTRA_CSS.append(b9("v14t.css"))
_jc0 = js.index('var JC_CSS = "'); _jc1 = js.index('";\n', _jc0)
js = js[:_jc1] + json.dumps("\n" + b9("v14t.css"))[1:-1] + js[_jc1:]

# ---- closed means released (or declined): the work done is roWorkDone ----
js = rep(js, 'return s==="Complete – Road test" || s==="Complete – Released" || s==="Declined";\n}\nfunction roDoneAt(ro){',
         'return s==="Complete – Released" || s==="Declined";   /* Parsec 14: closed at release — the work done is roWorkDone */\n}\nfunction roDoneAt(ro){')
js = rep(js, '    if(roLooksFinished(ro) && !roIsDone(ro)){\n      out.push({code:"W7"', '    if(roLooksFinished(ro) && !roWorkDone(ro)){\n      out.push({code:"W7"')
js = rep(js, "  if (roLooksFinished(RO) && !roIsDone(RO) && !autoCfg().builtin.status) {", "  if (roLooksFinished(RO) && !roWorkDone(RO) && !autoCfg().builtin.status) {")
js = rep(js, "el('button', { type: 'button', text: 'Road test', onClick: function () { if (setRoStatus(RO.id, 'Complete \\u2013 Road test', null) === false)",
         "el('button', { type: 'button', text: rtNeeded(RO) ? 'Road test next' : 'Mark complete', onClick: function () { if (setRoStatus(RO.id, 'Complete \\u2013 Road test', null) === false)")

# ---- the work done is Complete – Road test; a road test only stands between it and Released, and only when the RO needs one ----
js = rep(js, 'function roCompleteGaps(ro){', 'function roCompleteGaps(ro, tgt){')
js = rep(js, '  if(!ro.roadTest) g.push("road test not logged"); else if(ro.roadTest.result === "Fail") g.push("road test failed");\n',
         '  if(tgt === "Complete \\u2013 Released" && rtNeeded(ro)){ if(!ro.roadTest) g.push("road test not logged"); else if(ro.roadTest.result === "Fail") g.push("road test failed"); }   /* Parsec 14 */\n')
js = rep(js, '    var gaps = roCompleteGaps(ro);\n    if(gaps.length){ pushToast("RO " + tgNum(ro) + " can\\u2019t be completed yet',
         '    var gaps = roCompleteGaps(ro, status);\n    if(gaps.length){ pushToast("RO " + tgNum(ro) + " can\\u2019t be completed yet')

# ---- one Undo for one action: steps saved in the same moment (a release and the status it sets) go back together ----
js = rep(js, '  var u = UNDO.pop();\n',
         '  var u = UNDO.pop();\n  while(u && u.label !== "automation" && UNDO.length && u.at && UNDO[UNDO.length - 1].at && u.at - UNDO[UNDO.length - 1].at < 80) u = UNDO.pop();   /* Parsec 14 */\n')

# ---- the stage track skips the road test when the RO doesn't need one ----
js = rep(js, '    S.roadtest = { ok: true, done: pass,', '    S.roadtest = { ok: rtNeeded(ro), done: pass,')

# ---- one stage label: the Triage and Foreman headers say what the RO page says (no square dot) ----
js = rep(js, "<b class=\"tg-no\">' + esc(roLabelFull(ro)) + '</b>' + tgSq(tyCat(ro)) + '<span>' + tgCatLbl(ro) + '</span>·<span class=\"tg-age",
         "<b class=\"tg-no\">' + esc(roLabelFull(ro)) + '</b><span class=\"tg-stg\" title=\"The RO’s stage\">' + esc(roStageTxt(ro) || tgCatLbl(ro)) + '</span>·<span class=\"tg-age")
js = rep(js, "'</b>' + tgSq(c) + '<span>' + esc(TG_CAT[c][0]) + '</span>·<span class=\"fm-cplt\">'",
         "'</b><span class=\"tg-stg\" title=\"The RO’s stage\">' + esc(roStageTxt(ro) || TG_CAT[c][0]) + '</span>·<span class=\"fm-cplt\">'")

# ---- nobody named yet: "No tech yet", not "With Technician" ----
js = rep(js, "<div class=\"hd\">With <b>' + esc(hd.who) + '</b> · ' + esc(RT_LBL[hd.to]) + '<time>'",
         "<div class=\"hd\">' + (rtNoTech(ro) ? '<b>No tech yet</b>' : 'With <b>' + esc(hd.who) + '</b>') + ' · ' + esc(RT_LBL[hd.to]) + '<time>'")
js = rep(js, "el('span', { class: 'px-with', html: 'with <span class=\"px-av\">' + esc(ivInit(hn)) + '</span> ' + esc(hn) + (s0 ? ' · ' + esc(rtDur(ageSince(s0))) : '') })",
         "el('span', { class: 'px-with', html: (rtNoTech(RO) ? 'No tech yet' : 'with <span class=\"px-av\">' + esc(ivInit(hn)) + '</span> ' + esc(hn)) + (s0 ? ' · ' + esc(rtDur(ageSince(s0))) : '') })")

# ---- Foreman: no Road test group, and the words, when the RO doesn't need one ----
js = rep(js, '    else if(st === "Complete – Road test" && !ro.roadTest) it = { g: "road"', '    else if(st === "Complete – Road test" && !ro.roadTest && rtNeeded(ro)) it = { g: "road"')
js = rep(js, '  if(st === "Complete – Road test") return { t: now + 0.5, k: "done", txt: ro.roadTest ? "QC, then release" : "road test next" };',
         '  if(st === "Complete – Road test") return { t: now + 0.5, k: "done", txt: !rtNeeded(ro) ? "release next" : ro.roadTest ? "QC, then release" : "road test next" };')
js = rep(js, "  else if(st === \"Complete – Road test\"){ c = 'done'; stt = ro.roadTest ?",
         "  else if(st === \"Complete – Road test\"){ c = 'done'; stt = !rtNeeded(ro) ? tgI(\"check\", 12) + 'Ready to release' : ro.roadTest ?")
js = rep(js, "  if(st === \"Complete – Road test\") return [ro.roadTest ?", "  if(st === \"Complete – Road test\") return [!rtNeeded(ro) ? 'ready to release' : ro.roadTest ?")
js = rep(js, "  if(st === \"Complete – Road test\") return R('good', 'Road test done — release the truck.'",
         "  if(st === \"Complete – Road test\") return R('good', rtNeeded(ro) ? 'Road test done — release the truck.' : 'Work done — release the truck.'")

# ---- Ready to close / Release: no road test line when the RO doesn't need one; no truck checks line either ----
js = rep(js, "    { k: \"road\", t: \"Road test passed\", ok: !!rt && rt.result !== \"Fail\", d: rt ? rt.result + (rt.miles ? ' · ' + rt.miles + ' mi' : '') : 'not logged yet' }\n  ];",
         "    { k: \"road\", t: \"Road test passed\", ok: !!rt && rt.result !== \"Fail\", d: rt ? rt.result + (rt.miles ? ' · ' + rt.miles + ' mi' : '') : 'not logged yet' }\n  ].filter(function(c){ return c.k !== \"road\" || rtNeeded(ro); });   /* Parsec 14 */")
js = rep(js, '  L.push(trxRelCheck(ro));\n', '  var trq = trxRelCheck(ro); if(trq) L.push(trq);   /* Parsec 14: none when the RO needs no road test */\n')

# ---- Warranty: the claim status in the shared look ----
js = rep(js, "function waChip(s){ var t = WC_ST[s] || WC_ST.repair; return '<span class=\"wa-c ' + t.c + '\"><i></i>' + esc(t.l) + '</span>'; }",
         "function waChip(s){ var t = WC_ST[s] || WC_ST.repair; return pgSt('claim', t.l, { cls: 'sm wa-claimst' }); }   /* Parsec 14: one status look */")

HOOK_NAMES += ["rtNeeded", "rtToggle", "roWorkDone", "roStageInfo", "roStageTxt", "roStShown", "rtNoTech", "sentToMe", "roCompleteGaps", "roIsDone", "tyCloseChecks", "tgRelChecks", "undoLast", "setRoStatus", "roAutoTarget", "syncDateClosedRo"]
LOG.append("Parsec 14 (T): the road test toggle, closed at release, one Undo for a release, one stage label, No tech yet")

# ---- the RO page (JC): the shared status icons; the RO status and the part status in the shared look ----
js = rep(js, """function pxSi(name, extra) {
  var m = PX_ST[name] || (/^Complete/.test(name || '') ? PX_ST['Complete – Released'] : PX_ST['Hold Tech']);
  return '<svg class="px-si' + (extra ? ' ' + extra : '') + '" data-s="' + m[1] + '" viewBox="0 0 14 14" aria-hidden="true">' + PX_SI[m[0]] + '</svg>';
}
function pxPsi(st) { var m = PX_PS.filter(function (x) { return x[0] === st; })[0] || PX_PS[0]; return '<svg class="px-si" data-s="' + m[2] + '" viewBox="0 0 14 14" aria-hidden="true">' + PX_SI[m[1]] + '</svg>'; }""",
"""/* Parsec 14: the shared status icons (b9/st14.js) — the same shapes and colors as every other page */
function pxSi(name, extra) { var S = pgStOf('ro', name || 'Hold Tech'); return '<svg class="px-si pgst-i' + (extra ? ' ' + extra : '') + '" data-t="' + S.tone + '" viewBox="0 0 14 14" aria-hidden="true">' + (PGST_IC[S.ic] || PGST_IC.ring) + '</svg>'; }
function pxPsi(st) { var S = pgStOf('part', st || 'Not Ordered'); return '<svg class="px-si pgst-i" data-t="' + S.tone + '" viewBox="0 0 14 14" aria-hidden="true">' + (PGST_IC[S.ic] || PGST_IC.ring) + '</svg>'; }""")
js = rep(js, """var b = el('button', { class: 'px-pstat', type: 'button', title: 'Part status and options', html: pxPsi(st) + '<span>' + esc(pxCase(st)) + '</span>' + pxI('chevD', 12).replace('class="px-ico"', 'class="px-ico px-chev"') });""",
         """var b = pgStEl('part', st, { menu: 1, cls: 'sm px-pstat', title: 'Part status and options' });   /* Parsec 14 */""", 2)
js = rep(js, """<span class="px-pstat-ro">' + pxPsi(p.status || 'Not Ordered') + '<span>' + esc(pxCase(p.status || 'Not Ordered')) + '</span></span>'""",
         """' + pgSt('part', p.status || 'Not Ordered', { cls: 'sm px-pstat-ro' })""")
js = rep(js, """  var sb = el('button', { class: 'px-status--button' + (live ? ' px-live' : ''), type: 'button', title: 'Set status (S)', 'aria-haspopup': 'menu',
    html: pxSi(st.status) + '<span>' + esc(pxCase(st.status)) + '</span>' + (st.sub ? '<span class="px-status__sub">· ' + esc(st.sub.charAt(0) + st.sub.slice(1).toLowerCase()) + '</span>' : '') + pxI('chevD', 12).replace('class="px-ico"', 'class="px-ico px-chev"') });
  sb.addEventListener('click', function (e) { e.stopPropagation(); pxStatusMenu(sb); });""",
"""  var mayS = typeof can !== 'function' || can('ro.status');   /* Parsec 14: a pill only where you may change it */
  var sb = pgStEl('ro', roStFor(RO), { menu: mayS, cls: 'px-status--button' + (live ? ' px-live' : ''), title: mayS ? 'Set status (S)' : 'RO status', label: roStShown(RO), sub: st.sub ? '· ' + st.sub.charAt(0) + st.sub.slice(1).toLowerCase() : '' });
  if (mayS) sb.addEventListener('click', function (e) { e.stopPropagation(); pxStatusMenu(sb); });""")
js = rep(js, "    toast('Status set to ' + pxCase(name) + (s ? ' · ' + s.charAt(0) + s.slice(1).toLowerCase() : ''), { label: 'UNDO', run: function () { restoreSnapshot(); } });",
         "    toast('Status set to ' + roStShown(RO) + (s ? ' · ' + s.charAt(0) + s.slice(1).toLowerCase() : ''), { label: 'UNDO', run: function () { restoreSnapshot(); } });")

# ---- the release toast: the open checks by their names, the RO in capitals ----
js = rep(js, 'pushToast(any ? "Released anyway — " + ro.releaseRec.override.open.join(", ").toLowerCase() + " still open · “" + A.reason + "”"',
         'pushToast(any ? "Released " + tgNum(ro) + " anyway — still open: " + ro.releaseRec.override.open.join(", ") + " · “" + A.reason + "”"')
HOOK_NAMES += ["roStFor", "tyOpSet", "tgRelease", "trxRtGo", "trxBtns", "trxBtnsOk", "sentDone", "sentToMe", "pgStRo"]

# ---- the old dot-and-tint "pill" (Warranty's operation card, the status dialog, Search results) → the shared look ----
js = rep(js, """function pillHtml(st){
  var s = typeof st==="string"?st:st.status, sub = typeof st==="string"?null:st.sub;
  return '<span class="pill '+statusTone(st)+'"><span class="dot"></span>'+esc(s)+(sub?' · '+esc(sub):'')+'</span>';
}""", """function pillHtml(st){   /* Parsec 14: one status look (b9/st14.js) */
  var s = typeof st==="string"?st:st.status, sub = typeof st==="string"?null:st.sub;
  return pgSt('ro', s, { cls: 'sm', sub: sub ? '· ' + sub : '' });
}""")

# ---- an approval recorded on the operation (Triage, or ASIST's on import) counts as the customer's approval — not only a repair clock ----
js = rep(js, '    if(repairPunch && fcPay(ro, op) === "customer") approvedSignal = true;',
         '    if((repairPunch || (op.appr && op.appr.s === "ok")) && fcPay(ro, op) === "customer") approvedSignal = true;   /* Parsec 14 */')

# ---- Triage / Foreman: the status icon and words from the shared look ("Hold tech", the sub in lower case); the Desk's menu too ----
js = rep(js, 'function tgSi(ro){ return TG_SI[TG_STK[roStatus(ro).status] || "hold"] || \'\'; }', 'function tgSi(ro){ return pgStIcon("ro", roStFor(ro)); }   /* Parsec 14 */')
js = rep(js, 'function tgStTxt(ro){ var s = roStatus(ro); return s.status + (s.sub ? " · " + s.sub : ""); }',
         'function tgStTxt(ro){ var s = roStatus(ro); return roStShown(ro) + (s.sub ? " · " + s.sub.charAt(0) + s.sub.slice(1).toLowerCase() : ""); }   /* Parsec 14 */')
js = rep(js, "'>' + esc(p[1] ? p[0] + ' · ' + p[1] : p[0]) + '</option>'", "'>' + esc(p[1] ? pgStLabel('ro', p[0]) + ' · ' + p[1] : pgStLabel('ro', p[0])) + '</option>'")
