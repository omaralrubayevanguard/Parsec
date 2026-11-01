import asyncio, subprocess, os, time
from playwright.async_api import async_playwright
async def main():
    srv = subprocess.Popen(["python3", "-m", "http.server", "8765", "--bind", "127.0.0.1"], cwd="dist/parsec-mobile", stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL); time.sleep(1)
    try:
        async with async_playwright() as p:
            b = await p.chromium.launch()
            ctx = await b.new_context(viewport={"width": 390, "height": 844}, device_scale_factor=2, is_mobile=True, has_touch=True)
            pg = await ctx.new_page(); errs = []
            pg.on("pageerror", lambda e: errs.append("PAGEERR " + str(e)))
            await pg.goto("http://localhost:8765/index.html"); await pg.wait_for_timeout(1500)
            sw = await pg.evaluate("navigator.serviceWorker.getRegistration().then(r => !!(r && (r.active || r.installing || r.waiting)))")
            print("service worker:", sw)
            await pg.click("text=Try it with sample ROs"); await pg.wait_for_timeout(400)
            # swipe the first job row left with the mouse (pointer events)
            row = await pg.query_selector(".pm-swipe__row"); bb = await row.bounding_box()
            y = bb["y"] + bb["height"] / 2
            await pg.mouse.move(bb["x"] + 200, y); await pg.mouse.down(); 
            for k in range(1, 9): await pg.mouse.move(bb["x"] + 200 - k * 12, y)
            await pg.mouse.up(); await pg.wait_for_timeout(300)
            print("swipe open:", await pg.evaluate("!!document.querySelector('.pm-swipe.is-open')"))
            await pg.screenshot(path="b1_swipe.png")
            await pg.click(".pm-swipe.is-open .pm-swipe__act"); await pg.wait_for_timeout(500)
            print("running after swipe action:", await pg.evaluate("!!PM.S().L.run"))
            # long press an op row -> menu
            await pg.click(".pm-tab >> nth=1"); await pg.wait_for_timeout(300); await pg.click(".pm-rorow >> nth=0"); await pg.wait_for_timeout(400)
            op = await pg.query_selector(".pm-op >> nth=1"); ob = await op.bounding_box()
            await pg.mouse.move(ob["x"] + 60, ob["y"] + 20); await pg.mouse.down(); await pg.wait_for_timeout(700); await pg.mouse.up(); await pg.wait_for_timeout(300)
            print("long-press sheet:", await pg.evaluate("document.querySelector('.pm-sheet h3') && document.querySelector('.pm-sheet h3').textContent"))
            await pg.screenshot(path="b2_longpress.png")
            # photo from the operation menu
            async with pg.expect_file_chooser() as fc:
                await pg.click(".pm-sheet [data-act=photo]")
            ch = await fc.value; await ch.set_files("test-photo.jpg"); await pg.wait_for_timeout(1200)
            print("photos:", await pg.evaluate("PM.S().photos.map(p => [p.kind, p.name, p.size])"), "ticks:", await pg.evaluate("PM.S().L.ticks.map(t => t.key)"))
            await pg.click(".pm-op >> nth=1"); await pg.wait_for_timeout(500)
            await pg.screenshot(path="b3_photo.png")
            await pg.click(".pm-file[data-act=viewphoto]"); await pg.wait_for_timeout(500); await pg.screenshot(path="b4_viewer.png")
            await pg.keyboard.press("Escape"); await pg.wait_for_timeout(200)
            # dash photo from RO menu ticks check-in step
            await pg.click(".pm-back"); await pg.wait_for_timeout(300)
            await pg.click("[data-act=romenu]"); await pg.wait_for_timeout(300)
            async with pg.expect_file_chooser() as fc2:
                await pg.click(".pm-sheet [data-kind=dtc]")
            ch2 = await fc2.value; await ch2.set_files("test-photo.jpg"); await pg.wait_for_timeout(1200)
            print("ticks after DTC photo:", await pg.evaluate("PM.S().L.ticks.map(t => t.key)"))
            await pg.screenshot(path="b5_ro_after_photo.png")
            # offline reload through the service worker
            await ctx.set_offline(True); await pg.reload(); await pg.wait_for_timeout(1200)
            print("offline reload ok:", await pg.evaluate("!!document.querySelector('.pm-tabs') && PM.V().ros.length"))
            await pg.screenshot(path="b6_offline.png")
            print("photo still there offline:", await pg.evaluate("PM.S().photos.length"))
            print("errors:", errs)
            await b.close()
    finally:
        srv.terminate()
asyncio.run(main())
