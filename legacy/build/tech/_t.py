import asyncio, sys
from playwright.async_api import async_playwright
F="file:///mnt/user-data/outputs/Parsec%20Technician%20page%20mock-up.html"
S="build/tech/shots/"
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch()
    errs=[]
    async def pg(w,h):
      c=await b.new_context(viewport={"width":w,"height":h})
      x=await c.new_page()
      x.on("pageerror",lambda e:errs.append(str(e)))
      x.on("console",lambda m: errs.append(m.text) if m.type=="error" else None)
      await x.route("**/fonts.g*/**",lambda r:r.abort())
      await x.goto(F); await x.wait_for_timeout(400)
      return x
    x=await pg(1440,900)
    await x.screenshot(path=S+"list.png")
    for lay in ["lanes","today"]:
      await x.click(f'[data-lay="{lay}"]'); await x.wait_for_timeout(250)
      await x.screenshot(path=S+lay+".png")
    await x.click('[data-lay="list"]'); await x.wait_for_timeout(200)
    for th in ["graphite","white","black"]:
      await x.click(f'.mk [data-th="{th}"]'); await x.wait_for_timeout(150)
      await x.screenshot(path=S+"list_"+th+".png")
    await x.click('.mk [data-th="ivory"]')
    await x.click('[data-view="fore"]'); await x.wait_for_timeout(200)
    await x.screenshot(path=S+"fore.png")
    await x.click('[data-view="tech"]')
    await x.click('#srct'); await x.wait_for_timeout(150)
    await x.screenshot(path=S+"src.png")
    await x.click('#srct')
    await x.click('#pk-open'); await x.wait_for_timeout(200)
    await x.screenshot(path=S+"picks.png")
    print("ERRS",errs)
    m=await pg(390,844)
    await m.screenshot(path=S+"m_list.png",full_page=False)
    for lay in ["lanes","today"]:
      await m.click(f'[data-lay="{lay}"]'); await m.wait_for_timeout(250)
      await m.screenshot(path=S+"m_"+lay+".png")
    sw=await m.evaluate("document.documentElement.scrollWidth")
    print("phone scrollWidth",sw)
    print("ERRS",errs)
    await b.close()
asyncio.run(main())
