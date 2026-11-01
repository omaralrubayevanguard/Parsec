# The real camera path: Parsec Mobile 3 plays its codes, Chrome's fake webcam replays them as video, Parsec 9.4's
# Get from phone reads them with jsQR (spare codes fill the ones we smudge on purpose).
import asyncio, base64, io, os, random, sys, time
from playwright.async_api import async_playwright
from PIL import Image, ImageFilter
import numpy as np
H = os.path.dirname(os.path.abspath(__file__)); B = os.path.join(os.path.dirname(H), "build")
PHONE = os.path.join(B, "pm3_out.html"); Y4M = os.path.join(H, "_cam.y4m")
W, HH, FPS, PER = 960, 540, 10, 3          # 300 ms a code, like the phone's 260 ms
SMUDGE = float(sys.argv[1]) if len(sys.argv) > 1 else 0.1

def write_y4m(pngs):
    random.seed(7)
    LOOPS = 3   # the phone loops; each pass the camera misses different codes
    bad = [set(i for i in range(len(pngs)) if random.random() < SMUDGE) for _ in range(LOOPS)]
    with open(Y4M, "wb") as f:
        f.write(f"YUV4MPEG2 W{W} H{HH} F{FPS}:1 Ip A1:1 C420jpeg\n".encode())
        def put(im):
            yuv = np.asarray(im.convert("YCbCr")); y = yuv[:, :, 0]; cb = yuv[::2, ::2, 1]; cr = yuv[::2, ::2, 2]
            f.write(b"FRAME\n"); f.write(y.tobytes()); f.write(np.ascontiguousarray(cb).tobytes()); f.write(np.ascontiguousarray(cr).tobytes())
        blank = Image.new("RGB", (W, HH), (58, 56, 52))
        for _ in range(3): put(blank)
        cards = [Image.open(io.BytesIO(base64.b64decode(p))).convert("RGB") for p in pngs]
        for lp in range(LOOPS):
            for i, qr in enumerate(cards):
                card = Image.new("RGB", (400, 400), (250, 250, 250)); q = qr.resize((372, 372), Image.NEAREST); card.paste(q, (14, 14))
                fr = blank.copy(); fr.paste(card, (W // 2 - 200 + random.randint(-6, 6), HH // 2 - 200 + random.randint(-6, 6)))
                fr = fr.filter(ImageFilter.GaussianBlur(5 if i in bad[lp] else 0.8))
                a = np.asarray(fr).astype("int16") + np.random.default_rng(i + 100 * lp).normal(0, 4, (HH, W, 3)).astype("int16")
                fr = Image.fromarray(np.clip(a, 0, 255).astype("uint8"))
                for _ in range(PER): put(fr)
    return bad

async def main():
    async with async_playwright() as p:
        if os.path.exists(Y4M): os.remove(Y4M)
        # a placeholder so Chrome starts; it is rewritten before the webcam opens
        with open(Y4M, "wb") as f: f.write(f"YUV4MPEG2 W{W} H{HH} F{FPS}:1 Ip A1:1 C420jpeg\nFRAME\n".encode() + bytes(W * HH * 3 // 2))
        br = await p.chromium.launch(args=["--use-fake-device-for-media-stream", "--use-fake-ui-for-media-stream", f"--use-file-for-fake-video-capture={Y4M}"])
        ctx = await br.new_context(viewport={"width": 1440, "height": 900}); errs = []
        d = await ctx.new_page(); ph = await ctx.new_page()
        for pg, tag in ((d, "desk"), (ph, "phone")):
            pg.on("pageerror", lambda e, t=tag: errs.append(t + ": " + str(e)))
        await d.goto("file://" + H + "/t9.html"); await d.wait_for_timeout(1200)
        await d.evaluate("__tg.loadSample25()"); await d.evaluate("__tg.ensureDemoTeam()")
        await d.evaluate("(()=>{ __tg.STATE().punches.filter(p => !p.stop).forEach(p => { p.stop = new Date(new Date(p.start).getTime() + 5*60000).toISOString(); }); })()")
        await ph.goto("file://" + PHONE); await ph.wait_for_timeout(500)
        pk = await d.evaluate("__tg.TQ.pack(__tg.mobBundle()()).then(pk => pk.frames)")
        b = await ph.evaluate("""(fr) => { let res = null; const take = TQP.decoder(null, (m, s) => { res = [m, s]; }); fr.forEach(take); return __pm.TQ.unpack(res[0], res[1]); }""", pk)
        print("phone took:", await ph.evaluate("b => { const r = __pm.applyPc(b); __pm.render(); return r.ros; }", b), "ROs")
        # a few things on the phone, and one photo
        await ph.click('[data-a="clockin"]')
        op = await ph.evaluate("(()=>{ const L = __pm.lists(); return L.next[0].id; })()")
        await ph.evaluate(f"__pm.A.job({{dataset:{{v:'{op}'}}, closest:()=>null}})")
        await ph.click('.ph-acts .main.start')
        await ph.evaluate("(()=>{ const S = __pm.S(); S.L.run.s = new Date(Date.now() - 25*60000).toISOString(); S.L.shifts[0].in = new Date(Date.now() - 30*60000).toISOString(); })()")
        await ph.fill('#noteIn', 'checked the harness at the ABS module, pins clean'); await ph.press('#noteIn', 'Enter')
        await ph.click('[data-a="tab"][data-v="files"]'); await ph.click('.ph-fg .add[data-v="pics"]')
        await ph.evaluate("(()=>{ document.getElementById('filein').click = () => {}; })()")
        await ph.click('[data-a="pickfile"][data-v="photos"]'); await ph.set_input_files('#filein', os.path.join(B, "mobile", "test-photo.jpg")); await ph.wait_for_timeout(800)
        # the phone's codes, drawn exactly as the phone draws them
        pngs = await ph.evaluate("""() => __pm.phBundle().then(b => __pm.TQ.pack(b)).then(pk => pk.frames.map(f => { const c = document.createElement('canvas'); __pm.TQ.draw(c, f); return c.toDataURL('image/png').split(',')[1]; }))""")
        bad = write_y4m(pngs)
        print(f"phone plays {len(pngs)} codes (with spares); smudged on purpose per pass: {[sorted(x) for x in bad]}; video {os.path.getsize(Y4M)//1048576} MB")
        # Parsec 9.4: Get from phone
        await d.evaluate("__tg.openPhoneSync()"); await d.wait_for_timeout(300)
        await d.evaluate("(()=>{ const b = [...document.querySelectorAll('.psy-seg button')].find(b => b.getAttribute('data-psy') !== 'send'); b && b.click(); })()")
        t0 = time.time(); last = ""
        while time.time() - t0 < 90:
            txt = await d.evaluate("(()=>{ const n = document.querySelector('.psy-n'); return n ? n.textContent : ''; })()")
            if txt != last: print(f"  {time.time()-t0:5.1f}s  {txt}"); last = txt
            if txt in ("Done", "Not Parsec Mobile codes"): break
            await d.wait_for_timeout(250)
        msg = await d.evaluate("(()=>{ const m = document.querySelector('.psy-msg'); return m ? m.innerText : ''; })()")
        await d.wait_for_timeout(1500)
        got = await d.evaluate(f"""(()=>{{ const S = __tg.STATE(); const pn = S.punches.filter(p => p.fromPhone); const sh = __tg.shiftList().filter(s => s.fromPhone);
          const files = S.ros.reduce((a, r) => a + (r.bulletins||[]).reduce((x, b) => x + (b.files||[]).filter(f => /Pictures/.test(f.name||'')).length, 0), 0);
          return {{ punches: pn.length, shifts: sh.length, files, note: JSON.stringify(S.ros).includes('pins clean') }}; }})()""")
        print("computer:", last, "|", msg.replace("\n", " ")[:200], "|", got)
        ok = last == "Done" and got["punches"] == 1 and got["shifts"] == 1 and got["files"] == 1 and got["note"]
        await d.screenshot(path=os.path.join(B, "pm3shots", "desk_get_from_phone.png"))
        print("errors:", errs[:5])
        print("RESULT:", "PASS" if ok and not errs else "FAIL", f"in {time.time()-t0:.1f}s")
        await br.close()
    os.remove(Y4M)
asyncio.run(main())
