/* Parsec · pages/manager · model.js
   What the Manager page holds besides the numbers: pinned tiles, Needs you, hold goals, targets (mgSet).
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   NEEDS stHolder holdsOf alOf mgSet baseTargets reset sync kv tgtTxt sparkSvg PINS0 … (11 functions, 25 constants)
   state      audit mgSet
   uses       access/ kit/ pages/ pages/inbox/ pages/rolist/ pages/triage/ ro/ shell/ state/
*/
/* ---------- what the page holds besides the numbers ---------- */
const PINS0=['sales','sold','eff','prod','aro','cls','wip','days','cb','apr','wpn','fill'];
/* Needs you: what's in the manager's Inbox that needs an answer */
function NEEDS(){ if(typeof IB==='undefined') return []; const me=PG.me().name; return IB.itemsFor(me).filter(n=>(n.st==='new'||n.st==='read')&&(n.k==='ask'||n.k==='men')).sort((a,b)=>new Date(b.at)-new Date(a.at)).map(n=>{ const ro=n.ro&&getRO(n.ro);
  return {id:n.key,ic:(({parts:'parts',triage:'triage',foreman:'foreman',warranty:'warranty',fixes:'fixes',timelog:'timelog',console:'console'})[n.src])||'inbox',h:esc(n.t),p:(ro?`<b>${esc(tgNum(ro))} ${esc(ro.customerName||'')}</b> — `:'')+esc(n.b||n.q||('From '+n.from)),a:[[ro?'Open RO':'Open','open'],['Done','done']],ro:n.ro,n}; }); }
const RT={tech:['TE','Technician','var(--tg-st-working)'],writer:['AP','Approval','var(--tg-st-customer)'],parts:['PT','Parts','var(--tg-st-waiting)'],foreman:['FM','Foreman','var(--tg-acc)'],manager:['MG','Manager','var(--tg-st-support)'],warranty:['WA','Warranty','var(--tg-st-problem)']};
/* who holds each open RO, and for how long */
let HOLD=[];
/* an RO nobody has handed off sits with whoever its status waits on */
function stHolder(ro){ let st=''; try{ st=roStatus(ro).status||''; }catch(e){} return /Parts/.test(st)?'parts':/Customer|Approval|Estimate/.test(st)?'writer':/Foreman/.test(st)?'foreman':/Warranty/.test(st)?'warranty':/Manager/.test(st)?'manager':'tech'; }
function holdsOf(){ const L=[]; ROS.filter(r=>r.close>TODAY).forEach(r=>{ const ro=r.ro; let h=null; try{ h=rtHolder(ro); }catch(e){} const to=ro.route?(h&&RT[h.to]?h.to:'tech'):stHolder(ro); const since=(()=>{ try{ return rtHeldSince(ro); }catch(e){ return ro.dateOpened; } })(); const pend=!!(ro.route&&ro.route.state==='pending');
  L.push({r,to:pend&&RT[ro.route.to]?ro.route.to:to,min:Math.max(0,Math.round((Date.now()-new Date(since||ro.dateOpened))/60000)),pend,pm:pend?Math.max(0,Math.round((Date.now()-new Date(ro.route.at))/60000)):0}); }); return L; }
