# Build Parsec_8.html — step 0 of the redesign: the shared kit (px-), the nav rail and profile,
# signing in and out, one status list, one keys sheet, the end-of-day backup, the Triage bars that
# show only when they matter, and the clean-out of old code. From Parsec_7.html.
import os, sys, json, re, subprocess
H = os.path.dirname(os.path.abspath(__file__))
B = os.path.join(os.path.dirname(H), "build")
sys.path.insert(0, B); sys.path.insert(0, os.path.join(H, "b8"))
import parts as P
import clean as C

src = open(os.path.join(H, "Parsec_7.html"), encoding="utf-8").read()
LOG = []

def rep(s, a, b, n=1):
    c = s.count(a)
    assert c == n, (a[:100], c)
    return s.replace(a, b)

def cut(s, a, b, new, inclusive_end=False):
    i = s.index(a); assert s.count(a) == 1, a[:80]
    j = s.index(b, i) + (len(b) if inclusive_end else 0)
    return s[:i] + new + s[j:]

# ---------- icons the kit uses that the app doesn't have ----------
g = {"__file__": os.path.join(B, "make_fixes.py")}
code = open(os.path.join(B, "make_fixes.py"), encoding="utf-8").read().split('\nCSS = shell + r"""\n')[0]
argv = sys.argv; sys.argv = ["x", "/dev/null"]; exec(code, g); sys.argv = argv
IC = g["IC"]
IC["camera"] = '<path d="M4 8.5A1.5 1.5 0 0 1 5.5 7h2.2l1.5-2h5.6l1.5 2h2.2A1.5 1.5 0 0 1 20 8.5v9a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 17.5z"/><circle cx="12" cy="13" r="3.5"/>'
IC["chevUD"] = '<path d="m8 9.5 4-4 4 4M8 14.5l4 4 4-4"/>'
IC["lock"] = '<rect x="5" y="10.5" width="14" height="9.5" rx="2"/><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5"/>'
pxjs = "\n".join(open(os.path.join(H, "b8", f), encoding="utf-8").read() for f in ["px1.js", "px2.js", "px3.js", "px4.js"])
used = set(re.findall(r'pxI\("([A-Za-z]+)"', pxjs)) | set(re.findall(r'\["[a-z]+", "([A-Za-z]+)", "[^"]+", "[^"]+"\]', pxjs)) | {"sun", "moon"}
ivi_names = set(re.findall(r'"([A-Za-z]+)": "<', src[src.index("var IVI = {"):src.index("};", src.index("var IVI = {"))]))
need = sorted(k for k in used if k not in ivi_names)
miss = [k for k in need if k not in IC]
assert not miss, miss
pxjs = pxjs.replace("/*__PXI__*/{}", json.dumps({k: IC[k] for k in need}, ensure_ascii=False))
assert "</script" not in pxjs
pxcss = open(os.path.join(H, "b8", "px.css"), encoding="utf-8").read()

# ======================================================================= the app script
k0 = src.index('<script id="app-script">') + len('<script id="app-script">'); k1 = src.index("</script>", k0)
js = src[k0:k1]

# the kit goes in first, so its lists are ready before anything reads them
js = rep(js, '(function(){\n"use strict";\n', '(function(){\n"use strict";\n\n' + pxjs.strip() + '\n\n')

# ---------- the rail replaces the old sidebar inside the same header ----------
js = cut(js, "function ivSideHtml(badgeCount){", "function ivSideMini(on){", "function ivSideHtml(badgeCount){ return pxRailHtml(badgeCount); }\n")
js = rep(js, '''document.addEventListener("click", function(e){
  var b = e.target && e.target.closest && e.target.closest('[data-iv="side"]');
  if(b){ e.preventDefault(); e.stopPropagation(); ivSideMini(); return; }
  var ib = e.target && e.target.closest && e.target.closest('[data-iv="inbox"]');
  if(ib){ e.preventDefault(); e.stopPropagation(); var nb = document.querySelector('.iv-side .notif-btn'); if(nb) nb.click(); }
}, true);
''', '')
js = rep(js, 'if(e.key === "[" && ivDesk()){ e.preventDefault(); ivSideMini(); return; }', 'if(e.key === "[" && ivDesk()){ e.preventDefault(); pxSideToggle(); return; }')

