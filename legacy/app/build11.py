# Build Parsec_11.html — Parsec 10 plus the Technician page (b9/tc1.js, b9/tc.css).
# Was: Build Parsec_10.html — Parsec 9.9 (the mock-ups on real data, each page a module on the shared frame, b9/core.js)
# plus Parsec 10: ChatGPT's 52-truck catalog, Truck & photos, White / Near black, the micro-interactions and
# the eight new interactions (b9/v10.js). From Parsec_8.html.
import os, sys, json, re, subprocess
H = os.path.dirname(os.path.abspath(__file__))
B = os.path.join(os.path.dirname(H), "build")
sys.path.insert(0, B); sys.path.insert(0, os.path.join(H, "b8")); sys.path.insert(0, os.path.join(H, "b9"))
import clean as C
import mcss
import jslex

src = open(os.path.join(H, "Parsec_8.html"), encoding="utf-8").read()
LOG = []
ONLY = os.environ.get("PG_ONLY", "")


def rep(s, a, b, n=1):
    c = s.count(a)
    assert c == n, (a[:120], c)
    return s.replace(a, b)


def b9(f):
    return open(os.path.join(H, "b9", f), encoding="utf-8").read()


# ---------- the modules ----------
MODS = [  # (page, js files, css [(file, pages)])
    ("console", ["cx1.js", "cx2.js", "cx3.js", "tc1.js", "cx4.js"]),   # tc1.js: the Technician page, inside Console's module
    ("inbox", ["ib1.js", "ib2.js", "ib3.js"]),
]
for extra in ["tl", "pt", "fx", "cr", "mg", "rl", "dr"]:
    fs = sorted(f for f in os.listdir(os.path.join(H, "b9")) if re.fullmatch(extra + r"\d\.js", f))
    if fs:
        MODS.append(({"tl": "timelog", "pt": "parts", "fx": "fixes", "cr": "career", "mg": "manager", "rl": "rolist", "dr": "report"}[extra], fs))
PAGES = [m[0] for m in MODS] + ["tech"]   # Parsec 11: the Technician page draws from the console module
LOG.append("pages: " + ", ".join(PAGES))

# icons: the mock-ups' set
g = {"__file__": os.path.join(B, "make_fixes.py")}
code = open(os.path.join(B, "make_fixes.py"), encoding="utf-8").read().split('\nCSS = shell + r"""\n')[0]
argv = sys.argv; sys.argv = ["x", "/dev/null"]; exec(code, g); sys.argv = argv
IC = dict(g["IC"])
IC.update(json.load(open(os.path.join(H, "b9", "icons_extra.json"))) if os.path.exists(os.path.join(H, "b9", "icons_extra.json")) else {})
TECH_IC = IC["tech"]

pgjs = b9("core.js")
modjs = b9("shopdata.js") + "\n" + "\n".join("\n".join(b9(f) for f in fs) for _, fs in MODS)
modjs += "\n" + b9("hist.js") + "\n" + b9("tqp.js") + "\n" + b9("mob.js") + ("" if os.environ.get("NOPHONE") else "\n" + b9("phone.js")) + "\n" + b9("trucks.js") + "\n" + b9("v10.js")
modjs = mcss.rename_js(modjs)
# the truck pictures the shop starts with (side views, see-through background) — b9/trucks.js
import base64
_tp = {}
for _k in ["white", "gray", "blue", "red"]:
    _tp["side_" + _k] = "data:image/webp;base64," + base64.b64encode(open(os.path.join(B, "trk", "web_side_%s.webp" % _k), "rb").read()).decode()
    _tp["top_" + _k] = "data:image/webp;base64," + base64.b64encode(open(os.path.join(B, "trk", "web_top_%s.webp" % _k), "rb").read()).decode()
# Parsec 10: ChatGPT's 52 Volvo bodies, each from the side and from above (build/vt, cut from its sprite sheets)
_vtp = json.load(open(os.path.join(B, "vt", "profiles.json")))
for _p in _vtp:
    for _v, _f in (("s", "_s"), ("t", "_t")):
        _tp["vt_%s_%s" % (_p["id"], _v)] = "data:image/webp;base64," + base64.b64encode(open(os.path.join(B, "vt", _p["id"] + _f + ".webp"), "rb").read()).decode()
_vtk = ["id", "family", "cab", "label", "from", "to", "review", "reviewYears", "body", "trims"]
modjs = modjs.replace("__VTP__", json.dumps([{k: _p[k] for k in _vtk if _p.get(k) not in (None, [])} for _p in _vtp], ensure_ascii=False), 1)
assert "__VTP__" not in modjs
TRKP_TOKEN = '{"__TRKPICS__": 1}'   # the pictures go in at the very end — the build runs on the code alone
modjs = modjs.replace("__TRKPICS__", TRKP_TOKEN, 1)
assert "__TRKPICS__" in modjs
used = set(re.findall(r"""\bic\(\s*['"]([A-Za-z0-9]+)['"]""", modjs))
k0 = src.index('<script id="app-script">') + len('<script id="app-script">'); k1 = src.index("</script>", k0)
js = src[k0:k1]
tgic = set(re.findall(r'"?([A-Za-z0-9]+)"?\s*:\s*\'<', js[js.index("var TG_IC"):js.index("};", js.index("var TG_IC"))])) if "var TG_IC" in js else set()
ivi = set(re.findall(r'"([A-Za-z]+)": "<', js[js.index("var IVI = {"):js.index("};", js.index("var IVI = {"))]))
miss = sorted(k for k in used if k not in IC and k not in tgic and k not in ivi)
assert not miss, ("icons missing", miss)
_ichay = modjs + pgjs
pgjs = pgjs.replace("/*__PGIC__*/{}", json.dumps({k: IC[k] for k in sorted(IC) if re.search(r"""['"`]""" + re.escape(k) + r"""['"`]""", _ichay)}, ensure_ascii=False))   # only the icons the pages ask for
allmod = pgjs + "\n" + modjs
assert "</script" not in allmod
C.node_check("(function(){\n" + allmod + "\n})();", "modules alone")

# ======================================================================= the app script
# the old page functions go; the modules bring their own
OLD = {"tech": [], "console": ["viewConsole"], "inbox": [], "timelog": ["viewTimeLog"], "parts": ["viewInventory"], "fixes": ["viewFixes"], "career": ["viewCareer"], "manager": ["viewManager"], "rolist": ["viewRoList"], "report": ["viewDayReport"]}
gone = []
js = rep(js, "function truckYM(ro){", "function truckYM0(ro){")   # Parsec 10: trucks.js brings the year rule
js = C.js_remove_functions(js, [n for p in PAGES for n in OLD[p]], gone)
LOG.append("old page views replaced: " + ", ".join(n for n, _ in gone))
if "parts" in PAGES:
    allmod += "\nfunction viewInventory(){ return PT.view(); }\n"

# the modules go in after the kit, before anything draws
anchor = "function pxPartKeys(all){"
i = js.index(anchor); i = js.index("\n", i) + 1
js = js[:i] + "\n/* ============================== Parsec 9 — page modules ============================== */\n" + allmod + "\n" + js[i:]

# ---------- Parsec 10: the model year — the RO's own, else the VIN's settled by the model's years (b9/trucks.js) ----------
# the New RO form asks for the model year; the RO's Vehicle facts show and change it, and the model
js = rep(js, "      + '<div class=\"form-row\"><label for=\"f-model\">Truck model <span class=\"opt\">(optional)</span></label>",
         "      + '<div class=\"form-row\"><label for=\"f-year\">Model year <span class=\"opt\">(optional)</span></label><input id=\"f-year\" inputmode=\"numeric\" maxlength=\"4\" class=\"mono\" autocomplete=\"off\" placeholder=\"e.g. 2021\"></div>'\n      + '<div class=\"form-row\"><label for=\"f-model\">Truck model <span class=\"opt\">(optional)</span></label>")
js = rep(js, '"f-engtype","f-model","f-tech"];', '"f-engtype","f-year","f-model","f-tech"];')
js = rep(js, '      newRo.model = val("f-model").trim();\n', '      newRo.model = val("f-model").trim();\n      (function(){ var yy = +String(val("f-year") || "").replace(/\\D/g, ""); if(yy >= 1980 && yy <= new Date().getFullYear() + 2) newRo.year = yy; })();\n')
js = rep(js, "    pxProp('Unit', RO.unitNumber || 'Add unit', { empty: !RO.unitNumber, edit: pxField2('unitNumber') }),\n",
         "    pxProp('Unit', RO.unitNumber || 'Add unit', { empty: !RO.unitNumber, edit: pxField2('unitNumber') }),\n    pxProp('Model', RO.model || 'Add model', { empty: !RO.model, edit: { get: function () { return RO.model || ''; }, set: function (v) { RO.model = String(v || '').trim(); delete RO.trkBody; delete RO.trkTrim; } } }),\n    pxProp('Model year', RO.year ? String(RO.year) : (function () { try { var t = truckYM(RO); return t.year ? t.year + ' · VIN' : 'Add year'; } catch (e) { return 'Add year'; } })(), { num: true, empty: !RO.year, edit: { get: function () { return RO.year ? String(RO.year) : ''; }, set: function (v) { var y = +String(v || '').replace(/\\D/g, ''); if (y >= 1980 && y <= new Date().getFullYear() + 2) RO.year = y; else delete RO.year; delete RO.trkBody; } } }),\n")
