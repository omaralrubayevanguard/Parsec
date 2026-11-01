# Build Parsec_5.html: Parsec_4.html (with the new Triage) + the new Foreman (fm1-4.js / fm.css) and the patches it needs.
import os, sys, json, re
H = os.path.dirname(os.path.abspath(__file__))
B = os.path.join(os.path.dirname(H), "build")
sys.path.insert(0, B)
import parts as P

src = open(os.path.join(H, "Parsec_4.html"), encoding="utf-8").read()
js = "\n".join(open(os.path.join(H, f), encoding="utf-8").read() for f in ["fm1.js", "fm2.js", "fm3.js", "fm4.js"])

# ---------- the stylesheet: the mock-up's Foreman CSS, minus the mock's own shell, plus the app bits ----------
def css_block(path, name):
    t = open(os.path.join(B, path), encoding="utf-8").read()
    m = re.search(name + r' = (?:shell \+ )?r"""(.*?)"""', t, re.S)
    assert m, (path, name)
    return m.group(1)
parts_css = [css_block("make_foreman.py", "CSS"), css_block("make_foreman_needs.py", "CSS2"), css_block("make_foreman_floor.py", "CSS3"),
             css_block("make_foreman_techs.py", "CSS4"), css_block("make_foreman_decide.py", "CSS5"), css_block("make_foreman_qc.py", "CSS6")]
SKIP = (".tg-panel", ".tg-rail", ".rl-badge", ".tg .btn", ".tg :focus-visible", ".toast-fm", ".fm-about-ref", ".fm-nbf", ".fm-nbs", ".fm-nbi", ".fm-nbh")
lines = []
for blk in parts_css:
    for ln in blk.split("\n"):
        s = ln.strip()
        if not s or any(s.startswith(k) for k in SKIP):
            continue
        lines.append(ln)
css = "/* ===== v179: Foreman — on the Parsec design system (Ivory / Graphite). Prefix fm-, on the Triage tg- base ===== */\n" + "\n".join(lines) + "\n" + open(os.path.join(H, "fm_extra.css"), encoding="utf-8").read()
open(os.path.join(H, "fm.css"), "w", encoding="utf-8").write(css)

# ---------- icons the Foreman uses that Triage doesn't carry ----------
IC = dict(P.ICONS)
IC.update({
 "userPlus": '<circle cx="10" cy="8" r="3.5"/><path d="M3.75 19.5c.6-3.4 3.2-5.25 6.25-5.25s5.65 1.85 6.25 5.25M18.5 7.5v5M16 10h5"/>',
 "pin": '<path d="M12 20.5s-6-5.6-6-10.25a6 6 0 0 1 12 0C18 14.9 12 20.5 12 20.5z"/><circle cx="12" cy="10.25" r="2.25"/>',
 "flag": '<path d="M6 20.5V4.5M6 5h10.5l-2 3.75 2 3.75H6"/>',
 "inArrow": '<path d="M19.5 12h-11M12.5 7.5L8 12l4.5 4.5M4.5 5v14"/>',
 "grid": '<rect x="4" y="4" width="6.5" height="6.5" rx="1.5"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.5"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.5"/><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.5"/>',
 "decide": '<path d="M12 3.75v4.5M12 15.75v4.5M5.5 12H3.75M20.25 12H18.5"/><circle cx="12" cy="12" r="3.75"/>',
 "road": '<path d="M8 20.5 10 3.5M16 20.5 14 3.5M12 6v2M12 11v2M12 16v2"/>',
 "gauge": '<path d="M4.5 16.5a7.5 7.5 0 1 1 15 0"/><path d="M12 16.5l3.5-4.5"/>',
 "bay": '<path d="M3.75 20.25V9L12 4l8.25 5v11.25"/><path d="M7.5 20.25v-7.5h9v7.5M7.5 15.75h9"/>',
})
used = sorted(set(re.findall(r'tgI\("([A-Za-z]+)"', js)) | set(re.findall(r'\bic: "([A-Za-z]+)"', js)) | set(re.findall(r'fmClear\([^,]+, "([A-Za-z]+)"', js)) | set(re.findall(r'fmDone\([^,]+, "([A-Za-z]+)"', js)))
miss = [k for k in used if k not in IC]
assert not miss, miss
js = js.replace("/*__FMIC__*/{}", json.dumps({k: IC[k] for k in used}, ensure_ascii=False))
assert "__FMIC__" not in js

def rep(s, a, b, n=1):
    c = s.count(a)
    assert c == n, (a[:90], c)
    return s.replace(a, b)

# ---------- the page itself ----------
i = src.index("function viewForeman(){\n  yardAutoPlace();")
j = src.index("\n}\n", i) + 3
src = src[:i] + "function viewForeman(){\n  yardAutoPlace();\n  return fmView();\n}\n" + js.rstrip() + "\n" + src[j:]

