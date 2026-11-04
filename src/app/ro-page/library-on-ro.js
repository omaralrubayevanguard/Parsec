/* Parsec · ro-page · library-on-ro.js
   The Library on the RO page: each operation’s codes, function group and documents, what each code means, the documents that cover its codes (Attach / Not now), the documents strip above the operations, and PDFs offered to the Library before they attach.
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   libOpChips libOpBelow libOpUse libPickFor libRouteDocs libDocStrip libProcsFor libStepsTxt (8 functions)
   uses       library/ ro/ shell/ state/
*/
/* ============================== the Library on the RO page (Parsec 17.1) ==============================
   Each operation's line under its row: its fault codes (code · FTB), its function group, its documents, + document,
   what each code means, and the documents in the Library that cover its codes (Attach / Not now).
   Above the operations, the documents used on the RO, grouped by operation; a chip opens the document beside the RO.
   A PDF dropped on an operation, or added from the Files tab, is offered to the Library first (library/intake.js). */

/* the chips that follow "+ code" on the operation's line */
function libOpChips(job, row, o) {
  var fg = o && o.noFg ? '' : libOpFgrp(job);   /* on the RO page the group is one of the card's facts (Parsec 17.1) */
  if (fg) row.insertBefore(el('span', { class: 'libFg mono', text: fg, title: 'Function group ' + (libFgName(fg) || fg) }), row.firstChild);
  libOpDocs(job).forEach(function (d) {
    row.appendChild(el('span', { class: 'libChip k-' + d.kind }, [
      el('button', { class: 'libGo', type: 'button', title: 'Open ' + libDocChipText(d) + (d.title ? ' — ' + d.title : ''), onClick: function (e) { e.stopPropagation(); libOpen(d, null, { ro: RO, op: job }); } },
        [el('i'), document.createTextNode(libDocChipText(d) + libStepsTxt(job, d))]),
      el('button', { class: 'libX', type: 'button', 'aria-label': 'Take ' + libDocChipText(d) + ' off this operation', title: 'Take it off this operation (its copy stays in Files)', html: svgI('<path d="M6 6l12 12M18 6L6 18"/>', 10),
        onClick: function (e) { e.stopPropagation(); pushUndo('document'); libDetach(job, d.id); render(); toast(libDocChipText(d) + ' is off OP ' + ropN(job), { label: 'UNDO', run: function () { restoreSnapshot(); } }); } })
    ]));
  });
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
  libOpUse(job, bar);
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
  /* 17.3: a document whose symptoms the complaint names — with its code too, it says both */
  var cmp = [job.complaint, job.cause].filter(Boolean).join(' ');
  if (cmp) {
    offers.forEach(function (o) { var hit = libSympHit(o.d, cmp); if (hit && o.f) o.why = 'covers ' + libCodeKey(o.f) + ' and “' + hit + '”'; });
    libDocs().forEach(function (d0) { var d = libLatest(d0); if (!d || have[d.id] || skip[d.id] || seen[d.id]) return; var hit = libSympHit(d, cmp); if (hit) { seen[d.id] = 1; offers.push({ d: d, why: 'matches “' + hit + '”' }); } });
  }
  offers.slice(0, 3).forEach(function (o) {
    var fit = libFits(o.d, RO);
    bar.appendChild(el('div', { class: 'libOffer' }, [
      el('span', { class: 'libChip k-' + o.d.kind + ' ro' }, [el('i'), document.createTextNode(libDocChipText(o.d))]),
      el('span', { class: 'libOfferT', text: o.why || ('covers ' + libCodeKey(o.f) + (o.pg ? ' (page ' + o.pg + ')' : '')) }),
      fit ? el('span', { class: 'libFit ' + (fit.ok ? 'ok' : 'no'), title: fit.why, text: fit.ok ? 'fits' : 'doesn’t fit' }) : null,
      el('button', { class: 'libOfferB', type: 'button', text: 'Open', onClick: function (e) { e.stopPropagation(); libOpen(o.d, o.pg, { ro: RO, op: job }); } }),
      el('button', { class: 'libOfferB pri', type: 'button', text: 'Attach', title: 'Put it on OP ' + ropN(job) + ' — a copy goes into Files',
        onClick: function (e) { e.stopPropagation(); pushUndo('document'); libAttach(RO, job, o.d, o.d.dtc ? 'dtc' : 'report', function () { render(); }); render(); toast(libDocChipText(o.d) + ' is on OP ' + ropN(job) + '.'); } }),
      el('button', { class: 'libOfferB', type: 'button', text: 'Not now', title: 'Don’t offer it on this operation again',
        onClick: function (e) { e.stopPropagation(); job.docSkip = (job.docSkip || []).concat([o.d.id]); save(true); render(); } })
    ]));
  });
}
/* 17.3: what a document on the operation says it needs — does it fit the truck, its parts, its hours, its repair — one click each */
function libOpUse(job, bar) {
  libOpDocs(job).forEach(function (d) {
    var fit = libFits(d, RO), parts = libPartsNew(job, d), hrs = Math.round(libHoursOf(d) * 10) / 10, fix = d.fix && ccLine(job, 'x') !== d.fix ? d.fix : '';
    var useH = hrs > 0 && +job.quoted !== hrs;
    if (!fit && !parts.length && !useH && !fix) return;
    var row = el('div', { class: 'libUse' }, [el('span', { class: 'libChip k-' + d.kind + ' ro' }, [el('i'), document.createTextNode(libDocChipText(d))])]);
    if (fit) row.appendChild(el('span', { class: 'libFit ' + (fit.ok ? 'ok' : 'no'), text: fit.why }));
    var act = function (label, tip, run, msg) { row.appendChild(el('button', { class: 'libOfferB', type: 'button', text: label, title: tip, onClick: function (e) { e.stopPropagation(); pushUndo('use the document'); run(); save(true); render(); toast(msg); } })); };
    if (parts.length) act('Add ' + parts.length + ' part' + (parts.length === 1 ? '' : 's'), parts.map(function (x) { return x.pn + ' ' + x.desc + (x.qty > 1 ? ' ×' + x.qty : ''); }).join(' · '), function () { libUseParts(RO, job, d); }, parts.length + ' part' + (parts.length === 1 ? '' : 's') + ' from ' + libDocLabel(d) + ' added to OP ' + ropN(job) + '.');
    if (useH) act('Use ' + hrs + ' h', 'Make ' + hrs + ' h the quoted hours, from ' + libDocLabel(d), function () { libUseHours(job, d); }, 'OP ' + ropN(job) + ' quoted ' + hrs + ' h, from ' + libDocLabel(d) + '.');
    if (fix) act('Use in the Correction', fix, function () { libUseFix(job, d); }, 'The Correction on OP ' + ropN(job) + ' is the repair from ' + libDocLabel(d) + '.');
    bar.appendChild(row);
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
