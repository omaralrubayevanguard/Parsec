/* Parsec 13 — people and permissions (the login page and Admin page picks).
   Roles with changes per person; pages and actions; a 4-digit PIN for everyone, kept scrambled (salted SHA-256), never as typed.
   The data:  STATE.perm = { v, roles: { <role>: { pages: {k: bool}, acts: {k: bool} } }, rules: { eod, idle } }
              staff:  sf.ov = { pages: {k: bool}, acts: {k: bool} }   — only what differs from the role
                      sf.pinH / sf.pinS (hash, salt) · sf.pinTemp (a temporary PIN: they pick their own at the next sign-in) · sf.pinAt
                      sf.off / sf.offAt (sign-in turned off — history stays)
              admin:  STATE.shop.adminPinH / adminPinS
   On this computer: tec_recent (who signed in here, newest first) · tec_pinfail (wrong tries) · tec_locked (stepped away). */
var PERM_PAGES = [["ros", "Repair Orders"], ["tech", "Technician"], ["triage", "Triage"], ["foreman", "Foreman"], ["parts", "Parts"], ["inventory", "Inventory"], ["warranty", "Warranty"], ["manager", "Manager"], ["fixes", "Fixes"], ["timelog", "Time Log"], ["career", "Career"]];
var PERM_ACTS = [
  ["Repair orders", [["ro.new", "Open new ROs"], ["ro.status", "Change an RO’s status"], ["ro.release", "Release a truck"], ["ro.reopen", "Reopen a completed RO"], ["ro.del", "Delete ROs"]]],
  ["Time", [["t.own", "Start and stop their own clock"], ["t.editown", "Fix their own punches"], ["t.editall", "Fix anyone’s punches"], ["t.move", "Move time to someone else"], ["t.approve", "Approve timesheets"]]],
  ["Parts and money", [["p.order", "Order parts"], ["p.stock", "Adjust stock counts"], ["p.cost", "See costs and prices"], ["w.claim", "File warranty claims"]]],
  ["Admin", [["a.people", "Manage people and PINs"], ["a.settings", "Change settings and automations"], ["a.data", "Export or reset the data"]]]
];
/* what each action stops, said plainly — "You can’t delete ROs" */
var PERM_VERB = { "ro.new": "open new ROs", "ro.status": "change an RO’s status", "ro.release": "release a truck", "ro.reopen": "reopen a completed RO", "ro.del": "delete ROs",
  "t.own": "start the clock", "t.editown": "fix your punches", "t.editall": "fix someone else’s punches", "t.move": "move time to someone else", "t.approve": "approve timesheets",
  "p.order": "order parts", "p.stock": "adjust stock counts", "p.cost": "see costs and prices", "w.claim": "file warranty claims",
  "a.people": "manage people and PINs", "a.settings": "change settings and automations", "a.data": "export or reset the data" };
