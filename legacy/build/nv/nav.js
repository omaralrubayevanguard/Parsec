/* ======================= Nav bar + Profile — on top of the Console ======================= */
let N;
function nvReset(){ N={open:false,pos:'bottom',guides:false,before:false,pop:null,page:null,sec:'you',out:false,who:'MR',size:'normal',screen:'desktop',ribbon:false,logoutClock:true,lock:false,pin:false,dev:false,assist:false}; }
nvReset();
const ME={MR:{n:'Mike Rodriguez',r:'Technician',d:'Service',since:'March 2019',in:'6:58 am'},RH:{n:'Ray Holloway',r:'Service manager',d:'Service',since:'June 2014',in:'7:20 am'}};
const NAVG=[['',[['inbox','Inbox',3],['console','Console'],['triage','Triage'],['ros','RO List',18]]],['Shop',[['foreman','Foreman'],['warranty','Warranty'],['manager','Manager'],['parts','Parts']]],['You',[['timelog','Time Log'],['fixes','Fixes'],['career','Career']]]];
const NAVOK={MR:['inbox','console','ros','parts','timelog','fixes','career'],RH:['inbox','console','triage','ros','foreman','warranty','manager','parts','timelog','fixes','career']};
const theme=()=>root.dataset.theme==='dark'?'dark':'light';
function setTheme(t){ root.dataset.theme=t; $$('[data-theme-set]').forEach(x=>x.classList.toggle('is-on',x.dataset.themeSet===t)); }
/* ---------- the rail ---------- */
function nvClock(){ const st=N.who==='RH'?'job':clkState(), o=S.run&&opBy(S.run), D=dayStats();
  const l1=st==='out'?'Off the clock':'On the clock · <span data-tk="cl">'+dur(D.cl)+'</span>', l2=N.who==='RH'?'since 7:20 am':st==='job'?`${o.no} · <span data-tk="runm">${dur(burnt(o)*60)}</span>`:st==='shop'?'Shop time · '+esc(S.shop):st==='air'?'Not on a job · <span data-tk="air">'+dur(airNow())+'</span>':S.out?esc(S.out.why):'';
  return `<button class="nv-row nv-clk ${st}${N.pop==='clk'?' on':''}" data-a="nvpop" data-p="clk" title="${N.open?'':'Clock — '+(st==='out'?'off':'on')}"><span class="nv-ic"><i class="dot"></i></span><span class="nv-tl"><b>${l1}</b><small>${l2}</small></span>${N.open&&st!=='out'?'<span class="nv-end">'+ic('chevR',13)+'</span>':''}</button>`; }
function nvMe(){ const m=ME[N.who], warn=true;
  return `<button class="nv-row nv-me${N.pop==='me'||N.page==='profile'?' on':''}" data-a="nvpop" data-p="me" title="${N.open?'':m.n+' — profile, theme, settings, log out'}"><span class="nv-ic"><span class="nv-av">${N.who}</span>${warn?'<i class="nv-warn" title="No backup yet"></i>':''}</span><span class="nv-tl"><b>${m.n}</b><small>${m.r}</small></span>${N.open?'<span class="nv-end">'+ic('chevUD',14)+'</span>':''}</button>`; }
function railHtml(){ if(N.before) return `<aside class="nv-before ${N.open?'open':''}"><img src="${N.open?BEFORE_OPEN:BEFORE_ICONS}" alt="The nav bar today"><span>Today</span></aside>`;
  const ok=NAVOK[N.who], cur=N.page==='profile'?'':'console';
  const groups=NAVG.map(([g,L],gi)=>{ const items=L.filter(x=>ok.includes(x[0])); if(!items.length) return ''; return `${gi?`<div class="nv-gh"><span>${g}</span></div>`:''}${items.map(x=>`<button class="nv-row${x[0]===cur?' on':''}" data-a="nvgo" data-v="${x[0]}" title="${N.open?'':x[1]}"><span class="nv-ic">${ic(x[0],18)}${x[2]&&!N.open?`<em class="nv-b">${x[0]==='inbox'?S.inbox:x[2]}</em>`:''}</span><span class="nv-tl">${x[1]}</span>${x[2]&&N.open?`<span class="nv-n">${x[0]==='inbox'?S.inbox:x[2]}</span>`:''}</button>`).join('')}`; }).join('');
  return `<aside class="nv${N.open?' open':''}${N.guides?' guides':''}">
    <div class="nv-top"><button class="nv-row nv-brand" data-a="nvtoggle" title="${N.open?'Parsec':'Open the sidebar  ['}"><span class="nv-ic"><span class="lg">${LOGO}</span><span class="ex">${ic('sidebar',18)}</span></span><span class="nv-tl"><b>Parsec</b></span></button>${N.open?`<button class="nv-col" data-a="nvtoggle" title="Close the sidebar  [">${ic('sidebar',16)}</button>`:''}</div>
    <button class="nv-row nv-find" data-a="nvsearch" title="${N.open?'':'Search  Ctrl K'}"><span class="nv-ic">${ic('search',18)}</span><span class="nv-tl">Search or jump to…</span>${N.open?'<span class="nv-kbd">Ctrl K</span>':''}</button>
    ${nvClock()}${N.pos==='clock'?nvMe():''}
    <div class="nv-gh"><span></span></div>${groups}<span class="nv-sp"></span>${N.pos==='bottom'?nvMe():''}
    ${N.guides?'<i class="nv-axis"></i>':''}</aside>`; }
