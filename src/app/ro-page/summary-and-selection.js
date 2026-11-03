/* Parsec · ro-page · summary-and-selection.js
   The work performed as one paragraph for warranty / triage (complaint, cause, correction), and the selection toolbar for marking text as a pill.
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   tcPlain tcCodes tcToks tcJac tcSentences tcRo tcEnd tcLower tcBuild openTechSummary pillAtCaret caretOffsetIn … (23 functions, 11 constants)
   state      ros
   uses       kit/ shell/ state/
   at load    on document selectionchange · on window scroll
*/
/* the work performed as one paragraph: no date / time stamps, lines joined */

/* ---------- warranty / triage summary: complaint, cause, correction — from this job and similar past jobs ---------- */
var TC_STOP = {};
('the a an and or of to for on in with at is was were be been not no yes unit truck check checked advise replace replaced repair repaired as needed per ' +
 'customer states state complaint job op operation found then also has have had it its this that from into out up down new old ' +
 'perform performed required require requires see seen will would could should can cannot may might one two three warranty replacement repairs service').split(' ').forEach(function (w) { TC_STOP[w] = 1; });
function tcPlain(html) {
  var d = document.createElement('div');
  d.innerHTML = String(html || '').replace(/<br\s*\/?>/gi, '\n').replace(/<\/(div|p)>/gi, '\n');
  return (d.textContent || '').replace(/\s*\u2014\s*\d{1,2}-\d{1,2}-\d{4}\s+\d{1,2}:\d{2}(:\d{2})?/g, '');
}
function tcCodes(t) {
  var out = [];
  DTC_FIND.forEach(function (p) {
    p.re.lastIndex = 0; var m;
    while ((m = p.re.exec(t))) { var c = (p.up ? m[0].toUpperCase() : m[0]).replace(/\s+/g, ' '); if (out.indexOf(c) === -1) out.push(c); }
  });
  return out;
}
function tcToks(t) {
  var o = {};
  String(t || '').toLowerCase().replace(/[^a-z0-9 ]+/g, ' ').split(/\s+/).forEach(function (w) {
    if (w.length >= 3 && !TC_STOP[w] && !/^\d+$/.test(w)) o[w.replace(/(ing|ed|es|s)$/, '')] = 1;
  });
  return o;
}
function tcJac(a, b) {
  var ka = Object.keys(a), kb = Object.keys(b); if (!ka.length || !kb.length) return 0;
  var inter = ka.filter(function (k) { return b[k]; }).length;
  return inter / (ka.length + kb.length - inter);
}
function tcSentences(t) {
  return String(t || '').split(/\n+/).reduce(function (acc, line) {
    return acc.concat(line.split(/(?<=[.!?])\s+(?=[A-Z])/));
  }, []).map(function (x) { return x.replace(/\s+/g, ' ').trim(); }).filter(function (x) { return x.length > 6; });
}
var TC_CAUSE = /\b(found|caus|due to|confirm|verif|test|measur|inspect|diagnos|pinpoint|trac|chaf|short|open|corro|leak|worn|fail|fault|damag|broke|loose|stuck|internal|out of spec|low|high|intermittent)/i;
var TC_FIX = /\b(replac|repair|install|clean|reprogram|updat|calibrat|seal|tighten|adjust|flash|rebuil|splice|torque|cleared|road test|re-?test|reset|bled|filled|topped)/i;
function tcRo(n) { n = String(n || ''); return /^R[AO][-\s]?\d/i.test(n) ? n : 'RO ' + n; }
function tcEnd(s) { s = s.replace(/\s+/g, ' ').trim(); return s && !/[.!?]$/.test(s) ? s + '.' : s; }
function tcLower(s) { return s ? s.charAt(0).toLowerCase() + s.slice(1) : s; }
function tcBuild(job) {
  var mine = tcPlain(job.work) + '\n' + (job.log || []).map(function (e) { return e.text || ''; }).join('\n');
  var codes = tcCodes((job.complaint || '') + '\n' + mine);
  var cTok = tcToks(job.complaint), wTok = tcToks(mine);
  /* similar past jobs: shared fault codes count most, then the complaint's words, then the notes */
  var sims = [];
  STATE.ros.forEach(function (ro) {
    (ro.operations || []).forEach(function (op) {
      if (op.id === job.id || ro.id === RO.id) return;
      var txt = tcPlain(op.work) + '\n' + (op.log || []).map(function (e) { return e.text || ''; }).join('\n');
      if (!txt.trim()) return;
      var oc = tcCodes((op.complaint || '') + '\n' + txt);
      var shared = oc.filter(function (c) { return codes.indexOf(c) !== -1; });
      var cj = tcJac(cTok, tcToks(op.complaint));
      if (!shared.length && cj < 0.2) return;
      var score = shared.length * 3 + cj * 6 + tcJac(wTok, tcToks(txt)) * 2;
      if (score >= 0.9) sims.push({ ro: ro, op: op, txt: txt, codes: oc, shared: shared, score: score });
    });
  });
  sims.sort(function (a, b) { return b.score - a.score; });
  sims = sims.slice(0, 3);
  var mineS = tcSentences(mine).filter(function (x) { return !/^(RO |Complaint:|Fault codes:|Cause:|Correction:|Parts required:|Labor:|Similar history:)/.test(x); });
  var cause = mineS.filter(function (x) { return TC_CAUSE.test(x) && !TC_FIX.test(x.split(/,|;/)[0]); }).slice(0, 3);
  var fix = mineS.filter(function (x) { return TC_FIX.test(x); }).slice(0, 4);
  var causeFrom = 'own', fixFrom = 'own';
  if (!cause.length && sims.length) {
    sims.some(function (s) { var c = tcSentences(s.txt).filter(function (x) { return TC_CAUSE.test(x); }); if (c.length) { cause = c.slice(0, 2); return true; } return false; });
    causeFrom = cause.length ? 'similar' : 'none';
  }
  if (!fix.length && sims.length) {
    sims.some(function (s) { var f = tcSentences(s.txt).filter(function (x) { return TC_FIX.test(x); }); if (f.length) { fix = f.slice(0, 2); return true; } return false; });
    fixFrom = fix.length ? 'similar' : 'none';
  }
  var parts = (job.parts || []).filter(function (p) { return p.description || p.partNumber; }).map(function (p) {
    return (p.qty && String(p.qty) !== '1' ? p.qty + ' x ' : '') + (p.description || 'part') + (p.partNumber ? ' (P/N ' + p.partNumber + ')' : '');
  });
  var c = jobCalc(job);
  var out = [];
  var idBits = [tcRo(RO.roNumber)];
  if (RO.vin) idBits.push('VIN ' + RO.vin);
  if (RO.mileage) idBits.push(Number(String(RO.mileage).replace(/,/g, '')).toLocaleString() + ' mi');
  if (RO.unitNumber) idBits.push('unit ' + RO.unitNumber);
  out.push(idBits.join(', ') + '.');
  out.push('Complaint: ' + tcEnd(job.complaint || 'not recorded'));
  if (codes.length) out.push('Fault codes: ' + codes.join(', ') + '.');
  if (cause.length) out.push('Cause: ' + (causeFrom === 'similar' ? 'based on similar repairs, likely ' + tcLower(cause.map(tcEnd).join(' ')) : cause.map(tcEnd).join(' ')));
  else out.push('Cause: to be confirmed by diagnosis.');
  if (fix.length) out.push('Correction: ' + (fixFrom === 'similar' ? 'recommended per similar repairs \u2014 ' + tcLower(fix.map(tcEnd).join(' ')) : fix.map(tcEnd).join(' ')));
  else out.push('Correction: repairs to be determined after diagnosis.');
  if (parts.length) out.push('Parts required: ' + parts.join('; ') + '.');
  if (c.b > 0 || num(job.quoted) > 0) out.push('Labor: ' + fx(c.b) + ' h used of ' + fx(num(job.quoted)) + ' h quoted.');
  if (sims.length) out.push('Similar history: ' + sims.map(function (s) {
    return tcRo(s.ro.roNumber) + ' \u2014 ' + (s.op.complaint || 'operation') + (s.shared.length ? ' (' + s.shared.join(', ') + ')' : '');
  }).join('; ') + '.');
  return { cause: cause, fix: fix, text: out.join(' '), codes: codes, sims: sims, causeFrom: causeFrom, fixFrom: fixFrom, own: mineS.length };
}
function openTechSummary(job, work) {
  var g = tcBuild(job);
  var ta = el('textarea', { class: 'xpText tcText', rows: '9' }); ta.value = g.text;
  var info = [];
  info.push(g.own ? 'This operation\u2019s notes' : 'No notes on this operation yet');
  info.push(g.codes.length + ' fault code' + (g.codes.length === 1 ? '' : 's'));
  info.push(g.sims.length ? g.sims.length + ' similar past operation' + (g.sims.length === 1 ? '' : 's') : 'no similar past operations');
  var simList = el('div', { class: 'tcSims' }, g.sims.map(function (s) {
    return el('div', { class: 'tcSim' }, [el('b', { class: 'mono', text: tcRo(s.ro.roNumber) }), el('span', { text: s.op.complaint || '' }),
      s.shared.length ? el('span', { class: 'tcShared mono', text: s.shared.join(', ') }) : null]);
  }));
  modal({ title: 'Complaint \u00b7 cause \u00b7 correction \u2014 warranty & triage draft', body: [
    el('div', { class: 'xpWrap' }, [
      el('div', { class: 'xpStatus', text: 'Built from: ' + info.join(' \u00b7 ') + '. Check it before it goes on a claim \u2014 edit freely.' }),
      ta, g.sims.length ? simList : null])
  ], actions: [
    { label: 'Cancel' },
    { label: 'Copy', run: function () { copyText(ta.value.trim()).then(function () { toast('Summary copied'); }); } },
    { label: 'Add to work performed', kind: 'primary', run: function () {
      var txt = ta.value.trim(); if (!txt) return;
      pushUndo('add warranty summary');
      var esc2 = function (x) { return x.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); };
      job.work = (job.work ? job.work.replace(/(<br\s*\/?>\s*)+$/i, '') + '<br>' : '') + esc2(txt) + '<br>';
      save(true); render();
      requestAnimationFrame(function () {
        var i = S.jobs.indexOf(job), cd = cardEl(i), w = cd && cd.querySelector('.work');
        if (w && scanCodes(w)) { job.work = w.innerHTML; save(); }
      });
      toast('Summary added to work performed', { label: 'UNDO', run: function () { restoreSnapshot(); } });
    } }
  ] });
  var mw = R.getElementById('modalWrap'), mbx = mw && mw.querySelector('.modalBox'); if (mbx) mbx.classList.add('xpBox');
  setTimeout(function () { ta.focus(); ta.setSelectionRange(0, 0); }, 30);
}

