/* Parsec · library · intake-list.js
   Filing a stack of files (17.3): a progress window while they read, then one list with each file's kind, number and whether it's ready, needs a check or is already in the Library; open a row to check it, or file the ready ones in one click.
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   libIntakeMany libItemSt libAnswerOf libListShow LIB_F_NAME (4 functions, 1 constant)
   uses       ro/
*/
/* ============================== a stack of files (Parsec 17.3) ==============================
   libIntakeMany(files, ctx, done) is libIntake for two or more files. Each is read in turn under a progress window
   ("Reading 3 of 12"), then one list shows them all:
     ✓ ready        a kind and a number, nothing marked to check
     check          no kind (or a toss-up), no number, or a field marked to check
     in the Library the same number and release is there already
   A row opens the usual card (library/intake.js) with ‹ Back to the list; File N ready files every ready row as it
   was read. From an RO, a file that isn't a Volvo document is attached the usual way, as with one file.
   Nothing is filed without a click. done({ filed, plain }) as libIntake. */
function libIntakeMany(L, ctx, done){
  var res = { filed: [], plain: [] }, items = [], i = 0;
  var readNext = function(){
    if(i >= L.length){ libListShow(items, ctx, res, done); return; }
    var f = L[i]; i++;
    libAskShow({ reading: f.name, n: i, of: L.length });
    libReadFile(f).then(function(r){ return r; }, function(){ return { text: "", pages: null, err: 1 }; }).then(function(r){
      var got = libDocRead(r.text, f.name, r.pages); got.readErr = !!r.err && /\.pdf$/i.test(f.name || "");
      if(ctx.ro && !got.num) res.plain.push(f);   /* not a Volvo document: attached as usual */
      else items.push({ f: f, g: got, st: "" });
      readNext();
    });
  };
  readNext();
}
var LIB_F_NAME = { num: "number", "title": "the title", model: "trucks", years: "model years" };
function libItemSt(it){
  if(it.st) return it.st;   /* filed · skip · plain */
  var g = it.g, k = g.kind, num = String(g.num || "").toUpperCase();
  if(k && num && libFind(k, num, g.rel)) return "have";
  if(!k || (!num && k !== "codes") || Object.keys(g.doubt || {}).length) return "check";
  return "ready";
}
/* a row filed as it was read: the same answer the card gives when nothing is changed */
function libAnswerOf(g, f, ctx){
  var k = g.kind, num = String(g.num || "").toUpperCase();
  if(!num && k === "codes") num = String(g.title || f.name.replace(/\.[a-z0-9]{2,5}$/i, "")).toUpperCase().slice(0, 40);
  var isC = k === "codes", tbl = isC ? (g.table.length ? g.table : g.codes.map(function(c){ return { key: c, title: "", ftb: {} }; })) : [];
  var a = { kind: k, num: num, rel: g.rel || "", date: g.date || "", title: g.title || "", fgrp: g.fgrp || "", model: g.model || "", years: g.years || "", info: g.info || "",
    proc: (k === "proc" || k === "diag") ? g.proc || null : null, mod: g.mod, opNo: g.opNo, codes: isC ? g.codes : [], table: tbl, learn: false, drop: "",
    parts: g.parts || [], labor: g.labor || [], chassis: g.chassis || [], symp: g.symp || [], steps: g.steps || [], fix: g.fix || "" };
  if(ctx.ro){ var ops = ctx.ro.operations || []; a.op = ctx.op || ops.filter(function(o){ return !o.declined; })[0] || ops[0] || null; a.task = isC ? "dtc" : "report"; a.tick = false; }
  return a;
}
function libListShow(items, ctx, res, done){
  if(!items.length){ libAskClose(); if(done) done(res); return; }
  var busy = false;
  var finish = function(){ libAskClose(); if(done) done(res); };
  var stTxt = function(it){
    var s = libItemSt(it), g = it.g;
    if(s === "ready") return "✓ ready";
    if(s === "filed") return "✓ filed";
    if(s === "skip") return "not filed";
    if(s === "plain") return "attached";
    if(s === "have") return "in the Library";
    var D = Object.keys(g.doubt || {});
    return "check · " + (!g.kind ? ((g.toss || []).length > 1 ? (g.toss.map(function(k){ return (libKind(k) || {}).one || k; }).join(" or ")) + "?" : "the kind") : !g.num && g.kind !== "codes" ? "no number" : D.map(function(f){ return LIB_F_NAME[f] || f; }).join(", "));
  };
  var draw = function(){
    var w = libAskShow({ reading: "" }), C = { ready: 0, check: 0, have: 0, filed: 0, skip: 0, plain: 0 };
    items.forEach(function(it){ C[libItemSt(it)]++; });
    var sum = [C.ready ? C.ready + " ready" : "", C.check ? C.check + " to check" : "", C.have ? C.have + " in the Library" : "", C.filed ? C.filed + " filed" : "", C.skip ? C.skip + " not filed" : ""].filter(Boolean).join(" · ");
    w.querySelector(".roreo-c").className = "roreo-c lib-ask-c lib-list-c";
    w.querySelector(".roreo-c").innerHTML = '<div class="roreo-h"><span class="roreo-i" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M7 3.5h7l4 4V20a.5.5 0 0 1-.5.5h-10A.5.5 0 0 1 7 20z"/><path d="M14 3.5V8h4M9.5 12.5h5M9.5 16h5"/></svg></span>'
      + '<div><b>' + items.length + ' files read</b><p>' + libE(sum) + (C.check ? ' — open a row to check it' : '') + '</p></div></div>'
      + '<div class="lib-list" role="list">' + items.map(function(it, n){
          var g = it.g, s = libItemSt(it), kd = libKind(g.kind), done2 = s === "filed" || s === "skip" || s === "plain";
          return '<button type="button" role="listitem" class="lib-li st-' + s + '" data-n="' + n + '"' + (done2 ? ' disabled' : '') + ' title="' + (done2 ? '' : 'Open it to check or change what was read') + '">'
            + '<span class="lib-li-f">' + libE(it.f.name) + '</span>'
            + '<span class="lib-li-k' + (kd ? ' k-' + kd.k : '') + '">' + (kd ? '<i></i>' + libE(kd.one) : '<i></i>?') + '</span>'
            + '<span class="lib-li-n mono">' + libE((it.d ? libDocLabel(it.d) : (g.num ? g.num + (g.rel ? " rel " + g.rel : "") : "—"))) + '</span>'
            + '<span class="lib-li-s">' + libE(stTxt(it)) + '</span></button>';
        }).join("") + '</div>'
      + (res.plain.length ? '<div class="lib-list-plain">' + res.plain.length + ' other file' + (res.plain.length === 1 ? ' isn’t a Volvo document — it’s' : 's aren’t Volvo documents — they’re') + ' attached the usual way.</div>' : '')
      + '<div class="roreo-a"><button type="button" class="roreo-b" data-ll="done">Done</button><button type="button" class="roreo-b pri" data-ll="ready"' + (C.ready ? '' : ' disabled') + '>File ' + C.ready + ' ready</button></div>';
    w.addEventListener("click", function(e){
      if(busy) return;
      var r = e.target.closest && e.target.closest(".lib-li[data-n]");
      if(r && !r.disabled){ open(items[+r.getAttribute("data-n")]); return; }
      var b = e.target.closest && e.target.closest("[data-ll]");
      if(b && b.getAttribute("data-ll") === "ready" && !b.disabled){ fileReady(); return; }
      if((b && b.getAttribute("data-ll") === "done") || e.target === w) finish();
    });
    LIB_ASK.key = function(e){
      if(!LIB_ASK.el) return;
      if(e.key === "Escape"){ e.preventDefault(); e.stopPropagation(); finish(); return; }
      if(e.key === "Enter" && !(e.target && e.target.tagName === "BUTTON")){ e.preventDefault(); e.stopPropagation(); var go = w.querySelector('[data-ll="ready"]'); if(go && !go.disabled) go.click(); return; }
      if(!/^(Tab|Shift)$/.test(e.key)) e.stopPropagation();
    };
    document.addEventListener("keydown", LIB_ASK.key, true);
    setTimeout(function(){ var t = w.querySelector('[data-ll="ready"]:not([disabled])') || w.querySelector(".lib-li:not([disabled])") || w.querySelector('[data-ll="done"]'); if(t) try{ t.focus({ preventScroll: true }); }catch(er){} }, 30);
  };
  var open = function(it){
    libAskShow({ reading: it.f.name });
    libAskForm(it.f, it.g, Object.assign({}, ctx, { list: true }), function(a){
      if(a === "back"){ draw(); return; }
      if(a === "plain"){ res.plain.push(it.f); it.st = "plain"; draw(); return; }
      if(!a){ it.st = "skip"; draw(); return; }
      libFileOne(a, it.f, ctx, true).then(function(d){ res.filed.push(d); it.st = "filed"; it.d = d; draw(); }, function(){ draw(); });
    });
  };
  var fileReady = function(){
    var R = items.filter(function(it){ return libItemSt(it) === "ready"; }), k = 0, n = 0; busy = true;
    var step = function(){
      if(k >= R.length){ busy = false; var left = items.filter(function(it){ var s = libItemSt(it); return s === "check" || s === "have"; });
        pushToast(n + " filed" + (left.length ? " · " + left.length + " waiting for you" : "") + "."); draw(); return; }
      var it = R[k++];
      libFileOne(libAnswerOf(it.g, it.f, ctx), it.f, ctx, true).then(function(d){ res.filed.push(d); it.st = "filed"; it.d = d; n++; step(); }, function(){ step(); });
    };
    step();
  };
  draw();
}
