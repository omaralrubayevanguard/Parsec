import asyncio, os, sys
from playwright.async_api import async_playwright
H = "/tmp/claude-0/-home-claude/febe01e4-e12e-554d-9dc2-ccfd769708e9/scratchpad/app"
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await (await b.new_context(viewport={"width": 1440, "height": 900})).new_page()
        await pg.route("**/fonts.g*/**", lambda r: r.abort())
        await pg.goto("file://" + H + "/" + sys.argv[1]); await pg.wait_for_timeout(1200)
        await pg.evaluate("__tg.loadSample25()"); await pg.wait_for_timeout(300)
        rid = await pg.evaluate("__tg.STATE().ros.filter(r=>!r.dateClosed && r.operations.length>1)[0].id")
        await pg.evaluate(f"(()=>{{ const U=__tg.UI(); U.view='ros'; U.selectedRo='{rid}'; __tg.render(); }})()"); await pg.wait_for_timeout(1500)
        q = "(()=>{ const h=document.querySelector('.jc-host:not(.jc-band-host)'); const R=h.shadowRoot; const t=R.querySelector('.px-ro__main h3, .px-sec h3, h3'); return [getComputedStyle(h).getPropertyValue('--ink'), t ? getComputedStyle(t).color : '-', h.className]; })()"
        for th in ["ivd", "ivl", "vvd"]:
            # the way the settings switch does it
            await pg.evaluate(f"(()=>{{ const b=document.createElement('button'); b.dataset.action='set-theme'; b.dataset.theme='{th}'; document.body.appendChild(b); b.click(); b.remove(); }})()"); await pg.wait_for_timeout(1200)
            print(th, "via set-theme:", await pg.evaluate(q))
        await b.close()
asyncio.run(main())
