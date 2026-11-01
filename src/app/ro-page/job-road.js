/* Parsec · ro-page · job-road.js
   The job road: the small animated scene under an open job card (truck, road, sky by time of day) — RD_SCENES and the SVG builders; ROAD_CSS is appended to JC_CSS.
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   rdX rdRep rdL rdWheels rdTruck rdOutline rdBeam rdStars rdBand rdHair RD_T RD_A … (10 functions, 18 constants)
   at load    wraps JC_CSS
*/
/* ============================== JOB ROAD ==============================
   A small animated road under the open job card's head. The truck stands at the
   job's step (Diagnose, Parts, Repair, Road test, Done), drives while the job's
   clock runs, and parks with blinking hazards while it waits. The scene button
   cycles through the road scenes; the choice is remembered on this device.
   Scenery and lane lines move right-to-left, opposite the truck. */
var RD_T = '#14a3a0', RD_A = '#e8b65a', RD_N = '#5b6ee1', RD_G = '#7fb38c';
var RD_IN = 'var(--inset)', RD_SF = 'var(--surface)', RD_INK = 'var(--ink)', RD_INK2 = 'var(--ink-2)', RD_MU = 'var(--muted)', RD_LN = 'var(--line-2)';
function rdX(i) { return 12 + i * 144; }
function rdRep(w, f) { var s = ''; for (var i = -1; i < Math.ceil(600 / w) + 1; i++) s += f(i * w, i); return s; }
function rdL(w, d, f, cls) { return '<g class="' + (cls || 'ly') + '" style="--w:-' + w + 'px;animation-duration:' + d + 's">' + rdRep(w, f) + '</g>'; }
function rdWheels(c, s) {
  return [8, 26, 45].map(function (x) {
    return '<g class="wh"><circle cx="' + x + '" cy="33" r="3.6" fill="' + c + '"/><line x1="' + x + '" y1="30.6" x2="' + x + '" y2="35.4" stroke="' + s + '" stroke-width="1"/></g>';
  }).join('');
}
function rdTruck(c1, c2, wc, ws, win, puffs) {
  return '<g class="bob">' +
    (puffs ? '<circle class="puff" cx="-2" cy="20" r="3" fill="' + RD_MU + '"/><circle class="puff" style="animation-delay:.6s" cx="-2" cy="20" r="3" fill="' + RD_MU + '"/>' : '') +
    '<rect x="0" y="16" width="34" height="15" rx="3" fill="' + c1 + '"/><rect x="36" y="20" width="15" height="11" rx="3.5" fill="' + c2 + '"/>' +
    '<path d="M43 21.5h5.5a1.5 1.5 0 0 1 1.5 1.5v3h-7z" fill="' + (win || '#dbe4ff') + '" opacity=".9"/><rect x="33" y="27" width="5" height="2" fill="' + c2 + '"/>' +
    '<circle class="haz" cx="51.5" cy="28" r="1.8" fill="' + RD_A + '"/><circle class="haz" cx="1" cy="28" r="1.8" fill="' + RD_A + '"/></g>' +
    rdWheels(wc || RD_INK2, ws || RD_SF);
}
var RD_STD = function () { return rdTruck(RD_T, RD_N); };
var RD_NIGHT = function () { return rdTruck('#3fb8b5', '#8193f0', '#0f1626', '#5d6b8a'); };
var RD_SIL = function (win) { return rdTruck(RD_INK, RD_INK, RD_INK, RD_SF, win); };
function rdOutline(c) {
  return '<g class="bob" fill="none" stroke="' + c + '" stroke-width="1.3"><rect x="0.6" y="16.6" width="33" height="14" rx="3"/><rect x="36.6" y="20.6" width="14" height="10" rx="3.5"/><path d="M43 22h5a1.5 1.5 0 0 1 1.5 1.5V26H43z"/><circle class="haz" cx="51.5" cy="28" r="1.8" fill="' + RD_A + '" stroke="none"/></g>' +
    [8, 26, 45].map(function (x) { return '<g class="wh"><circle cx="' + x + '" cy="33" r="3.2" fill="#141b2d" stroke="' + c + '" stroke-width="1.3"/><line x1="' + x + '" y1="30.8" x2="' + x + '" y2="35.2" stroke="' + c + '" stroke-width=".8"/></g>'; }).join('');
}
function rdBeam(c, o) { return '<polygon class="beam" points="52,26 132,18 132,40" fill="' + (c || '#fff4cf') + '" opacity="' + (o || .22) + '"/>'; }
function rdStars(n) {
  var s = ''; for (var i = 0; i < n; i++) s += '<circle class="tw" style="animation-delay:' + ((i * .37) % 3).toFixed(2) + 's" cx="' + ((i * 97) % 600) + '" cy="' + (3 + (i * 23) % 24) + '" r="' + (i % 3 ? .8 : 1.2) + '" fill="#fff"/>';
  return s;
}
function rdBand(c, dash, dsh) {
  return '<rect x="0" y="50" width="600" height="14" fill="' + c + '"/><rect class="trail" x="0" y="50" width="600" height="14" fill="' + RD_T + '" opacity=".25"/>' +
    '<line class="mv" x1="0" y1="57" x2="600" y2="57" stroke="' + (dash || RD_SF) + '" stroke-width="1.4" stroke-dasharray="' + (dsh || '11 11') + '" stroke-linecap="round"/>';
}
function rdHair(c) { return '<line x1="0" y1="50" x2="600" y2="50" stroke="' + (c || RD_INK2) + '" stroke-width="1.4"/><rect class="trail" x="0" y="49" width="600" height="2.6" rx="1.3" fill="' + RD_T + '"/>'; }
var RD_CURVE = 'M10 52C80 52 90 22 160 22S240 52 300 52 380 22 450 22 520 52 590 52';
var RD_SKY = ['#cfe8f5', '#bfe0f0', '#f5d9a8', '#e9a77d', '#2a3352'];