var PERM_ROLE_ACTS = {
  "Technician": "t.own t.editown",
  "Foreman": "ro.new ro.status ro.release ro.reopen t.own t.editown t.editall t.move t.approve p.order",
  "Manager": "ro.new ro.status ro.release ro.reopen ro.del t.own t.editown t.editall t.move t.approve p.order p.stock p.cost w.claim a.people a.settings",
  "Service writer": "ro.new ro.status ro.release ro.reopen t.own p.order p.cost w.claim",
  "Warranty admin": "ro.status t.own p.cost w.claim",
  "Triage": "ro.new ro.status ro.release t.own",
  "Parts": "t.own p.order p.stock p.cost"
};
function permActKeys(){ var L = []; PERM_ACTS.forEach(function(g){ g[1].forEach(function(a){ L.push(a[0]); }); }); return L; }
function permActLabel(k){ var r = k; PERM_ACTS.forEach(function(g){ g[1].forEach(function(a){ if(a[0] === k) r = a[1]; }); }); return r; }
function permPageLabel(k){ var r = k; PERM_PAGES.forEach(function(p){ if(p[0] === k) r = p[1]; }); return r; }
function permRoles(){ return Object.keys(STAFF_ROLES); }
function permRoleDefault(role){
  var pg = {}, ac = {}, L = STAFF_ROLES[role] || [], A = (PERM_ROLE_ACTS[role] || "").split(" ");
  PERM_PAGES.forEach(function(p){ pg[p[0]] = L.indexOf(p[0]) >= 0; });
  permActKeys().forEach(function(k){ ac[k] = A.indexOf(k) >= 0; });
  return { pages: pg, acts: ac };
}
/* once: the role templates, the per-person changes from what each person had, the PINs scrambled */
function permState(){
  if(!STATE) return { roles: {}, rules: {} };
  var P = STATE.perm;
  if(!P || typeof P !== "object"){ P = STATE.perm = { v: 1, roles: {}, rules: { eod: true, idle: 0 } }; }
  if(!P.roles || typeof P.roles !== "object") P.roles = {};
  if(!P.rules || typeof P.rules !== "object") P.rules = { eod: true, idle: 0 };
  permRoles().forEach(function(r){
    var d = permRoleDefault(r), t = P.roles[r];
    if(!t){ P.roles[r] = d; return; }
    t.pages = t.pages || {}; t.acts = t.acts || {};
    PERM_PAGES.forEach(function(p){ if(typeof t.pages[p[0]] !== "boolean") t.pages[p[0]] = d.pages[p[0]]; });
    permActKeys().forEach(function(k){ if(typeof t.acts[k] !== "boolean") t.acts[k] = d.acts[k]; });
  });
  return P;
}
function permRole(role){ var P = permState(); return P.roles[role] || permRoleDefault(role); }
function permMigrate(){
  if(!STATE || !Array.isArray(STATE.staff)) return;
  var P = permState();
  STATE.staff.forEach(function(sf){
    if(!sf) return;
    if(!sf.ov || typeof sf.ov !== "object"){
      var t = permRole(sf.role), ov = { pages: {}, acts: {} };
      if(sf.pages) PERM_PAGES.forEach(function(p){ var k = p[0], had = !!sf.pages[k]; if(k === "tech") had = sf.role === "Technician" ? (sf.pages.tech !== false) : !!sf.pages.tech; if(had !== !!t.pages[k]) ov.pages[k] = had; });
      sf.ov = ov;
    }
    sf.ov.pages = sf.ov.pages || {}; sf.ov.acts = sf.ov.acts || {};
    if(sf.pin != null && sf.pin !== "" && !sf.pinH){ pinSet(sf, String(sf.pin), false); }
    if("pin" in sf) delete sf.pin;
    sf.p11 = 1; sf.p125 = 1;
  });
  var sh = STATE.shop = STATE.shop || {};
  if(sh.adminPin && !sh.adminPinH){ adminPinSet(String(sh.adminPin)); }
  if("adminPin" in sh && !sh.adminPin) delete sh.adminPin;
  if(sh.adminPin) delete sh.adminPin;
  P.v = Math.max(P.v || 1, 1);
}
/* ---------- who can do what ---------- */
function permHas(sf, kind, k){
  if(!sf) return true;                                                   /* the Admin: everything */
  var o = sf.ov && sf.ov[kind] && Object.prototype.hasOwnProperty.call(sf.ov[kind], k) ? sf.ov[kind][k] : null;
  if(o !== null && o !== undefined) return !!o;
  var t = permRole(sf.role); return !!(t[kind] && t[kind][k]);
}
function permChanged(sf, kind, k){ return !!(sf && sf.ov && sf.ov[kind] && Object.prototype.hasOwnProperty.call(sf.ov[kind], k)); }
function permChangedN(sf){ return sf && sf.ov ? Object.keys(sf.ov.pages || {}).length + Object.keys(sf.ov.acts || {}).length : 0; }
function can(act){ var me = viewAsStaff(); if(!me) return true; if(me.off) return false; return permHas(me, "acts", act); }
function canPage(page){ var me = viewAsStaff(); if(!me) return true; if(page === "admin") return can("a.people"); return permHas(me, "pages", page); }
/* set one thing for one person — the same as the role clears the change */
function permSet(sf, kind, k, v){
  if(!sf) return;
  sf.ov = sf.ov || { pages: {}, acts: {} }; sf.ov[kind] = sf.ov[kind] || {};
  var t = permRole(sf.role); if(!!v === !!(t[kind] && t[kind][k])) delete sf.ov[kind][k]; else sf.ov[kind][k] = !!v;
  permSyncPages(sf);
  try{ audit("perm", sf.name + ": " + (kind === "pages" ? permPageLabel(k) + " page" : permActLabel(k)) + (v ? " — on" : " — off")); }catch(e){}
}
function permBack(sf){ if(!sf) return; sf.ov = { pages: {}, acts: {} }; permSyncPages(sf); try{ audit("perm", sf.name + " — back to the " + sf.role + " role"); }catch(e){} }
function permRoleSet(role, kind, k, v){
  var t = permRole(role); t[kind] = t[kind] || {}; t[kind][k] = !!v;
  /* a person whose change now matches the role has no change any more */
  (STATE.staff || []).forEach(function(sf){ if(sf.role === role && sf.ov && sf.ov[kind] && sf.ov[kind][k] === !!v) delete sf.ov[kind][k]; permSyncPages(sf); });
  try{ audit("perm", role + " role: " + (kind === "pages" ? permPageLabel(k) + " page" : permActLabel(k)) + (v ? " — on" : " — off")); }catch(e){}
}
function permSetRole(sf, role){ if(!sf || !role || sf.role === role) return; var was = sf.role; sf.role = role; permSyncPages(sf); try{ audit("staff", sf.name + " is now " + role + " (was " + was + ")"); }catch(e){} }
/* sf.pages stays the person's pages as they are now, for whatever still reads it */
function permSyncPages(sf){ if(!sf) return; sf.pages = sf.pages || {}; PERM_PAGES.forEach(function(p){ sf.pages[p[0]] = permHas(sf, "pages", p[0]); }); }
function permSyncAll(){ (STATE.staff || []).forEach(permSyncPages); }
/* who to ask */
function permAdmins(){ return staffList().filter(function(sf){ return !sf.off && permHas(sf, "acts", "a.people"); }); }
function permAsk(){ var L = permAdmins().map(function(sf){ return String(sf.name || "").split(" ")[0]; }).filter(Boolean); return L.length ? (L.length > 2 ? L.slice(0, 2).join(", ") + " or the Admin" : L.join(" or ") + " or the Admin") : "the Admin"; }
function permDenyMsg(act){ return "You can’t " + (PERM_VERB[act] || permActLabel(act).toLowerCase()) + " — " + permAsk() + " can change that on the Admin page."; }
function permDeny(act){ try{ pushToast(permDenyMsg(act)); }catch(e){} return false; }
/* the guard: true when allowed; otherwise says why and returns false */
function permOk(act){ return can(act) ? true : permDeny(act); }

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
