# Parsec 12.9 — an RO status you pick holds; a completed RO set back to open asks about its operations.
# The helper: b9/v129.js (global) + b9/v129.css. The Technician page's RO status menu is in b9/tc1.js; the RO page's operation
# pill keeps a status picked by hand (b9/rop1.js). Runs inside build12.py after build_v128.py: uses js, rep, b9, EXTRA_CSS, HOOK_NAMES, LOG.
js = rep(js, "function setRoStatus(roId, status, sub, force){", b9("v129.js") + "\nfunction setRoStatus(roId, status, sub, force){")
EXTRA_CSS.append(b9("v129.css"))

# ---- a status picked by hand (not by an automation) keeps what the operations added up to, and opens a closed RO
js = rep(js, '  pushUndo("RO status");\n  var prevSt = roStatus(ro);\n  ro.status = { status: status, sub: (opt.subs.indexOf(sub) >= 0 ? sub : null), setAt: nowIso() };\n',
             '  pushUndo("RO status");\n  var prevSt = roStatus(ro);\n  ro.status = { status: status, sub: (opt.subs.indexOf(sub) >= 0 ? sub : null), setAt: nowIso() };\n'
             '  if(!AUTO_BY) roStatusPicked(ro, prevSt.status, status);   /* Parsec 12.9: it holds; a completed RO set back to open asks about its operations */\n')

# ---- the Status sync leaves a picked status alone until the operations add up to something new
js = rep(js, '      var t = roAutoTarget(ro); if(!t || !roStatusOption(t.status)) return;\n      var cs = roStatus(ro);',
             '      if(roHandHolds(ro)) return;   /* Parsec 12.9: you picked it — nothing on the operations has changed since */\n'
             '      var t = roAutoTarget(ro); if(!t || !roStatusOption(t.status)) return;\n      var cs = roStatus(ro);')

HOOK_NAMES += ["roOpsKey", "roHandHolds", "roDoneOps", "roReopenAll", "roReopenClose", "roAutoTarget", "setRoStatus", "roStatus"]
LOG.append("Parsec 12.9: a picked RO status holds; reopening a completed RO asks about its operations")
