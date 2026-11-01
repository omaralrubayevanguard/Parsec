import asyncio, os, re
from playwright.async_api import async_playwright
H = os.path.dirname(os.path.abspath(__file__))
FAKEFS = re.search(r'FAKEFS = r"""(.*?)"""', open(os.path.join(H, "r8_flow.py")).read(), re.S).group(1)
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await (await b.new_context(viewport={"width": 1440, "height": 900})).new_page(); errs = []
        pg.on("pageerror", lambda e: errs.append(str(e)))
        await pg.goto("file://" + H + "/t9.html"); await pg.wait_for_timeout(1200)
        await pg.evaluate("__tg.loadSample25()"); await pg.evaluate("__tg.ensureDemoTeam()"); await pg.wait_for_timeout(300)
        await pg.evaluate(FAKEFS)
        r = await pg.evaluate("""(async()=>{ const S=__tg.STATE(); const sh=__tg.PG.shop(); sh.pay['Mike Rodriguez']=34; sh.payPer.kind='weekly'; sh.adminPin='2468'; sh.overhead=90000;
          S.crNotes={'Mike Rodriguez':{goal:null,L:[{id:'n1',at:new Date().toISOString(),by:'Frank Delaney',text:'kept in the folder',tag:'Work',ack:null}]}};
          S.mgSet=S.mgSet||{}; S.mgSet.tg={eff:105}; __tg.IB.send({to:'Mike Rodriguez',k:'fyi',src:'career',t:'folder test note'});
          S.savedAt=Date.now(); const F=__tg.FS(); F.dir=window.__root; F.dirName='Shop Share'; F.status='connected';
          await __tg.writeFolderState(true);
          const pd=await window.__root.getDirectoryHandle('Parsec Data'); const sd=await pd.getDirectoryHandle('Shop'); const f=await sd.getFileHandle('Shop.html'); const t=await (await f.getFile()).text();
          return ['payPer','crNotes','kept in the folder','adminPin','folder test note','"tg"','overhead'].map(k=>[k,t.indexOf(k)>=0]); })()""")
        print("written:", r)
        r2 = await pg.evaluate("""(async()=>{ const S=__tg.STATE(); delete S.shop; delete S.crNotes; delete S.mgSet; S.ib={items:[],st:{}}; S.savedAt=1;
          await __tg.adoptFolderState(); const S2=__tg.STATE();
          return [S2.shop&&S2.shop.pay, S2.shop&&S2.shop.payPer, S2.shop&&S2.shop.adminPin, S2.crNotes&&Object.keys(S2.crNotes), S2.mgSet&&S2.mgSet.tg, (S2.ib&&S2.ib.items||[]).filter(x=>x.t==='folder test note').length, S2.ros.length]; })()""")
        print("read back:", r2)
        print("errors:", errs[:4])
        await b.close()
asyncio.run(main())
