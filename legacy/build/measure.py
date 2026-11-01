import os, re, glob, asyncio
from playwright.async_api import async_playwright
B=os.path.dirname(os.path.abspath(__file__))
tok=open(f"{B}/ds/tokens.local.css").read(); bun=open(f"{B}/ds/project/components/bundle.css").read()
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(); res={}
        for f in sorted(glob.glob(f"{B}/ds/project/components/*/preview.html")):
            name=f.split("/")[-2]
            if name in ("Cover","ROPage","Sidebar"): continue
            src=open(f).read()
            html=src.replace("<head>",f"<head><style>{tok}\n{bun}</style>")
            pg=await b.new_page(viewport={"width":960,"height":200}); await pg.set_content(html); await pg.wait_for_timeout(150)
            h=await pg.evaluate("Math.ceil(Math.max(...[...document.body.children].filter(e=>e.tagName!=='SCRIPT').map(e=>e.getBoundingClientRect().bottom)))")
            res[name]=h; await pg.close()
        await b.close(); print(res)
        p2=f"{B}/make_components.py"; s=open(p2).read()
        for k,h in res.items():
            s=re.sub(r'(C\["%s"\] = \("[^"]+", )\d+'%k, lambda m: m.group(1)+str(max(56,h)), s)
        open(p2,'w').write(s)
asyncio.run(main())
