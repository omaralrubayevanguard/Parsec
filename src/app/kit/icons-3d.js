/* Parsec · kit · icons-3d.js
   The layered colour icons (I3) for the big touch mode and the theme / zoom helpers that came with them: zoom factor, big-touch class, theme labels, the Ctrl K palette's result rows.
   Flow: i3(name) builds an icon from layers; applyBigTouch sets the <html> class the CSS keys off.
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   I3C I3R i3 I3H ZF zr sizeMode bigTouchOn applyBigTouch themeLabel roCtxHtml paletteResults … (16 functions, 10 constants)
   uses       clock/ data/ pages/triage/ ro/ shell/ state/ trucks/
   at load    on window resize
*/
/* ============================== ICONS: 3D multi-colour set ==============================
   Every icon is built from layers: a solid shape gets a darker copy 1.4px under it (the
   "extrusion" that gives it depth), then its face, then white or dark detail lines on top.
   No gradients or ids, so any number of copies can sit on a page, in hidden menus or
   inside the job console's shadow DOM without breaking each other. Colour follows the
   job the icon does: green adds or starts, red deletes or stops, blue is time, amber is
   paper, files and warnings, violet is people, steel is hardware. */
function I3C(cx, cy, r){ return "M" + (cx - r) + " " + cy + "a" + r + " " + r + " 0 1 0 " + (2 * r) + " 0a" + r + " " + r + " 0 1 0 " + (-2 * r) + " 0z"; }
function I3R(x, y, w, h, r){ r = Math.min(r, w / 2, h / 2);
  return "M" + (x + r) + " " + y + "h" + (w - 2 * r) + "a" + r + " " + r + " 0 0 1 " + r + " " + r + "v" + (h - 2 * r) + "a" + r + " " + r + " 0 0 1 " + (-r) + " " + r
    + "h" + (-(w - 2 * r)) + "a" + r + " " + r + " 0 0 1 " + (-r) + " " + (-r) + "v" + (-(h - 2 * r)) + "a" + r + " " + r + " 0 0 1 " + r + " " + (-r) + "z"; }
/* layer kinds: s solid+extrusion · f face only · d dark tone · l light tone · h highlight ·
   w white line · k dark line · c face-colour line · K thick line with its own extrusion */