# ---------- the truck in the RO's header: a band, the title on the left, the truck on the right (b9/trucks.js) ----------
js = rep(js, "function pxTitle() {\n", "function pxTitle() { var tb = pxTitle0(); try{ return typeof trkBanner === \"function\" ? trkBanner(tb, RO) : tb; }catch(e){ console.error(e); return tb; } }\nfunction pxTitle0() {\n")
_jc0 = js.index('var JC_CSS = "'); _jc1 = js.index('";\n', _jc0)
js = js[:_jc1] + json.dumps("\n" + b9("trucks_jc.css"))[1:-1] + js[_jc1:]
js = rep(js, '  h += pxCard(pxCh("Parsec Mobile", ', '  try{ h += trkSettingsHtml(); }catch(e){ console.error(e); }\n  h += pxCard(pxCh("Parsec Mobile", ')
# ---------- 9.8: the truck in Foreman and Triage rows, and from above in its bay on the Foreman floor (b9/trucks.js) ----------
js = rep(js, "      + '<span class=\"tg-gi\">' + (ro.isTech ? '<span class=\"tg-av\">' + esc(tgIni(ro.name)) + '</span>' : tgI(x.ic, 15)) + '</span><span class=\"tg-t\">'", "      + (ro.isTech ? '<span class=\"tg-gi\"><span class=\"tg-av\">' + esc(tgIni(ro.name)) + '</span></span>' : trkGi(ro, tgI(x.ic, 15))) + '<span class=\"tg-t\">'")
js = rep(js, "data-tg-drag=\"' + ro.id + '\">' + (x.late && !x.back ? '<i class=\"tg-dot\"></i>' : '')\n      + '<span class=\"tg-gi\">' + tgI(x.ic, 15) + '</span><span class=\"tg-t\">", "data-tg-drag=\"' + ro.id + '\">' + (x.late && !x.back ? '<i class=\"tg-dot\"></i>' : '')\n      + trkGi(ro, tgI(x.ic, 15)) + '<span class=\"tg-t\">")
js = rep(js, "  return '<div class=\"fm-bay ' + c + (k ? ' risk' : '') + (sel && sel.id === ro.id ? ' sel' : '') + (UI.fmFlash === b ? ' flash' : '') + '\" data-action=\"fm-sel\"", "  var tv = trkBayTop(ro);\n  return '<div class=\"fm-bay ' + c + (k ? ' risk' : '') + (sel && sel.id === ro.id ? ' sel' : '') + (UI.fmFlash === b ? ' flash' : '') + (tv ? ' has-top' : '') + '\" data-action=\"fm-sel\"")
js = rep(js, "+ '<div class=\"r1\"><span class=\"l\">' + esc(lb) + '</span>' + (bt ? '<span class=\"bt\">' + esc(bt) + '</span>' : '') + '<span class=\"st\">' + stt + '</span></div><div class=\"t\">", "+ tv + '<div class=\"r1\"><span class=\"l\">' + esc(lb) + '</span>' + (bt ? '<span class=\"bt\">' + esc(bt) + '</span>' : '') + '<span class=\"st\">' + stt + '</span></div><div class=\"t\">")
# ---------- 9.9: the truck in Search, and in the selected RO's header on Foreman and Triage ----------
js = rep(js, "        + '<span class=\"pal-ro mono\">'+esc(r.ro.roNumber)+'</span>'\n        + '<span class=\"pal-mid\"><span class=\"pal-cust\">'+esc(r.ro.customerName||\"\u2014\")+'</span>'\n        +   (r.why ? '<span class=\"pal-why mono\">'+esc(r.why)+'</span>' : '')", "        + (typeof trkThumb === \"function\" ? '<span class=\"pal-trk\">' + trkThumb(r.ro) + '</span>' : '<span class=\"pal-ro mono\">'+esc(r.ro.roNumber)+'</span>')\n        + '<span class=\"pal-mid\"><span class=\"pal-cust\">'+esc(r.ro.customerName||\"\u2014\")+'</span>'\n        +   (typeof trkLabel === \"function\" ? '<span class=\"pal-sub\"><span class=\"mono\">'+esc(r.ro.roNumber)+'</span> \u00b7 '+esc(trkLabel(r.ro))+(r.ro.unitNumber ? ' \u00b7 Unit '+esc(r.ro.unitNumber) : '')+'</span>' : '')\n        +   (r.why ? '<span class=\"pal-why mono\">'+esc(r.why)+'</span>' : '')")
js = rep(js, "  return '<div class=\"tg-top\"><div class=\"r1\"><b class=\"tg-no\">' + esc(roLabel(ro)) + '</b>' + tgSq(c)", "  return '<div class=\"tg-top\">' + trkHead(ro) + '<div class=\"r1\"><b class=\"tg-no\">' + esc(roLabel(ro)) + '</b>' + tgSq(c)")
js = rep(js, "  return '<div class=\"tg-dk\"><div class=\"tg-dkh\"><div class=\"l\">", "  return '<div class=\"tg-dk\"><div class=\"tg-dkh\">' + trkHead(ro) + '<div class=\"l\">")
# ---------- Parsec 10: Search finds a truck by its model and year; yard spots get the truck from above ----------
js = rep(js, '  if(has(ro.roNumber) || has(ro.customerName) || has(ro.caseNumber) || has(ro.unitNumber)) return "";\n',
         '  if(has(ro.roNumber) || has(ro.customerName) || has(ro.caseNumber) || has(ro.unitNumber)) return "";\n  try{ if(typeof trkLabel === "function"){ var tl = trkLabel(ro).toLowerCase(); if(f.split(/\\s+/).every(function(w){ return tl.indexOf(w) !== -1 || tl.replace(/\\s+/g, "").indexOf(w) !== -1; })) return ""; } }catch(e){}\n')
