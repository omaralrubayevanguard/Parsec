/* Parsec · library · intake.js
   Filing a document, always asked first: libIntake reads each file, shows what was found to check or change, then files it in the Library and, from an RO, links it to the operation.
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   libAskClose libE libIntake libFileOne libUseAll libAskShow libAskForm libEdit LIB_ASK LIB_F_IDS (8 functions, 2 constants)
   uses       data/ kit/ ro/ ro-page/ shell/ state/
*/
/* ============================== filing a document — always asked first (Parsec 17.1, 17.3) ==============================
   libIntake(files, ctx, done): each file is read (library/read-files.js → libDocRead), then the person sees what
   Parsec found — kind, number, release, date, title, function group, the codes — can change any of it, and says
   File it. Nothing is filed without that. ctx = { ro, op } when the file was dropped on an RO: the document is then
   linked to the operation, a copy goes into Attachments under the entry picked, and that entry can be ticked done.
   On an RO, a file that isn't a Volvo document (no number found) is attached the usual way without asking.
   Several files at once: a progress window, then one list of them all (library/intake-list.js).
   17.3 on the card: a field read from somewhere weak is marked "check"; the document's words sit beside the card and
   light up for the field you're on; a fix to the kind or the title asks once whether to remember it; when the number
   doesn't say the kind, the two likeliest are shown and nothing is picked; the parts, labor hours, the trucks it covers,
   its symptoms and the repair in one line are shown, and from an RO the parts, hours and repair can go onto the operation.
   done({ filed: [docs], plain: [files] }) — plain = the files the caller attaches the usual way. */

var LIB_ASK = { el: null, key: null };
function libAskClose(){ if(LIB_ASK.el){ LIB_ASK.el.remove(); LIB_ASK.el = null; } if(LIB_ASK.key){ document.removeEventListener("keydown", LIB_ASK.key, true); LIB_ASK.key = null; } }
function libE(s){ return esc(s == null ? "" : s); }

function libIntake(files, ctx, done){
  var L = Array.prototype.slice.call(files || []), res = { filed: [], plain: [] }, i = 0;
  ctx = ctx || {};
  if(L.length > 1) return libIntakeMany(L, ctx, done);   /* 17.3: a stack of files → one list */
  var next = function(){
    if(i >= L.length){ libAskClose(); if(done) done(res); return; }
    var f = L[i++];
    libAskShow({ reading: f.name });
    libReadFile(f).then(function(r){ return r; }, function(){ return { text: "", pages: null }; }).then(function(r){
      var got = libDocRead(r.text, f.name, r.pages);
      if(ctx.ro && !got.num){ res.plain.push(f); next(); return; }   /* not a Volvo document: attached as usual */
      libAskForm(f, got, ctx, function(ans){
        if(ans === "plain"){ res.plain.push(f); next(); return; }
        if(!ans || ans === "back"){ next(); return; }
        libFileOne(ans, f, ctx).then(function(d){ res.filed.push(d); next(); }, function(){ next(); });
      });
    });
  };
  next();
}
/* file one answer: into the Library, onto the operation it came from with what was ticked, and say so */
function libFileOne(ans, f, ctx, quiet){
  return libAdd(ans, f, f.name).then(function(d){
    var msg = libDocChipText(d) + " is in the Library" + (ans.table && ans.table.length ? " · " + ans.table.length + " codes read" : "");
    if(ctx.ro && ans.op){
      libAttach(ctx.ro, ans.op, d, ans.task, function(){ try{ if(typeof JC !== "undefined" && JC.rerender) JC.rerender(); }catch(e){} }, ans.tick);
      msg += " · on OP " + ((ctx.ro.operations || []).indexOf(ans.op) + 1);
      var used = libUseAll(ctx.ro, ans.op, d, ans); if(used) msg += " · " + used;
    }
    if(!quiet) pushToast(msg + ".");
    try{ render(); }catch(e){}
    return d;
  }, function(e){ pushToast("Couldn’t save " + f.name + " — check the shop folder."); throw e; });
}
/* the parts, hours and repair the person ticked, onto the operation; returns what was done, in words */
function libUseAll(ro, op, d, a){
  var said = [];
  if(a.addParts){ var n = libUseParts(ro, op, d); if(n) said.push(n + " part" + (n === 1 ? "" : "s") + " added"); }
  if(a.useHrs){ var h = libUseHours(op, d); if(h) said.push(h + " h quoted"); }
  if(a.useFix && libUseFix(op, d)) said.push("the repair is the Correction");
  if(said.length) try{ scheduleSave(true); }catch(e){}
  return said.join(" · ");
}

