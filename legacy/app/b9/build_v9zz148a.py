# Parsec 14.8 (A) — the RO page's operation cards: Declined in the status menu (number keys 1–9), and the complaint changes in place
# (a click on the open operation's title, a double-click on a closed one, F2 on the row), also while its clock runs.
# The bug: the title's double-click came after the first click had redrawn the row, so it landed on a row that was gone; and while
# a clock ran, the 5-second redraw rebuilt the page under the edit — safeToRedraw only looked at the page's focus, not inside the
# RO page's shadow root. Runs inside build12.py: uses js, rep, b9, json, LOG.
_jc0 = js.index('var JC_CSS = "'); _jc1 = js.index('";\n', _jc0)
js = js[:_jc1] + json.dumps("\n" + b9("v148a.css"))[1:-1] + js[_jc1:]
js = rep(js, "function ropMine(j) {", b9("v148a_jc.js") + "\nfunction ropMine(j) {")
# ---- the redraw waits for a field inside the RO page too
js = rep(js, "  var a = document.activeElement;\n  if(a && /^(input|textarea|select)$/i.test(a.tagName)) return false;",
             "  var a = document.activeElement;\n  while(a && a.shadowRoot && a.shadowRoot.activeElement) a = a.shadowRoot.activeElement;   /* Parsec 14.8: a field inside the RO page */\n  if(a && /^(input|textarea|select)$/i.test(a.tagName)) return false;")
# ---- the operation's status menu: Declined at the bottom; the number keys
js = rep(js, "    JOB_STATUS_NAMES.forEach(function (n) {\n      var on = jobStatusLabel(n) === jobStatusLabel(nm);\n      pop.appendChild(pxMenuItem(pxSi(n), pgStLabel('ro', jobStatusLabel(n)), { on: on, tick: on, run: function () {",
             "    JOB_STATUS_NAMES.forEach(function (n, ki) {\n      var on = !j.declined && jobStatusLabel(n) === jobStatusLabel(nm);\n      pop.appendChild(pxMenuItem(pxSi(n), pgStLabel('ro', jobStatusLabel(n)), { on: on, tick: on, kbd: String(ki + 1), run: function () {")
js = rep(js, "        j.jobStatus = { status: n, setAt: nowIso(), hand: true };   /* Parsec 12.9: a status picked by hand stands */\n        save(true); render(); tecRender();\n        ropUndo('Op ' + ropN(j) + (reo ? ' reopened — ' : ' set to ')",
             "        var und = ropUndecline(j);   /* Parsec 14.8: back from Declined */\n        j.jobStatus = { status: n, setAt: nowIso(), hand: true };   /* Parsec 12.9: a status picked by hand stands */\n        save(true); render(); tecRender();\n        ropUndo('Op ' + ropN(j) + (reo ? ' reopened — ' : und ? ' is back — ' : ' set to ')")
js = rep(js, "    });\n    pxPop(b, pop, { alignRight: true });\n  });\n  return b;\n}\n/* the operation's ⋯: the same on every row */",
             "    });\n    pop.appendChild(pxSep());   /* Parsec 14.8: Declined, after the line */\n    pop.appendChild(pxMenuItem(pxSi('Declined'), pgStLabel('ro', 'Declined'), { on: !!j.declined, tick: !!j.declined, kbd: String(JOB_STATUS_NAMES.length + 1), run: function () { if (!j.declined) ropDecline(j); } }));\n    if (pxPop(b, pop, { alignRight: true })) ropMenuKeys(pop);\n  });\n  return b;\n}\n/* the operation's ⋯: the same on every row */")
# ---- the row: the meta of a declined operation; the complaint changes with a click when the operation is open
js = rep(js, ": out ? out + ' part' + (out === 1 ? '' : 's') + ' on the way' : (j.declined ? 'Declined' : '');\n  var who = (punchesOf(j).slice(-1)[0] || {}).by || RO.assignedTech || '';\n  var row = el('div', { class: 'px-row rop-orow'",
             ": out ? out + ' part' + (out === 1 ? '' : 's') + ' on the way' : ropDecMeta(j);\n  var who = (punchesOf(j).slice(-1)[0] || {}).by || RO.assignedTech || '';\n  var row = el('div', { class: 'px-row rop-orow'")
