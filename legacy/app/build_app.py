# Build Parsec_4.html: Parsec_3.html + the new Triage (tg.js / tg.css) and the small patches it needs.
import os, sys, json, re
H = os.path.dirname(os.path.abspath(__file__))
B = os.path.join(os.path.dirname(H), "build")
sys.path.insert(0, B)
import parts as P

src = open(os.path.join(H, "Parsec_3.html"), encoding="utf-8").read()
js = open(os.path.join(H, "tg.js"), encoding="utf-8").read()
css = open(os.path.join(H, "tg.css"), encoding="utf-8").read()

# ---------- icons ----------
IC = dict(P.ICONS)
IC.update({
 "phone": '<path d="M6.2 4.5h2.6l1.4 3.6-1.9 1.3a10.5 10.5 0 0 0 5.3 5.3l1.3-1.9 3.6 1.4v2.6a1.6 1.6 0 0 1-1.7 1.6A14 14 0 0 1 4.6 6.2a1.6 1.6 0 0 1 1.6-1.7z"/>',
 "mail": '<rect x="3.75" y="5.75" width="16.5" height="12.5" rx="2.25"/><path d="M4.5 7.25l7.5 5.75 7.5-5.75"/>',
 "userPlus": '<circle cx="10" cy="8" r="3.5"/><path d="M3.75 19.5c.6-3.4 3.2-5.25 6.25-5.25s5.65 1.85 6.25 5.25M18.5 7.5v5M16 10h5"/>',
 "pin": '<path d="M12 20.5s-6-5.6-6-10.25a6 6 0 0 1 12 0C18 14.9 12 20.5 12 20.5z"/><circle cx="12" cy="10.25" r="2.25"/>',
 "flag": '<path d="M6 20.5V4.5M6 5h10.5l-2 3.75 2 3.75H6"/>',
 "release": '<path d="M4.5 12h11M11.5 7.5L16 12l-4.5 4.5M19.5 5v14"/>',
 "inArrow": '<path d="M19.5 12h-11M12.5 7.5L8 12l4.5 4.5M4.5 5v14"/>',
 "grid": '<rect x="4" y="4" width="6.5" height="6.5" rx="1.5"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.5"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.5"/><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.5"/>',
})
IC["shield"] = IC["warranty"]; IC["key"] = IC["keyTag"]; IC["doc"] = P.SF_DOC
need = ["phone","chat","mail","user","doc","swap","release","userPlus","inArrow","pin","clock","check","x","flag","shield","key","copy","plus","search","inbox","grid","chevR","chevD","trash"]
used = sorted(set(re.findall(r'tgI\("([A-Za-z]+)"', js)) | set(re.findall(r'\bic: "([A-Za-z]+)"', js)) | set(need))
miss = [k for k in used if k not in IC]
assert not miss, miss
TGIC = {k: IC[k] for k in used}
TGSI = {}
for k in ["hold", "working", "parts", "foreman", "support", "customer", "roadtest", "released", "declined"]:
    TGSI[k] = P.si(k).replace('class="px-si"', 'class="tg-si"').replace("var(--panel)", "var(--tg-panel)")
js = js.replace("/*__TGIC__*/{}", json.dumps(TGIC, ensure_ascii=False)).replace("/*__TGSI__*/{}", json.dumps(TGSI, ensure_ascii=False))
assert "__TG" not in js

def rep(s, a, b, n=1):
    c = s.count(a)
    assert c == n, (a[:90], c)
    return s.replace(a, b)

# ---------- the page itself ----------
i = src.index("function viewTriage(){\n  yardAutoPlace();\n  var ym = yardMap(), T = tyCtx();")
j = src.index("\n}\n", i) + 3
src = src[:i] + "function viewTriage(){\n  yardAutoPlace();\n  return tgView();\n}\n" + js.rstrip() + "\n" + src[j:]

# ---------- clicks: tg-* actions ----------
src = rep(src, 'if(a && a.indexOf("rt-") === 0 && rtAct(a, t)) return;   /* v152: RO route */',
          'if(a && a.indexOf("rt-") === 0 && rtAct(a, t)) return;   /* v152: RO route */\n  if(a && a.indexOf("tg-") === 0 && tgAct(a, t, e)) return;   /* v178: Triage */')

# ---------- render: the RO-route banner is Needs action on Triage now; late tracking; popover placement ----------
src = rep(src, "if(RT_PAGE[UI.view]){ var rtIn = rtInboxHtml(RT_PAGE[UI.view]);",
          "if(RT_PAGE[UI.view] && UI.view !== \"triage\"){ var rtIn = rtInboxHtml(RT_PAGE[UI.view]);")
src = rep(src, "  try{ rtAutoAll(); }catch(e){ console.error(e); }\n",
          "  try{ rtAutoAll(); }catch(e){ console.error(e); }\n  try{ tgTrack(); }catch(e){ console.error(e); }   /* v178: the late badge on Triage */\n")
src = rep(src, "  if(pageY) window.scrollTo(0, pageY);\n  persistUI();\n",
          "  if(pageY) window.scrollTo(0, pageY);\n  if(UI.view === \"triage\"){ try{ tgAfter(); }catch(e){ console.error(e); } }   /* v178 */\n  persistUI();\n")
src = rep(src, "document.documentElement.classList.toggle('yd-roam', !!UI.yardZoom && (UI.view === 'foreman' || UI.view === 'triage'));",
          "document.documentElement.classList.toggle('yd-roam', !!UI.yardZoom && UI.view === 'foreman');")

