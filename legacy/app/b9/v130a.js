/* Parsec 13 (A) — the login page, the PIN pad, the quick switcher, stepping away, the end of the shop day (the user's picks).
   The login page: name tiles by department, recent on this computer first, a dot on who's on the clock, a line under each
   name, the time and date big, the clocks that are running, the Admin as a small link. A 4-digit PIN for everyone, on a pad
   that lives outside the app's redraws (#lgpin). Five wrong tries, then a minute. Someone with no PIN yet, or a temporary
   one, picks their own (twice). Switch user: a row of people off your name. Step away: a lock screen your PIN opens — a
   refresh doesn't get past it. Built on b9/v130.js. */
var LG = { el: null, who: null, ctx: null, mode: null, pin: "", first: "", msg: "", st: "", tmr: null, why: "", last: Date.now() };
var LG_IC = {
  back: '<path d="M14.5 6l-6 6 6 6"/>', del: '<path d="M9 5.5h10A1.5 1.5 0 0 1 20.5 7v10a1.5 1.5 0 0 1-1.5 1.5H9L3.5 12z"/><path d="M11.5 9.5l5 5M16.5 9.5l-5 5"/>',
  lock: '<rect x="5" y="10.5" width="14" height="9.5" rx="2"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/>', shield: '<path d="M12 3.5l7 2.75v5.25c0 4.5-3 7.75-7 9-4-1.25-7-4.5-7-9V6.25z"/><path d="M9 12l2.25 2.25L15.5 10"/>',
  users: '<circle cx="9" cy="9" r="3.25"/><path d="M3 19c.7-3 3-4.75 6-4.75s5.3 1.75 6 4.75"/><path d="M15.5 6a3 3 0 0 1 0 6M17.5 14.5c1.9.6 3.1 2.1 3.5 4.5"/>',
  moon: '<path d="M19.5 14.5A7.75 7.75 0 0 1 9.5 4.5a7.75 7.75 0 1 0 10 10z"/>'
};
function lgIc(k, s){ return '<svg class="lg-ic" viewBox="0 0 24 24" width="' + (s || 16) + '" height="' + (s || 16) + '" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (LG_IC[k] || "") + '</svg>'; }
function lgStaff(id){ return id && id !== "__admin" ? staffList().filter(function(s){ return s.id === id; })[0] || null : null; }
function lgName(id){ var sf = lgStaff(id); return id === "__admin" ? "Admin" : sf ? sf.name || "Unnamed" : ""; }
function lgFirst(n){ return String(n || "").split(" ")[0]; }
function lgShop(){ return String(STATE.shopName || (STATE.settings && STATE.settings.shopName) || "Vanguard Truck Center · Greensboro"); }
function lgClk(t){ try{ return pcClk(t); }catch(e){ return fmtTime(t); } }
function lgNow(){ var d = new Date(), h = d.getHours(); return { t: ((h % 12) || 12) + ":" + String(d.getMinutes()).padStart(2, "0"), ap: h < 12 ? "am" : "pm", d: d.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" }) }; }
/* on the clock: a job (green) or the day clock (amber) */
function lgOn(sf){
  if(!sf || !sf.name) return null;
  var rq = runningPunchOfPerson(sf.name); if(rq) return { k: "job", t: "on the clock · " + roTag(getRO(rq.roId)), ro: roTag(getRO(rq.roId)), since: lgClk(rq.start) };
  var sh = openShiftOf(sf.name); if(sh) return { k: "day", t: "on the day clock" };
  return null;
}
function lgLine(sf){
  var on = lgOn(sf); if(on) return on.t;
  if(sf.role === "Technician"){ var n = STATE.ros.filter(function(ro){ return !roIsDone(ro) && techSame(ro.assignedTech, sf.name); }).length; return n + " open RO" + (n === 1 ? "" : "s"); }
  return sf.role || "";
}
function lgSignable(){ return staffList().filter(function(sf){ return sf && !sf.noSignIn && !sf.off; }); }

/* ---------- the login page ---------- */
function lgClocksHtml(){
  var R = runningPunches(), L = [], seen = [];
  R.forEach(function(p){ var w = punchOwner(p), shop = false; try{ shop = isShopPunch(p); }catch(e){} seen.push(w);
    L.push('<div class="pxs-clk"><i class="lg-cd ' + (shop ? "lgs" : "lgj") + '"></i><b>' + esc(pcName(w)) + '</b><span>' + esc(shop ? "shop time" : "on " + roTag(getRO(p.roId))) + '</span><em>since ' + esc(lgClk(p.start)) + '</em></div>'); });
  try{ pcMigrate(); }catch(e){}
  shiftList().forEach(function(s){ if(s.out) return; var w = shiftOwner(s); if(seen.some(function(x){ return sameOwner(x, w); })) return; seen.push(w);
    L.push('<div class="pxs-clk"><i class="lg-cd lgd"></i><b>' + esc(pcName(w)) + '</b><span>on the day clock</span><em>since ' + esc(lgClk(s.in)) + '</em></div>'); });
  if(!L.length) return "";
  return '<div class="pxs-clks lg-clks" data-key="pxs-clks"><small>' + (L.length === 1 ? "A clock is running" : L.length + " clocks are running") + '</small>' + L.join("") + '<p>Signing in or out never stops one.</p></div>';
}
function lgTile(sf){
  var on = lgOn(sf);
  return '<button class="pxs-p lg-t" data-action="viewas-set" data-id="' + sf.id + '" title="' + esc(sf.name || "") + ' — sign in"><span class="lg-avw">' + staffAvHtml(sf, "pxs-av", "s") + (on ? '<i class="lg-dot lg' + on.k.charAt(0) + '" title="' + esc(on.t) + '"></i>' : '') + '</span><b>' + esc(sf.name || "Unnamed") + '</b><small' + (on && on.k === "job" ? ' class="on"' : '') + '>' + esc(lgLine(sf)) + '</small><span class="pin" title="Asks for a PIN">' + lgIc("lock", 12) + '</span></button>';
}
function lgLoginHtml(){
  var all = lgSignable(), rec = recentStaff(4), recIds = rec.map(function(s){ return s.id; }), n = lgNow(), groups = [];
  Object.keys(DEPT_OF).forEach(function(role){ var g = all.filter(function(sf){ return sf.role === role && recIds.indexOf(sf.id) < 0; }); if(g.length) groups.push([DEPT_OF[role], g]); });
  var other = all.filter(function(sf){ return !DEPT_OF[sf.role] && recIds.indexOf(sf.id) < 0; }); if(other.length) groups.push(["Other", other]);
  var brand = '<aside class="lg-brand"><div class="lg-mark"><span class="lg">' + PX_LOGO + '</span><b>Parsec</b></div><div class="lg-shop">' + esc(lgShop()) + '</div>'
    + '<div class="lg-time" data-lg-time><b><span data-lg-t>' + n.t + '</span><em>' + n.ap + '</em></b><span data-lg-d>' + esc(n.d) + '</span></div>' + lgClocksHtml() + '</aside>';
  var main = '<section class="lg-main"><h2>Who’s signing in?</h2><p>Pick your name, then your PIN.</p>';
  if(!all.length) main += '<p class="pxs-none">No one is set up yet — sign in as Admin, then add people on the Admin page.</p>';
  if(rec.length) main += '<div class="pxs-gl lg-gl">Recent on this computer</div><div class="pxs-pp lg-pp">' + rec.map(lgTile).join("") + '</div>';
  groups.forEach(function(g){ main += '<div class="pxs-gl lg-gl">' + esc(g[0]) + '</div><div class="pxs-pp lg-pp">' + g[1].map(lgTile).join("") + '</div>'; });
  main += '<div class="lg-foot"><button class="lg-adm" data-action="viewas-reset">' + lgIc("shield", 13) + 'Admin</button><span>·</span><span>Forgot your PIN? The admin can reset it.</span></div></section>';
  return '<div class="px pxs lgp" data-key="px-signin">' + brand + main + '</div>';
}

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
