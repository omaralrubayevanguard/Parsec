/* Parsec · the operation clock card — 10 ideas, each live; pick the ones you want and "Your card" puts them together */
var D = document, $ = function(s, r){ return (r || D).querySelector(s); };
function ic(k, s){ return '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"' + (s ? ' style="width:' + s + 'px;height:' + s + 'px"' : '') + '>' + (IC[k] || '') + '</svg>'; }
function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){ return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
var Q = 8 * 3600, B0 = 6 * 3600 + 15 * 60 + 57;
var SEG0 = [['diag', 5760], ['rep', 5760], ['rep', 11040]];   /* the closed punches; the live one is the rest */
var IDEAS = [
  ['ring', 'Ring around the button', 'Start / Stop sits in a ring that fills toward quoted — green, amber from 90%, red past it.'],
  ['roll', 'Rolling digits', 'The seconds roll like an odometer; the colons blink while the clock runs.'],
  ['bar', 'The bar in the Time tab’s colors', 'The bar is made of the punches, each in its reason’s color — the live one grows with a soft pulse at its edge.'],
  ['over', 'Over quoted', 'Past quoted the extra time is striped red, the card’s edge turns red and “+0:12 over” flips in.'],
  ['left', 'Time left', 'Tap the big number to switch between time on the operation and time left — it flips.'],
  ['pace', 'When quoted runs out', '“Quoted runs out about 3:24 pm” — and a dotted ghost of the rest of the bar.'],
  ['state', 'The card breathes', 'Running: a slow green glow. Waiting: amber and still. Complete: the check draws itself.'],
  ['hold', 'Hold to stop', 'Press and hold Stop — a ring fills, then the stop reasons slide in as colored chips. No stops by accident.'],
  ['who', 'Who’s on the clock', 'Everyone clocked on this operation, with a live dot and their time on this punch.'],
  ['miles', 'Milestones', 'At halfway, 75% and quoted the bar’s tick pulses and a small label slides in.']
];
var SUG = { ring: 1, bar: 1, over: 1, hold: 1, who: 1 };
var RSN = [['Switched job', 'var(--ink3)'], ['Lunch', '#8A7A9B'], ['End of day', '#5E6B7A'], ['Waiting – Parts', 'var(--r-wparts)'], ['Waiting – Approval', '#2F8795'], ['Waiting – Foreman', '#C0662F'], ['Complete', 'var(--r-done)']];
var V = { th: 'ivory', speed: 1, picks: false, note: '', use: { ring: 1, bar: 1, over: 1, hold: 1, who: 1 }, motion: 'auto', pages: { ro: 1, tech: 1 } };
var CARDS = [];
/* ---------- time helpers ---------- */
function hms(s){ s = Math.max(0, Math.floor(s)); return Math.floor(s / 3600) + ':' + String(Math.floor(s / 60) % 60).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0'); }
function ms(s){ s = Math.max(0, Math.floor(s)); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); }
function h2(s){ return (s / 3600).toFixed(2); }
function clock(t){ var d = new Date(t), h = d.getHours(), m = d.getMinutes(); return (h % 12 || 12) + ':' + String(m).padStart(2, '0') + ' ' + (h >= 12 ? 'pm' : 'am'); }
var PLAY = "path('M8 5.5 L19 12 L19 12 L8 18.5 Z')", STOP = "path('M6.5 6.5 L17.5 6.5 L17.5 17.5 L6.5 17.5 Z')";
var RC = 2 * Math.PI * 23;
/* ---------- one clock card, built once, then updated in place so its animations run ---------- */
function Card(host, f, init){
  this.h = host; this.f = f; init = init || {};
  this.s = { b: init.b != null ? init.b : B0, run: init.run !== false, segs: (init.segs || SEG0).map(function(x){ return x.slice(); }), view: 'el', st: 'run', rsn: false, who: init.who || [['Mike Rodriguez', 'MR', 47 * 60]], join: init.join, t: 0, hit: {}, lab: null, labT: 0, over: false };
  var b = this.s.b; [.5, .75, 1].forEach(function(p){ if(b >= Q * p) this.s.hit[p] = 1; }, this); this.s.over = b > Q;
  this.build(); this.update(true);
}
Card.prototype.build = function(){
  var f = this.f, h = '';
  var big = f.roll ? '<span class="big rd' + (f.left ? ' tap' : '') + '" data-big title="' + (f.left ? 'Tap to switch' : '') + '"></span>' : '<span class="big' + (f.left ? ' tap' : '') + '" data-big title="' + (f.left ? 'Tap to switch' : '') + '"></span>';
  var btn = '<button class="pb" data-pb aria-label="Start or stop"><svg class="ico" viewBox="0 0 24 24"><path style="d:' + PLAY + '"/></svg></button>';
  var side = f.ring || f.hold ? '<div class="rg" data-rg style="--hc:' + RC.toFixed(1) + ';--hold:700ms"><svg class="ring" viewBox="0 0 52 52">' + (f.ring ? '<circle class="t" cx="26" cy="26" r="23"/><circle class="p" cx="26" cy="26" r="23" stroke-dasharray="' + RC.toFixed(1) + '" data-rp/>' : '') + '<circle class="h" cx="26" cy="26" r="23" stroke-dasharray="' + RC.toFixed(1) + '" stroke-dashoffset="' + RC.toFixed(1) + '"/></svg>' + btn + '</div>' : btn;
  h += '<div class="tm">' + big + '</div><div class="side" data-side>' + side + (f.hold ? '<span class="hint" data-hint>Hold to stop</span>' : '') + '</div><div class="lbl" data-lbl></div>';
  h += '<div class="bar">' + (f.bar ? '<span class="segs" data-segs></span>' : '<span class="fill" data-fill></span>') + (f.over ? '<span class="ov" data-ov></span>' : '') + (f.pace ? '<span class="gh" data-gh></span>' : '') + (f.miles ? '<span class="ms" data-ms="0.5"></span><span class="ms" data-ms="0.75"></span>' : '') + '<span class="qt" data-qt' + (f.miles ? ' data-msq' : '') + '></span></div>';
  h += '<div class="extra" data-extra>' + (f.who ? '<span data-who style="display:contents"></span>' : '') + (f.pace ? '<span class="pace" data-pace>' + ic('clock') + '<span data-pacet></span></span>' : '') + (f.over ? '<span data-ovl style="display:contents"></span>' : '') + (f.miles ? '<span data-mlb style="display:contents"></span>' : '') + '</div>';
  h += f.hold ? '<div class="rsn" data-rsn></div>' : '';
  h += '<div class="kv"><div><small>Quoted</small><b>' + h2(Q) + '<em>h</em></b></div><div><small>Burnt</small><b data-kb></b></div><div><small>Left</small><b data-kl></b></div><div><small>Efficiency</small><b data-ke></b></div></div>';
  this.h.innerHTML = '<div class="cc" data-cc>' + h + '</div>';
  this.el = $('[data-cc]', this.h); this.digits = null;
  var me = this, pb = $('[data-pb]', this.el);
  pb.addEventListener('pointerdown', function(e){ me.down(e); });
  pb.addEventListener('pointerup', function(e){ me.up(e); });
  pb.addEventListener('pointerleave', function(e){ me.cancelHold(); });
  pb.addEventListener('keydown', function(e){ if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); me.toggle(); } });
  var bg = $('[data-big]', this.el); if(f.left) bg.addEventListener('click', function(){ me.s.view = me.s.view === 'el' ? 'left' : 'el'; me.digits = null; bg.classList.remove('fl'); void bg.offsetWidth; bg.classList.add('fl'); me.update(true); });
  if(f.hold) this.el.addEventListener('click', function(e){ var r = e.target.closest('[data-r]'); if(r){ me.stopFor(r.getAttribute('data-r')); } });
};
Card.prototype.down = function(e){
  var s = this.s, me = this;
  if(this.f.hold && s.run){ var rg = $('[data-rg]', this.el); rg.classList.remove('holding'); void rg.offsetWidth; rg.classList.add('holding'); $('[data-hint]', this.el).textContent = 'Keep holding…';
    this.ht = setTimeout(function(){ rg.classList.remove('holding'); me.ht = null; me.held = true; s.run = false; s.rsn = true; me.showRsn(); me.update(true); }, 700); return; }
  this.toggle();
};
Card.prototype.up = function(){ if(this.ht){ this.cancelHold(); var h = $('[data-hint]', this.el); if(h){ h.textContent = 'Hold it — 0.7 s'; setTimeout(function(){ h.textContent = 'Hold to stop'; }, 1400); } } };
Card.prototype.cancelHold = function(){ if(this.ht){ clearTimeout(this.ht); this.ht = null; var rg = $('[data-rg]', this.el); if(rg) rg.classList.remove('holding'); } };
Card.prototype.toggle = function(){ var s = this.s; s.run = !s.run; if(s.run){ s.st = 'run'; s.rsn = false; var r = $('[data-rsn]', this.el); if(r) r.innerHTML = ''; } this.update(true); };
Card.prototype.showRsn = function(){ var r = $('[data-rsn]', this.el); if(!r) return; r.innerHTML = RSN.map(function(x, i){ return '<button data-r="' + esc(x[0]) + '" style="--c:' + x[1] + ';animation-delay:' + (i * 35) + 'ms"><i></i>' + esc(x[0]) + '</button>'; }).join(''); };
Card.prototype.stopFor = function(r){ var s = this.s; s.rsn = false; $('[data-rsn]', this.el).innerHTML = ''; s.st = r === 'Complete' ? 'done' : /^Waiting/.test(r) ? 'wait' : 'stop'; toast('Stopped · ' + r + '.'); this.update(true); };
Card.prototype.tick = function(dt){
  var s = this.s; s.t += dt;
  if(s.join && s.t >= s.join[0] && !s.joined){ s.joined = true; s.who.push(s.join[1]); s.newWho = true; }
  if(!s.run) return;
  s.b += dt; s.who.forEach(function(w){ w[2] += dt; });
  var me = this; [.5, .75, 1].forEach(function(p){ if(!s.hit[p] && s.b >= Q * p){ s.hit[p] = 1; s.lab = p === .5 ? 'Halfway' : p === .75 ? 'Last quarter' : 'At quoted'; s.labT = s.t; s.labNew = p; } });
};
Card.prototype.update = function(full){
  var s = this.s, f = this.f, el = this.el, over = s.b > Q, left = Q - s.b;
  var st = f.state ? (s.run ? 'run' : s.st) : null;
  el.className = 'cc' + (s.run ? ' run' : '') + (f.over && over ? ' over' : '') + (st ? ' st-' + st : '');
  /* the big number */
  var txt = s.view === 'left' ? (left >= 0 ? hms(left) : '+' + hms(-left)) : hms(s.b);
  var bg = $('[data-big]', el);
  if(f.roll) this.roll(bg, txt); else if(bg.textContent !== txt) bg.textContent = txt;
  var lb = $('[data-lbl]', el), lt = s.view === 'left' ? (left >= 0 ? 'Time left · of <b>' + hms(Q) + '</b> quoted' : 'Over quoted') : 'On this operation · ' + (SEG0.length + 1) + ' entries' + (f.left ? ' · <b>tap the time</b>' : '');
  if(lb.innerHTML !== lt) lb.innerHTML = lt;
  /* the button: start or stop (or the check / waiting state) */
  var side = $('[data-side]', el), pb = $('[data-pb]', el), path = pb && $('path', pb);
  if(path) path.style.d = s.run ? STOP : PLAY;
  if(f.state){ var mode = s.run ? 'btn' : s.st === 'done' ? 'done' : s.st === 'wait' ? 'wait' : 'btn';
    if(side.getAttribute('data-mode') !== mode){ side.setAttribute('data-mode', mode); var ex = $('.ck,.wt', side); if(ex) ex.remove(); var w = $('[data-rg],[data-pb]', side);
      if(mode === 'done'){ w.style.display = 'none'; side.insertAdjacentHTML('afterbegin', '<span class="ck"><svg viewBox="0 0 24 24"><path d="M6 12.5l4 4 8-9"/></svg></span>'); }
      else if(mode === 'wait'){ w.style.display = 'none'; side.insertAdjacentHTML('afterbegin', '<span class="wt" title="Waiting – Parts">WAIT</span>'); }
      else w.style.display = ''; } }
  if(f.hold){ var hn = $('[data-hint]', el); if(hn && !this.ht && full) hn.textContent = s.run ? 'Hold to stop' : s.rsn ? 'Why did it stop?' : 'Tap to start'; }
  /* the ring */
  var rp = $('[data-rp]', el); if(rp){ var p = Math.min(1, s.b / Q); rp.setAttribute('stroke-dashoffset', (RC * (1 - p)).toFixed(1)); rp.style.setProperty('--rc', p >= 1 ? 'var(--over)' : p >= .9 ? 'var(--warn)' : 'var(--good)'); }
  /* the bar */
  var scale = Math.max(Q * 1.12, s.b * 1.03), pct = function(x){ return (x / scale * 100).toFixed(3) + '%'; }, upto = Math.min(s.b, Q);
  $('[data-qt]', el).style.left = pct(Q);
  var fl = $('[data-fill]', el); if(fl){ fl.style.width = pct(f.over ? upto : s.b); fl.style.background = !f.over && over ? 'var(--over)' : ''; }
  var sg = $('[data-segs]', el);
  if(sg){ var closed = s.segs.reduce(function(a, x){ return a + x[1]; }, 0), live = Math.max(0, s.b - closed), L = s.segs.concat([['rep', live, 1]]), acc = 0, cap = f.over ? Q : Infinity;
    if(sg.children.length !== L.length) sg.innerHTML = L.map(function(x){ return '<i' + (x[2] ? ' class="live"' : '') + ' style="--c:var(--r-' + x[0] + ')"></i>'; }).join('');
    L.forEach(function(x, i){ var w = Math.max(0, Math.min(x[1], cap - acc)); acc += x[1]; sg.children[i].style.width = 'calc(' + pct(w) + ' - ' + (i < L.length - 1 ? 2 : 0) + 'px)'; }); }
  var ov = $('[data-ov]', el); if(ov){ ov.style.left = pct(Q); ov.style.width = over ? pct(s.b - Q) : '0%'; }
  var gh = $('[data-gh]', el); if(gh){ gh.style.left = pct(Math.min(s.b, Q)); gh.style.width = over ? '0%' : pct(Q - s.b); }
  if(f.miles){ [.5, .75].forEach(function(p){ var m = $('[data-ms="' + p + '"]', el); m.style.left = pct(Q * p); m.classList.toggle('hit', !!s.hit[p]); if(s.labNew === p){ m.classList.remove('pop'); void m.offsetWidth; m.classList.add('pop'); } }); }
  /* the extras */
  var wb = $('[data-who]', el); if(wb){ if(wb.children.length !== s.who.length){ wb.innerHTML = s.who.map(function(w, i){ return '<span class="who' + (s.newWho && i === s.who.length - 1 ? ' in' : '') + '"><span class="av">' + w[1] + '</span><b>' + esc(w[0].split(' ')[0]) + '</b><span class="m">' + ms(w[2]) + '</span></span>'; }).join(''); s.newWho = false; }
    else s.who.forEach(function(w, i){ var m = $('.m', wb.children[i]); var t = ms(w[2]); if(m.textContent !== t) m.textContent = t; }); }
  var pc = $('[data-pacet]', el); if(pc){ var t2 = over ? 'Quoted ran out ' + ms(s.b - Q).replace(/:\d\d$/, '') + ' min ago' : 'Quoted runs out about <b>' + clock(Date.now() + left * 1000 / Math.max(1, V.speed)) + '</b>' + (V.speed > 1 ? ' <span class="mu">(at this speed)</span>' : ''); if(pc.innerHTML !== t2) pc.innerHTML = t2; }
  var ol = $('[data-ovl]', el); if(ol){ if(over){ var ot = '+' + hms(s.b - Q).replace(/^0:/, '') + ' over'; if(!ol.firstChild) ol.innerHTML = '<span class="ovl">' + ic('flag', 12) + '<span>' + ot + '</span></span>'; else { var o2 = $('.ovl span', ol); if(o2.textContent !== ot) o2.textContent = ot; } } else if(ol.firstChild) ol.innerHTML = ''; }
  var mb = $('[data-mlb]', el); if(mb){ if(s.labNew){ mb.innerHTML = '<span class="mlb">' + ic('check', 12) + s.lab + '</span>'; s.labNew = 0; } else if(mb.firstChild && s.t - s.labT > 6) mb.innerHTML = ''; }
  /* the numbers */
  var kb = $('[data-kb]', el), kl = $('[data-kl]', el), ke = $('[data-ke]', el);
  kb.innerHTML = h2(s.b) + '<em>h</em>'; kl.innerHTML = (left < 0 ? '−' + h2(-left) : h2(left)) + '<em>h</em>'; kl.className = left < 0 && f.over ? 'r' : '';
  var eff = Math.round(Q / Math.max(1, s.b) * 100); ke.innerHTML = eff + '<em>%</em>'; ke.className = eff >= 100 ? 'g' : f.over ? 'r' : '';
};
Card.prototype.roll = function(el, txt){
  if(!this.digits || this.digits.length !== txt.length){
    el.innerHTML = txt.split('').map(function(c){ return /\d/.test(c) ? '<span class="d"><span>' + '0123456789'.split('').map(function(n){ return '<span>' + n + '</span>'; }).join('') + '</span></span>' : '<span class="c blink">' + c + '</span>'; }).join('');
    this.digits = txt; }
  var cols = el.querySelectorAll('.d > span'), k = 0;
  txt.split('').forEach(function(c){ if(/\d/.test(c)){ cols[k].style.transform = 'translateY(' + (-+c) + 'em)'; k++; } });
};
/* ---------- the page ---------- */
function useBtn(k){ return '<button class="use" data-use="' + k + '" aria-pressed="' + !!V.use[k] + '"><span class="bx"></span>' + (V.use[k] ? 'On my card' : 'Use it') + '</button>'; }
function idCtl(k){
  if(k === 'state') return '<div class="ctl"><span>Show</span><div class="seg" role="group"><button data-st="run" aria-pressed="true">Running</button><button data-st="wait">Waiting</button><button data-st="done">Complete</button></div></div>';
  if(k === 'over') return '<div class="ctl"><button class="btn sm gh" data-replay="over">' + ic('undo') + 'Again — 25 s before quoted</button></div>';
  if(k === 'miles') return '<div class="ctl"><button class="btn sm gh" data-replay="miles">' + ic('undo') + 'Again — just before halfway</button><span>· try ×600 for the rest</span></div>';
  if(k === 'hold') return '<div class="ctl"><span>Press and hold Stop · let go early and nothing happens</span></div>';
  if(k === 'left') return '<div class="ctl"><span>Tap the big number</span></div>';
  return '';
}
var INIT = { over: { b: Q - 25 }, miles: { b: Q * .5 - 12 }, who: { who: [['Mike Rodriguez', 'MR', 47 * 60]], join: [4, ['Dana Kowalski', 'DK', 0]] } };
function yourFlags(){ var f = {}; IDEAS.forEach(function(x){ if(V.use[x[0]]) f[x[0]] = 1; }); return f; }
function draw(){
  var y = window.scrollY, cy = $('.chs') ? $('.chs').scrollTop : 0;
  var on = IDEAS.filter(function(x){ return V.use[x[0]]; });
  var lead = '<div class="lead"><div class="yc"><h2>Your card</h2><div class="sub">Today’s card plus the ideas you turned on — live. Start and stop it.</div><div data-card="you"></div><div class="now">' + (on.length ? on.map(function(x){ return '<span>' + esc(x[1]) + '</span>'; }).join('') : 'No ideas on yet — today’s card') + '</div></div>'
    + '<div class="yc"><h2>As today</h2><div class="sub">For comparison — no new ideas.</div><div data-card="base"></div><div class="now">Tap the button to start and stop.</div></div></div>';
  var ids = '<div class="ids">' + IDEAS.map(function(x, i){ return '<div class="idc' + (V.use[x[0]] ? ' on' : '') + '" data-id="' + x[0] + '"><div class="idh"><span class="n">' + (i + 1) + '</span><div><b>' + esc(x[1]) + (SUG[x[0]] ? ' <em class="sg">SUGGESTED</em>' : '') + '</b><small>' + esc(x[2]) + '</small></div><span class="use-w" style="margin-left:auto">' + useBtn(x[0]) + '</span></div><div data-card="' + x[0] + '"></div>' + idCtl(x[0]) + '</div>'; }).join('') + '</div>';
  $('#pg').innerHTML = '<div class="wrap"><div class="two"><div>' + lead + ids + '</div>' + chsHtml() + '</div></div>';
  CARDS = [];
  CARDS.push(new Card($('[data-card="you"]'), yourFlags(), { b: B0, join: V.use.who ? [6, ['Dana Kowalski', 'DK', 0]] : null }));
  CARDS.push(new Card($('[data-card="base"]'), {}, { b: B0, run: false }));
  IDEAS.forEach(function(x){ var f = {}; f[x[0]] = 1; CARDS.push(new Card($('[data-card="' + x[0] + '"]'), f, INIT[x[0]])); });
  window.scrollTo(0, y); if($('.chs')) $('.chs').scrollTop = cy; sync();
}
function sync(){
  D.querySelectorAll('.mk button[data-th]').forEach(function(b){ b.setAttribute('aria-pressed', String(b.getAttribute('data-th') === V.th)); });
  D.querySelectorAll('[data-speed]').forEach(function(b){ b.setAttribute('aria-pressed', String(+b.getAttribute('data-speed') === V.speed)); });
  D.documentElement.setAttribute('data-th', V.th);
  D.documentElement.classList.toggle('calm', V.motion === 'calm'); D.documentElement.classList.toggle('motion-auto', V.motion === 'auto');
}
/* ---------- the choices ---------- */
var CH = [
  ['THE CARD', 'use', 'Put on the card', 'pick any — or use the buttons on each idea', IDEAS.map(function(x){ return [x[0], x[1], '', SUG[x[0]]]; }), 1],
  ['', 'motion', 'Motion', '', [['auto', 'Follow the computer’s “reduce motion” setting', 'full motion unless it’s turned on', 1], ['full', 'Full, always', ''], ['calm', 'Calm — numbers and bars move, nothing pulses', 'see it now']]],
  ['', 'pages', 'The same card on', 'pick any', [['ro', 'The RO page', '', 1], ['tech', 'The Technician page', '', 1]], 1]
];
function chsHtml(){
  return '<div class="chs">' + CH.map(function(c){ var k = c[1], multi = c[5];
    return (c[0] ? '<div class="ch" style="padding:0;background:none;box-shadow:none"><div class="hd">' + c[0] + '</div></div>' : '') + '<div class="ch"><b>' + c[2] + '</b>' + (c[3] ? '<small>' + c[3] + '</small>' : '') + '<div class="fl">' + c[4].map(function(o){ var on = multi ? !!V[k][o[0]] : V[k] === o[0]; return '<button class="opt' + (multi ? ' sq' : '') + '" data-ch="' + k + '" data-v="' + o[0] + '" aria-pressed="' + on + '"><i></i><span><b>' + o[1] + (o[3] ? '<em>SUGGESTED</em>' : '') + '</b>' + (o[2] || '') + '</span></button>'; }).join('') + '</div></div>'; }).join('') + '</div>';
}
function pkText(){
  var L = ['Parsec · Operation clock card — my picks'];
  var on = IDEAS.filter(function(x){ return V.use[x[0]]; }).map(function(x, i){ return x[1]; });
  L.push('· On the card: ' + (on.length ? on.join(', ') : 'nothing new — keep today’s card'));
  L.push('· Motion: ' + CH[1][4].filter(function(o){ return o[0] === V.motion; })[0][1]);
  L.push('· The same card on: ' + (CH[2][4].filter(function(o){ return V.pages[o[0]]; }).map(function(o){ return o[1]; }).join(', ') || 'neither'));
  if(V.note.trim()) L.push('· Notes: ' + V.note.trim());
  return L.join('\n');
}
function pkDraw(){ var w = $('#picks'); w.hidden = !V.picks; if(!V.picks) return;
  w.innerHTML = '<div class="pk-h"><b>Your picks</b><button class="x" data-pk="x" aria-label="Close">' + ic('x', 15) + '</button></div><pre>' + esc(pkText()) + '</pre><div class="pk-r"><span>Anything else</span><textarea id="pk-note" placeholder="e.g. hold for a shorter time, another milestone">' + esc(V.note) + '</textarea></div><button class="btn pri" data-pk="copy">' + ic('copy') + 'Copy for the chat</button>'; }