let NAV=[];
const NAVIC={rolist:'ros'};
let ROLES={};
let STAFF0=[];
const DEPT={'Other':'From ASIST','Technician':'Technicians','Foreman':'Shop floor','Service writer':'Service advisors','Parts':'Parts','Warranty admin':'Warranty','Manager':'Management','Triage':'Triage'};
const ROLEK={'Technician':['eff','prod','sold','cb'],'Foreman':['eff','fc','cb','days'],'Service writer':['apr','aw','ont','dec'],'Parts':['fill','pw','bko','rcr'],'Warranty admin':['wpn','wrj','wdp','wcl'],'Manager':['sales','eff','cb','apr']};
/* the activity log: the last week of the audit trail */
let AL0=[];
const ALT={status:['status','flag','set status'],release:['release','check','released'],checkin:['checkin','keyTag','checked in'],estimate:['estimate','send','sent the estimate on'],route:['handoff','swap','handed off'],signin:['signin','user','signed in'],staff:['staff','manager','changed'],'punch-del':['delete','trash','deleted a punch'],'ro-del':['delete','trash','deleted an RO']};
function alOf(){ const from=addD(TODAY,-6); return (Array.isArray(STATE.audit)?STATE.audit:[]).filter(a=>a&&a.at&&localDay(a.at)>=from).slice(-400).reverse().map(a=>{ const t=ALT[a.type]||[a.type,'history',a.type]; const ro=a.ro&&getRO(a.ro), d=new Date(a.at);
  return {day:localDay(a.at),m:d.getHours()*60+d.getMinutes(),ty:t[0],ic:t[1],verb:'',by:SD.keyOf(a.by||'Admin'),ro:ro?tgNum(ro):(a.num?roShortNo(a.num):null),roId:ro?ro.id:null,cust:ro?ro.customerName||'':'',text:a.text||''}; }); }
let U, UNDO, TOAST, TT;
const ordN=n=>n+(['th','st','nd','rd'][(n%100>10&&n%100<14)?0:(n%10<4?n%10:0)]);
function mgSet(){ const s=STATE.mgSet&&typeof STATE.mgSet==='object'?STATE.mgSet:(STATE.mgSet={}); if(!Array.isArray(s.pins)||s.pins.length!==12) s.pins=PINS0.slice(); if(!s.tg) s.tg={}; if(!s.al) s.al={prod:1,eff:1,cb:1,fill:1,fc:1,days:1}; if(!s.mute) s.mute={}; if(!s.pg) s.pg={}; if(!s.chkx) s.chkx={}; return s; }
/* the per-workday goals start at the shop's own last 90 days (rounded) until the manager sets one; $ per hour starts at the labor rate */
function baseTargets(){ const b=addD(TODAY,-1), a=addD(TODAY,-91)<START?START:addD(TODAY,-91), n=wdIn(a,b); const nice=v=>{ const e=Math.pow(10,Math.floor(Math.log10(Math.abs(v)))-1); return +(Math.round(v/e)*e).toPrecision(2); };
  K.forEach(k=>{ if(!('tw0' in k)) k.tw0=k.tw; if(k.tw0==null) return; let v=null; try{ v=n>=10?val(k,a,b):null; }catch(e){} k.tw=v!=null&&v>0?nice(v/n):k.tw0; k.base=v!=null&&v>0; });
  if(KM.lph) KM.lph.t=RATE; }
function reset(){ MEMO.clear(); U={view:'ov',p:'mo',sel:'eff',bf:null,bk:null,brk:{},ed:false,pop:null,kb:false,lf:'all',q:'',flow:'parts',person:null,alf:'all',alw:'',nall:false,unl:false,rep:null,repn:'',fleet:null}; UNDO=[]; }
/* every draw: the shop from pgShopData, the page's settings from STATE */
function sync(){ NAV=NAV_PAGES.filter(x=>x[0]!=='inbox'); ROLES=STAFF_ROLES; SD=pgShopData(); TODAY=SD.TODAY; if(SD!==U._sd){ U._sd=SD; ROS=SD.ROS; TB=SD.TB; ATT=SD.ATT; BAYU=SD.BAYU; BYC=SD.BYC; BYO=SD.BYO; PPL=SD.PPL; TECHS=SD.TECHS; CUST=SD.CUST; START=SD.START; DAYS=dd(START,TODAY); RATE=SD.RATE; BAYS=SD.BAYS; MEMO.clear(); for(const k in PCACHE) delete PCACHE[k]; HOLD=holdsOf(); AL0=alOf(); CHK0=chkOf(); SHARE=null; PAYA=null; baseTargets(); }
  const M=mgSet(); U.tg=M.tg; U.pins=M.pins; U.al=M.al; U.mute=M.mute; U.pg=PGS(); U.chk=CHK0.map(c=>c.id).filter(id=>!M.chkx[id]); U.needs=[];
  const c=rtCfg(); U.rules=c.rules.map(r=>({k:r.k,when:r.when,to:r.to,m:r.mode})); U.goals=c.goals; U.acc=c.needAccept!==false;
  STAFF0=staffList().filter(sf=>sf.name).map(sf=>[SD.keyOf(sf.name),sf.role]); U.roles=Object.fromEntries(STAFF0); U.pages=Object.fromEntries(staffList().filter(sf=>sf.name).map(sf=>[SD.keyOf(sf.name),Object.fromEntries(PERM_PAGES.map(p=>[p[0],permHas(sf,'pages',p[0])?1:0]))]));   /* Parsec 13: the role's pages and the person's own changes */
  if(U.addK){ const nk=SD.keyOf(U.addK); U.addK=null; if(U.roles[nk]) U.person=nk; }
  if(!U.person||!U.roles[U.person]) U.person=(STAFF0.find(x=>x[1]==='Technician')||STAFF0[0]||[null])[0];
  if(!U.fleet||!CUST.includes(U.fleet)) U.fleet=CUST[0]||null;
  if(!KM[U.sel]) U.sel='eff'; }
