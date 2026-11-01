/* Parsec · library · read-files.js
   Reading a file for the Library: a PDF’s text and where each piece sits on the page (pdf.js), a screenshot through the built-in reader.
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   libReadFile libReadPdf libDedupe (3 functions)
   uses       import/
*/
/* ============================== reading a file for the Library (Parsec 17.1) ==============================
   libReadFile(file) → { text, pages }: a PDF's text the way pdfToText builds it, plus every text item with its place on
   the page (pages, for the FTB table); a screenshot through the built-in reader; anything else by its name alone.
   pdf.js is the one New RO already uses (loadPdfJs: kept in the shop folder after the first time). */
function libReadFile(file){
  var name = String(file && file.name || "");
  if(/pdf/i.test(file && file.type || "") || /\.pdf$/i.test(name)) return libReadPdf(file);
  if(/^image\//.test(file && file.type || "") || /\.(png|jpe?g|webp|bmp)$/i.test(name))
    return ocrImages([file]).then(function(t){ return { text: cleanOcrText(t), pages: null }; }, function(){ return { text: "", pages: null }; });
  if(/^text\//.test(file && file.type || "") || /\.(txt|csv)$/i.test(name)) return file.text().then(function(t){ return { text: t, pages: null }; }, function(){ return { text: "", pages: null }; });   /* 17.1: a code list saved as text */
  return Promise.resolve({ text: "", pages: null });
}
function libReadPdf(file){
  return Promise.all([loadPdfJs(), file.arrayBuffer()]).then(function(x){
    return x[0].getDocument({ data: new Uint8Array(x[1]) }).promise;
  }).then(function(pdf){
    var P = [];
    for(var p = 1; p <= pdf.numPages; p++) P.push(pdf.getPage(p).then(function(pg){
      var h = pg.getViewport({ scale: 1 }).height;
      return pg.getTextContent().then(function(tc){ return { h: h, tc: tc }; });
    }));
    return Promise.all(P).then(function(all){ return { n: pdf.numPages, all: all }; });
  }).then(function(r){
    var out = [], pages = [];
    r.all.forEach(function(pg){
      var items = [], rows = [];
      libDedupe(pg.tc.items.filter(function(it){ return it.str && it.str.trim(); }).map(function(it){ return { x: it.transform[4], y: it.transform[5], w: it.width || Math.abs(it.transform[0] || 8) * 0.5 * it.str.length, s: it.str }; }))   /* no width given → about half the font size a letter */
        .forEach(function(it){
          items.push({ x: it.x, y: pg.h - it.y, w: it.w, s: it.s });
          var row = rows.filter(function(rw){ return Math.abs(rw.y - it.y) < 3; })[0];
          if(!row){ row = { y: it.y, items: [] }; rows.push(row); }
          row.items.push(it);
        });
      /* the same lines pdfToText gives: top to bottom, cells far apart split by a tab */
      rows.sort(function(a, b){ return b.y - a.y; });
      rows.forEach(function(rw){
        rw.items.sort(function(a, b){ return a.x - b.x; });
        var line = "", end = null;
        rw.items.forEach(function(it){ if(end !== null){ var gap = it.x - end; line += gap > 14 ? "\t" : (gap > 1.5 || gap < -1 ? " " : ""); } line += it.s; end = it.x + it.w; });
        out.push(line);
      });
      pages.push(items);
    });
    return { text: out.join("\n"), pages: pages, n: r.n };
  });
}
/* Bold headings in Volvo's PDFs are drawn twice, a hair apart; reading both doubles every letter ("4 43 30 0").
   The second copy — same text, within about a point — is dropped. */
function libDedupe(items){
  var keep = [], near = {};
  items.forEach(function(it){
    var k = it.s + "|" + Math.round(it.y);
    var L = (near[k] || []).concat(near[it.s + "|" + (Math.round(it.y) - 1)] || [], near[it.s + "|" + (Math.round(it.y) + 1)] || []);
    if(L.some(function(o){ return Math.abs(o.x - it.x) < 1.2 && Math.abs(o.y - it.y) < 1.2; })) return;
    (near[k] = near[k] || []).push(it); keep.push(it);
  });
  return keep;
}
