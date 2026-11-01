/* Parsec · library · viewer.js
   A document open in a panel beside the page (libOpen): its facts, the PDF itself, Open in a tab.
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   libClose libOpen libWaDocs libSaveClaim LIB_VIEW (4 functions, 1 constant)
   uses       kit/ pages/warranty/ ro/ state/
   at load    on document click
*/
/* ============================== a document, open beside the page (Parsec 17.1) ==============================
   libOpen(d): a panel on the right with the document itself (the browser's own PDF view), its facts on top, and
   Open in a new tab. The RO (or the Library) stays open beside it; Esc or ✕ closes it. */
var LIB_VIEW = { el: null, url: null, key: null, id: null };
function libClose(){
  if(LIB_VIEW.el){ LIB_VIEW.el.remove(); LIB_VIEW.el = null; }
  if(LIB_VIEW.url){ try{ URL.revokeObjectURL(LIB_VIEW.url); }catch(e){} LIB_VIEW.url = null; }
  if(LIB_VIEW.key){ document.removeEventListener("keydown", LIB_VIEW.key, true); LIB_VIEW.key = null; }
  LIB_VIEW.id = null;
}
function libOpen(d, page){
  if(typeof d === "string") d = libDocById(d);
  if(!d) return;
  if(LIB_VIEW.id === d.id){ libClose(); return; }   /* the same chip again closes it */
  libClose();
  var k = libKind(d.kind) || {}, w = document.createElement("aside");
  w.className = "lib-view"; w.setAttribute("aria-label", libDocChipText(d));
  var facts = [d.date, d.fgrp ? "Fgrp " + d.fgrp + (libFgName(d.fgrp) ? " · " + libFgName(d.fgrp).replace(/^\d+ /, "") : "") : "", d.model, (d.codes || []).length ? d.codes.length + (d.codes.length === 1 ? " code" : " codes") : ""].filter(Boolean);
  w.innerHTML = '<header class="lib-view-h"><span class="lib-chip k-' + libE(d.kind) + '"><i></i>' + libE(k.one || "Document") + '</span>'
    + '<div class="lib-view-t"><b class="mono">' + libE(libDocLabel(d)) + '</b><span>' + libE(d.title || "") + '</span></div>'
    + '<button type="button" class="lib-view-b" data-lv="tab" title="Open it in a new browser tab">Open in a tab</button>'
    + '<button type="button" class="lib-view-x" data-lv="x" aria-label="Close" title="Close (Esc)"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg></button></header>'
    + (facts.length ? '<div class="lib-view-f">' + facts.map(libE).join('<i>·</i>') + '</div>' : '')
    + '<div class="lib-view-b2"><div class="lib-view-none">Opening…</div></div>';
  document.body.appendChild(w); LIB_VIEW.el = w; LIB_VIEW.id = d.id;
  w.addEventListener("click", function(e){
    var b = e.target.closest && e.target.closest("[data-lv]"); if(!b) return;
    if(b.getAttribute("data-lv") === "x") libClose();
    else if(LIB_VIEW.url){ var a = document.createElement("a"); a.href = LIB_VIEW.url; a.target = "_blank"; a.rel = "noopener"; document.body.appendChild(a); a.click(); a.remove(); }
  });
  LIB_VIEW.key = function(e){ if(e.key === "Escape" && LIB_VIEW.el && !document.querySelector(".roreo")){ e.preventDefault(); e.stopPropagation(); libClose(); } };
  document.addEventListener("keydown", LIB_VIEW.key, true);
  libBlob(d).then(function(b){
    if(LIB_VIEW.id !== d.id) return;
    var box = w.querySelector(".lib-view-b2");
    if(!b){ box.innerHTML = '<div class="lib-view-none">The file isn’t here — it was saved on another computer, or moved out of <span class="mono">Parsec Data/Library</span>.</div>'; return; }
    LIB_VIEW.url = URL.createObjectURL(b.type ? b : new Blob([b], { type: "application/pdf" }));
    if(/pdf/i.test(b.type || "application/pdf")) box.innerHTML = '<iframe class="lib-view-pdf" title="' + libE(libDocLabel(d)) + '" src="' + LIB_VIEW.url + (page ? "#page=" + (+page) : "") + '"></iframe>';
    else if(/^image\//.test(b.type)) box.innerHTML = '<img class="lib-view-img" alt="' + libE(libDocLabel(d)) + '" src="' + LIB_VIEW.url + '">';
    else box.innerHTML = '<div class="lib-view-none">This file opens in its own program — use Open in a tab.</div>';
  });
}

/* ---------- on Warranty: the documents per operation, and the claim folder ---------- */
function libWaDocs(ro, op){
  var D = libOpDocs(op), all = 0; wcOps(ro).forEach(function(o){ all += libOpDocs(o).length; });
  if(!D.length && !all) return "";
  return '<div class="wa-lib"><span class="wa-k">Documents</span><div class="wa-lib-r">'
    + (D.length ? D.map(function(d){ return '<button class="lib-chip k-' + esc(d.kind) + '" type="button" data-lib-open="' + esc(d.id) + '" title="Open ' + esc(libDocChipText(d)) + (d.title ? ' — ' + esc(d.title) : '') + '"><i></i>' + esc(libDocChipText(d)) + '</button>'; }).join("")
      : '<span class="wa-lib-none">None on this operation</span>')
    + (all ? '<button class="btn btn-sm tg-gh wa-lib-save" type="button" data-lib-claim="' + esc(ro.id) + '" title="Save every document on this claim into one folder">Save the claim folder · ' + all + (all === 1 ? ' file' : ' files') + '</button>' : '')
    + '</div></div>';
}
/* every document on the RO's claim operations, into a folder the person picks (named after the RO) */
function libSaveClaim(ro){
  var D = [], seen = {}; wcOps(ro).forEach(function(o){ libOpDocs(o).forEach(function(d){ if(!seen[d.id]){ seen[d.id] = 1; D.push(d); } }); });
  if(!D.length) return;
  var name = pdSafe((ro.roNumber || "RO") + " claim documents", 80);
  if(typeof window.showDirectoryPicker !== "function"){
    D.reduce(function(p, d){ return p.then(function(){ return libBlob(d).then(function(b){ if(!b) return; var a = document.createElement("a"); a.href = URL.createObjectURL(b); a.download = (d.file && d.file.name) || libFileName(d); document.body.appendChild(a); a.click(); a.remove(); }); }); }, Promise.resolve())
      .then(function(){ pushToast(D.length + (D.length === 1 ? " document" : " documents") + " downloaded."); });
    return;
  }
  var dir, n = 0, miss = 0;
  window.showDirectoryPicker({ mode: "readwrite" }).then(function(root){ return root.getDirectoryHandle(name, { create: true }); })
    .then(function(h){ dir = h; return D.reduce(function(p, d){ return p.then(function(){ return libBlob(d).then(function(b){
      if(!b){ miss++; return; }
      return dir.getFileHandle((d.file && d.file.name) || libFileName(d), { create: true }).then(function(fh){ return fh.createWritable(); }).then(function(w){ return w.write(b).then(function(){ return w.close(); }); }).then(function(){ n++; });
    }); }); }, Promise.resolve()); })
    .then(function(){ pushToast(n + (n === 1 ? " document" : " documents") + " saved in “" + name + "”" + (miss ? " · " + miss + " not found on this computer" : "") + "."); },
      function(e){ if(e && e.name === "AbortError") return; pushToast("Couldn’t save the claim folder — pick a folder you can write to."); });
}
/* chips outside the RO page: data-lib-open opens a document, data-lib-claim saves a claim folder */
document.addEventListener("click", function(e){
  var t = e.target.closest && e.target.closest("[data-lib-open],[data-lib-claim]"); if(!t) return;
  e.preventDefault(); e.stopPropagation();
  if(t.hasAttribute("data-lib-open")) libOpen(t.getAttribute("data-lib-open"));
  else { var ro = getRO(t.getAttribute("data-lib-claim")); if(ro) libSaveClaim(ro); }
});
