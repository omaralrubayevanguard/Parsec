/* Parsec · pages/rolist · page-base.js
   The RO list page's older base (RL_GROUPS, rlList) and the permission labels and role tables it shares with Admin (permRoles, permState…).
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   rlMe rlList rlOptHtml permActKeys permActLabel permPageLabel permRoles permRoleDefault permState permRole permMigrate RL_GROUPS … (11 functions, 7 constants)
   state      perm shop staff techName
   uses       access/ clock/ kit/ pages/ pages/triage/ ro/ state/
*/
/* ============================== RO LIST — its own page, one row per RO ==============================
   The list that used to be the rail on the Repair Orders page. Click a row to open the RO. */
var RL_GROUPS = [["all", "Open"], ["mine", "Mine"], ["working", "Working"], ["waiting", "Waiting"], ["hold", "Hold"], ["done", "Done"]];
function rlMe(){ var sf = viewAsStaff(); if(sf && sf.role === "Technician") return sf.name; return (typeof tyMe === "function" ? tyMe() : STATE.techName) || ""; }
function rlList(){ if(UI.view === "ros" && UI.roFrom && Array.isArray(UI.rlOrder)){ var L0 = UI.rlOrder.map(function(id){ return getRO(id); }).filter(function(r){ return r && !r.shop; }); if(L0.length) return L0; }   /* Parsec 14.3 */
  var g = UI.rlGroup || "all", me = rlMe();
  return sortedROs().filter(function(ro){
    if(ro.id === SHOP_RO_ID || ro.shop) return false;
    if(!roMatchesFilter(ro, UI.roFilter)) return false;
    var gg = roGroupOf(ro);
    if(g === "done") return gg === "done";
    if(gg === "done") return false;
    if(g === "mine") return !!me && techSame(ro.assignedTech, me);
    return g === "all" || gg === g;
  });
}
/* the RO options menu on every row — the same one as in the RO details on the Repair Orders page */
var RL_OPT_IC = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M5 7h14M5 12h14M5 17h14"/></svg>';
function rlOptHtml(ro){
  var on = UI.rlMenu === ro.id;
  var items = [["export", "Save a copy"], ["print", "Print"], "-", ["addop", "Add operation"], ["extract", "Extract operations…"], ["stdop", "Add standard operation…"], ["warr", ro.warranty ? "Not a warranty RO" : "Mark as warranty RO"]].concat(typeof can !== "function" || can("ro.del") ? ["-", ["delete", "Delete RO"]] : []);
  return '<button class="rl-opt' + (on ? ' on' : '') + '" data-action="rl-menu" data-ro="' + ro.id + '" title="Options" aria-label="Options for ' + esc(roLabel(ro)) + '" aria-haspopup="menu" aria-expanded="' + on + '">' + RL_OPT_IC + '</button>'
    + (on ? '<div class="rl-menu" role="menu">' + items.map(function(x){ return x === "-" ? '<i class="rl-msep"></i>' : '<button role="menuitem" class="' + (x[0] === "delete" ? 'danger' : '') + '" data-action="rl-opt" data-k="' + x[0] + '" data-ro="' + ro.id + '">' + esc(x[1]) + '</button>'; }).join('') + '</div>' : '');
}

/* ---- staff and page access ---- */
var STAFF_ROLES = {
  "Technician": ["tech","ros","fixes","parts"],
  "Foreman": ["ros","fixes","foreman","triage","parts","inventory"],
  "Manager": ["ros","warranty","fixes","foreman","manager","triage","parts","inventory"],
  "Service writer": ["ros","warranty","fixes","triage","parts"],
  "Warranty admin": ["ros","warranty","fixes","parts"],
  "Triage": ["ros","triage"],
  "Parts": ["ros","parts","inventory"]
};
/* Parsec 13 — people and permissions (the login page and Admin page picks).
   Roles with changes per person; pages and actions; a 4-digit PIN for everyone, kept scrambled (salted SHA-256), never as typed.
   The data:  STATE.perm = { v, roles: { <role>: { pages: {k: bool}, acts: {k: bool} } }, rules: { eod, idle } }
              staff:  sf.ov = { pages: {k: bool}, acts: {k: bool} }   — only what differs from the role
                      sf.pinH / sf.pinS (hash, salt) · sf.pinTemp (a temporary PIN: they pick their own at the next sign-in) · sf.pinAt
                      sf.off / sf.offAt (sign-in turned off — history stays)
              admin:  STATE.shop.adminPinH / adminPinS
   On this computer: tec_recent (who signed in here, newest first) · tec_pinfail (wrong tries) · tec_locked (stepped away). */