/* each scene: key, name, bg(uid) = scenery + road + .trail, truck(), optional beam,
   stop(i, colour, svg), mode ('move' | 'curve' | 'fixed'), ty = truck lift */
var RD_SCENES = [
  { key: 'day', name: 'Day passes', bg: function () {
      return '<rect class="sky" width="600" height="64" fill="' + RD_SKY[0] + '"/><circle class="cel" cx="0" cy="0" r="8" fill="' + RD_A + '"/>' +
        rdL(150, 24, function (o) { return '<path d="M' + o + ' 50q40-16 75-6t75 6z" fill="' + RD_G + '" opacity=".45"/>'; }) + rdHair(); },
    truck: RD_STD, beam: rdBeam('#fff4cf', .2) },
  { key: 'classic', name: 'Classic', bg: function () { return rdBand(RD_IN); }, truck: function () { return rdTruck(RD_T, RD_N, null, null, null, true); } },
  { key: 'hair', name: 'Hairline highway', bg: function () {
      return '<line x1="0" y1="50" x2="600" y2="50" stroke="' + RD_LN + '" stroke-width="1.2"/><rect class="trail" x="0" y="49" width="600" height="2.4" rx="1.2" fill="' + RD_T + '"/>'; },
    truck: function () { return rdTruck(RD_INK2, RD_INK); },
    beam: rdBeam(RD_A, .18) + '<g class="spd" stroke="' + RD_MU + '" stroke-width="1.2" stroke-linecap="round" stroke-dasharray="6 10"><line x1="-24" y1="20" x2="-4" y2="20"/><line x1="-30" y1="25" x2="-4" y2="25"/></g>',
    stop: function (i, c) { return '<line x1="' + rdX(i) + '" y1="45" x2="' + rdX(i) + '" y2="55" stroke="' + c + '" stroke-width="2" stroke-linecap="round"/>'; } },
  { key: 'parallax', name: 'Parallax scene', bg: function () {
      return '<rect width="600" height="64" fill="' + RD_T + '" opacity=".07"/>' +
        rdL(150, 40, function (o) { return '<ellipse cx="' + (o + 40) + '" cy="11" rx="16" ry="4.5" fill="' + RD_SF + '" opacity=".6"/>'; }) +
        rdL(300, 24, function (o) { return '<path d="M' + o + ' 52C' + (o + 50) + ' 30 ' + (o + 100) + ' 30 ' + (o + 150) + ' 46S' + (o + 250) + ' 28 ' + (o + 300) + ' 52Z" fill="' + RD_G + '" opacity=".45"/>'; }) +
        rdL(60, 4, function (o) { return '<line x1="' + (o + 20) + '" y1="44" x2="' + (o + 20) + '" y2="50" stroke="' + RD_MU + '" stroke-width="1.4"/><circle cx="' + (o + 20) + '" cy="40" r="5.5" fill="' + RD_T + '" opacity=".55"/>'; }) +
        rdBand(RD_IN); }, truck: RD_STD },
  { key: 'top', name: 'Top-down lane', ty: 17, bg: function () {
      return '<rect x="6" y="22" width="588" height="32" rx="16" fill="' + RD_IN + '"/><rect class="trail" x="6" y="22" width="588" height="32" rx="16" fill="' + RD_T + '" opacity=".2"/>' +
        '<line class="mv" style="--o:28px" x1="20" y1="38" x2="580" y2="38" stroke="' + RD_SF + '" stroke-width="1.6" stroke-dasharray="14 14" stroke-linecap="round"/>'; },
    truck: function () {
      var w = ''; [8, 16, 24].forEach(function (x) { w += '<line x1="' + x + '" y1="16" x2="' + x + '" y2="26" stroke="#fff" stroke-width=".8" opacity=".4"/>'; });
      return '<g class="drift"><rect x="2" y="13" width="30" height="16" rx="2.5" fill="' + RD_T + '"/>' + w +
        '<rect x="34" y="13.5" width="11" height="15" rx="3.5" fill="' + RD_N + '"/><rect x="40" y="15" width="3.5" height="12" rx="1.5" fill="#dbe4ff" opacity=".9"/>' +
        '<rect x="36" y="11" width="2.4" height="2.5" rx=".8" fill="' + RD_N + '"/><rect x="36" y="28.5" width="2.4" height="2.5" rx=".8" fill="' + RD_N + '"/>' +
        '<circle class="haz" cx="45" cy="15" r="1.5" fill="' + RD_A + '"/><circle class="haz" cx="45" cy="27" r="1.5" fill="' + RD_A + '"/><circle class="haz" cx="2.5" cy="15" r="1.5" fill="' + RD_A + '"/><circle class="haz" cx="2.5" cy="27" r="1.5" fill="' + RD_A + '"/></g>'; },
    stop: function (i, c) { var s = ''; for (var j = 0; j < 4; j++) s += '<rect x="' + (rdX(i) - 1) + '" y="' + (25 + j * 6.5) + '" width="2.4" height="4" rx="1" fill="' + c + '"/>'; return s; } },
  { key: 'night', name: 'Night drive', bg: function () {
      return '<rect width="600" height="64" fill="#1d2840"/>' + rdStars(26) +
        '<path d="M0 44C80 34 140 38 220 42S380 32 460 40 560 36 600 40V64H0z" fill="#26324d"/>' + rdBand('#2f3c5a', RD_A, '4 18'); },
    truck: RD_NIGHT, beam: rdBeam() },
  { key: 'winding', name: 'Winding road', mode: 'curve', bg: function () {
      return '<path d="' + RD_CURVE + '" fill="none" stroke="' + RD_IN + '" stroke-width="10" stroke-linecap="round"/>' +
        '<path class="trail" d="' + RD_CURVE + '" pathLength="100" stroke-dasharray="100 100" stroke-dashoffset="100" fill="none" stroke="' + RD_T + '" stroke-opacity=".35" stroke-width="10" stroke-linecap="round"/>' +
        '<path class="mv" d="' + RD_CURVE + '" fill="none" stroke="' + RD_SF + '" stroke-width="1.3" stroke-dasharray="11 11"/><path class="rdCv" d="' + RD_CURVE + '" fill="none"/>'; },
    truck: RD_STD },
  { key: 'sunset', name: 'Sunset horizon', bg: function () {
      var st = ''; [30, 36, 42].forEach(function (y, i) { st += '<rect x="430" y="' + y + '" width="80" height="' + (1.2 + i * .4) + '" fill="' + RD_SF + '" opacity=".7"/>'; });
      return '<rect width="600" height="64" fill="' + RD_A + '" opacity=".1"/><circle cx="470" cy="50" r="26" fill="' + RD_A + '" opacity=".45"/>' + st +
        rdL(100, 30, function (o) { return '<path d="M' + o + ' 50q25-10 50-4t50 4V64H' + o + 'z" fill="' + RD_MU + '" opacity=".18"/>'; }) + rdHair(); },
    truck: function () { return RD_SIL(); } },
  { key: 'odo', name: 'Odometer', bg: function () {
      return '<rect x="7" y="51" width="586" height="6" rx="3" fill="' + RD_IN + '"/><rect class="trail" x="7" y="51" width="586" height="6" rx="3" fill="' + RD_T + '" opacity=".5"/>'; },
    truck: function () {
      return '<g transform="translate(6 -13)"><rect width="40" height="13" rx="6.5" fill="' + RD_SF + '" stroke="' + RD_LN + '" stroke-width=".8"/><text class="odo" x="20" y="9.5" font-size="9" text-anchor="middle" fill="' + RD_INK + '" font-family="var(--font-mono)">0%</text></g>' + RD_STD(); },
    stopY: 54 },
  { key: 'bridge', name: 'Bridge crossing', ty: 3, bg: function () {
      var a = ''; for (var i = 0; i < 4; i++) a += '<path d="M' + rdX(i) + ' 42Q' + (rdX(i) + 72) + ' 70 ' + rdX(i + 1) + ' 42" fill="none" stroke="' + RD_LN + '" stroke-width="1.4"/>';
      return a + '<g opacity=".6"><line class="mv" style="animation-duration:2.4s" x1="0" y1="58" x2="600" y2="58" stroke="' + RD_T + '" stroke-width="1.2" stroke-dasharray="8 14" stroke-linecap="round"/><line class="mv" style="animation-duration:1.6s" x1="10" y1="62" x2="600" y2="62" stroke="' + RD_T + '" stroke-width="1" stroke-dasharray="5 17" stroke-linecap="round"/></g>' +
        '<rect x="6" y="40" width="588" height="4" rx="2" fill="' + RD_INK2 + '" opacity=".5"/><rect class="trail" x="6" y="40" width="588" height="4" rx="2" fill="' + RD_T + '"/>'; },
    truck: RD_STD,
    stop: function (i, c) { return '<line x1="' + rdX(i) + '" y1="42" x2="' + rdX(i) + '" y2="64" stroke="' + RD_LN + '" stroke-width="2"/><circle cx="' + rdX(i) + '" cy="42" r="3.4" fill="' + c + '"/>'; } },
  { key: 'cargo', name: 'Cargo meter', mode: 'fixed', bg: function () {
      return rdL(100, 6, function (o) { return '<line x1="' + o + '" y1="14" x2="' + o + '" y2="22" stroke="' + RD_MU + '" stroke-width="1.2" opacity=".5"/><circle cx="' + (o + 50) + '" cy="16" r="4" fill="' + RD_G + '" opacity=".5"/>'; }) +
        '<line x1="6" y1="57" x2="594" y2="57" stroke="' + RD_IN + '" stroke-width="8" stroke-linecap="round"/><line class="mv" x1="10" y1="57" x2="590" y2="57" stroke="' + RD_SF + '" stroke-width="1.3" stroke-dasharray="11 11"/>' +
        '<g transform="translate(220 -2) scale(1.5)"><rect x="0" y="16" width="34" height="15" rx="3" fill="' + RD_IN + '" stroke="' + RD_T + '" stroke-width=".8"/><rect class="trail" x="0" y="16" width="34" height="15" rx="3" fill="' + RD_T + '"/><g class="stops"></g>' +
        '<g class="bob"><rect x="36" y="20" width="15" height="11" rx="3.5" fill="' + RD_N + '"/><path d="M43 21.5h5.5a1.5 1.5 0 0 1 1.5 1.5v3h-7z" fill="#dbe4ff"/><rect x="33" y="27" width="5" height="2" fill="' + RD_N + '"/><circle class="haz" cx="51.5" cy="28" r="1.8" fill="' + RD_A + '"/></g>' + rdWheels(RD_INK2, RD_SF) + '</g>' +
        '<text class="cargo" x="320" y="40" font-size="12" fill="' + RD_INK2 + '"></text>'; },
    truck: function () { return ''; },
    stop: function (i, c) { return i && i < 4 ? '<line x1="' + (i * 8.5) + '" y1="17" x2="' + (i * 8.5) + '" y2="30" stroke="' + RD_SF + '" stroke-width=".6"/>' : ''; } },
  { key: 'dawn', name: 'Dawn hairline', bg: function () {
      return '<rect width="600" height="64" fill="#f2b8a2" opacity=".22"/><circle cx="110" cy="50" r="16" fill="#f2a97a" opacity=".45"/>' +
        rdL(150, 30, function (o) { return '<path d="M' + o + ' 50q40-14 75-6t75 6z" fill="' + RD_MU + '" opacity=".15"/>'; }) + rdHair(); },
    truck: function () { return RD_SIL('#f2b8a2'); } },
  { key: 'desert', name: 'Desert dusk', bg: function () {
      return '<rect width="600" height="64" fill="#e9b97a" opacity=".18"/>' +
        rdL(220, 34, function (o) { return '<path d="M' + o + ' 50V36h18l6-6h40l6 6h10v14z" fill="#c98a5a" opacity=".3"/>'; }) +
        rdL(110, 5, function (o) { return '<path d="M' + (o + 30) + ' 50V38M' + (o + 30) + ' 44h-4v-4M' + (o + 30) + ' 42h4v-5" stroke="' + RD_G + '" stroke-width="2.4" stroke-linecap="round" fill="none"/>'; }) + rdBand(RD_IN); },
    truck: RD_STD, beam: rdBeam(RD_A, .18) },
  { key: 'city', name: 'City night', bg: function () {
      var win = [[4, 26], [12, 32], [30, 16], [36, 26], [54, 32], [66, 36], [88, 22], [94, 34]];
      return '<rect width="600" height="64" fill="#1d2840"/>' + rdStars(10) +
        rdL(160, 16, function (o) {
          return '<rect x="' + o + '" y="22" width="22" height="28" fill="#2a3758"/><rect x="' + (o + 26) + '" y="12" width="18" height="38" fill="#26324f"/><rect x="' + (o + 48) + '" y="28" width="30" height="22" fill="#2a3758"/><rect x="' + (o + 84) + '" y="18" width="20" height="32" fill="#26324f"/>' +
            win.map(function (w) { return '<rect x="' + (o + w[0]) + '" y="' + w[1] + '" width="3" height="3" fill="#f5d58a" opacity=".7"/>'; }).join(''); }) +
        rdL(120, 4, function (o) { return '<line x1="' + o + '" y1="50" x2="' + o + '" y2="24" stroke="#56658a" stroke-width="1.4"/><path d="M' + o + ' 24h7" stroke="#56658a" stroke-width="1.4"/><circle cx="' + (o + 7) + '" cy="26" r="5" fill="#fff4cf" opacity=".18"/><circle cx="' + (o + 7) + '" cy="25.5" r="1.6" fill="#fff4cf"/>'; }) +
        rdBand('#2f3c5a', RD_A, '4 18'); },
    truck: RD_NIGHT, beam: rdBeam() },
  { key: 'rain', name: 'Rainy night', bg: function () {
      var r = ''; for (var i = 0; i < 60; i++) r += '<line x1="' + ((i * 53) % 610) + '" y1="' + (-22 + (i * 17) % 80) + '" x2="' + ((i * 53) % 610 - 3) + '" y2="' + (-14 + (i * 17) % 80) + '" stroke="#a9c3e8" stroke-width=".8"/>';
      return '<rect width="600" height="64" fill="#1f2a3d"/>' + rdL(90, 6, function (o) { return '<path d="M' + o + ' 50l14-22 14 22z" fill="#2a3a52"/>'; }) +
        '<g class="rain" opacity=".45">' + r + '</g>' + rdBand('#2a374e', '#a9c3e8', '8 14'); },
    truck: RD_NIGHT, beam: rdBeam() + '<ellipse class="beam" cx="92" cy="38" rx="40" ry="3" fill="#fff4cf" opacity=".15"/>' },
  { key: 'snow', name: 'Snowy evening', bg: function () {
      var f = ''; for (var i = 0; i < 50; i++) f += '<circle cx="' + ((i * 67) % 620) + '" cy="' + (-34 + (i * 29) % 98) + '" r="' + (i % 2 ? 1 : 1.4) + '" fill="#fff" opacity=".85"/>';
      return '<rect width="600" height="64" fill="#9fb5d6" opacity=".25"/>' +
        rdL(70, 7, function (o) { return '<path d="M' + (o + 20) + ' 50l9-20 9 20z" fill="#5f8f8a" opacity=".55"/><path d="M' + (o + 50) + ' 50l6-13 6 13z" fill="#5f8f8a" opacity=".4"/>'; }) +
        '<g class="snow">' + f + '</g>' + rdBand(RD_IN); },
    truck: RD_STD },
  { key: 'coast', name: 'Coastal sunset', bg: function () {
      var sh = ''; [0, 1, 2].forEach(function (i) { sh += '<line x1="' + (425 - i * 4) + '" y1="' + (43 + i * 2.5) + '" x2="' + (455 + i * 4) + '" y2="' + (43 + i * 2.5) + '" stroke="' + RD_A + '" stroke-width="1.2" opacity=".7"/>'; });
      return '<rect width="600" height="64" fill="' + RD_A + '" opacity=".12"/><circle cx="440" cy="40" r="20" fill="' + RD_A + '" opacity=".5"/><rect x="0" y="40" width="600" height="10" fill="' + RD_T + '" opacity=".22"/><g class="tw">' + sh + '</g>' +
        rdL(60, 3, function (o) { return '<path d="M' + o + ' 47q7-2 14 0" stroke="#fff" stroke-width=".8" fill="none" opacity=".5"/>'; }) + rdHair(); },
    truck: function () { return RD_SIL('#f2c27f'); } },
  { key: 'moon', name: 'Moonlit ridges', bg: function () {
      return '<rect width="600" height="64" fill="#1b2338"/>' + rdStars(14) + '<circle cx="520" cy="14" r="7" fill="#f3efe0"/><circle cx="517" cy="12" r="1.4" fill="#d9d3bf"/>' +
        rdL(200, 40, function (o) { return '<path d="M' + o + ' 50L' + (o + 60) + ' 22 ' + (o + 110) + ' 40 ' + (o + 150) + ' 26 ' + (o + 200) + ' 50z" fill="#28324f"/>'; }) +
        rdL(140, 18, function (o) { return '<path d="M' + o + ' 50L' + (o + 40) + ' 32 ' + (o + 80) + ' 44 ' + (o + 110) + ' 34 ' + (o + 140) + ' 50z" fill="#323e60"/>'; }) +
        rdL(90, 7, function (o) { return '<path d="M' + o + ' 50q22-9 45-3t45 3z" fill="#3c4a70"/>'; }) + rdHair('#9aa7c7'); },
    truck: function () { return rdTruck('#c9d2ea', '#e6ebf7', '#0e1424', '#9aa7c7'); }, beam: rdBeam('#f3efe0', .15) },
  { key: 'fog', name: 'Foggy morning', bg: function () {
      return '<rect width="600" height="64" fill="#cfd8df" opacity=".35"/>' +
        rdL(80, 8, function (o) { return '<g opacity=".35"><line x1="' + (o + 20) + '" y1="50" x2="' + (o + 20) + '" y2="40" stroke="' + RD_MU + '" stroke-width="1.4"/><circle cx="' + (o + 20) + '" cy="35" r="7" fill="' + RD_G + '"/></g>'; }) +
        rdL(300, 26, function (o) { return '<ellipse cx="' + (o + 90) + '" cy="40" rx="90" ry="6" fill="#fff" opacity=".45"/><ellipse cx="' + (o + 240) + '" cy="30" rx="70" ry="5" fill="#fff" opacity=".35"/>'; }, 'amb') + rdHair(); },
    truck: RD_STD },
  { key: 'golden', name: 'Golden-hour fields', bg: function () {
      return '<rect width="600" height="64" fill="' + RD_A + '" opacity=".14"/>' +
        rdL(30, 10, function (o) { return '<line x1="' + o + '" y1="46" x2="' + (o + 12) + '" y2="46" stroke="' + RD_A + '" stroke-width="1.2" opacity=".5"/>'; }) +
        rdL(150, 5, function (o) { return '<line x1="' + o + '" y1="50" x2="' + o + '" y2="10" stroke="' + RD_MU + '" stroke-width="1.6"/><path d="M' + (o - 6) + ' 13h12" stroke="' + RD_MU + '" stroke-width="1.4"/><path d="M' + o + ' 13Q' + (o + 75) + ' 26 ' + (o + 150) + ' 13" stroke="' + RD_MU + '" stroke-width=".8" fill="none"/>'; }) + rdBand(RD_IN); },
    truck: RD_STD, beam: rdBeam(RD_A, .16) },
  { key: 'aurora', name: 'Aurora night', bg: function () {
      return '<rect width="600" height="64" fill="#15203a"/>' + rdStars(18) + '<g class="aur">' +
        rdL(300, 20, function (o) { return '<path d="M' + o + ' 22C' + (o + 50) + ' 6 ' + (o + 100) + ' 30 ' + (o + 150) + ' 16S' + (o + 250) + ' 4 ' + (o + 300) + ' 22" stroke="' + RD_T + '" stroke-width="6" fill="none" opacity=".7"/><path d="M' + o + ' 28C' + (o + 50) + ' 14 ' + (o + 100) + ' 34 ' + (o + 150) + ' 22S' + (o + 250) + ' 12 ' + (o + 300) + ' 28" stroke="' + RD_G + '" stroke-width="3" fill="none" opacity=".5"/>'; }, 'amb') +
        '</g>' + rdBand('#26324d', RD_A, '4 18'); },
    truck: RD_NIGHT, beam: rdBeam() },
  { key: 'neon', name: 'Neon line', bg: function () {
      return '<rect width="600" height="64" fill="#141b2d"/><line x1="0" y1="50" x2="600" y2="50" stroke="#34405e" stroke-width="1.2"/><line x1="0" y1="62" x2="600" y2="62" stroke="#34405e" stroke-width="1.2"/>' +
        '<rect class="trail" x="0" y="49.4" width="600" height="1.8" fill="' + RD_T + '"/><line class="mv" x1="0" y1="56" x2="600" y2="56" stroke="' + RD_N + '" stroke-width="1.2" stroke-dasharray="11 11" opacity=".7"/>'; },
    truck: function () { return rdOutline('#5fd4d0'); }, beam: rdBeam('#5fd4d0', .12) }
];