js = rep(js, 'placeholder="Find an RO — number, customer, VIN, unit, part…"', 'placeholder="Search number, customer, truck, year, VIN…"')
js = rep(js, "'\" title=\"' + esc((ro.customerName || \"\") + \" · held for this arrival\" + (e ? \" · ETA \" + tgWhen(e) : \"\")) + '\">' + lbl + '<b>'", "'\" title=\"' + esc((ro.customerName || \"\") + \" · held for this arrival\" + (e ? \" · ETA \" + tgWhen(e) : \"\")) + '\">' + lbl + trkYardTop(ro) + '<b>'")
js = rep(js, "'\" title=\"' + esc((ro.customerName || \"\") + \" · \" + tgStTxt(ro)) + '\">' + lbl + '<b>'", "'\" title=\"' + esc((ro.customerName || \"\") + \" · \" + tgStTxt(ro)) + '\">' + lbl + trkYardTop(ro) + '<b>'")
# ---------- the Inbox is a page; the rail row goes to it ----------
js = rep(js, "      delete op.cause; delete op.correction;", "      /* a cause or correction set as text (Use fix, the phone) goes into the work log before the field is dropped */\n      [[\"cause\", \"cause\"], [\"fix\", \"correction\"]].forEach(function(kc){ var t = String(op[kc[1]] || \"\").trim(); if(!t) return; if(!op.log.some(function(l){ return l.kind === kc[0] && String(l.text || \"\").trim() === t; })){ op.log = op.log.filter(function(l){ return l.kind !== kc[0]; }); op.log.push({ id: uid(\"lg\"), at: nowIso(), kind: kc[0], text: t }); } });\n      delete op.cause; delete op.correction;")
# ---------- the phone view: the bottom bar instead of the sidebar, redrawn with the page ----------
if not os.environ.get("NOPHONE"):
    # the RO page keeps the Ivory / Graphite design on a phone (it fell back to the old look)
    js = rep(js, "function ivOn() { try { return /^iv[ld]$/.test(resolvedTheme()) && !(typeof DEVICE !== 'undefined' && DEVICE === 'phone') && document.documentElement.getAttribute('data-device') !== 'phone'; } catch (e) { return false; } }", "function ivOn() { try { return /^iv[ld]$/.test(resolvedTheme()); } catch (e) { return false; } }")
    js = rep(js, ':host(.th-iv:not([data-device=\\"phone\\"]))', ':host(.th-iv)', 7)
    _jc0 = js.index('var JC_CSS = "'); _jc1 = js.index('";\n', _jc0)
    js = js[:_jc1] + json.dumps("\n" + b9("phone_jc.css"))[1:-1] + js[_jc1:]
    
    js = rep(js, "function pzHeaderHtml(badgeCount){\n  if(ivDesk()) return ivSideHtml(badgeCount);", "function pzHeaderHtml(badgeCount){\n  if(document.documentElement.getAttribute(\"data-device\") === \"phone\") return pmShellHtml();\n  if(ivDesk()) return ivSideHtml(badgeCount);")
    js = rep(js, "  patchApp(html);\n  pxAfter();", "  patchApp(html);\n  pxAfter();\n  try{ pmAfter(); }catch(e){ console.error(e); }")
    js = rep(js, 'return DEVICE_MODES.indexOf(v) >= 0 ? v : "auto"; })();', 'return v === "tablet" ? "desktop" : DEVICE_MODES.indexOf(v) >= 0 ? v : "auto"; })();   /* Tablet is gone: the computer view */')
    js = rep(js, "function deviceAuto(){", "function deviceAuto(){\n  /* Automatic: a phone gets the phone view, everything else the computer view */\n  var sw0 = Math.min(screen.width || 9999, screen.height || 9999); if(sw0 < 600 && ((window.matchMedia && window.matchMedia(\"(pointer: coarse)\").matches) || window.innerWidth < 600)) return \"phone\"; return \"desktop\";")
    js = rep(js, 'pushToast(v === "auto" ? "Device mode: Auto (" + deviceMode() + ")" : "Device mode: " + v.charAt(0).toUpperCase() + v.slice(1));', 'pushToast(v === "auto" ? "Screen: Automatic — " + (deviceMode() === "phone" ? "phone view" : "computer view") + " on this device" : v === "phone" ? "Screen: phone view on this device" : "Screen: computer view on this device");')
    js = rep(js, 'pxCh("Screen", "how Parsec lays out — Auto picks from this device") + \'<div class="px-row">\' + pxSeg([["auto", "Auto"], ["desktop", "Desktop"], ["tablet", "Tablet"], ["phone", "Phone"]], DEVICE_SETTING, "set-device", "data-mode")',
      'pxCh("Screen", "Automatic: the phone view on a phone, the computer view everywhere else — saved on this device") + \'<div class="px-row">\' + pxSeg([["auto", "Automatic"], ["desktop", "Computer"], ["phone", "Phone"]], DEVICE_SETTING === "tablet" ? "desktop" : DEVICE_SETTING, "set-device", "data-mode")')
js = rep(js, '["console","Console"],["ros","Repair Orders"]', '["inbox","Inbox"],["tech","Technician"],["console","Console"],["ros","Repair Orders"]')
js = rep(js, 'function navAllowed(page){\n  if(page === "profile") return true;', 'function navAllowed(page){\n  if(page === "profile" || page === "inbox") return true;\n  if(page === "tech"){ var s0 = viewAsStaff(); return s0 ? s0.role === "Technician" : true; }   /* Parsec 11: technicians — 11.3: and the admin, for any technician */')
js = rep(js, "  var seen = {}, groups = PX_GROUPS.map(", "  var seen = { inbox: 1 }, groups = PX_GROUPS.map(")
i0 = js.index("  var inbox = '<div class=\"notif pxr-nw'"); i1 = js.index("+ (UI.notifOpen ? notifPopHtml() : '') + '</div>';", i0) + len("+ (UI.notifOpen ? notifPopHtml() : '') + '</div>';")
js = js[:i0] + ("  var ibN = 0; try{ ibN = IB.badge(); }catch(e){}\n"
               "  var inbox = '<button class=\"pxr-row\" data-action=\"nav\" data-view=\"inbox\" title=\"Inbox — what’s sent to you\"' + (!prof && UI.view === \"inbox\" ? ' aria-current=\"page\"' : '') + '>'\n"
               "    + '<span class=\"pxr-ic\">' + pxI(\"inbox\", 18) + (ibN ? '<em class=\"pxr-b\">' + ibN + '</em>' : '') + '</span><span class=\"pxr-tl\">Inbox</span>' + (ibN ? '<span class=\"pxr-n\">' + ibN + '</span>' : '') + '</button>';") + js[i1:]
js = rep(js, '  else if(UI.view==="report") viewHtml = viewDayReport();\n', '  else if(UI.view==="report") viewHtml = viewDayReport();\n  else if(UI.view==="inbox") viewHtml = viewInbox();\n')
js = rep(js, "  LAST_RENDER = Date.now();\n  histSync();\n", "  LAST_RENDER = Date.now();\n  histSync();\n  try{ IB.flush(); }catch(e){}\n")
# after a draw, the page module places its popover
js = rep(js, "  patchApp(html);\n  pxAfter();\n", "  patchApp(html);\n  pxAfter();\n  try{ var pgm = PG.mods[UI.view]; if(pgm && pgm.after) pgm.after(); }catch(e){ console.error(e); }\n  try{ trkHydrate(); }catch(e){ console.error(e); }\n")

# ---------- signing in lands each role on its home page ----------
js = rep(js, '  if(!navAllowed(UI.view) || UI.view === "profile") UI.view = navPages()[0][0];\n}',
         '  var sf = viewAsStaff();\n  if(sf) UI.view = PG.homeOf(sf.role);\n  else if(!navAllowed(UI.view) || UI.view === "profile") UI.view = navPages()[0][0];\n}')

# ---------- Staged and Picked up are live statuses now ----------
js = rep(js, '{ k: "Staged", t: "acc", who: "Parts", inHand: true, later: true }', '{ k: "Staged", t: "acc", who: "Parts", inHand: true }')
js = rep(js, '{ k: "Picked up", t: "working", who: "Tech", inHand: true, later: true }', '{ k: "Picked up", t: "working", who: "Tech", inHand: true }')

# ---------- each day clock says whose it is ----------
js = rep(js, 'shiftList().push({ id: uid("sh"), in: nowIso(), out: null });', 'shiftList().push({ id: uid("sh"), in: nowIso(), out: null, by: pxMeName() });')

js = rep(js, '  try{ waSample(STATE.ros); }catch(e){ console.error(e); }\n', '  try{ waSample(STATE.ros); }catch(e){ console.error(e); }\n  try{ pgSampleHistory(techs, rnd); }catch(e){ console.error(e); }\n')
js = rep(js, 'function fixAutoFill(){\n  var changed = false;', 'function fixAutoFill(){\n  return false;   /* Parsec 9: nothing fills in by itself — Use fix on the Fixes page shows what changes */\n  var changed = false;')
# ---------- the folder comes first; everything the pages keep goes into it ----------
js = rep(js, "    orphanPunches: orphans\n  };", "    orphanPunches: orphans\n  };\n  PG_SHOP_KEYS.forEach(function(k){ if(STATE[k] !== undefined) shopObj[k] = STATE[k]; });")
js = rep(js, '["pageNote","pageNoteAt","techName","automations","staff","yard","audit","shopRo"].forEach(', '["pageNote","pageNoteAt","techName","automations","staff","yard","audit","shopRo"].concat(PG_SHOP_KEYS).forEach(')
js = rep(js, "restoreFolder().then(function(){ render(); }).catch(function(){ render(); });", "restoreFolder().then(function(){ FS_READY = true; render(); }).catch(function(){ FS_READY = true; render(); });")
js = rep(js, "  if(pxOut()){ pxRenderOut(); return; }\n", "  if(fsGateOn()){ fsRenderGate(); return; }\n  if(pxOut()){ pxRenderOut(); return; }\n")
js = rep(js, "  if(!pxOut()) return;\n", "  if(!pxOut() && !fsGateOn()) return;\n")
js = rep(js, '    case "viewas-reset": try{ localStorage.removeItem("tec_viewas"); }catch(x){} pxSignedIn(); UI.profileOpen = false; UI.selectedRo = null; render(); break;',
         '    case "fs-pick": connectFolder(); break;\n    case "fs-reconnect": reconnectFolder(); break;\n    case "fs-local": FS_LOCAL = true; render(); break;\n'
         '    case "viewas-reset": { var apn = (STATE.shop && STATE.shop.adminPin) || ""; if(apn && (pxOut() || viewAsStaff())){ UI.modal = { type: "pin", id: "__admin" }; UI.profileOpen = false; render(); setTimeout(function(){ var pi = document.getElementById("pin-in"); if(pi) pi.focus(); }, 30); break; }\n'
         '      try{ localStorage.removeItem("tec_viewas"); }catch(x){} pxSignedIn(); UI.profileOpen = false; UI.selectedRo = null; render(); break; }')
