import asyncio
from playwright.async_api import async_playwright
F="file:///mnt/user-data/outputs/Parsec%20Technician%20page%20mock-up.html"; S="build/tech/shots/"
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(); x=await b.new_page(viewport={"width":1440,"height":900}); x.set_default_timeout(6000)
    await x.route("**/fonts.g*/**",lambda r:r.abort()); await x.goto(F)
    await x.click('#srct')
    for l in ["list","lanes","today"]:
      await x.click(f'[data-lay="{l}"]'); await x.wait_for_timeout(200); await x.screenshot(path=S+"s_"+l+".png")
    await x.click('#srct'); await x.click('.mk [data-th="graphite"]'); await x.wait_for_timeout(150); await x.screenshot(path=S+"today_graphite.png")
    m=await b.new_page(viewport={"width":390,"height":844}); await m.route("**/fonts.g*/**",lambda r:r.abort()); await m.goto(F)
    await m.click('[data-sel="37628"]'); await m.wait_for_timeout(250); await m.screenshot(path=S+"m_pane.png", full_page=True)
    await b.close()
asyncio.run(main())
