import asyncio, sys
from playwright.async_api import async_playwright
F = "file:///mnt/user-data/outputs/Parsec%20Mobile.html"
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        ctx = await b.new_context(viewport={"width": 390, "height": 844}, device_scale_factor=2, is_mobile=True, has_touch=True)
        pg = await ctx.new_page(); errs = []
        pg.on("pageerror", lambda e: errs.append("PAGEERR " + str(e))); pg.on("console", lambda m: errs.append(m.type + " " + m.text) if m.type in ("error", "warning") and "ERR_" not in m.text and "manifest" not in m.text.lower() else None)
        await pg.goto(F); await pg.wait_for_timeout(500)
        await pg.screenshot(path="a1_empty.png")
        await pg.click("text=Try it with sample ROs"); await pg.wait_for_timeout(500)
        await pg.screenshot(path="a2_today.png", full_page=False)
        # start clock from Today
        await pg.click(".pm-play >> nth=0"); await pg.wait_for_timeout(1500)
        await pg.screenshot(path="a3_running.png")
        print("cbar:", await pg.inner_text(".pm-cbar"))
        # open RO
        await pg.click(".pm-cbar"); await pg.wait_for_timeout(500)
        await pg.screenshot(path="a4_op.png")
        await pg.click("[data-act=part] >> nth=0"); await pg.wait_for_timeout(400)
        await pg.screenshot(path="a5_partsheet.png")
        await pg.click(".pm-sheet [data-st=Installed]"); await pg.wait_for_timeout(500)
        await pg.click("[data-act=ptab][data-k=notes]"); await pg.wait_for_timeout(200)
        await pg.fill("#noteIn", "replaced clutch fork bushing. checked hydraulics")
        await pg.click("[data-act=savenote]"); await pg.wait_for_timeout(400)
        await pg.screenshot(path="a6_notes.png")
        # stop with reason
        await pg.click(".pm-go"); await pg.wait_for_timeout(400)
        await pg.screenshot(path="a7_stopsheet.png")
        await pg.click(".pm-sheet [data-k='Waiting – Parts']"); await pg.wait_for_timeout(400)
        st = await pg.evaluate("PM.S().L")
        print("entries:", len(st['entries']), "notes:", st['notes'][0]['x'] if st['notes'] else None, "pstat:", len(st['pstat']))
        # add a manual time entry so it is long enough
        await pg.click("[data-act=ptab][data-k=time]"); await pg.click("[data-act=addtime]"); await pg.wait_for_timeout(300)
        await pg.click(".pm-sheet [data-act=savetime]"); await pg.wait_for_timeout(300)
        # back to RO
        await pg.click(".pm-back"); await pg.wait_for_timeout(400)
        await pg.screenshot(path="a8_ro.png")
        await pg.evaluate("document.querySelector('.view').scrollTo(0,9999)"); await pg.wait_for_timeout(200)
        await pg.screenshot(path="a8b_ro_bottom.png")
        await pg.evaluate("document.querySelector('.view').scrollTo(0,0)")
        await pg.click("[data-act=tot][data-k=parts]"); await pg.wait_for_timeout(400); await pg.screenshot(path="a9_parts.png"); await pg.click(".pm-sheet [data-act=closesheet]"); await pg.wait_for_timeout(250)
        await pg.click(".pm-stage"); await pg.wait_for_timeout(400); await pg.screenshot(path="a10_stage.png")
        await pg.click(".pm-sheet [data-key='parts:2']"); await pg.wait_for_timeout(300); await pg.click(".pm-sheet [data-act=closesheet]"); await pg.wait_for_timeout(250)
        await pg.click("[data-act=addop]"); await pg.wait_for_timeout(300); await pg.fill(".pm-sheet [data-f=c]", "air dryer purging constantly"); await pg.click(".pm-sheet [data-act=newop]"); await pg.wait_for_timeout(300)
        # sync send
        await pg.click(".pm-tab >> nth=2"); await pg.wait_for_timeout(1200)
        await pg.screenshot(path="a11_sync.png")
        ob = await pg.evaluate("PM.outbox()")
        print("outbox:", ob['count'], [x['k'] for x in ob['ch']], len(ob['ops']), len(ob['tk']))
        # decode the QR on screen with jsQR in page, to prove frames are readable
        dec = await pg.evaluate("""(()=>{const c=document.querySelector('[data-qr]');const x=c.getContext('2d');const s=6;const t=document.createElement('canvas');t.width=c.width*s;t.height=c.height*s;const y=t.getContext('2d');y.imageSmoothingEnabled=false;y.drawImage(c,0,0,t.width,t.height);const d=y.getImageData(0,0,t.width,t.height);const r=jsQR(d.data,t.width,t.height);return r?r.data.slice(0,40):null})()""")
        print("decoded frame:", dec)
        # theme dark + bay
        await pg.click(".pm-tab >> nth=3"); await pg.wait_for_timeout(300)
        await pg.click("[data-act=theme][data-k=dark]"); await pg.click("[data-act=bay]"); await pg.wait_for_timeout(300)
        await pg.screenshot(path="a12_me_dark.png")
        await pg.click(".pm-tab >> nth=0"); await pg.wait_for_timeout(400); await pg.screenshot(path="a13_today_dark_bay.png")
        # persistence
        await pg.reload(); await pg.wait_for_timeout(500)
        print("after reload: ros", await pg.evaluate("PM.V().ros.length"), "theme", await pg.evaluate("document.documentElement.dataset.theme"), "bay", await pg.evaluate("document.getElementById('app').classList.contains('is-bay')"))
        print("errors:", errs)
        await b.close()
asyncio.run(main())
