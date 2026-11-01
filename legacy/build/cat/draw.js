/* Generic truck drawings by configuration — a side view facing left, all at one scale.
   Not any maker's design: no badge, no grille pattern, no lamp shapes — just cab, sleeper, roof, hood length,
   axles, front-axle position and body, so a card shows the configuration it stands for. */
var TD_N = 0;
function tdMix(hex, t){   /* t > 0 toward white, t < 0 toward black */
  var n = parseInt(hex.slice(1), 16), r = n >> 16, g = (n >> 8) & 255, b = n & 255, k = t < 0 ? 0 : 255, a = Math.abs(t);
  var f = function(c){ return Math.round(c + (k - c) * a); };
  return '#' + ((1 << 24) | (f(r) << 16) | (f(g) << 8) | f(b)).toString(16).slice(1);
}
function truckSVG(o){
  var id = 'td' + (++TD_N), G = 140, x0 = 16;
  var voc = o.kind === 'voc', ah = o.kind === 'ah', vt = o.kind === 'vt';
  var a = o.a || 0, H = o.H || 98, R = voc ? 18.5 : 17, lift = voc ? 5 : 0;
  var paint = o.paint || '#B9BDC0', dark = tdMix(paint, -0.35), deep = tdMix(paint, -0.55), hi = tdMix(paint, 0.35);
  var trim = o.trim || 'chrome', rim = trim === 'black' ? '#2B2B2A' : trim === 'gray' ? '#9AA0A4' : '#D3D6D8', bump = trim === 'black' ? '#262625' : trim === 'gray' ? '#8C9195' : '#C9CDD0';
  var by = 122 - lift;                         /* body bottom */
  var fx = x0 + (o.fwd ? 27 : 47);             /* front axle */
  var xw = x0 + H;                             /* windshield base */
  var ws = [12, 16, 20, 24][a];                /* windshield rake */
  var roofY = ah ? 60 : voc ? 44 : 46;
  var cabLen = voc ? 44 : 46, xc = xw + cabLen;
  var SL = { 0: 0, 42: 30, 61: 42, 62: 43, 70: 48, 74: 51, 77: 55 }[o.cab || 0] || 0, xs = xc + SL;
  var topY = !o.cab ? roofY : o.roof === 'high' ? (ah ? 44 : 17) : o.roof === 'mid' ? (ah ? 50 : 31) : roofY - 2;
  var n = { '4x2': 1, '6x2': 2, '6x4': 2, '8x4': 3, '8x6': 3 }[o.ax || '6x4'] || 2, sp = 2 * R + 2;
  var truck = o.body === 'truck';
  var ra1 = Math.max(xs + (truck ? 70 : 40), fx + (truck ? 190 : 150));
  var rear = []; for(var i = 0; i < n; i++) rear.push(ra1 + i * sp);
  var xe = rear[n - 1] + R + (truck ? 26 : 18);
  var hfy = [84, 86, 89, 92][a] - (voc ? 8 : 0) + (ah ? 6 : 0), hby = [76, 76, 75, 74][a] - (voc ? 4 : 0) + (ah ? 6 : 0);
  var gr = [1, 2, 4, 7][a];
  var W = 400, dx = Math.round((W - (xe - x0) - 2 * x0) / 2);
  var s = [];
  var P = function(t){ s.push(t); };
  /* shadow */
  P('<ellipse cx="' + ((x0 + xe) / 2) + '" cy="' + (G + 1.5) + '" rx="' + ((xe - x0) / 2 + 6) + '" ry="3.4" fill="url(#' + id + 's)"/>');
  /* frame */
  P('<rect x="' + (x0 + 10) + '" y="' + (by - 9) + '" width="' + (xe - x0 - 10) + '" height="8" rx="1.5" fill="#2A2A29"/>');
  /* the body: hood, cab, roof / fairing, sleeper */
  var wy = function(Y){ var t = (Y - hby) / (roofY - hby); return xw + ws * t; };
  var d = 'M' + (x0 + 2) + ',' + (by - 14) + ' L' + (x0 + 2 + gr) + ',' + (hfy + 5) + ' Q' + (x0 + 3 + gr) + ',' + hfy + ' ' + (x0 + 14 + gr) + ',' + (hfy - 1.5)
    + ' L' + (xw - 2) + ',' + hby + ' L' + (xw + ws) + ',' + (roofY + 3) + ' Q' + (xw + ws + 1.5) + ',' + roofY + ' ' + (xw + ws + 7) + ',' + roofY;
  if(topY < roofY - 3){
    var fr = o.roof === 'high' ? [26, 30, 36, 40][a] : [18, 20, 24, 26][a];
    d += ' L' + (xw + ws + 9) + ',' + roofY + ' C' + (xw + ws + 9 + fr * 0.55) + ',' + roofY + ' ' + (xw + ws + 9 + fr * 0.55) + ',' + topY + ' ' + (xw + ws + 9 + fr) + ',' + topY;
  }
  d += ' L' + (xs - 7) + ',' + topY + ' Q' + xs + ',' + topY + ' ' + xs + ',' + (topY + 7) + ' L' + xs + ',' + (by - 7);
  var ar = R + 4, ady = (G - R) - (by - 6), adx = Math.sqrt(Math.max(0, ar * ar - ady * ady));
  d += ' L' + (fx + adx) + ',' + (by - 6) + ' A' + ar + ' ' + ar + ' 0 0 0 ' + (fx - adx) + ',' + (by - 6) + ' L' + (x0 + 2) + ',' + (by - 6) + ' Z';
  P('<path d="' + d + '" fill="url(#' + id + 'b)" stroke="' + deep + '" stroke-width=".8" stroke-linejoin="round"/>');
  /* the front wheel well */
  P('<path d="M' + (fx - adx) + ',' + (by - 6) + ' A' + ar + ' ' + ar + ' 0 0 1 ' + (fx + adx) + ',' + (by - 6) + ' Z" fill="#161615"/>');
  /* roof seam where the fairing meets the cab, and the cab's back edge on a sleeper */
  if(SL){ P('<path d="M' + xc + ',' + (roofY + 2) + ' L' + xc + ',' + (by - 8) + '" stroke="' + dark + '" stroke-width=".7" opacity=".55"/>'); }
  /* hood line and fender */
  P('<path d="M' + (x0 + 16 + gr) + ',' + (hfy + 9) + ' L' + (xw - 4) + ',' + (hby + 11) + '" stroke="' + hi + '" stroke-width="1.2" opacity=".7"/>');
  if(o.stripe) P('<path d="M' + (x0 + 18 + gr) + ',' + (hfy + 13) + ' L' + (xs - 4) + ',' + (hby + 15) + '" stroke="' + o.stripe + '" stroke-width="1.6"/>');
  /* nose: a darker edge and a lamp */
  P('<path d="M' + (x0 + 2) + ',' + (by - 14) + ' L' + (x0 + 2 + gr) + ',' + (hfy + 5) + '" stroke="' + deep + '" stroke-width="3" stroke-linecap="round"/>');
  P('<rect x="' + (x0 + 5 + gr * 0.6) + '" y="' + (hfy + 8) + '" width="12" height="4.5" rx="2.2" fill="#F4F1E8" stroke="' + dark + '" stroke-width=".5"/>');
  /* door and windows */
  var dy0 = roofY + 4, dx0 = wy(dy0) + 1;
  P('<path d="M' + dx0 + ',' + dy0 + ' L' + (xc - 3) + ',' + dy0 + ' L' + (xc - 3) + ',' + (by - 8) + ' L' + (wy(by - 8) + 3) + ',' + (by - 8) + '" fill="none" stroke="' + dark + '" stroke-width=".8" opacity=".8"/>');
  var gy0 = roofY + 6, gy1 = roofY + (ah ? 18 : 23);
  P('<path d="M' + (wy(gy0) + 3) + ',' + gy0 + ' L' + (xc - 7) + ',' + gy0 + ' Q' + (xc - 6) + ',' + gy0 + ' ' + (xc - 6) + ',' + (gy0 + 2) + ' L' + (xc - 6) + ',' + gy1 + ' L' + (wy(gy1) + 3) + ',' + gy1 + ' Z" fill="url(#' + id + 'g)"/>');
  P('<path d="M' + (wy(gy0) - 2) + ',' + (gy0 - 1) + ' L' + (wy(hby - 3) - 1) + ',' + (hby - 3) + '" stroke="#1E2328" stroke-width="2.4" stroke-linecap="round" opacity=".85"/>');
  if(SL >= 42 && o.roof !== 'flat'){ P('<rect x="' + (xc + SL * 0.3) + '" y="' + (roofY + 9) + '" width="' + Math.min(14, SL * 0.32) + '" height="7" rx="2.5" fill="url(#' + id + 'g)"/>'); }
  /* mirror */
  P('<rect x="' + (wy(roofY + 8) - 7) + '" y="' + (roofY + 7) + '" width="3.6" height="15" rx="1.4" fill="#2A2C2E"/><path d="M' + (wy(roofY + 8) - 3.4) + ',' + (roofY + 14) + ' L' + (wy(roofY + 14) + 1) + ',' + (roofY + 14) + '" stroke="#2A2C2E" stroke-width="1.2"/>');
  /* cab extender at the back */
  P('<path d="M' + (xs - 2.5) + ',' + (topY + 9) + ' L' + (xs + 3.5) + ',' + (topY + 13) + ' L' + (xs + 3.5) + ',' + (by - 16) + ' L' + (xs - 2.5) + ',' + (by - 12) + ' Z" fill="' + dark + '" opacity=".9"/>');
  /* under the cab: tank or batteries, skirt, steps */
  var t0 = fx + R + 8, t1 = Math.max(t0 + 26, xc - 24);
  if(o.ev){
    var b1 = rear[0] - R - 8, bw = (b1 - t0 - 4) / 2;
    for(var k = 0; k < 2; k++){ var bx = t0 + k * (bw + 4); P('<rect x="' + bx + '" y="' + (by - 13) + '" width="' + bw + '" height="20" rx="3" fill="#3A4350" stroke="#262D35" stroke-width=".8"/><path d="M' + (bx + bw / 2 + 1.5) + ',' + (by - 9) + ' l-4,7 h3.2 l-1.6,6 l5,-8 h-3.4 z" fill="#E8D7A9"/>'); }
  } else if(!(a >= 2 && !voc && !ah && !vt)){
    P('<rect x="' + t0 + '" y="' + (by - 12) + '" width="' + (t1 - t0) + '" height="17" rx="7" fill="url(#' + id + 'c)" stroke="#8B9094" stroke-width=".6"/>');
  }
  if(a >= 2 && !voc && !ah && !vt && !o.ev){
    var k1 = rear[0] - R - 6;
    P('<path d="M' + (t0 - 2) + ',' + (by - 11) + ' L' + k1 + ',' + (by - 11) + ' L' + k1 + ',' + (by + 6 + a * 2) + ' Q' + k1 + ',' + (by + 9 + a * 2) + ' ' + (k1 - 3) + ',' + (by + 9 + a * 2) + ' L' + (t0 + 1) + ',' + (by + 9 + a * 2) + ' Q' + (t0 - 2) + ',' + (by + 9 + a * 2) + ' ' + (t0 - 2) + ',' + (by + 6 + a * 2) + ' Z" fill="url(#' + id + 'k)" stroke="' + deep + '" stroke-width=".6"/>');
  }
  P('<g fill="#3B3D3F"><rect x="' + (xc - 21) + '" y="' + (by - 5) + '" width="14" height="3" rx="1"/><rect x="' + (xc - 21) + '" y="' + (by + 2) + '" width="14" height="3" rx="1"/></g>');
  /* exhaust */
  var stack = !o.ev && (a <= 1 || vt || voc || ah || o.stack);
  if(stack){
    var sx = SL ? xs + 5 : xc + 4, sTop = Math.min(topY, roofY) - (SL ? 3 : 10);
    var st = function(x, op){ P('<rect x="' + x + '" y="' + sTop + '" width="4.2" height="' + (by - 6 - sTop) + '" rx="2" fill="' + (trim === 'black' ? '#2A2A29' : 'url(#' + id + 'c)') + '" opacity="' + op + '"/><rect x="' + (x - 1) + '" y="' + (sTop + 16) + '" width="6.2" height="22" rx="2" fill="' + (trim === 'black' ? '#333' : '#B4B9BC') + '" opacity="' + op + '"/>'); };
    if(vt) st(sx + 6, .6); st(sx, 1);
  }
  /* auto hauler head rack */
  if(ah){
    var hy = roofY - 20;
    P('<g fill="#4F555A"><path d="M' + (xw - 22) + ',' + (hy + 6) + ' L' + (xw - 14) + ',' + hy + ' L' + (xs + 48) + ',' + hy + ' L' + (xs + 48) + ',' + (hy + 6) + ' Z"/><rect x="' + (xw - 8) + '" y="' + (hy + 6) + '" width="3" height="' + (hby - hy - 6) + '"/>'
      + '<rect x="' + (xs + 6) + '" y="' + (hy + 6) + '" width="3.6" height="' + (by - 14 - hy) + '"/><rect x="' + (xs + 40) + '" y="' + (hy + 6) + '" width="3.6" height="' + (by - 14 - hy) + '"/>'
      + '<path d="M' + (xs + 9) + ',' + (hy + 8) + ' L' + (xs + 40) + ',' + (by - 18) + '" stroke="#4F555A" stroke-width="2"/></g>'
      + '<path d="M' + (xw - 13) + ',' + (hy + 1.5) + ' L' + (xs + 47) + ',' + (hy + 1.5) + '" stroke="#8A9196" stroke-width="1"/>');
  }
  /* body on a straight truck, fifth wheel on a tractor */
  if(truck){
    var bx0 = xs + 7, bx1 = xe - 2, bt = 54 - lift;
    P('<path d="M' + bx0 + ',' + (by - 10) + ' L' + bx0 + ',' + (bt + 10) + ' L' + (bx0 + 8) + ',' + bt + ' L' + bx1 + ',' + (bt + 6) + ' L' + bx1 + ',' + (by - 10) + ' Z" fill="url(#' + id + 'd)" stroke="#2E3133" stroke-width=".8"/>');
    for(var q = 1; q < 5; q++){ var qx = bx0 + (bx1 - bx0) * q / 5; P('<path d="M' + qx + ',' + (bt + 3 + q) + ' L' + qx + ',' + (by - 11) + '" stroke="#2E3133" stroke-width="1" opacity=".5"/>'); }
  } else {
    var fw = n > 1 ? rear[0] + sp / 2 - 15 : rear[0] - 15;
    P('<path d="M' + fw + ',' + (by - 9) + ' L' + (fw + 4) + ',' + (by - 14) + ' L' + (fw + 28) + ',' + (by - 14) + ' L' + (fw + 31) + ',' + (by - 9) + ' Z" fill="#333536"/><rect x="' + (fw + 3) + '" y="' + (by - 15.5) + '" width="26" height="2" rx="1" fill="#55585A"/>');
  }
  /* mud flap and tail lamp */
  P('<rect x="' + (rear[n - 1] + R + 4) + '" y="' + (by - 6) + '" width="3" height="' + (G - 3 - (by - 6)) + '" rx="1" fill="#1F1F1E"/><rect x="' + (xe - 4) + '" y="' + (by - 9) + '" width="4" height="3" rx="1" fill="#B9473A"/>');
  /* bumper */
  P('<rect x="' + (x0 - (voc ? 6 : 3)) + '" y="' + (by - (voc ? 20 : 17)) + '" width="' + (voc ? 19 : 15) + '" height="' + (voc ? 20 : 17) + '" rx="3.5" fill="' + bump + '" stroke="' + (trim === 'black' ? '#111' : '#8F9497') + '" stroke-width=".6"/>');
  /* wheels */
  var wheel = function(x, dual){ var cy = G - R;
    P('<circle cx="' + x + '" cy="' + cy + '" r="' + R + '" fill="#1C1C1B" stroke="#55534F" stroke-width=".9"/><circle cx="' + x + '" cy="' + cy + '" r="' + (R - 3) + '" fill="none" stroke="#2E2E2D" stroke-width="1"/>'
      + '<circle cx="' + x + '" cy="' + cy + '" r="' + (R * 0.57) + '" fill="' + rim + '"/><circle cx="' + x + '" cy="' + cy + '" r="' + (R * 0.57) + '" fill="url(#' + id + 'r)"/>'
      + (dual ? '<circle cx="' + x + '" cy="' + cy + '" r="' + (R * 0.43) + '" fill="none" stroke="' + tdMix(rim, -0.3) + '" stroke-width="1"/>' : '')
      + '<circle cx="' + x + '" cy="' + cy + '" r="' + (R * 0.2) + '" fill="' + tdMix(rim, -0.35) + '"/>'); };
  wheel(fx, false); rear.forEach(function(x){ wheel(x, true); });
  var defs = '<defs><linearGradient id="' + id + 'b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + hi + '"/><stop offset=".42" stop-color="' + paint + '"/><stop offset="1" stop-color="' + dark + '"/></linearGradient>'
    + '<linearGradient id="' + id + 'k" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + dark + '"/><stop offset="1" stop-color="' + deep + '"/></linearGradient>'
    + '<linearGradient id="' + id + 'g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4A5560"/><stop offset="1" stop-color="#1B2026"/></linearGradient>'
    + '<linearGradient id="' + id + 'c" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F2F4F5"/><stop offset=".5" stop-color="#B8BDC1"/><stop offset="1" stop-color="#7F858A"/></linearGradient>'
    + '<linearGradient id="' + id + 'd" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7E8489"/><stop offset="1" stop-color="#4D5257"/></linearGradient>'
    + '<radialGradient id="' + id + 'r" cx=".4" cy=".35" r=".7"><stop offset="0" stop-color="#fff" stop-opacity=".5"/><stop offset="1" stop-color="#000" stop-opacity=".25"/></radialGradient>'
    + '<radialGradient id="' + id + 's"><stop offset="0" stop-color="#000" stop-opacity=".28"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient></defs>';
  return '<svg class="td" viewBox="6 10 ' + (W - 12) + ' 136" role="img" aria-label="' + (o.label || 'Truck drawing') + '">' + defs + '<g transform="translate(' + dx + ',0)">' + s.join('') + '</g></svg>';
}
if(typeof module !== 'undefined') module.exports = { truckSVG: truckSVG };