# ---------- render: signed out, the profile page, the popovers, one header ----------
js = rep(js, "  LAST_RENDER = Date.now();\n  histSync();\n", "  LAST_RENDER = Date.now();\n  histSync();\n  if(pxOut()){ pxRenderOut(); return; }\n  document.documentElement.classList.remove(\"px-out\");\n")
js = rep(js, '  else if(UI.view==="report") viewHtml = viewDayReport();\n', '  else if(UI.view==="report") viewHtml = viewDayReport();\n  else if(UI.view==="profile") viewHtml = pxProfileView();\n')
js = rep(js, "  html += (document.documentElement.classList.contains('pz-rib') ? pzHeaderHtml(badgeCount) : headerHtml(badgeCount) + islandHtml()) + alertBannerHtml();",
         "  html += pzHeaderHtml(badgeCount) + pxPopHtml() + alertBannerHtml();")
js = rep(js, "  patchApp(html);\n  placeIsland();\n", "  patchApp(html);\n  pxAfter();\n")
js = rep(js, "function navAllowed(page){\n  var s = viewAsStaff(); if(!s) return true;", "function navAllowed(page){\n  if(page === \"profile\") return true;\n  var s = viewAsStaff(); if(!s) return true;")

# ---------- the old island bar: gone ----------
js = cut(js, "/* v94: the page bar doesn't open out any more \\u2014 pointing at a button shows its name */\n(function(){", 'window.addEventListener("resize", function(){ placeIsland(); });\n', "", inclusive_end=True)

# ---------- clicks ----------
js = rep(js, '  var t = e.target.closest("[data-action]");\n  if(UI.appMenu && !e.target.closest(".pnav-set")){',
         '  var t = e.target.closest("[data-action]");\n'
         '  if(UI.pxPop && !e.target.closest(".pxr-pop,[data-px-anchor]")){ UI.pxPop = null; if(!t) render(); }\n'
         '  if(UI.pxPeek && !e.target.closest(".px-rail")){ UI.pxPeek = false; if(!t) render(); }\n'
         '  if(UI.appMenu && !e.target.closest(".pnav-set")){')
js = rep(js, '  if(UI.navOpen && !e.target.closest(".island")){ UI.navOpen = false; if(!t) render(); }\n', '')
js = rep(js, '  if(a && a.indexOf("wa-") === 0 && waAct(a, t, e)) return;   /* v181: Warranty */\n',
         '  if(a && a.indexOf("wa-") === 0 && waAct(a, t, e)) return;   /* v181: Warranty */\n'
         '  if(a && a.indexOf("px-") === 0 && pxAct(a, t, e)) return;\n'
         '  if(UI.pxPop && t.closest(".pxr-pop") && a !== "set-theme" && a !== "set-size") UI.pxPop = null;\n'
         '  if(UI.pxPeek && t.closest(".px-rail") && a === "nav") UI.pxPeek = false;\n')
js = rep(js, '  /* a pick from the island folds it away: drop the focus it would otherwise keep open */\n  if(a !== "toggle-island" && t.closest(".island")){ UI.diShut = true; UI.navOpen = false; setTimeout(function(){ var ae = document.activeElement; if(ae && ae.closest && ae.closest(".island")) ae.blur(); }, 0); }\n', '')
js = rep(js, '    case "nav": UI.view=t.dataset.view; UI.modal=null; UI.navOpen=false; if(t.closest(".island")) UI.diShut=true; render(); window.scrollTo(0,0); break;\n    case "toggle-island": UI.navOpen=!UI.navOpen; UI.diShut=false; render(); break;\n',
         '    case "nav": UI.view=t.dataset.view; UI.modal=null; UI.navOpen=false; render(); window.scrollTo(0,0); break;\n')

# ---------- the phone layout keeps its top bar: its settings menu opens the profile page ----------
js = rep(js, "    + '<div class=\"pnav-set-pop\" role=\"menu\" aria-label=\"Settings\">'\n",
         "    + '<div class=\"pnav-set-pop\" role=\"menu\" aria-label=\"Settings\">'\n"
         "    +   '<button class=\"app-menu-item\" role=\"menuitem\" data-action=\"px-profile\" data-s=\"you\"><span class=\"ami-ico\">' + pxI(\"user\", 17) + '</span>Profile &amp; settings<span class=\"ami-end\">sign out, backups</span></button>'\n")

# ---------- signing in: the sign-in screen goes away ----------
js = rep(js, '    case "viewas-reset": try{ localStorage.removeItem("tec_viewas"); }catch(x){} UI.profileOpen = false;',
         '    case "viewas-reset": try{ localStorage.removeItem("tec_viewas"); }catch(x){} pxSignedIn(); UI.profileOpen = false;')
js = rep(js, '      if(vsf){ try{ localStorage.setItem("tec_viewas", vsf.id); }catch(x){} audit(',
         '      if(vsf){ try{ localStorage.setItem("tec_viewas", vsf.id); }catch(x){} pxSignedIn(); audit(')