js = rep(js, '    var pinsf = staffList().filter(function(x){ return x.id === m.id; })[0];', '    var pinsf = m.id === "__admin" ? { id: "__admin", name: "Admin", role: "Every page" } : staffList().filter(function(x){ return x.id === m.id; })[0];')
js = rep(js, '      if(!psf2) { UI.modal = null; render(); break; }',
         '      if(pm && pm.id === "__admin"){ if(String(pv) !== String((STATE.shop && STATE.shop.adminPin) || "")){ var ape = document.getElementById("form-error"); if(ape) ape.textContent = "That PIN doesn\'t match."; break; }\n'
         '        try{ localStorage.removeItem("tec_viewas"); }catch(x){} pxSignedIn(); audit("signin", "Admin signed in with PIN"); UI.modal = null; UI.profileOpen = false; UI.selectedRo = null; persistUI(); render(); pushToast("Signed in as Admin"); break; }\n'
         '      if(!psf2) { UI.modal = null; render(); break; }')
js = rep(js, """  h += '<button class="pxs-adm" data-action="viewas-reset">' + pxI("user", 13) + 'Admin — every page</button>'""",
         """  h += '<button class="pxs-adm" data-action="viewas-reset">' + pxI("user", 13) + 'Admin — every page' + ((STATE.shop && STATE.shop.adminPin) ? ' ' + pxI("lock", 12) : '') + '</button>'""")
js = rep(js, 'staffAvHtml(pinsf, "pin-av", "n")', '(pinsf.id === "__admin" ? \'<span class="pin-adm">\' + pxI("user", 20) + \'</span>\' : staffAvHtml(pinsf, "pin-av", "n"))')
# ---------- the Day report is the whole shop on one sheet; the End-of-day pop-up goes ----------
js = rep(js, 'case "open-eod": UI.modal = { type: "eod", day: todayStr() }; render(); break;',
         'case "open-eod": UI.view = "report"; UI.reportDate = (function(){ try{ return TL.U().day || todayStr(); }catch(e){ return todayStr(); } })(); UI.modal = null; render(); window.scrollTo(0,0); break;')
i0 = js.index('  } else if(m.type==="eod"){'); i1 = js.index('  } else if(m.type==="keytag"){', i0)
js = js[:i0] + js[i1:]
# ---------- picking the folder: always straight from the click, never from a preview; what went wrong in words ----------
i0 = js.index("function connectFolder(){"); i1 = js.index("function restoreFolder(){")
js = js[:i0] + """function connectFolder(){
  if(!FS.supported){ FS_ERR = fsWhy({ name: "TypeError" }); fsSay(); return; }
  if(fsFramed()){ FS_ERR = fsWhy({ name: "SecurityError" }); fsSay(); return; }
  FS_ERR = null;
  var pick; try{ pick = window.showDirectoryPicker({ mode: "readwrite", id: "parsec-shop", startIn: "desktop" }); }catch(e){ pick = Promise.reject(e); }
  pick.then(function(dir){
      return fsCanWrite(dir).then(function(){ return dir; }, function(e){ FS_ERR = fsWhyWrite(e, dir.name); throw "said"; });
    })
    .then(function(dir){
      FS.dir = dir; FS.dirName = dir.name; FS.status = "connected";
      return idbSet(IDB_KEY, dir).catch(function(){}).then(adoptFolderState)
        .catch(function(e){ FS.status = "none"; FS.dir = null; FS_ERR = fsWhy(e, dir.name); throw "said"; });
    })
    .then(function(){ syncStatus = "saved"; FS_ERR = null; pushToast("Connected to “" + FS.dirName + "” — the shop’s data, logs and attachments live there now."); render();
      try{ JC.syncFiles().then(function(){ return JC.scanFolder(); }).catch(function(){}); }catch(e){} })
    .catch(function(e){ if(e !== "said") FS_ERR = fsWhy(e); fsSay(); });
}
function reconnectFolder(){
  if(!FS.dir) return connectFolder();
  if(fsFramed()){ FS_ERR = fsWhy({ name: "SecurityError" }); fsSay(); return; }
  FS_ERR = null;
  var ask; try{ ask = FS.dir.requestPermission({ mode: "readwrite" }); }catch(e){ ask = Promise.reject(e); }
  ask.then(function(p){
    if(p === "granted"){
      return fsCanWrite(FS.dir).catch(function(e){ FS_ERR = fsWhyWrite(e, FS.dirName); throw "said"; }).then(function(){ FS.status = "connected"; return adoptFolderState(); }).then(function(){ syncStatus = "saved"; pushToast("Folder reconnected."); render(); try{ JC.syncFiles(); }catch(e){} });
    }
    FS_ERR = { k: "denied", t: "Parsec didn’t get the go-ahead.", d: "Click Open again and choose “Edit files” or Allow — or pick a different folder.", det: "Permission: " + p };
    fsSay();
  }).catch(function(e){
    if(e !== "said") FS_ERR = fsWhy(e, FS.dirName);
    if(FS_ERR.k === "gone"){ FS.dir = null; FS.status = "none"; } else if(FS.status === "connected") FS.status = "needs-permission";
    fsSay();
  });
}
""" + js[i1:]
js = rep(js, "restoreFolder().then(function(){ FS_READY = true; render(); }).catch(function(){ FS_READY = true; render(); });",
         "restoreFolder().then(function(){ FS_READY = true; render(); }).catch(function(){ FS_READY = true; render(); });\n  setTimeout(function(){ if(!FS_READY){ FS_READY = true; render(); } }, 3000);   /* never stuck on “Opening…” */")
# ======================================================================= Parsec 10 (b9/v10.js, b9/v10.css, b9/v10_jc.css)
# ---------- the micro-interactions: hooks around a draw, the RO page's draw, a stage checked off, the toast's Undo ----------
js = rep(js, "function render(){\n  LAST_RENDER = Date.now();", "function render(){\n  if(MI.drag && MI.drag.ghost) return;   /* a truck in hand: the floor holds still */\n  try{ pmBeforeRender(); }catch(e){ console.error(e); }\n  LAST_RENDER = Date.now();")
js = rep(js, "  pinProfilePop();\n  if(UI.profileOpen) requestAnimationFrame(pinProfilePop);\n}", "  pinProfilePop();\n  if(UI.profileOpen) requestAnimationFrame(pinProfilePop);\n  try{ pmAfterRender(); }catch(e){ console.error(e); }\n}")
js = rep(js, "function render() {\n  var prev = OPEN_PREV;\n  renderNow();\n", "function render() {\n  var prev = OPEN_PREV;\n  renderNow();\n  try { pmDetailRendered(R, RO); } catch (e) {}\n")
js = rep(js, "if(y2 && (y2.state === \"d\") !== now) { scheduleSave(true); return; } }", "if(y2 && (y2.state === \"d\") !== now) { scheduleSave(true); pmStageNotice(ro, k); return; } }")
js = rep(js, "\" by hand\", ro); }catch(e){}\n  scheduleSave(true);\n}", "\" by hand\", ro); }catch(e){}\n  scheduleSave(true); pmStageNotice(ro, k);\n}")
js = rep(js, "var b = el('button', { class: 'px-stage__seg ' + cls,", "var b = el('button', { class: 'px-stage__seg ' + cls, 'data-pm-stage': x.k,")
js = rep(js, "function pushToast(msg, undoable){\n  UI.toast = msg; UI.toastUndo = !!undoable;\n", "function pushToast(msg, undoable){\n  UI.toast = msg; UI.toastUndo = !!undoable; UI.toastUndoRef = undoable ? UNDO[UNDO.length - 1] : null;   /* Undo only while it's still the last thing done */\n")
js = rep(js, "(UI.toastUndo ? '<button class=\"toast-undo\"", "(UI.toastUndo && UI.toastUndoRef === UNDO[UNDO.length - 1] ? '<button class=\"toast-undo\"")
# ---------- Move truck, the bay that fits, bays you can Tab to ----------
js = rep(js, "'Transfer…</button><button class=\"btn btn-sm\" data-action=\"goto-ro\" data-ro=\"' + ro.id + '\">Open RO</button></div>'\n    + '<h2>' + esc(ro.customerName || \"\") + '</h2><div class=\"r2\">' + tgSpotChip(ro)",
         "'Transfer…</button>' + (c !== \"arr\" ? '<button class=\"btn btn-sm\" data-pm-move=\"' + ro.id + '\" title=\"Move the truck to an open bay — or drag it on the floor\">Move truck</button>' : '') + '<button class=\"btn btn-sm\" data-action=\"goto-ro\" data-ro=\"' + ro.id + '\">Open RO</button></div>'\n    + '<h2>' + esc(ro.customerName || \"\") + '</h2><div class=\"r2\">' + tgSpotChip(ro)")
