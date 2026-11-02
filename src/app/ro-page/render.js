/* Parsec · ro-page · render.js
   The RO page's render: openState (which card is open), renderNow draws every part into the shadow root, flipCards animates, and the scroll / pin bookkeeping.
   Flow: the app's render() → JC.render() when the RO page is the view; nothing else draws into R.
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   SEL openState revealOpened render syncDateClosed cardRects flipCards renderNow paneScroller pinOffset jcScrollTo enterCommits … (16 functions, 2 constants)
   state      savedAt
   uses       access/ automations/ data/ kit/ pages/ ro/ shell/ state/
   at load    on window resize
*/
/* ============================ render ============================ */

function SEL() { return (R && R.getSelection) ? R.getSelection() : window.getSelection(); }

/* What is open right now, so the next render can tell what just opened. */
var OPEN_PREV = null;
function openState() {
  return { ro: RO ? RO.id : null, solo: soloJob,
    cards: S ? S.jobs.filter(isOpenCard).map(function (j) { return j.id; }) : [],
    punches: S ? S.jobs.filter(function (j) { return !j.punchesCollapsed; }).map(function (j) { return j.id; }) : [],
    tab: roTab, det: !!detailsOpen };
}
function revealOpened(prev, now) {
  if (!prev || prev.ro !== now.ro || prev.solo !== now.solo || !R) return;
  var sc = paneScroller(), bar = R.querySelector('.cardCol > .opBar');
  var pad = bar && getComputedStyle(bar).position === 'sticky' ? bar.getBoundingClientRect().height + 8 : 0;
  var node = null;
  var newCard = now.cards.filter(function (id) { return prev.cards.indexOf(id) < 0; })[0];
  if (newCard) node = R.querySelector('.cardCol > .card[data-job="' + newCard + '"]');
  if (!node && now.tab && now.tab !== prev.tab) node = R.querySelector('.rtPanelWide');
  if (!node && now.det && !prev.det) { node = R.querySelector('.rtInfo'); pad = 0; }
  if (!node) {
    var newPun = now.punches.filter(function (id) { return prev.punches.indexOf(id) < 0 && now.cards.indexOf(id) > -1; })[0];
    if (newPun) { var cd = R.querySelector('.cardCol > .card[data-job="' + newPun + '"]'); node = cd && cd.querySelector('.jbx-punch'); }
  }
  if (!node) return;
  if (!sc) { var tb = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--tb-h')) || 0; pad += tb; }
  revealEl(node, sc, pad);
}
function render() {
  var prev = OPEN_PREV;
  renderNow();
  try { pmDetailRendered(R, RO); } catch (e) {}
  try { rpMountRo(); } catch (e) {}   /* 17.1: the one RO panel, slotted into the right column */
  try { pxwAfter(); } catch (e) {}   /* 17.1: the right column's width, and its drag edge (shell/widths.js) */
  OPEN_PREV = openState();
  revealOpened(prev, OPEN_PREV);
  if (ATT.open && !ATT.renaming) attRender();
  draftsRestore();
}
/* Date Closed follows the work itself rather than being typed in: once every operation
   card reads complete and the RO status is one of the finished statuses, the RO is closed
   as of right now. Reopening either (a job un-completed, the status moved off "Complete")
   clears it again — it only ever reflects "done right now", never a guess. */
function syncDateClosed() {
  if (RO && syncDateClosedRo(RO)) scheduleSave(true);
}
/* remember where every job card sits, so that after the redraw the ones that moved
   can slide from the old place to the new one instead of jumping. */
function cardRects() {
  var m = {};
  if (R) Array.prototype.forEach.call(R.querySelectorAll('.cardCol > .card[data-job]'), function (c) {
    m[c.getAttribute('data-job')] = c.getBoundingClientRect();
  });
  return m;
}
function flipCards(prev) {
  if (!R || !prev) return;
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  Array.prototype.forEach.call(R.querySelectorAll('.cardCol > .card[data-job]'), function (c) {
    var o = prev[c.getAttribute('data-job')]; if (!o) return;
    var n = c.getBoundingClientRect();
    var dx = o.left - n.left, dy = o.top - n.top;
    if (Math.abs(dx) < 2 && Math.abs(dy) < 2) return;
    c.classList.add('flipping');
    c.style.transition = 'none';
    c.style.transform = 'translate(' + Math.round(dx) + 'px,' + Math.round(dy) + 'px)';
    requestAnimationFrame(function () {
      c.style.transition = 'transform .34s cubic-bezier(.22,1,.36,1)';
      c.style.transform = 'translate(0,0)';
      setTimeout(function () { c.classList.remove('flipping'); c.style.transition = ''; c.style.transform = ''; }, 400);
    });
  });
}
function renderNow() {
  if (!R || !RO) return;
  if (HOST) HOST.classList.toggle('shop-ro', !!RO.shop);
  syncDateClosed();
  var page = R.getElementById('page');
  var wasAt = cardRects();
  var scP = HOST && HOST.parentElement, scT = scP ? scP.scrollTop : 0;
  page.style.minHeight = page.offsetHeight + 'px';
  page.innerHTML = '';
  page.classList.toggle('soloMode', !!soloJob);
  TIMERS = [];

  if (soloJob && !S.jobs.some(function (j) { return j.id === soloJob; })) soloJob = null;

  if (soloJob) {
    var job = S.jobs.filter(function (j) { return j.id === soloJob; })[0];
    S.ui.card = soloJob;   /* force it open — there's nothing else on screen to expand into */
    page.appendChild(el('div', { class: 'soloBar' }, [
      el('button', { class: 'btn dark', type: 'button', title: 'Back to all operations', 'aria-label': 'Back to all operations',
        onClick: function () { soloJob = null; render(); } }, [
        (function () { var s = svg('M8.4 2.6 3.6 7l4.8 4.4', 12, 1.6); return s; })(),
        el('span', { class: 'jcIco', html: IC.grid })
      ]),
      el('span', { style: 'display:inline-flex', html: MENU_ICONS.eye }),
      el('span', { style: 'font-size:11px;font-weight:700;letter-spacing:.06em;color:#8895A7', text: 'VIEWING ONE OPERATION ONLY' })
    ]));
    page.appendChild(jobCard(job, 0));
    mountBandControls(null);
    markSeen();
    pinOpenPops();
    return;
  }

  var head = renderHeader();
  /* head.meta is an empty shell since the RO fields moved out; rendering
     it would just put an empty dark bar across the top of the page. */
  /* Two real columns rather than a shared grid: with cards and the RO pane sharing grid
     rows, every row grew to the taller side and the cards ended up separated by hundreds
     of pixels of nothing. Each column now flows on its own. */
  var cardCol = el('div', { class: 'cardCol' });
  var roCol = el('div', { class: 'roCol' });
  if (!RO.shop && RO.id !== SHOP_RO_ID) { var hdStrip = renderTruckStrip(); page.appendChild(hdStrip); mountProgress(hdStrip.querySelector('.hdFc')); }   /* 1B strip, then progress, above both columns */
  page.appendChild(cardCol);
  page.appendChild(roCol);
  /* Ready to close lives on the Triage page now */
  page.appendChild(el('slot', { name: 'ra' }));   /* next step, tabs and transfer come in here, above the RO header */   /* K4 ready to close + I5 clock button */
  /* slim chevron on the right edge, level with the top of the RO pane: hides the RO
     pane so the job cards get the full width, and brings it back */
  var shut = !!UI.roPaneShut;
  page.classList.toggle('roShut', shut);
  var tg = el('button', { class: 'roToggle', type: 'button', 'aria-expanded': shut ? 'false' : 'true',
    title: shut ? 'Show the RO pane' : 'Hide the RO pane', 'aria-label': shut ? 'Show the RO pane' : 'Hide the RO pane',
    onClick: function (e) { e.stopPropagation(); UI.roPaneShut = !UI.roPaneShut; persistUI(); render(); } });
  tg.innerHTML = '<svg width="8" height="14" viewBox="0 0 8 14" fill="none" aria-hidden="true"><path d="' + (shut ? 'M6 1.5 1.5 7 6 12.5' : 'M2 1.5 6.5 7 2 12.5') + '" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  void tg;   /* the toggle moved out to the window edge (.ro-edge-tab in the page) */
  mountBandControls(head.controls);
  if (roLooksFinished(RO) && !roWorkDone(RO) && !autoCfg().builtin.status) {   /* Status sync suggests this on the RO panel instead */
    page.appendChild(el('div', { class: 'roNudge', role: 'status' }, [
      el('span', { html: '<b>Every operation reads complete.</b> The RO still says ' + esc(roStatus(RO).status) + '.' }),
      el('span', { class: 'grow' }),
      el('button', { type: 'button', text: rtNeeded(RO) ? 'Road test next' : 'Mark complete', onClick: function () { if (setRoStatus(RO.id, 'Complete \u2013 Road test', null) === false) { tecRender(); return; } save(true); render(); tecRender(); } }),
      el('button', { class: 'pri', type: 'button', text: 'Released', onClick: function () { if (setRoStatus(RO.id, 'Complete \u2013 Released', null) === false) { tecRender(); return; } save(true); render(); tecRender(); } })
    ]));
  }
  refs.opBar = null;
  roCol.appendChild(renderRoToolbar());
  if (!RO.shop && RO.id !== SHOP_RO_ID) {
    /* past visits open from a chip in the header band */
  }
  /* the toolbar card only stays if it still holds something (automation suggestions) */
  (function () {
    var rt = roCol.querySelector('.rtWrap'), st = rt && rt.querySelector('.rtStrip');
    var real = st && Array.prototype.some.call(st.children, function (c) { return !c.classList.contains('rtSep') && !(c.classList.contains('rtLead') && !c.children.length); });
    if (rt && !real) rt.remove();
    if (!roCol.children.length) page.classList.add('roShut');
  })();
  /* the RO tools ride in a dock at the bottom of the window with the RO's money; a tab opens its panel just above it */
  if (refs.opBar) {
    var dock = el('div', { class: 'opDock' });
    if (roTab) { var rp = renderRoPanel(roTab); rp.classList.add('rtPanelWide', 'dkPanel'); dock.appendChild(rp); }
    var dkM = el('div', { class: 'dkMoney' });
    var dkFill = function () { if (RO.shop || RO.id === SHOP_RO_ID || typeof raBarHtml !== 'function') return; var r0 = (typeof getRO === 'function' && getRO(RO.id)) || RO, h0 = raBarHtml(r0); if (dkM.__h !== h0) { dkM.innerHTML = h0; dkM.__h = h0; } };
    if (!RO.shop && RO.id !== SHOP_RO_ID) {          /* More — the RO's other tools */
      var more = iconMenuButton(RA_TABS.filter(function (t) { return t[0] !== 'parts'; }).map(function (t) {
        return { icon: MENU_ICONS.eye, label: t[1], run: function () { UI.raTab = t[0]; persistUI(); tecRender(); setTimeout(function () { var m = document.querySelector('.ra-more'); if (m) m.scrollIntoView({ block: 'center', behavior: 'smooth' }); }, 80); } };
      }), 'dockMore', '', 'More', 'card');
      more.classList.add('dkMore'); refs.opBar.insertBefore(more, refs.opBar.querySelector('.obAdd') || null);
    }
    dkFill(); refs.opBar.appendChild(dkM);
    var dkMin = Math.floor(Date.now() / 60000);
    TIMERS.push(function () { var m0 = Math.floor(Date.now() / 60000); if (m0 !== dkMin && dkM.isConnected) { dkMin = m0; dkFill(); } });
    dock.appendChild(refs.opBar);
    page.appendChild(dock);
  }
  /* every operation as a tile in one row (the picked one highlighted in place), open cards under it */
  var roBMode = !RO.shop && RO.id !== SHOP_RO_ID;   /* list + work */
  if (S.jobs.length && !soloJob && !roBMode) cardCol.appendChild(el('div', { class: 'opRow' }, S.jobs.map(function (j, i) { return opTile(j, i); })));
  if (UI.jcFocusParts) {                                            /* sent here to fix the parts */
    var fpj = S.jobs.filter(function (j) { return j.id === UI.jcFocusParts; })[0]; UI.jcFocusParts = null;
    if (fpj) { fpj.partsCollapsed = false; S.ui.card = fpj.id; requestAnimationFrame(function () { requestAnimationFrame(function () { flashParts(fpj); }); }); }
  }
  if (roBMode) {
    var cj = S.jobs.filter(function (j) { return j.id === S.ui.card; })[0] || S.jobs[0];
    if (cj) { if (!isOpenCard(cj)) openCard(RO.id, cj.id); var cEl = jobCard(cj, S.jobs.indexOf(cj)); cardCol.appendChild(cEl); secTabs(cEl, cj); }
  } else S.jobs.forEach(function (j, i) { if (isOpenCard(j) || soloJob === j.id) cardCol.appendChild(jobCard(j, i)); });
  if (!S.jobs.length) {
    cardCol.appendChild(el('button', { class: 'btnDash', type: 'button', html: IC.plus, title: 'Add the first operation on this RO', 'aria-label': 'Add the first operation on this RO',
      onClick: function () { pushUndo('add operation'); var nj = blankJob(); S.jobs.push(nj); S.ui.card = nj.id; UI.jcFocusNew = nj.id; save(true); render(); } }));
  }

  if (roBMode && ivOn()) ivBuild(page, cardCol);   /* Ivory — the RO in the middle, its details in a rail on the right */
  else if (roBMode) {                                    /* two columns — the RO and its operations on the left, the work on the right */
    page.classList.add('roB'); page.classList.remove('ivB');
    var colL = el('div', { class: 'roL' }), colR = el('div', { class: 'roR' });
    var hdw = page.querySelector(':scope > .hdWrap'), slotEl = page.querySelector(':scope > slot'), nud = page.querySelector(':scope > .roNudge');
    if (hdw) {
      colL.appendChild(hdw);
      var hTop = hdw.querySelector('.hbTop');
      if (hTop) { var kf = buildKeyFields(); hTop.after(kf); var dp = hdw.querySelector('.detailsPop'); if (dp) kf.appendChild(dp);
        var nAll = dp ? dp.querySelectorAll('.detailsGrid input, .detailsGrid select, .detailsGrid textarea, .detOpR').length : 0;
        var tg = kf.querySelector('.kfMore'); if (tg) tg.textContent = detailsOpen ? 'Show fewer \u25b4' : 'Show all' + (nAll ? ' ' + nAll : '') + ' \u25be'; }
    }
    colL.appendChild(buildOpSide());
    if (nud) colR.appendChild(nud);
    colR.appendChild(cardCol);
    if (slotEl) colR.appendChild(slotEl);   /* the next step (and More panels) at the bottom */
    var dk = page.querySelector(':scope > .opDock');                 /* no bottom bar — its tabs sit in the RO pane */
    if (dk) {
      var tabsEl = dk.querySelector('.rtTabs'), pnl = dk.querySelector('.dkPanel');
      if (tabsEl) { var pt = el('div', { class: 'paneTabs' }, [tabsEl]); var kfEl = colL.querySelector('.kf'); if (kfEl) kfEl.after(pt); else colL.insertBefore(pt, colL.firstChild); }
      if (pnl) colR.insertBefore(pnl, colR.firstChild);
      dk.remove();
    }
    page.insertBefore(colR, page.firstChild); page.insertBefore(colL, colR);
  } else page.classList.remove('roB', 'ivB');
  try { ivCaseFix(R); } catch (e) {}
  pinOffset();
  updateDays();
  markSeen();
  pinOpenPops();
  page.style.minHeight = '';
  flipCards(wasAt);
  if (UI.jcFocusNew) { var fid = UI.jcFocusNew; UI.jcFocusNew = null;
    requestAnimationFrame(function () { var fc = R.querySelector('.cardCol > .card[data-job="' + fid + '"]'); var ff = fc && fc.querySelector('.complaintField');
      if (ff) { jcScrollTo(fc); ff.focus(); } }); }
  if (scP && scP.scrollTop !== scT) scP.scrollTop = scT;
}

function paneScroller() {
  var sc = HOST && HOST.parentElement;
  return sc && getComputedStyle(sc).overflowY === 'auto' ? sc : null;
}
function pinOffset() {
  if (!HOST) return;
  if (paneScroller()) { HOST.style.setProperty('--jcTop', '0px'); return; }
  var tb = document.querySelector('.topbar'), pz = document.querySelector('.pz-hdr'), pzt = pz && pz.querySelector('.pz-top');
  var h = pz ? Math.round(pz.getBoundingClientRect().height - (pzt ? pzt.getBoundingClientRect().height : 0)) : (tb ? Math.round(tb.getBoundingClientRect().height) : 0);
  HOST.style.setProperty('--jcTop', (h + 6) + 'px');
}
/* scroll a job card into view under the band — inside the pane when it scrolls, else the window */
function jcScrollTo(card) {
  var band = R.querySelector('.headBand'), sc = paneScroller();
  if (sc) {
    var top = sc.getBoundingClientRect().top;
    var bb = band ? band.getBoundingClientRect() : null;
    var pad = bb && bb.height && bb.bottom <= card.getBoundingClientRect().top ? bb.bottom - top + 12 : 12;
    sc.scrollTo({ top: Math.max(0, card.getBoundingClientRect().top - top + sc.scrollTop - pad), behavior: 'smooth' });
    return;
  }
  var pad2 = band && getComputedStyle(band).position === 'sticky' ? band.getBoundingClientRect().bottom + 12 : 12;
  window.scrollTo({ top: Math.max(0, card.getBoundingClientRect().top + window.scrollY - pad2), behavior: 'smooth' });
}
window.addEventListener('resize', function () { pinOffset(); });


/* Enter stores the field you are in: saves at once, gives a quick flash, and leaves the field.
   Fields that already use Enter for something (Work performed lines, part rows moving on)
   handle it first and are left alone. In a console dialog, Enter presses its main button. */
function enterCommits(e) {
  if (e.key !== 'Enter' || e.shiftKey || e.ctrlKey || e.metaKey || e.altKey || e.defaultPrevented) return;
  var t = e.composedPath ? e.composedPath()[0] : e.target;
  if (!t || t.tagName !== 'INPUT') return;
  var ty = (t.type || 'text').toLowerCase();
  if (['checkbox', 'radio', 'button', 'submit', 'file', 'range', 'color'].indexOf(ty) > -1) return;
  e.preventDefault();
  var box = t.closest && t.closest('.modalBox');
  if (box) { var p = box.querySelector('.mbtn.primary'); if (p) p.click(); return; }
  t.dispatchEvent(new Event('change', { bubbles: true }));
  save(true);
  t.classList.remove('stored'); void t.offsetWidth; t.classList.add('stored');
  setTimeout(function () { t.classList.remove('stored'); }, 700);
  t.blur();
}

/* ============================ mounting inside the TEC app ============================ */

function keyFor(ro) { return ro ? ro.id + '|' + STATE.savedAt + '|' + String(UI.roOp[ro.id]) + '|' + (typeof tcxOn === 'function' && tcxOn(ro.id) ? 'tc' + TCX.list.join(',') + (TCX.view ? 'v' : '') : 'ro') : ''; }

function ensureHost() {
  if (HOST) return;
  /* the console uses the app's own fonts now, so there is nothing extra to load */
  HOST = document.createElement('div');
  HOST.className = 'jc-host';
  HOST.setAttribute('data-device', deviceMode());
  R = HOST.attachShadow({ mode: 'open' });
  R.innerHTML = '<style>' + JC_CSS + JC_ZF + '</style><div class="page" id="page"></div><div class="toast" id="toast"></div>' +
    '<input type="file" id="importFile" accept=".html,.htm,.json,text/html,application/json" style="display:none">';
  R.addEventListener('keydown', enterCommits);
  /* a click anywhere on a section header opens or closes it, not just the label and chevron */
  R.addEventListener('click', function (e) {
    var t = e.target, h = t.closest && t.closest('.jsec-h');
    if (!h || t.closest('button, input, select, textarea, a, label, .menu, [contenteditable]')) return;
    var tg = h.querySelector('.jsec-t'); if (tg) { e.stopPropagation(); tg.click(); }
  });
  R.getElementById('importFile').addEventListener('change', function (e) {
    var file = e.target.files && e.target.files[0];
    e.target.value = '';
    if (file) importSheet(file);
  });
}


/* ============ list + work ============ */
var JC_SEC = 'time';
function secTabs(card, job) {
  var bento = card.querySelector('.jbento'); if (!bento) return;
  var clk = bento.querySelector('.jbx-clock');
  var nP = punchesOf(job).length, rp = (job.parts || []).filter(function (p) { return p && (p.description || p.partNumber); }), nIn = rp.filter(function (p) { return /Received|Installed/.test(p.status || ''); }).length;
  var defs = [['time', 'Time', nP ? String(nP) : ''], ['parts', 'Parts', rp.length ? nIn + '/' + rp.length : '']];
  var bar = el('div', { class: 'secTabs', role: 'tablist' });
  function paint() {
    bento.classList.toggle('sec-time', JC_SEC === 'time'); bento.classList.toggle('sec-parts', JC_SEC === 'parts');
    Array.prototype.forEach.call(bar.children, function (b) { var on = b.getAttribute('data-k') === JC_SEC; b.classList.toggle('on', on); b.setAttribute('aria-selected', on ? 'true' : 'false'); });
  }
  defs.forEach(function (d) {
    bar.appendChild(el('button', { class: 'secTab', type: 'button', role: 'tab', 'data-k': d[0], onClick: function (e) { e.stopPropagation(); JC_SEC = d[0]; paint(); } }, [
      document.createTextNode(d[1]), d[2] ? el('span', { class: 'secN mono', text: d[2] }) : null]));
  });
  if (clk && clk.nextSibling) bento.insertBefore(bar, clk.nextSibling); else bento.insertBefore(bar, bento.firstChild);
  paint();
}
/* four key facts up front; "Show all" opens every field right here in the pane */
function buildKeyFields() {
  var mi = String(RO.mileage || '').replace(/[^\d]/g, ''), m = roMoney(RO);
  var cells = [['VIN', RO.vin || '\u2014'], ['Mileage', mi ? Number(mi).toLocaleString() + ' mi' : '\u2014'], ['Estimate', money(m.total)], ['Bay', spotOf(RO.location) || RO.location || '\u2014']];   /* the VIN always shows */
  var box = el('div', { class: 'kf' });
  box.appendChild(el('div', { class: 'kfGrid' }, cells.map(function (c) { return el('div', { class: 'kfC' + (c[0] === 'VIN' ? ' kfVin' : '') }, [el('span', { class: 'kfK', text: c[0] }), el('b', { class: 'kfV' + (c[0] === 'VIN' ? ' mono' : ''), text: c[1] })]); })));
  box.appendChild(el('button', { class: 'kfMore', type: 'button', text: 'Show all \u25be', onClick: function (e) { e.stopPropagation(); setDetails(!detailsOpen); render(); } }));
  return box;
}
