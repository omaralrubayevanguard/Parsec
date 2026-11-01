/* ============================== Parsec 14 (B) — automation toasts that name the RO, spots by their code, nothing loaded from outside ==============================
   · An automation's toast names the RO ("Automation · RO 8877 → Hold tech"). It never wipes a message you just got: within 3 s it's added to
     that one ("Not complete yet — 3 parts not installed … · RO 8877 → Hold tech"). An undo, a reload or a file just opened changes things
     quietly — no toast for what happened on load.
   · A typed or imported location finds its spot by the code the yard shows: "UpTime 2" or "UP" → the UpTime bay, "B4" → Bay 4 (when there's
     no lot row B), "AW2" → Awning 2, "W3" → arrival line 3, "T2" → triage lane 2.
   · People show their initials, or the photo they uploaded — no stock portraits (they came from randomuser.me), no drawn faces.
   · The hidden assistant can't call out: nothing it has is sent off this computer. */
var V14_AT = { t: 0, msg: "", swap: false, t0: Date.now() };
(function(o){ pushToast = function(msg){ V14_AT.t = Date.now(); V14_AT.msg = msg; return o.apply(this, arguments); }; })(pushToast);
(function(o){ autoRun = function(){ V14_AT.swap = typeof AUTO_FOR !== "undefined" && !!AUTO_SHADOW && AUTO_FOR !== STATE; try{ return o.apply(this, arguments); } finally { V14_AT.swap = false; } }; })(autoRun);
function v14ActTxt(ro, a){
  var no = "RO " + (typeof tgNum === "function" ? tgNum(ro) : (ro && ro.roNumber) || ""), L = function(s){ return typeof pgStLabel === "function" ? pgStLabel("ro", s) : s; };
  if(a.a === "roStatus") return no + " → " + L(a.v) + (a.sub ? " · " + a.sub : "");
  if(a.a === "jobStatus"){ var op = a.op ? getOp(ro.id, a.op) : null, n = op ? (ro.operations || []).indexOf(op) + 1 : 0; return no + (n ? " · Op " + n : "") + " → " + L(a.v); }
  return no + " · " + autoActText(a);
}
function v14AutoToast(ro, sg){
  if(V14_AT.swap || Date.now() - V14_AT.t0 < 2500) return;          /* an undo, a reload, the file just opened: quiet */
  if(!ro || ro.shop || (typeof SHOP_RO_ID !== "undefined" && ro.id === SHOP_RO_ID)) return;   /* shop time isn’t a truck — nothing to say */
  var t = (sg.acts || []).map(function(a){ return v14ActTxt(ro, a); }).join(" · "); if(!t) return;
  var recent = !!UI.toast && UI.toast === V14_AT.msg && Date.now() - V14_AT.t < 3000;
  if(recent && String(V14_AT.msg).indexOf(t) >= 0) return;
  var pre = typeof opReoTake === "function" ? opReoTake() : "";
  if(recent) pushToast(String(V14_AT.msg).replace(/\s+$/, "") + " · " + t, true);   /* added to what you were just told, never over it */
  else pushToast(pre + "Automation · " + t, true);
}
/* a location → the yard spot, by the code the yard shows too */
(function(o){ spotOf = function(loc){
  var s = String(loc || "").trim(), m; if(!s) return null;
  if(/^up(?:\s*-?\s*time)?(?:\s*bay)?\s*#?\s*\d{0,2}$/i.test(s)) return "UpTime";
  if((m = /^aw(?:ning)?\s*#?\s*(\d+)$/i.exec(s))) return "Awning " + (+m[1]);
  var r = o.apply(this, arguments);
  if(r && (m = /^Lot ([A-Z])(\d+)$/.exec(r))){
    var rows = []; try{ rows = (yardCfg().rows || []).map(function(x){ return String(x.id).toUpperCase(); }); }catch(e){}
    if(rows.indexOf(m[1]) < 0){ if(m[1] === "B") return "Bay " + (+m[2]); if(m[1] === "W") return "Ready " + (+m[2]); if(m[1] === "T") return "Triage " + (+m[2]); }
  }
  return r;
}; })(spotOf);
/* people: initials, or their own uploaded photo */
staffPhotoUrl = function(){ return ""; };
staffAvHtml = function(sf, cls){
  var inner = sf && sf.photo ? '<img alt="" src="' + esc(sf.photo) + '">' : "";
  return '<span class="' + cls + ' avx' + (inner ? '' : ' ini') + '">' + (inner || esc(profileInitials(sf && sf.name)) + ' ') + '</span>';   /* the space keeps "MR" apart from the name in copied text */
};
