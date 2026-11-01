/* Parsec · library · intake.js
   Filing a document, always asked first: libIntake reads each file, shows what was found to check or change, then files it in the Library and, from an RO, links it to the operation.
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   libAskClose libE libIntake libAskShow libAskForm libEdit LIB_ASK (6 functions, 1 constant)
   state      libRules
   uses       data/ kit/ ro/ ro-page/ shell/ state/
*/
/* ============================== filing a document — always asked first (Parsec 17.1) ==============================
   libIntake(files, ctx, done): each file is read (library/read-files.js → libDocRead), then the person sees what
   Parsec found — kind, number, release, date, title, function group, the codes — can change any of it, and says
   File it. Nothing is filed without that. ctx = { ro, op } when the file was dropped on an RO: the document is then
   linked to the operation, a copy goes into Attachments under the entry picked, and that entry can be ticked done.
   On an RO, a file that isn't a Volvo document (no number found) is attached the usual way without asking.
   done({ filed: [docs], plain: [files] }) — plain = the files the caller attaches the usual way. */

var LIB_ASK = { el: null, key: null };
function libAskClose(){ if(LIB_ASK.el){ LIB_ASK.el.remove(); LIB_ASK.el = null; } if(LIB_ASK.key){ document.removeEventListener("keydown", LIB_ASK.key, true); LIB_ASK.key = null; } }
function libE(s){ return esc(s == null ? "" : s); }

function libIntake(files, ctx, done){
  var L = Array.prototype.slice.call(files || []), res = { filed: [], plain: [] }, i = 0;
  ctx = ctx || {};
  var next = function(){
    if(i >= L.length){ libAskClose(); if(done) done(res); return; }
    var f = L[i++];
    libAskShow({ reading: f.name });
    libReadFile(f).then(function(r){ return r; }, function(){ return { text: "", pages: null }; }).then(function(r){
      var got = libDocRead(r.text, f.name, r.pages);
      if(ctx.ro && !got.num){ res.plain.push(f); next(); return; }   /* not a Volvo document: attached as usual */
      libAskForm(f, got, ctx, function(ans){
        if(ans === "plain"){ res.plain.push(f); next(); return; }
        if(!ans){ next(); return; }
        libAdd(ans, f, f.name).then(function(d){
          res.filed.push(d);
          var msg = libDocChipText(d) + " is in the Library" + (ans.table && ans.table.length ? " · " + ans.table.length + " codes read" : "");
          if(ctx.ro && ans.op){ libAttach(ctx.ro, ans.op, d, ans.task, function(){ try{ if(typeof JC !== "undefined" && JC.rerender) JC.rerender(); }catch(e){} }, ans.tick); msg += " · on OP " + ((ctx.ro.operations || []).indexOf(ans.op) + 1); }
          pushToast(msg + ".");
          try{ render(); }catch(e){}
          next();
        }, function(){ pushToast("Couldn’t save " + f.name + " — check the shop folder."); next(); });
      });
    });
  };
  next();
}

