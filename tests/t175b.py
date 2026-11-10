# Parsec 17.5 (B) — change the day clock on any day (Time Log): click a clock in / out time → a pop-over with the typed time,
# suggested times and a time wheel; a reason is always picked; a punch the new time leaves outside is trimmed in the same
# step (or the change is blocked when it can't be); the row shows the old time struck through and an "edited" tag; drag the
# OUT flag on the day bar; the row's ⋯ deletes a clock segment (asks first, Undo brings it back). Invented data only.
import asyncio, os, sys
from playwright.async_api import async_playwright
H = os.path.dirname(os.path.abspath(__file__))
PAGE = sys.argv[1] if len(sys.argv) > 1 else "t12.html"
FAILS = []
def ok(c, m):
    print(("ok   " if c else "FAIL ") + m)
    if not c: FAILS.append(m)
T = "[data-pg=timelog] "
PREP = """(() => { const S = __tg.STATE(), me = __tg.staffList().find(s => s.role === 'Foreman'); localStorage.setItem('tec_viewas', me.id); localStorage.removeItem('tec_out'); __tg.pxSignedIn();
  const d = new Date(); d.setDate(d.getDate() - 2); const k = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  const at = hm => new Date(k + 'T' + hm + ':00').toISOString(), day = x => x && new Date(x).toDateString() === d.toDateString();
  S.shifts = (S.shifts || []).filter(s => !day(s.in)); S.punches = S.punches.filter(p => !day(p.start));
  const ro = S.ros.find(r => !r.shop && r.operations.length);
  S.shifts.push({ id: 'sh_t', in: at('07:12'), out: at('15:31'), by: me.name });
  S.punches.push({ id: 'pn_t', roId: ro.id, opId: ro.operations[0].id, start: at('07:20'), stop: at('15:20'), startReason: 'Repairing', stopReason: 'Hold Tech', notes: 'x', by: me.name });
  const U = __tg.UI(); U.view = 'timelog'; __tg.render(); const L = __tg.TL.U(); L.who = me.name; L.view = 'day'; L.day = k; L.pop = null; __tg.render(); return [me.name, k]; })()"""
