/* Parsec · import/new-ro · dialog-layout.js
   The one extraction window's parts (17.3): the slim strip of files read, the Found line, the RO as a ticket, the list of things to check and the Check view, where everything goes (New RO, an open RO, Inventory, the Library), documents and photos, the footer.
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   lyEmptyRow lyThumb lyStrip lyCounts lyPl lyFound lyChecks lyNote lyCheckView lyTargetLabel lyTargetMenu lyExtras … (15 functions, 2 constants)
   uses       import/ kit/ pages/triage/ ro/
*/
  /* ============================== the one extraction window (Parsec 17.3) ==============================
     One window reads everything about a job — the case page, screenshots, PDFs, a parts quote, a bulletin, photos — and
     sorts each into place. The files sit in a slim strip across the top (a thumbnail and a short name); the RO reads like a
     ticket (RO, customer and status first, then the truck, dates, shop and contact in short rows, empty fields out of the
     way); anything Parsec isn't sure of is marked and counted, and Check walks through them one at a time. The chip in the
     header says where it all goes. No coloured rows: plain paper, thin lines, a small amber mark only where it needs you. */
  var TICKET = [
    ["Truck", ["year", "make", "model", "color", "vin", "unitNumber", "chassis", "engineType", "engineSerial", "mileage", "engineHours", "buildDate", "warrantyStart"]],
    ["Dates", ["dateOpened", "promisedAt", "followUpAt"]],
    ["Shop", ["caseNumber", "custNo", "createdBy", "poNumber", "authNumber", "techSupportCase", "shopSupplies", "keyTag", "location", "department"]],
    ["Contact", ["contactName", "contactPhone", "contactEmail", "driverName", "driverPhone"]],
    ["Story", ["caseComplaint", "caseCause", "caseCorrection"]]
  ];
  var TICKET_TOP = ["roNumber", "customerName", "status"];
  function lyEmptyRow(r){ return (r.fin === "" || r.fin == null) && !(D.new && (r.k === "roNumber" || r.k === "customerName")) && r.k !== "status"; }
  /* the files read so far: a thumbnail, a short name, the x to take one out */
  function lyThumb(p, i){
    var pic = p.url ? '<img src="' + esc(p.url) + '" alt="">' : '<span class="ix-tl">' + (p.kind === "pdf" ? '<i></i><i></i><i></i><b>PDF</b>' : '<i></i><i></i><i></i><i></i>') + '</span>';
    var nm = p.role === "photo" ? "Photo" : p.role === "doc" ? (p.num || "Document") : p.kind === "image" ? "Screenshot" : p.kind === "pdf" ? "PDF" : "Pasted";
    return '<div class="ix-pc' + (p.nw ? ' nw' : '') + (p.kind === "text" ? ' txt' : '') + '" tabindex="0" data-pc="' + i + '" title="' + esc(p.name + " — " + p.what) + '">' + pic
      + '<span class="ix-pn">' + esc(nm) + '</span><button class="ix-x0" data-ix="rmpc" data-i="' + i + '" title="Take this out" aria-label="Take out ' + esc(p.name) + '">' + ic("x", 11) + '</button></div>';
  }
  function lyStrip(phone){
    return '<div class="ix-src ix-drop" tabindex="0" data-ix="drop" aria-label="Files read — paste or drop more here">'
      + D.pieces.map(lyThumb).join("")
      + '<button class="ix-add" data-ix="shots" title="Add screenshots or photos" aria-label="Add screenshots or photos">' + ic("image", 16) + '</button>'
      + '<button class="ix-add" data-ix="pdf" title="Add a PDF" aria-label="Add a PDF">' + ic("doc", 16) + '</button>'
      + (phone ? '<textarea class="ix-paste" data-ix-paste rows="1" placeholder="Paste more text"></textarea>' : '<span class="ix-hint">Paste or drop more</span>')
      + '</div>';
  }
  function lyCounts(Pl){
    var nParts = Pl.ops.reduce(function(a, P){ return a + (P.on ? P.parts.length : 0); }, 0);
    return { fields: Pl.rows.filter(function(r){ return r.fin !== "" && r.fin != null && r.bd !== "same0"; }).length, ops: Pl.ops.filter(function(P){ return P.on; }).length, parts: nParts,
      notes: Pl.notes.length, docs: D.pieces.filter(function(p){ return p.role === "doc" && !p.off; }).length, photos: D.pieces.filter(function(p){ return p.role === "photo" && !p.off; }).length };
  }
  function lyPl(n, w){ return n + " " + w + (n === 1 ? "" : "s"); }
  /* Found: what came in, each a jump to its section */
  function lyFound(Pl, upd, C){
    var K = lyCounts(Pl), b = [];
    if(K.fields) b.push(["ix-s-ro", "RO"]); if(K.ops) b.push(["ix-s-ops", lyPl(K.ops, "operation")]); if(K.parts) b.push(["ix-s-ops", lyPl(K.parts, "part")]);
    if(K.docs) b.push(["ix-s-docs", lyPl(K.docs, "document")]); if(K.photos) b.push(["ix-s-ph", lyPl(K.photos, "photo")]); if(K.notes) b.push(["ix-s-notes", lyPl(K.notes, "note")]);
    if(D.acc.totals) b.push(["ix-s-tot", "totals"]);
    var seg = upd ? '<div class="ix-seg" role="group" aria-label="Show"><button data-ix="only" data-v="0" aria-pressed="' + !D.only + '">Everything</button><button data-ix="only" data-v="1" aria-pressed="' + D.only + '">Changes only</button></div>' : '';
    return '<div class="ix-found"><span class="ix-fd" data-fd>' + (b.length ? '<b>Found</b>' + b.map(function(x, i){ return (i ? '<i>·</i>' : '') + '<button data-ix="jump" data-to="' + x[0] + '">' + esc(x[1]) + '</button>'; }).join("") : '<b>Found</b> nothing yet') + '</span>' + seg + '</div>';
  }
  /* what to check: every value Parsec isn't sure of, as a list Check walks through */
  function lyChecks(Pl){
    var L = [], rows = Pl.rows, lab = function(k){ var r = rows.filter(function(x){ return x.k === k; })[0]; return r ? r.s[1] : k; };
    rows.forEach(function(r){
      var m = chkField(r.k, rows) || (r.k === "vin" && r.fin && !vinValid(r.fin) ? "the check digit doesn’t match — a character is likely misread" : "");
      var c = r.k === "customerName" && r.fin ? mtCustomer(r.fin) : "";
      if(c && !m) m = "a customer on file is spelled " + c;
      if(m) L.push({ id: "f:" + r.k + ":" + r.fin, k: r.k, label: lab(r.k), val: r.fin, msg: m, fix: c || "" });
    });
    Pl.ops.forEach(function(P){ if(!P.on) return; var o = P.o, f = P.f, hrs = f.quoted ? f.quoted.fin : o.hours, pr = f.estCost ? f.estCost.fin : o.price, nm = "Op " + (o.no || "") + " · " + (o.name || "");
      var h = chkOpHours(hrs, pr, o.rate); if(h) L.push({ id: "h:" + opKey(o) + ":" + hrs, label: nm, val: (+hrs).toFixed(1) + " h", msg: h, opk: opKey(o) });
      P.parts.forEach(function(q){ var m = chkPart(q.f.qty.fin, q.f.price.fin, q.f.core && q.f.core.fin, q.p.ext), k = mtPart(q.p.pn);
        if(m || k) L.push({ id: "p:" + opKey(o) + ":" + (q.p.pn || q.p.desc), label: nm + " · " + (q.p.pn || q.p.desc), val: q.p.pn || q.p.desc, msg: m || "the shop has used " + k + " — one character off" }); }); });
    return L.filter(function(x){ return !(D.okd || {})[x.id]; });
  }
  function lyNote(L){
    if(!L.length) return D.pieces.length && D.hadChk ? '<div class="ix-ok">' + ic("check", 13) + '<span>Everything Parsec wasn’t sure of has been checked.</span></div>' : '';
    D.hadChk = true;
    return '<div class="ix-note1">' + ic("warn", 15) + '<p><b>' + (L.length === 1 ? '1 thing to check.' : L.length + ' things to check.') + '</b> <span>Parsec wasn’t sure of ' + (L.length === 1 ? 'this value' : 'these values') + ' — each is marked below.</span></p><button class="ix-btn" data-ix="check">Check</button></div>';
  }
  /* Check: one value at a time — what was read, why it's marked, the box to fix it */
  function lyCheckView(L){
    var i = Math.min(D.checking, L.length - 1), c = L[i]; if(!c) return "";
    var r = c.k ? D.rowsNow.filter(function(x){ return x.k === c.k; })[0] : null;
    return '<div class="ix-chkv" role="region" aria-label="Check ' + esc(c.label) + '"><div class="ix-chkt"><button class="ix-lk" data-ix="chkback">‹ Back to the list</button><span class="ix-sp"></span><span class="ix-dots">' + L.map(function(x, j){ return '<i class="' + (j === i ? 'on' : '') + '"></i>'; }).join("") + '</span><span>' + (i + 1) + ' of ' + L.length + '</span></div>'
      + '<div class="ix-chkb"><h3>' + esc(c.label) + '</h3><span class="ix-ck-k">Parsec read</span><div class="ix-ck-v mono">' + esc(c.val) + '</div><p class="ix-ck-why">' + esc(c.msg) + '</p>'
      + (r ? '<label class="ix-ck-k" for="ix-ck-in">It should say</label><div class="ix-ck-in">' + fieldInput(r).replace('class="ix-in', 'id="ix-ck-in" class="ix-in') + '</div>' : '<p class="ix-ck-k">Change it in the operation below once you’re back in the list, or mark it right.</p>')
      + '<div class="ix-ck-b">' + (c.fix ? '<button class="ix-btn pri" data-ix="usev" data-k="' + c.k + '" data-v="' + esc(c.fix) + '" data-next="1">Use ' + esc(c.fix) + '</button>' : '') + '<button class="ix-btn' + (c.fix ? '' : ' pri') + '" data-ix="chkok" data-id="' + esc(c.id) + '">Looks right</button>' + (L.length > 1 ? '<button class="ix-btn" data-ix="chknext">Next</button>' : '') + '</div></div></div>';
  }
  /* where everything goes: the chip in the header, and its menu */
  function lyTargetLabel(){ return D.target === "inv" ? "Inventory" : D.target === "lib" ? "Library" : D.new ? "New RO" : "Into RO " + tgNum(D.ro); }
  function lyTargetMenu(){
    var open = realRos().filter(function(r){ return !roIsDone(r); }).sort(function(a, b){ return new Date(b.dateOpened || 0) - new Date(a.dateOpened || 0); }).slice(0, 8);
    if(D.ro && open.indexOf(D.ro) < 0) open.unshift(D.ro);
    var it = function(a, t, s, on){ return '<button role="menuitemradio" aria-checked="' + !!on + '" data-ix="tgt" data-v="' + esc(a) + '"><b>' + esc(t) + '</b>' + (s ? '<small>' + esc(s) + '</small>' : '') + '</button>'; };
    return '<div class="ix-menu" role="menu">' + it("new", "New RO", "Create a repair order from what was read", D.target === "ro" && D.new)
      + '<hr>' + open.map(function(r){ return it("ro:" + r.id, "Into RO " + tgNum(r), [r.customerName, r.unitNumber].filter(Boolean).join(" · "), D.target === "ro" && !D.new && D.ro === r); }).join("")
      + '<hr>' + it("inv", "Inventory", "Only the parts", D.target === "inv") + it("lib", "Library", "Only the documents", D.target === "lib") + '</div>';
  }
  /* documents and photos: they don't fill the RO, they go with it */
  function lyExtras(){
    var docs = D.pieces.filter(function(p){ return p.role === "doc"; }), ph = D.pieces.filter(function(p){ return p.role === "photo"; }), h = "";
    var row = function(p, ico, t, s){ var i = D.pieces.indexOf(p); return '<div class="ix-xr' + (p.off ? ' off' : '') + '"><label class="ix-ck"><input type="checkbox" data-ix="pcon" data-i="' + i + '"' + (p.off ? '' : ' checked') + ' aria-label="Take in ' + esc(p.name) + '"></label><span class="ix-xi">' + ico + '</span><span><b>' + esc(t) + '</b><small>' + esc(s) + '</small></span></div>'; };
    if(docs.length) h += '<section class="ix-sec" id="ix-s-docs" data-for="ro lib"><div class="ix-sh"><h4>Documents</h4><span>' + docs.length + '</span><em>→ Library' + (D.target === "ro" ? ', asked first, then linked to the RO' : '') + '</em></div>' + docs.map(function(p){ return row(p, ic("doc", 16), p.num ? p.num + (p.title ? " · " + p.title : "") : p.name, p.name); }).join("") + '</section>';
    if(ph.length) h += '<section class="ix-sec" id="ix-s-ph" data-for="ro"><div class="ix-sh"><h4>Photos</h4><span>' + ph.length + '</span><em>→ Files · pictures</em></div>' + ph.map(function(p){ return row(p, p.url ? '<img src="' + esc(p.url) + '" alt="">' : ic("image", 16), p.name, "A photo, not a document — kept as a picture"); }).join("") + '</section>';
    return h;
  }
  /* the empty window: one place to paste or drop */
  function lyEmpty(phone){
    var k = function(i, t){ return '<span>' + ic(i, 13) + t + '</span>'; };
    return '<div class="ix-empty ix-drop" tabindex="0" data-ix="drop" aria-label="Paste or drop the case here">'
      + '<div class="ix-eart">' + ic("clip", 30) + '</div><h3>Paste or drop anything about this job</h3>'
      + '<div class="ix-kinds">' + k("doc", "Case page") + k("image", "Screenshots") + k("doc", "PDF") + k("parts", "Parts quote") + k("note", "Bulletin") + k("image", "Photos") + '</div>'
      + (phone ? '<textarea class="ix-paste" data-ix-paste rows="2" placeholder="Long-press here and Paste the case text"></textarea>' : '')
      + '<div class="ix-eact"><button class="ix-btn pri" data-ix="shots">' + ic("image", 14) + 'Screenshots or photos</button><button class="ix-btn" data-ix="pdf">' + ic("doc", 14) + 'PDF</button>' + (phone ? '' : '<span class="ix-mu">or press <kbd>Ctrl</kbd> <kbd>V</kbd></span>') + '</div>'
      + '<button class="ix-lk" data-ix="manual">Type the RO in instead</button>'
      + '<div class="ix-prv">' + ic("lock", 13) + '<span>Read on this computer. Nothing is sent anywhere.</span></div></div>';
  }
  /* the footer: where it goes, what's left to check, the one button */
  function lyFoot(Pl, C, L, upd){
    if(D.ask) return '<div class="ix-df"><span class="ix-ask">Close without saving? What was read is lost.</span><button class="ix-btn" data-ix="askno">Keep working</button><button class="ix-btn pri" data-ix="askyes">Close</button></div>';
    var K = lyCounts(Pl), dest, prim, dis = false;
    if(D.target === "inv"){ var n = lyParts().length; prim = n ? "Add " + lyPl(n, "part") + " to Inventory" : "No parts read"; dis = !n; dest = '<b>Inventory</b> ' + n; }
    else if(D.target === "lib"){ prim = K.docs ? "File " + lyPl(K.docs, "document") : "No documents read"; dis = !K.docs; dest = '<b>Library</b> ' + K.docs; }
    else {
      prim = D.new ? 'Create RO' + (Pl.rows[1].fin ? ' ' + esc(roShortNo(Pl.rows[1].fin)) : '') : (C.changes || Pl.people.length || K.docs || K.photos ? 'Apply ' + C.changes + ' change' + (C.changes === 1 ? '' : 's') : 'Nothing to change');
      dis = !D.new && !C.changes && !Pl.people.length && !K.docs && !K.photos;
      dest = (D.new ? '<b>New RO</b> ' : '<b>RO ' + esc(tgNum(D.ro)) + '</b> ') + ([K.ops ? lyPl(K.ops, "operation") : "", K.parts ? lyPl(K.parts, "part") : ""].filter(Boolean).join(", ") || (upd ? "" : "")) + (K.docs ? ' · <b>Library</b> ' + K.docs : '') + (K.photos ? ' · <b>Files</b> ' + K.photos : '');
    }
    var left = D.err ? '<span class="ix-err">' + ic("warn", 13) + esc(D.err) + '</span>' : '<span class="ix-mu ix-dest">' + (D.pieces.length || D.manual ? 'Goes to: ' + dest : 'Nothing is saved until you press ' + (D.new ? 'Create' : 'Apply')) + '</span>';
    return '<div class="ix-df">' + left + (L.length ? '<button class="ix-btn ix-wbtn" data-ix="check">' + ic("warn", 13) + L.length + ' to check</button>' : '') + '<button class="ix-btn" data-ix="close">Cancel</button><button class="ix-btn pri" data-ix="apply"' + (dis ? ' disabled' : '') + '>' + prim + '</button></div>';
  }
  /* every part read, for Inventory */
  function lyParts(){ var L = D.acc.parts.slice(); D.acc.ops.forEach(function(o){ L = L.concat(o.parts || []); }); return L; }
