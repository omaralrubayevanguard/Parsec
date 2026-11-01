/* Parsec · settings · settings-page.js
   One Settings page (16.2 C): the groups (Me · The shop · People & access · Data · Automations · Shortcuts), the old places that link in (SG_OLD), small helpers the registry's rows use.
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   sgSec sgJ sgCopy sgK sgSame sgAnd sgMe sgByName sgHrs sgShopDay sgPt sgPtRow … (16 functions, 3 constants)
   state      ptSet setLog techName
   uses       access/ pages/foreman/ pages/warranty/ ro/ shell/ state/
*/
/* ============================== Parsec 16.2 (C) — one Settings page ==============================
   Every setting from the nine places it used to live (Profile & settings, the person pop-over, the app menu,
   Automations, Manager → Shop settings, the Foreman and Warranty pop-overs, Parts setup, Admin, Edit templates)
   is one row in a small registry, SG_REG: id, group, label, help, who can change it, where it shows, the default,
   and get / set — the same setters the old places used, so what a change does is the same as before.
   The page groups them by who they're for (Me · The shop · People & access · Data · Automations, and Shortcuts as a
   reference), with a menu down the side, search over labels, help and values that jumps to the row and lights it
   for 2 s, a who + where line on each row, a dot on what's changed from the default with Reset (one row or the whole
   group), and Recently changed — who changed what, when — with Undo on each (STATE.setLog, the settings topic file).
   Someone without the permission sees the row read-only: "Only the manager can change this". */
var SG_GROUPS = [
  ["me", "user", "Me", "look, size, tooltips, sign-out"],
  ["shop", "settings", "The shop", "money, the shop day, hand-offs, warranty, parts"],
  ["people", "lock", "People & access", "roles, pages, PINs, sign-in"],
  ["data", "save", "Data", "folder, backups, export"],
  ["auto", "bolt", "Automations", "what Parsec does by itself"],
  ["keys", "keyTag", "Shortcuts", "every key — for reference"]
];
var SG_OLD = { you: "me", sign: "me", look: "me", tools: "auto", admin: "people" };   /* the old section names still open the right group */
function sgSec(s){ s = SG_OLD[s] || s; return s === "recent" || SG_GROUPS.some(function(g){ return g[0] === s; }) ? s : "me"; }
function sgJ(v){ try{ return JSON.stringify(v === undefined ? null : v); }catch(e){ return ""; } }
function sgCopy(v){ return v === undefined ? null : JSON.parse(sgJ(v)); }
var SG_META = { updatedAt: 1, updatedBy: 1 };   /* the data store's marks on a record — not part of the setting */
function sgK(v){ try{ return JSON.stringify(v === undefined ? null : v, function(k, x){ return SG_META[k] ? undefined : x; }); }catch(e){ return ""; } }
function sgSame(a, b){ return sgK(a) === sgK(b); }
function sgAnd(L){ return L.length < 2 ? (L[0] || "") : L.slice(0, -1).join(", ") + " and " + L[L.length - 1]; }
function sgMe(){ return viewAsStaff(); }
function sgByName(){ var me = sgMe(); return me ? me.name : (String(STATE.techName || "").trim() || "Admin"); }
function sgHrs(){ var L = []; for(var q = 5; q <= 20; q += 0.5) L.push([q, fmHM(q)]); return L; }
function sgShopDay(){ var sc = typeof SHOP_CAL !== "undefined" && SHOP_CAL ? SHOP_CAL : null, b = sc && sc.breaks && sc.breaks[0];
  return { start: sc ? sc.dayStart / 60 : 7, end: sc ? sc.dayEnd / 60 : 16, lunch: b ? [b[0] / 60, b[1] / 60] : [11.5, 12.5] }; }
function sgPt(){ return STATE.ptSet && typeof STATE.ptSet === "object" ? STATE.ptSet : (STATE.ptSet = {}); }
function sgPtRow(k, sub, label, ph){ return { id: "shop.pt." + k, g: "shop", sub: "Parts", label: label, help: sub, who: "p.order", where: "Parts › " + (/^(sup|del)/.test(k) ? "Order and Desk" : /^bin/.test(k) ? "Shelf view and the Returns tags" : "Returns"),
  kind: "text", ph: ph, def: "", get: function(){ return String(sgPt()[k] || ""); }, set: function(v){ v = String(v || "").trim(); if(v) sgPt()[k] = v; else delete sgPt()[k]; },
  text: function(v){ return v || "default — " + ph; } }; }
function sgWaNum(k, label, unit, help, sub){ return { id: "shop.wa." + k, g: "shop", sub: "Warranty", label: label, help: help || "", who: "w.claim", where: sub || "Warranty › the claim list — late turns orange",
  kind: "num", unit: unit, def: ({ file: 30, resub: 10, ask: 4, ts: 24, pre: 4, claim: 14, paid: 10, keep: 30, pa: 1500, wo: 500 })[k],
  get: function(){ return +waCfg()[k]; }, set: function(v){ if(+v > 0) waCfg()[k] = +v; }, ok: function(v){ return +v > 0; } }; }
function sgOnOff(v){ return v === undefined || v === null ? "as the role" : v ? "on" : "off"; }
function sgCh(b, a, name, val){   /* the first change or two between b and a, said plainly: [from, to] */
  var P = sgDiff(b, a, [], []); if(!P.length) return null;
  var N = P.slice(0, 2).map(function(p){ return name(p); }), more = P.length > 2 ? " and " + (P.length - 2) + " more" : "";
  if(P.length === 1) return [N[0] + ": " + val(sgAt(b, P[0]), P[0]), val(sgAt(a, P[0]), P[0])];
  return [N.join("; ") + more, "changed"];
}
function sgRoleOf(id){ return staffList().filter(function(sf){ return sf.id === id; })[0] || null; }