/* where the caret sits inside a pill (if it does) */
function pillAtCaret(work) {
  var sel = SEL(); if (!sel.rangeCount) return null;
  var r = sel.getRangeAt(0); if (!r.collapsed) return null;
  var n = r.startContainer, e0 = n.nodeType === 3 ? n.parentNode : n;
  var pill = e0 && e0.closest ? e0.closest('.dtcPill') : null;
  if (!pill || !work.contains(pill)) return null;
  var pre = document.createRange(); pre.selectNodeContents(pill); pre.setEnd(r.startContainer, r.startOffset);
  return { pill: pill, off: pre.toString().length, len: pill.textContent.length };
}
var DTC_WHOLE = DTC_FIND.map(function (p) { return new RegExp('^\\s*(?:' + p.re.source + ')\\s*$', 'i'); });
function caretOffsetIn(work) {
  var sel = SEL(); if (!sel.rangeCount || !work.contains(sel.getRangeAt(0).startContainer)) return null;
  var r0 = sel.getRangeAt(0).cloneRange(); r0.selectNodeContents(work); r0.setEnd(sel.getRangeAt(0).startContainer, sel.getRangeAt(0).startOffset);
  return r0.toString().length;
}
function caretRestoreIn(work, off) {
  if (off == null) return;
  var w = document.createTreeWalker(work, NodeFilter.SHOW_TEXT, null), left = off, t, sel = SEL();
  while ((t = w.nextNode())) {
    if (left <= t.textContent.length) { var r = document.createRange(); r.setStart(t, left); r.collapse(true); sel.removeAllRanges(); sel.addRange(r); return; }
    left -= t.textContent.length;
  }
}
/* an auto-detected code pill whose text is no longer a code (you backspaced into it, or typed past it) turns back into plain text */
function fixBrokenPills(work) {
  var bad = Array.prototype.filter.call(work.querySelectorAll('.dtcPill'), function (p) {
    var t = p.textContent;
    if (!t.replace(/​/g, '').trim()) return true;
    return p.classList.contains('code') && !DTC_WHOLE.some(function (re) { return re.test(t); });
  });
  if (!bad.length) return false;
  var off = caretOffsetIn(work);
  bad.forEach(function (p) { var par = p.parentNode; while (p.firstChild) par.insertBefore(p.firstChild, p); par.removeChild(p); });
  work.normalize();
  caretRestoreIn(work, off);
  return true;
}
function workPlainText(work) {
  var t = (work.innerText || work.textContent || '');
  return t.split(/\n+/).map(function (l) {
    return l.replace(/\s*\u2014\s*\d{1,2}-\d{1,2}-\d{4}\s+\d{1,2}:\d{2}(:\d{2})?\s*/g, ' ').replace(/\s+/g, ' ').trim();
  }).filter(Boolean).map(function (l) { return /[.!?]$/.test(l) ? l : l + '.'; }).join(' ');
}
function copyText(txt) {
  if (navigator.clipboard && navigator.clipboard.writeText) return navigator.clipboard.writeText(txt).catch(function () { return copyFallback(txt); });
  return Promise.resolve(copyFallback(txt));
}
function copyFallback(txt) {
  var ta = document.createElement('textarea'); ta.value = txt; ta.style.position = 'fixed'; ta.style.opacity = '0';
  document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); } catch (e) {} ta.remove();
}
var TEXT_CMDS = [
  { cmd: 'bold', label: 'B', title: 'Bold', style: 'font-weight:800' },
  { cmd: 'italic', label: 'I', title: 'Italic', style: 'font-style:italic' },
  { cmd: 'underline', label: 'U', title: 'Underline', style: 'text-decoration:underline' },
  { cmd: 'strikeThrough', label: 'S', title: 'Strikethrough', style: 'text-decoration:line-through' }
];
var PILL_COLORS = [
  { key: 'amber',  bg: '#FDF3E2', fg: '#8A6316' },
  { key: 'green',  bg: '#E4F0E9', fg: C.green },
  { key: 'red',    bg: '#FBE4E1', fg: C.red },
  { key: 'grey',   bg: '#E7E5ED', fg: '#414C5A' },
  { key: 'blue',   bg: '#E7F0FC', fg: '#1757A5' },
  { key: 'purple', bg: '#EEE7FB', fg: '#5B3EA6' },
  { key: 'teal',   bg: '#DEF4F3', fg: '#0F766E' },
  { key: 'orange', bg: '#FDE9D9', fg: '#B4530A' },
  { key: 'pink',   bg: '#FBE3EE', fg: '#B0316B' }
];
var TEXT_SIZES = [
  { label: 'S', px: 11 }, { label: 'M', px: 13 }, { label: 'L', px: 16 }, { label: 'XL', px: 20 }
];
var TEXT_COLORS = [
  { key: 'ink', hex: '#0F151C' }, { key: 'blue', hex: '#1757A5' }, { key: 'green', hex: C.green },
  { key: 'red', hex: C.red }, { key: 'amber', hex: '#A45308' }
];
var TEXT_OPACITY = [
  { label: '100%', val: 1 }, { label: '70%', val: .7 }, { label: '40%', val: .4 }
];

