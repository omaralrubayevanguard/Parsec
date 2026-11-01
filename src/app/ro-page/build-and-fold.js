/* Parsec · ro-page · build-and-fold.js
   ropBuild draws the RO page's sections in order; every section folds (Parsec 14.4) and remembers it.
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   ropBuild ropFoldShut ropFoldSave ropFoldOne ropFoldAll ROPF (5 functions, 1 constant)
   uses       kit/ pages/rolist/ state/
*/
/* ---------- the page ---------- */
function ropBuild(page, stash, slotEl) {
  if (ROPS.ro !== RO.id) { ropSelReset(); ROPS.ro = RO.id; ROPU.msgAll = false; ROPU.histAll = false; ROPU.fcOp = null; ROPT.ed = null; ROPT.add = null; ROPT.note = null; ROPT.padd = null; }
  /* the job tile list stays out of sight with the classic page (Next step went with it, as picked) */
  if (slotEl) stash.appendChild(slotEl);
  var ops = pxOps(stash); ropDecorOps(ops);
  var col = el('div', { class: 'px-ro__col rop-col' + (ropAny() ? ' rop-any' : '') }, [ops]);
  [ropInbox, ropCustomer].forEach(   /* Parsec 15: below Operations, only Messages and Customer — what the other sections did lives on its own page (Parts, Warranty, Assets, each operation's Parts tab, the truck card) */function (f) { try { var x = f(); if (x) col.appendChild(x); } catch (e) { console.error(e); } });
  var bar = ropSelBar(); if (bar) col.appendChild(bar);
  try { HOST.classList.toggle('rop-picking', !!bar); } catch (e) {}   /* the toasts rise above the bar */
  if (bar) requestAnimationFrame(function () { try { document.body.style.setProperty('--rop-sbh', (bar.offsetHeight || 52) + 'px'); } catch (e) {} });
  var mainEl = el('main', { class: 'px-ro__main' }, [col]);
  var keepTop = UI.ivScroll && UI.ivScroll.ro === RO.id ? UI.ivScroll.top : 0;
  mainEl.addEventListener('scroll', function () { UI.ivScroll = { ro: RO.id, top: mainEl.scrollTop }; }, { passive: true });
  var pro = el('div', { class: 'px-ro rop-ro' }, [mainEl, ropRail()]);
  pro.addEventListener('scroll', function () { UI.ivScroll = { ro: RO.id, top: pro.scrollTop, one: 1 }; }, { passive: true });
  var root = el('div', { class: 'pxr rop-r' }, [typeof rlCrumbFix === 'function' ? rlCrumbFix(pxHeader()) : pxHeader(), pro]);
  page.appendChild(root); page.appendChild(stash);
  try { ropFoldAll(root); ropFallAdd(root); } catch (e) { console.error(e); }   /* Parsec 14.4: every section folds; Parsec 15: one switch folds them all, and pointing does nothing */
  requestAnimationFrame(function () { if (UI.ivScroll && UI.ivScroll.ro === RO.id && UI.ivScroll.one) pro.scrollTop = UI.ivScroll.top; else mainEl.scrollTop = keepTop; });
}

/* ---------- Parsec 14.4 — every section on the RO page folds ----------
   A chevron button on each section's heading folds it (and unfolds it); a folded section opens while you point at its heading and folds
   again when you move off it. What's folded is remembered on this computer, for every RO. The detail groups (Schedule, People…) keep
   their own heading click and open on hover the same way. */