js = rep(js, "tgHeld(ro) + fmQbar(ro)", "v10Fit(ro) + tgHeld(ro) + fmQbar(ro)")
js = rep(js, "data-fm-drag=\"' + ro.id + '\" role=\"button\" title=\"'", "data-fm-drag=\"' + ro.id + '\" role=\"button\" tabindex=\"0\" aria-pressed=\"' + !!(sel && sel.id === ro.id) + '\" title=\"'")
# ---------- how long each blocker has waited; the technician's day; the readiness count ----------
js = rep(js, "var h = tgHold(ro), over = h.held > h.goal;\n  return '<span class=\"tg-held' + (over ? ' over' : '')", "var h = tgHold(ro), over = h.held > h.goal;\n  return '<span class=\"tg-held' + (over ? ' over' : h.held > h.goal * .75 ? ' soon' : '')")
js = rep(js, "'<span class=\"tg-w' + (x.late && !x.back ? ' late' : '') + '\">' + esc(x.why) + '</span>'", "'<span class=\"tg-w' + (x.late && !x.back ? ' late' : '') + '\">' + v10Age(ro) + esc(x.why) + '</span>'", 2)
js = rep(js, "+ '</span></button>'; }).join('') }; }", "+ '</span>' + v10TechCap(x.k, ro) + '</button>'; }).join('') }; }")
js = rep(js, "<b>Ready to close</b><small>' + done + ' of ' + n + (nb ? ' · ' + nb + ' open' : '') + '</small></div>'", "<b>Ready to close</b><small>' + done + ' of ' + n + (nb ? ' · ' + nb + ' open' : '') + '</small>' + v10Ready(done, n) + '</div>'")
# ---------- the shift handover, from the Foreman header; tabs say which one is open ----------
js = rep(js, "'<span class=\"tg-hsep\"></span>' + search + '<button class=\"btn ib tg-srch-b\" data-action=\"fm-pop\" data-p=\"cfg\"", "'<span class=\"tg-hsep\"></span>' + search + '<button class=\"btn ib tg-srch-b\" data-v10=\"hand\" title=\"Shift handover — what the next shift needs\" aria-label=\"Shift handover\">' + tgI(\"doc\", 16) + '</button><button class=\"btn ib tg-srch-b\" data-action=\"fm-pop\" data-p=\"cfg\"")
js = rep(js, "'<button role=\"tab\" class=\"' + (UI.fmView === x[0] ? 'on' : '') + '\"", "'<button role=\"tab\" aria-selected=\"' + (UI.fmView === x[0]) + '\" class=\"' + (UI.fmView === x[0] ? 'on' : '') + '\"")
js = rep(js, "'<button role=\"tab\" class=\"' + (UI.tgView === v[0] ? 'on' : '') + '\"", "'<button role=\"tab\" aria-selected=\"' + (UI.tgView === v[0]) + '\" class=\"' + (UI.tgView === v[0] ? 'on' : '') + '\"")
# ---------- the RO header's year: the RO's own, else the VIN's (b9/trucks.js) ----------
js = rep(js, "var veh = [[vi.year, vi.make, RO.model].filter(Boolean).join(' ')", "var veh = [(function () { try { var tl = trkLabel(RO); return tl === 'this truck' ? '' : tl; } catch (e) { return [vi.year, vi.make, RO.model].filter(Boolean).join(' '); } })()")
# ---------- White and Near black: two more themes beside Ivory and Graphite (the same pages, ChatGPT's colors) ----------
js = rep(js, '  ivd:     { name:"Graphite", dark:true,  bg:"#0E0E0D", card:"#151514", hero:"#2A241B", acc:"#D1B184" }\n};', '  ivd:     { name:"Graphite", dark:true,  bg:"#0E0E0D", card:"#151514", hero:"#2A241B", acc:"#D1B184" },\n  vvl:     { name:"White",    dark:false, bg:"#f5f6f8", card:"#ffffff", hero:"#edf3ff", acc:"#245cdb" },\n  vvd:     { name:"Near black", dark:true, bg:"#0b0d10", card:"#111418", hero:"#1c2a44", acc:"#8aafff" }\n};')
js = rep(js, 'function resolvedTheme(){\n  return THEME === "ivd" ? "ivd" : "ivl";\n}', 'function resolvedTheme(){\n  return THEME === "ivd" || THEME === "vvd" ? "ivd" : "ivl";   /* White and Near black are Ivory and Graphite with their own colors */\n}')
js = rep(js, '  mode = THEME_OLD[mode] || mode; THEME = mode === "ivd" ? "ivd" : "ivl";\n  var de = document.documentElement;\n  de.setAttribute("data-theme", resolvedTheme());', '  mode = THEME_OLD[mode] || mode; THEME = mode === "ivd" || mode === "vvl" || mode === "vvd" ? mode : "ivl";\n  var de = document.documentElement;\n  de.setAttribute("data-theme", resolvedTheme());\n  if(/^vv/.test(THEME)) de.setAttribute("data-pal", "vv"); else de.removeAttribute("data-pal");\n  try{ var jh = document.querySelector(".jc-host"); if(jh) jh.classList.toggle("pal-vv", /^vv/.test(THEME)); }catch(e){}')
js = rep(js, 'var THEME_ORDER = ["ivl","ivd"];', 'var THEME_ORDER = ["ivl","ivd","vvl","vvd"];')
js = rep(js, 'var THEME_IDS = ["mist","glacier","atl","atd","ivl","ivd"];', 'var THEME_IDS = ["mist","glacier","atl","atd","ivl","ivd","vvl","vvd"];')
js = rep(js, 'host.classList.toggle("th-iv", /^iv[ld]$/.test(resolvedTheme()));', 'host.classList.toggle("th-iv", /^iv[ld]$/.test(resolvedTheme())); host.classList.toggle("pal-vv", /^vv/.test(THEME));')
js = rep(js, 'pxSeg([["ivl", "Ivory", "sun"], ["ivd", "Graphite", "moon"]], THEME, "set-theme", "data-theme")', 'pxSeg([["ivl", "Ivory", "sun"], ["ivd", "Graphite", "moon"], ["vvl", "White", "sun"], ["vvd", "Near black", "moon"]], THEME, "set-theme", "data-theme")')
_jc0 = js.index('var JC_CSS = "'); _jc1 = js.index('";\n', _jc0)
js = js[:_jc1] + json.dumps("\n" + b9("v10_jc.css"))[1:-1] + js[_jc1:]
# ======================================================================= Parsec 11: the Technician page (b9/tc1.js, b9/tc.css)
# right below the Inbox in the sidebar and on the phone; technicians only; it replaces Console for them
js = rep(js, 'var PX_GROUPS = [["", ["console", "triage", "rolist", "ros"]]', 'var PX_GROUPS = [["", ["tech", "console", "triage", "rolist", "ros"]]')
js = rep(js, 'var IV_NAV_IC = { console:"console",', 'var IV_NAV_IC = { tech:"tech", console:"console",')
js = rep(js, 'var IVI = {"eye":', 'var IVI = {"tech": ' + json.dumps(TECH_IC) + ', "eye":')
js = rep(js, '  "Technician": ["console","ros","fixes","timelog","parts","career"],', '  "Technician": ["tech","ros","fixes","timelog","parts","career"],')
js = rep(js, 'function staffList(){ if(!Array.isArray(STATE.staff)) STATE.staff = []; return STATE.staff; }',
         'function staffList(){ if(!Array.isArray(STATE.staff)) STATE.staff = [];\n  /* Parsec 11: a technician gets the Technician page in place of Console (once — the Manager can switch Console back on) */\n  STATE.staff.forEach(function(s){ if(s && s.role === "Technician" && !s.p11){ s.p11 = 1; s.pages = s.pages || {}; s.pages.console = false; s.pages.tech = true; } });\n  return STATE.staff; }')
