# Parsec 12 — the New RO import from ASIST (b9/imp1.js, b9/imp.css). Exec'd by build12.py on `js`.
# Every New RO button, the old New RO pop-up, the Triage extraction box and paste all open IMPX; the RO page gets Import.

# the module goes in with the page modules (it only defines functions and a few document listeners when it loads)
_imp_anchor = "/* ============================== Parsec 9 — page modules ============================== */\n"
assert js.count(_imp_anchor) == 1
js = js.replace(_imp_anchor, b9("imp1.js") + "\n" + _imp_anchor, 1)
EXTRA_CSS.append(b9("imp.css"))
KEEP_EXTRA += ["IMPX"]
HOOK_NAMES += ["IMPX"]

# ---------- every way into New RO opens the import ----------
_i0 = js.index("function tyExtract(text, files){"); _i1 = js.index("\n}\n", _i0) + 3
js = js[:_i0] + "function tyExtract(text, files){   /* Parsec 12: the Triage box hands what it has to the import */\n  UI.trMenu = false; IMPX.open({ text: text || \"\", files: files || null, form: UI.trForm || {} });\n}\n" + js[_i1:]
js = rep(js, '  if(a === "ty-newro"){ UI.modal = { type: "add-ro" }; UI.trMenu = false; render(); setTimeout(function(){ var ta = document.getElementById("imp-text"); if(ta) ta.focus(); }, 40); return true; }',
         '  if(a === "ty-newro"){ UI.trMenu = false; render(); IMPX.open({}); return true; }')
js = rep(js, '    case "open-add-ro": UI.modal={type:"add-ro"}; UI.appMenu=false; render(); break;', '    case "open-add-ro": UI.modal = null; UI.appMenu = false; render(); IMPX.open({}); break;')
js = rep(js, '  if(k === "n" && !e.defaultPrevented && navAllowed("ros")){ e.preventDefault(); UI.modal = { type:"add-ro" }; render(); return; }',
         '  if(k === "n" && !e.defaultPrevented && navAllowed("ros")){ e.preventDefault(); IMPX.open({}); return; }')
# anything else that still asks for the old pop-up gets the import instead
js = rep(js, "  try{ pmBeforeRender(); }catch(e){ console.error(e); }\n  LAST_RENDER = Date.now();",
         "  if(UI.modal && UI.modal.type === \"add-ro\"){ UI.modal = null; setTimeout(function(){ IMPX.open({}); }, 0); }   /* Parsec 12: New RO is the import */\n  try{ pmBeforeRender(); }catch(e){ console.error(e); }\n  LAST_RENDER = Date.now();")

# ---------- the RO page: Import in the header and in Options ----------
js = rep(js, "    el('span', { class: 'px-head__sep', 'aria-hidden': 'true' }),\n    el('button', { class: 'px-btn px-btn--ghost px-btn--icon px-btn--sm', type: 'button', title: 'Copy RO number',",
         "    el('span', { class: 'px-head__sep', 'aria-hidden': 'true' }),\n    el('button', { class: 'px-btn px-btn--ghost px-btn--icon px-btn--sm', type: 'button', title: 'Import from ASIST — paste or drop the case, it shows what changes', 'aria-label': 'Import from ASIST', html: pxI('note'), onClick: function () { IMPX.open({ ro: RO }); } }),\n    el('button', { class: 'px-btn px-btn--ghost px-btn--icon px-btn--sm', type: 'button', title: 'Copy RO number',")
js = rep(js, "          pxMenuItem('note', 'Extract operations…', { run: function () { jcRunOpt('extract'); } }),",
         "          pxMenuItem('note', 'Import from ASIST…', { run: function () { IMPX.open({ ro: RO }); } }),\n          pxMenuItem('note', 'Extract operations…', { run: function () { jcRunOpt('extract'); } }),")

# ---------- people added from ASIST: on the Team, but no sign-in ----------
js = rep(js, "function pxSignInHtml(){\n  var l = staffList(),", "function pxSignInHtml(){\n  var l = staffList().filter(function(sf){ return !sf.noSignIn; }),")
js = rep(js, "    + staffList().map(function(s){ return '<option value=\"'+s.id+'\"'+(cur === s.id ? ' selected' : '')", "    + staffList().filter(function(s){ return !s.noSignIn; }).map(function(s){ return '<option value=\"'+s.id+'\"'+(cur === s.id ? ' selected' : '')")
js = rep(js, "const DEPT={'Technician':'Technicians',", "const DEPT={'Other':'From ASIST','Technician':'Technicians',")

