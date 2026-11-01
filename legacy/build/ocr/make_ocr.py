# The screenshot reader Parsec 12 builds in is b9/ocr_lite.js — plain script, nothing to fetch or prepare.
# Kept here: the accuracy test (build/ocr/test) that renders an ASIST-like page in Chromium with several fonts and
# sizes, screenshots it and reads it back:   python3 build/ocr/test/run.py "Arial@13px" "Inter@13px" ...
#
# tesseract.js was the first plan (tesseract.js 5 + tesseract.js-core lstm wasm + eng.traineddata, ~10 MB in the file).
# This build machine can't reach npm, jsdelivr, unpkg or GitHub (policy 403), so it couldn't be bundled. If those hosts
# are ever allowed, `npm pack tesseract.js@5 tesseract.js-core@5` into build/ocr/vendor is the place to start; the
# English data is already on this machine (/usr/share/tesseract-ocr/5/tessdata/eng.traineddata, tessdata_fast, 4.1 MB).
import os, shutil, sys
T = os.path.dirname(os.path.abspath(__file__))
src = os.path.join(os.path.dirname(T), "..", "app", "b9", "ocr_lite.js")
dst = os.path.join(T, "test", "ocr_lite.js")
shutil.copyfile(src, dst); print("copied", os.path.normpath(src), "→", dst)
