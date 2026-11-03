# Parsec 16.3 (B) — a peek on RO links (0.5 s, content, hides on leave / Esc / scroll / click, inside a shadow root, flips above
# near the bottom, a click on it opens the RO); the RO page's number copies on click (header and truck card); the contact in the
# header (Copy the number · Edit the contact · Copy a text from the Triage templates; Add contact when there's none); a bay's top
# view belongs to the picture the RO shows (own side only or a photo → the picture itself); a new check-in photo asks once.
import asyncio, os, sys, json
sys.argv = sys.argv[:2] if len(sys.argv) > 1 else ['x', 't12_163b.html']
_src = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "t127p.py")).read().split("async def main():")[0]
exec(_src)
OUT = os.path.join(H, "shots163b"); os.makedirs(OUT, exist_ok=True)
CLIP = "(()=>{ window.__clip=null; try{ Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: t=>{ window.__clip=t; return Promise.resolve(); } } }); }catch(e){} })()"
async def jtoast(pg): return await pg.evaluate(J("const t=R.getElementById('toast') || R.querySelector('.px-toast, .toast'); return t ? t.textContent : ''"))
async def jclick(pg, sel):
    r = await pg.evaluate(J(f"const b=R.querySelector({json.dumps(sel)}); if(!b) return false; b.click(); return true;")); await pg.wait_for_timeout(300); return r
async def menu_items(pg):
    return await pg.evaluate(J("const p=R.querySelector('.v163b-pop'); if(!p) return null; return [...p.children].map(x=>({ t: (x.textContent||'').trim(), tpl: x.getAttribute('data-v163b-tpl'), cls: x.className }))"))
