/* Parsec · access · pin-pad.js
   The PIN pad: open for a person, draw, keys and clicks, the first-time PIN, and sign in when it matches (lgSignIn).
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   lgNeedsNew lgOpen lgClose lgPad lgDraw lgClick lgKey lgEnter lgDone lgSignIn (10 functions)
   uses       clock/ data/ kit/ ro/ shell/ state/
*/
/* ---------- the PIN pad ---------- */
function lgNeedsNew(id){ var sf = lgStaff(id); return id === "__admin" ? !adminPinIs() : !pinIs(sf); }
function lgOpen(id, ctx){
  var sf = lgStaff(id);
  if(id !== "__admin" && !sf) return;
  if(sf && (sf.off || sf.noSignIn)){ pushToast((sf.name || "They") + " can’t sign in — their sign-in is off. The admin can turn it back on."); return; }
  if(ctx === "switch" && ((id === "__admin" && !viewAsStaff() && !pxOut()) || (sf && viewAsId() === sf.id))){ pushToast("You’re already signed in as " + lgName(id) + "."); return; }
  LG.who = id; LG.ctx = ctx; LG.pin = ""; LG.first = ""; LG.msg = ""; LG.st = ""; LG.why = "";
  LG.mode = lgNeedsNew(id) ? "new1" : "pin";
  if(LG.mode === "new1") LG.why = id === "__admin" ? "admin" : "none";
  UI.pxPop = null; UI.profileOpen = false;
  lgDraw(true);
}
function lgClose(){ if(LG.tmr){ clearInterval(LG.tmr); LG.tmr = null; } if(LG.el){ LG.el.remove(); LG.el = null; } LG.who = null; LG.ctx = null; LG.mode = null; LG.pin = ""; LG.first = ""; }
function lgPad(dis){ return '<div class="lg-pad">' + [1, 2, 3, 4, 5, 6, 7, 8, 9].map(function(d){ return '<button type="button" data-lgk="' + d + '"' + (dis ? ' disabled' : '') + '>' + d + '</button>'; }).join("") + '<button type="button" class="k" data-lgk="forgot">Forgot?</button><button type="button" data-lgk="0"' + (dis ? ' disabled' : '') + '>0</button><button type="button" class="k" data-lgk="del" aria-label="Delete">' + lgIc("del", 22) + '</button></div>'; }
function lgDraw(anim){
  var id = LG.who; if(!id){ lgClose(); return; }
  var sf = lgStaff(id), adm = id === "__admin", nm = lgName(id), wait = LG.mode === "pin" ? pinWaitMs(id) : 0, lock = LG.ctx === "lock";
  var sub = LG.mode === "pin" ? (lock ? "Locked at " + esc(lgClk(pxLS("tec_locked_at") || nowIso())) + " — your page is where you left it" : adm ? "The Admin PIN" : "Your 4-digit PIN")
    : LG.mode === "new1" ? (LG.why === "temp" ? "That was a temporary PIN — pick your own 4 digits" : LG.why === "admin" ? "Set the Admin PIN — 4 digits, asked for every time" : LG.why === "lock" ? "Pick a 4-digit PIN first — it’s what unlocks the screen" : "Pick a 4-digit PIN — you’ll use it every time you sign in")
    : "Type it again";
  var on = sf ? lgOn(sf) : null;
  var av = adm ? '<span class="lg-pav adm">' + lgIc("shield", 26) + '</span>' : staffAvHtml(sf, "lg-pav", "lg");
  var msg = wait ? "Five wrong tries — try again in " + Math.ceil(wait / 1000) + " s" : LG.msg;
  var h = '<div class="lg-card' + (anim ? " an" : "") + '" role="dialog" aria-modal="true" aria-label="' + esc(nm) + ' — PIN">'
    + (lock ? '' : '<button type="button" class="lg-back" data-lgk="x">' + lgIc("back", 14) + (LG.ctx === "setlock" ? "Not now" : "Not you?") + '</button>')
    + av + '<h4>' + esc(nm) + '</h4><p class="lg-sub">' + sub + '</p>'
    + (on && on.k === "job" && LG.mode === "pin" ? '<div class="lg-clkn"><i></i>Your clock is running · ' + esc(on.ro) + ' since ' + esc(on.since) + '</div>' : '')
    + '<div class="lg-dots' + (LG.st ? " " + LG.st : "") + '">' + [0, 1, 2, 3].map(function(i){ return '<i' + (i < LG.pin.length ? ' class="f"' : '') + '></i>'; }).join("") + '</div>'
    + '<div class="lg-msg' + (LG.st === "bad" || wait ? " bad" : "") + '" aria-live="polite">' + esc(msg || "") + '</div>' + lgPad(!!wait)
    + (lock ? '<button type="button" class="lg-not" data-lgk="switch">Not ' + esc(lgFirst(nm)) + '? Switch user</button>' : '')
    + '</div>';
  if(!LG.el){ LG.el = document.createElement("div"); LG.el.id = "lgpin"; LG.el.className = "lgx"; LG.el.addEventListener("click", lgClick); document.body.appendChild(LG.el); }
  LG.el.className = "lgx" + (lock ? " lock" : "") + (anim ? " an" : "");
  LG.el.innerHTML = h;
  if(wait && !LG.tmr) LG.tmr = setInterval(function(){ if(!LG.el || !LG.who){ clearInterval(LG.tmr); LG.tmr = null; return; } if(!pinWaitMs(LG.who)){ clearInterval(LG.tmr); LG.tmr = null; LG.msg = ""; LG.st = ""; } lgDraw(); }, 1000);
}
function lgClick(e){
  var b = e.target.closest && e.target.closest("[data-lgk]");
  if(!b){ if(e.target === LG.el && LG.ctx !== "lock") lgClose(); return; }
  e.preventDefault(); e.stopPropagation(); lgKey(b.getAttribute("data-lgk"));
}
function lgKey(k){
  var id = LG.who; if(!id) return;
  if(k === "x"){ lgClose(); return; }
  if(k === "switch"){ lgLockSwitch(); return; }
  if(k === "forgot"){ pushToast(id === "__admin" ? "The Admin PIN is reset from the data file — ask whoever set Parsec up." : "Ask " + permAsk() + " — they can give you a temporary PIN on the Admin page."); return; }
  if(LG.mode === "pin" && pinWaitMs(id)) return;
  if(LG.st){ LG.st = ""; LG.pin = ""; }
  if(k === "del"){ LG.pin = LG.pin.slice(0, -1); LG.msg = ""; lgDraw(); return; }
  if(!/^\d$/.test(k) || LG.pin.length >= 4) return;
  LG.pin += k; LG.msg = "";
  if(LG.pin.length < 4){ lgDraw(); return; }
  lgDraw(); var pin = LG.pin;
  setTimeout(function(){ if(LG.who === id) lgEnter(pin); }, 120);
}
function lgEnter(pin){
  var id = LG.who, sf = lgStaff(id), adm = id === "__admin";
  if(LG.mode === "pin"){
    if(adm ? adminPinOk(pin) : pinOk(sf, pin)){
      pinFailClear(id);
      if(sf && sf.pinTemp){ LG.mode = "new1"; LG.why = "temp"; LG.pin = ""; LG.msg = ""; LG.st = ""; lgDraw(); return; }
      LG.st = "ok"; lgDraw(); setTimeout(lgDone, 260); return;
    }
    var x = pinFail(id, lgName(id)); LG.st = "bad";
    LG.msg = x.until ? "" : "Not right — " + (5 - x.n) + " " + (5 - x.n === 1 ? "try" : "tries") + " left";
    lgDraw(); setTimeout(function(){ if(LG.who === id && LG.st === "bad"){ LG.pin = ""; LG.st = ""; lgDraw(); } }, 650); return;
  }
  if(LG.mode === "new1"){ LG.first = pin; LG.mode = "new2"; LG.pin = ""; LG.msg = ""; lgDraw(); return; }
  if(LG.mode === "new2"){
    if(pin !== LG.first){ LG.mode = "new1"; LG.first = ""; LG.pin = ""; LG.st = "bad"; LG.msg = "Those didn’t match — pick one again"; lgDraw(); setTimeout(function(){ if(LG.st === "bad"){ LG.st = ""; LG.pin = ""; lgDraw(); } }, 650); return; }
    var was = LG.why;
    if(adm) adminPinSet(pin); else pinSet(sf, pin, false);
    try{ audit("pin", adm ? "Admin PIN set" : (sf.name || "Someone") + (was === "temp" ? " picked their own PIN — the temporary one is gone" : " picked a PIN")); }catch(e){}
    scheduleSave(true);
    LG.st = "ok"; lgDraw(); setTimeout(lgDone, 260);
  }
}
function lgDone(){
  var id = LG.who, ctx = LG.ctx; lgClose();
  if(ctx === "lock"){ lgUnlock(id); return; }
  if(ctx === "setlock"){ lgLockNow("step"); return; }
  lgSignIn(id, ctx);
}
/* signing in — from the login page, or switching from the page you're on */
function lgSignIn(id, ctx){
  var prev = viewAsStaff(), prevAdmin = !prev && !pxOut(), prevRp = pxOut() ? null : runningPunch(), sf = lgStaff(id), nm = lgName(id);
  if(id === "__admin") pxLS("tec_viewas", null); else pxLS("tec_viewas", id);
  lockOff(); pxLS("tec_locked_at", null);
  pxSignedIn();
  if(sf) recentPush(sf.id);
  try{
    if(ctx === "switch" && (prev || prevAdmin)) audit("switch", (prev ? prev.name : "Admin") + " switched to " + nm);
    else audit("signin", sf ? sf.name + " signed in (" + sf.role + ")" : "Admin signed in with PIN");
  }catch(e){}
  UI.roShowAll = false; UI.selectedRo = null; UI.profileOpen = false; UI.pxPop = null; UI.modal = null;
  persistUI(); scheduleSave(true); render();
  var msg = "Signed in as " + nm + (sf ? " · " + sf.role : "");
  if(ctx === "switch" && prev && prevRp) msg += " — " + lgFirst(prev.name) + "’s clock keeps running on " + roTag(getRO(prevRp.roId)) + ".";
  pushToast(msg);
}
