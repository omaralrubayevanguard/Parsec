# Build Parsec_7.html: Parsec_6.html + the new Warranty page (wa1-4.js + the mock-up CSS) and the patches it needs.
import os, sys, json, re
H = os.path.dirname(os.path.abspath(__file__))
B = os.path.join(os.path.dirname(H), "build")
sys.path.insert(0, B)
import parts as P

src = open(os.path.join(H, "Parsec_6.html"), encoding="utf-8").read()
js = "\n".join(open(os.path.join(H, f), encoding="utf-8").read() for f in ["wa1.js", "wa2.js", "wa3.js", "wa4.js"])

# ---------- the stylesheet: the mock-up's Warranty CSS, minus the mock's own shell, plus the app bits ----------
def css_block(path, name):
    t = open(os.path.join(B, path), encoding="utf-8").read()
    m = re.search(name + r' = (?:shell \+ )?r"""(.*?)"""', t, re.S)
    assert m, (path, name)
    return m.group(1)
blocks = [css_block("make_warranty.py", "CSS"), css_block("make_warranty_needs.py", "CSS2"), css_block("make_warranty_packet.py", "CSS3"),
          css_block("make_warranty_checks.py", "CSS4"), css_block("make_warranty_after.py", "CSS5"), css_block("make_warranty_views.py", "CSS6")]
SKIP = (".tg-panel", ".tg-rail", ".rl-badge", ".tg .btn", ".tg :focus-visible", ".toast-fm", "@media print")
DARK = ':root:is([data-theme="ivd"],[data-theme="mist"],[data-theme="atd"])'
def conv(s):
    s = re.sub(r'\.wx(?=[^A-Za-z0-9_]|$)', '.wa', s)
    return s.replace(':root[data-theme="dark"]', DARK)
lines, skipped = [], []
for blk in blocks:
    for ln in blk.split("\n"):
        st = ln.strip()
        if not st:
            continue
        if any(st.startswith(k) for k in SKIP):
            skipped.append(st[:60]); continue
        lines.append(conv(ln))
css = "/* ===== v181: Warranty — on the Parsec design system (Ivory / Graphite). Prefix wa-, on the Triage tg- base ===== */\n" + "\n".join(lines) + "\n" + open(os.path.join(H, "wa_extra.css"), encoding="utf-8").read()
open(os.path.join(H, "wa.css"), "w", encoding="utf-8").write(css)
for k in ("mock", "tg-app", "#m "):
    for ln in lines:
        assert k not in ln, (k, ln[:120])

# the print sheet, standalone, for the print frame
pc = [conv(ln.strip()) for ln in css_block("make_warranty_packet.py", "CSS3").split("\n") if re.match(r'\s*\.wx-(sheet|shu|shb|sh3|shl|phs|ph)\b', ln)]
pcss = (':root{--tg-sans:"Geist","Inter","Segoe UI",system-ui,sans-serif;--tg-mono:"Geist Mono","Cascadia Mono",Consolas,ui-monospace,monospace;--tg-serif:"Newsreader","Iowan Old Style",Charter,Georgia,serif;}'
        '@page{margin:12mm;}html,body{margin:0;background:#fff;color:#1d1c1a;font:400 12px/17px var(--tg-sans);-webkit-print-color-adjust:exact;print-color-adjust:exact;}'
        '.tg-ic{width:22px;height:22px;fill:none;stroke:currentColor;stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round;}'
        + "".join(pc) +
        '.wa-sheet{width:auto !important;box-shadow:none !important;padding:0 !important;border-radius:0 !important;}.wa-sheet section{break-inside:avoid;}'
        '.wa-ph .img.pic{background:#f2f0ea;overflow:hidden;}.wa-ph .img img{display:block;width:100%;height:100%;object-fit:cover;}.wa-sheet .lg svg{width:18px;height:18px;}')
assert len(pc) > 15, len(pc)

# ---------- icons the page uses ----------
s0 = open("/mnt/user-data/outputs/Parsec Warranty money and parts.html", encoding="utf-8").read()
i = s0.index("const P=") + len("const P="); j = s0.index(", SI=", i)
IC = dict(P.ICONS); IC.update(json.loads(s0[i:j]))
IC.setdefault("receipt", '<path d="M6.25 3.75h11.5v16.5l-1.9-1.25-1.95 1.25-1.95-1.25-1.95 1.25-1.95-1.25-1.8 1.25z"/><path d="M9.25 8.25h5.5M9.25 11.5h5.5M9.25 14.75h3.5"/>')
used = set(re.findall(r'tgI\("([A-Za-z]+)"', js)) | set(re.findall(r'\bic: "([A-Za-z]+)"', js)) | set(re.findall(r'wa(?:Clear|Done)\([^,()]+, "([A-Za-z]+)"', js))
used |= {"warranty", "board", "dollar", "parts", "note", "file", "check", "history", "inbox", "undo", "x", "chat", "phone", "swap", "send", "clock", "search", "gear", "receipt", "chart"}
used = sorted(used)
miss = [k for k in used if k not in IC]
assert not miss, miss
js = js.replace("/*__WAIC__*/{}", json.dumps({k: IC[k] for k in used}, ensure_ascii=False))
js = js.replace('/*__WALOGO__*/""', json.dumps(P.LOGO, ensure_ascii=False))
js = js.replace('/*__WAPCSS__*/""', json.dumps(pcss, ensure_ascii=False))
assert "__WAIC__" not in js and "__WALOGO__" not in js and "__WAPCSS__" not in js
js = js.replace("</script", "<\\/script")

