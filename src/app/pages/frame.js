/* Parsec · pages · frame.js
   The shared frame for the page modules (PG): icons (its own IC set), small formatters, people lookups, the module registry (PG.mods, reg / modOf / homeOf) and the shop's settings (labor rate, pay period).
   Flow: each page closure registers itself with PG.reg; render() finds the view's module through PG.mods.
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   ic kbd e p2 h1 h2 mod clkM clk dur durMs hms … (55 functions, 6 constants)
   state      laborRate payAnchor shop techName
   uses       access/ data/ kit/ pages/rolist/ pages/triage/ pages/warranty/ ro/ ro-page/ shell/ state/
   at load    builds PG (a closure) · on document click · on document input · on document change · on document keydown · on document pointerdown · a timer · on document mousemove
*/
var PG = (function(){
  var IC = {"air": "<path d=\"M4 9h11a3 3 0 1 0-3-3M4 14h14a3 3 0 1 1-3 3M4 19h6\"/>", "bell": "<path d=\"M6 16.75V11a6 6 0 0 1 12 0v5.75l1.5 1.5h-15z\"/><path d=\"M10 20.5a2.25 2.25 0 0 0 4 0\"/>", "board": "<rect x=\"3.75\" y=\"4.5\" width=\"4.5\" height=\"15\" rx=\"1.25\"/><rect x=\"9.75\" y=\"4.5\" width=\"4.5\" height=\"10\" rx=\"1.25\"/><rect x=\"15.75\" y=\"4.5\" width=\"4.5\" height=\"12.5\" rx=\"1.25\"/>", "bolt": "<path d=\"M13 3 5.5 13.5H12L11 21l7.5-10.5H12z\"/>", "book": "<path d=\"M5 5.5A1.5 1.5 0 0 1 6.5 4H19v13H6.5A1.5 1.5 0 0 0 5 18.5zM5 18.5A1.5 1.5 0 0 0 6.5 20H19\"/>", "bookmark": "<path d=\"M7 4h10v16l-5-3.5L7 20z\"/>", "box": "<path d=\"M4 7.5 12 4l8 3.5v9L12 20l-8-3.5z\"/><path d=\"M4 7.5 12 11l8-3.5M12 11v9\"/>", "bulb": "<path d=\"M9 18h6M10 21h4M8.5 14.5a6 6 0 1 1 7 0c-.8.6-1.5 1.4-1.5 2.5h-4c0-1.1-.7-1.9-1.5-2.5z\"/>", "calendar": "<rect x=\"4\" y=\"5.5\" width=\"16\" height=\"14.5\" rx=\"2\"/><path d=\"M4 10h16M8.5 3.5v4M15.5 3.5v4\"/>", "camera": "<path d=\"M4 8.5A1.5 1.5 0 0 1 5.5 7h2.2l1.5-2h5.6l1.5 2h2.2A1.5 1.5 0 0 1 20 8.5v9a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 17.5z\"/><circle cx=\"12\" cy=\"13\" r=\"3.5\"/>", "career": "<path d=\"M5 19.5v-5M10 19.5v-11M15 19.5v-7.5M20 19.5V5\"/>", "cart": "<path d=\"M3.5 4.5h2.2l2 10h10l1.8-7H6.6\"/><circle cx=\"9\" cy=\"18.5\" r=\"1.4\"/><circle cx=\"16.5\" cy=\"18.5\" r=\"1.4\"/>", "chart": "<path d=\"M4.5 19.5h15M7.5 16.5v-5M12 16.5v-9M16.5 16.5v-3\"/>", "chat": "<path d=\"M4.5 6.75A2.25 2.25 0 0 1 6.75 4.5h10.5a2.25 2.25 0 0 1 2.25 2.25v7.5a2.25 2.25 0 0 1-2.25 2.25H11.5L7 20v-3.5h-.25A2.25 2.25 0 0 1 4.5 14.25z\"/>", "check": "<path d=\"M5 12.5l4.5 4.5L19 7.5\"/>", "chevD": "<path d=\"M6.5 9.5L12 15l5.5-5.5\"/>", "chevL": "<path d=\"M14.5 6 8.5 12l6 6\"/>", "chevR": "<path d=\"M9.5 6.5L15 12l-5.5 5.5\"/>", "chevU": "<path d=\"M6.5 14.5L12 9l5.5 5.5\"/>", "claim": "<path d=\"M12 3.5l7 2.75v5.5c0 4.4-3 7.6-7 9-4-1.4-7-4.6-7-9v-5.5z\"/><path d=\"M8.9 12.1l2.2 2.2 4.1-4.4\"/>", "clip": "<path d=\"M19.4 11.2l-7.1 7.2a4.4 4.4 0 0 1-6.2-6.2l7.6-7.6a2.9 2.9 0 0 1 4.1 4.1l-7.3 7.3a1.4 1.4 0 0 1-2-2l6.6-6.6\"/>", "clock": "<circle cx=\"12\" cy=\"12\" r=\"8.5\"/><path d=\"M12 7.5V12l3 2\"/>", "coffee": "<path d=\"M5 9h11v5.5A4.5 4.5 0 0 1 11.5 19h-2A4.5 4.5 0 0 1 5 14.5z\"/><path d=\"M16 10.5h1.25a2.25 2.25 0 0 1 0 4.5H16M8 3.5v2.5M11 3.5v2.5\"/>", "console": "<rect x=\"3.75\" y=\"3.75\" width=\"7\" height=\"7\" rx=\"2\"/><rect x=\"13.25\" y=\"3.75\" width=\"7\" height=\"7\" rx=\"2\"/><rect x=\"3.75\" y=\"13.25\" width=\"7\" height=\"7\" rx=\"2\"/><rect x=\"13.25\" y=\"13.25\" width=\"7\" height=\"7\" rx=\"2\"/>", "copy": "<rect x=\"8\" y=\"8\" width=\"12\" height=\"12\" rx=\"2.5\"/><path d=\"M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2\"/>", "dollar": "<path d=\"M12 3.75v16.5M16 7.5c-.6-1.5-2.1-2.25-4-2.25-2.35 0-4 1.2-4 3s1.6 2.5 4 3 4 1.25 4 3.1-1.8 3.15-4 3.15c-2 0-3.6-.85-4.25-2.5\"/>", "download": "<path d=\"M12 4v11M7.5 10.5 12 15l4.5-4.5M5 19h14\"/>", "drop": "<path d=\"M12 3.5c3.2 4.2 5.5 7.3 5.5 10.2a5.5 5.5 0 0 1-11 0c0-2.9 2.3-6 5.5-10.2z\"/>", "engine": "<path d=\"M6 9h9l2 2h2v6h-2l-2 2H8l-2-2H4v-6h2z\"/><path d=\"M9 9V6h4v3M19 11v6\"/>", "exit": "<path d=\"M14 4.5h3.5a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H14M10 8l-4 4 4 4M6 12h9\"/>", "eye": "<path d=\"M2.75 12S6 5.75 12 5.75 21.25 12 21.25 12 18 18.25 12 18.25 2.75 12 2.75 12z\"/><circle cx=\"12\" cy=\"12\" r=\"3\"/>", "file": "<path d=\"M7 3.75h6.5L18 8.25V19a1.25 1.25 0 0 1-1.25 1.25h-9.5A1.25 1.25 0 0 1 6 19V5a1.25 1.25 0 0 1 1-1.25z\"/><path d=\"M13.25 3.75V8.5H18M9 12.5h6M9 16h6\"/>", "filter": "<path d=\"M6 19c1.6-1.8 0-3.6 1.6-5.4S7.6 10 9.2 8.2M11.2 19c1.6-1.8 0-3.6 1.6-5.4s0-3.6 1.6-5.4M16.4 19c1.6-1.8 0-3.6 1.6-5.4s0-3.6 1.6-5.4M4 5h16\"/>", "fixes": "<path d=\"M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z\"/>", "flag": "<path d=\"M6 20.5V4.5M6 5h10.5l-2 3.75 2 3.75H6\"/>", "foreman": "<rect x=\"5\" y=\"4.75\" width=\"14\" height=\"15.5\" rx=\"2.5\"/><path d=\"M9.5 4.75V4a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v.75M8.75 10.5h6.5M8.75 14h6.5M8.75 17.25h3.5\"/>", "gauge": "<path d=\"M4.5 16.5a7.5 7.5 0 1 1 15 0\"/><path d=\"M12 16.5l3.5-4.5\"/>", "gear": "<path d=\"M4 8h8.5M17 8h3M4 16h3M11.5 16H20\"/><circle cx=\"14.75\" cy=\"8\" r=\"2.25\"/><circle cx=\"9.25\" cy=\"16\" r=\"2.25\"/>", "gear2": "<circle cx=\"12\" cy=\"12\" r=\"3\"/><path d=\"M12 3.5v2.5M12 18v2.5M3.5 12H6M18 12h2.5M6 6l1.8 1.8M16.2 16.2 18 18M18 6l-1.8 1.8M7.8 16.2 6 18\"/>", "grid": "<rect x=\"4\" y=\"4\" width=\"7\" height=\"7\" rx=\"1.5\"/><rect x=\"13\" y=\"4\" width=\"7\" height=\"7\" rx=\"1.5\"/><rect x=\"4\" y=\"13\" width=\"7\" height=\"7\" rx=\"1.5\"/><rect x=\"13\" y=\"13\" width=\"7\" height=\"7\" rx=\"1.5\"/>", "grip": "<circle cx=\"9\" cy=\"6.5\" r=\"1.1\"/><circle cx=\"15\" cy=\"6.5\" r=\"1.1\"/><circle cx=\"9\" cy=\"12\" r=\"1.1\"/><circle cx=\"15\" cy=\"12\" r=\"1.1\"/><circle cx=\"9\" cy=\"17.5\" r=\"1.1\"/><circle cx=\"15\" cy=\"17.5\" r=\"1.1\"/>", "history": "<path d=\"M4.5 12a7.5 7.5 0 1 0 2.2-5.3M4.5 4.5v3.75h3.75\"/><path d=\"M12 8.5V12l2.5 1.5\"/>", "image": "<rect x=\"4\" y=\"5\" width=\"16\" height=\"14\" rx=\"2\"/><circle cx=\"9\" cy=\"10\" r=\"1.6\"/><path d=\"m5 17 4.5-4.5 3 3 2.5-2.5L20 17\"/>", "inbox": "<path d=\"M3.75 13.5l2.6-7.1A1.5 1.5 0 0 1 7.76 5.4h8.48a1.5 1.5 0 0 1 1.41 1l2.6 7.1v4.75a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5z\"/><path d=\"M3.75 13.5h4.5l1.25 2h5l1.25-2h4.5\"/>", "inbox2": "<path d=\"M3.75 13.5h4.5l1.5 2.25h4.5l1.5-2.25h4.5\"/><path d=\"M5.6 6.2 3.75 13.5v5.25h16.5V13.5L18.4 6.2a1.5 1.5 0 0 0-1.45-1.2H7.05A1.5 1.5 0 0 0 5.6 6.2z\"/>", "info": "<circle cx=\"12\" cy=\"12\" r=\"8.25\"/><path d=\"M12 11v5M12 8v.01\"/>", "keyTag": "<circle cx=\"8\" cy=\"15.5\" r=\"4\"/><path d=\"M10.9 12.6l8.6-8.6M16.5 7l2.5 2.5M14 9.5l2 2\"/>", "kit": "<rect x=\"4\" y=\"7\" width=\"16\" height=\"12\" rx=\"2\"/><path d=\"M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7M4 12h16\"/>", "link": "<path d=\"M10 14a4 4 0 0 0 5.66 0l3-3a4 4 0 0 0-5.66-5.66l-1 1\"/><path d=\"M14 10a4 4 0 0 0-5.66 0l-3 3a4 4 0 0 0 5.66 5.66l1-1\"/>", "list": "<svg class=\"px-ico\" viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path d=\"M8.5 6.5h11M8.5 12h11M8.5 17.5h11\"/><circle cx=\"4.75\" cy=\"6.5\" r=\".9\"/><circle cx=\"4.75\" cy=\"12\" r=\".9\"/><circle cx=\"4.75\" cy=\"17.5\" r=\".9\"/></svg>", "lock": "<rect x=\"5\" y=\"10.5\" width=\"14\" height=\"9.5\" rx=\"2\"/><path d=\"M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5\"/>", "manager": "<circle cx=\"9.25\" cy=\"8.25\" r=\"3.25\"/><path d=\"M3.5 19.5c0-3.2 2.6-5.25 5.75-5.25s5.75 2.05 5.75 5.25\"/><path d=\"M15.5 5.3a3.2 3.2 0 0 1 0 5.9M17.2 14.6c2 .6 3.3 2.2 3.3 4.4\"/>", "merge": "<path d=\"M6 4v5a5 5 0 0 0 5 5h7M15 11l3 3-3 3M6 20v-4\"/>", "mic": "<rect x=\"9\" y=\"3.5\" width=\"6\" height=\"11\" rx=\"3\"/><path d=\"M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V20.5\"/>", "moon": "<path d=\"M19.5 14.5A8 8 0 0 1 9.5 4.5a7.5 7.5 0 1 0 10 10z\"/>", "more": "<path d=\"M5.5 12h.01M12 12h.01M18.5 12h.01\" stroke-width=\"2.4\"/>", "note": "<path d=\"M6 3.75h12A1.25 1.25 0 0 1 19.25 5v9.5l-4.75 5.75H6A1.25 1.25 0 0 1 4.75 19V5A1.25 1.25 0 0 1 6 3.75z\"/><path d=\"M14.5 20.25v-4.5a1.25 1.25 0 0 1 1.25-1.25h3.5M8 8.5h8M8 12h5\"/>", "parts": "<path d=\"M12 3.5l7.5 4v9l-7.5 4-7.5-4v-9z\"/><path d=\"M4.5 7.5l7.5 4 7.5-4M12 11.5v9\"/>", "pause": "<path d=\"M9 6v12M15 6v12\"/>", "pencil": "<path d=\"M4.75 19.25l1-4L15.6 5.4a1.9 1.9 0 0 1 2.7 0l.3.3a1.9 1.9 0 0 1 0 2.7L8.75 18.25z\"/><path d=\"M14 7l3 3\"/>", "phone": "<path d=\"M6.2 4.5h2.6l1.4 3.6-1.9 1.3a10.5 10.5 0 0 0 5.3 5.3l1.3-1.9 3.6 1.4v2.6a1.6 1.6 0 0 1-1.7 1.6A14 14 0 0 1 4.6 6.2a1.6 1.6 0 0 1 1.6-1.7z\"/>", "pin": "<path d=\"M12 20.5s-6-5.6-6-10.25a6 6 0 0 1 12 0C18 14.9 12 20.5 12 20.5z\"/><circle cx=\"12\" cy=\"10.25\" r=\"2.25\"/>", "play": "<path d=\"M8 5.6v12.8a.8.8 0 0 0 1.2.7l10.2-6.4a.8.8 0 0 0 0-1.4L9.2 4.9A.8.8 0 0 0 8 5.6z\"/>", "plus": "<path d=\"M12 5v14M5 12h14\"/>", "print": "<path d=\"M7 9V4.5h10V9\"/><rect x=\"3.75\" y=\"9\" width=\"16.5\" height=\"7.5\" rx=\"2\"/><path d=\"M7 14.5h10v5H7z\"/>", "qr": "<rect x=\"4\" y=\"4\" width=\"6\" height=\"6\" rx=\"1\"/><rect x=\"14\" y=\"4\" width=\"6\" height=\"6\" rx=\"1\"/><rect x=\"4\" y=\"14\" width=\"6\" height=\"6\" rx=\"1\"/><path d=\"M14 14h2v2h-2zM18 14h2M14 18h2M18 18h2v2M16 16h2v2\"/>", "ros": "<path d=\"M6.5 3.75h7l4.75 4.75v10.25a1.5 1.5 0 0 1-1.5 1.5H6.5A1.5 1.5 0 0 1 5 18.75V5.25a1.5 1.5 0 0 1 1.5-1.5z\"/><path d=\"M13.5 3.75V8.5h4.75\"/><path d=\"M8.5 12.5h7M8.5 16h4.5\"/>", "save": "<path d=\"M5.5 4h10.2L20 8.3v10.2a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 18.5v-13A1.5 1.5 0 0 1 5.5 4z\"/><path d=\"M8 4v4.5h7V4M8 20v-6h8v6\"/>", "scan": "<path d=\"M4 8V5.5A1.5 1.5 0 0 1 5.5 4H8M16 4h2.5A1.5 1.5 0 0 1 20 5.5V8M20 16v2.5a1.5 1.5 0 0 1-1.5 1.5H16M8 20H5.5A1.5 1.5 0 0 1 4 18.5V16M8 8.5v7M11 8.5v7M14 8.5v7M17 8.5v7\"/>", "search": "<circle cx=\"11\" cy=\"11\" r=\"6.5\"/><path d=\"M16 16l4.5 4.5\"/>", "send": "<path d=\"M4 12 20 4.5 15.5 20l-3.25-6.75z\"/><path d=\"M12.25 13.25 20 4.5\"/>", "sheet": "<rect x=\"5\" y=\"3.75\" width=\"14\" height=\"16.5\" rx=\"2\"/><path d=\"M8.5 8.5h7M8.5 12h7M8.5 15.5h4\"/>", "shelf": "<rect x=\"4\" y=\"4\" width=\"16\" height=\"16\" rx=\"2\"/><path d=\"M4 12h16M9 4v8M15 12v8\"/>", "sliders": "<path d=\"M4 7h10M18 7h2M4 17h4M12 17h8\"/><circle cx=\"16\" cy=\"7\" r=\"2\"/><circle cx=\"10\" cy=\"17\" r=\"2\"/>", "snow": "<path d=\"M12 3v18M4.2 7.5l15.6 9M19.8 7.5l-15.6 9M9.5 4.5 12 7l2.5-2.5M9.5 19.5 12 17l2.5 2.5\"/>", "sort": "<path d=\"M8 5v14M4.5 15.5 8 19l3.5-3.5\"/><path d=\"M16 19V5M12.5 8.5 16 5l3.5 3.5\"/>", "spark": "<path d=\"M12 3.5 13.8 10 20 12l-6.2 2L12 20.5 10.2 14 4 12l6.2-2z\"/>", "split": "<path d=\"M12 4v16M5 8l-2 4 2 4M19 8l2 4-2 4\"/>", "star": "<path d=\"M12 4.2l2.3 4.8 5.2.7-3.8 3.6.9 5.2L12 16l-4.6 2.5.9-5.2-3.8-3.6 5.2-.7z\"/>", "stop": "<rect x=\"6\" y=\"6\" width=\"12\" height=\"12\" rx=\"2.75\"/>", "sun": "<circle cx=\"12\" cy=\"12\" r=\"4\"/><path d=\"M12 2.75v2M12 19.25v2M2.75 12h2M19.25 12h2M5.5 5.5l1.4 1.4M17.1 17.1l1.4 1.4M5.5 18.5l1.4-1.4M17.1 6.9l1.4-1.4\"/>", "swap": "<path d=\"M7 7.5h12.5L16 4M17 16.5H4.5L8 20\"/>", "tech": "<circle cx=\"9\" cy=\"7.5\" r=\"3.2\"/><path d=\"M3.5 19.5c.6-3.4 2.8-5.3 5.5-5.3 1.2 0 2.3.3 3.2 1\"/><path d=\"M17.9 12.2a2.7 2.7 0 0 0-3.4 3.4l-2.7 2.7a1.2 1.2 0 0 0 1.7 1.7l2.7-2.7a2.7 2.7 0 0 0 3.4-3.4l-1.4 1.4-1.4-.2-.2-1.4z\"/>", "timelog": "<circle cx=\"12\" cy=\"12\" r=\"8.5\"/><path d=\"M12 7.25V12l3.25 1.9\"/>", "trash": "<path d=\"M4.5 6.5h15M9.5 6.5V4.75h5V6.5M6.5 6.5l.9 12.2a1.5 1.5 0 0 0 1.5 1.3h6.2a1.5 1.5 0 0 0 1.5-1.3l.9-12.2M10 10.5v5.5M14 10.5v5.5\"/>", "triage": "<rect x=\"3.5\" y=\"7.5\" width=\"17\" height=\"12.25\" rx=\"2.75\"/><path d=\"M9 7.5V6a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 15 6v1.5M12 10.75v5.5M9.25 13.5h5.5\"/>", "truck": "<path d=\"M3.5 6.5h10v9h-10zM13.5 9.5h3.8l3.2 3.4v2.6h-7\"/><circle cx=\"7\" cy=\"17\" r=\"1.8\"/><circle cx=\"16.5\" cy=\"17\" r=\"1.8\"/>", "tv": "<rect x=\"3.5\" y=\"5\" width=\"17\" height=\"11.5\" rx=\"2\"/><path d=\"M8.5 20h7M12 16.5V20\"/>", "undo": "<path d=\"M9 7.5 4.5 12 9 16.5\"/><path d=\"M4.5 12h10a5 5 0 0 1 0 10h-2\"/>", "unit": "<path d=\"M2.75 16.5V7.25A1.5 1.5 0 0 1 4.25 5.75h9.25v10.75M13.5 9.25h3.6a1.5 1.5 0 0 1 1.2.6l2.2 2.9a1.5 1.5 0 0 1 .3.9v2.85h-2\"/><circle cx=\"7\" cy=\"17.25\" r=\"2\"/><circle cx=\"16.5\" cy=\"17.25\" r=\"2\"/><path d=\"M9 17.25h5.5\"/>", "user": "<circle cx=\"12\" cy=\"8\" r=\"3.75\"/><path d=\"M4.75 20c.6-3.6 3.6-5.75 7.25-5.75s6.65 2.15 7.25 5.75\"/>", "users": "<circle cx=\"9\" cy=\"8.5\" r=\"3.25\"/><path d=\"M3.5 19.5c.5-3.2 2.7-5 5.5-5s5 1.8 5.5 5\"/><path d=\"M15.5 5.6a3.2 3.2 0 0 1 0 6.1M17.5 14.8c1.7.6 2.8 2.2 3 4.7\"/>", "warranty": "<path d=\"M12 3.5l7 2.75v5.5c0 4.4-3 7.6-7 9-4-1.4-7-4.6-7-9v-5.5z\"/><path d=\"M8.9 12.1l2.2 2.2 4.1-4.4\"/>", "wrench": "<path d=\"M14.7 6.3a4 4 0 0 0-5.2 5.2l-5 5a1.8 1.8 0 0 0 2.5 2.5l5-5a4 4 0 0 0 5.2-5.2l-2.4 2.4-2.3-.3-.3-2.3z\"/>", "x": "<path d=\"M6 6l12 12M18 6L6 18\"/>"};
  var MODS = {};
  function ic(n, s){ var p = IC[n] || (typeof TG_IC !== "undefined" && TG_IC[n]) || (typeof IVI !== "undefined" && IVI[n]); s = s || 16;
    return p ? '<svg class="tg-ic" viewBox="0 0 24 24" width="' + s + '" height="' + s + '" aria-hidden="true">' + p + '</svg>' : ''; }
  function kbd(k){ return '<span class="tg-kbd">' + k + '</span>'; }
  function e(s){ return String(s == null ? "" : s).replace(/[&<>"]/g, function(c){ return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function p2(n){ return String(n).padStart(2, "0"); }
  function h1(n){ return (Math.round((+n || 0) * 10) / 10).toFixed(1); }
  function h2(n){ return (Math.round((+n || 0) * 100) / 100).toFixed(2); }
  /* minutes of the day <-> clock words, the way the mock-ups write them: 2:15 pm */
  function mod(ms){ var d = new Date(ms); return d.getHours() * 60 + d.getMinutes() + d.getSeconds() / 60; }
  function clkM(m){ m = Math.floor(m); var h = Math.floor(m / 60) % 24, mm = m % 60; return (h % 12 || 12) + ":" + p2(mm) + (h < 12 ? " am" : " pm"); }
  function clk(t){ if(t == null || t === "") return "—"; var d = new Date(t); if(isNaN(d)) return "—"; return clkM(d.getHours() * 60 + d.getMinutes()); }
  function dur(min){ min = Math.max(0, Math.floor(min)); return Math.floor(min / 60) + ":" + p2(min % 60); }
  function durMs(ms){ return dur((ms || 0) / 60000); }
  function hms(ms){ var s = Math.max(0, Math.floor((ms || 0) / 1000)); return Math.floor(s / 3600) + ":" + p2(Math.floor(s / 60) % 60) + ":" + p2(s % 60); }
  function hmH(h){ return dur((+h || 0) * 60); }
  function day(t){ var d = new Date(t); return d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" }); }
  function dayLong(t){ var d = new Date(t); return d.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" }); }
  function isToday(t){ return t && new Date(t).toDateString() === new Date().toDateString(); }
  /* "just now", "12 min ago", "2:08 pm", "Yesterday", "Tue", "Oct 12" */
  function ago(t){ if(!t) return ""; var d = new Date(t), ms = Date.now() - d; if(ms < 60000) return "just now"; if(ms < 3600000) return Math.round(ms / 60000) + " min ago";
    if(isToday(t)) return clk(t); var y = new Date(); y.setDate(y.getDate() - 1); if(d.toDateString() === y.toDateString()) return "Yesterday";
    if(ms < 6 * 86400000) return d.toLocaleDateString(undefined, { weekday: "long" }); return d.toLocaleDateString(undefined, { month: "short", day: "numeric" }); }
  function whenL(t){ if(!t) return ""; var d = new Date(t); if(isToday(t)) return "Today, " + clk(t); var y = new Date(); y.setDate(y.getDate() - 1);
    if(d.toDateString() === y.toDateString()) return "Yesterday, " + clk(t); return d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" }) + ", " + clk(t); }
  function ageW(ms){ if(ms == null) return "—"; var m = Math.round(ms / 60000); if(m < 60) return m + " min"; var h = ms / 3600000; if(h < 48) return (h < 10 ? Math.round(h * 10) / 10 : Math.round(h)) + " h"; return Math.round(h / 24) + " d"; }
  function num(n){ return (+n || 0).toLocaleString("en-US"); }
  function usd(n, dec){ n = +n || 0; return (n < 0 ? "-$" : "$") + Math.abs(n).toLocaleString("en-US", { minimumFractionDigits: dec ? 2 : 0, maximumFractionDigits: dec ? 2 : 0 }); }
  /* ---------- people ---------- */
  function first(n){ return String(n || "").trim().split(/\s+/)[0] || ""; }
  function ini(n){ return String(n || "?").trim().split(/\s+/).map(function(x){ return x[0] || ""; }).join("").slice(0, 2).toUpperCase() || "?"; }
  function av(n, cls){ return '<span class="tg-av' + (cls ? " " + cls : "") + '" title="' + e(n) + '"' + (typeof v149eAvAttr === 'function' ? v149eAvAttr(n) : '') + '>' + e(ini(n)) + '</span>'; }
  function staffBy(role){ return staffList().filter(function(s){ return s.role === role; }); }
  function person(role){ var s = staffBy(role)[0]; return s ? s.name : ""; }
  /* the person signed in: name, role, the Console/Time Log/Career "me" (a technician), and whether they lead the shop */
  function me(){
    var sf = viewAsStaff();
    if(sf) return { name: sf.name, role: sf.role, staff: sf, tech: sf.role === "Technician" ? sf.name : "", lead: sf.role === "Foreman" || sf.role === "Manager", admin: false };
    var tn = String(STATE.techName || "").trim();
    return { name: tn || "Admin", role: tn ? "Technician" : "Admin", staff: null, tech: tn, lead: !tn, admin: true };
  }
  function isMe(n){ var m = me(); return !!n && (techSame(n, m.name) || (m.admin && !m.tech && false)); }
  /* the page each role lands on when it signs in */
  var HOME = { "Technician": "tech", "Foreman": "foreman", "Manager": "manager", "Service writer": "triage", "Triage": "triage", "Parts": "parts", "Warranty admin": "warranty" };
  function homeOf(role){ var v = HOME[role] || "rolist"; return navAllowed(v) ? v : navPages()[0][0]; }
  /* ---------- the module hooks ---------- */
  function reg(key, m){ MODS[key] = m; }
  function modOf(el){ var r = el && el.closest && el.closest("[data-pg]"); return r ? MODS[r.getAttribute("data-pg")] : null; }
  document.addEventListener("click", function(ev){
    var t = ev.target.closest && ev.target.closest("[data-a]"); if(!t || t.disabled) return;
    var a2 = ev.target.closest("[data-action]"); if(a2 && a2 !== t && t.contains(a2)) return;   /* an app button inside a module row is the app's */
    var m = modOf(t); if(!m || !m.H) return;
    var f = m.H[t.getAttribute("data-a")]; if(!f) return;
    ev.preventDefault(); ev.stopPropagation();
    try{ f(t, ev); }catch(err){ console.error(err); }
  });
  document.addEventListener("input", function(ev){ var t = ev.target, m = modOf(t); if(m && m.input && t.dataset && t.dataset.in) m.input(t, ev); });
  document.addEventListener("change", function(ev){ var t = ev.target, m = modOf(t); if(m && m.change && t.dataset && (t.dataset.in || t.dataset.ch)) m.change(t, ev); });
  document.addEventListener("keydown", function(ev){
    if(typeof pxOut === "function" && pxOut()) return;
    var t = ev.target, m = modOf(t);
    if(m && m.fieldKey && t.dataset && t.dataset.in){ if(m.fieldKey(t, ev)) return; }
    var cur = typeof rlEmbOn === "function" && rlEmbOn() ? MODS.rolist : MODS[UI.view]; if(!cur || !cur.keydown) return;
    if(UI.modal || UI.palette) return;
    cur.keydown(ev);
  });
  /* close a module's popover when you click outside it */
  document.addEventListener("pointerdown", function(ev){
    var cur = typeof rlEmbOn === "function" && rlEmbOn() ? MODS.rolist : MODS[UI.view]; if(!cur || !cur.U) return; var U = cur.U();
    if(U && U.pop && !(ev.target.closest && ev.target.closest(".tg-pop,[data-a='pop'],[data-keep-pop]"))){ U.pop = null; keepScroll(render); }
  }, true);
  /* the ticking numbers: [data-tk] cells ask their module for their text every second */
  setInterval(function(){
    var cur = MODS[UI.view]; if(!cur || !cur.TK || (typeof pxOut === "function" && pxOut())) return;
    document.querySelectorAll("[data-pg] [data-tk]").forEach(function(el){ var f = cur.TK[el.getAttribute("data-tk")]; if(f){ var v = f(el); if(v != null && el.textContent !== v) el.textContent = v; } });
  }, 1000);
  /* hover tips: data-tip="Title|line under it" — Parsec 14.9: the one tooltip (PTIP) shows them */
  document.addEventListener("mousemove", function(ev){
    if(typeof PTIP !== "undefined") return;
    var root = ev.target.closest && ev.target.closest("[data-pg]"); var tip = document.getElementById("pg-tip");
    var h = root && ev.target.closest("[data-tip]");
    if(!h){ if(tip) tip.hidden = true; return; }
    if(!tip){ tip = document.createElement("div"); tip.id = "pg-tip"; tip.className = "pg-tip"; document.body.appendChild(tip); }
    var p = String(h.getAttribute("data-tip")).split("|"), z = typeof ZF === "function" ? ZF() : 1;
    var key = h.getAttribute("data-tip");
    if(tip._k !== key){ tip._k = key;
      tip.innerHTML = "<b>" + e(p[0]) + "</b>" + p.slice(1).map(function(x){
        if(x.charAt(0) === "~") return '<small class="nt">' + e(x.slice(1)) + "</small>";
        if(x.indexOf("::") > 0){ var q = x.split("::"); var cl = /before/.test(q[0]) ? "pv" : /Unapplied/.test(q[0]) ? "un" : /Target|Goal|clock/.test(q[0]) ? "gl" : "";
          return '<span class="rw"><i class="' + cl + '"></i>' + e(q[0]) + "<b>" + e(q[1]) + "</b></span>"; }
        return "<small>" + e(x) + "</small>"; }).join(""); }
    tip.hidden = false;
    var x = ev.clientX / z + 14, y = ev.clientY / z + 16, vw = window.innerWidth / z, vh = window.innerHeight / z, th = tip.offsetHeight || 40;
    if(y + th > vh - 8) y = Math.max(8, ev.clientY / z - th - 10);
    tip.style.left = Math.max(8, Math.min(x, vw - 310)) + "px"; tip.style.top = y + "px";
  });
  /* keep the list and the pane where they were across a redraw */
  function keepScroll(fn){
    var q = function(s){ return document.querySelector("[data-pg] " + s); };
    var sc = q(".mq-pane,.mq-full,.tg-thread,.pg-scroll"), y = sc ? sc.scrollTop : 0, ls = q(".tg-scroll"), ly = ls ? ls.scrollTop : 0;
    fn();
    var s2 = q(".mq-pane,.mq-full,.tg-thread,.pg-scroll"); if(s2) s2.scrollTop = y; var l2 = q(".tg-scroll"); if(l2) l2.scrollTop = ly;
  }
  /* a popover opened from a button sits under it; the module keeps U.pop = { type, ax, ay, aw, at } */
  function anchor(U, el){
    var body = document.querySelector("[data-pg] .tg-body"); if(!el || !body) return;
    var z = typeof ZF === "function" ? ZF() : 1, r = el.getBoundingClientRect(), br = body.getBoundingClientRect();
    U.pop.ax = (r.left - br.left) / z; U.pop.ay = (r.bottom - br.top) / z; U.pop.aw = r.width / z; U.pop.at = (r.top - br.top) / z;
  }
  function placePop(U){
    var p = document.querySelector("[data-pg] .tg-body > .tg-pop, [data-pg] .tg-pop.pg-float"), body = document.querySelector("[data-pg] .tg-body");
    if(!p || !U || !U.pop || !body) return;
    var W = body.offsetWidth, Hh = body.offsetHeight, pw = p.offsetWidth, ph = p.offsetHeight, x, y;
    if(U.pop.ax != null){ x = U.pop.ax + (U.pop.aw || 0) - pw; y = U.pop.ay + 6; if(y + ph > Hh - 12) y = Math.max(12, (U.pop.at || y) - ph - 6); }
    else { x = W - pw - 16; y = 12; }
    p.style.left = Math.round(Math.max(12, Math.min(x, W - pw - 12))) + "px"; p.style.top = Math.round(Math.max(12, Math.min(y, Hh - ph - 12))) + "px";
  }
  function kbScroll(){ var sc = document.querySelector("[data-pg] .tg-scroll"), on = sc && sc.querySelector(".tg-it.on"); if(!on) return;
    if(on.offsetTop < sc.scrollTop + 30) sc.scrollTop = on.offsetTop - 40; else if(on.offsetTop + on.offsetHeight > sc.scrollTop + sc.clientHeight - 20) sc.scrollTop = on.offsetTop + on.offsetHeight - sc.clientHeight + 40; }
  function inp(sel){ var x = document.querySelector("[data-pg] " + sel); return x ? x.value : ""; }
  function typing(ev){ var t = ev.target; return t && (/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName) || t.isContentEditable); }
  /* open an RO on the RO page, at one operation if given */
  function openRo(roId, opId){ UI.roFrom = UI._roFromNext || null; UI._roFromNext = null; if(!UI.roFrom) UI.rlOrder = null; if(typeof openRoAt === "function" && opId){ openRoAt(roId, opId); return; } UI.view = "ros"; UI.selectedRo = roId; UI.roFilter = ""; persistUI(); render(); window.scrollTo(0, 0); }
  function go(view){ if(view === 'timelog') UI.tlMe = 1; if(view === "console" && !navAllowed("console") && navAllowed("tech")) view = "tech";   /* Parsec 11: the Technician page replaces Console for technicians */
    UI.view = view; UI.modal = null; persistUI(); render(); window.scrollTo(0, 0); }
  /* ---------- the shop's settings: labor rate, pay period, overhead, pay rates, the admin PIN (Manager → Settings) ---------- */
  function shop(){ var s = STATE.shop && typeof STATE.shop === "object" ? STATE.shop : (STATE.shop = {});
    if(!s.payPer || typeof s.payPer !== "object") s.payPer = { kind: "biweekly", anchor: /^\d{4}-\d{2}-\d{2}$/.test(STATE.payAnchor || "") ? STATE.payAnchor : "2026-01-05" };
    if(["weekly", "biweekly", "monthly"].indexOf(s.payPer.kind) < 0) s.payPer.kind = "biweekly";
    if(!/^\d{4}-\d{2}-\d{2}$/.test(s.payPer.anchor || "")) s.payPer.anchor = "2026-01-05";
    if(!s.pay || typeof s.pay !== "object") s.pay = {};
    return s; }
  function rate(){ return typeof laborRate === "function" ? laborRate() : (+STATE.laborRate > 0 ? +STATE.laborRate : 210); }
  function payOf(name){ var P = shop().pay; var k = Object.keys(P).filter(function(n){ return techSame(n, name); })[0]; return k ? (+P[k] || 0) : 0; }
  /* days: 'YYYY-MM-DD' keys */
  function dOf(k){ var a = String(k).split("-").map(Number); return new Date(a[0], a[1] - 1, a[2]); }
  function kOf(d){ return d.getFullYear() + "-" + p2(d.getMonth() + 1) + "-" + p2(d.getDate()); }
  function addD(k, n){ var d = dOf(k); d.setDate(d.getDate() + n); return kOf(d); }
  function dd(a, b){ return Math.round((dOf(b) - dOf(a)) / 86400000); }
  /* the pay period around a day: weekly and every two weeks run from the anchor day; monthly runs from the anchor's day of the month */
  function perStart(k){ var P = shop().payPer, an = P.anchor;
    if(P.kind === "monthly"){ var D = dOf(an).getDate(), d = dOf(k), y = d.getFullYear(), m = d.getMonth(); var st = new Date(y, m, Math.min(D, new Date(y, m + 1, 0).getDate())); if(st > d){ m -= 1; st = new Date(y, m, Math.min(D, new Date(y, m + 1, 0).getDate())); } return kOf(st); }
    var len = P.kind === "weekly" ? 7 : 14, n = Math.floor(dd(an, k) / len); return addD(an, n * len); }
  function perEnd(s){ var P = shop().payPer; if(P.kind === "monthly"){ var d = dOf(s), D = dOf(P.anchor).getDate(), y = d.getFullYear(), m = d.getMonth() + 1; var nx = new Date(y, m, Math.min(D, new Date(y, m + 1, 0).getDate())); return addD(kOf(nx), -1); } return addD(s, P.kind === "weekly" ? 6 : 13); }
  function perPrev(s){ return perStart(addD(s, -1)); }
  function perNext(s){ return addD(perEnd(s), 1); }
  var MN = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  function perLabel(s){ var a = dOf(s), b = dOf(perEnd(s)); return MN[a.getMonth()] + " " + a.getDate() + " – " + (a.getMonth() === b.getMonth() ? "" : MN[b.getMonth()] + " ") + b.getDate(); }
  function perWord(){ var k = shop().payPer.kind; return k === "weekly" ? "weekly" : k === "monthly" ? "monthly" : "every two weeks"; }
  /* print one sheet on a clean page of its own — only the paper, so the sidebar and the panel never shape it, and a long sheet runs onto a second page */
  function paperDoc(el, title){
    var host = el.closest("[data-pg]"), pg = host ? host.getAttribute("data-pg") : "", css = [], links = [];
    Array.prototype.forEach.call(document.styleSheets, function(sh){
      if(sh.href && /fonts\.googleapis/.test(sh.href)){ links.push(sh.href); return; }
      var rs; try{ rs = sh.cssRules; }catch(x){ return; }
      Array.prototype.forEach.call(rs, function(r){ var t = r.cssText; if(r.type === 5 || (pg && t.indexOf('data-pg="' + pg + '"') >= 0)) css.push(t); });
    });
    var cs = getComputedStyle(el.closest(".tg") || el), vars = ["--tg-sans", "--tg-mono", "--tg-serif"].map(function(v){ return v + ":" + cs.getPropertyValue(v); }).join(";");
    return '<!doctype html><html><head><meta charset="utf-8"><title>' + e(title || document.title) + '</title>' + links.map(function(h){ return '<link rel="stylesheet" href="' + e(h) + '">'; }).join("")
      + '<style>:root{' + vars + '}@page{size:letter;margin:12mm}html,body{margin:0;background:#fff}*{-webkit-print-color-adjust:exact;print-color-adjust:exact}\n' + css.join("\n")
      + '\n.pp button{appearance:none;border:0;background:none;padding:0;margin:0;color:inherit;cursor:default;text-align:inherit}.pp .tg-ic{display:inline-block;flex:none;fill:none;stroke:currentColor;stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round}.pp > *{max-width:none !important;margin:0 !important;padding:0 !important;box-shadow:none !important;border-radius:0 !important;position:static !important}</style></head><body><div class="pp" data-pg="' + e(pg) + '">' + el.outerHTML + '</div></body></html>';
  }
  function printPaper(el, title){
    if(!el) return;
    var f = document.createElement("iframe"); f.setAttribute("aria-hidden", "true"); f.style.cssText = "position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden";
    document.body.appendChild(f);
    var d = f.contentDocument; d.open(); d.write(paperDoc(el, title)); d.close();
    var done = false, go = function(){ if(done) return; done = true; try{ f.contentWindow.focus(); f.contentWindow.print(); }catch(x){ window.print(); } setTimeout(function(){ if(f.parentNode) f.parentNode.removeChild(f); }, 1500); };
    var waits = Array.prototype.map.call(d.querySelectorAll("link"), function(l){ return new Promise(function(r){ l.onload = l.onerror = r; setTimeout(r, 1500); }); });
    Promise.all(waits).then(function(){ return d.fonts && d.fonts.ready; }).then(function(){ setTimeout(go, 60); }, go);
    setTimeout(go, 2500);
  }
  /* a change you can take back: the label goes on the Undo, the toast says what happened */
  function act(label, msg, fn){ pushUndo(label); var r = fn(); scheduleSave(true); pushToast(msg, true); return r; }
  return { IC: IC, ic: ic, kbd: kbd, e: e, p2: p2, h1: h1, h2: h2, mod: mod, clkM: clkM, clk: clk, dur: dur, durMs: durMs, hms: hms, hmH: hmH, day: day, dayLong: dayLong, isToday: isToday,
    ago: ago, whenL: whenL, ageW: ageW, num: num, usd: usd, first: first, ini: ini, av: av, staffBy: staffBy, person: person, me: me, isMe: isMe, HOME: HOME, homeOf: homeOf,
    reg: reg, mods: MODS, paperDoc: paperDoc, printPaper: printPaper, keepScroll: keepScroll, anchor: anchor, placePop: placePop, kbScroll: kbScroll, inp: inp, typing: typing, openRo: openRo, go: go, act: act,
    shop: shop, rate: rate, payOf: payOf, dOf: dOf, kOf: kOf, addD: addD, dd: dd, perStart: perStart, perEnd: perEnd, perPrev: perPrev, perNext: perNext, perLabel: perLabel, perWord: perWord };
})();
/* the page modules' data rides in the shop file with everything else, so the folder keeps it */
var PG_SHOP_KEYS = ["shop", "ib", "tlSign", "tlOk", "ptSet", "returns", "ptDone", "ptBayLog", "fxStd", "fxQ", "fxQk", "fxAlias", "fxRev", "fxKit", "mgSet", "cr", "crNotes", "cxChk", "goals", "shiftEnd", "shopName", "settings", "payAnchor", "fixes", "truckPics", "truckPicsV", "truckCheckList"];
