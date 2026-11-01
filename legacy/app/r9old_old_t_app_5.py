import asyncio, json, sys, os
from playwright.async_api import async_playwright
H = os.path.dirname(os.path.abspath(__file__))
SH = os.path.join(H, "shots8r"); os.makedirs(SH, exist_ok=True)
ONLY = sys.argv[1] if len(sys.argv) > 1 else ""

SEED = r"""(()=>{
const S=__tg.S(), now=Date.now(), iso=ms=>new Date(ms).toISOString();
const live=S.ros.filter(r=>!r.shop&&r.id!=='ro_shop'&&__tg.roStatus(r).status!=='Complete – Released');
const wrk=()=>live.filter(r=>__tg.tyCat(r)==='wrk' && !r._t);
const apr=live.find(r=>__tg.tyCat(r)==='apr'); apr._t=1;
S.customers=S.customers||{}; S.customers[apr.customerName.toLowerCase()]={name:apr.customerName,people:[{id:'p1',n:'Dana Kowalski',r:'Fleet manager',ph:'336-555-0142',em:'dana@example.com',pref:'Text',ok:true,best:'mornings'},{id:'p2',n:'Joe Barnes',r:'Driver',ph:'336-555-0199',pref:'Call'}]};
apr.contacts=[{id:'c1',at:iso(now-5*3600e3),by:'Admin',kind:'Text',out:'Update given',note:'Estimate $315 sent for the NOx sensor diag.',to:'Dana Kowalski'},{id:'c2',at:iso(now-3*3600e3),by:'Admin',kind:'Call',out:'No answer',note:'',to:'Joe Barnes'},{id:'c3',at:iso(now-1.5*3600e3),by:'Admin',kind:'Call',out:'Left voicemail',note:'Asked for a yes or no on op 1',to:'Joe Barnes'}];
apr.status.setAt=iso(now-26*3600e3);
const arr=wrk()[0]; arr._t=1; arr.location='Ready 1'; arr.contacts=[{id:'c4',at:iso(now-10*60e3),by:'Admin',kind:'Call',out:'Update given',note:'Driver says about 40 minutes out'}];
const sent=wrk()[0]; sent._t=1; sent.route={to:'writer',who:'',by:'Luis Martinez',byRole:'Technician',at:iso(now-25*60e3),note:'Found a cracked air line — needs an estimate',reason:'Estimate ready',state:'pending',from:{to:'tech',who:'Luis Martinez'},fromAt:iso(now-3*3600e3)};
const sp=wrk().filter(r=>__tg.spotOf(r.location)); const c1=sp[0], c2=sp[1]; c1._t=1; c2._t=1; c2.location=c1.location;
const fm=wrk()[0]; fm._t=1; fm.route={to:'foreman',who:'',by:'Admin',byRole:'Admin',at:iso(now-5*3600e3),note:'Needs a second opinion on the turbo',reason:'Second opinion',state:'accepted',acceptedAt:iso(now-5*3600e3),from:{to:'tech',who:fm.assignedTech||''},back:iso(now-40*60e3)};
fm.handoffs=(fm.handoffs||[]).concat([{id:'h1',kind:'send',at:iso(now-5*3600e3),by:'Admin',from:'tech',to:'foreman',who:'',note:'Needs a second opinion on the turbo',reason:'Second opinion',back:iso(now-40*60e3)}]);
const ck=wrk()[0]; ck._t=1; ck.location='Triage 2'; ck.assignedTech=''; ck.dateOpened=iso(now-3*3600e3);
live.forEach(r=>delete r._t);
return {apr:apr.id,arr:arr.id,sent:sent.id,c1:c1.id,c2:c2.id,fm:fm.id,ck:ck.id};
})()"""

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); ctx = await b.new_context(viewport={"width": 1440, "height": 900}); pg = await ctx.new_page(); errs = []
        pg.on("pageerror", lambda e: errs.append("PAGEERR " + str(e)))
        pg.on("console", lambda m: errs.append("CONSOLE " + m.text) if m.type == "error" and "ERR_TUNNEL" not in m.text and "Failed to load resource" not in m.text else None)
        await pg.goto("file://" + H + "/t9.html"); await pg.wait_for_timeout(1500)
        await pg.evaluate("__tg.applyTheme('ivl')"); await pg.evaluate("__tg.sample()"); await pg.wait_for_timeout(400)
        await pg.evaluate("(()=>{const U=__tg.UI(); U.view='triage'; U.modal=null; __tg.render();})()"); await pg.wait_for_timeout(300)
        ids = await pg.evaluate(SEED)
        await pg.evaluate("(()=>{const U=__tg.UI(); U.view='triage'; U.modal=null; U.toast=null; U.tgSel=null; U.tgView='inbox'; __tg.render();})()"); await pg.wait_for_timeout(500)
        async def shot(n, wait=350):
            await pg.wait_for_timeout(wait); await pg.screenshot(path=f"{SH}/{n}.png")
        async def key(k, wait=250):
            await pg.keyboard.press(k); await pg.wait_for_timeout(wait)
        async def ui(js):
            await pg.evaluate("(()=>{const U=__tg.UI();" + js + ";__tg.render();})()"); await pg.wait_for_timeout(250)
        print("needs:", await pg.evaluate("__tg.tgNeedsAll().map(x=>x.g+':'+x.btn+':'+x.ro.roNumber)"))
        await shot("b1_inbox")
        # select the approval RO and log a voicemail from the keyboard
        await ui(f"U.tgSel='{ids['apr']}'")
        await shot("b2_apr_inbox")
        await key("c"); await shot("b3_logpop")
        await key("3"); await shot("b4_logpop_vm")
        await key("Enter", 500); await shot("b5_after_log")
        # composer: text with a template
        await ui(f"U.tgSel='{ids['apr']}'; U.tgLFC={{kind:'Text',out:null,when:null,note:''}}")
        await shot("b6_composer_text")
        # approval inline
        await pg.click(f".tg-opr .tg-seg3 button[data-d='ok']"); await shot("b7_apf")
        await key("Escape")
        # desk + yard
        await key("2"); await shot("c1_desk")
        await key("3"); await shot("c2_yard")
        # clash
        await ui("U.tgClash=null"); await pg.click(".tg-ybar .tg-warnb") if await pg.query_selector(".tg-ybar .tg-warnb") else None
        await shot("c3_clash")
        await key("Escape")
        # drag a truck to a free spot
        await pg.locator(".tg-s.occ[draggable='true']").first.drag_to(pg.locator(".tg-s[data-tg-drop]:not(.occ)").first); await shot("c4_dragged", 500)
        # back to inbox, release popover
        await key("1")
        btn = await pg.query_selector(".tg-it .tg-go.btn-primary")
        if btn: await btn.click(); await shot("d1_release")
        await key("Escape")
        # transfer from the keyboard
        await ui(f"U.tgSel='{ids['fm']}'")
        await key("t"); await shot("d2_xfer_desks")
        await key("2"); await shot("d3_xfer_tech")
        await key("Escape")
        await ui(f"U.tgSel='{ids['sent']}'"); await key("t"); await key("4"); await key("1"); await shot("d4_xfer_ready")
        await key("Enter", 500); await shot("d5_xfer_done")
        # snooze menu
        await key("s"); await shot("d6_snooze")
        await key("2", 400); await shot("d7_snoozed")
        # search
        await key("/"); await pg.keyboard.type("D", delay=40); await shot("e1_search")
        await key("Escape")
        # filters
        await pg.click(".tg-hf[data-k='rdy']"); await shot("e2_filter_rdy")
        await pg.click(".tg-hf[data-k='rdy']")
        # keys sheet
        await key("Shift+Slash", 400); await shot("e3_keys")
        await ui("U.modal=null")
        # template editor
        await ui(f"U.tgSel='{ids['apr']}'; U.modal={{type:'tg-tpl', sel:'est'}}"); await shot("e4_tpl")
        await ui("U.modal=null")
        # dark
        await pg.evaluate("__tg.applyTheme('ivd')"); await ui(f"U.tgSel='{ids['apr']}'; U.tgView='inbox'")
        await shot("f1_dark_inbox")
        await key("2"); await shot("f2_dark_desk")
        await key("3"); await shot("f3_dark_yard")
        await key("1"); await key("c"); await shot("f4_dark_log")
        await key("Escape")
        await pg.evaluate("__tg.applyTheme('ivl')")
        # leave the page: late badge on the nav
        await ui("U.view='rolist'"); await pg.wait_for_timeout(300)
        await pg.evaluate(f"(()=>{{const r=__tg.getRO('{ids['ck']}'); r.dateOpened=new Date(Date.now()-5*3600e3).toISOString();}})()")
        await ui(""); await shot("g1_badge")
        await ui("U.view='triage'"); await shot("g2_back_away")
        # all the other pages still render
        for v in ["console", "foreman", "manager", "rolist", "warranty", "parts", "timelog", "fixes", "career", "report"]:
            await ui(f"U.view='{v}'"); await pg.wait_for_timeout(200)
        await ui("U.view='triage'")
        print("errors:", errs[:20])
        await b.close()
asyncio.run(main())
