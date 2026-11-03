/* Parsec · import/new-ro · open.js
   Open and close the dialog, its input and key handling, the drag-and-drop of screenshots.
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   soft onInput close bind open (5 functions)
   uses       import/ pages/triage/ ro/
   at load    on document paste · on document keydown
*/
  /* ---------------------------------------------------------------- open, close, events */
  function soft(){
    var w = document.getElementById("imp-dlg"); if(!w || !D) return;
    var Pl = plan(), C = counts(Pl), s = w.querySelector(".ix-sum"), b = w.querySelector('[data-ix="apply"]');
    var chips = [["new", C.new, "new"], ["upd", C.upd, "updated"], ["kept", C.kept, "kept yours"], ["edit", C.edit, "typed"], ["same", C.same, "same"]].filter(function(x){ return x[1]; }).map(function(x){ return '<span class="' + x[0] + '"><b>' + x[1] + '</b>' + x[2] + '</span>'; }).join("");
    if(s) s.innerHTML = chips;
    if(b){ b.textContent = D.new ? "Create RO" + (Pl.rows[1].fin ? " " + roShortNo(Pl.rows[1].fin) : "") : (C.changes || Pl.people.length ? "Apply " + C.changes + " change" + (C.changes === 1 ? "" : "s") : "Nothing to change"); b.disabled = !D.new && !C.changes && !Pl.people.length; }
    Pl.rows.forEach(function(r){ var inp = w.querySelector('[data-ixf="' + r.k + '"]'), row = inp && inp.closest(".ix-fr"); if(!row) return; row.className = "ix-fr " + (r.bd || "none"); var old = row.lastElementChild; if(old && old !== inp.parentNode){ var t = document.createElement("span"); t.innerHTML = bd(r.bd === "same0" ? "" : r.bd); row.replaceChild(t.firstChild || document.createElement("span"), old); } });
  }
  function onInput(t){
    var k = t.getAttribute("data-ixf"), s = SPEC.filter(function(x){ return x[0] === k; })[0]; if(!s || !D) return;
    var v = t.value; if((s[4] || {}).dt){ var d = v ? new Date(v) : null; v = d && !isNaN(d) ? d.toISOString() : ""; }
    D.edits[k] = v; D.err = ""; soft();
  }
  function close(){ var w = document.getElementById("imp-dlg"); if(w) w.remove(); document.documentElement.classList.remove("ix-open"); var b = D && D.back; D = null; try{ if(b && b.isConnected) b.focus({ preventScroll: true }); }catch(e){} }
  function bind(w){
    w.addEventListener("click", function(e){
      var t = e.target.closest && e.target.closest("[data-ix]"); if(!t || !w.contains(t)) return;
      var a = t.getAttribute("data-ix");
      if(a === "close") close();
      else if(a === "only"){ D.only = t.getAttribute("data-v") === "1"; draw(); }
      else if(a === "shots") document.getElementById("ix-shots").click();
      else if(a === "pdf") document.getElementById("ix-pdf").click();
      else if(a === "apply") apply();
      else if(a === "v163use"){ var lc = typeof v163LastFill === "function" ? v163LastFill(t.getAttribute("data-ro")) : null; if(lc){ Object.keys(lc).forEach(function(k){ D.edits[k] = lc[k]; }); D.err = ""; draw(); } }   /* Parsec 16.3: the last contact */
      else if(a === "usev"){ D.edits[t.getAttribute("data-k")] = t.getAttribute("data-v"); draw(); }   /* 17.3: a value Parsec already knows */
      else if(a === "use"){ var k = t.getAttribute("data-k"), s = SPEC.filter(function(x){ return x[0] === k; })[0]; if(s){ D.edits[k] = srcF(D.acc, s); draw(); } }
      else if(a === "rmpc"){ D.pieces.splice(+t.getAttribute("data-i"), 1); rebuild(); }
      else if(a === "newinstead"){ D.forceNew = true; match(); draw(); }
      else if(a === "drop" && !(e.target.closest && e.target.closest("[data-ix-paste], button"))) t.focus();
    });
    w.addEventListener("input", function(e){ var t = e.target; if(t.getAttribute && t.getAttribute("data-ixf")) onInput(t); });
    w.addEventListener("change", function(e){
      var t = e.target;
      if(t.id === "ix-shots" || t.id === "ix-pdf"){ var fl = Array.prototype.slice.call(t.files || []); t.value = ""; readFiles(fl); return; }
      if(t.getAttribute("data-ix") === "opon"){ D.skip[t.getAttribute("data-k")] = !t.checked; draw(); return; }
      if(t.getAttribute("data-ix") === "lp"){ var v = +t.value; D.lpOff = v < 0; if(v >= 0) D.lpTo = v; D.lpSet = true; draw(); return; }
      if(t.getAttribute("data-ixf")) onInput(t);
    });
    ["dragenter", "dragover"].forEach(function(ev){ w.addEventListener(ev, function(e){ e.preventDefault(); var z = w.querySelector(".ix-drop"); if(z) z.classList.add("drag"); }); });
    w.addEventListener("dragleave", function(e){ if(!w.contains(e.relatedTarget)){ var z = w.querySelector(".ix-drop"); if(z) z.classList.remove("drag"); } });
    w.addEventListener("drop", function(e){ e.preventDefault(); var z = w.querySelector(".ix-drop"); if(z) z.classList.remove("drag");
      var df = (e.dataTransfer && e.dataTransfer.files) || []; if(df.length){ readFiles(df); return; }
      var dt = e.dataTransfer && e.dataTransfer.getData("text"); if(dt) addText(dt); });
  }
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
    if(e.key === "Escape"){ e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation(); close(); return; }
    if((e.ctrlKey || e.metaKey) && e.key === "Enter"){ e.preventDefault(); e.stopPropagation(); apply(); return; }
    var w = document.getElementById("imp-dlg");
    if(e.key === "Tab" && w && !w.contains(document.activeElement)){ e.preventDefault(); var z = w.querySelector(".ix-drop"); if(z) z.focus(); }
    if(!((e.ctrlKey || e.metaKey) && /^[vcxa]$/i.test(e.key))) e.stopPropagation();   /* the page behind doesn't take the keys */
  }, true);
  function open(o){
    o = o || {};
    if(D) close();
    var ro = o.ro ? (typeof o.ro === "string" ? getRO(o.ro) : getRO(o.ro.id) || o.ro) : null;
    D = { ro: ro, new: !ro, fixed: !!ro, acc: blankAcc(), pieces: [], edits: {}, skip: {}, only: false, lpTo: 0, lpOff: false, foundBy: "", busy: "", msg: "", err: "", back: document.activeElement };
    var tf = o.form || {}, mp = { "tr-ro": "roNumber", "tr-cust": "customerName", "tr-vin": "vin", "tr-unit": "unitNumber", "tr-key": "keyTag", "tr-miles": "mileage", "tr-spot": "location" };
    if(!ro) Object.keys(mp).forEach(function(k){ if(tf[k]) D.edits[mp[k]] = String(tf[k]); });
    var w = document.createElement("div"); w.id = "imp-dlg"; w.className = "ix-wrap"; document.body.appendChild(w); document.documentElement.classList.add("ix-open");
    bind(w); draw();
    setTimeout(function(){ var z = w.querySelector(".ix-drop"); if(z) z.focus({ preventScroll: true }); }, 30);
    if(o.text) addText(o.text);
    if(o.files && o.files.length) readFiles(o.files);
    return D;
  }
  return { partsTable: partsTable, open: open, close: close, parse: parse, mergeInto: mergeInto, blankAcc: blankAcc, findRo: findRo, mapStatus: mapStatus, describe: describe, parseWhen: parseWhen,
    addText: function(t){ addText(t); }, state: function(){ return D; }, plan: function(){ return D ? plan() : null; }, counts: function(){ return D ? counts(plan()) : null; }, apply: function(){ apply(); }, isOpen: function(){ return !!D; }, statusText: function(m){ return NOW ? String(m).replace(/screenshot \d+ of \d+/i, "screenshot " + NOW[0] + " of " + NOW[1]) : m; }, reader: function(f){ OCRF = f; }, read: function(fl){ return readFiles(fl); } };