/* ---------- popovers off the rail ---------- */
function nvPop(){ if(!N.pop) return ''; const m=ME[N.who];
  if(N.pop==='clk'){ const st=N.who==='RH'?'job':clkState(), o=S.run&&opBy(S.run);
    return `<div class="nv-pop" data-for="clk"><div class="nv-ph"><span class="cx-dot ${st==='job'?'':st}"></span><b>${st==='out'?'Off the clock':'On the clock since '+m.in}</b><span class="sp"></span><b class="mono" data-tk="cl">${dur(dayStats().cl)}</b></div>
     ${o&&N.who!=='RH'?`<div class="nv-job"><span class="tg-no">${o.no}</span><span class="n"><b>${esc(o.cmp)}</b><small>${esc(o.cust)} · <span data-tk="runm">${dur(burnt(o)*60)}</span> of ${h1(o.q)} h</small></span><button class="btn btn-sm" data-a="nvstop">${ic('stop',13)}Stop</button></div>`:''}
     <div class="nv-acts">${st==='out'?`<button class="btn btn-sm btn-primary" data-a="nvcin">${ic('play',13)}Clock in</button>`:`<button class="btn btn-sm" data-a="nvout" data-v="Lunch">Lunch</button><button class="btn btn-sm" data-a="nvout" data-v="End of day">End of day…</button>`}<span class="sp"></span><button class="btn btn-sm ghost" data-a="toast" data-t="In Parsec this opens today in the Time Log.">${ic('timelog',13)}Time Log</button></div></div>`; }
  if(N.pop==='me') return `<div class="nv-pop me" data-for="me"><button class="nv-who" data-a="nvprofile" data-s="you"><span class="nv-av lg">${N.who}</span><span class="n"><b>${m.n}</b><small>${m.r} · signed in ${m.in}</small></span>${ic('chevR',14)}</button>
     <div class="nv-sep"></div>
     <div class="nv-set"><span>Theme</span><span class="tg-seg3 cr-seg">${[['light','Ivory'],['dark','Graphite']].map(t=>`<button class="${theme()===t[0]?'on':''}" data-a="nvtheme" data-v="${t[0]}">${ic(t[0]==='light'?'sun':'moon',12)}${t[1]}</button>`).join('')}</span></div>
     <div class="nv-set"><span>Size</span><span class="tg-seg3 cr-seg">${[['normal','Normal'],['large','Large'],['floor','Shop floor']].map(t=>`<button class="${N.size===t[0]?'on':''}" data-a="nvsize" data-v="${t[0]}">${t[1]}</button>`).join('')}</span></div>
     <div class="nv-sep"></div>
     <button class="tg-mi" data-a="nvprofile" data-s="look">${ic('gear',15)}Settings<span class="meta">all of them</span></button>
     <button class="tg-mi" data-a="nvprofile" data-s="data">${ic('save',15)}Your data<span class="meta nv-wt"><i></i>no backup yet</span></button>
     <button class="tg-mi" data-a="nvprofile" data-s="keys">${ic('keyTag',15)}Keyboard shortcuts<span class="meta">?</span></button>
     <div class="nv-sep"></div>
     <button class="tg-mi" data-a="nvprofile" data-s="sign">${ic('swap',15)}Switch user</button>
     <button class="tg-mi" data-a="nvlogout">${ic('exit',15)}Log out<span class="meta">${N.who==='MR'&&clkState()!=='out'?'your clock keeps running':''}</span></button></div>`;
  return ''; }
