p='cx/views.js'; s=open(p).read()
def rp(a,b,n=1):
    global s
    assert s.count(a)==n, (s.count(a), a[:90]); s=s.replace(a,b)
# ---- state
rp("function reset(who){ who=who||'MR'; U={who,view:isLead(who)?'shop':'today',sel:'o1',pop:null,kb:false,mine:!isLead(who),hl:null};\n  S={ops:clone(OPS0),day:clone(DAY0),run:'o1',shop:null,out:null,chk:{c1:1,c2:1},fix:null,justDone:null}; TOAST=null; UNDO=null; }",
   "function reset(who){ who=who||'MR'; U={who,view:isLead(who)?'shop':'today',sel:'o1',pop:null,kb:false,mine:!isLead(who),hl:null,eod:false,tv:false,askk:'Second opinion'};\n  S={ops:clone(OPS0),day:clone(DAY0),run:'o1',shop:null,out:null,chk:{c1:1,c2:1},fix:null,justDone:null,bring:{},morning:false,dict:false,draft:'',ph:clone(PH0),inbox:3,eodc:{},left:''}; TOAST=null; UNDO=null; }")
rp("const stOf=o=>isRun(o)?'run':o.st;","const stOf=o=>isRun(o)?'run':o.st;\nconst srt=(a,b)=>(a.ord-b.ord)||((b.pm||0)-(a.pm||0));\nconst nextOps=()=>S.ops.filter(x=>x.st==='next'&&!isRun(x)).sort(srt);\nconst clkState=()=>S.out?'out':S.shop?'shop':S.run?'job':'air';")
# ---- rail: one clock light (R1), inbox count
rp("<span class=\"ck${S.out?' off':''}\"><i></i></span>","<span class=\"ck cx-ck ${clkState()}\" data-tip=\"${esc(ckTip())}\"><i></i></span>")
rp("${k==='inbox'?'<span class=\"rl-badge\">3</span>':''}","${k==='inbox'?`<span class=\"rl-badge\">${S.inbox}</span>`:''}")
rp("/* ---------- drawing ---------- */","/* ---------- drawing ---------- */\nfunction ckTip(){ if(isLead(U.who)) return 'On the clock|since 6:40 am'; const st=clkState(), D=dayStats(); if(st==='out') return 'Clocked out|'+(S.morning?'not clocked in yet':S.out.why+' since '+clk(S.out.at)); const o=S.run&&opBy(S.run); return (st==='job'?'On '+o.no+' · '+dur(burnt(o)*60):st==='shop'?'Shop time · '+S.shop:'Not on a job · '+dur(airNow()))+'|'+dur(D.cl)+' on the clock today'; }")
# ---- draw: morning, eod, tv overlays
rp("${v==='today'?wList()+`<div class=\"tg-main\">${wDetail()}</div>`:`<div class=\"tg-main\">${vShop()}</div>`}${pop()}</div>",
   "${S.morning?`<div class=\"tg-main\">${morningCard()}</div>`:v==='today'?wList()+`<div class=\"tg-main\">${wDetail()}</div>`:`<div class=\"tg-main\">${vShop()}</div>`}${pop()}${U.eod?eodSheet():''}</div>")
rp("</div><div class=\"tk-tip\" hidden></div></div>${TOAST?","</div><div class=\"tk-tip\" hidden></div></div>${U.tv?tvBoard():''}${TOAST?")
# ---- head: scan button, morning facts, home chip for leads (R2)
rp("<i>·</i><span class=\"tg-hf\" style=\"cursor:default\"><b>${BOARD.length}</b>open ROs</span>`; }",
   "<i>·</i><span class=\"tg-hf\" style=\"cursor:default\"><b>${BOARD.length}</b>open ROs</span><i>·</i><span class=\"tg-hf cx-home\" style=\"cursor:default\" title=\"Where ${F(w)} lands when he signs in\">${ic('pin',12)}Home: ${w==='FD'?'Foreman':'Manager'} page</span>`; }")
