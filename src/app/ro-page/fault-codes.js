/* Parsec · ro-page · fault-codes.js
   Fault codes on each operation (SPN / FMI, P-codes): reading what was typed, what a code means, the chips on the tile and the card, and the note a chip starts.
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   parseFault fcSame fcLabel fcShort faultMeaning addFault openFaultNotes faultMini faultBar FC_ADD FC_SPN FC_FMI … (9 functions, 4 constants)
   uses       access/ data/ pages/fixes/ pages/warranty/ shell/ state/
*/
/* ============ fault-code chips (SPN / FMI) on each operation — N3 + N6 ============ */
var FC_ADD = null;      /* id of the operation whose "add a code" panel is open */
var FC_SPN = { 84: 'Vehicle speed', 91: 'Accelerator pedal position', 94: 'Fuel delivery pressure', 97: 'Water in fuel', 100: 'Engine oil pressure',
  102: 'Boost pressure', 105: 'Intake manifold temperature', 110: 'Engine coolant temperature', 111: 'Engine coolant level', 157: 'Fuel rail pressure',
  168: 'Battery voltage', 190: 'Engine speed', 411: 'EGR differential pressure', 412: 'EGR temperature', 3031: 'DEF tank temperature',
  3216: 'Aftertreatment NOx, intake', 3226: 'Aftertreatment NOx, outlet', 3251: 'DPF differential pressure', 3719: 'DPF soot load',
  4364: 'SCR catalyst conversion efficiency', 5246: 'SCR operator inducement' };
var FC_FMI = ['above normal (most severe)', 'below normal (most severe)', 'erratic or intermittent', 'voltage high or shorted high', 'voltage low or shorted low',
  'current low or open circuit', 'current high or grounded', 'mechanical fault', 'abnormal frequency', 'abnormal update rate', 'abnormal rate of change',
  'root cause not known', 'bad device', 'out of calibration', 'special instructions', 'above normal (least severe)', 'above normal (moderate)',
  'below normal (least severe)', 'below normal (moderate)', 'network data in error'];
function parseFault(str) {
  var d = /^\s*([PCUB])\s*-?\s*(\d{4,6})\s*$/i.exec(String(str || ''));
  if (d) return { code: d[1].toUpperCase() + d[2] };
  var m = /^\s*(?:SPN\s*)?(\d{1,6})\s*(?:\/|-|:|,|\s|FMI)\s*(?:FMI\s*)?(\d{1,2})\s*$/i.exec(String(str || ''));
  if (!m) return null;
  var spn = +m[1], fmi = +m[2];
  return fmi > 31 ? null : { spn: spn, fmi: fmi };
}
var FC_SYS = { P: 'Powertrain', C: 'Chassis', B: 'Body', U: 'Network' };
function fcSame(a, b) { return a.code ? a.code === b.code : (!b.code && a.spn === b.spn && a.fmi === b.fmi); }
function fcLabel(f) { return f.code || 'SPN ' + f.spn + ' \u00b7 FMI ' + f.fmi; }
function fcShort(f) { return f.code || f.spn + '/' + f.fmi; }
function faultMeaning(f) {
  if (f.code) return FC_SYS[f.code.charAt(0)] + ' fault code';
  var fm = f.fmi === 31 ? 'condition exists' : FC_FMI[f.fmi];
  return (FC_SPN[f.spn] || 'SPN ' + f.spn) + (fm ? ' — ' + fm : '');
}
function addFault(job, f) {
  job.faults = job.faults || [];
  if (job.faults.some(function (x) { return fcSame(x, f); })) { toast(fcLabel(f) + ' is already on this operation'); return false; }
  pushUndo('fault code');
  job.faults.push(f.code ? { id: 'fc_' + uid(), code: f.code } : { id: 'fc_' + uid(), spn: f.spn, fmi: f.fmi });
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
function faultBar(job) {
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
  row.appendChild(el('button', { class: 'fltAdd' + (FC_ADD === job.id ? ' on' : ''), type: 'button', text: '+ code', title: 'Add a fault code',
    onClick: function (e) { e.stopPropagation(); FC_ADD = FC_ADD === job.id ? null : job.id; render();
      if (FC_ADD) requestAnimationFrame(function () { var i = R.querySelector('.fltIn'); if (i) i.focus(); }); } }));
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
    var fxn = navAllowed('fixes') ? fixCountFor(job) : 0;
    if (fxn) row.appendChild(el('button', { class: 'fltLink fxl', type: 'button', text: 'Fixed ' + fxn + '\u00d7 before', title: 'See the causes and fixes from earlier operations like this',
      onClick: function (e) { e.stopPropagation(); UI.view = 'fixes'; UI.fixKey = fixKeyOf(job.complaint); UI.fixQuery = ''; UI.fixAdd = false; persistUI(); tecRender(); window.scrollTo(0, 0); } }));
  } catch (err) {}
  bar.appendChild(row);
  if (FC_ADD === job.id) {
    var inp = el('input', { class: 'fltIn mono', type: 'text', placeholder: '111/1 or P0420', 'aria-label': 'Fault code: SPN/FMI, or a P, C, B or U code', autocomplete: 'off', spellcheck: 'false' });
    var prev = el('div', { class: 'fltPrev' });
    var addB = el('button', { class: 'fltPlus', type: 'button', text: 'Add ↵' });
    function paint() {
      var f = parseFault(inp.value);
      prev.innerHTML = '';
      if (!inp.value.trim()) { prev.appendChild(el('span', { class: 'fltHint', text: 'Type 111/1 (SPN/FMI) or P0420 (P, C, B, U)' })); addB.disabled = true; return; }
      if (!f) { prev.appendChild(el('span', { class: 'fltHint bad', text: 'Like 111/1 (FMI 0–31) or P0420' })); addB.disabled = true; return; }
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
