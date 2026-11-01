/* ---------- backups: a dated copy once a day, again when you clock out for the day ---------- */
function pxBkOn(k, def){ var v = pxLS(k); return v === null ? def : v === "1"; }
function pxBkInfo(){
  if(FS.status === "connected") return { where: "folder", at: pxLS("tec_bk_at"), day: pxLS("tec_last_backup") };
  return { where: "browser", at: STATE.lastBackupAt || null, day: STATE.lastBackupAt ? todayStr(new Date(STATE.lastBackupAt)) : null };
}
function pxBkDays(){ var b = pxBkInfo(); if(!b.day) return null; return Math.round((new Date(todayStr() + "T12:00:00") - new Date(b.day + "T12:00:00")) / 86400000); }
/* the reason to look at Your data, or "" */
function pxBkWarn(){
  if(FS.status === "needs-permission") return "The folder needs reconnecting";
  if(FS.status === "connected" && typeof syncStatus !== "undefined" && syncStatus === "error") return "Saving to the folder failed";
  if(!STATE || !(STATE.punches || []).length && !(STATE.ros || []).length) return "";
  var d = pxBkDays(), b = pxBkInfo();
  if(d === null) return "No backup yet";
  if(b.where === "folder" ? d > 1 : d >= 7) return "Last backup " + d + " days ago";
  return "";
}
function pxBkShort(){ var w = pxBkWarn(); if(w) return w.replace(/^Last backup /, "backup "); var b = pxBkInfo();
  return b.at ? "backed up " + pxAgo(b.at) : b.day ? "backed up " + (b.day === todayStr() ? "today" : b.day) : ""; }
function pxBkWrite(how){
  if(FS.status !== "connected" || !FS.dir) return Promise.reject(new Error("no folder"));
  var json = JSON.stringify(STATE, null, 2), today = todayStr();
  return pdSub(PD_BK, true)
    .then(function(bd){ return bd.getFileHandle("data-" + today + ".json", { create: true }); })
    .then(function(fh){ return fh.createWritable(); })
    .then(function(w){ return w.write(json).then(function(){ return w.close(); }); })
    .then(function(){ pxLS("tec_last_backup", today); pxLS("tec_bk_at", nowIso()); UI.pxBk = null; return pxBkPrune(); })
    .then(function(){ return how; });
}
/* keep only the newest 14 dated copies, when that is switched on (off unless you turn it on) */
function pxBkPrune(){
  if(!pxBkOn("tec_bk_keep", false)) return Promise.resolve(0);
  return pdSub(PD_BK, false).then(function(bd){
    return listDir(bd).then(function(es){
      var L = es.filter(function(e){ return e.kind === "file" && /^data-\d{4}-\d{2}-\d{2}\.json$/.test(e.name); }).map(function(e){ return e.name; }).sort().reverse().slice(14);
      return L.reduce(function(p, n){ return p.then(function(){ return bd.removeEntry(n).catch(function(){}); }); }, Promise.resolve()).then(function(){ return L.length; });
    });
  }).catch(function(){ return 0; });
}
function pxBkNow(){
  if(FS.status !== "connected"){ exportJSON(); return; }
  pxBkWrite("by hand").then(function(){ pushToast("Backup saved — Parsec Data / Backups / data-" + todayStr() + ".json"); pxBkLoad(); }, function(){ pushToast("Couldn’t write the backup — check the folder."); });
}
/* the backups list on Your data: name, time and size */
function pxBkLoad(){
  if(FS.status !== "connected"){ UI.pxBk = { files: [] }; return; }
  UI.pxBk = UI.pxBk || { loading: true, files: [] };
  pdSub(PD_BK, false).then(function(bd){
    return listDir(bd).then(function(es){
      var fs = es.filter(function(e){ return e.kind === "file" && /\.json$/i.test(e.name); }).sort(function(a, b){ return a.name < b.name ? 1 : -1; }).slice(0, 30);
      return Promise.all(fs.map(function(e){ return e.getFile().then(function(f){ return { name: e.name, size: f.size, mod: f.lastModified }; }, function(){ return { name: e.name, size: 0, mod: 0 }; }); }));
    });
  }).then(function(files){ UI.pxBk = { files: files }; if(UI.view === "profile") render(); }, function(){ UI.pxBk = { files: [] }; if(UI.view === "profile") render(); });
}
function pxSize(n){ return n >= 1048576 ? (n / 1048576).toFixed(2) + " MB" : Math.max(1, Math.round(n / 1024)) + " KB"; }
/* clocking out for the day: the dated copy, and the next person starts clean */
function pxEndOfDay(reason){
  if(reason !== "End of day" && reason !== "Home") return;
  var msg = UI.toast;
  var then = function(){ if(pxBkOn("tec_logout_eod", true) && staffList().length && viewAsStaff()) setTimeout(function(){ pxLogout(true); }, 1600); };
  if(!pxBkOn("tec_bk_eod", true)){ then(); return; }
  if(FS.status === "connected"){
    pxBkWrite("automatic").then(function(){ if(UI.toast === msg) pxToastSet(msg + " · backup saved", 6000); then(); }, then);
  } else {
    var und = UI.toastUndo; exportJSON(); UI.toastUndo = und;
    pxToastSet((msg ? msg + " · " : "") + "backup file downloaded", 6000); then();
  }
}
function pxToastSet(msg, ms){ UI.toast = msg; render(); setTimeout(function(){ if(UI.toast === msg){ UI.toast = null; UI.toastUndo = false; render(); } }, ms || 4000); }

