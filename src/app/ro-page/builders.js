/* Parsec · ro-page · builders.js
   Small builders: fields, dropdowns, the pop-over pinning (a pop-over stays put while the page redraws), live updaters for totals.
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   tick field autoWidthInput dropdown popIsOpen syncPaneLift closeMenus placeMenu pinPop unpinPop repinPops pinOpenPops … (17 functions, 3 constants)
   uses       access/ kit/ ro/ shell/
   at load    on window resize · on window scroll · on document pointerdown · on document click
*/
/* ============================ small builders ============================ */

function tick(on, onClick, cls) {
  var b = el('button', { class: 'tick' + (on ? ' on' : '') + (cls ? ' ' + cls : ''), type: 'button', title: 'Toggle', onClick: onClick });
  b.appendChild(svg(ICON.check, 11, 2.2));
  b.style.color = '#FFF';
  return b;
}
function field(cls, value, placeholder, onInput, style) {
  return el('input', {
    class: cls, type: 'text', value: value || '', placeholder: placeholder || '',
    style: style || '', onInput: function (e) { onInput(e.target.value); }
  });
}
/* Sizes an input to its own text/placeholder as you type, clamped to [minPx, maxPx].
   Works everywhere (unlike CSS field-sizing, which not every browser supports yet) —
   a hidden mirror span measures the text and the input's width is set to match. */
var AUTO_WIDTH_MIRROR = null;
function autoWidthInput(input, minPx, maxPx) {
  if (!AUTO_WIDTH_MIRROR) {
    AUTO_WIDTH_MIRROR = document.createElement('span');
    AUTO_WIDTH_MIRROR.style.cssText = 'position:absolute;left:-9999px;top:-9999px;visibility:hidden;white-space:pre;';
    document.body.appendChild(AUTO_WIDTH_MIRROR);
  }
  function sync() {
    if (!input.isConnected) { requestAnimationFrame(sync); return; }
    var cs = window.getComputedStyle(input);
    AUTO_WIDTH_MIRROR.style.font = cs.font;
    AUTO_WIDTH_MIRROR.style.fontFamily = cs.fontFamily; AUTO_WIDTH_MIRROR.style.fontSize = cs.fontSize;
    AUTO_WIDTH_MIRROR.style.fontWeight = cs.fontWeight; AUTO_WIDTH_MIRROR.style.fontStyle = cs.fontStyle;
    AUTO_WIDTH_MIRROR.style.letterSpacing = cs.letterSpacing;
    AUTO_WIDTH_MIRROR.textContent = input.value || input.placeholder || '';
    var w = AUTO_WIDTH_MIRROR.offsetWidth +
      (parseFloat(cs.paddingLeft) || 0) + (parseFloat(cs.paddingRight) || 0) + 4;
    input.style.width = Math.max(minPx, Math.min(maxPx, w)) + 'px';
  }
  input.addEventListener('input', sync);
  sync();
}
function dropdown(items, current, onPick, key) {
  var menu = el('div', { class: 'menu' });
  items.forEach(function (it, i) {
    var subs = key === 'status' && roStatusOption(it.name) ? roStatusOption(it.name).subs : [];
    menu.appendChild(el('button', { class: 'menuItem', type: 'button',
      onClick: function (e) {
      e.stopPropagation(); closeMenus(); onPick(i);
    } }, [
      el('span', { style: 'display:inline-block;width:8px;height:8px;border-radius:calc(2px * var(--rs, 1));flex-shrink:0;background:' + (it.dot || it.fg) }),
      el('span', { style: 'font-size:11px;font-weight:700;letter-spacing:.06em;color:var(--ink-strong);min-width:96px;flex-shrink:0', text: it.label || it.key }),
      el('span', { class: 'grow', style: 'font-size:11px;line-height:1.3;color:var(--hint)', text: it.hint }),
      i === current ? (function () { var c = svg(ICON.check, 12, 2); c.style.color = 'var(--blue-ink)'; c.style.flexShrink = '0'; return c; })() : null
    ]));
    if (subs.length) {
      var curSub = RO ? roStatus(RO) : null;
      menu.appendChild(el('div', { class: 'subRow' }, subs.map(function (sb) {
        var on = curSub && curSub.status === it.name && curSub.sub === sb;
        return el('button', { class: 'subChip' + (on ? ' on' : ''), type: 'button', text: sb, onClick: function (e) {
          e.stopPropagation(); closeMenus();
          if (setRoStatus(RO.id, it.name, sb) === false) { setTimeout(tecRender, 0); return; }
          save(); render(); tecRender();
        } });
      })));
    }
  });
  menu.dataset.menu = key;
  return menu;
}
/* The console sits in a pane the docked day bar is allowed to paint over (z-index 1 vs 30),
   so a menu near the bottom of a job card disappeared behind the bar however high its own
   z-index went. The pane is lifted for as long as a menu is open, and dropped back after. */
