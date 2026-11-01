/* Parsec · shell · event-wiring.js
   The app's main click / change / input / drop handlers on document: data-action buttons are dispatched here to the function that does the work (the big switch), plus drag-and-drop of files and the keyboard shortcuts that are the same everywhere.
   Flow: a button carries data-action="…"; the handler reads it, calls the action, and the action calls render().
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   val (1 function)
   state      inventory laborRate punches shop techName
   uses       access/ automations/ clock/ data/ import/ import/new-ro/ kit/ pages/ pages/foreman/ pages/inventory/ pages/rolist/ pages/triage/ pages/warranty/ phone/ ro/ ro-page/ sample/ settings/ state/
   at load    on document click · 3× on document change · 2× on document input · 2× on document paste · 2× on document dragleave · 2× on document drop · on document keydown
*/
/* ============================== EVENT WIRING ============================== */
function val(id){ var e=document.getElementById(id); return e?e.value:""; }

document.addEventListener("click", function(e){
  var t = e.target.closest("[data-action]");
  if(UI.pxPop && !e.target.closest(".pxr-pop,[data-px-anchor]")){ UI.pxPop = null; if(!t) render(); }
  if(UI.pxPeek && !e.target.closest(".px-rail")){ UI.pxPeek = false; if(!t) render(); }
  if(UI.appMenu && !e.target.closest(".pnav-set")){ UI.appMenu = false; if(!t) render(); }
  if(UI.roFiltOpen && !e.target.closest(".ro-filt")){ UI.roFiltOpen = false; if(!t) render(); }
  if(UI.notifOpen && !e.target.closest(".notif")){ UI.notifOpen = false; if(!t) render(); }
  if(UI.profileOpen && !e.target.closest(".profile")){ UI.profileOpen = null; if(!t) render(); }
  if(e.target.closest(".modal") && !t){ return; }
  if(t && t.dataset.action==="overlay-close" && e.target===t){ if(UI.modal && UI.modal.type === "add-ro") return; UI.modal=null; render(); return; }
  if(!t) return;
  var a = t.dataset.action;
  if(a && a.indexOf("am-") === 0 && UI.modal && UI.modal.type === "automations" && amAction(a, t)) return;
  if(a && (a.indexOf("ty-road") === 0 || a === "ty-stg" || a === "ty-opdone" || a === "ty-newro") && tySelAct(a, t)) return;
  if(a && a.indexOf("rt-") === 0 && rtAct(a, t)) return;   /* RO route */
  if(a && a.indexOf("tg-") === 0 && tgAct(a, t, e)) return;   /* Triage */
  if(a && a.indexOf("fm-") === 0 && fmAct(a, t, e)) return;   /* Foreman */
  if(a && a.indexOf("wa-") === 0 && waAct(a, t, e)) return;   /* Warranty */
  if(a && a.indexOf("tx-") === 0 && txAct(a, t, e)) return;   /* Parsec 12.5: move time */
  if(a && a.indexOf("px-") === 0 && pxAct(a, t, e)) return;
  if(UI.pxPop && t.closest(".pxr-pop") && a !== "set-theme" && a !== "set-size") UI.pxPop = null;
  if(UI.pxPeek && t.closest(".px-rail") && a === "nav") UI.pxPeek = false;
  switch(a){
    case "toggle-profile": {
      UI.profileOpen = !UI.profileOpen; render();
      if(UI.profileOpen){ var pf = document.querySelector('[data-bind="profile-name"]'); if(pf) pf.focus(); }
      break;
    }
    case "toggle-app-menu": UI.appMenu = !UI.appMenu; render(); break;
    
    case "tl-day": {
      UI.tlOpen = UI.tlOpen || {}; var tlD = t.dataset.date; UI.tlOpen[tlD] = t.dataset.open !== "1"; render();
      if(UI.tlOpen[tlD]){ var tlB = document.querySelector('.tl-day [data-action="tl-day"][data-date="'+tlD+'"]'); if(tlB) revealInPage(tlB.closest('.tl-day')); }
      break;
    }
    case "toggle-notif": UI.notifOpen = !UI.notifOpen; UI.appMenu = false; render(); break;
    
    case "open-palette": openPalette(); break;
    case "palette-close": UI.palette = null; render(); break;
    case "palette-pick": palettePick(t.dataset.ro); break;
    case "newro-populate": runImport(); break;
    case "tab-takeover": takeOverTab(); break;
    case "conflict-load": readFolderState().then(function(st){ if(st && st.ros){ pushUndo("load the folder's copy"); STATE = normalizeState(st); FOLDER_SEEN = st.savedAt || 0; } UI.folderConflict = null; undoBaseline(); persistLocal(); render(); pushToast("Loaded the folder's copy."); }); break;
    case "pd16-ok": PD16.failed = ""; render(); break;
    case "pd15-ok": PD16.old15 = "seen"; render(); break;
    case "conflict-keep": UI.folderConflict = null; writeFolderState(true).then(function(){ syncStatus = "saved"; updateSyncIndicator(); pushToast("Saved this copy to the folder."); }).catch(function(){}); render(); break;
    case "long-clock-now": case "long-clock-at": {
      var lcp = STATE.punches.filter(function(x){ return x.id === UI.modal.punchId; })[0];
      if(lcp && !lcp.stop){
        var lcAt = a === "long-clock-now" ? Date.now() : new Date(val("lc-stop")).getTime();
        if(!lcAt || isNaN(lcAt) || lcAt <= new Date(lcp.start).getTime() || lcAt > Date.now()){ document.getElementById("form-error").textContent = "Pick a time after the clock started and not in the future."; return; }
        pushUndo("stop a forgotten clock");
        lcp.stop = new Date(lcAt).toISOString(); lcp.stopReason = lcp.stopReason || "End of day"; lcp.edited = true; lcp.editedAt = nowIso();
        creditBurnt(lcp);
        scheduleSave(true);
        pushToast("Clock stopped at " + fmtTime(lcp.stop) + ".");
      }
      UI.modal = null; render(); break;
    }
    case "newro-clear": clearNewRoDraft(); UI.modal = { type:"add-ro" }; render(); break;
    
    
    case "set-size": UI.size = SIZES.indexOf(t.dataset.size) > -1 ? t.dataset.size : "normal"; persistUI(); applyBigTouch(); render(); pushToast("Size: " + ({normal:"Normal",large:"Large",floor:"Shop floor"})[UI.size] + "."); break;
    
    
    case "wc-filter": UI.wcFilter = t.dataset.f || "all"; persistUI(); render(); break;
    
    
    
    
    
    
    
    
    case "nav": UI.roFrom = null; if(t.dataset.view === "timelog") UI.tlMe = 1; UI.view=t.dataset.view; UI.modal=null; UI.navOpen=false; render(); window.scrollTo(0,0); break;
    
    case "set-theme": applyTheme(t.dataset.theme); render(); break;
    
    case "open-day-report": UI.view="report"; UI.reportDate = t.dataset.day || todayStr(); render(); window.scrollTo(0,0); break;
    case "undo": undoLast(); break;
    
    case "open-report": UI.view="report"; UI.reportDate = t.dataset.date || todayStr(); render(); window.scrollTo(0,0); break;
    
    
    case "open-restore": UI.modal={type:"restore", files:null}; render(); loadBackupList(); break;
    case "restore-backup": restoreBackup(t.dataset.file); break;
    case "open-start-punch": UI.modal={type:"start-punch", roId:t.dataset.ro, opId:t.dataset.op}; render(); break;
    case "shop-start": doStartPunch(SHOP_RO_ID, t.dataset.op, null); break;
    case "submit-start-punch": {
      var roSel = document.querySelector('[data-bind="sp-ro"]'), opSel = document.querySelector('[data-bind="sp-op"]');
      var roId = roSel?roSel.value:null, opId = opSel?opSel.value:null;
      if(!roId||!opId){ var fe=document.getElementById("form-error"); if(fe) fe.textContent="Pick an RO and operation."; return; }
      doStartPunch(roId, opId, t.dataset.reason);
      break;
    }
    case "open-stop-punch": UI.modal={type:"stop-punch"}; render(); break;
    case "submit-stop-punch": doStopPunch(t.dataset.reason, val("stop-notes")); break;
    case "open-add-ro": UI.modal = null; UI.appMenu = false; render(); IMPX.open({}); break;
    case "submit-add-ro": {
      var nr = newRoValues();
      if(nr.missing.length){
        document.getElementById("form-error").textContent = "Still needed: " + nr.missing.join(", ") + ".";
        var firstEmpty = document.getElementById(nr.missingIds[0]); if(firstEmpty) firstEmpty.focus();
        return;
      }
      var v = nr.values;
      var newRo = addRO({roNumber:v.ro, customerName:v.cust, caseNumber:v.caseNo, dateOpened: localToIso(v.opened+"T08:00")});
      newRo.vin = v.vin; newRo.mileage = v.miles; newRo.unitNumber = v.unit; newRo.location = v.loc; newRo.keyTag = v.tag;
      newRo.engineHours = val("f-enghours").trim();
      newRo.engineType = val("f-engtype").trim();
      newRo.model = val("f-model").trim(); setTimeout(function(){ try{ v141Comeback(newRo); }catch(e){ console.error(e); } }, 150);   /* Parsec 14.1 */
      (function(){ var yy = +String(val("f-year") || "").replace(/\D/g, ""); if(yy >= 1980 && yy <= new Date().getFullYear() + 2) newRo.year = yy; })();
      var nTech = val("f-tech").trim(); if(nTech) newRo.assignedTech = nTech;
      if(pendingImportBuilt) newRo.buildDate = pendingImportBuilt;
      if(pendingImportWarrStart) newRo.warrantyStart = pendingImportWarrStart;
      importJobsChosen().forEach(function(j){
        newRo.operations.push({ id: uid("op"), complaint: j.name, cause: "", correction: "", quoted: j.hours, isStandard: false, standardName: null,
          declined: false, parts: [], burnt: 0, work: "", jobType: j.type, estCost: +j.cost > 0 ? +j.cost : undefined });
      });
      clearNewRoDraft();
      if(v.status && v.status !== "Hold Tech"){ newRo.status = { status: v.status, sub: null, setAt: nowIso() }; newRo._lastKnownStatus = v.status; }
      scheduleSave(true);
      UI.modal=null; UI.view="ros"; UI.selectedRo=newRo.id; UI.roFilter=""; render();
      pushToast("Created " + v.ro + ".");
      break;
    }
    case "submit-add-op": {
      var compl = val("f-complaint").trim();
      if(!compl){ document.getElementById("form-error").textContent="Complaint is required."; return; }
      addOperation(t.dataset.ro, {complaint:compl, cause:"", correction:"", quoted:val("f-quoted")}, false);
      UI.modal=null; render(); break;
    }
    case "submit-add-std-op": addOperation(t.dataset.ro, {standardName:t.dataset.name, quoted:val("f-std-quoted")}, true); UI.modal=null; render(); break;
    case "submit-add-part": {
      var desc = val("f-desc").trim();
      if(!desc){ document.getElementById("form-error").textContent="Description is required."; return; }
      addPart(t.dataset.ro, t.dataset.op, {description:desc, partNumber:val("f-partnum"), qty:val("f-qty")});
      UI.modal=null; render(); break;
    }
    case "goto-ro": UI.notifOpen=false; UI.view="ros"; UI.selectedRo=t.dataset.ro; UI.roFilter=""; render(); setTimeout(function(){var el=document.getElementById("ro-"+t.dataset.ro); if(el) el.scrollIntoView({behavior:"smooth",block:"start"});},50); break;
    
    case "open-automations": UI.appMenu = false; sgOpen("auto"); break;   /* Parsec 16.2: Settings › Automations */
    
    
    
    case "shift-in": shiftClockIn(); break;
    case "shift-out":
      UI.segShift = null;
      /* clocking off always asks why: lunch, home, an appointment… — and that reason
         stops whatever job is running and labels the gap on the day bar */
      UI.modal = { type:"clockout" }; render();
      break;
    case "clock-off": shiftClockOut(t.dataset.reason, +(t.dataset.min || 0), val("co-notes"), UI.modal && UI.modal.stand); break;
    case "co-stand":
      if(UI.modal){ UI.modal.stand = UI.modal.stand === t.dataset.reason ? null : t.dataset.reason;
        document.querySelectorAll('[data-action="co-stand"]').forEach(function(x){ var on = x.dataset.reason === UI.modal.stand; x.classList.toggle("sel", on); x.setAttribute("aria-pressed", on); }); }
      break;
    case "shift-time": if(shiftSetTime(t.dataset.id, t.dataset.edge, (document.getElementById("shift-time")||{}).value)){ render(); } break;
    
    
    
    
    
    case "seg-air":
      UI.segPick = null; UI.segEmpty = null; UI.segShift = null;
      UI.segAir = (UI.segAir && UI.segAir.day === t.dataset.day && UI.segAir.at === t.dataset.at) ? null : { day: t.dataset.day, at: t.dataset.at };
      render(); break;
    
    
    case "inv-del": { var dk = String(t.dataset.id).split(":"); pushUndo("delete from inventory");
      if(dk.length === 1) STATE.inventory = invList().filter(function(x){ return x.id !== dk[0]; });
      else { var pk = invFind(dk[0]); if(pk) pk.children = (pk.children || []).filter(function(c){ return c.id !== dk[1]; }); }
      scheduleSave(true); pushToast("Deleted from the inventory", true); break; }
    case "inv-toggle": {
      UI.invOpen = UI.invOpen || {}; var ivId = t.dataset.id; UI.invOpen[ivId] = UI.invOpen[ivId] === false; render();
      var ivB = document.querySelector('[data-action="inv-toggle"][data-id="'+ivId+'"]');
      if(ivB && UI.invOpen[ivId] !== false){
        var ivR = ivB.closest('tr'), ivLast = ivR;
        while(ivLast && ivLast.nextElementSibling && !ivLast.nextElementSibling.querySelector('[data-action="inv-toggle"]') && ivLast.nextElementSibling.classList.contains('inv-child')) ivLast = ivLast.nextElementSibling;
        revealInPage(ivLast || ivR);
      }
      break;
    }
    
    case "inv-extract": UI.modal = { type: "inv-extract", text: "", pick: {} }; render(); setTimeout(function(){ var ta = document.getElementById("inv-x-text"); if(ta) ta.focus(); }, 30); break;
    case "inv-x-add": invXCommit(); render(); break;
    case "ops-x-add": opsXCommit(); render(); break;
    case "ops-x-clear": if(UI.modal && UI.modal.type === "extract-ops"){ UI.modal.rows = []; opsXSetText(""); var ot = document.getElementById("ops-x-text"); if(ot) ot.focus(); } break;
    
    
    
    
    
    
    
    
    
    case "ro-status-pick": UI.modal.pick = t.dataset.status; UI.modal.sub = null; render(); break;
    case "ro-status-sub": UI.modal.sub = t.dataset.sub || null; render(); break;
    case "ro-status-save":
      if(setRoStatus(t.dataset.ro, t.dataset.status, t.dataset.sub || null) !== false) UI.modal = null;
      render(); break;
    case "ro-group": UI.roGroup = t.dataset.g; persistUI(); render(); break;
    case "ro-filt-toggle": UI.roFiltOpen = !UI.roFiltOpen; render(); break;
    case "ro-filt-reset": UI.roGroup = "all"; if(UI.roShowAll) UI.roShowAll = false; UI.roFiltOpen = false; persistUI(); render(); break;
    case "ro-done-toggle": UI.roDoneOpen = !UI.roDoneOpen; persistUI(); render(); break;
    
    
    
    case "rl-menu": UI.rlMenu = UI.rlMenu === t.dataset.ro ? null : t.dataset.ro; render(); break;
    case "rl-opt": {
      var rlo = getRO(t.dataset.ro), rk = t.dataset.k; UI.rlMenu = null; if(!rlo){ render(); break; }
      if(rk === "warr"){ pushUndo("warranty flag"); rlo.warranty = !rlo.warranty; scheduleSave(true); render(); pushToast(roLabel(rlo) + (rlo.warranty ? " marked as a warranty RO." : " is no longer a warranty RO."), true); break; }
      UI.view = "ros"; UI.selectedRo = rlo.id; UI.modal = null; UI.jcPendingOpt = rk; render(); window.scrollTo(0, 0); break;   /* the rest run on the RO itself */
    }
    
    case "yard-pick": {
      var pk = t.dataset.ro;
      if(UI.yardPick && UI.yardPick !== pk){
        var tgt = getRO(pk), tsp = tgt ? spotOf(tgt.location) : null, vv = yardMap();
        if(tsp && vv.map[tsp] === tgt){ var mv = UI.yardPick; UI.yardPick = null; yardMove(mv, tsp); render(); break; }
      }
      UI.yardPick = UI.yardPick === pk ? null : pk; render(); break;
    }
    case "yard-drop": {
      if(!UI.yardPick){ pushToast("Click a truck first, then the spot to move it to — or drag it."); break; }
      var mv2 = UI.yardPick; UI.yardPick = null; yardMove(mv2, t.dataset.spot || ""); render(); break;
    }
    case "yard-cancel": UI.yardPick = null; render(); break;
    
    
    
    
    
    
    
    
    case "rel-tick": { var rlr = getRO(t.dataset.ro); if(rlr){ var rs = releaseState(rlr); rs[t.dataset.k] = !rs[t.dataset.k]; scheduleSave(true); render(); } break; }
    case "rel-all": { var rla = getRO(t.dataset.ro); if(rla){ var rsa = releaseState(rla); RELEASE_CHECK.forEach(function(x){ rsa[x[0]] = true; }); scheduleSave(true); render(); } break; }
    case "open-keytag": UI.modal = { type: "keytag", roId: t.dataset.ro }; render(); break;
    case "open-keytag-all": UI.modal = { type: "keytag", roId: t.dataset.ro, all: true }; render(); break;
    case "open-warr": UI.modal = { type: "warr", roId: t.dataset.ro }; render(); break;
    
    
    case "eod-print": document.documentElement.classList.add("print-eod"); setTimeout(function(){ window.print(); setTimeout(function(){ document.documentElement.classList.remove("print-eod"); }, 400); }, 30); break;
    
    
    case "pin-ok": {
      var pm = UI.modal, psf2 = pm && staffList().filter(function(x){ return x.id === pm.id; })[0], pv = (document.getElementById("pin-in") || {}).value || "";
      if(pm && pm.id === "__admin"){ if(String(pv) !== String((STATE.shop && STATE.shop.adminPin) || "")){ var ape = document.getElementById("form-error"); if(ape) ape.textContent = "That PIN doesn't match."; break; }
        try{ localStorage.removeItem("tec_viewas"); }catch(x){} pxSignedIn(); audit("signin", "Admin signed in with PIN"); UI.modal = null; UI.profileOpen = false; UI.selectedRo = null; persistUI(); render(); pushToast("Signed in as Admin"); break; }
      if(!psf2) { UI.modal = null; render(); break; }
      if(String(pv) !== String(psf2.pin)){ var pe = document.getElementById("form-error"); if(pe) pe.textContent = "That PIN doesn't match."; break; }
      UI.modal = { type: "pin-ok-" + psf2.id };
      try{ localStorage.setItem("tec_viewas", psf2.id); }catch(x){}
      pxSignedIn();
      audit("signin", psf2.name + " signed in with PIN (" + psf2.role + ")");
      UI.modal = null; UI.roShowAll = false; UI.selectedRo = null; persistUI(); scheduleSave(true); render(); pushToast("Signed in as " + psf2.name + " \u00b7 " + psf2.role);
      break;
    }
    
    case "ra-tab": case "ra-goop": case "ra-copy": case "ra-part": case "ra-appr": case "ra-appr-all": case "ra-contact": case "ra-contact-del": case "ra-fix-use": raAct(a, t); break;
    
    
    case "tr-where": {
      if(UI.trMenu){ UI.trMenu = false; render(); break; }
      var twh = tyWhereTarget(); if(twh) tyFindRo(twh);
      UI.trMenu = true; render(); break;
    }
    
    
    
    
    case "triage-est-sent": {
      var er = getRO(t.dataset.ro); if(!er) break;
      if(setRoStatus(er.id, "Waiting \u2013 Customer", "Estimate sent") !== false){ audit("estimate", "Estimate sent for " + roLabel(er), er); scheduleSave(true); pushToast(roLabel(er) + " \u2014 estimate marked as sent.", true); }
      render(); break;
    }
    case "triage-release": {
      var rr = getRO(t.dataset.ro); if(!rr) break;
      if(!releaseReady(rr)){ UI.modal = { type: "release-check", roId: rr.id }; render(); break; }
      UI.modal = null;
      if(setRoStatus(rr.id, "Complete \u2013 Released", null) !== false){
        if(typeof syncDateClosedRo === "function") syncDateClosedRo(rr);
        audit("release", "Released " + roLabel(rr) + (rr.customerName ? " (" + rr.customerName + ")" : "") + " \u2014 checklist complete", rr);
        scheduleSave(true); pushToast(roLabel(rr) + " released and closed out.", true);
      }
      render(); break;
    }
    
    
    case "fs-pick": connectFolder(); break;
    case "fs-reconnect": reconnectFolder(); break;
    case "fs-local": FS_LOCAL = true; render(); break;
    case "viewas-reset": { if(!pxOut() && !viewAsStaff()) break; lgOpen("__admin", pxOut() ? "login" : "switch"); break; }   /* Parsec 13: the Admin PIN, on the pad */
    case "viewas-set": { lgOpen(t.dataset.id, pxOut() ? "login" : "switch"); break; }   /* Parsec 13: every sign-in asks for the PIN */
    case "demo-team": {
      pushUndo("create demo team");
      var made = ensureDemoTeam(); scheduleSave(true); render();
      pushToast(made ? made + " demo people created, ROs handed out to the technicians." : "The demo team is already here.", true);
      break;
    }
    
    case "staff-photo-clear": { var psf = staffList().filter(function(x){ return x.id === t.dataset.id; })[0]; if(psf){ pushUndo("remove photo"); delete psf.photo; scheduleSave(true); render(); } break; }
    case "ro-clear-filters": UI.roFilter = ""; UI.roGroup = "all"; persistUI(); render(); break;
    case "ro-mine": UI.roShowAll = t.dataset.m === "all"; UI.selectedRo = null; persistUI(); render(); break;
    case "ro-pane-toggle": toggleRoRail(); break; case "ro-pane-toggle-old": persistUI(); render(); if(typeof JC !== "undefined" && JC.rerender) JC.rerender(); break;
    case "pick-op": UI.roOp[t.dataset.ro] = t.dataset.op; UI.roPane[t.dataset.ro] = t.dataset.op; UI.modal = null; UI.jcScrollTo = t.dataset.op; render(); break;
    case "toggle-xcard": UI.xcard[t.dataset.key] = !UI.xcard[t.dataset.key]; render(); break;
    
    
    case "pr-start": UI.modal.start = t.dataset.reason; render(); break;
    case "pr-stop":  UI.modal.stop  = t.dataset.reason; render(); break;
    case "submit-punch-reasons": {
      var changed = updatePunchReasons(t.dataset.punch, UI.modal.start, UI.modal.stop);
      UI.modal = null; render();
      pushToast(changed ? "Reasons updated." : "Nothing changed.");
      break;
    }
    
    
    case "dismiss-note": dismissNote(t.dataset.key); break;
    case "close-modal": UI.modal=null; render(); break;
    
    
    case "submit-edit-punch": {
      var p = STATE.punches.find(function(x){return x.id===t.dataset.punch;});
      var res = editPunchCommit(p, {start:localToIsoKeep(val("f-start"), p.start), stop:localToIsoKeep(val("f-stop"), p.stop), startReason:val("f-startreason"), stopReason:val("f-stopreason"), opId:p.opId, notes:val("f-notes")});
      if(!res.ok){ document.getElementById("form-error").textContent=res.msg; return; }
      UI.modal=null; render(); break;
    }
    
    case "open-manual-punch": UI.modal={type:"manual-punch", roId:t.dataset.ro||null, opId:t.dataset.op||null}; render(); break;
    case "open-add-shift": UI.modal={type:"add-shift", day:t.dataset.day||null}; render(); break;
    case "submit-add-shift": {
      var rs = shiftAddManual(val("f-as-day"), val("f-as-in"), val("f-as-out"));
      if(!rs.ok){ document.getElementById("form-error").textContent = rs.msg; return; }
      UI.modal = null; UI.segShift = null;
      UI.tlOpen = UI.tlOpen || {}; UI.tlOpen[val("f-as-day")] = true;
      pushToast("Clock segment added \u00b7 " + fmtClockHM(rs.in) + " \u2013 " + (rs.out ? fmtClockHM(rs.out) : "now"), true);
      render(); break;
    }
    case "submit-manual-punch": {
      var r3 = addManualPunch({roId:val("f-mp-ro"), opId:val("f-mp-op"), start:localToIso(val("f-mp-start")), stop:localToIso(val("f-mp-stop")), startReason:val("f-mp-startreason"), stopReason:val("f-mp-stopreason"), notes:val("f-mp-notes")});
      if(!r3.ok){ document.getElementById("form-error").textContent=r3.msg; return; }
      UI.modal=null; render(); break;
    }
    case "export-csv": exportCSV(); break;
    case "export-json": exportJSON(); break;
    case "save-now": saveNow(); pushToast("Saved."); break;
    case "storage":
      if(FS.status==="needs-permission") reconnectFolder();
      else if(FS.status==="unsupported") pushToast("Folder saving needs Chrome or Edge on a desktop.");
      else connectFolder();
      break;
    
    case "phone-sync": openPhoneSync(t.dataset.mode || "send"); break;
    case "load-sample": case "load-sample-20": case "sample-25": loadSample25(); break;   /* one generator */
    
    case "clear-sample": clearAll(); break;
    default: break;
  }
});