js = rep(js, '      try{ localStorage.setItem("tec_viewas", psf2.id); }catch(x){}\n', '      try{ localStorage.setItem("tec_viewas", psf2.id); }catch(x){}\n      pxSignedIn();\n')

# ---------- keys: N for a new RO, Esc closes the rail's menus and leaves the profile page ----------
js = rep(js, '  if(k==="escape" && UI.notifOpen){ UI.notifOpen=false; render(); }\n  if(k==="escape" && UI.modal){ UI.modal=null; render(); }\n',
         '  if(k==="escape" && UI.notifOpen){ UI.notifOpen=false; render(); }\n'
         '  if(k==="escape" && (UI.pxPop || UI.pxPeek)){ UI.pxPop=null; UI.pxPeek=false; render(); return; }\n'
         '  if(k==="escape" && UI.view==="profile" && !UI.modal && !UI.appMenu && !UI.notifOpen){ UI.view = UI.pxPrev && UI.pxPrev !== "profile" && navAllowed(UI.pxPrev) ? UI.pxPrev : navPages()[0][0]; render(); return; }\n'
         '  if(k==="escape" && UI.modal){ UI.modal=null; render(); }\n')
js = rep(js, '  if(UI.modal) return;\n\n  if(k === "/"){', '  if(UI.modal) return;\n  if(k === "n" && !e.defaultPrevented && navAllowed("ros")){ e.preventDefault(); UI.modal = { type:"add-ro" }; render(); return; }\n\n  if(k === "/"){')

# ---------- one keys sheet ----------
js = cut(js, '    title = UI.view === "triage" ? "Keyboard \\u2014 Triage"', "Shortcuts are off while you are typing in a field.</p>';\n",
         '    title = "Keyboard shortcuts";\n    body = pxKeySheet(UI.view);\n', inclusive_end=True)

# ---------- clocking out for the day: a backup, and the next person starts clean ----------
js = rep(js, '" as " + stopped.stopReason : "") : ""), true);\n  render();\n}', '" as " + stopped.stopReason : "") : ""), true);\n  render();\n  pxEndOfDay(reason);\n}')
js = rep(js, '    .then(function(){ try{ localStorage.setItem("tec_last_backup", today); }catch(e){} })\n',
         '    .then(function(){ try{ localStorage.setItem("tec_last_backup", today); localStorage.setItem("tec_bk_at", new Date().toISOString()); }catch(e){} })\n')

# ---------- Triage: the bars show when they matter ----------
import jslex
_L = jslex.Lexed(js); _f0 = js.index("function tgVDesk(ro){"); _f1 = _L.match(js.index("{", _f0)) + 1
desk = js[_f0:_f1]
desk = rep(desk, "  var hd = tgHold(ro), r = ro.route, due = tgDue(ro);\n  var opts = RO_STATUS_OPTIONS",
         "  var hd = tgHold(ro), r = ro.route, due = tgDue(ro);\n"
         "  /* Next: only when the next step is yours, or something is late. Ready to close: once the last operation is done or a road test is logged. */\n"
         "  var nextOn = !!x || tgLate(ro) || !!(nx && nx.tone === \"bad\"), closeOn = cl[0].ok || !!ro.roadTest || tyCat(ro) === \"rdy\";\n"
         "  var opts = RO_STATUS_OPTIONS")
desk = rep(desk, "    + '<div class=\"tg-next\"><span class=\"k\">Next</span><p>'", "    + (!nextOn ? '' : '<div class=\"tg-next\"><span class=\"k\">Next</span><p>'")
desk = rep(desk, "+ esc(x.btn) + '</button>' : '') + '</div>'\n    + '<div class=\"tg-two\"><div class=\"tg-card\"><div class=\"h\">' + tgI(\"phone\", 14) + 'Customer",
         "+ esc(x.btn) + '</button>' : '') + '</div>')\n    + '<div class=\"tg-two\"><div class=\"tg-card\"><div class=\"h\">' + tgI(\"phone\", 14) + 'Customer")
desk = rep(desk, "    + '<div class=\"tg-two\"><div class=\"tg-card\"><div class=\"h\">Ready to close<small>'",
         "    + '<div class=\"tg-two' + (closeOn ? '' : ' one') + '\">' + (!closeOn ? '' : '<div class=\"tg-card\"><div class=\"h\">Ready to close<small>'")
desk = rep(desk, ": 'nothing blocking') + '</small></div></div></div></div>'", ": 'nothing blocking') + '</small></div></div></div></div>')")
js = js[:_f0] + desk + js[_f1:]