function i3(layers, w, h, cls){
  /* the old layered 3D shapes, drawn as one thin outline in the text colour */
  w = w || 16; h = h || w;
  var o = '<svg class="' + (cls || "bi-svg") + ' i3" width="' + w + '" height="' + h + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">';
  layers.forEach(function(L){ if(L[0] === "h") return; o += '<path d="' + L[2] + '"/>'; });
  return o + '</svg>';
}
/* the shapes, by name */
var I3 = {
  warn: [["s","amber","M10.4 4.1a1.85 1.85 0 0 1 3.2 0l7.7 13.4a1.85 1.85 0 0 1-1.6 2.8H4.3a1.85 1.85 0 0 1-1.6-2.8z"],["h","","M11.2 5.4 7.6 11.8l1.3.5 3.1-5.6z"],["k","amber","M12 9.3v4.6",2.4],["k","amber","M12 17.1v.1",2.6]],
  user: [["s","violet","M4.2 20.4a7.8 6.6 0 0 1 15.6 0z"],["s","skin",I3C(12, 8.2, 4.1)],["h","","M9.4 6.6a3 3 0 0 1 2.4-1.6v1.3a1.8 1.8 0 0 0-1.3.8z"],["l","violet","M10.4 14.2h3.2l-1.6 3z"]],
  note: [["s","amber",I3R(4, 3.5, 16, 16.5, 2.6)],["d","amber","M15 20v-3.6a1.4 1.4 0 0 1 1.4-1.4H20z"],["k","amber","M7.6 8.4h8.8M7.6 11.6h8.8M7.6 14.8h4.6",1.7],["h","","M6.4 5.6h7v1h-7z"]],
  plus: [["s","green",I3C(12, 11.3, 8.6)],["h","","M6.3 8.4a6.5 6.5 0 0 1 4-3.6l.4 1.1a5.4 5.4 0 0 0-3.3 3z"],["w","","M12 7.4v7.8M8.1 11.3h7.8",2.5]],
  play: [["s","green",I3C(12, 11.3, 8.6)],["f","paper","M10 7.7v7.2a.7.7 0 0 0 1.05.6l5.5-3.6a.7.7 0 0 0 0-1.2l-5.5-3.6A.7.7 0 0 0 10 7.7z"],["h","","M6.3 8.4a6.5 6.5 0 0 1 4-3.6l.4 1.1a5.4 5.4 0 0 0-3.3 3z"]],
  stop: [["s","red",I3C(12, 11.3, 8.6)],["f","paper",I3R(8.6, 7.9, 6.8, 6.8, 1.4)],["h","","M6.3 8.4a6.5 6.5 0 0 1 4-3.6l.4 1.1a5.4 5.4 0 0 0-3.3 3z"]],
  swap: [["s","blue",I3C(12, 11.3, 8.6)],["w","","M7.8 9.4h8.2l-2.4-2.4M16.2 13.4H8l2.4 2.4",2]],
  report: [["s","paper","M6.2 2.8h8.2l4.4 4.4v12.2a1.4 1.4 0 0 1-1.4 1.4H6.2a1.4 1.4 0 0 1-1.4-1.4V4.2a1.4 1.4 0 0 1 1.4-1.4z"],["l","steel","M14.4 2.8v3a1.4 1.4 0 0 0 1.4 1.4h3z"],["f","blue",I3R(7.4, 13, 2.4, 5, .6)],["f","green",I3R(10.8, 10, 2.4, 8, .6)],["f","amber",I3R(14.2, 14.5, 2.4, 3.5, .6)]],
  download: [["s","steel",I3R(3.5, 14.6, 17, 5.6, 1.8)],["w","","M7 17.4h2",1.6],["s","blue","M10.2 3.3h3.6v6h3l-4.8 5-4.8-5h3z"]],
  upload: [["s","steel",I3R(3.5, 14.6, 17, 5.6, 1.8)],["w","","M7 17.4h2",1.6],["s","green","M10.2 14.2h3.6v-6h3L12 3.2l-4.8 5h3z"]],
  backup: [["s","blue","M4.6 5.8v11.6c0 1.7 3.3 3 7.4 3s7.4-1.3 7.4-3V5.8z"],["l","blue","M4.6 5.8c0 1.7 3.3 3 7.4 3s7.4-1.3 7.4-3-3.3-3-7.4-3-7.4 1.3-7.4 3z"],["w","","M4.8 11.4c1 1.4 3.8 2.3 7.2 2.3s6.2-.9 7.2-2.3",1.4],["f","green",I3C(16.3, 16.6, 1.1)]],
  restore: [["s","teal",I3C(12, 11.3, 8.6)],["w","","M7.4 11.3a4.6 4.6 0 1 0 1.4-3.3M7.3 6.4v2.1h2.1",1.9],["w","","M12 9v2.5l1.6 1.2",1.8]],
  folder: [["d","amber","M3 6.4A1.9 1.9 0 0 1 4.9 4.5h4l2 2h8.2A1.9 1.9 0 0 1 21 8.4v1H3z"],["s","amber",I3R(3, 8.6, 18, 11.4, 2)],["h","","M5 10.6h9.5v1.1H5z"]],
  folderSync: [["d","amber","M3 6.4A1.9 1.9 0 0 1 4.9 4.5h4l2 2h8.2A1.9 1.9 0 0 1 21 8.4v1H3z"],["s","amber",I3R(3, 8.6, 18, 11.4, 2)],["s","blue",I3C(16.6, 16.2, 4.6)],["w","","M14.6 15.4a2.2 2.2 0 0 1 3.7-.8l.4.4M18.7 17a2.2 2.2 0 0 1-3.7.8l-.4-.4",1.4]],
  save: [["s","blue","M5.4 3.5h10.4l3.8 3.8v11.4a1.6 1.6 0 0 1-1.6 1.6H5.4a1.6 1.6 0 0 1-1.6-1.6V5.1a1.6 1.6 0 0 1 1.6-1.6z"],["f","steel",I3R(7.6, 3.5, 7.4, 5, .8)],["d","blue",I3R(12.4, 4.4, 1.6, 3, .4)],["f","paper",I3R(6.6, 12.4, 10.8, 7.6, 1.2)],["k","steel","M8.6 15h6.8M8.6 17.5h4.4",1.3]],
  sample: [["s","violet","M10 2.8l1.9 4.9 4.9 1.9-4.9 1.9L10 16.4l-1.9-4.9-4.9-1.9 4.9-1.9z"],["s","amber","M17.6 12.4l.95 2.45 2.45.95-2.45.95-.95 2.45-.95-2.45-2.45-.95 2.45-.95z"],["s","pink","M5.4 15.6l.7 1.7 1.7.7-1.7.7-.7 1.7-.7-1.7-1.7-.7 1.7-.7z"]],
  trash: [["s","red","M5.8 7.4h12.4l-1 12a1.7 1.7 0 0 1-1.7 1.6H8.5a1.7 1.7 0 0 1-1.7-1.6z"],["s","steel",I3R(3.8, 4.4, 16.4, 2.8, 1.2)],["d","steel",I3R(9.5, 2.4, 5, 2.2, .8)],["w","","M10 10.6v6.6M14 10.6v6.6",1.6]],
  clockPlus: [["s","blue",I3C(10.4, 11.6, 8)],["f","paper",I3C(10.4, 11.6, 5.6)],["k","blue","M10.4 8.6v3.2l2 1.4",1.8],["s","green",I3C(17.6, 16.6, 4.4)],["w","","M17.6 14.6v4M15.6 16.6h4",1.7]],
  pencil: [["s","amber","M5.6 15.2 15.4 5.4l3.2 3.2-9.8 9.8z"],["s","pink","M15.4 5.4l1.3-1.3a1.6 1.6 0 0 1 2.3 0l.9.9a1.6 1.6 0 0 1 0 2.3l-1.3 1.3z"],["f","skin","M5.6 15.2l3.2 3.2-4.6 1.4z"],["d","ink","M4.2 19.8l.6-1.9 1.3 1.3z"],["h","","M7 14.4l8.7-8.7.7.7-8.7 8.7z"]],
  tag: [["s","amber","M3.4 4.6A1.2 1.2 0 0 1 4.6 3.4h6.6a2 2 0 0 1 1.4.6l7.6 7.6a2 2 0 0 1 0 2.8l-6 6a2 2 0 0 1-2.8 0L3.8 12.8a2 2 0 0 1-.4-1.4z"],["f","paper",I3C(8, 8, 1.8)],["h","","M5 5.2h4.8v1H5z"]],
  print: [["f","paper",I3R(7, 2.8, 10, 6, 1)],["s","steel",I3R(3.2, 8, 17.6, 8.4, 2)],["f","green",I3C(17.4, 11, .9)],["s","paper",I3R(7, 13.4, 10, 7.2, 1)],["k","steel","M9 16.2h6M9 18.4h4",1.2]],
  arrowL: [["s","blue",I3C(12, 11.3, 8.6)],["w","","M16.2 11.3H7.9M11.3 7.6l-3.7 3.7 3.7 3.7",2.2]],
  clock: [["s","blue",I3C(12, 11.3, 8.6)],["f","paper",I3C(12, 11.3, 6.2)],["k","blue","M12 7.8v3.6l2.4 1.6",2],["f","red",I3C(12, 11.4, 1)]],
  details: [["s","paper",I3R(3.6, 3.6, 16.8, 16.4, 2.2)],["f","blue","M5.8 3.6h12.4a2.2 2.2 0 0 1 2.2 2.2V8H3.6V5.8a2.2 2.2 0 0 1 2.2-2.2z"],["k","steel","M7 11.6h10M7 14.4h10M7 17.2h6",1.4]],
  part: [["l","amber","M12 2.8 20 7.3 12 11.8 4 7.3z"],["f","amber","M4 7.3l8 4.5v9.4l-8-4.6z"],["d","amber","M20 7.3l-8 4.5v9.4l8-4.6z"],["w","","M8 5.05l8 4.5",1.2]],
  clip: [["K","steel","M19.4 11.2l-7.1 7.2a4.4 4.4 0 0 1-6.2-6.2l7.6-7.6a2.9 2.9 0 0 1 4.1 4.1l-7.3 7.3a1.4 1.4 0 0 1-2-2l6.6-6.6",2.2]],
  grid: [["s","blue",I3R(3.6, 3.4, 7.6, 7.6, 1.8)],["s","green",I3R(12.8, 3.4, 7.6, 7.6, 1.8)],["s","amber",I3R(3.6, 12.6, 7.6, 7.6, 1.8)],["s","violet",I3R(12.8, 12.6, 7.6, 7.6, 1.8)]],
  undo: [["K","blue","M9 5.2 4.8 9.4 9 13.6M5.2 9.4h9.6a4.8 4.8 0 0 1 0 9.6H10",2.6]],
  eraser: [["s","pink","M3.9 14.4 12.6 5.7a2 2 0 0 1 2.8 0l3.3 3.3a2 2 0 0 1 0 2.8l-6 6H8.2z"],["s","paper","M3.9 14.4l3.9 3.9h4.5l3.1-3.1-7.1-7.1z"],["k","steel","M11 20h9",1.6]],
  /* pages */
  console: [["s","ink","M2.8 16.4a9.2 9.2 0 1 1 18.4 0 1.6 1.6 0 0 1-1.6 1.6H4.4a1.6 1.6 0 0 1-1.6-1.6z"],["c","green","M5.6 15.6a6.4 6.4 0 0 1 2.2-4.8",2.2],["c","amber","M9.4 9.8a6.4 6.4 0 0 1 5.2 0",2.2],["c","red","M16.2 10.8a6.4 6.4 0 0 1 2.2 4.8",2.2],["w","","M12 15.4l3-4.2",1.9],["f","paper",I3C(12, 15.4, 1.4)]],
  ros: [["s","kraft",I3R(4.4, 3.8, 15.2, 17, 2.2)],["f","paper",I3R(6.4, 6, 11.2, 12.8, 1.2)],["s","steel",I3R(8.6, 2.6, 6.8, 3.2, 1.2)],["k","green","M8.4 10l1.1 1.1 2-2.2M8.4 14.6l1.1 1.1 2-2.2",1.5],["k","steel","M13 10.2h2.8M13 14.8h2.8",1.4]],
  foreman: [["s","amber","M4.6 15.4a7.4 7.4 0 0 1 14.8 0z"],["d","amber",I3R(10.6, 6.4, 2.8, 5, 1)],["s","amber",I3R(2.6, 15, 18.8, 3.4, 1.6)],["h","","M7.2 12.6a5.4 5.4 0 0 1 2.6-3.6l.5.9a4.4 4.4 0 0 0-2.1 2.9z"]],
  manager: [["s","blue","M11.8 20.2a6 5.2 0 0 1 10.4-1.4V20.2z"],["s","skin",I3C(17, 10.6, 3)],["s","violet","M2.4 20.4a6.8 5.8 0 0 1 13.6 0z"],["s","skin",I3C(9.2, 8.8, 3.6)]],
  triage: [["s","steel",I3R(2.4, 6, 11.4, 9.4, 1.4)],["s","blue","M13.8 9h3.9a1.6 1.6 0 0 1 1.3.7l2 2.9a1.6 1.6 0 0 1 .3.9v1.9H13.8z"],["f","paper","M15.4 10.4h2.2l1.5 2.2h-3.7z"],["s","ink",I3C(6.6, 16.8, 2)],["s","ink",I3C(17.4, 16.8, 2)],["f","steel",I3C(6.6, 16.8, .8)],["f","steel",I3C(17.4, 16.8, .8)]],
  timelog: [["s","paper",I3R(3.4, 4.4, 17.2, 15.8, 2.4)],["f","red","M5.8 4.4h12.4a2.4 2.4 0 0 1 2.4 2.4V9.4H3.4V6.8a2.4 2.4 0 0 1 2.4-2.4z"],["k","ink","M8 2.8v3.4M16 2.8v3.4",1.8],["s","blue",I3C(15.4, 15, 4)],["w","","M15.4 13v2.1l1.3.9",1.4],["f","steel",I3R(6, 12, 2.4, 2.2, .5)],["f","steel",I3R(6, 15.8, 2.4, 2.2, .5)]],
  parts: [["l","kraft","M12 2.8 20 7.3 12 11.8 4 7.3z"],["f","kraft","M4 7.3l8 4.5v9.4l-8-4.6z"],["d","kraft","M20 7.3l-8 4.5v9.4l8-4.6z"],["c","paper","M8 5.05l8 4.5v3.8",1.6]],
  career: [["s","blue",I3R(3.4, 13, 4.4, 7.4, 1.1)],["s","green",I3R(9.8, 9.4, 4.4, 11, 1.1)],["s","violet",I3R(16.2, 12, 4.4, 8.4, 1.1)],["s","amber","M12 1.8l1.2 2.5 2.7.4-2 1.9.5 2.7L12 8l-2.4 1.3.5-2.7-2-1.9 2.7-.4z"]],
  /* device / theme */
  desktop: [["s","steel",I3R(2.6, 3.6, 18.8, 12.6, 2)],["f","blue",I3R(4.4, 5.4, 15.2, 9, 1)],["h","","M5.6 6.6h6v1h-6z"],["d","steel","M10 16.2h4l.7 3H9.3z"],["s","steel",I3R(7.4, 19.2, 9.2, 1.8, .9)]],
  tablet: [["s","steel",I3R(4.6, 2.8, 14.8, 18, 2.4)],["f","blue",I3R(6.4, 4.8, 11.2, 12.4, 1)],["f","paper",I3C(12, 19, .8)]],
  phone: [["s","steel",I3R(6.6, 2.6, 10.8, 18.6, 2.4)],["f","blue",I3R(8.2, 5, 7.6, 12.6, 1)],["f","paper",I3R(10.6, 3.6, 2.8, .8, .4)],["f","paper",I3C(12, 19.3, .7)]],
  sun: [["c","amber","M12 1.8v2.2M12 18.6v2.2M2 11.3h2.2M19.8 11.3H22M4.9 4.2l1.5 1.5M17.6 16.9l1.5 1.5M4.9 18.4l1.5-1.5M17.6 5.7l1.5-1.5",2],["s","amber",I3C(12, 11.3, 5)],["h","","M9.4 9.6a3.4 3.4 0 0 1 2.2-1.9l.2.9a2.4 2.4 0 0 0-1.5 1.3z"]],
  moon: [["s","violet","M19.8 14.6A8.4 8.4 0 0 1 9.4 3.4a8.6 8.6 0 1 0 10.4 11.2z"],["f","amber","M16.6 4.2l.5 1.2 1.2.5-1.2.5-.5 1.2-.5-1.2-1.2-.5 1.2-.5z"],["h","","M7.4 8a6.2 6.2 0 0 1 1.6-2.4l.5.7a5.2 5.2 0 0 0-1.3 2z"]],
  halfmoon: [["s","steel",I3C(12, 11.3, 8.4)],["f","ink","M12 2.9a8.4 8.4 0 0 1 0 16.8z"],["f","amber",I3C(8.4, 9.4, 1.2)]],
  /* RO header fields (job console) */
  tech: [["s","blue","M4.2 20.4a7.8 6.6 0 0 1 15.6 0z"],["s","skin",I3C(12, 8.4, 3.9)],["d","amber","M7.8 7.4a4.2 4.2 0 0 1 8.4 0z"],["s","amber",I3R(7, 6.8, 10, 1.6, .8)]],
  customer: [["s","steel",I3R(4, 4.6, 10.4, 15.6, 1.2)],["s","blue",I3R(14.4, 9.2, 5.8, 11, 1.2)],["w","","M7 8h1M10.4 8h1M7 11.4h1M10.4 11.4h1M7 14.8h1M10.4 14.8h1",1.6],["l","blue",I3R(16.2, 12, 2.2, 2, .4)]],
  vin: [["s","paper",I3R(2.6, 5, 18.8, 13, 2)],["k","ink","M6 8.4v6.6M8.4 8.4v6.6M10.2 8.4v6.6M12.8 8.4v6.6M15 8.4v6.6M16.8 8.4v6.6",1.4],["k","red","M5 11.7h14",1]],
  engHours: [["s","ink",I3C(12, 11.6, 8.6)],["f","paper",I3C(12, 11.6, 6.4)],["c","amber","M7.6 13.4a4.6 4.6 0 0 1 4.4-6.2",2],["k","red","M12 11.6l3.2-2.6",1.8],["f","ink",I3C(12, 11.6, 1.2)]],
  miles: [["s","steel","M8.6 3h6.8l5.4 17.4H3.2z"],["w","","M12 5v2.4M12 10.2v2.6M12 15.6v2.8",1.8]],
  unit: [["s","steel",I3R(2.4, 6, 11.4, 9.4, 1.4)],["s","red","M13.8 9h3.9a1.6 1.6 0 0 1 1.3.7l2 2.9a1.6 1.6 0 0 1 .3.9v1.9H13.8z"],["f","paper","M15.4 10.4h2.2l1.5 2.2h-3.7z"],["s","ink",I3C(6.6, 16.8, 2)],["s","ink",I3C(17.4, 16.8, 2)]],
  caseNo: [["d","teal","M3 6.4A1.9 1.9 0 0 1 4.9 4.5h4l2 2h8.2A1.9 1.9 0 0 1 21 8.4v1H3z"],["s","teal",I3R(3, 8.6, 18, 11.4, 2)],["w","","M10 11.4l-.8 6M13.6 11.4l-.8 6M8.4 13.4h6.6M8 15.6h6.6",1.4]],
  opened: [["s","paper",I3R(3.4, 4.4, 17.2, 15.8, 2.4)],["f","green","M5.8 4.4h12.4a2.4 2.4 0 0 1 2.4 2.4V9.4H3.4V6.8a2.4 2.4 0 0 1 2.4-2.4z"],["k","ink","M8 2.8v3.4M16 2.8v3.4",1.8],["k","green","M12 11.8v5.6M9.2 14.6h5.6",1.9]],
  closed: [["s","paper",I3R(3.4, 4.4, 17.2, 15.8, 2.4)],["f","blue","M5.8 4.4h12.4a2.4 2.4 0 0 1 2.4 2.4V9.4H3.4V6.8a2.4 2.4 0 0 1 2.4-2.4z"],["k","ink","M8 2.8v3.4M16 2.8v3.4",1.8],["k","green","M8.8 14.4l2.2 2.2 4.2-4.4",2]],
  days: [["s","kraft",I3R(5, 2.6, 14, 2.4, 1)],["s","kraft",I3R(5, 18, 14, 2.4, 1)],["f","paper","M7 5h10v1.4a5 5 0 0 1-2.5 4.3l-1.3.8 1.3.8A5 5 0 0 1 17 16.6V18H7v-1.4a5 5 0 0 1 2.5-4.3l1.3-.8-1.3-.8A5 5 0 0 1 7 6.4z"],["f","amber","M9.2 16.6c.6-1.5 1.7-2.2 2.8-2.2s2.2.7 2.8 2.2z"],["f","amber","M9.8 7.6h4.4l-2.2 2.2z"]],
  location: [["s","red","M12 2.6a6.8 6.8 0 0 1 6.8 6.8c0 4.8-6.8 11.2-6.8 11.2S5.2 14.2 5.2 9.4A6.8 6.8 0 0 1 12 2.6z"],["f","paper",I3C(12, 9.4, 2.6)],["h","","M8 7.4a4.6 4.6 0 0 1 2.4-2.6l.4.9a3.6 3.6 0 0 0-1.9 2z"]],
  keyTag: [["s","amber",I3C(8, 9, 5)],["f","paper",I3C(6.8, 7.8, 1.4)],["K","amber","M11.4 12.4l8.4 8.4M16.4 17.4l2-2M18.6 19.6l1.6-1.6",2.4]],
  /* menus */
  addPart: [["l","kraft","M10.6 2.8 17.8 6.8 10.6 10.8 3.4 6.8z"],["f","kraft","M3.4 6.8l7.2 4v8.4l-7.2-4z"],["d","kraft","M17.8 6.8l-7.2 4v8.4l7.2-4z"],["s","green",I3C(17.8, 16.8, 4.3)],["w","","M17.8 14.8v4M15.8 16.8h4",1.7]],
  addJob: [["K","steel","M14.2 4.6a4 4 0 0 0-4.8 5.2l-5.6 5.6a1.7 1.7 0 0 0 2.4 2.4l5.6-5.6a4 4 0 0 0 5.2-4.8l-2.4 2.4-2.2-.2-.2-2.2z",2],["s","green",I3C(17.8, 16.8, 4.3)],["w","","M17.8 14.8v4M15.8 16.8h4",1.7]],
  eye: [["s","paper","M1.8 11.3S5.4 4.6 12 4.6s10.2 6.7 10.2 6.7S18.6 18 12 18 1.8 11.3 1.8 11.3z"],["f","blue",I3C(12, 11.3, 4)],["f","ink",I3C(12, 11.3, 1.9)],["f","paper",I3C(13.3, 10, .9)]],
  pdf: [["s","paper","M6.2 2.8h8.2l4.4 4.4v12.2a1.4 1.4 0 0 1-1.4 1.4H6.2a1.4 1.4 0 0 1-1.4-1.4V4.2a1.4 1.4 0 0 1 1.4-1.4z"],["l","steel","M14.4 2.8v3a1.4 1.4 0 0 0 1.4 1.4h3z"],["s","red",I3R(3, 11.4, 13.6, 6.6, 1.4)],["w","","M5.4 16.4v-3h1.2a1 1 0 0 1 0 2H5.4M9.2 16.4v-3h.8a1.5 1.5 0 0 1 0 3zM13 16.4v-3h1.8M13 14.9h1.4",1.1]],
  open: [["d","amber","M3 6.4A1.9 1.9 0 0 1 4.9 4.5h4l2 2h7.2A1.9 1.9 0 0 1 20 8.4v1.4H3z"],["s","amber","M2.6 11.4a1.4 1.4 0 0 1 1.4-1.6h16.4a1.4 1.4 0 0 1 1.4 1.7l-1.6 7.4a1.6 1.6 0 0 1-1.6 1.3H5a1.6 1.6 0 0 1-1.6-1.4z"]],
  reset: [["K","red","M5 11.3a7 7 0 1 0 2.1-5M6.8 2.8v3.6h3.6",2.4]],
  /* inventory */
  scan: [["s","steel","M4 9.4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v2.6l-3.4 1.8-1.6 6.4a1.4 1.4 0 0 1-1.4 1.1H8.2a1.4 1.4 0 0 1-1.4-1.6l.9-5.9H6a2 2 0 0 1-2-2z"],["c","red","M17.6 9.4l3.8-2M17.6 11.2l3.8 1",1.8],["f","red",I3R(6, 9.2, 9, 1.8, .9)]],
  kit: [["s","red",I3R(2.6, 8, 18.8, 12.2, 2)],["k","ink","M8.6 8V5.8a1.4 1.4 0 0 1 1.4-1.4h4a1.4 1.4 0 0 1 1.4 1.4V8",1.9],["s","steel",I3R(10, 11.4, 4, 3.4, .8)],["d","red","M2.6 12.6h7.4v1.2H2.6zM14 12.6h7.4v1.2H14z"]],
  box: [["l","kraft","M12 2.8 20 7.3 12 11.8 4 7.3z"],["f","kraft","M4 7.3l8 4.5v9.4l-8-4.6z"],["d","kraft","M20 7.3l-8 4.5v9.4l8-4.6z"],["c","paper","M8 5.05l8 4.5v3.8",1.6]],
  story: [["s","paper",I3R(3.4, 3.6, 13.4, 16.6, 2)],["k","steel","M6.4 8h7.4M6.4 11h7.4M6.4 14h4.4",1.5],["s","amber","M12.4 19.4l7.6-7.6 2.3 2.3-7.6 7.6-3 .7z"],["f","pink","M20 11.8l.9-.9a1.1 1.1 0 0 1 1.5 0l.8.8a1.1 1.1 0 0 1 0 1.5l-.9.9z"]],
  /* chrome */
  gear: [["s","steel","M10.3 2.4h3.4l.5 2.4 1.6.7 2-1.4 2.4 2.4-1.4 2 .7 1.6 2.4.5v3.4l-2.4.5-.7 1.6 1.4 2-2.4 2.4-2-1.4-1.6.7-.5 2.4h-3.4l-.5-2.4-1.6-.7-2 1.4-2.4-2.4 1.4-2-.7-1.6-2.4-.5v-3.4l2.4-.5.7-1.6-1.4-2 2.4-2.4 2 1.4 1.6-.7z"],["f","blue",I3C(12, 11.8, 3.6)],["f","paper",I3C(12, 11.8, 1.5)]],
  bell: [["s","amber","M12 2.8a6.2 6.2 0 0 1 6.2 6.2v4.4l1.8 2.8a.8.8 0 0 1-.7 1.2H4.7a.8.8 0 0 1-.7-1.2l1.8-2.8V9A6.2 6.2 0 0 1 12 2.8z"],["s","kraft",I3C(12, 18.8, 2.2)],["h","","M8.2 8.6a4.2 4.2 0 0 1 2.4-3.4l.4.9a3.2 3.2 0 0 0-1.8 2.6z"]],
  chat: [["s","blue","M4.4 4.2h15.2a2 2 0 0 1 2 2v9.2a2 2 0 0 1-2 2H11l-4.6 3.4v-3.4h-2a2 2 0 0 1-2-2V6.2a2 2 0 0 1 2-2z"],["f","paper",I3C(8, 10.8, 1.2)],["f","paper",I3C(12, 10.8, 1.2)],["f","paper",I3C(16, 10.8, 1.2)]],
  search: [["K","steel","M15.6 15.2l5 5",3],["s","blue",I3C(10.4, 10.2, 7)],["f","paper",I3C(10.4, 10.2, 4.8)],["h","","M7.6 9.6a3 3 0 0 1 2.2-2.2l.2.8a2.2 2.2 0 0 0-1.6 1.6z"]],
  zoomIn: [["K","steel","M15.6 15.2l5 5",3],["s","blue",I3C(10.4, 10.2, 7)],["f","paper",I3C(10.4, 10.2, 4.8)],["k","green","M10.4 7.8v4.8M8 10.2h4.8",1.9]],
  zoomOut: [["K","steel","M15.6 15.2l5 5",3],["s","blue",I3C(10.4, 10.2, 7)],["f","paper",I3C(10.4, 10.2, 4.8)],["k","red","M8 10.2h4.8",1.9]],
  touch: [["s","skin","M9.6 11V5.2a1.6 1.6 0 0 1 3.2 0v5l4.8.9a2 2 0 0 1 1.6 2.3l-.8 4.6a2.6 2.6 0 0 1-2.6 2.2h-3.6a2.6 2.6 0 0 1-2-1l-3.4-4.2a1.5 1.5 0 0 1 2.2-2z"],["c","blue","M6.4 6.8a5 5 0 0 1 9.6 0",1.6]],
  ribbon: [["s","paper",I3R(2.6, 7.4, 18.8, 9, 2)],["f","green",I3R(4.4, 9.4, 5.6, 5, 1)],["f","amber",I3R(10.6, 9.4, 3, 5, 1)],["f","blue",I3R(14.2, 9.4, 5.4, 5, 1)]],
  viewAs: [["s","violet","M2.4 20.4a6.8 5.8 0 0 1 13.6 0z"],["s","skin",I3C(9.2, 8.8, 3.6)],["s","blue",I3C(17.4, 14.6, 4.2)],["f","paper","M15.4 14.6s.8-1.6 2-1.6 2 1.6 2 1.6-.8 1.6-2 1.6-2-1.6-2-1.6z"]],
  bolt: [["s","amber","M13.6 2.4 5 13.2h5.8L9.4 21.6 19 9.8h-6z"],["h","","M12.2 5.2 7.6 11.2h1.3l3.6-4.8z"]],
  keys: [["s","steel",I3R(2.4, 5.4, 19.2, 13.4, 2.2)],["f","paper",I3R(5, 8.4, 2.4, 2.2, .5)],["f","paper",I3R(8.8, 8.4, 2.4, 2.2, .5)],["f","paper",I3R(12.6, 8.4, 2.4, 2.2, .5)],["f","paper",I3R(16.4, 8.4, 2.4, 2.2, .5)],["f","blue",I3R(7.4, 12.6, 9.2, 2.4, .6)]],
  history: [["s","violet",I3C(12, 11.3, 8.6)],["w","","M7.4 11.3a4.6 4.6 0 1 0 1.4-3.3M7.3 6.4v2.1h2.1",1.9],["w","","M12 9v2.5l1.6 1.2",1.8]],
  copy: [["s","steel",I3R(3.6, 3.4, 11.8, 11.8, 2)],["s","blue",I3R(8.8, 8.6, 11.8, 11.8, 2)],["h","","M10.8 10.6h5.4v1h-5.4z"]],
  send: [["s","blue","M3 11.4 20.6 3.2l-5.2 17.2-3.6-6.8z"],["d","blue","M11.8 13.6l8.8-10.4-6.6 12.6z"],["h","","M5.4 11.2 17 5.6l-7.4 7z"]],
  newRo: [["s","green",I3C(12, 11.3, 8.6)],["w","","M12 7.4v7.8M8.1 11.3h7.8",2.6]],
  free: [["s","violet",I3R(3, 3, 18, 16.6, 3)],["w","","M7.4 9V6.8h2.2M16.6 9V6.8h-2.2M7.4 13.6v2.2h2.2M16.6 13.6v2.2h-2.2",1.8]],
  exit: [["s","red",I3C(12, 11.3, 8.6)],["w","","M9 8.3l6 6M15 8.3l-6 6",2.2]],
  spark: [["s","violet","M11 2.8l1.9 4.9 4.9 1.9-4.9 1.9L11 16.4l-1.9-4.9-4.9-1.9 4.9-1.9z"],["s","amber","M18 13.6l.9 2.3 2.3.9-2.3.9-.9 2.3-.9-2.3-2.3-.9 2.3-.9z"]],
  shrink: [["s","steel",I3R(2.6, 3.6, 18.8, 16, 2.4)],["f","blue",I3R(4.4, 5.4, 5, 12.4, 1)],["w","","M15.6 9.4l-2.4 2.3 2.4 2.3",1.8]]
};
function I3H(name, w, h, cls){ return SF[name] ? sfIcon(SF[name], w, cls) : (I3[name] ? i3(I3[name], w, h, cls) : ""); }

