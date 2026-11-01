/* Parsec · access · lock-screen.js
   Stepping away: the lock screen (lgLockNow / lgUnlock), switching person from the lock, and the quick switcher off your name (lgMeMenu).
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   lgLockWho lgLockNow lgUnlock lgLockSwitch lgSync lgMeMenu (6 functions)
   uses       clock/ data/ kit/ ro/ shell/ state/
   at load    on window keydown · on window click · on window change
*/
/* ---------- stepping away: the lock screen ---------- */
function lgLockWho(){ return viewAsId() || "__admin"; }
function lgLockNow(why){
  if(pxOut()) return;
  var id = lgLockWho();
  if(lgNeedsNew(id)){ if(why === "idle") return; LG.who = null; lgOpen(id, "setlock"); if(LG.who){ LG.mode = "new1"; LG.why = "lock"; lgDraw(); } return; }
  lgClose();
  lockOn(); pxLS("tec_locked_at", nowIso());
  try{ audit("lock", lgName(id) + (why === "idle" ? " — locked after " + permRules().idle + " min with no one on it" : " stepped away — locked")); }catch(e){}
  UI.pxPop = null; UI.profileOpen = false; scheduleSave(true);
  render();
}
function lgUnlock(id){
  lockOff(); pxLS("tec_locked_at", null);
  try{ audit("unlock", lgName(id) + " came back — unlocked"); }catch(e){}
  scheduleSave(true); render();
  pushToast("Welcome back" + (id === "__admin" ? "" : ", " + lgFirst(lgName(id))) + " — right where you left it.");
}
function lgLockSwitch(){
  var id = LG.who; lgClose(); lockOff(); pxLS("tec_locked_at", null);
  var rp = runningPunch(), os0 = openShift(), nm = lgName(id);
  try{ audit("signout", nm + " — signed out from the lock screen (switch user)"); }catch(e){}
  UI.pxPop = null; pxLS("tec_out", "1"); pxLS("tec_viewas", null); pxLS("tec_signin_at", null); UI.modal = null; UI.selectedRo = null;
  persistUI(); render();
  pushToast(rp ? lgFirst(nm) + "’s clock keeps running on " + roTag(getRO(rp.roId)) + " — switching never stops it." : os0 ? lgFirst(nm) + "’s day clock keeps running." : "Pick your name.");
}
/* after every redraw: the lock screen if this computer is locked (a refresh doesn't get past it) */
function lgSync(){
  if(pxOut()){ if(lockIs()){ lockOff(); pxLS("tec_locked_at", null); } if(LG.ctx === "lock") lgClose(); return; }
  if(lockIs()){ var id = lgLockWho(); if(LG.ctx !== "lock" || LG.who !== id){ lgClose(); LG.who = id; LG.ctx = "lock"; LG.mode = "pin"; LG.pin = ""; LG.msg = ""; LG.st = ""; lgDraw(true); } }
  else if(LG.ctx === "lock") lgClose();
}

/* ---------- the quick switcher, off your name ---------- */
function lgMeMenu(st){
  var me = viewAsStaff(), L = recentStaff(6).filter(function(sf){ return !me || sf.id !== me.id; });
  lgSignable().forEach(function(sf){ if(L.length < 4 && (!me || sf.id !== me.id) && L.indexOf(sf) < 0) L.push(sf); });
  L = L.slice(0, 4);
  var h = '<div class="px-sep"></div><div class="lgm-l">Switch to</div><div class="lgm-pp">' + L.map(function(sf){ var on = lgOn(sf);
      return '<button class="lgm-p" data-lg="sw" data-id="' + sf.id + '" title="Switch to ' + esc(sf.name || "") + '"><span class="lg-avw">' + staffAvHtml(sf, "lgm-av", "m") + (on ? '<i class="lg-dot lg' + on.k.charAt(0) + '"></i>' : '') + '</span><span class="lgm-n">' + esc(lgFirst(sf.name)) + '</span></button>'; }).join("")
    + '<button class="lgm-p" data-action="px-switch" title="Someone else — the login page"><span class="lg-avw"><span class="lgm-av lgm-more">' + lgIc("users", 16) + '</span></span><span class="lgm-n">Someone else</span></button></div>'
    + '<div class="px-sep"></div>'
    + '<button class="px-mi" data-lg="lock">' + lgIc("moon", 15) + 'Step away — lock<span class="meta">' + pxKbd("Ctrl L") + '</span></button>'
    + '<button class="px-mi" data-action="px-logout">' + pxI("exit", 15) + 'Log out<span class="meta">' + (st !== "out" ? 'the clock keeps running' : '') + '</span></button>';
  return h;
}

/* ---------- keys and clicks: the pad and the lock come first ---------- */
window.addEventListener("keydown", function(e){
  LG.last = Date.now();
  if(LG.el && LG.who){
    if(e.key === "Tab") return;
    var t = e.target; if(t && t.closest && t.closest("#lgpin") && /^(INPUT|TEXTAREA)$/.test(t.tagName)) return;
    e.stopImmediatePropagation();
    if(/^\d$/.test(e.key)){ e.preventDefault(); lgKey(e.key); return; }
    if(e.key === "Backspace"){ e.preventDefault(); lgKey("del"); return; }
    if(e.key === "Escape" && LG.ctx !== "lock"){ e.preventDefault(); lgClose(); return; }
    if(!e.ctrlKey && !e.metaKey) e.preventDefault();
    return;
  }
  if((e.ctrlKey || e.metaKey) && !e.shiftKey && !e.altKey && (e.key === "l" || e.key === "L") && !pxOut() && staffList().length){ e.preventDefault(); e.stopImmediatePropagation(); lgLockNow("step"); }
}, true);
window.addEventListener("click", function(e){
  var b = e.target.closest && e.target.closest("[data-lg]"); if(!b || (LG.el && LG.el.contains(b))) return;
  e.preventDefault(); e.stopImmediatePropagation();
  var k = b.getAttribute("data-lg");
  if(k === "sw"){ UI.pxPop = null; render(); lgOpen(b.getAttribute("data-id"), "switch"); return; }
  if(k === "lock"){ lgLockNow("step"); return; }
}, true);
/* the old "see the app as" picker asks for the PIN too */
window.addEventListener("change", function(e){
  var t = e.target; if(!t || !t.dataset || !t.dataset.viewas) return;
  e.stopImmediatePropagation();
  var v = t.value; try{ t.value = viewAsId(); }catch(x){}
  if(v) lgOpen(v, "switch"); else lgOpen("__admin", "switch");
}, true);
["pointerdown", "wheel", "touchstart"].forEach(function(ev){ window.addEventListener(ev, function(){ LG.last = Date.now(); }, { capture: true, passive: true }); });
