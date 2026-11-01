/* ---------- keys: one sheet, the same keys everywhere, then the page's own ---------- */
function pxKeyGroups(view){
  var ev = [["Ctrl K", "Search, or jump to an RO"], ["[", "Open or close the sidebar"], ["Space", "Start or stop the clock"], ["?", "Keyboard shortcuts"], ["Esc", "Close a menu, popover or dialog"], ["Ctrl Z", "Undo"]];
  if(navAllowed("ros")) ev.splice(1, 0, ["N", "New repair order"]);
  var drop = /^(\?|Ctrl\+Z|Esc)$/;
  var page = null, name = "";
  if(view === "triage"){ page = TG_KEYS; name = "Triage"; }
  else if(view === "foreman"){ page = FM_KEYS; name = "Foreman"; }
  else if(view === "warranty"){ page = WA_KEYS; name = "Warranty"; }
  else if(view === "ros" || view === "rolist"){ name = "Repair order"; page = [["← →  or  J K", "Previous / next operation"], ["↑ ↓", "Previous / next repair order"], ["P", "Quick-add a part to the operation"],
    ["1  2  3", "Parts · Time punches · Files panel (again to close)"], ["0", "Close the panel"], ["D", "RO details"], ["S", "Set the RO status"], ["/", "Jump to the RO filter"]]; }
  var g = [["Everywhere", ev]];
  if(page) g.push([name, page.filter(function(r){ return !drop.test(String(r[0]).trim()); })]);
  return g;
}
function pxKeySheet(view){
  return '<div class="keysheet px-ks">' + pxKeyGroups(view).map(function(g){
    return '<div class="px-ksh">' + esc(g[0]) + '</div>' + g[1].map(function(r){ return '<div class="keyrow"><span class="keycap">' + esc(r[0]) + '</span><span class="keywhat">' + esc(r[1]) + '</span></div>'; }).join('');
  }).join('') + '</div><p class="hint" style="margin:11px 0 0">Shortcuts are off while you are typing in a field.</p>';
}

/* ---------- the profile page ---------- */
var PX_SECS = [["you", "user", "You", "photo, name, role"], ["sign", "exit", "Sign in & out", "log out, switch user"], ["look", "sun", "Appearance", "theme, size, screen"],
  ["data", "save", "Your data", "folder, backups, phone"], ["tools", "bolt", "Work tools", "automations, assistant"], ["keys", "keyTag", "Shortcuts", "every key"], ["admin", "lock", "Admin", "view as, shop, test data"]];