var DEVICE_IC = {
  desktop: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2.5" y="4" width="19" height="13" rx="2"/><path d="M8 21h8M12 17v4"/></svg>',
  tablet:  '<svg width="14" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4.5" y="2.5" width="15" height="19" rx="2"/><path d="M11 18h2"/></svg>',
  phone:   '<svg width="12" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="6.5" y="2.5" width="11" height="19" rx="2"/><path d="M11 18h2"/></svg>'
};
var deviceLast = null;
window.addEventListener("resize", function(){
  if(DEVICE_SETTING !== "auto") return;
  var m = deviceMode(); if(deviceLast !== null && m !== deviceLast){ applyDevice(); render(); } deviceLast = m;
});

/* Large and Shop floor scale the page with CSS zoom. getBoundingClientRect and the window size are in screen
   pixels, but left/top on a popover are in zoomed CSS pixels, so popover placement converts through these. */
function ZF(){ var s = document.documentElement.getAttribute("data-size"); return s === "floor" ? 1.35 : s === "large" ? 1.15 : 1; }
function zr(r){ var z = ZF(); return z === 1 ? r : { left: r.left / z, right: r.right / z, top: r.top / z, bottom: r.bottom / z, width: r.width / z, height: r.height / z }; }
/* Size: Normal, Large, or Shop floor (gloves, tablet). Saved on this device only (localStorage). */
var SIZES = ["normal","large","floor"];
function sizeMode(){ return SIZES.indexOf(UI.size) > -1 ? UI.size : "normal"; }
function bigTouchOn(){
  if(sizeMode() !== "normal") return true;
  if(UI.bigTouch === true || UI.bigTouch === false) return UI.bigTouch;
  if(deviceMode() !== "desktop") return true;           /* tablet and phone are touch layouts */
  return !!(window.matchMedia && window.matchMedia("(pointer: coarse)").matches);
}
function applyBigTouch(){
  applyDevice();
  var on = bigTouchOn();
  document.documentElement.classList.toggle("big-touch", on);
  var sz = sizeMode();
  if(document.documentElement.getAttribute("data-size") !== sz) document.documentElement.setAttribute("data-size", sz);
  var host = document.querySelector(".jc-host"); if(host){ host.classList.toggle("big-touch", on); host.classList.toggle("dark-ui", isDarkTheme()); host.classList.toggle("th-at", /^at[ld]$/.test(resolvedTheme())); host.classList.toggle("th-iv", /^iv[ld]$/.test(resolvedTheme())); host.classList.toggle("pal-vv", /^vv/.test(THEME)); host.classList.toggle("size-large", sz === "large"); host.classList.toggle("size-floor", sz === "floor"); }
}
/* Theme: one button that cycles system -> light -> dark, wearing the mode it is in.
   It used to be two clicks deep in the options menu, which is a lot for something
   you flip whenever you walk from the bay into the office. */
