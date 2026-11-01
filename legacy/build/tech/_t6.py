import asyncio, sys
from playwright.async_api import async_playwright
F="file:///mnt/user-data/outputs/Parsec%20Technician%20page%20mock-up.html"
PRE=sys.argv[1]
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(); x=await b.new_page(viewport={"width":1440,"height":900}); x.set_default_timeout(8000)
    await x.route("**/fonts.g*/**",lambda r:r.abort())
    await x.goto(F); await x.click('[data-lay="lanes"]'); await x.wait_for_timeout(200)
    await x.evaluate(PRE)
    await x.drag_and_drop('.cd[data-sel="37755"]','.ln[data-lane="work"]'); await x.wait_for_timeout(300)
    print(PRE[:40],"->",await x.evaluate("(document.querySelector('.toast')||{}).textContent||'none'"))
    await b.close()
asyncio.run(main())