document.addEventListener("change", function(e){
  if(e.target && e.target.dataset && (e.target.dataset.rtGoal || e.target.hasAttribute("data-rt-needacc"))){   /* transfer goals */
    var rc = rtCfg(), gk = e.target.dataset.rtGoal;
    if(gk === "accept"){ var av = parseInt(e.target.value, 10); if(av > 0) rc.acceptMin = Math.min(600, av); }
    else if(gk){ var gv = parseInt(e.target.value, 10); if(gv > 0) rc.goals[gk] = Math.min(10080, gv); }
    else rc.needAccept = !!e.target.checked;
    scheduleSave(true); render(); return;
  }
  if(e.target && e.target.dataset && e.target.dataset.wc && e.target.type === "radio"){ wcSet(e.target.dataset.wc, "causal", e.target.value); render(); return; }
  if(UI.modal && UI.modal.type === "automations" && e.target.getAttribute && e.target.getAttribute("data-am")){ amField(e.target, e.target.tagName === "SELECT"); return; }
  if(e.target.getAttribute && e.target.getAttribute("data-newro")) updateNewRoButton();
  var tx = e.target;
  if(tx.dataset && tx.dataset.loc){
    var lro = getRO(tx.dataset.loc);
    if(lro){
      var want = String(tx.value || "").trim(), sp2 = spotOf(want);
      if(sp2 && spotById(sp2)){ UI.yardPick = null; yardMove(lro.id, sp2); }
      else { pushUndo("set location"); lro.location = want; scheduleSave(true); }
    }
    render(); return;
  }
  if(tx.dataset && tx.dataset.photo){
    var phsf = staffList().filter(function(x){ return x.id === tx.dataset.photo; })[0], pf0 = tx.files && tx.files[0];
    if(phsf && pf0) resizePhoto(pf0, function(url){ pushUndo("employee photo"); phsf.photo = url; scheduleSave(true); render(); });
    return;
  }
  if(tx.dataset && tx.dataset.viewas){
    var vpin = tx.value && staffList().filter(function(x){ return x.id === tx.value; })[0];
    /* Parsec 13: the same way in as the login page — the PIN, and the person's pages */
    { var vb = document.createElement("button"); vb.dataset.action = tx.value ? "viewas-set" : "viewas-reset"; if(tx.value) vb.dataset.id = tx.value; vb.hidden = true; document.body.appendChild(vb); vb.click(); vb.remove(); return; }
    if(tx.value && vpin) audit("signin", vpin.name + " signed in (" + vpin.role + ")");
    try{ if(tx.value) localStorage.setItem("tec_viewas", tx.value); else localStorage.removeItem("tec_viewas"); }catch(x){}
    render(); return;
  }
  if(tx.dataset && tx.dataset.staff){
    var sf = staffList().filter(function(x){ return x.id === tx.dataset.staff; })[0];
    if(sf){
      pushUndo("edit employee");
      var ff = tx.dataset.f;
      if(ff === "name") sf.name = String(tx.value || "").trim();
      else if(ff === "role"){ if(!permOk("a.people")) { UNDO.pop(); render(); return; } permSetRole(sf, tx.value); }   /* Parsec 13 */
      else if(ff === "page"){ if(!permOk("a.people")) { UNDO.pop(); render(); return; } if(PERM_PAGES.some(function(p){ return p[0] === tx.dataset.page; })) permSet(sf, "pages", tx.dataset.page, !!tx.checked); }
      else if(ff === "pin"){ if(!permOk("a.people")) { UNDO.pop(); render(); return; } var npn = String(tx.value || "").replace(/\D/g, ""); if(!pinValid(npn)){ UNDO.pop(); pushToast("A PIN is 4 digits."); render(); return; } pinSet(sf, npn, false); delete sf.pin; audit("pin", "Set the PIN for " + (sf.name || "an employee")); }
      scheduleSave(true); render();
    }
    return;
  }
  if(tx.dataset && tx.dataset.segreason){
    var rpn = STATE.punches.filter(function(x){ return x.id === tx.dataset.punch; })[0];
    if(rpn){
      var isS = tx.dataset.segreason === "start";
      var rres = editPunchCommit(rpn, { start: rpn.start, stop: rpn.stop, startReason: isS ? tx.value : rpn.startReason, stopReason: isS ? rpn.stopReason : (tx.value || null), opId: rpn.opId, notes: rpn.notes });
      UI.segMsg = rres.ok ? (isS ? "Start" : "Stop") + " reason: " + (tx.value || "none") + "." : rres.msg;
    }
    render(); return;
  }
  if(tx.dataset && tx.dataset.segtime){
    var tp = STATE.punches.filter(function(x){ return x.id === tx.dataset.punch; })[0];
    var hm2 = (tx.value || "").split(":");
    if(tp && hm2.length === 2){
      var base = new Date(tx.dataset.segtime === "s" ? tp.start : tp.stop); base.setHours(+hm2[0], +hm2[1], 0, 0);
      var s1 = new Date(tp.start).getTime(), e1 = tp.stop ? new Date(tp.stop).getTime() : null;
      if(tx.dataset.segtime === "s") s1 = base.getTime(); else e1 = base.getTime();
      pushUndo("adjust punch");
      var trimmed = ((e1 !== null && e1 - s1 >= SEG_MIN) || (e1 === null && s1 <= Date.now() - SEG_MIN)) ? segTrimNeighbours(tp, s1, e1) : [];
      var bd3 = segBounds(tp);
      if(s1 < bd3.lo || (e1 !== null && e1 > bd3.hi) || (e1 !== null && e1 - s1 < SEG_MIN) || (e1 === null && s1 > Date.now() - SEG_MIN)){
        undoDropLast();
        UI.segMsg = "That overlaps a neighbouring punch — allowed "+(isFinite(bd3.lo)?fmtTime(new Date(bd3.lo).toISOString()):"any")+" – "+(isFinite(bd3.hi)?fmtTime(new Date(bd3.hi).toISOString()):"any")+".";
      } else { segApply(tp, s1, e1); UI.segMsg = (tx.dataset.segtime==="s"?"Start":"Stop")+" set to "+fmtTime(tx.dataset.segtime==="s"?tp.start:tp.stop)+"." + (trimmed.length ? " The next-door punch gave up that time." : ""); }
    }
    render(); return;
  }
  if(tx.dataset && tx.dataset.shift){ if(shiftSetTime(tx.dataset.shift, tx.dataset.edge, tx.value)) render(); else render(); return; }
  if(UI.modal && UI.modal.type === "extract-ops"){
    if(tx.id === "ops-x-file"){ opsXRead(tx.files); tx.value = ""; return; }
    var oi = tx.dataset && (tx.dataset.opsx !== undefined ? tx.dataset.opsx : tx.dataset.opst);
    if(oi !== undefined && UI.modal.rows && UI.modal.rows[oi]){
      if(tx.dataset.opsx !== undefined) UI.modal.rows[oi].on = tx.checked; else UI.modal.rows[oi].type = tx.value;
      opsXPaint(); return;
    }
  }
  if(UI.modal && UI.modal.type === "inv-extract"){
    if(tx.id === "inv-x-file"){ invXRead(tx.files); tx.value = ""; return; }
    if(tx.id === "inv-x-askit"){ UI.modal.asKit = tx.checked; invXPaint(); return; }
    if(tx.dataset && tx.dataset.invx !== undefined){ UI.modal.pick = UI.modal.pick || {}; UI.modal.pick[tx.dataset.invx] = tx.checked; invXPaint(); return; }
  }
  if(e.target.id === "tr-file"){ var tfs = Array.prototype.slice.call(e.target.files || []); e.target.value = ""; if(tfs.length) tyExtract("", tfs); return; }
  if(e.target.id === "tr-spot"){ UI.trForm = UI.trForm || {}; UI.trForm["tr-spot"] = e.target.value; return; }
  if(e.target.id === "imp-img"){ importImages(e.target.files); e.target.value = ""; return; }
  if(e.target.id === "imp-pdf"){
    var pf = e.target.files && e.target.files[0];
    if(pf){ importPdfFile = pf; var fl = document.getElementById("imp-file"); if(fl) fl.textContent = pf.name; updateImportButton(); runImport(); }
    return;
  }
  var t = e.target;
  if(t.matches('[data-bind="sp-ro"]')){
    var ro = getRO(t.value);
    var opSel = document.querySelector('[data-bind="sp-op"]');
    if(opSel) opSel.innerHTML = (ro?ro.operations.filter(function(o){return !o.declined;}):[]).map(function(o){return '<option value="'+o.id+'">'+esc(o.complaint)+'</option>';}).join("");
    return;
  }
  if(t.id==="f-mp-ro"){
    var ro2 = getRO(t.value);
    var opSel2 = document.getElementById("f-mp-op");
    if(opSel2) opSel2.innerHTML = (ro2?ro2.operations:[]).map(function(o){return '<option value="'+o.id+'">'+esc(o.complaint)+'</option>';}).join("");
    return;
  }
  if(t.dataset && t.dataset.action==="ro-inline"){
    var v = (t.value||"").trim();
    if(!v){ t.value = getRO(t.dataset.ro).roNumber; pushToast("RO number can't be empty."); return; }
    pushUndo("rename RO"); updateROField(t.dataset.ro, t.dataset.field, v); render(); return;
  }
  if(t.dataset && t.dataset.action==="field-change"){ updateROField(t.dataset.ro, t.dataset.field, t.value); render(); return; }
  
  if(t.dataset && t.dataset.action==="part-status"){ updatePartStatus(t.dataset.ro, t.dataset.op, t.dataset.part, t.value); return; }
  
  if(t.dataset && t.dataset.action==="report-date"){ UI.reportDate = t.value; render(); return; }
  
  
  
  
  if(t.matches('[data-bind="ro-filter"]')){ UI.roFilter = t.value; render(); var f=document.querySelector('[data-bind="ro-filter"]'); if(f){f.focus(); f.selectionStart=f.selectionEnd=f.value.length;} return; }
  
  if(t.id==="f-csv-file"){
    var file = t.files[0]; if(!file) return;
    var reader = new FileReader();
    reader.onload = function(){
      var res = importCSV(String(reader.result));
      var box = document.getElementById("import-result");
      if(box) box.innerHTML = res.imported+" row(s) imported."+(res.rejected.length? '<br>Rejected:<br>'+res.rejected.map(esc).join("<br>") : "");
    };
    reader.readAsText(file);
    return;
  }
});