var THEME_ORDER = ["ivl","ivd","vvl","vvd"];   /* the design system's light and dark */
var THEME_ICON_LIGHT = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4.2" fill="currentColor" opacity=".3" stroke="none"/><circle cx="12" cy="12" r="4.2"/><path d="M12 2.8v2M12 19.2v2M2.8 12h2M19.2 12h2M5.5 5.5l1.4 1.4M17.1 17.1l1.4 1.4M5.5 18.5l1.4-1.4M17.1 6.9l1.4-1.4"/></svg>';
var THEME_ICON_DARK = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 14.2A8.2 8.2 0 0 1 9.8 4a8.5 8.5 0 1 0 10.2 10.2z" fill="currentColor" opacity=".25" stroke="none"/><path d="M20 14.2A8.2 8.2 0 0 1 9.8 4a8.5 8.5 0 1 0 10.2 10.2z"/></svg>';
var THEME_ICON = { ivl:THEME_ICON_LIGHT, ivd:THEME_ICON_DARK };
var THEME_NAME = {};
THEME_IDS.forEach(function(k){ THEME_NAME[k] = THEMES[k].name; });
function themeLabel(m){ return THEME_NAME[m] || m; }
/* ---- RO context in the header ----
   The RO band below keeps the controls — status dropdown, customer, options, the rail
   toggle. Its readouts live up here instead, in the space the header was wasting, so
   the band can stay short. Purely a readout: clicking it opens Details on the band. */
