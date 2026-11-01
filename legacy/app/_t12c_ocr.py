import asyncio, os, json
from playwright.async_api import async_playwright
H = os.path.dirname(os.path.abspath(__file__)); OUT = os.path.join(H, "shots12c")
LINES = ["Case 4988201   Summit Freightways - Cust# 20417", "RO Number: RA0001238877     Status: Waiting on Parts", "ETR: 10/30/2026 11:00 AM     Follow-up: 10/28/2026 9:00 AM",
         "Make: Volvo    Model: VNL64T760    Year: 2020", "VIN: 4V4NC9EH7LN758560    Unit #: T-807", "Odometer: 413,104    Engine Hours: 15,219",
         "OPERATIONS", "1   Clutch slipping - replace clutch    8.0    $1,680.00    Approved", "VOL-85013702    Clutch kit    1    $1,240.00    $150.00    $1,390.00    Ryan Burke"]
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await (await b.new_context(viewport={"width": 1440, "height": 900})).new_page(); errs = []
        pg.on("pageerror", lambda e: errs.append(str(e)[:300]))
        await pg.route("**/fonts.g*/**", lambda r: r.abort())
        await pg.goto("file://" + H + "/t12c.html"); await pg.wait_for_timeout(1200)
        await pg.evaluate("__tg.loadSample25()"); await pg.wait_for_timeout(200)
        await pg.evaluate("""(L => new Promise(res => { const c = document.createElement('canvas'); c.width = 1300; c.height = 40 + L.length * 34; const g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height); g.fillStyle = '#111'; g.font = '20px Arial';
          L.forEach((l, i) => g.fillText(l, 20, 40 + i * 34)); c.toBlob(bl => { const f = new File([bl], 'asist.png', { type: 'image/png' }); __tg.IMPX.open({ files: [f] }); res(); }, 'image/png'); }))""" + "(" + json.dumps(LINES) + ")")
        for i in range(60):
            await pg.wait_for_timeout(1000)
            st = await pg.evaluate("(() => { const D = __tg.IMPX.state(); return D ? [D.busy, D.msg, D.pieces.length, (document.getElementById('imp-status')||{}).textContent] : null; })()")
            if st and (st[2] or (st[1] and not st[0])): break
        print("state:", st)
        print("fields:", await pg.evaluate("JSON.stringify(__tg.IMPX.state().acc.f)"))
        print("ops:", await pg.evaluate("JSON.stringify(__tg.IMPX.state().acc.ops.map(o => [o.no, o.name, o.hours, o.price, o.approval, o.parts.map(p => p.pn + '/' + p.price + '/' + p.core)]))"))
        await pg.screenshot(path=os.path.join(OUT, "d_ocr.png"))
        print("ERR", errs); await b.close()
asyncio.run(main())
