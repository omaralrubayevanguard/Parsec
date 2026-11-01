/* Parsec · ro-page · totals.js
   The RO totals row and the day strip under it.
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   roBar spotChip renderTotals renderDayStrip dayHover (4 functions, 1 constant)
   uses       pages/ state/
*/
/* ============================ render: totals ============================ */

function roBar(t, live) {
  /* the bar is the quote: burnt fills it; time over the quote fills back in from the right end */
  var H = 13, R = H / 2;
  var sev = sevQB(t.q, t.b);
  var wrap = el('span', { class: 'roBar' + (live ? ' live' : ''),
    style: 'position:relative;display:block;width:300px;max-width:100%;min-width:120px;height:' + H + 'px;flex-shrink:1;' +
           'border-radius:' + R + 'px;overflow:hidden;background:var(--line-2)' });
  if (t.q > 0 && t.b > 0) {
    var sp = barSplit(t.q, t.b);
    wrap.title = Math.round(sp.ratio * 100) + '% of the quote used (' + fx(t.b) + ' of ' + fx(t.q) + ' h)';
    wrap.appendChild(el('span', { class: 'roFill', style: 'position:absolute;left:0;top:0;bottom:0;width:' + sp.g.toFixed(3) +
      '%;background:linear-gradient(90deg,#0E8A5F,#0E8A5F)' }));
    if (sp.ov > 0.05) {
      wrap.appendChild(el('span', { class: 'roOver', style: 'position:absolute;right:0;top:0;bottom:0;width:' + sp.ov.toFixed(3) +
        '%;background:' + sev + ';box-shadow:var(--drop, -2px 0 0 #0A1A33)' }));
    }
  } else wrap.title = 'quoted ' + fx(t.q) + ' h \u2014 nothing burnt yet';
  return wrap;
}



/* Where the truck is parked, as a chip on the RO card: the bay number once it is in a
   bay, or the line and space it is sitting on. Clicking it opens the Foreman yard. */
function spotChip() {
  if (!RO) return null;
  var id = null, sp = null;
  try { id = spotOf(RO.location); sp = id ? spotById(id) : null; } catch (e) { return null; }
  if (!sp) return null;
  var line = sp.zone === 'lot' && typeof LOT_LINES !== 'undefined' && LOT_LINES[sp.row] ? LOT_LINES[sp.row].name : '';
  return el('button', { class: 'spotChip z-' + sp.zone, type: 'button',
    title: 'Parked at ' + id + (line ? ' \u2014 ' + line + ' line' : '') + ' \u2014 open the yard',
    onClick: function (e) { e.stopPropagation(); UI.view = 'foreman'; UI.yardPick = null; tecRender(); } },
    [el('span', { class: 'spotPin', html: '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11z"/><circle cx="12" cy="10" r="2.4" fill="currentColor" stroke="none"/></svg>' }),
     el('span', { text: spotLabel(sp) })]);
}
function renderTotals() {
  /* The RO's numbers, between the RA number and the customer. */
  var t = totals();
  var rem = t.q - t.b;
  var effColor = t.eff === null ? 'var(--muted)' : ({ '#0E8A5F': 'var(--good)', '#D97706': 'var(--warn)', '#D0271D': 'var(--danger)' }[sevQB(t.qs, t.b)] || 'var(--good)');
  function stat(label, big, small, bigStyle, key) {
    return el('div', { class: 'hStat' + (key ? ' hs-' + key : ''), title: label.charAt(0) + label.slice(1).toLowerCase() }, [
      el('span', { class: 'lbl rl', text: label }),
      el('span', { class: 'big', style: bigStyle || '', html: big }),
      el('span', { class: 'hm' + (/^\d+:\d\d$/.test(small) ? ' clk' : ''), text: small })
    ]);
  }
  return el('div', { class: 'headStats' }, [
    stat('QUOTED', fx(t.q), hms(t.q), '', 'quoted'),
    /* Burnt with Remaining under it — the pair reads against each other */
    el('div', { class: 'hStatCol' }, [
      stat('BURNT', fx(t.b), hms(t.b), '', 'burnt'),
      stat(rem < 0 ? 'OVER' : 'REMAINING', rem < 0 ? fx(-rem) : fx(rem), rem < 0 ? 'over the quote' : hms(rem),
           'color:' + (rem < 0 ? 'var(--danger)' : 'var(--good)'), 'rem')
    ]),
    stat('RECEIVED', t.recv + '<span style="font-size:11px;color:var(--muted)"> / ' + t.lines + '</span>', 'parts in hand',
         'color:' + (t.recv === t.lines ? 'var(--ink)' : 'var(--danger)'), 'recv'),
    el('div', { class: 'hStat hEff' }, [
      el('span', { class: 'lbl rl', text: 'RO EFFICIENCY', title: 'Quoted \u00f7 burnt, on the operations that have time on them' }),
      el('span', { class: 'effLine' }, [
        el('span', { class: 'big', style: 'color:' + effColor, text: t.eff === null ? '—' : Math.round(t.eff) + '%' }),
        roBar(t)
      ]),
      el('span', { class: 'hm', text: t.b === 0 ? 'no time logged yet' : (t.b > t.q ? fx(t.b - t.q) + ' h over the quote' : fx(t.q - t.b) + ' h left on the quote') })
    ])
  ]);
}

