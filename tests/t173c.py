# Parsec 17.3 (C) — the one extraction window: New RO opens empty with one place to paste or drop; a case fills the RO as a
# ticket with the files in a strip and a Found line; a photo goes to the RO's Files and a quote's parts go to Inventory or onto
# the operation it was opened from; the chip in the header changes where everything goes; files dropped anywhere in Parsec
# open the window; Esc asks before closing when something was read. Invented data only.
import asyncio, os, sys, json
from playwright.async_api import async_playwright
H = os.path.dirname(os.path.abspath(__file__))
PAGE = sys.argv[1] if len(sys.argv) > 1 else "t12.html"
FX = lambda *p: open(os.path.join(H, *p) if os.path.exists(os.path.join(H, *p)) else os.path.join(H, "fixtures", *p), encoding="utf-8").read()
FAILS = []
def ok(c, m):
    print(("ok   " if c else "FAIL ") + m)
    if not c: FAILS.append(m)
PHOTO = """(async () => { const c = document.createElement('canvas'); c.width = 320; c.height = 200; const g = c.getContext('2d');
  const gr = g.createLinearGradient(0, 0, 0, 200); gr.addColorStop(0, '#9fb3c4'); gr.addColorStop(1, '#6f7a68'); g.fillStyle = gr; g.fillRect(0, 0, 320, 200);
  g.fillStyle = '#2f4a63'; g.fillRect(190, 70, 70, 70); g.fillStyle = '#e9e6df'; g.fillRect(40, 80, 150, 60); g.fillStyle = '#222'; [70, 140, 230].forEach(x => { g.beginPath(); g.arc(x, 150, 16, 0, 7); g.fill(); });
  const b = await new Promise(r => c.toBlob(r, 'image/png')); return new File([b], 'IMG_2231.jpg', { type: 'image/png' }); })()"""

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await (await b.new_context(viewport={"width": 1440, "height": 900})).new_page(); errs = []
        pg.on("pageerror", lambda e: errs.append(str(e)[:300]))
        await pg.route("**/fonts.g*/**", lambda r: r.abort())
        await pg.goto("file://" + os.path.join(H, PAGE)); await pg.wait_for_timeout(1200)
        await pg.evaluate("__tg.loadSample25()"); await pg.evaluate("__tg.pxSignedIn && __tg.pxSignedIn()"); await pg.wait_for_timeout(300)
        dlg = lambda js: pg.evaluate("(() => { const w = document.getElementById('imp-dlg'); " + js + " })()")
        # empty: one place to paste or drop
        await pg.evaluate("__tg.IMPX.open({})"); await pg.wait_for_timeout(300)
        e0 = await dlg("return [!!w.querySelector('.ix-empty.ix-drop'), !!w.querySelector('.ix-src'), (w.querySelector('h2')||{}).textContent]")
        ok(e0[0] and not e0[1] and e0[2] == "New RO", "New RO opens empty, with one place to paste or drop (%s)" % e0)
        # a case: the ticket, the strip, Found
        await pg.evaluate("t => __tg.IMPX.addText(t)", FX("imptest", "case1.txt")); await pg.wait_for_timeout(400)
        t1 = await dlg("return [(w.querySelector('h2')||{}).textContent, w.querySelectorAll('.ix-src .ix-pc').length, (w.querySelector('.ix-fd')||{}).textContent, w.querySelectorAll('.ix-top .ix-fr').length, w.querySelectorAll('.ix-fr.emp').length]")
        ok(t1[0] == "RO 8877" and t1[1] == 1 and "2 operations" in t1[2] and t1[3] == 3, "the case fills the ticket, the strip and Found (%s)" % t1)
        ok(t1[4] > 0, "empty fields stay out of the way (%s hidden)" % t1[4])
        await dlg("w.querySelector('[data-ix=allf]').click()"); await pg.wait_for_timeout(150)
        ok(await dlg("return w.querySelectorAll('.ix-fr.emp').length") == 0, "…and show when asked")
        # a photo goes with it, to Files
        await pg.evaluate("async () => { const f = await " + PHOTO + "; await __tg.IMPX.read([f]); }"); await pg.wait_for_timeout(800)
        ph = await pg.evaluate("__tg.IMPX.state().pieces.map(p => p.role)")
        ok(ph == ["case", "photo"], "a picture with no words is a photo (%s)" % ph)
        ok("1 photo" in await dlg("return w.querySelector('.ix-fd').textContent") and await dlg("return !!w.querySelector('#ix-s-ph img')"), "…listed under Photos with its picture")
        foot = await dlg("return w.querySelector('.ix-dest').textContent")
        ok("Files 1" in foot, "the footer says where it goes: %r" % foot)
        await dlg("w.querySelector('[data-ix=apply]').click()"); await pg.wait_for_timeout(2500)
        pics = await pg.evaluate("(() => { const r = __tg.S().ros.find(x => x.roNumber === 'RA0001238877'); return r ? (r.bulletins || []).filter(e => e.task === 'pics').reduce((a, e) => a + (e.files || []).length, 0) : -1; })()")
        ok(pics == 1, "Create puts the photo in the RO's Files (%s)" % pics)
        # aimed at Inventory from the header's chip
        await pg.evaluate("__tg.IMPX.open({})"); await pg.wait_for_timeout(200)
        await pg.evaluate("t => __tg.IMPX.addText(t)", FX("x132", "s4_quote.txt")); await pg.wait_for_timeout(300)
        await dlg("w.querySelector('[data-ix=target]').click()"); await pg.wait_for_timeout(150)
        mi = await dlg("return [...w.querySelectorAll('.ix-menu [data-ix=tgt]')].map(b => b.querySelector('b').textContent)")
        ok("New RO" in mi and "Inventory" in mi and "Library" in mi and any(x.startswith("Into RO ") for x in mi), "the chip offers New RO, an open RO, Inventory, the Library (%s)" % mi[:4])
        n0 = await pg.evaluate("(__tg.S().inventory || []).length")
        await dlg("w.querySelector('.ix-menu [data-v=inv]').click()"); await pg.wait_for_timeout(150)
        lab = await dlg("return w.querySelector('[data-ix=apply]').textContent")
        ok(lab == "Add 4 parts to Inventory", "aimed at Inventory, the button says so: %r" % lab)
        await dlg("w.querySelector('[data-ix=apply]').click()"); await pg.wait_for_timeout(400)
        n1 = await pg.evaluate("(__tg.S().inventory || []).length")
        ok(n1 == n0 + 4, "the parts go on the Parts list (%s → %s)" % (n0, n1))
        # opened from an operation (Extract parts): the quote's parts land on it
        o = await pg.evaluate("(() => { const r = __tg.S().ros.find(x => !x.shop && (x.operations||[]).length >= 2 && !x.dateClosed); const op = r.operations[1]; return [r.id, op.id, (op.parts||[]).length]; })()")
        await pg.evaluate("x => __tg.IMPX.open({ ro: x[0], opId: x[1] })", o); await pg.wait_for_timeout(200)
        await pg.evaluate("t => __tg.IMPX.addText(t)", FX("x132", "s4_quote.txt")); await pg.wait_for_timeout(300)
        await dlg("w.querySelector('[data-ix=apply]').click()"); await pg.wait_for_timeout(500)
        o2 = await pg.evaluate("x => { const r = __tg.getRO(x[0]); const op = r.operations.find(q => q.id === x[1]); return [(op.parts||[]).length, r.operations.length]; }", o)
        ok(o2[0] == o[2] + 4, "Extract parts: the quote's parts go on that operation (%s → %s)" % (o[2], o2[0]))
        # files dropped anywhere in Parsec open the window
        await pg.evaluate("""async () => { const f = await """ + PHOTO + """; const dt = new DataTransfer(); dt.items.add(f);
          document.body.dispatchEvent(new DragEvent('dragover', { dataTransfer: dt, bubbles: true, cancelable: true }));
          document.body.dispatchEvent(new DragEvent('drop', { dataTransfer: dt, bubbles: true, cancelable: true })); }"""); await pg.wait_for_timeout(900)
        ok(await pg.evaluate("__tg.IMPX.isOpen() && __tg.IMPX.state().pieces.length === 1"), "a file dropped anywhere opens the window with it")
        # Esc asks first when something was read
        await pg.keyboard.press("Escape"); await pg.wait_for_timeout(150)
        ok(await dlg("return !!w.querySelector('[data-ix=askyes]')"), "Esc asks before closing what was read")
        await dlg("w.querySelector('[data-ix=askyes]').click()"); await pg.wait_for_timeout(150)
        ok(not await pg.evaluate("__tg.IMPX.isOpen()"), "…and Close closes")
        ok(not errs, "no page errors: %s" % errs[:2])
        await b.close()
    print("FAILS:", len(FAILS), FAILS)
    sys.exit(1 if FAILS else 0)

asyncio.run(main())
