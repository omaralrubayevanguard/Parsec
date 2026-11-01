/* Parsec · ro-page · library-on-ro.js
   The Library on the RO page: each operation’s codes, function group and documents with + document, what each code means, the documents that cover its codes (Attach / Not now), the documents strip above the operations, and PDFs offered to the Library before they attach.
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   libOpChips libOpBelow libPickFor libRouteDocs libDocStrip libProcsFor libStepsTxt (7 functions)
   uses       access/ library/ pages/library/ ro/ shell/ state/
*/
/* ============================== the Library on the RO page (Parsec 17.1) ==============================
   Each operation's line under its row: its fault codes (code · FTB), its function group, its documents, + document,
   what each code means, and the documents in the Library that cover its codes (Attach / Not now).
   Above the operations, the documents used on the RO, grouped by operation; a chip opens the document beside the RO.
   A PDF dropped on an operation, or added from the Files tab, is offered to the Library first (library/intake.js). */

/* the chips that follow "+ code" on the operation's line */
function libOpChips(job, row) {
  var fg = libOpFgrp(job);
  if (fg) row.insertBefore(el('span', { class: 'libFg mono', text: fg, title: 'Function group ' + (libFgName(fg) || fg) }), row.firstChild);
  libOpDocs(job).forEach(function (d) {
    row.appendChild(el('span', { class: 'libChip k-' + d.kind }, [
      el('button', { class: 'libGo', type: 'button', title: 'Open ' + libDocChipText(d) + (d.title ? ' — ' + d.title : ''), onClick: function (e) { e.stopPropagation(); libOpen(d, null, { ro: RO, op: job }); } },
        [el('i'), document.createTextNode(libDocChipText(d) + libStepsTxt(job, d))]),
      el('button', { class: 'libX', type: 'button', 'aria-label': 'Take ' + libDocChipText(d) + ' off this operation', title: 'Take it off this operation (its copy stays in Files)', html: svgI('<path d="M6 6l12 12M18 6L6 18"/>', 10),
        onClick: function (e) { e.stopPropagation(); pushUndo('document'); libDetach(job, d.id); render(); toast(libDocChipText(d) + ' is off OP ' + ropN(job), { label: 'UNDO', run: function () { restoreSnapshot(); } }); } })
    ]));
  });
  row.appendChild(el('button', { class: 'fltAdd libAdd', type: 'button', text: '+ document', title: 'Add a CBR, TSB, FSB or recall — Parsec reads it and asks before filing',
    onClick: function (e) { e.stopPropagation(); libPickFor(job); } }));
  if (navAllowed('library')) row.appendChild(el('button', { class: 'fltLink libFind', type: 'button', text: 'Library', title: 'The Library, narrowed to this truck and operation',
    onClick: function (e) { e.stopPropagation(); libOpenFor(RO, job); } }));
}
/* under the line: what each code means, then what the Library has for them */
function libOpBelow(job, bar) {
  var fl = job.faults || [];
  if (fl.length) {
    var mean = el('div', { class: 'libMean' });
    fl.slice(0, 4).forEach(function (f) {
      var sym = libCodeSymptoms(f);
      mean.appendChild(el('div', { class: 'libMeanL' }, [el('b', { class: 'mono', text: fcShort(f) }), el('span', { text: faultMeaning(f) + (sym ? ' · ' + sym : '') })]));
    });
    bar.appendChild(mean);
  }
  var have = {}; libOpDocs(job).forEach(function (d) { have[d.id] = 1; });
  var skip = {}; (job.docSkip || []).forEach(function (id) { skip[id] = 1; });
  var offers = [], seen = {};
  fl.forEach(function (f) {
    libDocsForCode(f).forEach(function (d) {
      if (have[d.id] || skip[d.id] || seen[d.id]) return; seen[d.id] = 1;
      var row = libCodeRow(f), pg = row && row.doc === d.id && row.page ? row.page : null;
      offers.push({ d: d, f: f, pg: pg });
    });
  });
  libProcsFor(job).forEach(function (o) { if (!have[o.d.id] && !skip[o.d.id] && !seen[o.d.id]) { seen[o.d.id] = 1; offers.push(o); } });
  offers.slice(0, 3).forEach(function (o) {
    bar.appendChild(el('div', { class: 'libOffer' }, [
      el('span', { class: 'libChip k-' + o.d.kind + ' ro' }, [el('i'), document.createTextNode(libDocChipText(o.d))]),
      el('span', { class: 'libOfferT', text: o.why || ('covers ' + libCodeKey(o.f) + (o.pg ? ' (page ' + o.pg + ')' : '')) }),
      el('button', { class: 'libOfferB', type: 'button', text: 'Open', onClick: function (e) { e.stopPropagation(); libOpen(o.d, o.pg, { ro: RO, op: job }); } }),
      el('button', { class: 'libOfferB pri', type: 'button', text: 'Attach', title: 'Put it on OP ' + ropN(job) + ' — a copy goes into Files',
        onClick: function (e) { e.stopPropagation(); pushUndo('document'); libAttach(RO, job, o.d, o.d.dtc ? 'dtc' : 'report', function () { render(); }); render(); toast(libDocChipText(o.d) + ' is on OP ' + ropN(job) + '.'); } }),
      el('button', { class: 'libOfferB', type: 'button', text: 'Not now', title: 'Don’t offer it on this operation again',
        onClick: function (e) { e.stopPropagation(); job.docSkip = (job.docSkip || []).concat([o.d.id]); save(true); render(); } })
    ]));
  });
}
/* + document on an operation */
function libPickFor(job) {
  var inp = document.createElement('input'); inp.type = 'file'; inp.multiple = true; inp.accept = '.pdf,application/pdf,image/*';
  inp.addEventListener('change', function () { var L = Array.prototype.slice.call(inp.files || []); if (L.length) libIntake(L, { ro: RO, op: job }, function (r) { if (r.plain.length) { pushUndo('attach files'); addFiles(pgEntryFor('report', true).oid, r.plain, job.id); save(true); } render(); }); });
  inp.click();
}
/* a drop or the Files tab: PDFs go to the Library's question first; the rest attach the usual way */
function libRouteDocs(files, job, attach) {
  var L = Array.prototype.slice.call(files || []), pdf = L.filter(function (f) { return /pdf/i.test(f.type || '') || /\.pdf$/i.test(f.name || ''); }), rest = L.filter(function (f) { return pdf.indexOf(f) < 0; });
  if (!pdf.length || RO.shop) { attach(L); return; }
  if (rest.length) attach(rest);
  libIntake(pdf, { ro: RO, op: job || null }, function (r) { if (r.plain.length) attach(r.plain); render(); });
}
/* above the operations: every document on the RO, by operation */
function libDocStrip() {
  if (!RO || RO.shop || RO.id === SHOP_RO_ID) return null;
  var G = libRoDocs(RO); if (!G.length) return null;
  var strip = el('div', { class: 'libStrip', role: 'group', 'aria-label': 'Documents on this RO' }, [el('span', { class: 'libStripL', text: 'Documents' })]);
  G.forEach(function (g) {
    var grp = el('span', { class: 'libGrp' }, [el('span', { class: 'libOp', text: 'OP ' + g.n, title: g.op.complaint || '' })]);
    g.docs.forEach(function (d) {
      grp.appendChild(el('button', { class: 'libChip libGo k-' + d.kind, type: 'button', title: 'Open ' + libDocChipText(d) + (d.title ? ' — ' + d.title : ''), onClick: function (e) { e.stopPropagation(); libOpen(d, null, { ro: RO, op: g.op }); } },
        [el('i'), document.createTextNode(libDocChipText(d) + libStepsTxt(g.op, d))]));
    });
    strip.appendChild(grp);
  });
  return strip;
}

