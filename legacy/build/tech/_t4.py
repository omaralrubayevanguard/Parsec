import asyncio
from playwright.async_api import async_playwright
F="file:///mnt/user-data/outputs/Parsec%20Technician%20page%20mock-up.html"
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(); x=await b.new_page(viewport={"width":1440,"height":900}); x.set_default_timeout(8000)
    await x.route("**/fonts.g*/**",lambda r:r.abort())
    await x.goto(F); await x.click('[data-lay="lanes"]'); await x.wait_for_timeout(200)
    a=await x.locator('.cd[data-sel="37755"]').bounding_box(); t=await x.locator('.ln[data-lane="work"]').bounding_box()
    await x.mouse.move(a["x"]+60,a["y"]+30); print("a",flush=True); await x.mouse.down(); print("down",flush=True)
    await x.mouse.move(a["x"]+80,a["y"]+40,steps=3)
    print("m1",flush=True); await x.mouse.move(t["x"]+100,t["y"]+60,steps=8); print("m2",flush=True); await x.mouse.up(); print("up",flush=True); await x.wait_for_timeout(300)
    print(await x.evaluate("(document.querySelector('.toast')||{}).textContent||'none'"))
    await b.close()
asyncio.run(main())
