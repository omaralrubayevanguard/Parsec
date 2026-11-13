/* Parsec · access · pins.js
   PINs: salted SHA-256, never kept as typed (pinHash / pinValid), temporary PINs shown once, the Admin PIN.
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   sha256hex pinSalt pinHash pinValid pinSet pinClear pinIs pinOk pinTempNew adminPinSet adminPinIs adminPinOk … (35 functions, 2 constants)
   state      perm shop staff
   uses       data/ kit/ pages/ pages/rolist/ ro/ settings/ shell/ state/
   at load    on document dragstart · on document dragend · on document dragover · on document drop · on document keydown
*/
/* ---------- PINs: salted SHA-256, never kept as typed ---------- */
function sha256hex(str){
  function rr(n, x){ return (x >>> n) | (x << (32 - n)); }
  var K = [0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2];
  var H = [0x6a09e667,0xbb67ae85,0x3c6ef372,0xa54ff53a,0x510e527f,0x9b05688c,0x1f83d9ab,0x5be0cd19];
  var b = unescape(encodeURIComponent(String(str))), l = b.length, w = [], i, j;
  for(i = 0; i < l; i++) w[i >> 2] |= (b.charCodeAt(i) & 255) << (24 - (i % 4) * 8);
  w[l >> 2] |= 0x80 << (24 - (l % 4) * 8); w[((l + 8) >> 6 << 4) + 15] = l * 8;
  for(i = 0; i < w.length; i += 16){
    var a = H.slice(0), W = [];
    for(j = 0; j < 64; j++){
      if(j < 16) W[j] = w[i + j] | 0;
      else { var s0 = rr(7, W[j-15]) ^ rr(18, W[j-15]) ^ (W[j-15] >>> 3), s1 = rr(17, W[j-2]) ^ rr(19, W[j-2]) ^ (W[j-2] >>> 10); W[j] = (W[j-16] + s0 + W[j-7] + s1) | 0; }
      var S1 = rr(6, a[4]) ^ rr(11, a[4]) ^ rr(25, a[4]), ch = (a[4] & a[5]) ^ (~a[4] & a[6]), t1 = (a[7] + S1 + ch + K[j] + W[j]) | 0;
      var S0 = rr(2, a[0]) ^ rr(13, a[0]) ^ rr(22, a[0]), mj = (a[0] & a[1]) ^ (a[0] & a[2]) ^ (a[1] & a[2]), t2 = (S0 + mj) | 0;
      a = [(t1 + t2) | 0, a[0], a[1], a[2], (a[3] + t1) | 0, a[4], a[5], a[6]];
    }
    for(j = 0; j < 8; j++) H[j] = (H[j] + a[j]) | 0;
  }
  return H.map(function(x){ return ("00000000" + (x >>> 0).toString(16)).slice(-8); }).join("");
}
function pinSalt(){ var s = ""; for(var i = 0; i < 4; i++) s += Math.floor(Math.random() * 0x10000).toString(16); return s; }
function pinHash(pin, salt){ var h = String(pin) + "|" + salt; for(var i = 0; i < 400; i++) h = sha256hex(h + "|parsec"); return h; }
function pinValid(pin){ return /^\d{4}$/.test(String(pin || "")); }
function pinSet(sf, pin, temp){ if(!sf) return; var s = pinSalt(); sf.pinS = s; sf.pinH = pinHash(pin, s); sf.pinAt = nowIso(); if(temp) sf.pinTemp = true; else delete sf.pinTemp; }
function pinClear(sf){ if(!sf) return; delete sf.pinH; delete sf.pinS; delete sf.pinTemp; delete sf.pinAt; }
function pinIs(sf){ return !!(sf && sf.pinH); }
function pinOk(sf, pin){ return !!(sf && sf.pinH && pinHash(pin, sf.pinS || "") === sf.pinH); }
function pinTempNew(){ var p; do { p = String(Math.floor(1000 + Math.random() * 9000)); } while(/^(\d)\1{3}$/.test(p) || "0123456789".indexOf(p) >= 0 || "9876543210".indexOf(p) >= 0); return p; }
function adminPinSet(pin){ var sh = STATE.shop = STATE.shop || {}; if(!pin){ delete sh.adminPinH; delete sh.adminPinS; return; } sh.adminPinS = pinSalt(); sh.adminPinH = pinHash(pin, sh.adminPinS); sh.adminPinAt = nowIso(); delete sh.adminPin; }
function adminPinIs(){ return !!(STATE.shop && STATE.shop.adminPinH); }
function adminPinOk(pin){ var sh = STATE.shop || {}; return !!(sh.adminPinH && pinHash(pin, sh.adminPinS || "") === sh.adminPinH); }
/* wrong tries, on this computer: five, then a minute's wait */
var PIN_TRIES = 5, PIN_WAIT = 60000;
function pinFailMap(){ try{ return JSON.parse(localStorage.getItem("tec_pinfail") || "{}") || {}; }catch(e){ return {}; } }
function pinFailSave(m){ try{ localStorage.setItem("tec_pinfail", JSON.stringify(m)); }catch(e){} }
function pinWaitMs(id){ var x = pinFailMap()[id]; return x && x.until && x.until > Date.now() ? x.until - Date.now() : 0; }
function pinTriesLeft(id){ var x = pinFailMap()[id]; return PIN_TRIES - (x && !(x.until && x.until <= Date.now()) ? (x.n || 0) : 0); }
function pinFail(id, name){
  var m = pinFailMap(), x = m[id] || { n: 0 };
  if(x.until && x.until <= Date.now()) x = { n: 0 };
  x.n = (x.n || 0) + 1; if(x.n >= PIN_TRIES){ x.until = Date.now() + PIN_WAIT; }
  m[id] = x; pinFailSave(m);
  try{ audit("pinfail", (name || "Someone") + " — wrong PIN" + (x.until ? " (5 tries — a minute’s wait)" : "")); }catch(e){}
  return x;
}
function pinFailClear(id){ var m = pinFailMap(); if(m[id]){ delete m[id]; pinFailSave(m); } }
/* who signed in on this computer, newest first */
function recentList(){ try{ var L = JSON.parse(localStorage.getItem("tec_recent") || "[]"); return Array.isArray(L) ? L : []; }catch(e){ return []; } }
function recentPush(id){ if(!id) return; var L = recentList().filter(function(x){ return x !== id; }); L.unshift(id); try{ localStorage.setItem("tec_recent", JSON.stringify(L.slice(0, 6))); }catch(e){} }
function recentStaff(n){ var all = staffList(); return recentList().map(function(id){ return all.filter(function(sf){ return sf.id === id && !sf.off && !sf.noSignIn; })[0]; }).filter(Boolean).slice(0, n || 4); }
/* stepped away: the page stays, a PIN brings you back (a refresh doesn't get past it) */
function lockIs(){ return !!pxLS("tec_locked"); }
function lockOn(){ pxLS("tec_locked", viewAsId() || "__admin"); }
function lockOff(){ pxLS("tec_locked", null); }
function permRules(){ return permState().rules; }

