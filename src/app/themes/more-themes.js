/* Parsec · themes · more-themes.js
   Fourteen more themes (17.3, 17.5): cool blues, indigo, violet, steel, carbon, Carbon with Charcoal (the new look's palette) and four grid backgrounds, each one line you can delete.
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   themeMix themeAdd (2 functions)
   uses       data/
*/
/* ============================== More themes (Parsec 17.3) ==============================
   Each theme is one themeAdd({ … }) line below and nothing else refers to it, so:
     · to drop one theme, delete its line (someone who had it opens in Ivory or Graphite next time);
     · to drop them all, delete this file, its line in build/manifest.txt and in tools/purposes.json, and
       styles/app/62-more-themes.css (the grid backgrounds), then run python3 tools/headers.py.
   A theme gives five colours: canvas (the sidebar and the edges), panel (the page), raised (cards), ink (text) and acc
   (the accent); the rest (fills, lines, the softer text, the accent tints) is mixed from them here. ink4 is optional:
   the faintest text, for a theme whose mixed one is too faint to read on its cards. The colours go onto
   Ivory (light) or Graphite (dark) through the --vv-* tokens White and Near black already use (data/store-api.js themePaint).
   grid / gridSize: an optional background drawn behind the page (the CSS is styles/app/62-more-themes.css).
   No pinks, oranges, yellows, ambers, greens or reds as backgrounds or accents; the status colours (done, waiting,
   problem) stay as they are, because they mean something. */
function themeMix(a, b, p){
  var h = function(c){ c = c.replace("#", ""); return [0, 2, 4].map(function(i){ return parseInt(c.substr(i, 2), 16); }); };
  var A = h(a), B = h(b);
  return "#" + A.map(function(v, i){ return ("0" + Math.round(v * p + B[i] * (1 - p)).toString(16)).slice(-2); }).join("");
}
function themeAdd(o){
  var d = !!o.dark, r = o.raised, base = d ? o.panel : r, m = function(c, p){ return themeMix(c, base, p); };
  var st = d ? { good: "#7ac79c", warn: "#e4b564", bad: "#f38c80" } : { good: "#23764a", warn: "#94610c", bad: "#b94238" };
  var v = { canvas: o.canvas, panel: o.panel, raised: r,
    fill: m(o.ink, d ? .08 : .055), sel: m(o.acc, d ? .20 : .12), hair: m(o.ink, d ? .11 : .10), border: m(o.ink, d ? .23 : .21),
    ink: o.ink, ink2: m(o.ink, d ? .80 : .78), ink3: m(o.ink, d ? .64 : .64), ink4: o.ink4 || m(o.ink, d ? .48 : .50),   /* ink4: the faintest text; a theme may give its own when the mix is too faint on its cards */
    acc: o.acc, acct: m(o.acc, d ? .18 : .10), accl: m(o.acc, d ? .45 : .40), acctx: themeMix(o.acc, d ? "#ffffff" : "#000000", d ? .85 : .80),
    primary: o.ink, onprimary: d ? o.panel : r };
  ["good", "warn", "bad"].forEach(function(k){ v[k] = st[k]; v[k + "-t"] = themeMix(st[k], base, d ? .14 : .09); });
  THEMES[o.id] = { name: o.name, dark: d, bg: o.canvas, card: r, hero: v.acct, acc: o.acc, vars: v, grid: o.grid || "", gridSize: o.gridSize || "", look: o.look || "" };
  THEME_MORE.push(o.id);
}
/* light */
themeAdd({ id: "x-slate",   name: "Slate",     canvas: "#eef1f5", panel: "#f8fafc", raised: "#ffffff", ink: "#1b2533", acc: "#3d5f8f" });
themeAdd({ id: "x-indigo",  name: "Indigo",    canvas: "#eeeff8", panel: "#fafaff", raised: "#ffffff", ink: "#1c1d3a", acc: "#4a4fc9" });
themeAdd({ id: "x-lilac",   name: "Lilac",     canvas: "#f1eef8", panel: "#fbfaff", raised: "#ffffff", ink: "#251d3a", acc: "#6a4bc4" });
themeAdd({ id: "x-arctic",  name: "Arctic",    canvas: "#e9f1f6", panel: "#f7fbfd", raised: "#ffffff", ink: "#10263a", acc: "#0d6fa8" });
/* dark */
themeAdd({ id: "x-steel",   name: "Steel",     dark: true, canvas: "#12161c", panel: "#181d24", raised: "#1f252e", ink: "#e6ebf2", acc: "#7da5d9" });
themeAdd({ id: "x-midnight",name: "Midnight",  dark: true, canvas: "#070b16", panel: "#0c1222", raised: "#131a2e", ink: "#e3e8f7", acc: "#6f8dff" });
themeAdd({ id: "x-violet",  name: "Violet",    dark: true, canvas: "#0d0a16", panel: "#141020", raised: "#1c172b", ink: "#ece8f7", acc: "#a48cff" });
themeAdd({ id: "x-deepsea", name: "Deep sea",  dark: true, canvas: "#051219", panel: "#0a1922", raised: "#10222d", ink: "#e0eef4", acc: "#4ec3e8" });
themeAdd({ id: "x-carbon",  name: "Carbon",    dark: true, canvas: "#0a0a0a", panel: "#121212", raised: "#1b1b1b", ink: "#ececec", acc: "#b9c2cf" });
themeAdd({ id: "x-charcoal", name: "Carbon with Charcoal", look: "new", dark: true, canvas: "#141414", panel: "#1b1b1b", raised: "#2f2f2f", ink: "#f0f2f4", acc: "#72a6ff", ink4: "#9c9d9f" });   /* the new look's palette (look: "new" switches on the new look, styles/app/63-look.css); ink4 reads at 4.5 to 1 on its cards */
/* grid backgrounds */
themeAdd({ id: "x-paper",   name: "Graph paper", canvas: "#edf1f8", panel: "#fbfcfe", raised: "#ffffff", ink: "#18233a", acc: "#2f5fb3",
  grid: "linear-gradient(rgba(47,95,179,.075) 1px,transparent 1px),linear-gradient(90deg,rgba(47,95,179,.075) 1px,transparent 1px)", gridSize: "22px 22px" });
themeAdd({ id: "x-blueprint", name: "Blueprint", dark: true, canvas: "#0a1d33", panel: "#0f2742", raised: "#15314f", ink: "#e4eefb", acc: "#9cc7ff",
  grid: "linear-gradient(rgba(156,199,255,.13) 1px,transparent 1px),linear-gradient(90deg,rgba(156,199,255,.13) 1px,transparent 1px),linear-gradient(rgba(156,199,255,.06) 1px,transparent 1px),linear-gradient(90deg,rgba(156,199,255,.06) 1px,transparent 1px)",
  gridSize: "120px 120px,120px 120px,24px 24px,24px 24px" });
themeAdd({ id: "x-dots",    name: "Dot grid",  dark: true, canvas: "#0c0d10", panel: "#121318", raised: "#1a1c22", ink: "#e8e9ee", acc: "#8c9bff",
  grid: "radial-gradient(rgba(232,233,238,.13) 1px,transparent 1.4px)", gridSize: "18px 18px" });
themeAdd({ id: "x-dots-l",  name: "Dot grid light", canvas: "#eeeff2", panel: "#fafafb", raised: "#ffffff", ink: "#17181d", acc: "#4c5bd4",
  grid: "radial-gradient(rgba(23,24,29,.16) 1px,transparent 1.4px)", gridSize: "18px 18px" });