# ---------- the sidebar: a late badge on Triage ----------
src = rep(src, "var badge = { warranty: wcNeed, rolist: nOpen, ros: nOpen };",
          "var badge = { warranty: wcNeed, rolist: nOpen, ros: nOpen, triage: UI.view !== \"triage\" ? (UI.tgBadgeN || 0) : 0 };")
src = rep(src, "+ (b ? '<span class=\"iv-n\">'+b+'</span>' : '') + '</button>';",
          "+ (b ? '<span class=\"iv-n'+(k === \"triage\" ? ' tg-lt'+(UI.tgBump ? ' bump' : '') : '')+'\"'+(k === \"triage\" ? ' title=\"'+b+' late on the yard\"' : '')+'>'+b+'</span>' : '') + '</button>';")
src = rep(src, "  var badge = { warranty: wcNeed };\n",
          "  var badge = { warranty: wcNeed, triage: UI.view !== \"triage\" ? (UI.tgBadgeN || 0) : 0 };\n")
src = rep(src, "+ (b ? '<span class=\"pz-bdg\" title=\"'+b+' to file or fix\">'+b+'</span>' : '') + '</button>';",
          "+ (b ? '<span class=\"pz-bdg'+(k === \"triage\" ? ' tg-lt' : '')+'\" title=\"'+b+(k === \"triage\" ? ' late on the yard' : ' to file or fix')+'\">'+b+'</span>' : '') + '</button>';")

# ---------- modals: the template editor; Triage keys in the keyboard sheet ----------
src = rep(src, '  } else if(m.type==="warnings"){\n',
          '  } else if(m.type==="tg-tpl"){\n    title = "Text templates";\n    body = tgTplBodyModal(m);\n    foot = \'<button class="btn btn-primary" data-action="close-modal">Done</button>\';\n  } else if(m.type==="warnings"){\n')
src = rep(src, 'm.type==="automations"?" modal-wide":""', 'm.type==="automations"||m.type==="tg-tpl"?" modal-wide":""')
src = rep(src, 'title = "Keyboard";\n    var KEYS = [', 'title = UI.view === "triage" ? "Keyboard \\u2014 Triage" : "Keyboard";\n    var KEYS = UI.view === "triage" ? TG_KEYS : [')

# ---------- data: what the new Triage keeps goes into the shop file too ----------
src = rep(src, "    laborRate: STATE.laborRate || null, mobTickIds: STATE.mobTickIds || [], lastBackupAt: STATE.lastBackupAt || null,\n    orphanPunches: orphans",
          "    laborRate: STATE.laborRate || null, mobTickIds: STATE.mobTickIds || [], lastBackupAt: STATE.lastBackupAt || null,\n"
          "    customers: STATE.customers || {}, tgTemplates: STATE.tgTemplates || null, tgShop: STATE.tgShop || null, tgCleared: STATE.tgCleared || [], rtCfg: STATE.rtCfg || null,   /* v178 */\n"
          "    orphanPunches: orphans")

# ---------- the yard: two trucks on one spot stay a clash to fix, not a silent re-park ----------
src = rep(src, "function yardAutoPlace(){\n  var ym = yardMap();\n  if(!ym.unplaced.length) return false;",
          "function yardAutoPlace(){\n  var ym = yardMap();\n  var todo = ym.unplaced.filter(function(ro){ var s0 = spotOf(ro.location); return !(s0 && ym.valid[s0]); });   /* v178: a spot clash is shown, not moved */\n  if(!todo.length) return false;")
src = rep(src, "  var n = 0;\n  ym.unplaced.forEach(function(ro){\n    var sp = open[n]; if(!sp) return;", "  var n = 0;\n  todo.forEach(function(ro){\n    var sp = open[n]; if(!sp) return;")

# ---------- remembered between visits ----------
src = rep(src, 'var UI_KEYS = ["rlGroup","trView",', 'var UI_KEYS = ["tgView","rlGroup","trView",')

# ---------- styles ----------
k = src.index('<style id="v175iv">'); e = src.index("</style>", k) + len("</style>")
src = src[:e] + '\n<style id="v178tg">\n' + css.strip() + '\n</style>' + src[e:]

out = sys.argv[1] if len(sys.argv) > 1 else os.path.join(H, "Parsec_4.html")
open(out, "w", encoding="utf-8").write(src)

# a test copy with a hook into the app's scope
hook = src
tail = "})();\n</script>\n</body>"
assert hook.count(tail) == 1, hook.count(tail)
hook = hook.replace(tail, "window.__tg = { S: function(){ return STATE; }, UI: function(){ return UI; }, render: function(){ render(); }, sample: function(){ loadSample25(); }, getRO: getRO, tyCat: tyCat, roStatus: roStatus, spotOf: spotOf, yardSpots: yardSpots, tgNeedsAll: tgNeedsAll, tgLateIds: tgLateIds, tgClashes: tgClashes, tgFlat: tgFlat, uid: uid, nowIso: nowIso, setRoStatus: setRoStatus, rtSend: rtSend, raOps: raOps, opMoney: opMoney, tgOpenOps: tgOpenOps, applyTheme: applyTheme };\n" + tail)
open(os.path.join(H, "t4.html"), "w", encoding="utf-8").write(hook)
print("built", out, len(src))
