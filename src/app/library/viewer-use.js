/* Parsec · library · viewer-use.js
   The document panel's use (17.3): what it's valid for, its symptoms and repair steps to tick from an operation, Attach to… with the ROs it fits first, and the expand button that makes the panel a page of its own.
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   libRoName libOpenRos libOpFor libRosFor libViewBtns libViewSum libViewTick libAttachMenu libViewAct (9 functions)
   state      ros
   uses       data/ ro/ ro-page/ shell/ state/
*/
/* ============================== using a document from its panel (Parsec 17.3) ==============================
   Above the PDF in the panel (library/viewer.js): Valid for (the trucks and years, in words), the symptoms, and the
   repair steps — ticked from an operation, kept in op.procDone[doc id] the way an Impact procedure's are.
   In the panel's header: Attach to… lists the open ROs, the ones it fits (and whose codes or complaint it matches) first,
   and puts it on the operation it matches; ⤢ makes the panel a page of its own, and back. */
/* "RO-31907" or "RO 33212", never "RO RO-31907" */
function libRoName(ro){ var n = String(ro && ro.roNumber || "").trim(); return /^RO\b/i.test(n) ? n : "RO " + n; }
function libOpenRos(){ return (STATE.ros || []).filter(function(r){ return r && !r.shop && !r.dateClosed; }); }
/* the operation on an RO a document is for: its code, then its symptom, else the first one being worked */
function libOpFor(ro, d){
  var ops = (ro.operations || []).filter(function(o){ return !o.declined; }), codes = {}; (d.codes || []).forEach(function(k){ codes[k] = 1; });
  return ops.filter(function(o){ return (o.faults || []).some(function(f){ return codes[libCodeKey(f)]; }); })[0]
    || ops.filter(function(o){ return libSympHit(d, [o.complaint, o.cause].join(" ")); })[0] || ops[0] || (ro.operations || [])[0] || null;
}
/* every open RO, the best fits first: { ro, op, fit, why, rank } */
function libRosFor(d){
  return libOpenRos().map(function(ro){
    var fit = libFits(d, ro), op = libOpFor(ro, d), codes = {}; (d.codes || []).forEach(function(k){ codes[k] = 1; });
    var byCode = (ro.operations || []).some(function(o){ return (o.faults || []).some(function(f){ return codes[libCodeKey(f)]; }); });
    var sym = ""; (ro.operations || []).some(function(o){ sym = libSympHit(d, [o.complaint, o.cause].join(" ")); return !!sym; });
    var on = (ro.operations || []).some(function(o){ return (o.docs || []).some(function(x){ return x.id === d.id; }); });
    var rank = on ? 5 : fit && !fit.ok ? 4 : (byCode || sym) && fit && fit.ok ? 0 : byCode || sym ? 1 : fit && fit.ok ? 2 : 3;
    var why = on ? "already on it" : fit && !fit.ok ? "doesn’t fit" : byCode ? "its code" + (fit && fit.ok ? " · fits" : "") : sym ? "“" + sym + "”" + (fit && fit.ok ? " · fits" : "") : fit && fit.ok ? "fits" : "";
    return { ro: ro, op: op, fit: fit, why: why, rank: rank, on: on };
  }).sort(function(a, b){ return a.rank - b.rank || String(a.ro.roNumber || "").localeCompare(String(b.ro.roNumber || "")); });
}
/* the header's two buttons */
function libViewBtns(d){
  return '<button type="button" class="lib-view-b lib-att-b" data-lv="att" title="Put it on an RO — the ones it fits come first">Attach to… ▾</button>'
    + '<button type="button" class="lib-view-x lib-full-b" data-lv="full" aria-label="Expand to a page of its own" title="Expand to a page of its own"><svg viewBox="0 0 24 24"><path d="M14 4h6v6M10 20H4v-6M20 4l-7 7M4 20l7-7"/></svg></button>';
}
/* Valid for · Symptoms · Repair steps (ticked from an operation) */
function libViewSum(d, ctx){
  var op = ctx && ctx.op, S = d.steps || [], done = {}; libProcDone(op, d).forEach(function(n){ done[n] = 1; });
  var valid = [d.model, d.years].filter(Boolean).join(" · ");
  var h = '';
  if(valid || (d.chassis || []).length) h += '<div class="lib-vs-r"><b>Valid for</b><span>' + libE(valid || "") + (d.chassis || []).map(function(x){ return (valid ? " · " : "") + "chassis " + x[0] + "–" + x[1]; }).join("") + '</span></div>';
  if((d.symp || []).length) h += '<div class="lib-vs-r"><b>Symptoms</b><span>' + d.symp.map(libE).join(" · ") + '</span></div>';
  if(S.length){
    var n = S.filter(function(s){ return done[s.n]; }).length;
    h += '<div class="lib-vs-st"><div class="lib-vs-sh"><b>Repair steps</b>' + (op ? '<span class="lib-pbar"><i style="width:' + (n / S.length * 100).toFixed(1) + '%"></i></span><span>' + n + ' of ' + S.length + ' done · OP ' + (((ctx.ro && ctx.ro.operations) || []).indexOf(op) + 1) + '</span>' : '<span>' + S.length + ' steps · open it from an operation to tick them</span>') + '</div>'
      + S.map(function(s){ return '<div class="lib-ps' + (done[s.n] ? ' ok' : '') + '">' + (op ? '<button type="button" class="lib-pk" data-step="' + s.n + '" role="checkbox" aria-checked="' + !!done[s.n] + '" aria-label="Step ' + s.n + ' done"></button>' : '<span class="lib-pk ro"></span>')
        + '<span class="lib-pn mono">' + s.n + '</span><div class="lib-pt"><span>' + libE(s.t) + '</span>' + (s.notes || []).map(function(x){ return '<small>' + libE(x) + '</small>'; }).join("") + '</div></div>'; }).join("") + '</div>';
  } else if(d.fix) h += '<div class="lib-vs-r"><b>Repair</b><span>' + libE(d.fix) + '</span></div>';
  return h ? '<div class="lib-vs">' + h + '</div>' : '';
}
/* a tick on a step: kept on the operation */
function libViewTick(w, d, ctx, n){
  var op = ctx && ctx.op; if(!op) return;
  var L = libProcDone(op, d).slice(), i = L.indexOf(n); if(i < 0) L.push(n); else L.splice(i, 1);
  op.procDone = op.procDone || {}; op.procDone[d.id] = L.sort(function(a, z){ return a - z; });
  scheduleSave(true);
  var box = w.querySelector(".lib-vs"); if(box){ var t = document.createElement("div"); t.innerHTML = libViewSum(d, ctx); box.replaceWith(t.firstChild); }
  try{ if(typeof JC !== "undefined" && JC.rerender) JC.rerender(); }catch(e){}
}
/* Attach to…: a menu of the open ROs, the best fits first */
function libAttachMenu(w, d, btn){
  var old = w.querySelector(".lib-att-m"); if(old){ old.remove(); return; }
  var L = libRosFor(d);
  var m = document.createElement("div"); m.className = "lib-att-m"; m.setAttribute("role", "menu");
  m.innerHTML = L.length ? L.slice(0, 14).map(function(x, i){
    return '<button type="button" role="menuitem" class="lib-att-i' + (x.rank <= 2 ? " fit" : x.rank === 4 ? " no" : "") + '" data-att="' + i + '"' + (x.on ? ' disabled' : '') + '><i></i><span><b class="mono">' + libE(libRoName(x.ro)) + '</b> ' + libE(x.ro.customerName || "") + '</span><em>' + libE(x.why) + '</em></button>';
  }).join("") : '<div class="lib-att-none">No open ROs</div>';
  btn.insertAdjacentElement("afterend", m);
  m.addEventListener("click", function(e){
    var b = e.target.closest && e.target.closest("[data-att]"); if(!b || b.disabled) return;
    e.stopPropagation();
    var x = L[+b.getAttribute("data-att")]; m.remove(); if(!x || !x.op) return;
    pushUndo("document");
    libAttach(x.ro, x.op, d, d.dtc ? "dtc" : "report", function(){ try{ render(); }catch(er){} });
    pushToast(libDocChipText(d) + " is on " + libRoName(x.ro) + " · OP " + ((x.ro.operations || []).indexOf(x.op) + 1) + " — a copy is in its Files.");
    try{ render(); }catch(er){}
  });
}
/* the header's buttons, the steps, and the expand */
function libViewAct(w, d, ctx, b){
  if(b.hasAttribute("data-step")){ libViewTick(w, d, ctx, +b.getAttribute("data-step")); return true; }
  var k = b.getAttribute("data-lv");
  if(k === "att"){ LIB_VIEW.peek = false; libAttachMenu(w, d, b); return true; }
  if(k === "full"){ LIB_VIEW.peek = false; var on = w.classList.toggle("lib-view-full"); b.setAttribute("aria-label", on ? "Back to the side" : "Expand to a page of its own"); b.title = b.getAttribute("aria-label");
    b.innerHTML = on ? '<svg viewBox="0 0 24 24"><path d="M4 14h6v6M20 10h-6V4M14 10l7-7M10 14l-7 7"/></svg>' : '<svg viewBox="0 0 24 24"><path d="M14 4h6v6M10 20H4v-6M20 4l-7 7M4 20l7-7"/></svg>'; return true; }
  return false;
}
