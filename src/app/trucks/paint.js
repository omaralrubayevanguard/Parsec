/* Parsec · trucks · paint.js
   The truck's colour (17.3): pick it in the Vehicle section; the catalog picture is repainted — the cab and hood only — on every page, from above too; kept with the truck by its VIN; never on a photo.
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   trkColorHex trkColorName trkColorOf trkPaintSrc trkPaintReady trkPaintRedraw trkPaintNow trkSwatchPop trkColorSet trkColorFromText TRK_COLORS TRK_PAINT … (10 functions, 4 constants)
   state      ros
   uses       ro/ ro-page/ shell/ state/
*/
/* ============================== the truck's colour (Parsec 17.3) ==============================
   The catalog pictures are white trucks on a see-through background. A colour on the RO repaints the picture's body: the
   paint is found as the light, grey-free parts of the picture that join up into the cab and the hood (not the chrome
   tanks, wheels or the badge, which sit low or alone), and each of those pixels takes the colour with its own shading.
   · The colour is ro.color: a name from TRK_COLORS, or a hex for a Custom colour. Set in the Vehicle section (ROFLD
     "color"), or by New RO when the case lists one.
   · An RO without its own colour takes the truck's — the newest other RO with the same VIN that has one (trkColorOf).
   · A photo (the check-in photo, or the shop's own picture of this truck) is never repainted, and has no colour row.
   · trkPaintSrc(src, hex, top) answers at once: the painted picture when it's ready, else the plain one — the painting
     happens off to the side and the page redraws once when it's done. */
var TRK_COLORS = [["White", "#F4F2EC"], ["Silver", "#A7ADB4"], ["Grey", "#6B7078"], ["Black", "#232326"], ["Red", "#A51F22"], ["Orange", "#D8641C"],
  ["Yellow", "#E2B522"], ["Green", "#2F5D3A"], ["Teal", "#1F7A7A"], ["Blue", "#1E3F78"], ["Purple", "#5E3A8C"], ["Pink", "#D9649A"]];