document.addEventListener("input", function(e){
  var t = e.target;
  if(UI.modal && UI.modal.type === "automations" && t.getAttribute && t.getAttribute("data-am")){ if(t.tagName !== "SELECT") amField(t, false); return; }
  if(t.getAttribute && t.getAttribute("data-newro")){ t.classList.remove("from-import","vin-bad"); if(t.id === "f-opened") t.dataset.touched = "1"; updateNewRoButton(); return; }
  if(t.id === "imp-text"){ updateImportButton(); return; }
  if(t.id === "tr-find"){ tySearch(t.value); return; }
  if(/^tr-(ro|cust|key|vin|unit|miles|cmp)$/.test(t.id)){ UI.trForm = UI.trForm || {}; UI.trForm[t.id] = t.value; return; }
  if(UI.modal && UI.modal.type === "extract-ops" && t.id === "ops-x-text"){ opsXSetText(t.value); return; }
  if(UI.modal && UI.modal.type === "extract-ops" && t.dataset && (t.dataset.opsn !== undefined || t.dataset.opsh !== undefined || t.dataset.opsc !== undefined)){
    var orow = UI.modal.rows && UI.modal.rows[t.dataset.opsn !== undefined ? t.dataset.opsn : t.dataset.opsh !== undefined ? t.dataset.opsh : t.dataset.opsc];
    if(orow){ if(t.dataset.opsn !== undefined) orow.name = t.value; else if(t.dataset.opsc !== undefined) orow.cost = priceOf(t.value); else orow.hours = parseFloat(t.value) || 0; }
    var ogo = document.getElementById("ops-x-go");
    if(ogo){ var on = UI.modal.rows.filter(function(r){ return r.on !== false && String(r.name||"").trim(); }).length; ogo.disabled = !on; ogo.textContent = on ? "Add " + on + " operation" + (on===1?"":"s") : "Add operations"; }
    return;
  }
  if(t.dataset && t.dataset.inv){ invSet(t.dataset.inv, t.dataset.f, t.value); return; }
  if(t.matches && t.matches('[data-bind="labor-rate"]')){ var lrv = parseFloat(String(t.value).replace(/[$,\s]/g, "")); if(lrv > 0){ STATE.laborRate = lrv; scheduleSave(); if(typeof JC !== "undefined" && JC.rerender) JC.rerender(); } return; }
  if(t.dataset && t.dataset.airnote !== undefined){ var anp = STATE.punches.filter(function(x){ return x.id === t.dataset.airnote; })[0]; if(anp){ anp[t.dataset.k] = t.value; scheduleSave(); } return; }
  if(t.dataset && t.dataset.wc){ if(t.type !== "radio") wcSet(t.dataset.wc, t.dataset.f, t.value); return; }
  if(t.dataset && t.dataset.fixd !== undefined){ UI.fixDraft = UI.fixDraft || {}; UI.fixDraft[t.dataset.fixd] = t.value; var fxe = document.getElementById("fx-err"); if(fxe) fxe.textContent = ""; return; }
  if(t.matches && (t.matches('[data-bind="wc-filter"]') || t.matches('[data-bind="fix-filter"]'))){
    var fbw = t.getAttribute("data-bind"); if(fbw === "wc-filter") UI.wcQuery = t.value; else UI.fixQuery = t.value;
    var fpos = t.selectionStart; render();
    var fel = document.querySelector('[data-bind="' + fbw + '"]'); if(fel){ fel.focus(); try{ fel.setSelectionRange(fpos, fpos); }catch(err){} } return; }
  if(t.matches && t.matches('[data-bind="inv-filter"]')){ UI.invFilter = t.value; var ip = t.selectionStart; render();
    var iff = document.querySelector('[data-bind="inv-filter"]'); if(iff){ iff.focus(); try{ iff.setSelectionRange(ip, ip); }catch(err){} } return; }
  if(UI.modal && UI.modal.type === "inv-extract" && t.id && t.id.indexOf("inv-x-") === 0){
    var mx = UI.modal, fk = { "inv-x-text":"text", "inv-x-engine":"engine", "inv-x-year":"year", "inv-x-model":"model", "inv-x-kitname":"kitName" }[t.id];
    if(fk){ mx[fk] = t.value; if(fk === "text"){ mx.pick = {}; } if(fk === "kitName" && t.value.trim()){ mx.asKit = true; var kb = document.getElementById("inv-x-askit"); if(kb) kb.checked = true; } invXPaint(); }
    return;
  }
  if(t.id === "f-casecomp" || t.id === "f-enghours" || t.id === "f-engtype" || t.id === "f-model" || t.id === "f-tech"){ t.classList.remove("from-import"); return; }
  if(t.id === "pal-q"){
    UI.palette = UI.palette || { q:"", sel:0 };
    UI.palette.q = t.value; UI.palette.sel = 0;
    var ppos = t.selectionStart;
    render();
    var pq = document.getElementById("pal-q");
    if(pq){ pq.focus(); try{ pq.setSelectionRange(ppos, ppos); }catch(err){} }
    return;
  }
  if(t.matches('[data-bind="profile-name"]')){
    STATE.techName = t.value; scheduleSave();
    var pbtn = document.querySelector('.profile-btn');
    if(pbtn){
      var initials = profileInitials(t.value);
      pbtn.innerHTML = initials ? esc(initials) : IC.user;
      pbtn.title = t.value.trim() ? t.value.trim() : 'Set your name';
    }
    return;
  }
  if(t.matches('[data-bind="ro-filter"]')){ UI.roFilter = t.value; /* live filter without full-focus loss: re-render but restore focus */
    var pos = t.selectionStart;
    render();
    var f=document.querySelector('[data-bind="ro-filter"]'); if(f){ f.focus(); try{f.setSelectionRange(pos,pos);}catch(err){} }
    return;
  }
  if(t.dataset && t.dataset.action==="op-picker-q"){
    if(UI.modal && UI.modal.type==="op-picker"){
      var pos = t.selectionStart;
      UI.modal.q = t.value; render();
      var f = document.getElementById("op-picker-q");
      if(f){ f.focus(); try{ f.setSelectionRange(pos,pos); }catch(e){} }
    }
    return;
  }
  if(t.dataset && t.dataset.action==="log-input"){ UI.logDraft[t.dataset.op] = t.value; autoGrow(t); return; }
  
  
  
  /* Detail fields commit as you type — no render, so the caret stays put. */
  if(t.dataset && t.dataset.action==="field-change" && t.tagName==="INPUT"){
    updateROField(t.dataset.ro, t.dataset.field, t.value, true); return;
  }
});

