import numpy as np, json, os, sys
from PIL import Image, ImageFilter
from scipy import ndimage as nd
meta = json.load(open("boxes.json"))
os.makedirs("out", exist_ok=True)
TOL = float(sys.argv[1]) if len(sys.argv) > 1 else 10
def matte(name):
    a = np.asarray(Image.open(f"crop/{name}.png").convert("RGB")).astype(float)
    H, W = a.shape[:2]
    border = np.concatenate([a[0], a[-1], a[:, 0], a[:, -1]])
    bg = np.median(border, axis=0)
    dist = np.abs(a - bg).max(2)
    near = dist <= TOL
    # flood from the edges through near-background pixels
    lab, n = nd.label(near)
    edge = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
    bgm = np.isin(lab, list(edge))
    fg = ~bgm
    # keep the truck: the biggest piece and anything sizeable near it; drop specks and cut-off slivers at the crop edge
    fl, m = nd.label(fg)
    if m:
        sizes = nd.sum(fg, fl, range(1, m + 1)); big = sizes.max()
        keep = np.zeros(m + 1, bool)
        for i, s in enumerate(sizes, 1):
            sl = nd.find_objects((fl == i).astype(int))[0]
            touches_lr = sl[1].start <= 1 or sl[1].stop >= W - 1
            keep[i] = s == big or (s > big * 0.02 and not touches_lr)
        fg = keep[fl]
    fg = nd.binary_fill_holes(fg) & ~(bgm & ~nd.binary_fill_holes(fg)) | (fg)
    # a sliver of the neighbouring picture at the left or right edge: drop it at the first empty columns
    cc = fg.sum(0)
    for side in (0, 1):
        idx = range(W) if side == 0 else range(W - 1, -1, -1)
        run, seen, cut = 0, False, None
        for k, x in enumerate(idx):
            if k > W * 0.22: break
            if cc[x] > 2: seen = True; run = 0
            elif seen: run += 1
            if seen and run >= 2: cut = x; break
        if cut is not None:
            if side == 0: fg[:, :cut] = False
            else: fg[:, cut + 1:] = False
    # soft edge: in a 2-px band, alpha from how far the color is from the background
    inner = nd.binary_erosion(fg, iterations=2)
    band = fg & ~inner
    alpha = fg.astype(float)
    soft = np.clip((dist - TOL * 0.6) / (TOL * 3.2), 0, 1)
    alpha[band] = soft[band]
    alpha = np.clip(alpha, 0, 1)
    # the soft grey floor shadow becomes a dark see-through shadow, so it works on a dark page too
    lum = a.mean(2); sat = a.max(2) - a.min(2)
    ys = np.where((fg & (lum < 60)).any(1))[0]
    shadow = np.zeros_like(fg)
    if len(ys):
        tb = ys.max(); y0 = int(tb - 0.14 * H)
        cand = fg & (sat < 20) & (lum > 150) & (dist > 0)
        cand[:max(0, y0)] = False
        cl, cn = nd.label(cand)
        touch = nd.binary_dilation(~fg, iterations=1)
        for i in range(1, cn + 1):
            m = cl == i
            if (m & touch).any(): shadow |= m
    bgl = bg.mean()
    salpha = np.clip((bgl - lum) / 90.0, 0, 1) * 0.85
    alpha = np.where(shadow, salpha, alpha)
    # un-matte the edge so no white halo: c = (c - (1 - a) * bg) / a
    A = alpha[..., None]
    col = np.where(A > 0.02, (a - (1 - A) * bg) / np.maximum(A, 0.02), a)
    col = np.where(shadow[..., None], 18.0, col)
    col = np.clip(col, 0, 255)
    # bleed the edge colors into the see-through area, so scaling and sharpening can't pull the old white back in
    solid = alpha >= 0.5
    if solid.any():
        _, (iy, ix) = nd.distance_transform_edt(~solid, return_indices=True)
        col = np.where(solid[..., None], col, col[iy, ix])
    rgba = np.dstack([col, alpha * 255]).astype(np.uint8)
    im = Image.fromarray(rgba, "RGBA")
    bb = im.getchannel("A").point(lambda v: 255 if v > 8 else 0).getbbox()
    if bb: im = im.crop(bb)
    # 2x for the RO header — a smoother picture than the browser's own scaling
    im2 = im.convert("RGBa").resize((im.width * 2, im.height * 2), Image.LANCZOS).convert("RGBA")
    rgb2 = im2.convert("RGB").filter(ImageFilter.UnsharpMask(radius=1.6, percent=55, threshold=2))
    im2 = Image.merge("RGBA", (*rgb2.split(), im2.getchannel("A")))
    im2.save(f"out/{name}.webp", "WEBP", quality=86, method=6)
    im2.save(f"out/{name}.png")
    return im2.size
for n in meta: print(n, matte(n), os.path.getsize(f"out/{n}.webp"))
