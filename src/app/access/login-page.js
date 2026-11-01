/* Parsec · access · login-page.js
   The login page: one tile per person, the running clocks, the shop name.
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   lgClocksHtml lgTile lgLoginHtml (3 functions)
   uses       clock/ kit/ ro/
*/
/* ---------- the login page ---------- */
function lgClocksHtml(){
  var R = runningPunches(), L = [], seen = [];
  R.forEach(function(p){ var w = punchOwner(p), shop = false; try{ shop = isShopPunch(p); }catch(e){} seen.push(w);
    L.push('<div class="pxs-clk"><i class="lg-cd ' + (shop ? "lgs" : "lgj") + '"></i><b>' + esc(pcName(w)) + '</b><span>' + esc(shop ? "shop time" : "on " + roTag(getRO(p.roId))) + '</span><em>since ' + esc(lgClk(p.start)) + '</em></div>'); });
  try{ pcMigrate(); }catch(e){}
  shiftList().forEach(function(s){ if(s.out) return; var w = shiftOwner(s); if(seen.some(function(x){ return sameOwner(x, w); })) return; seen.push(w);
    L.push('<div class="pxs-clk"><i class="lg-cd lgd"></i><b>' + esc(pcName(w)) + '</b><span>on the day clock</span><em>since ' + esc(lgClk(s.in)) + '</em></div>'); });
  if(!L.length) return "";
  return '<div class="pxs-clks lg-clks" data-key="pxs-clks"><small>' + (L.length === 1 ? "A clock is running" : L.length + " clocks are running") + '</small>' + L.join("") + '<p>Signing in or out never stops one.</p></div>';
}
function lgTile(sf){
  var on = lgOn(sf);
  return '<button class="pxs-p lg-t" data-action="viewas-set" data-id="' + sf.id + '" title="' + esc(sf.name || "") + ' — sign in"><span class="lg-avw">' + staffAvHtml(sf, "pxs-av", "s") + (on ? '<i class="lg-dot lg' + on.k.charAt(0) + '" title="' + esc(on.t) + '"></i>' : '') + '</span><b>' + esc(sf.name || "Unnamed") + '</b><small' + (on && on.k === "job" ? ' class="on"' : '') + '>' + esc(lgLine(sf)) + '</small><span class="pin" title="Asks for a PIN">' + lgIc("lock", 12) + '</span></button>';
}
function lgLoginHtml(){
  var all = lgSignable(), rec = recentStaff(4), recIds = rec.map(function(s){ return s.id; }), n = lgNow(), groups = [];
  Object.keys(DEPT_OF).forEach(function(role){ var g = all.filter(function(sf){ return sf.role === role && recIds.indexOf(sf.id) < 0; }); if(g.length) groups.push([DEPT_OF[role], g]); });
  var other = all.filter(function(sf){ return !DEPT_OF[sf.role] && recIds.indexOf(sf.id) < 0; }); if(other.length) groups.push(["Other", other]);
  var brand = '<aside class="lg-brand"><div class="lg-mark"><span class="lg">' + PX_LOGO + '</span><b>Parsec</b></div><div class="lg-shop">' + esc(lgShop()) + '</div>'
    + '<div class="lg-time" data-lg-time><b><span data-lg-t>' + n.t + '</span><em>' + n.ap + '</em></b><span data-lg-d>' + esc(n.d) + '</span></div>' + lgClocksHtml() + '</aside>';
  var main = '<section class="lg-main"><h2>Who’s signing in?</h2><p>Pick your name, then your PIN.</p>';
  if(!all.length) main += '<p class="pxs-none">No one is set up yet — sign in as Admin, then add people on the Admin page.</p>';
  if(rec.length) main += '<div class="pxs-gl lg-gl">Recent on this computer</div><div class="pxs-pp lg-pp">' + rec.map(lgTile).join("") + '</div>';
  groups.forEach(function(g){ main += '<div class="pxs-gl lg-gl">' + esc(g[0]) + '</div><div class="pxs-pp lg-pp">' + g[1].map(lgTile).join("") + '</div>'; });
  main += '<div class="lg-foot"><button class="lg-adm" data-action="viewas-reset">' + lgIc("shield", 13) + 'Admin</button><span>·</span><span>Forgot your PIN? The admin can reset it.</span></div></section>';
  return '<div class="px pxs lgp" data-key="px-signin">' + brand + main + '</div>';
}
