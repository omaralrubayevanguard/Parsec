import asyncio
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(); pg=await b.new_page(viewport={"width":1480,"height":1000}); errs=[]
        pg.on("pageerror",lambda e:errs.append(str(e)))
        await pg.goto("file:///mnt/user-data/outputs/Parsec%20Triage%20yard.html"); await pg.wait_for_timeout(400)
        top=await pg.evaluate("document.querySelector('.wt-wrap').getBoundingClientRect().top")
        clip={"x":20,"y":top,"width":1440,"height":900}
        async def shot(n): await pg.evaluate("scrollTo(0,0)"); await pg.wait_for_timeout(280); await pg.screenshot(path=f"yd_{n}.png", clip=clip)
        for th in ("light","dark"):
            await pg.click(f"[data-theme-set={th}]")
            for d in ("drag","eta","etay","clash"):
                await pg.click(f"[data-demo={d}]"); await shot(f"{d}_{th}")
        await pg.click("[data-theme-set=light]")
        # drag list item onto free spot C7 — capture mid-drag state via manual events
        await pg.click("[data-demo=drag]")
        src=pg.locator(".i3-it[data-sel='37590']"); dst=pg.locator(".yd [data-drop='C7']")
        await pg.evaluate("""()=>{const s=document.querySelector(".i3-it[data-sel='37590']");const dt=new DataTransfer();s.dispatchEvent(new DragEvent('dragstart',{bubbles:true,dataTransfer:dt}));const t=document.querySelector(".yd [data-drop='C7']");t.dispatchEvent(new DragEvent('dragover',{bubbles:true,cancelable:true,dataTransfer:dt}));window.__dt=dt;}""")
        await shot("1a_dragging")
        await pg.evaluate("""()=>{const t=document.querySelector(".yd [data-drop='C7']");t.dispatchEvent(new DragEvent('drop',{bubbles:true,cancelable:true,dataTransfer:window.__dt}));document.dispatchEvent(new DragEvent('dragend',{bubbles:true}));}""")
        await shot("1b_dropped")
        # real playwright drag: map tile 37516 (C4) -> E3
        await pg.drag_and_drop(".yd [data-drag='37516']", ".yd [data-drop='E3']"); await shot("1c_pwdrag")
        spot=await pg.evaluate("ROS.find(r=>r.no==='37516').spot"); print("37516 spot:",spot)
        # keyboard M
        await pg.click(".yd [data-sel='37544']"); await pg.keyboard.press("m"); await shot("1d_m")
        await pg.keyboard.press("Escape")
        # clash fix flow
        await pg.click("[data-demo=clash]"); await pg.click("[data-keep='37602']"); await shot("3a_keep")
        await pg.click(".yd [data-free='UP']"); await shot("3b_fixed")
        # arrival countdown with clock
        await pg.click("[data-demo=etay]"); await pg.click("[data-tt='0.5']"); await pg.click("[data-tt='0.5']"); await shot("2a_late")
        # log ETA via popover
        await pg.click("[data-demo=eta]"); await pg.keyboard.press("c"); await pg.keyboard.press("5"); await pg.keyboard.press("n"); await pg.keyboard.type("Driver says 25 minutes out"); await shot("2b_logeta")
        await pg.keyboard.press("Enter"); await shot("2c_eta_updated")
        print("errors:",errs); await b.close()
asyncio.run(main())