/* A pop-over is open when a menu is open or anything is pinned. Two things follow:
   the console's pane is lifted over the docked day bar, and the hover-lift rules are
   switched off — those use `translate`, which makes the lifted element the containing
   block for its position:fixed children, so a menu inside one resolved its viewport
   coordinates against that box and landed off-screen until the pointer left it. */
function popIsOpen() { return !!(openMenu || (PINNED && PINNED.length)); }
function syncPaneLift(force) {
  var on = force === undefined ? popIsOpen() : force;
  var pane = HOST && HOST.closest ? HOST.closest('.jc-pane') : null;
  if (pane) pane.style.zIndex = on ? '40' : '';
  if (HOST) HOST.classList.toggle('popOpen', on);
}
function closeMenus() {
  if (!R) return;
  if (STG_OPEN) { STG_OPEN = null; jcQueryAll('.stTip').forEach(function (x) { x.remove(); }); }
  jcQueryAll('.menu.open').forEach(function (m) {
    m.classList.remove('open');
    m.style.position = ''; m.style.left = ''; m.style.top = ''; m.style.right = ''; m.style.bottom = '';
    m.style.maxHeight = ''; m.style.overflowY = '';
  });
  openMenu = null;
  syncPaneLift();
}
/* Menus were absolutely positioned inside their button's wrapper, so every scroll box
   and overflow:hidden between them and the page cut them off \u2014 in the RO pane and
   inside job cards they could only be half seen. On open they are measured against
   their trigger and pinned to the viewport instead, flipping up when there is no room
   below and sliding in when they would run off an edge. */
function placeMenu(menu, anchor) {
  if (!menu || !anchor) return;
  syncPaneLift(true);            /* kill the hover lift first: it moves the frame we measure in */
  /* line the menu up with the whole chip / button, not the 20px caret inside it —
     measuring off the caret threw wide menus a couple of hundred px to the left. */
  var host = (anchor.closest && anchor.closest('.chipwrap')) || anchor;
  var a = zr(host.getBoundingClientRect());
  var pad = 8, gap = 6;
  menu.style.position = 'fixed';
  menu.style.right = 'auto'; menu.style.bottom = 'auto';
  menu.style.left = '0px'; menu.style.top = '0px';
  menu.style.maxHeight = ''; menu.style.overflowY = '';
  var o0 = zr(menu.getBoundingClientRect());              /* where 0,0 really lands (zoom, or a transformed ancestor) */

  var vw = window.innerWidth / ZF(), vh = window.innerHeight / ZF();
  var w = menu.offsetWidth || 208;
  var left = a.left;                                    /* left edges flush with the control */
  if (left + w > vw - pad) left = a.right - w;          /* no room that way: right edges flush */
  left = Math.max(pad, Math.min(left, vw - w - pad));

  var below = vh - a.bottom - gap - pad, above = a.top - gap - pad;
  var drop = menu.offsetHeight <= below || below >= above;   /* open down unless up has more room */
  var room = Math.max(120, drop ? below : above);
  if (menu.offsetHeight > room) {                            /* taller than the room: scroll it */
    menu.style.maxHeight = Math.round(room) + 'px';
    menu.style.overflowY = 'auto';
  }
  var h = menu.offsetHeight;
  var top = drop ? a.bottom + gap : a.top - gap - h;
  top = Math.max(pad, Math.min(top, vh - h - pad));

  menu.style.left = Math.round(left - o0.left) + 'px';
  menu.style.top = Math.round(top - o0.top) + 'px';
  syncPaneLift(true);            /* the caller sets openMenu after this returns */
}
/* ---------- pop-over pinning ----------
   The hover cards, step tips and pickers were absolutely positioned inside the row that
   owns them: centred with left:50% and nudged off the edges with :nth-child rules. In a
   narrow window, or inside the pane's scroll box, that put them half off screen or under
   a neighbour. Each is now measured against its own trigger and pinned to the viewport,
   so it opens beside the button that owns it whatever the window is doing. */
