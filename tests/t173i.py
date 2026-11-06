# Parsec 17.3 (I) — each note under a punch shows the time it was saved, not the punch's start: notes saved at different times
# show different times, a note added from the Time tab shows the time now, an old "[10:05 · 0:26]" stamp still reads, and a note
# with no time at all still falls back to the start. Invented data only.
import asyncio, os, sys, re
from playwright.async_api import async_playwright
H = os.path.dirname(os.path.abspath(__file__))
PAGE = sys.argv[1] if len(sys.argv) > 1 else "t12.html"
FAILS = []
def ok(c, m):
    print(("ok   " if c else "FAIL ") + m)
    if not c: FAILS.append(m)
SETUP = """(() => { const S = __tg.S(), r = S.ros.find(r => !r.shop && !r.dateClosed && r.operations.length && !S.punches.some(p => p.roId === r.id && !p.stop));
  const o = r.operations[0]; o.offNotes = []; o.work = ''; S.punches = S.punches.filter(p => p.opId !== o.id);
  const t = new Date(); t.setHours(8, 0, 0, 0); const at = m => new Date(+t + m * 60000).toISOString();
  S.punches.push({ id: 'pn1', roId: r.id, opId: o.id, tech: 'Mike Rodriguez', start: at(0), stop: at(180), startReason: 'Diagnosing', stopReason: 'Hold Tech',
    notes: 'Air leak at the rear brake chamber.\\nFound the diaphragm ruptured.\\n[08:00 \\u00b7 1:30] Old stamped note.\\nA note with no time.',
    noteAt: { 'Air leak at the rear brake chamber.': at(20), 'Found the diaphragm ruptured.': at(75) } });
  const U = __tg.UI(); U.view = 'ros'; U.selectedRo = r.id; U.roOpen = {}; U.roOpen[r.id] = [o.id]; U.ivTab = U.ivTab || {}; U.ivTab[o.id] = 'time'; __tg.render(); return r.id; })()"""
