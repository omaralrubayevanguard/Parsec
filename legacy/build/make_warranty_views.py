# Warranty — group 6: the Money and Parts views. Money: claimed / paid / waiting on Volvo / recovered /
# absorbed for a period, claimed and paid by month, what's waiting by age, the oldest claims, CSV export.
# Parts: the failed-parts shelf — tag, where it sits, keep-until or ship-by, return requested, done.
import os, sys, re
B = os.path.dirname(os.path.abspath(__file__))
AF = os.path.join(B, "make_warranty_after.py")
SRC = os.path.join(B, "make_warranty.py")
t = open(AF).read()
lib = t.split('\ng = {"__name__"')[0]
ns = {"__file__": AF, "__name__": "after_lib"}
exec(compile(lib, AF, "exec"), ns)
src = ns["src"]

def rep(a, b, n=1):
    global src
    c = src.count(a)
    assert c == n, (a[:90], c)
    src = src.replace(a, b)

# ---------- data: older claims for the aging, more failed parts on the shelf ----------
rep("hist:[[22,'submitted','You'],[12,'approved','Volvo']]", "hist:[[48,'submitted','You'],[12,'approved','Volvo']]")
rep("cost:2140.00,done:24,", "cost:2140.00,done:50,")
rep("tech:'PS',opened:26,", "tech:'PS',opened:52,")
rep("hist:[[16,'submitted','You']]", "hist:[[64,'submitted','You'],[50,'returned','Volvo'],[16,'submitted','You']]")
rep("cost:942.55,done:18,", "cost:942.55,done:66,")
rep("tech:'KT',opened:22,", "tech:'KT',opened:68,")
rep("parts:[['Coolant temp sensor','21531072',1,64.20,'Installed']]", "parts:[['Coolant temp sensor','21531072',1,64.20,'Installed',{tag:'FP-0402',shelf:'W4',keep:25}]]")
rep("parts:[['Injector','85020422',1,1180.00,'Installed'],", "parts:[['Injector','85020422',1,1180.00,'Installed',{tag:'FP-0391',shelf:'W5',ret:{ra:'87990',by:-8},done:'shipped 10/14 · RA 87990 · 1Z 84A 2T0 03 1187 4402'}],")
rep("parts:[['DEF doser','23380146',1,618.00,'Installed']]", "parts:[['DEF doser','23380146',1,618.00,'Installed',{tag:'FP-0384',shelf:'W5',ret:{ra:'88190',by:9}}]]")
rep("parts:[['Air governor','20792960',1,214.30,'Installed']]", "parts:[['Air governor','20792960',1,214.30,'Installed',{tag:'FP-0394',shelf:'W3',keep:0,done:'scrapped 10/20 · 30 days up'}]]")
rep("parts:[['Radiator','21712578',1,1460.00,'Installed']]", "parts:[['Radiator','21712578',1,1460.00,'Installed',{tag:'FP-0388',shelf:'W6',keep:3}]]")
# the part popover can be opened for any part, not just the one in Needs action
rep("const x=itemOf(r.no), pp=o.parts[x&&x.pj!=null?x.pj:0], f=pp[5];", "const x=itemOf(r.no), pp=o.parts[p.pj!=null?p.pj:x&&x.pj!=null?x.pj:0], f=pp[5];")
rep("x=itemOf(r.no), pp=r.ops[p.op].parts[x&&x.pj!=null?x.pj:0], f=pp[5];", "x=itemOf(r.no), pp=r.ops[p.op].parts[p.pj!=null?p.pj:x&&x.pj!=null?x.pj:0], f=pp[5];")

# ---------- views ----------
rep("const vs=[['claims','claim','Claims'],['board','board','Board']];", "const vs=[['claims','claim','Claims'],['board','board','Board'],['money','dollar','Money'],['parts','parts','Parts']];")
rep("const body=v==='board'?vBoard(r):vClaims(r);", "const body=v==='board'?vBoard(r):v==='money'?vMoney(r):v==='parts'?vParts(r):vClaims(r);")
rep("if(k==='1'||k==='2'){U.view=['claims','board'][+k-1];render();return stop();}", "if(k>='1'&&k<='4'){U.view=['claims','board','money','parts'][+k-1];U.pop=null;render();return stop();}")