var PINNED = [];
function pinPop(pop, anchor, opts) {
  if (!pop || !anchor || !pop.isConnected || !anchor.isConnected) return;
  syncPaneLift(true);            /* same reason as placeMenu */
  opts = opts || {};
  var a = zr(anchor.getBoundingClientRect());
  if (!a.width && !a.height) return;                       /* trigger not laid out yet */
  var pad = 8, gap = opts.gap == null ? 8 : opts.gap;

  pop.style.position = 'fixed';
  pop.style.right = 'auto'; pop.style.bottom = 'auto';
  pop.style.transform = 'none';
  pop.style.left = '0px'; pop.style.top = '0px';
  pop.style.maxHeight = ''; pop.style.overflowY = '';

  var vw = window.innerWidth / ZF(), vh = window.innerHeight / ZF();
  var w = pop.offsetWidth || 220;
  var mid = a.left + a.width / 2;
  var left = Math.max(pad, Math.min(mid - w / 2, vw - w - pad));   /* centred, then kept on screen */

  var below = vh - a.bottom - gap - pad, above = a.top - gap - pad;
  var h = pop.offsetHeight || 120;
  var drop = opts.prefer === 'above' ? (h > above && below > above) : (h <= below || below >= above);
  var room = Math.max(110, drop ? below : above);
  if (h > room) { pop.style.maxHeight = Math.round(room) + 'px'; pop.style.overflowY = 'auto'; h = pop.offsetHeight; }
  var top = drop ? a.bottom + gap : a.top - gap - h;
  top = Math.max(pad, Math.min(top, vh - h - pad));

  /* A transformed ancestor (the card lift, a theme's scale or tilt) makes 'fixed' relative to
     it instead of the window — measure where 0,0 really landed and take that off. */
  var o0 = zr(pop.getBoundingClientRect());
  pop.style.left = Math.round(left - o0.left) + 'px';
  pop.style.top = Math.round(top - o0.top) + 'px';

  /* keep the little arrow pointing at the trigger, wherever the card had to slide to */
  var tip = pop.querySelector ? pop.querySelector('.tip') : null;
  if (tip) {
    tip.style.marginLeft = '0';
    tip.style.left = Math.round(Math.max(8, Math.min(mid - left - 4, w - 16))) + 'px';
    tip.style.right = 'auto';
    if (drop) { tip.style.top = '-5px'; tip.style.bottom = 'auto'; }
    else { tip.style.top = 'auto'; tip.style.bottom = '-5px'; }
  }

  for (var i = 0; i < PINNED.length; i++) if (PINNED[i].pop === pop) { PINNED[i].anchor = anchor; return; }
  PINNED.push({ pop: pop, anchor: anchor, opts: opts });
  syncPaneLift();
}
function unpinPop(pop) {
  if (!pop) return;
  PINNED = PINNED.filter(function (e) { return e.pop !== pop; });
  pop.style.position = ''; pop.style.left = ''; pop.style.top = '';
  pop.style.right = ''; pop.style.bottom = ''; pop.style.transform = '';
  pop.style.maxHeight = ''; pop.style.overflowY = '';
  var tip = pop.querySelector ? pop.querySelector('.tip') : null;
  if (tip) { tip.style.left = ''; tip.style.right = ''; tip.style.top = ''; tip.style.bottom = ''; tip.style.marginLeft = ''; }
  syncPaneLift();
}
function repinPops() {
  PINNED = PINNED.filter(function (e) { return e.pop.isConnected && e.anchor.isConnected; });
  PINNED.slice().forEach(function (e) { pinPop(e.pop, e.anchor, e.opts); });
}
/* the ones render() leaves open on its own: a pinned step card, an open step picker */
function pinOpenPops() {
  if (!R) return;
  PINNED = PINNED.filter(function (e) { return e.pop.isConnected && e.anchor.isConnected; });
  jcQueryAll('.mini.pinned, .pgTip.show, .mini.show').forEach(function (p) {
    var trig = p.previousElementSibling;
    if (trig) pinPop(p, trig);
  });
  jcQueryAll('.pickMenu').forEach(function (p) {
    var prev = p.previousElementSibling;
    var trig = prev && prev.querySelector ? (prev.querySelector('.pgAdd') || prev) : prev;
    if (trig) pinPop(p, trig);
  });
}
window.addEventListener('resize', function () { closeMenus(); repinPops(); });
window.addEventListener('scroll', function (e) {
  if (!R) return;
  repinPops();
  if (!openMenu) return;
  var t = e.target;                                   /* ignore the menu scrolling its own list */
  if (t && t.nodeType === 1 && t.classList && t.classList.contains('menu')) return;
  closeMenus();
}, true);
/* The nav rail collapsing or the RO list sliding is a ~260ms transition, and a menu
   opened while one is running gets measured in a frame that is already stale. Place it
   now so it is never invisible, then correct it on the next frame and once more after
   the transition would have finished. */
