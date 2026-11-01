s = open("make_mock2.py").read()
def rep(old, new, count=1):
    global s
    assert s.count(old) >= 1, old[:70]
    s = s.replace(old, new, count)

rep('''PARTS = {1: [("1-1","Clutch kit, 15.5 in","85136213","1","received"),("1-2","Clutch release bearing","21515427","1","installed")],
         2: [("2-1","Inner wheel seal, right rear","21422645","1","notordered")],
         3: [("3-1","Oil filter","21707134","2","received"),("3-2","Fuel filter kit","23658092","1","ordered")]}''', 'PARTS = P.PARTS_D')
rep('''FILES = {1: [("flywheel-scoring.jpg","Picture","Oct 19"),("clutch-disc.jpg","Picture","Oct 19")], 2: [("rr-seal-leak.jpg","Picture","Oct 20")], 3: []}''', 'FILES = P.FILES_D')

rep('''  {P.details(True)}
</div>
</section>
</div>\'\'\'
''', '''  {MONEY(P.details(True))}
</div>
</section>
</div>\'\'\'
''')
rep("app = f'''<div class=\"px-app\">", '''def MONEY(h):
    h = h.replace('<b class="px-num">11.90 h · $2,499.00</b>', '<b class="px-num" data-labor>11.90 h · $2,499.00</b>')
    h = h.replace('<span class="px-num">$3,276.50</span>', '<span class="px-num" data-est>$3,276.50</span>')
    return h.replace('<span class="px-pg__sum">$3,276.50</span>', '<span class="px-pg__sum" data-est-sum>$3,276.50</span>')

app = f\'\'\'<div class="px-app">''')

rep('ICO = {k: ic(k) for k in ("pencil","copy","swap","trash","check","play","stop","chevD")}', 'ICO = {k: ic(k) for k in ("pencil","copy","swap","trash","check","play","stop","chevD","chevR","clip")}')

rep(''' ("Modals", "Open from a link, a menu item or a key (T, O). Scrim fades in, the dialog rises 8 px; Esc, Cancel or a click outside closes; ⌘↵ confirms."),
]''', ''' ("Modals", "Open from a link, a menu item or a key (T, O). Scrim fades in, the dialog rises 8 px; Esc, Cancel or a click outside closes; ⌘↵ confirms."),
 ("Totals in the header", "Time (burnt / quoted), parts (in hand / total) and files, top right. They update live; click one for its breakdown, then click a row to jump to that operation."),
]''')
rep('''+ (
    '<div class="wt-open"><button class="px-btn px-btn--sm" data-open-modal="transfer">Transfer RO</button><button class="px-btn px-btn--sm" data-open-modal="addop">Add operation</button><button class="px-btn px-btn--sm" data-open-modal="delete">Delete RO</button></div>' if i == 11 else '') +''', '''+ OPEN.get(i, '') +''')
rep("notes_html = \"\".join(", '''OPEN = {11: '<div class="wt-open"><button class="px-btn px-btn--sm" data-open-modal="transfer">Transfer RO</button><button class="px-btn px-btn--sm" data-open-modal="addop">Add operation</button><button class="px-btn px-btn--sm" data-open-modal="delete">Delete RO</button></div>',
        12: '<div class="wt-open"><button class="px-btn px-btn--sm" data-open-modal="time">Time</button><button class="px-btn px-btn--sm" data-open-modal="parts">Parts</button><button class="px-btn px-btn--sm" data-open-modal="files">Files</button></div>'}
notes_html = "".join(''')

rep(".wt .px-head[data-n]::after{top:13px;left:auto;right:124px}", ".wt .px-head[data-n]::after{top:13px;left:calc(50% - 11px)}\n.wt .px-totals[data-n]::after{left:-30px;top:3px;box-shadow:0 0 0 3px var(--panel)}")

rep("const MODALS={transfer:__M_TRANSFER__, addop:__M_ADDOP__, del:__M_DELETE__};", "const MODALS={transfer:__M_TRANSFER__, addop:__M_ADDOP__, del:__M_DELETE__};\nconst MSHELL=__MSHELL__, ROFILES=__ROFILES__;")
rep("function openModal(kind,from){close();if(modal)modal.remove();const w=document.createElement('div');w.innerHTML=MODALS[kind];",
    "function openModal(kind,from){close();if(modal)modal.remove();const w=document.createElement('div');const src=MODALS[kind];w.innerHTML=typeof src==='function'?src():src;")
