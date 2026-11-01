/* Parsec · pages/career · model.js
   What a tech's Career keeps (STATE.cr[name]: rate, earlier years, goals) and the comparisons.
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   GL cmpOf CRS NTS PAYP SKLf FXWf reset sync kv sparkSvg opsIn … (14 functions, 37 constants)
   state      cr crNotes punches ros settings shopName
   uses       access/ pages/ pages/fixes/ pages/manager/ pages/triage/ pages/warranty/ ro/ shell/ state/
*/
/* ======================= Career v2 — one technician’s own numbers, and how they grow ======================= */
/* the goals the manager set for each tech (Manager → Team), else the shop's targets */
function GL(k){ let g=null; try{ g=MG.goalsFor(k); }catch(e){} return Object.assign({eff:100,prod:85,sold:7.5,cb:3},g||{}); }
function cmpOf(o){ const t=String(o.cmp||'').trim(); return t||(o.t==='diag'?'Diagnosis':o.t==='pm'?'PM service':OPT[o.t]||'Operation'); }
const TYPE={diag:['DIAG','dg'],rep:['OP','op'],pm:['PM','pm'],war:['WARR','wa']};
const wdIn=(a,b)=>{ let n=0; for(let k=a;k<=b;k=addD(k,1)) n+=wf(k); return n; };
const lostOf=o=>o.b-o.q, sev=l=>l<=0?'ok':l<=.5?'low':l<=1.5?'mid':'high';
const hm=h=>{ const m=Math.round(Math.abs(h)*60); return Math.floor(m/60)+':'+String(m%60).padStart(2,'0'); };
/* all time, plus the calendar periods */
const _per=per;
const tStart=()=>TSTART[U.who]||START;
per=function(p){ if(p!=='all') return _per(p); const a=tStart(); return {p:'all',a,b:TODAY,pa:addD(a,-1),pb:addD(a,-1),n:'All time',s:'since '+MN[dOf(a).getMonth()]+' '+a.slice(0,4)+(TSTART[U.who]?' — when you started':' — when Parsec started'),cmp:'',g:'all',fut:true}; };
const _buckets=buckets;
buckets=function(p,prev){ if(p!=='all') return _buckets(p,prev); if(prev) return null; const L=[]; for(let a=mStart(tStart());a<=TODAY;a=addM(a,1)) L.push({a,b:mEnd(a),l:MN[dOf(a).getMonth()]+(dOf(a).getMonth()===0?' ’'+a.slice(2,4):''),t:MNL[dOf(a).getMonth()]+' '+a.slice(0,4)}); return L; };
/* ---------- what a tech's Career keeps: STATE.cr[name] (rate, earlier years, alerts, certificates) and STATE.crNotes[name] (notes and a goal) ---------- */
const yb=k=>(+k.slice(0,4)-1)+k.slice(4);
function CRS(k){ k=k||U.who; const S=STATE.cr&&typeof STATE.cr==='object'?STATE.cr:(STATE.cr={}); const n=PPL[k]||k; const s=S[n]||(S[n]={}); if(!s.al) s.al={pace:1,fri:1,best:0}; if(!Array.isArray(s.skills)) s.skills=[]; return s; }
function NTS(k){ k=k||U.who; const S=STATE.crNotes&&typeof STATE.crNotes==='object'?STATE.crNotes:(STATE.crNotes={}); const n=PPL[k]||k; const s=S[n]||(S[n]={goal:null,L:[]}); if(!Array.isArray(s.L)) s.L=[]; return s; }
/* the pay period: two weeks from the Time Log's anchor Monday */
function PAYP(){ const a=PG.perStart(TODAY); return {a,b:PG.perEnd(a)}; }
/* the people: who manages, who's foreman, who's looking */
const fst=n=>String(n||'').split(' ')[0];
const MGR=()=>PG.person('Manager')||'your manager', FMP=()=>PG.person('Foreman')||PG.person('Manager')||'', FMN=()=>FMP()||'your foreman';
const SHOPN=()=>String(STATE.shopName||(STATE.settings&&STATE.settings.shopName)||'').trim();
const roleOf=k=>{ let sf=null; try{ sf=staffForTech(PPL[k]); }catch(e){} return sf&&sf.role||'Technician'; };
const canPick=()=>{ const m=PG.me(); return !!(m.admin||(typeof can==='function'&&can('t.others'))); };   /* 17.1: See other people's time */
const isSelf=()=>!!U.who&&SD&&SD.keyOf(PG.me().name)===U.who;
const canPay=()=>{ const m=PG.me(); return isSelf()||!!m.admin||m.role==='Manager'; };
/* certificates and classes */
function SKLf(){ return CRS().skills.map(x=>{ let st='ok', line='No expiry'; if(x.prog){ st='prog'; line=x.pct?x.pct+'% done':'In progress'; } else if(x.exp){ const n=dd(TODAY,x.exp); if(n<0){ st='warn'; line='Expired '+fd(x.exp)+', '+x.exp.slice(0,4); } else if(n<=90){ st='warn'; line='Expires '+fd(x.exp)+' — in '+n+' days'; } else line='Expires '+MN[dOf(x.exp).getMonth()]+' '+x.exp.slice(0,4); } return [x.name,st,line,x.pct||0,x.id]; }); }
/* fixes this tech wrote, and what happened when others used them: [title, written, used, held, used by, hours saved, key] */
function FXWf(){ const me=PPL[U.who]||''; if(!me||typeof FX==='undefined') return []; let C; try{ C=FX.build(); }catch(e){ return []; } const M=new Map();
  Object.keys(C.E).forEach(k=>C.E[k].forEach(e=>{ if(!e.tech||SD.keyOf(e.tech)!==U.who) return; if(!M.has(k)) M.set(k,{k,t:(C.T[k]||{}).t||k,d:e.date,ros:new Set()}); const x=M.get(k); if(e.date&&(!x.d||e.date<x.d)) x.d=e.date; x.ros.add(String(e.ro)); }));
  const L=[]; M.forEach(x=>{ let used=0, held=0, sv=0; const by=new Set();
    STATE.ros.forEach(ro=>(ro.operations||[]).forEach(op=>{ const u=op.fxUse; if(!u||!x.ros.has(String(u.ro||'').replace(/^RO[\s-]*/i,''))) return; used++; const w=u.by||ro.assignedTech||''; if(w&&SD.keyOf(w)!==U.who) by.add(fst(w));
      if(opDoneNow(op)){ const E2=(C.E[x.k]||[]).find(e=>e.opId===op.id); if(!E2||E2.out!=='cb') held++; const q=+op.quoted||0, b=(opCalc(op).burntHrs||0); if(q>b) sv+=q-b; } }));
    L.push([x.t,x.d||TODAY,used,held,[...by].join(', ')||'—',sv,x.k]); });
  return L.sort((a,b)=>b[2]-a[2]||(a[1]<b[1]?1:-1)).slice(0,8); }
