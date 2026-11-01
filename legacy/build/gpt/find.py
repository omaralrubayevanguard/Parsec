import numpy as np, sys
from PIL import Image
from scipy import ndimage as nd
for f in ["5b4edcf1","c75612d1","7e934f37","eca113d5","34ea570f"]:
    im = np.asarray(Image.open(f"src/{f}-image.png").convert("RGB")).astype(int)
    # "ink": clearly not card background (white / light blue-gray) and not the light border
    sat = im.max(2) - im.min(2); lum = im.mean(2)
    ink = (lum < 200) | (sat > 40)
    ink = nd.binary_dilation(ink, iterations=2)
    lab, n = nd.label(ink)
    objs = nd.find_objects(lab)
    boxes = []
    for i, s in enumerate(objs):
        h = s[0].stop - s[0].start; w = s[1].stop - s[1].start
        if h >= 40 and w >= 70 and h < 200: boxes.append((s[0].start, s[1].start, s[0].stop, s[1].stop))
    boxes.sort(key=lambda b: (round(b[0] / 120), b[1]))
    print(f, len(boxes)); print("  ", [(b[0], b[1], b[3]-b[1], b[2]-b[0]) for b in boxes])
