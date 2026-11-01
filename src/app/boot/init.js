/* Parsec · boot · init.js
   Boot: theme, device, the folder (restoreFolder → FS_READY), the first render, the timers and the window listeners. Last in the manifest on purpose.
   ── facts (generated; run tools/headers.py to refresh) ──
   state      ros
   uses       automations/ data/ import/ pages/fixes/ pages/inventory/ phone/ ro/ shell/ state/
   at load    2× wraps STATE · 2× a delayed start · on window beforeunload · on window blur · on document visibilitychange · on document focusout
*/
/* ============================== INIT ============================== */
/* If anything in here throws, the page would otherwise sit blank with no clue why.
   The net catches it, says so on screen, and still puts the console up. */
try {
  initTheme();
  applyDevice();
  STATE = loadState();
  try{ pdMarkReset(); }catch(e){}   /* Parsec 16: what was loaded is the baseline for updatedAt */
  restoreUI();
  try{ v128StaffPages(); }catch(e){}
  try{ if(fixAutoFill()) persistLocal(); }catch(e){}
  try{ invSyncAll(); }catch(e){}
  draftsReopenModal();   /* a dialog open at refresh comes back, with what was typed in it */
  /* once, line every RO's status up with its operations (Status sync), before the watcher's first look */
  try{
    var acf = autoCfg();
    if(acf.builtin.status && !acf.roSynced124){
      STATE.ros.forEach(function(ro){
        var t = roAutoTarget(ro), o = t && roStatusOption(t.status); if(!o) return;
        var c = roStatus(ro); if(c.status === t.status && (c.sub || null) === (t.sub || null)) return;
        ro.status = { status: t.status, sub: o.subs.indexOf(t.sub) >= 0 ? t.sub : null, setAt: nowIso() };
      });
      acf.roSynced124 = true; scheduleSave(true);
    }
  }catch(e){ console.warn("status sync", e); }
  autoRun();          /* the watcher's first look: a baseline, not a change */
  render();
  v161Clean();
  if(devToolsOn()){ initDevReadout(); initDevHoverTag(); }
  if(DATE_REPAIRS){ setTimeout(function(){ try{ pushToast(DATE_REPAIRS + " time entr" + (DATE_REPAIRS === 1 ? "y" : "ies") + " had a time that couldn\u2019t be read and " + (DATE_REPAIRS === 1 ? "was" : "were") + " repaired \u2014 check the Time Log (marked as edited)."); }catch(e){} }, 600); scheduleSave(true); }
} catch (initErr) {
  console.error('startup failed', initErr);
  var warn = document.createElement('div');
  warn.setAttribute('style', 'margin:16px;padding:12px 16px;border:1px solid #D9A94A;border-radius:calc(8px * var(--rs, 1));'
    + 'background:#FDF6E3;color:#6B4E00;font:15px system-ui');
  var where = ''; try { var fm = /at (\S+) /.exec(String(initErr && initErr.stack || '').split('\n').slice(1).filter(function(l){ return !/toISOString|<anonymous>/.test(l); })[0] || ''); where = fm ? ' (in ' + fm[1] + ')' : ''; } catch (x) {}
  warn.textContent = 'The console hit an error while starting up: ' + (initErr && initErr.message || initErr) + where
    + ' \u2014 your saved data has not been touched. Reload the page, and if it keeps happening send this message on.';
  document.body.insertBefore(warn, document.body.firstChild);
  try { STATE = STATE || normalizeState(null); render(); } catch (e2) { console.error('render failed too', e2); }
}

// Reconnect the data folder (if one was chosen before), then redraw with its contents.
restoreFolder().then(function(){ FS_READY = true; render(); }).catch(function(){ FS_READY = true; render(); });
  setTimeout(function(){ if(!FS_READY){ FS_READY = true; render(); } }, 3000);   /* never stuck on “Opening…” */

// Hosted-artifact extras, when this page happens to be running inside claude.ai.
if(window.claude && window.claude.use){
  Promise.all([window.claude.use("artifact"), window.claude.use("downloads")]).then(function(res){
    artifactCap = res[0]; downloadsCap = res[1];
    updateSyncIndicator();
  }).catch(function(){ updateSyncIndicator(); });
}

// Never lose the last keystroke on close.
/* Never leave a change sitting in the debounce: flush whenever focus or the
   tab goes away, and once more on the way out. */
window.addEventListener("beforeunload", function(){ persistLocal(); saveNow(); });
window.addEventListener("blur", function(){ if(syncStatus==="pending") saveNow(); });
document.addEventListener("visibilitychange", function(){
  if(document.visibilityState==="hidden" && syncStatus==="pending") saveNow();
});
document.addEventListener("focusout", function(e){
  if(e.target && e.target.dataset && e.target.dataset.action==="field-change" && syncStatus==="pending") saveNow();
});
