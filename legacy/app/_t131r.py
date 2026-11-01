# Parsec 13.1 — the RO list: no Complaint, truck beside the RO number, Next step, working tabs, header sort over the whole list,
# columns you drag, fields and your own columns from Display, the search behind an icon
import asyncio, os, sys, json
sys.argv = sys.argv[:2] if len(sys.argv) > 1 else ['x', 't12.html']
_src = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "_t127p.py")).read().split("async def main():")[0]
exec(_src)
OUT = os.path.join(H, "shots131"); os.makedirs(OUT, exist_ok=True)
Q = "[data-pg=rolist]"
HEAD = f"[...document.querySelectorAll('{Q} .rq-head .rq-hc .l')].map(x=>x.textContent)"
async def main():
    async with async_playwright() as p:
        b, pg, errs = await setup(p)
        await pg.evaluate("(()=>{ localStorage.removeItem('tec_viewas'); localStorage.removeItem('tec_out'); __tg.pxSignedIn(); __tg.UI().view='rolist'; __tg.render(); })()"); await pg.wait_for_timeout(900)
        h = await pg.evaluate(HEAD)
        ok(h == ["RO", "Customer", "Status", "Next step", "Stage", "Time", "Tech", "Spot", "Ready by", "Open"], f"the columns: no Complaint, a Status and a Next step ({h})")
        r = await pg.evaluate(f"(()=>{{ const c=document.querySelector('{Q} .rq-rows .rq-row .rq-k-ro'); return c ? [...c.children].map(x=>x.className.split(' ')[0]) : null; }})()")
        ok(r == ["rq-no", "rq-trk"], f"the truck picture sits right of the RO number ({r})")
        nx = await pg.evaluate(f"[...document.querySelectorAll('{Q} .rq-rows .rq-row .rq-nx')].slice(0,40).map(x=>[x.querySelector('.t').textContent, (x.querySelector('.w')||{{}}).textContent||''])")
        ok(len(nx) > 5 and all(x[0] for x in nx) and sum(1 for x in nx if x[1]) >= len(nx) // 2, f"every row has a next step, most with who has it ({nx[:4]})")
        hc = await pg.evaluate(f"[document.querySelectorAll('{Q} .rq-head > *').length, document.querySelector('{Q} .rq-rows .rq-row').children.length]")
        ok(hc[0] == hc[1], f"the header and the rows line up ({hc})")
        await pg.screenshot(path=os.path.join(OUT, "r1_list.png"))
        # the tabs
        tabs = await pg.evaluate(f"[...document.querySelectorAll('{Q} .rq-seg button')].map(b=>[b.dataset.g, +b.querySelector('span').textContent])")
        good = True; seen = []
        for g, n in tabs:
            await pg.click(f"{Q} .rq-seg button[data-g='{g}']"); await pg.wait_for_timeout(350)
            r = await pg.evaluate(f"[__tg.UI().rlGroup, document.querySelectorAll('{Q} .rq-rows .rq-row').length, document.querySelector('{Q} .rq-seg button.on').dataset.g]")
            seen.append([g, n, r[1]]); good = good and r[0] == g and r[2] == g and r[1] == n
        ok(good, f"the tabs work — each shows its own ROs ({seen})")
        await pg.click(f"{Q} .rq-seg button[data-g='waiting']"); await pg.wait_for_timeout(300)
        # click a header: the whole list, sorted
        await pg.click(f"{Q} .rq-hc[data-col=cust]"); await pg.wait_for_timeout(300)
        names = await pg.evaluate(f"[...document.querySelectorAll('{Q} .rq-rows .rq-row .rq-cu b')].map(x=>x.textContent)")
        bar = await pg.evaluate(f"(document.querySelector('{Q} .rq-sortbar')||{{}}).textContent||''")
        ok(names == sorted(names, key=str.lower) and len(names) > 2 and await pg.evaluate(f"document.querySelectorAll('{Q} .rq-grp').length") == 0 and "Customer" in bar, f"Customer A→Z over the whole list, groups folded ({names[:3]} · {bar[:40]})")
        await pg.click(f"{Q} .rq-hc[data-col=cust]"); await pg.wait_for_timeout(300)
        names2 = await pg.evaluate(f"[...document.querySelectorAll('{Q} .rq-rows .rq-row .rq-cu b')].map(x=>x.textContent)")
        ok(names2 == sorted(names, key=str.lower, reverse=True), "click again: Z→A")
        await pg.click(f"{Q} .rq-hc[data-col=cust]"); await pg.wait_for_timeout(300)
        ok(await pg.evaluate(f"!document.querySelector('{Q} .rq-sortbar')"), "a third click: back to how it was")
        await pg.click(f"{Q} .rq-seg button[data-g='all']"); await pg.wait_for_timeout(300)
        await pg.click(f"{Q} .rq-hc[data-col=days]"); await pg.wait_for_timeout(300)
        d = await pg.evaluate(f"[...document.querySelectorAll('{Q} .rq-rows .rq-row .rq-days')].map(x=>x.textContent)")
        dn = [0 if x == 'today' else int(x.rstrip('d')) if x != '—' else -1 for x in d]
        ok(dn == sorted(dn), f"Open sorts by the number of days ({dn[:6]})")
        await pg.click(f"{Q} .rq-hc[data-col=ro]"); await pg.wait_for_timeout(300)
        nos = await pg.evaluate(f"[...document.querySelectorAll('{Q} .rq-rows .rq-row .rq-no')].map(x=>x.textContent.trim())")
        ok([int(x) for x in nos] == sorted(int(x) for x in nos), f"RO sorts by number ({nos[:5]})")
        await pg.click(f"{Q} .rq-hc[data-col=next]"); await pg.wait_for_timeout(300)
        ok(await pg.evaluate(f"document.querySelector('{Q} .rq-hc.on').dataset.col") == "next", "Next step sorts too — most urgent first")
        await pg.screenshot(path=os.path.join(OUT, "r2_sorted.png"))
        await pg.click(f"{Q} [data-a=hsclr]"); await pg.wait_for_timeout(300)
        # drag a column: Next step before Customer
        await pg.evaluate(f"""(()=>{{ const R=document.querySelector('{Q}'), a=R.querySelector('.rq-hc[data-col=next]'), b=R.querySelector('.rq-hc[data-col=cust]'), dt=new DataTransfer(), br=b.getBoundingClientRect();
          a.dispatchEvent(new DragEvent('dragstart', {{bubbles:true, dataTransfer:dt}}));
          b.dispatchEvent(new DragEvent('dragover', {{bubbles:true, cancelable:true, dataTransfer:dt, clientX:br.left+3, clientY:br.top+5}}));
          b.dispatchEvent(new DragEvent('drop', {{bubbles:true, cancelable:true, dataTransfer:dt, clientX:br.left+3, clientY:br.top+5}}));
          a.dispatchEvent(new DragEvent('dragend', {{bubbles:true, dataTransfer:dt}})); }})()"""); await pg.wait_for_timeout(400)
        h = await pg.evaluate(HEAD)
        lay = await pg.evaluate("((__tg.STATE().rlLayout||{})['Admin']||{}).cols")
        ok(h[:3] == ["RO", "Next step", "Customer"] and lay and lay[1] == "next", f"dragging a header moves the column, and it's kept ({h[:4]})")
        hc = await pg.evaluate(f"[document.querySelectorAll('{Q} .rq-head > *').length, document.querySelector('{Q} .rq-rows .rq-row').children.length, document.querySelector('{Q} .rq-rows .rq-row .rq-k-next') && document.querySelector('{Q} .rq-rows .rq-row').children[2].classList.contains('rq-k-next')]")
        ok(hc[0] == hc[1] and hc[2], f"the rows follow the header ({hc})")
        # Display: hide, add a field, your own column
        await pg.click(f"{Q} [data-a=pop][data-p=disp]"); await pg.wait_for_timeout(300)
        await pg.screenshot(path=os.path.join(OUT, "r3_display.png"))
        await pg.click(f"{Q} .rq-disp [data-a=colx][data-k=spot]"); await pg.wait_for_timeout(250)
        await pg.click(f"{Q} .rq-disp [data-a=coladd][data-k=vin]"); await pg.wait_for_timeout(250)
        await pg.click(f"{Q} .rq-disp [data-a=coladd][data-k=cmp]"); await pg.wait_for_timeout(250)
        h = await pg.evaluate(HEAD)
        ok("Spot" not in h and h[-2:] == ["VIN", "Complaint"], f"hide Spot, add VIN and Complaint back ({h})")
        await pg.fill(f"{Q} .rq-cfnew input", "PO #"); await pg.keyboard.press("Enter"); await pg.wait_for_timeout(350)
        h = await pg.evaluate(HEAD); cf = await pg.evaluate("__tg.STATE().rlCustom")
        ok(h[-1] == "PO #" and cf and cf[0]["name"] == "PO #", f"your own column: PO # ({h[-3:]})")
        # drag inside Display's list: PO # to the top after RO
        await pg.evaluate(f"""(()=>{{ const R=document.querySelector('{Q}'), id=__tg.STATE().rlCustom[0].id, a=R.querySelector('.rq-coli[data-colk="c:'+id+'"]'), b=R.querySelector('.rq-coli[data-colk=next]'), dt=new DataTransfer(), br=b.getBoundingClientRect();
          a.dispatchEvent(new DragEvent('dragstart', {{bubbles:true, dataTransfer:dt}}));
          b.dispatchEvent(new DragEvent('dragover', {{bubbles:true, cancelable:true, dataTransfer:dt, clientX:br.left+5, clientY:br.top+3}}));
          b.dispatchEvent(new DragEvent('drop', {{bubbles:true, cancelable:true, dataTransfer:dt, clientX:br.left+5, clientY:br.top+3}})); }})()"""); await pg.wait_for_timeout(400)
        h = await pg.evaluate(HEAD)
        ok(h[1] == "PO #", f"dragging in Display moves it too ({h[:3]})")
        await pg.keyboard.press("Escape"); await pg.wait_for_timeout(200)
        # type into your own column
        rid = await pg.evaluate(f"document.querySelector('{Q} .rq-rows .rq-row').dataset.id")
        await pg.click(f"{Q} .rq-rows .rq-row[data-id='{rid}'] .rq-cf"); await pg.wait_for_timeout(300)
        await pg.keyboard.type("4471"); await pg.keyboard.press("Enter"); await pg.wait_for_timeout(300)
        v = await pg.evaluate(f"(()=>{{ const ro=__tg.STATE().ros.find(r=>r.id==='{rid}'), id=__tg.STATE().rlCustom[0].id; return [(ro.cf||{{}})[id], document.querySelector('{Q} .rq-rows .rq-row[data-id=\"{rid}\"] .rq-cf').textContent, __tg.UI().selectedRo]; }})()")
        ok(v[0] == "4471" and v[1] == "4471", f"click a cell, type, Enter — it's kept on the RO ({v})")
        await pg.click(f"{Q} .rq-rows .rq-row[data-id='{rid}'] .rq-cf"); await pg.wait_for_timeout(250)
        await pg.keyboard.press("Control+a"); await pg.keyboard.type("1200"); await pg.keyboard.press("Tab"); await pg.wait_for_timeout(300)
        r = await pg.evaluate(f"[document.activeElement && document.activeElement.classList.contains('rq-cfin'), document.activeElement && document.activeElement.dataset.id !== '{rid}']")
        ok(r == [True, True], f"Tab saves and moves to the next RO's cell ({r})")
        await pg.keyboard.type("880"); await pg.keyboard.press("Enter"); await pg.wait_for_timeout(300)
        cid = await pg.evaluate("'c:' + __tg.STATE().rlCustom[0].id")
        await pg.click(f"{Q} .rq-hc[data-col='{cid}']"); await pg.wait_for_timeout(300)
        pv = await pg.evaluate(f"[...document.querySelectorAll('{Q} .rq-rows .rq-row .rq-cf')].map(x=>x.textContent).slice(0,3)")
        ok(pv[:2] == ["880", "1200"], f"your own column sorts, numbers as numbers ({pv})")
        await pg.click(f"{Q} [data-a=hsclr]"); await pg.wait_for_timeout(200)
        await pg.screenshot(path=os.path.join(OUT, "r4_custom.png"))
        await pg.evaluate("__tg.undoLast()"); await pg.wait_for_timeout(300)
        # delete it
        await pg.click(f"{Q} [data-a=pop][data-p=disp]"); await pg.wait_for_timeout(250)
        await pg.click(f"{Q} .rq-disp [data-a=cfdel]"); await pg.wait_for_timeout(300)
        r = await pg.evaluate(f"[{HEAD}.includes('PO #'), (__tg.STATE().rlCustom||[]).length, __tg.STATE().ros.some(r=>r.cf && Object.keys(r.cf).length)]")
        ok(r == [False, 0, False], f"deleting your own column takes its values too ({r})")
        await pg.click(f"{Q} .rq-disp [data-a=colreset]"); await pg.wait_for_timeout(300)
        ok(await pg.evaluate(HEAD) == ["RO", "Customer", "Status", "Next step", "Stage", "Time", "Tech", "Spot", "Ready by", "Open"], "Back to the standard columns")
        await pg.keyboard.press("Escape")
        # the pane: the narrow columns step aside, the header still lines up
        await pg.click(f"{Q} .rq-rows .rq-row .rq-k-cust"); await pg.wait_for_timeout(500)
        h = await pg.evaluate(HEAD); hc = await pg.evaluate(f"[document.querySelectorAll('{Q} .rq-head > *').length, document.querySelector('{Q} .rq-rows .rq-row').children.length, !!document.querySelector('{Q} .rq-peek')]")
        ok(hc[2] and hc[0] == hc[1] and "Time" not in h and "Next step" in h, f"with the pane open: Stage, Time, Spot, Ready step aside, it lines up ({h})")
        await pg.screenshot(path=os.path.join(OUT, "r5_peek.png"))
        await pg.keyboard.press("Escape"); await pg.wait_for_timeout(200)
        # the search: an icon, a window
        r = await pg.evaluate(f"[!!document.querySelector('{Q} .rq-find input'), !!document.querySelector('{Q} [data-psm=rolist]')]")
        ok(r == [False, True], f"the search bar is an icon now ({r})")
        await pg.keyboard.press("/"); await pg.wait_for_timeout(300)
        n0 = await pg.evaluate(f"document.querySelectorAll('{Q} .rq-rows .rq-row').length")
        await pg.keyboard.type("Blue"); await pg.wait_for_timeout(500)
        n1 = await pg.evaluate(f"document.querySelectorAll('{Q} .rq-rows .rq-row').length")
        items = await pg.evaluate("[...document.querySelectorAll('.psm [data-psm-i], .psm .psm-r, .psm-it')].length")
        ok(await pg.evaluate("!!document.querySelector('.psm')") and 0 < n1 < n0, f"/ opens the window; typing filters the list behind ({n0} → {n1}, {items} results)")
        await pg.screenshot(path=os.path.join(OUT, "r6_search.png"))
        await pg.keyboard.press("Escape"); await pg.wait_for_timeout(300)
        ok(await pg.evaluate(f"[!document.querySelector('.psm'), __tg.UI().roFilter || '']") == [True, ""], "Esc clears it")
        ok(not errs, "no console errors: " + "; ".join(errs[:3]))
        await b.close()
        # phone: the card keeps its shape, with the next step
        b, pg, errs = await setup(p, 390, 844)
        await pg.evaluate("(()=>{ localStorage.removeItem('tec_viewas'); localStorage.removeItem('tec_out'); __tg.pxSignedIn(); __tg.UI().view='rolist'; __tg.render(); })()"); await pg.wait_for_timeout(900)
        r = await pg.evaluate(f"(()=>{{ const row=document.querySelector('{Q} .rq-rows .rq-row'); return row ? [!!row.querySelector('.rq-cmp .rq-nx'), document.documentElement.scrollWidth <= innerWidth + 1, !!row.querySelector('.rq-trk img, .rq-trk svg')] : null; }})()")
        ok(r == [True, True, True], f"phone: the card shows the next step, no sideways scroll ({r})")
        await pg.screenshot(path=os.path.join(OUT, "r7_phone.png"))
        ok(not errs, "phone: no console errors: " + "; ".join(errs[:3]))
        await b.close()
    print("\nFAILS:", len(FAILS), FAILS)
asyncio.run(main())
