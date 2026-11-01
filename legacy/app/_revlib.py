import asyncio, os, sys, json
sys.argv = ['x', 't12.html']
_src = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "_t127p.py")).read().split("async def main():")[0]
exec(_src)
OUT = os.path.join(H, "shots14r")
async def shot(pg, n): await pg.screenshot(path=os.path.join(OUT, n + ".png"))
async def go(pg, v):
    await pg.evaluate(f"(()=>{{ __tg.UI().view='{v}'; __tg.render(); }})()"); await pg.wait_for_timeout(700)
async def admin(pg):
    await pg.evaluate("(()=>{ localStorage.removeItem('tec_viewas'); localStorage.removeItem('tec_out'); __tg.pxSignedIn(); __tg.render(); })()"); await pg.wait_for_timeout(500)
async def txt(pg, sel):
    return await pg.evaluate(f"(()=>{{ const e=document.querySelector({json.dumps(sel)}); return e ? e.innerText.replace(/\\s+/g,' ').trim() : null; }})()")
async def toast(pg):
    return await pg.evaluate("[...document.querySelectorAll('.toast, .tg-toast, [class*=toast]')].map(x=>x.innerText.replace(/\\s+/g,' ').trim()).filter(Boolean).slice(-3).join(' | ')")
exec(open('/tmp/claude-0/-home-claude/febe01e4-e12e-554d-9dc2-ccfd769708e9/scratchpad/app/_revcase.py').read())
async def mkro(pg):
    await admin(pg); await go(pg, 'rolist')
    await pg.click("text=New RO"); await pg.wait_for_timeout(400)
    await pg.evaluate("t=>__tg.IMPX.addText(t)", CASE); await pg.wait_for_timeout(600)
    await pg.click("#imp-dlg button:has-text('Create RO')"); await pg.wait_for_timeout(900)
    return await pg.evaluate("__tg.STATE().ros.find(x=>/1238877/.test(x.roNumber)).id")
RO = lambda rid, js: f"(()=>{{ const r=__tg.getRO('{rid}'); {js} }})()"
async def lst(pg, sel, n=30):
    return await pg.evaluate(f"[...document.querySelectorAll({json.dumps(sel)})].slice(0,{n}).map(x=>x.innerText.replace(/\\s+/g,' ').trim())")
async def tri(pg, rid):
    await pg.evaluate(f"(()=>{{ const U=__tg.UI(); U.view='triage'; U.tgSel='{rid}'; __tg.render(); }})()"); await pg.wait_for_timeout(700)
async def approve(pg, i, kind='Approve', name='Dave Miller'):
    await pg.evaluate(f"(()=>{{ const b=[...document.querySelectorAll('button[data-a=tg-apr],button[data-action=tg-apr]')].filter(b=>b.textContent.trim()==='{kind}'); b[{i}].click(); }})()"); await pg.wait_for_timeout(400)
    inp = await pg.query_selector(".tg-main input[placeholder='Name'], input[placeholder='Name']")
    if inp: await inp.fill(name)
    await pg.wait_for_timeout(150)
    clicked = await pg.evaluate("(()=>{ const b=[...document.querySelectorAll('button')].find(b=>b.offsetParent && /^Save (approval|decline|partly)|^Save/.test(b.textContent.trim()) && /approv|declin|part/i.test(b.textContent)); if(b){ b.click(); return b.textContent.trim(); } return null; })()")
    await pg.wait_for_timeout(500)
    return clicked
async def flow_approve(pg, rid):
    await tri(pg, rid)
    r = []
    for i in range(3):
        r.append(await approve(pg, i))
    return r
async def psel(pg, no='8877'):
    await go(pg, 'parts')
    await pg.evaluate(f"(()=>{{ const it=[...document.querySelectorAll('.tg-list .tg-it')].find(x=>/{no}/.test(x.innerText)); it && it.click(); }})()"); await pg.wait_for_timeout(500)
async def flow_order(pg, rid):
    await psel(pg)
    await pg.evaluate("(()=>{ const it=[...document.querySelectorAll('.tg-list .tg-it')].find(x=>/8877/.test(x.innerText)); const b=it&&it.querySelector('button'); b&&b.click(); })()"); await pg.wait_for_timeout(500)
    await pg.click(".tg-pop button[data-a=oset]"); await pg.wait_for_timeout(300)
    await pg.click(".tg-pop button[data-a=ogo]"); await pg.wait_for_timeout(600)

