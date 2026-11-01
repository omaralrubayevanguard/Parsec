# Parsec 12.3 — the RO page (from the RO list): the Time tab edited in place, icons for the word links, the operation's header row
# (status, ⋯ and the job type in it), each tab's actions at the right of the tabs, the truck line. The code is in b9/rop1.js, its styles
# in b9/rop_jc.css. Runs inside build12.py after build_rop.py: uses js, rep, LOG.

# Operations: the row carries the status, the ⋯ menu and the job type; the open operation's body loses the complaint line and "+ code"
_o0 = js.index("function pxOps(stash) {")
_o1 = js.index("    ops.appendChild(el('button', { class: 'px-row' + (on ? ' is-on' : '')", _o0)
_o2 = js.index("      ops.appendChild(body);\n    }\n", _o1) + len("      ops.appendChild(body);\n    }\n")
js = js[:_o1] + "    ops.appendChild(ropOpRow(j, i, on, stash));   /* Parsec 12.3 (b9/rop1.js) */\n    if (on) ops.appendChild(ropOpBody(j, stash));\n" + js[_o2:]
js = rep(js, "  var add = el('button', { class: 'px-btn px-btn--ghost px-btn--sm', type: 'button', title: 'Add operation (O)', html: pxI('plus') + 'Add operation', onClick: function (e) { e.stopPropagation(); pxAddOp(); } });\n  box.appendChild(el('div', { class: 'px-sec' }",
         "  var add = ropIb('plus', 'Add operation (O)', function () { pxAddOp(); }, 'rop-addop');\n  box.appendChild(el('div', { class: 'px-sec' }")

# an open operation's tabs: the open tab's actions at the right of the tab row
_p0 = js.index("function pxTabs(job, stash) {")
_p9 = js.index("\nfunction ", _p0 + 10)
_P = js[_p0:_p9]
_P = rep(_P, "  return el('div', { class: 'px-optabs' }, [tabs, paneBox]);",
         "  return el('div', { class: 'px-optabs' }, [el('div', { class: 'rop-tabrow' }, [tabs, ropTabActs(job, cur)]), paneBox]);")
# Time: only the timeline — no Add time entry / Edit entries row, no separate punches section
_a = _P.index("    var tAdd = el('div', { class: 'px-adds' }")
_b = _P.index("    if (old && UI.ivEditTime[job.id]) { old.classList.add('px-legacy'); pane.appendChild(old); }\n", _a)
_b = _P.index("\n", _b) + 1
_P = _P[:_a] + _P[_b:]
# Parts: the quick add line opens from the tab's + (ropPartAdd); From inventory… and Extract from a quote… are tab icons now
_a = _P.index("    var add = el('button', { class: 'px-add', type: 'button', html: pxI('plus') + 'Add part' });")
_b = _P.index("    if (UI.ivPartAdd === job.id) { UI.ivPartAdd = null; requestAnimationFrame(function () { add.click(); }); }\n", _a)
_b = _P.index("\n", _b) + 1
_P = _P[:_a] + "    ropPartAdd(job, pane, parts.length);\n" + _P[_b:]
# Files: Upload / Take a photo / Paste a screenshot are tab icons now
_a = _P.index("    var fin = el('input', { type: 'file', multiple: 'multiple'")
_b = _P.index("html: pxI('plus') + 'Add file', onClick: function (e) { e.stopPropagation(); fin.click(); } })]));\n", _a)
_b = _P.index("\n", _b) + 1
_P = _P[:_a] + _P[_b:]
js = js[:_p0] + _P + js[_p9:]

# the band: the truck line under the name — year make model · configuration · sleeper (b9/v123.js), then unit and location
js = rep(js, "  var veh = [(function () { try { var tl = trkLabel(RO); return tl === 'this truck' ? '' : tl; }",
         "  var veh = [(function () { try { var tl = (typeof truckLine === 'function' && truckLine(RO)) || trkLabel(RO); return tl === 'this truck' ? '' : tl; }")

LOG.append("Parsec 12.3 RO page: the Time tab edited in place, icons, the operation's header row, tab actions, the truck line (b9/rop1.js)")
