/* Parsec · import/new-ro · open.js
   Open and close the dialog, its input and key handling, the drag-and-drop of screenshots.
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   soft onInput close tryClose bind idleTarget open (7 functions)
   uses       access/ import/ kit/ pages/triage/ ro/ state/
   at load    on document dragover · on document drop · 2× on document paste · on document keydown
*/
  /* ---------------------------------------------------------------- open, close, events */
  function soft(){
    var w = document.getElementById("imp-dlg"); if(!w || !D) return;
    var Pl = plan(), C = counts(Pl), s = w.querySelector(".ix-sum"), b = w.querySelector('[data-ix="apply"]');
    var chips = [["new", C.new, "new"], ["upd", C.upd, "updated"], ["kept", C.kept, "kept yours"], ["edit", C.edit, "typed"], ["same", C.same, "same"]].filter(function(x){ return x[1]; }).map(function(x){ return '<span class="' + x[0] + '"><b>' + x[1] + '</b>' + x[2] + '</span>'; }).join("");
    if(s) s.innerHTML = chips;
    if(b && D.target === "ro" && !D.ask){ b.textContent = D.new ? "Create RO" + (Pl.rows[1].fin ? " " + roShortNo(Pl.rows[1].fin) : "") : (C.changes || Pl.people.length ? "Apply " + C.changes + " change" + (C.changes === 1 ? "" : "s") : "Nothing to change"); b.disabled = !D.new && !C.changes && !Pl.people.length; }
    Pl.rows.forEach(function(r){ var inp = w.querySelector('[data-ixf="' + r.k + '"]'), row = inp && inp.closest(".ix-fr"); if(!row) return; row.className = "ix-fr " + (r.bd || "none"); var old = row.lastElementChild; if(old && old !== inp.parentNode){ var t = document.createElement("span"); t.innerHTML = bd(r.bd === "same0" ? "" : r.bd); row.replaceChild(t.firstChild || document.createElement("span"), old); } });
  }
  function onInput(t){
    var k = t.getAttribute("data-ixf"), s = SPEC.filter(function(x){ return x[0] === k; })[0]; if(!s || !D) return;
    var v = t.value; if((s[4] || {}).dt){ var d = v ? new Date(v) : null; v = d && !isNaN(d) ? d.toISOString() : ""; }
    D.edits[k] = v; D.err = ""; soft();
  }
  function close(){ var w = document.getElementById("imp-dlg"); if(w) w.remove(); document.documentElement.classList.remove("ix-open"); var b = D && D.back; D = null; try{ if(b && b.isConnected) b.focus({ preventScroll: true }); }catch(e){} }
  /* 17.3: closing with something read asks first, in the footer */
  function tryClose(){ if(D && (D.pieces.length || Object.keys(D.edits).length) && !D.ask){ D.ask = true; draw(); var b = document.querySelector('#imp-dlg [data-ix="askno"]'); if(b) b.focus(); return; } close(); }
  function bind(w){
    /* point at a file: the Found line says what it gave */
    w.addEventListener("mouseover", function(e){ var pc = e.target.closest && e.target.closest("[data-pc]"), fd = w.querySelector("[data-fd]"); if(!fd) return;
      if(pc){ var p = D.pieces[+pc.getAttribute("data-pc")]; if(p && !fd.getAttribute("data-was")){ fd.setAttribute("data-was", fd.innerHTML); fd.innerHTML = '<b>' + esc(p.name) + '</b> gave ' + esc(p.what); } }
      else if(fd.getAttribute("data-was")){ fd.innerHTML = fd.getAttribute("data-was"); fd.removeAttribute("data-was"); } });
    w.addEventListener("click", function(e){
      var t = e.target.closest && e.target.closest("[data-ix]"); if(!t || !w.contains(t)) return;
      var a = t.getAttribute("data-ix");
      if(a !== "target" && a !== "tgt" && D.menu){ D.menu = false; if(a !== "close") draw(); }
      if(a === "close") tryClose();
      else if(a === "askno"){ D.ask = false; draw(); }
      else if(a === "askyes") close();
      else if(a === "target"){ D.menu = !D.menu; draw(); var m0 = w.querySelector(".ix-menu button"); if(m0) m0.focus(); }
      else if(a === "tgt"){ var v = t.getAttribute("data-v"); D.menu = false;
        if(v === "inv" || v === "lib") D.target = v;
        else if(v === "new"){ D.target = "ro"; D.forceNew = true; D.fixed = false; D.ro = null; D.new = true; }
        else if(v.indexOf("ro:") === 0){ var r0 = getRO(v.slice(3)); if(r0){ D.target = "ro"; D.ro = r0; D.new = false; D.fixed = true; D.forceNew = false; D.foundBy = ""; } }
        rebuild(); }
      else if(a === "jump"){ var to = w.querySelector("#" + t.getAttribute("data-to")), fs = w.querySelector(".ix-fs"); if(to && fs) fs.scrollTo({ top: to.offsetTop - 6, behavior: "smooth" }); }
      else if(a === "check"){ D.checking = 0; draw(); var ci = w.querySelector("#ix-ck-in, .ix-chkv .ix-btn.pri"); if(ci) ci.focus(); }
      else if(a === "chkback"){ D.checking = null; draw(); }
      else if(a === "chknext"){ D.checking = (D.checking || 0) + 1; var Lx = lyChecks(plan()); if(D.checking >= Lx.length) D.checking = 0; draw(); }
      else if(a === "chkok"){ (D.okd = D.okd || {})[t.getAttribute("data-id")] = 1; draw(); }
      else if(a === "manual"){ D.manual = true; draw(); var rq = w.querySelector('[data-ixf="roNumber"]'); if(rq) rq.focus(); }
      else if(a === "allf"){ D.allf = !D.allf; draw(); }
      else if(a === "only"){ D.only = t.getAttribute("data-v") === "1"; draw(); }
      else if(a === "shots") document.getElementById("ix-shots").click();
      else if(a === "pdf") document.getElementById("ix-pdf").click();
      else if(a === "apply") apply();
      else if(a === "v163use"){ var lc = typeof v163LastFill === "function" ? v163LastFill(t.getAttribute("data-ro")) : null; if(lc){ Object.keys(lc).forEach(function(k){ D.edits[k] = lc[k]; }); D.err = ""; draw(); } }   /* Parsec 16.3: the last contact */
      else if(a === "usev"){ D.edits[t.getAttribute("data-k")] = t.getAttribute("data-v"); draw(); }   /* in Check, the list moves on by itself: the value no longer needs checking */   /* 17.3: a value Parsec already knows */
      else if(a === "use"){ var k = t.getAttribute("data-k"), s = SPEC.filter(function(x){ return x[0] === k; })[0]; if(s){ D.edits[k] = srcF(D.acc, s); draw(); } }
      else if(a === "rmpc"){ var gone = D.pieces.splice(+t.getAttribute("data-i"), 1)[0]; try{ if(gone && gone.url) URL.revokeObjectURL(gone.url); }catch(e){} rebuild(); }
      else if(a === "newinstead"){ D.forceNew = true; match(); draw(); }
      else if(a === "drop" && !(e.target.closest && e.target.closest("[data-ix-paste], button"))) t.focus();
    });
    w.addEventListener("input", function(e){ var t = e.target; if(t.getAttribute && t.getAttribute("data-ixf")) onInput(t); });
    w.addEventListener("change", function(e){
      var t = e.target;
      if(t.id === "ix-shots" || t.id === "ix-pdf"){ var fl = Array.prototype.slice.call(t.files || []); t.value = ""; readFiles(fl); return; }
      if(t.getAttribute("data-ix") === "pcon"){ var pc = D.pieces[+t.getAttribute("data-i")]; if(pc) pc.off = !t.checked; draw(); return; }
      if(t.getAttribute("data-ix") === "opon"){ D.skip[t.getAttribute("data-k")] = !t.checked; draw(); return; }
      if(t.getAttribute("data-ix") === "pto"){ D.opId = t.value; D.opAuto = false; rebuild(); return; }   /* 17.3 */
      if(t.getAttribute("data-ix") === "lp"){ var v = +t.value; D.lpOff = v < 0; if(v >= 0) D.lpTo = v; D.lpSet = true; draw(); return; }
      if(t.getAttribute("data-ixf")) onInput(t);
    });
    ["dragenter", "dragover"].forEach(function(ev){ w.addEventListener(ev, function(e){ e.preventDefault(); var z = w.querySelector(".ix-drop"); if(z) z.classList.add("drag"); }); });
    w.addEventListener("dragleave", function(e){ if(!w.contains(e.relatedTarget)){ var z = w.querySelector(".ix-drop"); if(z) z.classList.remove("drag"); } });
    w.addEventListener("drop", function(e){ e.preventDefault(); var z = w.querySelector(".ix-drop"); if(z) z.classList.remove("drag");
      var df = (e.dataTransfer && e.dataTransfer.files) || []; if(df.length){ readFiles(df); return; }
      var dt = e.dataTransfer && e.dataTransfer.getData("text"); if(dt) addText(dt); });
  }
  /* 17.3: drop files anywhere in Parsec, or paste the case or a screenshot outside a text box — the window opens with them */
  function idleTarget(t){ return !(t && t.closest && t.closest("input, textarea, select, [contenteditable=''], [contenteditable=true], .overlay, .modal, .ix-wrap")) && !(typeof UI !== "undefined" && UI.modal); }
  document.addEventListener("dragover", function(e){ if(D || e.defaultPrevented) return; var dt = e.dataTransfer; if(dt && Array.prototype.indexOf.call(dt.types || [], "Files") > -1) e.preventDefault(); });
  document.addEventListener("drop", function(e){
    if(D || e.defaultPrevented) return; var fl = Array.prototype.slice.call((e.dataTransfer && e.dataTransfer.files) || []);
    if(!fl.length) return; e.preventDefault();
    if(!idleTarget(e.target)) return;
    if(typeof UI !== "undefined" && UI.view === "ros" && UI.selectedRo && getRO(UI.selectedRo) && document.querySelector(".jc-host")) open({ ro: UI.selectedRo, files: fl }); else open({ files: fl });
  });
  document.addEventListener("paste", function(e){
    if(D || e.defaultPrevented || !idleTarget(e.target) || !(typeof navAllowed !== "function" || navAllowed("ros"))) return;
    var fl = Array.prototype.filter.call((e.clipboardData && e.clipboardData.files) || [], function(f){ return /^image\//.test(f.type || "") || /pdf/i.test(f.type || ""); });
    if(fl.length){ e.preventDefault(); open({ files: fl }); return; }
    var tx = e.clipboardData ? e.clipboardData.getData("text") : "";
    if(tx && tx.length > 40){ var P = parse(tx); if(P.found.length >= 2 || P.ops.length){ e.preventDefault(); open({ text: tx }); } }
  });
  document.addEventListener("paste", function(e){
    if(!D) return;
    var w = document.getElementById("imp-dlg"); if(!w) return;
    var files = Array.prototype.filter.call((e.clipboardData && e.clipboardData.files) || [], function(f){ return /^image\//.test(f.type || "") || /pdf/i.test(f.type || ""); });
    var inField = e.target && w.contains(e.target) && /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName) && !(e.target.hasAttribute && e.target.hasAttribute("data-ix-paste"));
    if(!files.length && inField) return;   /* a value pasted into one box */
    e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation();
    if(files.length){ readFiles(files); return; }
    var tx = e.clipboardData ? e.clipboardData.getData("text") : ""; if(tx) addText(tx);
  }, true);
  document.addEventListener("keydown", function(e){
    if(!D) return;
    if(e.key === "Escape"){ e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation(); if(D.menu){ D.menu = false; draw(); } else if(D.checking != null){ D.checking = null; draw(); } else if(D.ask){ D.ask = false; draw(); } else tryClose(); return; }
    if((e.ctrlKey || e.metaKey) && e.key === "Enter"){ e.preventDefault(); e.stopPropagation(); apply(); return; }
    var w = document.getElementById("imp-dlg");
    if(e.key === "Tab" && w && !w.contains(document.activeElement)){ e.preventDefault(); var z = w.querySelector(".ix-drop"); if(z) z.focus(); }
    if(!((e.ctrlKey || e.metaKey) && /^[vcxa]$/i.test(e.key))) e.stopPropagation();   /* the page behind doesn't take the keys */
  }, true);
  function open(o){
    o = o || {};
    if(D) close();
    var ro = o.ro ? (typeof o.ro === "string" ? getRO(o.ro) : getRO(o.ro.id) || o.ro) : null;
    D = { target: o.target === "inv" || o.target === "lib" ? o.target : "ro", opId: o.opId || "", okd: {}, checking: null, ro: ro, new: !ro, fixed: !!ro, acc: blankAcc(), pieces: [], edits: {}, skip: {}, only: false, lpTo: 0, lpOff: false, foundBy: "", busy: "", msg: "", err: "", back: document.activeElement };
    var tf = o.form || {}, mp = { "tr-ro": "roNumber", "tr-cust": "customerName", "tr-vin": "vin", "tr-unit": "unitNumber", "tr-key": "keyTag", "tr-miles": "mileage", "tr-spot": "location" };
    if(!ro) Object.keys(mp).forEach(function(k){ if(tf[k]) D.edits[mp[k]] = String(tf[k]); });
    var w = document.createElement("div"); w.id = "imp-dlg"; w.className = "ix-wrap"; document.body.appendChild(w); document.documentElement.classList.add("ix-open");
    bind(w); draw();
    setTimeout(function(){ var z = w.querySelector(".ix-drop"); if(z) z.focus({ preventScroll: true }); }, 30);
    if(o.target && D.target !== "ro") draw();
    if(o.text) addText(o.text);
    if(o.files && o.files.length) readFiles(o.files);
    return D;
  }
  return { partsTable: partsTable, open: open, close: close, parse: parse, mergeInto: mergeInto, blankAcc: blankAcc, findRo: findRo, mapStatus: mapStatus, describe: describe, parseWhen: parseWhen,
    addText: function(t){ addText(t); }, state: function(){ return D; }, plan: function(){ return D ? plan() : null; }, counts: function(){ return D ? counts(plan()) : null; }, apply: function(){ apply(); }, isOpen: function(){ return !!D; }, statusText: function(m){ return NOW ? String(m).replace(/screenshot \d+ of \d+/i, "screenshot " + NOW[0] + " of " + NOW[1]) : m; }, reader: function(f){ OCRF = f; }, read: function(fl){ return readFiles(fl); } };