SNAP = "return [r.status.status, r.status.sub, r.operations.map(o=>[o.complaint.slice(0,14), o.jobStatus&&o.jobStatus.status, (o.parts||[]).map(x=>x.status+(x.bin?'#'+x.bin:'')).join(',')])];"
async def clickall(pg, label):
    n = 0
    for i in range(6):
        ok_ = await pg.evaluate(f"(()=>{{ const b=[...document.querySelectorAll('[data-pg=parts] .tg-main button, [data-pg=parts] button')].find(b=>b.offsetParent && b.textContent.trim().replace(/\\s+/g,' ').startsWith({json.dumps(label)})); if(b){{ b.click(); return true; }} return false; }})()")
        await pg.wait_for_timeout(450)
        if not ok_: break
        n += 1
        pop = await pg.evaluate("!!document.querySelector('.tg-pop')")
        if pop:
            t = await txt(pg, ".tg-pop"); print("  pop:", (t or '')[:300])
            await pg.evaluate("(()=>{ const b=[...document.querySelectorAll('.tg-pop button.btn-primary')].pop(); b&&b.click(); })()"); await pg.wait_for_timeout(450)
    return n

async def flow_receive(pg, rid):
    await psel(pg); await clickall(pg, "It’s in")
async def popgo(pg):
    await pg.evaluate("(()=>{ const b=[...document.querySelectorAll('.tg-pop button.btn-primary')].pop(); b&&b.click(); })()"); await pg.wait_for_timeout(600)
async def flow_send_fm(pg, rid):
    await psel(pg)
    await pg.click("[data-pg=parts] button:has-text('Send to Frank')"); await pg.wait_for_timeout(500)
    await popgo(pg)
async def fsel(pg, no='8877'):
    await go(pg, 'foreman')
    await pg.evaluate(f"(()=>{{ const it=[...document.querySelectorAll('.tg-list .tg-it')].find(x=>/{no}/.test(x.innerText)); it && it.click(); }})()"); await pg.wait_for_timeout(600)
async def flow_assign(pg, rid):
    await fsel(pg)
    await pg.click(".tg-main button:has-text('Assign')"); await pg.wait_for_timeout(500)
    await popgo(pg)
async def signin(pg, name):
    sid = await pg.evaluate(f"__tg.staffList().find(s=>s.name==={json.dumps(name)}).id")
    me = await pg.evaluate(SIGN(sid)); await pg.wait_for_timeout(500); return me
async def upto_assign(pg):
    rid = await mkro(pg); await flow_approve(pg, rid); await flow_order(pg, rid); await flow_receive(pg, rid); await flow_send_fm(pg, rid); await flow_assign(pg, rid)
    return rid
async def tsel(pg, no='8877'):
    await go(pg, 'tech')
    await pg.evaluate(f"(()=>{{ const it=[...document.querySelectorAll('.tg-list .tg-it')].find(x=>/{no}/.test(x.innerText)); it && it.click(); }})()"); await pg.wait_for_timeout(600)
async def anypop(pg):
    return await pg.evaluate("(()=>{ const m=[...document.querySelectorAll('.tg-pop, .modal, [role=dialog]:not(#assist-panel), .jc-pop, .ock-pop')].filter(x=>x.offsetParent); return m.map(x=>x.innerText.replace(/\\s+/g,' ').slice(0,500)); })()")
async def flow_tech_start(pg, rid, who="Dana Kowalski"):
    await signin(pg, who); await tsel(pg)
    await pg.click("button[data-a=cin] >> nth=0"); await pg.wait_for_timeout(500)
    await tsel(pg)
    await pg.click("button[data-a=startid]:has-text('Start Op 1')"); await pg.wait_for_timeout(600)
async def done_cur(pg):
    r = await pg.evaluate("(()=>{ const b=[...document.querySelectorAll('[data-pg=tech] button')].find(b=>b.offsetParent && b.textContent.trim()==='Done'); if(b){ b.click(); return true; } return false; })()"); await pg.wait_for_timeout(600); return r
async def start_next(pg, n):
    await tsel(pg)
    await pg.click(f"button[data-a=startid]:has-text('Start Op {n}')"); await pg.wait_for_timeout(600)
async def watch_toasts(pg):
    await pg.evaluate("""(()=>{ window.__toasts=[]; const obs=new MutationObserver(()=>{ document.querySelectorAll('[class*=toast]').forEach(t=>{ const s=t.innerText.trim(); if(s && !window.__toasts.includes(s)) window.__toasts.push(s); }); }); obs.observe(document.body,{subtree:true,childList:true,characterData:true}); })()""")
async def seen(pg): return await pg.evaluate("window.__toasts||[]")
async def pick_all(pg):
    await tsel(pg)
    await pg.evaluate("(()=>{ const t=[...document.querySelectorAll('[data-pg=tech] button[data-a=topen]')].find(b=>/PM service/.test(b.textContent)); t&&t.click(); })()"); await pg.wait_for_timeout(300)
    await pg.evaluate("(()=>{ const t=[...document.querySelectorAll('[data-pg=tech] button[data-a=ttab]')].find(b=>/Parts/.test(b.textContent)); t&&t.click(); })()"); await pg.wait_for_timeout(300)
    for i in range(3):
        await pg.evaluate("(()=>{ const b=[...document.querySelectorAll('[data-pg=tech] button[data-a=tpick]')].filter(b=>b.offsetParent)[0]; b&&b.click(); })()"); await pg.wait_for_timeout(350)
