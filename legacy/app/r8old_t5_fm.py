import asyncio, json, sys, os, datetime
from playwright.async_api import async_playwright
H = os.path.dirname(os.path.abspath(__file__))
SH = os.path.join(H, "shots8r"); os.makedirs(SH, exist_ok=True)

SEED = r"""(()=>{
const S=__tg.S(), now=Date.now(), iso=ms=>new Date(ms).toISOString(), st=r=>__tg.roStatus(r).status, today=__tg.todayStr();
const live=S.ros.filter(r=>!r.shop&&r.id!=='ro_shop'&&st(r)!=='Complete – Released');
const used={}; const take=f=>{ const r=live.find(x=>!used[x.id]&&f(x)); if(r) used[r.id]=1; return r; };
const techs=__tg.fmTechs();
const sf=n=>__tg.staffList().find(s=>s.name===n);
const SK={0:['Electrical','Engine','Warranty cert.'],1:['Aftertreatment','Hydraulics','Engine'],2:['Brakes','PM','Electrical'],3:['Drivetrain','Brakes','PM']};
techs.forEach((n,i)=>{ const s=sf(n); if(s){ s.fmSkills=SK[i%4]; } });
const cfg=__tg.fmCfg(); cfg.bays={'Bay 1':['Pit'],'Bay 2':['Pit'],'Bay 3':['Lift'],'Bay 4':['Lift'],'Bay 5':['Crane','Exhaust'],'Bay 6':['Crane','Exhaust'],'Bay 7':['Pit','Long'],'Bay 8':['Pit','Long'],'Bay 9':['Align'],'Bay 10':['Lift'],'Bay 11':['Exhaust'],'Bay 12':['Lift','Long']};
const out={};
// a clock left running since yesterday
const rp=S.punches.find(p=>!p.stop); if(rp){ const y=new Date(); y.setDate(y.getDate()-1); y.setHours(14,50,0,0); rp.start=y.toISOString(); out.stuck=rp.roId; const r=S.ros.find(x=>x.id===rp.roId); if(r) used[r.id]=1; }
// a clock straight through lunch yesterday
const lr=take(r=>r.assignedTech&&st(r)==='Hold Tech'); if(lr){ const y=new Date(); y.setDate(y.getDate()-1); while(y.getDay()===0||y.getDay()===6) y.setDate(y.getDate()-1); const s=new Date(y); s.setHours(10,40,0,0); const e=new Date(y); e.setHours(13,25,0,0); const op=lr.operations[0]; S.punches.push({id:__tg.uid('pn'),roId:lr.id,opId:op.id,start:s.toISOString(),stop:e.toISOString(),startReason:'Repairing',stopReason:'Switched job',notes:'Worked it.',by:lr.assignedTech}); out.lunch=lr.id; }
// sent to the foreman, waiting to be accepted
const sr=take(r=>r.assignedTech&&st(r)==='Hold Tech'); if(sr){ sr.route={to:'foreman',who:'',by:sr.assignedTech,byRole:'Technician',at:iso(now-25*60e3),note:'Actuator tests fine on the bench. VGT sticking? Want you to look before I order.',reason:'Second opinion',state:'pending',from:{to:'tech',who:sr.assignedTech},fromAt:iso(now-2*3600e3)}; out.sent=sr.id; }
// waiting on the foreman, with a finding: a second op the tech added
const wf=live.find(r=>st(r)==='Waiting – Foreman'&&!used[r.id]) || take(r=>r.assignedTech); if(wf){ used[wf.id]=1; if(st(wf)!=='Waiting – Foreman') wf.status={status:'Waiting – Foreman',sub:null,setAt:iso(now-90*60e3)};
  wf.route={to:'foreman',who:'',by:wf.assignedTech||'Mike Rodriguez',byRole:'Technician',at:iso(now-90*60e3),note:'Found the EGR cooler leaking into the intake — needs replacing.',reason:'Second opinion',state:'accepted',acceptedAt:iso(now-80*60e3),from:{to:'tech',who:wf.assignedTech}};
  wf.operations.push({id:__tg.uid('op'),complaint:'Replace EGR cooler — leaking coolant into the intake',cause:'',correction:'',log:[],quoted:4.5,isStandard:false,standardName:null,declined:false,jobType:'REPAIR',parts:[{id:__tg.uid('pt'),description:'EGR cooler',partNumber:'21458367',qty:'1',price:'1840',status:'Not Ordered',eta:''}]}); out.wf=wf.id; }
// back again: the same unit was here 10 days ago with the same complaint
const ba=take(r=>r.assignedTech&&st(r)==='Hold Tech'); if(ba){ const prev=JSON.parse(JSON.stringify(ba)); prev.id=__tg.uid('ro'); prev.roNumber='RO-30111'; prev.status={status:'Complete – Released',sub:null,setAt:iso(now-10*86400e3)}; prev.dateClosed=iso(now-10*86400e3); prev.dateOpened=iso(now-11*86400e3); prev.operations.forEach(o=>{o.id=__tg.uid('op'); o.correction='Replaced it and tested.';}); S.ros.push(prev);
  ba.dateOpened=iso(now-3*3600e3); ba.assignedTech=''; ba.location='Triage 3'; out.back=ba.id; }
// a failed road test
const rf=take(r=>r.assignedTech&&st(r)==='Hold Tech'); if(rf){ rf.roadTest={miles:'14',start:'',result:'Fail',checked:'Still losing coolant at highway speed — temp climbs past 210.',at:iso(now-40*60e3),by:rf.assignedTech}; out.rtfail=rf.id; }
// QC: road test passed
const qc=live.find(r=>st(r)==='Complete – Road test'&&!used[r.id]); if(qc){ used[qc.id]=1; qc.roadTest={miles:'9',start:'',result:'Pass',checked:'No leaks, no codes',at:iso(now-30*60e3),by:qc.assignedTech||'Admin'}; out.qc=qc.id; }
// a check-in with no tech, an arrival with an ETA
const ck=take(r=>st(r)==='Hold Tech'); if(ck){ ck.location='Triage 2'; ck.assignedTech=''; ck.dateOpened=iso(now-2.5*3600e3); out.ck=ck.id; }
const ar=take(r=>st(r)==='Hold Tech'); if(ar){ ar.location='Ready 1'; ar.assignedTech=''; ar.contacts=[{id:'c4',at:iso(now-10*60e3),by:'Admin',kind:'Call',out:'Update given',note:'Driver says about 40 minutes out'}]; out.arr=ar.id; }
// bring in: approved, parts in hand, on the lot
const bi=take(r=>r.assignedTech&&st(r)==='Hold Tech'&&r.operations.some(o=>(o.parts||[]).length)); if(bi){ bi.location='Lot D5'; bi.operations.forEach(o=>(o.parts||[]).forEach(p=>{p.status='Received';})); out.bring=bi.id; }
// a promise at risk
const pr=take(r=>r.assignedTech&&st(r)==='Hold Tech'); if(pr){ pr.promisedAt=iso(now+40*60e3); pr.operations[0].quoted=(+pr.operations[0].quoted||1)+4; out.risk=pr.id; }
// a free tech: last punch stopped 40 minutes ago, nothing in a bay
const ft=techs[techs.length-1]; if(ft){ S.ros.filter(r=>r.assignedTech===ft&&st(r)==='Hold Tech').forEach(r=>{ if(!r.location||/^Bay|^UpTime|^Awning/.test(r.location)) r.location='Lot E1'; });
  const anyRo=S.ros.find(r=>r.assignedTech===ft)||live[0]; S.punches.push({id:__tg.uid('pn'),roId:anyRo.id,opId:anyRo.operations[0].id,start:iso(now-160*60e3),stop:iso(now-40*60e3),startReason:'Repairing',stopReason:'Complete',notes:'Done.',by:ft}); out.free=ft; }
// trucks in the bays: work with a tech goes on the floor
let bn=1; live.filter(r=>r.assignedTech&&['Hold Tech','Working','Waiting – Parts','Waiting – Foreman','Complete – Road test'].includes(st(r))&&!/^(Triage|Ready)/.test(r.location||'')&&r.id!==out.bring&&r.id!==out.back&&r.assignedTech!==out.free).slice(0,13).forEach(r=>{ r.location=bn===13?'UpTime':'Bay '+bn; bn++; });
if(out.stuck){ const r=S.ros.find(x=>x.id===out.stuck); if(r) r.location='Bay 14'; }
__tg.fmNcClear();
return out;
})()"""

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); ctx = await b.new_context(viewport={"width": 1440, "height": 900}); pg = await ctx.new_page(); errs = []
        await pg.clock.install(time=datetime.datetime(2026, 10, 22, 10, 15))
        pg.on("pageerror", lambda e: errs.append("PAGEERR " + str(e)))
        pg.on("console", lambda m: errs.append("CONSOLE " + m.text) if m.type == "error" and "ERR_TUNNEL" not in m.text and "Failed to load resource" not in m.text else None)
        await pg.goto("file://" + H + "/t8.html"); await pg.wait_for_timeout(1500)
        await pg.evaluate("__tg.applyTheme('ivl')"); await pg.evaluate("__tg.sample()"); await pg.wait_for_timeout(400)
        await pg.evaluate("(()=>{const U=__tg.UI(); U.view='foreman'; U.modal=null; __tg.render();})()"); await pg.wait_for_timeout(300)
        ids = await pg.evaluate(SEED); print("ids", ids)
        await pg.evaluate("(()=>{const U=__tg.UI(); U.view='foreman'; U.modal=null; U.toast=null; U.fmSel=null; U.fmView='floor'; __tg.render();})()"); await pg.wait_for_timeout(500)
        async def shot(n, wait=350):
            await pg.wait_for_timeout(wait); await pg.screenshot(path=f"{SH}/{n}.png")
        async def key(k, wait=250):
            await pg.keyboard.press(k); await pg.wait_for_timeout(wait)
        async def ui(js):
            await pg.evaluate("(()=>{const U=__tg.UI();" + js + ";__tg.fmNcClear();__tg.render();})()"); await pg.wait_for_timeout(250)
        print("needs:", await pg.evaluate("__tg.fmNeedsAll().map(x=>x.g+':'+x.btn+':'+(x.ro.isTech?x.ro.name:x.ro.roNumber))"))
        await shot("a1_floor")
        await key("2"); await shot("a2_techs")
        await key("3"); await shot("a3_yard")
        await key("4"); await shot("a4_tomorrow")
        await key("1")
        await ui("U.fmDay=true"); await shot("a5_day"); await ui("U.fmDay=false")
        # each item's popover
        for k, nm in [("stuck", "b1_stopclk"), ("lunch", "b2_fixclk"), ("sent", "b3_sent"), ("wf", "b4_decide"), ("back", "b5_back"), ("rtfail", "b6_rtfail"), ("qc", "b7_qc"), ("ck", "b8_assign"), ("arr", "b9_plan_arr"), ("bring", "b10_bring"), ("risk", "b11_risk")]:
            if not ids.get(k): continue
            await ui(f"U.fmSel='{ids[k]}'; U.fmPop=null")
            await key("Enter", 400); await shot(nm)
            await key("Escape")
        if ids.get("free"):
            await ui(f"U.fmSel='T:{ids['free']}'"); await key("Enter", 400); await shot("b12_give"); await key("Escape")
        # plan together
        await key("p", 400); await shot("c1_plan")
        await key("Escape")
        # skills popover, bay types, settings
        await ui("U.fmView='techs'"); el = await pg.query_selector(".fm-ske")
        if el: await el.click(); await shot("c2_skills")
        await key("Escape")
        await ui("U.fmView='floor'; U.fmPop={type:'bays',ro:null}"); await shot("c3_bays")
        await ui("U.fmPop={type:'cfg',ro:null}"); await shot("c4_cfg")
        await ui("U.fmPop=null")
        # fill a free bay
        fb = await pg.query_selector(".fm-bay.free.fill")
        if fb: await fb.click(); await shot("c5_fill")
        await key("Escape")
        # dark
        await pg.evaluate("__tg.applyTheme('ivd')"); await ui("U.fmView='floor'"); await shot("d1_dark_floor")
        await key("2"); await shot("d2_dark_techs"); await key("4"); await shot("d3_dark_tmr"); await key("1")
        if ids.get("wf"): await ui(f"U.fmSel='{ids['wf']}'"); await key("Enter", 400); await shot("d4_dark_decide"); await key("Escape")
        await pg.evaluate("__tg.applyTheme('ivl')")
        # the badge from another page, and the Console
        await ui("U.view='rolist'"); await shot("e1_badge")
        await ui("U.view='console'"); await shot("e2_console")
        for v in ["manager", "triage", "warranty", "parts", "timelog", "fixes", "career", "report", "foreman"]:
            await ui(f"U.view='{v}'"); await pg.wait_for_timeout(150)
        print("errors:", errs[:20])
        await b.close()
asyncio.run(main())