/* Undo a pill back to plain text — keeps whatever was inside it (including any
   nested size/color spans from the highlight toolbar) instead of just the raw text. */
function unwrapPill(pill) {
  var parent = pill.parentNode;
  if (!parent) return;
  while (pill.firstChild) parent.insertBefore(pill.firstChild, pill);
  parent.removeChild(pill);
  parent.normalize();
  pill.dispatchEvent(new Event('dtcColorChange', { bubbles: true }));
}

function openPillMenu(pill) {
  var old = R.getElementById('pillColorMenu');
  if (old) old.remove();
  var rect = pill.getBoundingClientRect();
  var menu = el('div', { id: 'pillColorMenu',
    style: 'position:fixed;left:' + Math.round(rect.left) + 'px;top:' + Math.round(rect.bottom + 6) +
           'px;display:flex;align-items:center;gap:8px;padding:8px;background:var(--menu-bg);border:1px solid var(--line-3);border-radius:calc(8px * var(--rs, 1));box-shadow:var(--drop, 0 8px 22px rgba(18,23,30,.18));z-index:400' });
  PILL_COLORS.forEach(function (c) {
    var sw = el('button', { type: 'button', title: c.key,
      style: 'width:22px;height:22px;border-radius:50%;padding:0;cursor:pointer;box-shadow:0 0 0 1px var(--line-3);background:' + c.bg +
             ';border:2px solid ' + (pill.dataset.color === c.key ? 'var(--ink-strong)' : 'var(--menu-bg)'),
      onClick: function (e) {
        e.stopPropagation();
        pill.dataset.color = c.key; pill.style.background = c.bg; pill.style.color = c.fg;
        menu.remove();
        pill.dispatchEvent(new Event('dtcColorChange', { bubbles: true }));
      } });
    menu.appendChild(sw);
  });
  menu.appendChild(el('span', { style: 'width:1px;align-self:stretch;background:var(--line-3);flex-shrink:0' }));
  menu.appendChild(el('button', { type: 'button', html: IC.eraser, title: 'Remove this pill, keep the text', 'aria-label': 'Remove pill',
    style: 'border:0;background:transparent;color:var(--ink-icon);font:inherit;font-size:11px;font-weight:600;cursor:pointer;padding:2px 8px;border-radius:calc(4px * var(--rs, 1));',
    onClick: function (e) { e.stopPropagation(); unwrapPill(pill); menu.remove(); } }));
  R.appendChild(menu);
  setTimeout(function () {
    document.addEventListener('click', function closeOnce(e) {
      var t0 = (e.composedPath && e.composedPath()[0]) || e.target;
      if (!menu.contains(t0)) { menu.remove(); document.removeEventListener('click', closeOnce); }
    });
  }, 0);
}