function staffList(){ if(!Array.isArray(STATE.staff)) STATE.staff = [];
  /* Parsec 11: a technician gets the Technician page in place of Console (once — the Manager can switch Console back on) */
  STATE.staff.forEach(function(s){ if(s && s.role === "Technician" && !s.p11){ s.p11 = 1; s.pages = s.pages || {}; s.pages.console = false; s.pages.tech = true; } });
  /* Parsec 12.5: Parts, the foreman and the manager get the Inventory page (once — the Manager can take it away again) */
  STATE.staff.forEach(function(s){ if(s && !s.p125 && (s.role === "Parts" || s.role === "Foreman" || s.role === "Manager")){ s.p125 = 1; s.pages = s.pages || {}; s.pages.inventory = true; } });
  if(!STATE.perm || STATE.staff.some(function(s){ return s && (!s.ov || "pin" in s); }) || (STATE.shop && STATE.shop.adminPin)) permMigrate();   /* Parsec 13 */
  return STATE.staff; }
function viewAsId(){ try{ return localStorage.getItem("tec_viewas") || ""; }catch(e){ return ""; } }
/* 17.5: the Parts department's people (role Parts, not switched off) — the Salesman menu on an operation's parts; the one
   signed in, if they're one of them, goes on each part they add */
function partsPeople(){ return staffList().filter(function(s){ return s && !s.off && s.role === "Parts" && String(s.name || "").trim(); }).map(function(s){ return String(s.name).trim(); }); }
function partsMe(){ var me = viewAsStaff(); return me && !me.off && me.role === "Parts" ? String(me.name || "").trim() : ""; }
function viewAsStaff(){ var id = viewAsId(); return id ? staffList().filter(function(s){ return s.id === id; })[0] || null : null; }
function navAllowed(page){
  if(page === "profile") return true;
  if(page === "inbox" || page === "console") return false;   /* Parsec 12.2: these pages are gone — every page has its own list */
  if(page === "admin") return can("a.people");   /* Parsec 13: the Admin page — anyone given “Manage people and PINs” */
  if(page === "tech"){ var s0 = viewAsStaff(); return s0 ? permHas(s0, "pages", "tech") : true; }   /* Parsec 11: technicians — 11.3: and the admin, for any technician */
  var s = viewAsStaff(); if(!s) return true;
  if(page === "report" || page === "timelog") return true;   /* 17.1: everyone has their own Time Log */
  if(page === "career") return dpCareerOk();   /* 17.1: the people who clock on ROs, and whoever may see other people's time */
  if(page === "rolist") page = "ros";   /* the RO List goes with the Repair Orders page */
  return permHas(s, "pages", page);
}
function navPages(){ var l = NAV_PAGES.filter(function(p){ return navAllowed(p[0]); }); return l.length ? l : NAV_PAGES.slice(0, 1); }
function viewAsSelectHtml(id){
  var cur = viewAsId();
  return '<select id="'+id+'" class="va-sel" data-viewas="1" title="See the app the way this person does">'
    + '<option value=""'+(cur ? '' : ' selected')+'>Admin — every page</option>'
    + staffList().filter(function(s){ return !s.noSignIn; }).map(function(s){ return '<option value="'+s.id+'"'+(cur === s.id ? ' selected' : '')+'>'+esc(s.name || 'Unnamed')+' — '+esc(s.role)+'</option>'; }).join('')
    + '</select>';
}

