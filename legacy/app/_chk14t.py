import sys
s = open('t12.html', encoding='utf-8').read()
T = [
 'return s==="Complete – Road test" || s==="Complete – Released" || s==="Declined";\n}\nfunction roDoneAt(ro){',
 '    if(roLooksFinished(ro) && !roIsDone(ro)){\n      out.push({code:"W7"',
 "  if (roLooksFinished(RO) && !roIsDone(RO) && !autoCfg().builtin.status) {",
 "el('button', { type: 'button', text: 'Road test', onClick: function () { if (setRoStatus(RO.id, 'Complete \\u2013 Road test', null) === false) { tecRender(); return; } save(true); render(); tecRender(); } }),",
 'function roCompleteGaps(ro){',
 '  if(!ro.roadTest) g.push("road test not logged"); else if(ro.roadTest.result === "Fail") g.push("road test failed");\n',
 '    var gaps = roCompleteGaps(ro);\n    if(gaps.length){ pushToast("RO " + tgNum(ro) + " can\\u2019t be completed yet',
 '  var u = UNDO.pop();\n',
 '    S.roadtest = { ok: true, done: pass,',
 "'<b class=\"tg-no\">' + esc(roLabelFull(ro)) + '</b>' + tgSq(tyCat(ro)) + '<span>' + tgCatLbl(ro) + '</span>·<span class=\"tg-age",
 "'</b>' + tgSq(c) + '<span>' + esc(TG_CAT[c][0]) + '</span>·<span class=\"fm-cplt\">'",
 "'<div class=\"hd\">With <b>' + esc(hd.who) + '</b> · ' + esc(RT_LBL[hd.to]) + '<time>'",
 "el('span', { class: 'px-with', html: 'with <span class=\"px-av\">' + esc(ivInit(hn)) + '</span> ' + esc(hn) + (s0 ? ' · ' + esc(rtDur(ageSince(s0))) : '') })",
 '    else if(st === "Complete – Road test" && !ro.roadTest) it = { g: "road"',
 '  if(st === "Complete – Road test") return { t: now + 0.5, k: "done", txt: ro.roadTest ? "QC, then release" : "road test next" };',
 "  else if(st === \"Complete – Road test\"){ c = 'done'; stt = ro.roadTest ?",
 "  if(st === \"Complete – Road test\") return [ro.roadTest ?",
 "  if(st === \"Complete – Road test\") return R('good', 'Road test done — release the truck.'",
 "    { k: \"road\", t: \"Road test passed\", ok: !!rt && rt.result !== \"Fail\", d: rt ? rt.result + (rt.miles ? ' · ' + rt.miles + ' mi' : '') : 'not logged yet' }\n  ];",
 '  L.push(trxRelCheck(ro));\n',
 "function waChip(s){ var t = WC_ST[s] || WC_ST.repair; return '<span class=\"wa-c ' + t.c + '\"><i></i>' + esc(t.l) + '</span>'; }",
]
for t in T:
    print(s.count(t), repr(t[:90]))