js = rep(js, '  if(UI.view==="console") viewHtml = viewConsole();\n', '  if(UI.view==="tech") viewHtml = CX.viewTech();\n  else if(UI.view==="console") viewHtml = viewConsole();\n')
js = rep(js, '  if(!navAllowed(UI.view)) UI.view = navPages()[0][0];\n  if(UI.view==="tech")', '  if(!navAllowed(UI.view)) UI.view = (function(){ var sf = viewAsStaff(); return sf ? PG.homeOf(sf.role) : (UI.view === "console" && navAllowed("tech") ? "tech" : navPages()[0][0]); })();\n  if(UI.view==="tech")')
js = rep(js, '(UI.view==="ros"||UI.view==="console"||UI.view==="warranty"||UI.view==="fixes")?" wide":""', '(UI.view==="ros"||UI.view==="console"||UI.view==="tech"||UI.view==="warranty"||UI.view==="fixes")?" wide":""')
js = rep(js, 'if(["console","ros","warranty","fixes","career","timelog","parts","report"].indexOf(UI.view) === -1) UI.view = "console";', 'if(["tech","inbox","console","ros","warranty","fixes","career","timelog","parts","report","foreman","triage","manager","rolist"].indexOf(UI.view) === -1) UI.view = "console";')
# ---------- 11.1: a file can belong to one operation (the Technician page's Files tab) ----------
js = rep(js, "  addFilesTo: function (ro, task, list, cb) {   /* the Warranty packet's Upload */", "  addFilesTo: function (ro, task, list, cb, opId) {   /* the Warranty packet's Upload; the Technician page's Files tab gives the operation */")
js = rep(js, "type: out.blob.type || file.type, ts: ts }); }); }); }))", "type: out.blob.type || file.type, ts: ts, op: opId || undefined }); }); }); }))")
# ======================================================================= Parsec 11.3
# ---------- the RO number: the last 4 everywhere; the full number where the RO is open (its header), on paper and in copies ----------
js = rep(js, 'function tgNum(ro){ return String(ro.roNumber || "?").replace(/^RO[\\s-]*/i, ""); }',
         'function roShortNo(n){ n = String(n == null ? "" : n).trim(); var d = n.replace(/\\D/g, ""); return d.length > 4 ? d.slice(-4) : (n.replace(/^R[AO][\\s-]*/i, "") || n || "?"); }   /* Parsec 11.3: an RO goes by its last 4 digits */\n'
         'function roLabelFull(ro){ var n = String((ro && ro.roNumber) || "?"); return /^RO\\b/i.test(n) ? n : "RO " + n; }   /* the full number: the open RO, prints and copies */\n'
         'function tgNum(ro){ return roShortNo((ro && ro.roNumber) || "?"); }')
js = rep(js, 'function roLabel(ro){ var n = String(ro.roNumber || "?"); return /^RO\\b/i.test(n) ? n : "RO " + n; }', 'function roLabel(ro){ return "RO " + roShortNo((ro && ro.roNumber) || "?"); }')
def fn_sub(js, fn, n):
    i = js.index("\nfunction " + fn + "(") + 1; j = js.index("\nfunction ", i + 10)
    b, c = re.subn(r"\b([A-Za-z_]\w*)\.roNumber\b", r"tgNum(\1)", js[i:j])
    assert c == n, (fn, c)
    return js[:i] + b + js[j:]
js = fn_sub(js, "modalHtml", 8)            # the pop-ups' titles, the punch's RO picker
js = fn_sub(js, "computeWarningsAll", 7)   # warnings and reminders
js = fn_sub(js, "computeRemindersAll", 3)
js = rep(js, "title=\"Open RO '+esc(n.ro.roNumber)+'\">Open</button>", "title=\"Open RO '+esc(tgNum(n.ro))+'\">Open</button>")
js = rep(js, '" added to RO " + ro.roNumber, true);', '" added to RO " + tgNum(ro), true);')
js = rep(js, "<span class=\"no mono\">' + (shop ? 'Shop' : esc(String(ro.roNumber || '')))", "<span class=\"no mono\">' + (shop ? 'Shop' : esc(tgNum(ro)))")
js = rep(js, 'if(gaps.length){ pushToast("RO " + (ro.roNumber || "") + " ', 'if(gaps.length){ pushToast("RO " + tgNum(ro) + " ')
js = rep(js, "'<span class=\"pal-ro mono\">'+esc(r.ro.roNumber)+'</span>'", "'<span class=\"pal-ro mono\">'+esc(tgNum(r.ro))+'</span>'")
js = rep(js, "'<span class=\"pal-sub\"><span class=\"mono\">'+esc(r.ro.roNumber)+'</span>", "'<span class=\"pal-sub\"><span class=\"mono\">'+esc(tgNum(r.ro))+'</span>")
# where an RO is open: the selected RO on Foreman, Triage and Warranty (the RO page keeps its own full number)
js = rep(js, "'<div class=\"tg-top\">' + trkHead(ro) + '<div class=\"r1\"><b class=\"tg-no\">' + esc(roLabel(ro)) + '</b>' + tgSq(c)", "'<div class=\"tg-top\">' + trkHead(ro) + '<div class=\"r1\"><b class=\"tg-no\">' + esc(roLabelFull(ro)) + '</b>' + tgSq(c)")
js = rep(js, "<div class=\"tg-dkh\">' + trkHead(ro) + '<div class=\"l\"><div class=\"eb\"><b class=\"tg-no\">' + esc(roLabel(ro)) + '</b>", "<div class=\"tg-dkh\">' + trkHead(ro) + '<div class=\"l\"><div class=\"eb\"><b class=\"tg-no\">' + esc(roLabelFull(ro)) + '</b>")
js = rep(js, "<div class=\"tg-top\"><div class=\"r1\"><b class=\"tg-no\">' + esc(roLabel(ro)) + '</b>' + tgSq(tyCat(ro))", "<div class=\"tg-top\"><div class=\"r1\"><b class=\"tg-no\">' + esc(roLabelFull(ro)) + '</b>' + tgSq(tyCat(ro))")
js = rep(js, "return '<div class=\"tg-top\"><div class=\"r1\"><b class=\"tg-no\">' + esc(roLabel(ro)) + '</b>' + waChip(s)", "return '<div class=\"tg-top\"><div class=\"r1\"><b class=\"tg-no\">' + esc(roLabelFull(ro)) + '</b>' + waChip(s)")
# on paper and in what's copied out: the full number
js = rep(js, "<div class=\"wa-pvb\"><b>Print packet</b><span>' + esc(roLabel(ro))", "<div class=\"wa-pvb\"><b>Print packet</b><span>' + esc(roLabelFull(ro))")
js = rep(js, 'waPrintDoc(roLabel(ro) + " — warranty packet"', 'waPrintDoc(roLabelFull(ro) + " — warranty packet"')
js = rep(js, "</small></div><div class=\"r\"><b>' + esc(roLabel(ro)) + '</b><small>'", "</small></div><div class=\"r\"><b>' + esc(roLabelFull(ro)) + '</b><small>'")
js = rep(js, 'var L = [roLabel(ro) + " · " + (ro.customerName || "")', 'var L = [roLabelFull(ro) + " · " + (ro.customerName || "")')
# ---------- the RO page: Activity is a button in the header, left of the files button; it opens as a pop-up ----------
js = rep(js, "  col.appendChild(pxActivity());\n", "")
js = rep(js, "        pxMenuItem('history', 'History', { run: pxHistoryModal }),", "        pxMenuItem('history', 'History', { run: function () { PXA.f = 'changes'; pxActivityModal(); } }),")
js = rep(js, "      el('button', { class: 'px-total', type: 'button', title: 'Files on this RO · click for the list',", "      pxActBtn(),\n      el('button', { class: 'px-total', type: 'button', title: 'Files on this RO · click for the list',")
js = rep(js, "function pxActivity() {\n", r"""/* Parsec 11.3: Activity — the RO's notes and changes, in a pop-up from the header */
var PXA = { f: 'all' };
function pxActEvents() {
  var ev = [];
  (RO.history || []).forEach(function (h) { ev.push({ at: +h.at || +new Date(h.at), h: h }); });
  S.jobs.forEach(function (j, i) { (Array.isArray(j.offNotes) ? j.offNotes : []).forEach(function (n) { ev.push({ at: +new Date(n.at), note: n, op: i + 1 }); }); });
  ev.sort(function (a, b) { return a.at - b.at; });
  return ev;
}
function pxActBtn() {
  var ev = pxActEvents(), nn = ev.filter(function (x) { return x.note; }).length;
  return el('button', { class: 'px-total', type: 'button', title: 'Activity on this RO · notes and changes', 'aria-label': 'Activity: ' + nn + ' note' + (nn === 1 ? '' : 's') + ', ' + ev.length + ' entries. Open', html: pxI('history') + '<span><b>' + ev.length + '</b></span>', onClick: function () { pxActivityModal(); } });
}
function pxActivityModal() {
  var feed = el('div', { class: 'px-feed px-actm__feed', role: 'log', 'aria-live': 'polite' });
  var seg = pxSeg([['all', 'All'], ['notes', 'Notes'], ['changes', 'Changes']], PXA.f, function (v) { PXA.f = v; fill(true); });
  var sel = el('select', { class: 'px-actm__op', 'aria-label': 'The operation the note goes on' });
  S.jobs.forEach(function (j, i) { sel.appendChild(el('option', { value: j.id, text: 'Op ' + (i + 1) + ' · ' + (j.complaint || 'Operation') })); });
  var cur = S.jobs.filter(function (x) { return x.id === S.ui.card; })[0] || S.jobs[0]; if (cur) sel.value = cur.id;
  var inp = el('input', { class: 'px-composer__in', placeholder: S.jobs.length ? 'Leave a note… Enter saves it' : 'Add an operation first', 'aria-label': 'Leave a note' });
  var cnt = el('span', { class: 'px-actm__n' });
  function noteEv(x) { return el('div', { class: 'px-ev' }, [el('span', { class: 'px-av', text: ivInit(x.note.by || RO.assignedTech) }), el('span', { html: '<b>' + esc(x.note.by || RO.assignedTech || 'You') + '</b> left a note on operation ' + x.op }), el('time', { text: pxWhen(x.at) }), el('div', { class: 'px-note', text: x.note.text })]); }
  function fill(top) {
    var all = pxActEvents(), ev = all.filter(function (x) { return PXA.f === 'all' || (PXA.f === 'notes' ? !!x.note : !x.note); });
    feed.innerHTML = '';
    ev.slice(-300).forEach(function (x) { feed.appendChild(x.note ? noteEv(x) : pxEvent(x.h)); });
    if (!ev.length) feed.appendChild(el('div', { class: 'px-ev', html: '<span class="px-ev__dot">' + pxI('history', 14) + '</span><span>' + (PXA.f === 'notes' ? 'No notes on this RO yet.' : PXA.f === 'changes' ? 'No changes on this RO yet.' : 'Nothing has happened on this RO yet.') + '</span><time></time>' }));
    var nn = all.filter(function (x) { return x.note; }).length;
    cnt.textContent = nn + ' note' + (nn === 1 ? '' : 's') + ' · ' + (all.length - nn) + ' change' + (all.length - nn === 1 ? '' : 's');
    requestAnimationFrame(function () { feed.scrollTop = feed.scrollHeight; });
  }
  function send() {
    var txt = autoPunct(String(inp.value || '').trim()); if (!txt) return;
    var j = S.jobs.filter(function (x) { return x.id === sel.value; })[0] || S.jobs[0];
    if (!j) { toast('Add an operation first'); return; }
    pushUndo('note'); j.offNotes = (Array.isArray(j.offNotes) ? j.offNotes : []).concat([{ id: 'on' + Date.now().toString(36), at: new Date().toISOString(), text: txt, by: punchByName() || (typeof pxMeName === 'function' ? pxMeName() : '') }]);
    save(true); render(); inp.value = ''; if (PXA.f === 'changes') { PXA.f = 'all'; Array.prototype.forEach.call(seg.children, function (c, k) { c.classList.toggle('is-on', k === 0); }); } fill();
    toast('Note saved on operation ' + (S.jobs.indexOf(j) + 1), { label: 'UNDO', run: function () { restoreSnapshot(); } });
    try { inp.focus(); } catch (e) {}
  }
  inp.addEventListener('keydown', function (e) { e.stopPropagation(); if (e.key === 'Enter') { e.preventDefault(); send(); } });
  var comp = el('div', { class: 'px-composer px-actm__comp' }, [el('span', { html: pxI('chat') }), inp, S.jobs.length > 1 ? sel : null, el('button', { class: 'px-btn px-btn--sm px-btn--primary', type: 'button', text: 'Save note', onClick: send })]);
  pxModal({ title: 'Activity · ' + (RO.roNumber || 'RO'), sub: (RO.customerName || '') + ' · notes and changes, oldest first', size: 'md', hint: '<span class="px-kbd">↵</span>saves the note · <span class="px-kbd">esc</span>closes',
    body: [el('div', { class: 'px-actm__bar' }, [seg, cnt]), feed, comp] });
  fill();
  setTimeout(function () { try { inp.focus(); } catch (e) {} }, 60);
}
function pxActivity() {
""")
_jc0 = js.index('var JC_CSS = "'); _jc1 = js.index('";\n', _jc0)
js = js[:_jc1] + json.dumps("\n" + b9("v113_jc.css"))[1:-1] + js[_jc1:]
js = re.sub(r'var BUILD = "[^"]*";', 'var BUILD = "Parsec 11.3 · the Technician page for the admin, RO numbers by their last 4, Activity in the RO header, the truck by its year and model";', js, count=1)
C.node_check(js, "after the patches")