rp("${S.out?`<span class=\"tg-hf\" style=\"cursor:default\"><span class=\"cx-dot off\"></span>Clocked out · ${S.out.why.toLowerCase()} since ${clk(S.out.at)}</span>`",
   "${S.morning?`<span class=\"tg-hf\" style=\"cursor:default\"><span class=\"cx-dot off\"></span>Not clocked in yet · ${MORN.at}</span>`:S.out?`<span class=\"tg-hf\" style=\"cursor:default\"><span class=\"cx-dot off\"></span>Clocked out · ${S.out.why.toLowerCase()} since ${clk(S.out.at)}</span>`")
rp("const tabs=isLead(w)?'':","const scan=isLead(w)||S.morning||S.out?'':`<button class=\"btn btn-sm${U.pop&&U.pop.type==='scan'?' on':''}\" data-a=\"pop\" data-p=\"scan\" style=\"height:30px\" title=\"Scan a job jacket to switch\">${ic('qr',14)}Scan</button>`;\n  const tabs=isLead(w)?'':")
rp(":S.out?`<button class=\"btn btn-sm btn-primary\" data-a=\"cin\" style=\"height:30px\">${ic('play',14)}Clock in</button>`",":S.morning?`<button class=\"btn btn-sm btn-primary\" data-a=\"morning\" style=\"height:30px\">${ic('play',14)}Start my day</button>`:S.out?`<button class=\"btn btn-sm btn-primary\" data-a=\"cin\" style=\"height:30px\">${ic('play',14)}Clock in</button>`")
rp("return `<header class=\"tg-head\"><h1 class=\"tg-h1\">Console</h1><span class=\"tg-facts\">${f}</span>${tabs}${ck}</header>`; }","return `<header class=\"tg-head\"><h1 class=\"tg-h1\">Console</h1><span class=\"tg-facts\">${f}</span>${tabs}${scan}${ck}</header>`; }")
# ---- list: paused on top, location on queued jobs
rp("nx=O.filter(o=>!isRun(o)&&o.st==='next').sort((a,b)=>a.ord-b.ord)","nx=nextOps()")
rp("['Next · Frank’s order, 6:52 am',nx,'next']","[nx.some(o=>o.paused)?'Next · paused first, then Frank’s order':'Next · Frank’s order, 6:52 am',nx,'next']")
rp(":o.b0>0?`<b>${dur(o.b0*60)}</b><small>of ${h1(o.q)} h · paused</small>`:`<small>${h1(o.q)} h quoted</small>${o.tags&&o.tags.length?`<small class=\"cx-tg ${o.tags[o.tags.length-1][0]}\">${esc(o.tags[o.tags.length-1][1])}</small>`:''}`;",
   ":o.paused?`<b>${dur(o.b0*60)}</b><small>paused ${o.paused}</small>`:`<small>${h1(o.q)} h · ${esc(locOf(o))}</small>${o.tags&&o.tags.length?`<small class=\"cx-tg ${o.tags[o.tags.length-1][0]}\">${esc(o.tags[o.tags.length-1][1])}</small>`:''}`;")
rp("${s==='next'&&o.ord?`<span class=\"cx-n\">${o.ord}</span>`:''}","${s==='next'&&o.paused?`<span class=\"cx-n pz\" title=\"Paused\">${ic('pause',10)}</span>`:s==='next'&&o.ord?`<span class=\"cx-n\">${o.ord}</span>`:''}${o.back?'<span class=\"ib-k auto\">back</span>':''}")
rp("function wList(){","const locOf=o=>S.bring[o.id]?'coming to '+S.bring[o.id]:o.spot||'';\nfunction wList(){")
# ---- hero: paused/resume, bring it in, ask frank
rp("const s=stOf(o), stl={run:['wk','Working · '+(o.sr||'Repairing')],next:['nx',o.ord?'Next · #'+o.ord+' in Frank’s order':'Not started']",
   "const s=stOf(o), stl={run:['wk','Working · '+(o.sr||'Repairing')],next:['nx',o.paused?'Paused · stays on top of Next':o.back?'Back from Waiting · #'+o.ord:o.ord?'Next · #'+o.ord+' in Frank’s order':'Not started']")