/* ---------- the profile page ---------- */
const SECS=[['you','user','You'],['sign','exit','Sign in & out'],['look','sun','Appearance'],['data','save','Your data'],['tools','bolt','Work tools'],['keys','keyTag','Shortcuts'],['admin','lock','Admin']];
const tog=(k,on,label,sub)=>`<button class="cx-sr2" data-a="nvtog" data-k="${k}"><span class="n"><b>${label}</b>${sub?`<small>${sub}</small>`:''}</span><span class="cr-sw${on?' on':''}"><i></i></span></button>`;
function profilePage(){ const m=ME[N.who], L=SECS.filter(s=>s[0]!=='admin'||N.who==='RH');
  if(!L.some(s=>s[0]===N.sec)) N.sec='you';
  const head=`<header class="tg-head"><h1 class="tg-h1">Profile</h1><span class="tg-facts"><span class="tg-hf" style="cursor:default"><span class="tg-av">${N.who}</span>${m.n}<span class="ib-role">${m.r}</span></span><i>·</i><span class="tg-hf" style="cursor:default">signed in <b style="margin-left:4px">${m.in}</b></span><i>·</i><button class="tg-hf w" data-a="nvsec" data-v="data"><b>No backup</b>yet</button></span><button class="btn btn-sm nv-bk" data-a="nvback" style="height:30px">${ic('console',14)}Back to the Console</button></header>`;
  const list=`<section class="tg-list nv-sl"><div class="tg-lh">Profile &amp; settings</div><div class="tg-scroll">${L.map(s=>`<div class="tg-it nv-si${N.sec===s[0]?' on':''}" data-a="nvsec" data-v="${s[0]}"><span class="tg-gi">${ic(s[1],15)}</span><span class="tg-t"><b>${s[2]}</b></span><span class="tg-w">${{you:'photo, name, role',sign:'log out, switch user',look:'theme, size, screen',data:'folder, backups',tools:'automations, assistant',keys:'every key',admin:'view as, readouts'}[s[0]]}</span>${s[0]==='data'?'<i class="nv-warn in"></i>':''}</div>`).join('')}</div><div class="tg-keys"><span>${kbd('[')}sidebar</span><span>${kbd('?')}shortcuts</span><span>${kbd('Esc')}back</span></div></section>`;
  let b='';
  if(N.sec==='you') b=`<div class="nv-card nv-you"><span class="nv-av xl">${N.who}</span><div class="n"><h3>${m.n}</h3><small>${m.r} · ${m.d} department · since ${m.since}</small><div class="r"><label class="btn btn-sm">${ic('camera',13)}Upload a photo</label><button class="btn btn-sm" data-a="toast" data-t="Back to the portrait.">Use the portrait</button></div></div></div>
    <div class="nv-card"><div class="nv-ch"><b>Details</b><small>Ray keeps these in Staff</small></div>${[['Name',m.n],['Role',m.r],['Department',m.d],['Pages',N.who==='MR'?'Console · RO List · Parts · Time Log · Fixes · Career':'Every page'],['Started',m.since]].map(x=>`<div class="nv-kv"><span>${x[0]}</span><b>${x[1]}</b></div>`).join('')}</div>`;
  else if(N.sec==='sign') b=`<div class="nv-card"><div class="nv-ch"><b>Signed in</b><small>on this computer</small></div><div class="nv-sig"><span class="nv-av lg">${N.who}</span><span class="n"><b>${m.n}</b><small>since ${m.in} · Bay PC 2</small></span><button class="btn btn-sm" data-a="nvprofile" data-s="sign" data-sw="1">${ic('swap',13)}Switch user</button><button class="btn btn-sm btn-primary" data-a="nvlogout">${ic('exit',13)}Log out</button></div>${N.who==='MR'?`<div class="cr-note0" style="margin:10px 0 0">${ic('info',13)}<span>Logging out doesn’t clock you out — your clock and 37590 keep running.</span></div>`:''}</div>
    <div class="nv-card"><div class="nv-ch"><b>When to sign out</b></div>${tog('logoutClock',N.logoutClock,'Log out when I clock out for the day','the next person starts clean')}${tog('lock',N.lock,'Lock after 15 minutes away','the screen asks who’s there')}${tog('pin',N.pin,'Ask for my PIN to sign in','four digits — Ray can reset it')}</div>`;
  else if(N.sec==='look') b=`<div class="nv-card"><div class="nv-ch"><b>Theme</b><small>on this computer</small></div><div class="nv-themes">${[['light','Ivory','#F7F5F0','#FFFFFF','#1D1C1A','#86643A'],['dark','Graphite','#151514','#1F1F1E','#EDEBE6','#D1B184']].map(t=>`<button class="nv-tp${theme()===t[0]?' on':''}" data-a="nvtheme" data-v="${t[0]}"><span class="pv" style="background:${t[2]}"><i style="background:${t[3]}"></i><i class="l" style="background:${t[4]}"></i><i class="a" style="background:${t[5]}"></i></span><span class="nm">${ic(t[0]==='light'?'sun':'moon',13)}${t[1]}${theme()===t[0]?'<span class="ck">'+ic('check',13)+'</span>':''}</span></button>`).join('')}</div></div>
    <div class="nv-card"><div class="nv-ch"><b>Size</b><small>bigger buttons and text for gloves or a tablet</small></div><div class="nv-segrow"><span class="tg-seg3 cr-seg">${[['normal','Normal'],['large','Large'],['floor','Shop floor']].map(t=>`<button class="${N.size===t[0]?'on':''}" data-a="nvsize" data-v="${t[0]}">${t[1]}</button>`).join('')}</span></div>
     <div class="nv-ch" style="margin-top:6px"><b>Screen</b><small>how Parsec lays out</small></div><div class="nv-segrow"><span class="tg-seg3 cr-seg">${[['desktop','Desktop'],['tablet','Tablet'],['phone','Phone']].map(t=>`<button class="${N.screen===t[0]?'on':''}" data-a="nvscreen" data-v="${t[0]}">${t[1]}</button>`).join('')}</span></div>${tog('ribbon',N.ribbon,'Day ribbon','a thin bar of your day across the top of every page')}</div>`;
  else if(N.sec==='data') b=`<div class="nv-card"><div class="nv-ch"><b>Where Parsec saves</b></div><div class="nv-sig"><span class="nv-gi ok">${ic('check',15)}</span><span class="n"><b>Parsec Data</b><small>saved 2:14 pm · each RO in its own folder, shop data in Shop/Shop.html</small></span><button class="btn btn-sm" data-a="toast" data-t="Saved.">${ic('save',13)}Save now</button><button class="btn btn-sm" data-a="toast" data-t="In Parsec this picks another folder.">Change folder</button></div></div>
    <div class="nv-card warn"><div class="nv-ch"><b>Backups</b><small>a copy you can restore from</small></div><div class="nv-sig"><span class="nv-gi wt">${ic('flag',15)}</span><span class="n"><b>No backup yet</b><small>if this computer dies, the folder is the only copy</small></span><button class="btn btn-sm btn-primary" data-a="toast" data-t="Backup saved — Parsec backup Oct 22.json.">Back up now</button><button class="btn btn-sm" data-a="toast" data-t="In Parsec this restores from a backup file.">Restore…</button></div></div>`;
  else if(N.sec==='tools') b=`<div class="nv-card"><div class="nv-ch"><b>Automations</b><small>3 on</small><span class="sp"></span><button class="btn btn-sm" data-a="toast" data-t="In Parsec this opens Automations.">Open</button></div>${[['Status follows the clock','Starting a job sets it to Working'],['Stamp the time in Work performed','Enter adds the time'],['Parts statuses from Parts','Ordered, Staged, Picked up']].map(x=>`<div class="nv-kv"><span>${ic('check',12)}</span><b>${x[0]}<small>${x[1]}</small></b></div>`).join('')}</div>
    <div class="nv-card"><div class="nv-ch"><b>Assistant</b></div>${tog('assist',N.assist,'Assistant chat','ask about an RO, a part or a past fix')}</div>`;
  else if(N.sec==='keys') b=`<div class="nv-card"><div class="nv-ch"><b>Everywhere</b></div>${[['Ctrl K','Search or jump to'],['[','Open or close the sidebar'],['?','These shortcuts'],['Esc','Close a menu']].map(x=>`<div class="nv-kv"><span>${x[0].split(' ').map(kbd).join('')}</span><b>${x[1]}</b></div>`).join('')}<div class="nv-ch" style="margin-top:8px"><b>Console</b></div>${[['J K','Move in your list'],['↵','Start or switch'],['S','Stop'],['D','Done'],['H','Hold'],['1 2','Today · Shop']].map(x=>`<div class="nv-kv"><span>${x[0].split(' ').map(kbd).join('')}</span><b>${x[1]}</b></div>`).join('')}</div>`;
  else b=`<div class="nv-card"><div class="nv-ch"><b>See the app as someone else</b><small>admin only</small></div><div class="nv-segrow"><select class="nv-sel"><option>Admin — every page</option><option>Mike Rodriguez — Technician</option><option>Frank Delaney — Foreman</option><option>Ben Okafor — Parts</option></select></div>${tog('dev',N.dev,'Developer readouts','timings and storage under each page')}</div>
    <div class="nv-card"><div class="nv-ch"><b>Moved out of settings</b></div><div class="nv-kv"><span>${ic('plus',12)}</span><b>New repair order<small>now on the RO List header, Triage check-in and Ctrl K</small></b></div></div>`;
  return `<div class="tg mg cr cx nvp">${head}<div class="tg-body">${list}<div class="tg-main"><div class="mg-pane"><div class="nv-body"><h2>${(SECS.find(s=>s[0]===N.sec)||[])[2]}</h2>${b}</div></div></div></div><div class="tk-tip" hidden></div></div>`; }
