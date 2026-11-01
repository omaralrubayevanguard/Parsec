/* Parsec · library · viewer.js
   A document open in a panel beside the page (libOpen): its facts, the PDF, Open in a tab; a procedure’s steps ticked from its operation; on Warranty, the documents per operation and the claim folder.
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   libClose libOpen libWaDocs libSaveClaim libProcDone libProcView LIB_VIEW (6 functions, 1 constant)
   uses       data/ kit/ pages/warranty/ ro/ ro-page/ shell/ state/
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
function libOpen(d, page, ctx){
  if(typeof d === "string") d = libDocById(d);
  if(!d) return;
  if(LIB_VIEW.id === d.id){ libClose(); return; }   /* the same chip again closes it */
  libClose();
  var k = libKind(d.kind) || {}, w = document.createElement("aside");
  w.className = "lib-view"; w.setAttribute("aria-label", libDocChipText(d));
  var facts = [d.date, d.fgrp ? "Fgrp " + d.fgrp + (libFgName(d.fgrp) ? " · " + libFgName(d.fgrp).replace(/^\d+ /, "") : "") : "", d.model, (d.codes || []).length ? d.codes.length + (d.codes.length === 1 ? " code" : " codes") : ""].filter(Boolean);
  if(d.kind === "proc" && d.proc){ libProcView(w, d, ctx); return; }
  w.innerHTML = '<header class="lib-view-h"><span class="lib-chip k-' + libE(d.kind) + '"><i></i>' + libE(k.one || "Document") + '</span>'
    + '<div class="lib-view-t"><b class="mono">' + libE(libDocLabel(d)) + '</b><span>' + libE(d.title || "") + '</span></div>'
    + '<button type="button" class="lib-view-b" data-lv="tab" title="Open it in a new browser tab">Open in a tab</button>'
    + '<button type="button" class="lib-view-x" data-lv="x" aria-label="Close" title="Close (Esc)"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg></button></header>'
    + (facts.length ? '<div class="lib-view-f">' + facts.map(libE).join('<i>·</i>') + '</div>' : '')
    + '<div class="lib-view-b2"><div class="lib-view-none">Opening…</div></div>';
  document.body.appendChild(w); LIB_VIEW.el = w; LIB_VIEW.id = d.id;
  try{ pxwAfter(); }catch(e){}   /* 17.1: its width, and the edge to drag */
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

/* ---------- an Impact procedure, beside the page: the steps in Parsec, the PDF one tap away ---------- */
/* ctx = { ro, op } when it was opened from an operation: then each step can be ticked, and op.procDone[doc id] keeps
   the steps done (the operation's row shows how many). From the Library it reads only. */
