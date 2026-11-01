# r9_crawl.py page role [maxClicks] — click every distinct [data-a] control on a page module (fresh page state each round), report errors
import asyncio, sys, os, json
from playwright.async_api import async_playwright
H = os.path.dirname(os.path.abspath(__file__))
page, role = sys.argv[1], sys.argv[2]; MAX = int(sys.argv[3]) if len(sys.argv) > 3 else 400
SKIP = set((os.environ.get("SKIP", "print,repprint,csv,alcsv,viewas,viewas-set,px-profile,signout,logout,export,dl,download")).split(","))
JS_LIST = """(()=>{ const root=document.querySelector('[data-pg]'); if(!root) return []; const seen=new Set(), out=[];
  document.querySelectorAll('[data-pg] [data-a], .tg-pop [data-a], #pg-pop [data-a]').forEach(el=>{ const r=el.getBoundingClientRect(); if(!r.width||!r.height) return;
    const a=el.dataset.a; const key=a+'|'+Object.entries(el.dataset).filter(([k])=>k!=='tip').map(([k,v])=>k+'='+v).join('&'); if(seen.has(key)) return; seen.add(key);
    out.push({a, key, sel: Object.entries(el.dataset).filter(([k])=>k!=='tip'&&!/\\s/.test(String(el.dataset[k]))&&String(el.dataset[k]).length<60&&!/["'\\]\\\\]/.test(el.dataset[k])).map(([k,v])=>'[data-'+k.replace(/[A-Z]/g,m=>'-'+m.toLowerCase())+'="'+v+'"]').join(''), tag: el.tagName, txt: (el.innerText||'').trim().slice(0,30)}); });
  return out; })()"""
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); ctx = await b.new_context(viewport={"width": 1440, "height": 900}); pg = await ctx.new_page(); errs = []
        pg.on("pageerror", lambda e: errs.append("PAGEERR " + str(e) + " | " + (e.stack or "").split("\n")[1][:200] if e.stack else str(e)))
        pg.on("console", lambda m: errs.append("CONSOLE " + m.text[:300]) if m.type == "error" and "net::" not in m.text and "Failed to load resource" not in m.text else None)
        pg.on("dialog", lambda d: asyncio.ensure_future(d.dismiss()))
        await pg.goto("file://" + H + "/t9.html"); await pg.wait_for_timeout(900)
        await pg.evaluate("__tg.loadSample25()"); await pg.evaluate("__tg.ensureDemoTeam()")
        await pg.evaluate("window.print=()=>{}; window.open=()=>null; URL.createObjectURL=()=>'blob:x';")
        if role == "admin": await pg.evaluate("(()=>{ localStorage.removeItem('tec_viewas'); __tg.pxSignedIn(); __tg.render(); })()")
        else: await pg.evaluate(f"(()=>{{ const s=__tg.staffList().find(x=>x.role==={role!r}); localStorage.setItem('tec_viewas', s.id); __tg.pxSignedIn(); __tg.render(); }})()")
        go = f"(()=>{{ const U=__tg.UI(); U.view='{page}'; U.modal=null; __tg.render(); }})()"
        await pg.evaluate(go); await pg.wait_for_timeout(300)
        done = set(); clicks = 0; bad = []; left = True
        PRE = [x for x in os.environ.get("PRE", "").split(";;") if x]
        async def prelude():
            await pg.keyboard.press("Escape"); await pg.evaluate(go); await pg.wait_for_timeout(200)
            for c in PRE:
                try: await pg.click(c, timeout=1500); await pg.wait_for_timeout(150)
                except Exception: pass
        await prelude(); stuck = 0
        while clicks < MAX:
            if await pg.evaluate("__tg.UI().view") != page or await pg.evaluate("!!__tg.UI().modal"):
                await prelude()
            items = await pg.evaluate(JS_LIST)
            if not [it for it in items if it["key"] not in done and it["a"] not in SKIP]:
                stuck += 1
                if stuck > 1: break
                await prelude(); continue
            stuck = 0
            for it in items:
                if it["key"] in done or it["a"] in SKIP: continue
                done.add(it["key"]); left = True; clicks += 1
                try:
                    loc = pg.locator(("[data-pg] " if not it["sel"].startswith("[data-a") or True else "") + it["sel"]).first if it["sel"] else None
                    if loc is None: continue
                    await loc.click(timeout=1500); await pg.wait_for_timeout(120)
                except Exception as ex:
                    msg = str(ex).split("\n")[0][:140]
                    if "intercepts pointer" in str(ex) or "not visible" in msg or "Timeout" in msg: pass
                    else: bad.append(("click", it["key"], msg))
                if errs: bad.append((it["key"], it["txt"], errs[:2])); errs.clear()
                break
        await pg.keyboard.press("Escape")
        print(f"{page} as {role}: {clicks} controls clicked, {len(bad)} problems")
        for x in bad[:40]: print("  ", json.dumps(x, ensure_ascii=False)[:500])
        await b.close()
asyncio.run(main())