rep("function vClaims(r){", r"""/* ---------- Money ---------- */
const MON=[['Jan',7210,6880,11],['Feb',6450,6120,9],['Mar',8930,8240,13],['Apr',7820,7610,11],['May',8420,7980,12],['Jun',9310,8650,13],['Jul',7650,7420,10],['Aug',10240,9310,14],['Sep',8880,8460,11]];
const ABS={Aug:380,Sep:420,ytd:3410}, REC={Aug:0.910,Sep:0.953,ytd:0.941};
const firstFiled=o=>{ const h=o.hist.filter(x=>x[1]==='submitted'); return h.length?Math.max(...h.map(x=>x[0])):null; };
const lastAt=(o,s)=>{ const h=o.hist.filter(x=>x[1]===s); return h.length?Math.min(...h.map(x=>x[0])):null; };
const allOps=()=>{ const L=[]; S.R.forEach(r=>r.ops.forEach((o,i)=>L.push({r,o,i}))); return L; };
function liveMonth(){ const L=allOps(), D=21; let cl=0,cn=0,pd=0,pn=0,ab=0,cc=0,cp=0,den=0;
  L.forEach(({o})=>{ const f=firstFiled(o); if(f!=null&&f<=D){ cl+=amtOf(o); cn++; }
    const pa=lastAt(o,'paid'); if(o.st==='paid'&&pa!=null&&pa<=D){ pd+=+(o.claim.paid||0); pn++; }
    if(o.claim.short&&pa!=null&&pa<=D) ab+=o.claim.short.amt; if(o.st==='written'&&(lastAt(o,'written')||0)<=D) ab+=amtOf(o);
    const ca=o.st==='paid'?pa:o.st==='denied'?lastAt(o,'denied'):o.st==='written'?lastAt(o,'written'):null; if(ca!=null&&ca<=D){ cc+=amtOf(o); cp+=o.st==='paid'?+(o.claim.paid||0):0; if(o.st==='denied') den++; } });
  return {cl,cn,pd,pn,ab,rec:cc?cp/cc:1,closed:cc,den}; }
function periodStats(k){ const m=liveMonth(), S9=MON[8], S8=MON[7];
  if(k==='month') return {lbl:'this month',cl:m.cl,cn:m.cn,pd:m.pd,pn:m.pn,ab:m.ab,rec:m.rec,closed:m.closed,den:m.den,vs:`Sep ${usd0(S9[1])}`};
  if(k==='last') return {lbl:'in September',cl:S9[1],cn:S9[3],pd:S9[2],pn:S9[3]-1,ab:ABS.Sep,rec:REC.Sep,closed:S9[1],den:0,vs:`Aug ${usd0(S8[1])}`};
  if(k==='90') { const cl=S8[1]+S9[1]+m.cl, closed=S8[1]+S9[1]+m.closed; return {lbl:'in the last 90 days',cl,cn:S8[3]+S9[3]+m.cn,pd:S8[2]+S9[2]+m.pd,pn:S8[3]+S9[3]-2+m.pn,ab:ABS.Aug+ABS.Sep+m.ab,rec:(S8[1]*REC.Aug+S9[1]*REC.Sep+m.closed*m.rec)/closed,closed,den:m.den}; }
  const cl=MON.reduce((a,x)=>a+x[1],0)+m.cl, closed=MON.reduce((a,x)=>a+x[1],0)+m.closed; return {lbl:'this year',cl,cn:MON.reduce((a,x)=>a+x[3],0)+m.cn,pd:MON.reduce((a,x)=>a+x[2],0)+m.pd,pn:MON.reduce((a,x)=>a+x[3],0)-6+m.pn,ab:ABS.ytd+m.ab,rec:(MON.reduce((a,x)=>a+x[1],0)*REC.ytd+m.closed*m.rec)/closed,closed,den:m.den+3}; }
function waiting(){ return allOps().filter(({o})=>['submitted','approved','appealed','returned'].includes(o.st)).map(x=>Object.assign(x,{age:firstFiled(x.o)||0})).sort((a,b)=>b.age-a.age); }
const kfmt=n=>n>=1000?(Math.round(n/100)/10).toString().replace(/\.0$/,'')+'K':String(Math.round(n));
function moneyChart(){ const m=liveMonth(), D=MON.slice(4).map(x=>[x[0],x[1],x[2]]).concat([['Oct',m.cl,m.pd]]), W=520, H=210, L=44, B=26, T=14, mx=12000, y=v=>H-B-(v/mx)*(H-B-T), bw=18, slot=(W-L-8)/D.length;
  const bar=(x,v,cls,tip)=>{ const top=y(v), h=H-B-top, r=Math.min(4,h); return `<path class="${cls}" d="M${x},${H-B}V${top+r}Q${x},${top} ${x+r},${top}H${x+bw-r}Q${x+bw},${top} ${x+bw},${top+r}V${H-B}Z" data-tip="${esc(tip)}"/>`; };
  let g=[0,4000,8000,12000].map(v=>`<line x1="${L}" x2="${W}" y1="${y(v)}" y2="${y(v)}" class="gl"/><text x="${L-8}" y="${y(v)+4}" class="ax" text-anchor="end">${v?'$'+kfmt(v):'$0'}</text>`).join('');
  D.forEach((d,k)=>{ const cx=L+slot*k+slot/2, x1=cx-bw-1, x2=cx+1, tip=`${d[0]==='Oct'?'October so far':d[0]} · claimed ${usd0(d[1])} · paid ${usd0(d[2])}`;
    g+=`<rect class="hit" x="${cx-slot/2+2}" y="${T}" width="${slot-4}" height="${H-B-T}" data-tip="${esc(tip)}"/>`+bar(x1,d[1],'c1',tip)+bar(x2,d[2],'c2',tip)+`<text x="${cx}" y="${H-8}" class="ax" text-anchor="middle">${d[0]}</text>`; });
  const tbl=`<table class="wx-mt"><thead><tr><th>Month</th><th>Claimed</th><th>Paid</th><th>Paid ÷ claimed</th></tr></thead><tbody>${D.map(d=>`<tr><td>${d[0]==='Oct'?'Oct (so far)':d[0]}</td><td>${usd(d[1])}</td><td>${usd(d[2])}</td><td>${d[1]?Math.round(d[2]/d[1]*100)+'%':'—'}</td></tr>`).join('')}</tbody></table>`;
  return `<div class="wx-card"><div class="wx-ch2"><b>Claimed and paid</b><small>by month · May–Oct</small><span class="sp"></span><span class="wx-lg"><i class="c1"></i>Claimed<i class="c2"></i>Paid</span><button class="tg-link" data-a="mtbl">${U.mtbl?'Chart':'Table'}</button></div>${U.mtbl?tbl:`<svg class="wx-svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="Claimed and paid by month, May to October">${g}</svg><p class="wx-agn">October so far: <b>${usd0(D[5][1])}</b> claimed · <b>${usd0(D[5][2])}</b> paid — credits land weeks after filing.</p>`}</div>`; }
function agingChart(){ const L=waiting(), Bk=[['0–30 days',0,30],['31–60 days',31,60],['61–90 days',61,90],['Over 90 days',91,9999]].map(b=>{ const it=L.filter(x=>x.age>=b[1]&&x.age<=b[2]); return [b[0],it.reduce((a,x)=>a+amtOf(x.o),0),it]; }), mx=Math.max(1,...Bk.map(b=>b[1]));
  return `<div class="wx-card"><div class="wx-ch2"><b>Waiting on Volvo by age</b><small>since first filed</small></div><div class="wx-ag">${Bk.map((b,k)=>`<div class="wx-agr" data-tip="${esc(b[0]+' · '+usd(b[1])+(b[2].length?' · '+b[2].map(x=>x.o.claim.no).join(', '):''))}"><span class="k">${b[0]}</span><span class="tr">${b[1]?`<i style="width:${(b[1]/mx*100).toFixed(1)}%"${k>=2?' class="old"':''}></i>`:''}</span><span class="v"><b>${usd0(b[1])}</b> · ${b[2].length} claim${b[2].length===1?'':'s'}</span></div>`).join('')}</div><p class="wx-agn">${ic('flag',12)}Over 60 days is worth a call — the oldest is ${L[0]?`${L[0].o.claim.no}, ${L[0].age} days`:'—'}.</p></div>`; }
function vMoney(r){ const k=U.per||'month', P=periodStats(k), Wt=waiting(), wsum=Wt.reduce((a,x)=>a+amtOf(x.o),0), rp=Math.round(P.rec*100), rc=rp>=90?'good':rp>=75?'warn':'bad';
  const pc=[['month','This month'],['last','Last month'],['90','Last 90 days'],['year','This year']];
  const tile=(l,v,s,x)=>`<div class="wx-tile${x?' '+x:''}"><small>${l}</small><b>${v}</b><span>${s}</span></div>`;
  return `<div class="wx-mv"><div class="wx-mf"><div class="tg-seg3 wx-per">${pc.map(p=>`<button class="${k===p[0]?'on':''}" data-a="per" data-k="${p[0]}">${p[1]}</button>`).join('')}</div><span class="sp"></span><button class="btn btn-sm" data-a="csv">${ic('copy',13)}Export CSV</button></div>
    <div class="wx-tiles">${tile('Claimed',usd0(P.cl),`${P.cn} claims ${P.lbl}${k==='month'?' · '+P.vs+' last month':''}`)}${tile('Paid',usd0(P.pd),`${P.pn} claims ${P.lbl}`)}${tile('Waiting on Volvo',usd0(wsum),`${Wt.length} claims · oldest ${Wt[0]?Wt[0].age:0} days`)}
      <div class="wx-tile"><small>Recovered</small><b>${rp}%</b><span>of ${usd0(P.closed)} closed ${P.lbl}${P.den?` · ${P.den} denied`:''}</span><span class="wx-meter ${rc}"><i style="width:${Math.min(100,rp)}%"></i></span><span class="wx-mst ${rc}">${rc==='good'?ic('check',11)+'On target — 90% or better':rc==='warn'?ic('flag',11)+'Below 90%':ic('flag',11)+'Well below 90% — see the denials'}</span></div>
      ${tile('Absorbed',usd0(P.ab),`short pays and write-offs ${P.lbl}`)}</div>
    <div class="wx-charts">${moneyChart()}${agingChart()}</div>
    <div class="wx-card"><div class="wx-ch2"><b>Oldest waiting</b><small>${Wt.length} claims · ${usd(wsum)}</small></div><div class="wx-ot"><div class="h"><span>RO · customer</span><span>Claim #</span><span>Status</span><span>First filed</span><span class="r">Age</span><span class="r">Amount</span></div>${Wt.slice(0,6).map(x=>`<button class="row" data-a="msel" data-ro="${x.r.no}" data-op="${x.i}"><span><b class="tg-no">${x.r.no}</b> ${esc(x.r.cust)}</span><span class="m">${esc(x.o.claim.no||'')}</span><span>${chip(x.o.st)}</span><span>${dateOf(x.age)}</span><span class="r m${x.age>60?' old':''}">${x.age} d</span><span class="r m">${usd(amtOf(x.o))}</span></button>`).join('')}</div></div>
    <div class="wx-tip" hidden></div></div>`; }
function exportCsv(){ const q=v=>{ const s=String(v==null?'':v); return /[",\n]/.test(s)?'"'+s.replace(/"/g,'""')+'"':s; };
  const rows=[['RO','Customer','Op','Complaint','Claim #','Status','Claimed','Paid','Short','First filed','Age (days)']].concat(allOps().filter(({o})=>o.st!=='repair').map(({r,o,i})=>{ const f=firstFiled(o); return [r.no,r.cust,i+1,o.cmp,o.claim.no||'',STL[o.st],amtOf(o).toFixed(2),o.claim.paid||'',o.claim.short?o.claim.short.amt.toFixed(2):'',f!=null?dateOf(f):'',f!=null?f:'']; }));
  const csv=rows.map(r=>r.map(q).join(',')).join('\n'); try{ const a=document.createElement('a'); a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'})); a.download='warranty-claims-2026-10-22.csv'; document.body.appendChild(a); a.click(); a.remove(); }catch(e){} return rows.length-1; }
/* ---------- Parts: the failed-parts shelf ---------- */
function shelf(){ const L=[]; S.R.forEach(r=>r.ops.forEach((o,i)=>o.parts.forEach((p,j)=>{ const f=p[5]; if(!f) return; const st=f.done?(/^shipped/.test(f.done)?'shipped':'done'):f.ret?'ret':'hold', due=f.done?null:f.ret?f.ret.by:f.keep; L.push({r,o,i,p,j,f,st,due}); }))); return L.sort((a,b)=>(a.due==null?999:a.due)-(b.due==null?999:b.due)); }
function vParts(r){ const L=shelf(), F=U.pf||'all', SH=U.ps||null, cnt=k=>L.filter(x=>k==='all'||x.st===k||(k==='done'&&x.st==='shipped')).length;
  const V=L.filter(x=>(F==='all'||x.st===F||(F==='done'&&(x.st==='done'||x.st==='shipped')))&&(!SH||x.f.shelf===SH));
  const ST={hold:['Holding',''],ret:['Return requested','warn'],shipped:['Shipped','ok'],done:['Done','']};
  const fs=[['all','All'],['hold','Holding'],['ret','Return requested'],['done','Shipped or done']];
  const bins=['W1','W2','W3','W4','W5','W6'].map(b=>{ const it=L.filter(x=>x.f.shelf===b&&(x.st==='hold'||x.st==='ret')); return `<button class="wx-bin${SH===b?' on':''}" data-a="pshelf" data-s="${b}"><b>${b}</b><span>${it.map(x=>`<i class="${x.st==='ret'?'ret':x.due!=null&&x.due<=7?'due':''}" title="${esc(x.f.tag+' · '+x.p[0])}">${esc(x.f.tag.replace('FP-',''))}</i>`).join('')||'<em>empty</em>'}</span></button>`; }).join('');
  return `<div class="wx-pv2"><div class="wx-mf"><div class="tg-seg3 wx-per">${fs.map(f=>`<button class="${F===f[0]?'on':''}" data-a="pfilt" data-k="${f[0]}">${f[1]} <span>${cnt(f[0])}</span></button>`).join('')}</div>${SH?`<button class="tg-fchip" data-a="pshelf" data-s="${SH}">Shelf ${SH}${ic('x',11)}</button>`:''}<span class="sp"></span><button class="btn btn-sm" data-a="ptags">${ic('print',13)}Print tags</button></div>
    <div class="wx-bins">${bins}</div>
    <div class="wx-card"><div class="wx-pt2 h"><span>Tag</span><span>Part</span><span>RO · claim</span><span>Shelf</span><span>Status · due</span><span></span></div>
      ${V.map(x=>`<div class="wx-pt2${x.st==='shipped'||x.st==='done'?' dn':''}"><span class="m tag">${esc(x.f.tag)}</span><span><b>${esc(x.p[0])}</b><small>${esc(x.p[1])}${x.o.causal===x.j?' · causal':''}</small></span><span><span class="l1"><button class="tg-link" data-a="msel" data-ro="${x.r.no}" data-op="${x.i}"><b class="tg-no">${x.r.no}</b></button> · <span class="m">${esc(x.o.claim.no||'not filed')}</span></span><small>${esc(x.r.cust)} · ${esc(STL[x.o.st])}</small></span><span class="m">${esc(x.f.shelf)}</span><span><span class="l1"><span class="wx-ps ${ST[x.st][1]}">${ST[x.st][0]}</span>${x.due!=null&&x.due<=7?dueChip(x.due):''}</span><small>${x.f.done?esc(x.f.done):x.due!=null?`${x.f.ret?'ship by':'keep until'} ${byTxt(x.due)}${x.f.ret?' · RA '+esc(x.f.ret.ra):''}`:''}</small></span><span class="act">${x.st==='ret'?`<button class="btn btn-sm" data-a="ppop" data-ro="${x.r.no}" data-op="${x.i}" data-j="${x.j}">Ship…</button>`:x.st==='hold'?`<button class="btn btn-sm" data-a="ppop" data-ro="${x.r.no}" data-op="${x.i}" data-j="${x.j}">Done holding…</button>`:''}<button class="btn btn-sm ib" data-a="ptag" data-t="${esc(x.f.tag)}" title="Print tag">${ic('print',13)}</button></span></div>`).join('')||'<p class="wx-none2">Nothing here.</p>'}</div></div>`; }
function vClaims(r){""")

