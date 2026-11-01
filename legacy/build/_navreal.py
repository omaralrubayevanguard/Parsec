import asyncio
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(); pg=await (await b.new_context(viewport={"width":1440,"height":900})).new_page(); errs=[]
        pg.on("pageerror",lambda e:errs.append(str(e)))
        await pg.goto("file:///tmp/claude-0/-home-claude/febe01e4-e12e-554d-9dc2-ccfd769708e9/scratchpad/app/Parsec_7.html"); await pg.wait_for_timeout(2500)
        await pg.click('text=Load samples'); await pg.wait_for_timeout(1200)
        await pg.evaluate("""()=>{ const b=[...document.querySelectorAll('button')].find(x=>x.innerText.startsWith('Mike Rodriguez')); b.click(); }"""); await pg.wait_for_timeout(1200)
        await pg.evaluate("""()=>{ const b=document.querySelector('[data-action=nav][data-view=console]'); b&&b.click(); }"""); await pg.wait_for_timeout(1000)
        await pg.screenshot(path="build/ptshots/nav_real_open.png", clip={"x":0,"y":0,"width":480,"height":900})
        # settings popover
        s=await pg.evaluate("""()=>{ const b=[...document.querySelectorAll('button,a')].find(x=>x.innerText.trim().startsWith('Settings')); if(!b) return 'none'; b.click(); return b.outerHTML.slice(0,300); }""")
        print(s); await pg.wait_for_timeout(800)
        await pg.screenshot(path="build/ptshots/nav_real_settings.png")
        await pg.keyboard.press('Escape'); await pg.wait_for_timeout(300)
        # user chip
        u=await pg.evaluate("""()=>{ const b=[...document.querySelectorAll('button,a,div')].filter(x=>x.innerText&&x.innerText.trim().startsWith('Mike Rodriguez\\nTechnician')).pop(); if(!b) return 'none'; b.click(); return b.outerHTML.slice(0,300); }""")
        print(u); await pg.wait_for_timeout(800)
        await pg.screenshot(path="build/ptshots/nav_real_user.png")
        await pg.keyboard.press('Escape'); await pg.wait_for_timeout(300)
        # collapse sidebar
        c=await pg.evaluate("""()=>{ const b=document.querySelector('[data-action*=sidebar], [title*=sidebar i], [aria-label*=sidebar i]'); if(!b) return 'none'; b.click(); return b.outerHTML.slice(0,200); }""")
        print(c); await pg.wait_for_timeout(800)
        await pg.screenshot(path="build/ptshots/nav_real_closed.png", clip={"x":0,"y":0,"width":480,"height":900})
        print(errs[:5]); await b.close()
asyncio.run(main())
