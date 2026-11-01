/* Parsec · access · sign-in.js
   Who is using this computer (not a password): pxOut / pxSignedIn, the sign-in state in localStorage (tec_viewas), and the login page's data (lgStaff, lgClk).
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   pxOut pxLogout pxSignedIn pxRenderOut lgIc lgStaff lgName lgFirst lgShop lgClk lgNow lgOn … (14 functions, 2 constants)
   state      ros settings shopName
   uses       clock/ data/ kit/ pages/ ro/ shell/ state/
*/
/* ---------- signing in and out (who is using this computer — not a password) ---------- */
function pxOut(){ return pxLS("tec_out") === "1"; }
function pxLogout(auto){
  var rp = runningPunch(), who = viewAsStaff(), os0 = openShift();
  if(who) audit("signout", who.name + " signed out" + (auto ? " (end of day)" : ""));
  pxLS("tec_out", "1"); pxLS("tec_viewas", null); pxLS("tec_signin_at", null); lockOff(); pxLS("tec_locked_at", null);   /* Parsec 13 */
  UI.pxPop = null; UI.modal = null; UI.profileOpen = null; UI.notifOpen = false; UI.pxPeek = false; UI.selectedRo = null;
  persistUI();
  pushToast((auto ? "End of day — signed out." : "Signed out.") + (rp ? " Your clock keeps running on " + roTag(getRO(rp.roId)) + "." : os0 ? " Your day clock keeps running." : ""));
}
function pxSignedIn(){
  pxLS("tec_out", null); pxLS("tec_signin_at", nowIso());
  UI.pxPop = null;
  var sf = viewAsStaff();
  if(sf) UI.view = PG.homeOf(sf.role);
  else if(!navAllowed(UI.view) || UI.view === "profile") UI.view = navPages()[0][0];
}
function pxRenderOut(){
  var html = pxSignInHtml() + modalHtml();
  if(UI.toast) html += '<div class="toast-wrap" role="status"><div class="toast">' + esc(UI.toast) + '</div></div>';
  document.documentElement.classList.add("px-out");
  patchApp(html);
  applyBigTouch();
  persistUI();
  if(UI.modal && UI.modal !== render._lastModal){ render._lastModal = UI.modal; var pi = document.getElementById("pin-in"); if(pi) pi.focus(); }
  else if(!UI.modal) render._lastModal = null;
}
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
