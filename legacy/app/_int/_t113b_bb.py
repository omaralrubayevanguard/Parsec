import asyncio, os, sys
from playwright.async_api import async_playwright
H = "/tmp/claude-0/-home-claude/febe01e4-e12e-554d-9dc2-ccfd769708e9/scratchpad/app"; OUT = os.path.join(H, "shots113"); os.makedirs(OUT, exist_ok=True)
SR = "document.querySelector('.jc-host') && document.querySelector('.jc-host').shadowRoot"
async def run(p, w, h, tag):
    b = await p.chromium.launch(); ctx = await b.new_context(viewport={"width":w,"height":h}, is_mobile=w < 600, has_touch=w < 600); pg = await ctx.new_page(); pg.set_default_timeout(6000); errs=[]
    pg.on("pageerror", lambda e: errs.append(str(e)[:300]))
    pg.on("console", lambda m: errs.append("console: " + m.text[:200]) if m.type == "error" and "ERR_" not in m.text and "Failed to load resource" not in m.text else None)
    await pg.route("**/fonts.g*/**", lambda r: r.abort())
    if w < 600: await pg.add_init_script("try{ localStorage.setItem('tec_device','phone'); }catch(e){}")
    await pg.goto("file://" + H + "/t12_bb.html"); await pg.wait_for_timeout(1200)
    await pg.evaluate("__tg.loadSample25()"); await pg.evaluate("__tg.ensureDemoTeam()"); await pg.wait_for_timeout(300)
    if w >= 600:
        await pg.evaluate("__tg.PG.go('foreman')"); await pg.wait_for_timeout(500)
        await pg.evaluate("(()=>{ const n=[...document.querySelectorAll('.tg-it')].find(x=>x.querySelector('.tg-no')); if(n) n.click(); })()"); await pg.wait_for_timeout(500)
        print(tag, "foreman top:", await pg.evaluate("(document.querySelector('.tg-top .tg-no')||{}).textContent"))
        await pg.screenshot(path=os.path.join(OUT, f"{tag}_foreman_sel.png"))
        await pg.evaluate("__tg.PG.go('triage')"); await pg.wait_for_timeout(500)
        await pg.evaluate("(()=>{ const n=[...document.querySelectorAll('.tg-it')].find(x=>x.querySelector('.tg-no')); if(n) n.click(); })()"); await pg.wait_for_timeout(500)
        print(tag, "triage dock:", await pg.evaluate("(document.querySelector('.tg-dkh .tg-no, .tg-top .tg-no')||{}).textContent"))
        await pg.screenshot(path=os.path.join(OUT, f"{tag}_triage_sel.png"))
        # search palette
        await pg.keyboard.press("Control+k"); await pg.wait_for_timeout(300)
        r = await pg.evaluate("__tg.STATE().ros.find(x=>!x.shop && x.id!=='shop').roNumber")
        await pg.keyboard.type(r[-4:]); await pg.wait_for_timeout(400)
        print(tag, "search by last 4", r[-4:], ":", await pg.evaluate("[...document.querySelectorAll('.pal-sub')].slice(0,3).map(x=>x.textContent).join(' | ')"))
        await pg.screenshot(path=os.path.join(OUT, f"{tag}_search.png"))
        await pg.keyboard.press("Escape"); await pg.wait_for_timeout(200)
    # the tech page as the admin
    await pg.evaluate("__tg.PG.go('tech')"); await pg.wait_for_timeout(700)
    await pg.screenshot(path=os.path.join(OUT, f"{tag}_tech_admin.png"))
    print(tag, "tech head:", await pg.evaluate("(document.querySelector('[data-pg=tech] .tg-head')||{}).textContent"), "| list title:", await pg.evaluate("(document.querySelector('[data-pg=tech] .tg-lh')||{}).textContent"))
    if w >= 600:
        await pg.click('[data-pg="tech"] .tch-as'); await pg.wait_for_timeout(300); await pg.screenshot(path=os.path.join(OUT, f"{tag}_picker.png")); await pg.keyboard.press("Escape")
    # the RO page and its header
    rid = await pg.evaluate("__tg.STATE().ros.find(x=>!x.shop && x.id!=='shop').id")
    await pg.evaluate(f"(()=>{{ const U=__tg.UI(); U.view='ros'; U.selectedRo='{rid}'; __tg.render(); }})()"); await pg.wait_for_timeout(900)
    await pg.screenshot(path=os.path.join(OUT, f"{tag}_ropage.png"))
    n = await pg.evaluate(f"(()=>{{ const R={SR}; if(!R) return -1; const L=[...R.querySelectorAll('.px-totals .px-total')]; const b=L.find(x=>/Activity/.test(x.getAttribute('aria-label')||'')); if(!b) return 0; b.click(); return L.length; }})()"); await pg.wait_for_timeout(600)
    print(tag, "totals:", n, "modal:", await pg.evaluate(f"(()=>{{ const R={SR}; return !!(R && R.querySelector('.px-modal')); }})()"))
    st = await pg.evaluate(f"(()=>{{ const R={SR}; const i=R && R.querySelector('.px-modal .px-composer__in'); if(!i) return null; i.focus(); const c=getComputedStyle(i); return [c.outlineStyle, c.outlineWidth, c.boxShadow, c.borderTopWidth, c.backgroundColor].join(' / '); }})()")
    print(tag, "composer input style:", st)
    await pg.screenshot(path=os.path.join(OUT, f"{tag}_activity.png"))
    print(tag, "ERRORS", errs[:6]); await b.close()
async def main():
    async with async_playwright() as p:
        await run(p, 1440, 900, "d")
        await run(p, 390, 844, "ph")
asyncio.run(main())