async def upto_ops_done(pg):
    rid = await upto_assign(pg); await flow_tech_start(pg, rid); await done_cur(pg)
    await start_next(pg, 2); await done_cur(pg)
    await pick_all(pg)
    await start_next(pg, 3); await done_cur(pg)
    return rid
async def install_all(pg):
    await tsel(pg)
    await pg.evaluate("(()=>{ const t=[...document.querySelectorAll('[data-pg=tech] button[data-a=topen]')].find(b=>/PM service/.test(b.textContent)); t&&t.click(); })()"); await pg.wait_for_timeout(300)
    await pg.evaluate("(()=>{ const t=[...document.querySelectorAll('[data-pg=tech] button[data-a=ttab]')].find(b=>/Parts/.test(b.textContent)); t&&t.click(); })()"); await pg.wait_for_timeout(300)
    await pg.evaluate("(()=>{ const b=[...document.querySelectorAll('[data-pg=tech] [data-a=tckall][data-k=p]')].filter(b=>b.offsetParent)[0]; b&&b.click(); })()"); await pg.wait_for_timeout(300)
    r = await pg.evaluate("(()=>{ const b=[...document.querySelectorAll('[data-pg=tech] button[data-a=tsact][data-v=pinst]')].filter(b=>b.offsetParent)[0]; if(b){ b.click(); return true;} return false; })()"); await pg.wait_for_timeout(400)
    return r
async def upto_ops_done(pg):
    rid = await upto_assign(pg); await flow_tech_start(pg, rid); await done_cur(pg)
    await start_next(pg, 2); await done_cur(pg)
    await pick_all(pg); await install_all(pg)
    await start_next(pg, 3); await done_cur(pg)
    return rid
async def flow_rt(pg, rid):
    await admin(pg); await tri(pg, rid)
    await pg.click(".tg-main button:has-text('Road test')"); await pg.wait_for_timeout(400)
    await pg.click(".tg-pop button:has-text('Log the result')"); await pg.wait_for_timeout(400)
    await pg.click(".tg-pop button[data-a=tg-rt-go], .tg-pop button[data-action=tg-rt-go]"); await pg.wait_for_timeout(600)
async def open_checks(pg, rid):
    await tri(pg, rid)
    await pg.evaluate("(()=>{ const it=[...document.querySelectorAll('.tg-list .tg-it')].find(x=>/8877/.test(x.innerText)); const b=it&&[...it.querySelectorAll('button')].find(b=>b.textContent.trim()==='Check'); b&&b.click(); })()"); await pg.wait_for_timeout(500)
async def tick_walk(pg):
    for i in range(6):
        await pg.evaluate(f"(()=>{{ const b=[...document.querySelectorAll('.tg-pop button[data-a=tg-qc],.tg-pop button[data-action=tg-qc]')].filter(b=>!/Edit the list/.test(b.textContent))[{i}]; b&&b.click(); }})()"); await pg.wait_for_timeout(200)
async def flow_release(pg, rid):
    await open_checks(pg, rid); await tick_walk(pg)
    await pg.click(".tg-pop button[data-a=tg-qc-go], .tg-pop button[data-action=tg-qc-go]"); await pg.wait_for_timeout(400)
    for t in ["Keys back","Truck clean","Invoice closed","Customer told"]:
        await pg.evaluate(f"(()=>{{ const b=[...document.querySelectorAll('.tg-pop button')].find(b=>b.textContent.trim()==={json.dumps(t)}); b&&b.click(); }})()"); await pg.wait_for_timeout(150)
    f = await pg.query_selector(".tg-pop input[placeholder='Who picked it up']")
    if f: await f.fill("Joe Driver")
    await pg.click(".tg-pop button:has-text('Release anyway')"); await pg.wait_for_timeout(400)
    await pg.evaluate("(()=>{ const b=[...document.querySelectorAll('.tg-pop button')].find(b=>b.textContent.trim()==='Customer is at the counter'); b&&b.click(); })()"); await pg.wait_for_timeout(250)
    await pg.evaluate("(()=>{ const b=[...document.querySelectorAll('.tg-pop button')].filter(b=>/^Release anyway/.test(b.textContent.trim())).pop(); b&&b.click(); })()"); await pg.wait_for_timeout(700)
async def upto_released(pg):
    rid = await upto_ops_done(pg); await flow_rt(pg, rid); await flow_release(pg, rid); return rid
