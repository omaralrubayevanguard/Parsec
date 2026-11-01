import asyncio, sys, os, json
from playwright.async_api import async_playwright
H = os.path.dirname(os.path.abspath(__file__))
F = sys.argv[1] if len(sys.argv) > 1 else "t9.html"
MUT = {
 "no_time": "S.punches.length=0; __tg.shiftList().length=0;",
 "no_techs": "S.staff=S.staff.filter(x=>x.role!=='Technician');",
 "none": "",
 "ro_open_empty": "S.ros[3].openedAt=''; S.ros[3].createdAt='';",
 "ro_open_us": "S.ros[3].openedAt='10/24/2026'; S.ros[3].createdAt='10/24/2026';",
 "ro_open_null": "S.ros[3].openedAt=null; S.ros[3].createdAt=null; delete S.ros[3].openedAt; delete S.ros[3].createdAt;",
 "ro_close_bad": "S.ros.forEach(r=>{ if(r.closedAt) r.closedAt='bad'; });",
 "ro_open_future": "S.ros[3].openedAt='2027-03-01T10:00:00.000Z'; S.ros[3].createdAt='2027-03-01T10:00:00.000Z';",
 "ro_open_old": "S.ros[3].openedAt='1970-01-01T10:00:00.000Z'; S.ros[3].createdAt='1970-01-01T10:00:00.000Z';",
 "punch_bad": "S.punches[0].start='bad';",
 "punch_empty": "S.punches[0].start='';",
 "punch_old": "S.punches[0].start='1970-01-01T10:00:00.000Z';",
 "punch_rev": "S.punches[1].stop=new Date(new Date(S.punches[1].start).getTime()-3600000).toISOString();",
 "shift_bad": "__tg.shiftList().push({id:'x1',in:'bad',out:null,by:'Mike Rodriguez'});",
 "shift_open_old": "__tg.shiftList().push({id:'x2',in:'2026-10-20T11:00:00.000Z',out:null,by:'Mike Rodriguez'});",
 "shift_nob": "__tg.shiftList().push({id:'x3',in:'2026-10-24T11:00:00.000Z',out:'2026-10-24T20:00:00.000Z'});",
 "staff_single": "S.staff.push({id:'s9',name:'Soonie',role:'Technician',pages:{}});",
 "staff_empty": "S.staff.push({id:'s10',name:'',role:'Technician',pages:{}});",
 "staff_noname": "S.staff.push({id:'s11',role:'Technician',pages:{}});",
 "staff_dup": "S.staff.push({id:'s12',name:'Mike Rodriguez',role:'Technician',pages:{}}); S.staff.push({id:'s13',name:'Mike Rodgers',role:'Technician',pages:{}});",
 "staff_spaces": "S.staff.push({id:'s14',name:'   ',role:'Technician',pages:{}});",
 "tech_odd": "S.ros[2].assignedTech='M'; S.ros[4].assignedTech='mike'; S.ros[5].assignedTech='Mike  Rodriguez';",
 "quoted_nan": "S.ros.forEach(r=>(r.operations||[]).forEach(o=>{ o.quoted='abc'; }));",
 "burnt_huge": "S.ros[1].operations[0].burnt=1e12;",
 "rate0": "S.laborRate=0; (S.shop=S.shop||{}).rate=0;",
 "audit_big": "S.audit=S.audit||[]; for(let i=0;i<20000;i++) S.audit.push({at:new Date().toISOString(),type:'x',msg:'m'+i});",
 "audit_bad": "S.audit=[{at:'bad',type:null},{type:'staff'},null,'str'];",
 "paypm": "S.shop=S.shop||{}; S.shop.payPer={kind:'monthly',anchor:'2026-01-31'};",
 "payweek": "S.shop=S.shop||{}; S.shop.payPer={kind:'weekly',anchor:'2026-10-26'};",
 "parts_bad": "S.ros.forEach(r=>(r.operations||[]).forEach(o=>(o.parts||[]).forEach(p=>{ p.price='x'; p.qty='abc'; p.cost=-5; })));",
}
async def run(p, name, js):
    b = await p.chromium.launch(); pg = await (await b.new_context(viewport={"width":1440,"height":900})).new_page(); errs=[]
    pg.on("pageerror", lambda e: errs.append(str(e)[:200]))
    await pg.goto("file://" + H + "/" + F); await pg.wait_for_timeout(900)
    await pg.evaluate("__tg.loadSample25()"); await pg.evaluate("__tg.ensureDemoTeam()")
    res = "?"
    try:
        await asyncio.wait_for(pg.evaluate("(()=>{ const S=__tg.STATE(); " + js + " S.savedAt=Date.now(); const s=__tg.staffList().find(x=>x.role==='Manager'); localStorage.setItem('tec_viewas', s.id); __tg.pxSignedIn(); const U=__tg.UI(); U.view='manager'; __tg.render(); const r=[]; const pgm=()=>document.querySelector('[data-pg=manager]'); r.push(pgm()?pgm().innerText.length:'NOPAGE'); for (const v of ['kpi','fleet','flow','team','act']) { const bt=document.querySelector('[data-pg=manager] [data-a=view][data-v='+v+']'); if(bt){ bt.click(); r.push(v+':'+(pgm()?pgm().innerText.length:'X')); } } return r.join(' '); })()"), 25)
        res = await pg.evaluate("1") and "rendered"
        res = await pg.evaluate("(()=>{ const m=document.querySelector('[data-pg=manager]'); return m? 'ok '+m.innerText.length : 'NOPAGE'; })()")
    except asyncio.TimeoutError: res = "HANG"
    except Exception as e: res = "EXC " + str(e)[:150]
    print(f"{name:16s} {res}  errs={errs[:2]}", flush=True)
    await b.close()
async def main():
    async with async_playwright() as p:
        for k in (sys.argv[2:] or MUT.keys()): await run(p, k, MUT[k])
asyncio.run(main())
