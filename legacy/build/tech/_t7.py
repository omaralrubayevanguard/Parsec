import asyncio
from playwright.async_api import async_playwright
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(); x=await b.new_page(); x.set_default_timeout(8000)
    await x.goto("file:///tmp/claude-0/-home-claude/febe01e4-e12e-554d-9dc2-ccfd769708e9/scratchpad/build/tech/dnd.html")
    await x.drag_and_drop('#a','#b'); print("title",await x.title())
    await b.close()
asyncio.run(main())
