# Parsec 15 (C) — a trash on every time entry (one click, Undo; the minutes stay on the clock as air and say what was there),
# a reason for air as a note (Time Log b9/tl1–3.js, the day report b9/dr1.js), and the RO page Time tab's notes that aren't on a punch
# change in place or go (the writer, the foreman, the manager). Globals: b9/v150c.js; the RO page: b9/v150c_jc.js + v150c_jc.css.
# Runs inside build12.py after the others: uses js, rep, b9, json, EXTRA_CSS, HOOK_NAMES, LOG.
js = rep(js, "function deletePunch(id){", b9("v150c.js") + "\nfunction deletePunch(id){")
# ---- a deleted punch leaves a record: whose, what, who deleted it, when (and the record survives being trimmed)
js = rep(js, '    STATE.holes.push({ id: uid("hl"), start: p.start, stop: p.stop });', '    STATE.holes.push(v150Hole(p));   /* Parsec 15: whose, what, who deleted it */')
js = rep(js, 'if(a < from) out.push({ id: uid("hl"), start: hh.start, stop: new Date(from).toISOString() });',
             'if(a < from) out.push(Object.assign({}, hh, { id: uid("hl"), stop: new Date(from).toISOString() }));')
js = rep(js, 'if(b > to) out.push({ id: uid("hl"), start: new Date(to).toISOString(), stop: hh.stop });',
             'if(b > to) out.push(Object.assign({}, hh, { id: uid("hl"), start: new Date(to).toISOString() }));')
js = rep(js, "    return !state.punches.some(function(p){\n      if(!p.stop) return false;\n      return new Date(p.start) < he && new Date(p.stop) > hs;",
             "    return !state.punches.some(function(p){\n      if(!p.stop) return false;\n      if(hh.by && typeof sameOwner === \"function\" && typeof punchOwner === \"function\" && !sameOwner(punchOwner(p), hh.by)) return false;   /* Parsec 15: only the same person's time fills it */\n      return new Date(p.start) < he && new Date(p.stop) > hs;")
# ---- the RO page: notes that aren't on a punch, and where a deleted entry was
_jc0 = js.index('var JC_CSS = "'); _jc1 = js.index('";\n', _jc0)
js = js[:_jc1] + json.dumps("\n" + b9("v150c_jc.css"))[1:-1] + js[_jc1:]
js = rep(js, "function ropTimeline(job, pane) {", b9("v150c_jc.js") + "\nfunction ropTimeline(job, pane) {")
js = rep(js, "items.push({ at: +new Date(l.at), n: { lb: l.kind === 'fix' ? 'Correction' : 'Cause', text: l.text } }); });",
             "items.push({ at: +new Date(l.at), n: { lb: l.kind === 'fix' ? 'Correction' : 'Cause', text: l.text }, ref: l, src: 'log' }); });")
js = rep(js, "(Array.isArray(job.offNotes) ? job.offNotes : []).forEach(function (n) { items.push({ at: +new Date(n.at), n: { lb: n.by ? ropFirst(n.by) : 'Note', text: n.text } }); });",
             "(Array.isArray(job.offNotes) ? job.offNotes : []).forEach(function (n) { items.push({ at: +new Date(n.at), n: { lb: n.by ? ropFirst(n.by) : 'Note', text: n.text }, ref: n, src: 'off' }); });\n"
             "  v150HolesOf(job).forEach(function (h) { items.push({ at: +new Date(h.start), h: h }); });   /* Parsec 15: where a deleted entry was */")
js = rep(js, "if (it.n) { box.appendChild(el('div', { class: 'rop-tn is-solo', html: '<small>' + esc(ropClk(it.at)) + '</small><span><em>' + esc(it.n.lb) + '</em>' + esc(it.n.text) + '</span>' })); return; }",
             "if (it.h) { box.appendChild(ropHoleRow(job, it.h)); return; }\n    if (it.n) { box.appendChild(ropSoloNote(job, it)); return; }   /* Parsec 15: change it or delete it */")
# ---- the Time tab's trash: who must ask sends it as an ask; the toast says the minutes are air now
js = rep(js, "function ropDelPunch(p) {\n  var d = hmText((p.stop ? +new Date(p.stop) : Date.now()) - +new Date(p.start));\n  if (deletePunch(p.id) === false) return; save(true); render(); tecRender(); ropUndo('Punch deleted — ' + d + '.');",
             "function ropDelPunch(p) {\n  var d = hmText((p.stop ? +new Date(p.stop) : Date.now()) - +new Date(p.start));\n"
             "  try { if (p.stop && typeof TL !== 'undefined' && TL.mustAskFor && TL.mustAskFor(punchWho(p))) { TL.askDel(p.id); render(); return; } } catch (e) {}   /* Parsec 15 */\n"
             "  if (deletePunch(p.id) === false) return; save(true); render(); tecRender(); ropUndo('Punch deleted — ' + d + (p.stop ? ', it counts as air now' : '') + '.');")
HOOK_NAMES += ["v150Hole", "v150PunchGone", "v150NoteOk", "v150HolesOf"]
LOG.append("Parsec 15 (C): a trash on every time entry — the minutes stay as air and say what was there · a reason for air · notes that aren't on a punch change or go")
