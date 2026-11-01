import sys, json
from PIL import Image
ks = sys.argv[2].split(','); suf = sys.argv[3] if len(sys.argv) > 3 else ''
rows = []
for k in ks:
    im = Image.open(f'strip_{k}{suf}.png'); w, h = im.size
    # split back into steps of equal width
    SW = int(sys.argv[4]) if len(sys.argv) > 4 else 458; n = round((w + 6) / SW); sw = (w + 6) // n
    parts = [im.crop((i * sw, 0, i * sw + sw - 6, h)) for i in range(n)]
    for i in range(0, n, 4): rows.append(parts[i:i+4])
W = 4 * SW; H = sum(max(p.height for p in r) + 8 for r in rows)
c = Image.new('RGB', (W, H), (200, 60, 60)); y = 0
for r in rows:
    x = 0
    for p in r: c.paste(p, (x, y)); x += p.width + 6
    y += max(p.height for p in r) + 8
c.save(sys.argv[1]); print(c.size)
