/* Parsec · ro-page · tab-actions.js
   Each tab's actions at the right of the tabs: attach, paste a screenshot, the notes paragraph to copy (Time), add a part (Parts).
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   ropAttach ropPasteShot ropNotesPara ropCopyText ropTabActs ropPartAdd (6 functions)
   uses       automations/ pages/inventory/ ro/ shell/ state/
   at load    on document paste
*/
/* ---------- each tab's actions, at the right of the tabs (only the open tab's) ---------- */
function ropAttach(job, files) {
  var arr = Array.prototype.slice.call(files || []); if (!arr.length) return;
  dropFilesOnJob(job, arr); UI.ivTab = UI.ivTab || {}; UI.ivTab[job.id] = 'files'; render();
  toast(arr.length + ' file' + (arr.length === 1 ? '' : 's') + ' added to Op ' + ropN(job), { label: 'UNDO', run: function () { restoreSnapshot(); } });
}
function ropPasteShot(job) {
  var no = function () { toast('Press Ctrl V on the RO to paste a screenshot here.'); };
  try {
    if (!navigator.clipboard || !navigator.clipboard.read) { no(); return; }
    navigator.clipboard.read().then(function (items) {
      var got = [];
      items.forEach(function (it) { var t = (it.types || []).filter(function (x) { return /^image\//.test(x); })[0]; if (t) got.push(it.getType(t).then(function (b) { return new File([b], 'screenshot-' + new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-') + '.' + (t.split('/')[1] || 'png'), { type: t }); })); });
      if (!got.length) { toast('No picture on the clipboard — copy a screenshot first.'); return; }
      Promise.all(got).then(function (fs) { ropAttach(job, fs); });
    }, no);
  } catch (e) { no(); }
}
/* Parsec 14.6: every work note on this operation's punches, oldest first, as one paragraph to paste outside Parsec */
function ropNotesPara(job) {
  var seen = {}, out = [];
  opPunches(job.id).forEach(function (p) {
    var t = noteEntries(p.notes).map(function (n) { return n.text; }).join(' ').replace(/\s+/g, ' ').trim(); if (!t || seen[t]) return; seen[t] = 1;
    out.push(/[.!?\u2026]["\u201d')\]]*$/.test(t) ? t : t + '.');
  });
  return out;
}
function ropCopyText(txt, ok) {
  var bad = function () { toast('Couldn\u2019t copy \u2014 select the text and press Ctrl C.'); };
  var fb = function () {
    try {
      var ta = document.createElement('textarea'); ta.value = txt; ta.setAttribute('readonly', ''); ta.style.cssText = 'position:fixed;left:-9999px;top:0;opacity:0';
      document.body.appendChild(ta); ta.select(); var r = document.execCommand('copy'); ta.remove(); if (r) ok(); else bad();
    } catch (e) { bad(); }
  };
  try { if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(txt).then(ok, fb); return; } } catch (e) {}
  fb();
}
function ropTabActs(job, cur) {
  var box = el('span', { class: 'rop-tacts' });
  if (cur === 'time') {
    box.appendChild(ropIb('clockPlus', 'Add time entry', function () { ropAddEnd(job); }));
    var nts = ropNotesPara(job), cpb = ropIb('copyNotes', 'Copy notes', function () {
      var L = ropNotesPara(job); if (!L.length) return;
      ropCopyText(L.join(' '), function () { toast('Copied ' + L.length + ' note' + (L.length === 1 ? '' : 's') + ' \u2014 paste them anywhere.'); });
    }, 'rop-cpn');
    if (nts.length) cpb.title = 'Copy notes \u2014 ' + nts.length + ' work note' + (nts.length === 1 ? '' : 's') + ' as one paragraph';
    else { cpb.disabled = true; cpb.title = 'No work notes on this operation\u2019s time yet'; cpb.setAttribute('aria-label', cpb.title); }
    box.appendChild(cpb);
  }
  else if (cur === 'parts') {
    box.appendChild(ropIb('plus', 'Add part', function () { ROPT.padd = job.id; render(); }));
    box.appendChild(ropIb('box', 'From inventory…', function () { openInvPicker(job); }));
    box.appendChild(ropIb('scan', 'Extract from a quote…', function () { openExtractParts(job); }));
  } else {
    var mk = function (acc, cap) { var i = el('input', { type: 'file', accept: acc, style: 'display:none' }); if (!cap) i.setAttribute('multiple', 'multiple'); else i.setAttribute('capture', 'environment'); i.addEventListener('change', function () { ropAttach(job, i.files); }); box.appendChild(i); return i; };
    var up = mk('image/*,video/*,.pdf,application/pdf'), cam = mk('image/*', 1);
    box.appendChild(ropIb('upload', 'Upload', function () { up.click(); }));
    box.appendChild(ropIb('camera', 'Take a photo', function () { cam.click(); }));
    box.appendChild(ropIb('paste', 'Paste a screenshot', function () { ropPasteShot(job); }));
  }
  box.addEventListener('click', function (e) { e.stopPropagation(); });
  return box;
}
/* Ctrl V on the RO page with a picture on the clipboard: it goes on the open operation */
document.addEventListener('paste', function (e) {
  try {
    if (UI.view !== 'ros' || !RO || RO.shop || UI.modal) return;
    var t = (e.composedPath && e.composedPath()[0]) || e.target; if (t && (/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName || '') || t.isContentEditable)) return;
    var fs = Array.prototype.filter.call((e.clipboardData && e.clipboardData.files) || [], function (f) { return /^image\//.test(f.type || ''); }); if (!fs.length) return;
    var job = S.jobs.filter(function (j) { return j.id === S.ui.card; })[0]; if (!job) return;
    e.preventDefault(); ropAttach(job, fs);
  } catch (er) {}
});
/* the quick add line for a part, opened from the Parts tab's + */
function ropPartAdd(job, pane, nParts) {
  if (ROPT.padd !== job.id && UI.ivPartAdd !== job.id) { if (!nParts) pane.appendChild(el('div', { class: 'px-li', html: '<small>No parts on this operation yet.</small>' })); return; }
  UI.ivPartAdd = null; ROPT.padd = job.id;
  var inp = el('input', { class: 'px-input px-input--full rop-padd', placeholder: 'e.g. 4988201 x2 brake chamber $45.99 — Enter adds it, Esc closes' });
  inp.addEventListener('click', function (e) { e.stopPropagation(); });
  inp.addEventListener('keydown', function (ev) {
    ev.stopPropagation();
    if (ev.key === 'Escape') { ROPT.padd = null; render(); return; }
    if (ev.key !== 'Enter') return; ev.preventDefault();
    var qp = parseQuickPart(inp.value); if (!qp.desc && !qp.pn) return;
    pushUndo('add part');
    var np = blankPart(); np.description = qp.desc; np.partNumber = qp.pn; np.qty = qp.qty; if (qp.price) np.price = qp.price;
    job.parts.push(np); invAddFromPart(np, RO && RO.roNumber); save(true); render();
    toast('Added ' + (qp.desc || qp.pn), { label: 'UNDO', run: function () { restoreSnapshot(); } });
  });
  pane.appendChild(inp);
  requestAnimationFrame(function () { try { inp.focus(); } catch (e) {} });
}