/* Extract operations: paste or drop screenshots anywhere in the dialog */
document.addEventListener("paste", function(e){
  if(!UI.modal || UI.modal.type !== "extract-ops") return;
  var imgs = Array.prototype.filter.call((e.clipboardData && e.clipboardData.files) || [], function(f){ return /^image\//.test(f.type || ""); });
  if(imgs.length){ e.preventDefault(); opsXRead(imgs); return; }
  var tx = e.clipboardData && e.clipboardData.getData("text");
  if(tx && !(e.target && /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName))){
    e.preventDefault(); var m = UI.modal;
    opsXSetText((String(m.text||"").trim() ? String(m.text).replace(/\s+$/, "") + "\n" : "") + tx);
  }
});
["dragenter","dragover"].forEach(function(ev){ document.addEventListener(ev, function(e){
  var z = e.target.closest && e.target.closest("#ops-x-drop"); if(!z) return; e.preventDefault(); z.classList.add("drag");
}); });
document.addEventListener("dragleave", function(e){ var z = e.target.closest && e.target.closest("#ops-x-drop"); if(z && !z.contains(e.relatedTarget)) z.classList.remove("drag"); });
document.addEventListener("drop", function(e){
  var z = e.target.closest && e.target.closest("#ops-x-drop"); if(!z) return;
  e.preventDefault(); z.classList.remove("drag");
  var df = (e.dataTransfer && e.dataTransfer.files) || [];
  if(df.length){ opsXRead(df); return; }
  var dt = e.dataTransfer && e.dataTransfer.getData("text"); if(dt) opsXSetText((String(UI.modal.text||"").trim() ? String(UI.modal.text).replace(/\s+$/, "") + "\n" : "") + dt);
});

/* New RO import: pasting the case runs Populate by itself; a PDF can be dropped on the import box */
document.addEventListener("paste", function(e){
  if(e.target && e.target.id === "tr-imp"){   /* the Triage card's extraction box */
    var tfi = Array.prototype.filter.call((e.clipboardData && e.clipboardData.files) || [], function(f){ return /^image\//.test(f.type || ""); });
    if(tfi.length){ e.preventDefault(); tyExtract("", tfi); return; }
    var ttx = e.clipboardData ? e.clipboardData.getData("text") : "";
    if(ttx && ttx.trim()){ e.preventDefault(); tyExtract(ttx.trim()); }
    return;
  }
  if(!UI.modal || UI.modal.type !== "add-ro") return;
  var items = (e.clipboardData && e.clipboardData.files) || [];
  var imgs = Array.prototype.filter.call(items, function(f){ return /^image\//.test(f.type || ""); });
  if(imgs.length){ e.preventDefault(); importImages(imgs); return; }
  if(e.target && e.target.id === "imp-text") setTimeout(function(){ updateImportButton(); saveNewRoDraft(); runImport(); }, 0);
});
["dragenter","dragover"].forEach(function(ev){ document.addEventListener(ev, function(e){
  var box = e.target.closest && e.target.closest("#imp-box"); if(!box) return;
  e.preventDefault(); box.classList.add("drag");
}); });
document.addEventListener("dragleave", function(e){ var box = e.target.closest && e.target.closest("#imp-box"); if(box && !box.contains(e.relatedTarget)) box.classList.remove("drag"); });
document.addEventListener("drop", function(e){
  var box = e.target.closest && e.target.closest("#imp-box"); if(!box) return;
  e.preventDefault(); box.classList.remove("drag");
  var dropped = (e.dataTransfer && e.dataTransfer.files) || [];
  var dimgs = Array.prototype.filter.call(dropped, function(x){ return /^image\//.test(x.type || ""); });
  if(dimgs.length){ importImages(dimgs); return; }
  var f = dropped[0];
  if(f && /pdf/i.test(f.type || f.name)){ importPdfFile = f; var fl = document.getElementById("imp-file"); if(fl) fl.textContent = f.name; updateImportButton(); runImport(); }
  else if(e.dataTransfer && e.dataTransfer.getData("text")){ var ta = document.getElementById("imp-text"); if(ta){ ta.value = e.dataTransfer.getData("text"); updateImportButton(); runImport(); } }
});

document.addEventListener("input", function(e){ if(UI.modal && UI.modal.type === "add-ro" && e.target.closest && e.target.closest(".modal")) saveNewRoDraft(); });
/* statuses picked on the Triage card */
document.addEventListener("change", function(e){
  var t = e.target; if(!t || !t.dataset || !t.dataset.tyst) return;
  var ro = getRO(t.dataset.ro); if(!ro) return;
  if(t.dataset.tyst === "ro"){ var p = t.value.split("|"); setRoStatus(ro.id, p[0], p[1] || null, true); render(); return; }
  var op = (ro.operations || []).filter(function(o){ return o.id === t.dataset.op; })[0]; if(op){ tyOpSet(ro, op, t.value); render(); }
});
document.addEventListener("change", function(e){ if(UI.modal && UI.modal.type === "add-ro" && e.target.closest && e.target.closest(".modal")) saveNewRoDraft(); });

/* Ctrl+Z / Cmd+Z anywhere outside a text field */
document.addEventListener("keydown", function(e){
  var t0 = e.target;
  if(t0 && t0.dataset && t0.dataset.action === "log-input"){
    if(e.key === "Enter" && !e.shiftKey){
      e.preventDefault();
      var op0 = t0.dataset.op;
      addLogEntry(t0.dataset.ro, op0, UI.logKind[op0] || "cause", t0.value);
      UI.logDraft[op0] = "";
      UI.logOpen[op0] = true;
      render();
      focusLogInput(op0);
      return;
    }
    if(e.key === "Tab" && !e.shiftKey){
      e.preventDefault();
      var op1 = t0.dataset.op;
      UI.logKind[op1] = (UI.logKind[op1] === "fix") ? "cause" : "fix";
      UI.logDraft[op1] = t0.value;
      render();
      focusLogInput(op1);
      return;
    }
  }


  /* Enter stores the field you are in. In a dialog it presses the main button (Create RO, Save, Add…). */
  if(e.key === "Enter" && !e.shiftKey && !e.ctrlKey && !e.metaKey && !e.altKey && !e.defaultPrevented && !UI.palette){
    var tIn = (e.composedPath && e.composedPath()[0]) || e.target;
    var tagIn = (tIn.tagName||"").toLowerCase();
    var tyIn = (tIn.type||"").toLowerCase();
    var inShadow = tIn.getRootNode && tIn.getRootNode() !== document;
    if(tIn.id === "imp-text" || tIn.id === "f-casecomp") { /* multi-line boxes: Enter is a new line */ }
    else if(tIn.closest && tIn.closest("#imp-jobs")){ e.preventDefault(); tIn.blur(); return; }
    else if(!inShadow && (tagIn === "input" || tagIn === "select" || tagIn === "textarea") &&
       ["checkbox","radio","button","submit","file","range","color"].indexOf(tyIn) < 0){
      var mdl = tIn.closest(".modal");
      var prim = mdl && mdl.querySelector(".modal-foot .btn-primary");
      if(prim && prim.disabled){
        e.preventDefault();
        if(prim.id === "newro-create"){ var nrE = newRoValues(); var fe = nrE.missingIds.map(function(id){ return document.getElementById(id); }).filter(function(x){ return x && x !== tIn; })[0] || document.getElementById(nrE.missingIds[0]); if(fe) fe.focus(); }
        return;
      }
      if(prim){
        e.preventDefault(); prim.click();
        /* still open with an error (e.g. Customer missing)? put the cursor in the first empty box */
        var err = document.querySelector(".modal #form-error");
        if(err && err.textContent){
          var empty = Array.prototype.filter.call(document.querySelectorAll(".modal .modal-body input, .modal .modal-body textarea"), function(x){ return !x.value && x.type !== "checkbox"; })[0];
          if(empty) empty.focus();
        }
        return;
      }
      if(tagIn !== "textarea"){
        e.preventDefault();
        tIn.dispatchEvent(new Event("change", { bubbles: true }));
        tIn.classList.add("stored"); setTimeout(function(){ tIn.classList.remove("stored"); }, 700);
        tIn.blur();
        return;
      }
    }
  }
  var k = (e.key||"").toLowerCase();
  if((e.ctrlKey||e.metaKey) && k==="z" && !e.shiftKey){
    var zt = (e.composedPath && e.composedPath()[0]) || e.target;
    var tag = ((zt && zt.tagName) || "").toLowerCase();
    if(tag==="input" || tag==="textarea" || tag==="select" || (zt && zt.isContentEditable)) return;
    e.preventDefault(); undoLast();
  }
  /* Ctrl/Cmd+K from anywhere, including from inside a text field. */
  if((e.ctrlKey||e.metaKey) && k==="k"){ e.preventDefault(); if(UI.palette){ UI.palette=null; render(); } else openPalette(); return; }
  if(UI.palette){
    if(k==="escape"){ e.preventDefault(); UI.palette=null; render(); return; }
    if(k==="arrowdown"){ e.preventDefault(); paletteMove(1); return; }
    if(k==="arrowup"){ e.preventDefault(); paletteMove(-1); return; }
    if(k==="enter"){
      e.preventDefault();
      var palHit = paletteResults(UI.palette.q)[UI.palette.sel];
      palettePick(palHit && palHit.ro.id);
      return;
    }
  }
  if(k==="escape" && UI.appMenu){ UI.appMenu=false; render(); }
  if(k==="escape" && UI.notifOpen){ UI.notifOpen=false; render(); }
  if(k==="escape" && (UI.pxPop || UI.pxPeek)){ UI.pxPop=null; UI.pxPeek=false; render(); return; }
  if(k==="escape" && UI.view==="profile" && !UI.modal && !UI.appMenu && !UI.notifOpen){ UI.view = UI.pxPrev && UI.pxPrev !== "profile" && navAllowed(UI.pxPrev) ? UI.pxPrev : navPages()[0][0]; render(); return; }
  if(k==="escape" && UI.modal){ UI.modal=null; render(); }

  /* ---------- shop-floor shortcuts ---------- */
  var tgEl = (e.composedPath && e.composedPath()[0]) || e.target;
  var tg = (tgEl.tagName||"").toLowerCase();
  var typing = tg==="input" || tg==="textarea" || tg==="select" || !!tgEl.isContentEditable || JC.busy();
  if(typing || e.ctrlKey || e.metaKey || e.altKey) return;

  if(k === "?" || (k === "/" && e.shiftKey)){ e.preventDefault(); UI.modal = { type:"shortcuts" }; render(); return; }
  if(UI.modal) return;
  if(k === "n" && !e.defaultPrevented && navAllowed("ros")){ e.preventDefault(); IMPX.open({}); return; }

  if(k === "/"){
    e.preventDefault();
    if(UI.view !== "ros"){ UI.view = "ros"; render(); }
    var f = document.querySelector('[data-bind="ro-filter"]');
    if(f) f.focus(); else setTimeout(function(){ var g=document.querySelector('[data-bind="ro-filter"]'); if(g) g.focus(); });
    return;
  }
  if((k === " " || k === "spacebar") && UI.view === "ros" && JC.clock()){ e.preventDefault(); return; }
  if(k === " " || k === "spacebar"){
    e.preventDefault();
    var rpK = runningPunch();
    if(rpK){ UI.modal = { type:"stop-punch" }; render(); }
    else {
      var roK = UI.view==="ros" && UI.selectedRo ? getRO(UI.selectedRo) : null;
      var opK = roK ? UI.roOp[roK.id] : null;
      UI.modal = { type:"start-punch", roId: roK?roK.id:null, opId: opK };
      render();
    }
    return;
  }

  if(UI.view !== "ros") return;
  var roN = UI.selectedRo ? getRO(UI.selectedRo) : null;

  if(k === "j") k = "arrowright";
  if(k === "k") k = "arrowleft";
  if(k === "p"){ if(JC.quickPart()) e.preventDefault(); return; }
  if(k === "arrowleft" || k === "arrowright"){
    if(!roN || !roN.operations.length) return;
    e.preventDefault();
    var iN = roN.operations.findIndex(function(x){ return x.id === UI.roOp[roN.id]; });
    if(iN < 0) iN = 0;
    var nN = (iN + (k==="arrowright"?1:-1) + roN.operations.length) % roN.operations.length;
    UI.roOp[roN.id] = roN.operations[nN].id;
    UI.roPane[roN.id] = roN.operations[nN].id;
    UI.jcScrollTo = roN.operations[nN].id;             /* opens it (others stay open) and scrolls to it */
    render(); return;
  }
  if(k === "arrowup" || k === "arrowdown"){
    var listN = visibleRos().filter(function(r){ return !roIsDone(r) || UI.roDoneOpen; });
    if(!listN.length) return;
    e.preventDefault();
    var jN = listN.findIndex(function(r){ return r.id === UI.selectedRo; });
    if(jN < 0) jN = 0;
    else jN = (jN + (k==="arrowdown"?1:-1) + listN.length) % listN.length;
    UI.selectedRo = listN[jN].id;
    render(); return;
  }
  if(k >= "1" && k <= "3"){
    if(!roN) return;
    e.preventDefault();
    JC.tab(["parts","punches","files"][Number(k) - 1]); return;
  }
  if(k === "0"){ if(!roN) return; e.preventDefault(); JC.tab(null); return; }
  if(k === "d"){ if(!roN) return; e.preventDefault(); JC.details(); return; }
  if(k === "s"){ if(!roN) return; e.preventDefault(); UI.modal = { type:"ro-status", roId: roN.id }; render(); return; }
});
