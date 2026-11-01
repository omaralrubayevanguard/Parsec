import asyncio, sys
from playwright.async_api import async_playwright
F="file:///mnt/user-data/outputs/Parsec%20Technician%20page%20mock-up.html"
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(); x=await b.new_page(viewport={"width":1440,"height":900}); x.set_default_timeout(8000)
    await x.goto(F); await x.wait_for_timeout(200)
    await x.evaluate("""()=>{document.body.insertAdjacentHTML('beforeend','<div id=za draggable=true style="position:fixed;left:300px;top:300px;z-index:999;width:80px;height:40px;background:red">A</div><div id=zb style="position:fixed;left:300px;top:450px;z-index:999;width:200px;height:100px;background:#ccc">B</div>');let r='';za.ondragstart=e=>{e.dataTransfer.setData('text/plain','x');r+='s'};zb.ondragover=e=>{e.preventDefault()};zb.ondrop=e=>{e.preventDefault();r+='d';document.title=r}}""")
    await x.drag_and_drop('#za','#zb'); print("title",await x.title())
    await b.close()
asyncio.run(main())
