# screenshots of fork T's pages for a look
import asyncio, os, sys, json
sys.argv = sys.argv[:2] if len(sys.argv) > 1 else ['x', 't12_tt.html']
_src = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "_t14t.py")).read()
_src = _src[:_src.index("async def main():\n")]
exec(_src)
async def main():
    async with async_playwright() as p:
        b, pg, errs = await setup(p)
        await pg.evaluate(ADMIN); await pg.wait_for_timeout(500)
        X = await pg.evaluate(PICK); A = X["a"]
        for v, extra, n in [("triage", "U.tgView='inbox';", "s1_tg_inbox"), ("triage", f"U.tgView='desk'; U.tgSel='{A}';", "s2_tg_desk"), ("triage", "U.tgView='yard';", "s3_tg_yard"),
                            ("foreman", "U.fmView='techs';", "s4_fm_techs"), ("warranty", "U.waView='board';", "s5_wa_board"), ("warranty", "U.waView='claims';", "s6_wa_claims")]:
            await view(pg, v, extra); await pg.screenshot(path=os.path.join(OUT, n + ".png"))
        await ro_page(pg, A)
        await pg.evaluate(J("const r=R.querySelector('.px-row'); if(r) r.click();")); await pg.wait_for_timeout(500)
        await pg.screenshot(path=os.path.join(OUT, "s7_ro_parts.png"))
        await pg.evaluate(J("const b=R.querySelector('.px-status--button'); if(b) b.click();")); await pg.wait_for_timeout(400)
        await pg.screenshot(path=os.path.join(OUT, "s8_ro_stmenu.png"))
        await pg.keyboard.press("Escape")
        await view(pg, "triage", f"U.tgView='desk'; U.tgSel='{A}';")
        await pg.evaluate(f"__tg.tgOpenPop('release', '{A}')"); await pg.wait_for_timeout(500)
        await pg.screenshot(path=os.path.join(OUT, "s9_release.png"))
        await pg.evaluate(f"__tg.tgOpenPop('checks', '{A}')"); await pg.wait_for_timeout(500)
        await pg.screenshot(path=os.path.join(OUT, "s10_checks.png"))
        print("ERRORS", errs[:5])
        await b.close()
asyncio.run(main())