SH = "(() => { const s = __tg.STATE().shifts.find(s => s.id === 'sh_t'); return s ? [new Date(s.in).toTimeString().slice(0, 5), s.out && new Date(s.out).toTimeString().slice(0, 5), !!s.originalIn, !!s.originalOut, s.editWhy || ''] : null; })()"
PN = "(() => { const p = __tg.STATE().punches.find(p => p.id === 'pn_t'); return [new Date(p.stop).toTimeString().slice(0, 5), !!p.edited]; })()"
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await (await b.new_context(viewport={"width": 1440, "height": 1000})).new_page(); errs = []
        pg.on("pageerror", lambda e: errs.append(str(e)[:300]))
        await pg.route("**/fonts.g*/**", lambda r: r.abort())
        await pg.goto("file://" + os.path.join(H, PAGE)); await pg.wait_for_timeout(1200)
        await pg.evaluate("__tg.loadSample25()"); await pg.evaluate("__tg.ensureDemoTeam && __tg.ensureDemoTeam()"); await pg.wait_for_timeout(300)
        me, k = await pg.evaluate(PREP); await pg.wait_for_timeout(500)
        rows = await pg.evaluate(f"[...document.querySelectorAll('{T}.tk-r.edge')].map(r => [!!r.querySelector('.tk-tmb'), !!r.querySelector('.tk-shm'), r.querySelector('.tm').textContent])")
        ok(len(rows) == 2 and all(r[0] and r[1] for r in rows) and rows[0][2] == "07:12" and rows[1][2] == "15:31", "Clocked in and Clocked out: the time is a button, with ⋯ (%s)" % rows)
        # clock in: the wheel, a reason, Save
        await pg.click(f"{T}.tk-r.edge .tk-tmb[data-edge=in]"); await pg.wait_for_timeout(300)
        pp = await pg.evaluate(f"(() => {{ const p = document.querySelector('{T}.tg-pop.tk-ce'); return p ? [p.querySelectorAll('.tk-whc').length, [...p.querySelectorAll('.tk-sug .tg-chip')].map(x => x.textContent), p.querySelector('[data-a=shedgo]').disabled] : null; }})()")
        ok(pp and pp[0] == 2 and any("First punch · 07:20" in x for x in pp[1]) and pp[2] is True, "the pop-over: suggestions and a time wheel; Save waits (%s)" % pp)
        await pg.click(f"{T}.tk-whc:first-child .tk-whi[data-m='{6 * 60 + 12}']"); await pg.wait_for_timeout(200)
        await pg.click(f"{T}.tk-whc:last-child .tk-whi[data-m='{6 * 60 + 55}']"); await pg.wait_for_timeout(200)
        v = await pg.evaluate(f"document.querySelector('{T}.tg-pop [data-in=shed]').value")
        dis = await pg.evaluate(f"document.querySelector('{T}.tg-pop [data-a=shedgo]').disabled")
        ok(v == "06:55" and dis, "the wheel sets 06 then 55 → 06:55; Save still waits for a reason (%s, %s)" % (v, dis))
        await pg.click(f"{T}.tg-pop .tk-why .tg-chip >> nth=1"); await pg.wait_for_timeout(200)
        await pg.click(f"{T}.tg-pop [data-a=shedgo]"); await pg.wait_for_timeout(400)
        s1 = await pg.evaluate(SH)
        ok(s1[0] == "06:55" and s1[2] and s1[4], "Save changes the clock in, keeps the time before and the reason (%s)" % s1)
        mk = await pg.evaluate(f"(() => {{ const r = document.querySelector('{T}.tk-r.edge'); return [r.querySelector('.tm').textContent, (r.querySelector('.tk-was0') || {{}}).textContent, (r.querySelector('.tk-ed') || {{}}).textContent]; }})()")
        ok(mk == ["06:55", "07:12", "edited"], "the row: the new time, the old one struck through, an “edited” tag (%s)" % mk)
        # clock out before the punch stops → trimmed in the same step
        await pg.click(f"{T}.tk-r.edge .tk-tmb[data-edge=out]"); await pg.wait_for_timeout(300)
        await pg.evaluate(f"document.querySelector('{T}.tk-whc:last-child .tk-whi[data-m=\"{15 * 60}\"]').click()"); await pg.wait_for_timeout(250)
        tr = await pg.evaluate(f"(() => {{ const p = document.querySelector('{T}.tg-pop'); return [(p.querySelector('.tk-cetrim') || {{}}).textContent || '', p.querySelector('[data-a=shedgo]').textContent]; }})()")
        ok("runs to 15:20" in tr[0] and "trims it to 15:00" in tr[0] and tr[1].startswith("Trim and save"), "15:00 leaves the punch outside — it offers to trim it (%s)" % tr)
        await pg.click(f"{T}.tg-pop .tk-why .tg-chip >> nth=0"); await pg.click(f"{T}.tg-pop [data-a=shedgo]"); await pg.wait_for_timeout(400)
        ok((await pg.evaluate(SH))[1] == "15:00" and await pg.evaluate(PN) == ["15:00", True], "Trim and save: clock out 15:00, the punch stops at 15:00 too (%s, %s)" % (await pg.evaluate(SH), await pg.evaluate(PN)))
        # a time that would leave a punch wholly outside is blocked
        await pg.click(f"{T}.tk-r.edge .tk-tmb[data-edge=out]"); await pg.wait_for_timeout(300)
        await pg.evaluate(f"(() => {{ const i = document.querySelector('{T}.tg-pop [data-in=shed]'); i.value = '07:10'; i.dispatchEvent(new Event('input', {{ bubbles: true }})); i.dispatchEvent(new Event('change', {{ bubbles: true }})); }})()"); await pg.wait_for_timeout(300)
        bl = await pg.evaluate(f"(() => {{ const p = document.querySelector('{T}.tg-pop'); return [(p.querySelector('.tk-ceerr') || {{}}).textContent || '', p.querySelector('[data-a=shedgo]').disabled]; }})()")
        ok(bl[1] and ("off the clock" in bl[0] or "after the clock in" in bl[0]), "a time that leaves a punch off the clock can't be saved (%s)" % bl)
        await pg.click(f"{T}.tg-pop [data-a=popx]"); await pg.wait_for_timeout(200)
        # drag the OUT flag
        f = await (await pg.query_selector(f"{T}.tk-flag[data-cd=out]")).bounding_box()
        await pg.mouse.move(f["x"] + f["width"] / 2, f["y"] + f["height"] / 2); await pg.mouse.down()
        for i in range(1, 6): await pg.mouse.move(f["x"] + f["width"] / 2 + i * 6, f["y"] + f["height"] / 2); await pg.wait_for_timeout(40)
        await pg.mouse.up(); await pg.wait_for_timeout(400)
        dg = await pg.evaluate(f"(() => {{ const p = document.querySelector('{T}.tg-pop.tk-ce'); return p ? [p.querySelector('.tg-ph b').textContent, p.querySelector('[data-in=shed]').value] : null; }})()")
        ok(dg and dg[0] == "Clocked out" and dg[1] > "15:00", "dragging the OUT flag opens the pop-over at the new time, to say why (%s)" % dg)
        await pg.click(f"{T}.tg-pop [data-a=popx]"); await pg.wait_for_timeout(200)
        # ⋯ → Delete this clock segment, asks first; Undo brings it back
        await pg.hover(f"{T}.tk-r.edge >> nth=0"); await pg.click(f"{T}.tk-r.edge .tk-shm >> nth=0"); await pg.wait_for_timeout(300)
        mi = await pg.evaluate(f"[...document.querySelectorAll('{T}.tg-pop.menu .tg-mi')].map(x => x.textContent.trim())")
        ok(mi == ["Change the time", "Add a clock segment…", "Delete this clock segment"], "⋯: Change the time, Add a clock segment, Delete (%s)" % mi)
        await pg.click(f"{T}.tg-pop .tk-mdel"); await pg.wait_for_timeout(300)
        ok("Delete the clock segment" in await pg.evaluate("(document.querySelector('.pgask') || {}).innerText || ''") and await pg.evaluate(SH) is not None, "Delete asks first")
        await pg.click(".pgask [data-ask=go]"); await pg.wait_for_timeout(400)
        ok(await pg.evaluate(SH) is None, "…and deletes the segment")
        await pg.evaluate("__tg.undoLast()"); await pg.wait_for_timeout(400)
        ok(await pg.evaluate(SH) is not None, "Undo brings it back")
        ok(not errs, "no page errors (%s)" % errs[:2])
        await b.close()
    print("\n%d failed" % len(FAILS) if FAILS else "\nall passed")
    sys.exit(1 if FAILS else 0)
asyncio.run(main())
