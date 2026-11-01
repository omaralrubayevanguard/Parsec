# Parsec 12.4 — the operation clock card (the clock card mock-up's picks), the same card on the RO page and the Technician page.
# The card: b9/v124.js (markup, the ticker, holding to stop) + b9/ock.css; the RO page's side: b9/ock_jc.js (inside the RO page's closure).
# Runs inside build12.py after build_v123.py: uses js, rep, b9, json, EXTRA_CSS, HOOK_NAMES, LOG.
# the card's code goes in ahead of the page modules (the Technician page's module hands it its callbacks when it loads)
js = rep(js, "\nvar PG = (function(){\n", "\n" + b9("v124.js") + "\nvar PG = (function(){\n")
# the RO page: its time card is the shared card now
js = rep(js, "function pxTime(job) {\n", b9("ock_jc.js") + "\nfunction pxTime(job) { return ockJc(job); }   /* Parsec 12.4 */\nfunction pxTimeOld(job) {\n")
# the start / stop reason pop-up sits by the card's button (it looked for the old card's timer and fell back to the middle)
js = rep(js, "var anchor = card && card.querySelector('.timer');", "var anchor = R.querySelector('.ock[data-op=\"' + job.id + '\"] .ock-side') || (card && card.querySelector('.timer'));")
if js.count("    const tm = `<div class=\"tch-tm\">") == 1:   # Parsec 14.3: the Technician page's own clock card went (the RO page's is mounted there)
    # the Technician page: the clock card in an open operation is the shared card; its start / stop / reason
    _t0 = js.index("    const tm = `<div class=\"tch-tm\">")
    _t1 = js.index("\n", _t0)
    assert js.count("    const tm = `<div class=\"tch-tm\">") == 1
    js = js[:_t0] + "    const tm = ockHtml(o.roId, o.id, { pg: 'tc', hr: 'tc', can: mine && !S.view, off: S.out ? 'You’re clocked out — clock in to start' : '' });   /* Parsec 12.4: the shared clock card */" + js[_t1:]
    js = rep(js, "  function tcOp(o, r){\n", """  /* Parsec 12.4: the shared clock card's start, stop and stop reason on this page */
      OCK_CB.tc = {
        start: function(roId, opId){ if(!S || S.view) return; const o = opBy(opId); if(!o || o.other) return; U.pop = null; startOp(o); },
        stop: function(roId, opId){ if(!S || S.view || !S.rp || S.rp.opId !== opId) return; H.stop(); },
        next: function(roId, opId){
          if(!S || S.view) return null; const n = nextOps().filter(x => x.id !== opId)[0]; if(!n) return null;
          const pa = ockParts(n.op), all = pa.every(x => x.inh), same = n.roId === roId;
          return { roId: n.roId, opId: n.id, t: (same ? 'Op ' + n.opn : n.no + ' · Op ' + n.opn) + ' · ' + n.cmp, q: n.q, sub: (same ? 'Same RO' : n.cust) + (pa.length ? (all ? ' · parts in hand' : ' · not all parts in') : '') + (n.paused ? ' · paused' : '') };
        },
        reason: function(roId, opId, pid, r){
          pushUndo('stop reason'); const res = ockSetReason(pid, r); if(!res) return;
          scheduleSave(true); PG.keepScroll(render);
          pushToast(res === true ? 'Stop reason: ' + r + '.' : 'Not complete yet — ' + res.map(x => x.t).join(' · ') + '. Stopped as Hold Tech.');
        }
      };
      function tcOp(o, r){
    """)