R = "document.querySelector('.jc-host:not(.jc-band-host)').shadowRoot"
TIMES = "(() => [...document.querySelector('.jc-host:not(.jc-band-host)').shadowRoot.querySelectorAll('.rop-tp[data-pid=\"pn1\"] .rop-tn:not(.is-add):not(.is-none)')].map(x => [x.querySelector('small').textContent, x.textContent.slice(0, 60)]))()"
def hm(s):
    m = re.search(r"(\d{1,2}):(\d{2})\s*([ap])?", s.lower());
    if not m: return None
    h = int(m.group(1)) % 12 + (12 if m.group(3) == "p" else 0) if m.group(3) else int(m.group(1))
    return h * 60 + int(m.group(2))
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await (await b.new_context(viewport={"width": 1440, "height": 1000})).new_page(); errs = []
        pg.on("pageerror", lambda e: errs.append(str(e)[:300]))
        await pg.route("**/fonts.g*/**", lambda r: r.abort())
        await pg.goto("file://" + os.path.join(H, PAGE)); await pg.wait_for_timeout(1200)
        await pg.evaluate("__tg.loadSample25()"); await pg.evaluate("__tg.pxSignedIn && __tg.pxSignedIn()"); await pg.wait_for_timeout(300)
        await pg.evaluate(SETUP); await pg.wait_for_timeout(1000)
        await pg.evaluate("(() => { const t = [..." + R + ".querySelectorAll('.px-tab')].find(x => x.dataset.tab === 'time'); t && t.click(); })()"); await pg.wait_for_timeout(600)
        rows = await pg.evaluate(TIMES)
        mins = [hm(r[0]) for r in rows]
        ok(len(rows) == 4, "four notes under the punch (%d)" % len(rows))
        ok(mins[:4] == [8 * 60 + 20, 9 * 60 + 15, 9 * 60 + 30, 8 * 60], "each note shows its own time: saved 8:20, saved 9:15, old stamp 9:30, no time → the 8:00 start (%s)" % [r[0] for r in rows])
        # add a note now from the Time tab: it shows the time it was saved (the punch is still running)
        await pg.evaluate("(() => { const S = __tg.S(), p = S.punches.find(p => p.id === 'pn1'); p.start = new Date(Date.now() - 2 * 3600e3).toISOString(); p.stop = null; p.stopReason = null; p.noteAt = {}; __tg.render(); })()"); await pg.wait_for_timeout(400)
        await pg.evaluate("(() => { const t = [..." + R + ".querySelectorAll('.px-tab')].find(x => x.dataset.tab === 'time'); t && t.click(); })()"); await pg.wait_for_timeout(500)
        await pg.evaluate("(() => { const b = " + R + ".querySelector('.rop-tp[data-pid=\"pn1\"] .rop-ttools button'); b.click(); })()"); await pg.wait_for_timeout(500)
        inp = await pg.evaluate("(() => !!" + R + ".querySelector('.rop-tp[data-pid=\"pn1\"] .rop-nin'))()")
        ok(inp, "the + note box opens on the punch")
        if inp:
            await pg.evaluate("(() => { const i = " + R + ".querySelector('.rop-tp[data-pid=\"pn1\"] .rop-nin'); i.focus(); i.value = 'swapped the chamber'; i.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })); })()"); await pg.wait_for_timeout(600)
            rows = await pg.evaluate(TIMES)
            now = await pg.evaluate("(() => { const d = new Date(); return d.getHours() * 60 + d.getMinutes(); })()")
            last = rows[-1] if rows else ["", ""]
            st = await pg.evaluate("(() => { const d = new Date(Date.now() - 2 * 3600e3); return d.getHours() * 60 + d.getMinutes(); })()")
            ok("Swapped the chamber" in last[1] and hm(last[0]) is not None and abs(hm(last[0]) - now) <= 1, "a note added now shows the time now, not the start (%s · now %02d:%02d · start %02d:%02d)" % (last[0], now // 60, now % 60, st // 60, st % 60))
            sv = await pg.evaluate("(() => { const p = __tg.S().punches.find(p => p.id === 'pn1'); return !!(p.noteAt && p.noteAt['Swapped the chamber.']); })()")
            ok(sv, "the time is saved beside the note")
            # 17.3: a saved note changes in place — click it, Enter keeps it, its saved time stays
            await pg.evaluate("(() => { const r = " + R + ", L = [...r.querySelectorAll('.rop-tp[data-pid=\"pn1\"] .rop-tnt')]; L[L.length - 1].click(); })()"); await pg.wait_for_timeout(500)
            await pg.evaluate("(() => { const i = " + R + ".querySelector('.rop-tp[data-pid=\"pn1\"] .rop-nined'); i.value = 'swapped the brake chamber'; i.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })); })()"); await pg.wait_for_timeout(500)
            ch = await pg.evaluate("(() => { const p = __tg.S().punches.find(p => p.id === 'pn1'); return [String(p.notes).includes('Swapped the brake chamber.'), String(p.notes).includes('Swapped the chamber.'), !!(p.noteAt && p.noteAt['Swapped the brake chamber.'])]; })()")
            ok(ch == [True, False, True], "a saved punch note can be changed; it keeps its saved time (%s)" % ch)
            await pg.evaluate("__tg.undoLast()"); await pg.wait_for_timeout(500)
            ok(await pg.evaluate("(() => String(__tg.S().punches.find(p => p.id === 'pn1').notes).includes('Swapped the chamber.'))()"), "Undo puts the old words back")
            # deleting a note takes its time with it
            await pg.evaluate("(() => { const r = " + R + ", L = [...r.querySelectorAll('.rop-tp[data-pid=\"pn1\"] .rop-tn:not(.is-add)')]; L[L.length - 1].querySelector('.rop-tnx:not(.rop-tnp)').click(); })()"); await pg.wait_for_timeout(500)
            gone = await pg.evaluate("(() => { const p = __tg.S().punches.find(p => p.id === 'pn1'); return [String(p.notes).includes('Swapped'), !!(p.noteAt && p.noteAt['Swapped the chamber.'])]; })()")
            ok(gone == [False, False], "deleting a note takes its time with it (%s)" % gone)
        ok(not errs, "no page errors (%s)" % errs[:2])
        await b.close()
    print("\n%d failed" % len(FAILS)); sys.exit(1 if FAILS else 0)
asyncio.run(main())
