import asyncio, sys, os, json
from playwright.async_api import async_playwright
H = os.path.dirname(os.path.abspath(__file__))
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); ctx = await b.new_context(viewport={"width": 1440, "height": 900}); pg = await ctx.new_page()
        await pg.goto("file://" + H + "/t4.html"); await pg.wait_for_timeout(1500)
        await pg.evaluate("__tg.applyTheme('ivl')"); await pg.evaluate("__tg.sample()"); await pg.wait_for_timeout(400)
        await pg.evaluate("(()=>{const U=__tg.UI(); U.view='triage'; U.modal=null; __tg.render();})()"); await pg.wait_for_timeout(500)
        s = await ctx.new_cdp_session(pg)
        await s.send("DOM.enable"); await s.send("CSS.enable")
        doc = await s.send("DOM.getDocument")
        n = await s.send("DOM.querySelector", {"nodeId": doc["root"]["nodeId"], "selector": sys.argv[1]})
        m = await s.send("CSS.getMatchedStylesForNode", {"nodeId": n["nodeId"]})
        for r in m["matchedCSSRules"]:
            props = [x for x in r["rule"]["style"]["cssProperties"] if x["name"] in sys.argv[2].split(",")]
            if props: print(r["rule"]["selectorList"]["text"][:160], [(x["name"], x["value"], x.get("important")) for x in props])
        await b.close()
asyncio.run(main())
