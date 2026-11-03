/* Parsec · import/new-ro · dialog.js
   The import dialog: the field rows, operation cards, totals, notes, the last-contact suggestion (16.3), what is hidden until needed.
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   ic bd hideable fieldInput frow frow0 vtxt cellBd costLine opCard totals notesHtml … (20 functions, 3 constants)
   uses       import/ kit/ pages/triage/ ro/ trucks/
*/
  /* ---------------------------------------------------------------- the dialog */
  var ICX = { image: '<rect x="3.5" y="4.5" width="17" height="15" rx="2.5"/><circle cx="9" cy="10" r="1.7"/><path d="M4 17l4.5-4 3.5 3 3-2.5 5 4"/>',
    doc: '<path d="M7 3.5h7l4 4v12a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1v-15a1 1 0 0 1 1-1z"/><path d="M14 3.5v4h4M9 12h6M9 15.5h6"/>',
    lock: '<rect x="5" y="10.5" width="14" height="10" rx="2"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/>',
    clip: '<path d="M20 11.5l-7.8 7.8a5 5 0 0 1-7.1-7.1L13 4.3a3.3 3.3 0 0 1 4.7 4.7l-7.9 7.9a1.7 1.7 0 0 1-2.4-2.4l7.3-7.3"/>',
    check: '<path d="M5 12.5l4.2 4.2L19 7"/>', swap: '<path d="M7 7h11l-3-3M17 17H6l3 3"/>', plus: '<path d="M12 5v14M5 12h14"/>', x: '<path d="M6 6l12 12M18 6L6 18"/>',
    note: '<path d="M5 4.5h14v15H5z"/><path d="M8.5 9h7M8.5 12.5h7M8.5 16h4"/>', user: '<circle cx="12" cy="8.5" r="3.5"/><path d="M5 19.5c.8-3.6 3.7-5.5 7-5.5s6.2 1.9 7 5.5"/>',
    parts: '<path d="M12 3.5l7.5 4.2v8.6L12 20.5l-7.5-4.2V7.7z"/><path d="M4.8 7.9L12 12l7.2-4.1M12 12v8.3"/>', history: '<path d="M4 12a8 8 0 1 0 2.4-5.7"/><path d="M4 4.5V8h3.5M12 8v4.5l3 2"/>',
    warn: '<path d="M12 4l9 15.5H3z"/><path d="M12 10v4.5M12 17.2v.3"/>', pencil: '<path d="M4 20l4-1 11-11-3-3L5 16z"/><path d="M14 6l3 3"/>' };
  function ic(k, s){ return '<svg class="ix-ic" viewBox="0 0 24 24" width="' + (s || 15) + '" height="' + (s || 15) + '" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (ICX[k] || "") + '</svg>'; }
  var BD = { new: ["new", "check", "New"], upd: ["upd", "swap", "Updated"], kept: ["kept", "lock", "Kept yours"], same: ["same", "", "Same"], yours: ["same", "", "Yours"], edit: ["edit", "pencil", "Typed"] };
  function bd(k){ var b = BD[k]; return b ? '<span class="ix-bd ' + b[0] + '">' + (b[1] ? ic(b[1], 11) : "") + b[2] + '</span>' : '<span></span>'; }
  function hideable(b){ return !b || b === "same" || b === "yours" || b === "same0"; }
  function fieldInput(r){
    var s = r.s, o = s[4] || {}, v = r.fin, at = ' class="ix-in' + (o.mono ? ' mono' : '') + '" data-ixf="' + s[0] + '" aria-label="' + esc(s[1]) + '"';
    if(o.sel) return '<select' + at + '>' + RO_STATUS_OPTIONS.map(function(x){ return '<option' + (x.status === (v || "Hold Tech") ? ' selected' : '') + '>' + esc(x.status) + '</option>'; }).join("") + '</select>';
    if(o.dt) return '<input type="datetime-local"' + at.replace('class="ix-in', 'class="ix-in' + (v ? '' : ' empty')) + ' value="' + esc(whenIn(v)) + '">';
    if(o.long) return '<textarea rows="2"' + at + ' placeholder="—">' + esc(v) + '</textarea>';
    return '<input type="text"' + at + ' value="' + esc(v) + '" placeholder="' + (D.new && (s[0] === "roNumber" || s[0] === "customerName") ? 'Needed' : '—') + '"' + (o.num ? ' inputmode="numeric"' : '') + ' autocomplete="off">';
  }
  function frow(r){ var x = ""; if(r.s[0] === "contactPhone" && typeof v163SugHtml === "function") try{ x = v163SugHtml(D); }catch(e){ console.error(e); } return frow0(r) + x; }   /* Parsec 16.3 */
  function frow0(r){
    var s = r.s, sm = "";
    if(r.bd === "upd") sm = 'was ' + esc(fmtF(s, r.was));
    else if(r.bd === "kept") sm = 'ASIST now says <b>' + esc(fmtF(s, r.src)) + '</b> <button class="ix-lk" data-ix="use" data-k="' + s[0] + '">Use ASIST’s</button>';
    else if(r.bd === "yours") sm = 'yours — ASIST didn’t change it';
    else if(r.bd === "edit" && r.src && !eq(s, r.fin, r.src)) sm = 'ASIST says ' + esc(fmtF(s, r.src));
    if(s[0] === "roNumber" && r.fin) sm = (sm ? sm + ' · ' : '') + 'shows as ' + esc(roShortNo(r.fin)) + ' everywhere but the open RO';
    if(s[0] === "status" && D.acc.f.status) sm = (sm ? sm + ' · ' : '') + 'ASIST: ' + esc(D.acc.f.status);
    if(s[0] === "vin" && r.fin) sm = (sm ? sm + ' · ' : '') + (vinValid(r.fin) ? 'check digit ✓' : '<span class="ix-bad">check digit doesn’t match — check it</span>');
    var ck = chkField(s[0], D.rowsNow);   /* 17.3: values that have to agree */
    var mtx = mtNote(s[0], r);   /* 17.3: what Parsec already knows */
    if(mtx) sm = (sm ? sm + ' · ' : '') + mtx;
    if(ck) sm = (sm ? sm + ' · ' : '') + '<span class="ix-bad">' + esc(ck) + '</span>';
    if(s[0] === "createdBy" && r.fin) sm = (sm ? sm + ' · ' : '') + (onTeam(r.fin) ? 'on the Team' : 'joins the Team');
    if(s[0] === "model" && r.fin){ try{ var M = trkMatch(Object.assign({}, D.ro || {}, { model: r.fin, year: +(D.edits.year || (D.acc.f.year) || (D.ro && D.ro.year) || 0) || undefined, trkBody: undefined })); if(M && M.entry) sm = (sm ? sm + ' · ' : '') + 'picture: ' + esc(M.entry.vt && VT_BY[M.entry.vt] ? VT_BY[M.entry.vt].label : M.entry.model); }catch(e){} }
    return '<div class="ix-fr ' + (r.bd || "none") + (ck ? ' chk' : '') + (D.only && hideable(r.bd) ? ' hide' : '') + '"><span class="ix-fl">' + esc(s[1]) + '</span><span class="ix-fv">' + fieldInput(r) + (sm ? '<small>' + sm + '</small>' : '') + '</span>' + bd(r.bd === "same0" ? "" : r.bd) + '</div>';
  }
  function vtxt(r, t){ if(!r) return ""; var v = r.fin; if(t === "money") return v === "" || v == null ? "—" : usd(v); return v == null || v === "" ? "—" : esc(String(v)); }
  function cellBd(r){ return r && (r.bd === "upd" || r.bd === "kept") ? ' class="' + r.bd + '" title="' + (r.bd === "upd" ? "was " + esc(String(r.was)) : "ASIST says " + esc(String(r.asist))) + '"' : ''; }
  /* Parsec 14 — the operation's money from the case: hours × rate = labor · parts · shop supplies · sublet · op total, and whether it adds up */
  function costLine(P){
    var o = P.o, f = P.f, hrs = f.quoted ? +f.quoted.fin || 0 : +o.hours || 0, pr = f.estCost ? +f.estCost.fin || 0 : +o.price || 0, rt = o.rateEff, own = f.laborRate && +f.laborRate.fin > 0 && Math.abs(+f.laborRate.fin - laborRate()) > .004;
    var ext = P.parts.reduce(function(a, q){ var qn = parseFloat(q.f.qty.fin); if(!isFinite(qn)) qn = 1; return a + qn * ((+q.f.price.fin || 0) + (+q.f.core.fin || 0)); }, 0);
    if(o.rate == null && o.partsAmt == null && o.misc == null && o.sublet == null && o.total == null) return "";
    var b = [];
    b.push('<span' + cellBd(f.laborRate) + '>Labor ' + (hrs ? hrs.toFixed(1) + ' h' : '') + (rt ? ' × ' + usd(rt) + '/h' : '') + (pr ? ' = <b>' + usd(pr) + '</b>' : '') + (own ? ' <em title="Labor on this operation is worked out at this rate, not the shop’s ' + usd(laborRate()) + '/h">its own rate</em>' : '') + '</span>');
    var pa = o.partsAmt != null ? o.partsAmt : P.parts.length ? ext : null;
    if(pa != null) b.push('<span>Parts <b>' + usd(pa) + '</b></span>');
    if(+o.misc) b.push('<span' + cellBd(f.otherCost) + '>Shop supplies <b>' + usd(o.misc) + '</b></span>');
    if(+o.sublet) b.push('<span' + cellBd(f.otherCost) + '>Sublet <b>' + usd(o.sublet) + '</b></span>');
    var chk = "";
    if(o.total != null){ var sum = pr + (pa || 0) + (o.misc || 0) + (o.sublet || 0); b.push('<span>Op total <b>' + usd(o.total) + '</b></span>');
      chk = Math.abs(sum - o.total) < .015 ? '<small class="ok">' + ic("check", 11) + 'adds up</small>' : '<small class="off">Parsec adds ' + usd(sum) + '</small>'; }
    return '<div class="ix-oc mono">' + b.join('<i>·</i>') + chk + '</div>';
  }
  function opCard(P){
    var o = P.o, f = P.f, ap = f.asistApproval && f.asistApproval.fin, chg = f.asistApproval && f.asistApproval.bd === "upd";
    var meta = [o.skill ? "Skill " + esc(o.skill) : "", o.label ? esc(o.label) : "", P.codes ? '<span title="Op code, VMRS and price code go into the operation’s notes">' + esc(P.codes) + ' → notes</span>' : ""].filter(Boolean).join(" · ");
    var hrs = f.quoted ? f.quoted.fin : o.hours, pr = f.estCost ? f.estCost.fin : o.price;
    var head = '<div class="ix-oh"><label class="ix-ck" title="Take this operation in"><input type="checkbox" data-ix="opon" data-k="' + esc(opKey(o)) + '"' + (P.on ? ' checked' : '') + '></label><span class="ix-no mono">' + (o.no || "—") + '</span><span class="ix-on"><b>' + esc(o.name || "Operation") + '</b>' + (meta ? '<small>' + meta + '</small>' : '') + paTxt(P) + (P.glued ? '<small class="ix-pa">name fixed — “Parts” came off it</small>' : '') + (P.op && !P.isNew ? '<small>on this RO as Op ' + (((D.ro.operations || []).indexOf(P.op)) + 1) + '</small>' : '') + '</span>'
      + '<span class="ix-oh-n mono"' + cellBd(f.quoted) + '>' + (hrs != null && hrs !== "" ? (+hrs).toFixed(1) + ' h' : '—') + (pr ? ' · ' + usd(pr) : '') + '</span>'
      + (ap ? '<span class="ix-ap ' + (ap === "Approved" ? "a" : ap === "Declined" ? "d" : "p") + '" title="ASIST’s approval — shown only, the status stays">' + (chg ? esc(f.asistApproval.was) + ' → ' : '') + esc(ap) + '</span>' : '<span></span>') + bd(P.on ? P.bd : "") + '</div>';
    var hasL = P.parts.some(function(q){ return q.p.list != null; }), hasD = P.parts.some(function(q){ return q.p.disc; });
    var rows = P.parts.map(function(q){ var p = q.p, qn = parseFloat(q.f.qty.fin); if(!isFinite(qn)) qn = 1;
      return '<tr' + (q.bd === "new" && !P.isNew ? ' class="nwr"' : '') + '><td class="m">' + esc(p.pn || "—") + '</td><td>' + vtxt(q.f.description) + '</td><td class="r m"' + cellBd(q.f.qty) + '>' + vtxt(q.f.qty) + '</td>'
        + (hasL ? '<td class="r m c-list"' + cellBd(q.f.list) + '>' + (q.f.list && q.f.list.fin !== "" && q.f.list.fin != null ? usd(q.f.list.fin) : '—') + '</td>' : '')
        + (hasD ? '<td class="r m c-disc">' + (p.disc ? esc(p.disc) : '—') + '</td>' : '')
        + '<td class="r m"' + cellBd(q.f.price) + '>' + vtxt(q.f.price, "money") + '</td><td class="r m c-core"' + cellBd(q.f.core) + '>' + (q.f.core && +q.f.core.fin ? usd(q.f.core.fin) : '—') + '</td><td class="r m">' + (p.ext != null ? usd(p.ext) : usd(qn * ((+(q.f.price.fin) || 0) + (+(q.f.core.fin) || 0)))) + '</td><td class="c-sales">' + vtxt(q.f.salesman) + '</td><td>' + (P.isNew ? '' : bd(q.bd)) + '</td></tr>'; }).join("");
    var parts = P.parts.length ? '<div class="ix-ptw"><table class="ix-pt"><thead><tr><th>Part #</th><th>Part</th><th class="r">Qty</th>' + (hasL ? '<th class="r c-list">List</th>' : '') + (hasD ? '<th class="r c-disc">Disc</th>' : '') + '<th class="r">' + (hasL ? 'Net' : 'Unit') + '</th><th class="r c-core">Core</th><th class="r">Ext</th><th class="c-sales">Salesman</th><th></th></tr></thead><tbody>' + rows + '</tbody></table><div class="ix-mu">' + ic("parts", 12) + 'Prices also go to the Parts list</div></div>' : '';
    var st = P.story ? '<div class="ix-st"><b>Technician story</b>' + (o.storyBy ? ' · ' + esc(o.storyBy) : '') + ' ' + (P.isNew ? '' : bd(P.story.bd)) + '<p>' + esc(P.story.bd === "kept" ? P.story.asist : P.story.fin) + '</p>' + (P.story.bd === "kept" ? '<small>Work performed was changed here — it stays; ASIST’s story is above</small>' : '') + '</div>' : '';
    var hck = chkOpHours(hrs, pr, o.rate), pck = P.parts.map(function(q){ var m = chkPart(q.f.qty.fin, q.f.price.fin, q.f.core && q.f.core.fin, q.p.ext), k = mtPart(q.p.pn);
      return m ? esc(q.p.pn || q.p.desc || "A part") + ': ' + esc(m) : k ? esc(q.p.pn) + ': the shop has used ' + esc(k) + ' — one character off, check it' : ""; }).filter(Boolean);   /* 17.3 */
    var cds = mtCodes(o), cdl = cds.length ? '<div class="ix-codes">' + cds.map(function(c){ return '<span><b class="mono">' + esc(c.code) + '</b> ' + esc(c.meaning) + '</span>'; }).join('') + '</div>' : '';
    var chk = hck || pck.length ? '<div class="ix-chk">' + ic("warn", 13) + '<span>' + [hck ? esc(hck) : ""].concat(pck).filter(Boolean).join('<br>') + '</span></div>' : '';
    return '<div class="ix-op' + (P.on ? '' : ' off') + (D.only && P.bd === "same" ? ' hide' : '') + '">' + head + (P.on ? chk + cdl + costLine(P) + parts + st : '') + '</div>';
  }
  /* the totals ASIST shows, against what Parsec adds up — Parts with or without the core, tax shown but not added by Parsec */
  function totals(Pl){
    var T = D.acc.totals; if(!T) return '<div class="ix-mu" style="padding:4px 8px">No totals read yet — they’re checked when the Totals part of the case comes in.</div>';
    var lab = 0, pts = 0, core = 0, oth = 0;
    Pl.ops.forEach(function(P){ if(!P.on) return; var h = P.f.quoted ? +P.f.quoted.fin || 0 : 0, pr = P.f.estCost ? +P.f.estCost.fin || 0 : 0, rt = P.f.laborRate && +P.f.laborRate.fin > 0 ? +P.f.laborRate.fin : (+(P.op && P.op.laborRate) || laborRate());
      lab += pr || h * rt; oth += P.f.otherCost ? +P.f.otherCost.fin || 0 : 0;
      P.parts.forEach(function(q){ var qn = parseFloat(q.f.qty.fin); if(!isFinite(qn)) qn = 1; pts += qn * (+q.f.price.fin || 0); core += qn * (+q.f.core.fin || 0); }); });
    var supR = Pl.rows.filter(function(r){ return r.k === "shopSupplies"; })[0], misc = cents(oth + (supR ? +supR.fin || 0 : 0));
    var c = function(k, mine, theirs, note){ var ok = theirs == null || Math.abs(mine - theirs) < .015; return '<div><span>' + k + '</span><b class="mono">' + usd(mine) + '</b><small class="' + (note ? 'ok' : theirs == null ? '' : ok ? 'ok' : 'off') + '">' + (note ? ic("check", 11) + note : theirs == null ? 'not on the case' : ok ? ic("check", 11) + ' matches ASIST' : 'ASIST says ' + usd(theirs)) + '</small></div>'; };
    var withCore = T.parts != null && T.core == null && core > 0 && Math.abs(pts + core - T.parts) < .015 && Math.abs(pts - T.parts) >= .015;
    var out = [c("Labor", lab, T.labor), withCore ? c("Parts + core", pts + core, null, "matches ASIST’s parts") : c("Parts", pts, T.parts)];
    if(!withCore && (core > 0 || T.core != null)) out.push(c("Core", core, T.core));
    if(misc > 0 || T.misc != null) out.push(c("Shop supplies, fees, sublet", misc, T.misc));
    if(T.tax != null) out.push('<div><span>Tax</span><b class="mono">' + usd(T.tax) + '</b><small>ASIST’s — Parsec doesn’t add tax</small></div>');
    out.push(c("Total", lab + pts + core + misc + (T.tax || 0), T.total));
    return '<div class="ix-tot">' + out.join("") + '</div>';
  }
  function notesHtml(Pl){
    if(!Pl.notes.length) return '<div class="ix-mu" style="padding:4px 8px">No notes read yet.</div>';
    return Pl.notes.map(function(x){ var n = x.n, sys = n.kind === "system" || !n.by, newP = n.by && !onTeam(n.by);
      return '<div class="ix-note' + (D.only && x.bd === "same" ? ' hide' : '') + '"><span class="ix-av' + (sys ? ' sys' : '') + '">' + (sys ? ic("history", 12) : esc(tgIni(n.by))) + '</span><span><b>' + esc(sys ? "ASIST" : n.by) + '</b>' + (newP ? ' <span class="ix-bd nf">joins the Team</span>' : '') + '<q>' + esc(n.text) + '</q></span><time>' + esc(whenTxt(n.at)) + ' ' + bd(x.bd) + '</time></div>'; }).join("");
  }
  function pieceHtml(p, i){ return '<div class="ix-pc' + (p.nw ? ' nw' : '') + '"><span class="ix-th">' + ic(p.kind === "text" ? "doc" : p.kind === "pdf" ? "doc" : "image") + '</span><span><b>' + esc(p.name) + '</b><small>' + esc(p.what) + '</small></span><button class="ix-x0" data-ix="rmpc" data-i="' + i + '" title="Take this piece out" aria-label="Take out ' + esc(p.name) + '">' + ic("x", 12) + '</button></div>'; }
  function draw(){
    var w = document.getElementById("imp-dlg"); if(!w || !D) return;
    var Pl = plan(), C = counts(Pl), ro = D.ro, upd = !D.new, phone = document.documentElement.getAttribute("data-device") === "phone" || window.innerWidth < 760;
    var sc = w.querySelector(".ix-fs"), keep = sc ? sc.scrollTop : 0, sb = w.querySelector(".ix-b"), keepB = sb ? sb.scrollTop : 0;
    var title = upd ? 'Update RO ' + esc(tgNum(ro)) + (ro.customerName ? ' · ' + esc(ro.customerName) : '') : 'New repair order';
    var sub = upd ? (D.foundBy ? 'Found by ' + esc(D.foundBy) : 'Import from ASIST') + (ro.imp && ro.imp.at ? ' — imported ' + (ro.imp.n > 1 ? ro.imp.n + ' times, last ' : 'once already, ') + esc(whenTxt(ro.imp.at)) : ' — first import on this RO') : 'Paste or drop everything about the case — it fills in as it reads';
    D.rowsNow = Pl.rows; var nChk = chkCount(Pl.rows, Pl.ops);   /* 17.3: what to check */
    var groups = {}; Pl.rows.forEach(function(r){ (groups[r.s[2]] = groups[r.s[2]] || []).push(r); });
    D.v163f = {}; Pl.rows.forEach(function(r){ D.v163f[r.k] = r.fin; });   /* Parsec 16.3: for the last-contact suggestion */
    var LZ = D.loose || { auto: [], rest: [] }, lpTxt = (LZ.auto.length ? LZ.auto.map(function(x){ return esc(x.p.desc || x.p.pn) + ' → Op ' + (D.acc.ops[x.i].no || x.i + 1) + ' (' + esc(x.by) + ')'; }).join(", ") + (LZ.rest.length ? '; ' : '') : '') + (LZ.rest.length ? LZ.rest.length + ' part' + (LZ.rest.length === 1 ? '' : 's') + ' with no operation named go on' : '');
    var lpSel = D.acc.parts.length && D.acc.ops.length ? '<div class="ix-lp">' + ic("parts", 13) + '<span>' + (LZ.rest.length ? '' : 'Parts listed apart from their operations: ') + lpTxt + '</span>' + (LZ.rest.length ? '<select data-ix="lp" class="ix-in">' + D.acc.ops.map(function(o, i){ return '<option value="' + i + '"' + (i === D.lpTo && !D.lpOff ? ' selected' : '') + '>Op ' + (o.no || i + 1) + ' · ' + esc(o.name) + '</option>'; }).join("") + '<option value="-1"' + (D.lpOff ? ' selected' : '') + '>Leave them out</option></select>' : '') + '</div>' : '';
    var ppl = Pl.people.length ? '<div class="ix-ppl">' + ic("user", 13) + '<span><b>' + Pl.people.length + (Pl.people.length === 1 ? ' person joins' : ' people join') + ' the Team</b> — no pages, no sign-in: ' + Pl.people.map(function(p){ return esc(p.n) + ' (' + esc(p.why) + ')'; }).join(", ") + '</span></div>' : '';
    var reading = D.busy ? '<div class="imp-status busy" id="imp-status" role="status">' + esc(D.busy) + '</div>' : '<div class="imp-status" id="imp-status" role="status" aria-live="polite">' + esc(D.msg || "") + '</div>';
    var chips = [["chk", nChk, "to check"], ["new", C.new, "new"], ["upd", C.upd, "updated"], ["kept", C.kept, "kept yours"], ["edit", C.edit, "typed"], ["same", C.same, "same"]].filter(function(x){ return x[1]; }).map(function(x){ return '<span class="' + x[0] + '"><b>' + x[1] + '</b>' + x[2] + '</span>'; }).join("");
    var prim = D.new ? 'Create RO' + (Pl.rows[1].fin ? ' ' + esc(roShortNo(Pl.rows[1].fin)) : '') : (C.changes || Pl.people.length ? 'Apply ' + C.changes + ' change' + (C.changes === 1 ? '' : 's') : 'Nothing to change');
    var foot = D.err ? '<span class="ix-err">' + ic("warn", 13) + esc(D.err) + '</span>' : '<span class="ix-mu">' + (D.new ? (D.pieces.length ? 'Check what came in — nothing is saved until Create RO' : 'Paste the case to fill this in, or type it') : 'Nothing changes until you press Apply') + '</span>';
    w.innerHTML = '<div class="ix" role="dialog" aria-modal="true" aria-label="' + (upd ? 'Update RO ' + esc(tgNum(ro)) : 'New repair order') + '">'
      + '<div class="ix-h"><div class="ix-ht"><h2>' + title + '</h2><div class="ix-sub">' + sub + '</div></div>' + (upd ? '<span class="ix-bd upd ix-tag">' + ic("swap", 12) + 'Existing RO</span>' + (D.fixed || D.foundBy === 'its RO #' ? '' : '<button class="ix-lk" data-ix="newinstead" title="Same truck, a new visit">Make a new RO instead</button>') : '<span class="ix-bd new ix-tag">' + ic("plus", 12) + 'New RO</span>') + '<button class="ix-x" data-ix="close" aria-label="Close (Esc)" title="Close (Esc)">' + ic("x", 18) + '</button></div>'
      + '<div class="ix-b"><div class="ix-imp">'
      +   '<div class="ix-drop" tabindex="0" data-ix="drop" aria-label="Paste or drop the case here">' + ic("clip", 22) + (phone ? '<b>Paste the case, or add screenshots</b><textarea class="ix-paste" data-ix-paste rows="2" placeholder="Long-press here and Paste the case text"></textarea>' : '<b>Paste (Ctrl V) or drop here</b>') + '<small>Case page text, screenshots, the PDF — as many as you like, any order</small><div class="ix-row"><button class="ix-btn" data-ix="shots">' + ic("image", 14) + 'Screenshots</button><button class="ix-btn" data-ix="pdf">' + ic("doc", 14) + 'PDF</button></div></div>'
      +   '<input type="file" id="ix-shots" accept="image/*" multiple hidden><input type="file" id="ix-pdf" accept=".pdf,application/pdf" hidden>'
      +   reading
      +   (D.pieces.length ? '<div class="ix-pcs"><span>READ SO FAR</span>' + D.pieces.map(pieceHtml).join("") + '</div>' : '<div class="ix-pcs"><span>READ SO FAR</span><div class="ix-mu">Nothing yet. Copy the case page in ASIST (Ctrl A, Ctrl C) and press Ctrl V here — or drop screenshots.</div></div>')
      +   '<div class="ix-prv">' + ic("lock", 13) + '<span>Read on this computer — screenshots by the reader inside Parsec. Nothing is sent anywhere.</span></div>'
      +   (chips ? '<div class="ix-sum">' + chips + '</div>' : '')
      + '</div><div class="ix-frm"><div class="ix-fbar"><div class="ix-seg" role="group" aria-label="Show"><button data-ix="only" data-v="0" aria-pressed="' + !D.only + '">Everything</button><button data-ix="only" data-v="1" aria-pressed="' + D.only + '">Changes only</button></div><span class="ix-mu">' + (upd ? (C.kept ? C.kept + ' changed here and in ASIST — yours stay' : C.changes ? 'What ASIST changed since the last import' : 'ASIST and this RO agree') : (D.pieces.length ? 'All of it is new — nothing on this RO yet' : 'Every field can be typed')) + '</span></div><div class="ix-fs">'
      +   [G_CASE, G_TRUCK, G_CCC].map(function(g){ return '<div class="ix-grp"><h4>' + g + '</h4>' + groups[g].map(frow).join("") + '</div>'; }).join("")
      +   '<div class="ix-grp"><h4>Operations <em>hours × rate = labor, parts, shop supplies, sublet, the op total, ASIST’s approval (shown only) — parts under each</em></h4>' + lpSel + (Pl.ops.length ? '<div class="ix-ops">' + Pl.ops.map(opCard).join("") + '</div>' : '<div class="ix-mu" style="padding:4px 8px">No operations read yet.</div>') + '</div>'
      +   '<div class="ix-grp"><h4>Notes <em>user and system notes, with who and when — into Activity</em></h4>' + ppl + notesHtml(Pl) + '</div>'
      +   '<div class="ix-grp"><h4>Totals <em>checked against what Parsec adds up</em></h4>' + totals(Pl) + '</div>'
      + '</div><div class="ix-df">' + foot + '<button class="ix-btn" data-ix="close">Cancel</button><button class="ix-btn pri" data-ix="apply"' + (!D.new && !C.changes && !Pl.people.length ? ' disabled' : '') + '>' + prim + '</button></div></div></div></div>';
    var sc2 = w.querySelector(".ix-fs"); if(sc2) sc2.scrollTop = keep; var sb2 = w.querySelector(".ix-b"); if(sb2) sb2.scrollTop = keepB;
  }

  /* ---------------------------------------------------------------- reading pieces */
  function match(){
    if(!D || D.fixed) return;
    var m = D.forceNew ? null : findRo(D.acc.f);
    if(m){ D.ro = m.ro; D.new = false; D.foundBy = m.by; } else { D.ro = null; D.new = true; D.foundBy = ""; }
  }
  /* Parsec 14: what the Totals show for shop supplies, fees and sublet beyond what the operations carry — it goes on the RO */
  function suppliesOf(acc){ var T = acc.totals; delete acc.f.supplies; if(!T || T.misc == null) return; var per = acc.ops.reduce(function(a, o){ return a + (o.misc || 0) + (o.sublet || 0); }, 0), v = cents(T.misc - per); if(v > .004) acc.f.supplies = String(v); }
  function rebuild(){ D.acc = blankAcc(); D.pieces.forEach(function(p){ mergeInto(D.acc, p.P); }); suppliesOf(D.acc); if(D.lpTo >= D.acc.ops.length) D.lpTo = 0; match(); D.err = ""; draw(); }
  var SECN = { case: "Case header", asset: "Truck", complaint: "Complaint" };
  function pieceName(kind, P, n){
    var main = P.ops.length ? "Operations" : (P.parts.length ? "Parts" : P.notes.length ? "Notes" : P.totals ? "Totals" : SECN[P.found[0]] || "Text");
    if(kind === "image") return "Screenshot" + (n > 1 ? " " + n : "") + " · " + main;
    if(kind === "pdf") return n;
    return P.found.indexOf("case") > -1 && P.ops.length ? "Case page · pasted text" : "Pasted text · " + main;
  }
  function addText(text, kind, name){
    if(!D || !String(text || "").trim()) return;
    var P = parse(text);
    D.pieces.forEach(function(p){ p.nw = 0; });
    var nImg = D.pieces.filter(function(p){ return p.kind === "image"; }).length + 1;
    D.pieces.push({ kind: kind || "text", name: kind === "pdf" ? name : pieceName(kind || "text", P, nImg), what: describe(P), P: P, nw: 1 });
    D.msg = describe(P) === "nothing recognisable" ? "Nothing in that looked like the case — is it the ASIST case page?" : "";
    rebuild();
  }
  function readFiles(list){
    var files = Array.prototype.slice.call(list || []), imgs = files.filter(function(f){ return /^image\//.test(f.type || "") || /\.(png|jpe?g|webp|bmp|gif)$/i.test(f.name || ""); }), pdfs = files.filter(function(f){ return /pdf/i.test(f.type || "") || /\.pdf$/i.test(f.name || ""); });
    var q = Promise.resolve();
    pdfs.forEach(function(f){ q = q.then(function(){ if(!D) return; D.busy = "Reading " + (f.name || "the PDF") + "…"; draw();
      return pdfToText(f).then(function(t){ if(!D) return; D.busy = ""; addText(t, "pdf", f.name || "PDF"); }, function(e){ if(!D) return; D.busy = ""; D.msg = e && e.message === "offline" ? "Couldn’t load the PDF reader — it needs the internet the first time. Paste the case text instead." : "Couldn’t read that PDF — paste the case text instead."; draw(); }); }); });
    imgs.forEach(function(f, i){ q = q.then(function(){ if(!D) return; NOW = [i + 1, imgs.length]; D.busy = "Reading screenshot " + (i + 1) + " of " + imgs.length + "…"; draw();
      return (OCRF || ocrImages)([f], 6).then(function(t){ if(!D) return; D.busy = ""; t = cleanOcrText(t).trim(); if(!t){ D.msg = "No text found in that screenshot."; draw(); return; } addText(t, "image"); },
        function(e){ if(!D) return; D.busy = ""; D.msg = e && e.message === "offline" ? "Couldn’t start the screenshot reader. Paste the case text instead." : "Couldn’t read that screenshot — try a sharper one, or paste the text."; draw(); }); }); });
    return q;
  }
