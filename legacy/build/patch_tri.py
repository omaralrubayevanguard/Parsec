s = open("make_triage.py").read()
def rep(a, b, n=1):
    global s
    assert a in s, a[:90]; s = s.replace(a, b, n)
# 1 · colours: ready to release is solid ink so it reads apart from in repair
rep("rdy:['Ready to release','var(--good)']", "rdy:['Ready to release','var(--ink)']")
# 2 · idea 1 — short lane names, roomier cards
rep("const lane=k=>{const L=ROS.filter(r=>r.cat===k),late=L.filter(r=>r.late).length;", "const SHORT={arr:'Arriving',chk:'Checked in',apr:'Approval',wrk:'In repair',rdy:'Ready'};const lane=k=>{const L=ROS.filter(r=>r.cat===k),late=L.filter(r=>r.late).length;")
rep("<div class=\"i1-lh\">${sq(k)}${CAT[k][0]}<span class=\"n\">${L.length}</span>", "<div class=\"i1-lh\" title=\"${CAT[k][0]}\">${sq(k)}${SHORT[k]}<span class=\"n\">${L.length}</span>")
rep("""<h4>${esc(r.cust)}</h4><div class="m">${spot(r.spot)}${SI[r.st]}<span style="overflow:hidden;text-overflow:ellipsis">${esc(r.sub?r.sub.split(' · ')[0]:r.stn)}</span>${av(r.tech)}</div>${lastCt(r)}</button>`""",
    """<h4>${esc(r.cust)}</h4><div class="m">${SI[r.st]}<span style="overflow:hidden;text-overflow:ellipsis">${esc(r.sub?r.sub.split(' · ')[0]:r.stn)}</span></div><div class="m">${spot(r.spot)}${lastCt(r)}${av(r.tech)}</div></button>`""")
rep(".i1-lh{display:flex;align-items:center;gap:8px;height:28px;padding:0 4px;font-size:13px;font-weight:600}", ".i1-lh{display:flex;align-items:center;gap:8px;height:28px;padding:0 4px;font-size:13px;font-weight:600;white-space:nowrap}")
rep(".i1-c .tg-ct{font-size:11.5px}", ".i1-c .tg-ct{font-size:11.5px;min-width:0}")
# 3 · idea 2 — short labels, taller spots, more of the yard
rep("<section class=\"i2-z\" style=\"flex:1.7\"><div class=\"i2-zh\">Shop floor<small>UpTime · awning · bays 1–8</small></div>${grid([['UP','UpTime'],['AW1','Awning 1'],'B1','B2','B3','B4','B5','B6','B7','B8',['AW2','Awning 2']],6)}</section>",
    "<section class=\"i2-z\" style=\"flex:1.7\"><div class=\"i2-zh\">Shop floor<small>UpTime · awning · bays 1–8</small></div>${grid(['UP','B1','B2','B3','B4','AW1','B5','B6','B7','B8'],5)}</section>")
rep("<section class=\"i2-z\"><div class=\"i2-zh\">Parking lot<small>rows C–D · approvals and ready to release</small></div>${grid(lot('C',8),8)}<div style=\"height:6px\"></div>${grid(lot('D',8),8)}</section>",
    """<section class="i2-z"><div class="i2-zh">Parking lot<small>C line · waiting on customers &nbsp;·&nbsp; D line · ready to release &nbsp;·&nbsp; E line · overflow</small></div>${grid(lot('C',10),10)}<div style="height:6px"></div>${grid(lot('D',10),10)}<div style="height:6px"></div>${grid(lot('E',10),10)}</section>
   <div class="i2-row"><section class="i2-z" style="flex:1"><div class="i2-zh">Warranty<small>on the yard</small></div><div style="display:flex;flex-direction:column;gap:6px">${ROS.filter(r=>r.warr).map(r=>`<div style="display:flex;align-items:center;gap:10px;font-size:13px"><span class="tg-ro">${r.no}</span><b style="font-weight:500">${esc(r.cust)}</b>${spot(r.spot)}<span style="margin-left:auto;color:var(--ink-3);font-size:12px">${r.warr[0]}% ready · ${r.warr[1]} missing</span><span style="width:80px" class="i6-wb"><i style="width:${r.warr[0]}%"></i></span></div>`).join('')}</div></section>
   <section class="i2-z" style="flex:1"><div class="i2-zh">Released today<small>${D.rel.length}</small></div><div style="display:flex;flex-direction:column;gap:6px">${D.rel.map(x=>`<div style="display:flex;align-items:center;gap:10px;font-size:13px"><span class="tg-ro">${x.no}</span><b style="font-weight:500">${esc(x.cust)}</b><span style="margin-left:auto;color:var(--ink-3);font-size:12px">${x.at}</span></div>`).join('')}</div></section></div>""")