# ---------- ASIST's notes in Activity: the RO page's pop-up and the Technician page ----------
js = rep(js, "  S.jobs.forEach(function (j, i) { (Array.isArray(j.offNotes) ? j.offNotes : []).forEach(function (n) { ev.push({ at: +new Date(n.at), note: n, op: i + 1 }); }); });\n  ev.sort(function (a, b) { return a.at - b.at; });\n  return ev;",
         "  S.jobs.forEach(function (j, i) { (Array.isArray(j.offNotes) ? j.offNotes : []).forEach(function (n) { ev.push({ at: +new Date(n.at), note: n, op: i + 1 }); }); });\n  (Array.isArray(RO.extNotes) ? RO.extNotes : []).forEach(function (n) { ev.push({ at: +new Date(n.at), note: n, ext: 1 }); });   /* Parsec 12: ASIST's notes */\n  ev.sort(function (a, b) { return a.at - b.at; });\n  return ev;")
js = rep(js, "function noteEv(x) { return el('div', { class: 'px-ev' }, [el('span', { class: 'px-av', text: ivInit(x.note.by || RO.assignedTech) }), el('span', { html: '<b>' + esc(x.note.by || RO.assignedTech || 'You') + '</b> left a note on operation ' + x.op }),",
         "function noteEv(x) { return el('div', { class: 'px-ev' }, [el('span', { class: 'px-av', text: x.ext && !x.note.by ? 'AS' : ivInit(x.note.by || RO.assignedTech) }), el('span', { html: '<b>' + esc(x.note.by || (x.ext ? 'ASIST' : RO.assignedTech) || 'You') + '</b> ' + (x.ext ? (x.note.by ? 'wrote in ASIST' : 'system note') : 'left a note on operation ' + x.op) }),")
if js.count("    (r.ro.operations || []).forEach((op, i) => (Array.isArray(op.offNotes) ? op.offNotes : []).forEach(n => ev.push({ at: +new Date(n.at), n, op: i + 1 })));\n"):   # Parsec 14.3: the Technician page's own Activity went (the RO page's shows)
    js = rep(js, "    (r.ro.operations || []).forEach((op, i) => (Array.isArray(op.offNotes) ? op.offNotes : []).forEach(n => ev.push({ at: +new Date(n.at), n, op: i + 1 })));\n",
             "    (r.ro.operations || []).forEach((op, i) => (Array.isArray(op.offNotes) ? op.offNotes : []).forEach(n => ev.push({ at: +new Date(n.at), n, op: i + 1 })));\n    (Array.isArray(r.ro.extNotes) ? r.ro.extNotes : []).forEach(n => ev.push({ at: +new Date(n.at), n, ext: 1 }));   /* Parsec 12: ASIST's notes */\n")
if js.count("${PG.av(x.n.by || r.ro.assignedTech || 'You')}<span><b>${esc(x.n.by || r.ro.assignedTech || 'You')}</b> left a note on operation ${x.op}<q>"):   # Parsec 14.3: the Technician page's own Activity went (the RO page's shows)
    js = rep(js, "${PG.av(x.n.by || r.ro.assignedTech || 'You')}<span><b>${esc(x.n.by || r.ro.assignedTech || 'You')}</b> left a note on operation ${x.op}<q>",
             "${PG.av(x.n.by || (x.ext ? 'ASIST' : r.ro.assignedTech) || 'You')}<span><b>${esc(x.n.by || (x.ext ? 'ASIST' : r.ro.assignedTech) || 'You')}</b> ${x.ext ? (x.n.by ? 'wrote in ASIST' : 'system note') : 'left a note on operation ' + x.op}<q>")
js = rep(js, "function importStatus(msg, kind){", "function importStatus(msg, kind){ try{ if(IMPX.isOpen()) msg = IMPX.statusText(msg); }catch(e){}")
LOG.append("Parsec 12 import: IMPX in, New RO routed to it, RO page Import, ASIST notes in Activity")
