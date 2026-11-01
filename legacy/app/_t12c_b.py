import asyncio, os, json
from playwright.async_api import async_playwright
H = os.path.dirname(os.path.abspath(__file__)); OUT = os.path.join(H, "shots12c")
FX = lambda n: open(os.path.join(H, "imptest", n), encoding="utf-8").read()
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); fails = []
        for w, h, tag in [(1440, 900, "d"), (390, 844, "ph")]:
            ctx = await b.new_context(viewport={"width": w, "height": h}, is_mobile=w < 600, has_touch=w < 600); pg = await ctx.new_page(); errs = []
            pg.on("pageerror", lambda e: errs.append(str(e)[:300]))
            pg.on("console", lambda m: errs.append("console: " + m.text[:200]) if m.type == "error" and "ERR_" not in m.text and "Failed to load resource" not in m.text else None)
            await pg.route("**/fonts.g*/**", lambda r: r.abort())
            if w < 600: await pg.add_init_script("try{ localStorage.setItem('tec_device','phone'); }catch(e){}")
            await pg.goto("file://" + H + "/t12c.html"); await pg.wait_for_timeout(1200)
            await pg.evaluate("__tg.loadSample25()"); await pg.evaluate("__tg.ensureDemoTeam()"); await pg.wait_for_timeout(200)
            # a stand-in reader: each "screenshot" reads as one of the fixtures
            await pg.evaluate("(T => { let i = 0; __tg.IMPX.reader(files => new Promise(r => setTimeout(() => r(T[i++ % T.length]), 300))); })" + "(" + json.dumps([FX("shot_op1.txt"), FX("shot_parts.txt"), FX("shot_notes.txt"), FX("case3_vertical.txt")]) + ")")
            await pg.evaluate("__tg.IMPX.open({})"); await pg.wait_for_timeout(200)
            await pg.evaluate("(() => { const mk = n => new File([new Uint8Array([137,80,78,71])], n, { type: 'image/png' }); __tg.IMPX.read([mk('a.png'), mk('b.png'), mk('c.png'), mk('d.png')]); })()")
            await pg.wait_for_timeout(350)
            busy = await pg.evaluate("(document.querySelector('#imp-dlg .imp-status')||{}).textContent")
            await pg.wait_for_timeout(1800)
            st = await pg.evaluate("(() => { const D = __tg.IMPX.state(); return { busy: D.busy, pieces: D.pieces.map(p => p.name + ': ' + p.what), ops: D.acc.ops.length, loose: D.acc.parts.length, notes: D.acc.notes.length, f: D.acc.f.roNumber, newMode: D.new }; })()")
            print(tag, "busy while reading:", busy); print(tag, "after 4 shots:", json.dumps(st))
            if not (st["pieces"] and len(st["pieces"]) == 4 and st["ops"] == 1 and st["loose"] == 2 and st["notes"] == 2): fails.append(tag + " shots")
            lp = await pg.evaluate("(document.querySelector('#imp-dlg .ix-lp')||{}).textContent||''"); print(tag, "loose parts line:", lp[:120])
            await pg.screenshot(path=os.path.join(OUT, tag + "_6shots.png"))
            # take one piece out → merged again without it
            await pg.evaluate("document.querySelector('#imp-dlg [data-ix=rmpc][data-i=\"2\"]').click()"); await pg.wait_for_timeout(200)
            n2 = await pg.evaluate("__tg.IMPX.state().acc.notes.length"); print(tag, "notes after taking the notes shot out:", n2)
            if n2 != 0: fails.append(tag + " remove piece")
            await pg.evaluate("__tg.IMPX.close()")
            if w < 600:
                # the phone's paste box
                await pg.evaluate("__tg.IMPX.open({})"); await pg.wait_for_timeout(200)
                has = await pg.evaluate("!!document.querySelector('#imp-dlg [data-ix-paste]')"); print(tag, "paste box:", has)
                await pg.evaluate("(t => { const z = document.querySelector('#imp-dlg [data-ix-paste]'); z.focus(); const dt = new DataTransfer(); dt.setData('text/plain', t); z.dispatchEvent(new ClipboardEvent('paste', { clipboardData: dt, bubbles: true, cancelable: true })); })" + "(" + json.dumps(FX("case1.txt")) + ")")
                await pg.wait_for_timeout(300)
                pc = await pg.evaluate("__tg.IMPX.state().pieces.length"); print(tag, "pieces from the paste box:", pc)
                if not has or pc != 1: fails.append(tag + " phone paste box")
                await pg.evaluate("document.querySelector('#imp-dlg .ix-b').scrollTop = 99999"); await pg.wait_for_timeout(150)
                await pg.screenshot(path=os.path.join(OUT, tag + "_7footer.png"))
                ft = await pg.evaluate("(() => { const f = document.querySelector('#imp-dlg .ix-df').getBoundingClientRect(); return [Math.round(f.top), Math.round(f.bottom), innerHeight]; })()"); print(tag, "footer box:", ft)
            # the old New RO paths all land here
            await pg.evaluate("__tg.IMPX.close(); const U = __tg.UI(); U.modal = { type: 'add-ro' }; __tg.render();"); await pg.wait_for_timeout(300)
            o = await pg.evaluate("[!!document.getElementById('imp-dlg'), (__tg.UI().modal||{}).type || null]"); print(tag, "old add-ro modal → import:", o)
            if not o[0] or o[1]: fails.append(tag + " old modal routed")
            await pg.evaluate("__tg.IMPX.close()")
            if w >= 600:
                await pg.mouse.click(700, 400); await pg.keyboard.press("n"); await pg.wait_for_timeout(300)
                print(tag, "N key opens it:", await pg.evaluate("!!document.getElementById('imp-dlg')")); await pg.keyboard.press("Escape")
                await pg.evaluate("__tg.PG.go('rolist')"); await pg.wait_for_timeout(400)
                nb = await pg.evaluate("(() => { const b = document.querySelector('[data-action=open-add-ro]'); if(!b) return 'no button'; b.click(); return !!document.getElementById('imp-dlg'); })()"); print(tag, "RO list New RO:", nb); await pg.keyboard.press("Escape")
            print(tag, "ERRORS", errs[:6])
            if errs: fails.append(tag + " errors")
            await ctx.close()
        print("FAILS", fails); await b.close()
asyncio.run(main())