rp("<button class=\"btn${U.pop&&U.pop.type==='hold'?' on':''}\" data-a=\"pop\" data-p=\"hold\" title=\"Put it on hold (H)\">",
   "<button class=\"btn${U.pop&&U.pop.type==='ask'?' on':''}\" data-a=\"pop\" data-p=\"ask\" title=\"Ask Frank — your clock keeps running\">${ic('chat',15)}Ask Frank</button><button class=\"btn${U.pop&&U.pop.type==='hold'?' on':''}\" data-a=\"pop\" data-p=\"hold\" title=\"Put it on hold (H)\">")
rp("else if(s==='next') hero=`<div class=\"cx-hero\"><div class=\"tm\"><b class=\"q\">${h1(o.q)} h</b><small>quoted · ${o.spot.startsWith('Yard')?'still in the yard, '+o.spot.slice(5):'truck in '+o.spot}</small></div><span class=\"sp\"></span>${o.spot.startsWith('Yard')?`<button class=\"btn\" data-a=\"toast\" data-t=\"Asked Triage to bring ${o.no} to a bay — Grace sees it in her Inbox.\">${ic('triage',15)}Bring it in</button>`:''}<button class=\"btn btn-primary\" data-a=\"start\"${S.out?' disabled':''} title=\"Start (Enter)\">${ic('play',15)}${S.run?'Switch to this':'Start'}</button></div>`;",
   "else if(s==='next'){ const yard=o.spot.startsWith('Yard')&&!S.bring[o.id]; hero=`<div class=\"cx-hero\"><div class=\"tm\">${o.paused?`<b class=\"q\">${dur(o.b0*60)}</b><small>burnt of ${h1(o.q)} h · paused at ${o.paused} · ${esc(o.spot)}</small>`:`<b class=\"q\">${h1(o.q)} h</b><small>quoted · ${S.bring[o.id]?'Triage is bringing it to '+S.bring[o.id]+' — about 10 min':yard?'still in the yard, '+o.spot.slice(5):'truck in '+o.spot}</small>`}</div><span class=\"sp\"></span>${yard?`<button class=\"btn${U.hl==='bring'?' hl':''}\" data-a=\"bring\" title=\"Triage brings it to a bay\">${ic('triage',15)}Bring it in</button>`:''}<button class=\"btn btn-primary\" data-a=\"start\"${S.out?' disabled':''} title=\"Start (Enter)\">${ic('play',15)}${o.paused?'Resume':S.run?'Switch to this':'Start'}</button></div>`; }")
# ---- pad: nudge + photos card
rp("<div class=\"mg-pad\">${nextUp}${why}${fx}","<div class=\"mg-pad\">${nudge()}${nextUp}${why}${fx}")
rp("${dayCard(D)}</div></div>`; }","${photoCard(o,s)}${dayCard(D)}</div></div>`; }")
# ---- note input: dictate + draft
rp("<label class=\"cx-in\">${ic('pencil',13)}<input data-in=\"note\" placeholder=\"What you found, what you did…\"></label>",
   "<label class=\"cx-in${S.dict?' dict':''}\">${ic('pencil',13)}<input data-in=\"note\" value=\"${esc(S.draft)}\" placeholder=\"${S.dict?'Listening…':'What you found, what you did…'}\"><button class=\"cx-mic${S.dict?' on':''}\" data-a=\"dict\" title=\"Dictate — press, talk, Enter to save\">${ic('mic',14)}</button></label>")
# ---- shop: display mode button
rp("<div class=\"mg-full\"><div class=\"mg-sec\">Team now<span>live · ${clk(NOW0)}</span></div>","<div class=\"mg-full\"><div class=\"mg-sec\">Team now<span>live · ${clk(NOW0)}</span><span class=\"sp\"></span><button class=\"btn btn-sm${U.hl==='tvb'?' hl':''}\" data-a=\"tv\" title=\"For the TV on the shop floor\">${ic('tv',13)}Display mode</button></div>")
# ---- stopRun marks paused
rp("function stopRun(){ const p=openP(), m=nowM(); if(!p) return; p[1]=m; if(S.run){ const o=opBy(S.run); o.b0+=(m-p[0])/60; } S.run=null; S.shop=null; }",
   "function stopRun(){ const p=openP(), m=nowM(); if(!p) return; p[1]=m; if(S.run){ const o=opBy(S.run); o.b0+=(m-p[0])/60; o.paused=clk(m); o.pm=m; o.ord=0; } S.run=null; S.shop=null; }")
