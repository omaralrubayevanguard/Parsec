# Parsec 16.3 (B) — the RO everywhere: a peek on every RO link (b9/v163b.js), the RO page's own number copies on click and the
# contact sits in its header with Copy · Edit · a text (b9/v163b_jc.js, inside the RO page), a bay shows the top view of the very
# picture the RO shows (trkTopOf), and a new check-in photo asks once: the model picture or this photo.
# Runs inside build12.py: uses js, rep, b9, json, EXTRA_CSS, KEEP_EXTRA, HOOK_NAMES, LOG.
import json as _j163b
# the RO page (JC): its helpers just before the header
js = rep(js, "function pxHeader() {", b9("v163b_jc.js") + "\nfunction pxHeader() {")
# the header's RO number copies on click
js = rep(js, "el('b', { class: 'px-id', text: RO.roNumber || 'RO' })]));", "v163bId()]));")
# the customer and the contact, after the pager
js = rep(js, "  var T = totals(), nf = allFiles().length, run = S.jobs.some(function (j) { return runningPunchOf(j); });",
             "  try { var v163w = v163bContact(); if (v163w) head.appendChild(v163w); } catch (e) { console.error(e); }   /* Parsec 16.3 (B) */\n"
             "  var T = totals(), nf = allFiles().length, run = S.jobs.some(function (j) { return runningPunchOf(j); });")
# the truck card's RO number copies on click
js = rep(js, "function pxTitle() { var tb = pxTitle0();", "function pxTitle() { var tb = v163bTitle(pxTitle0());")
# the top view of the very picture the RO shows — none when that picture has none (the bay then shows the picture itself)
js = rep(js, """function trkTopOf(ro){ var o = trkOwnOf(ro); if(o && o.top) return { entry: o, src: trkSrc(o, "top") };
  var m = trkModelFor(ro); return m && m.top ? { entry: m, src: trkSrc(m, "top"), up: !!m.up } : null; }""",
"""function trkTopOf(ro){   /* Parsec 16.3 (B): the top view that belongs to the picture trkPick shows — own, or the model's; none for a photo */
  var P = null; try{ P = trkPick(ro); }catch(e){}
  if(!P || P.kind !== "model" || !P.entry || !P.entry.top) return null;
  return { entry: P.entry, src: trkSrc(P.entry, "top"), up: !!P.entry.up }; }""")
# the peek and the one-time picture question (top level, beside the truck pictures)
js = rep(js, "function trkHead(ro){", b9("v163b.js") + "\nfunction trkHead(ro){")
_jc0 = js.index('var JC_CSS = "'); _jc1 = js.index('";\n', _jc0)
js = js[:_jc1] + _j163b.dumps("\n" + b9("v163b_jc.css"))[1:-1] + js[_jc1:]
EXTRA_CSS.append(b9("v163b.css"))
KEEP_EXTRA += ["v163bScan", "v163bPeekShow", "v163bPeekHide", "v163bAskNext"]
HOOK_NAMES += ["V163B", "v163bScan", "v163bPeekShow", "v163bPeekHide", "v163bAskFor", "v163bAskable", "trkTopOf", "trkBayTop", "trkYardTop", "trkOwnOf", "trkThumb"]
LOG.append("Parsec 16.3 (B): a peek on RO links, the RO page's number copies, the contact in its header (Copy · Edit · a text), bays show the top of the RO's own picture, a new check-in photo asks once")
