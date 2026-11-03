# Parsec 17.3 (G) — Cause and Correction on the operation card, filled from the tech notes: in the Time tab beside the notes, the
# notes split by order (first half Cause, the rest Correction) and underlined amber / green; a click on a sentence moves it; the lines
# fill as you type; a line changed by hand stays, and when the notes change it asks; ✦ suggests; Copy the story; saved on the operation
# (two marked entries in the operation’s work log), so Warranty and Fixes read them as before. Invented data only.
import asyncio, os, sys, json
from playwright.async_api import async_playwright
H = os.path.dirname(os.path.abspath(__file__))
PAGE = sys.argv[1] if len(sys.argv) > 1 else "t12.html"
FAILS = []
def ok(c, m):
    print(("ok   " if c else "FAIL ") + m)
    if not c: FAILS.append(m)
SETUP = """(() => { const S = __tg.S(), r = S.ros.find(r => !r.shop && !r.dateClosed && r.operations.length && !S.punches.some(p => p.roId === r.id && !p.stop));
  const o = r.operations[0]; o.cause = ''; o.correction = ''; delete o.ccAuto; delete o.ccHand; delete o.ccTag; o.log = []; o.work = ''; o.offNotes = []; o.complaint = 'Air leak at the rear brakes';
  S.punches = S.punches.filter(p => p.opId !== o.id); const t = Date.now() - 5 * 3600e3;
  S.punches.push({ id: 'pc1', roId: r.id, opId: o.id, tech: 'Mike Rodriguez', start: new Date(t).toISOString(), stop: new Date(t + 3600e3).toISOString(), startReason: 'Diagnosing', stopReason: 'Hold Tech', notes: 'Air leak at the rear brake chamber.\\nFound the diaphragm ruptured, leak test failed.' });
  S.punches.push({ id: 'pc2', roId: r.id, opId: o.id, tech: 'Mike Rodriguez', start: new Date(t + 2 * 3600e3).toISOString(), stop: new Date(t + 3 * 3600e3).toISOString(), startReason: 'Repairing', stopReason: 'Hold Tech', notes: 'Replaced both rear brake chambers, set the slack adjusters. Leak test OK.' });
  const U = __tg.UI(); U.view = 'ros'; U.selectedRo = r.id; U.roOpen = {}; U.roOpen[r.id] = [o.id]; U.ivTab = U.ivTab || {}; U.ivTab[o.id] = 'time'; __tg.render(); return r.id; })()"""
