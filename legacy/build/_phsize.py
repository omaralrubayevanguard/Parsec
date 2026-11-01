import asyncio, base64, os
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await b.new_page(); await pg.goto("file://" + os.path.abspath("pm3_out.html")); await pg.wait_for_timeout(400)
        u = "data:image/jpeg;base64," + base64.b64encode(open("busy-photo.jpg","rb").read()).decode()
        for mx, q, ty in [(640,.55,'image/jpeg'),(560,.5,'image/jpeg'),(512,.5,'image/jpeg'),(480,.45,'image/jpeg'),(640,.5,'image/webp'),(512,.5,'image/webp'),(512,.4,'image/webp')]:
            r = await pg.evaluate("""async ([u,mx,q,ty]) => { const bl = await (await fetch(u)).blob(); const img = await createImageBitmap(bl);
              const sc = Math.min(1, mx / Math.max(img.width, img.height)), c = document.createElement('canvas'); c.width = Math.round(img.width*sc); c.height = Math.round(img.height*sc); c.getContext('2d').drawImage(img,0,0,c.width,c.height);
              const sm = await new Promise(res => c.toBlob(res, ty, q)); const b64 = await new Promise(res => { const fr = new FileReader(); fr.onload = () => res(String(fr.result).split(',')[1]); fr.readAsDataURL(sm); });
              const pk = await __pm.TQ.pack({ch:[{d:b64}]}); return [sm.type, Math.round(sm.size/1024), pk.frames.length]; }""", [u, mx, q, ty])
            print(mx, q, r, f"{r[2]*0.26:.0f}s/loop")
        await b.close()
asyncio.run(main())
