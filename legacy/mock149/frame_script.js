
/* ---------- the content: groups → ideas → options (Skip is added to each) ---------- */
var APP = 'Parsec', TOPIC = 'Tooltips', KEY = 'ip-parsec-tooltips';   /* KEY: unique per mock-up */
var IDEAS = [
  { group: 'One look', items: [
    { k: 'look', t: 'One tooltip, the same everywhere', why: 'Today: the browser’s grey box on most things.',
      vis: '<span class="v-btn v-target">Copy RO number</span><span class="v-tip">Copy RO number · C</span><span class="v-cur"></span>',
      steps: [['idle', 900], ['point', 700], ['show', 1100], ['click', 500], ['done', 1400]],
      opts: [['ink', 'A · Ink', 'dark on light, light on dark'], ['card', 'B · Card', 'like the Time Log’s tip now'], ['quiet', 'C · Quiet', 'a tinted box, no shadow']] }
  ]}
];
/* ---------- the page ---------- */
var D = document, $ = function (s, r) { return (r || D).querySelector(s); }, $$ = function (s, r) { return [].slice.call((r || D).querySelectorAll(s)); };
function esc(t) { return String(t == null ? '' : t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
var V = { th: 'light', open: false, v: {}, note: '' };
try { var sv = JSON.parse(localStorage.getItem(KEY) || '{}'); if (sv.v) V.v = sv.v; if (sv.note) V.note = sv.note; if (sv.th) V.th = sv.th; } catch (e) {}
function save() { try { localStorage.setItem(KEY, JSON.stringify({ v: V.v, note: V.note, th: V.th })); } catch (e) {} }
var total = IDEAS.reduce(function (a, g) { return a + g.items.length; }, 0);
$('#ip-lead').textContent = total + ' idea' + (total === 1 ? '' : 's') + ' for the ' + TOPIC.toLowerCase() + ' — pick an option on each, or Skip, then copy Your picks into the chat.';
$('#ip-jump').innerHTML = IDEAS.map(function (g, i) { return '<a href="#ip-s' + i + '">' + esc(g.group) + '</a>'; }).join('');
$('#ip-secs').innerHTML = IDEAS.map(function (g, i) {
  return '<section class="ip-sec" id="ip-s' + i + '"><h2>' + esc(g.group) + ' <small>' + g.items.length + ' idea' + (g.items.length > 1 ? 's' : '') + '</small></h2><div class="ip-grid">' + g.items.map(function (it) {
    var o = it.opts.concat([['skip', 'Skip', '']]);
    return '<article class="ip-idea" data-k="' + it.k + '"><header><h3>' + esc(it.t) + '</h3><p>' + esc(it.why) + '</p></header><div class="ip-vis" data-step="' + (it.steps ? it.steps[0][0] : '') + '">' + it.vis + (it.steps ? '<button class="ip-replay" aria-label="Play it again" title="Play it again">↻</button>' : '') + '</div><div class="ip-ol">' +
      o.map(function (x) { return '<button class="ip-opt" data-k="' + it.k + '" data-v="' + x[0] + '" aria-pressed="false"><i></i><span><b>' + esc(x[1]) + '</b>' + (x[2] ? '<small>' + esc(x[2]) + '</small>' : '') + '</span></button>'; }).join('') + '</div></article>';
  }).join('') + '</div></section>';
}).join('');
/* ---------- the animations: each visual plays its action, step by step, then loops ---------- */
var RM = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
function find(k) { var r = null; IDEAS.forEach(function (g) { g.items.forEach(function (it) { if (it.k === k) r = it; }); }); return r; }
function play(vis, it) {
  clearTimeout(vis._t); if (!it.steps) return;
  if (RM) { vis.dataset.step = it.steps[it.steps.length - 1][0]; return; }   /* reduced motion: the end state, still */
  var i = 0; (function next() { var s = it.steps[i]; vis.dataset.step = s[0]; i = (i + 1) % it.steps.length; vis._t = setTimeout(next, s[1]); })();
}
var IO = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) { es.forEach(function (en) { var vis = en.target, it = find(vis.closest('.ip-idea').dataset.k); if (en.isIntersecting) play(vis, it); else clearTimeout(vis._t); }); }, { threshold: .2 }) : null;
$$('.ip-vis').forEach(function (vis) { var it = find(vis.closest('.ip-idea').dataset.k); if (IO) IO.observe(vis); else play(vis, it); });
/* ---------- Your picks ---------- */
function pkText() {
  var L = [APP + ' · ' + TOPIC + ' — my picks'];
  IDEAS.forEach(function (g) { var rows = []; g.items.forEach(function (it) { var v = V.v[it.k]; if (!v) return; var o = it.opts.filter(function (x) { return x[0] === v; })[0]; rows.push('· ' + it.t + ': ' + (v === 'skip' ? 'skip' : o ? o[1] : v)); }); if (rows.length) { L.push(g.group + ':'); L = L.concat(rows); } });
  var left = total - Object.keys(V.v).length; if (left) L.push('(not picked yet: ' + left + ')');
  if (V.note.trim()) L.push('Notes: ' + V.note.trim());
  return L.join('\n');
}
function sync() {
  D.documentElement.setAttribute('data-th', V.th);
  $$('.ip-seg button').forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.th === V.th)); });
  $$('.ip-opt').forEach(function (b) { b.setAttribute('aria-pressed', String(V.v[b.dataset.k] === b.dataset.v)); });
  $$('.ip-idea').forEach(function (a) { a.classList.toggle('picked', !!V.v[a.dataset.k]); });
  var n = Object.keys(V.v).length; $('#ip-n').textContent = n ? n + '/' + total : '';
}
function draw() {
  var w = $('#ip-picks'); w.hidden = !V.open; if (!V.open) return;
  var ta = $('#ip-note'); if (ta && D.activeElement === ta) { $('#ip-picks pre').textContent = pkText(); return; }
  w.innerHTML = '<div class="ip-ph"><b>Your picks</b><button data-pk="x" aria-label="Close">✕</button></div><pre>' + esc(pkText()) + '</pre><label style="display:flex;flex-direction:column;gap:6px;font-size:12px;font-weight:600;color:var(--ink2)">Anything else<textarea id="ip-note" placeholder="Anything to add or change">' + esc(V.note) + '</textarea></label><button class="ip-btn pri" data-pk="copy" style="justify-content:center;height:34px">Copy for the chat</button>';
}
function toast(m) { var t = $('.ip-toast'); if (t) t.remove(); t = D.createElement('div'); t.className = 'ip-toast'; t.textContent = m; D.body.appendChild(t); clearTimeout(toast.h); toast.h = setTimeout(function () { t.remove(); }, 2600); }
function copy(tx) {
  var fb = function () { var ta = D.createElement('textarea'); ta.value = tx; D.body.appendChild(ta); ta.select(); try { D.execCommand('copy'); toast('Copied — paste it in the chat.'); } catch (e) { toast('Select the text and copy it.'); } ta.remove(); };
  if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(tx).then(function () { toast('Copied — paste it in the chat.'); }, fb); else fb();
}
D.addEventListener('click', function (ev) {
  var t = ev.target, b;
  if ((b = t.closest('.ip-seg button'))) { V.th = b.dataset.th; save(); sync(); return; }
  if (t.closest('#ip-open')) { V.open = !V.open; draw(); return; }
  if ((b = t.closest('[data-pk]'))) { if (b.dataset.pk === 'x') { V.open = false; draw(); } else copy(pkText()); return; }
  if ((b = t.closest('.ip-replay'))) { var vis = b.closest('.ip-vis'); play(vis, find(vis.closest('.ip-idea').dataset.k)); return; }
  if ((b = t.closest('.ip-opt'))) { var k = b.dataset.k, v = b.dataset.v; if (V.v[k] === v) delete V.v[k]; else V.v[k] = v; save(); sync(); draw(); }
});
D.addEventListener('input', function (ev) { if (ev.target.id === 'ip-note') { V.note = ev.target.value; save(); var p = $('#ip-picks pre'); if (p) p.textContent = pkText(); } });
D.addEventListener('keydown', function (ev) { if (ev.key === 'Escape' && V.open) { V.open = false; draw(); } });
sync();