# every class the page writes has a style (or is a tg- one from Triage)
cls = set()
for m in re.finditer(r'class="([^"]*)"', js):
    for c in m.group(1).split():
        if c.startswith("wa-") and "'" not in c and "+" not in c:
            cls.add(c)
for m in re.finditer(r"class=\"[^\"]*'\s*\+[^+]*\+\s*'", js):
    pass
nostyle = sorted(c for c in cls if not re.search(r'\.' + re.escape(c) + r'(?![A-Za-z0-9_-])', css + pcss))
print("classes without a style:", nostyle)

def rep(s, a, b, n=1):
    c = s.count(a)
    assert c == n, (a[:90], c)
    return s.replace(a, b)

# ---------- the page itself ----------
src = rep(src, "function viewWarranty(){", "function viewWarranty(){ return waView(); }\nfunction viewWarrantyOld(){")
k = src.index("function viewWarranty(){ return waView(); }")
src = src[:k] + js.rstrip() + "\n" + src[k:]

# ---------- clicks: wa-* actions ----------
src = rep(src, '  if(a && a.indexOf("fm-") === 0 && fmAct(a, t, e)) return;   /* v179: Foreman */',
          '  if(a && a.indexOf("fm-") === 0 && fmAct(a, t, e)) return;   /* v179: Foreman */\n  if(a && a.indexOf("wa-") === 0 && waAct(a, t, e)) return;   /* v181: Warranty */')
# ---------- render: Sent to you is in Needs action here; after-render placement ----------
src = rep(src, 'if(RT_PAGE[UI.view] && UI.view !== "triage" && UI.view !== "foreman"){ var rtIn', 'if(RT_PAGE[UI.view] && UI.view !== "triage" && UI.view !== "foreman" && UI.view !== "warranty"){ var rtIn')
src = rep(src, '  if(UI.view === "foreman"){ try{ fmAfter(); }catch(e){ console.error(e); } }   /* v179 */\n',
          '  if(UI.view === "foreman"){ try{ fmAfter(); }catch(e){ console.error(e); } }   /* v179 */\n  if(UI.view === "warranty"){ try{ waAfter(); }catch(e){ console.error(e); } }   /* v181 */\n')
# ---------- the badge: what needs you (sent, returned, denied, ready, needs the tech) ----------
src = rep(src, "function wcNeedCount(){ var n = 0; STATE.ros.forEach(function(ro){ wcOps(ro).forEach(function(op){ var s = wcStatus(ro, op); if(s === 'ready' || s === 'returned') n++; }); }); return n; }",
          "function wcNeedCount(){ try{ return UI.view === 'warranty' ? 0 : waBadgeN(); }catch(e){ return 0; } }   /* v181 */")
# ---------- the keyboard sheet ----------
src = rep(src, 'title = UI.view === "triage" ? "Keyboard \\u2014 Triage" : UI.view === "foreman" ? "Keyboard \\u2014 Foreman" : "Keyboard";\n    var KEYS = UI.view === "triage" ? TG_KEYS : UI.view === "foreman" ? FM_KEYS : [',
          'title = UI.view === "triage" ? "Keyboard \\u2014 Triage" : UI.view === "foreman" ? "Keyboard \\u2014 Foreman" : UI.view === "warranty" ? "Keyboard \\u2014 Warranty" : "Keyboard";\n    var KEYS = UI.view === "triage" ? TG_KEYS : UI.view === "foreman" ? FM_KEYS : UI.view === "warranty" ? WA_KEYS : [')
# ---------- data: settings and the cleared list go into the shop file ----------
src = rep(src, "    fmCfg: STATE.fmCfg || null, fmCleared: STATE.fmCleared || [], fmTmr: STATE.fmTmr || null, fmNote: STATE.fmNote || null,   /* v179 */\n",
          "    fmCfg: STATE.fmCfg || null, fmCleared: STATE.fmCleared || [], fmTmr: STATE.fmTmr || null, fmNote: STATE.fmNote || null,   /* v179 */\n    waCfg: STATE.waCfg || null, waCleared: STATE.waCleared || [],   /* v181 */\n")
