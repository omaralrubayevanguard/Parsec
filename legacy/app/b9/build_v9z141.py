# (named v9z141 so it runs after build_v14t.py / build_v14c.py — it patches text those files write)
# Parsec 14.1 — the RO flow: Done asks instead of refusing (story, 0:00, parts), Start warns on an ASIST-Pending operation,
# a returning truck reopens its RO as a comeback, the RO waits on parts only when every open operation does, one release list
# (the walk-around inside Release, Story and Hours lines), Send straight from the Next bar, and the RO's details editable from
# the RO list pane and the Technician pane through one table (ROFLD). Code: b9/v141.js, styles b9/v141.css.
# Runs inside build12.py: uses js, rep, b9, json, EXTRA_CSS, HOOK_NAMES, LOG.
js = rep(js, "\nvar PG = (function(){\n", "\n" + b9("v141.js") + "\nvar PG = (function(){\n")
EXTRA_CSS.append(b9("v141.css"))
_jc0 = js.index('var JC_CSS = "'); _jc1 = js.index('";\n', _jc0)
js = js[:_jc1] + json.dumps("\n" + b9("v141.css"))[1:-1] + js[_jc1:]

# 1 + 2 — the gate asks: opCompleteGaps goes through v141Gaps (the base one is opCompleteGaps0)
js = rep(js, "function opCompleteGaps(op){                      /* Parsec 12.5", "function opCompleteGaps(op){ return opCompleteGaps0(op); }   /* Parsec 14.3: what holds an op back (parts not installed …); the soft ones — no story, 0:00 — are asked at Done (v141GapsAsk) */\nfunction opCompleteGaps0(op){                      /* Parsec 12.5")
if js.count("pushToast(res === true ? 'Stop reason: ' + r + '.' : 'Not complete yet — ' + res.map(x => x.t).join(' · ') + '. Stopped as Hold Tech.');"):   # Parsec 14.3: only while the Technician page has its own clock card
    js = rep(js, "pushToast(res === true ? 'Stop reason: ' + r + '.' : 'Not complete yet — ' + res.map(x => x.t).join(' · ') + '. Stopped as Hold Tech.');", "if(res === true) pushToast('Stop reason: ' + r + '.');   /* Parsec 14.1: the question asks */")
js = rep(js, 'if(gg.length){ pushToast("Not complete yet \\u2014 " + gg.map(function(x){ return x.t; }).join(" \\u00b7 ") + ". Stopped as Hold Tech."); reason = "Hold Tech"; }',
         'if(gg.length){ reason = "Hold Tech"; }   /* Parsec 14.1: the question asks — no toast */')
js = rep(js, "  toast('Not complete yet \\u2014 ' + g.map(function (x) { return x.t; }).join(' \\u00b7 '));\n  if (g[0].k === 'parts') focusParts(job);\n  else { job.punchesCollapsed = false; job.punchRailShut = false; S.ui.card = job.id; save(); render(); }\n  return true;",
         "  return true;   /* Parsec 14.1: the question asks (Finish anyway / Mark installed / Write the story) */")

# 3 — Start on an operation ASIST hasn't approved warns once
js = rep(js, "function doStartPunch(roId, opId, reason){\n", "function doStartPunch(roId, opId, reason){ if(v141StartGate(roId, opId, reason)) return; return doStartPunch0(roId, opId, reason); }   /* Parsec 14.1 */\nfunction doStartPunch0(roId, opId, reason){\n")

# 4 — a returning truck: after a New RO is made (import or typed), ask about the comeback
js = rep(js, 'if(wasNew){ UI.view = "ros"; UI.selectedRo = id; UI.roFilter = ""; UI.modal = null; }',
         'if(wasNew){ UI.view = "ros"; UI.selectedRo = id; UI.roFilter = ""; UI.modal = null; setTimeout(function(){ try{ v141Comeback(getRO(id)); }catch(e){ console.error(e); } }, 150); }')
js = rep(js, 'newRo.model = val("f-model").trim();', 'newRo.model = val("f-model").trim(); setTimeout(function(){ try{ v141Comeback(newRo); }catch(e){ console.error(e); } }, 150);   /* Parsec 14.1 */')

# 5 — the RO waits on parts only when every open operation does
js = rep(js, '  if(sts.indexOf("Waiting \\u2013 Parts") >= 0){\n    var all = [];',
         '  if(sts.indexOf("Waiting \\u2013 Parts") >= 0 && v141Workable(live).length){ var nw = sts.filter(function(x){ return x === "Waiting \\u2013 Parts"; }).length; return { status: "Hold Tech", sub: nw + " op" + (nw === 1 ? "" : "s") + " waiting on parts" }; }   /* Parsec 14.1 */\n  if(sts.indexOf("Waiting \\u2013 Parts") >= 0){\n    var all = [];')
