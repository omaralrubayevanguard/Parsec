/* Parsec · ro-page · helpers.js
   DOM and format helpers local to the RO page (el, svg, hm, hms, uid…) and the attachment store in IndexedDB for files not yet in the folder.
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   el elRaw svg num fx hm pad hms parseDate sevQB sevInk uid … (22 functions, 6 constants)
   uses       data/ kit/ pages/inventory/ state/
*/
/* ============================ helpers ============================ */

function el(tag, attrs, kids) {
  var n = elRaw(tag, attrs, kids);
  if (tag === 'button' && !n.getAttribute('aria-label') && n.title && !/[A-Za-z0-9]/.test(n.textContent || '')) n.setAttribute('aria-label', n.title);
  return n;
}
function elRaw(tag, attrs, kids) {
  var n = document.createElement(tag);
  if (attrs) Object.keys(attrs).forEach(function (k) {
    if (k === 'class') n.className = attrs[k];
    else if (k === 'style') n.setAttribute('style', attrs[k]);
    else if (k === 'text') n.textContent = attrs[k];
    else if (k === 'html') n.innerHTML = attrs[k];
    else if (k.slice(0, 2) === 'on') n.addEventListener(k.slice(2).toLowerCase(), attrs[k]);
    else if (attrs[k] !== null && attrs[k] !== undefined && attrs[k] !== false) n.setAttribute(k, attrs[k]);
  });
  (kids || []).forEach(function (c) { if (c) n.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); });
  return n;
}
function svg(d, size, w) {
  var s = '<svg width="' + (size || 12) + '" height="' + (size || 12) + '" viewBox="0 0 12 12" fill="none">' +
          '<path d="' + d + '" stroke="currentColor" stroke-width="' + (w || 1.7) + '" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var t = document.createElement('span'); t.style.display = 'inline-flex'; t.innerHTML = s; return t;
}
var ICON = {
  check: 'M2 6.4 L4.8 9 L10 3.2',
  plus:  'M6 1.5v9M1.5 6h9',
  down:  'M2.6 4.4 6 7.8 9.4 4.4',
  x:     'M2.5 2.5 9.5 9.5M9.5 2.5 2.5 9.5'
};
var HEAD_ICONS = {
  tech: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15.5 3.5a4.6 4.6 0 0 0-4.2 6.4L4 17.2a2 2 0 1 0 2.8 2.8l7.3-7.3a4.6 4.6 0 0 0 5.7-6.1l-2.6 2.6-2.4-.6-.6-2.4z" fill="currentColor" opacity=".16"/><path d="M15.5 3.5a4.6 4.6 0 0 0-4.2 6.4L4 17.2a2 2 0 1 0 2.8 2.8l7.3-7.3a4.6 4.6 0 0 0 5.7-6.1l-2.6 2.6-2.4-.6-.6-2.4z"/></svg>',
  customer: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="8" r="3.6" fill="currentColor" opacity=".16" stroke="none"/><circle cx="12" cy="8" r="3.6"/><path d="M4.5 20a7.5 7.5 0 0 1 15 0z" fill="currentColor" opacity=".16" stroke="none"/><path d="M4.5 20a7.5 7.5 0 0 1 15 0"/></svg>',
  vin: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" fill="currentColor" opacity=".16" stroke="none"/><path d="M3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM7 9v6M9.5 9v6M12 9v6M15 9v6M17 9v6"/></svg>',
  engHours: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="13.5" r="7" fill="currentColor" opacity=".16" stroke="none"/><circle cx="12" cy="13.5" r="7"/><path d="M9.5 3h5M12 3v3.5M18.5 7l1.5-1.5M12 10v3.5l2.3 1.6"/></svg>',
  miles: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 16a8 8 0 1 1 16 0z" fill="currentColor" opacity=".16" stroke="none"/><path d="M3.5 17a8.5 8.5 0 1 1 17 0M12 17l4-5M6.5 13.5l1 .6M12 8.5v1.2M17.5 13.5l-1 .6"/><circle cx="12" cy="17" r="1.3" fill="currentColor" stroke="none"/></svg>',
  unit: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2.5 6.5a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1V16h-12zM14.5 9.5h3.6l2.9 3.4V16h-6.5z" fill="currentColor" opacity=".16" stroke="none"/><path d="M3.5 5.5h10a1 1 0 0 1 1 1V16h-12V6.5a1 1 0 0 1 1-1zM14.5 9.5h3.6l2.9 3.4V16h-6.5M2.5 16h2M9 16h7.5"/><circle cx="6.5" cy="17" r="1.9"/><circle cx="18.5" cy="17" r="1.9"/></svg>',
  caseNo: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" fill="currentColor" opacity=".16" stroke="none"/><path d="M3 8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM9 6V4.5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1V6M3 12.5h18M11 12.5v2h2v-2"/></svg>',
  opened: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 7.5A2.5 2.5 0 0 1 6.5 5h11A2.5 2.5 0 0 1 20 7.5V10H4z" fill="currentColor" opacity=".22" stroke="none"/><path d="M6.5 5h11A2.5 2.5 0 0 1 20 7.5v10a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 17.5v-10A2.5 2.5 0 0 1 6.5 5zM4 10h16M8 3v4M16 3v4"/><circle cx="8.5" cy="14" r="1.1" fill="currentColor" stroke="none"/><circle cx="12" cy="14" r="1.1" fill="currentColor" stroke="none"/><circle cx="15.5" cy="14" r="1.1" fill="currentColor" stroke="none"/></svg>',
  closed: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 7.5A2.5 2.5 0 0 1 6.5 5h11A2.5 2.5 0 0 1 20 7.5V10H4z" fill="currentColor" opacity=".22" stroke="none"/><path d="M6.5 5h11A2.5 2.5 0 0 1 20 7.5v10a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 17.5v-10A2.5 2.5 0 0 1 6.5 5zM4 10h16M8 3v4M16 3v4M9 14.8l2 2 4-4"/></svg>',
  days: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 4h10v2.5a5 5 0 0 1-2.5 4.3L12 12l-2.5-1.2A5 5 0 0 1 7 6.5zM7 20h10v-2.5a5 5 0 0 0-2.5-4.3L12 12l-2.5 1.2A5 5 0 0 0 7 17.5z" fill="currentColor" opacity=".16" stroke="none"/><path d="M5.5 3.5h13M5.5 20.5h13M7 4v2.5a5 5 0 0 0 2.5 4.3L12 12l2.5-1.2A5 5 0 0 0 17 6.5V4M7 20v-2.5a5 5 0 0 1 2.5-4.3L12 12l2.5 1.2a5 5 0 0 1 2.5 4.3V20"/></svg>',
  location: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 21s-7-6.2-7-11.5a7 7 0 1 1 14 0C19 14.8 12 21 12 21z" fill="currentColor" opacity=".16" stroke="none"/><path d="M12 21s-7-6.2-7-11.5a7 7 0 1 1 14 0C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.6"/></svg>',
  keyTag: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="8" cy="8" r="4.5" fill="currentColor" opacity=".16" stroke="none"/><circle cx="8" cy="8" r="4.5"/><path d="M11.2 11.2 20 20M16.5 16.5l2-2M14 14l2-2"/><circle cx="7" cy="7" r="1.2" fill="currentColor" stroke="none"/></svg>'
};
var MENU_ICONS = {
  bars: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h10"/></svg>',
  dots: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="5" r="1.9" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.9" fill="currentColor" stroke="none"/><circle cx="12" cy="19" r="1.9" fill="currentColor" stroke="none"/></svg>',
  addPart: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 3l6.9 4v8L10 19l-6.9-4V7z" fill="currentColor" opacity=".16" stroke="none"/><path d="M10 3l6.9 4v8L10 19l-6.9-4V7z"/><circle cx="10" cy="11" r="2.4"/><path d="M19 15v6M16 18h6"/></svg>',
  addJob: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3.5 6A1.5 1.5 0 0 1 5 4.5h14A1.5 1.5 0 0 1 20.5 6v9H3.5z" fill="currentColor" opacity=".16" stroke="none"/><path d="M13 19.5H5A1.5 1.5 0 0 1 3.5 18V6A1.5 1.5 0 0 1 5 4.5h14A1.5 1.5 0 0 1 20.5 6v7M7 9h10M7 12.5h6M18.5 15.5v6M15.5 18.5h6"/></svg>',
  print: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9.5A1.5 1.5 0 0 1 5.5 8h13A1.5 1.5 0 0 1 20 9.5V16h-3v-2.5H7V16H4z" fill="currentColor" opacity=".16" stroke="none"/><path d="M7 8V3.5h10V8M7 16H5.5A1.5 1.5 0 0 1 4 14.5v-5A1.5 1.5 0 0 1 5.5 8h13A1.5 1.5 0 0 1 20 9.5v5a1.5 1.5 0 0 1-1.5 1.5H17M7 13.5h10V20.5H7z"/><circle cx="16.8" cy="11" r=".9" fill="currentColor" stroke="none"/></svg>',
  eye: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" fill="currentColor" opacity=".16" stroke="none"/><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/></svg>',
  trash: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 7h12l-1 12.3a1.5 1.5 0 0 1-1.5 1.4h-7a1.5 1.5 0 0 1-1.5-1.4z" fill="currentColor" opacity=".16" stroke="none"/><path d="M4 7h16M9.5 7V4.8a.8.8 0 0 1 .8-.8h3.4a.8.8 0 0 1 .8.8V7M6 7l1 12.3a1.5 1.5 0 0 0 1.5 1.4h7a1.5 1.5 0 0 0 1.5-1.4L18 7M10 11v6M14 11v6"/></svg>',
  save: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 4h10.6L20 8.4V19a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1z" fill="currentColor" opacity=".16" stroke="none"/><path d="M5 4h10.6L20 8.4V19a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1zM8 4v4.5h7V4M7.5 20v-6a1 1 0 0 1 1-1h7a1 1 0 0 1 1 1v6"/></svg>',
  pdf: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6.5 3h8l4 4v13a1 1 0 0 1-1 1h-11a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" fill="currentColor" opacity=".16" stroke="none"/><path d="M14.5 3h-8a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1V7zM14.5 3v4h4M9 17.5v-3M12 17.5v-6M15 17.5v-4.5"/></svg>',
  open: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 7.5A2.5 2.5 0 0 1 5.5 5h3.6l2 2h7.4A2.5 2.5 0 0 1 21 9.5v8a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 3 17.5z" fill="currentColor" opacity=".16" stroke="none"/><path d="M3 7.5A2.5 2.5 0 0 1 5.5 5h3.6l2 2h7.4A2.5 2.5 0 0 1 21 9.5v8a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 3 17.5zM12 10.5v6M9.5 14l2.5 2.5 2.5-2.5"/></svg>',
  sample: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 3.5l1.8 4.7 4.7 1.8-4.7 1.8L10 16.5l-1.8-4.7L3.5 10l4.7-1.8z" fill="currentColor" opacity=".16" stroke="none"/><path d="M10 3.5l1.8 4.7 4.7 1.8-4.7 1.8L10 16.5l-1.8-4.7L3.5 10l4.7-1.8zM18 14.5l.9 2.1 2.1.9-2.1.9-.9 2.1-.9-2.1-2.1-.9 2.1-.9z"/></svg>',
  reset: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="8" fill="currentColor" opacity=".12" stroke="none"/><path d="M19.5 12a7.5 7.5 0 1 1-2.2-5.3M19.5 4v3.7h-3.7"/></svg>'
};
/* swap every icon set for the 3D multi-colour version; sizes stay what each spot asked for */
(function(){
  function sz(str){ var w = /width="([\d.]+)"/.exec(str), h = /height="([\d.]+)"/.exec(str); return [w ? +w[1] : 16, h ? +h[1] : (w ? +w[1] : 16)]; }
  function swap(obj, map){ Object.keys(map).forEach(function(k){ if(!obj[k]) return; var d = sz(obj[k]); if(SF[map[k]]) obj[k] = sfIcon(SF[map[k]], d[0]); else if(I3[map[k]]) obj[k] = i3(I3[map[k]], d[0], d[1]); }); }
  var same = function(keys){ var m = {}; keys.forEach(function(k){ m[k] = k; }); return m; };
  swap(IC, same(["warn","user","note","plus","play","stop","swap","report","download","upload","backup","restore","folder","folderSync","save","sample","trash","clockPlus","pencil","tag","print","arrowL","clock","details","part","clip","grid","undo","eraser"]));
  swap(DEVICE_IC, same(["desktop","tablet","phone"]));
  swap(HEAD_ICONS, same(["tech","customer","vin","engHours","miles","unit","caseNo","opened","closed","days","location","keyTag"]));
  swap(MENU_ICONS, { addPart:"addPart", addJob:"addJob", print:"print", eye:"eye", trash:"trash", save:"save", pdf:"pdf", open:"open", sample:"sample", reset:"reset" });
  swap(INV_ICON, { scan:"scan", kit:"kit", box:"box" });
  var tl = sfIcon(SF.sun, 18), td = sfIcon(SF.moon, 18), tm = sfIcon(SF.halfmoon, 18);
  Object.keys(THEME_ICON).forEach(function(k){ THEME_ICON[k] = THEMES[k] && THEMES[k].dark ? td : tl; });
})();