rep("$$('[data-close]',m).forEach(b=>b.onclick=closeModal);", "$$('[data-close]',m).forEach(b=>b.onclick=closeModal);\n  $$('[data-goto-op]',m).forEach(b=>b.onclick=()=>{const n=b.dataset.gotoOp,tab=b.dataset.gotoTab;closeModal();gotoOp(n,tab);});\n  $$('[data-file]',m).forEach(b=>b.onclick=()=>toast(ICO.clip+`Opens ${b.dataset.file}`));")
rep("if((e.metaKey||e.ctrlKey)&&e.key==='Enter'&&modal){e.preventDefault();$('[data-submit]',modal).click();return;}",
    "if((e.metaKey||e.ctrlKey)&&e.key==='Enter'&&modal){e.preventDefault();const sb=$('[data-submit]',modal);sb?sb.click():closeModal();return;}")

totals_js = r'''
/* ---------- header totals + their modals ---------- */
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function opsData(){return $$('.px-row[data-op]').map(r=>{const n=+r.dataset.op,b=$(`[data-body="${n}"]`);
  return {n,title:$('.px-row__t',r).textContent,si:$('.px-si',r).outerHTML.replace('px-si is-new','px-si'),burnt:parseFloat($('[data-burnt]',b).textContent)||0,q:quoted(b),
    parts:$$('[data-part]',b).map(p=>({d:$('span',p).textContent,pn:$('.px-id',p).textContent,qty:$('.r',p).textContent,k:$('[data-pstat]',p).dataset.pstat})),
    files:$$('[data-pane="files"] .px-li--part',b).map(f=>({name:f.firstElementChild.textContent.trim(),kind:$('.px-muted',f).textContent,date:$('small',f).textContent}))};});}
function roTotals(){const o=opsData(),q=o.reduce((a,x)=>a+x.q,0),b=o.reduce((a,x)=>a+x.burnt,0),wq=o.filter(x=>x.burnt>0).reduce((a,x)=>a+x.q,0);
  const parts=o.flatMap(x=>x.parts);
  return {o,q,b,left:o.reduce((a,x)=>a+Math.max(0,x.q-x.burnt),0),eff:b>0?Math.round(wq/b*100):null,np:parts.length,
    inhand:parts.filter(p=>['received','installed'].includes(p.k)).length,nf:ROFILES.length+o.reduce((a,x)=>a+x.files.length,0),parts};}
const money=x=>x.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});
function updateTotals(quiet){const t=roTotals();
  const set=(k,v)=>{const el=$(`[data-tt="${k}"]`);v=String(v);if(el.textContent===v)return false;el.textContent=v;return true;};
  set('burnt',t.b.toFixed(2));set('quoted',t.q.toFixed(2));
  if((set('inhand',t.inhand)|set('nparts',t.np))&&!quiet)flash($('[data-total="parts"]'));
  if(set('nfiles',t.nf)&&!quiet)flash($('[data-total="files"]'));
  $('[data-total="time"]').classList.toggle('is-live',!!run);
  const labor=t.q*210;$('[data-labor]').textContent=`${t.q.toFixed(2)} h · $${money(labor)}`;$('[data-est]').textContent=$('[data-est-sum]').textContent='$'+money(labor+777.5);}
const mshell=(t,s,b)=>MSHELL.split('@@T').join(t).replace('@@S',()=>s).replace('@@B',()=>b);
const grp=(label,sub,go,tab)=>{const inner=`<b>${label}</b>`+(sub?`<span>${sub}</span>`:'');return go?`<button class="px-mgrp" data-goto-op="${go}"${tab?` data-goto-tab="${tab}"`:''}>${inner}${ICO.chevR}</button>`:`<div class="px-mgrp">${inner}</div>`;};
function mTime(){const t=roTotals(),effc=t.eff!=null&&t.eff>=100?'px-good':'px-warn',effv=t.eff!=null?`${t.eff}<small>%</small>`:'—';
  const stats=`<div class="px-tsum"><div><span>Quoted</span><b>${t.q.toFixed(2)}<small>h</small></b></div><div><span>Burnt</span><b>${t.b.toFixed(2)}<small>h</small></b></div><div><span>Left</span><b>${t.left.toFixed(2)}<small>h</small></b></div><div><span>Efficiency</span><b class="${effc}">${effv}</b></div></div>`;
  const rows=t.o.map(x=>`<button class="px-mrow px-mrow--time" data-goto-op="${x.n}">${x.si}<span class="px-mrow__t"><span class="px-mrow__n">${x.n}</span>${esc(x.title)}</span><span class="px-mini"><i${x.burnt>x.q?' class="over"':''} style="width:${Math.min(100,x.q?x.burnt/x.q*100:0)}%"></i></span><span class="px-mrow__v">${x.burnt.toFixed(2)} <em>/ ${x.q.toFixed(2)} h</em></span></button>`).join('');
  return mshell('Time on RO-37538',`Blue Ridge Haulage · ${t.o.length} operations`,`${stats}<div class="px-mlist">${grp('By operation')}${rows}</div>`);}
function mParts(){const t=roTotals();
  const cells=Object.keys(PSI).map(k=>`<div><span>${PSI[k]}${PNAME[k]}</span><b>${t.parts.filter(p=>p.k===k).length}</b></div>`).join('');
  const groups=t.o.filter(x=>x.parts.length).map(x=>`<div class="px-mlist">${grp('Operation '+x.n,' · '+esc(x.title),x.n,'parts')}${x.parts.map(p=>`<button class="px-mrow px-mrow--part" data-goto-op="${x.n}" data-goto-tab="parts"><span class="px-mrow__t">${esc(p.d)}</span><span class="px-id px-faint">${esc(p.pn)}</span><span class="r">${esc(p.qty)}</span><span class="px-pstat-ro">${PSI[p.k]}<span>${PNAME[p.k]}</span></span></button>`).join('')}</div>`).join('');
  return mshell('Parts on RO-37538',`Blue Ridge Haulage · ${t.inhand} of ${t.np} in hand`,`<div class="px-tsum px-tsum--5">${cells}</div>${groups||'<p class="px-modal__p">No parts on this RO yet.</p>'}`);}
const frow=f=>`<button class="px-mrow px-mrow--file" data-file="${esc(f.name)}">${ICO.clip}<span class="px-mrow__t">${esc(f.name)}</span><span class="px-faint">${esc(f.kind)}</span><small>${esc(f.date)}</small></button>`;
function mFiles(){const t=roTotals();
  const g=`<div class="px-mlist">${grp('Whole RO',` · ${ROFILES.length}`)}${ROFILES.map(frow).join('')}</div>`+t.o.filter(x=>x.files.length).map(x=>`<div class="px-mlist">${grp('Operation '+x.n,' · '+esc(x.title),x.n,'files')}${x.files.map(frow).join('')}</div>`).join('');
  return mshell('Files on RO-37538',`Blue Ridge Haulage · ${t.nf} files`,g);}
MODALS.time=mTime;MODALS.parts=mParts;MODALS.files=mFiles;
function gotoOp(n,tab){const row=$(`.px-row[data-op="${n}"]`);if(!row.classList.contains('is-on'))row.click();const b=$(`[data-body="${n}"]`);if(tab)$(`[data-tab="${tab}"]`,b).click();
  $('.px-ro__main').scrollTo({top:Math.max(0,row.offsetTop-200),behavior:'smooth'});flash(row);}
$$('[data-total]').forEach(b=>b.onclick=()=>openModal(b.dataset.total,b));
'''
rep("/* ---------- operations, tabs, clock ---------- */", totals_js + "\n/* ---------- operations, tabs, clock ---------- */")