/* ---------- signed out ---------- */
function signIn(){ const G=[['Technicians',['MR','DK','KT','AW','PS','LM']],['Shop',['FD','RH','AM','BO','GP']]];
  return `<div class="tg-app nv-out"><div class="nv-in"><span class="lg">${LOGO}</span><h2>Who’s signing in?</h2><p>Vanguard Truck Center · Greensboro · Bay PC 2</p>${G.map(([g,L])=>`<div class="nv-gl">${g}</div><div class="nv-pp">${L.map(k=>`<button class="nv-p" data-a="nvin" data-k="${k}"><span class="nv-av lg">${k}</span><b>${PPL[k]}</b><small>${{MR:'on the clock · 37590',DK:'on the clock',KT:'on the clock',AW:'on the clock',PS:'on the clock',LM:'out · back 3:00',FD:'Foreman',RH:'Service manager',AM:'Service writer',BO:'Parts',GP:'Warranty'}[k]}</small></button>`).join('')}</div>`).join('')}<button class="nv-adm" data-a="nvin" data-k="RH">${ic('lock',13)}Admin</button></div>${TOAST?`<div class="toast-fm">${esc(TOAST.t)}</div>`:''}</div>`; }
/* ---------- drawing ---------- */
const _draw=draw;
draw=function(){ if(N.out){ mock.innerHTML=signIn(); return; }
  _draw();
  const r=$('.tg-rail'); if(r) r.outerHTML=railHtml();
  if(N.page==='profile'){ const p=$('.tg-panel'); p.innerHTML=profilePage()+(TOAST?`<div class="toast-fm">${esc(TOAST.t)}</div>`:''); }
  const app=$('.tg-app'); if(app&&N.pop){ app.insertAdjacentHTML('beforeend',nvPop()); placePop(); }
  root.classList.toggle('nv-big',N.size!=='normal'); };