function yardMove(roId, spot){
  var ro = getRO(roId); if(!ro) return;
  if(!spot) spot = "";
  var ym = yardMap();
  var from = spotOf(ro.location);
  if(from && (!ym.valid[from] || ym.map[from] !== ro)) from = null;
  if((from || "") === (spot || "")) return;
  pushUndo("move truck");
  var other = spot ? ym.map[spot] : null;
  if(other && other.id !== ro.id) other.location = from || "Off yard";
  ro.location = spot || "Off yard";
  scheduleSave(true);
  pushToast(spot ? (roLabel(ro) + " → " + spot + (other && other.id !== ro.id ? " · " + roLabel(other) + " → " + (from || "no spot") : "")) : (roLabel(ro) + " has no spot now."), true);
}
/* drag a truck onto a spot (mouse); click-to-pick then click-a-spot works everywhere, touch included */
document.addEventListener("dragstart", function(e){
  var c = e.target && e.target.closest ? e.target.closest(".yd-ro,.ty-t") : null; if(!c) return;
  try{ e.dataTransfer.setData("text/plain", "ro:" + c.dataset.ro); e.dataTransfer.effectAllowed = "move"; }catch(x){}
  c.classList.add("dragging");
});
document.addEventListener("dragend", function(){
  document.querySelectorAll(".yd-ro.dragging,.ty-t.dragging,.drop-over").forEach(function(x){ x.classList.remove("dragging"); x.classList.remove("drop-over"); });
});
document.addEventListener("dragover", function(e){
  var z = e.target && e.target.closest ? e.target.closest(".yd-spot,.yd-tray,.ty-slot") : null; if(!z) return;
  e.preventDefault(); try{ e.dataTransfer.dropEffect = "move"; }catch(x){}
  document.querySelectorAll(".drop-over").forEach(function(x){ if(x !== z) x.classList.remove("drop-over"); });
  z.classList.add("drop-over");
});
document.addEventListener("drop", function(e){
  var z = e.target && e.target.closest ? e.target.closest(".yd-spot,.yd-tray,.ty-slot") : null; if(!z) return;
  var d = ""; try{ d = e.dataTransfer.getData("text/plain"); }catch(x){}
  if(!/^ro:/.test(d)) return;
  e.preventDefault(); UI.yardPick = null;
  yardMove(d.slice(3), z.getAttribute("data-spot") || "");
  render();
});
document.addEventListener("keydown", function(e){
  if(e.key !== "Escape") return;
  if(UI.trMenu){ UI.trMenu = false; render(); return; }
  if(UI.yardPick){ UI.yardPick = null; render(); return; }
  if(UI.yardZoom && !(e.target && /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName))){ UI.yardZoom = false; persistUI(); render(); }
});

/* ---- settings ----
   What used to be the header's options menu. It lives in the bottom-right corner of
   the page navigation pane now, and the theme toggle folded into it instead of
   sitting in the header as its own button. */
function settingsHtml(){   /* Parsec 16.2: the settings that were here are in Settings */
  return '<div class="pnav-set'+(UI.appMenu?' open':'')+'" data-key="app-menu">'
    + '<button class="pnav-set-btn" data-action="toggle-app-menu" aria-haspopup="menu" aria-expanded="'+(UI.appMenu?'true':'false')+'" title="Settings" aria-label="Settings">' + sfIcon(SF.gear, 19)
    +   (function(){ var L = storageLabel(); return '<span class="sync-dot gear-dot '+L.dot+'" id="gear-sync" title="'+esc(L.head)+'"></span>'; })() + '</button>'
    + '<div class="pnav-set-pop" role="menu" aria-label="Settings">'
    +   '<button class="app-menu-item" role="menuitem" data-action="px-profile" data-s="me"><span class="ami-ico">' + pxI("settings", 17) + '</span>All settings…<span class="ami-end">size, theme, data</span></button>'
    +   (navAllowed("ros") ? '<button class="app-menu-item ami-new" role="menuitem" data-action="open-add-ro"><span class="ami-ico">' + sfIcon(SF.plus, 17) + '</span>New repair order<span class="ami-end">N</span></button>' : '')
    +   sgLinkHtml("me", "me.size", "Size, theme, the day ribbon, view as, automations and shortcuts")
    + '</div></div>';
}
