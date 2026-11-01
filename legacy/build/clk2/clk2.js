/* Parsec · the operation clock card, round 2 — 12 more ideas, each live; your 10 from round 1 stay on "Your card" */
var D = document, $ = function(s, r){ return (r || D).querySelector(s); }, $$ = function(s, r){ return Array.prototype.slice.call((r || D).querySelectorAll(s)); };
function ic(k, s){ return '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"' + (s ? ' style="width:' + s + 'px;height:' + s + 'px"' : '') + '>' + (IC[k] || '') + '</svg>'; }
function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){ return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
function put(n, h){ if(n && n._h !== h){ n._h = h; n.innerHTML = h; return true; } return false; }
function reflow(n, c){ n.classList.remove(c); void n.offsetWidth; n.classList.add(c); }
function sum(a){ return a.reduce(function(x, y){ return x + y[1]; }, 0); }
/* ---------- the job and the shop clock (seconds since midnight) ---------- */
var Q = 8 * 3600;
var SEG0 = [['diag', 5760], ['rep', 5760], ['rep', 7200]];          /* the closed punches; the live one is the rest */
var T0 = 11 * 3600 + 18 * 60, LS0 = 10 * 3600 + 13 * 60;             /* the shop clock reads 11:18 am; this punch began 10:13 */
var B0 = sum(SEG0) + (T0 - LS0);                                    /* 6:17:00 on the operation */
var DA = 7 * 3600, DZ = 16 * 3600, LA = 12 * 3600, LZ = LA + 1800;   /* the day 7 am – 4 pm, lunch 12:00 – 12:30 */
var FU = Q / 1.12, BAND = [5.2 * 3600, 7.8 * 3600, 6.4 * 3600];
var NEXT = ['Op 2 · NOx sensor', '1.5 h'];
var R1 = [['ring', 'Ring around the button'], ['roll', 'Rolling digits'], ['bar', 'The bar in the Time tab’s colors'], ['over', 'Over quoted'], ['left', 'Time left'], ['pace', 'When quoted runs out'], ['state', 'The card breathes'], ['hold', 'Hold to stop'], ['who', 'Who’s on the clock'], ['miles', 'Milestones']];
var NEW = [
  ['day', 'Your day around it', 'A 7 am – 4 pm strip: this operation in its reason colors, other jobs grey, lunch hatched. The now-marker glides.'],
  ['lap', 'Lap marks', 'A flag beside Start/Stop marks a split — “Split 2 · 0:14:32” slides in and lands as a time-stamped note.'],
  ['slide', 'Slide to stop', 'On a phone, slide the handle to stop. Let go early and it snaps back. Desktop keeps Hold to stop.'],
  ['focus', 'Focus mode', 'The expand icon grows the card into a big shop-floor view. Esc or a tap shrinks it back.'],
  ['band', 'Similar jobs', 'A soft band shows how long similar jobs took. The dot slides along; the label changes when you leave the band.'],
  ['upace', 'Your usual pace', '“At your usual 112%: done about 12:40 pm” — with a tick where you’d usually finish.'],
  ['fixst', 'Fix the start', 'Forgot to clock on? The pencil by “since 10:13” lets you drag the start back up to 60 min.'],
  ['nudge', 'Note nudge', 'After 45 min with no note a small pill wiggles in once. Tap, type, Enter — it lands on this punch.'],
  ['parts', 'Parts on this job', 'In hand or with an ETA. When the last one lands: “All parts in” and Start shimmers.'],
  ['next', 'Next up', 'Stop or complete and the next operation slides up with its own Start.'],
  ['badge', 'Done badge', 'Complete under quoted and a badge pops — “Done in 5:12 · 154%”.'],
  ['lunch', 'Lunch and end of day ahead', '“Lunch in 0:42 — the clock pauses itself.” At lunch the card dims, then wakes at 12:30.']
];
var SUG = { focus: 1, fixst: 1, nudge: 1, parts: 1, next: 1, lunch: 1 };
var RSN = [['Switched job', 'var(--ink3)'], ['Lunch', '#8A7A9B'], ['End of day', '#5E6B7A'], ['Waiting – Parts', 'var(--r-wparts)'], ['Waiting – Approval', '#2F8795'], ['Waiting – Foreman', '#C0662F'], ['Complete', 'var(--r-done)']];
var V = { th: 'ivory', speed: 1, picks: false, note: '', r1: {}, use: {}, motion: 'auto', pages: { ro: 1, tech: 1 } };
R1.forEach(function(x){ V.r1[x[0]] = 1; }); for(var k0 in SUG) V.use[k0] = 1;
var CARDS = [], FX = null;
/* ---------- time helpers ---------- */
function pad(n){ return String(n).padStart(2, '0'); }
function hms(s){ s = Math.max(0, Math.floor(s)); return Math.floor(s / 3600) + ':' + pad(Math.floor(s / 60) % 60) + ':' + pad(s % 60); }
function hm(s){ s = Math.max(0, Math.floor(s)); return Math.floor(s / 3600) + ':' + pad(Math.floor(s / 60) % 60); }
function ms(s){ s = Math.max(0, Math.floor(s)); return Math.floor(s / 60) + ':' + pad(s % 60); }
function h2(s){ return (s / 3600).toFixed(2); }
function tod(t, ap){ t = ((Math.floor(t) % 86400) + 86400) % 86400; var h = Math.floor(t / 3600), m = Math.floor(t / 60) % 60; return (h % 12 || 12) + ':' + pad(m) + (ap === false ? '' : ' ' + (h >= 12 ? 'pm' : 'am')); }
function cd(x){ return x >= 60 ? hm(x) : Math.ceil(x) + ' s'; }
function endAt(now, rem, lunchDone){ var z = now + rem; if(!lunchDone && now < LA && z > LA) z += 1800; if(z > DZ) return tod(Math.round((DA + z - DZ) / 300) * 300) + ' tomorrow'; return tod(Math.round(z / 300) * 300); }
function reduced(){ return V.motion === 'calm' || (V.motion === 'auto' && !!window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches); }
var PLAY = "path('M8 5.5 L19 12 L19 12 L8 18.5 Z')", STOP = "path('M6.5 6.5 L17.5 6.5 L17.5 17.5 L6.5 17.5 Z')";
var RC = 2 * Math.PI * 23;
function ringHtml(withRing, btn, attr, cls){ return '<div class="rg' + (cls ? ' ' + cls : '') + '" ' + attr + ' style="--hc:' + RC.toFixed(1) + ';--hold:700ms"><svg class="ring" viewBox="0 0 52 52">' + (withRing ? '<circle class="t" cx="26" cy="26" r="23"/><circle class="p" cx="26" cy="26" r="23" stroke-dasharray="' + RC.toFixed(1) + '" data-rp/>' : '') + '<circle class="h" cx="26" cy="26" r="23" stroke-dasharray="' + RC.toFixed(1) + '" stroke-dashoffset="' + RC.toFixed(1) + '"/></svg>' + btn + '</div>'; }
function pbHtml(attr){ return '<button class="pb" ' + attr + ' aria-label="Start or stop"><svg class="ico" viewBox="0 0 24 24"><path style="d:' + PLAY + '"/></svg></button>'; }
function roll(el, txt, prev){
  if(prev == null || prev !== txt.length) el.innerHTML = txt.split('').map(function(c){ return /\d/.test(c) ? '<span class="d"><span>' + '0123456789'.split('').map(function(n){ return '<span>' + n + '</span>'; }).join('') + '</span></span>' : '<span class="c blink">' + c + '</span>'; }).join('');
  var cols = el.querySelectorAll('.d > span'), k = 0;
  txt.split('').forEach(function(c){ if(/\d/.test(c)){ cols[k].style.transform = 'translateY(' + (-+c) + 'em)'; k++; } });
  return txt.length;
}
/* ---------- the state of one punch ---------- */
function mkState(o){
  o = o || {};
  var t0 = o.t0 != null ? o.t0 : T0, b = o.b != null ? o.b : B0, segs = SEG0.map(function(x){ return x.slice(); }), live = Math.max(0, b - sum(segs)), run = o.run !== false, ls = t0 - live;
  var s = { b: b, run: run, segs: segs, view: 'el', st: o.st || (run ? 'run' : 'stop'), rsn: false, who: [['Mike Rodriguez', 'MR', live]], join: o.join || null, joined: false,
    t: 0, rt: 0, t0: t0, hit: {}, lab: null, labT: 0, labNew: 0, ls: ls, stopAt: t0,
    day: [{ a: DA, z: DA + 1800, k: 'o', n: 'RO 4471 · brakes' }, { a: DA + 1800, z: DA + 9000, k: 'rep', n: 'This operation' }, { a: DA + 9000, z: ls, k: 'o', n: 'RO 4502 · PM service', lnk: 1 }, { a: ls, z: run ? null : t0, k: 'rep', n: 'This operation' }],
    laps: (o.laps || []).map(function(x){ return x.slice(); }), lapB: o.lapBack != null ? b - o.lapBack : b - live,
    fix: null, noteB: b - (o.noteAgo != null ? o.noteAgo : 20 * 60), lastNoteT: t0 - (o.noteAgo != null ? o.noteAgo : 20 * 60), lastTxt: o.noteTxt || 'DPF out — heavy soot on the inlet face', nudged: false, wiggled: false, noteOpen: false,
    parts: [['DPF gasket', 1], ['V-band clamps ×2', 1], ['EGR cooler', 0, '2:30 pm']], partsAt: o.partsAt != null ? o.partsAt : 12, allIn: false, allInT: 0,
    stopped: false, nextGone: false, badge: null, badgeNew: false, paused: null, lunchDone: t0 >= LZ, backT: -99, bandZ: null, upHit: b >= FU, upZ: null };
  [.5, .75, 1].forEach(function(p){ if(b >= Q * p) s.hit[p] = 1; });
  return s;
}
/* ---------- one clock card, built once, then updated in place so its animations run ---------- */
function Card(host, f, o, keep){
  this.h = host; this.f = f; this.o = o || {};
  this.nar = !!this.o.nar || host.clientWidth < 440;
  this.s = keep || mkState(this.o);
  this.build(); this.update(true);
  if(this.s.rsn) this.showRsn();
}
Card.prototype.now = function(){ return this.s.t0 + this.s.t; };
Card.prototype.slideOn = function(){ return !!(this.f.slide && this.nar); };
function fact(k, i){ return '<span class="fact" data-f="' + k + '">' + ic(i) + '<span></span></span>'; }
Card.prototype.build = function(){
  var f = this.f, h = '', sl = this.slideOn();
  h += '<div class="tm"><span class="big' + (f.roll ? ' rd' : '') + (f.left ? ' tap' : '') + '" data-big' + (f.left ? ' title="Tap to switch"' : '') + '></span></div>';
  var btn = pbHtml('data-pb'), side = f.ring || f.hold ? ringHtml(f.ring, btn, 'data-rg') : btn;
  var tools = (f.focus ? '<button class="tl" data-focus aria-label="Focus mode" title="Focus mode">' + ic('expand') + '</button>' : '') + (f.lap ? '<button class="tl" data-lap aria-label="Mark a split" title="Mark a split">' + ic('flag') + '</button>' : '');
  h += '<div class="side" data-side>' + (tools ? '<div class="tools">' + tools + '</div>' : '') + side + (f.hold && !sl ? '<span class="hint" data-hint>Hold to stop</span>' : '') + '</div>';
  h += '<div class="lbl" data-lbl></div>';
  if(f.fixst) h += '<div class="fix" data-fix hidden></div>';
  h += '<div class="bar' + (f.band ? ' hb' : '') + '">' + (f.band ? '<span class="band" data-band title="Similar jobs 5.2–7.8 h"></span><span class="bu" data-bu title="Similar jobs usually 6.4 h"></span>' : '') + (f.bar ? '<span class="segs" data-segs></span>' : '<span class="fill" data-fill></span>') + (f.over ? '<span class="ov" data-ov></span>' : '') + (f.pace ? '<span class="gh" data-gh></span>' : '') + (f.miles ? '<span class="ms" data-ms="0.5"></span><span class="ms" data-ms="0.75"></span>' : '') + (f.upace ? '<span class="up" data-up title="Where you’d usually finish"></span>' : '') + '<span class="qt" data-qt></span>' + (f.band ? '<span class="here" data-here title="You’re here"></span>' : '') + '</div>';
  var fa = (f.pace ? fact('pace', 'clock') : '') + (f.upace ? fact('upace', 'gauge') : '') + (f.band ? fact('band', 'similar') : '') + (f.lunch ? fact('lunch', 'moon') : '');
  if(fa) h += '<div class="facts">' + fa + '</div>';
  h += '<div class="extra" data-extra>' + (f.badge ? '<span data-done style="display:contents"></span>' : '') + (f.who ? '<span data-who style="display:contents"></span>' : '') + (f.parts ? '<span data-parts style="display:contents"></span>' : '') + (f.over ? '<span data-ovl style="display:contents"></span>' : '') + (f.miles ? '<span data-mlb style="display:contents"></span>' : '') + (f.lunch ? '<span data-back style="display:contents"></span>' : '') + (f.nudge ? '<span data-nudge style="display:contents"></span>' : '') + '</div>';
  if(f.lap) h += '<div class="laps"><span data-lapl style="display:contents"></span><span class="lap cur" data-lapc></span></div>';
  if(f.nudge) h += '<div class="note" data-note></div>';
  if(sl) h += '<div class="sl" data-sl><span class="slf"></span><span class="slt">Slide to stop</span><span class="slh" data-slh tabindex="0" role="button" aria-label="Slide to stop (or press Enter)"><svg viewBox="0 0 24 24"><path d="M6.5 6.5h11v11h-11z"/></svg></span></div>';
  if(f.hold || sl) h += '<div class="rsn" data-rsn></div>';
  if(f.next) h += '<div class="next" data-next hidden><span class="nxi">' + ic('next') + '</span><span class="nxt">Next: <b>' + NEXT[0] + '</b> · ' + NEXT[1] + '<small>Same RO · parts in hand</small></span><button class="btn sm pri" data-nxs>' + ic('play') + 'Start</button></div>';
  h += '<div class="kv"><div><small>Quoted</small><b>' + h2(Q) + '<em>h</em></b></div><div><small>Burnt</small><b data-kb></b></div><div><small>Left</small><b data-kl></b></div><div><small>Efficiency</small><b data-ke></b></div></div>';
  if(f.day){ var lb = ''; for(var hr = 7; hr <= 16; hr++) lb += '<span' + ((hr - 7) % 3 ? ' class="hx"' : '') + ' style="left:' + ((hr - 7) / 9 * 100).toFixed(2) + '%">' + (hr % 12 || 12) + (hr === 7 ? ' am' : hr === 12 ? ' pm' : hr === 16 ? ' pm' : '') + '</span>';
    h += '<div class="day"><div class="dh">Your day<small data-dsum></small></div><div class="dt" data-dt></div><div class="dl">' + lb + '</div></div>'; }
  if(f.lunch) h += '<div class="dim" data-dim hidden><div class="dimc"><span class="moon">' + ic('moon') + '</span><span><b data-dimt></b><small data-dims></small></span></div></div>';
  this.h.innerHTML = '<div class="cc' + (this.nar ? ' nar' : '') + '" data-cc>' + h + '</div>';
  this.el = $('[data-cc]', this.h); this.dig = null; this.fdig = null;
  var me = this, el = this.el;
  this.ctx = { rg: $('[data-rg]', el), hint: $('[data-hint]', el) };
  bindPress(this, $('[data-pb]', el), this.ctx);
  el.addEventListener('click', function(e){ me.click(e); });
  el.addEventListener('input', function(e){ if(e.target.matches('[data-fr]')) me.scrub(+e.target.value); });
  el.addEventListener('keydown', function(e){ if(e.target.matches('[data-ni]')){ if(e.key === 'Enter'){ e.preventDefault(); me.saveNote(e.target.value); } else if(e.key === 'Escape'){ e.stopPropagation(); me.s.noteOpen = false; me.update(true); } } });
  if(sl) this.bindSlide();
};
function bindPress(c, btn, ctx){
  btn.addEventListener('pointerdown', function(e){ if(e.button) return; c.press(ctx); });
  btn.addEventListener('pointerup', function(){ c.release(ctx); });
  btn.addEventListener('pointerleave', function(){ c.cancelHold(ctx); });
  btn.addEventListener('keydown', function(e){ if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); if(e.repeat) return; if(c.s.run && !ctx.focus && c.slideOn()) c.wiggle(); else if(c.s.run && c.f.hold) c.held(ctx); else c.toggle(); } });
}
/* ---------- start, stop, hold, slide ---------- */
Card.prototype.press = function(ctx){
  var s = this.s, me = this;
  if(s.run && !ctx.focus && this.slideOn()){ this.wiggle(); return; }
  if(s.run && this.f.hold){ var rg = ctx.rg; if(rg) reflow(rg, 'holding'); if(ctx.hint) ctx.hint.textContent = 'Keep holding…';
    this.ht = setTimeout(function(){ me.ht = null; if(rg) rg.classList.remove('holding'); me.held(ctx); }, 700); return; }
  this.toggle();
};
Card.prototype.release = function(ctx){ if(this.ht){ this.cancelHold(ctx); var h = ctx.hint; if(h){ h.textContent = 'Hold it — 0.7 s'; setTimeout(function(){ if(h.textContent === 'Hold it — 0.7 s') h.textContent = 'Hold to stop'; }, 1400); } } };
Card.prototype.cancelHold = function(ctx){ if(this.ht){ clearTimeout(this.ht); this.ht = null; if(ctx && ctx.rg) ctx.rg.classList.remove('holding'); } };
Card.prototype.held = function(){ var s = this.s; s.run = false; s.rsn = true; s.st = 'stop'; this.closeLive(this.now()); this.showRsn(); this.update(true); };
Card.prototype.toggle = function(){ var s = this.s; if(s.run){ s.run = false; s.st = 'stop'; s.stopped = true; this.closeLive(this.now()); } else this.start(this.now()); this.update(true); };
Card.prototype.closeLive = function(at){ var s = this.s; s.day.forEach(function(d){ if(d.z == null) d.z = Math.max(d.a, at); }); s.stopAt = at; s.fix = null; };
Card.prototype.start = function(at){
  var s = this.s, live = s.b - sum(s.segs);
  if(live > 30) s.segs.push(['rep', live]);
  s.run = true; s.st = 'run'; s.rsn = false; s.paused = null; s.stopped = false; s.nextGone = false; s.badge = null; s.ls = at; s.lapB = s.b; s.laps = [];
  s.who.forEach(function(w){ w[2] = 0; });
  s.day.forEach(function(d){ if(d.z == null) d.z = at; });
  s.day.push({ a: at, z: null, k: 'rep', n: 'This operation' });
  if(at >= LA && at < LZ) s.lunchDone = true;
  this.clearRsn();
};
Card.prototype.pause = function(kind, at){ var s = this.s; s.run = false; s.paused = kind; s.st = 'stop'; s.rsn = false; this.clearRsn(); this.closeLive(at); if(this.fx) this.closeFocus(); };
Card.prototype.rsnEls = function(){ return $$('[data-rsn]', this.el).concat(this.fx ? $$('[data-frsn]', this.fx) : []); };
Card.prototype.clearRsn = function(){ this.rsnEls().forEach(function(r){ r.innerHTML = ''; }); };
Card.prototype.showRsn = function(){ var h = RSN.map(function(x, i){ return '<button data-r="' + esc(x[0]) + '" style="--c:' + x[1] + ';animation-delay:' + (i * 35) + 'ms"><i></i>' + esc(x[0]) + '</button>'; }).join(''); this.rsnEls().forEach(function(r){ r.innerHTML = h; }); };
Card.prototype.stopFor = function(r){
  var s = this.s; if(s.run){ s.run = false; this.closeLive(this.now()); }
  s.rsn = false; this.clearRsn(); s.st = r === 'Complete' ? 'done' : /^Waiting/.test(r) ? 'wait' : 'stop'; s.stopped = true; s.nextGone = false; s.paused = null;
  if(r === 'Complete' && this.f.badge && s.b < Q){ s.badge = [s.b, Math.round(Q / s.b * 100)]; s.badgeNew = true; }
  this.closeFocus(); toast(r === 'Complete' ? 'Operation complete · ' + hm(s.b) + ' on the clock.' : 'Stopped · ' + r + '.'); this.update(true);
};
Card.prototype.wiggle = function(){ var sl = $('[data-sl]', this.el); if(sl) reflow(sl, 'wig'); };
Card.prototype.bindSlide = function(){
  var me = this, sl = $('[data-sl]', this.el), hd = $('[data-slh]', sl), x0 = 0, max = 0, x = 0, drag = false;
  function set(v){ x = v; sl.style.setProperty('--x', v.toFixed(1) + 'px'); sl.style.setProperty('--p', max ? (v / max).toFixed(3) : '0'); }
  this.slSet = set;
  hd.addEventListener('pointerdown', function(e){ if(!me.s.run || e.button) return; drag = true; sl.classList.remove('snap'); max = sl.clientWidth - hd.offsetWidth - 8; x0 = e.clientX - x; try{ hd.setPointerCapture(e.pointerId); }catch(er){} e.preventDefault(); });
  hd.addEventListener('pointermove', function(e){ if(drag) set(Math.max(0, Math.min(max, e.clientX - x0))); });
  function end(){ if(!drag) return; drag = false; if(x >= max * .92){ set(max); setTimeout(function(){ me.slid(); }, 140); } else { sl.classList.add('snap'); set(0); } }
  hd.addEventListener('pointerup', end); hd.addEventListener('pointercancel', end); hd.addEventListener('lostpointercapture', end);
  hd.addEventListener('keydown', function(e){ if((e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowRight') && me.s.run){ e.preventDefault(); me.slid(); } });
};
Card.prototype.slid = function(){ var sl = $('[data-sl]', this.el); if(sl){ sl.classList.remove('snap'); if(this.slSet) this.slSet(0); } this.held(); };
/* ---------- the small tools on the card ---------- */
Card.prototype.click = function(e){
  var t = e.target, b, s = this.s;
  if((b = t.closest('[data-r]'))){ this.stopFor(b.getAttribute('data-r')); return; }
  if(t.closest('[data-big]') && this.f.left){ s.view = s.view === 'el' ? 'left' : 'el'; this.dig = null; var bg = $('[data-big]', this.el); reflow(bg, 'fl'); this.update(true); return; }
  if(t.closest('[data-wt]')){ this.start(this.now()); this.update(true); return; }
  if(t.closest('[data-focus]')){ this.openFocus(); return; }
  if((b = t.closest('[data-lap]'))){ this.lap(b); return; }
  if(t.closest('[data-pen]')){ this.openFix(); return; }
  if(t.closest('[data-fs]')){ this.saveFix(); return; }
  if(t.closest('[data-fu]')){ this.undoFix(); return; }
  if(t.closest('[data-nopen]')){ s.noteOpen = true; this.update(true); var i = $('[data-ni]', this.el); if(i) i.focus({ preventScroll: true }); return; }
  if(t.closest('[data-ns]')){ this.saveNote(($('[data-ni]', this.el) || {}).value); return; }
  if(t.closest('[data-nx]')){ s.noteOpen = false; this.update(true); return; }
  if(t.closest('[data-nxs]')){ s.nextGone = true; toast('Clocked on ' + NEXT[0] + ' — its card takes over.'); this.update(true); return; }
};
Card.prototype.lap = function(btn){
  var s = this.s; if(!s.run){ toast('Start the clock to mark a split.'); return; }
  var n = s.laps.length + 1 + (this.o.lapsBase || 0), d = s.b - s.lapB; s.laps.push([n, d, this.now()]); s.lapB = s.b; reflow(btn, 'ping');
  toast('Split ' + n + ' · ' + hms(d) + ' — saved as a time-stamped note in the Time tab.'); this.update(true);
};
Card.prototype.openFix = function(){ var s = this.s; if(!s.run) return; var live = s.day.filter(function(d){ return d.z == null; })[0], lnk = s.day.filter(function(d){ return d.lnk && d.z === s.ls; })[0];
  s.fix = { d: 0, ls0: s.ls, live: live, lnk: lnk }; this.update(true); var r = $('[data-fr]', this.el); if(r) r.focus({ preventScroll: true }); };
Card.prototype.scrub = function(d){ var s = this.s, x = s.fix; if(!x) return; var dd = (d - x.d) * 60; s.b += dd; s.who[0][2] += dd; x.d = d; s.ls = x.ls0 - d * 60; if(x.live) x.live.a = s.ls; if(x.lnk) x.lnk.z = Math.max(x.lnk.a, s.ls); this.update(true); };
Card.prototype.saveFix = function(){ var s = this.s, d = s.fix ? s.fix.d : 0; s.fix = null; toast(d ? 'Start moved to ' + tod(s.ls) + ' — saved with a note in the Time tab.' : 'Start unchanged.'); this.update(true); };
Card.prototype.undoFix = function(){ if(!this.s.fix) return; this.scrub(0); this.s.fix = null; toast('Start back to ' + tod(this.s.ls) + '.'); this.update(true); };
Card.prototype.saveNote = function(v){ v = (v || '').trim(); var s = this.s; if(!v){ toast('Type a few words first.'); return; } s.lastTxt = v; s.lastNoteT = this.now(); s.noteB = s.b; s.nudged = false; s.noteOpen = false; s.noteNew = true; toast('Note saved to this punch · ' + tod(this.now()) + '.'); this.update(true); };
/* ---------- focus mode: the card grows into a big shop-floor view (FLIP) ---------- */
function flipT(a, z){ return 'translate(' + (a.left - z.left).toFixed(1) + 'px,' + (a.top - z.top).toFixed(1) + 'px) scale(' + (a.width / z.width).toFixed(4) + ',' + (a.height / z.height).toFixed(4) + ')'; }
Card.prototype.openFocus = function(){
  if(FX) FX.closeFocus(true);
  var me = this, f = this.f, o = D.createElement('div'); o.className = 'fx';
  o.innerHTML = '<div class="fxs"></div><div class="fxp" role="dialog" aria-modal="true" aria-label="Focus view"><div class="fxc"><div class="fxt">RO 4518 · Op 1 · Aftertreatment repair · Unit 2214</div><div class="fxb' + (f.roll ? ' rd' : '') + '" data-fb></div><div class="fxl" data-fl></div>' + ringHtml(true, pbHtml('data-fpb'), 'data-frg', 'fxr') + '<div class="fxh" data-fh></div><div class="rsn" data-frsn></div><div class="fxk">Esc or tap anywhere to shrink back</div></div><button class="fxx" data-fxx aria-label="Shrink back (Esc)" title="Shrink back">' + ic('shrink') + '</button></div>';
  D.body.appendChild(o); this.fx = o; FX = this; this.fdig = null;
  var p = $('.fxp', o); this.fctx = { rg: $('[data-frg]', o), hint: $('[data-fh]', o), focus: 1 };
  bindPress(this, $('[data-fpb]', o), this.fctx);
  o.addEventListener('click', function(e){ var r = e.target.closest('[data-r]'); if(r){ me.stopFor(r.getAttribute('data-r')); return; } if(e.target.closest('[data-fxx]') || !e.target.closest('button')) me.closeFocus(); });
  this.update(true); if(this.s.rsn) this.showRsn();
  p.style.transformOrigin = '0 0';
  if(!reduced()){ var a = this.el.getBoundingClientRect(), z = p.getBoundingClientRect(); p.style.transition = 'none'; p.style.transform = flipT(a, z); p.getBoundingClientRect(); p.style.transition = ''; }
  requestAnimationFrame(function(){ o.classList.add('go'); p.style.transform = ''; });
  $('[data-fxx]', o).focus({ preventScroll: true });
};
Card.prototype.closeFocus = function(now){
  var o = this.fx; if(!o) return; this.cancelHold(this.fctx); this.fx = null; this.fctx = null; if(FX === this) FX = null;
  var p = $('.fxp', o); o.style.pointerEvents = 'none';
  if(now || reduced() || !this.el.isConnected){ o.remove(); return; }
  var z = p.getBoundingClientRect(), a = this.el.getBoundingClientRect(); o.classList.remove('go'); p.style.transform = flipT(a, z);
  setTimeout(function(){ o.remove(); }, 460);
  var fb = $('[data-focus]', this.el); if(fb) fb.focus({ preventScroll: true });
};
/* ---------- time passes ---------- */
Card.prototype.tick = function(dt, rdt){
  var s = this.s, f = this.f;
  if(this.o.fastLunch && s.paused === 'lunch') dt = Math.max(dt, rdt * 90);
  var pre = s.t0 + s.t; s.t += dt; s.rt += rdt; var now = pre + dt, add = s.run ? dt : 0;
  if(s.join && s.t >= s.join[0] && !s.joined){ s.joined = true; s.who.push(s.join[1].slice()); s.newWho = true; }
  if(f.parts && !s.allIn && s.rt >= s.partsAt){ s.allIn = true; s.allInT = s.rt; }
  if(f.lunch){
    if(s.run && !s.lunchDone && pre < LA && now >= LA){ add = Math.max(0, LA - pre); this.pause('lunch', LA); }
    if(s.paused === 'lunch' && now >= LZ){ s.lunchDone = true; this.start(LZ); add += now - LZ; s.backT = s.rt; }
    if(s.run && pre < DZ && now >= DZ){ add = Math.max(0, add - (now - DZ)); this.pause('eod', DZ); }
  }
  if(add <= 0) return;
  s.b += add; s.who.forEach(function(w){ w[2] += add; });
  [.5, .75, 1].forEach(function(p){ if(!s.hit[p] && s.b >= Q * p){ s.hit[p] = 1; s.lab = p === .5 ? 'Halfway' : p === .75 ? 'Last quarter' : 'At quoted'; s.labT = s.t; s.labNew = p; } });
  if(!s.upHit && s.b >= FU){ s.upHit = true; s.upNew = true; }
};
Card.prototype.update = function(full){
  var s = this.s, f = this.f, el = this.el, over = s.b > Q, left = Q - s.b, now = this.now(), me = this;
  var st = f.state ? (s.run ? 'run' : s.st) : null;
  var cls = 'cc' + (this.nar ? ' nar' : '') + (s.run ? ' run' : '') + (f.over && over ? ' over' : '') + (st ? ' st-' + st : '') + (s.paused ? ' dimd' : '');
  if(el.className !== cls) el.className = cls;
  /* the big number and its label */
  var txt = s.view === 'left' ? (left >= 0 ? hms(left) : '+' + hms(-left)) : hms(s.b), bg = $('[data-big]', el);
  if(f.roll) this.dig = roll(bg, txt, this.dig); else if(bg.textContent !== txt) bg.textContent = txt;
  var lt = s.view === 'left' ? (left >= 0 ? 'Time left · of <b>' + hms(Q) + '</b> quoted' : 'Over quoted') : (this.nar && (f.fixst || f.left) ? '' : 'On this operation · ') + (s.segs.length + 1) + ' entries';
  if(f.fixst && s.view !== 'left') lt += s.run ? ' · <span class="nw2">since <b>' + tod(s.ls, false) + '</b><button class="pen' + (s.fix ? ' on' : '') + '" data-pen aria-label="Fix the start" title="Fix the start">' + ic('pencil', 12) + '</button></span>' : ' · stopped ' + tod(s.stopAt, false);
  if(f.left && s.view !== 'left') lt += ' · <b>tap the time</b>';
  put($('[data-lbl]', el), lt);
  /* the button: start or stop (or the check / waiting state) */
  var side = $('[data-side]', el), pb = $('[data-pb]', el), path = $('path', pb);
  path.style.d = s.run ? STOP : PLAY;
  pb.classList.toggle('shim', !!(f.parts && s.allIn && !s.run && s.st !== 'done'));
  if(f.state){ var mode = s.run ? 'btn' : s.st === 'done' ? 'done' : s.st === 'wait' && !(f.parts && s.allIn) ? 'wait' : 'btn';
    if(side.getAttribute('data-mode') !== mode){ side.setAttribute('data-mode', mode); var ex = $('.ck,.wt', side); if(ex) ex.remove(); var w = $('[data-rg]', side) || pb;
      if(mode === 'done'){ w.style.display = 'none'; w.insertAdjacentHTML('beforebegin', '<span class="ck"><svg viewBox="0 0 24 24"><path d="M6 12.5l4 4 8-9"/></svg></span>'); }
      else if(mode === 'wait'){ w.style.display = 'none'; w.insertAdjacentHTML('beforebegin', '<button class="wt" data-wt title="Waiting · tap to start again" aria-label="Waiting — tap to start again">WAIT</button>'); }
      else w.style.display = ''; } }
  if(f.hold){ var hn = $('[data-hint]', el); if(hn && !this.ht && full) hn.textContent = s.run ? 'Hold to stop' : s.rsn ? 'Why did it stop?' : 'Tap to start'; }
  var rp = $('[data-rp]', el); if(rp) ringSet(rp, s.b);
  /* the bar */
  var scale = Math.max(Q * 1.12, s.b * 1.03), pct = function(x){ return (Math.max(0, x) / scale * 100).toFixed(3) + '%'; }, upto = Math.min(s.b, Q);
  $('[data-qt]', el).style.left = pct(Q);
  var fl = $('[data-fill]', el); if(fl){ fl.style.width = pct(f.over ? upto : s.b); fl.style.background = !f.over && over ? 'var(--over)' : ''; }
  var sg = $('[data-segs]', el);
  if(sg){ var closed = sum(s.segs), live = Math.max(0, s.b - closed), L = s.segs.concat([['rep', live, 1]]), acc = 0, cap = f.over ? Q : Infinity;
    if(sg.children.length !== L.length) sg.innerHTML = L.map(function(x){ return '<i' + (x[2] ? ' class="live"' : '') + ' style="--c:var(--r-' + x[0] + ')"></i>'; }).join('');
    L.forEach(function(x, i){ var w = Math.max(0, Math.min(x[1], cap - acc)); acc += x[1]; sg.children[i].style.width = 'calc(' + pct(w) + ' - ' + (i < L.length - 1 ? 2 : 0) + 'px)'; }); }
  var ov = $('[data-ov]', el); if(ov){ ov.style.left = pct(Q); ov.style.width = over ? pct(s.b - Q) : '0%'; }
  var gh = $('[data-gh]', el); if(gh){ gh.style.left = pct(Math.min(s.b, Q)); gh.style.width = over ? '0%' : pct(Q - s.b); }
  if(f.miles){ [.5, .75].forEach(function(p){ var m = $('[data-ms="' + p + '"]', el); m.style.left = pct(Q * p); m.classList.toggle('hit', !!s.hit[p]); if(s.labNew === p) reflow(m, 'pop'); }); }
  var bz = s.b < BAND[0] ? 'lo' : s.b > BAND[1] ? 'hi' : 'in';
  if(f.band){ var bd = $('[data-band]', el); bd.style.left = pct(BAND[0]); bd.style.width = pct(BAND[1] - BAND[0]); $('[data-bu]', el).style.left = pct(BAND[2]); var hr = $('[data-here]', el); hr.style.left = pct(s.b); hr.classList.toggle('out', bz !== 'in'); }
  if(f.upace){ var up = $('[data-up]', el); up.style.left = pct(FU); if(s.upNew){ s.upNew = false; reflow(up, 'pop'); } }
  /* the one-line facts */
  if(f.pace) this.fact('pace', over ? 'Quoted ran out <b>' + Math.floor((s.b - Q) / 60) + ' min</b> ago' : s.run ? 'Quoted runs out about <b>' + endAt(now, left, s.lunchDone) + '</b>' : 'Quoted has <b>' + hm(left) + '</b> left');
  if(f.upace){ var rem = FU - s.b, uz = rem > 0 ? 'a' : 'b';
    this.fact('upace', rem > 0 ? (s.run ? 'At your usual <b>112%</b>: done about <b>' + endAt(now, rem, s.lunchDone) + '</b>' : '<b>' + hm(rem) + '</b> more at your usual 112%') : 'Past your usual finish — <b>' + (s.b - FU < 3600 ? Math.max(1, Math.floor((s.b - FU) / 60)) + ' min' : hm(s.b - FU)) + '</b> beyond your 112% pace', s.upZ && s.upZ !== uz); s.upZ = uz; }
  if(f.band){ this.fact('band', bz === 'in' ? 'Similar jobs <b>5.2–7.8 h</b> · usually 6.4 — you’re in range' : bz === 'lo' ? 'Similar jobs <b>5.2–7.8 h</b> · usually 6.4 — you’re under it' : 'Past most similar jobs — they ran <b>5.2–7.8 h</b>', s.bandZ && s.bandZ !== bz); s.bandZ = bz; }
  if(f.lunch) this.fact('lunch', s.paused === 'lunch' ? 'Lunch — the clock wakes itself at <b>12:30</b>' : s.paused === 'eod' ? 'End of day — the clock stopped itself at <b>4:00 pm</b>' : now < LA && !s.lunchDone ? 'Lunch in <b>' + cd(LA - now) + '</b>' + (s.run ? ' — the clock pauses itself' : '') : now < DZ ? 'End of day in <b>' + cd(DZ - now) + '</b>' + (s.run ? ' — the clock stops itself' : '') : 'After hours');
  /* the chips */
  var dn = $('[data-done]', el); if(dn){ var bk = s.badge ? 'b' + s.badge[0] : '';
    if(dn._k !== bk){ dn._k = bk; var pop = s.badgeNew && !reduced(); s.badgeNew = false;
      dn.innerHTML = s.badge ? '<span class="done' + (pop ? ' pop' : '') + '">' + ic('check') + 'Done in ' + hm(s.badge[0]) + ' · ' + s.badge[1] + '%' + (pop ? '<span class="burst">' + burst() + '</span>' : '') + '</span>' : ''; } }
  var wb = $('[data-who]', el); if(wb){ if(wb.children.length !== s.who.length){ wb.innerHTML = s.who.map(function(w, i){ return '<span class="who' + (s.newWho && i === s.who.length - 1 ? ' in' : '') + '"><span class="av">' + w[1] + '</span><b>' + esc(w[0].split(' ')[0]) + '</b><span class="m">' + ms(w[2]) + '</span></span>'; }).join(''); s.newWho = false; }
    else s.who.forEach(function(w, i){ var m = $('.m', wb.children[i]), t = ms(w[2]); if(m.textContent !== t) m.textContent = t; }); }
  var pp = $('[data-parts]', el); if(pp){ var col = s.allIn && s.rt - s.allInT > 8, pk = s.allIn ? (col ? 'C' : 'A') : 'a';
    if(pp._k !== pk){ var fresh = pp._k === 'a' && pk === 'A'; pp._k = pk;
      pp.innerHTML = col ? '<span class="pt in all">' + ic('check', 12) + 'Parts · all 3 in hand</span>' : s.parts.map(function(p){ return p[1] ? '<span class="pt in">' + ic('check', 12) + esc(p[0]) + '</span>' : s.allIn ? '<span class="pt in' + (fresh ? ' fl' : '') + '">' + ic('check', 12) + esc(p[0]) + ' · just in</span>' : '<span class="pt eta"><i></i>' + esc(p[0]) + ' · ETA ' + p[2] + '</span>'; }).join('') + (s.allIn ? '<span class="allin">' + ic('parts', 12) + 'All parts in</span>' : ''); } }
  var ol = $('[data-ovl]', el); if(ol){ if(over){ var ot = '+' + hms(s.b - Q).replace(/^0:/, '') + ' over'; if(!ol.firstChild) ol.innerHTML = '<span class="ovl">' + ic('flag', 12) + '<span>' + ot + '</span></span>'; else { var o2 = $('.ovl span', ol); if(o2.textContent !== ot) o2.textContent = ot; } } else if(ol.firstChild) ol.innerHTML = ''; }
  var mb = $('[data-mlb]', el); if(mb){ if(s.labNew){ mb.innerHTML = '<span class="mlb">' + ic('check', 12) + s.lab + '</span>'; s.labNew = 0; } else if(mb.firstChild && s.t - s.labT > 6 * Math.max(1, V.speed)) mb.innerHTML = ''; }
  var bkc = $('[data-back]', el); if(bkc) put(bkc, s.rt - s.backT < 6 && s.run ? '<span class="mlb">' + ic('sun', 12) + 'Back from lunch — clock on again</span>' : '');
  var ng = $('[data-nudge]', el); if(ng){ var gap = s.b - s.noteB, show = s.run && gap >= 2700 && !s.noteOpen;
    if(show){ var nt0 = 'No note for ' + Math.floor(gap / 60) + ' min — add one?'; if(!ng.firstChild){ ng.innerHTML = '<button class="nudge' + (s.wiggled ? '' : ' in') + '" data-nopen>' + ic('note', 12) + '<span>' + nt0 + '</span></button>'; s.wiggled = true; s.nudged = true; } else put($('span', ng.firstChild), nt0); }
    else if(ng.firstChild) ng.innerHTML = ''; }
  /* splits */
  var ll = $('[data-lapl]', el); if(ll){ var n = s.laps.length; if(ll._n !== n){ var neu = ll._n != null && n > ll._n; ll._n = n; var LL = s.laps.slice(-3);
      ll.innerHTML = (n > 3 ? '<span class="lap more">+' + (n - 3) + '</span>' : '') + LL.map(function(x, i){ return '<span class="lap' + (neu && i === LL.length - 1 ? ' in' : '') + '">' + ic('flag', 12) + '<b>Split ' + x[0] + '</b>' + hms(x[1]) + '<small>' + tod(x[2]) + '</small></span>'; }).join(''); }
    var lc = $('[data-lapc]', el); lc.hidden = !s.run; if(s.run) put(lc, 'Split ' + (n + 1 + (this.o.lapsBase || 0)) + ' · ' + hms(s.b - s.lapB)); }
  /* the note */
  var nte = $('[data-note]', el); if(nte){ put(nte, (s.noteOpen ? '<div class="nf"><input data-ni placeholder="What are you on right now?" aria-label="Note for this punch" enterkeyhint="done"><button class="btn sm pri" data-ns>Save</button><button class="btn sm gh" data-nx>Cancel</button></div>' : '') + '<div class="nl' + (s.noteNew ? ' in' : '') + '">' + ic('note', 12) + '<span>Last note <b>' + tod(s.lastNoteT) + '</b> · ' + esc(s.lastTxt) + '</span>' + (s.noteOpen ? '' : '<button class="lk" data-nopen>Add a note</button>') + '</div>'); s.noteNew = false; }
  /* fix the start */
  var fx = $('[data-fix]', el); if(fx){ if(s.fix){ if(fx.hidden){ fx.hidden = false; fx._h = null; put(fx, '<span class="fxl1">' + ic('pencil', 13) + 'Started</span><input type="range" min="0" max="60" step="1" value="' + s.fix.d + '" dir="rtl" data-fr aria-label="Move the start earlier, up to 60 min"><span class="fv" data-fv></span><span class="fbt"><button class="btn sm pri" data-fs>Save</button><button class="btn sm gh" data-fu>' + ic('undo') + 'Undo</button></span><small data-fw></small>'); }
      put($('[data-fv]', fx), '<b>' + tod(s.ls) + '</b>' + (s.fix.d ? ' · +' + s.fix.d + ' min' : ''));
      put($('[data-fw]', fx), s.fix.d ? 'Trims the RO 4502 punch before it to ' + tod(s.ls) + '.' : 'Drag left to move the start earlier — up to 60 min.'); }
    else if(!fx.hidden){ fx.hidden = true; fx._h = null; fx.innerHTML = ''; } }
  /* slide, next up, lunch */
  var sl = $('[data-sl]', el); if(sl && sl.hidden === s.run) sl.hidden = !s.run;
  var nx = $('[data-next]', el); if(nx){ var on2 = !s.run && s.stopped && !s.nextGone && !s.rsn && !s.paused; if(nx.hidden === on2) nx.hidden = !on2; }
  var dm = $('[data-dim]', el); if(dm){ var dmo = !!s.paused; if(dm.hidden === dmo) dm.hidden = !dmo; if(dmo){ put($('[data-dimt]', dm), s.paused === 'lunch' ? 'Lunch' : 'End of day'); put($('[data-dims]', dm), s.paused === 'lunch' ? 'back 12:30 — the clock wakes itself' : 'stopped itself at 4:00 pm · back 7:00 am'); } }
  /* the numbers */
  var kb = $('[data-kb]', el), kl = $('[data-kl]', el), ke = $('[data-ke]', el);
  put(kb, h2(s.b) + '<em>h</em>'); put(kl, (left < 0 ? '−' + h2(-left) : h2(left)) + '<em>h</em>'); kl.className = left < 0 && f.over ? 'r' : '';
  var eff = Math.round(Q / Math.max(1, s.b) * 100); put(ke, eff + '<em>%</em>'); ke.className = eff >= 100 ? 'g' : f.over ? 'r' : '';
  /* your day */
  var dt = $('[data-dt]', el); if(dt){ var P = function(t){ return Math.max(0, Math.min(1, (t - DA) / (DZ - DA))) * 100; };
    if(dt._n !== s.day.length){ dt._n = s.day.length; var hrs = ''; for(var i = 1; i < 9; i++) hrs += '<span class="hr" style="left:' + (i / 9 * 100).toFixed(2) + '%"></span>';
      dt.innerHTML = hrs + '<span class="lun" style="left:' + P(LA).toFixed(2) + '%;width:' + (P(LZ) - P(LA)).toFixed(2) + '%" title="Lunch 12:00 – 12:30"></span>' + s.day.map(function(d, i){ return '<i class="blk' + (d.k === 'o' ? ' o' : '') + '" data-bi="' + i + '" title="' + esc(d.n) + '" style="--c:var(--r-' + d.k + ')"></i>'; }).join('') + '<span class="nw" data-nw></span>'; }
    var mine = 0, other = 0;
    s.day.forEach(function(d, i){ var z = d.z == null ? now : d.z, b = dt.querySelector('[data-bi="' + i + '"]'), a0 = P(d.a), w = Math.max(0, P(z) - a0); b.style.left = a0.toFixed(3) + '%'; b.style.width = w.toFixed(3) + '%'; b.classList.toggle('live', d.z == null && s.run); var dur = Math.max(0, Math.min(z, now) - d.a); if(d.k === 'o') other += dur; else mine += dur; });
    $('[data-nw]', dt).style.left = P(now).toFixed(3) + '%';
    put($('[data-dsum]', el), 'this operation <b>' + hm(mine) + '</b> today · other jobs ' + hm(other) + ' · now ' + tod(now)); }
  if(this.fx) this.updFocus(txt, left);
};
Card.prototype.fact = function(k, h, flip){ var n = $('[data-f="' + k + '"]', this.el); if(!n) return; if(put(n.lastChild, h) && flip) reflow(n, 'fl'); };
function ringSet(rp, b){ var p = Math.min(1, b / Q); rp.setAttribute('stroke-dashoffset', (RC * (1 - p)).toFixed(1)); rp.style.setProperty('--rc', p >= 1 ? 'var(--over)' : p >= .9 ? 'var(--warn)' : 'var(--good)'); }
function burst(){ var C = ['var(--acc)', '#E2A84C', 'var(--r-diag)', '#C0662F', 'var(--lunch)', 'var(--good)'], h = ''; for(var i = 0; i < 16; i++){ var a = (i / 16) * 2 * Math.PI + (i % 2) * .2, rx = 96 + (i % 3) * 14, ry = 26 + (i % 4) * 7; h += '<i style="--dx:' + (Math.cos(a) * rx).toFixed(0) + 'px;--dy:' + (Math.sin(a) * ry).toFixed(0) + 'px;--c:' + C[i % C.length] + ';animation-delay:' + (100 + (i % 4) * 30) + 'ms"></i>'; } return h; }
Card.prototype.updFocus = function(txt, left){
  var o = this.fx, s = this.s, f = this.f, fb = $('[data-fb]', o);
  if(f.roll) this.fdig = roll(fb, txt, this.fdig); else if(fb.textContent !== txt) fb.textContent = txt;
  put($('[data-fl]', o), left >= 0 ? '<b>' + hm(left) + '</b> left of ' + hm(Q) + ' quoted' : '<b>+' + hm(-left) + '</b> over quoted');
  ringSet($('[data-rp]', o), s.b); $('[data-fpb] path', o).style.d = s.run ? STOP : PLAY;
  if(!this.ht) put($('[data-fh]', o), s.run ? (f.hold ? 'Hold to stop' : 'Tap to stop') : s.rsn ? 'Why did it stop?' : s.paused ? 'Paused for ' + (s.paused === 'lunch' ? 'lunch' : 'the end of the day') : 'Tap to start');
  o.classList.toggle('run', s.run);
};
/* ---------- the page ---------- */
function useBtn(k){ return '<button class="use" data-use="' + k + '" aria-pressed="' + !!V.use[k] + '"><span class="bx"></span>' + (V.use[k] ? 'On my card' : 'Use it') + '</button>'; }
function rep(k, t){ return '<button class="btn sm gh" data-replay="' + k + '">' + ic('undo') + t + '</button>'; }
function idCtl(k){
  var c = {
    day: '<span>Try ×600 — the day fills and the marker glides</span>',
    lap: '<span>Tap the flag beside Start/Stop</span>',
    slide: '<span>Drag the handle all the way · let go early and it snaps back</span>',
    focus: '<span>Tap ' + ic('expand', 13) + ' on the card · Esc or a tap shrinks it back</span>',
    band: rep('band', 'Again — 20 s before the band ends'),
    upace: rep('upace', 'Again — 40 s before your usual finish'),
    fixst: '<span>Tap the pencil by “since 10:13”</span>',
    nudge: rep('nudge', 'Again — 10 s before the nudge'),
    parts: rep('parts', 'Again — the last part lands in 6 s'),
    next: '<span>Stop the clock, or</span><button class="btn sm" data-act="complete" data-k="next">' + ic('check') + 'Complete it</button>',
    badge: '<button class="btn sm" data-act="complete" data-k="badge">' + ic('check') + 'Complete it</button>' + rep('badge', 'Again'),
    lunch: rep('lunch', 'Again — 20 s before lunch') + '<span>· lunch runs fast here</span>'
  }[k];
  return c ? '<div class="ctl">' + c + '</div>' : '';
}
var DEMO = { lap: { lapBack: 872, laps: [[1, 3028, LS0 + 3028]] }, slide: { nar: 1 }, band: { b: BAND[1] - 20 }, upace: { b: Math.round(FU) - 40 }, nudge: { noteAgo: 44 * 60 + 50, noteTxt: 'Clamps off, DPF on the bench' }, parts: { run: false, partsAt: 6 }, badge: { b: 5 * 3600 + 12 * 60 - 8 }, lunch: { t0: LA - 20, fastLunch: 1 } };
var YOU = { join: [6, ['Dana Kowalski', 'DK', 0]], noteAgo: 38 * 60, partsAt: 12 }, PHONE = { join: [6, ['Dana Kowalski', 'DK', 0]], noteAgo: 38 * 60, partsAt: 12, nar: 1 };
function flagsYou(){ var f = {}; R1.forEach(function(x){ if(V.r1[x[0]]) f[x[0]] = 1; }); NEW.forEach(function(x){ if(V.use[x[0]]) f[x[0]] = 1; }); return f; }
function one(k){ var f = {}; f[k] = 1; return f; }
function r1Html(){
  var on = NEW.filter(function(x){ return V.use[x[0]]; });
  return '<div class="r1"><span class="r1l">On your card from round 1</span>' + R1.map(function(x){ var o = !!V.r1[x[0]]; return '<button class="rc" data-r1="' + x[0] + '" aria-pressed="' + o + '" title="' + (o ? 'Take it off' : 'Put it back') + '">' + (o ? ic('check', 11) : '') + esc(x[1]) + '</button>'; }).join('') + '</div>'
    + '<div class="r1"><span class="r1l">New on your card</span>' + (on.length ? on.map(function(x){ return '<button class="rc" data-use="' + x[0] + '" aria-pressed="true" title="Take it off">' + esc(x[1]) + ic('x', 11) + '</button>'; }).join('') : '<span>none yet — use the buttons below</span>') + '</div>';
}
function draw(){
  var y = window.scrollY;
  if(FX) FX.closeFocus(true);
  var lead = '<div class="lead"><div class="yc"><div class="yh"><h2>Your card</h2><span class="shop">Shop clock <b data-shop></b></span></div><div class="sub">Your 10 from round 1 plus the new ones you turn on — live. Start and stop it.</div><div data-card="you"></div><div class="r1s">' + r1Html() + '</div></div>'
    + '<div class="yc ph"><div class="yh"><h2>On a phone</h2></div><div class="sub">The same card at 360 px.</div><div class="phone"><div class="scr"><div class="pst"><span data-pclk></span><span class="pnotch"></span><span>RO 4518</span></div><div class="ptl"><b>Op 1 · Aftertreatment repair</b><small>Unit 2214 · Kenworth T680</small></div><div data-card="phone"></div></div></div></div></div>';
  var ids = '<div class="ids">' + NEW.map(function(x, i){ var k = x[0], c = '<div data-card="' + k + '"></div>'; if(k === 'slide') c = '<div class="phone sm"><div class="scr">' + c + '</div></div>';
    return '<div class="idc' + (V.use[k] ? ' on' : '') + '" data-id="' + k + '"><div class="idh"><span class="n">' + (i + 1) + '</span><div><b>' + esc(x[1]) + (SUG[k] ? ' <em class="sg">SUGGESTED</em>' : '') + '</b><small>' + esc(x[2]) + '</small></div>' + useBtn(k) + '</div>' + c + idCtl(k) + '</div>'; }).join('') + '</div>';
  $('#pg').innerHTML = '<div class="wrap"><div class="two"><div>' + lead + ids + '</div>' + chsHtml() + '</div></div>';
  CARDS = [new Card($('[data-card="you"]'), flagsYou(), YOU), new Card($('[data-card="phone"]'), flagsYou(), PHONE)];
  NEW.forEach(function(x){ CARDS.push(new Card($('[data-card="' + x[0] + '"]'), one(x[0]), DEMO[x[0]])); });
  window.scrollTo(0, y); sync(); clocks();
}
function cardOf(k){ var host = $('[data-card="' + k + '"]'); return CARDS.filter(function(c){ return c.h === host; })[0]; }
function refreshUse(){
  if(FX) FX.closeFocus(true);
  $$('.idc').forEach(function(t){ var k = t.getAttribute('data-id'); t.classList.toggle('on', !!V.use[k]); var b = $('.idh .use', t); b.outerHTML = useBtn(k); });
  $('.r1s').innerHTML = r1Html();
  [['you', YOU], ['phone', PHONE]].forEach(function(p, i){ var c = CARDS[i]; CARDS[i] = new Card(c.h, flagsYou(), p[1], c.s); });
  redrawChs(); pkDraw();
}
function sync(){
  $$('.mk button[data-th]').forEach(function(b){ b.setAttribute('aria-pressed', String(b.getAttribute('data-th') === V.th)); });
  $$('[data-speed]').forEach(function(b){ b.setAttribute('aria-pressed', String(+b.getAttribute('data-speed') === V.speed)); });
  D.documentElement.setAttribute('data-th', V.th);
  D.documentElement.classList.toggle('calm', V.motion === 'calm'); D.documentElement.classList.toggle('motion-auto', V.motion === 'auto');
}
function clocks(){ var a = $('[data-shop]'), p = $('[data-pclk]'); if(a && CARDS[0]) put(a, tod(CARDS[0].now())); if(p && CARDS[1]) put(p, tod(CARDS[1].now(), false)); }
/* ---------- the choices ---------- */
var CH = [
  ['ROUND 2', 'use', 'New on the card', 'pick any — or use the buttons on each idea', NEW.map(function(x){ return [x[0], x[1], '', SUG[x[0]]]; }), 1],
  ['ROUND 1', 'r1', 'Still on the card', 'your picks from last time — untick to drop one', R1.map(function(x){ return [x[0], x[1], '']; }), 1],
  ['', 'motion', 'Motion', '', [['auto', 'Follow the computer’s “reduce motion” setting', 'full motion unless it’s turned on', 1], ['full', 'Full, always', ''], ['calm', 'Calm — numbers and bars move, nothing pulses', 'see it now']]],
  ['', 'pages', 'The same card on', 'pick any', [['ro', 'The RO page', '', 1], ['tech', 'The Technician page', '', 1]], 1]
];
function chsHtml(){
  return '<div class="chs">' + CH.map(function(c){ var k = c[1], multi = c[5];
    return (c[0] ? '<div class="ch" style="padding:0;background:none;box-shadow:none"><div class="hd">' + c[0] + '</div></div>' : '') + '<div class="ch"><b>' + c[2] + '</b>' + (c[3] ? '<small>' + c[3] + '</small>' : '') + '<div class="ol">' + c[4].map(function(o){ var on = multi ? !!V[k][o[0]] : V[k] === o[0]; return '<button class="opt' + (multi ? ' sq' : '') + '" data-ch="' + k + '" data-v="' + o[0] + '" aria-pressed="' + on + '"><i></i><span><b>' + o[1] + (o[3] ? '<em>SUGGESTED</em>' : '') + '</b>' + (o[2] || '') + '</span></button>'; }).join('') + '</div></div>'; }).join('') + '</div>';
}
function redrawChs(){ var c = $('.chs'), y = c ? c.scrollTop : 0; if(c){ c.outerHTML = chsHtml(); $('.chs').scrollTop = y; } }
function pkText(){
  var L = ['Parsec · Operation clock card, round 2 — my picks'];
  var r1 = R1.filter(function(x){ return V.r1[x[0]]; }).map(function(x){ return x[1]; }), off = R1.filter(function(x){ return !V.r1[x[0]]; }).map(function(x){ return x[1]; });
  L.push('· On the card (round 1): ' + (r1.length ? r1.join(', ') : 'none') + (off.length ? ' — taken off: ' + off.join(', ') : ''));
  var nw = NEW.filter(function(x){ return V.use[x[0]]; }).map(function(x){ return x[1]; });
  L.push('· New on the card: ' + (nw.length ? nw.join(', ') : 'none'));
  L.push('· Motion: ' + CH[2][4].filter(function(o){ return o[0] === V.motion; })[0][1]);
  L.push('· The same card on: ' + (CH[3][4].filter(function(o){ return V.pages[o[0]]; }).map(function(o){ return o[1]; }).join(', ') || 'neither'));
  if(V.note.trim()) L.push('· Notes: ' + V.note.trim());
  return L.join('\n');
}
function pkDraw(){ var w = $('#picks'); w.hidden = !V.picks; if(!V.picks) return;
  w.innerHTML = '<div class="pk-h"><b>Your picks</b><button class="x" data-pk="x" aria-label="Close">' + ic('x', 15) + '</button></div><pre>' + esc(pkText()) + '</pre><div class="pk-r"><span>Anything else</span><textarea id="pk-note" placeholder="e.g. a longer lunch, a different split label">' + esc(V.note) + '</textarea></div><button class="btn pri" data-pk="copy">' + ic('copy') + 'Copy for the chat</button>'; }
function toast(m){ var t = $('.toast'); if(t) t.remove(); t = D.createElement('div'); t.className = 'toast'; t.setAttribute('role', 'status'); t.textContent = m; D.body.appendChild(t); clearTimeout(toast.h); toast.h = setTimeout(function(){ t.remove(); }, 2800); }
/* ---------- events ---------- */
D.addEventListener('click', function(e){
  var t = e.target, b;
  if((b = t.closest('.mk button[data-th]'))){ V.th = b.getAttribute('data-th'); sync(); return; }
  if((b = t.closest('[data-speed]'))){ V.speed = +b.getAttribute('data-speed'); sync(); return; }
  if((b = t.closest('[data-use]'))){ var k = b.getAttribute('data-use'); V.use[k] = V.use[k] ? 0 : 1; refreshUse(); return; }
  if((b = t.closest('[data-r1]'))){ var k1 = b.getAttribute('data-r1'); V.r1[k1] = V.r1[k1] ? 0 : 1; refreshUse(); return; }
  if((b = t.closest('[data-ch]'))){ var k2 = b.getAttribute('data-ch'), v = b.getAttribute('data-v');
    if(k2 === 'use' || k2 === 'r1' || k2 === 'pages'){ V[k2][v] = V[k2][v] ? 0 : 1; if(k2 !== 'pages'){ refreshUse(); return; } } else V[k2] = v;
    sync(); redrawChs(); pkDraw(); return; }
  if((b = t.closest('[data-replay]'))){ var k3 = b.getAttribute('data-replay'), c = cardOf(k3), i = CARDS.indexOf(c); if(c.fx) c.closeFocus(true); CARDS[i] = new Card(c.h, one(k3), DEMO[k3]); return; }
  if((b = t.closest('[data-act="complete"]'))){ var c2 = cardOf(b.getAttribute('data-k')); if(c2.s.st !== 'done') c2.stopFor('Complete'); return; }
  if((b = t.closest('[data-pk]'))){ var a = b.getAttribute('data-pk'); if(a === 'x'){ V.picks = false; pkDraw(); }
    if(a === 'copy'){ var tx = pkText(); (navigator.clipboard ? navigator.clipboard.writeText(tx) : Promise.reject()).then(function(){ toast('Copied — paste it in the chat.'); }, function(){ var ta = D.createElement('textarea'); ta.value = tx; D.body.appendChild(ta); ta.select(); try{ D.execCommand('copy'); toast('Copied — paste it in the chat.'); }catch(er){} ta.remove(); }); }
    return; }
  if(t.closest('#pk-open')){ V.picks = !V.picks; pkDraw(); return; }
});
D.addEventListener('input', function(e){ if(e.target.id === 'pk-note'){ V.note = e.target.value; var pre = $('#picks pre'); if(pre) pre.textContent = pkText(); } });
D.addEventListener('keydown', function(e){ if(e.key !== 'Escape') return; if(FX){ FX.closeFocus(); return; } if(V.picks){ V.picks = false; pkDraw(); } });
var RZ; window.addEventListener('resize', function(){ clearTimeout(RZ); RZ = setTimeout(function(){ CARDS.forEach(function(c, i){ var n = !!c.o.nar || c.h.clientWidth < 440; if(n !== c.nar){ if(c.fx) c.closeFocus(true); CARDS[i] = new Card(c.h, c.f, c.o, c.s); } }); }, 200); });
var LAST = performance.now();
setInterval(function(){ var now = performance.now(), r = Math.min(1, (now - LAST) / 1000), dt = r * V.speed; LAST = now; CARDS.forEach(function(c){ c.tick(dt, r); c.update(false); }); clocks(); }, 200);
draw();
