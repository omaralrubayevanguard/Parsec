# Parsec 12.5 (fork B) — Complete without notes or files (they stay as the final check); move a person's time to someone else.
# Runs inside build12.py after build_v124.py: uses js, rep, b9, EXTRA_CSS, HOOK_NAMES, LOG.

# ---- 1. Complete: only the parts gate it now; the notes and the files are checked at the end (Ready to close, the release, the truck checks)
_a = js.index("function opCompleteGaps(op){\n"); _b = js.index("  return g;\n}\n", _a) + len("  return g;\n}\n")
_old = js[_a:_b]
assert 'k: "notes"' in _old and 'k: "parts"' in _old, _old[:200]
js = js[:_a] + """function opCompleteGaps(op){                      /* Parsec 12.5: Complete needs the parts installed — notes are a final check now (opNoteGaps) */
  var g = [];
  var notIn = opRealParts(op).filter(function(p){ return p.status !== "Installed"; });
  if(notIn.length) g.push({ k: "parts", t: notIn.length + " part" + (notIn.length === 1 ? "" : "s") + " not installed" });
  return g;
}
/* the notes an operation still owes — shown in Ready to close, the release and the truck checks; they don't stop Complete */
function opNoteGaps(op){
  var g = [], ps = STATE.punches.filter(function(x){ return x.opId === op.id && x.stop; });
  var noNote = ps.filter(function(x){ return !String(x.notes || "").trim(); });
  var anyNote = ps.some(function(x){ return String(x.notes || "").trim(); }) || fcHasCause(op) || fcHasFix(op) || String(op.work || "").replace(/<[^>]*>/g, "").trim();
  if(noNote.length) g.push({ k: "notes", t: noNote.length + " punch" + (noNote.length === 1 ? "" : "es") + " without a note" });
  else if(!anyNote) g.push({ k: "notes", t: "no tech notes yet" });
  return g;
}
""" + js[_b:]
js = rep(js, "/* completing needs parts installed and notes written */", "/* completing needs the parts installed — notes are a final check (Parsec 12.5) */")
# the RO's Complete no longer waits on attachments; the files are a line in the final check instead
js = rep(js, """  var files = (ro.bulletins || []).reduce(function(n, e){ return n + (e.files || []).length; }, 0) + (ro.attachments || []).length;
  if(!files) g.push("no attachments");
""", "")
js = rep(js, "/* what still stands between this RO and Complete */\n", """/* Parsec 12.5: the files on an RO (photos, the paperwork) — a final check, not a gate on Complete */
function roFilesN(ro){ return (ro.bulletins || []).reduce(function(n, e){ return n + (e.files || []).length; }, 0) + (ro.attachments || []).length; }
/* what still stands between this RO and Complete */
""")
# Ready to close (Triage, the RO page, the Technician page) and the release: Notes written stays, Files on the RO joins it
js = rep(js, """    { k: "road", t: "Road test passed", ok: !!rt && rt.result !== "Fail",""", """    { k: "files", t: "Files on the RO", ok: roFilesN(ro) > 0, d: roFilesN(ro) ? roFilesN(ro) + " file" + (roFilesN(ro) === 1 ? "" : "s") : "none yet — photos, the paperwork" },
    { k: "road", t: "Road test passed", ok: !!rt && rt.result !== "Fail",""")
js = rep(js, '''c.k === "notes" ? "Add note" : "Log road test"''', '''c.k === "notes" ? "Add note" : c.k === "files" ? "Open RO" : "Log road test"''')
js = rep(js, '''(c.k === "gaps" ? '<button class="tg-link" data-action="goto-ro"''', '''(c.k === "gaps" || c.k === "files" ? '<button class="tg-link" data-action="goto-ro"''')
# Triage's Ready to close › Checks tab, per operation: the parts gate and the notes still owed
js = rep(js, "var c = raCcc(op), g = opCompleteGaps(op);", "var c = raCcc(op), g = opCompleteGaps(op).concat(opNoteGaps(op));")
# the truck checks: Parsec checks the notes and the files too
js = rep(js, '''    { t: "Hours", ok: true, info: true,''', '''    (function(){ var nn = 0; L.forEach(function(op){ STATE.punches.forEach(function(p){ if(p.opId === op.id && p.stop && !noteEntries(p.notes).length) nn++; }); }); return { t: "Notes written", ok: !nn, d: nn ? nn + " punch" + (nn === 1 ? "" : "es") + " with no note" : "every punch has a note" }; })(),
    (function(){ var nf = roFilesN(ro); return { t: "Files on the RO", ok: nf > 0, d: nf ? nf + " file" + (nf === 1 ? "" : "s") : "none yet — photos, the paperwork" }; })(),
    { t: "Hours", ok: true, info: true,''')
LOG.append("Parsec 12.5: Complete waits on the parts only; notes and files are final checks")

# ---- 2. Move a person's time to someone else (b9/tx1.js, tx.css) — Time Log header and Manager › Team open it
js = rep(js, "function modalHtml(){\n", b9("tx1.js") + "\nfunction modalHtml(){\n")
js = rep(js, '''  } else if(m.type==="warnings"){''', '''  } else if(m.type==="tx-move"){                           /* Parsec 12.5: move time to someone else */
    var TXM = txModal(m); title = TXM.title; body = TXM.body; foot = TXM.foot;
  } else if(m.type==="warnings"){''')
js = rep(js, '''m.type==="tg-tpl"?" modal-wide":""''', '''m.type==="tg-tpl"||m.type==="tx-move"?" modal-wide":""''')
js = rep(js, '''  if(a && a.indexOf("px-") === 0 && pxAct(a, t, e)) return;''', '''  if(a && a.indexOf("tx-") === 0 && txAct(a, t, e)) return;   /* Parsec 12.5: move time */
  if(a && a.indexOf("px-") === 0 && pxAct(a, t, e)) return;''')
EXTRA_CSS.append(b9("tx.css"))
HOOK_NAMES += [n for n in ["txPlan", "txApply", "txOpen", "opNoteGaps", "roFilesN", "opCompleteGaps", "roCompleteGaps", "tgRelChecks", "trxAuto"] if n not in HOOK_NAMES]
LOG.append("Parsec 12.5: move a person's time to someone else")