rp("function startOp(o){ stopRun(); if(o.st==='wait'){ o.st='next'; o.hold=null; } if(o.st==='done') o.st='next';","function startOp(o){ stopRun(); o.paused=null; o.back=false; if(o.st==='wait'){ o.st='next'; o.hold=null; } if(o.st==='done') o.st='next';")
rp("act(`${o.no} done — ${h1(burnt(o))} h burnt on ${h1(o.q)} quoted.`,()=>{ stopRun(); o.st='done';","act(`${o.no} done — ${h1(burnt(o))} h burnt on ${h1(o.q)} quoted.`,()=>{ stopRun(); o.paused=null; o.st='done';")
rp("if(isRun(o)) stopRun(); o.st='wait'; o.hold={k,","if(isRun(o)) stopRun(); o.paused=null; o.st='wait'; o.hold={k,")
# ---- handlers: new actions
rp("  out:t=>{ const v=t.dataset.v; act(","  out:t=>{ const v=t.dataset.v; if(v==='End of day'){ U.pop=null; U.eod=true; S.eodc={}; render(); return; } act(")
rp("  fixchk:t=>{","""  bring:()=>{ const o=opBy(U.sel); act(`Asked Triage to bring ${o.no} to Bay 5 — Grace sees it in her Inbox.`,()=>{ S.bring[o.id]='Bay 5'; }); },
  morning:()=>{ S.morning=false; S.out=null; U.sel='o1'; toast('Clocked in at 6:58 am — #1 is 37612 in Bay 2. (The demo carries on at 2:15 pm.)'); render(); },
  dict:()=>{ S.dict=true; keepScroll(render); setTimeout(()=>{ S.dict=false; S.draft='replaced the DPF pressure sensor and both hoses, cleared codes, regen running'; keepScroll(render); const i=$('[data-in="note"]'); if(i){ i.focus(); i.setSelectionRange(i.value.length,i.value.length); } },1500); },
  ph:t=>{ const o=opBy(U.sel), k=t.dataset.k, a=S.ph[o.id]=S.ph[o.id]||[0,0,0]; const N={dash:['Dash picture',0],pics:['Photo',1],dtc:['DTC file',2]}[k]; a[N[1]]+=1; toast(`${N[0]} added to ${o.no} — it’s on the RO.`); keepScroll(render); },
  asks:t=>{ U.askk=t.dataset.v; keepScroll(render); },
  asksend:()=>{ const o=opBy(S.run||U.sel), keep=($('[data-in="askrun"]')||{}).checked!==false, txt=($('[data-in="ask"]')||{}).value||''; U.pop=null;
    if(keep){ toast(`Sent to Frank — ${U.askk.toLowerCase()} on ${o.no}. It’s in his Needs action; your clock keeps running.`); keepScroll(render); }
    else act(`Sent to Frank — ${o.no} waits on a second opinion.`,()=>{ if(isRun(o)) stopRun(); o.paused=null; o.st='wait'; o.hold={k:'Second opinion',who:'FD',at:clk(nowM()),txt:txt||'Frank has it in Needs action.',left:'just now'}; }); },
  scanit:t=>{ const no=t.dataset.no, o=S.ops.find(x=>x.no===no&&x.st!=='done'); if(!o){ toast(`${no} isn’t on your list — ask Frank to assign it.`); render(); return; } const was=S.run&&opBy(S.run); act(`Scanned ${no} — switched.${was?' '+was.no+' stopped at '+clk(nowM())+'.':''}`,()=>startOp(o)); },
  eodc:t=>{ S.eodc[t.dataset.k]=!S.eodc[t.dataset.k]; render(); },
  eodx:()=>{ U.eod=false; render(); },
  eodgo:()=>{ const l=($('[data-in="left"]')||{}).value||''; U.eod=false; act(`Clocked out for the day at ${clk(nowM())}. The day is in the Time Log${l?' — your note is on 37590':''}.`,()=>{ if(S.run&&l){ const o=opBy(S.run); (o.notes=o.notes||[]).push([clk(nowM()),'Left for tomorrow: '+l.replace(/^./,c=>c.toUpperCase())]); } stopRun(); const sh=S.day.sh[S.day.sh.length-1]; sh[1]=nowM(); S.out={why:'End of day',at:nowM()}; }); },
  tv:()=>{ U.tv=true; render(); },
  tvx:()=>{ U.tv=false; render(); },
  fixchk:t=>{""")
