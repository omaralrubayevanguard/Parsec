import asyncio, json
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); ctx = await b.new_context(viewport={"width": 390, "height": 844}, is_mobile=True, has_touch=True)
        pg = await ctx.new_page(); await pg.goto("file:///mnt/user-data/outputs/Parsec%20Mobile.html"); await pg.wait_for_timeout(400)
        await pg.click("text=Try it with sample ROs"); await pg.wait_for_timeout(300)
        await pg.click(".pm-play >> nth=0"); await pg.wait_for_timeout(300)
        snap = lambda: pg.evaluate("(() => { const a = document.getElementById('app').cloneNode(true); a.querySelector('#toast').innerHTML=''; a.querySelectorAll('[id]').forEach(e => e.removeAttribute('id')); return a.outerHTML; })()")
        out = {}
        await pg.evaluate("document.getElementById('toast').innerHTML=''"); out["today"] = await snap()
        await pg.click(".pm-job >> nth=0"); await pg.wait_for_timeout(300)
        await pg.click(".pm-back"); await pg.wait_for_timeout(300); out["ro"] = await snap()
        await pg.click(".pm-op >> nth=0"); await pg.wait_for_timeout(300); out["op"] = await snap()
        await pg.click("[data-act=part] >> nth=0"); await pg.wait_for_timeout(400); out["sheet"] = await snap()
        await pg.keyboard.press("Escape"); await pg.wait_for_timeout(300)
        await pg.goto("file:///mnt/user-data/outputs/Parsec%20Mobile.html#/sync"); await pg.wait_for_timeout(600); await pg.click("[data-act=forcesend]"); await pg.wait_for_timeout(1200)
        out["sync"] = await pg.evaluate("(() => { const c = document.querySelector('[data-qr]'); const url = c ? c.toDataURL() : ''; const a = document.getElementById('app').cloneNode(true); a.querySelector('#toast').innerHTML=''; const cc = a.querySelector('[data-qr]'); if (cc) { const img = document.createElement('img'); img.src = url; img.style.cssText = 'width:100%;height:100%;image-rendering:pixelated'; cc.replaceWith(img); } a.querySelectorAll('[id]').forEach(e => e.removeAttribute('id')); return a.outerHTML; })()")
        await pg.goto("file:///mnt/user-data/outputs/Parsec%20Mobile.html#/today"); await pg.wait_for_timeout(500)
        await pg.evaluate("document.getElementById('toast').innerHTML=''"); out["bay"] = (await snap()).replace('class="app"', 'class="app is-bay"', 1)
        json.dump(out, open("snaps.json", "w")); print({k: len(v) for k, v in out.items()})
        await b.close()
asyncio.run(main())