rep(".i2-s{all:unset;box-sizing:border-box;position:relative;height:50px;", ".i2-s{all:unset;box-sizing:border-box;position:relative;height:56px;")
rep(".i2-s .l{position:absolute;top:5px;right:7px;", ".i2-s .l{position:absolute;top:6px;right:8px;")
rep(".i2-s b{display:flex;align-items:center;gap:5px;font:500 13px/1 var(--font-mono)}", ".i2-s b{display:flex;align-items:center;gap:5px;font:500 13px/1 var(--font-mono);padding-right:22px}")
# 4 · idea 3 — needs-action rows laid out explicitly
rep(".i3-it .t{display:flex;align-items:center;gap:8px;min-width:0;font-size:13.5px}", ".i3-it .t{grid-column:2;grid-row:1;display:flex;align-items:center;gap:8px;min-width:0;font-size:13.5px}")
rep(".i3-it .w{font-size:12.5px;", ".i3-it .w{grid-column:2;grid-row:2;font-size:12.5px;")
rep(".i3-it .px-btn{grid-row:span 2}", ".i3-it .px-btn{grid-column:3;grid-row:1 / span 2}")
rep(".i3-it .gi{grid-row:span 2;", ".i3-it .gi{grid-column:1;grid-row:1 / span 2;")
# 5 · idea 5 — status column says just the status or its reason
rep("<span class=\"i5-st\">${st(r)}</span>", "<span class=\"i5-st\">${SI[r.st]}<span style=\"overflow:hidden;text-overflow:ellipsis\">${esc(r.sub?r.sub.split(' · ')[0]:r.stn)}</span></span>")
# 6 · idea 6 — late is a pill, not an edge
rep(".i6-t.late{box-shadow:0 0 0 1px var(--hairline),inset 0 3px 0 var(--warn)}", ".tg-late{display:inline-flex;align-items:center;height:18px;padding:0 6px;border-radius:6px;background:var(--warn-tint);color:var(--warn);font-size:11px;font-weight:600}")
rep("<span class=\"nm\"><h4>${esc(r.cust)}</h4><span class=\"tg-ro\">RO-${r.no}</span></span></div>", "<span class=\"nm\"><h4>${esc(r.cust)}</h4><span class=\"tg-ro\">RO-${r.no}</span></span>${r.late?'<span class=\"tg-late\">Late</span>':''}</div>")
rep("Late tiles','A thin amber top edge.'", "Late','An amber Late pill and an amber age — nothing else turns colour.'")
# 7 · idea 7 — the Next bar's button is the one action that RO needs
rep("""<div class="i7-next"><span class="k">Next</span><p>${esc(r.next||'Keep going — nothing waiting on anyone.')}</p><button class="px-btn px-btn--sm">${I.phone}Log a call</button><button class="px-btn px-btn--accent px-btn--sm">Send estimate</button></div>""",
    """${(()=>{const n=needs().find(x=>x[0]===r);const t=r.next||(n?n[3]:'Nothing waiting on anyone — keep going.');return `<div class="i7-next"><span class="k">Next</span><p>${esc(t.charAt(0).toUpperCase()+t.slice(1))}</p><button class="px-btn px-btn--sm">${I.phone}Log a call</button>${n?`<button class="px-btn px-btn--accent px-btn--sm">${n[4]}</button>`:''}</div>`;})()}""")
# 8 · idea 8 — pending transfers are dashed
rep(".i8-c.pend{background:transparent;box-shadow:inset 0 0 0 1px var(--border);border:0;background-image:none}", ".i8-c.pend{background:transparent;box-shadow:none;outline:1.5px dashed var(--border-strong);outline-offset:-1.5px}")
open("make_triage.py", "w").write(s)
print("ok")
