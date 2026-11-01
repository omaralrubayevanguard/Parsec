import asyncio, os, sys, json, datetime
from playwright.async_api import async_playwright
H = os.getcwd()
async def run(hour):
    async with async_playwright() as p:
        b = await p.chromium.launch(); ctx = await b.new_context(viewport={"width":1440,"height":900}); pg = await ctx.new_page()
        await pg.clock.install(time=datetime.datetime.now().replace(hour=hour, minute=5)); await pg.clock.resume()
        await pg.route("**/fonts.g*/**", lambda r: r.abort())
        await pg.goto("file://" + H + "/t12.html"); await pg.wait_for_timeout(1200)
        await pg.evaluate("__tg.loadSample25()"); await pg.evaluate("__tg.ensureDemoTeam()"); await pg.wait_for_timeout(300)
        r = await pg.evaluate("""(()=>{ const S=__tg.STATE(), now=Date.now();
          const fut = S.punches.filter(p=>p.stop && +new Date(p.stop) > now), futStart = S.punches.filter(p=>+new Date(p.start) > now);
          const futJS = []; S.ros.forEach(r=>r.operations.forEach(o=>{ if(o.jobStatus && o.jobStatus.setAt && +new Date(o.jobStatus.setAt) > now) futJS.push(o.id); }));
          const futSh = (S.shifts||[]).filter(s=>(s.out && +new Date(s.out) > now) || +new Date(s.in) > now);
          return { now: new Date(now).toString().slice(0,24), futStop: fut.length, futStart: futStart.length, futJobStatus: futJS.length, futShifts: futSh.length, ex: fut.slice(0,3).map(p=>[p.start,p.stop,p.stopReason]) }; })()""")
        print(hour, r)
        await b.close()
async def main():
    for h in (7, 10, 13, 16): await run(h)
asyncio.run(main())