# keep the draft while typing, Enter in scan field
rp("mock.addEventListener('keydown',e=>{ const t=e.target; if(t.dataset&&t.dataset.in==='note'&&e.key==='Enter'&&t.value.trim()){",
   "mock.addEventListener('input',e=>{ const t=e.target; if(t.dataset&&t.dataset.in==='note') S.draft=t.value; });\nmock.addEventListener('keydown',e=>{ const t=e.target; if(t.dataset&&t.dataset.in==='scan'&&e.key==='Enter'){ H.scanit({dataset:{no:t.value.trim()}}); e.preventDefault(); return; } if(t.dataset&&t.dataset.in==='note'&&e.key==='Enter'&&t.value.trim()){ S.draft='';")
# Escape closes overlays
rp("  if(U.pop){ if(k==='Escape'){ U.pop=null; keepScroll(render); return stop(); } return; }\n  if(isLead(U.who)) return;",
   "  if(U.pop){ if(k==='Escape'){ U.pop=null; keepScroll(render); return stop(); } return; }\n  if(k==='Escape'&&(U.tv||U.eod)){ U.tv=false; U.eod=false; render(); return stop(); }\n  if(U.tv||U.eod||S.morning) return;\n  if(isLead(U.who)) return;")
# tooltip clamp for the rail
rp("tip.style.left=Math.min((e.clientX-tk.left)/scale+14,tk.width/scale-300)+'px';","tip.style.left=Math.max(8,Math.min((e.clientX-tk.left)/scale+14,tk.width/scale-300))+'px';")
# ---- demos
rp("""const DEMO={
  today:()=>{setWho('MR');render();},""","""const DEMO={
  morning:()=>{setWho('MR');S.morning=true;S.run=null;S.out={why:'Not clocked in yet',at:416};render();},
  arrive:()=>{setWho('MR');const o=opBy('o5'); o.st='next'; o.ord=4; o.hold=null; o.back=true; o.parts[0][3]='staged'; o.tags=[['pt','Parts staged 2:16 pm']]; o.why='Ben staged the turbo actuator at 2:16 pm — it came off Waiting by itself. Frank sees it’s ready.'; S.inbox=4; U.sel='o5'; toast('37628 is ready — Ben staged the turbo actuator. It moved to Next.'); render();},
  nudge:()=>{setWho('MR');stopRun();S.day.p[S.day.p.length-1][1]=NOW0-12; const o=opBy('o1'); o.b0=(NOW0-12-804)/60; o.paused=clk(NOW0-12); o.pm=NOW0-12; U.sel='o1'; render();},
  eod:()=>{setWho('MR');U.eod=true;render();},
  scan:()=>{setWho('MR');render();openPop('scan',{},$('[data-a="pop"][data-p="scan"]'));},
  ask:()=>{setWho('MR');render();openPop('ask',{},$('[data-a="pop"][data-p="ask"]'));},
  photos:()=>{setWho('MR');show('photos');},
  dict:()=>{setWho('MR');render();H.dict();},
  tv:()=>{setWho('MR');U.view='shop';U.tv=true;render();},
  bring:()=>{setWho('MR');U.sel='o2';U.hl='bring';render();},
  paused:()=>{setWho('MR');startOp(opBy('o2'));U.sel='o1';render();},
  today:()=>{setWho('MR');render();},""")
open(p,'w').write(s)
print('patched')
