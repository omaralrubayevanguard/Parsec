import asyncio, os
from playwright.async_api import async_playwright
B = os.path.dirname(os.path.abspath(__file__))
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await (await b.new_context(viewport={"width": 1480, "height": 1000})).new_page(); errs = []
        pg.on("pageerror", lambda e: errs.append("PAGEERR " + str(e)))
        pg.on("console", lambda m: errs.append("CONSOLE " + m.text) if m.type == "error" and "fonts" not in m.text and "Failed to load" not in m.text else None)
        await pg.goto("file://" + B + "/cr2_mock.html"); await pg.wait_for_timeout(500)
        bad = await pg.evaluate("""() => { const C=window.__cr, out=[]; const chk=(tag)=>{ const t=document.querySelector('.mock').innerText; if(/NaN|undefined|Infinity|\\[object/.test(t)) out.push(tag+': '+(t.match(/.{0,40}(NaN|undefined|Infinity|\\[object).{0,30}/)||[''])[0]); };
          for(const w of ['MR','DK','AW','KT']) for(const p of ['day','wk','lwk','mo','lmo','qt','lqt','yr','all']) for(const c of ['prev','yr']) for(const d of ['eff','sold']) for(const v of ['ov','work','grow']){
            C.setWho(w); const U=C.U(); U.p=p; U.cmp=c; U.drv=d; U.view=v; U.pay=(p==='mo'); C.render(); chk([w,p,c,d,v].join('/')); }
          for(const w of ['MR','AW']) for(const s of ['yr','12','all']) for(const pr of [0,1]){ C.setWho(w); const U=C.U(); if(pr){ U.prior[w]={from:'March 2019',to:'December 2024',ro:2840,q:11420,b:11180,d:1405}; U.usePrior=true; } U.stmt=s; C.render(); chk('stmt/'+w+'/'+s+'/'+pr); }
          return out; }""")
        print("text issues:", bad[:10] or "none")
        # clicks
        await pg.click('[data-demo="prior"]'); await pg.wait_for_timeout(150)
        await pg.fill('.cr-pf input[data-f="ro"]', '3,000'); await pg.click('[data-a="psave"]'); await pg.wait_for_timeout(150)
        t = await pg.inner_text('.cr-tot'); print("prior totals:", t.replace("\n"," | ")[:200])
        await pg.click('[data-a="prior"][data-v="0"]'); await pg.wait_for_timeout(100)
        t = await pg.inner_text('.cr-tot'); print("parsec only:", t.replace("\n"," | ")[:120])
        await pg.click('[data-demo="alerts"]'); await pg.wait_for_timeout(100)
        await pg.click('[data-a="al"][data-k="pace"]'); await pg.wait_for_timeout(100)
        print("alert sent shown after off:", await pg.query_selector('.cr-last') is not None)
        await pg.click('[data-demo="notes"]'); await pg.wait_for_timeout(100)
        await pg.click('[data-a="ack"]'); await pg.wait_for_timeout(100)
        print("new tag after ack:", await pg.query_selector('.cr-nt.new') is not None)
        await pg.click('[data-a="ask"]'); await pg.wait_for_timeout(100); print("toast:", await pg.inner_text('.toast-fm'))
        await pg.click('[data-a="view"][data-v="ov"]'); await pg.keyboard.press('c'); await pg.wait_for_timeout(100)
        print("cmp after c:", await pg.evaluate("window.__cr.U().cmp"))
        await pg.click('[data-a="drv"][data-v="sold"]'); await pg.wait_for_timeout(100); print("why sold:", (await pg.inner_text('.cr-why')).replace("\n"," | ")[:220])
        await pg.click('[data-a="go"]'); await pg.wait_for_timeout(100); print("go view:", await pg.evaluate("window.__cr.U().view+' '+window.__cr.U().sel"))
        await pg.keyboard.press('3'); await pg.keyboard.press('1'); await pg.click('[data-a="stmt"]'); await pg.wait_for_timeout(100)
        await pg.click('[data-a="stmtp"][data-v="all"]'); await pg.keyboard.press('Escape'); await pg.wait_for_timeout(100)
        print("stmt after esc:", await pg.evaluate("window.__cr.U().stmt"))
        await pg.click('[data-role="AW"]'); await pg.wait_for_timeout(100)
        print("AW yr disabled:", await pg.evaluate("document.querySelector('[data-a=cmp][data-v=yr]').disabled"))
        # header overlap check for each tech
        for w in ['MR','DK','AW','KT']:
            o = await pg.evaluate(f"""() => {{ window.__cr.setWho('{w}'); window.__cr.render(); const f=document.querySelector('.tg-facts').getBoundingClientRect(), v=document.querySelector('.tg-views').getBoundingClientRect(); return Math.round(v.left-f.right); }}""")
            print(w, "gap facts→tabs px:", o)
        print("\n".join(errs) or "no errors")
        await b.close()
asyncio.run(main())