function placePop(){ const p=$('.nv-pop'), a=$(`[data-a="nvpop"][data-p="${N.pop}"]`), app=$('.tg-app'); if(!p||!a||!app) return; const r=a.getBoundingClientRect(), ar=app.getBoundingClientRect(), x=(r.right-ar.left)/scale+10; let y=(r.top-ar.top)/scale-6; const h=p.offsetHeight; if(y+h>ar.height/scale-12) y=(r.bottom-ar.top)/scale-h+6; p.style.left=x+'px'; p.style.top=Math.max(10,y)+'px'; }
Object.assign(H,{
  nvtoggle:()=>{ N.open=!N.open; N.pop=null; render(); },
  nvpop:t=>{ N.pop=N.pop===t.dataset.p?null:t.dataset.p; render(); },
  nvgo:t=>{ const v=t.dataset.v; N.pop=null; if(v==='console'){ N.page=null; render(); return; } toast(`In Parsec this opens ${({inbox:'the Inbox',ros:'the RO List',timelog:'the Time Log'})[v]||v[0].toUpperCase()+v.slice(1)}.`); render(); },
  nvsearch:()=>{ toast('In Parsec this opens search — RO, VIN, unit, customer or part.'); render(); },
  nvtheme:t=>{ setTheme(t.dataset.v); render(); },
  nvsize:t=>{ N.size=t.dataset.v; toast(N.size==='normal'?'Normal size.':N.size==='large'?'Large — bigger text and buttons on this computer.':'Shop floor — the biggest, for gloves and the tablet.'); render(); },
  nvscreen:t=>{ N.screen=t.dataset.v; render(); },
  nvprofile:t=>{ N.page='profile'; N.sec=t.dataset.s||'you'; N.pop=null; render(); },
  nvsec:t=>{ N.sec=t.dataset.v; N.page='profile'; render(); },
  nvback:()=>{ N.page=null; render(); },
  nvtog:t=>{ const k=t.dataset.k; N[k]=!N[k]; render(); },
  nvlogout:()=>{ N.pop=null; N.out=true; N.page=null; toast(N.who==='MR'&&S.run?'Logged out — your clock is still running on '+opBy(S.run).no+'.':N.who==='MR'&&!S.out?'Logged out — you’re still on the clock.':'Logged out.'); render(); },
  nvin:t=>{ const k=t.dataset.k; if(k!=='MR'&&k!=='RH'){ toast(`${PPL[k]} would sign in here — the mock-up has Mike and Ray.`); render(); return; } N.out=false; N.who=k; setWho(k); toast(`Signed in as ${PPL[k]}.`); render(); },
  nvstop:()=>{ N.pop=null; H.stop(); },
  nvout:t=>{ N.pop=null; H.out(t); },
  nvcin:()=>{ N.pop=null; H.cin(); }
});
document.addEventListener('pointerdown',e=>{ if(!mock.contains(e.target)||!N.pop) return; if(!e.target.closest('.nv-pop,[data-a="nvpop"]')){ N.pop=null; render(); } },true);
addEventListener('keydown',e=>{ if(e.target.matches('input,textarea,select')) return; if(e.key==='['){ N.open=!N.open; N.pop=null; render(); e.preventDefault(); } else if(e.key==='Escape'&&(N.pop||N.page)){ if(N.pop) N.pop=null; else N.page=null; render(); } },true);
/* ---------- the toolbar ---------- */
function bar(){ $$('[data-nv]').forEach(b=>{ const [k,v]=b.dataset.nv.split(':'); b.classList.toggle('is-on',String(N[k])===v); }); }
$$('[data-nv]').forEach(b=>b.addEventListener('click',()=>{ const [k,v]=b.dataset.nv.split(':'); N[k]=v==='true'?true:v==='false'?false:v; N.pop=null; bar(); render(); }));
const _setWho=setWho;
setWho=function(w){ _setWho(w); N.who=w; };
const NDEMO={
  rail:()=>{ nvReset(); setWho('MR'); N.guides=true; },
  open:()=>{ nvReset(); setWho('MR'); N.open=true; N.guides=true; },
  clk:()=>{ nvReset(); setWho('MR'); N.pop='clk'; },
  me:()=>{ nvReset(); setWho('MR'); N.pop='me'; },
  page:()=>{ nvReset(); setWho('MR'); N.page='profile'; N.sec='you'; },
  theme:()=>{ nvReset(); setWho('MR'); N.page='profile'; N.sec='look'; },
  sign:()=>{ nvReset(); setWho('MR'); N.page='profile'; N.sec='sign'; },
  out:()=>{ nvReset(); setWho('MR'); N.out=true; },
  below:()=>{ nvReset(); setWho('MR'); N.pos='clock'; N.open=true; },
  before:()=>{ nvReset(); setWho('MR'); N.before=true; },
  ray:()=>{ nvReset(); setWho('RH'); U.view='today'; N.page='profile'; N.sec='admin'; }
};
$$('[data-ndemo]').forEach(b=>b.addEventListener('click',()=>{ NDEMO[b.dataset.ndemo](); $$('[data-ndemo]').forEach(x=>x.classList.toggle('is-on',x===b)); bar(); render(); }));
window.__nv={N:()=>N,render,NDEMO};
bar(); render();
$('[data-reset]').addEventListener('click',()=>{ const w=N.who; nvReset(); N.who=w; $$('[data-ndemo]').forEach(x=>x.classList.remove('is-on')); bar(); render(); });