# ---------- clicks: fm-* actions ----------
src = rep(src, 'if(a && a.indexOf("tg-") === 0 && tgAct(a, t, e)) return;   /* v178: Triage */',
          'if(a && a.indexOf("tg-") === 0 && tgAct(a, t, e)) return;   /* v178: Triage */\n  if(a && a.indexOf("fm-") === 0 && fmAct(a, t, e)) return;   /* v179: Foreman */')

# ---------- render: Sent to you is in Needs action on the Foreman page; the badge; popover placement ----------
src = rep(src, 'if(RT_PAGE[UI.view] && UI.view !== "triage"){ var rtIn', 'if(RT_PAGE[UI.view] && UI.view !== "triage" && UI.view !== "foreman"){ var rtIn')
src = rep(src, "  try{ tgTrack(); }catch(e){ console.error(e); }   /* v178: the late badge on Triage */\n",
          "  try{ tgTrack(); }catch(e){ console.error(e); }   /* v178: the late badge on Triage */\n  try{ fmTrack(); }catch(e){ console.error(e); }   /* v179: the Foreman badge */\n")
src = rep(src, '  if(UI.view === "triage"){ try{ tgAfter(); }catch(e){ console.error(e); } }   /* v178 */\n',
          '  if(UI.view === "triage"){ try{ tgAfter(); }catch(e){ console.error(e); } }   /* v178 */\n  if(UI.view === "foreman"){ try{ fmAfter(); }catch(e){ console.error(e); } }   /* v179 */\n')
src = rep(src, "document.documentElement.classList.toggle('yd-roam', !!UI.yardZoom && UI.view === 'foreman');",
          "document.documentElement.classList.toggle('yd-roam', false);   /* v179: the Foreman yard is the Triage yard now */")

# ---------- the sidebar: a badge on Foreman ----------
src = rep(src, 'var badge = { warranty: wcNeed, rolist: nOpen, ros: nOpen, triage: UI.view !== "triage" ? (UI.tgBadgeN || 0) : 0 };',
          'var badge = { warranty: wcNeed, rolist: nOpen, ros: nOpen, triage: UI.view !== "triage" ? (UI.tgBadgeN || 0) : 0, foreman: UI.view !== "foreman" ? (UI.fmBadgeN || 0) : 0 };')
src = rep(src, "+ (b ? '<span class=\"iv-n'+(k === \"triage\" ? ' tg-lt'+(UI.tgBump ? ' bump' : '') : '')+'\"'+(k === \"triage\" ? ' title=\"'+b+' late on the yard\"' : '')+'>'+b+'</span>' : '') + '</button>';",
          "+ (b ? '<span class=\"iv-n'+(k === \"triage\" ? ' tg-lt'+(UI.tgBump ? ' bump' : '') : k === \"foreman\" ? ' fm-nb'+(UI.fmBadgeLate ? ' late' : '') : '')+'\"'+(k === \"triage\" ? ' title=\"'+b+' late on the yard\"' : k === \"foreman\" ? ' title=\"'+esc(UI.fmBadgeTip || '')+'\"' : '')+'>'+b+'</span>' : '') + '</button>';")
src = rep(src, '  var badge = { warranty: wcNeed, triage: UI.view !== "triage" ? (UI.tgBadgeN || 0) : 0 };\n',
          '  var badge = { warranty: wcNeed, triage: UI.view !== "triage" ? (UI.tgBadgeN || 0) : 0, foreman: UI.view !== "foreman" ? (UI.fmBadgeN || 0) : 0 };\n')
src = rep(src, "+ (b ? '<span class=\"pz-bdg'+(k === \"triage\" ? ' tg-lt' : '')+'\" title=\"'+b+(k === \"triage\" ? ' late on the yard' : ' to file or fix')+'\">'+b+'</span>' : '') + '</button>';",
          "+ (b ? '<span class=\"pz-bdg'+(k === \"triage\" ? ' tg-lt' : k === \"foreman\" ? ' fm-nb'+(UI.fmBadgeLate ? ' late' : '') : '')+'\" title=\"'+(k === \"foreman\" ? esc(UI.fmBadgeTip || '') : b+(k === \"triage\" ? ' late on the yard' : ' to file or fix'))+'\">'+b+'</span>' : '') + '</button>';")

# ---------- the keyboard sheet ----------
src = rep(src, 'title = UI.view === "triage" ? "Keyboard \\u2014 Triage" : "Keyboard";\n    var KEYS = UI.view === "triage" ? TG_KEYS : [',
          'title = UI.view === "triage" ? "Keyboard \\u2014 Triage" : UI.view === "foreman" ? "Keyboard \\u2014 Foreman" : "Keyboard";\n    var KEYS = UI.view === "triage" ? TG_KEYS : UI.view === "foreman" ? FM_KEYS : [')