function num(v) { var n = parseFloat(v); return isFinite(n) ? n : 0; }
function fx(v) { return num(v).toFixed(2); }
function hm(dec) {
  var s = Math.abs(num(dec)), h = Math.floor(s + 1e-9), m = Math.round((s - h) * 60);
  if (m === 60) { h += 1; m = 0; }
  return h + ':' + (m < 10 ? '0' + m : m);
}
function pad(n) { return n < 10 ? '0' + n : '' + n; }
function hms(dec) {            /* h:mm — the live clocks keep their seconds elsewhere */
  var t = Math.max(0, Math.round(Math.abs(num(dec)) * 60));
  return Math.floor(t / 60) + ':' + pad(t % 60);
}
function parseDate(s) {
  if (!s) return null;
  var m = /^(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})$/.exec(s.trim());
  if (m) return new Date(+m[3], +m[1] - 1, +m[2]);
  m = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(s.trim());
  if (m) return new Date(+m[1], +m[2] - 1, +m[3]);
  return null;
}
/* One rule everywhere (list, cards, header): share of the quote used. */
function sevQB(q, b) {
  if (!(b > 0)) return C.green;
  if (!(q > 0)) return C.red;
  var r = b / q;
  return r <= 1 ? C.green : (r <= 1.15 ? C.amber : C.red);
}
/* The severity hexes are light-mode inks. Painted as text on the dark card the green
   reads 3.8:1 and the red 3.1:1 \u2014 both under AA \u2014 and the amber is 3.2:1 on white.
   Text goes through here, which hands back a token carrying a proper ink for each
   theme (the dark ones are the same three the RO totals already use). Bars, dots and
   segment fills keep the solid hex: they are fills, not text, and the chart colours
   should not move. */