var dayHover = -1;
function renderDayStrip() {
  /* Bottom edge of the header band: burnt hours by job. Hover (or focus) a segment for its legend. */
  var t = totals();
  var wrap = el('div', { class: 'headDay' });
  var bar = el('div', { class: 'dayBar dayBarHover' });
  var pop = el('div', { class: 'segPop', role: 'tooltip' });
  var segs = [];

  function show(i, seg) {
    var j = S.jobs[i]; if (!j) return;
    var c = jobCalc(j);
    var share = t.b > 0 ? Math.round(c.b / t.b * 100) : 0;
    pop.innerHTML = '';
    pop.appendChild(el('div', { class: 'segPopHead' }, [
      el('span', { class: 'segSw', style: 'background:' + c.sev }),
      el('span', { class: 'segName', text: j.complaint || 'Operation ' + (i + 1) })
    ]));
    pop.appendChild(el('div', { class: 'segPopRow' }, [
      el('span', { text: 'Burnt' }), el('b', { class: 'mono', text: fx(c.b) + ' h' }),
      el('span', { class: 'segDim', text: share + '% of the RO' })
    ]));
    pop.appendChild(el('div', { class: 'segPopRow' }, [
      el('span', { text: 'Quoted' }), el('b', { class: 'mono', text: fx(num(j.quoted)) + ' h' }),
      el('span', { class: 'segDim', text: c.eff === null || c.eff === undefined ? '' : Math.round(c.eff) + '% eff.' })
    ]));
    pop.classList.add('show');
    pinPop(pop, seg, { prefer: 'above', gap: 6 });
    segs.forEach(function (s) { s.classList.toggle('hot', s === seg); });
    dayHover = i;
  }
  function hide() {
    pop.classList.remove('show');
    unpinPop(pop);
    segs.forEach(function (s) { s.classList.remove('hot'); });
    dayHover = -1;
  }

  S.jobs.forEach(function (j, i) {
    var c = jobCalc(j);
    if (c.b <= 0 || t.b <= 0) return;
    var seg = el('span', { class: 'daySeg', tabindex: '0',
      'aria-label': (j.complaint || 'Operation ' + (i + 1)) + ', ' + fx(c.b) + ' hours burnt',
      style: 'width:' + (c.b / t.b * 100).toFixed(3) + '%;background:' + c.sev,
      onMouseenter: function () { show(i, seg); }, onMouseleave: hide,
      onFocus: function () { show(i, seg); }, onBlur: hide });
    seg.dataset.i = i;
    segs.push(seg);
    bar.appendChild(seg);
  });
  if (t.b > 0 && t.q > 0) {
    bar.appendChild(el('span', { class: 'notch', title: 'quoted ' + fx(t.q) + ' h',
      style: 'left:' + Math.min(100, t.q / t.b * 100).toFixed(3) + '%' }));
  }
  var notchEl = bar.querySelector('.notch');
  var segJobs = segs.map(function (sg) { return +sg.dataset.i; });
  /* per-second refresh: same jobs with time? just move the widths and the notch */
  refs.dayUpdate = function () {
    if (!wrap.isConnected) return false;
    var t2 = totals(), now = [];
    S.jobs.forEach(function (j, i) { if (jobCalc(j).b > 0 && t2.b > 0) now.push(i); });
    if (now.join() !== segJobs.join() || !!notchEl !== (t2.b > 0 && t2.q > 0)) return false;
    segs.forEach(function (sg) { var c = jobCalc(S.jobs[+sg.dataset.i]); sg.style.width = (c.b / t2.b * 100).toFixed(3) + '%'; sg.style.background = c.sev; });
    if (notchEl) notchEl.style.left = Math.min(100, t2.q / t2.b * 100).toFixed(3) + '%';
    t = t2;
    if (dayHover > -1) { var s = segs.filter(function (x) { return +x.dataset.i === dayHover; })[0]; if (s) show(dayHover, s); }
    return true;
  };
  wrap.appendChild(el('span', { class: 'lbl rl rtDayLbl', title: 'Burnt hours on this RO, by operation \u2014 the tick is the quote', text: 'BURNT BY OPERATION' }));
  wrap.appendChild(bar);
  wrap.appendChild(pop);
  if (dayHover > -1) {
    var keep = dayHover;
    requestAnimationFrame(function () {
      var s = segs.filter(function (x) { return +x.dataset.i === keep; })[0];
      if (s && wrap.isConnected && s.matches(':hover, :focus')) show(keep, s);
      else if (s && wrap.isConnected) show(keep, s);
    });
  }
  return wrap;
}