/* ---------- manual selection -> pill toolbar ---------- */

var selToolbar = null, selToolbarCtx = null;   /* ctx: {job, work} */

function hideSelToolbar() {
  if (selToolbar && selToolbar.parentNode) selToolbar.remove();
  selToolbar = null; selToolbarCtx = null;
}

function wrapRangeAsPill(range, colorKey) {
  if (!range || range.collapsed) return null;
  var c = PILL_COLORS.filter(function (x) { return x.key === colorKey; })[0] || PILL_COLORS[0];
  var pill = document.createElement('span');
  pill.className = 'dtcPill';
  pill.dataset.color = c.key; pill.style.background = c.bg; pill.style.color = c.fg;
  pill.addEventListener('click', function (ev) { ev.stopPropagation(); openPillMenu(pill); });
  try {
    var frag = range.extractContents();
    if (!frag.textContent.trim()) return null;
    pill.appendChild(frag);
    range.insertNode(pill);
  } catch (e) { return null; }
  return pill;
}

/* generic "wrap the selection in a plain styled span" — used for size / color / transparency,
   same extract-and-reinsert approach as the pill wrapper above so nested pills survive intact */
function wrapRangeWithStyle(range, styleStr) {
  if (!range || range.collapsed) return null;
  var span = document.createElement('span');
  span.setAttribute('style', styleStr);
  try {
    var frag = range.extractContents();
    if (!frag.textContent.trim()) return null;
    span.appendChild(frag);
    range.insertNode(span);
  } catch (e) { return null; }
  return span;
}