var ROAD_CSS = '\n' +
  '.rd { display: grid; grid-template-columns: 1fr auto; column-gap: 8px; align-items: center; padding: 2px 16px 8px; }\n' +
  '.rd svg { display: block; width: 100%; height: auto; grid-column: 1; grid-row: 1; }\n' +
  '.rd .trk { transition: transform 1.6s cubic-bezier(.45,.05,.25,1), offset-distance 1.6s cubic-bezier(.45,.05,.25,1); }\n' +
  '.rd .trail { transform-box: fill-box; transform-origin: left center; transition: transform 1.6s cubic-bezier(.45,.05,.25,1), stroke-dashoffset 1.6s cubic-bezier(.45,.05,.25,1); }\n' +
  '.rd .wh { transform-box: fill-box; transform-origin: center; animation: rdSpin .5s linear infinite; }\n' +
  '.rd .bob { animation: rdBob .45s ease-in-out infinite alternate; }\n' +
  '.rd .drift { animation: rdDrift 2.4s ease-in-out infinite alternate; }\n' +
  '.rd .ly, .rd .amb { animation: rdPan linear infinite; }\n' +
  '.rd .mv { animation: rdDash .9s linear infinite; }\n' +
  '.rd .spd { animation: rdDash .6s linear infinite; }\n' +
  '.rd .puff { opacity: 0; animation: rdPuff 1.2s ease-out infinite; }\n' +
  '.rd .tw { animation: rdTw 3s ease-in-out infinite; }\n' +
  '.rd .rain { animation: rdRain .6s linear infinite; }\n' +
  '.rd .snow { animation: rdSnow 5s linear infinite; }\n' +
  '.rd .aur { animation: rdAur 6s ease-in-out infinite alternate; }\n' +
  '.rd .sky { transition: fill 1.6s; }\n' +
  '.rd .cel { transition: transform 1.6s cubic-bezier(.45,.05,.25,1), fill 1.6s; }\n' +
  '.rd .beam { transition: opacity .6s; }\n' +
  '.rd .haz { opacity: 0; }\n' +
  '.rd:not(.drive) :is(.ly, .mv, .wh, .bob, .drift, .spd) { animation-play-state: paused; }\n' +
  '.rd:not(.drive) :is(.beam, .puff, .spd) { opacity: 0 !important; }\n' +
  '.rd.wait .haz { animation: rdBlink 1.4s ease-in-out infinite; }\n' +
  '.rdLbl { position: relative; height: 16px; margin-top: 2px; grid-column: 1; grid-row: 2; }\n' +
  '.rdLbl button { position: absolute; top: 0; border: 0; background: none; padding: 0 2px; font: inherit; font-size: 11px; color: var(--muted); cursor: pointer; white-space: nowrap; }\n' +
  '.rdLbl button:hover { color: var(--ink); }\n' +
  '.rdLbl button.on { color: var(--ink); font-weight: 600; }\n' +
  '.rdLbl button.man::after { content: " \\2022"; color: ' + RD_A + '; }\n' +
  '.rdCyc { grid-column: 2; grid-row: 1; width: 24px; height: 24px; border-radius: 50%; border: 1px solid var(--line-2); background: var(--surface); color: var(--ink-2); display: grid; place-items: center; cursor: pointer; opacity: .55; transition: opacity .2s; padding: 0; }\n' +
  '.rd:hover .rdCyc, .rdCyc:focus-visible { opacity: 1; }\n' +
  '@keyframes rdPan { to { transform: translateX(var(--w)); } }\n' +
  '@keyframes rdDash { to { stroke-dashoffset: var(--o, 22px); } }\n' +
  '@keyframes rdSpin { to { transform: rotate(360deg); } }\n' +
  '@keyframes rdBob { to { transform: translateY(-0.8px); } }\n' +
  '@keyframes rdDrift { to { transform: translateY(1.2px); } }\n' +
  '@keyframes rdPuff { 0% { opacity: .45; transform: translate(0,0) scale(.6); } 100% { opacity: 0; transform: translate(-12px,-6px) scale(1.6); } }\n' +
  '@keyframes rdBlink { 0%, 100% { opacity: 0; } 50% { opacity: 1; } }\n' +
  '@keyframes rdTw { 0%, 100% { opacity: .25; } 50% { opacity: .9; } }\n' +
  '@keyframes rdRain { to { transform: translate(-6px, 22px); } }\n' +
  '@keyframes rdSnow { to { transform: translate(-14px, 34px); } }\n' +
  '@keyframes rdAur { 0% { opacity: .25; transform: translateY(0); } 100% { opacity: .6; transform: translateY(3px); } }\n' +
  '@media (prefers-reduced-motion: reduce) { .rd * { animation-play-state: paused !important; } }\n';
JC_CSS += ROAD_CSS;
var JC_ZF = '/* v180: Large and Shop floor zoom the page - full-height pieces divide by the zoom */:host(.th-iv:not([data-device="phone"])) .page.roB.roB.roB.ivB { min-height: calc(100vh / var(--zf, 1) - 16px); }:host(.th-iv:not([data-device="phone"])) .page.roB.roB.roB.ivB > .ivD { height: calc(100vh / var(--zf, 1) - 16px); }.pxr { height: calc(100vh / var(--zf, 1) - 16px); }.roCol { max-height: calc(100vh / var(--zf, 1) - var(--jcTop, 0px) + 12px); }.page.soloMode .card { min-height: calc(100vh / var(--zf, 1) - 90px); }.attBox { height: calc(92vh / var(--zf, 1)); }.px-modal { max-height: calc(86vh / var(--zf, 1)); }';