function pxIsAdmin(){ var me = viewAsStaff(); return !me || me.role === "Manager"; }
function pxProfileView(){
  var me = viewAsStaff(), L = PX_SECS.filter(function(s){ return s[0] !== "admin" || pxIsAdmin(); }), sec = UI.pxSec || "you", warn = pxBkWarn(), sin = pxLS("tec_signin_at");
  if(!L.some(function(s){ return s[0] === sec; })) sec = "you";
  if(sec === "data" && !UI.pxBk) setTimeout(pxBkLoad, 0);
  var back = UI.pxPrev && UI.pxPrev !== "profile" && navAllowed(UI.pxPrev) ? UI.pxPrev : navPages()[0][0], bn = (NAV_PAGES.filter(function(p){ return p[0] === back; })[0] || ["", "the last page"])[1];
  var head = '<header class="px-head"><h1 class="px-h1">Profile</h1><span class="px-facts"><span class="px-hf">' + pxAv("px-av") + esc(pxMeName()) + '<span class="px-role">' + esc(pxMeRole()) + '</span></span>'
    + (me && sin ? '<i>·</i><span class="px-hf">signed in <b>' + esc(pxAgo(sin)) + '</b></span>' : '')
    + (warn ? '<i>·</i><button class="px-hf w" data-action="px-sec" data-s="data"><b>' + esc(warn) + '</b></button>' : '') + '</span>'
    + '<span class="sp"></span><button class="px-btn sm" data-action="nav" data-view="' + back + '">' + pxI(IV_NAV_IC[back] || "console", 14) + 'Back to ' + esc(bn) + '</button></header>';
  var list = '<section class="px-list"><div class="px-lh">Profile &amp; settings</div><div class="px-scroll">' + L.map(function(s){
      return '<div class="px-it' + (sec === s[0] ? ' on' : '') + '" data-action="px-sec" data-s="' + s[0] + '" role="button" tabindex="0"><span class="px-gi">' + pxI(s[1], 15) + '</span><span class="px-t"><b>' + esc(s[2]) + '</b></span><span class="px-w">' + esc(s[3]) + '</span>' + (s[0] === "data" && warn ? '<i class="pxr-warn in"></i>' : '') + '</div>'; }).join('')
    + '</div><div class="px-keys"><span>' + pxKbd("[") + 'sidebar</span><span>' + pxKbd("?") + 'shortcuts</span><span>' + pxKbd("Esc") + 'back</span></div></section>';
  var body = ({ you: pxSecYou, sign: pxSecSign, look: pxSecLook, data: pxSecData, tools: pxSecTools, keys: pxSecKeys, admin: pxSecAdmin })[sec]();
  var title = (L.filter(function(s){ return s[0] === sec; })[0] || [])[2];
  return '<div class="px pxp" data-key="px-profile">' + head + '<div class="px-body">' + list + '<div class="px-main" data-scroll="px-prof"><div class="px-doc"><h2>' + esc(title) + '</h2>' + body + '</div></div></div></div>';
}
function pxCard(h, cls){ return '<div class="px-card' + (cls ? ' ' + cls : '') + '">' + h + '</div>'; }
function pxCh(t, sub, right){ return '<div class="px-ch"><b>' + esc(t) + '</b>' + (sub ? '<small>' + esc(sub) + '</small>' : '') + (right ? '<span class="sp"></span>' + right : '') + '</div>'; }
function pxKv(k, v){ return '<div class="px-kv"><span>' + k + '</span><b>' + v + '</b></div>'; }
function pxNote(t, ic){ return '<div class="px-note">' + pxI(ic || "info", 13) + '<span>' + t + '</span></div>'; }
function pxSecYou(){
  var me = viewAsStaff();
  if(me) return pxCard('<div class="px-you">' + pxAv("px-av xl") + '<div class="n"><h3>' + esc(me.name || "Unnamed") + '</h3><small>' + esc(me.role) + (DEPT_OF[me.role] ? ' · ' + esc(DEPT_OF[me.role]) : '') + '</small>'
      + '<div class="r"><label class="px-btn sm">' + pxI("camera", 13) + 'Upload a photo<input type="file" accept="image/*" data-photo="' + me.id + '" hidden></label>'
      + (me.photo ? '<button class="px-btn sm" data-action="staff-photo-clear" data-id="' + me.id + '">Use the portrait</button>' : '') + '</div></div></div>')
    + pxCard(pxCh("Details", "a manager changes these under Manager → Staff")
      + pxKv("Name", esc(me.name || "Unnamed")) + pxKv("Role", esc(me.role)) + pxKv("Department", esc(DEPT_OF[me.role] || "—"))
      + pxKv("Pages", esc(navPages().map(function(p){ return p[1]; }).join(" · "))) + pxKv("PIN", me.pin ? "set" : "none"));
  return pxCard('<div class="px-you">' + pxAv("px-av xl") + '<div class="n"><h3>' + esc(String(STATE.techName || "").trim() || "Admin") + '</h3><small>Admin · every page, every RO</small></div></div>')
    + pxCard(pxCh("Your name", "on your punches and notes when no one is signed in")
      + '<div class="px-row"><input type="text" data-bind="profile-name" value="' + esc(STATE.techName || "") + '" placeholder="Your name" autocomplete="off"></div>');
}
function pxSecSign(){
  var me = viewAsStaff(), l = staffList(), rp = runningPunch(), sin = pxLS("tec_signin_at");
  if(!l.length) return pxCard(pxCh("No one to sign in as yet")
      + '<p class="px-p">Add people under Manager → Staff. Then each person signs in with their own pages — and a PIN, if you set one.</p>'
      + '<div class="px-row"><button class="px-btn sm" data-action="demo-team">Create a demo team</button></div>');
  var h = pxCard(pxCh("Signed in", "on this computer")
    + '<div class="px-sig">' + pxAv("px-av lg") + '<span class="n"><b>' + esc(pxMeName()) + '</b><small>' + esc(pxMeRole()) + (me && sin ? ' · since ' + esc(pxAgo(sin)) : '') + '</small></span>'
    + '<button class="px-btn sm" data-action="px-switch">' + pxI("swap", 13) + 'Switch user</button><button class="px-btn sm pri" data-action="px-logout">' + pxI("exit", 13) + 'Log out</button></div>'
    + (rp || openShift() ? pxNote('Logging out doesn’t stop the clock — ' + (rp ? esc(roTag(getRO(rp.roId))) + ' keeps running.' : 'the day clock keeps running.')) : ''));
  h += pxCard(pxCh("When to sign out")
    + pxSwRow("px-tog", pxBkOn("tec_logout_eod", true), "Log out when I clock out for the day", "Home or End of day — the next person starts clean", ' data-k="tec_logout_eod" data-def="1"'));
  h += pxNote('Signing in picks whose pages you see — it isn’t a password. ' + (me ? (me.pin ? 'Your PIN is set.' : 'You don’t have a PIN.') + ' A manager sets PINs under Manager → Staff.' : 'Set PINs under Manager → Staff.'), "lock");
  return h;
}
function pxSecLook(){
  var tile = function(m){ var t = THEMES[m], on = THEME === m;
    return '<button class="px-tp' + (on ? ' on' : '') + '" data-action="set-theme" data-theme="' + m + '" aria-pressed="' + on + '"><span class="pv" style="background:' + t.bg + '"><i style="background:' + t.card + '"></i><i class="l" style="background:' + (t.dark ? '#EDEBE6' : '#1D1C1A') + '"></i><i class="a" style="background:' + t.acc + '"></i></span>'
      + '<span class="nm">' + pxI(t.dark ? "moon" : "sun", 13) + esc(themeLabel(m)) + (on ? '<span class="ck">' + pxI("check", 13) + '</span>' : '') + '</span></button>'; };
  return pxCard(pxCh("Theme", "on this computer") + '<div class="px-themes">' + THEME_ORDER.map(tile).join('') + '</div>')
    + pxCard(pxCh("Size", "bigger buttons and text for gloves or a tablet") + '<div class="px-row">' + pxSeg([["normal", "Normal"], ["large", "Large"], ["floor", "Shop floor"]], sizeMode(), "set-size", "data-size") + '</div>'
      + pxCh("Screen", "how Parsec lays out — Auto picks from this device") + '<div class="px-row">' + pxSeg([["auto", "Auto"], ["desktop", "Desktop"], ["tablet", "Tablet"], ["phone", "Phone"]], DEVICE_SETTING, "set-device", "data-mode") + '</div>'
      + pxSwRow("toggle-ribbon", dayRibbonOn(), "Day ribbon", "a thin bar of your day across the top of every page"));
}
function pxSecData(){
  var L = storageLabel(), b = pxBkInfo(), warn = pxBkWarn(), h = '', d = pxBkDays();
  var wh;
  if(FS.status === "connected") wh = '<div class="px-sig"><span class="px-gi ok">' + pxI("check", 15) + '</span><span class="n"><b>' + esc(FS.dirName || "Your folder") + ' › Parsec Data</b><small>' + esc(L.head) + ' · each RO in its own folder, shop data in Shop/Shop.html</small></span>'
    + '<button class="px-btn sm" data-action="save-now">' + pxI("save", 13) + 'Save now</button><button class="px-btn sm" data-action="storage">Change folder</button></div>';
  else if(FS.status === "needs-permission") wh = '<div class="px-sig"><span class="px-gi wt">' + pxI("flag", 15) + '</span><span class="n"><b>The folder needs reconnecting</b><small>Chrome asks once each time Parsec opens. Your work is safe in this browser meanwhile.</small></span><button class="px-btn sm pri" data-action="storage">Reconnect</button></div>';
  else if(FS.status === "unsupported") wh = '<div class="px-sig"><span class="px-gi wt">' + pxI("flag", 15) + '</span><span class="n"><b>Saving in this browser only</b><small>Saving to a folder needs Chrome or Edge on a computer.</small></span></div>';
  else wh = '<div class="px-sig"><span class="px-gi wt">' + pxI("flag", 15) + '</span><span class="n"><b>No folder connected</b><small>Your data lives only in this browser. Pick a folder and Parsec keeps everything there — offline, no cloud.</small></span><button class="px-btn sm pri" data-action="storage">Connect a folder</button></div>';
  h += pxCard(pxCh("Where Parsec saves") + wh);
  var bk;
  if(b.where === "folder"){
    var F = UI.pxBk && UI.pxBk.files || [];
    bk = '<div class="px-sig"><span class="px-gi ' + (warn ? 'wt' : 'ok') + '">' + pxI(warn ? "flag" : "check", 15) + '</span><span class="n"><b>' + (b.at ? 'Last backup ' + esc(pxAgo(b.at)) : b.day ? 'Last backup ' + esc(b.day) : 'No backup yet') + '</b><small>a dated copy in Parsec Data/Backups — the first save each day, and again when you clock out for the day</small></span>'
      + '<button class="px-btn sm' + (warn ? ' pri' : '') + '" data-action="px-bk-now">' + pxI("save", 13) + 'Back up now</button></div>'
      + (F.length ? '<div class="px-bl">' + F.slice(0, 7).map(function(f){ var m = /data-(\d{4}-\d{2}-\d{2})/.exec(f.name), dt = m ? new Date(m[1] + "T12:00:00") : null;
          return '<div class="px-br"><span><b>' + esc(dt ? dt.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" }) : f.name) + '</b>' + (f.mod ? ' · ' + fmtTime(new Date(f.mod).toISOString()) : '') + '</span><span class="m">' + pxSize(f.size) + '</span><button class="px-btn sm" data-action="restore-backup" data-file="' + esc(f.name) + '">Restore…</button></div>'; }).join('')
        + (F.length > 7 ? '<div class="px-br more"><span>' + (F.length - 7) + ' older</span><button class="px-btn sm ghost" data-action="open-restore">All backups…</button></div>' : '') + '</div>'
        : '<p class="px-p">' + (UI.pxBk && UI.pxBk.loading ? 'Reading the Backups folder…' : 'No backup files in the folder yet.') + '</p>')
      + pxSwRow("px-tog", pxBkOn("tec_bk_eod", true), "Back up when I clock out for the day", "Home or End of day — today’s copy is saved again", ' data-k="tec_bk_eod" data-def="1"')
      + pxSwRow("px-tog", pxBkOn("tec_bk_keep", false), "Keep only the last 14", "older dated copies are deleted from the Backups folder", ' data-k="tec_bk_keep" data-def="0"');
  } else {
    bk = '<div class="px-sig"><span class="px-gi ' + (warn ? 'wt' : 'ok') + '">' + pxI(warn ? "flag" : "check", 15) + '</span><span class="n"><b>' + (b.at ? 'Last backup file ' + esc(pxAgo(b.at)) : 'No backup file saved yet') + '</b><small>your data is only in this browser — keep a copy somewhere else</small></span>'
      + '<button class="px-btn sm' + (warn ? ' pri' : '') + '" data-action="export-json">' + pxI("save", 13) + 'Save a backup file</button><button class="px-btn sm" data-action="px-restore-file">Restore from a file…</button></div>'
      + pxSwRow("px-tog", pxBkOn("tec_bk_eod", true), "Save a backup file when I clock out for the day", "Home or End of day — it goes to your Downloads folder", ' data-k="tec_bk_eod" data-def="1"');
  }
  h += pxCard(pxCh("Backups", "a copy you can go back to") + bk, warn ? "warn" : "");
  h += pxCard(pxCh("Parsec Mobile", "QR codes between this computer and the phone — no network")
    + '<div class="px-row"><button class="px-btn sm pri" data-action="phone-sync" data-mode="send">Send to phone</button><button class="px-btn sm" data-action="phone-sync" data-mode="get">Get from phone</button></div>');
  return h + '<div class="px-build mono">' + esc(BUILD) + '</div>';
}
function pxSecTools(){
  var c = autoCfg(), n = ["status", "stamps", "parts"].filter(function(k){ return c.builtin[k]; }).length + c.rules.filter(function(r){ return r.on; }).length;
  return pxCard(pxCh("Automations", n + " on", '<button class="px-btn sm" data-action="open-automations">Open</button>')
      + pxKv(pxI("check", 12), 'Status follows the clock<small>starting a job sets it to Working</small>') + pxKv(pxI("check", 12), 'Stamp the time in your notes<small>Enter adds the time</small>') + pxKv(pxI("check", 12), 'Part statuses move the job<small>all parts in sets it back to Hold Tech</small>'))
    + pxCard(pxCh("Assistant", "ask about an RO, a part or a past fix", '<button class="px-btn sm" data-action="assist-toggle">' + pxI("chat", 13) + 'Open</button>'));
}
function pxSecKeys(){
  return pxKeyGroups(UI.pxPrev || "console").map(function(g){
    return pxCard(pxCh(g[0]) + g[1].map(function(r){ return pxKv(String(r[0]).split(/\s{2,}|\s+or\s+/).map(function(x){ return pxKeys(x); }).join(' <small class="or">or</small> '), esc(r[1])); }).join(''));
  }).join('');
}
function pxSecAdmin(){
  return pxCard(pxCh("See the app as someone else", "pages and lists, the way they see them") + '<div class="px-row">' + viewAsSelectHtml("px-va") + '</div>')
    + pxCard(pxCh("Shop") + '<div class="px-row"><label for="px-labor">Labor rate</label><input id="px-labor" data-bind="labor-rate" class="mono" inputmode="decimal" style="width:96px" value="' + esc(String(laborRate())) + '"><small>$ per hour — the labor cost on every operation</small></div>')
    + pxCard(pxCh("Readouts and test data")
      + pxSwRow("toggle-devtools", devToolsOn(), "Developer readouts", "timings and storage under each page")
      + '<div class="px-row" style="margin-top:10px"><button class="px-btn sm" data-action="sample-25">Generate 25 sample ROs</button><button class="px-btn sm danger" data-action="clear-sample">Clear all data…</button></div>')
    + pxNote('New repair order lives on the RO List header, at Triage check-in, and on the ' + pxKbd("N") + ' key.', "plus");
}

/* ---------- actions ---------- */
function pxAct(a, t, e){
  switch(a){
    case "px-side": pxSideToggle(); return true;
    case "px-pop": { var p = t.dataset.p; UI.pxPop = UI.pxPop === p ? null : p; UI.notifOpen = false; render(); return true; }
    case "px-profile": case "px-sec": {
      if(UI.view !== "profile"){ UI.pxPrev = UI.view; UI.view = "profile"; window.scrollTo(0, 0); }
      UI.pxSec = t.dataset.s || "you"; UI.pxPop = null; UI.pxPeek = false; UI.appMenu = false; UI.profileOpen = null; if(UI.pxSec === "data") UI.pxBk = null;
      render(); return true;
    }
    case "px-switch": { var rp = runningPunch(); UI.pxPop = null; pxLS("tec_out", "1"); pxLS("tec_viewas", null); pxLS("tec_signin_at", null); UI.modal = null; UI.selectedRo = null; render(); return true; }
    case "px-logout": pxLogout(false); return true;
    case "px-bk-now": pxBkNow(); return true;
    case "px-restore-file": { var inp = document.createElement("input"); inp.type = "file"; inp.accept = "application/json,.json";
      inp.onchange = function(){ var f = inp.files && inp.files[0]; if(!f) return; f.text().then(function(txt){ var data = JSON.parse(txt); if(!data || !data.ros) throw new Error("bad");
        if(!confirm("Restore “" + f.name + "”?\n\nThat file holds " + summarizeState(data) + ".\n\nYour current data is replaced — Undo brings it back.")) return;
        pushUndo("restore from " + f.name); STATE = normalizeState(data); scheduleSave(true); render(); pushToast("Restored from " + f.name, true); }).catch(function(){ pushToast("That file isn’t a Parsec backup."); }); };
      inp.click(); return true; }
    case "px-tog": { var k = t.dataset.k, def = t.dataset.def === "1", on = !pxBkOn(k, def); pxLS(k, on ? "1" : "0"); render(); return true; }
  }
  return false;
}
