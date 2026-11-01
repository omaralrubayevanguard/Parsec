import numpy as np, json, os
from PIL import Image, ImageFilter
from scipy import ndimage as nd
NAMES = {
 "5b4edcf1": ["vn1_day","vn1_mid","vn1_high","vnl2_300","vnl2_430","vnl2_630","vnl2_670","vnl2_730","vnl2_780","vnm_200","vnm_430","vnm_630"],
 "c75612d1": ["vt_800","vt_830","vt_880","vnl3_300","vnl3_400","vnl3_740","vnl3_760","vnl3_860","vnr1_300","vnr1_400","vnr1_640","vnr1_660"],
 "7e934f37": ["vnre_1","vnre_2","vnx1_630","vnl4_300","vnl4_440","vnl4_640","vnl4_660","vnl4_840","vnl4_860","vnr2_300","vnr2_440","vnr2_640"],
 "eca113d5": ["vnr2_660","vhd1_200","vhd1_430","vhd2_300","vhd2_400","vhd3_300","vhd3_400","vnx2_300","vnx2_400","vnx2_740","vah1_200","vah1_430","vah1_630","vah2_300","vah2_400"],
 "34ea570f": ["vah2_600"],
}
os.makedirs("cut", exist_ok=True); os.makedirs("crop", exist_ok=True)
meta = {}
for f, names in NAMES.items():
    rgb = np.asarray(Image.open(f"src/{f}-image.png").convert("RGB")).astype(int)
    H, W = rgb.shape[:2]
    sat = rgb.max(2) - rgb.min(2); lum = rgb.mean(2)
    ink = nd.binary_dilation((lum < 200) | (sat > 40), iterations=2)
    lab, n = nd.label(ink)
    boxes = []
    for s in nd.find_objects(lab):
        h = s[0].stop - s[0].start; w = s[1].stop - s[1].start
        if h >= 25 and w >= 25 and h < 200 and w < 260: boxes.append([s[0].start, s[1].start, s[0].stop, s[1].stop])
    # keep only blobs in the picture band of each card: they are the big ones; group into cells
    big = [b for b in boxes if (b[2]-b[0]) >= 40 and (b[3]-b[1]) >= 60]
    cols = sorted(set(min(2, int(((b[1]+b[3])/2) / (W/3))) for b in big))
    cells = {}
    for b in boxes:
        cx, cy = (b[1]+b[3])/2, (b[0]+b[2])/2
        c = min(2, int(cx / (W/3)))
        # attach to the big blob in the same column whose vertical span is near
        best = None
        for g in big:
            gc = min(2, int(((g[1]+g[3])/2) / (W/3)))
            if gc != c: continue
            if g[0] - 12 <= cy <= g[2] + 12 and g[1] - 30 <= cx <= g[3] + 30:
                best = tuple(g); break
        if best is None: continue
        u = cells.setdefault(best, list(best))
        u[0] = min(u[0], b[0]); u[1] = min(u[1], b[1]); u[2] = max(u[2], b[2]); u[3] = max(u[3], b[3])
    U = sorted(cells.values(), key=lambda u: (round(u[0] / 150), u[1]))
    # merge cells that overlap (a split truck)
    M = []
    for u in U:
        for m in M:
            if not (u[2] < m[0] or u[0] > m[2] or u[3] < m[1] or u[1] > m[3]):
                m[0] = min(m[0], u[0]); m[1] = min(m[1], u[1]); m[2] = max(m[2], u[2]); m[3] = max(m[3], u[3]); break
        else: M.append(list(u))
    M.sort(key=lambda u: (round(u[0] / 150), u[1]))
    print(f, len(M), "for", len(names))
    for name, u in zip(names, M):
        p = 5; y0, x0, y1, x1 = max(0, u[0]-p), max(0, u[1]-p), min(H, u[2]+p), min(W, u[3]+p)
        crop = rgb[y0:y1, x0:x1]
        Image.fromarray(crop.astype(np.uint8)).save(f"crop/{name}.png")
        meta[name] = [f, x0, y0, x1-x0, y1-y0]
json.dump(meta, open("boxes.json", "w"), indent=0)
