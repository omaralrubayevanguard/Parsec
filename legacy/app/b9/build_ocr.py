# Parsec 12 patch file (exec'd by build12.py): the screenshot reader, built in — no download, nothing sent anywhere.
# Screenshots used to need tesseract.js from a CDN on first use. Now loadTesseract() hands back the built-in reader
# (b9/ocr_lite.js, ~25 KB: finds the letters and matches them against the fonts this browser draws), with the same
# createWorker → setParameters / recognize / terminate shape, so every caller of ocrImages() works unchanged.
# Pictures are read at their own size (no 2× blow-up): the reader measures each line's letter height itself.
_ocr = b9("ocr_lite.js")
assert "</script" not in _ocr
_a = "/* ---- Screenshots: read with Tesseract (loaded the first time it's needed; needs internet then) ---- */"
js = rep(js, _a, "/* ---- Screenshots: read by the reader built into Parsec 12 (no download) ---- */\n" + _ocr)
_i0 = js.index("function loadTesseract(){"); _i1 = js.index("\n}\n", _i0) + 3
js = js[:_i0] + "function loadTesseract(){ return Promise.resolve(PSR.Tesseract); }   /* Parsec 12: built in — nothing to load */\n" + js[_i1:]
_i0 = js.index("function prepImage(file){"); _i1 = js.index("\n}\n", _i0) + 3
js = js[:_i0] + "function prepImage(file){   /* read at its own size: the built-in reader measures the letters itself */\n  if(!window.createImageBitmap) return Promise.resolve(file);\n  return createImageBitmap(file).catch(function(){ return file; });\n}\n" + js[_i1:]
# the messages that blamed the internet
js = js.replace('"Couldn\'t load the screenshot reader — it needs internet. Paste the case text instead."', '"Couldn\'t read that screenshot — paste the case text instead."')
for _n in ["ocrImages", "importImages", "cleanOcrText"]:
    if _n not in HOOK_NAMES: HOOK_NAMES.append(_n)
KEEP_EXTRA.append("PSR")
LOG.append("screenshot reader: built in (b9/ocr_lite.js, %d KB)" % (len(_ocr) // 1024))