# ---------- actions ----------
rep("  else if(a==='cfg'){", r"""  else if(a==='per'){ U.per=t.dataset.k; render(); }
  else if(a==='mtbl'){ U.mtbl=!U.mtbl; render(); }
  else if(a==='csv'){ const n=exportCsv(); toast(`${n} claims exported — warranty-claims-2026-10-22.csv.`,false); render(); }
  else if(a==='msel'){ U.sel=no; U.op=+t.dataset.op; U.view='claims'; U.pop=null; render(); }
  else if(a==='pfilt'){ U.pf=t.dataset.k; render(); }
  else if(a==='pshelf'){ U.ps=U.ps===t.dataset.s?null:t.dataset.s; render(); }
  else if(a==='ppop'){ U.sel=no; U.pop={type:'part',ro:no,op:+t.dataset.op,pj:+t.dataset.j}; render(); }
  else if(a==='ptag'){ toast(`Tag ${t.dataset.t} sent to the label printer.`,false); render(); }
  else if(a==='ptags'){ const n=shelf().filter(x=>x.st==='hold'||x.st==='ret').length; toast(`${n} tags sent to the label printer.`,false); render(); }
  else if(a==='cfg'){""")
# tooltips on the money charts
rep("mock.addEventListener('click',e=>{", r"""mock.addEventListener('pointermove',e=>{ const tip=$('.wx-tip'); if(!tip) return; const h=e.target.closest('[data-tip]'); $$('.wx-svg .hv').forEach(x=>x.classList.remove('hv')); if(!h){ tip.hidden=true; return; }
  if(h.matches('.wx-svg *')){ const tx=h.getAttribute('data-tip'); $$('.wx-svg [data-tip]').forEach(x=>{ if(x.getAttribute('data-tip')===tx&&x.tagName==='path') x.classList.add('hv'); }); }
  const box=$('.wx-mv').getBoundingClientRect(); tip.textContent=h.getAttribute('data-tip'); tip.hidden=false; tip.style.left=Math.min((e.clientX-box.left)/scale+14,box.width/scale-260)+'px'; tip.style.top=((e.clientY-box.top)/scale+14)+'px'; });
mock.addEventListener('click',e=>{""")
rep("document.addEventListener('pointerdown',e=>{ if(!mock.contains(e.target)||e.target.closest('.wx-pv')) return; let ch=false;", "document.addEventListener('pointerdown',e=>{ if(!mock.contains(e.target)||e.target.closest('.wx-pv')) return; let ch=false; if(e.target.closest('[data-a=\"ppop\"]')) return;")
rep("<span>${kbd('T')}send to</span><span>${kbd('C')}copy</span>", "<span>${kbd('T')}send to</span><span>${kbd('1')}–${kbd('4')}views</span>")