var ROPF = { shut: null, root: null };
function ropFoldShut() { if (!ROPF.shut) { try { ROPF.shut = JSON.parse(localStorage.getItem('rop_fold') || '{}') || {}; } catch (e) { ROPF.shut = {}; } } return ROPF.shut; }
function ropFoldSave() { try { localStorage.setItem('rop_fold', JSON.stringify(ROPF.shut || {})); } catch (e) {} }
function ropFoldOne(box, head, key, label, opt) {
  opt = opt || {};
  if (!box || !head) return;
  var shut = ropFoldShut(), isPg = box.classList.contains('px-pg');
  box.classList.add('rop-fold'); box.setAttribute('data-fold', key); head.classList.add('rop-fh');
  if (!isPg) {
    if (shut[key]) box.classList.add('is-shut');
    var b = el('button', { class: 'rop-fb', type: 'button', 'aria-expanded': shut[key] ? 'false' : 'true', 'aria-label': (shut[key] ? 'Open ' : 'Fold ') + label, title: shut[key] ? 'Open' : 'Fold', html: pxI('chevD', 14) });
    b.addEventListener('click', function (e) {
      e.preventDefault(); e.stopPropagation();
      var S0 = ropFoldShut(), now = !S0[key];
      if (now) S0[key] = 1; else delete S0[key]; ropFoldSave();
      box.classList.toggle('is-shut', now);
      b.setAttribute('aria-expanded', now ? 'false' : 'true'); b.setAttribute('aria-label', (now ? 'Open ' : 'Fold ') + label); b.title = now ? 'Open' : 'Fold';
      ropFallSync();
    });
    if (opt.spacer) {   /* the title and its count on the left; the section's own buttons and the chevron together on the right */
      var last = null; Array.prototype.forEach.call(head.children, function (c) { if (c.tagName === 'H3' || c.classList.contains('n') || c.classList.contains('rop-cb')) last = c; });
      var sp = el('span', { class: 'rop-fsp', 'aria-hidden': 'true' }); if (last && last.nextSibling) head.insertBefore(sp, last.nextSibling); else head.appendChild(sp);
    }
    head.appendChild(b);
    /* a click on the heading folds it or opens it (Parsec 14.5); on the truck card it only keeps a folded card open — its words and buttons are for clicking */
    head.addEventListener('click', function (e) { var t = e.target; if (t.closest && t.closest('button, input, a, select, textarea, label, [role=button], [role=checkbox], [contenteditable], .rif, .qte')) return; if (opt.pinOnly && !box.classList.contains('is-shut')) return; e.stopPropagation(); b.click(); });
    head.classList.add(opt.pinOnly ? 'rop-fh-pin' : 'rop-fh-tog');
  }
}
function ropFoldAll(root) {
  var col = root.querySelector('.rop-col'), rail = root.querySelector('.rop-rail'); if (!col) return; ROPF.root = root;
  var ops = col.firstElementChild; if (ops && ops.querySelector(':scope > .rop-sech0')) ropFoldOne(ops, ops.querySelector(':scope > .rop-sech0'), 'ops', 'Operations', { spacer: 1 });
  Array.prototype.forEach.call(col.querySelectorAll(':scope > section.rop-blk'), function (s) {
    var k = (/\brop-k-([\w-]+)/.exec(s.className) || [])[1] || 'blk', h = s.querySelector(':scope > .rop-sech'); ropFoldOne(s, h, 'c-' + k, (h && h.querySelector('h3') || {}).textContent || 'this section', { spacer: 1 });
  });
  if (!rail) return;
  var band = rail.querySelector('.rop-band'), trk = band && band.querySelector(':scope > .px-trk'); if (trk) { ropFoldOne(band, trk, 'r-truck', 'the truck card', { pinOnly: 1 }); var tb = trk.querySelector(':scope > .px-titleblock'), fb = trk.querySelector(':scope > .rop-fb'); if (tb && fb) tb.appendChild(fb); }   /* the whole card folds to its title */
  var stg = rail.querySelector('.rop-stg > .px-stage'); if (stg) ropFoldOne(stg, stg.querySelector(':scope > .px-stage__top'), 'r-stage', 'the stage');
  Array.prototype.forEach.call(rail.querySelectorAll('.rop-top > section.rop-rblk:not(.rop-stg)'), function (s, i) { var h = s.querySelector(':scope > .rop-rh'); ropFoldOne(s, h, 'r-blk' + (h ? h.textContent.trim().toLowerCase().replace(/\W+/g, '-') : i), (h && h.textContent) || 'this section'); });
  Array.prototype.forEach.call(rail.querySelectorAll('.px-props > section.px-pg'), function (s) { var h = s.querySelector(':scope > .px-pg__h'); if (h) { h.addEventListener('click', function () { setTimeout(ropFallSync, 0); }); h.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') setTimeout(ropFallSync, 0); }); } ropFoldOne(s, h, 'g-' + (((h && h.textContent.trim().match(/^[A-Za-z][A-Za-z &]*?(?=[A-Z0-9$·]|$)/)) || ['grp'])[0].trim().toLowerCase().replace(/\W+/g, '-') || 'grp'), 'this group'); });
}
