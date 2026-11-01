import asyncio
from playwright.async_api import async_playwright
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(); x=await b.new_page(); x.set_default_timeout(8000)
    await x.set_content('<div id=a draggable=true style="width:80px;height:40px;background:red">A</div><div id=b style="width:200px;height:100px;background:#ccc;margin-top:50px">B</div><script>let r="";a.ondragstart=e=>{e.dataTransfer.setData("text/plain","x");r+="s"};b.ondragover=e=>{e.preventDefault()};b.ondrop=e=>{e.preventDefault();r+="d";document.title=r}</script>')
    await x.drag_and_drop('#a','#b'); print("title",await x.title())
    await b.close()
asyncio.run(main())
