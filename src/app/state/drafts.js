/* Parsec · state · drafts.js
   Typed text survives a refresh: every text box's draft is kept (DRAFTS) and put back when the same field appears again, including an open modal.
   Flow: input listeners store by draftKey; draftsRestore runs after a render.
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   draftsPersist draftField draftSig draftKey draftTarget draftsRestore draftsModalClosed draftsReopenModal DRAFT_STORE DRAFTS DRAFT_BASE DRAFT_T … (8 functions, 6 constants)
   at load    2× wraps DRAFTS · on document focusin · on document input · on document keydown · on document click · on window beforeunload
*/
/* ============================== DRAFTS: typed text survives a refresh ==============================
   Whatever you type in a text box is kept in this browser as you type, so a refresh (or
   a crash) never loses it — even in boxes that only save when you press Save or Enter.
   Fields that already save as you type simply match what was saved and the draft goes.
   A restored, not-yet-saved draft shows a thin amber edge until you save or change it.
   Committing a field (Enter, or a button in the same card or dialog) drops its draft;
   closing a dialog drops that dialog's drafts. Drafts older than three days are dropped. */
var DRAFT_STORE = "tec_drafts_v1", DRAFTS = {}, DRAFT_BASE = new WeakMap(), DRAFT_T = null, DRAFT_MODAL = null;
try{ DRAFTS = JSON.parse(localStorage.getItem(DRAFT_STORE) || "{}") || {}; }catch(e){ DRAFTS = {}; }
(function(){ var cut = Date.now() - 3*86400000; Object.keys(DRAFTS).forEach(function(k){ if(!DRAFTS[k] || !(DRAFTS[k].t > cut)) delete DRAFTS[k]; }); })();
function draftsPersist(){
  clearTimeout(DRAFT_T);
  DRAFT_T = setTimeout(function(){ try{ localStorage.setItem(DRAFT_STORE, JSON.stringify(DRAFTS)); }catch(e){} }, 150);
}
var DRAFT_SKIP = { checkbox:1, radio:1, file:1, hidden:1, button:1, submit:1, reset:1, range:1, color:1, password:1 };
function draftField(n){
  if(!n || n.nodeType !== 1) return null;
  if(n.tagName !== "TEXTAREA" && !(n.tagName === "INPUT" && !DRAFT_SKIP[String(n.type || "text").toLowerCase()])) return null;
  if(n.hasAttribute("data-no-draft") || n.readOnly || n.disabled) return null;
  return n;
}
function draftSig(n){ return (typeof n.className === "string" ? n.className.replace(/\bdraft-restored\b/g, "").trim().split(/\s+/).sort().join(".") : "") + "|" + (n.getAttribute("placeholder") || "") + "|" + (n.getAttribute("title") || "").slice(0, 40); }
/* A key that finds the same box again after a refresh: which page / dialog / RO, the
   nearest record it belongs to (punch, job, entry), and its own id or position. */