var SEV_INK = { '#0E8A5F': 'var(--sev-good)', '#D97706': 'var(--sev-warn)', '#D0271D': 'var(--sev-bad)' };
function sevInk(hex) { return SEV_INK[hex] || hex; }
function uid() { return Math.random().toString(36).slice(2, 10); }
function bytes(n) {
  if (n < 1024) return n + ' B';
  if (n < 1048576) return (n / 1024).toFixed(0) + ' KB';
  return (n / 1048576).toFixed(1) + ' MB';
}
function toast(msg, action) {
  var t = R.getElementById('toast');
  t.innerHTML = '';
  t.appendChild(document.createTextNode(msg));
  if (action) {
    var btn = document.createElement('button');
    btn.className = 'toastBtn';
    btn.type = 'button';
    if (action.label === 'UNDO') { btn.innerHTML = IC.undo; btn.title = 'Undo'; btn.setAttribute('aria-label', 'Undo'); }
    else btn.textContent = action.label;
    btn.addEventListener('click', function () {
      t.classList.remove('show', 'act');
      clearTimeout(toast._t);
      action.run();
    });
    t.appendChild(btn);
  }
  t.classList.add('show');
  t.classList[action ? 'add' : 'remove']('act');
  clearTimeout(toast._t);
  toast._t = setTimeout(function () { t.classList.remove('show', 'act'); }, action ? 15000 : 2400);
}