js = rep(js, "' — double-click to rename\">' + esc(j.complaint || 'New operation') + '</span>'",
             "(on ? ' — click to change it' : ' — double-click to change it') + '\">' + esc(j.complaint || 'New operation') + '</span>'")
js = rep(js, "  row.addEventListener('click', function (e) { if (e.target.closest && e.target.closest('.rop-octl, .rop-jt, .rop-cb, .rop-ren')) return; e.stopPropagation(); tog(e); });",
             "  row.addEventListener('click', function (e) { if (e.target.closest && e.target.closest('.rop-octl, .rop-jt, .rop-cb, .rop-ren')) return; e.stopPropagation();\n"
             "    var tt = on && !(e.ctrlKey || e.metaKey || e.shiftKey) && e.target.closest && e.target.closest('.px-row__t'); if (tt) { ropRename(j, tt); return; }   /* Parsec 14.8: the open operation's complaint — a click changes it */\n"
             "    tog(e); });")
js = rep(js, "  row.addEventListener('keydown', function (e) { if ((e.key === 'Enter' || e.key === ' ') && e.target === row) { e.preventDefault(); e.stopPropagation(); tog(e); } });",
             "  row.addEventListener('keydown', function (e) { if ((e.key === 'Enter' || e.key === ' ') && e.target === row) { e.preventDefault(); e.stopPropagation(); tog(e); }\n"
             "    else if (e.key === 'F2' && e.target === row) { e.preventDefault(); e.stopPropagation(); var t2 = row.querySelector('.px-row__t'); if (t2) ropRename(j, t2); } });")
js = rep(js, "  if (tl) tl.addEventListener('dblclick', function (e) { e.preventDefault(); e.stopPropagation(); ropRename(j, tl); });",
             "  if (tl) tl.addEventListener('dblclick', function (e) { e.preventDefault(); e.stopPropagation(); if (tl.isConnected) ropRename(j, tl); });")
# ---- the rename itself: one at a time, an Activity line
js = rep(js, "function ropRename(j, span) {\n  var inp = el('input', { class: 'rop-ren',",
             "function ropRename(j, span) {\n  if (!span || !span.isConnected) return; var ex0 = span.parentNode && span.parentNode.querySelector('.rop-ren'); if (ex0) { ex0.focus(); return; }\n  var inp = el('input', { class: 'rop-ren',")
js = rep(js, "    if (keep && v && v !== j.complaint) { pushUndo('rename operation'); j.complaint = v; save(true); render(); ropUndo('Renamed Op ' + ropN(j) + '.'); } else render(); };",
             "    if (keep && v && v !== j.complaint) { var was = j.complaint || ''; pushUndo('rename operation'); j.complaint = v; try { audit('op-edit', roLabel(RO) + ': Op ' + ropN(j) + ' complaint “' + was + '” → “' + v + '”', RO); } catch (e) {} save(true); render(); ropUndo('Op ' + ropN(j) + ' complaint changed.'); } else render(); };")
# ---- a declined operation doesn't start: the RO page's Start buttons greyed out with why; the start paths refuse it (keys too)
js = rep(js, "  } else {\n    if (typeof tcxBlocked === 'function') { var tcb = tcxBlocked(RO.id, job.id); if (tcb) { toast(tcb); return; } }   /* Parsec 14.3 */",
             "  } else {\n    if (job.declined) { toast(ropDecTip(job) + '.'); return; }   /* Parsec 14.8 */\n    if (typeof tcxBlocked === 'function') { var tcb = tcxBlocked(RO.id, job.id); if (tcb) { toast(tcb); return; } }   /* Parsec 14.3 */")