async def main():
    async with async_playwright() as p:
        b, pg, errs = await setup(p)
        sw = await pg.evaluate("__tg.staffList().filter(s=>s.role==='Service writer')[0].id")
        await pg.evaluate(SIGN(sw)); await pg.wait_for_timeout(300)
        await pg.evaluate(CLIP)
        L = await pg.evaluate("""(()=>{ const S=__tg.STATE(); const L=S.ros.filter(r=>!r.shop && r.id!=='shop' && !r.dateClosed && __tg.trkModelFor(r) && !__tg.trkPhotoOf(r));
          L.forEach(r=>{ delete r.trkUse; delete r.trkAsked; delete r.trkOwn; }); return L.slice(0, 6).map(r=>({ id: r.id, no: r.roNumber, cu: r.customerName, unit: r.unitNumber })); })()""")
        ok(len(L) >= 6, f"six open ROs with a model picture and no photo ({len(L)})")
        A = L[0]
        await pg.evaluate(f"(()=>{{ const r=__tg.getRO('{A['id']}'); r.contactName='Dave Miller'; r.contactPhone='3365550142'; }})()")
        await pg.evaluate(f"(()=>{{ const U=__tg.UI(); U.view='ros'; U.selectedRo='{A['id']}'; __tg.render(); }})()"); await pg.wait_for_timeout(1000)
        # ---------- the contact in the header ----------
        hd = await pg.evaluate(J("const w=R.querySelector('.px-head .v163b-who'), c=R.querySelector('.rop-rail .rop-ct'); if(!w || !c) return null; return { cu: (w.querySelector('.v163b-cu')||{}).textContent, ct: c.textContent, inHead: !!R.querySelector('.px-head .v163b-ct') }"))
        ok(hd and hd["cu"] == A["cu"] and "Dave Miller" in hd["ct"] and "(336) 555-0142" in hd["ct"] and not hd["inHead"], f"17.3: the header shows the customer; the contact and the phone, formatted, are in the right column ({hd})")
        await pg.screenshot(path=OUT + "/b1_header.png", clip={"x": 236, "y": 0, "width": 1204, "height": 60})
        # ---------- the RO number copies (header, truck card) ----------
        await jclick(pg, ".px-crumb .px-id")
        c1 = await pg.evaluate("window.__clip"); t1 = await jtoast(pg)
        cp = await pg.evaluate(J("const b=R.querySelector('.px-crumb .px-id'); return { cls: b.className, role: b.getAttribute('role'), tag: b.tagName }"))
        ok(c1 == A["no"] and ("Copied " + A["no"]) in t1, f"a click on the header's RO number copies it with a Copied toast ({c1!r}, {t1!r})")
        ok("is-copied" in cp["cls"] and cp["role"] == "button" and cp["tag"] != "A", f"…shows a tick, and is a copy button, not a link ({cp})")
        await pg.evaluate("window.__clip=null")
        await jclick(pg, ".px-ro__eyebrow .px-id")
        c2 = await pg.evaluate("window.__clip")
        ok(c2 == A["no"], f"the truck card's RO number copies too ({c2!r})")
        await pg.evaluate(J("const b=R.querySelector('.px-crumb .px-id'); b.focus();")); await pg.evaluate("window.__clip=null"); await pg.keyboard.press("Enter"); await pg.wait_for_timeout(200)
        ok(await pg.evaluate("window.__clip") == A["no"], "Enter on the focused RO number copies it")
        # ---------- the contact menu ----------
        await jclick(pg, ".rop-ct__r[aria-haspopup]")
        M = await menu_items(pg)
        ts = [m["t"] for m in (M or [])]
        tpls = [m for m in (M or []) if m["tpl"]]
        ok(M and any(t.startswith("Copy the number") for t in ts) and any(t.startswith("Edit the contact") for t in ts) and any(t.startswith("Copy a text to Dave") for t in ts), f"the menu: Copy the number · Edit the contact · Copy a text to Dave ({ts})")
        ok(len(tpls) == 4 and sum(1 for m in tpls if "suggested" in m["t"]) == 1, f"…with each Triage template, one marked suggested ({[m['t'] for m in tpls]})")
        box = await pg.evaluate(J("const p=R.querySelector('.v163b-pop').getBoundingClientRect(); return [p.left, p.top, p.right, p.bottom, innerWidth, innerHeight]"))
        ok(box[0] >= 0 and box[1] >= 0 and box[2] <= box[4] and box[3] <= box[5], f"the menu stays on screen ({box})")
        await pg.screenshot(path=OUT + "/b2_menu.png", clip={"x": 236, "y": 0, "width": 1204, "height": 420})
        await pg.evaluate(J("[...R.querySelectorAll('.v163b-pop .px-menu__item')].find(x=>/Copy the number/.test(x.textContent)).click()")); await pg.wait_for_timeout(250)
        ok(await pg.evaluate("window.__clip") == "(336) 555-0142", "Copy the number copies the formatted number")
        await jclick(pg, ".rop-ct__r[aria-haspopup]")
        await pg.evaluate(J("R.querySelector('.v163b-pop [data-v163b-tpl=rdy]').click()")); await pg.wait_for_timeout(250)
        tx = await pg.evaluate("window.__clip") or ""; t3 = await jtoast(pg)
        ok(tx.startswith("Hi Dave,") and ("unit " + str(A["unit"])) in tx and "ready" in tx, f"a template copies, filled in for this RO and the contact ({tx[:90]!r})")
        ok("Ready for pickup" in t3, f"…and says which text was copied ({t3!r})")
        # Edit: the two fields, phone focused, Enter saves (Undo-able)
        await jclick(pg, ".rop-ct__r[aria-haspopup]")
        await pg.evaluate(J("[...R.querySelectorAll('.v163b-pop .px-menu__item')].find(x=>/Edit the contact/.test(x.textContent)).click()")); await pg.wait_for_timeout(350)
        ed = await pg.evaluate(J("const p=R.querySelector('.v163b-ed'); if(!p) return null; const i=[...p.querySelectorAll('input')]; return { n: i.length, v: i.map(x=>x.value), foc: R.activeElement ? R.activeElement.getAttribute('aria-label') : null }"))
        ok(ed and ed["n"] == 3 and ed["v"] == ["Dave Miller", "3365550142", ""] and ed["foc"] == "Phone", f"Edit the contact opens Contact, Phone and Email, the phone focused ({ed})")
        await pg.keyboard.press("Control+a"); await pg.keyboard.type("336-555-0199"); await pg.keyboard.press("Enter"); await pg.wait_for_timeout(400)
        v = await pg.evaluate(f"__tg.getRO('{A['id']}').contactPhone")
        hd2 = await pg.evaluate(J("return (R.querySelector('.rop-ct')||{}).textContent || ''"))
        act = await pg.evaluate(f"JSON.stringify((__tg.STATE().audit||[]).slice(-3))")
        ok(v in ("336-555-0199", "(336) 555-0199") and "(336) 555-0199" in hd2, f"Enter saves the new phone and the header shows it ({v!r}, {hd2!r})")
        ok("Phone" in act, f"…through the RO details table (an Activity line) ({act[:160]})")
        await pg.keyboard.press("Control+z"); await pg.wait_for_timeout(500)
        ok(await pg.evaluate(f"__tg.getRO('{A['id']}').contactPhone") == "3365550142", "Ctrl+Z puts the old phone back")
        # no contact: Add contact → the name field first
        B = L[1]
        await pg.evaluate(f"(()=>{{ const r=__tg.getRO('{B['id']}'); delete r.contactName; delete r.contactPhone; const U=__tg.UI(); U.view='ros'; U.selectedRo='{B['id']}'; __tg.render(); }})()"); await pg.wait_for_timeout(900)
        add = await pg.evaluate(J("const b=R.querySelector('.rop-ct__ed'); return b ? b.textContent.trim() : null"))
        ok(add == "Add", f"no contact: a quiet Add on the contact card ({add!r})")
        await jclick(pg, ".rop-ct__ed")
        foc = await pg.evaluate(J("return R.activeElement ? R.activeElement.getAttribute('aria-label') : null"))
        await pg.keyboard.type("Tony Ruiz"); await pg.keyboard.press("Tab"); await pg.keyboard.type("336 555 0177"); await pg.keyboard.press("Tab"); await pg.keyboard.type("tony@ruiz.example"); await pg.keyboard.press("Enter"); await pg.wait_for_timeout(400)
        r2 = await pg.evaluate(f"(()=>{{ const r=__tg.getRO('{B['id']}'); return [r.contactName, r.contactPhone]; }})()"); em2 = await pg.evaluate(f"__tg.getRO('{B['id']}').contactEmail")
        ok(foc == "Contact" and r2 in (["Tony Ruiz", "336 555 0177"], ["Tony Ruiz", "(336) 555-0177"]), f"Add contact: the name first, then the phone, Enter saves ({foc}, {r2})")
        ok(em2 == "tony@ruiz.example" and "tony@ruiz.example" in (await pg.evaluate(J("return (R.querySelector('.rop-ct')||{}).textContent || ''"))), f"17.3: the email saves and shows on the card ({em2!r})")
        ok("(336) 555-0177" in (await pg.evaluate(J("return (R.querySelector('.rop-ct')||{}).textContent || ''"))), "…and the contact card shows them")
        # ---------- the peek ----------
        await pg.evaluate(f"""(()=>{{ document.body.insertAdjacentHTML('beforeend', '<span id="pkA" class="ro-lnk" data-rolnk="{A['id']}" style="position:fixed;left:520px;top:300px;padding:4px 6px;z-index:5000;background:#fff">{A['no']}</span>'); }})()""")
        await pg.mouse.move(20, 880); await pg.wait_for_timeout(200)
        await pg.hover("#pkA"); await pg.wait_for_timeout(250)
        ok(await pg.evaluate("!document.querySelector('.v163b-pk')"), "no peek before half a second")
        await pg.wait_for_timeout(500)
        pk = await pg.evaluate("""(()=>{ const w=document.querySelector('.v163b-pk'); if(!w) return null; const r=w.getBoundingClientRect(), a=document.getElementById('pkA').getBoundingClientRect();
          return { t: w.textContent, pic: !!w.querySelector('.trk-th img'), st: !!w.querySelector('.pgst'), below: r.top >= a.bottom, in: r.left >= 0 && r.right <= innerWidth && r.bottom <= innerHeight }; })()""")
        ok(pk and A["no"] in pk["t"] and A["cu"] in pk["t"] and "Opened" in pk["t"] and ("Unit " + str(A["unit"])) in pk["t"], f"after half a second, a peek: number, opened, customer, unit ({(pk or {}).get('t','')[:120]!r})")
        ok(pk and pk["pic"] and pk["st"] and "Dave Miller · (336) 555-0142" in pk["t"], f"…the RO's picture, its status and the contact ({pk and (pk['pic'], pk['st'])})")
        ok(pk and pk["below"] and pk["in"], f"…under the link, on screen ({pk and (pk['below'], pk['in'])})")
        same = await pg.evaluate(f"""(()=>{{ const w=document.querySelector('.v163b-pk img'); const P=__tg.trkPick(__tg.getRO('{A['id']}')); return !!w && w.getAttribute('src') === P.src; }})()""")
        ok(same, "the peek's picture is the RO's own picture (trkPick)")
        await pg.screenshot(path=OUT + "/b3_peek.png", clip={"x": 480, "y": 270, "width": 420, "height": 170})
        await pg.mouse.move(520 + 20, 300 + 40); await pg.wait_for_timeout(150)   # onto the card
        ok(await pg.evaluate("!!document.querySelector('.v163b-pk')"), "moving onto the card keeps it")
        await pg.mouse.move(1200, 700); await pg.wait_for_timeout(200)
        ok(await pg.evaluate("!document.querySelector('.v163b-pk')"), "leaving hides it")
        await pg.hover("#pkA"); await pg.wait_for_timeout(750); await pg.keyboard.press("Escape"); await pg.wait_for_timeout(100)
        ok(await pg.evaluate("!document.querySelector('.v163b-pk')"), "Esc hides it")
        await pg.mouse.move(1200, 700); await pg.hover("#pkA"); await pg.wait_for_timeout(750); await pg.evaluate("document.dispatchEvent(new Event('scroll'))"); await pg.wait_for_timeout(100)
        ok(await pg.evaluate("!document.querySelector('.v163b-pk')"), "scrolling hides it")
        await pg.mouse.move(1200, 700); await pg.hover("#pkA"); await pg.wait_for_timeout(750); await pg.mouse.down(); await pg.mouse.up(); await pg.wait_for_timeout(100)
        ok(await pg.evaluate("!document.querySelector('.v163b-pk')"), "a click on the link hides it (the click is the link's)")
        # near the bottom: above the link
        await pg.evaluate(f"""(()=>{{ document.body.insertAdjacentHTML('beforeend', '<span id="pkB" class="ro-lnk" data-rolnk="{L[2]['id']}" style="position:fixed;left:1300px;bottom:6px;padding:4px 6px;z-index:5000;background:#fff">{L[2]['no']}</span>'); }})()""")
        await pg.mouse.move(1200, 700); await pg.hover("#pkB"); await pg.wait_for_timeout(750)
        up = await pg.evaluate("(()=>{ const w=document.querySelector('.v163b-pk'); if(!w) return null; const r=w.getBoundingClientRect(), a=document.getElementById('pkB').getBoundingClientRect(); return { above: r.bottom <= a.top, in: r.left >= 0 && r.right <= innerWidth && r.top >= 0 }; })()")
        ok(up and up["above"] and up["in"], f"near the bottom right it opens above, on screen ({up})")
        # inside a shadow root
        await pg.evaluate(f"""(()=>{{ const h=document.createElement('div'); h.id='pkHost'; h.style.cssText='position:fixed;left:200px;top:500px;z-index:5000'; document.body.appendChild(h);
          const s=h.attachShadow({{ mode: 'open' }}); s.innerHTML='<span class="ro-lnk" data-rolnk="{L[3]['id']}" style="display:inline-block;padding:4px 6px;background:#fff">{L[3]['no']}</span>'; }})()""")
        await pg.mouse.move(1200, 700); await pg.wait_for_timeout(100); await pg.mouse.move(215, 510); await pg.wait_for_timeout(750)
        sh = await pg.evaluate("(()=>{ const w=document.querySelector('.v163b-pk'); return w ? w.textContent : null; })()")
        ok(sh and L[3]["no"] in sh, f"a link inside a shadow root peeks too ({(sh or '')[:60]!r})")
        # a click on the card opens the RO
        await pg.evaluate("(()=>{ const w=document.querySelector('.v163b-pk'); if(w) w.click(); })()"); await pg.wait_for_timeout(500)
        op = await pg.evaluate("(()=>{ const U=__tg.UI(); return [U.view, U.selectedRo, !!document.querySelector('.v163b-pk')]; })()")
        ok(op == ["ros", L[3]["id"], False], f"a click on the card opens that RO ({op})")
        await pg.evaluate("['pkA','pkB','pkHost'].forEach(i=>{ const e=document.getElementById(i); if(e) e.remove(); })")
        # ---------- the top view of the RO's own picture ----------
        C = L[4]
        t0 = await pg.evaluate(f"""(()=>{{ const r=__tg.getRO('{C['id']}'), P=__tg.trkPick(r), T=__tg.trkTopOf(r); return {{ k: P.kind, pe: P.entry && P.entry.id, te: T && T.entry.id, top: !!(P.entry && P.entry.top), bay: __tg.trkBayTop(r) }}; }})()""")
        ok(t0["k"] == "model" and (t0["te"] == t0["pe"] if t0["top"] else t0["te"] is None), f"the top view belongs to the picture the RO shows ({t0['pe']} → {t0['te']})")
        ok(("fm-ti top" in t0["bay"]) == bool(t0["top"]), "…and the bay draws it from above")
        PX = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
        t1 = await pg.evaluate(f"""(()=>{{ const r=__tg.getRO('{C['id']}'); r.trkOwn={{ side: '{PX}', top: '', cut: 0, at: new Date().toISOString() }}; const P=__tg.trkPick(r), T=__tg.trkTopOf(r); return {{ k: P.kind, own: !!P.own, t: T, bay: __tg.trkBayTop(r) }}; }})()""")
        ok(t1["own"] and t1["t"] is None and "trk-th" in t1["bay"] and "fm-ti top" not in t1["bay"], f"own side picture without a top: the bay shows that picture, not the model's top ({t1['t']}, {t1['bay'][:60]})")
        t1b = await pg.evaluate(f"""(()=>{{ const r=__tg.getRO('{C['id']}'); r.trkOwn.top='{PX}'; const T=__tg.trkTopOf(r); return T && T.entry.id; }})()""")
        ok(t1b == "own-" + C["id"], f"own side and top: its own top ({t1b})")
        t2 = await pg.evaluate(f"""(()=>{{ const r=__tg.getRO('{C['id']}'); delete r.trkOwn; r.attachments=(r.attachments||[]).concat([{{ id: 'phC', name: 'IMG_2001.jpg', type: 'image/jpeg' }}]); r.trkUse='photo'; r.trkAsked=1;
          const P=__tg.trkPick(r); return {{ k: P.kind, t: __tg.trkTopOf(r), bay: __tg.trkBayTop(r), yard: __tg.trkYardTop(r) }}; }})()""")
        ok(t2["k"] == "photo" and t2["t"] is None and "trk-th ph" in t2["bay"] and t2["yard"] == "", f"showing the check-in photo: no model top in the bay or the yard ({t2['k']}, {t2['bay'][:50]})")
        # ---------- a new check-in photo asks once ----------
        D, E = L[5], L[2]
        await pg.evaluate("(()=>{ const U=__tg.UI(); U.view='rolist'; __tg.render(); })()"); await pg.wait_for_timeout(1500)   # seen without photos
        ok(await pg.evaluate("!document.querySelector('.v163b-ask')"), "nothing asks for photos that were already there")
        await pg.evaluate(f"(()=>{{ const r=__tg.getRO('{D['id']}'); r.attachments=(r.attachments||[]).concat([{{ id: 'phD1', name: 'IMG_2041.jpg', type: 'image/jpeg' }}]); }})()")
        await pg.wait_for_timeout(1700)
        ak = await pg.evaluate("(()=>{ const w=document.querySelector('.v163b-ask'); return w ? { ro: w.getAttribute('data-ro'), t: w.textContent, b: [...w.querySelectorAll('[data-v163b-use]')].map(x=>x.getAttribute('data-v163b-use')), img: !!w.querySelector('[data-v163b-use=model] img[src]') } : null; })()")
        ok(ak and ak["ro"] == D["id"] and D["no"] in ak["t"] and "model picture or this photo" in ak["t"], f"the first check-in photo asks: the model picture or this photo ({(ak or {}).get('t','')[:80]!r})")
        ok(ak and ak["b"] == ["later", "model", "photo"] and ak["img"], f"…with Not now, Model (its picture) and This photo ({ak and ak['b']})")
        await pg.screenshot(path=OUT + "/b4_ask.png", clip={"x": 1060, "y": 640, "width": 380, "height": 260})
        await pg.click(".v163b-ask [data-v163b-use=photo]"); await pg.wait_for_timeout(300)
        r4 = await pg.evaluate(f"(()=>{{ const r=__tg.getRO('{D['id']}'); return [r.trkUse, r.trkAsked, !!document.querySelector('.v163b-ask')]; }})()")
        ok(r4 == ["photo", 1, False], f"This photo: the RO shows its photo, and it's marked asked ({r4})")
        await pg.evaluate(f"(()=>{{ const r=__tg.getRO('{D['id']}'); r.attachments=r.attachments.filter(a=>a.id!=='phD1'); }})()"); await pg.wait_for_timeout(1400)
        await pg.evaluate(f"(()=>{{ const r=__tg.getRO('{D['id']}'); r.trkUse=undefined; r.attachments=r.attachments.concat([{{ id: 'phD2', name: 'IMG_2042.jpg', type: 'image/jpeg' }}]); }})()"); await pg.wait_for_timeout(1700)
        ok(await pg.evaluate("!document.querySelector('.v163b-ask')"), "it asks only once per RO")
        await pg.evaluate(f"(()=>{{ const r=__tg.getRO('{E['id']}'); r.attachments=(r.attachments||[]).concat([{{ id: 'phE1', name: 'IMG_3001.jpg', type: 'image/jpeg' }}]); }})()"); await pg.wait_for_timeout(1700)
        ok(await pg.evaluate(f"(()=>{{ const w=document.querySelector('.v163b-ask'); return !!w && w.getAttribute('data-ro')==='{E['id']}'; }})()"), "another RO's first photo asks for that RO")
        await pg.click(".v163b-ask [data-v163b-use=later]"); await pg.wait_for_timeout(300)
        r5 = await pg.evaluate(f"(()=>{{ const r=__tg.getRO('{E['id']}'); return [r.trkUse || null, r.trkAsked, __tg.trkPick(r).kind]; }})()")
        ok(r5 == [None, 1, "model"], f"Not now: asked, nothing changes — the model picture stays ({r5})")
        await pg.evaluate(f"(()=>{{ const r=__tg.getRO('{L[1]['id']}'); r.trkUse='model'; r.attachments=(r.attachments||[]).concat([{{ id: 'phB1', name: 'IMG_4001.jpg', type: 'image/jpeg' }}]); }})()"); await pg.wait_for_timeout(1700)
        ok(await pg.evaluate("!document.querySelector('.v163b-ask')"), "an RO that already chose isn't asked")
        await pg.keyboard.press("Control+z"); await pg.wait_for_timeout(300)
        ok(not errs, f"no page errors ({errs[:3]})")
        await b.close()
    print("\n" + ("ALL OK" if not FAILS else f"{len(FAILS)} FAILED"))
asyncio.run(main())