function placeMenuSettled(menu, anchor) {
  placeMenu(menu, anchor);
  requestAnimationFrame(function () { if (menu.classList.contains('open')) placeMenu(menu, anchor); });
  setTimeout(function () { if (menu.classList.contains('open')) placeMenu(menu, anchor); }, 300);
}
/* every pop-over closes the moment you press anywhere outside it — even on a card or field that keeps its own clicks */
document.addEventListener('pointerdown', function (e) {
  if (!R || !HOST || !HOST.isConnected) return;
  var path = e.composedPath ? e.composedPath() : [];
  var inside = function (n) { return !!n && path.indexOf(n) > -1; };
  var openM = jcQueryAll('.menu.open');
  if (openM.length && !openM.some(function (m) { return inside(m) || inside(m.parentElement); })) closeMenus();
  else if (STG_OPEN && !jcQueryAll('.stTip').some(inside) && !path.some(function (n) { return n && n.classList && n.classList.contains('rsDot'); })) closeMenus();
  jcQueryAll('.mini.show, .mini.pinned, .pgTip.show').forEach(function (x) { if (!inside(x) && !inside(x.parentElement)) x.classList.remove('pinned', 'show'); });
  var hitCls = function (re) { return path.some(function (n) { return n && n.classList && re.test(n.className && n.className.baseVal === undefined ? n.className : ''); }); };
  if (hitCls(/\bmodal(Wrap|Box)\b|\bmodal-|\bpal-wrap\b/)) return;                     /* a dialog the pop-over opened */
  if (detailsOpen && !(R.querySelector('.page.roB')) && !hitCls(/\b(detailsPop|headMain|raBtn|hbDet|hdVal|hdRail|hdPr)\b/)) setDetails(false);   /* in the RO pane the details stay open until you fold them */
  if (roTab && !hitCls(/\b(opDock|dkPanel|paneTabs|rtTabs)\b/)) { roTab = null; render(); }                        /* the dock's panel */
}, true);
document.addEventListener('click', function () {
  if (!R || !HOST || !HOST.isConnected) return;
  closeMenus();
  jcQueryAll('.mini.pinned').forEach(function (x) { x.classList.remove('pinned', 'show'); });
  if (typeof pickOpen !== 'undefined' && pickOpen > -1) { pickOpen = -1; render(); }
});

function chipGroup(defs, idx, onSet, key, num) {
  var d = defs[idx] || defs[0];
  var wrap = el('div', { class: 'chipwrap' });
  var listOnly = key === 'status' || key === 'jobst';
  function openIt(e) {
    e.stopPropagation();
    var was = menu.classList.contains('open');
    closeMenus();
    if (!was) { menu.classList.add('open'); placeMenuSettled(menu, main); openMenu = key; }
  }
  var mainTxt = (d.label || d.key) + (key === 'status' && RO && roStatus(RO).sub ? ' \u00b7 ' + roStatus(RO).sub.toUpperCase() : '');
  var main = el('button', { class: 'chip l', type: 'button',
    style: 'background:' + d.bg + ';color:' + d.fg, title: mainTxt + (listOnly ? ' \u2014 pick from list' : ' \u2014 click to cycle'), 'aria-haspopup': listOnly ? 'menu' : null,
    onClick: listOnly ? openIt : function (e) { e.stopPropagation(); closeMenus(); onSet((idx + 1) % defs.length); } },
    [num ? el('span', { class: 'chipNo mono', text: String(num) }) : null, (listOnly && d.t) ? stIcon(d, 'chipSt', d.name) : null, (function () {
      var subTx = key === 'status' && RO && roStatus(RO).sub ? roStatus(RO).sub.toUpperCase() : '';
      if (!subTx) return el('span', { class: 'chipTxt', text: mainTxt });
      return el('span', { class: 'chipTxt chipTwo' }, [el('span', { class: 'chipMain', text: d.label || d.key }), el('span', { class: 'chipSub', text: '\u00b7 ' + subTx })]);
    })()]);
  var arrow = el('button', { class: 'chip r', type: 'button',
    style: 'background:' + d.bg + ';color:' + d.fg, title: 'Pick from list',
    onClick: function (e) {
      e.stopPropagation();
      var was = menu.classList.contains('open');
      closeMenus();
      if (!was) { menu.classList.add('open'); placeMenuSettled(menu, arrow); openMenu = key; }
    } });
  arrow.appendChild(svg(ICON.down, 9, 1.7));
  var menu = dropdown(defs, idx, onSet, key);
  wrap.appendChild(main); wrap.appendChild(arrow); wrap.appendChild(menu);
  return wrap;
}