js = rep(js, "function doStartPunch(roId, opId, reason){ if(v141StartGate(roId, opId, reason)) return;",
             "function v148DecStart(roId, opId){ var ro = getRO(roId), op = ro && (ro.operations || []).filter(function(o){ return o && o.id === opId; })[0]; if(op && op.declined){ pushToast('Op ' + (ro.operations.indexOf(op) + 1) + ' is declined — pick another status to work on it.'); return true; } return false; }   /* Parsec 14.8 */\n"
             "function doStartPunch(roId, opId, reason){ if(v148DecStart(roId, opId)) return; if(v141StartGate(roId, opId, reason)) return;")
# the clock card's and the rows' play buttons (two builders share these lines)
_a = "    title: run ? 'Stop the clock' : lock ? 'Locked — the clock opens when the part is in' : 'Start the clock on this operation',\n    'aria-label': run ? 'Stop the clock' : lock ? 'Clock locked until the part is in' : 'Start the clock', 'aria-disabled': lock ? 'true' : null,"
_b = "    title: run ? 'Stop the clock' : job.declined ? ropDecTip(job) : lock ? 'Locked — the clock opens when the part is in' : 'Start the clock on this operation',\n    'aria-label': run ? 'Stop the clock' : job.declined ? ropDecTip(job) : lock ? 'Clock locked until the part is in' : 'Start the clock', 'aria-disabled': lock || (!run && job.declined) ? 'true' : null,"
js = rep(js, _a, _b, 2)
js = rep(js, "  row.appendChild(el('button', { class: 'jtmBtn', type: 'button',\n    title: run ? 'Stop the clock' : job.declined",
             "  row.appendChild(el('button', { class: 'jtmBtn' + (!run && job.declined ? ' is-dec' : ''), type: 'button',\n    title: run ? 'Stop the clock' : job.declined")
js = rep(js, "  var go = el('button', { class: 'jtmBtn ivGo', type: 'button',\n    title: run ? 'Stop the clock' : job.declined",
             "  var go = el('button', { class: 'jtmBtn ivGo' + (!run && job.declined ? ' is-dec' : ''), type: 'button',\n    title: run ? 'Stop the clock' : job.declined")
js = rep(js, "    class: 'timer' + (on ? ' on' : '') + (lk ? ' locked' : ''), type: 'button', 'aria-disabled': lk ? 'true' : null,\n    title: on ? 'Stop the clock and add the time to Burnt' : lk ?",
             "    class: 'timer' + (on ? ' on' : '') + (lk ? ' locked' : '') + (!on && job.declined ? ' is-dec' : ''), type: 'button', 'aria-disabled': lk || (!on && job.declined) ? 'true' : null,\n    title: on ? 'Stop the clock and add the time to Burnt' : job.declined ? ropDecTip(job) : lk ?")
js = rep(js, "    foot.appendChild(el('button', { class: 'otClock' + (on ? ' on' : '') + (plk ? ' locked' : ''), type: 'button', 'aria-disabled': plk ? 'true' : null,\n      title: on ? 'Stop the clock' : plk ?",
             "    foot.appendChild(el('button', { class: 'otClock' + (on ? ' on' : '') + (plk ? ' locked' : '') + (!on && job.declined ? ' is-dec' : ''), type: 'button', 'aria-disabled': plk || (!on && job.declined) ? 'true' : null,\n      title: on ? 'Stop the clock' : job.declined ? ropDecTip(job) : plk ?")
js = rep(js, "  w.innerHTML = ockHtml(RO.id, job.id, { pg: 'jc', hr: 'jc', can: true, lock: lock ? lockLine(lock) : '', editQ: true });",
             "  w.innerHTML = ockHtml(RO.id, job.id, { pg: 'jc', hr: 'jc', can: true, lock: lock ? lockLine(lock) : '', off: job.declined && !run ? ropDecTip(job) : '', editQ: true });   /* Parsec 14.8: declined — the play button is off, and says why */")
LOG.append("Parsec 14.8 (A): Declined on the operation's status menu · the complaint changes in place")