js = rep(js, "ro.status = { status: status, sub: (opt.subs.indexOf(sub) >= 0 ? sub : null), setAt: nowIso() };",
         "ro.status = { status: status, sub: (opt.subs.indexOf(sub) >= 0 || /waiting on parts$/.test(sub || \"\") ? sub : null), setAt: nowIso() };")

# 6 + 7 — one release list: the walk-around inside Release, Story and Hours lines, a note when 0 h is clocked
js = rep(js, '  var trq = trxRelCheck(ro); if(trq) L.push(trq);', '  v141RelLines(ro, L);   /* Parsec 14.1: Story on every operation · Hours */\n  var trq = trxRelCheck(ro); if(trq) L.push(trq);')
js = rep(js, '  var hand = RELEASE_CHECK.filter(function(x){ return x[0] !== "road"; });\n  var handBad = hand.filter(function(x){ return !rs[x[0]]; });',
         '  v141WalkSync(ro); var hand = v141Hand(ro);   /* Parsec 14.1: keys and clean come from the walk-around */\n  var handBad = hand.filter(function(x){ return !rs[x[0]]; });')
js = rep(js, "  var handH = '<span class=\"tg-lbl top\">Handover</span><div class=\"tg-r\">' + hand.map(", "  var handH = v141WalkH(ro) + '<span class=\"tg-lbl top\">Handover</span><div class=\"tg-r\">' + hand.map(")
js = rep(js, "(c.k === \"gaps\" || c.k === \"files\" ? '<button class=\"tg-link\" data-action=\"goto-ro\"", "(c.k === \"gaps\" || c.k === \"files\" || c.k === \"story\" ? '<button class=\"tg-link\" data-action=\"goto-ro\"")
js = rep(js, '  var handBad = RELEASE_CHECK.filter(function(x){ return x[0] !== "road" && !rs[x[0]]; });\n  if((bad.length || handBad.length) && !any) return; if(any && !A.reason) return;',
         '  v141WalkSync(ro); var handBad = v141Hand(ro).filter(function(x){ return !rs[x[0]]; });\n  if((bad.length || handBad.length) && !any) return; if(any && (!A.reason || (v141Hours(ro).bad && !String(A.why || "").trim()))) return;   /* Parsec 14.1: 0 h clocked needs a note */')
js = rep(js, 'data-tg-in="rl-why" placeholder="', 'data-tg-in="rl-why" placeholder="' + "' + (v141Hours(ro).bad ? 'Why is nothing clocked? (needed) — ' : '') + '")

# 7 — Send straight from the Next bar when there's nothing to choose
js = rep(js, '    if(d0.to === "tech") d0.who = ro.assignedTech || null;\n    UI.rtRet = null;',
         '    if(d0.to === "tech") d0.who = ro.assignedTech || null;\n    if(t.closest && t.closest(".rt2-sug") && d0.to && (d0.to !== "tech" || d0.who)){ pushUndo("send RO"); rtSend(ro, d0.to, d0.who, "", null, { reason: d0.reason, accept: d0.acc !== false }); pushToast(roLabel(ro) + " sent to " + rtWhoText(ro) + ".", true); render(); try{ if(typeof JC !== "undefined" && JC && JC.rerender) JC.rerender(); }catch(e){} return true; }   /* Parsec 14.1 */\n    UI.rtRet = null;')

# 8 — the RO page edits through the same table (Undo, the value, an Activity line)
js = rep(js, "function pxField2(k) { return { get: function () { return RO[k] || ''; }, set: function (v) { RO[k] = v; } }; }",
         "function pxField2(k) { return roFldEdit(RO, k) || { get: function () { return RO[k] || ''; }, set: function (v) { RO[k] = v; } }; }   /* Parsec 14.1: one table (ROFLD) */")

js = rep(js, "function opStatus(op){\n", "function opStatusX(op){ return opStatus(op); }\nfunction opStatus(op){\n")
HOOK_NAMES += ["rtSuggest", "opStatusX", "autoStatusName", "roAutoTarget", "addRO", "doStartPunch", "trxQc", "staffList", "pgAsk", "pgAskClose", "V141", "v141Gaps", "v141PriorRo", "v141Comeback", "v141Hours", "v141Story", "v141Hand", "roFldSet", "roFld", "roDetailsHtml", "ROFLD", "v141Workable"]
LOG.append("Parsec 14.1: the RO flow — soft gates, comebacks, one release list, RO details everywhere")
