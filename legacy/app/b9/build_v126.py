# Parsec 12.6 — parts stages on the Parts and Foreman pages (the parts stages mock-up's picks).
# The track: b9/v126.js (global) + b9/v126.css. Runs inside build12.py after build_v125*.py: uses js, rep, b9, EXTRA_CSS, HOOK_NAMES, LOG.
js = rep(js, "\nvar PG = (function(){\n", "\n" + b9("v126.js") + "\nvar PG = (function(){\n")
EXTRA_CSS.append(b9("v126.css"))
# ---- the Parts page (the PT module; its classes are pq- by now)
js = rep(js, "  function vDesk(){\n    const r = get(U.sel);", """  /* Parsec 12.6: the parts stage's own action — order, chase, check in, stage, tell the tech */
  function ptStAct(r, S){
    const st = stateOf(r), lp = S.least[0] && S.least[0].p;
    if(S.lst === 'Not Ordered') return st === 'order' ? `<button class="btn btn-sm btn-primary pst-go" data-a="do" data-ro="${r.id}">${esc(BTN[st](r))}</button>` : '';
    if(S.lst === 'Backordered' || (S.lst === 'Ordered' && st === 'late')) return `<button class="btn btn-sm btn-primary pst-go" data-a="do" data-ro="${r.id}">Chase…</button>`;
    if(S.lst === 'Ordered' && lp) return `<button class="btn btn-sm pst-go" data-a="rcv1" data-pid="${lp.id}">It’s in</button>`;
    if(S.lst === 'Received' && lp) return `<button class="btn btn-sm btn-primary pst-go" data-a="stage1" data-pid="${lp.id}">Stage it</button>`;
    if(S.lst === 'Staged') return pstTellBtn(r.ro);
    return '';
  }
  function vDesk(){
    const r = get(U.sel);""")
js = rep(js, "const st = stateOf(r), L = lines(r);\n    const tot", "const st = stateOf(r), L = lines(r), PS = pstOf(r.ro), PF = pstFilt(r.id, 'parts');\n    const tot")
js = rep(js, "<div><small>Parts on this RO</small><span class=\"m\">${L.length ? usd(tot) : '—'}</span></div></div></div><div class=\"pq-pad\">",
         "<div><small>Parts on this RO</small><span class=\"m\">${L.length ? usd(tot) : '—'}</span></div></div>${pstTrack(r.ro, { pg: 'parts', act: S => ptStAct(r, S) })}</div><div class=\"pq-pad\">")
js = rep(js, "${nextBar(r)}${extraCards(r)}`;\n    r.ops.forEach((o, i) => {", "${nextBar(r)}${extraCards(r)}` + pstFbar(PS, PF, r.id, 'parts');\n    r.ops.forEach((o, i) => {")
js = rep(js, "${o.jt ? `<span class=\"pq-jt\">${o.jt}</span>` : ''}<b>${esc(o.cmp)}</b>${o.appr", "${o.jt ? `<span class=\"pq-jt\">${o.jt}</span>` : ''}<b>${esc(o.cmp)}</b>${pstOpMini(r.ro, o.op)}${o.appr")
js = rep(js, "<div class=\"pq-pr\">${stChip(p, 1)}", "<div class=\"pq-pr${pstRow(PS, PF, p.id)}\" style=\"--sc:${pstCol(p.st)}\">${stChip(p, 1)}")
js = rep(js, "<span class=\"d\"><b>${esc(p.desc)}</b>${p.st === 'Not Ordered' && c.oh >= p.qty", "<span class=\"d\"><b>${esc(p.desc)}</b>${pstHold(PS, p.id)}${p.st === 'Not Ordered' && c.oh >= p.qty")
js = rep(js, "<b class=\"tg-no\">${esc(r.no)}</b><b class=\"tg-cu\">${esc(r.cust)}</b>", "<b class=\"tg-no\">${esc(r.no)}</b><b class=\"tg-cu\">${esc(r.cust)}</b>${pstPill(r.ro)}")
# ---- the Foreman page: the track below the details, each operation's mini stage in the ops strip
js = rep(js, "fmQbar(ro) + '</div>' + fmOpsStrip(ro) + '</div>'", "fmQbar(ro) + '</div>' + fmOpsStrip(ro) + pstTrack(ro, { pg: 'fm', list: true, act: function(S){ return fmPstAct(ro, S); } }) + '</div>'")
js = rep(js, "(op.quoted ? ' · ' + fmHh(+op.quoted) : '') + '</i></button>'", "(op.quoted ? ' · ' + fmHh(+op.quoted) : '') + '</i>' + pstOpMini(ro, op) + '</button>'")
HOOK_NAMES += ["pstOf", "pstTrack", "pstPill", "pstTell"]
LOG.append("Parsec 12.6: parts stages on the Parts and Foreman pages")
