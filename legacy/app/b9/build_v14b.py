# Parsec 14 (B) — the Parts page, Inventory and the Inbox strip in the shop's one status look (their own files: pt1–pt5, v126, inv1, ib2),
# plus, here in the base: automation toasts that name the RO and never wipe the message you just got (b9/v14b.js), spots found by their
# yard code, initials instead of stock portraits, the assistant that can't call out, the hand-typed New RO's toast, the Assign pop's bar.
# Runs inside build12.py: uses js, rep, b9, EXTRA_CSS, HOOK_NAMES, LOG.
js = rep(js, "\nvar PG = (function(){\n", "\n" + b9("v14b.js") + "\nvar PG = (function(){\n")

# automations: the toast names the RO, and is added to a message shown in the last 3 s instead of replacing it (v14AutoToast)
js = rep(js, '    pushToast((typeof opReoTake === "function" ? opReoTake() : "") + "Automation · " + x[1].rule + ": " + x[1].acts.map(autoActText).join(" · "), true);',
         '    v14AutoToast(x[0], x[1]);   /* Parsec 14 */')

# people: initials or an uploaded photo — the button that dropped the photo said "Use portrait"
js = rep(js, '">Use portrait</button>', '">Use initials</button>')

# the hidden assistant: nothing it holds is sent anywhere (the call to the outside service is gone)
_a0 = js.index("function asstCallAPI(messages){")
_a1 = js.index("\n}\n", _a0) + 3
assert "api.anthropic.com" in js[_a0:_a1]
js = js[:_a0] + 'function asstCallAPI(messages){   /* Parsec 14: off — nothing is sent off this computer */\n  return Promise.reject(new Error("The assistant is off in Parsec — nothing is sent off this computer."));\n}\n' + js[_a1:]
assert "api.anthropic.com/v1" not in js

# New RO typed by hand: "Created RO 0123", not "from ASIST · 2 typed"
js = rep(js, '    try{ autoHist(ro, { at: Date.now(), k: "import", t: D.new ? "Created from ASIST" : "Imported from ASIST", o: "", n: sum, op: "", by: me }); }catch(e){}',
         '    var v14typed = D.new && !(D.pieces && D.pieces.length);   /* Parsec 14: nothing came from ASIST — typed by hand */\n'
         '    try{ autoHist(ro, { at: Date.now(), k: "import", t: v14typed ? "Created" : D.new ? "Created from ASIST" : "Imported from ASIST", o: "", n: v14typed ? "typed by hand" : sum, op: "", by: me }); }catch(e){}')
js = rep(js, '    try{ audit("import", roLabel(ro) + ": " + (D.new ? "created from ASIST" : "imported from ASIST") + " — " + sum, ro); }catch(e){}',
         '    try{ audit(v14typed ? "ro" : "import", roLabel(ro) + ": " + (v14typed ? "created by hand" : (D.new ? "created from ASIST" : "imported from ASIST") + " — " + sum), ro); }catch(e){}')
js = rep(js, '    pushToast((wasNew ? "Created RO " + tgNum(ro) + " from ASIST" : "Imported from ASIST — RO " + tgNum(ro)) + " · " + sum + (Pl.people.length ? " · " + Pl.people.length + " joined the Team" : "") + ".", true);',
         '    pushToast(v14typed ? "Created RO " + tgNum(ro) + "." : (wasNew ? "Created RO " + tgNum(ro) + " from ASIST" : "Imported from ASIST — RO " + tgNum(ro)) + " · " + sum + (Pl.people.length ? " · " + Pl.people.length + " joined the Team" : "") + ".", true);')

# Foreman → Assign: "Dana · 7.4 h free" beside a bar that read "12.1 / 8 h · 4.1 over" — the bar now says what this job adds
js = rep(js, "<span class=\"t\">' + r1(work + job) + ' / ' + r1(left) + ' h' + (over ? ' · ' + r1(work + job - left) + ' over' : '') + '</span></span>'",
         "<span class=\"t\">+' + r1(job) + ' h this job' + (over ? ' · ' + r1(work + job - left) + ' h over' : ' · ' + r1(Math.max(0, left - work - job)) + ' h left') + '</span></span>'")

EXTRA_CSS.append(b9("v14b.css"))
HOOK_NAMES += ["spotOf", "staffAvHtml", "v14ActTxt", "V14_AT", "asstCallAPI", "autoFlush", "pushToast", "tgNum", "v10TechCap"]
LOG.append("Parsec 14 (B): Parts, Inventory and the Inbox strip in one status look; early check-ins; automation toasts name the RO; spots by code; initials; no outside calls")