rep("$('.px-mini i',row).style.width=Math.min(100,h/q*100)+'%';}", "$('.px-mini i',row).style.width=Math.min(100,h/q*100)+'%';updateTotals();}")
rep("opIcon(n,'hold');setStatus('hold','',true);toast(SI.hold+`Clock stopped · operation ${n}`);return;}", "opIcon(n,'hold');setStatus('hold','',true);toast(SI.hold+`Clock stopped · operation ${n}`);updateTotals();return;}")
rep("run={body,t:setInterval(()=>paint(body,(BASE[n]||0)+Math.floor((Date.now()-startedAt)/1000)),1000)};}", "run={body,t:setInterval(()=>paint(body,(BASE[n]||0)+Math.floor((Date.now()-startedAt)/1000)),1000)};updateTotals();}\nupdateTotals(true);")
rep("else if(m)m.remove();}", "else if(m)m.remove();updateTotals();}")
rep("ops.appendChild(tpl);ops.appendChild(body);bindRow(tpl);bindBody(body);flash(tpl);", "ops.appendChild(tpl);ops.appendChild(body);bindRow(tpl);bindBody(body);flash(tpl);updateTotals();")

rep('"__OPTS__": P.options_menu(), "__CMD__": P.cmd_menu()}', '"__OPTS__": P.options_menu(), "__CMD__": P.cmd_menu(),\n       "__MSHELL__": P.modal(" px-modal--md", "@@T", "@@S", "@@B", P._info_foot(), \' data-n="13"\'), "__ROFILES__": [{"name": a, "kind": b, "date": c} for a, b, c in P.ROFILES_D]}')
open("make_mock2.py", "w").write(s)
print("patched")
