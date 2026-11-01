# Parsec 12 — the RO page in the user's layout (the RO page mock-up's picks) and picking on it (the selecting mock-up).
# JC-internal code: b9/rop1.js (inserted into the RO page's closure), its styles b9/rop_jc.css (appended to JC_CSS).
# Runs inside build12.py (exec'd at module level): uses js, rep, b9, json.

# the code goes in with the RO page's own functions, before the Activity section's builder
js = rep(js, "function pxActivity() {\n", b9("rop1.js") + "\nfunction pxActivity() {\n")

# the page: Operations and the new blocks in the middle, the truck and the facts on the right (ropBuild)
_i0 = js.index("function ivBuild(page, cardCol) {")
_i1 = js.index("\n/* single keys on the RO page", _i0)
js = js[:_i0] + """function ivBuild(page, cardCol) {
  pxClosePop();
  page.classList.add('roB', 'ivB', 'pxB');
  var stash = el('div', { class: 'pxStash', 'aria-hidden': 'true' });
  var slotEl = page.querySelector(':scope > slot');
  Array.prototype.slice.call(page.children).forEach(function (c) { if (c !== slotEl) stash.appendChild(c); });
  stash.appendChild(cardCol);
  ropBuild(page, stash, slotEl);   /* Parsec 12 (b9/rop1.js) */
}""" + js[_i1:]

# the right column scrolls now (it used to fold the oldest group to fit)
js = rep(js, "function pxFitRail() {\n  var rail = R && R.querySelector('.px-ro__rail'); if (!rail) return;",
         "function pxFitRail() {\n  var rail = R && R.querySelector('.px-ro__rail'); if (!rail) return;\n  if (rail.classList.contains('rop-rail')) return;   /* Parsec 12: the rail scrolls */")

# an operation's row: Skill and ASIST's approval as chips; Ctrl / Shift click picks instead of opening
js = rep(js, "+ '<span class=\"px-tag\" data-t=\"' + esc(t) + '\">' + esc(t) + '</span><span class=\"px-row__time\">'",
         "+ ropChips(j) + '<span class=\"px-tag\" data-t=\"' + esc(t) + '\">' + esc(t) + '</span><span class=\"px-row__time\">'")
js = rep(js, "      onClick: function (e) { e.stopPropagation(); S.ui.card = on ? null : j.id; if (on) UI.roOp[RO.id] = null; render(); } }));",
         "      onClick: function (e) { e.stopPropagation(); if (ropPickClick(e, 'o', j.id)) return; S.ui.card = on ? null : j.id; if (on) UI.roOp[RO.id] = null; render(); } }));")

# an open operation: Time (with the notes inside each punch), Parts, Files — the Notes tab folds into Time
js = rep(js, "  var cur = UI.ivTab[job.id] || 'parts';\n  var punches = punchesOf(job)",
         "  var cur = UI.ivTab[job.id] || 'parts'; if (cur === 'notes') cur = 'time';   /* Parsec 12: the notes live in the Time tab */\n  var punches = punchesOf(job)")
js = rep(js, "  var defs = [['time', 'Time', punches.length || ''], ['parts', 'Parts', parts.length ? inHand + '/' + parts.length : ''], ['notes', 'Notes', notes || ''], ['files', 'Files', files.length || '']];",
         "  var defs = [['time', 'Time', (punches.length + notes) || ''], ['parts', 'Parts', parts.length ? inHand + '/' + parts.length : ''], ['files', 'Files', files.length || '']];")
_t0 = js.index("  if (cur === 'time') {\n    punches.forEach(function (p) {")
_t1 = js.index("    if (!punches.length) pane.appendChild(el('div', { class: 'px-li', html: '<small>No time on this operation yet. Start the clock above.</small>' }));\n", _t0)
_t1 = js.index("\n", _t1) + 1
js = js[:_t0] + "  if (cur === 'time') {\n    ropTimeline(job, pane);   /* Parsec 12: each punch from start to stop, its notes in between */\n" + js[_t1:]
# parts on an open operation: the pick boxes, and Core and Salesman when a part has them
js = rep(js, "  } else if (cur === 'parts') {\n    parts.forEach(function (p) {", "  } else if (cur === 'parts') {\n    ropPartsHead(job, parts, pane);\n    parts.forEach(function (p) {")
js = rep(js, "      pane.appendChild(el('div', { class: 'px-li px-li--part', 'data-part': p.id }, [el('span', { class: 'px-li__t', html: esc(ptName(p)) + (eta && !partInHand(p) ? ' <small>· ETA ' + esc(eta) + '</small>' : '') }), el('span', { class: 'px-id px-muted', text: p.partNumber || '' }), el('span', { class: 'r', text: p.qty || '1' }), b]));",
         "      pane.appendChild(ropPartRow(job, p, b, eta, parts));")

_jc0 = js.index('var JC_CSS = "'); _jc1 = js.index('";\n', _jc0)
js = js[:_jc1] + json.dumps("\n" + b9("rop_jc.css"))[1:-1] + js[_jc1:]
# the page's own toasts rise above the picking bar while it shows
EXTRA_CSS.append("body:has(.jc-host.rop-picking) .toast-wrap{bottom:calc(var(--rop-sbh, 52px) + 94px) !important;}"
                 " body:has(.jc-host.rop-picking[data-device=phone]) .toast-wrap{bottom:calc(var(--rop-sbh, 150px) + 96px) !important;}")
LOG.append("RO page: the mock-up layout and picking (b9/rop1.js)")