/* The RO section left the header entirely — number, status, numbers, customer and
   options all live in the operations toolbar now. Kept as a stub so the header
   assembly and the spacer logic need no special case. */
function roCtxHtml(){
  return "";
}


/* ---- command bar (Ctrl+K) ----
   The RO search lives in the rail on one page. This is the same matcher reachable from
   anywhere: type an RO number, VIN, unit, customer or part and jump straight at it.
   UI.palette is {q, sel} while open and null while closed. */
function paletteResults(q){
  var f = String(q||"").trim().replace(/^TEC:\s*/i, "");
  if(!f) return sortedROs().slice(0, 8).map(function(ro){ return { ro:ro, why:"" }; });
  return sortedROs().filter(function(ro){ return roMatch(ro, f) !== null; })
    .slice(0, 12)
    .map(function(ro){ return { ro:ro, why: roMatch(ro, f) || "" }; });
}
function paletteHtml(){
  var P = UI.palette; if(!P) return "";
  var res = paletteResults(P.q);
  var h = '<div class="pal-wrap" data-action="palette-close"><div class="pal" data-stop="1" role="dialog" aria-label="Find a repair order">'
    + '<div class="pal-in">'
    +   '<span class="pal-ico" aria-hidden="true">' + I3H('search', 17, 17) + '</span>'
    +   '<input id="pal-q" autocomplete="off" spellcheck="false" placeholder="Search number, customer, truck, year, VIN…" value="'+esc(P.q||"")+'" aria-label="Search repair orders">'
    +   '<kbd class="pal-esc">esc</kbd>'
    + '</div>';
  if(!res.length){
    h += '<div class="pal-empty">Nothing matches “'+esc(P.q)+'”.</div>';
  } else {
    h += '<div class="pal-list" role="listbox">';
    res.forEach(function(r, i){
      var st = roStatus(r.ro);
      h += '<button class="pal-row'+(i===P.sel?" sel":"")+'" role="option" aria-selected="'+(i===P.sel?"true":"false")
        + '" data-action="palette-pick" data-ro="'+r.ro.id+'">'
        + (typeof trkThumb === "function" ? '<span class="pal-trk">' + trkThumb(r.ro) + '</span>' : '<span class="pal-ro mono">'+esc(tgNum(r.ro))+'</span>')
        + '<span class="pal-mid"><span class="pal-cust">'+esc(r.ro.customerName||"—")+'</span>'
        +   (typeof trkLabel === "function" ? '<span class="pal-sub"><span class="mono">'+esc(tgNum(r.ro))+'</span> · '+esc(trkLabel(r.ro))+(r.ro.unitNumber ? ' · Unit '+esc(r.ro.unitNumber) : '')+'</span>' : '')
        +   (r.why ? '<span class="pal-why mono">'+esc(r.why)+'</span>' : '')
        + '</span>'
        + '<span class="pal-st">'+pgSt('ro', st.status, { cls: 'sm', sub: st.sub ? '· ' + st.sub : '' })+'</span>'
        + '</button>';
    });
    h += '</div>'
      + '<div class="pal-foot"><kbd>↑</kbd><kbd>↓</kbd> move <kbd>↵</kbd> open <span class="pal-count mono">'+res.length+'</span></div>';
  }
  return h + '</div></div>';
}
function openPalette(){ UI.palette = { q:"", sel:0 }; UI.notifOpen=false; UI.appMenu=false; render(); }
function palettePick(roId){
  UI.palette = null;
  if(!roId) { render(); return; }
  UI.view = "ros"; UI.selectedRo = roId; UI.roFilter = "";
  render();
}
function paletteMove(d){
  var P = UI.palette; if(!P) return;
  var n = paletteResults(P.q).length; if(!n) return;
  P.sel = (P.sel + d + n) % n;
  render();
}

/* ---- page switcher ----
   One button, wearing the icon of the page you are on, that opens a vertical list down
   the left edge. The row of five pills is gone; this gives the header its left side back
   and the list has room for full names instead of collapsing labels on hover. */
var NAV_PAGES = [["tech","Technician"],["ros","Repair Orders"],["warranty","Warranty"],["fixes","Fixes"],["foreman","Foreman"],["manager","Manager"],["triage","Triage"],["rolist","RO List"],["assets","Assets"],["fleets","Fleets"],["library","Library"],["timelog","Time Log"],["parts","Parts"],["inventory","Inventory"],["career","Career"],["admin","Admin"]];