function draftKey(n){
  var root = n.getRootNode ? n.getRootNode() : document, inJc = !!(root && root.host);
  var modal = !inJc && n.closest(".modal");
  var scope = inJc ? "jc:" + (UI.selectedRo || "") : modal ? "modal:" + ((UI.modal && UI.modal.type) || "") : "app:" + UI.view;
  var anc = n.closest("[data-pid],[data-job],[data-oid],[data-id],[data-key]");
  var ak = anc ? (anc.getAttribute("data-pid") || anc.getAttribute("data-job") || anc.getAttribute("data-oid") || anc.getAttribute("data-id") || anc.getAttribute("data-key")) : "";
  var id = n.id ? "#" + n.id : n.getAttribute("data-bind") ? "b:" + n.getAttribute("data-bind") : n.getAttribute("data-am") ? "am:" + n.getAttribute("data-am") : null;
  if(!id){
    var sig = draftSig(n), pool = (anc || root).querySelectorAll(n.tagName.toLowerCase()), i = 0, at = -1;
    for(var k = 0; k < pool.length; k++){ if(draftSig(pool[k]) === sig){ if(pool[k] === n){ at = i; break; } i++; } }
    id = n.tagName + ":" + sig + ":" + at;
  }
  return scope + "|" + ak + "|" + id;
}
function draftTarget(e){ return draftField((e.composedPath && e.composedPath()[0]) || e.target); }
document.addEventListener("focusin", function(e){ var n = draftTarget(e); if(n && !DRAFT_BASE.has(n)) DRAFT_BASE.set(n, n.value); }, true);
document.addEventListener("input", function(e){
  var n = draftTarget(e); if(!n) return;
  n.classList.remove("draft-restored"); if(n.title === "Restored after a refresh — not saved yet") n.removeAttribute("title");
  var base = DRAFT_BASE.has(n) ? DRAFT_BASE.get(n) : n.defaultValue, key = draftKey(n);
  if(n.value === base) delete DRAFTS[key];
  else DRAFTS[key] = { v: n.value, b: base, t: Date.now() };
  draftsPersist();
}, true);
/* committing: Enter in a field, or a button next to it */
document.addEventListener("keydown", function(e){
  if(e.key !== "Enter" || e.shiftKey) return;
  var n = draftTarget(e); if(!n) return;
  var k = draftKey(n); if(DRAFTS[k]){ delete DRAFTS[k]; draftsPersist(); }
  DRAFT_BASE.set(n, n.value);
}, true);
document.addEventListener("click", function(e){
  var p = (e.composedPath && e.composedPath()) || [e.target], btn = null;
  for(var i = 0; i < p.length; i++){ if(p[i].nodeType === 1 && (p[i].tagName === "BUTTON" || (p[i].getAttribute && p[i].getAttribute("role") === "button"))){ btn = p[i]; break; } }
  if(!btn || draftField(p[0])) return;
  var box = btn.closest(".modal, .jpn-add, [data-pid], .jev, .jquick, [data-job], .card, .pg-head, .ro-note, .profile");
  if(!box) return;
  var fields = Array.prototype.filter.call(box.querySelectorAll("input, textarea"), draftField), any = false;
  fields.forEach(function(n){ var k = draftKey(n); if(DRAFTS[k]){ delete DRAFTS[k]; any = true; } });
  if(any) draftsPersist();
  /* anything still typed in there after the click settles was not committed — keep it */
  setTimeout(function(){
    fields.forEach(function(n){
      if(!n.isConnected) return;
      var base = DRAFT_BASE.has(n) ? DRAFT_BASE.get(n) : n.defaultValue;
      if(n.value !== base && String(n.value).trim()) { DRAFTS[draftKey(n)] = { v: n.value, b: base, t: Date.now() }; draftsPersist(); }
    });
  }, 120);
}, true);
/* After every redraw: put unsaved drafts back into their boxes. A draft whose box now
   shows exactly what was typed has been saved; one whose box changed underneath it
   (edited elsewhere) is stale. Both are dropped. */
function draftsRestore(){
  var keys = Object.keys(DRAFTS); if(!keys.length) return;
  var roots = [document];
  document.querySelectorAll(".jc-host").forEach(function(h){ if(h.shadowRoot) roots.push(h.shadowRoot); });
  var changed = false;
  roots.forEach(function(r){
    Array.prototype.forEach.call(r.querySelectorAll("input, textarea"), function(n){
      if(!draftField(n)) return;
      var k = draftKey(n), d = DRAFTS[k]; if(!d) return;
      if(n.value === d.v){ if(!n.classList.contains("draft-restored")){ delete DRAFTS[k]; changed = true; } return; }
      if(n.value === d.b){
        n.value = d.v; DRAFT_BASE.set(n, d.b);
        n.classList.add("draft-restored"); if(!n.title) n.title = "Restored after a refresh — not saved yet";
        if(n.tagName === "TEXTAREA"){ try{ n.style.height = "auto"; n.style.height = n.scrollHeight + "px"; }catch(e){} }
      } else { delete DRAFTS[k]; changed = true; }
    });
  });
  if(changed) draftsPersist();
}
function draftsModalClosed(type){
  var pre = "modal:" + type + "|", any = false;
  Object.keys(DRAFTS).forEach(function(k){ if(k.indexOf(pre) === 0){ delete DRAFTS[k]; any = true; } });
  if(any) draftsPersist();
}
/* an open dialog is reopened after a refresh, so its drafts have somewhere to go */
window.addEventListener("beforeunload", function(){
  try{
    if(UI.modal && ["inv-extract","extract-ops","long-clock","pin","release-check","eod"].indexOf(UI.modal.type) < 0) sessionStorage.setItem("tec_modal", JSON.stringify(UI.modal));
    else sessionStorage.removeItem("tec_modal");
  }catch(e){}
  try{ localStorage.setItem(DRAFT_STORE, JSON.stringify(DRAFTS)); }catch(e){}
});
function draftsReopenModal(){
  var raw = null; try{ raw = sessionStorage.getItem("tec_modal"); sessionStorage.removeItem("tec_modal"); }catch(e){}
  if(!raw || UI.modal) return false;
  try{ var m = JSON.parse(raw); if(m && m.type){ UI.modal = m; return true; } }catch(e){}
  return false;
}