# ---------- the tech's Console: the foreman's note and the order ----------
src = rep(src, "  var dc = dailyCalc(todayStr());\n  html += '<div class=\"cx\">'", "  try{ html += fmConsoleCard(); }catch(e){ console.error(e); }   /* v179 */\n  var dc = dailyCalc(todayStr());\n  html += '<div class=\"cx\">'")

# ---------- data: what the Foreman keeps goes into the shop file ----------
src = rep(src, "tgCleared: STATE.tgCleared || [], rtCfg: STATE.rtCfg || null,   /* v178 */\n",
          "tgCleared: STATE.tgCleared || [], rtCfg: STATE.rtCfg || null,   /* v178 */\n    fmCfg: STATE.fmCfg || null, fmCleared: STATE.fmCleared || [], fmTmr: STATE.fmTmr || null, fmNote: STATE.fmNote || null,   /* v179 */\n")

# ---------- remembered between visits ----------
src = rep(src, 'var UI_KEYS = ["tgView",', 'var UI_KEYS = ["fmView","fmDay","tgView",')
# v179: one action = one undo step. A save in the middle of an action (rtSend saves, for one)
# used to start a second, automatic "edit" step, so Undo only took back the tail of the action.
src = rep(src, 'var UNDO_BASE = null, UNDO_EXPLICIT = false, UNDOING = false;',
               'var UNDO_BASE = null, UNDO_EXPLICIT = false, UNDOING = false, UNDO_HOLD = false, UNDO_HSAVE = false, UNDO_HT = 0;   /* v179 */')
src = rep(src, '  UNDO_BASE = now; UNDO_EXPLICIT = false;\n}',
               '  UNDO_BASE = now; if(UNDO_HOLD) UNDO_HSAVE = true; else UNDO_EXPLICIT = false;   /* v179: saves inside the same action stay part of its undo step */\n}')
src = rep(src, '    if(UNDO.length > UNDO_MAX) UNDO.shift();\n    UNDO_EXPLICIT = true;\n',
               '    if(UNDO.length > UNDO_MAX) UNDO.shift();\n    UNDO_EXPLICIT = true;\n    UNDO_HOLD = true;   /* v179 */\n    if(!UNDO_HT){ UNDO_HSAVE = false; UNDO_HT = setTimeout(function(){ UNDO_HT = 0; UNDO_HOLD = false; if(UNDO_HSAVE) UNDO_EXPLICIT = false; UNDO_HSAVE = false; }, 0); }\n')

# ---------- styles ----------
k = src.index('<style id="v178tg">'); e = src.index("</style>", k) + len("</style>")
src = src[:e] + '\n<style id="v179fm">\n' + css.strip() + '\n</style>' + src[e:]

out = sys.argv[1] if len(sys.argv) > 1 else os.path.join(H, "Parsec_5.html")
open(out, "w", encoding="utf-8").write(src)

# a test copy with a hook into the app's scope
hook = src
tail = "})();\n</script>\n</body>"
assert hook.count(tail) == 1, hook.count(tail)
hook = hook.replace(tail, "window.__tg = { S: function(){ return STATE; }, UI: function(){ return UI; }, render: function(){ render(); }, sample: function(){ loadSample25(); }, getRO: getRO, tyCat: tyCat, roStatus: roStatus, spotOf: spotOf, yardSpots: yardSpots, tgNeedsAll: tgNeedsAll, uid: uid, nowIso: nowIso, setRoStatus: setRoStatus, rtSend: rtSend, raOps: raOps, applyTheme: applyTheme, staffList: staffList, todayStr: todayStr,"
                    " fmNeedsAll: fmNeedsAll, fmFlat: fmFlat, fmFreeTechs: fmFreeTechs, fmUpNext: fmUpNext, fmTechs: fmTechs, fmCfg: fmCfg, fmFreeAt: fmFreeAt, fmTmPlan: fmTmPlan, fmFound: fmFound, fmQcAuto: fmQcAuto, fmNcClear: fmNcClear, fmRep: fmRep, fmBringable: fmBringable, undoLast: undoLast, tgClashes: tgClashes, tgFlat: tgFlat, shopObj: typeof shopObj === 'function' ? shopObj : null, UI_KEYS: typeof UI_KEYS !== 'undefined' ? UI_KEYS : null, cxMe: cxMe, fmConsoleCard: fmConsoleCard, fmGet: fmGet, fmOpenPop: fmOpenPop, fmGo: fmGo, fmTmr: fmTmr, fmRisk: fmRisk, fmClearedList: fmClearedList, normalizeState: typeof normalizeState === 'function' ? normalizeState : null };\n" + tail)
open(os.path.join(H, "t5.html"), "w", encoding="utf-8").write(hook)
print("built", out, len(src), "css", len(css))