/* ---------- signing in and out (who is using this computer — not a password) ---------- */
function pxOut(){ return pxLS("tec_out") === "1"; }
function pxLogout(auto){
  var rp = runningPunch(), who = viewAsStaff();
  if(who) audit("signout", who.name + " signed out" + (auto ? " (end of day)" : ""));
  pxLS("tec_out", "1"); pxLS("tec_viewas", null); pxLS("tec_signin_at", null);
  UI.pxPop = null; UI.modal = null; UI.profileOpen = null; UI.notifOpen = false; UI.pxPeek = false; UI.selectedRo = null;
  persistUI();
  pushToast((auto ? "End of day — signed out." : "Signed out.") + (rp ? " The clock keeps running on " + roTag(getRO(rp.roId)) + "." : openShift() ? " The day clock keeps running." : ""));
}
function pxSignedIn(){
  pxLS("tec_out", null); pxLS("tec_signin_at", nowIso());
  UI.pxPop = null;
  if(!navAllowed(UI.view) || UI.view === "profile") UI.view = navPages()[0][0];
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
function pxSignInHtml(){
  var l = staffList(), rp = runningPunch(), groups = [];
  Object.keys(DEPT_OF).forEach(function(role){ var g = l.filter(function(sf){ return sf.role === role; }); if(g.length) groups.push([DEPT_OF[role], g]); });
  var other = l.filter(function(sf){ return !DEPT_OF[sf.role]; }); if(other.length) groups.push(["Other", other]);
  var sub = function(sf){
    if(rp && rp.by && techSame(rp.by, sf.name)) return 'on the clock · ' + esc(roTag(getRO(rp.roId)));
    if(sf.role === "Technician"){ var n = STATE.ros.filter(function(ro){ return !roIsDone(ro) && techSame(ro.assignedTech, sf.name); }).length; return n + ' open RO' + (n === 1 ? '' : 's'); }
    return esc(sf.role);
  };
  var h = '<div class="px pxs" data-key="px-signin"><div class="pxs-in"><span class="lg">' + PX_LOGO + '</span><h2>Who’s signing in?</h2>'
    + '<p>Pick your name — each person sees their own pages' + (l.some(function(sf){ return sf.pin; }) ? ', and a PIN if one is set' : '') + '.</p>';
  if(!l.length) h += '<p class="pxs-none">No one is set up yet — sign in as Admin, then add people under Manager → Staff.</p>';
  groups.forEach(function(g){
    h += '<div class="pxs-gl">' + esc(g[0]) + '</div><div class="pxs-pp">' + g[1].map(function(sf){
      return '<button class="pxs-p" data-action="viewas-set" data-id="' + sf.id + '">' + staffAvHtml(sf, "pxs-av", "s") + '<b>' + esc(sf.name || "Unnamed") + '</b><small>' + sub(sf) + '</small>' + (sf.pin ? '<span class="pin" title="Asks for a PIN">' + pxI("lock", 11) + '</span>' : '') + '</button>';
    }).join('') + '</div>';
  });
  h += '<button class="pxs-adm" data-action="viewas-reset">' + pxI("user", 13) + 'Admin — every page</button>'
    + (rp || openShift() ? '<div class="pxs-clk"><i class="pxr-dot ' + pxClockState() + '"></i>' + (rp ? 'The clock is running on ' + esc(roTag(getRO(rp.roId))) + (rp.by ? ' · ' + esc(rp.by) : '') : 'The day clock is running') + '</div>' : '')
    + '</div></div>';
  return h;
}
/* while signed out, keys go nowhere except the PIN box */
document.addEventListener("keydown", function(e){
  if(!pxOut()) return;
  var t = e.target; if(t && t.closest && t.closest(".modal")) return;
  if(e.key === "Tab") return;
  if(e.key === "Escape" && UI.modal){ UI.modal = null; render(); }
  if((e.ctrlKey || e.metaKey) && /^[kz]$/i.test(e.key)) e.preventDefault();
  e.stopImmediatePropagation();
}, true);