function trkColorHex(c){ c = String(c || "").trim(); if(!c) return ""; if(/^#[0-9a-f]{6}$/i.test(c)) return c.toUpperCase(); var m = TRK_COLORS.filter(function(x){ return x[0].toLowerCase() === c.toLowerCase(); })[0]; return m ? m[1] : ""; }
function trkColorName(c){ c = String(c || "").trim(); if(!c) return ""; var m = TRK_COLORS.filter(function(x){ return x[0].toLowerCase() === c.toLowerCase() || x[1].toLowerCase() === c.toLowerCase(); })[0]; return m ? m[0] : /^#/.test(c) ? "Custom" : c; }
/* this RO's colour, or the truck's from its last visit */
function trkColorOf(ro){
  if(!ro) return null;
  if(trkColorHex(ro.color)) return { c: ro.color, hex: trkColorHex(ro.color), from: "ro" };
  var v = String(ro.vin || "").toUpperCase(); if(v.length < 11) return null;
  var best = null; (STATE.ros || []).forEach(function(r){ if(r === ro || !trkColorHex(r.color) || String(r.vin || "").toUpperCase() !== v) return; if(!best || String(r.dateOpened || "") > String(best.dateOpened || "")) best = r; });
  return best ? { c: best.color, hex: trkColorHex(best.color), from: "vin", ro: best } : null;
}
/* the painted picture: ready at once when it has been painted before */
var TRK_PAINT = {}, TRK_PAINT_T = null;
function trkPaintSrc(src, hex, top){
  if(!src || !hex || hex.toUpperCase() === "#F4F2EC") return src;
  var k = src + "|" + hex + "|" + (top ? 1 : 0), got = TRK_PAINT[k];
  if(got && got !== 1) return got;
  if(!got){ TRK_PAINT[k] = 1; trkPaintNow(src, hex, top).then(function(u){ TRK_PAINT[k] = u || src; clearTimeout(TRK_PAINT_T); TRK_PAINT_T = setTimeout(trkPaintRedraw, 40); }, function(){ TRK_PAINT[k] = src; }); }
  return src;
}
function trkPaintReady(src, hex, top){ var k = src + "|" + hex + "|" + (top ? 1 : 0); if(TRK_PAINT[k] && TRK_PAINT[k] !== 1) return Promise.resolve(TRK_PAINT[k]); return trkPaintNow(src, hex, top).then(function(u){ TRK_PAINT[k] = u || src; return TRK_PAINT[k]; }); }
function trkPaintRedraw(){ try{ render(); }catch(e){} try{ if(typeof rpMountRo === "function") rpMountRo(); }catch(e){} try{ if(typeof JC !== "undefined" && JC.rerender) JC.rerender(); }catch(e){} }
/* find the body and paint it, keeping its shading */
function trkPaintNow(src, hex, top){
  return new Promise(function(res, rej){
    var im = new Image(); im.onerror = rej;
    im.onload = function(){ try{
      var W = im.naturalWidth, H = im.naturalHeight, c = document.createElement("canvas"); c.width = W; c.height = H;
      var g = c.getContext("2d"); g.drawImage(im, 0, 0);
      var D = g.getImageData(0, 0, W, H), p = D.data, n = W * H, cand = new Uint8Array(n), lab = new Int32Array(n), vv = new Float32Array(n), hh = new Float32Array(n), ss = new Float32Array(n), opaque = 0;
      /* the body's own paint: white, grey, or the hue most of the upper picture has (the catalog has blue, red, teal and grey trucks too) */
      var B = { white: 0, gray: 0 }, HB = new Float32Array(12);
      for(var i = 0; i < n; i++){ var a = p[i * 4 + 3]; if(a < 10) continue; opaque++;
        var r = p[i * 4] / 255, gg = p[i * 4 + 1] / 255, b = p[i * 4 + 2] / 255, mx = Math.max(r, gg, b), mn = Math.min(r, gg, b), d = mx - mn, v = mx, s = mx ? d / mx : 0, h = 0;
        if(d){ h = mx === r ? ((gg - b) / d) % 6 : mx === gg ? (b - r) / d + 2 : (r - gg) / d + 4; h = (h * 60 + 360) % 360; }
        vv[i] = v; ss[i] = s; hh[i] = h;
        if((i / W | 0) > H * (top ? .5 : .6)) continue;
        if(s < .16 && v > .46) B.white++; else if(s < .16 && v > .26) B.gray++; else if(s > .25 && v > .14) HB[Math.floor(h / 30) % 12]++; }
      var hb = 0; for(var hx = 1; hx < 12; hx++) if(HB[hx] > HB[hb]) hb = hx;
      var hueN = HB[hb] + HB[(hb + 11) % 12] * .5 + HB[(hb + 1) % 12] * .5, kind = B.white >= hueN && B.white >= B.gray * .8 ? "white" : hueN >= B.gray ? "hue" : "gray";
      var h0 = 0, hs = 0, hw = 0; if(kind === "hue"){ for(var q0 = 0; q0 < n; q0++){ if(ss[q0] > .25 && vv[q0] > .14 && Math.floor(hh[q0] / 30) % 12 === hb){ hs += hh[q0]; hw++; } } h0 = hw ? hs / hw : hb * 30 + 15; }
      var hd = function(x){ var dd = Math.abs(x - h0) % 360; return dd > 180 ? 360 - dd : dd; };
      for(var c0 = 0; c0 < n; c0++){ if(!vv[c0] && !p[c0 * 4 + 3]) continue; if(p[c0 * 4 + 3] < 10) continue;
        if(kind === "white" ? ss[c0] < .16 && vv[c0] > .46 : kind === "gray" ? ss[c0] < .18 && vv[c0] > .24 && vv[c0] < .66 : ss[c0] > .18 && vv[c0] > .1 && hd(hh[c0]) < 26) cand[c0] = 1; }
      /* join the light parts into pieces (4-neighbour), and keep the pieces that make the cab and the hood */
      var keep = [], stack = new Int32Array(n), L = 0;
      for(var j = 0; j < n; j++){ if(!cand[j] || lab[j]) continue; L++; var sp = 0, size = 0, sy = 0, minY = H; stack[sp++] = j; lab[j] = L;
        while(sp){ var q = stack[--sp], y = (q / W) | 0, x = q - y * W; size++; sy += y; if(y < minY) minY = y;
          if(x > 0 && cand[q - 1] && !lab[q - 1]){ lab[q - 1] = L; stack[sp++] = q - 1; }
          if(x < W - 1 && cand[q + 1] && !lab[q + 1]){ lab[q + 1] = L; stack[sp++] = q + 1; }
          if(y > 0 && cand[q - W] && !lab[q - W]){ lab[q - W] = L; stack[sp++] = q - W; }
          if(y < H - 1 && cand[q + W] && !lab[q + W]){ lab[q + W] = L; stack[sp++] = q + W; } }
        var cy = sy / size / H, big = size / Math.max(1, opaque);
        keep[L] = top ? (cy < .46 && big > .002) : (cy < .62 && minY / H < .56 && big > .0012); }
      var rgb = [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)], dark = (rgb[0] + rgb[1] + rgb[2]) / 3 < 70;
      /* the paint's own lightness: its bright end is "full colour", darker parts keep their shading */
      var vs = []; for(var u = 0; u < n; u += 3) if(lab[u] && keep[lab[u]]) vs.push(vv[u]); vs.sort(function(x, y){ return x - y; }); var vref = vs.length ? vs[Math.floor(vs.length * .9)] : .93; if(vref < .2) vref = .2;
      for(var t = 0; t < n; t++){ if(!lab[t] || !keep[lab[t]]) continue;
        var k = Math.min(1, vv[t] / vref), spec = kind === "white" && vv[t] > .975 ? (vv[t] - .975) * 14 : 0;   /* the shading stays; the brightest glints stay a little light */
        if(dark) k = .55 + .45 * k;
        for(var ch = 0; ch < 3; ch++) p[t * 4 + ch] = Math.min(255, rgb[ch] * k + 255 * spec * (dark ? .35 : .5)); }
      g.putImageData(D, 0, 0);
      c.toBlob(function(bl){ res(bl ? URL.createObjectURL(bl) : c.toDataURL("image/png")); }, "image/png");
    }catch(e){ rej(e); } };
    im.src = src;
  });
}
/* the picker: twelve colours and Custom…, from the Colour row in the Vehicle section */
var TRK_SWEEP = { ro: "", at: 0 };
function trkSwatchPop(anchor, ro){
  var old = document.getElementById("trk-sw"); if(old){ old.remove(); if(old.__for === ro.id) return; }
  var cur = trkColorHex(ro.color), box = document.createElement("div");
  box.id = "trk-sw"; box.className = "trk-sw"; box.setAttribute("role", "menu"); box.__for = ro.id;
  box.innerHTML = '<div class="trk-sw__h">Truck colour</div><div class="trk-sw__g">' + TRK_COLORS.map(function(x){ return '<button type="button" role="menuitemradio" aria-checked="' + (cur === x[1]) + '" data-trk-sw="' + x[0] + '" title="' + x[0] + '" aria-label="' + x[0] + '" style="--sw:' + x[1] + '"></button>'; }).join("")
    + '</div><label class="trk-sw__c"><input type="color" value="' + (cur || "#A51F22") + '" aria-label="Custom colour"><span>Custom…</span></label>' + (ro.color ? '<button type="button" class="trk-sw__x" data-trk-sw="">No colour</button>' : '');
  document.body.appendChild(box);
  var r = anchor.getBoundingClientRect(), bw = box.offsetWidth, bh = box.offsetHeight;
  box.style.left = Math.max(8, Math.min(innerWidth - bw - 8, r.right - bw)) + "px"; box.style.top = (r.bottom + 6 + bh > innerHeight - 8 ? Math.max(8, r.top - bh - 6) : r.bottom + 6) + "px";
  var close = function(){ box.remove(); document.removeEventListener("mousedown", out, true); document.removeEventListener("keydown", key, true); };
  var out = function(e){ if(!box.contains(e.target) && e.target !== anchor && !anchor.contains(e.target)) close(); };
  var key = function(e){ if(e.key === "Escape"){ e.preventDefault(); e.stopPropagation(); close(); } };
  document.addEventListener("mousedown", out, true); document.addEventListener("keydown", key, true);
  var set = function(v){ close(); trkColorSet(ro, v); };
  box.addEventListener("click", function(e){ var b = e.target.closest("[data-trk-sw]"); if(b) set(b.getAttribute("data-trk-sw")); });
  box.querySelector('input[type=color]').addEventListener("change", function(e){ set(String(e.target.value || "").toUpperCase()); });
  var f0 = box.querySelector('[aria-checked="true"]') || box.querySelector("[data-trk-sw]"); if(f0) f0.focus();
}
/* set it: paint first, so the picture can sweep from the old colour to the new one */
function trkColorSet(ro, v){
  var hex = trkColorHex(v), P = null; try{ P = trkPick(ro); }catch(e){}
  var go = function(){ TRK_SWEEP = { ro: ro.id, at: Date.now() }; roFldSet(ro, "color", v); try{ v141Render(); }catch(e){ trkPaintRedraw(); } };
  if(hex && P && P.kind === "model" && P.base) trkPaintReady(P.base, hex, false).then(go, go); else go();
}
/* a colour as the case writes it — "WHT", "Gray", "Burgundy", "Navy blue" — to one of the names above */
function trkColorFromText(v){
  var t = String(v || "").toLowerCase().replace(/[^a-z ]/g, " ").trim(); if(!t) return "";
  var A = [["white", /\bwh(?:ite|t)\b/], ["silver", /\bsilver|\bslv\b/], ["grey", /\bgr[ae]y\b|\bgry\b|charcoal|gunmetal/], ["black", /\bblack|\bblk\b/], ["red", /\bred\b|burgundy|maroon/], ["orange", /orange/],
    ["yellow", /yellow|\bgold\b/], ["green", /green|\bgrn\b/], ["teal", /teal|turquoise/], ["blue", /blue|navy|\bblu\b/], ["purple", /purple|violet|plum/], ["pink", /pink|magenta/]];
  for(var i = 0; i < A.length; i++) if(A[i][1].test(t)) return A[i][0].charAt(0).toUpperCase() + A[i][0].slice(1);
  return "";
}
