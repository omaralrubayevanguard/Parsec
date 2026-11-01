/* Parsec · access · idle-and-end-of-day.js
   The clock on the login page, the idle check (nobody touching it → lock) and the end of the shop day.
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   lgIdleCheck lgEodCheck lgState pxSignInHtml (4 functions)
   uses       data/ kit/ pages/foreman/ shell/ state/
   at load    2× a timer · a delayed start · on document keydown
*/
/* ---------- the clock on the login page; nobody touching it; the end of the shop day ---------- */
function lgIdleCheck(){
  var m = +permRules().idle || 0; if(!(m > 0) || pxOut() || lockIs() || LG.el || !staffList().length) return;
  if(Date.now() - LG.last >= m * 60000) lgLockNow("idle");
}
function lgEodCheck(){
  var r = permRules(); if(r.eod === false || pxOut() || !staffList().length) return false;
  var c = fmCfg(), now = new Date(), end = new Date(now), e = +c.end; if(!(e > 0)) return false;
  end.setHours(Math.floor(e), Math.round((e % 1) * 60), 0, 0);
  if(now < end) return false;
  var sin = pxLS("tec_signin_at"); if(!sin || new Date(sin) >= end) return false;      /* signed in after the day ended: leave them be */
  if(pxLS("tec_eod_out") === todayStr() + "|" + sin) return false;
  pxLS("tec_eod_out", todayStr() + "|" + sin);
  if(!viewAsStaff()) try{ audit("signout", "Admin signed out (end of day)"); }catch(x){}
  pxLogout(true); render(); return true;
}
setInterval(function(){
  var tt = document.querySelector("[data-lg-t]"); if(tt){ var n = lgNow(); tt.textContent = n.t; var ap = tt.nextElementSibling; if(ap) ap.textContent = n.ap; var dd = document.querySelector("[data-lg-d]"); if(dd) dd.textContent = n.d; }
  try{ lgIdleCheck(); }catch(e){}
}, 2000);
setInterval(function(){ try{ lgEodCheck(); }catch(e){} }, 20000);
setTimeout(function(){ try{ lgEodCheck(); }catch(e){} try{ lgSync(); }catch(e){} }, 1500);
/* for the tests: where the pad is */
function lgState(){ return { who: LG.who, ctx: LG.ctx, mode: LG.mode, pin: LG.pin, msg: LG.msg, why: LG.why, open: !!LG.el }; }

function pxSignInHtml(){ return lgLoginHtml(); }   /* Parsec 13: the login page (b9/v130a.js) */
/* while signed out, keys go nowhere except the PIN box */
document.addEventListener("keydown", function(e){
  if(!pxOut() && !fsGateOn()) return;
  var t = e.target; if(t && t.closest && t.closest(".modal")) return;
  if(e.key === "Tab") return;
  if(e.key === "Escape" && UI.modal){ UI.modal = null; render(); }
  if((e.ctrlKey || e.metaKey) && /^[kz]$/i.test(e.key)) e.preventDefault();
  e.stopImmediatePropagation();
}, true);
