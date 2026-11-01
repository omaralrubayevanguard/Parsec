import asyncio, os, json
from playwright.async_api import async_playwright
D = os.path.dirname(os.path.abspath(__file__))
V = [
 dict(kind='hw', a=0, H=96, cab=42, roof='flat', ax='6x4', paint='#ECEBE6', label='VN 420'),
 dict(kind='hw', a=1, H=98, cab=0, roof='low', ax='4x2', paint='#2D4F86', label='VNL 300 g2'),
 dict(kind='hw', a=1, H=98, cab=77, roof='high', ax='6x4', paint='#9C2F2A', label='VNL 780'),
 dict(kind='hw', a=2, H=100, cab=70, roof='mid', ax='6x4', paint='#4A4D50', label='VNL 740'),
 dict(kind='hw', a=3, H=100, cab=74, roof='high', ax='6x4', paint='#ECEBE6', label='new VNL 860'),
 dict(kind='hw', a=3, H=100, cab=42, roof='mid', ax='6x2', paint='#263347', ev=True, label='VNL 440 Electric'),
 dict(kind='reg', a=2, H=88, cab=0, roof='low', ax='6x4', paint='#2F4F3E', label='VNR 300'),
 dict(kind='reg', a=3, H=88, cab=62, roof='high', ax='6x4', paint='#8A6A45', label='VNR 660 new'),
 dict(kind='vt', a=0, H=116, cab=77, roof='high', ax='6x4', paint='#1F1F1E', trim='chrome', label='VT 880'),
 dict(kind='voc', a=1, H=86, cab=0, roof='low', ax='6x4', fwd=True, paint='#C9A227', label='VHD 300 AF'),
 dict(kind='voc', a=1, H=86, cab=42, roof='flat', ax='8x4', fwd=False, paint='#B9BDC0', body='truck', label='VHD 400 AB truck'),
 dict(kind='ah', a=1, H=82, cab=42, roof='mid', ax='6x4', fwd=True, paint='#ECEBE6', label='VAH 400'),
 dict(kind='hw', a=1, H=100, cab=61, roof='mid', ax='8x6', paint='#4A4D50', label='VNX 630'),
 dict(kind='hw', a=3, H=100, cab=62, roof='mid', ax='6x4', paint='#9C2F2A', trim='black', label='Edge Black'),
]
async def main():
    js = open(os.path.join(D, 'draw.js')).read()
    html = '<html><body style="margin:0;background:#FBFAF7;font:12px sans-serif"><div id=g style="display:grid;grid-template-columns:repeat(3,400px);gap:6px;padding:6px"></div><script>' + js + ';const V=' + json.dumps(V) + ';document.getElementById("g").innerHTML=V.map(v=>"<div style=\\"background:#F0EDE6;border-radius:10px\\">"+truckSVG(v)+"<div style=\\"padding:2px 8px\\">"+v.label+"</div></div>").join("")</script></body></html>'
    open(os.path.join(D, '_t.html'), 'w').write(html)
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await b.new_page(viewport={"width":1230,"height":900}, device_scale_factor=1.5); errs=[]
        pg.on("pageerror", lambda e: errs.append(str(e)))
        await pg.goto("file://" + os.path.join(D, '_t.html')); await pg.wait_for_timeout(300)
        await pg.screenshot(path=os.path.join(D, '_t.png'), full_page=True); print(errs); await b.close()
asyncio.run(main())
