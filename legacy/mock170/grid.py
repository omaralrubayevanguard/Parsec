import sys, glob
from PIL import Image
out, files = sys.argv[1], sys.argv[2:]
ims = [Image.open(f) for f in files]; cols = 2 if len(ims) > 1 else 1
w = max(i.width for i in ims); h = max(i.height for i in ims); rows = (len(ims) + cols - 1) // cols
c = Image.new("RGB", (cols * (w + 8), rows * (h + 8)), "white")
for n, i in enumerate(ims): c.paste(i, ((n % cols) * (w + 8), (n // cols) * (h + 8)))
c.save(out)