# ======================================================================= the clean-out: code nothing can reach
# b9/prune.js parses the script (acorn): action handlers no button reaches, then every top-level function and
# constant nothing reachable from the code that runs at load uses. Repeats until nothing more goes.
whole = lambda j: src[:k0] + j + src[k1:]
removed = []
KEEP = ["MI", "pmMoveMenu", "pkShow", "hoOpen", "trkDlgOpen", "trkMatch", "trkCatOpen", "trkTopOf", "VT_P", "truckYM", "STATE", "UI", "render", "loadSample25", "getRO", "tyCat", "roStatus", "staffList", "applyTheme", "todayStr", "raLive", "pxOut", "pxLogout", "pxSignedIn", "pxPartIn", "pxPartKeys",
        "shiftClockIn", "shiftClockOut", "runningPunch", "openShift", "navPages", "viewAsStaff", "ensureDemoTeam", "scheduleSave", "nowIso", "uid", "undoLast", "PG", "CX", "IB", "TL", "PT", "FX", "CR", "MG", "RL", "DR",
        "doStartPunch", "doStopPunch", "shiftList", "rtSend", "rtAccept", "computeWarnings", "opRealParts", "tgNum", "localDay", "roStages", "pgShopData", "connectFolder", "fsGateOn", "adoptFolderState", "writeFolderState",
        "tgVDesk", "tgItemOf", "tgLate", "raNext", "tyCloseChecks", "opDoneNow", "pxBkInfo", "pxBkWarn", "pxKeyGroups", "PX_STATUS", "pxClockState", "RA_PST", "AUTO_PART_STATES", "ASST_PART_STATUSES", "pxRailHtml", "FS",
        "fmCfg", "fmClearedList", "fmNcClear", "fmNeedsAll", "fmOpenPop", "fmTechs", "fmTmr", "raOps", "spotOf", "tgClashes", "tgFlat", "tgNeedsAll", "UI_KEYS"]   # the test hook reaches these
import tempfile
def prune_once(js):
    d = tempfile.mkdtemp()
    open(os.path.join(d, "a.js"), "w", encoding="utf-8").write(js)
    open(os.path.join(d, "o.txt"), "w", encoding="utf-8").write(src[:k0] + "\n" + src[k1:])
    json.dump(KEEP, open(os.path.join(d, "k.json"), "w"))
    r = subprocess.run(["node", os.path.join(H, "b9", "prune.js"), os.path.join(d, "a.js"), os.path.join(d, "o.txt"), os.path.join(d, "k.json")], capture_output=True, text=True)
    if r.returncode: raise SystemExit("prune failed:\n" + r.stderr[:3000])
    return json.loads(r.stdout)
NOPRUNE = os.environ.get('PG_NOPRUNE') == '1'
for rnd in range(0 if NOPRUNE else 10):
    R = prune_once(js)
    if not R["cuts"]: break
    for a, b, name, kind in reversed(R["cuts"]):
        s0 = a
        if kind in ("function", "var", "inner"):
            # the comment right above it, when it belongs to it alone (not a section banner)
            k = s0
            while k > 0 and js[k - 1] in " \t": k -= 1
            if k > 1 and js[k - 1] == "\n" and js[k - 3:k - 1] == "*/":
                st = js.rfind("/*", 0, k - 1)
                if st >= 0 and (st == 0 or js[st - 1] == "\n") and "====" not in js[st:k] and js[st:k].count("*/") == 1: s0 = st
            elif k > 1 and js[k - 1] == "\n":
                ls = js.rfind("\n", 0, k - 1) + 1
                if js[ls:k - 1].lstrip().startswith("//") and "====" not in js[ls:k]: s0 = ls
        e0 = b
        if js[e0:e0 + 1] == ";": e0 += 1
        if js[e0:e0 + 1] == "\n" and (s0 == 0 or js[s0 - 1] == "\n"): e0 += 1
        removed.append((kind + ":" + name, e0 - s0))
        js = js[:s0] + js[e0:]
    C.node_check(js, "after prune round %d" % rnd)