/* ---------- Impact procedures for an operation: its operation number first, then its function group ---------- */
function libProcsFor(job) {
  var txt = [job.complaint, job.work, job.cause, job.correction].concat((job.offNotes || []).map(function (n) { return n.text; })).join(' ');
  var nums = {}; String(txt || '').replace(/\b(\d{4}-\d{2}-\d{2}-\d{2})\b/g, function (m, n) { nums[n] = 1; return m; });
  var fg = libOpFgrp(job).slice(0, 2), P = libDocs().filter(function (d) { return d && (d.kind === 'proc' || d.kind === 'diag'); }), out = [];
  P.forEach(function (d) { if (nums[d.opNo || d.num]) out.push({ d: d, why: 'its operation number ' + (d.opNo || d.num) + ' · ' + (d.title || '') }); });
  if (fg) P.forEach(function (d) { if (!nums[d.opNo || d.num] && String(d.fgrp || '').slice(0, 2) === fg) out.push({ d: d, why: (d.title || '') + ' · function group ' + fg }); });
  return out;
}
/* " · 23/80" on a procedure's chip: the steps ticked on this operation */
function libStepsTxt(op, d) { if (!d || (d.kind !== 'proc' && d.kind !== 'diag') || !d.proc) return ''; var n = libProcDone(op, d).length; return ' \u00b7 ' + n + '/' + d.proc.steps.length; }
