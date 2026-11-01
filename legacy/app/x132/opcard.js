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
    return '<div class="ix-op' + (P.on ? '' : ' off') + (D.only && P.bd === "same" ? ' hide' : '') + '">' + head + (P.on ? costLine(P) + parts + st : '') + '</div>';
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
