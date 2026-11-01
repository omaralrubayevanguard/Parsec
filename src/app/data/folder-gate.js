/* Parsec · data · folder-gate.js
   The shop folder comes first: before sign-in, Parsec asks for the folder (fsGateHtml) and says in words what went wrong (fsWhy). FS_LOCAL lets the tests and a quick look run without one.
   Flow: boot/init.js calls restoreFolder(); until FS_READY the gate renders instead of the app.
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   fsGateOn fsFramed fsWhy fsCanWrite fsWhyWrite fsSay fsGateHtml fsRenderGate FS_READY FS_LOCAL FS_ERR (8 functions, 3 constants)
   uses       kit/ ro/ shell/ state/
*/
/* ---------- the shop folder comes first: Parsec reads the shop from it and saves every change there ---------- */
var FS_READY = false, FS_LOCAL = false, FS_ERR = null;
function fsGateOn(){
  /* a phone that started "on this phone" once goes straight in after that */
  if(!FS_LOCAL && document.documentElement.getAttribute("data-device") === "phone"){ try{ if(localStorage.getItem("pm_local") === "1") FS_LOCAL = true; }catch(e){} }
  return !FS_LOCAL && !(typeof FS !== "undefined" && FS.status === "connected" && FS.dir); }
/* Parsec shown inside another page — the Claude app's file preview, an email or chat preview — can't reach folders:
   the browser only lets a page that's open on its own (in Chrome or Edge, from the file) pick one */