# the styles: one card, two palettes
_ock = b9("ock.css")
_doc = """.ock{--o-raised:var(--tg-raised,var(--raised));--o-hair:var(--tg-hair,var(--hairline));--o-ink:var(--tg-ink,var(--ink));--o-ink2:var(--tg-ink2,var(--ink-2));--o-ink3:var(--tg-ink3,var(--ink-3));--o-ink4:var(--tg-ink4,var(--ink-4));
  --o-fill:var(--tg-fill,var(--fill));--o-sel:var(--tg-sel,var(--fill));--o-good:var(--tg-good,var(--good));--o-good-t:var(--tg-good-t,color-mix(in srgb,var(--good) 12%,transparent));--o-warn:var(--tg-warn,var(--warn));
  --o-bad:var(--tg-bad,var(--bad));--o-bad-t:var(--tg-bad-t,color-mix(in srgb,var(--bad) 12%,transparent));--o-run:var(--tg-st-working,var(--good));--o-pri:var(--tg-primary,var(--primary));--o-onpri:var(--tg-onprimary,var(--on-primary));
  --o-acc:var(--tg-acc,var(--accent));--o-mono:var(--tg-mono,var(--font-mono));--o-sans:var(--tg-sans,var(--font-sans));
  --o-acct:var(--tg-acct,var(--accent-tint,color-mix(in srgb,var(--accent) 12%,transparent)));--o-acctx:var(--tg-acctx,var(--accent));--o-accl:var(--tg-accl,color-mix(in srgb,var(--accent) 30%,transparent));--o-canvas:var(--tg-canvas,var(--surface));--o-line:var(--tg-border,var(--line));}
@media (max-width:760px){ .ock-kv{grid-template-columns:repeat(2,minmax(0,1fr));} .ock-big{font-size:28px;} .ock{padding:14px 14px 12px;} .ock-lp,.ock-tip{display:none;} .ock:not(.ock-fxp) .ock-side{flex-direction:column;gap:4px;align-self:start;} .ock:not(.ock-fxp) .ock-tools{flex-direction:row;} .ock:not(.ock-fxp) .ock-hint{order:9;font-size:10.5px;} }
:root[data-device="phone"] .ock-kv{grid-template-columns:repeat(2,minmax(0,1fr));}
:root[data-device="phone"] .ock-big{font-size:28px;}
:root[data-device="phone"] .ock{padding:14px 14px 12px;}
:root[data-device="phone"] .ock-lp,:root[data-device="phone"] .ock-tip{display:none;}
:root[data-device="phone"] .ock:not(.ock-fxp) .ock-side{flex-direction:column;gap:4px;align-self:start;}
:root[data-device="phone"] .ock:not(.ock-fxp) .ock-tools{flex-direction:row;}
:root[data-device="phone"] .ock:not(.ock-fxp) .ock-hint{order:9;font-size:10.5px;}"""
_jcv = """.ock{--o-raised:var(--raised);--o-hair:var(--hairline);--o-ink:var(--ink);--o-ink2:var(--ink-2);--o-ink3:var(--ink-3);--o-ink4:var(--ink-4);--o-fill:var(--fill);--o-sel:var(--surface-2,var(--fill));
  --o-good:var(--good);--o-good-t:color-mix(in srgb,var(--good) 13%,transparent);--o-warn:var(--warn);--o-bad:var(--bad);--o-bad-t:color-mix(in srgb,var(--bad) 13%,transparent);--o-run:var(--good);
  --o-pri:var(--primary);--o-onpri:var(--on-primary);--o-acc:var(--accent);--o-mono:var(--font-mono);--o-sans:var(--font-sans);
  --o-acct:var(--accent-tint,color-mix(in srgb,var(--accent) 12%,transparent));--o-acctx:var(--accent);--o-accl:color-mix(in srgb,var(--accent) 30%,transparent);--o-canvas:var(--surface);--o-line:var(--line);}
.ock-k input.ock-qin{width:84px;height:28px;}
@container (max-width:560px){ .ock-kv{grid-template-columns:repeat(2,minmax(0,1fr));} .ock-big{font-size:28px;} .ock{padding:14px 14px 12px;} .ock-lp,.ock-tip{display:none;} .ock:not(.ock-fxp) .ock-side{flex-direction:column;gap:4px;align-self:start;} .ock:not(.ock-fxp) .ock-tools{flex-direction:row;} .ock:not(.ock-fxp) .ock-hint{order:9;font-size:10.5px;} }"""
EXTRA_CSS.append("/* Parsec 12.4 — the operation clock card */\n" + _ock + "\n" + _doc)
_jc0 = js.index('var JC_CSS = "'); _jc1 = js.index('";\n', _jc0)
js = js[:_jc1] + json.dumps("\n/* Parsec 12.4 — the operation clock card */\n" + _ock + "\n" + _jcv)[1:-1] + js[_jc1:]
HOOK_NAMES += ["ockHtml", "ockTickAll", "ockModel", "ockState", "OCK_ST", "OCK_CB", "ockSetReason", "ockAuto", "ockDay", "ockSim", "ockUsual", "ockNext", "ockFocusOpen", "ockFocusClose"]
LOG.append("Parsec 12.4: the operation clock card on the RO page and the Technician page")