/* the reading card, then the form */
function libAskShow(o){
  libAskClose();
  var w = document.createElement("div"); w.className = "roreo lib-ask"; w.setAttribute("role", "dialog"); w.setAttribute("aria-modal", "true"); w.setAttribute("aria-label", "File a document");
  w.innerHTML = '<div class="roreo-c lib-ask-c"><div class="lib-ask-read"><span class="lib-spin" aria-hidden="true"></span>Reading <b>' + libE(o.reading) + '</b>…</div></div>';
  document.body.appendChild(w); LIB_ASK.el = w;
  return w;
}
function libAskForm(file, g, ctx, cb){
  var w = LIB_ASK.el || libAskShow({ reading: file.name }), kindWas = g.kind, have = null;
  var kinds = LIB_KINDS.filter(function(k){ return !k.page; });
  var ops = (ctx.ro && ctx.ro.operations) || [], op0 = ctx.op || ops.filter(function(o){ return !o.declined; })[0] || ops[0] || null;
  var fgName = function(v){ return libFgName(v) || "—"; };
  var P = g.proc, nTq = P ? P.steps.reduce(function(a, s){ return a + (s.tq || []).length; }, 0) : 0;
  var codesLine = P ? "<b>" + P.steps.length + " steps</b>" + (P.tools.length ? " · " + P.tools.length + " special tool" + (P.tools.length === 1 ? "" : "s") : "") + (nTq ? " · " + nTq + " torque" + (nTq === 1 ? "" : "s") : "") + (g.info ? " · " + libE(g.info) : "") + " — they show in Parsec, the PDF one tap away"
    : g.table.length ? "<b>" + g.table.length + " codes</b> with their FTBs — they go into Fault codes"
    : g.codes.length ? "Mentions " + g.codes.slice(0, 6).map(libE).join(" · ") + (g.codes.length > 6 ? " · +" + (g.codes.length - 6) : "") : "No fault codes in it";
  var task = g.table.length ? "dtc" : "report";
  w.innerHTML = '<div class="roreo-c lib-ask-c"><div class="roreo-h"><span class="roreo-i" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M7 3.5h7l4 4V20a.5.5 0 0 1-.5.5h-10A.5.5 0 0 1 7 20z"/><path d="M14 3.5V8h4M9.5 12.5h5M9.5 16h5"/></svg></span>'
    + '<div><b>' + (ctx.edit ? 'Change this document' : 'File this document?') + '</b><p>' + libE(file.name) + (g.how ? ' · read from its ' + libE(g.how === "header" ? "header" : g.how) : "") + '</p></div></div>'
    + '<div class="lib-f">'
    + '<div class="lib-f-row"><span class="lib-f-l">Kind</span><span class="lib-kinds" role="radiogroup" aria-label="Kind">' + kinds.map(function(k){ return '<button type="button" role="radio" class="lib-kd k-' + k.k + (g.kind === k.k ? " on" : "") + '" data-kind="' + k.k + '" aria-checked="' + (g.kind === k.k) + '"><i></i>' + libE(k.one) + '</button>'; }).join("") + '</span></div>'
    + '<div class="lib-f-grid">'
    + '<label class="lib-f-c">Number<input id="lib-f-num" class="mono" value="' + libE(g.num) + '" autocomplete="off" spellcheck="false"></label>'
    + '<label class="lib-f-c s">Release<input id="lib-f-rel" class="mono" value="' + libE(g.rel) + '" autocomplete="off"></label>'
    + '<label class="lib-f-c s">Date<input id="lib-f-date" class="mono" value="' + libE(g.date) + '" placeholder="2026-05" autocomplete="off"></label>'
    + '<label class="lib-f-c w">Title<input id="lib-f-title" value="' + libE(g.title) + '" autocomplete="off"></label>'
    + '<label class="lib-f-c">Function group<input id="lib-f-fg" class="mono" value="' + libE(g.fgrp) + '" placeholder="430" autocomplete="off"><small id="lib-f-fgn">' + libE(fgName(g.fgrp)) + '</small></label>'
    + '<label class="lib-f-c">Trucks<input id="lib-f-model" value="' + libE(g.model) + '" placeholder="VN, VHD" autocomplete="off"></label>'
    + '<label class="lib-f-c">Model years<input id="lib-f-years" class="mono" value="' + libE(g.years || "") + '" placeholder="2017–2024 or 2017+" autocomplete="off"></label>'
    + '</div>'
    + '<div class="lib-f-found">' + codesLine + '</div>'
    + '<label class="lib-f-learn" id="lib-f-learnw" hidden><input type="checkbox" id="lib-f-learn" checked> <span id="lib-f-learnt"></span></label>'
    + '<div class="lib-f-dup" id="lib-f-dup" hidden></div>'
    + (ctx.ro ? '<div class="lib-f-ro"><label class="lib-f-c">Operation<select id="lib-f-op">' + ops.map(function(o, n){ return '<option value="' + libE(o.id) + '"' + (o === op0 ? " selected" : "") + '>OP ' + (n + 1) + ' · ' + libE(String(o.complaint || "").slice(0, 48)) + '</option>'; }).join("") + '</select></label>'
      + '<label class="lib-f-c">A copy goes under<select id="lib-f-task"><option value="dtc"' + (task === "dtc" ? " selected" : "") + '>Upload DTCs</option><option value="report"' + (task === "report" ? " selected" : "") + '>Upload Report</option></select></label>'
      + '<label class="lib-f-tick"><input type="checkbox" id="lib-f-tick"' + (task === "dtc" ? " checked" : "") + '> <span id="lib-f-tickt">Tick “' + (task === "dtc" ? "Upload DTCs" : "Upload Report") + '” done</span></label></div>' : '')
    + '</div><div class="roreo-a">' + (ctx.ro ? '<button type="button" class="roreo-b" data-lib="plain">Just attach</button>' : '') + '<button type="button" class="roreo-b" data-lib="skip">' + (ctx.edit ? 'Cancel' : 'Don’t file') + '</button><button type="button" class="roreo-b pri" data-lib="go">' + (ctx.edit ? 'Save' : 'File it') + '</button></div></div>';
  var $ = function(id){ return w.querySelector("#" + id); };
  var kindNow = function(){ var b = w.querySelector(".lib-kd.on"); return b ? b.getAttribute("data-kind") : ""; };
  var paint = function(){
    var num = $("lib-f-num").value.trim(), k = kindNow(), pre = libPrefixOf(num), learnW = $("lib-f-learnw");
    /* a number Parsec had no rule for: offer to remember its letters with the kind picked */
    var showLearn = !!(num && k && !kindWas && pre && !libKindOf(num));
    learnW.hidden = !showLearn;
    if(showLearn) $("lib-f-learnt").textContent = "Numbers starting with " + pre.replace(/-$/, "") + " are " + (libKind(k) || {}).tab + " from now on";
    $("lib-f-fgn").textContent = fgName($("lib-f-fg").value.trim());
    have = num ? libFind(k, num, $("lib-f-rel").value.trim()) : null; if(have === ctx.edit) have = null;
    var dup = $("lib-f-dup"); dup.hidden = !have;
    if(have) dup.textContent = libDocChipText(have) + " is already in the Library" + (ctx.ro ? " — it will be linked, not added again." : " — it won’t be added twice.");
    w.querySelector('[data-lib="go"]').disabled = !(num && k) || !!(ctx.edit && have);
    if(ctx.ro){ var t = $("lib-f-task").value; $("lib-f-tickt").textContent = "Tick “" + (t === "dtc" ? "Upload DTCs" : "Upload Report") + "” done"; }
  };
  var answer = function(){
    var num = $("lib-f-num").value.trim().toUpperCase(), k = kindNow(); if(!num || !k) return null;
    var a = { kind: k, num: num, rel: $("lib-f-rel").value.trim(), date: $("lib-f-date").value.trim(), title: $("lib-f-title").value.trim(), fgrp: $("lib-f-fg").value.trim(),
      model: $("lib-f-model").value.trim(), years: libYears($("lib-f-years").value) || $("lib-f-years").value.trim(), info: g.info || "", proc: g.proc || null, mod: g.mod, opNo: g.opNo, codes: g.codes, table: g.table, learn: !$("lib-f-learnw").hidden && $("lib-f-learn").checked };
    if(ctx.ro){ var oid = $("lib-f-op").value; a.op = ops.filter(function(o){ return o.id === oid; })[0] || op0; a.task = $("lib-f-task").value; a.tick = $("lib-f-tick").checked; }
    return a;
  };
  var said = false, say = function(v){ if(said) return; said = true; cb(v); };
  w.addEventListener("click", function(e){
    var kb = e.target.closest && e.target.closest(".lib-kd");
    if(kb){ w.querySelectorAll(".lib-kd").forEach(function(b){ b.classList.toggle("on", b === kb); b.setAttribute("aria-checked", String(b === kb)); }); paint(); return; }
    var b = e.target.closest && e.target.closest("[data-lib]");
    if(!b){ if(e.target === w) say(null); return; }
    var act = b.getAttribute("data-lib");
    if(act === "go"){ var a = answer(); if(a) say(a); }
    else say(act === "plain" ? "plain" : null);
  });
  w.addEventListener("input", paint); w.addEventListener("change", paint);
  /* Enter files it, Esc doesn't */
  LIB_ASK.key = function(e){
    if(!LIB_ASK.el) return;
    if(e.key === "Escape"){ e.preventDefault(); e.stopPropagation(); say(null); return; }
    if(e.key === "Enter" && !(e.target && e.target.tagName === "BUTTON")){ e.preventDefault(); e.stopPropagation(); var go = w.querySelector('[data-lib="go"]'); if(go && !go.disabled) go.click(); return; }
    if(!/^(Tab|Shift)$/.test(e.key)) e.stopPropagation();
  };
  document.addEventListener("keydown", LIB_ASK.key, true);
  paint();
  setTimeout(function(){ var t = !kindNow() ? w.querySelector(".lib-kd") : w.querySelector('[data-lib="go"]'); if(t) try{ t.focus({ preventScroll: true }); }catch(er){} }, 30);
}

/* change a filed document's details (the same card, with Save) */
function libEdit(d, done){
  libAskShow({ reading: "" });
  var g = { kind: d.kind, num: d.num, rel: d.rel, date: d.date, title: d.title, fgrp: d.fgrp, model: d.model, years: d.years, info: d.info, mod: d.mod, opNo: d.opNo, codes: d.codes || [], table: [], how: "" };
  libAskForm({ name: (d.file && d.file.name) || libDocLabel(d) }, g, { edit: d }, function(a){
    libAskClose();
    if(!a || a === "plain"){ if(done) done(false); return; }
    pushUndo("library");
    ["kind", "num", "rel", "date", "title", "fgrp", "model", "years"].forEach(function(k){ d[k] = a[k]; });
    if(a.learn && a.num && a.kind){ var pre = libPrefixOf(a.num); if(pre && !(STATE.libRules || []).some(function(x){ return x.pre === pre; })) (STATE.libRules = STATE.libRules || []).push({ id: uid("lr"), pre: pre, kind: a.kind }); }
    scheduleSave(true);
    if(done) done(true);
  });
}