/* A small "..." menu button used for the job-card action menu and the footer
   Options menu — reuses the same .menu / .menuItem look as the status dropdown. */
function iconMenuButton(items, menuKey, btnStyle, label, variant) {
  var wrap = el('div', { class: 'chipwrap', style: btnStyle || '' });
  /* variant "band" / "card": the squared-off button that matches the app header's
     options button. Anything else keeps the old inline "..." look. */
  var matched = variant === 'band' || variant === 'card';
  var btn = el('button', {
    class: matched ? ('iconMenuBtn' + (variant === 'band' ? ' onBand' : '')) : ('btn' + (label ? ' dark' : '')),
    type: 'button', title: label || 'More actions',
    style: matched ? '' : ((label ? 'padding:4px 8px;gap:8px;' : 'padding:4px 8px;') + 'flex-shrink:0'),
    onClick: function (e) {
      e.stopPropagation();
      var was = menu.classList.contains('open');
      closeMenus();
      if (!was) { menu.classList.add('open'); placeMenuSettled(menu, btn); openMenu = menuKey; }
    } });
  btn.appendChild(el('span', { style: 'display:inline-flex', html: matched ? MENU_ICONS.bars : MENU_ICONS.dots }));
  if (label) btn.setAttribute('aria-label', label);
  var menu = el('div', { class: 'menu', style: 'left:auto;right:0;width:208px' });
  items.forEach(function (it) {
    if (it === '-') { menu.appendChild(el('div', { style: 'height:1px;background:var(--line);margin:4px 2px' })); return; }
    menu.appendChild(el('button', { class: 'menuItem', type: 'button',
      onClick: function (e) { e.stopPropagation(); closeMenus(); it.run(); } }, [
      el('span', { style: 'display:inline-flex;flex-shrink:0;color:' + (it.danger ? 'var(--danger-ink)' : 'var(--ink-icon)'), html: it.icon || '' }),
      el('span', { style: 'font-size:12px;font-weight:600;color:' + (it.danger ? 'var(--danger-ink)' : 'var(--ink-strong)'), text: it.label })
    ]));
  });
  menu.dataset.menu = menuKey;
  wrap.appendChild(btn); wrap.appendChild(menu);
  return wrap;
}

/* light background tint for a job card, derived from its severity color */


/* ============================ live updaters ============================ */

var refs = { totals: null, day: null, days: null };

function updateDays() {
  if (!refs.days) return;
  var opened = parseDate(S.ro.opened), closed = parseDate(S.ro.closed);
  var today = new Date(); today.setHours(0, 0, 0, 0);
  var d = opened ? Math.max(0, Math.round(((closed || today) - opened) / 86400000)) : null;
  refs.days.textContent = d === null ? '—' : String(d);
}

function updateTotals() {
  if (refs.rtUpdate) { try { refs.rtUpdate(); } catch (e) {} }
  if (refs.hdRefresh) { try { refs.hdRefresh(); } catch (e) {} }   /* the numbers in the header rail */
  if (!refs.totals || !refs.totals.parentNode) return;
  var fresh = renderTotals();
  if (refs.totals.parentNode.classList && refs.totals.parentNode.classList.contains('headMain')) fresh.style.cssText = refs.totals.style.cssText;
  /* the stat row lives in the operations toolbar now, so the class that styles it for
     that row has to survive the swap — otherwise it reverts a second after every render */
  if (refs.totals.classList.contains('rtTotals')) fresh.classList.add('rtTotals');
  refs.totals.parentNode.replaceChild(fresh, refs.totals);
  refs.totals = fresh;
  if (refs.dayUpdate && refs.dayUpdate()) { /* updated in place */ }
  else if (refs.day && refs.day.parentNode) {
    var d = renderDayStrip();
    refs.day.parentNode.replaceChild(d, refs.day);
    refs.day = d;
  }
}
