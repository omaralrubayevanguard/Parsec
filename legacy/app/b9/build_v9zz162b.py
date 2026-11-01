# Parsec 16.2 (B) — a custom rule reads as a sentence, and can be tried on the last 7 days before it's turned on.
# Settings → Automations → Custom rules: "When [an operation’s clock stops ▾] as [Complete ▾] and [the RO is ▾] [Waiting – Parts ▾]
# then [set the RO status ▾] to [Hold Tech ▾]". Each chip opens a menu of the old builder's options; "+ and" adds a condition,
# "+ then" another action; Save waits for a whole sentence; a new rule starts off. Same rule model, runner unchanged
# (b9/v162b.js + v162b.css). Runs inside build12.py: uses js, rep, b9, EXTRA_CSS, HOOK_NAMES, LOG.
# the read-only sentence in the list of rules, and the module itself, where amRuleSummary was
js = rep(js, """function amRuleSummary(r){
  return '<b>When</b> ' + esc(autoLabel(AUTO_TRIGGERS, r.when))
    + ((r.conds || []).length ? ' <b>if</b> ' + r.conds.map(function(c){ return esc(autoLabel(AUTO_FIELDS, c.f)) + ' ' + esc(autoLabel(amOps(c.f), c.op)) + ' ' + esc(autoValueLabel(c.f, c.v)); }).join(' <b>and</b> ') : '')
    + ' <b>then</b> ' + (r.acts || []).map(function(a){ return esc(autoLabel(AUTO_ACTIONS, a.a).toLowerCase()) + (a.v && a.a !== "stamp" ? ' “' + esc(autoValueLabel(a.a, a.v)) + '”' : ''); }).join(', ');
}
""", b9("v162b.js"))
# the builder: the sentence instead of the rows of drop-downs
_a = js.index("  if(m.edit){\n    var e = m.edit;\n    h += '<div class=\"am-builder\">'")
_b = js.index("      + '<div class=\"form-error\" id=\"am-error\"></div></div>';\n  }\n", _a) + len("      + '<div class=\"form-error\" id=\"am-error\"></div></div>';\n  }\n")
assert js.count("  if(m.edit){\n    var e = m.edit;\n    h += '<div class=\"am-builder\">'") == 1 and _b - _a < 4000, (_a, _b)
js = js[:_a] + "  if(m.edit) h += v162bBuilder(m);   /* Parsec 16.2: the rule as a sentence (b9/v162b.js) */\n" + js[_b:]
# each saved rule: off and untested, or unfinished, says so
js = rep(js, """'<span class="am-sum">'+amRuleSummary(r)+'</span><span class="am-mode-tag">'+(r.mode === "auto" ? "Auto" : "Suggest")+'</span></div>'""",
             """'<span class="am-sum">'+amRuleSummary(r)+'</span><span class="am-mode-tag">'+(r.mode === "auto" ? "Auto" : "Suggest")+'</span>'+v162bTag(r)+'</div>'""")
js = rep(js, "No custom rules yet. Example: when a punch stops with “Complete”, tick the Testing task.",
             "No custom rules yet. Example: when an operation’s clock stops as Complete and the RO is Waiting – Parts, then set the RO status to Hold Tech.")
# a box that belonged to a condition or action just taken off has nothing to write to
js = rep(js, "  else if(k === \"name\") e.name = v;\n  else if(m){\n", "  else if(k === \"name\") e.name = v;\n  else if(m && (m[1].charAt(0) === \"c\" ? e.conds[+m[2]] : e.acts[+m[2]])){\n")
# typing in a box keeps Save in step; the chips, + and, + then, Test run and Save are the sentence's own
js = rep(js, "  if(rerender) render();\n}\nfunction amAction(a, t){\n  var cfg = autoCfg(), m = UI.modal;\n",
             "  if(rerender) render(); else v162bSync();\n}\nfunction amAction(a, t){\n  if(v162bAct(a, t)) return true;   /* Parsec 16.2 (b9/v162b.js) */\n  var cfg = autoCfg(), m = UI.modal;\n")
js = rep(js, """  if(a === "am-new"){ m.edit = { id: null, name: "", when: "punch.stop", conds: [{ f:"stopReason", op:"is", v: "Complete" }], acts: [{ a:"stamp", v:"Road test complete." }], mode: "suggest", on: true }; render(); return true; }\n""", "")
js = rep(js, """  if(a === "am-add-cond"){ m.edit.conds.push({ f:"jobType", op:"is", v: amDefault("jobType") }); render(); return true; }
  if(a === "am-del-cond"){ m.edit.conds.splice(+t.dataset.i, 1); render(); return true; }
  if(a === "am-add-act"){ m.edit.acts.push({ a:"note", v:"" }); render(); return true; }
  if(a === "am-del-act"){ m.edit.acts.splice(+t.dataset.i, 1); render(); return true; }
""", "")
js = rep(js, """  if(a === "am-save"){
    var e = m.edit;
    var bad = e.acts.filter(function(x){ return (x.a === "note" || x.a === "remind") && !String(x.v || "").trim(); });
    if(bad.length){ var er = document.getElementById("am-error"); if(er) er.textContent = "Give the note or reminder some text."; return true; }
    pushUndo(e.id ? "edit rule" : "add rule");
    if(e.id) cfg.rules = cfg.rules.map(function(x){ return x.id === e.id ? e : x; });
    else { e.id = uid("rl"); cfg.rules.push(e); }
    m.edit = null; scheduleSave(true); render(); pushToast("Rule saved."); return true;
  }
""", "")
# the runner is unchanged; when one of your rules fires it also tells the "What ran" log (Fork A's v162Log), if there is one
js = rep(js, """      propose(ev, "r." + r.id, r.name || "Custom rule", r.mode === "auto" ? "auto" : "suggest",
        (r.name ? r.name + ": " : "") + acts.map(autoActText).join(" · ") + "?", acts, jobLevel ? op.id : "", ref);
""", """      var nA = autoApply.length, nR = raised;
      propose(ev, "r." + r.id, r.name || "Custom rule", r.mode === "auto" ? "auto" : "suggest",
        (r.name ? r.name + ": " : "") + acts.map(autoActText).join(" · ") + "?", acts, jobLevel ? op.id : "", ref);
      if(autoApply.length > nA) v162bRan(r, ev, autoApply[autoApply.length - 1][1], "auto");
      else if(raised > nR) v162bRan(r, ev, ro.suggest[ro.suggest.length - 1], "suggest");
""")
EXTRA_CSS.append(b9("v162b.css"))
HOOK_NAMES += ["v162bTokens", "v162bText", "v162bMissing", "v162bTestRun", "v162bEvents", "v162bCtx", "V162B", "autoCfg", "autoEvaluate", "autoRun", "autoFlush", "amRuleSummary"]
LOG.append("Parsec 16.2 (B): custom rules read as a sentence (chips, + and, + then), Save waits for a whole sentence, new rules start off, Test run on the last 7 days")
