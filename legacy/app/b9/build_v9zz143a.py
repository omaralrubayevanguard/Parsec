# Parsec 14.3 (fork EA) — the ROs tab: the RO list (b9/rl1.js rlEmbed) inside Triage, Foreman, Parts and Manager (and Technician, fork EB),
# a row opens the RO page whose crumb goes back to the page, the RO list's keys while it's on. Base code patched here; Parts and Manager in pt2/mg1.
# Runs inside build12.py: uses js, rep, b9, json, EXTRA_CSS, HOOK_NAMES, LOG.
EXTRA_CSS.append(b9("v143a.css"))
js = rep(js, 'var TG_CAT = {', "TG_IC.list = '<path d=\"M9 6.5h10.5M9 12h10.5M9 17.5h10.5\"/><circle cx=\"5\" cy=\"6.5\" r=\"1.1\"/><circle cx=\"5\" cy=\"12\" r=\"1.1\"/><circle cx=\"5\" cy=\"17.5\" r=\"1.1\"/>';   /* Parsec 14.3 */\nvar TG_CAT = {")

# Triage and Foreman: ROs, last of the views — the RO list in the body
js = rep(js, '  var views = [["inbox", "inbox", "Inbox"], ["desk", "grid", "Desk"], ["yard", "pin", "Yard"]];',
             '  var views = [["inbox", "inbox", "Inbox"], ["desk", "grid", "Desk"], ["yard", "pin", "Yard"]].concat(typeof rlEmbOk === "function" && rlEmbOk() ? [["ros", "list", "ROs"]] : []);')
js = rep(js, '  var views = [["floor", "grid", "Floor"], ["techs", "user", "Techs"], ["yard", "pin", "Yard"], ["tmr", "clock", "Tomorrow"]];',
             '  var views = [["floor", "grid", "Floor"], ["techs", "user", "Techs"], ["yard", "pin", "Yard"], ["tmr", "clock", "Tomorrow"]].concat(typeof rlEmbOk === "function" && rlEmbOk() ? [["ros", "list", "ROs"]] : []);')
# the tab's label carries the count (both headers draw "tgI(icon) + label")
js = rep(js, """data-action="tg-view" data-v="' + v[0] + '" title="' + v[2] + ' view (' + (i + 1) + ')">' + tgI(v[1], 14) + v[2] + '</button>';""",
             """data-action="tg-view" data-v="' + v[0] + '" title="' + (v[0] === "ros" ? "Every open RO — the RO list, your columns" : v[2] + ' view (' + (i + 1) + ')') + '">' + tgI(v[1], 14) + (v[0] === "ros" ? rlEmbTab() : v[2]) + '</button>';""")
js = rep(js, """data-action="fm-view" data-v="' + x[0] + '" title="' + x[2] + ' (' + (i + 1) + ')">' + tgI(x[1], 14) + x[2] + '</button>';""",
             """data-action="fm-view" data-v="' + x[0] + '" title="' + (x[0] === "ros" ? "Every open RO — the RO list, your columns" : x[2] + ' (' + (i + 1) + ')') + '">' + tgI(x[1], 14) + (x[0] === "ros" ? rlEmbTab() : x[2]) + '</button>';""")
js = rep(js, "  var ro = tgSel();\n", "  if(UI.tgView === \"ros\"){ if(typeof rlEmbOk === \"function\" && rlEmbOk()) return '<div class=\"tg\" data-key=\"tg\">' + tgHead() + rlEmbed('triage') + '</div>'; UI.tgView = \"inbox\"; }   /* Parsec 14.3 */\n  var ro = tgSel();\n")
js = rep(js, '  var body = v === "techs" ? fmVTechs(sel)', "  if(v === \"ros\"){ if(typeof rlEmbOk === \"function\" && rlEmbOk()) return '<div class=\"tg fm\" data-key=\"fm\">' + fmHead() + rlEmbed('foreman') + '</div>'; UI.fmView = v = \"floor\"; }   /* Parsec 14.3 */\n  var body = v === \"techs\" ? fmVTechs(sel)")
# their own single keys rest while the RO list is up
js = rep(js, 'if(UI.view !== "foreman" || UI.palette) return;', 'if(UI.view !== "foreman" || UI.palette || UI.fmView === "ros") return;')
js = rep(js, 'if(UI.view !== "triage" || UI.palette) return;', 'if(UI.view !== "triage" || UI.palette || UI.tgView === "ros") return;')
# the frame: keys and the outside click go to the RO list while it's on a page; its popover is placed after each draw
js = rep(js, 'var cur = MODS[UI.view]; if(!cur || !cur.keydown) return;', 'var cur = typeof rlEmbOn === "function" && rlEmbOn() ? MODS.rolist : MODS[UI.view]; if(!cur || !cur.keydown) return;')
js = rep(js, 'var cur = MODS[UI.view]; if(!cur || !cur.U) return; var U = cur.U();', 'var cur = typeof rlEmbOn === "function" && rlEmbOn() ? MODS.rolist : MODS[UI.view]; if(!cur || !cur.U) return; var U = cur.U();')
js = rep(js, 'try{ var pgm = PG.mods[UI.view]; if(pgm && pgm.after) pgm.after(); }catch(e){ console.error(e); }',
             'try{ var pgm = PG.mods[UI.view]; if(pgm && pgm.after) pgm.after(); }catch(e){ console.error(e); }\n  try{ if(UI.view !== "ros") UI.roFrom = null; if(typeof rlEmbAfter === "function") rlEmbAfter(); }catch(e){}   /* Parsec 14.3 */')
# the RO page: opened from a page's ROs tab, its crumb names that page and goes back to it; ⌃ ⌄ follow that list's order
js = rep(js, 'function openRo(roId, opId){', 'function openRo(roId, opId){ UI.roFrom = UI._roFromNext || null; UI._roFromNext = null; if(!UI.roFrom) UI.rlOrder = null;')
js = rep(js, "  var root = el('div', { class: 'pxr rop-r' }, [pxHeader(), pro]);", "  var root = el('div', { class: 'pxr rop-r' }, [typeof rlCrumbFix === 'function' ? rlCrumbFix(pxHeader()) : pxHeader(), pro]);")
js = rep(js, 'function rlList(){', 'function rlList(){ if(UI.view === "ros" && UI.roFrom && Array.isArray(UI.rlOrder)){ var L0 = UI.rlOrder.map(function(id){ return getRO(id); }).filter(function(r){ return r && !r.shop; }); if(L0.length) return L0; }   /* Parsec 14.3 */')
js = rep(js, 'case "nav": if(t.dataset.view === "timelog") UI.tlMe = 1;', 'case "nav": UI.roFrom = null; if(t.dataset.view === "timelog") UI.tlMe = 1;')
# the RO page rebuilds its bar when where it was opened from changes (the same RO from Foreman, then from Parts)
js = rep(js, "  if ((keyFor(ro) !== lastKey || UI.jcOpenDetails) && !busy()) render();", "  if ((keyFor(ro) !== lastKey || UI.jcOpenDetails || (UI.roFrom || '') !== (attach.rf || '')) && !busy()){ attach.rf = UI.roFrom || ''; render(); }")
js = rep(js, "    RO = ro; S = makeFacade(ro); soloJob = null;", "    RO = ro; S = makeFacade(ro); attach.rf = UI.roFrom || ''; soloJob = null;")
HOOK_NAMES += ["rlEmbed", "rlEmbedCount", "rlEmbOn", "rlBackName"]
LOG.append("Parsec 14.3 (EA): the ROs tab on Triage, Foreman, Parts, Manager")
