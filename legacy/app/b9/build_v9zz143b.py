# Parsec 14.3 (B) — one RO view: the Technician page's middle and right are the RO page itself (the JC component),
# mounted in tc1's pane through data-jc like the RO page's own pane (attachConsole mounts it after every redraw).
# b9/v143b.js: TCX (the Technician page's context for it) and the tech's clock rules; b9/v143b.css: the mount's layout.
# Runs after build_v9zz143a.py. Runs inside build12.py: uses js, rep, b9, json, EXTRA_CSS, HOOK_NAMES, LOG.
js = rep(js, "\nvar PG = (function(){\n", "\n" + b9("v143b.js") + "\nvar PG = (function(){\n")
EXTRA_CSS.append(b9("v143b.css"))

# the RO page's bar: on the Technician page it reads "Mike's ROs / RO-32046 ⌃ ⌄ 1 of 6" and walks that list
js = rep(js, "function pxHeader() {\n  var head = el('header', { class: 'px-head' });\n",
             "function pxHeader() {\n  var head = el('header', { class: 'px-head' });\n  var TX = typeof tcxOn === 'function' && tcxOn(RO.id) ? TCX : null;   /* Parsec 14.3: mounted on the Technician page */\n")
_a0 = "el('a', { text: typeof rlBackName === 'function' ? rlBackName() : 'RO list', href: '#', onClick: function (e) { e.preventDefault(); if (typeof rlBack === 'function') rlBack();"
_a1 = "el('a', { text: 'RO list', href: '#', onClick: function (e) { e.preventDefault(); UI.view = 'rolist';"
if js.count(_a0) == 1:
    js = rep(js, _a0, "el('a', { text: TX ? TX.crumb : typeof rlBackName === 'function' ? rlBackName() : 'RO list', href: '#', onClick: function (e) { e.preventDefault(); if (TX) { TX.back(); return; } if (typeof rlBack === 'function') rlBack();")
else:
    js = rep(js, _a1, "el('a', { text: TX ? TX.crumb : 'RO list', href: '#', onClick: function (e) { e.preventDefault(); if (TX) { TX.back(); return; } UI.view = 'rolist';")
js = rep(js, "  var l = [], at = -1; try { l = rlList(); l.forEach(function (r, n) { if (r.id === RO.id) at = n; }); } catch (e) {}\n  function go(t) { return function () { if (!t) return; ",
             "  var l = [], at = -1; try { l = TX ? TX.list.map(function (id) { return { id: id }; }) : rlList(); l.forEach(function (r, n) { if (r.id === RO.id) at = n; }); } catch (e) {}\n  function go(t) { return function () { if (!t) return; if (TX) { TX.go(t.id); return; } ")

# moving between the RO page and the Technician page (or a different list there) draws it again
js = rep(js, "function keyFor(ro) { return ro ? ro.id + '|' + STATE.savedAt + '|' + String(UI.roOp[ro.id]) : ''; }",
             "function keyFor(ro) { return ro ? ro.id + '|' + STATE.savedAt + '|' + String(UI.roOp[ro.id]) + '|' + (typeof tcxOn === 'function' && tcxOn(ro.id) ? 'tc' + TCX.list.join(',') + (TCX.view ? 'v' : '') : 'ro') : ''; }")

# the RO page's own Start (row, band, clock card, keys): on the Technician page a tech starts only their own operations,
# and the admin looking at a tech's page doesn't start or stop their clock
js = rep(js, "    if (!permOk('t.own') || !permReopenOk(RO)) return;   /* Parsec 13 */",
             "    if (typeof tcxBlocked === 'function') { var tcb = tcxBlocked(RO.id, job.id); if (tcb) { toast(tcb); return; } }   /* Parsec 14.3 */\n    if (!permOk('t.own') || !permReopenOk(RO)) return;   /* Parsec 13 */")

# read-only where permissions say so: on the Technician page, someone who can't open the RO page reads its details
js = rep(js, "function pxProp(label, value, opts) {\n  opts = opts || {};", "function pxProp(label, value, opts) {\n  opts = opts || {}; if (opts.edit && typeof tcxOn === 'function' && tcxOn() && typeof canPage === 'function' && !canPage('ros')) opts = Object.assign({}, opts, { edit: null });   /* Parsec 14.3 */")

HOOK_NAMES += ["tcxOn", "tcxBlocked", "tcxGet"]
LOG.append("Parsec 14.3 (B): one RO view — the Technician page's middle and right are the RO page")