src = rep(src, 'var UI_KEYS = ["fmView","fmDay","tgView",', 'var UI_KEYS = ["waView","waPer","fmView","fmDay","tgView",')
# ---------- the RO console: attach files to any RO, and read one back ----------
src = rep(src, "return { attach: attach, busy: busy, syncFiles: syncFiles, scanFolder: scanFolder,\n  rerender:",
          "return { attach: attach, busy: busy, syncFiles: syncFiles, scanFolder: scanFolder,\n"
          "  addFilesTo: function (ro, task, list, cb) {   /* v181: the Warranty packet's Upload */\n"
          "    var arr = Array.prototype.slice.call(list || []); if (!ro || !arr.length) { if (cb) cb(0); return; }\n"
          "    var entry = bulletinFor(ro, task), d = new Date(), ts = pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds());\n"
          "    if (!Array.isArray(entry.files)) entry.files = [];\n"
          "    Promise.all(arr.map(function (file) { return shrinkImage(file).then(function (out) { var id = uid(); return idbPut(id, out.blob).then(function () { entry.files.push({ id: id, name: out.name, size: out.blob.size, type: out.blob.type || file.type, ts: ts }); }); }); }))\n"
          "      .then(function () { scheduleSave(true); syncFiles(); if (RO === ro && HOST && HOST.isConnected) render(); if (cb) cb(arr.length); }, function () { if (cb) cb(0); });\n"
          "  },\n"
          "  blobOf: function (f, roId) { return getBlob(f, roId); },\n"
          "  rerender:")
# ---------- the sample set ----------
src = rep(src, "  STATE.fixes = fixManual().filter(function(x){ return !x.sample; });",
          "  try{ waSample(STATE.ros); }catch(e){ console.error(e); }   /* v181 */\n  STATE.fixes = fixManual().filter(function(x){ return !x.sample; });")

# ---------- styles ----------
k = src.index('<style id="v180">'); e = src.index("</style>", k) + len("</style>")
src = src[:e] + '\n<style id="v181wa">\n' + css.strip() + '\n</style>' + src[e:]

out = sys.argv[1] if len(sys.argv) > 1 else os.path.join(H, "Parsec_7.html")
open(out, "w", encoding="utf-8").write(src)

# a test copy with a hook into the app's scope
hook = src
tail = "})();\n</script>\n</body>"
assert hook.count(tail) == 1, hook.count(tail)
hook = hook.replace(tail, "window.__tg = { S: function(){ return STATE; }, UI: function(){ return UI; }, render: function(){ render(); }, sample: function(){ loadSample25(); }, getRO: getRO, tyCat: tyCat, roStatus: roStatus, spotOf: spotOf, yardSpots: yardSpots, tgNeedsAll: tgNeedsAll, uid: uid, nowIso: nowIso, setRoStatus: setRoStatus, rtSend: rtSend, raOps: raOps, applyTheme: applyTheme, staffList: staffList, todayStr: todayStr,"
                    " fmNeedsAll: fmNeedsAll, fmFlat: fmFlat, fmFreeTechs: fmFreeTechs, fmUpNext: fmUpNext, fmTechs: fmTechs, fmCfg: fmCfg, fmFreeAt: fmFreeAt, fmTmPlan: fmTmPlan, fmFound: fmFound, fmQcAuto: fmQcAuto, fmNcClear: fmNcClear, fmRep: fmRep, fmBringable: fmBringable, undoLast: undoLast, tgClashes: tgClashes, tgFlat: tgFlat, shopObj: typeof shopObj === 'function' ? shopObj : null, UI_KEYS: typeof UI_KEYS !== 'undefined' ? UI_KEYS : null, cxMe: cxMe, fmConsoleCard: fmConsoleCard, fmGet: fmGet, fmOpenPop: fmOpenPop, fmGo: fmGo, fmTmr: fmTmr, fmRisk: fmRisk, fmClearedList: fmClearedList, normalizeState: typeof normalizeState === 'function' ? normalizeState : null,"
                    " wcOps: wcOps, wcStatus: wcStatus, waNeedsAll: waNeedsAll, waFlat: waFlat, waChecks: waChecks, waGaps: waGaps, waSet: waSet, waCfg: waCfg, waStats: waStats, waShelf: waShelf, waOpenPop: waOpenPop, waGo: waGo, waNcClear: waNcClear, waBack: waBack, waCov: waCov, waCopyRows: waCopyRows, waBadgeN: waBadgeN, waItemOf: waItemOf, waVol: waVol, waRos: waRos, waClearedList: waClearedList, waSheet: waSheet, waStmtRows: waStmtRows, wcNeedCount: wcNeedCount, lastPrint: function(){ return WA_LAST_PRINT; }, JC: JC, save: function(){ scheduleSave(true); }, undoLabels: function(){ return UNDO.map(function(u){ return u.label || (u.auto ? 'auto' : '?'); }); } };\n" + tail)
open(os.path.join(H, "t7.html"), "w", encoding="utf-8").write(hook)
print("built", out, len(src), "css", len(css), "js", len(js), "icons", len(used), "skipped", len(skipped))