const GRP=[['diag','Diagnosis'],['rep','Repairs'],['pm','PM service'],['war','Warranty']];

let U, DIRTY=false;
function reset(){ MEMO.clear(); U={who:null,view:'ov',p:'mo',cmp:'prev',drv:'eff',sel:null,pop:null,kb:false,tg:{},prior:{},usePrior:false,pay:false,al:{pace:1,fri:1,best:0},stmt:null,hl:null}; }
const toast=t=>pushToast(t);
const snap=()=>{ pushUndo('career'); DIRTY=true; };
/* every draw: the shop, whose Career this is, their settings */
function sync(){ data(); const me=PG.me();
  if(U._me!==me.name){ reset(); U._me=me.name; }
  const mk=SD.keyOf(me.name);
  if(!canPick()) U.who=TECHS.includes(mk)?mk:null;
  else if(!U.who||!TECHS.includes(U.who)) U.who=TECHS.includes(mk)?mk:(TECHS[0]||null);
  if(UI.crWho){ if(canPick()&&TECHS.includes(UI.crWho)) U.who=UI.crWho; UI.crWho=null; }   /* 17.1: from Manager › Team */
  if(U.who){ const c=CRS(); U.prior[U.who]=c.prior||null; U.usePrior=!!(c.usePrior&&c.prior); U.al=c.al; GLC=GL(U.who); } }
