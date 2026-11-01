# Parsec 12.8 — a completed operation opens back up: change its status, start its clock again.
# The helper: b9/v128.js (global). The clock card (b9/v124.js + ock.css), the RO page's status menu (b9/rop1.js), the Technician
# page (b9/tc1.js, cx3.js, cx4.js) and the failed road test (b9/tri1.js) use it in their own files.
# Runs inside build12.py after build_v127*.py: uses js, rep, b9, EXTRA_CSS, HOOK_NAMES, LOG.
js = rep(js, "function opDoneNow(", b9("v128.js") + "\nfunction opDoneNow(")

# ---- starting a clock on a completed operation reopens it (the Technician page, the phone, Triage — everything that starts through doStartPunch)
js = rep(js, '  pushUndo("start punch");\n  commitNoteDrafts();\n  ensureOnClock();\n  if(roId === SHOP_RO_ID) reason = op.complaint;',
             '  pushUndo("start punch");\n  var reo = opReopenMark(op, roId, "start");   /* Parsec 12.8: it was complete — it opens back up */\n  commitNoteDrafts();\n  ensureOnClock();\n  if(roId === SHOP_RO_ID) reason = op.complaint;')
js = rep(js, '  markStatusFlip(getRO(roId));\n  UI.modal = null;\n  scheduleSave(true);\n  render();\n}\nfunction doStopPunch(',
             '  markStatusFlip(getRO(roId));\n  UI.modal = null;\n  scheduleSave(true);\n  render();\n  if(reo) setTimeout(function(){ pushToast(reo + " reopened \\u2014 your clock is running.", true); }, 0);\n}\nfunction doStopPunch(')

# ---- the RO page's own clock (the card's button, the row's clock)
js = rep(js, "    startClock(job);\n    S.ui.card = job.id;",
             "    var reo = typeof opReopenMark === 'function' ? opReopenMark(job, RO.id, 'start') : null;   /* Parsec 12.8 */\n    startClock(job);\n    S.ui.card = job.id;")
js = rep(js, "toast(was ? 'Clock moved to this operation' : 'Clock running', undoIt);",
             "toast(reo ? reo + ' reopened \\u2014 clock running' : was ? 'Clock moved to this operation' : 'Clock running', undoIt);")

# ---- Triage's status by hand (done ↔ Hold Tech)
js = rep(js, "  op.jobStatus = { status: nm, setAt: nowIso(), hand: true };\n  scheduleSave(true);\n}\nfunction tySelAct(",
             "  if(!/^Complete/.test(nm)) opReopenMark(op, ro.id, nm);   /* Parsec 12.8 */\n  op.jobStatus = { status: nm, setAt: nowIso(), hand: true };\n  scheduleSave(true);\n}\nfunction tySelAct(")

# ---- an automation that follows (the RO goes to Working) keeps the "reopened" in its toast
js = rep(js, 'pushToast("Automation · " + x[1].rule + ": "', 'pushToast((typeof opReoTake === "function" ? opReoTake() : "") + "Automation · " + x[1].rule + ": "')

HOOK_NAMES += ["opReopenMark", "opWasDone", "opReopenedLast", "opDoneNow"]
LOG.append("Parsec 12.8: a completed operation opens back up — its status and its clock")
