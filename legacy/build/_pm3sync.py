import asyncio, os
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); ctx = await b.new_context(viewport={"width":390,"height":844}, device_scale_factor=2); pg = await ctx.new_page()
        errs=[]; pg.on("pageerror", lambda e: errs.append(str(e)))
        await pg.goto("file://"+os.path.abspath("pm3_out.html")); await pg.wait_for_timeout(500)
        await pg.click('[data-a="sample"]'); await pg.click('[data-a="clockin"]')
        await pg.click('.ph-job[data-v="s1o1"]'); await pg.click('[data-a="tab"][data-v="files"]'); await pg.click('.ph-fg .add[data-v="dash"]')
        await pg.evaluate("document.getElementById('filein').click=()=>{}"); await pg.click('[data-a="pickfile"][data-v="photos"]')
        await pg.set_input_files('#filein', os.path.abspath('busy-photo.jpg')); await pg.wait_for_timeout(1500)
        await pg.screenshot(path="pm3shots/s1_files_photo.png")
        await pg.click('[data-a="back"]'); await pg.click('.ph-syncchip'); await pg.click('[data-a="synct"][data-v="send"]'); await pg.wait_for_timeout(2500)
        await pg.screenshot(path="pm3shots/s2_send_with.png")
        await pg.click('[data-a="phl"][data-v="1"]'); await pg.wait_for_timeout(1500)
        await pg.screenshot(path="pm3shots/s3_send_later.png")
        print("errors", errs); await b.close()
asyncio.run(main())