R = "document.querySelector('.jc-host:not(.jc-band-host)').shadowRoot"
OP = "(x => __tg.getRO(x).operations[0])"
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await (await b.new_context(viewport={"width": 1440, "height": 1300})).new_page(); errs = []
        pg.on("pageerror", lambda e: errs.append(str(e)[:300]))
        await pg.route("**/fonts.g*/**", lambda r: r.abort())
        await pg.goto("file://" + os.path.join(H, PAGE)); await pg.wait_for_timeout(1200)
        await pg.evaluate("__tg.loadSample25()"); await pg.evaluate("__tg.pxSignedIn && __tg.pxSignedIn()"); await pg.wait_for_timeout(300)
        rid = await pg.evaluate(SETUP); await pg.wait_for_timeout(1400)
        cc = await pg.evaluate("x => { const o = " + OP + "(x); return [__tg.ccLine(o, 'c'), __tg.ccLine(o, 'x')]; }", rid)
        ok(cc[0] == "Air leak at the rear brake chamber. Found the diaphragm ruptured, leak test failed." and cc[1] == "Replaced both rear brake chambers, set the slack adjusters. Leak test OK.", "by order: the first half is the Cause, the rest the Correction — saved on the operation (%s)" % cc)
        ui = await pg.evaluate("(() => { const r = " + R + "; const p = r.querySelector('.rop-ccg .rop-cc'); return p ? [[...p.querySelectorAll('.rop-ccr .rop-cct-t')].map(x => x.textContent), r.querySelectorAll('.rop-ccs.is-c').length, r.querySelectorAll('.rop-ccs.is-x').length, !!p.querySelector('.rop-cccp')] : null; })()")
        ok(ui and ui[0] == list(cc) and ui[1] == 2 and ui[2] == 2 and ui[3], "the Time tab: the two lines beside the notes, 2 sentences amber, 2 green, Copy the story (%s)" % (ui and ui[1:]))
        # click a sentence → Neither
        await pg.evaluate("(() => { const r = " + R + "; [...r.querySelectorAll('.rop-ccs')].find(x => /^Air leak/.test(x.textContent)).click(); })()"); await pg.wait_for_timeout(300)
        mi = await pg.evaluate("(() => { const r = " + R + "; return [...r.querySelectorAll('.rop-ccpop .px-menu__item')].map(x => x.textContent.trim()); })()")
        ok(any("Neither" in x for x in mi), "a click on a sentence asks Cause · Correction · Neither (%s)" % mi)
        await pg.evaluate("(() => { const r = " + R + "; [...r.querySelectorAll('.rop-ccpop .px-menu__item')].find(x => /Neither/.test(x.textContent)).click(); })()"); await pg.wait_for_timeout(500)
        c2 = await pg.evaluate("x => __tg.ccLine(" + OP + "(x), 'c')", rid)
        sp = await pg.evaluate("x => __tg.ccSplit(" + OP + "(x)).all.map(s => s.to)", rid)
        ok(sp[0] == "n" and "Air leak" not in c2, "the complaint sentence is in neither line now (%s, %r)" % (sp, c2))
        # as you type
        await pg.evaluate("(() => { const r = " + R + ", t = r.querySelector('.rop-ta'); t.value = 'Cause: chafed air line at the frame rail.'; t.dispatchEvent(new Event('input', { bubbles: true })); })()"); await pg.wait_for_timeout(900)
        lv = await pg.evaluate("(() => { const r = " + R + "; return r.querySelector('.rop-ccr.is-c .rop-cct-t').textContent; })()")
        ok("chafed air line" in lv, "typing a note fills the line half a second later (%r)" % lv)
        await pg.evaluate("(() => { const r = " + R + ", t = r.querySelector('.rop-ta'); t.value = ''; t.dispatchEvent(new Event('input', { bubbles: true })); })()"); await pg.wait_for_timeout(700)
        # by hand, then the notes change → ask
        await pg.evaluate("(() => { const t = " + R + ".querySelector('.rop-ccr.is-c .rop-cct-t'); t.focus(); t.textContent = 'Diaphragm ruptured (checked by Frank).'; t.blur(); })()"); await pg.wait_for_timeout(700)
        hn = await pg.evaluate("x => [__tg.ccLine(" + OP + "(x), 'c'), !!" + R + ".querySelector('.rop-ccr.is-c .rop-ccyo'), !!" + R + ".querySelector('.rop-ccask')]", rid)
        ok(hn[0] == "Diaphragm ruptured (checked by Frank)." and hn[1] and not hn[2], "a line changed by hand stays, marked yours, no question yet (%s)" % hn)
        await pg.evaluate("x => { const S = __tg.S(), p = S.punches.find(p => p.id === 'pc1'); p.notes += '\\nFound the hose chafed too.'; __tg.render(); }", rid); await pg.wait_for_timeout(500)
        await pg.evaluate("(() => { const t = [..." + R + ".querySelectorAll('.px-tab')].find(x => x.dataset.tab === 'time'); t && t.click(); })()"); await pg.wait_for_timeout(500)
        ak = await pg.evaluate("(() => { const a = " + R + ".querySelector('.rop-ccr.is-c .rop-ccask'); return a ? a.textContent : ''; })()")
        ok("Notes changed — refill Cause?" in ak and "Keep mine" in ak, "the notes changed: it asks (%r)" % ak)
        await pg.evaluate("(() => { [..." + R + ".querySelectorAll('.rop-ccask button')].find(b => b.textContent === 'Refill').click(); })()"); await pg.wait_for_timeout(500)
        rf = await pg.evaluate("x => [__tg.ccLine(" + OP + "(x), 'c'), !!(" + OP + "(x).ccHand || {}).c]", rid)
        ok("hose chafed" in rf[0] and not rf[1], "Refill takes the notes again (%s)" % rf)
        # nothing found
        await pg.evaluate("x => { const S = __tg.S(); S.punches.find(p => p.id === 'pc2').notes = ''; __tg.ccTag(" + OP + "(x), 'air leak at the rear brake chamber', ''); __tg.render(); }", rid); await pg.wait_for_timeout(500)
        # ✦ and copy
        await pg.evaluate("(() => " + R + ".querySelector('.rop-ccsp').click())()"); await pg.wait_for_timeout(400)
        sg = await pg.evaluate("(() => { const r = " + R + "; return [r.querySelectorAll('.rop-ccr.is-sug').length, !!r.querySelector('.rop-ccsug')]; })()")
        ok(sg[0] == 2 and sg[1], "✦ fills both lines as a suggestion with Accept and Dismiss (%s)" % sg)
        await pg.evaluate("(() => { [..." + R + ".querySelectorAll('.rop-ccsug button')].find(b => b.textContent === 'Dismiss').click(); })()"); await pg.wait_for_timeout(300)
        st = await pg.evaluate("x => __tg.ccStory(" + OP + "(x))", rid)
        ok(st.startswith("Complaint: Air leak at the rear brakes.\nCause: ") and "\nCorrection: " in st, "Copy the story: Complaint · Cause · Correction (%r)" % st[:90])
        # warranty / fixes read the saved lines
        ws = await pg.evaluate("x => { const o = " + OP + "(x); return [(o.log || []).filter(l => l.cc).map(l => l.kind).sort().join(','), __tg.opStory ? __tg.opStory(o, 'cause') === __tg.ccLine(o, 'c') : true]; }", rid)
        ok(ws[0] == "cause,fix" and ws[1], "saved in the operation's work log, where Warranty and Fixes read them (%s)" % ws)
        ok(not errs, "no page errors: %s" % errs[:2])
        await b.close()
    print("FAILS:", len(FAILS), FAILS)
    sys.exit(1 if FAILS else 0)
asyncio.run(main())