function showSelToolbarFor(range) {
  if (selToolbar && selToolbar.parentNode) selToolbar.remove();
  selToolbar = null;
  var ctx = selToolbarCtx;
  if (!ctx) return;
  var rect = range.getBoundingClientRect();
  if (!rect || (!rect.width && !rect.height)) return;
  var savedRange = range.cloneRange();
  var bar = el('div', {
    style: 'position:fixed;left:' + Math.round(rect.left + rect.width / 2) + 'px;top:' + Math.round(rect.top - 8) +
           'px;transform:translate(-50%,-100%);display:flex;align-items:center;gap:8px;padding:8px;max-width:360px;flex-wrap:wrap;' +
           'background:var(--menu-bg);border:1px solid var(--line-3);border-radius:calc(8px * var(--rs, 1));box-shadow:var(--drop, 0 8px 22px rgba(18,23,30,.18));z-index:400'
  });

  function commitWrap(styleStr) {
    var span = wrapRangeWithStyle(savedRange, styleStr);
    if (span && ctx) { ctx.job.work = ctx.work.innerHTML; save(); }
    hideSelToolbar();
    SEL().removeAllRanges();
  }
  /* undo size/color/opacity/bold/italic spans over the selection — pills have their own
     "Clear" (click the pill). Works purely off the range captured when the toolbar opened,
     rather than re-reading the live selection after execCommand — that hand-off was the
     reason this used to fail intermittently (execCommand doesn't reliably leave the
     selection where you'd expect it to be). */
  function clearFormatting() {
    if (!savedRange || savedRange.collapsed) { hideSelToolbar(); return; }
    try {
      var frag = savedRange.extractContents();
      var toUnwrap = frag.querySelectorAll ? frag.querySelectorAll('span:not(.dtcPill), b, i, u, strike, font, strong, em') : [];
      Array.prototype.forEach.call(toUnwrap, function (elx) {
        var parent = elx.parentNode;
        while (elx.firstChild) parent.insertBefore(elx.firstChild, elx);
        parent.removeChild(elx);
      });
      savedRange.insertNode(frag);
      if (ctx) { ctx.job.work = ctx.work.innerHTML; save(); }
    } catch (e) {}
    hideSelToolbar();
    SEL().removeAllRanges();
  }
  function divider() { return el('span', { style: 'width:1px;align-self:stretch;background:var(--line-3);flex-shrink:0' }); }
  function groupLabel(text) { return el('span', { style: 'font-size:11px;font-weight:700;letter-spacing:.08em;color:var(--hint);margin-right:1px', text: text }); }

  bar.appendChild(el('button', { type: 'button', title: 'Clear formatting — back to plain text',
    style: 'height:22px;border-radius:calc(4px * var(--rs, 1));padding:0 8px;cursor:pointer;border:1px solid var(--line-3);' +
           'background:var(--menu-bg);color:var(--ink-icon);font-size:11px;font-weight:700;line-height:1;',
    onMousedown: function (e) { e.preventDefault(); },
    onClick: function (e) { e.stopPropagation(); clearFormatting(); } }, [el('span', { class: 'jcIco', html: IC.eraser })]));
  bar.appendChild(divider());

  TEXT_CMDS.forEach(function (t) {
    bar.appendChild(el('button', { type: 'button', title: t.title,
      style: 'width:22px;height:22px;border-radius:calc(4px * var(--rs, 1));padding:0;cursor:pointer;border:1px solid var(--line-3);' +
             'background:var(--menu-bg);color:var(--ink-soft);font-size:12px;font-family:Georgia,serif;line-height:1;' + t.style,
      onMousedown: function (e) { e.preventDefault(); },
      onClick: function (e) {
        e.stopPropagation();
        document.execCommand(t.cmd, false, null);
        if (ctx) { ctx.job.work = ctx.work.innerHTML; save(); }
      } }, [t.label]));
  });

  bar.appendChild(divider());
  bar.appendChild(groupLabel('SIZE'));
  TEXT_SIZES.forEach(function (s) {
    bar.appendChild(el('button', { type: 'button', title: s.label + ' text',
      style: 'min-width:22px;height:22px;border-radius:calc(4px * var(--rs, 1));padding:0 4px;cursor:pointer;border:1px solid var(--line-3);' +
             'background:var(--menu-bg);color:var(--ink-soft);font-weight:700;font-size:' + Math.min(s.px, 14) + 'px;line-height:1;',
      onMousedown: function (e) { e.preventDefault(); },
      onClick: function (e) { e.stopPropagation(); commitWrap('font-size:' + s.px + 'px'); } }, [s.label]));
  });

  bar.appendChild(divider());
  bar.appendChild(groupLabel('COLOR'));
  TEXT_COLORS.forEach(function (c) {
    bar.appendChild(el('button', { type: 'button', title: 'Text color — ' + c.key,
      style: 'width:20px;height:20px;border-radius:50%;padding:0;cursor:pointer;box-shadow:0 0 0 1px var(--line-3);background:' + c.hex + ';border:2px solid var(--menu-bg)',
      onMousedown: function (e) { e.preventDefault(); },
      onClick: function (e) { e.stopPropagation(); commitWrap('color:' + c.hex); } }));
  });

  bar.appendChild(divider());
  bar.appendChild(groupLabel('FADE'));
  TEXT_OPACITY.forEach(function (o) {
    bar.appendChild(el('button', { type: 'button', title: o.label + ' opacity',
      style: 'min-width:22px;height:22px;border-radius:calc(4px * var(--rs, 1));padding:0 4px;cursor:pointer;border:1px solid var(--line-3);' +
             'background:var(--menu-bg);color:var(--ink-soft);font-size:11px;font-weight:700;opacity:' + o.val + ';line-height:1;',
      onMousedown: function (e) { e.preventDefault(); },
      onClick: function (e) { e.stopPropagation(); commitWrap('opacity:' + o.val); } }, [o.label]));
  });

  bar.appendChild(divider());
  bar.appendChild(groupLabel('PILL'));
  PILL_COLORS.forEach(function (c) {
    bar.appendChild(el('button', { type: 'button', title: 'Make pill — ' + c.key,
      style: 'width:20px;height:20px;border-radius:50%;padding:0;cursor:pointer;box-shadow:0 0 0 1px var(--line-3);background:' + c.bg + ';border:2px solid var(--menu-bg)',
      onMousedown: function (e) { e.preventDefault(); },
      onClick: function (e) {
        e.stopPropagation();
        var pill = wrapRangeAsPill(savedRange, c.key);
        if (pill && ctx) {
          pill.addEventListener('dtcColorChange', function () { ctx.job.work = ctx.work.innerHTML; save(); });
          ctx.job.work = ctx.work.innerHTML; save();
        }
        hideSelToolbar();
        SEL().removeAllRanges();
      } }));
  });
  R.appendChild(bar);
  selToolbar = bar;
}

document.addEventListener('selectionchange', function () {
  if (!selToolbarCtx) return;
  var sel = SEL();
  if (!sel.rangeCount || sel.isCollapsed) { hideSelToolbar(); return; }
  var range = sel.getRangeAt(0);
  if (!selToolbarCtx.work.contains(range.commonAncestorContainer)) hideSelToolbar();
});
window.addEventListener('scroll', function () { hideSelToolbar(); }, true);