# ---------- one status list: a part in hand is received, staged, picked up or installed ----------
js = rep(js, '!(p.status === "Received" || p.status === "Installed")', '!pxPartIn(p)')
js = rep(js, 'rp.every(function(p){ return p.status === "Received" || p.status === "Installed"; })', 'rp.every(pxPartIn)')
js = rep(js, 'function fcPartIn(p){ return p.status === "Received" || p.status === "Installed"; }', 'function fcPartIn(p){ return pxPartIn(p); }')
js = rep(js, 'parts.every(function(p){return p.status==="Received"||p.status==="Installed";})', 'parts.every(pxPartIn)')
js = rep(js, 'ps.every(function(pt){ return pt.status === "Received" || pt.status === "Installed"; })', 'ps.every(pxPartIn)')
js = rep(js, 'if(pt.status !== "Received" && pt.status !== "Installed") pw++;', 'if(!pxPartIn(pt)) pw++;')
js = rep(js, 'if(p.status === "Installed") used++; else if(p.status === "Received") toRet++;', 'if(p.status === "Installed") used++; else if(pxPartIn(p)) toRet++;')
js = rep(js, 'if(!due && pt.eta && pt.status !== "Received" && pt.status !== "Installed") due = pt.eta;', 'if(!due && pt.eta && !pxPartIn(pt)) due = pt.eta;')
js = rep(js, 'var AUTO_PART_STATES = ["Not Ordered","Ordered","Backordered","Received","Installed"];', 'var AUTO_PART_STATES = pxPartKeys();')
js = rep(js, 'var RA_PST = ["Not Ordered","Ordered","Backordered","Received","Installed"];', 'var RA_PST = pxPartKeys();')
js = rep(js, "var ASST_PART_STATUSES = ['Not Ordered','Ordered','Backordered','Received','Installed'];", "var ASST_PART_STATUSES = pxPartKeys();")
assert not re.search(r'"Received"\s*\|\|', js) and js.count('=== "Received" ||') == 0

# ---------- settings that stay, the build name ----------
js = rep(js, 'var UI_KEYS = ["waView",', 'var UI_KEYS = ["pxSec","pxPrev","waView",')
js = re.sub(r'var BUILD = "[^"]*";', 'var BUILD = "Parsec 8 · the kit, the nav rail and profile, sign in, one status list, end-of-day backup";', js, count=1)

# ======================================================================= the clean-out: code nothing calls
C.node_check(js, "after the patches")
whole = lambda j: src[:k0] + j + src[k1:]
removed = []
for rnd in range(6):
    dead = [n for n in C.js_unreferenced(js, whole(js)) if not n.startswith("px")]   # the kit stays, for the pages that come next
    if not dead: break
    js = C.js_remove_functions(js, dead, removed)