/* the reading card (with how far through a stack it is), then the form */
function libAskShow(o){
  libAskClose();
  var w = document.createElement("div"); w.className = "roreo lib-ask"; w.setAttribute("role", "dialog"); w.setAttribute("aria-modal", "true"); w.setAttribute("aria-label", "File a document");
  var many = o.of > 1;
  w.innerHTML = '<div class="roreo-c lib-ask-c"><div class="lib-ask-read"><span class="lib-spin" aria-hidden="true"></span><span>Reading ' + (many ? '<span class="lib-ask-n">' + (o.n || 1) + ' of ' + o.of + '</span> · ' : '') + '<b>' + libE(o.reading) + '</b>…</span></div>'
    + (many ? '<div class="lib-prog" role="progressbar" aria-valuemin="0" aria-valuemax="' + o.of + '" aria-valuenow="' + ((o.n || 1) - 1) + '"><i style="width:' + Math.round(((o.n || 1) - 1) / o.of * 100) + '%"></i></div>' : '') + '</div>';
  document.body.appendChild(w); LIB_ASK.el = w;
  return w;
}
var LIB_F_IDS = { num: "lib-f-num", rel: "lib-f-rel", date: "lib-f-date", title: "lib-f-title", fgrp: "lib-f-fg", model: "lib-f-model", years: "lib-f-years" };
function libAskForm(file, g, ctx, cb){
  var w = LIB_ASK.el || libAskShow({ reading: file.name }), kindWas = g.kind || g.kindRead || "", have = null;
  var kinds = LIB_KINDS.filter(function(k){ return !k.page || k.file; });   /* 17.1: Fault codes is a kind you file, too */
  var ops = (ctx.ro && ctx.ro.operations) || [], op0 = ctx.op || ops.filter(function(o){ return !o.declined; })[0] || ops[0] || null;
  var fgName = function(v){ return libFgName(v) || "—"; };
  var P = g.proc, nTq = P ? P.steps.reduce(function(a, s){ return a + (s.tq || []).length; }, 0) : 0;
  var toss = g.toss || [], dbt = g.doubt || {}, lines = g.lines || [], src = g.src || {};
  var tossTxt = function(){ return toss.map(function(k){ return (libKind(k) || {}).one || k; }).join(" or "); };
  /* 17.1: what Parsec takes from the file depends on the kind — the codes only for Fault codes; the steps for a procedure or a diagnostic; else it's filed as it is */
  var foundFor = function(k){
    if(k === "codes") return g.table.length ? "<b>" + g.table.length + " codes</b> with their FTBs — they go into Fault codes"
      : g.codes.length ? "<b>" + g.codes.length + " code" + (g.codes.length === 1 ? "" : "s") + "</b> found: " + g.codes.slice(0, 6).map(libE).join(" · ") + (g.codes.length > 6 ? " · +" + (g.codes.length - 6) : "") + " — they go into Fault codes"
      : "No fault codes found in it — it’s filed with Fault codes as it is";
    if((k === "proc" || k === "diag") && P && P.steps.length) return "<b>" + P.steps.length + " steps</b>" + (P.tools.length ? " · " + P.tools.length + " special tool" + (P.tools.length === 1 ? "" : "s") : "") + (nTq ? " · " + nTq + " torque" + (nTq === 1 ? "" : "s") : "") + (g.info ? " · " + libE(g.info) : "") + " — they show in Parsec, the PDF one tap away";
    if(!k && toss.length > 1) return "<b>" + libE(tossTxt()) + "?</b> Pick one — nothing is filed until you do";
    return k ? "Filed as it is, with the details above" + (g.codes.length ? " · its codes are read only when the kind is Fault codes" : "") : "Pick what kind of document it is";
  };
  var codesLine = foundFor(g.kind);
  var task = g.kind === "codes" ? "dtc" : "report";
  var chk = function(f){ return dbt[f] ? ' <em class="lib-chk" title="' + libE(dbt[f]) + '">check</em>' : ''; };
  var cls = function(f, c){ return 'lib-f-c' + (c ? ' ' + c : '') + (dbt[f] ? ' doubt' : ''); };
  /* what else it says (17.3) */
  var fit = ctx.ro ? libFits(g, ctx.ro) : null, hrs = libHoursOf(g);
  var more = [];
  if(g.parts && g.parts.length) more.push('<span class="lib-mo-l">Parts</span><span class="lib-mo-v">' + g.parts.slice(0, 6).map(function(x){ return '<span class="lib-pn"><b class="mono">' + libE(x.pn) + '</b> ' + libE(x.desc) + (x.qty > 1 ? ' ×' + x.qty : '') + '</span>'; }).join("") + (g.parts.length > 6 ? '<span class="lib-pn">+' + (g.parts.length - 6) + '</span>' : '') + '</span>');
  if(g.labor && g.labor.length) more.push('<span class="lib-mo-l">Labor</span><span class="lib-mo-v">' + g.labor.map(function(x){ return '<span class="lib-pn">' + (x.op ? '<b class="mono">' + libE(x.op) + '</b> ' : '') + libE(String(x.hrs)) + ' h</span>'; }).join("") + '</span>');
  if((g.chassis && g.chassis.length) || fit) more.push('<span class="lib-mo-l">Trucks</span><span class="lib-mo-v">' + (g.chassis || []).map(function(x){ return '<span class="lib-pn">Chassis ' + x[0] + '–' + x[1] + '</span>'; }).join("") + (fit ? '<span class="lib-fit ' + (fit.ok ? 'ok' : 'no') + '"><i></i>' + libE(fit.why) + '</span>' : '') + '</span>');
  if(g.symp && g.symp.length) more.push('<span class="lib-mo-l">Symptoms</span><span class="lib-mo-v">' + g.symp.map(function(s){ return '<span class="lib-pn">' + libE(s) + '</span>'; }).join("") + '</span>');
  if(g.fix) more.push('<span class="lib-mo-l">Repair</span><span class="lib-mo-v lib-mo-fix">' + libE(g.fix) + '</span>');
  var nNew = ctx.ro && op0 ? libPartsNew(op0, g).length : 0;
  var useRo = ctx.ro ? [
    nNew ? '<label class="lib-f-tick"><input type="checkbox" id="lib-f-parts"> <span id="lib-f-partst">Add ' + nNew + ' part' + (nNew === 1 ? '' : 's') + ' to the operation</span></label>' : '',
    hrs ? '<label class="lib-f-tick"><input type="checkbox" id="lib-f-hrs"> <span>Use ' + libE(String(Math.round(hrs * 10) / 10)) + ' h as the quoted hours</span></label>' : '',
    g.fix ? '<label class="lib-f-tick"><input type="checkbox" id="lib-f-fix"> <span>Use the repair as the Correction</span></label>' : ''].join("") : '';
  var pg = lines.length >= 2 && !ctx.edit;
  w.innerHTML = '<div class="roreo-c lib-ask-c' + (pg ? ' has-pg' : '') + '"><div class="lib-ask-main"><div class="roreo-h"><span class="roreo-i" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M7 3.5h7l4 4V20a.5.5 0 0 1-.5.5h-10A.5.5 0 0 1 7 20z"/><path d="M14 3.5V8h4M9.5 12.5h5M9.5 16h5"/></svg></span>'
    + '<div><b>' + (ctx.edit ? 'Change this document' : 'File this document?') + '</b><p>' + libE(file.name) + (g.how ? ' · read from its ' + libE(g.how === "header" ? "header" : g.how) : "") + (Object.keys(dbt).length ? ' · <span class="lib-chk-n">' + Object.keys(dbt).length + ' to check</span>' : '') + (!ctx.edit && !lines.length ? '<br><span class="lib-chk-n">No words could be read from the file — only its name. A scanned page needs a clearer copy or a screenshot.</span>' : '') + '</p></div></div>'
    + '<div class="lib-f">'
    + '<div class="lib-f-row"><span class="lib-f-l">Kind</span><span class="lib-kinds" role="radiogroup" aria-label="Kind">' + kinds.map(function(k){ return '<button type="button" role="radio" class="lib-kd k-' + k.k + (g.kind === k.k ? " on" : "") + (!g.kind && toss.indexOf(k.k) > -1 ? " maybe" : "") + '" data-kind="' + k.k + '" aria-checked="' + (g.kind === k.k) + '"><i></i>' + libE(k.one) + '</button>'; }).join("") + '</span></div>'
    + '<div class="lib-f-grid">'
    + '<label class="' + cls("num") + '" data-f="num"><span class="lib-f-lt">Number' + chk("num") + '</span><input id="lib-f-num" class="mono" value="' + libE(g.num) + '" autocomplete="off" spellcheck="false"></label>'
    + '<label class="' + cls("rel", "s") + '" data-f="rel"><span class="lib-f-lt">Release' + chk("rel") + '</span><input id="lib-f-rel" class="mono" value="' + libE(g.rel) + '" autocomplete="off"></label>'
    + '<label class="' + cls("date", "s") + '" data-f="date"><span class="lib-f-lt">Date' + chk("date") + '</span><input id="lib-f-date" class="mono" value="' + libE(g.date) + '" placeholder="2026-05" autocomplete="off"></label>'
    + '<label class="' + cls("title", "w") + '" data-f="title"><span class="lib-f-lt">Title' + chk("title") + '</span><input id="lib-f-title" value="' + libE(g.title) + '" autocomplete="off"></label>'
    + '<label class="' + cls("fgrp") + '" data-f="fgrp"><span class="lib-f-lt">Function group' + chk("fgrp") + '</span><input id="lib-f-fg" class="mono" value="' + libE(g.fgrp) + '" placeholder="430" autocomplete="off"><small id="lib-f-fgn">' + libE(fgName(g.fgrp)) + '</small></label>'
    + '<label class="' + cls("model") + '" data-f="model"><span class="lib-f-lt">Trucks' + chk("model") + '</span><input id="lib-f-model" value="' + libE(g.model) + '" placeholder="VN, VHD" autocomplete="off"></label>'
    + '<label class="' + cls("years") + '" data-f="years"><span class="lib-f-lt">Model years' + chk("years") + '</span><input id="lib-f-years" class="mono" value="' + libE(g.years || "") + '" placeholder="2017–2024 or 2017+" autocomplete="off"></label>'
    + '</div>'
    + '<div class="lib-f-found" id="lib-f-found">' + codesLine + '</div>'
    + '<div class="lib-f-learn" id="lib-f-learnw" hidden><span id="lib-f-learnt"></span><span class="lib-yn"><button type="button" class="lib-yn-b" data-yn="learn" data-v="1">Yes</button><button type="button" class="lib-yn-b" data-yn="learn" data-v="0">No</button></span><input type="checkbox" id="lib-f-learn" hidden></div>'
    + '<div class="lib-f-learn" id="lib-f-dropw" hidden><span id="lib-f-dropt"></span><span class="lib-yn"><button type="button" class="lib-yn-b" data-yn="drop" data-v="1">Yes</button><button type="button" class="lib-yn-b" data-yn="drop" data-v="0">No</button></span></div>'
    + '<div class="lib-f-dup" id="lib-f-dup" hidden></div>'
    + (more.length ? '<div class="lib-more">' + more.map(function(x){ return '<div class="lib-mo">' + x + '</div>'; }).join("") + '</div>' : '')
    + (ctx.ro ? '<div class="lib-f-ro"><label class="lib-f-c">Operation<select id="lib-f-op">' + ops.map(function(o, n){ return '<option value="' + libE(o.id) + '"' + (o === op0 ? " selected" : "") + '>OP ' + (n + 1) + ' · ' + libE(String(o.complaint || "").slice(0, 48)) + '</option>'; }).join("") + '</select></label>'
      + '<label class="lib-f-c">A copy goes under<select id="lib-f-task"><option value="dtc"' + (task === "dtc" ? " selected" : "") + '>Upload DTCs</option><option value="report"' + (task === "report" ? " selected" : "") + '>Upload Report</option></select></label>'
      + '<label class="lib-f-tick"><input type="checkbox" id="lib-f-tick"' + (task === "dtc" ? " checked" : "") + '> <span id="lib-f-tickt">Tick “' + (task === "dtc" ? "Upload DTCs" : "Upload Report") + '” done</span></label>' + useRo + '</div>' : '')
    + '</div><div class="roreo-a">' + (ctx.list ? '<button type="button" class="roreo-b lib-back" data-lib="back">‹ Back to the list</button>' : '') + (ctx.ro ? '<button type="button" class="roreo-b" data-lib="plain">Just attach</button>' : '') + '<button type="button" class="roreo-b" data-lib="skip">' + (ctx.edit ? 'Cancel' : 'Don’t file') + '</button><button type="button" class="roreo-b pri" data-lib="go">' + (ctx.edit ? 'Save' : 'File it') + '</button></div></div>'
    + (pg ? '<div class="lib-pg" aria-label="The document"><div class="lib-pg-h">The document<small>point at a field to see where it came from</small></div><div class="lib-pg-b" id="lib-pg-b">' + lines.map(function(l, n){ return '<span data-ln="' + n + '">' + libE(l) + '</span>'; }).join("") + '</div><div class="lib-pg-note" id="lib-pg-note" hidden></div></div>' : '')
    + '</div>';
  var $ = function(id){ return w.querySelector("#" + id); };
  var kindNow = function(){ var b = w.querySelector(".lib-kd.on"); return b ? b.getAttribute("data-kind") : ""; };
  /* the page beside the card: the line each field was read from */
  var lineOf = function(f){
    var s = String(src[f] || "").replace(/\s+/g, " ").trim().toLowerCase(); if(!s) return -1;
    var probe = s.slice(0, 40);
    for(var n = 0; n < lines.length; n++){ var L = lines[n].replace(/\s+/g, " ").toLowerCase(); if(L.indexOf(probe) > -1 || (probe.indexOf(L) > -1 && L.length >= 8)) return n; }
    var first = probe.split(" ")[0]; for(var k = 0; k < lines.length; k++) if(first.length >= 4 && lines[k].toLowerCase().indexOf(first) > -1) return k;
    return -1;
  };
  var showSrc = function(f){
    if(!pg) return; var B = $("lib-pg-b"), note = $("lib-pg-note");
    B.querySelectorAll(".hl").forEach(function(x){ x.classList.remove("hl"); });
    if(!f){ note.hidden = true; return; }
    var n = lineOf(f), name = { num: "The number", rel: "The release", date: "The date", title: "The title", fgrp: "The function group", model: "The trucks", years: "The model years" }[f];
    if(n > -1){ var sp = B.querySelector('[data-ln="' + n + '"]'); sp.classList.add("hl"); try{ sp.scrollIntoView({ block: "nearest" }); }catch(e){} note.hidden = true; }
    else { note.hidden = false; note.textContent = $(LIB_F_IDS[f]) && $(LIB_F_IDS[f]).value ? name + " isn’t on the page" + (f === "num" && g.how === "file name" ? " — it came from the file name" : f === "title" && g.tHow === "file" ? " — it came from the file name" : "") : name + " wasn’t found"; }
  };
  /* ask once: remember the kind for these letters, leave a phrase out of titles */
  var ans = { learn: null, drop: null }, dropTxt = "";
  var yn = function(which, v){ ans[which] = v; w.querySelectorAll('[data-yn="' + which + '"]').forEach(function(b){ b.classList.toggle("on", b.getAttribute("data-v") === (v ? "1" : "0")); }); if(which === "learn") $("lib-f-learn").checked = !!v; };
  var paint = function(){
    var num = $("lib-f-num").value.trim(), k = kindNow(), pre = libPrefixOf(num), learnW = $("lib-f-learnw");
    /* a number Parsec had no rule for (remembered unless you say No), or a kind it read that you changed (only if you say Yes) */
    var fresh = !!(num && k && !kindWas && pre && !libKindOf(num)), changed = !!(num && k && kindWas && k !== kindWas && pre && g.how !== "Impact");
    var showLearn = fresh || changed;
    learnW.hidden = !showLearn;
    if(showLearn){
      $("lib-f-learnt").textContent = fresh ? "Numbers starting with " + pre.replace(/-$/, "") + " are " + (libKind(k) || {}).tab + " from now on?" : "Next time, file " + pre.replace(/-$/, "") + "… as " + ((libKind(k) || {}).one || k) + "?";
      if(ans.learn !== null) yn("learn", ans.learn); else if(fresh) yn("learn", true); else $("lib-f-learn").checked = false;   /* a changed kind: only on a Yes */
    } else $("lib-f-learn").checked = false;
    /* the title: a part you took off the start or the end */
    var tv = $("lib-f-title").value.replace(/\s+/g, " ").trim(), t0 = String(g.title || "").replace(/\s+/g, " ").trim(), cut = "";
    if(tv && t0 && tv !== t0 && t0.length > tv.length){
      if(t0.toLowerCase().indexOf(tv.toLowerCase()) === t0.length - tv.length) cut = t0.slice(0, t0.length - tv.length);
      else if(t0.toLowerCase().indexOf(tv.toLowerCase()) === 0) cut = t0.slice(tv.length);
      cut = cut.replace(/^[\s·:,–\-]+|[\s·:,–\-]+$/g, "").trim(); if(cut.length < 3 || cut.length > 40) cut = "";
    }
    if(cut !== dropTxt){ dropTxt = cut; ans.drop = null; yn("drop", null); }
    $("lib-f-dropw").hidden = !cut; if(cut) $("lib-f-dropt").textContent = "Next time, leave “" + cut + "” out of titles?";
    $("lib-f-fgn").textContent = fgName($("lib-f-fg").value.trim());
    $("lib-f-found").innerHTML = foundFor(k);
    have = num ? libFind(k, num, $("lib-f-rel").value.trim()) : null; if(have === ctx.edit) have = null;
    var dup = $("lib-f-dup"), rel = $("lib-f-rel").value.trim(), older = !have && num && k && rel ? libOlder(k, num.toUpperCase(), rel) : null;
    var newer = !have && num && k ? libDocs().filter(function(x){ return x && x !== ctx.edit && x.kind === k && x.num === num.toUpperCase() && (+x.rel || 0) > (+rel || 0); })[0] : null;
    dup.hidden = !(have || older || newer); dup.classList.toggle("newer", !!older);
    if(have) dup.textContent = libDocChipText(have) + " is already in the Library" + (ctx.ro ? " — it will be linked, not added again." : " — it won’t be added twice.");
    else if(older) dup.textContent = "Newer than " + libDocLabel(older) + " in the Library — rel " + rel + " is filed and offered from now on; rel " + older.rel + " stays for the ROs that used it.";
    else if(newer) dup.textContent = "The Library already has a newer one, " + libDocLabel(newer) + " — this older release is filed beside it.";
    w.querySelector('[data-lib="go"]').disabled = !((num || k === "codes") && k) || !!(ctx.edit && have);   /* a code list may have no number */
    w.querySelectorAll(".lib-kd").forEach(function(b){ b.classList.toggle("maybe", !k && toss.indexOf(b.getAttribute("data-kind")) > -1); });
    if(ctx.ro){
      var t = $("lib-f-task").value; $("lib-f-tickt").textContent = "Tick “" + (t === "dtc" ? "Upload DTCs" : "Upload Report") + "” done";
      var opN = opPicked(), pw = $("lib-f-parts"); if(pw){ var nn = opN ? libPartsNew(opN, g).length : 0; pw.closest("label").hidden = !nn; $("lib-f-partst").textContent = "Add " + nn + " part" + (nn === 1 ? "" : "s") + " to the operation"; }
    }
  };
  var opPicked = function(){ var oid = $("lib-f-op") && $("lib-f-op").value; return ops.filter(function(o){ return o.id === oid; })[0] || op0; };
  var answer = function(){
    var num = $("lib-f-num").value.trim().toUpperCase(), k = kindNow(); if(!k) return null;
    if(!num && k === "codes") num = String($("lib-f-title").value.trim() || file.name.replace(/\.[a-z0-9]{2,5}$/i, "")).toUpperCase().slice(0, 40);   /* a code list with no number: its title stands in */
    if(!num) return null;
    /* 17.1: the codes go in only for Fault codes (a code list's mentions become rows too); the steps only for a procedure or a diagnostic */
    var isC = k === "codes", tbl = isC ? (g.table.length ? g.table : g.codes.map(function(c){ return { key: c, title: "", ftb: {} }; })) : [];
    var a = { kind: k, num: num, rel: $("lib-f-rel").value.trim(), date: $("lib-f-date").value.trim(), title: $("lib-f-title").value.trim(), fgrp: $("lib-f-fg").value.trim(),
      model: $("lib-f-model").value.trim(), years: libYears($("lib-f-years").value) || $("lib-f-years").value.trim(), info: g.info || "", proc: (k === "proc" || k === "diag") ? g.proc || null : null, mod: g.mod, opNo: g.opNo,
      codes: isC ? g.codes : [], table: tbl, learn: !$("lib-f-learnw").hidden && $("lib-f-learn").checked, drop: !$("lib-f-dropw").hidden && ans.drop ? dropTxt : "",
      parts: g.parts || [], labor: g.labor || [], chassis: g.chassis || [], symp: g.symp || [], fix: g.fix || "" };
    if(ctx.ro){ a.op = opPicked(); a.task = $("lib-f-task").value; a.tick = $("lib-f-tick").checked;
      a.addParts = !!($("lib-f-parts") && $("lib-f-parts").checked && !$("lib-f-parts").closest("label").hidden); a.useHrs = !!($("lib-f-hrs") && $("lib-f-hrs").checked); a.useFix = !!($("lib-f-fix") && $("lib-f-fix").checked); }
    return a;
  };
  var said = false, say = function(v){ if(said) return; said = true; cb(v); };
  w.addEventListener("click", function(e){
    var kb = e.target.closest && e.target.closest(".lib-kd");
    if(kb){ w.querySelectorAll(".lib-kd").forEach(function(b){ b.classList.toggle("on", b === kb); b.setAttribute("aria-checked", String(b === kb)); }); paint(); return; }
    var y = e.target.closest && e.target.closest("[data-yn]");
    if(y){ yn(y.getAttribute("data-yn"), y.getAttribute("data-v") === "1"); return; }
    var b = e.target.closest && e.target.closest("[data-lib]");
    if(!b){ if(e.target === w) say(ctx.list ? "back" : null); return; }
    var act = b.getAttribute("data-lib");
    if(act === "go"){ var a = answer(); if(a) say(a); }
    else say(act === "plain" ? "plain" : act === "back" ? "back" : null);
  });
  w.addEventListener("input", function(e){ var c = e.target.closest && e.target.closest(".lib-f-c.doubt"); if(c) c.classList.remove("doubt"); paint(); });
  w.addEventListener("change", paint);
  /* point at a field (or tab into it) and its words light up on the page */
  w.querySelectorAll(".lib-f-c[data-f]").forEach(function(c){
    var f = c.getAttribute("data-f");
    c.addEventListener("mouseenter", function(){ showSrc(f); });
    c.addEventListener("focusin", function(){ showSrc(f); });
  });
  /* Enter files it, Esc doesn't (in a list, Esc goes back to it) */
  LIB_ASK.key = function(e){
    if(!LIB_ASK.el) return;
    if(e.key === "Escape"){ e.preventDefault(); e.stopPropagation(); say(ctx.list ? "back" : null); return; }
    if(e.key === "Enter" && !(e.target && e.target.tagName === "BUTTON")){ e.preventDefault(); e.stopPropagation(); var go = w.querySelector('[data-lib="go"]'); if(go && !go.disabled) go.click(); return; }
    if(!/^(Tab|Shift)$/.test(e.key)) e.stopPropagation();
  };
  document.addEventListener("keydown", LIB_ASK.key, true);
  paint();
  setTimeout(function(){ var t = !kindNow() ? w.querySelector(".lib-kd.maybe") || w.querySelector(".lib-kd") : w.querySelector('[data-lib="go"]'); if(t) try{ t.focus({ preventScroll: true }); }catch(er){} }, 30);
}

/* change a filed document's details (the same card, with Save) */
function libEdit(d, done){
  libAskShow({ reading: "" });
  var g = { kind: d.kind, num: d.num, rel: d.rel, date: d.date, title: d.title, fgrp: d.fgrp, model: d.model, years: d.years, info: d.info, mod: d.mod, opNo: d.opNo, codes: d.codes || [], table: [], how: "",
    parts: d.parts, labor: d.labor, chassis: d.chassis, symp: d.symp, fix: d.fix };
  libAskForm({ name: (d.file && d.file.name) || libDocLabel(d) }, g, { edit: d }, function(a){
    libAskClose();
    if(!a || a === "plain" || a === "back"){ if(done) done(false); return; }
    pushUndo("library");
    ["kind", "num", "rel", "date", "title", "fgrp", "model", "years"].forEach(function(k){ d[k] = a[k]; });
    if(a.kind === "codes" && a.table && a.table.length) libMergeCodes(d, a.table);   /* 17.1: made Fault codes — its codes go in */
    libLearn(a);
    scheduleSave(true);
    if(done) done(true);
  });
}
