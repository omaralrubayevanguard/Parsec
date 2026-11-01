/* Parsec · shell · header-shrink.js
   The top bar shrinks on scroll and grows back (syncHeaderShrink on window scroll).
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   syncHeaderShrink measureTb TB_SHRINK_AT TB_GROW_AT TB_FULL_H (2 functions, 3 constants)
   uses       state/
   at load    on window scroll
*/
/* ---- shrink on scroll ----
   The header is sticky, so its full height is rent every page pays. Once you scroll
   past a little, it tightens to a shorter bar and gives that space back. The RO page
   is exempt: it fills the window and lays itself out against --tb-h, so resizing the
   header under it would shove the whole pane around while you work in it. */
var TB_SHRINK_AT = 28, TB_GROW_AT = 4, TB_FULL_H = 0;
/* when a page was only a little taller than the window, shrinking the bar made the page
   shorter, the browser pulled the scroll back above the line, the bar grew again, and so on
   about 40 times a second - the header and the day bar flickered. Now the bar only shrinks
   when the page has room to stay scrolled after it does, and it only grows back near the top. */
function syncHeaderShrink(){
  var tb = document.querySelector('.topbar'); if(!tb) return;
  var on = tb.classList.contains('tb-shrunk'), y = window.scrollY;
  if(!on) TB_FULL_H = Math.round(tb.getBoundingClientRect().height) || TB_FULL_H;
  var room = document.documentElement.scrollHeight - window.innerHeight;
  var drop = Math.max(24, TB_FULL_H - 44);              /* about how much shorter the page gets */
  var want = (UI.view !== "ros") && !UI.modal && (on ? y > TB_GROW_AT : (y > TB_SHRINK_AT && room - drop > TB_SHRINK_AT + 16));
  if(want === on) return;
  tb.classList.toggle('tb-shrunk', want);
  /* The bar animates its padding, so measuring right now reads a mid-transition height
     and --tb-h would stick at the wrong value. Measure once now so nothing lags a whole
     frame, then again once the transition has settled. */
  measureTb();
  clearTimeout(syncHeaderShrink._m);
  syncHeaderShrink._m = setTimeout(measureTb, 240);
}
function measureTb(){
  var tb = document.querySelector('.topbar'); if(!tb) return;
  document.documentElement.style.setProperty('--tb-h', Math.round(tb.getBoundingClientRect().height) + 'px');
}
window.addEventListener('scroll', function(){
  if(syncHeaderShrink._q) return;
  syncHeaderShrink._q = requestAnimationFrame(function(){ syncHeaderShrink._q = 0; syncHeaderShrink(); });
}, { passive:true });