const FT=()=>({k:'tech',v:U.who});
const W=()=>win(U.p);
const noCmp=()=>U.p==='all';
const yrSeg=()=>U.p!=='all'&&U.p!=='yr';
const CMPY=()=>U.cmp==='yr'&&yrSeg();
const yrHere=()=>tStart()<=yb(win(U.p)[0]);
const PW=()=>{ if(CMPY()){ const [a,b]=W(); return [yb(a),yb(b)]; } return pwin(U.p); };
const rng2=(a,b)=>a===b?fd(a):a.slice(0,7)===b.slice(0,7)?fd(a)+' – '+dOf(b).getDate():fd(a)+' – '+fd(b);
const cmpLbl=()=>{ if(noCmp()) return ''; if(CMPY()){ const [a,b]=PW(); return 'vs '+rng2(a,b)+', '+a.slice(0,4); } return per(U.p).cmp; };
const hl=s=>U.hl===s?' hl':'';
const isSum=k=>['sold','clk','lost','unap'].includes(k.id);
function kv(k){ const [a,b]=W(), [pa,pb]=PW(), F_=FT(), v=val(k,a,b,F_), pv=noCmp()?null:val(k,pa,pb,F_), X=ctx(a,b,F_), g=GLC[k.id], t=g==null?null:k.tw!=null?g*X.wd:g;
  return {v,pv,t,dl:noCmp()?{s:'',cl:'flat'}:delta(k,v,pv),ok:t==null||v==null?null:k.d>=0?v>=t:v<=t,X,shop:val(k,a,b)}; }
function sparkSvg(k,w=76,h=28){ const L=spark(U.p==='all'?'yr':U.p).map(x=>val(k,x.a,x.b,FT())); const V=L.filter(v=>v!=null); if(V.length<2) return `<svg class="spk" width="${w}" height="${h}"></svg>`;
  let lo=Math.min(...V), hi=Math.max(...V); if(hi-lo<1e-6){ hi+=1; lo-=1; } const x=i=>2+i*(w-4)/(L.length-1), y=v=>h-3-(v-lo)/(hi-lo)*(h-6), pts=L.map((v,i)=>v==null?null:[x(i),y(v)]).filter(Boolean);
  return `<svg class="spk mq-svg" width="${w}" height="${h}" aria-hidden="true"><polyline points="${pts.map(p=>p.map(n=>n.toFixed(1)).join(',')).join(' ')}" fill="none" stroke="var(--tg-ink4)" stroke-width="1.5" stroke-linejoin="round"/><circle cx="${pts[pts.length-1][0].toFixed(1)}" cy="${pts[pts.length-1][1].toFixed(1)}" r="3" fill="var(--tg-acc)"/></svg>`; }
const rtop=(x,y,w,h)=>{ const r=Math.min(4,h,w/2); return `M${x},${y+h}V${y+r}Q${x},${y} ${x+r},${y}H${x+w-r}Q${x+w},${y} ${x+w},${y+r}V${y+h}Z`; };
/* this tech’s work: operations by them, on ROs closed in the window */
function opsIn(a,b){ return ctx(a,b,FT()).ops; }
function rosIn(a,b){ const M=new Map(); opsIn(a,b).forEach(o=>{ if(!M.has(o.r)) M.set(o.r,[]); M.get(o.r).push(o); }); const open=openAt(TODAY).filter(r=>r.ops.some(o=>o.tech===U.who)).map(r=>[r,r.ops.filter(o=>o.tech===U.who)]); return {closed:[...M.entries()],open:b>=TODAY?open:[]}; }
function CHKf(){ const L=[]; if(!U.who) return L; const mine=p=>SD.keyOf(punchWho(p)||'')===U.who;
  STATE.punches.filter(p=>!p.stop&&mine(p)&&(Date.now()-new Date(p.start))>10*3600000).forEach(p=>{ const ro=getRO(p.roId); L.push(['c1:'+p.id,'play','Clock still running'+(ro?' on '+tgNum(ro):''),`Since ${PG.whenL(p.start)} — ${Math.round((Date.now()-new Date(p.start))/3600000)} h. Efficiency leaves the operation out until it’s fixed.`,'Fix it in the Time Log',localDay(p.start)]); });
  STATE.punches.filter(p=>mine(p)&&p.stop&&!isShopPunch(p)&&localDay(p.start)>=addD(TODAY,-13)&&!getOp(p.roId,p.opId)).forEach(p=>{ const ro=getRO(p.roId), h=(new Date(p.stop)-new Date(p.start))/3600000; L.push(['c2:'+p.id,'timelog','A punch with no operation',`${fd(localDay(p.start))} · ${h1(h)} h${ro?' on '+tgNum(ro):''} not on a job — it counts as unapplied.`,'Pick the job',localDay(p.start)]); });
  return L.slice(0,8); }
const nChk=()=>CHKf().length;
const daysIn=(a,b)=>Object.keys(ATT[U.who]||{}).filter(d=>d>=a&&d<=b&&ATT[U.who][d]>0).length;