LOG.append("code nothing can reach: %d pieces, %d KB (%s)" % (len(removed), sum(b for a, b in removed) // 1024, ", ".join("%d %s" % (sum(1 for a, b in removed if a.startswith(k + ":")), k) for k in ("function", "var", "inner", "case", "if"))))
src = src[:k0] + js + src[k1:]

# ======================================================================= styles
CSSF = [  # file, pages that use it — in the mock-ups' order
    (os.path.join(B, "mg", "mg.css"), ["console", "tech", "career", "manager"]),
    (os.path.join(B, "mgi", "ideas.css"), ["console", "tech", "career", "manager"]),
    (os.path.join(B, "ib", "ib.css"), ["console", "tech", "career", "inbox"]),
    (os.path.join(B, "cr", "cr.css"), ["console", "tech", "career"]),
    (os.path.join(B, "cx", "cx.css"), ["console", "tech"]),
]
for f in sorted(os.listdir(os.path.join(H, "b9"))):
    m = re.fullmatch(r"(tl|pt|fx|rl|dr|tc)\.css", f)
    if m:
        CSSF.append((os.path.join(H, "b9", f), [{"tl": "timelog", "pt": "parts", "fx": "fixes", "rl": "rolist", "dr": "report", "tc": "tech"}[m.group(1)]]))
css = []
for f, pgs in CSSF:
    pgs = [p for p in pgs if p in PAGES]
    if not pgs: continue
    raw = open(f, encoding="utf-8").read().replace(".mg-pc.main", ".mg-pc.m0")
    css.append("/* %s */\n" % os.path.basename(f) + mcss.convert(raw, pgs))
css.append(b9("frame.css").replace("__PAGES__", ",".join(".v-" + p for p in PAGES)))
if not os.environ.get("NOPHONE"): css.append(b9("phone.css"))
css.append(b9("trucks.css"))
css.append(b9("v10.css"))
block = "\n".join(css)
assert "</style" not in block
k = src.index('<style id="v182px">'); e = src.index("</style>", k) + len("</style>")
src = src[:e] + '\n<style id="v190pg">\n' + block + '\n</style>' + src[e:]
# classes nothing writes: a class in the styles that no script or markup ever puts on an element
# (a class built from a prefix — 'st-' + tone — is safe: anything starting with a prefix a script writes stays)
if not NOPRUNE:
    cls = C.css_classes(src)
    blocks = C.style_blocks(src); parts_ = []; last = 0
    for _a, a0, b0 in blocks: parts_.append(src[last:a0]); last = b0
    parts_.append(src[last:]); outside = "".join(parts_)
    words = set(re.findall(r'[A-Za-z_][\w-]*', outside))
    pre = {m.group(1) for m in re.finditer(r'([A-Za-z][\w-]*-)(?=["\'`]|\$\{)', outside) if len(m.group(1)) >= 2}
    dead_cls = sorted(c for c in cls if c not in words and not any(c.startswith(p0) for p0 in pre))
    LOG.append("classes nothing writes: %d" % len(dead_cls))
    k_before = len(src)
    if dead_cls: src = C.css_dead_classes(src, dead_cls, "classes nothing writes", LOG)
    # custom properties nothing reads, animations nothing plays, rules left empty, style blocks left empty
    import cssx
    props = set(re.findall(r'(?<![\w-])(--[A-Za-z][\w-]*)\s*:', src))
    dead_p = [p0 for p0 in props if len(re.findall(re.escape(p0) + r'(?![\w-])', src)) == len(re.findall(r'(?<![\w-])' + re.escape(p0) + r'\s*:', src))]
    kfs = re.findall(r'@keyframes\s+([\w-]+)', src)
    dead_k = [k for k in set(kfs) if len(re.findall(r'(?<![\w-])' + re.escape(k) + r'(?![\w-])', src)) <= kfs.count(k)]
    for _a, a0, b0 in reversed(C.style_blocks(src)):
        t = src[a0:b0]
        for p0 in dead_p:
            t = re.sub(r'(?<![\w-])' + re.escape(p0) + r'\s*:[^;{}]*;?', '', t)
        for k in dead_k:
            while True:
                m = re.search(r'@keyframes\s+' + re.escape(k) + r'\s*\{', t)
                if not m: break
                e = cssx.match_brace(t, m.end() - 1)
                t = t[:m.start()] + t[e:]
        for _ in range(3):
            t = re.sub(r'(?<=[{};])\s*[^{}@;]+\{\s*\}', '', t)
            t = re.sub(r'(?<=[{};])\s*@media[^{]*\{\s*\}', '', t)
        src = src[:a0] + t + src[b0:]
    src = re.sub(r'\n?<style[^>]*>\s*</style>', '', src[:src.index("<script")]) + src[src.index("<script"):]
    LOG.append("custom properties nothing reads: %d · animations nothing plays: %d" % (len(dead_p), len(dead_k)))
    LOG.append("styles out: %d KB" % ((k_before - len(src)) // 1024))

src = rep(src, 'document.documentElement.setAttribute("data-theme",/^(ivd|mist|atd)$/.test(t||"")?"ivd":"ivl");', 'document.documentElement.setAttribute("data-theme",/^(ivd|vvd|mist|atd)$/.test(t||"")?"ivd":"ivl");if(/^vv/.test(t||""))document.documentElement.setAttribute("data-pal","vv");')
out = sys.argv[1] if len(sys.argv) > 1 else os.path.join(H, "Parsec_11_base.html" if NOPRUNE else ("Parsec_11_np.html" if os.environ.get("NOPHONE") else "Parsec_11.html"))
assert src.count(TRKP_TOKEN) == 1, src.count(TRKP_TOKEN)
src = src.replace(TRKP_TOKEN, json.dumps(_tp), 1)
open(out, "w", encoding="utf-8").write(src)
if not NOPRUNE: json.dump({"removed_functions": removed, "log": LOG}, open(os.path.join(H, "b9", "_build11_log.json"), "w"), indent=1)

# ---------- the test copy with a hook into the app's scope ----------
hook = src
tail = "})();\n</script>\n</body>"
assert hook.count(tail) == 1, hook.count(tail)
names = ["STATE", "UI", "render", "loadSample25", "getRO", "tyCat", "roStatus", "staffList", "applyTheme", "todayStr", "raLive", "pxOut", "pxLogout", "pxSignedIn", "pxPartIn", "pxPartKeys",
         "shiftClockIn", "shiftClockOut", "runningPunch", "openShift", "navPages", "viewAsStaff", "ensureDemoTeam", "scheduleSave", "nowIso", "uid", "undoLast", "PG", "CX", "IB",
         "doStartPunch", "doStopPunch", "shiftList", "rtSend", "rtAccept", "computeWarnings", "opRealParts", "tgNum", "localDay", "roStages", "pgShopData", "connectFolder", "fsGateOn", "adoptFolderState", "writeFolderState", "reconnectFolder", "fsGateHtml", "FS_ERR", "mobBundle", "mobApply", "TQ", "openPhoneSync", "trkLib", "trkPick", "trkModelFor", "trkPhotoOf", "trkBanner", "JC", "trkInspOpen", "trkCode", "trkHead", "trkDlgOpen", "trkMatch", "trkCatOpen", "trkTopOf", "truckYM", "VT_P"] + [x for x in ["TL", "PT", "FX", "CR", "MG", "RL", "DR"] if re.search(r"var " + x + r" = \(function", js)]
B8N = ["tgVDesk", "tgItemOf", "tgLate", "raNext", "tyCloseChecks", "raLive", "opDoneNow", "pxBkInfo", "pxBkWarn", "pxKeyGroups", "PX_STATUS", "pxClockState", "RA_PST", "AUTO_PART_STATES", "ASST_PART_STATUSES", "pxRailHtml", "FS",
       "fmCfg", "fmClearedList", "fmNcClear", "fmNeedsAll", "fmOpenPop", "fmTechs", "fmTmr", "raOps", "spotOf", "tgClashes", "tgFlat", "tgNeedsAll", "UI_KEYS"]
names += [n for n in B8N if n not in names and re.search(r'(?<![\w$.])(function\s+' + n + r'\b|var\s+' + n + r'\b)', js)]
for nm in names:
    assert re.search(r'(?<![\w$.])(function\s+' + nm + r'\b|var\s+' + nm + r'\b|' + nm + r'\s*=)', js) or nm in ("STATE", "UI"), nm
t7 = open(os.path.join(H, "b8", "t7hook.js"), encoding="utf-8").read().strip()
t7 = t7[len("window.__tg = "):].rstrip(";")
def _fix(m):
    k, v = m.group(1), m.group(2)
    if v != "typeof" and re.fullmatch(r'[A-Za-z_$][\w$]*', v) and not re.search(r'(?<![\w$.])(function\s+' + re.escape(v) + r'\b|var\s+' + re.escape(v) + r'\b)', js):
        return "%s: null" % k
    return m.group(0)
t7 = re.sub(r'(\w+): ([A-Za-z_$][\w$]*)(?=[,}\s])', _fix, t7)
hook = hook.replace(tail, "FS_LOCAL = true;   /* the tests run without a folder */\nwindow.__tg = Object.assign(" + t7 + ", {" + ", ".join("%s: function(){ return %s; }" % (n, n) if n in ("STATE", "UI", "FS", "FS_ERR", "mobBundle", "mobApply", "PX_STATUS", "RA_PST", "AUTO_PART_STATES", "ASST_PART_STATUSES") else "%s: %s" % (n, n) for n in names) + "});\n" + tail)
open(os.path.join(H, "t11_base.html" if NOPRUNE else ("t11_np.html" if os.environ.get("NOPHONE") else "t11.html")), "w", encoding="utf-8").write(hook)
for l in LOG: print(l)
print("built", out, len(src) // 1024, "KB; removed functions", len(removed))
