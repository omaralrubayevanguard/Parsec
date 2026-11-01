/* ============================== Parsec 12: the screenshot reader, built in ==============================
   Reads text off screenshots right here in the browser, with no download and nothing sent anywhere.
   Made for screen text (ASIST / Decisiv pages, estimates, parts lists): it finds the ink, groups it into
   characters and lines, and matches every character against the letters this browser draws itself in the
   common UI fonts (Arial, Segoe UI, Helvetica, Verdana, Tahoma, Calibri, Roboto, Open Sans…), picking the
   fonts that fit the picture best. Columns come out separated by tabs, like a page copied with Ctrl+C.
   PSR.read(image, { logger }) → Promise<{ text, conf }>; image: a canvas, ImageBitmap, <img>, File or Blob. */
var PSR = (function(){
  var CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.,:;-/#$%&()+='\"*@_!?[]\u0131\u0237", AS = { "\u0131": "i", "\u0237": "j" };   /* an i or j whose dot got lost reads as i or j */
  var FONTS = [["Arial", 400], ["Arial", 700], ["Segoe UI", 400], ["Segoe UI", 600], ["Helvetica", 400], ["Helvetica Neue", 400], ["Verdana", 400], ["Tahoma", 400],
    ["Calibri", 400], ["Roboto", 400], ["Roboto", 700], ["Open Sans", 400], ["Open Sans", 700], ["Source Sans Pro", 400], ["Lato", 400], ["Inter", 400], ["Liberation Sans", 400], ["Liberation Sans", 700],
    ["DejaVu Sans", 400], ["sans-serif", 400], ["sans-serif", 700]];
  var GW = 10, GH = 14, NF = GW * GH, KT = 0.62, WG = [1.5, 1.2, 1.5, 1.5];
  var avail = null, capRatio = {}, TPL = {};
  function cv(w, h){ var c = document.createElement("canvas"); c.width = Math.max(1, w); c.height = Math.max(1, h); return c; }
  /* the fonts this browser really has (a missing one draws like the fallback) */
  function fontsHere(){
    if(avail) return avail;
    var c = cv(10, 10), g = c.getContext("2d"), s = "AaBbGgQqRrWw0123 iIl1 mM", seen = {};
    function wOf(f){ g.font = f; return g.measureText(s).width.toFixed(2); }
    var base = { s: wOf("40px sans-serif"), m: wOf("40px monospace"), r: wOf("40px serif") };
    avail = FONTS.filter(function(f){
      var fam = f[0], key;
      if(/^sans-serif$/.test(fam)) key = "sans|" + f[1];
      else {
        var a = wOf(f[1] + " 40px \"" + fam + "\", monospace"), b = wOf(f[1] + " 40px \"" + fam + "\", serif");
        if(a === wOf(f[1] + " 40px monospace") && b === wOf(f[1] + " 40px serif")) return false;   /* not installed */
        key = a + "|" + b + "|" + f[1];
      }
      if(seen[key]) return false; seen[key] = 1; return true;
    });
    return avail;
  }
  function fontStr(f, px){ return f[1] + " " + px.toFixed(2) + "px " + (f[0] === "sans-serif" ? "sans-serif" : "\"" + f[0] + "\", sans-serif"); }
  /* ---------- pixels ---------- */
  function grayOf(src){
    var w = src.width || src.naturalWidth, h = src.height || src.naturalHeight, c = cv(w, h), g = c.getContext("2d", { willReadFrequently: true });
    g.fillStyle = "#fff"; g.fillRect(0, 0, w, h); g.drawImage(src, 0, 0);
    var d = g.getImageData(0, 0, w, h).data, G = new Uint8Array(w * h);
    for(var i = 0, j = 0; i < G.length; i++, j += 4) G[i] = (d[j] * 77 + d[j + 1] * 150 + d[j + 2] * 29) >> 8;
    return { w: w, h: h, G: G };
  }
  /* ink: halfway between the darkest and lightest pixel around it (a window of 2r+1), so the soft edges between
     letters stay paper; dark on light, or light on dark where the ground is dark */
  function slide(A, w, h, r, mx){
    var T = new Uint8Array(w * h), O = new Uint8Array(w * h), x, y, k, v, b;
    for(y = 0; y < h; y++){ var o = y * w; for(x = 0; x < w; x++){ b = mx ? 0 : 255; for(k = Math.max(0, x - r); k <= Math.min(w - 1, x + r); k++){ v = A[o + k]; if(mx ? v > b : v < b) b = v; } T[o + x] = b; } }
    for(x = 0; x < w; x++){ for(y = 0; y < h; y++){ b = mx ? 0 : 255; for(k = Math.max(0, y - r); k <= Math.min(h - 1, y + r); k++){ v = T[k * w + x]; if(mx ? v > b : v < b) b = v; } O[y * w + x] = b; } }
    return O;
  }
  function binarize(P, r){
    var w = P.w, h = P.h, G = P.G, M = new Uint8Array(w * h), V = new Uint8Array(w * h), lo = slide(G, w, h, r, 0), hi = slide(G, w, h, r, 1); P.V = V;
    /* the ground: the local mean decides which side is paper */
    var W1 = w + 1, S = new Float64Array(W1 * (h + 1));
    for(var y = 0; y < h; y++){ var rs = 0; for(var x = 0; x < w; x++){ rs += G[y * w + x]; S[(y + 1) * W1 + x + 1] = S[y * W1 + x + 1] + rs; } }
    for(y = 0; y < h; y++){ var y0 = Math.max(0, y - r), y1 = Math.min(h, y + r + 1);
      for(x = 0; x < w; x++){ var i = y * w + x, c = hi[i] - lo[i]; if(c < 60) continue;
        var x0 = Math.max(0, x - r), x1 = Math.min(w, x + r + 1), m = (S[y1 * W1 + x1] - S[y0 * W1 + x1] - S[y1 * W1 + x0] + S[y0 * W1 + x0]) / ((x1 - x0) * (y1 - y0));
        var t = (hi[i] + lo[i]) / 2, g = G[i];
        if(m >= t){ if(g < lo[i] + c * KT){ M[i] = 1; V[i] = Math.min(255, Math.round((hi[i] - g) / c * 255 * 1.15)); } } else if(g > hi[i] - c * KT){ M[i] = 1; V[i] = Math.min(255, Math.round((g - lo[i]) / c * 255 * 1.15)); } } }
    return M;
  }
  /* table rules and underlines: long, thin runs of ink go (and tell where the columns are) */
  function rules(M, w, h){
    var x, y, k, L = 28;
    for(y = 0; y < h; y++){ x = 0; while(x < w){ if(!M[y * w + x]){ x++; continue; } k = x; while(k < w && M[y * w + k]) k++;
      if(k - x >= L){ var thin = 0; for(var t = x; t < k; t++){ var up = y > 1 ? M[(y - 2) * w + t] : 0, dn = y < h - 2 ? M[(y + 2) * w + t] : 0; if(!up && !dn) thin++; }
        if(thin > (k - x) * 0.7){ for(t = x; t < k; t++){ M[y * w + t] = 0; if(y > 0 && M[(y - 1) * w + t] && !(y > 1 && M[(y - 2) * w + t])) M[(y - 1) * w + t] = 0; if(y < h - 1 && M[(y + 1) * w + t] && !(y < h - 2 && M[(y + 2) * w + t])) M[(y + 1) * w + t] = 0; } } }
      x = k; } }
    for(x = 0; x < w; x++){ y = 0; while(y < h){ if(!M[y * w + x]){ y++; continue; } k = y; while(k < h && M[k * w + x]) k++;
      if(k - y >= L){ var thin2 = 0; for(var u = y; u < k; u++){ var lf = x > 1 ? M[u * w + x - 2] : 0, rt = x < w - 2 ? M[u * w + x + 2] : 0; if(!lf && !rt) thin2++; }
        if(thin2 > (k - y) * 0.8){ for(u = y; u < k; u++){ M[u * w + x] = 0; if(x > 0 && !(x > 1 && M[u * w + x - 2])) M[u * w + x - 1] = 0; if(x < w - 1 && !(x < w - 2 && M[u * w + x + 2])) M[u * w + x + 1] = 0; } } }
      y = k; } }
  }
  /* connected pieces of ink (8-neighbours) */
  function pieces(M, w, h){
    var L = new Int32Array(w * h), par = [0], n = 0;
    function find(a){ while(par[a] !== a){ par[a] = par[par[a]]; a = par[a]; } return a; }
    function uni(a, b){ a = find(a); b = find(b); if(a !== b){ if(a < b) par[b] = a; else par[a] = b; } }
    for(var y = 0; y < h; y++) for(var x = 0; x < w; x++){ var i = y * w + x; if(!M[i]) continue;
      var nb = [], p;
      if(x > 0 && (p = L[i - 1])) nb.push(p);
      if(y > 0){ if((p = L[i - w])) nb.push(p); if(x > 0 && (p = L[i - w - 1])) nb.push(p); if(x < w - 1 && (p = L[i - w + 1])) nb.push(p); }
      if(!nb.length){ n++; par[n] = n; L[i] = n; }
      else { var m0 = nb[0]; for(var k = 1; k < nb.length; k++){ uni(m0, nb[k]); } L[i] = find(m0); } }
    var B = {}, out = [];
    for(var j = 0; j < L.length; j++){ var l = L[j]; if(!l) continue; l = find(l); L[j] = l; var b = B[l], xx = j % w, yy = (j / w) | 0;
      if(!b){ b = B[l] = { l: [l], x0: xx, x1: xx, y0: yy, y1: yy, n: 0 }; out.push(b); }
      if(xx < b.x0) b.x0 = xx; if(xx > b.x1) b.x1 = xx; if(yy < b.y0) b.y0 = yy; if(yy > b.y1) b.y1 = yy; b.n++; }
    return { L: L, P: out };
  }
  function bw(b){ return b.x1 - b.x0 + 1; } function bh(b){ return b.y1 - b.y0 + 1; }
  function join(a, b){ return { l: a.l.concat(b.l), x0: Math.min(a.x0, b.x0), x1: Math.max(a.x1, b.x1), y0: Math.min(a.y0, b.y0), y1: Math.max(a.y1, b.y1), n: a.n + b.n }; }
  /* dots and bars that belong to one letter (i j : ; ! ? % = ÷): stacked pieces that overlap left to right */
  function stack(P, hint){
    P.sort(function(a, b){ return a.x0 - b.x0 || a.y0 - b.y0; });
    var used = new Array(P.length), out = [];
    for(var i = 0; i < P.length; i++){ if(used[i]) continue; var g = P[i];
      for(var j = i + 1; j < P.length && P[j].x0 <= g.x1 + 1; j++){ if(used[j]) continue; var o = P[j];
        var ov = Math.min(g.x1, o.x1) - Math.max(g.x0, o.x0) + 1, mw = Math.min(bw(g), bw(o)); if(ov < Math.max(1, mw * 0.45)) continue;
        var gap = o.y0 > g.y1 ? o.y0 - g.y1 - 1 : g.y0 > o.y1 ? g.y0 - o.y1 - 1 : -1; if(gap < 0) continue;
        var small = Math.min(bh(g), bh(o)), big = Math.max(bh(g), bh(o)), tot = Math.max(g.y1, o.y1) - Math.min(g.y0, o.y0) + 1;
        if((gap <= Math.max(2, big * 0.55) || (big <= Math.max(4, hint * 0.4) && gap <= hint * 0.7)) && small <= Math.max(4, big * 0.6) && tot <= hint * 1.7){ g = join(g, o); used[j] = 1; } }
      out.push(g); }
    return out;
  }
  /* ---------- what a letter looks like: its shape in a 10 × 14 grid, and where it sits on the line ---------- */
  var VV = null;   /* the darkness of the picture being read */
  function feat(L, w, g, base, cap){
    var f = new Float32Array(NF + 5), gw = bw(g), gh = bh(g), set = {};
    g.l.forEach(function(l){ set[l] = 1; });
    var cnt = new Float32Array(NF), tot = new Float32Array(NF);
    for(var y = g.y0; y <= g.y1; y++){ var fy = Math.min(GH - 1, (((y - g.y0) + 0.5) / gh * GH) | 0);
      for(var x = g.x0; x <= g.x1; x++){ var fx = Math.min(GW - 1, (((x - g.x0) + 0.5) / gw * GW) | 0), k = fy * GW + fx; tot[k]++; if(set[L[y * w + x]] && (!g.rx || (x >= g.rx[y - g.ry][0] && x <= g.rx[y - g.ry][1]))) cnt[k] += VV ? VV[y * w + x] / 255 : 1; } }
    /* a very small letter: spread each pixel over the cells it covers */
    for(var k2 = 0; k2 < NF; k2++){ if(tot[k2]) f[k2] = cnt[k2] / tot[k2]; else { var fy2 = (k2 / GW) | 0, fx2 = k2 % GW, sy = g.y0 + Math.floor(fy2 * gh / GH), sx = g.x0 + Math.floor(fx2 * gw / GW); f[k2] = set[L[sy * w + sx]] && (!g.rx || (sx >= g.rx[sy - g.ry][0] && sx <= g.rx[sy - g.ry][1])) ? (VV ? VV[sy * w + sx] / 255 : 1) : 0; } }
    f[NF + 4] = Math.min(3, g.l.length);
    f[NF] = gw / cap; f[NF + 1] = gh / cap; f[NF + 2] = (base - g.y0 + 1) / cap; f[NF + 3] = (g.y1 - base) / cap;
    return f;
  }
  function dist(a, b, lim){
    var s = 0;
    for(var i = 0; i < NF; i++){ var d = a[i] - b[i]; s += d * d; }
    s /= NF;
    var dw = a[NF] - b[NF], dh = a[NF + 1] - b[NF + 1], dt = a[NF + 2] - b[NF + 2], db = a[NF + 3] - b[NF + 3];
    return s + WG[0] * dw * dw + WG[1] * dh * dh + WG[2] * dt * dt + WG[3] * db * db + (a[NF + 4] !== b[NF + 4] ? 0.035 : 0);
  }
  /* ---------- the letters this browser draws, at the line's size ---------- */
  function capOf(f){ var k = f.join("|"); if(capRatio[k]) return capRatio[k];
    var c = cv(140, 140), g = c.getContext("2d", { willReadFrequently: true }); g.fillStyle = "#fff"; g.fillRect(0, 0, 140, 140); g.fillStyle = "#000"; g.font = fontStr(f, 100); g.textBaseline = "alphabetic"; g.fillText("H", 10, 120);
    var d = g.getImageData(0, 0, 140, 140).data, top = 140, bot = 0; for(var y = 0; y < 140; y++) for(var x = 0; x < 140; x++) if(d[(y * 140 + x) * 4] < 128){ if(y < top) top = y; if(y > bot) bot = y; }
    return (capRatio[k] = Math.max(0.5, (bot - top + 1) / 100)); }
  function tplFor(f, px){
    var key = f.join("|") + "|" + px; if(TPL[key]) return TPL[key];
    var cell = Math.ceil(px * 1.6) + 8, rowH = Math.ceil(px * 1.9) + 10, base = Math.round(rowH * 0.72), N = CHARS.length, OFF = [0, 0.25, 0.5, 0.75];
    var c = cv(cell * N, rowH * OFF.length), g = c.getContext("2d", { willReadFrequently: true });
    g.fillStyle = "#fff"; g.fillRect(0, 0, c.width, c.height); g.fillStyle = "#000"; g.font = fontStr(f, px); g.textBaseline = "alphabetic";
    OFF.forEach(function(o, r){ for(var i = 0; i < N; i++) g.fillText(CHARS[i], i * cell + 4 + o, r * rowH + base); });
    var P = grayOf(c), M = binarize(P, 8), Q = pieces(M, P.w, P.h), out = [], VV0 = VV; VV = P.V;
    var cells = {}; Q.P.forEach(function(b){ var cx = ((b.x0 + b.x1) / 2 / cell) | 0, cy = ((b.y0 + b.y1) / 2 / rowH) | 0, k = cy * N + cx; cells[k] = cells[k] ? join(cells[k], b) : b; });
    var iH = CHARS.indexOf("H");
    for(var r2 = 0; r2 < OFF.length; r2++){ var Hr = cells[r2 * N + iH], bl = Hr ? Hr.y1 : r2 * rowH + base, capM = Hr ? bh(Hr) : px * capOf(f);
      for(var i2 = 0; i2 < N; i2++){ var gl = cells[r2 * N + i2]; if(!gl) continue; out.push({ ch: AS[CHARS[i2]] || CHARS[i2], f: feat(Q.L, P.w, gl, bl, capM) }); } }
    VV = VV0;
    out.cap = px * capOf(f); var H0 = cells[iH]; out.capM = H0 ? bh(H0) : Math.round(out.cap);
    var GL = []; for(var k3 in cells){ if(+k3 < N && "aeonsuHEOB".indexOf(CHARS[+k3]) > -1) GL.push(cells[k3]); } out.rl = runOf(Q.L, P.w, GL);
    return (TPL[key] = out);
  }
  /* the font sizes a measured cap height can come from, in every font here */
  function setsFor(cap){ var out = [];
    fontsHere().forEach(function(f){ var p0 = cap / capOf(f), seen = {}; [Math.floor(p0), Math.ceil(p0), Math.floor(p0) - 1, Math.ceil(p0) + 1, Math.ceil(p0) + 2].forEach(function(px){ if(px < 6 || seen[px] || Math.abs(px * capOf(f) - cap) > 2.1) return; seen[px] = 1; out.push({ f: f, px: px }); }); });
    return out; }
  function runOf(L, w, gs){ var n = 0, s = 0; gs.forEach(function(g){ var set = {}; g.l.forEach(function(l){ set[l] = 1; });
      for(var y = g.y0; y <= g.y1; y++){ var run = 0; for(var x = g.x0; x <= g.x1 + 1; x++){ var on = x <= g.x1 && set[L[y * w + x]]; if(on) run++; else if(run){ s += run; n++; run = 0; } } } }); return n ? s / n : 0; }
  function scoreSet(st, Q, w, gs, base, rl){ var T = tplFor(st.f, st.px), s = 0; gs.forEach(function(g){ s += best(feat(Q.L, w, g, base, T.capM), T).d; }); if(rl && T.rl) s += gs.length * 0.16 * Math.abs(rl - T.rl) / Math.max(1, T.rl); return s; }
  /* ---------- lines ---------- */
  function lines(G){
    G.sort(function(a, b){ return a.x0 - b.x0; });
    var par = G.map(function(_, i){ return i; });
    function find(a){ while(par[a] !== a){ par[a] = par[par[a]]; a = par[a]; } return a; }
    for(var i = 0; i < G.length; i++){ var a = G[i], ha = bh(a), best = -1, bd = 1e9;
      for(var j = i + 1; j < G.length; j++){ var b = G[j], hb = bh(b), mh = Math.max(ha, hb); if(b.x0 - a.x1 > 2.4 * mh + 2) break;
        var ov = Math.min(a.y1, b.y1) - Math.max(a.y0, b.y0) + 1; if(ov < 1 || (ov < Math.min(ha, hb) * 0.5 && Math.min(ha, hb) > Math.max(ha, hb) * 0.45)) continue;   /* a comma or quote only touches the letters' band */
        if(Math.max(ha, hb) > 2.3 * Math.min(ha, hb) && Math.min(ha, hb) > Math.max(ha, hb) * 0.42 + 0) continue;
        if(Math.max(ha, hb) > 2.6 * Math.min(ha, hb) && Math.min(ha, hb) >= 6) continue;   /* two sizes of text: two lines */
        var d = Math.max(0, b.x0 - a.x1); if(d < bd){ bd = d; best = j; } }
      if(best > -1){ var ra = find(i), rb = find(best); if(ra !== rb) par[rb] = ra; } }
    var by = {}; G.forEach(function(g, k){ var r = find(k); (by[r] = by[r] || []).push(g); });
    return Object.keys(by).map(function(k){ return by[k]; });
  }
  function median(a){ if(!a.length) return 0; var s = a.slice().sort(function(x, y){ return x - y; }); return s[(s.length - 1) >> 1]; }
  function metrics(L){
    var bots = L.map(function(g){ return g.y1; }), hs = L.map(bh), mh = Math.max.apply(0, hs);
    var tall = L.filter(function(g){ return bh(g) >= mh * 0.55; });
    var cnt = {}; (tall.length ? tall : L).forEach(function(g){ cnt[g.y1] = (cnt[g.y1] || 0) + 1 + (cnt[g.y1 - 1] ? 0.5 : 0); });
    var base = +Object.keys(cnt).sort(function(a, b){ return cnt[b] - cnt[a] || b - a; })[0];
    var above = L.filter(function(g){ return Math.abs(g.y1 - base) <= 1; }).map(function(g){ return base - g.y0 + 1; }).sort(function(a, b){ return a - b; });
    var top = above.length ? above[Math.floor((above.length - 1) * 0.9)] : mh, tallG = above.filter(function(v){ return v >= top * 0.8 && v <= top * 1.15; });
    var cap = tallG.length ? tallG[(tallG.length - 1) >> 1] : mh;   /* about the capitals; the font's own H settles it below */
    /* all lowercase without ascenders: the cap height is about 1.4 × the x-height */
    var xs = above.filter(function(v){ return v < cap * 0.8; }); if(above.length >= 4 && xs.length === above.length) cap = Math.round(median(xs) * 1.38);
    return { base: base, cap: Math.max(4, cap) };
  }
  /* ---------- reading ---------- */
  function best(f, T){ var b = null, bd = 1e9, sec = 1e9, ch2 = "";
    for(var i = 0; i < T.length; i++){ var d = dist(f, T[i].f); if(d < bd){ if(b && T[i].ch !== b) { sec = bd; ch2 = b; } bd = d; b = T[i].ch; } else if(d < sec && T[i].ch !== b){ sec = d; ch2 = T[i].ch; } }
    return { ch: b || "?", d: bd, ch2: ch2, d2: sec }; }
  var PUN = "!'\":;,.|-_=";
  function readGlyph(Q, w, g, m, T, depth, dm){
    var f = feat(Q.L, w, g, m.base, m.cap), r = best(f, T), gw = bw(g);
    if(dm == null) dm = 0.02;
    /* letters that touch: try every thin column inside; keep the split only when both halves read clearly better */
    var dotted = g.l.length > 1 && "ij:;!?%=\"".indexOf(r.ch) < 0;
    if(depth < 3 && gw >= 4 && (gw > m.cap * 1.12 || dotted || r.d > Math.max(0.04, dm * 3))){
      var cols = []; for(var x = g.x0 + 1; x < g.x1; x++){ var s = 0; for(var y = g.y0; y <= g.y1; y++) if(g.l.indexOf(Q.L[y * w + x]) > -1) s++; cols.push([x, s]); }
      var lo = Math.max(1, Math.round(gw * 0.18)), hi = gw - lo, cand = cols.filter(function(c){ var k = c[0] - g.x0; return k >= lo && k <= hi; }).sort(function(a, b){ return a[1] - b[1]; }).slice(0, depth ? 5 : 12);
      var bestS = null, sm = seam(Q, w, g, lo, hi), tries = cand.map(function(c){ return [cut(Q, w, g, g.x0, c[0]), cut(Q, w, g, c[0] + 1, g.x1)]; });
      if(sm) tries.push([part(Q, w, g, sm.map(function(x){ return [g.x0, x]; })), part(Q, w, g, sm.map(function(x){ return [x + 1, g.x1]; }))]);
      tries.forEach(function(AB){ var A = AB[0], B = AB[1]; if(!A || !B) return;
        if(bh(A) < m.cap * 0.45 || bh(B) < m.cap * 0.45 || bw(A) < 2 || bw(B) < 2) return;
        var ra = readGlyph(Q, w, A, m, T, depth + 1, dm), rb = readGlyph(Q, w, B, m, T, depth + 1, dm), sc = Math.max(ra.d, rb.d) + 0.012;
        if(PUN.indexOf(ra.t.slice(-1)) > -1 || PUN.indexOf(rb.t.charAt(0)) > -1) sc += 0.05;   /* a halved letter isn't punctuation */
        if(!bestS || sc < bestS.sc) bestS = { sc: sc, t: ra.t + rb.t, d: (ra.d + rb.d) / 2 }; });
      if(bestS && bestS.sc < r.d * 0.55 && bestS.sc < Math.max(0.04, dm * 2.5, r.d * 0.5)) return { t: bestS.t, d: bestS.d };
    }
    var ch = r.ch;
    if(ch === "." && g.y1 > m.base && bh(g) >= 2) ch = ","; else if(ch === "," && g.y1 <= m.base) ch = ".";   /* a comma hangs below the line, a period doesn't */
    return { t: ch, d: r.d };
  }
  /* the cheapest way down through a letter pair, a pixel left or right each row (for letters that touch on a slant: 0/ VA) */
  function seam(Q, w, g, lo, hi){
    var set = {}; g.l.forEach(function(l){ set[l] = 1; });
    var H0 = bh(g), xs = [], P = [], B = [], x, y;
    for(x = g.x0 + lo; x <= g.x1 - lo; x++) xs.push(x);
    if(xs.length < 1) return null;
    var ink = function(x, y){ var i = y * w + x; return set[Q.L[i]] ? (VV ? VV[i] / 255 : 1) : 0; };
    P[0] = xs.map(function(x){ return ink(x, g.y0); });
    for(y = 1; y < H0; y++){ P[y] = []; B[y] = [];
      for(var k = 0; k < xs.length; k++){ var bb = P[y - 1][k], bk = k;
        if(k > 0 && P[y - 1][k - 1] + 0.2 < bb){ bb = P[y - 1][k - 1] + 0.2; bk = k - 1; }
        if(k < xs.length - 1 && P[y - 1][k + 1] + 0.2 < bb){ bb = P[y - 1][k + 1] + 0.2; bk = k + 1; }
        P[y][k] = bb + ink(xs[k], g.y0 + y); B[y][k] = bk; } }
    var end = 0; for(var k2 = 1; k2 < xs.length; k2++) if(P[H0 - 1][k2] < P[H0 - 1][end]) end = k2;
    var path = new Array(H0); path[H0 - 1] = end; for(y = H0 - 1; y > 0; y--) path[y - 1] = B[y][path[y]];
    return path.map(function(k){ return xs[k]; });
  }
  function part(Q, w, g, rows){   /* rows[y - g.y0] = [x from, x to] that this part owns */
    var o = { l: g.l, rx: rows, ry: g.y0, x0: 1e9, x1: -1, y0: 1e9, y1: -1, n: 0 };
    for(var y = g.y0; y <= g.y1; y++){ var r = rows[y - g.y0]; for(var x = r[0]; x <= r[1]; x++) if(g.l.indexOf(Q.L[y * w + x]) > -1){ if(x < o.x0) o.x0 = x; if(x > o.x1) o.x1 = x; if(y < o.y0) o.y0 = y; if(y > o.y1) o.y1 = y; o.n++; } }
    return o.y1 < 0 ? null : o; }
  function cut(Q, w, g, xa, xb){ var o = { l: g.l, x0: xa, x1: xb, y0: 1e9, y1: -1, n: 0 };
    for(var y = g.y0; y <= g.y1; y++) for(var x = xa; x <= xb; x++) if(g.l.indexOf(Q.L[y * w + x]) > -1){ if(y < o.y0) o.y0 = y; if(y > o.y1) o.y1 = y; o.n++; }
    if(o.y1 < 0) return null;
    var nx0 = xb, nx1 = xa; for(y = o.y0; y <= o.y1; y++) for(x = xa; x <= xb; x++) if(g.l.indexOf(Q.L[y * w + x]) > -1){ if(x < nx0) nx0 = x; if(x > nx1) nx1 = x; }
    o.x0 = nx0; o.x1 = nx1; return o; }
  /* the words afterwards: 0/O, 1/l/I and friends by what's around them */
  var DIGITY = { O: "0", o: "0", Q: "0", l: "1", I: "1", "|": "1", i: "1", S: "5", s: "5", B: "8", Z: "2", z: "2", g: "9", b: "6" };
  function fixWord(t){
    if(t.length < 2) return t;
    var dg = (t.match(/[0-9]/g) || []).length, al = (t.match(/[A-Za-z]/g) || []).length;
    if(dg && (dg > al || /^[0-9OolISBZQ]+[.,:][0-9OolISBZQ]+$/.test(t)) && /^[$#(]?[0-9OolI|iSsBZzgbQ.,:\/\-]+[)%]?$/.test(t)){   /* B.0 → 8.0 */ t = t.replace(/[OolI|iSsBZzgbQ]/g, function(c){ return DIGITY[c] || c; });
      if(/^\$?\d{1,3}(\.\d{3})+\.\d{2}$/.test(t)){ var ps = t.split("."); t = ps.slice(0, -1).join(",") + "." + ps[ps.length - 1]; }   /* 1.240.00 → 1,240.00 */
      return t; }
    if(/^[A-HJ-NPR-Z0-9OIQ]{17}$/.test(t)) return t.replace(/O|Q/g, "0").replace(/I/g, "1");   /* a VIN never has I, O or Q */
    if(al > dg){
      var low = (t.match(/[a-z]/g) || []).length, up = (t.match(/[A-Z]/g) || []).length;
      t = t.replace(/0/g, low >= up ? "o" : "O");
      if(low > up) t = t.replace(/(?!^)I/g, "l").replace(/1/g, "l");
      else if(up) t = t.replace(/1/g, "I").replace(/(?!^)l(?=[A-Z])/g, "I");
      if(low > up && /^I[a-z]/.test(t) && !/^I(n|t|s|f|d|m|r|D)/.test(t)) t = "l" + t.slice(1);
    }
    return t;
  }
  function text(rowsOut){ return rowsOut.join("\n"); }
  function read(src, opts){
    opts = opts || {}; var log = opts.logger || function(){};
    return Promise.resolve(src instanceof Blob && window.createImageBitmap ? createImageBitmap(src) : src).then(function(img){
      log({ status: "recognizing text", progress: 0 });
      var P = grayOf(img), w = P.w, h = P.h;
      var M = binarize(P, 11); rules(M, w, h); VV = P.V;
      var Q = pieces(M, w, h);
      var raw = Q.P.filter(function(b){ var ww = bw(b), hh = bh(b); if(b.n < 1) return false; if(hh > 90 || ww > 260) return false; if(ww > 6 * hh && hh <= 3) return false; if(hh > 6 * ww && ww <= 2 && hh > 30) return false; return true; });
      var hint = median(raw.map(bh)) || 10;
      raw = raw.filter(function(b){ var ww = bw(b), hh = bh(b), fill = b.n / (ww * hh); if(hh > 1.8 * hint && ww > 3.2 * hh) return false; if(ww > 2 * hint && hh > 2 * hint && (fill > 0.8 || fill < 0.12)) return false; return true; });
      var G = stack(raw, hint);
      if(opts.region){ var rg = opts.region, inR = function(b){ return b.x1 >= rg[0] && b.x0 <= rg[2] && b.y1 >= rg[1] && b.y0 <= rg[3]; }; opts.regionOut = { raw: Q.P.filter(inR).map(function(b){ return [b.x0, b.x1, b.y0, b.y1, b.n]; }), kept: raw.filter(inR).map(function(b){ return [b.x0, b.x1, b.y0, b.y1, b.n]; }), glyphs: G.filter(inR).map(function(b){ return [b.x0, b.x1, b.y0, b.y1, b.n]; }) }; }
      var LS = lines(G).filter(function(L){ return L.length && L.some(function(g){ return bh(g) >= Math.max(4, hint * 0.5); }); });
      var out = [], confSum = 0, confN = 0;
      var rowsL = LS.map(function(L){ L.sort(function(a, b){ return a.x0 - b.x0; }); var m = metrics(L); return { L: L, m: m, x0: L[0].x0, y: m.base }; });
      /* a short line (Qty, OP, a lone 2) takes its baseline and cap height from a longer line beside it in the same row */
      rowsL.forEach(function(R){ R.y0 = Math.min.apply(0, R.L.map(function(g){ return g.y0; })); R.y1 = Math.max.apply(0, R.L.map(function(g){ return g.y1; })); });
      rowsL.forEach(function(R){ if(R.L.length >= 4) return; var best0 = null;
        rowsL.forEach(function(S){ if(S === R || S.L.length < 4) return; var ov = Math.min(R.y1, S.y1) - Math.max(R.y0, S.y0) + 1; if(ov < (R.y1 - R.y0 + 1) * 0.6) return;
          if(Math.abs(S.m.base - R.m.base) > Math.max(3, S.m.cap * 0.45)) return; var dx = Math.min(Math.abs(S.x0 - R.x0), Math.abs(S.L[S.L.length - 1].x1 - R.x0)); if(!best0 || dx < best0.dx) best0 = { S: S, dx: dx }; });
        if(best0){ R.m.base = best0.S.m.base; R.m.cap = best0.S.m.cap; } });
      /* which fonts and sizes fit: for each cap height in the picture, score every font here on up to 40 of its letters */
      var byCap = {};
      rowsL.forEach(function(R){ var k = R.m.cap; (byCap[k] = byCap[k] || []).push(R); });
      Object.keys(byCap).forEach(function(k){ var fs = [];
        var fsR = [];
        var per = Math.max(2, Math.ceil(48 / byCap[k].length));   /* a few letters from every line, not just the first ones */
        byCap[k].forEach(function(R){ var n0 = 0; R.L.forEach(function(g){ if(n0 < per && fs.length < 60 && bw(g) <= R.m.cap * 1.05 && bh(g) >= R.m.cap * 0.5){ fs.push(g); fsR.push(R.m.base); n0++; } }); });
        var C0 = setsFor(+k).map(function(st){ var T0 = tplFor(st.f, st.px), sc = 0; fs.forEach(function(g, q){ sc += best(feat(Q.L, w, g, fsR[q], T0.capM), T0).d; }); return { st: st, s: sc }; }).sort(function(a, b){ return a.s - b.s; }), C = C0.slice(0, 5);
        [C0.filter(function(c){ return c.st.f[1] >= 600; })[0], C0.filter(function(c){ return c.st.f[1] < 600; })[0]].forEach(function(c){ if(c && C.indexOf(c) < 0) C.push(c); });
        byCap[k].forEach(function(R){ var ownG = R.L.slice(0, 12).filter(function(g){ return bw(g) <= R.m.cap * 1.05 && bh(g) >= R.m.cap * 0.5; }), rl = runOf(Q.L, w, ownG);
          var pk = C.map(function(c){ return { st: c.st, s: ownG.length >= 2 ? scoreSet(c.st, Q, w, ownG, R.m.base, rl) : ownG.length ? scoreSet(c.st, Q, w, ownG, R.m.base, 0) : c.s }; }).sort(function(a, b){ return a.s - b.s; });
          /* a line that fits none of the shared picks well (a heading, a button) gets its own search */
          if(ownG.length >= 2 && (!pk.length || pk[0].s / ownG.length > 0.045)){ var all = setsFor(R.m.cap).concat(setsFor(R.m.cap + 1)).concat(setsFor(Math.max(4, R.m.cap - 1)));
            var pk2 = all.map(function(st){ return { st: st, s: scoreSet(st, Q, w, ownG, R.m.base, rl) }; }).sort(function(a, b){ return a.s - b.s; });
            if(pk2.length && (!pk.length || pk2[0].s < pk[0].s)) pk = pk2.slice(0, 2); }
          if(pk.length) R.m.cap = tplFor(pk[0].st.f, pk[0].st.px).capM;   /* the chosen font's own cap height at that size */
          R.T = pk.length ? tplFor(pk[0].st.f, pk[0].st.px).concat(pk[1] ? tplFor(pk[1].st.f, pk[1].st.px) : []) : []; R.font = pk.length ? pk[0].st.f.join(" ") + " " + pk[0].st.px + "px" : ""; }); });
      rowsL.forEach(function(R, ri){
        var T = R.T;
        var s = "", prev = null, gaps = [];
        for(var q = 0; q + 1 < R.L.length; q++){ var A1 = R.L[q], B1 = R.L[q + 1]; if(B1.x0 - A1.x1 > 1 || bw(A1) + bw(B1) > R.m.cap * 1.1) continue;   /* only pieces with no clear column between them */
          var J = join(A1, B1), fa = best(feat(Q.L, w, A1, R.m.base, R.m.cap), T), fb = best(feat(Q.L, w, B1, R.m.base, R.m.cap), T), fj = best(feat(Q.L, w, J, R.m.base, R.m.cap), T);
          if(fj.d < 0.04 && fj.d < Math.max(fa.d, fb.d) * 0.6){ R.L.splice(q, 2, J); q--; } }
        R.L.forEach(function(g, k){ if(k) gaps.push((g.x0 - R.L[k - 1].x1 - 1) / R.m.cap); });
        var sp = 0.3, sg = gaps.slice().sort(function(a, b){ return a - b; });
        if(sg.length >= 3){ var lo = sg.filter(function(v){ return v < 0.32; }), hi = sg.filter(function(v){ return v >= 0.32 && v < 1.6; }); if(lo.length && hi.length) sp = Math.min(0.42, Math.max(0.22, (Math.max.apply(0, lo) + Math.min.apply(0, hi)) / 2)); }
        var d1 = R.L.map(function(g){ return best(feat(Q.L, w, g, R.m.base, R.m.cap), T).d; }), dm = Math.max(0.006, median(d1));
        R.L.forEach(function(g, k){
          if(prev){ var gp = (g.x0 - prev.x1 - 1) / R.m.cap; s += gp >= 1.6 ? "\t" : gp >= sp ? " " : ""; }
          var pk0 = prev ? s.slice(-1) : "";
          var r = readGlyph(Q, w, g, R.m, T, 0, dm);
          if(pk0 === " " && (g.x0 - prev.x1 - 1) / R.m.cap < 0.7 && ((/[0-9]$/.test(s.slice(0, -1)) && /^[,.:]/.test(r.t)) || (/[,.:]$/.test(s.slice(0, -1)) && /^[0-9]/.test(r.t) && /[0-9][,.:]$/.test(s.slice(0, -1))))) s = s.slice(0, -1);   /* 11 :00 → 11:00, $1 ,680 → $1,680 */
          s += r.t; confSum += r.d; confN++; prev = g; R.dsum = (R.dsum || 0) + r.d; if(opts.debug) (R.dbg = R.dbg || []).push([g.x0, g.x1, g.y0, g.y1, r.t, +r.d.toFixed(4)]); });
        R.text = s.split(/(\t| )/).map(function(t){ return t === " " || t === "\t" ? t : fixWord(t); }).join("")
          .replace(/''/g, "\"").replace(/,,/g, "\"").replace(/(\d) ?[.,] ?(\d{2})\b/g, function(m0, a, b){ return a + "." + b; });
      });
      rowsL = rowsL.filter(function(R){ if(R.L.length > 1) return true; var g = R.L[0]; return !(bw(g) <= 2 && bh(g) >= 3 * bw(g) && !/[1lI!|]/.test(R.text)) && R.dsum < 0.12; });   /* a lone thin bar or a bad read is a box edge; a lone 2 in a Qty column stays */
      /* lines at the same height side by side become one line, the gap a tab */
      rowsL.sort(function(a, b){ return a.y - b.y || a.x0 - b.x0; });
      var rows = [];
      rowsL.forEach(function(R){ var last = rows[rows.length - 1];
        if(last && Math.abs(last.y - R.y) <= Math.max(2, Math.min(last.cap, R.m.cap) * 0.45)) last.items.push(R); else rows.push({ y: R.y, cap: R.m.cap, items: [R] }); });
      rows.forEach(function(rw){ rw.items.sort(function(a, b){ return a.x0 - b.x0; }); out.push(rw.items.map(function(R){ return R.text; }).join("\t")); });
      log({ status: "recognizing text", progress: 1 });
      var conf = confN ? Math.max(0, Math.min(100, Math.round(100 - confSum / confN * 900))) : 0;
      return { text: text(out), conf: conf, region: opts.regionOut, dbg: opts.debug ? rowsL.map(function(R){ return { t: R.text, m: R.m, font: R.font, g: R.dbg }; }) : undefined };
    });
  }
  /* the shape today's code calls: Tesseract.createWorker → setParameters, recognize, terminate */
  var T = { builtIn: true, createWorker: function(lang, oem, o){ var lg = o && o.logger;
    if(lg) lg({ status: "loading", progress: 1 });
    return Promise.resolve({ setParameters: function(){ return Promise.resolve(); },
      recognize: function(img){ return new Promise(function(res){ setTimeout(res, 0); }).then(function(){ return read(img, { logger: lg }); }).then(function(r){ return { data: { text: r.text, confidence: r.conf } }; }); },
      terminate: function(){ return Promise.resolve(); } }); } };
  return { read: read, Tesseract: T, fonts: fontsHere, cfg: function(o){ if(o.KT) KT = o.KT; if(o.WG) WG = o.WG; TPL = {}; } };
})();