function libProcDone(op, d){ return op && op.procDone && Array.isArray(op.procDone[d.id]) ? op.procDone[d.id] : []; }
function libProcView(w, d, ctx){
  var P = d.proc, op = ctx && ctx.op, mode = "steps";
  var facts = [d.num, d.fgrp ? "Fgrp " + d.fgrp : "", d.model, d.years, d.info].filter(Boolean);
  var tq = function(t){ return '<span class="lib-tq"><b class="mono">' + libE(t.lbf) + ' lbf·ft</b><span class="mono">' + libE(t.nm) + ' Nm</span>' + (t.what ? '<small>' + libE(t.what) + '</small>' : '') + '</span>'; };
  var warn = function(b){ return '<div class="lib-pw lv-' + libE(String(b.lv).toLowerCase()) + '"><b>' + libE(b.lv) + ' · ' + libE(b.t[0] || "") + '</b>' + b.t.slice(1).map(function(x){ return '<span>' + libE(x) + '</span>'; }).join("") + '</div>'; };
  var draw = function(){
    var done = libProcDone(op, d), on = {}; done.forEach(function(n){ on[n] = 1; });
    var top = '<div class="lib-pchips">' + P.warn.map(function(b){ return '<span class="lib-pc w lv-' + libE(String(b.lv).toLowerCase()) + '">⚠ ' + libE([b.t[1], b.t[0], b.lv].filter(function(x){ return x && x.length <= 40; })[0] || b.lv) + '</span>';   /* the short line: "Heavy component." */ }).join("")
      + P.tools.map(function(t){ return '<span class="lib-pc t mono" title="Special tool">' + libE(t) + '</span>'; }).join("") + '</div>'
      + (P.warn.length ? '<div class="lib-pws">' + P.warn.map(warn).join("") + '</div>' : '')
      + (P.material.length ? '<div class="lib-pmat"><b>Required material</b>' + P.material.map(function(m){ return '<span>' + libE(m[0]) + ' <span class="mono">' + libE(m[1]) + '</span></span>'; }).join("") + '</div>' : '')
      + (P.notes.length ? '<div class="lib-pnote">' + P.notes.map(libE).join("<br>") + '</div>' : '');
    var steps = P.steps.map(function(s){
      return '<div class="lib-ps' + (on[s.n] ? ' ok' : '') + '">' + (op ? '<button type="button" class="lib-pk" data-step="' + s.n + '" role="checkbox" aria-checked="' + !!on[s.n] + '" aria-label="Step ' + s.n + ' done"></button>' : '<span class="lib-pk ro"></span>')
        + '<span class="lib-pn mono">' + s.n + '</span><div class="lib-pt"><span>' + libE(s.t) + '</span>'
        + (s.tq || []).map(tq).join("") + (s.notes || []).map(function(x){ return '<small>' + libE(x) + '</small>'; }).join("") + (s.warn || []).map(warn).join("") + '</div></div>';
    }).join("");
    var nDone = done.length, N = P.steps.length;
    w.innerHTML = '<header class="lib-view-h"><span class="lib-chip k-proc"><i></i>Procedure</span><div class="lib-view-t"><b>' + libE(d.title || d.num) + '</b><span>' + facts.map(libE).join(" · ") + '</span></div>'
      + '<span class="lib-seg"><button type="button" data-lv="steps" class="' + (mode === "steps" ? "on" : "") + '">Steps</button><button type="button" data-lv="pdf" class="' + (mode === "pdf" ? "on" : "") + '">PDF</button></span>'
      + '<button type="button" class="lib-view-x" data-lv="x" aria-label="Close" title="Close (Esc)"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg></button></header>'
      + '<div class="lib-view-f">' + (op ? '<span class="lib-pbar"><i style="width:' + (N ? nDone / N * 100 : 0).toFixed(1) + '%"></i></span><b>' + nDone + ' of ' + N + ' done</b><i>·</i>OP ' + ((ctx.ro.operations || []).indexOf(op) + 1) : N + ' steps · open it from an operation to tick them') + '</div>'
      + '<div class="lib-view-b2">' + (mode === "steps" ? '<div class="lib-proc">' + top + '<div class="lib-psteps">' + steps + '</div></div>' : '<div class="lib-view-none">Opening…</div>') + '</div>';
    if(mode === "pdf") libBlob(d).then(function(b){ var box = w.querySelector(".lib-view-b2"); if(!box || mode !== "pdf") return;
      if(!b){ box.innerHTML = '<div class="lib-view-none">The PDF isn’t on this computer.</div>'; return; }
      if(LIB_VIEW.url){ try{ URL.revokeObjectURL(LIB_VIEW.url); }catch(e){} } LIB_VIEW.url = URL.createObjectURL(b);
      box.innerHTML = '<iframe class="lib-view-pdf" title="' + libE(d.title || d.num) + '" src="' + LIB_VIEW.url + '"></iframe>'; });
  };
  w.className = "lib-view lib-view-proc"; w.setAttribute("aria-label", d.title || d.num);
  document.body.appendChild(w); LIB_VIEW.el = w; LIB_VIEW.id = d.id;
  w.addEventListener("click", function(e){
    var b = e.target.closest && e.target.closest("[data-lv],[data-step]"); if(!b) return;
    if(b.hasAttribute("data-step")){
      if(!op) return;
      var n = +b.getAttribute("data-step"), L = libProcDone(op, d).slice(), i = L.indexOf(n);
      if(i < 0) L.push(n); else L.splice(i, 1);
      op.procDone = op.procDone || {}; op.procDone[d.id] = L.sort(function(a, z){ return a - z; });
      var sc = w.querySelector(".lib-view-b2").scrollTop; scheduleSave(true); draw(); w.querySelector(".lib-view-b2").scrollTop = sc;
      try{ if(typeof JC !== "undefined" && JC.rerender) JC.rerender(); }catch(er){}
      return;
    }
    var k = b.getAttribute("data-lv");
    if(k === "x") libClose(); else if(k === "steps" || k === "pdf"){ mode = k; draw(); }
  });
  LIB_VIEW.key = function(e){ if(e.key === "Escape" && LIB_VIEW.el && !document.querySelector(".roreo")){ e.preventDefault(); e.stopPropagation(); libClose(); } };
  document.addEventListener("keydown", LIB_VIEW.key, true);
  draw();
}
