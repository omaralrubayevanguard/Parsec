import asyncio, sys
from playwright.async_api import async_playwright
WHO=sys.argv[1] if len(sys.argv)>1 else 'Mike Rodriguez'
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(); pg=await (await b.new_context(viewport={"width":1440,"height":900})).new_page(); errs=[]
        pg.on("pageerror",lambda e:errs.append(str(e)))
        await pg.goto("file:///tmp/claude-0/-home-claude/febe01e4-e12e-554d-9dc2-ccfd769708e9/scratchpad/app/Parsec_7.html"); await pg.wait_for_timeout(2500)
        await pg.click('text=Load samples'); await pg.wait_for_timeout(1200)
        await pg.evaluate("""(w)=>{ const b=[...document.querySelectorAll('button')].find(x=>x.innerText.startsWith(w)); b.click(); }""", WHO); await pg.wait_for_timeout(1200)
        await pg.evaluate("""()=>{ const b=document.querySelector('[data-action=nav][data-view=console]'); b&&b.click(); }"""); await pg.wait_for_timeout(1500)
        tag=WHO.split()[0].lower()
        await pg.screenshot(path=f"build/ptshots/cx_real_{tag}.png")
        await pg.screenshot(path=f"build/ptshots/cx_real_{tag}_full.png", full_page=True)
        print(await pg.evaluate("document.documentElement.scrollHeight"))
        print(errs[:5]); await b.close()
asyncio.run(main())