# ---------- styles ----------
CSS6 = r"""
/* ---------- group 6: Money and Parts ---------- */
.wx-mv,.wx-pv2{height:100%;overflow:auto;padding:18px 28px 28px;display:flex;flex-direction:column;gap:14px;position:relative;scrollbar-width:thin;
  --viz-c1:#A0978A;--viz-c2:#86643A;--viz-grid:var(--tg-hair);}
:root[data-theme="dark"] .wx-mv{--viz-c1:#6E6A62;--viz-c2:#D1B184;}
.wx-mf{display:flex;align-items:center;gap:10px;}
.wx-mf .sp{flex:1;}
.wx-per button span{color:var(--tg-ink4);font-weight:500;margin-left:2px;}
.wx-tiles{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:10px;}
.wx-tile{display:flex;flex-direction:column;gap:3px;padding:12px 14px 13px;border-radius:14px;background:var(--tg-raised);box-shadow:inset 0 0 0 1px var(--tg-hair);min-width:0;}
.wx-tile small{font-size:12px;color:var(--tg-ink3);}
.wx-tile b{font:600 24px/30px var(--tg-sans);letter-spacing:-.01em;color:var(--tg-ink);}
.wx-tile > span{font-size:11.5px;line-height:16px;color:var(--tg-ink3);}
.wx-meter{display:block;height:6px;border-radius:3px;margin-top:6px;overflow:hidden;}
.wx-meter i{display:block;height:100%;border-radius:3px;}
.wx-meter.good{background:var(--tg-good-t);} .wx-meter.good i{background:var(--tg-good);}
.wx-meter.warn{background:var(--tg-warn-t);} .wx-meter.warn i{background:var(--tg-warn);}
.wx-meter.bad{background:var(--tg-bad-t);} .wx-meter.bad i{background:var(--tg-bad);}
.wx-mst{display:inline-flex !important;align-items:center;gap:4px;margin-top:4px;font-weight:500;}
.wx-mst.good{color:var(--tg-good) !important;} .wx-mst.warn{color:var(--tg-warn) !important;} .wx-mst.bad{color:var(--tg-bad) !important;}
.wx-charts{display:grid;grid-template-columns:minmax(0,1.25fr) minmax(0,1fr);gap:10px;}
.wx-card{border-radius:14px;background:var(--tg-raised);box-shadow:inset 0 0 0 1px var(--tg-hair);padding:14px 16px;min-width:0;}
.wx-ch2{display:flex;align-items:baseline;gap:8px;margin-bottom:8px;font-size:13px;}
.wx-ch2 b{font-weight:600;color:var(--tg-ink);} .wx-ch2 small{font-size:12px;color:var(--tg-ink3);} .wx-ch2 .sp{flex:1;}
.wx-lg{display:inline-flex;align-items:center;gap:6px;font-size:12px;color:var(--tg-ink2);}
.wx-lg i{width:10px;height:10px;border-radius:2px;display:inline-block;margin-left:6px;} .wx-lg i.c1{background:var(--viz-c1);} .wx-lg i.c2{background:var(--viz-c2);}
.wx-svg{width:100%;height:auto;display:block;}
.wx-svg .gl{stroke:var(--viz-grid);stroke-width:1;}
.wx-svg .ax{font:500 10.5px var(--tg-sans);fill:var(--tg-ink3);font-variant-numeric:tabular-nums;}
.wx-svg .lbl{font:600 11px var(--tg-sans);fill:var(--tg-ink2);}
.wx-svg .c1{fill:var(--viz-c1);} .wx-svg .c2{fill:var(--viz-c2);}
.wx-svg .hit{fill:transparent;}
.wx-svg path.hv{filter:brightness(1.12);}
.wx-mt{width:100%;border-collapse:collapse;font-size:12.5px;font-variant-numeric:tabular-nums;} .wx-mt th{text-align:left;font-weight:500;font-size:11.5px;color:var(--tg-ink3);padding:4px 6px;box-shadow:inset 0 -1px 0 var(--tg-hair);} .wx-mt td{padding:6px;box-shadow:inset 0 -1px 0 var(--tg-hair);}
.wx-ag{display:flex;flex-direction:column;gap:10px;padding:6px 0 2px;}
.wx-agr{display:grid;grid-template-columns:86px minmax(0,1fr);grid-template-rows:auto auto;gap:3px 10px;align-items:center;cursor:default;}
.wx-agr .k{font-size:12.5px;color:var(--tg-ink2);grid-row:1 / span 2;}
.wx-agr .tr{height:16px;display:flex;align-items:center;}
.wx-agr .tr i{display:block;height:16px;min-width:2px;border-radius:0 4px 4px 0;background:var(--viz-c2);}
.wx-agr .tr i.old{background:var(--tg-warn);}
.wx-agr .v{font-size:12px;color:var(--tg-ink3);} .wx-agr .v b{font-weight:600;color:var(--tg-ink);font-variant-numeric:tabular-nums;}
.wx-agr:hover .tr i{filter:brightness(1.12);}
.wx-agn{display:flex;align-items:center;gap:6px;margin:12px 0 0;font-size:12px;color:var(--tg-ink3);}
.wx-ot{display:flex;flex-direction:column;}
.wx-ot .h,.wx-ot .row{display:grid;grid-template-columns:minmax(0,1.6fr) 96px 110px 92px 60px 100px;gap:10px;align-items:center;}
.wx-ot .h{font-size:11.5px;color:var(--tg-ink3);padding:4px 6px;box-shadow:inset 0 -1px 0 var(--tg-hair);}
.wx-ot .row{all:unset;box-sizing:border-box;display:grid;grid-template-columns:minmax(0,1.6fr) 96px 110px 92px 60px 100px;gap:10px;align-items:center;min-height:38px;padding:0 6px;border-radius:8px;cursor:pointer;font-size:13px;box-shadow:inset 0 -1px 0 var(--tg-hair);}
.wx-ot .row:hover{background:var(--tg-fill);}
.wx-ot .r{text-align:right;} .wx-ot .m{font:500 12.5px/1 var(--tg-mono);font-variant-numeric:tabular-nums;} .wx-ot .old{color:var(--tg-warn);font-weight:600;}
.wx-ot span{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.wx-tip{position:absolute;z-index:20;max-width:250px;padding:7px 10px;border-radius:9px;background:var(--tg-raised);box-shadow:var(--tg-sh-raised);font-size:12px;line-height:17px;color:var(--tg-ink);pointer-events:none;}
.wx-bins{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:8px;}
.wx-bin{all:unset;box-sizing:border-box;cursor:pointer;display:flex;flex-direction:column;gap:6px;padding:10px 11px;border-radius:12px;background:var(--tg-canvas);box-shadow:inset 0 0 0 1px var(--tg-hair);min-height:76px;}
.wx-bin:hover{box-shadow:inset 0 0 0 1px var(--tg-bs);} .wx-bin.on{box-shadow:inset 0 0 0 1.5px var(--tg-acc);background:var(--tg-acct);}
.wx-bin b{font:600 12px/1 var(--tg-mono);color:var(--tg-ink2);}
.wx-bin span{display:flex;flex-wrap:wrap;gap:4px;}
.wx-bin i{font:500 11px/18px var(--tg-mono);font-style:normal;padding:0 6px;border-radius:5px;background:var(--tg-raised);box-shadow:inset 0 0 0 1px var(--tg-hair);color:var(--tg-ink2);}
.wx-bin i.ret{background:var(--tg-warn-t);color:var(--tg-warn);box-shadow:none;} .wx-bin i.due{background:var(--tg-bad-t);color:var(--tg-bad);box-shadow:none;}
.wx-bin em{font-style:normal;font-size:11.5px;color:var(--tg-ink4);}
.wx-pt2{display:grid;grid-template-columns:70px minmax(0,1.2fr) minmax(0,1.3fr) 44px minmax(0,1.3fr) 150px;gap:10px;align-items:center;min-height:48px;padding:4px 4px;font-size:13px;box-shadow:inset 0 -1px 0 var(--tg-hair);}
.wx-pt2.h{min-height:0;padding:4px;font-size:11.5px;color:var(--tg-ink3);}
.wx-pt2 > span{min-width:0;}
.wx-pt2 small{display:block;font-size:11.5px;color:var(--tg-ink3);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.wx-pt2 b{font-weight:500;}
.wx-pt2 > span > b,.wx-pt2 .l1{display:flex;align-items:center;gap:6px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.wx-pt2 > span > b{display:block;}
.wx-pt2 .m{font:500 12.5px/1 var(--tg-mono);} .wx-pt2 .tag{color:var(--tg-ink);}
.wx-pt2.dn{color:var(--tg-ink3);} .wx-pt2.dn b{color:var(--tg-ink2);}
.wx-pt2 .act{display:flex;gap:4px;justify-content:flex-end;}
.wx-ps{display:inline-flex;align-items:center;height:20px;padding:0 7px;border-radius:6px;font-size:11.5px;font-weight:500;background:var(--tg-fill);color:var(--tg-ink2);}
.wx-ps.warn{background:var(--tg-warn-t);color:var(--tg-warn);} .wx-ps.ok{background:var(--tg-good-t);color:var(--tg-good);}
.wx-none2{font-size:12.5px;color:var(--tg-ink4);margin:10px 4px;}
"""
rep("@media print{", CSS6 + "@media print{")

