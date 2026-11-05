/* Parsec · ro-page · messages-chat.js
   Messages above the operations (17.2; the Customer tab left in 17.3): the RO's messages as a chat (bubbles or lines, To and @ for anyone in the shop, files and the operation, a seen dot, quick lines by role).
   Flow: ropBuild puts ropMC() above Operations; sending goes through IB.send and redraws.
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   ropCalm ropChatLines ropMsgs ropMC ropRoleOf ropDayLbl ropMenText ropMsgMine ropChat ropBubble ropPeople ropComposer … (14 functions, 3 constants)
   uses       access/ kit/ pages/inbox/ shell/
*/
/* ---------- the box ---------- */
var ROPC = { lines: null, mine: false, files: [], op: undefined, draft: '', saved: null };
var ROPC_EASE = 'cubic-bezier(.23,1,.32,1)';
function ropCalm() { try { return matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; } }
function ropChatLines() { if (ROPC.lines === null) { try { ROPC.lines = localStorage.getItem('rop_chat_lines') === '1'; } catch (e) { ROPC.lines = false; } } return ROPC.lines; }
function ropMsgs() {
  var L = []; try { L = IB.store().items.filter(function (n) { return n.ro === RO.id && !(n.x && n.x.mof); }); } catch (e) {}
  return L.slice().sort(function (a, b) { return new Date(a.at) - new Date(b.at); });
}
function ropMC() {
  var L = ropMsgs();
  /* 17.3: the Customer tab is gone — the customer's fields are in the right column's Customer group */
  var head = el('div', { class: 'px-sec rop-sech rop-mc__h' }, [el('h3', { text: 'Messages' })].concat(L.length ? [el('span', { class: 'n', text: String(L.length) })] : []));
  var body = el('div', { class: 'rop-mc__body' }, [ropChat(L)]);
  return el('section', { class: 'rop-blk rop-k-mc rop-mc' }, [head, body]);
}
/* ---------- the chat ---------- */
function ropRoleOf(n) { try { var s = staffForTech(n); return s ? s.role : ''; } catch (e) { return ''; } }
function ropDayLbl(t) { var d = new Date(t), now = new Date(); if (d.toDateString() === now.toDateString()) return 'Today'; var y = new Date(now); y.setDate(now.getDate() - 1); if (d.toDateString() === y.toDateString()) return 'Yesterday'; return d.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' }); }
function ropMenText(t) { return esc(t).replace(/(^|\s)@([A-Z][\w'’-]*(?: [A-Z][\w'’-]*)?)/g, '$1<span class="rop-men">@$2</span>'); }
function ropMsgMine(n) { return ropIsMe(n.from) || ropIsMe(n.to) || (n.x && Array.isArray(n.x.men) && n.x.men.some(ropIsMe)); }
function ropChat(L) {
  var lines = ropChatLines(), pane = el('div', { class: 'rop-chat rop-k-inbox' + (lines ? ' is-lines' : '') });
  var all = el('button', { class: 'rop-cf' + (!ROPC.mine ? ' is-on' : ''), type: 'button', text: 'All', onClick: function (e) { e.stopPropagation(); ROPC.mine = false; render(); } });
  var mine = el('button', { class: 'rop-cf' + (ROPC.mine ? ' is-on' : ''), type: 'button', text: 'Only mine', title: 'Only messages to you, from you, or that mention you', onClick: function (e) { e.stopPropagation(); ROPC.mine = true; render(); } });
  function vb(l, label, ico) { return el('button', { class: 'rop-cv' + (lines === l ? ' is-on' : ''), type: 'button', title: label, 'aria-label': label, 'aria-pressed': lines === l ? 'true' : 'false', html: ico,
    onClick: function (e) { e.stopPropagation(); ROPC.lines = l; try { localStorage.setItem('rop_chat_lines', l ? '1' : '0'); } catch (er) {} render(); } }); }
  var view = el('span', { class: 'rop-cvs' }, [vb(false, 'Show as bubbles', pxI('chat', 14)), vb(true, 'Show as lines', '<svg class="px-ico" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><path d="M5 7h14M5 12h14M5 17h9"/></svg>')]);
  pane.appendChild(el('div', { class: 'rop-chat__tools' }, [el('span', { class: 'rop-cfs' }, [all, mine]), view]));
  var shown = ROPC.mine ? L.filter(ropMsgMine) : L;
  var lim = ROPU.msgAll ? 300 : 8, cut = Math.max(0, shown.length - lim);
  var list = el('div', { class: 'rop-chat__list', role: 'log', 'aria-label': 'Messages about this RO' });
  if (cut) list.appendChild(el('button', { class: 'rop-more2', type: 'button', text: 'Show ' + cut + ' earlier', onClick: function (e) { e.stopPropagation(); ROPU.msgAll = true; render(); } }));
  var lastDay = '';
  shown.slice(cut).forEach(function (n) {
    var dl = ropDayLbl(n.at); if (dl !== lastDay) { lastDay = dl; list.appendChild(el('div', { class: 'rop-day', text: dl })); }
    list.appendChild(ropBubble(n));
  });
  if (!shown.length) list.appendChild(ropNone(ROPC.mine ? 'Nothing to or from you on this RO yet.' : 'No messages about this RO yet — the first one starts the thread.'));
  pane.appendChild(list);
  pane.appendChild(ropComposer());
  return pane;
}
function ropBubble(n) {
  var me = ropIsMe(n.from), st = {}; try { st = IB.store().st[n.id] || {}; } catch (e) {}
  var text = n.q || n.t || '', job = n.op ? S.jobs.filter(function (j) { return j.id === n.op; })[0] : null;
  var files = n.x && Array.isArray(n.x.files) ? n.x.files : [];
  var fresh = me && Date.now() - new Date(n.at) < 4000;
  var meta = [esc(ropClk(n.at))];
  if (n.to && !ropIsMe(n.to)) meta.push('to ' + esc(ropFirst(n.to)));
  var foot = el('small', { class: 'rop-msg__m', html: meta.join(' · ') });
  if (job) foot.appendChild(el('button', { class: 'rop-opc', type: 'button', text: 'Op ' + ropN(job), title: 'Open Op ' + ropN(job) + ' — ' + (job.complaint || ''), onClick: function (e) { e.stopPropagation(); S.ui.card = job.id; save(); render(); } }));
  if (me) foot.appendChild(el('i', { class: 'rop-seen' + (st.read ? ' is-read' : ''), title: st.read ? 'Seen by ' + ropFirst(n.to) : 'Not seen yet', 'aria-label': st.read ? 'Seen' : 'Not seen yet' }));
  var bub = el('div', { class: 'rop-msg__b' }, [
    el('span', { class: 'rop-msg__w', html: '<b>' + esc(me ? 'You' : ropFirst(n.from)) + '</b>' + (ropRoleOf(n.from) ? '<em>' + esc(ropRoleOf(n.from)) + '</em>' : '') }),
    el('span', { class: 'rop-msg__t', html: ropMenText(text) })]);
  files.forEach(function (nm) {
    bub.appendChild(el('button', { class: 'rop-msg__f', type: 'button', html: pxI('clip', 12) + '<span>' + esc(nm) + '</span>', title: 'Open ' + nm, onClick: function (e) { e.stopPropagation(); var f = allFiles().filter(function (x) { return x.f.name === nm; })[0]; if (f) openAttachments(f.f.id); else toast('That file isn’t on this RO any more.'); } }));
  });
  bub.appendChild(foot);
  return el('div', { class: 'rop-msg' + (me ? ' is-me' : '') + (fresh ? ' is-sent' : ''), 'data-key': 'msg-' + n.id }, [me ? null : el('span', { class: 'rop-msg__av', html: ropAv(n.from) }), bub]);
}
/* who can be messaged: the RO's own people first, then everyone else in the shop */
function ropPeople() {
  var ro = [[ropPerson('Foreman'), 'Foreman'], [ropPerson('Parts'), 'Parts'], [ropWriter() || RO.createdBy || '', 'Advisor'], [RO.assignedTech || '', 'Technician']].filter(function (x) { return x[0] && !ropIsMe(x[0]); });
  var seen = {}; ro = ro.filter(function (x) { var k = x[0].toLowerCase(); if (seen[k]) return false; seen[k] = 1; return true; });
  var rest = []; try { rest = staffList().filter(function (s) { return s && s.name && !ropIsMe(s.name) && !seen[s.name.toLowerCase()]; }).map(function (s) { return [s.name, s.role || '']; }); } catch (e) {}
  rest.sort(function (a, b) { return (a[1] || '').localeCompare(b[1] || '') || a[0].localeCompare(b[0]); });
  return { ro: ro, rest: rest, all: ro.concat(rest) };
}
var ROP_QUICK = {
  Technician: ['Parts in?', 'Approved?', 'Need the foreman', 'Road test next'],
  Parts: ['Parts are in', 'On order — ETA tomorrow', 'Core goes back', 'Which part number?'],
  'Service writer': ['Approved', 'Waiting on the customer', 'Customer called', 'Estimate sent'],
  Foreman: ['Status?', 'Start this next', 'Hold for now', 'Road test it'],
  Manager: ['Status?', 'Start this next', 'Hold for now', 'Call me'],
  Triage: ['Ready for road test?', 'Checks done', 'Keys at the desk', 'Customer is here'],
  'Warranty admin': ['Claim filed', 'Need the codes', 'Need photos', 'Approved by Volvo']
};
function ropComposer() {
  var P = ropPeople(), me = ropMe(), role = ropRoleOf(me) || 'Technician';
  if (!ROPU.msgTo || !P.all.some(function (x) { return x[0] === ROPU.msgTo; })) ROPU.msgTo = P.all.length ? P.all[0][0] : '';
  var box = el('div', { class: 'rop-comp' });
  if (!P.all.length) { box.appendChild(ropNone('No one else is set up in the shop yet.')); return box; }
  var q = el('div', { class: 'rop-quick' }, (ROP_QUICK[role] || ROP_QUICK.Technician).map(function (t) {
    return el('button', { class: 'rop-qc', type: 'button', text: t, onClick: function (e) { e.stopPropagation(); inp.value = t; ROPC.draft = t; inp.focus(); } });
  }));
  var to = el('button', { class: 'rop-tob', type: 'button', 'aria-haspopup': 'menu', title: 'Who it goes to — anyone in the shop', html: 'To · <b>' + esc(ropFirst(ROPU.msgTo)) + '</b>' + pxI('chevD', 11) });
  to.addEventListener('click', function (e) {
    e.stopPropagation();
    var pop = el('div', { class: 'px-pop rop-pop rop-topop', role: 'menu' });
    function grp(t, L) { if (!L.length) return; pop.appendChild(el('div', { class: 'rop-poph', html: '<b>' + esc(t) + '</b>' })); L.forEach(function (x) {
      pop.appendChild(pxMenuItem(null, x[0] + (x[1] ? ' · ' + x[1] : ''), { on: x[0] === ROPU.msgTo, tick: x[0] === ROPU.msgTo, run: function () { ROPU.msgTo = x[0]; render(); requestAnimationFrame(function () { var i = R.querySelector('.rop-in__i'); if (i) i.focus(); }); } })); }); }
    grp('On this RO', P.ro); grp('Everyone', P.rest);
    pxPop(to, pop, {});
  });
  var curOp = ROPC.op === undefined ? S.ui.card : ROPC.op, job = curOp ? S.jobs.filter(function (j) { return j.id === curOp; })[0] : null;
  var opc = el('button', { class: 'rop-opt' + (job ? ' is-on' : ''), type: 'button', title: job ? 'About Op ' + ropN(job) + ' — click to leave it off' : 'Tie it to the open operation', text: job ? 'Op ' + ropN(job) : '+ Op',
    onClick: function (e) { e.stopPropagation(); ROPC.op = job ? null : (S.ui.card || (S.jobs[0] && S.jobs[0].id) || null); ROPC.draft = inp.value; render(); requestAnimationFrame(function () { var i = R.querySelector('.rop-in__i'); if (i) i.focus(); }); } });
  var fi = el('input', { type: 'file', multiple: 'multiple', class: 'rop-file', 'aria-hidden': 'true', tabindex: '-1' });
  fi.addEventListener('change', function () { Array.prototype.forEach.call(fi.files || [], function (f) { ROPC.files.push(f); }); ROPC.draft = inp.value; render(); });
  var clip = el('button', { class: 'rop-clip', type: 'button', title: 'Attach a file or a picture', 'aria-label': 'Attach a file', html: pxI('clip', 15), onClick: function (e) { e.stopPropagation(); fi.click(); } });
  var staged = el('div', { class: 'rop-staged' }, ROPC.files.map(function (f, i) {
    return el('span', { class: 'rop-sf' }, [el('span', { text: f.name || 'Screenshot' }), el('button', { type: 'button', class: 'rop-sfx', title: 'Leave it off', 'aria-label': 'Remove ' + (f.name || 'file'), html: pxI('x', 11), onClick: function (e) { e.stopPropagation(); ROPC.files.splice(i, 1); ROPC.draft = inp.value; render(); } })]);
  }));
  var inp = el('input', { class: 'rop-in__i', placeholder: 'Message about ' + (RO.roNumber || 'this RO') + '… @ mentions · Enter sends', 'aria-label': 'Message', value: ROPC.draft || '' });
  var sug = el('div', { class: 'rop-sug', role: 'listbox', hidden: 'hidden' });
  function atWord() { var v = inp.value.slice(0, inp.selectionStart == null ? inp.value.length : inp.selectionStart), m = /(^|\s)@([\w'’-]*)$/.exec(v); return m ? { q: m[2].toLowerCase(), at: v.length - m[2].length - 1 } : null; }
  function showSug() {
    var w = atWord(); sug.innerHTML = '';
    if (!w) { sug.hidden = true; return; }
    var L = P.all.filter(function (x) { return !w.q || x[0].toLowerCase().indexOf(w.q) === 0 || x[0].toLowerCase().indexOf(' ' + w.q) > 0; }).slice(0, 6);
    if (!L.length) { sug.hidden = true; return; }
    L.forEach(function (x, i) { sug.appendChild(el('button', { class: 'rop-sg' + (i === 0 ? ' is-on' : ''), type: 'button', role: 'option', 'data-n': x[0], html: ropAv(x[0]) + '<span>' + esc(x[0]) + '</span><small>' + esc(x[1]) + '</small>',
      onMousedown: function (e) { e.preventDefault(); }, onClick: function (e) { e.stopPropagation(); pick(x[0]); } })); });
    sug.hidden = false;
  }
  function pick(name) { var w = atWord(); if (!w) return; var end = inp.selectionStart == null ? inp.value.length : inp.selectionStart; inp.value = inp.value.slice(0, w.at) + '@' + name + ' ' + inp.value.slice(end); ROPC.draft = inp.value; sug.hidden = true; inp.focus(); }
  inp.addEventListener('input', function () { ROPC.draft = inp.value; showSug(); });
  inp.addEventListener('blur', function () { setTimeout(function () { sug.hidden = true; }, 120); });
  inp.addEventListener('paste', function (e) {
    var it = e.clipboardData && e.clipboardData.items ? Array.prototype.slice.call(e.clipboardData.items) : [], imgs = it.filter(function (x) { return x.kind === 'file'; });
    if (!imgs.length) return; e.preventDefault(); e.stopPropagation();
    imgs.forEach(function (x, i) { var f = x.getAsFile(); if (!f) return; try { f = new File([f], 'Screenshot ' + new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }).replace(/[:\s]/g, '') + (i ? '-' + i : '') + '.png', { type: f.type || 'image/png' }); } catch (er) {} ROPC.files.push(f); });
    ROPC.draft = inp.value; render(); requestAnimationFrame(function () { var i2 = R.querySelector('.rop-in__i'); if (i2) i2.focus(); });
  });
  inp.addEventListener('keydown', function (e) {
    e.stopPropagation();
    if (!sug.hidden && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) { e.preventDefault(); var B = sug.querySelectorAll('.rop-sg'), k = Array.prototype.findIndex.call(B, function (b) { return b.classList.contains('is-on'); }); if (B[k]) B[k].classList.remove('is-on'); k = (k + (e.key === 'ArrowDown' ? 1 : B.length - 1)) % B.length; B[k].classList.add('is-on'); return; }
    if (!sug.hidden && (e.key === 'Enter' || e.key === 'Tab')) { var on = sug.querySelector('.rop-sg.is-on'); if (on) { e.preventDefault(); pick(on.getAttribute('data-n')); return; } }
    if (e.key === 'Escape') { sug.hidden = true; return; }
    if (e.key !== 'Enter') return;
    e.preventDefault();
    if (!inp.value.trim() && !ROPC.files.length) return;
    ropChatSend(inp.value.trim(), job);
  });
  var send = el('button', { class: 'rop-send', type: 'button', title: 'Send (Enter)', 'aria-label': 'Send', html: ri('send', 14), onClick: function (e) { e.stopPropagation(); if (inp.value.trim() || ROPC.files.length) ropChatSend(inp.value.trim(), job); } });
  box.appendChild(q);
  if (ROPC.files.length) box.appendChild(staged);
  box.appendChild(el('label', { class: 'rop-in rop-cin' }, [to, inp, opc, clip, send, fi, sug]));
  return box;
}
function ropMenOf(text, P) {
  var out = [], re = /(^|\s)@([A-Z][\w'’-]*(?: [A-Z][\w'’-]*)?)/g, m;
  while ((m = re.exec(text))) {
    var w = m[2].toLowerCase(), hit = P.all.filter(function (x) { return x[0].toLowerCase() === w; })[0] || P.all.filter(function (x) { return x[0].toLowerCase().split(' ')[0] === w.split(' ')[0]; })[0];
    if (hit && out.indexOf(hit[0]) < 0) out.push(hit[0]);
  }
  return out;
}
function ropChatSend(text, job) {
  var P = ropPeople(), who = ROPU.msgTo; if (!who) return;
  var men = ropMenOf(text, P), files = ROPC.files.slice(), names = files.map(function (f) { return f.name || 'Screenshot'; });
  if (files.length) { try { if (job) dropFilesOnJob(job, files); else addFilesToRO(files); } catch (e) { console.error(e); } }
  var no = ropNo(), sub = (RO.customerName || '') + (job ? ' · Op ' + ropN(job) + ' — ' + (job.complaint || '') : '');
  var body = text || (names.length ? 'Sent ' + names.length + ' file' + (names.length === 1 ? '' : 's') : '');
  var n = null; try { n = IB.send({ to: who, k: 'men', src: 'ros', ro: RO.id, op: job ? job.id : null, t: ropFirst(ropMe()) + ' wrote about ' + no, b: sub, q: body, x: names.length || men.length ? { files: names, men: men } : null }); } catch (e) { console.error(e); }
  if (!n) return;
  men.filter(function (m) { return !techSame(m, who) && !ropIsMe(m); }).forEach(function (m) {
    try { IB.send({ to: m, k: 'men', src: 'ros', ro: RO.id, op: job ? job.id : null, t: ropFirst(ropMe()) + ' mentioned you on ' + no, b: sub, q: body, x: { mof: n.id } }); } catch (e) {}
  });
  ROPC.files = []; ROPC.draft = ''; ROPC.mine = false;
  save(true); render();
  requestAnimationFrame(function () { var i = R.querySelector('.rop-in__i'); if (i) i.focus(); });
}