const staffOf=k=>staffList().find(sf=>sf.name&&SD.keyOf(sf.name)===k);
const pinLine=sf=>!sf?'no PIN yet':sf.off?'sign-in turned off':!pinIs(sf)?'no PIN yet':sf.pinTemp?'temporary PIN — they pick their own at the next sign-in':'signs in with a PIN';   /* Parsec 13 */
const meK=()=>SD.keyOf(PG.me().name);
let DIRTY=false; const snap=()=>{ pushUndo('manager'); DIRTY=true; };
const toast=(t,u=true)=>pushToast(t,u);
const W=()=>win(U.p), PW=()=>pwin(U.p);
const isSum=k=>['sold','clk','lost','unap','sales','lab','prt','dec','wo','opn','cls','wcl','wpd','leak','gp'].includes(k.id);
function kv(k,F){ if(locked(k)) return {v:null,pv:null,t:null,dl:{s:'needs fields',cl:'flat'},ok:null,X:ctx(...W())}; const [a,b]=W(), [pa,pb]=PW(); const v=val(k,a,b,F), pv=val(k,pa,pb,F); const X=ctx(a,b,F), t=tgt(k,X); return {v,pv,t,dl:delta(k,v,pv),ok:t==null||v==null?null:k.d>=0?v>=t:v<=t,X}; }
function tgtTxt(k,o){ if(o.t==null) return ''; const word=k.d>=0?'under':'over', gn=Math.abs(Math.round(o.v-o.t)), gap=k.u==='pct'?gn+(gn===1?' pt':' pts'):fmt(k.u,Math.abs(o.v-o.t));
  return o.ok?`<span class="mq-tgt ok">${ic('check',12)}On target · ${fmt(k.u,o.t)}</span>`:`<span class="mq-tgt off">${ic('flag',12)}${gap} ${word} ${fmt(k.u,o.t)}</span>`; }
function sparkSvg(k,w=72,h=26,F){ const L=spark(U.p).map(x=>val(k,x.a,x.b,F)); const V=L.filter(v=>v!=null); if(V.length<2) return `<svg class="spk" width="${w}" height="${h}"></svg>`;
  let lo=Math.min(...V), hi=Math.max(...V); if(hi-lo<1e-6){ hi+=1; lo-=1; } const x=i=>2+i*(w-4)/(L.length-1), y=v=>h-3-(v-lo)/(hi-lo)*(h-6);
  const pts=L.map((v,i)=>v==null?null:[x(i),y(v)]).filter(Boolean);
  return `<svg class="spk mq-svg" width="${w}" height="${h}" aria-hidden="true"><polyline points="${pts.map(p=>p.map(n=>n.toFixed(1)).join(',')).join(' ')}" fill="none" stroke="var(--tg-ink4)" stroke-width="1.5" stroke-linejoin="round"/><circle cx="${pts[pts.length-1][0].toFixed(1)}" cy="${pts[pts.length-1][1].toFixed(1)}" r="3" fill="var(--tg-acc)"/></svg>`; }