# ---------- the frame ----------
i = src.index("const DEMO={"); j = src.index("\n};", i) + 3
src = src[:i] + r"""const DEMO={
  money:()=>{reset();U.view='money';render();},
  q90:()=>{reset();U.view='money';U.per='90';render();},
  table:()=>{reset();U.view='money';U.mtbl=true;render();},
  parts:()=>{reset();U.view='parts';render();},
  ship:()=>{reset();U.view='parts';U.sel='37388';render();U.pop={type:'part',ro:'37388',op:0,pj:0,o:0};render();},
  shelf:()=>{reset();U.view='parts';U.ps='W5';render();}
};""" + src[j:]
src = re.sub(r'demos = "".join\(.*?\n', 'demos = "".join(f\'<button data-demo="{k}">{n}</button>\' for k, n in [("money", "1 · Money"), ("q90", "2 · Last 90 days"), ("table", "3 · As a table"), ("parts", "4 · Parts shelf"), ("ship", "5 · Ship a part"), ("shelf", "6 · One shelf")])\n', src, count=1)
src = re.sub(r"about = \[\n.*?\n\]\n", '''about = [
 ("Money", "Claimed, paid, waiting on Volvo, recovered and absorbed — this month, last month, 90 days or the year. Recovered turns orange under 90% and red well under it."),
 ("By month and by age", "Claimed and paid for the last six months (Table shows the numbers), and what’s waiting on Volvo by age since it was first filed — over 60 days is worth a call. Hover any bar."),
 ("Oldest waiting", "The claims that have waited longest, a click from the claim. Export CSV takes every claim to accounting."),
 ("Parts shelf", "Every failed part with its tag, shelf, keep-until or ship-by date and RA. The shelf strip shows what’s in each bin; click one to see just that shelf."),
 ("Ship or scrap", "Ship… logs the tracking #, Done holding… scraps it, keeps it longer or gives it back. Print a tag from any row."),
]
''', src, count=1, flags=re.S)
rep("<title>Parsec Warranty after filing</title>", "<title>Parsec Warranty money and parts</title>")
rep("Parsec · Warranty — After filing", "Parsec · Warranty — Money and Parts")
rep("<h2>After filing<small>What happens to the money when Volvo answers.</small></h2>", "<h2>Money and Parts<small>Two more views in the header: 3 Money, 4 Parts.</small></h2>")

g = {"__name__": "__main__", "__file__": SRC}
exec(compile(src, SRC, "exec"), g)
