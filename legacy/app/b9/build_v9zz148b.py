# Parsec 14.8 (B) — Extract operations on the RO page: the Operations header gets an extract button right of the "+".
# It reads pasted text, a screenshot (the built-in reader) or a PDF — only the complaint, status, quoted time and approval of each
# operation — and shows each row as Update Op N or Add as new. b9/v148b_jc.js inside the RO page (JC); styles b9/v148b.css → JC_CSS.
# Runs inside build12.py: uses js, rep, b9, json, LOG.
_jc0 = js.index('var JC_CSS = "'); _jc1 = js.index('";\n', _jc0)
js = js[:_jc1] + json.dumps("\n" + b9("v148b.css"))[1:-1] + js[_jc1:]
js = rep(js, "function openExtractParts(job) {", b9("v148b_jc.js") + "\nfunction openExtractParts(job) {")
js = rep(js, "  var add = ropIb('plus', 'Add operation (O)', function () { pxAddOp(); }, 'rop-addop');\n  box.appendChild(el('div', { class: 'px-sec' }, [el('h3', { text: 'Operations' }), el('span', { class: 'n', text: String(S.jobs.length) }), add]));",
             "  var add = ropIb('plus', 'Add operation (O)', function () { pxAddOp(); }, 'rop-addop');\n  var oxb = ropIb('scan', 'Extract operations from text or a screenshot', function () { openExtractOps(); }, 'rop-xops');   /* Parsec 14.8 */\n  box.appendChild(el('div', { class: 'px-sec' }, [el('h3', { text: 'Operations' }), el('span', { class: 'n', text: String(S.jobs.length) }), add, oxb]));")
LOG.append("Parsec 14.8 (B): Extract operations on the RO page")
