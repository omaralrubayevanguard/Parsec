/* ============================== Phone view (Parsec 9.6) ==============================
   The same Parsec, laid out for a phone: Appearance › Screen › Phone (or Automatic on a phone).
   Your four pages in a bar at the bottom, every other page under More; the bar slides away while
   you scroll down and comes back when you scroll up. Lists open full screen, with Back. */
var PM = { det: {}, more: false, hide: false, view: null, pend: false, y: 0, el: null };
function pmOn(){ return document.documentElement.getAttribute("data-device") === "phone"; }
/* Parsec 12.2: no Inbox and no Console — every page has its own list of what needs doing */
var PM_TABS = { Technician: ["tech", "ros", "timelog", "fixes"], Manager: ["manager", "rolist", "foreman", "timelog"], Foreman: ["foreman", "rolist", "triage", "timelog"],
  "Service writer": ["triage", "rolist", "warranty", "parts"], Triage: ["triage", "rolist", "foreman", "parts"], Parts: ["parts", "rolist", "fixes", "timelog"],
  "Warranty admin": ["warranty", "rolist", "parts", "fixes"], admin: ["rolist", "tech", "triage", "manager"] };
var PM_NAME = { tech: "Technician", console: "Console", triage: "Triage", rolist: "ROs", ros: "ROs", foreman: "Foreman", warranty: "Warranty", manager: "Manager", parts: "Parts", timelog: "Time Log", fixes: "Fixes", career: "Career", inbox: "Inbox", report: "Day report", profile: "You" };
var PM_SHORT = { timelog: "Time", foreman: "Floor", tech: "My ROs" };
var PM_GROUPS = [["", ["career", "timelog", "rolist", "ros", "tech", "triage", "foreman", "parts", "warranty", "manager", "fixes", "report"]]];   /* the sidebar's order */
function pmRole(){ var s = typeof viewAsStaff === "function" ? viewAsStaff() : null; return s && s.role ? s.role : "admin"; }
function pmAllowed(){ var a = {}; navPages().forEach(function(p){ a[p[0]] = p[1]; }); if(a.ros && a.rolist) delete a.ros; return a; }
function pmTabKeys(){
  var a = pmAllowed(), want = PM_TABS[pmRole()] || PM_TABS.admin, out = [];
  want.forEach(function(k){ if(k === "ros" && !a.ros && a.rolist) k = "rolist"; if(k === "rolist" && !a.rolist && a.ros) k = "ros"; if(a[k] && out.indexOf(k) < 0) out.push(k); });
  Object.keys(a).forEach(function(k){ if(out.length < 4 && out.indexOf(k) < 0) out.push(k); });
  return out.slice(0, 4);
}
function pmIco(k, sz){ var m = { rolist: "ros", report: "print", profile: "user" }; return ivIco((typeof IV_NAV_IC !== "undefined" && IV_NAV_IC[k]) || m[k] || k, sz || 22) || ""; }
function pmBadge(k){
  try{
    if(k === "inbox") return IB.badge() || 0;
    if(k === "warranty") return wcNeedCount() || 0;
    if(k === "triage") return UI.view !== "triage" ? (UI.tgBadgeN || 0) : 0;
    if(k === "foreman") return UI.view !== "foreman" ? (UI.fmBadgeN || 0) : 0;
  }catch(e){}
  return 0;
}
function pmIsOn(k){ var v = UI.view; return v === k || (k === "rolist" && v === "ros") || (k === "ros" && v === "rolist"); }
/* the bottom bar, the detail bar and the More sheet — drawn where the sidebar goes */
function pmShellHtml(){
  var keys = pmTabKeys(), v = UI.view, inTabs = keys.some(pmIsOn);
  var tab = function(k){ var b = pmBadge(k), on = !PM.more && pmIsOn(k);
    return '<button class="pm-tab' + (on ? ' on' : '') + '" data-action="nav" data-view="' + k + '"' + (on ? ' aria-current="page"' : '') + '><span class="w">' + pmIco(k)
      + (b ? '<em>' + (b > 99 ? "99+" : b) + '</em>' : '') + '</span><span class="l">' + esc(PM_SHORT[k] || PM_NAME[k] || k) + '</span></button>'; };
  var h = '<nav class="pm-tabs' + (PM.hide && !PM.more ? ' hide' : '') + '" aria-label="Pages" data-key="pm-tabs">' + keys.map(tab).join('')
    + '<button class="pm-tab' + (PM.more || !inTabs ? ' on' : '') + '" data-pm="more" aria-haspopup="dialog"><span class="w">' + pmIco("more") + '</span><span class="l">More</span></button></nav>';
  if(PM.det[v] && pmHasList()) h += '<div class="pm-dbar" data-key="pm-dbar"><button class="pm-back" data-pm="back">' + ivIco("chevL", 20) + '<span>' + esc(PM_NAME[v] || "Back") + '</span></button></div>';
  if(PM.more) h += pmMoreHtml();
  return h;
}
function pmMoreHtml(){
  var a = pmAllowed(), me = viewAsStaff(), nm = typeof pxMeName === "function" ? pxMeName() : (me ? me.name : "Admin"), role = typeof pxMeRole === "function" ? pxMeRole() : (me ? me.role : "Admin");
  var sh = null; try{ sh = openShift(); }catch(e){}
  var grid = PM_GROUPS.map(function(g){ var L = g[1].filter(function(k){ return a[k]; }); if(!L.length) return '';
    return (g[0] ? '<div class="pm-gh">' + esc(g[0]) + '</div>' : '') + '<div class="pm-grid">' + L.map(function(k){ var b = pmBadge(k);
      return '<button class="pm-pg' + (pmIsOn(k) && UI.view !== "profile" ? ' on' : '') + '" data-action="nav" data-view="' + k + '">' + pmIco(k, 24) + '<span>' + esc(PM_NAME[k] === "ROs" ? "RO list" : PM_NAME[k] || a[k]) + '</span>' + (b ? '<em>' + b + '</em>' : '') + '</button>'; }).join('') + '</div>'; }).join('');
  var clock = sh ? '<div class="pm-clk"><i class="on"></i><span><b>On the clock since ' + esc(fmtTime(sh.in)) + '</b><small>Clock out for lunch, a break or the day</small></span><button class="pm-btn" data-action="shift-out">Clock out</button></div>'
    : '<div class="pm-clk"><i></i><span><b>Off the clock</b><small>Clock in to start your day</small></span><button class="pm-btn pri" data-action="shift-in">Clock in</button></div>';
  return '<div class="pm-scrim" data-pm="close" data-key="pm-scrim"></div><div class="pm-sheet" role="dialog" aria-label="Every page" data-key="pm-sheet"><div class="pm-grab"></div>'
    + '<button class="pm-me" data-action="px-profile" data-s="you">' + (typeof pxAv === "function" ? pxAv("pm-av") : '') + '<span><b>' + esc(nm) + '</b><small>' + esc(role) + '</small></span>' + ivIco("chevR", 16) + '</button>'
    + clock + grid
    + '<div class="pm-gh">Settings</div><div class="pm-rows">'
    + '<button data-action="open-palette">' + ivIco("search", 18) + '<span>Search</span><small>RO, VIN, unit, customer or part</small></button>'
    + '<button data-action="px-profile" data-s="look">' + ivIco("sun", 18) + '<span>Appearance</span><small>Screen, theme, size</small></button>'
    + '<button data-action="px-profile" data-s="data">' + ivIco("save", 18) + '<span>Your data</span><small>Folder, backups, Parsec Mobile</small></button>'
    + (staffList().length ? '<button data-action="px-switch">' + ivIco("exit", 18) + '<span>Switch user</span><small>Sign in as someone else</small></button>' : '')
    + '</div></div>';
}
function pmHasList(){ return !!document.querySelector("#app .main .tg-list, #app .main .px-list"); }
/* after every redraw: Back state on the page, the bar where it was */
/* the computer view on a phone-size screen shows the whole page zoomed out, like a desktop site, so nothing piles up and Screen › Phone stays in reach */
function pmViewport(){
  var m = document.querySelector('meta[name="viewport"]'); if(!m){ m = document.createElement("meta"); m.name = "viewport"; document.head.appendChild(m); }
  var small = Math.min(screen.width || 9999, screen.height || 9999) < 760;
  var want = pmOn() ? "width=device-width, initial-scale=1, viewport-fit=cover" : (small ? "width=1280" : "width=device-width, initial-scale=1");
  if(m.getAttribute("content") !== want) m.setAttribute("content", want);
}
function pmAfter(){
  var de = document.documentElement;
  pmViewport();
  if(!pmOn()){ de.classList.remove("pm-det", "pm-more"); return; }
  if(PM.view !== UI.view){ if(PM.view !== null){ PM.det[UI.view] = false; PM.hide = false; } PM.view = UI.view; PM.more = false; }
  if(PM.pend){ PM.pend = false; if(pmHasList()){ PM.det[UI.view] = true; pmPush("det"); window.scrollTo(0, 0); pmSoft(); return; } }
  de.classList.toggle("pm-det", !!PM.det[UI.view] && pmHasList());
  de.classList.toggle("pm-more", !!PM.more);
}
/* redraw only the shell (the More sheet, the Back bar) when the page itself hasn't changed */
function pmSoft(){ render(); }
/* the phone's back button: closes More, then an opened row, before it leaves the page */
function pmPush(k){ try{ if(!history.state || history.state.pm !== k) history.pushState({ pm: k }, ""); }catch(e){} }
function pmShut(){ if(PM.more){ PM.more = false; render(); return true; } if(PM.det[UI.view]){ PM.det[UI.view] = false; render(); window.scrollTo(0, PM.y || 0); return true; } return false; }
function pmClose(){ var st = null; try{ st = history.state; }catch(e){} if(st && st.pm){ history.back(); } else pmShut(); }
window.addEventListener("popstate", function(){ if(pmOn()) pmShut(); });
function pmSetHide(h){ if(PM.hide === h) return; PM.hide = h; var t = document.querySelector(".pm-tabs"); if(t) t.classList.toggle("hide", h && !PM.more); }
(function(){
  /* taps: More, Back, close; a row in a list opens it full screen */
  document.addEventListener("click", function(ev){
    if(!pmOn()) return;
    var t = ev.target, p = t.closest && t.closest("[data-pm]");
    if(p){ ev.preventDefault(); ev.stopPropagation(); var k = p.getAttribute("data-pm");
      if(k === "more"){ if(PM.more){ pmClose(); } else { PM.more = true; pmPush("more"); pmSetHide(false); render(); } }
      else if(k === "close" || k === "back"){ pmClose(); }
      return; }
    if(t.closest && t.closest('[data-action="fs-local"]')){ try{ localStorage.setItem("pm_local", "1"); }catch(e){} }
    if(PM.more && t.closest && t.closest(".pm-sheet [data-action]")){ PM.more = false; }
    if(t.closest && t.closest("#app .main .tg-views")){ PM.det[UI.view] = false; }
    var prof = t.closest && t.closest('[data-action="px-profile"][data-s], [data-action="px-sec"][data-s]');
    if(prof){ PM.pend = true; PM.y = 0; }   /* a settings section opens on that section */
    var row = t.closest && t.closest("#app .main .tg-list .tg-it, #app .main .tg-list .tk-di, #app .main .px-list .px-it, #app .main .px-list button");
    if(row){ var act = t.closest("[data-a],[data-action],button,a,input,select,label,textarea");
      if(!act || act === row || !row.contains(act)){ PM.y = window.scrollY; PM.pend = true;
        setTimeout(function(){ if(PM.pend){ PM.pend = false; PM.det[UI.view] = true; pmPush("det"); window.scrollTo(0, 0); render(); } }, 0); } }
  }, true);
  /* the bar hides while you scroll down and comes back when you scroll up — the page or any list inside it */
  var last = new WeakMap(), lastWin = 0;
  function moved(y, prev){ if(PM.more) return; if(y > prev + 6 && y > 56) pmSetHide(true); else if(y < prev - 6 || y < 24) pmSetHide(false); }
  window.addEventListener("scroll", function(){ if(!pmOn()) return; var y = window.scrollY; moved(y, lastWin); lastWin = y; }, { passive: true });
  document.addEventListener("scroll", function(ev){ if(!pmOn()) return; var el = ev.target; if(!el || el === document || !el.scrollTop && el.scrollTop !== 0) return;
    var y = el.scrollTop, prev = last.get(el) || 0; last.set(el, y); moved(y, prev); }, { capture: true, passive: true });
  /* Escape closes More; the phone's back gesture closes More, then Back in a list */
  document.addEventListener("keydown", function(ev){ if(!pmOn()) return; if(ev.key === "Escape" && (PM.more || PM.det[UI.view])){ pmClose(); ev.stopPropagation(); } }, true);
})();
