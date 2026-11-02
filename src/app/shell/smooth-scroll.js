/* Parsec · shell · smooth-scroll.js
   Smooth scrolling everywhere: a mouse wheel's steps glide on the page and in every scrolling pane (the RO page's too); touchpads, zoom and reduced motion are left alone.
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   smsRM smsTarget smsStep SMS (3 functions, 1 constant)
   at load    on document wheel
*/
/* ============================== smooth scrolling, everywhere (Parsec 17.1) ==============================
   A mouse wheel moves a page or a list in steps; here each step glides instead — on the page and in every scrolling
   pane (lists, side panels, the RO page inside its shadow root). Touchpads already scroll smoothly, so their small,
   fine steps are left alone, as are Ctrl+wheel (zoom), sideways wheels and anyone who asked for reduced motion. */
var SMS = { el: null, y: 0, raf: 0 };
function smsRM(){ try{ return window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches; }catch(e){ return false; } }
/* the first element under the pointer that can still scroll that way */
function smsTarget(path, dy){
  for(var i = 0; i < path.length; i++){
    var el = path[i]; if(!el || el.nodeType !== 1) continue;
    if(el === document.body || el === document.documentElement) break;
    if(el.scrollHeight <= el.clientHeight + 1) continue;
    var oy = getComputedStyle(el).overflowY; if(oy !== "auto" && oy !== "scroll") continue;
    if(dy < 0 ? el.scrollTop > 0 : el.scrollTop + el.clientHeight < el.scrollHeight - 1) return el;
  }
  var se = document.scrollingElement || document.documentElement;
  return (dy < 0 ? se.scrollTop > 0 : se.scrollTop + se.clientHeight < se.scrollHeight - 1) ? se : null;
}
function smsStep(){
  var el = SMS.el; if(!el || !el.isConnected){ SMS.el = null; SMS.raf = 0; return; }
  var cur = el.scrollTop, d = SMS.y - cur;
  if(Math.abs(d) < 1){ el.scrollTop = SMS.y; SMS.el = null; SMS.raf = 0; return; }
  el.scrollTop = cur + (Math.abs(d) < 4 ? d : d * 0.14);
  if(Math.abs(el.scrollTop - cur) < 0.5 && Math.abs(d) > 1){ SMS.el = null; SMS.raf = 0; return; }   /* hit an end */
  SMS.raf = requestAnimationFrame(smsStep);
}
document.addEventListener("wheel", function(e){
  if(e.defaultPrevented || e.ctrlKey || e.metaKey || e.shiftKey || smsRM()) return;
  if(Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
  var dy = e.deltaY * (e.deltaMode === 1 ? 40 : e.deltaMode === 2 ? window.innerHeight * .9 : 1);
  if(e.deltaMode === 0 && Math.abs(dy) < 50) return;   /* a touchpad's fine steps: already smooth */
  var path = e.composedPath ? e.composedPath() : [e.target];
  for(var i = 0; i < path.length; i++){ var n = path[i]; if(n && n.nodeType === 1 && (n.tagName === "SELECT" || n.tagName === "TEXTAREA" || (n.tagName === "INPUT" && n.type === "number"))) return; }
  var el = smsTarget(path, dy); if(!el) return;
  e.preventDefault();
  var max = el.scrollHeight - el.clientHeight;
  if(SMS.el !== el){ SMS.el = el; SMS.y = el.scrollTop; }
  SMS.y = Math.max(0, Math.min(max, SMS.y + dy));
  if(!SMS.raf) SMS.raf = requestAnimationFrame(smsStep);
}, { capture: true, passive: false });