function toast(m){ var t = $('.toast'); if(t) t.remove(); t = D.createElement('div'); t.className = 'toast'; t.setAttribute('role', 'status'); t.textContent = m; D.body.appendChild(t); clearTimeout(toast.h); toast.h = setTimeout(function(){ t.remove(); }, 2600); }
/* ---------- events ---------- */
D.addEventListener('click', function(e){
  var t = e.target, b;
  if((b = t.closest('.mk button[data-th]'))){ V.th = b.getAttribute('data-th'); sync(); return; }
  if((b = t.closest('[data-speed]'))){ V.speed = +b.getAttribute('data-speed'); sync(); return; }
  if((b = t.closest('[data-use]'))){ var k = b.getAttribute('data-use'); V.use[k] = V.use[k] ? 0 : 1; draw(); pkDraw(); return; }
  if((b = t.closest('[data-ch]'))){ var k2 = b.getAttribute('data-ch'), v = b.getAttribute('data-v'); if(k2 === 'use' || k2 === 'pages'){ V[k2][v] = V[k2][v] ? 0 : 1; if(k2 === 'use'){ draw(); pkDraw(); return; } } else V[k2] = v; sync(); var y = $('.chs').scrollTop; $('.chs').outerHTML = chsHtml(); $('.chs').scrollTop = y; pkDraw(); return; }
  if((b = t.closest('[data-st]'))){ var hs = $('[data-card="state"]'), c = CARDS.filter(function(x){ return x.h === hs; })[0], st = b.getAttribute('data-st'); b.parentNode.querySelectorAll('button').forEach(function(x){ x.setAttribute('aria-pressed', String(x === b)); }); c.s.run = st === 'run'; c.s.st = st; c.update(true); return; }
  if((b = t.closest('[data-replay]'))){ var k3 = b.getAttribute('data-replay'), host = $('[data-card="' + k3 + '"]'), i = CARDS.findIndex(function(x){ return x.h === host; }), f = {}; f[k3] = 1; CARDS[i] = new Card(host, f, INIT[k3]); return; }
  if((b = t.closest('[data-pk]'))){ var a = b.getAttribute('data-pk'); if(a === 'x'){ V.picks = false; pkDraw(); }
    if(a === 'copy'){ var tx = pkText(); (navigator.clipboard ? navigator.clipboard.writeText(tx) : Promise.reject()).then(function(){ toast('Copied — paste it in the chat.'); }, function(){ var ta = D.createElement('textarea'); ta.value = tx; D.body.appendChild(ta); ta.select(); try{ D.execCommand('copy'); toast('Copied — paste it in the chat.'); }catch(er){} ta.remove(); }); }
    return; }
  if(t.closest('#pk-open')){ V.picks = !V.picks; pkDraw(); return; }
});
D.addEventListener('input', function(e){ if(e.target.id === 'pk-note'){ V.note = e.target.value; var pre = $('#picks pre'); if(pre) pre.textContent = pkText(); } });
D.addEventListener('keydown', function(e){ if(e.key === 'Escape' && V.picks){ V.picks = false; pkDraw(); } });
var LAST = performance.now();
setInterval(function(){ var now = performance.now(), dt = (now - LAST) / 1000 * V.speed; LAST = now; CARDS.forEach(function(c){ c.tick(dt); c.update(false); }); }, 200);
draw();