function fsFramed(){ try{ return window.self !== window.top; }catch(e){ return true; } }
/* what went wrong with the folder, in words: a heading, what to do, and the browser's own words underneath */
function fsWhy(e, dirName){
  var n = (e && e.name) || "Error", m = (e && e.message) || "", nm = dirName ? "“" + dirName + "”" : "that folder", r;
  if(n === "AbortError") r = { k: "abort", t: "No folder picked yet.", d: "Make a folder on the Desktop (like “Parsec Shop”) and pick that — the Desktop, Documents and Downloads themselves can’t be picked. When the browser asks, choose “Edit files”." };
  else if(n === "SecurityError" || fsFramed()) r = { k: "frame", t: "Folders can’t be opened from a preview.", d: "Open the Parsec file itself in Chrome or Edge — double-click it, or right-click › Open with › Chrome — then pick the folder." };
  else if(n === "NotAllowedError") r = { k: "na", t: "The browser didn’t allow it.", d: "Click the button again. If it keeps saying this, the browser’s settings block file editing for pages opened from the computer — see Settings › Privacy and security › Site settings › File editing." };
  else if(n === "NotFoundError" || n === "InvalidStateError") r = { k: "gone", t: nm.charAt(0).toUpperCase() + nm.slice(1) + " can’t be found anymore.", d: "It was moved, renamed or deleted. Pick it where it is now." };
  else if(n === "NoModificationAllowedError" || n === "InvalidModificationError") r = { k: "ro", t: "Parsec can’t save in " + nm + ".", d: "The folder is read-only, or a file in it is open somewhere else (another program, a sync that’s stuck). Pick a folder you can save to." };
  else if(n === "TypeError" && !window.showDirectoryPicker) r = { k: "sup", t: "This browser can’t open folders.", d: "Open Parsec in Chrome or Edge." };
  else r = { k: "other", t: "Couldn’t open " + nm + ".", d: "Try again, or pick a different folder." };
  r.det = n + (m ? " — " + m : "");
  return r;
}
/* a quick save into the folder before Parsec trusts it: a read-only folder, or one the browser lets Parsec read but not change, shows up here */
function fsCanWrite(dir){
  return dir.getDirectoryHandle("Parsec Data", { create: true }).then(function(d){
    return d.getFileHandle(".parsec-check", { create: true })
      .then(function(f){ return f.createWritable(); })
      .then(function(w){ return w.write("ok").then(function(){ return w.close(); }); })
      .then(function(){ return d.removeEntry(".parsec-check").catch(function(){}); }); });
}
function fsWhyWrite(e, dirName){ var r = fsWhy(e, dirName); if(r.k === "other" || r.k === "abort") { var x = fsWhy({ name: "NoModificationAllowedError" }, dirName); x.det = r.det; r = x; } return r; }
/* say it where it shows: on the folder screen, or as a toast inside Parsec */
function fsSay(){ if(!fsGateOn() && FS_ERR && FS_ERR.k !== "abort") pushToast(FS_ERR.t + " " + FS_ERR.d); render(); }
function fsGateHtml(){
  var sup = typeof window.showDirectoryPicker === "function", nm = FS.dirName ? esc(FS.dirName) : "", fr = fsFramed();
  var h = '<div class="px pxs" data-key="px-fs"><div class="pxs-in pxs-fs"><span class="lg">' + PX_LOGO + '</span>';
  var err = FS_ERR && !(fr && FS_ERR.k === "frame") ? '<div class="pxs-err' + (FS_ERR.k === "abort" ? ' soft' : '') + '"><b>' + esc(FS_ERR.t) + '</b><span>' + esc(FS_ERR.d) + '</span>' + (FS_ERR.k !== "abort" ? '<small>' + esc(FS_ERR.det) + '</small>' : '') + '</div>' : '';
  var ph = document.documentElement.getAttribute("data-device") === "phone";
  if(ph && !fr){ h += '<h2>Parsec on this phone</h2><p>A phone can’t open the shop folder, so this phone keeps its own copy, in this browser. When the shop has one web address with its own database, phones and computers will share the same data.</p>' + err
      + '<div class="pxs-fsb"><button class="px-btn pri" data-action="fs-local">Start on this phone</button></div>' + (sup ? '<button class="pxs-adm" data-action="fs-pick">Pick a folder anyway</button>' : '') + '</div></div>';
    return h; }
  if(fr) h += '<h2>Open Parsec in Chrome or Edge to use the shop folder</h2><p>This copy is showing inside a preview, and a preview can’t reach folders on the computer. Save the file (the Parsec folder on the Desktop is fine), then double-click it — or right-click › Open with › Chrome or Edge — and pick the folder there.</p><div class="pxs-fsb"><button class="px-btn pri" data-action="fs-local">Look around without a folder</button></div><p class="pxs-fsn">Nothing in this preview is saved to a folder.</p>';
  else if(!sup) h += '<h2>This browser can’t open the shop folder</h2><p>Open Parsec in Chrome or Edge on this computer — the shop’s data lives in a folder only they can reach.</p>';
  else if(!FS_READY) h += '<h2>Opening the shop folder…</h2>';
  else if(FS.status === "needs-permission" && FS.dir) h += '<h2>Open the shop folder</h2><p>Parsec keeps the shop in “' + nm + '”. The browser asks once each time Parsec opens.</p>' + err + '<div class="pxs-fsb"><button class="px-btn pri" data-action="fs-reconnect">Open “' + nm + '”</button><button class="px-btn" data-action="fs-pick">Pick a different folder</button></div>';
  else h += '<h2>Where does the shop keep Parsec?</h2><p>Pick a folder — on the Desktop or anywhere else. Parsec keeps the shop’s data, the logs and every attachment in it, and saves each change there. You pick it once on each computer.</p>' + err + '<div class="pxs-fsb"><button class="px-btn pri" data-action="fs-pick">Pick the folder</button></div>' + (FS_ERR ? '' : '<p class="pxs-fsn">Tip: in the picker, make a new folder on the Desktop (like “Parsec Shop”) and pick it — the Desktop itself can’t be picked. Then choose “Edit files”.</p>');
  if(!fr && (FS_READY || !sup)) h += '<button class="pxs-adm" data-action="fs-local">Just this computer for now</button><p class="pxs-fsn">Nothing is shared until the folder is picked — Parsec asks again next time it opens.</p>';
  return h + '</div></div>';
}
function fsRenderGate(){
  var html = fsGateHtml();
  if(UI.toast) html += '<div class="toast-wrap" role="status"><div class="toast">' + esc(UI.toast) + '</div></div>';
  document.documentElement.classList.add("px-out");
  patchApp(html);
}