/* Undo rides the TEC app's own undo stack, so Ctrl+Z and the toast's UNDO agree. */
function snapshot(label) { pushUndo(label || 'console change'); return true; }
function restoreSnapshot() { undoLast(); }

/* ============================ attachment storage ============================ */

var IDB_NAME = 'ro-job-console', IDB_STORE = 'files';
function idb() {
  return new Promise(function (res, rej) {
    if (!window.indexedDB) return rej(new Error('no indexeddb'));
    var r = indexedDB.open(IDB_NAME, 1);
    r.onupgradeneeded = function () { r.result.createObjectStore(IDB_STORE); };
    r.onsuccess = function () { res(r.result); };
    r.onerror = function () { rej(r.error); };
  });
}
function idbPut(id, blob) {
  return idb().then(function (db) {
    return new Promise(function (res, rej) {
      var t = db.transaction(IDB_STORE, 'readwrite');
      t.objectStore(IDB_STORE).put(blob, id);
      t.oncomplete = function () { res(); }; t.onerror = function () { rej(t.error); };
    });
  });
}
function idbGet(id) {
  return idb().then(function (db) {
    return new Promise(function (res, rej) {
      var t = db.transaction(IDB_STORE, 'readonly'), q = t.objectStore(IDB_STORE).get(id);
      q.onsuccess = function () { res(q.result || null); }; q.onerror = function () { rej(q.error); };
    });
  });
}
function idbDel(id) {
  return idb().then(function (db) {
    return new Promise(function (res) {
      var t = db.transaction(IDB_STORE, 'readwrite');
      t.objectStore(IDB_STORE).delete(id);
      t.oncomplete = function () { res(); }; t.onerror = function () { res(); };
    });
  });
}
function blobToDataUrl(b) {
  return new Promise(function (res, rej) {
    var r = new FileReader(); r.onload = function () { res(r.result); }; r.onerror = function () { rej(r.error); };
    r.readAsDataURL(b);
  });
}
function dataUrlToBlob(u) {
  var p = u.split(','), mime = /:(.*?);/.exec(p[0])[1], bin = atob(p[1]);
  var arr = new Uint8Array(bin.length);
  for (var i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return new Blob([arr], { type: mime });
}