var PERM_PAGES = [["ros", "Repair Orders"], ["assets", "Assets"], ["fleets", "Fleets"], ["library", "Library"], ["tech", "Technician"], ["triage", "Triage"], ["foreman", "Foreman"], ["parts", "Parts"], ["inventory", "Inventory"], ["warranty", "Warranty"], ["manager", "Manager"], ["fixes", "Fixes"]];   /* 17.1: Time Log and Career left this list — everyone has their own, on their department page */
var PERM_ACTS = [
  ["Repair orders", [["ro.new", "Open new ROs"], ["ro.status", "Change an RO’s status"], ["ro.release", "Release a truck"], ["ro.reopen", "Reopen a completed RO"], ["ro.del", "Delete ROs"]]],
  ["Time", [["t.own", "Start and stop their own clock"], ["t.editown", "Fix their own punches"], ["t.editall", "Fix anyone’s punches"], ["t.move", "Move time to someone else"], ["t.approve", "Approve timesheets"], ["t.others", "See other people’s time"]]],
  ["Parts and money", [["p.order", "Order parts"], ["p.stock", "Adjust stock counts"], ["p.cost", "See costs and prices"], ["w.claim", "File warranty claims"]]],
  ["Admin", [["a.people", "Manage people and PINs"], ["a.settings", "Change settings and automations"], ["a.data", "Export or reset the data"]]],
  /* 17.3: which Settings menus they see — Me and Shortcuts are everyone's */
  ["Settings menus", [["s.shop", "See The shop settings"], ["s.people", "See People & access"], ["s.data", "See Data settings"], ["s.auto", "See Automations"]]]
];
/* what each action stops, said plainly — "You can’t delete ROs" */
var PERM_VERB = { "ro.new": "open new ROs", "ro.status": "change an RO’s status", "ro.release": "release a truck", "ro.reopen": "reopen a completed RO", "ro.del": "delete ROs",
  "t.own": "start the clock", "t.editown": "fix your punches", "t.editall": "fix someone else’s punches", "t.move": "move time to someone else", "t.approve": "approve timesheets", "t.others": "see other people’s time",
  "p.order": "order parts", "p.stock": "adjust stock counts", "p.cost": "see costs and prices", "w.claim": "file warranty claims",
  "a.people": "manage people and PINs", "a.settings": "change settings and automations", "a.data": "export or reset the data",
  "s.shop": "see The shop settings", "s.people": "see People & access", "s.data": "see the Data settings", "s.auto": "see Automations" };
var PERM_ROLE_ACTS = {
  "Technician": "t.own t.editown",
  "Foreman": "ro.new ro.status ro.release ro.reopen t.own t.editown t.editall t.move t.approve t.others p.order s.shop s.auto",
  "Manager": "ro.new ro.status ro.release ro.reopen ro.del t.own t.editown t.editall t.move t.approve t.others p.order p.stock p.cost w.claim a.people a.settings s.shop s.people s.data s.auto",
  "Service writer": "ro.new ro.status ro.release ro.reopen t.own p.order p.cost w.claim s.shop",
  "Warranty admin": "ro.status t.own p.cost w.claim s.shop",
  "Triage": "ro.new ro.status ro.release t.own",
  "Parts": "t.own p.order p.stock p.cost s.shop"
};
function permActKeys(){ var L = []; PERM_ACTS.forEach(function(g){ g[1].forEach(function(a){ L.push(a[0]); }); }); return L; }
function permActLabel(k){ var r = k; PERM_ACTS.forEach(function(g){ g[1].forEach(function(a){ if(a[0] === k) r = a[1]; }); }); return r; }
function permPageLabel(k){ var r = k; PERM_PAGES.forEach(function(p){ if(p[0] === k) r = p[1]; }); return r; }
function permRoles(){ return Object.keys(STAFF_ROLES); }
function permRoleDefault(role){
  var pg = {}, ac = {}, L = (STAFF_ROLES[role] || []).concat(["assets", "library", "fleets"]),   /* Parsec 14: every role opens the Assets page · 17.1: and the Library and Fleets */ A = (PERM_ROLE_ACTS[role] || "").split(" ");
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
      if(sf.pages) PERM_PAGES.forEach(function(p){ var k = p[0], had = !!sf.pages[k]; if((k === "assets" || k === "library" || k === "fleets") && !(k in sf.pages)) return; if(k === "tech") had = sf.role === "Technician" ? (sf.pages.tech !== false) : !!sf.pages.tech; if(had !== !!t.pages[k]) ov.pages[k] = had; });
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
