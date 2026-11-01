/* ============================== Parsec kit (px-) ==============================
   The parts every page stands on: one status list, the icons, keys, switches, chips and popovers,
   the nav rail with the clock and you at the bottom, the profile page, signing in and out, and the
   end-of-day backup. Pages move onto these as each one is redone. */
var PXI = /*__PXI__*/{};
var PX_LOGO = '<svg viewBox="-110 -110 220 220" aria-hidden="true"><circle r="14" class="c"/><circle cx="44" r="9.5"/><circle cx="-44" r="9.5"/><circle cx="22" cy="38" r="9.5"/><circle cx="-22" cy="38" r="9.5"/><circle cx="22" cy="-38" r="9.5"/><circle cx="-22" cy="-38" r="9.5"/><circle cy="-84" r="7" class="o"/><circle cy="84" r="7" class="o"/><circle cx="73" cy="42" r="7" class="o"/><circle cx="-73" cy="42" r="7" class="o"/><circle cx="73" cy="-42" r="7" class="o"/><circle cx="-73" cy="-42" r="7" class="o"/></svg>';
function pxI(k, sz){ var b = PXI[k] || (typeof IVI !== "undefined" && IVI[k]); if(!b) return ''; sz = sz || 16;
  return '<svg class="px-ic" width="'+sz+'" height="'+sz+'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+b+'</svg>'; }
function pxKbd(k){ return '<span class="px-kbd">'+esc(k)+'</span>'; }
function pxKeys(k){ return String(k).split(/\s+/).filter(Boolean).map(pxKbd).join(''); }
function pxSw(on){ return '<span class="px-sw'+(on ? ' on' : '')+'" aria-hidden="true"><i></i></span>'; }
function pxSwRow(action, on, label, sub, attrs){
  return '<button class="px-sr" data-action="'+action+'"'+(attrs || '')+' role="switch" aria-checked="'+(on ? 'true' : 'false')+'"><span class="n"><b>'+esc(label)+'</b>'+(sub ? '<small>'+esc(sub)+'</small>' : '')+'</span>'+pxSw(on)+'</button>'; }
function pxSeg(items, cur, action, attr){
  return '<span class="px-seg" role="group">' + items.map(function(it){ var on = it[0] === cur;
    return '<button class="'+(on ? 'on' : '')+'" data-action="'+action+'" '+attr+'="'+esc(it[0])+'" aria-pressed="'+on+'">'+(it[2] ? pxI(it[2], 12) : '')+esc(it[1])+'</button>'; }).join('') + '</span>'; }
function pxLS(k, v){ try{ if(v === undefined) return localStorage.getItem(k); if(v === null) localStorage.removeItem(k); else localStorage.setItem(k, v); }catch(e){} return null; }
function pxAgo(iso){ if(!iso) return ''; var d = new Date(iso), n = new Date(), t = fmtTime(iso);
  if(d.toDateString() === n.toDateString()) return 'today ' + t;
  var y = new Date(n); y.setDate(n.getDate() - 1); if(d.toDateString() === y.toDateString()) return 'yesterday ' + t;
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) + ' ' + t; }

/* ---------- one status list: a name, a color, who moves it ----------
   tone → color: working green · waiting amber · customer teal · support violet · problem red · hold grey · done green · acc bronze.
   "later" statuses are known to every check (a staged part is a part in hand) but not offered in menus until the Parts page gets them. */
var PX_STATUS = {
  ro: [
    { k: "Hold Tech", t: "hold", who: "Tech" },
    { k: "Working", t: "working", who: "Tech · the clock" },
    { k: "Waiting – Parts", t: "waiting", who: "Parts" },
    { k: "Waiting – Foreman", t: "waiting", who: "Foreman" },
    { k: "Waiting – Tech Support", t: "support", who: "Tech support" },
    { k: "Waiting – Customer", t: "customer", who: "Service writer" },
    { k: "Complete – Road test", t: "done", who: "Tech" },
    { k: "Complete – Released", t: "done", who: "Triage" },
    { k: "Declined", t: "hold", who: "Service writer" }
  ],
  job: [
    { k: "Hold Tech", t: "hold", who: "Foreman’s order" },
    { k: "Working", t: "working", who: "the clock" },
    { k: "Waiting – Parts", t: "waiting", who: "Parts" },
    { k: "Waiting – Foreman", t: "waiting", who: "Foreman" },
    { k: "Waiting – Tech Support", t: "support", who: "Tech support" },
    { k: "Waiting – Customer", t: "customer", who: "Service writer" },
    { k: "Waiting – Approval", t: "customer", who: "Service writer" },
    { k: "Complete", t: "done", who: "Tech" }
  ],
  part: [
    { k: "Not Ordered", t: "hold", who: "Parts" },
    { k: "Ordered", t: "waiting", who: "Parts" },
    { k: "Backordered", t: "problem", who: "Parts" },
    { k: "Received", t: "done", who: "Parts", inHand: true },
    { k: "Staged", t: "acc", who: "Parts", inHand: true, later: true },
    { k: "Picked up", t: "working", who: "Tech", inHand: true, later: true },
    { k: "Installed", t: "done", who: "Tech", inHand: true },
    { k: "Returned", t: "hold", who: "Parts", later: true, gone: true }
  ]
};
function pxSt(key, grp){
  var L = grp ? PX_STATUS[grp] || [] : PX_STATUS.ro.concat(PX_STATUS.job, PX_STATUS.part);
  for(var i = 0; i < L.length; i++) if(L[i].k === key) return L[i];
  return null;
}
function pxTone(key, grp){ var s = pxSt(key, grp); return s ? s.t : (/^Waiting/.test(key || "") ? "waiting" : /^Complete/.test(key || "") ? "done" : "hold"); }
function pxChip(key, grp, txt){ return '<span class="px-chip t-'+pxTone(key, grp)+'"><i></i>'+esc(txt || key || "")+'</span>'; }
/* a part is in hand once it is received — staged, picked up or installed all count */
function pxPartIn(p){ var s = pxSt(p && p.status, "part"); return !!(s && s.inHand); }
function pxPartKeys(all){ return PX_STATUS.part.filter(function(s){ return all || !s.later; }).map(function(s){ return s.k; }); }