C.node_check(js, "after removing dead code")
LOG.append("code nothing calls: %d functions, %d KB" % (len(removed), sum(b for a, b in removed) // 1024))

# the version notes in the code go to the changelog
notes = []
js = C.strip_version_notes(js, "script", notes)
C.node_check(js, "after the version notes")
src = src[:k0] + js + src[k1:]

# ======================================================================= styles
k = src.index('<style id="v181wa">'); e = src.index("</style>", k) + len("</style>")
src = src[:e] + '\n<style id="v182px">\n' + pxcss.strip() + '\n</style>' + src[e:]
src = C.css_old_themes(src, LOG)
# classes only the removed code drew
script_now = src[src.index("<script"):]
cls = C.css_classes(src)
FAM = re.compile(r'^(pnav(?!-set)|island|vbar|dv-|di-|navdock|nav-btn|nav-flyout|nav-item|nav-i-|nav-ico|nav-caret|tm-|team$|va-pill|topbar|tb2$|brand$|brand-|hdr-acts|hdr-find|hdr-me-t|tb-add|tb-shrunk)')
dead_cls = sorted(c for c in cls if FAM.match(c) and not re.search(r'(?<![\w-])' + re.escape(c) + r'(?![\w-])', script_now))
LOG.append("classes nothing draws any more: " + " ".join(dead_cls))
src = C.css_dead_classes(src, dead_cls, "old page nav, island bar, top bar", LOG)
# styles written twice: keep the last — only where the later value is one Chrome accepts
plan = C.css_overrides(src)
pairs = sorted(set((w[0], w[1]) for n, kill in plan for d, w in kill if not w[0].startswith("--")))
json.dump(pairs, open(os.path.join(H, "b8", "_winners.json"), "w"))
r = subprocess.run(["node", os.path.join(H, "b8", "validate.js"), os.path.join(H, "b8", "_winners.json")], capture_output=True, text=True)
assert r.returncode == 0, r.stderr
okmap = json.loads(r.stdout)
bad = [p for p, v in zip(pairs, okmap) if not v]
okset = set(p for p, v in zip(pairs, okmap) if v)
LOG.append("later values Chrome refuses (left alone): %d %s" % (len(bad), bad[:6]))
src = C.css_dedupe(src, lambda p, v: p.startswith("--") or (p, v) in okset, LOG)
# version notes in the styles
hs = src.index("<script")
head = C.strip_css_version_notes(src[:hs], "styles", notes)
src = head + src[hs:]

# ======================================================================= the page: the right theme before the first paint
src = rep(src, '<html lang="en" data-theme="mist">', '<html lang="en" data-theme="ivl">')
src = rep(src, "<head>\n", '<head>\n<script>try{var t=localStorage.getItem("tec_theme");document.documentElement.setAttribute("data-theme",/^(ivd|mist|atd)$/.test(t||"")?"ivd":"ivl");if(localStorage.getItem("tec_iv_mini"))document.documentElement.classList.add("iv-mini");}catch(e){}</script>\n')

out = sys.argv[1] if len(sys.argv) > 1 else os.path.join(H, "Parsec_8.html")
open(out, "w", encoding="utf-8").write(src)

# the changelog: every version note that was in the code
notes.sort(key=lambda x: (-x[0], x[1]))
cl = ["Parsec — changelog", "The version notes that used to sit in the code, newest first. Parsec 8 (this build) took them out of the file.", ""]
cur = None
for v, where, t in notes:
    if v != cur:
        cl.append(""); cl.append("v%d" % v); cur = v
    if where == "styles":
        cl.append("  · styles — " + (t[:600] or "(a tag only)"))
    else:
        cl.append("  · " + (where + " — " if where else "") + (t[:600] if t else "changed here"))
open(os.path.join(H, "Parsec changelog.txt"), "w", encoding="utf-8").write("\n".join(cl) + "\n")
LOG.append("version notes moved to the changelog: %d" % len(notes))
json.dump({"removed_functions": removed, "log": LOG, "rewritten": C.DEBUG}, open(os.path.join(H, "b8", "_build_log.json"), "w"), indent=1)

# ---------- the test copy with a hook into the app's scope ----------
hook = src
tail = "})();\n</script>\n</body>"
assert hook.count(tail) == 1, hook.count(tail)
names = ["STATE", "UI", "render", "loadSample25", "getRO", "tyCat", "roStatus", "staffList", "applyTheme", "todayStr", "tgVDesk", "tgItemOf", "tgLate", "raNext", "tyCloseChecks", "raLive", "opDoneNow",
         "pxOut", "pxLogout", "pxSignedIn", "pxBkInfo", "pxBkWarn", "pxKeyGroups", "pxPartIn", "pxPartKeys", "PX_STATUS", "pxClockState", "shiftClockIn", "shiftClockOut", "runningPunch", "openShift",
         "navPages", "viewAsStaff", "RA_PST", "AUTO_PART_STATES", "ASST_PART_STATUSES", "pxRailHtml", "FS", "ensureDemoTeam", "scheduleSave", "nowIso", "uid", "undoLast"]
for nm in names:
    assert re.search(r'(?<![\w$.])(function\s+' + nm + r'\b|var\s+' + nm + r'\b|' + nm + r'\s*=)', js) or nm in ("STATE", "UI", "FS"), nm
t7 = open(os.path.join(H, "b8", "t7hook.js"), encoding="utf-8").read().strip()
t7 = t7[len("window.__tg = "):].rstrip(";")
def _fix(m):
    k, v = m.group(1), m.group(2)
    if v != "typeof" and re.fullmatch(r'[A-Za-z_$][\w$]*', v) and not re.search(r'(?<![\w$.])(function\s+' + re.escape(v) + r'\b|var\s+' + re.escape(v) + r'\b)', js):
        LOG.append("test hook: %s is gone" % v); return "%s: null" % k
    return m.group(0)
t7 = re.sub(r'(\w+): ([A-Za-z_$][\w$]*)(?=[,}\s])', _fix, t7)
hook = hook.replace(tail, "window.__tg = Object.assign(" + t7 + ", {" + ", ".join("%s: function(){ return %s; }" % (n, n) if n in ("STATE", "UI", "FS", "PX_STATUS", "RA_PST", "AUTO_PART_STATES", "ASST_PART_STATUSES") else "%s: %s" % (n, n) for n in names) + "});\n" + tail)
open(os.path.join(H, "t8.html"), "w", encoding="utf-8").write(hook)
for l in LOG: print(l)
print("built", out, len(src), "removed functions", len(removed))
