/* Parsec · ro-page · fault-codes.js
   Fault codes on each operation (SPN / FMI, P-codes): reading what was typed, what a code means, the chips on the tile and the card, and the note a chip starts; Add ▾ for a code, a document or the Library (17.1).
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   parseFault fcSame fcLabel fcShort faultMeaning addFault openFaultNotes faultMini fcAddBtn faultBar FC_ADD (10 functions, 1 constant)
   uses       access/ data/ kit/ library/ pages/fixes/ pages/library/ pages/warranty/ shell/ state/
*/
/* ============ fault-code chips (SPN / FMI) on each operation — N3 + N6 ============ */
var FC_ADD = null;      /* id of the operation whose "add a code" panel is open */
/* Parsec 17.1: one reader for every form a code is written in, and its meaning from the Library (library/codes.js) */
function parseFault(str) { return libCodeParse(str); }
function fcSame(a, b) { return libCodeSame(a, b); }
function fcLabel(f) { return libCodeLabel(f); }
function fcShort(f) { return libCodeShort(f); }
function faultMeaning(f) { return libCodeMeaning(f); }
function addFault(job, f) {
  job.faults = job.faults || [];
  if (job.faults.some(function (x) { return fcSame(x, f); })) { toast(fcLabel(f) + ' is already on this operation'); return false; }
  pushUndo('fault code');
  job.faults.push(libCodeStore(f));
  save(true); render();
  return true;
}
/* tap a chip: open the operation and start a note on that code */
function openFaultNotes(job, f) {
  S.ui.card = job.id; openCard(RO.id, job.id); persistUI(); save(); render();
  setTimeout(function () {
    fabAddNote(job);
    setTimeout(function () {
      var a = R.activeElement, tag = (f.code || 'SPN ' + f.spn + ' FMI ' + f.fmi) + ' — ';
      if (!a) return;
      if (/^(TEXTAREA|INPUT)$/.test(a.tagName) && !a.value.trim()) {
        a.value = tag; a.dispatchEvent(new Event('input', { bubbles: true })); try { a.setSelectionRange(tag.length, tag.length); } catch (e) {}
      } else if (a.isContentEditable && !a.textContent.trim()) {
        a.textContent = tag; var r = document.createRange(); r.selectNodeContents(a); r.collapse(false);
        var sl = R.getSelection ? R.getSelection() : window.getSelection(); if (sl) { sl.removeAllRanges(); sl.addRange(r); }
        a.dispatchEvent(new Event('input', { bubbles: true }));
      }
    }, 320);
  }, 60);
}
/* N3: small chips on the collapsed operation tile */
function faultMini(job) {
  var fl = job.faults || [];
  var box = el('div', { class: 'fltMini' });
  fl.slice(0, 3).forEach(function (f) {
    box.appendChild(el('button', { class: 'fltM', type: 'button', title: fcLabel(f) + ' — ' + faultMeaning(f) + ' (open notes)',
      text: fcShort(f), onClick: function (e) { e.stopPropagation(); openFaultNotes(job, f); } }));
  });
  if (fl.length > 3) box.appendChild(el('span', { class: 'fltMore', text: '+' + (fl.length - 3) }));
  return box;
}
/* N6: chips on the open card, and a "+ code" that takes 111/1 and shows what it means */
/* Add ▾ on the codes line (Parsec 17.1): a fault code, a document, or the Library narrowed to this operation */
function fcAddBtn(job) {
  var b = el('button', { class: 'fltAdd fcAdd' + (FC_ADD === job.id ? ' on' : ''), type: 'button', title: 'Add a fault code or a document', 'aria-haspopup': 'menu', html: '<span>Add</span>' + pxI('chevD', 10) });
  b.addEventListener('click', function (e) {
    e.stopPropagation();
    var items = [pxMenuItem('plus', 'Fault code', { run: function () { FC_ADD = job.id; render(); requestAnimationFrame(function () { var i = R.querySelector('.fltIn'); if (i) i.focus(); }); } }),
      pxMenuItem('clip', 'Document…', { run: function () { libPickFor(job); } })];
    if (navAllowed('library')) items.push(pxMenuItem('search', 'Find in the Library', { run: function () { libOpenFor(RO, job); } }));
    pxPop(b, el('div', { class: 'px-pop rop-pop fcAddPop', role: 'menu' }, items));
  });
  return b;
}
function faultBar(job, o) {
  o = o || {};
  var fl = job.faults || [];
  var bar = el('div', { class: 'fltBar' });
  bar.addEventListener('click', function (e) { e.stopPropagation(); });
  var row = el('div', { class: 'fltRow' });
  fl.forEach(function (f) {
    row.appendChild(el('span', { class: 'fltChip' }, [
      el('button', { class: 'fltGo', type: 'button', title: faultMeaning(f) + ' — open notes', onClick: function (e) { e.stopPropagation(); openFaultNotes(job, f); } },
        [el('i', { class: 'fltDot' }), document.createTextNode(fcLabel(f))]),
      el('button', { class: 'fltX', type: 'button', 'aria-label': 'Remove code ' + fcShort(f), title: 'Remove this code', html: svgI('<path d="M6 6l12 12M18 6L6 18"/>', 10),
        onClick: function (e) { e.stopPropagation(); pushUndo('fault code'); job.faults = job.faults.filter(function (x) { return x.id !== f.id; }); save(true); render();
          toast('Code removed', { label: 'UNDO', run: function () { restoreSnapshot(); } }); } })
    ]));
  });
  libOpChips(job, row, o);   /* Parsec 17.1: its function group, its documents */
  row.appendChild(fcAddBtn(job));   /* Parsec 17.1: + code, + document and the Library, behind one Add */
  /* this job's warranty claim, and how often the shop has fixed it before */
  try {
    if (navAllowed('warranty') && wcIsOp(RO, job)) {
      var wcs = wcStatus(RO, job);
      row.appendChild(el('button', { class: 'fltLink wcl wcl-' + WC_ST[wcs].c, type: 'button', text: 'Claim \u00b7 ' + WC_ST[wcs].l, title: 'Open this claim on the Warranty page',
        onClick: function (e) { e.stopPropagation(); UI.view = 'warranty'; UI.wcRo = RO.id; UI.wcFilter = 'all'; persistUI(); tecRender(); window.scrollTo(0, 0); } }));
    }
    if (job.fxQ || job.fxP) {
      var fq = job.fxQ, fp = job.fxP, same = fq && fp && fq.ro === fp.ro;
      var ftx = same ? 'Time & parts from ' + fq.ro : [fq ? 'Time from ' + fq.ro : '', fp ? 'Parts from ' + fp.ro : ''].filter(Boolean).join(' \u00b7 ');
      row.appendChild(el('button', { class: 'fltLink fxa', type: 'button', text: ftx, title: 'Filled in from an earlier fix of the same operation \u2014 open that RO',
        onClick: function (e) { e.stopPropagation(); var g = fq || fp; openRoAt(g.roId, g.opId); } }));
    }
    var fxm = navAllowed('fixes') ? fixMatchFor(job) : null, fxt = fxm && fxm.tier && FX_TIER[fxm.tier];   /* 18: the closest fixes first — codes and documents before words */
    if (fxt && fxm.items.length) row.appendChild(el('button', { class: 'fltLink fxl fxl-' + fxm.tier, type: 'button', text: fxt[0].replace('{n}', fxm.items.length), title: fxt[1] + ' — open them on the Fixes page',
      onClick: function (e) { e.stopPropagation(); var f0 = fxm.items[0]; UI.view = 'fixes'; UI.fixKey = fixKeyOf(fxm.tier === 'codes' ? f0.complaint : job.complaint); UI.fixIds = fxm.items.map(function (x) { return x.id; }); UI.fixQuery = ''; UI.fixAdd = false; persistUI(); tecRender(); window.scrollTo(0, 0); } }));
  } catch (err) {}
  bar.appendChild(row);
  libOpBelow(job, bar);   /* what each code means, and what the Library has for them */
  if (FC_ADD === job.id) {
    var inp = el('input', { class: 'fltIn mono', type: 'text', placeholder: 'P1050 FTB 17 · 3226/2 · MID 128 PID 110 FMI 0', 'aria-label': 'Fault code: a P, C, B or U code with its FTB, SPN/FMI, or MID/PID/FMI', autocomplete: 'off', spellcheck: 'false' });
    var prev = el('div', { class: 'fltPrev' });
    var addB = el('button', { class: 'fltPlus', type: 'button', text: 'Add ↵' });
    function paint() {
      var f = parseFault(inp.value);
      prev.innerHTML = '';
      if (!inp.value.trim()) { prev.appendChild(el('span', { class: 'fltHint', text: 'Any way it’s written: P105E, P1050 FTB 17, 3226/2, MID 128 PID 110 FMI 0' })); addB.disabled = true; return; }
      if (!f) { prev.appendChild(el('span', { class: 'fltHint bad', text: 'Like P1050 FTB 17, 3226/2 (FMI 0–31) or MID 128 PID 110 FMI 0' })); addB.disabled = true; return; }
      prev.appendChild(el('span', { class: 'fltChip pv' }, [el('span', { class: 'fltGo' }, [el('i', { class: 'fltDot' }), document.createTextNode(fcLabel(f))])]));
      prev.appendChild(el('span', { class: 'fltMean', text: faultMeaning(f) }));
      addB.disabled = false;
    }
    function commit() { var f = parseFault(inp.value); if (!f) return; FC_ADD = null; if (!addFault(job, f)) { FC_ADD = job.id; render(); } }
    inp.addEventListener('input', paint);
    inp.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); commit(); }
      else if (e.key === 'Escape') { e.preventDefault(); FC_ADD = null; render(); }
    });
    addB.addEventListener('click', function (e) { e.stopPropagation(); commit(); });
    /* recent: codes used on the other operations of this RO */
    var have = {}; fl.forEach(function (f) { have[fcShort(f)] = 1; });
    var recent = [], seen = {};
    S.jobs.forEach(function (j) { (j.faults || []).forEach(function (f) { var k = fcShort(f); if (!have[k] && !seen[k]) { seen[k] = 1; recent.push(f); } }); });
    var panel = el('div', { class: 'fltPanel' }, [
      el('div', { class: 'fltLine' }, [inp, prev, addB]),
      recent.length ? el('div', { class: 'fltRecent' }, [el('span', { class: 'fltRL', text: 'Recent' })].concat(recent.slice(0, 6).map(function (f) {
        return el('button', { class: 'fltM', type: 'button', text: fcShort(f), title: faultMeaning(f), onClick: function (e) { e.stopPropagation(); FC_ADD = null; if (!addFault(job, f)) { FC_ADD = job.id; render(); } } });
      }))) : null
    ]);
    bar.appendChild(panel);
    paint();
  }
  return bar;
}
