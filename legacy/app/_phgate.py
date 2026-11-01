import asyncio, os
from playwright.async_api import async_playwright
H = os.path.dirname(os.path.abspath(__file__)); OUT = os.path.join(H, "shots_phone")
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); ctx = await b.new_context(viewport={"width":390,"height":844}, device_scale_factor=1, has_touch=True, is_mobile=True)
        pg = await ctx.new_page(); errs=[]; pg.on("pageerror", lambda e: errs.append(str(e)[:200]))
        await pg.add_init_script("try{ localStorage.setItem('tec_device','auto'); }catch(e){}")
        await pg.goto("file://" + H + "/Parsec_9.html"); await pg.wait_for_timeout(3800)
        print("device (auto on a phone):", await pg.evaluate("document.documentElement.getAttribute('data-device')"))
        await pg.screenshot(path=f"{OUT}/gate.png")
        bad = await pg.evaluate("[...document.querySelectorAll('body *')].filter(e=>{const r=e.getBoundingClientRect(); return r.width && (r.right>394 || r.left < -2);}).slice(0,5).map(e=>(e.className||e.tagName).toString().split(' ')[0]+':'+Math.round(e.getBoundingClientRect().left)+'-'+Math.round(e.getBoundingClientRect().right))")
        print("gate clipped:", bad)
        # look around without a folder, then sign-in with a team
        await pg.evaluate("(()=>{ const b=[...document.querySelectorAll('button')].find(x=>/without a folder|Just this|Look around/i.test(x.textContent)); if(b) b.click(); })()"); await pg.wait_for_timeout(800)
        print("after: tabs?", await pg.evaluate("!!document.querySelector('.pm-tabs')"))
        await pg.screenshot(path=f"{OUT}/after_gate.png")
        print("errors", errs[:5]); await b.close()
asyncio.run(main())
