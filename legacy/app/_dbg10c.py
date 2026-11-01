import asyncio, os
from playwright.async_api import async_playwright
H = os.path.dirname(os.path.abspath(__file__))
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await (await b.new_context(viewport={"width":1440,"height":900})).new_page()
        await pg.goto("file://" + H + "/t10.html"); await pg.wait_for_timeout(1200)
        await pg.evaluate("__tg.loadSample25()"); await pg.wait_for_timeout(300)
        await pg.evaluate("(()=>{ const U=__tg.UI(); U.view='foreman'; __tg.render(); })()"); await pg.wait_for_timeout(600)
        await pg.click("[data-v10=hand]"); await pg.wait_for_timeout(300)
        cdp = await pg.context.new_cdp_session(pg)
        await cdp.send("DOM.enable"); await cdp.send("CSS.enable")
        doc = await cdp.send("DOM.getDocument", {"depth": -1})
        nid = (await cdp.send("DOM.querySelector", {"nodeId": doc["root"]["nodeId"], "selector": "#v10-ho h2"}))["nodeId"]
        m = await cdp.send("CSS.getMatchedStylesForNode", {"nodeId": nid})
        for r in m["matchedCSSRules"]:
            rule = r["rule"]; props = [ (p["name"], p.get("value"), p.get("important")) for p in rule["style"]["cssProperties"] if "font" in p["name"]]
            if props: print(rule["selectorList"]["text"][:150], props[:4])
        await b.close()
asyncio.run(main())
