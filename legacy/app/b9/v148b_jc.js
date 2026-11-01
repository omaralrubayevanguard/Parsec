/* ============ Parsec 14.8 (B) — Extract operations into this RO, from text or a screenshot ============
   Only four things per operation: the complaint, the status, the quoted time and the approval. Everything is read here
   (paste, or the built-in screenshot reader) — nothing leaves the computer. Each row says what it does: Update Op 2, or Add as new. */
var OX_ST = ['Hold Tech', 'Waiting – Parts', 'Waiting – Sublet', 'Waiting – Foreman', 'Waiting – Tech Support', 'Waiting – Customer', 'Waiting – Approval', 'Complete', 'Declined'];
var OX_AP = ['Approved', 'Pending', 'Declined', 'Not needed'];
function oxStLbl(s) { return s === 'Hold Tech' ? 'Hold tech' : s === 'Waiting – Tech Support' ? 'Waiting – Tech support' : s; }
/* a status phrase on the paperwork → Parsec's operation status ('' = none / keep) */
function oxStatusOf(t) {
  var s = String(t || '').toLowerCase().replace(/[–—]/g, '-');
  if (!/[a-z]/.test(s)) return '';
  if (/declin/.test(s)) return 'Declined';
  if (/sublet|sent\s*out|outside\s*vendor|\bvendor\b/.test(s)) return 'Waiting – Sublet';
  if (/tech(?:nical)?\s*support|\btsc\b|\bsupport\b/.test(s)) return 'Waiting – Tech Support';
  if (/foreman/.test(s)) return 'Waiting – Foreman';
  if (/customer|call\s*back/.test(s)) return 'Waiting – Customer';
  if (/(?:wait\w*|needs)\s*(?:-|on|for)?\s*(?:the\s*)?approval/.test(s)) return 'Waiting – Approval';
  if (/parts?\b[^.]{0,20}(?:wait|order|back|eta)|(?:wait\w*|order\w*|back\w*)\s*(?:-|on|for)?\s*(?:the\s*)?parts?\b|\bwp\b|backorder/.test(s)) return 'Waiting – Parts';
  if (/\b(?:complete[ds]?|completed|finished|done|closed|road\s*test(?:ed)?)\b/.test(s)) return 'Complete';
  if (/\bhold\b|not\s*started|\bopen\b|\bnew\b|assigned|dispatched|ready\s*to\s*start/.test(s)) return 'Hold Tech';
  return '';
}
function oxApprOf(t, ap) {
  var s = String(t || '').toLowerCase();
  if (/(?:approval\s*)?not\s*(?:needed|required)|no\s*approval\s*(?:needed|required)?|approval\s*[:#\-]\s*n\/?a\b/.test(s)) return 'Not needed';
  if (ap) return ap;
  return /declin|not\s*approved/.test(s) ? 'Declined' : /pending|awaiting/.test(s) ? 'Pending' : /approved/.test(s) ? 'Approved' : '';
}
/* the text → [{ no, name, hours, st, ap }] — the New RO import's operations reader first, the plain-list reader as the fallback */
function oxParse(raw) {
  raw = String(raw || '').replace(/\r/g, '');
  var ops = [];
  try { var P = IMPX.parse(raw); ops = (P && P.ops || []).filter(function (o) { return o.name && /[A-Za-z]{3}/.test(o.name); }).map(function (o) { return { no: +o.no || null, name: o.name, hours: o.hours != null ? +o.hours : null, ap: o.approval || '' }; }); } catch (e) { ops = []; }
  if (!ops.length) try { ops = parseOpsText(raw).map(function (r) { return { no: null, name: r.name, hours: r.hours != null ? +r.hours : null, ap: r.approval || '' }; }); } catch (e) { ops = []; }
  var L = raw.split('\n'), starts = [], from = 0;
  ops.forEach(function (o) {
    var key = o.name.toLowerCase().slice(0, 18), reNo = o.no ? new RegExp('^\\s*(?:op(?:eration)?\\.?\\s*#?\\s*)?' + o.no + '\\b', 'i') : null, at = -1;
    for (var i = from; i < L.length; i++) { var l = L[i].toLowerCase(); if (l.indexOf(key) > -1 || (reNo && reNo.test(L[i]) && /[a-z]{3}/i.test(L[i]))) { at = i; break; } }
    starts.push(at); if (at > -1) from = at + 1;
  });
  ops.forEach(function (o, k) {
    var a = starts[k], b = L.length; for (var j = k + 1; j < starts.length; j++) if (starts[j] > a) { b = starts[j]; break; }
    var blk = a > -1 ? L.slice(a, b) : [], st = '', i;
    for (i = 0; i < blk.length && !st; i++) { if (/approval/i.test(blk[i])) continue; var m = /\b(?:job\s*|op(?:eration)?\s*|repair\s*)?status\s*[:#\-–]\s*(.+)$/i.exec(blk[i]); if (m) st = oxStatusOf(m[1]); }
    if (!st && blk.length) {   /* the operation's own line, minus its name, its approval and its numbers */
      var first = blk[0], nm = o.name, ix = first.toLowerCase().indexOf(nm.toLowerCase());
      var rest = (ix > -1 ? first.slice(ix + nm.length) : first).replace(/\b(?:approved|pending|declined|not\s*approved|awaiting\s*approval|approval\s*pending|pre-?approved)\b/ig, ' ').replace(/\$?\s?\d[\d,]*(?:\.\d+)?\s*(?:h|hrs?|hours?)?\b/ig, ' ');
      st = oxStatusOf(rest);
    }
    for (i = 1; i < blk.length && !st; i++) { var t = blk[i].trim(); if (!t || /approval|labou?r|hours?|\$|story|cause|correction|part/i.test(t) || t.split(/\s+/).length > 5) continue; st = oxStatusOf(t); }
    o.ap = oxApprOf(blk.join('\n'), o.ap);
    if (!st && o.ap === 'Declined') st = 'Declined';
    if (st === 'Declined' && !o.ap) o.ap = 'Declined';
    o.st = st;
  });
  return ops;
}
/* how alike two complaints are, 0–1 (words, or the first five letters of longer ones) */
function oxWords(s) { return String(s || '').toLowerCase().replace(/[^a-z0-9 ]+/g, ' ').split(/\s+/).filter(function (w) { return w.length >= 3 && !/^(?:the|and|for|with|from|not|per)$/.test(w); }); }
function oxSim(a, b) {
  var A = oxWords(a), B = oxWords(b); if (!A.length || !B.length) return 0;
  var n = A.filter(function (w) { return B.some(function (x) { return x === w || (w.length >= 5 && x.length >= 5 && x.slice(0, 5) === w.slice(0, 5)); }); }).length;
  return n / Math.max(A.length, B.length);
}
function oxMatch(rows) {
  var jobs = S.jobs.filter(function (j) { return j && j.id; }), used = {}, pairs = [];
  rows.forEach(function (r) { if (r.by === 'picked' && r.to) used[r.to] = 1; });
  rows.forEach(function (r, i) { if (r.by === 'picked') return; r.to = ''; r.by = ''; jobs.forEach(function (j, k) { pairs.push({ i: i, j: j, k: k, s: oxSim(r.name, j.complaint) }); }); });
  pairs.sort(function (x, y) { return y.s - x.s; }).forEach(function (p) { var r = rows[p.i]; if (p.s >= 0.5 && !r.to && !used[p.j.id]) { r.to = p.j.id; r.by = 'complaint'; used[p.j.id] = 1; } });
  rows.forEach(function (r) { if (r.to || !r.no || r.by === 'picked') return; var j = jobs[r.no - 1]; if (j && !used[j.id] && oxSim(r.name, j.complaint) >= 0.15) { r.to = j.id; r.by = 'op number'; used[j.id] = 1; } });
}
function oxJob(id) { return S.jobs.filter(function (j) { return j.id === id; })[0] || null; }
function oxNo(j) { return S.jobs.indexOf(j) + 1; }
function oxApNow(j) { return j.appr && j.appr.s ? (j.appr.s === 'no' ? 'Declined' : j.appr.how === 'Not needed' ? 'Not needed' : 'Approved') : j.declined ? 'Declined' : 'Pending'; }
function oxStNow(j) { if (j.declined) return 'Declined'; var s = opStatus(j); return typeof s === 'string' ? s : (s && s.status) || 'Hold Tech'; }
function oxSetAp(j, ap, who) {
  if (!ap || ap === oxApNow(j)) return false;
  var po = RO && RO.poNumber ? String(RO.poNumber) : '';
  if (ap === 'Pending') { delete j.appr; j.declined = false; }
  else j.appr = { s: ap === 'Declined' ? 'no' : 'ok', by: who, at: nowIso(), who: who, role: 'From the paperwork', how: ap === 'Not needed' ? 'Not needed' : 'Extracted', po: ap === 'Declined' ? '' : po, amt: 0, reason: ap === 'Declined' ? 'Declined on the paperwork' : ap === 'Not needed' ? 'No approval needed' : '' };
  j.declined = ap === 'Declined';
  return true;
}
function oxSetSt(j, st) {
  if (!st || st === oxStNow(j)) return false;
  if (st === 'Declined') { j.declined = true; return true; }
  if (runningPunchOf(j)) return false;   /* a clock on it keeps it Working — the paperwork doesn't stop anyone's clock */
  if (j.declined && !(j.appr && j.appr.s === 'no')) j.declined = false;
  if (!/^Complete/.test(st) && typeof opReopenMark === 'function') try { opReopenMark(j, RO.id, st); } catch (e) {}
  j.jobStatus = { status: st, sub: null, setAt: nowIso(), hand: true };
  return true;
}
function openExtractOps() {
  if (!RO) return;
  var rows = [], text = '';
  var ta = el('textarea', { class: 'px-input ox-ta', rows: '6', placeholder: 'Paste the case page or the operations here — or paste / drop a screenshot.\ne.g.  1  Alternator not charging   Approved   1.80   Waiting – Parts' });
  var fileIn = el('input', { type: 'file', accept: 'image/*,.pdf,application/pdf', multiple: 'multiple', style: 'display:none' });
  var status = el('div', { class: 'ox-status' }), list = el('div', { class: 'ox-list' });
  var fileBtn = el('button', { class: 'px-btn px-btn--sm', type: 'button', html: '<span class="jcIco">' + ((typeof IC !== 'undefined' && IC.upload) || '') + '</span><span>Screenshot or PDF…</span>', onClick: function (e) { e.stopPropagation(); fileIn.click(); } });
  var drop = el('div', { class: 'ox-drop' }, [ta, el('div', { class: 'ox-tools' }, [fileBtn, fileIn, el('span', { class: 'ox-hint', text: 'Read here, on this computer — only the complaint, status, quoted time and approval.' })])]);
  function sel(opts, cur, lbl, fn, keep) {
    var s = el('select', { class: 'ox-sel', 'aria-label': lbl });
    (keep ? [['', keep]] : []).concat(opts.map(function (o) { return Array.isArray(o) ? o : [o, o === 'Hold Tech' || /Tech Support/.test(o) ? oxStLbl(o) : o]; })).forEach(function (o) { var op = el('option', { value: o[0], text: o[1] }); if (o[0] === cur) op.selected = true; s.appendChild(op); });
    s.addEventListener('change', function () { fn(s.value); paintFoot(); });
    return s;
  }
  function paint() {
    list.innerHTML = '';
    if (!rows.length) { list.appendChild(el('div', { class: 'ox-empty', text: ta.value.trim() ? 'No operations found in that text yet — edit it, or try a sharper screenshot.' : 'Operations show up here as you paste text or read a screenshot.' })); paintFoot(); return; }
    list.appendChild(el('div', { class: 'ox-row ox-h' }, ['', 'Goes to', 'Complaint', 'Status', 'Quoted', 'Approval'].map(function (t) { return el('span', { text: t }); })));
    rows.forEach(function (r) {
      var j = r.to ? oxJob(r.to) : null;
      var ck = el('input', { type: 'checkbox', 'aria-label': 'Use this operation' }); ck.checked = r.on !== false; ck.addEventListener('change', function () { r.on = ck.checked; row.classList.toggle('is-off', !ck.checked); paintFoot(); });
      var to = sel([['', 'Add as new']].concat(S.jobs.map(function (x, k) { return [x.id, 'Update Op ' + (k + 1)]; })), r.to, 'Goes to', function (v) { r.to = v; r.by = v ? 'picked' : ''; paint(); });
      var nm = el('input', { class: 'px-input ox-in', value: r.name, 'aria-label': 'Complaint' }); nm.addEventListener('input', function () { r.name = nm.value; paintFoot(); });
      var st = sel(OX_ST, r.st, 'Status', function (v) { r.st = v; }, j ? '— keep —' : '— Hold tech —');
      var hr = el('input', { class: 'px-input ox-in ox-h2 mono', value: r.hours != null ? (+r.hours).toFixed(2) : '', placeholder: j ? 'keep' : '0.00', inputmode: 'decimal', 'aria-label': 'Quoted hours' }); hr.addEventListener('input', function () { var v = parseFloat(hr.value); r.hours = hr.value.trim() === '' ? null : isFinite(v) ? v : r.hours; paintFoot(); });
      var ap = sel(OX_AP, r.ap, 'Approval', function (v) { r.ap = v; }, j ? '— keep —' : '— none —');
      var row = el('div', { class: 'ox-row' + (r.on === false ? ' is-off' : '') }, [ck, to, nm, st, el('span', { class: 'ox-q' }, [hr, el('span', { class: 'ox-u', text: 'h' })]), ap]);
      list.appendChild(row);
      var now = j ? 'Op ' + oxNo(j) + ' now: ' + (j.complaint || '—') + ' · ' + oxStLbl(oxStNow(j)) + ' · ' + num(j.quoted).toFixed(2) + ' h · ' + oxApNow(j).toLowerCase() + (r.by && r.by !== 'picked' ? ' — matched by ' + r.by : '') + (runningPunchOf(j) && r.st && r.st !== 'Declined' && r.st !== oxStNow(j) ? ' · a clock is running on it, its status stays' : '')
        : 'A new operation' + (r.no ? ' (Op ' + r.no + ' on the paperwork)' : '');
      list.appendChild(el('div', { class: 'ox-now' + (j ? '' : ' is-new'), text: now }));
    });
    paintFoot();
  }
  function plan() {
    var up = 0, add = 0; rows.forEach(function (r) { if (r.on === false || !String(r.name || '').trim()) return; if (r.to && oxJob(r.to)) up++; else add++; }); return { up: up, add: add };
  }
  function paintFoot() {
    var b = PXM && PXM.submit; if (!b) return; var p = plan(), n = p.up + p.add;
    b.disabled = !n; b.textContent = !n ? 'Apply' : [p.up ? 'Update ' + p.up : '', p.add ? 'add ' + p.add : ''].filter(Boolean).join(' · ').replace(/^a/, 'A');
  }
  function setText(t) { text = t; var prev = {}; rows.forEach(function (r) { prev[(r.src || '').toLowerCase()] = r; }); var found = oxParse(t);
    rows = found.map(function (r) { var p = prev[r.name.toLowerCase()]; if (p) return p; r.src = r.name; return r; }); oxMatch(rows);
    status.textContent = !t.trim() ? '' : rows.length ? rows.length + ' operation' + (rows.length === 1 ? '' : 's') + ' found — check each row, untick any you don’t want.' : 'No operations found in that text yet.'; status.className = 'ox-status' + (rows.length ? ' ok' : '');
    paint(); }
  function read(files) {
    files = Array.prototype.slice.call(files || []);
    var pdf = files.filter(function (f) { return /pdf$/i.test(f.type || '') || /\.pdf$/i.test(f.name || ''); })[0], imgs = files.filter(function (f) { return /^image\//.test(f.type || '') || /\.(png|jpe?g|webp|bmp|gif)$/i.test(f.name || ''); });
    if (!pdf && !imgs.length) { status.textContent = 'Pick screenshots (PNG, JPG…) or a PDF.'; status.className = 'ox-status bad'; return; }
    status.textContent = pdf ? 'Reading the PDF…' : 'Reading the screenshot' + (imgs.length > 1 ? 's' : '') + '…'; status.className = 'ox-status busy';
    (pdf ? pdfToText(pdf) : ocrImages(imgs, 6).then(cleanOcrText)).then(function (t) {
      t = String(t || '').trim(); if (!t) { status.textContent = 'No text found in that ' + (pdf ? 'PDF.' : 'screenshot.'); status.className = 'ox-status bad'; return; }
      ta.value = (ta.value.trim() ? ta.value.replace(/\s+$/, '') + '\n\n' : '') + t; setText(ta.value);
      if (!rows.length) { status.textContent = 'Read it, but found no operations. You can edit the text above.'; status.className = 'ox-status'; }
    }, function () { status.textContent = 'Couldn’t read that file here — paste the text instead.'; status.className = 'ox-status bad'; });
  }
  ta.addEventListener('input', function () { setText(ta.value); });
  ta.addEventListener('paste', function (e) { var it = e.clipboardData && e.clipboardData.files; if (it && it.length) { e.preventDefault(); read(it); } });
  fileIn.addEventListener('change', function () { read(fileIn.files); fileIn.value = ''; });
  drop.addEventListener('dragover', function (e) { e.preventDefault(); drop.classList.add('is-drag'); });
  drop.addEventListener('dragleave', function () { drop.classList.remove('is-drag'); });
  drop.addEventListener('drop', function (e) { e.preventDefault(); drop.classList.remove('is-drag'); if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length) read(e.dataTransfer.files); });
  pxModal({ title: 'Extract operations', sub: (RO.roNumber || 'RO') + ' · the complaint, status, quoted time and approval', size: 'ox', submit: 'Apply', hintWord: 'to apply', body: [drop, status, list],
    run: function () {
      var use = rows.filter(function (r) { return r.on !== false && String(r.name || '').trim(); }); if (!use.length) return false;
      pushUndo('extract operations');
      var who = (typeof punchByName === 'function' && punchByName()) || 'Parsec', up = 0, add = 0, first = null;
      use.forEach(function (r) {
        var j = r.to ? oxJob(r.to) : null, nm = String(r.name).trim();
        if (j) { var ch = false;
          if (nm && nm !== String(j.complaint || '').trim()) { j.complaint = nm; ch = true; }
          if (r.hours != null && isFinite(+r.hours) && Math.abs((+r.hours) - num(j.quoted)) > 0.004) { j.quoted = Math.round(+r.hours * 100) / 100; ch = true; }
          if (oxSetAp(j, r.ap, who)) ch = true;
          if (oxSetSt(j, r.st)) ch = true;
          if (ch) { up++; j.editedAt = nowIso(); if (!first) first = j; } }
        else { var nj = blankJob(); nj.complaint = nm; nj.quoted = r.hours != null && isFinite(+r.hours) ? Math.round(+r.hours * 100) / 100 : 0; try { nj.jobType = opsGuessType(nm); } catch (e) {} nj.log = [];
          S.jobs.push(nj); oxSetAp(nj, r.ap, who); if (r.st && r.st !== 'Hold Tech') oxSetSt(nj, r.st); add++; if (!first) first = nj; }
      });
      var msg = [up ? up + ' operation' + (up === 1 ? '' : 's') + ' updated' : '', add ? add + (up ? '' : ' operation' + (add === 1 ? '' : 's')) + ' added' : ''].filter(Boolean).join(', ') || 'Nothing changed — it already matches';
      try { if (up || add) audit('extract', roLabel(RO) + ': extracted operations — ' + msg, RO); } catch (e) {}
      if (first) S.ui.card = first.id;
      save(true); render(); try { tecRender(); } catch (e) {}
      toast(msg + '.', up || add ? { label: 'UNDO', run: function () { restoreSnapshot(); } } : undefined);
    } });
  paint();
}
