/* Parsec · library · codes.js
   Fault codes in every form (P105E, P1050 FTB 17, 3226/2, MID 128 PID 110 FMI 0): reading what was typed, the label and chip text, what a code means from the Library or the built-in J1939 list.
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   libCodeParse libCodeStore libMidSub libCodeKey libCodeSame libCodeLabel libCodeShort libCodeRow libCodeMeaning libCodeSymptoms libCodesIn LIB_SPN … (11 functions, 3 constants)
   state      libCodes
   uses       state/
*/
/* ============================== the fault codes (Parsec 17.1) ==============================
   One reader for every way a code is written, and one place that says what a code means.
   Shapes kept on an operation (job.faults) and in the Library:
     { code: "P1050", ftb: 17 }          a P / C / B / U code, its FTB optional (Volvo writes P1050 FTB 17)
     { spn: 3226, fmi: 2 }               J1939
     { mid: 128, pid: 110, fmi: 0 }      J1587 (pid, psid or sid)
   Saved faults from before 17.1 ({code} or {spn, fmi}) read the same. */

/* the standard J1939 meanings that come built in; the rest are read from the bulletins put in the Library */
var LIB_SPN = { 84: "Vehicle speed", 91: "Accelerator pedal position", 94: "Fuel delivery pressure", 97: "Water in fuel", 100: "Engine oil pressure",
  102: "Boost pressure", 105: "Intake manifold temperature", 110: "Engine coolant temperature", 111: "Engine coolant level", 157: "Fuel rail pressure",
  168: "Battery voltage", 190: "Engine speed", 411: "EGR differential pressure", 412: "EGR temperature", 3031: "DEF tank temperature",
  3216: "Aftertreatment NOx, intake", 3226: "Aftertreatment NOx, outlet", 3251: "DPF differential pressure", 3719: "DPF soot load",
  4364: "SCR catalyst conversion efficiency", 5246: "SCR operator inducement" };
var LIB_FMI = ["above normal (most severe)", "below normal (most severe)", "erratic or intermittent", "voltage high or shorted high", "voltage low or shorted low",
  "current low or open circuit", "current high or grounded", "mechanical fault", "abnormal frequency", "abnormal update rate", "abnormal rate of change",
  "root cause not known", "bad device", "out of calibration", "special instructions", "above normal (least severe)", "above normal (moderate)",
  "below normal (least severe)", "below normal (moderate)", "network data in error"];
var LIB_SYS = { P: "Powertrain", C: "Chassis", B: "Body", U: "Network" };

/* ---------- reading what was typed ---------- */
/* P105E, p1050 ftb17, P1050-17, SPN 3226 FMI 2, 3226/2, MID 128 PID 110 FMI 0 → a code, or null */
function libCodeParse(str){
  var s = String(str || "").toUpperCase().replace(/[“”"'’]/g, "").replace(/\s+/g, " ").trim();
  if(!s) return null;
  /* a P / C / B / U code: the letter, a digit, then three digits or letters (Volvo's P105E) — and an FTB after it, if given */
  var d = /^([PCBU])\s?-?\s?([0-9][0-9A-Z]{3})(?:\s?(?:[-:\/.,]|FTB|\s)\s?(?:FTB)?\s?(\d{1,3}))?$/.exec(s);
  if(d){ var o = { code: d[1] + d[2] }; if(d[3] != null){ var ftb = +d[3]; if(ftb > 255) return null; o.ftb = ftb; } return o; }
  /* J1587: MID 128 PID 110 FMI 0 (PSID and SID too) */
  var m = /^MID\s?(\d{1,3})[\s,\/-]*(PID|PPID|PSID|SID)\s?(\d{1,4})(?:[\s,\/-]*FMI\s?(\d{1,2}))?$/.exec(s);
  if(m){ var r = { mid: +m[1], fmi: m[4] != null ? +m[4] : null }; r[m[2].toLowerCase()] = +m[3]; if(r.fmi != null && r.fmi > 31) return null; return r; }
  /* J1939: SPN 3226 FMI 2, 3226/2, 3226-2 */
  var j = /^(?:SPN\s?)?(\d{1,6})\s?(?:\/|-|:|,|\s|FMI)\s?(?:FMI\s?)?(\d{1,2})$/.exec(s);
  if(j){ var fmi = +j[2]; return fmi > 31 ? null : { spn: +j[1], fmi: fmi }; }
  return null;
}
/* what is kept on an operation: the code and a record id */
function libCodeStore(f){
  var o = { id: "fc_" + Math.random().toString(36).slice(2, 10) };
  ["code", "ftb", "spn", "fmi", "mid", "pid", "ppid", "psid", "sid"].forEach(function(k){ if(f[k] != null) o[k] = f[k]; });
  return o;
}
function libMidSub(f){ return f.pid != null ? ["PID", f.pid] : f.psid != null ? ["PSID", f.psid] : f.sid != null ? ["SID", f.sid] : f.ppid != null ? ["PPID", f.ppid] : null; }
/* the code without its FTB / FMI — what the Library knows a meaning for */
function libCodeKey(f){
  if(!f) return "";
  if(f.code) return f.code;
  if(f.mid != null){ var s = libMidSub(f); return "MID " + f.mid + (s ? " " + s[0] + " " + s[1] : ""); }
  if(f.spn != null) return "SPN " + f.spn;
  return "";
}
function libCodeSame(a, b){
  if(!a || !b || libCodeKey(a) !== libCodeKey(b)) return false;
  return (a.code ? (a.ftb == null ? null : a.ftb) === (b.ftb == null ? null : b.ftb) : (a.fmi == null ? null : a.fmi) === (b.fmi == null ? null : b.fmi));
}
/* P1050 · FTB 17 · SPN 3226 · FMI 2 · MID 128 · PID 110 · FMI 0 */
function libCodeLabel(f){
  if(!f) return "";
  if(f.code) return f.code + (f.ftb != null ? " · FTB " + f.ftb : "");
  if(f.mid != null){ var s = libMidSub(f); return "MID " + f.mid + (s ? " · " + s[0] + " " + s[1] : "") + (f.fmi != null ? " · FMI " + f.fmi : ""); }
  return "SPN " + f.spn + " · FMI " + f.fmi;
}
/* the chip's short form: P1050 · 17 · 3226/2 · 128/110/0 */
function libCodeShort(f){
  if(!f) return "";
  if(f.code) return f.code + (f.ftb != null ? " · " + f.ftb : "");
  if(f.mid != null){ var s = libMidSub(f); return f.mid + "/" + (s ? s[1] : "?") + (f.fmi != null ? "/" + f.fmi : ""); }
  return f.spn + "/" + f.fmi;
}

/* ---------- what a code means ---------- */
/* the Library's entry for a code (read from a bulletin), or null */
function libCodeRow(f){
  var k = typeof f === "string" ? f : libCodeKey(f);
  if(!k) return null;
  var L = STATE.libCodes || [];
  for(var i = 0; i < L.length; i++) if(L[i] && L[i].key === k) return L[i];
  return null;
}
/* "TCM · Transmission range, position — voltage above normal, or shorted to high source" */
function libCodeMeaning(f){
  if(!f) return "";
  var row = libCodeRow(f);
  if(f.code){
    if(row){
      var ft = f.ftb != null && row.ftb ? row.ftb[String(f.ftb)] : null;
      return (row.mod ? row.mod + " · " : "") + row.title + (ft ? " — " + String(ft.d || "").replace(/^./, function(c){ return c.toLowerCase(); }) : (f.ftb != null ? " — FTB " + f.ftb : ""));
    }
    return (LIB_SYS[f.code.charAt(0)] || "Fault") + " code" + (f.ftb != null ? " · FTB " + f.ftb : "") + " — not in the Library yet";
  }
  var fm = f.fmi == null ? "" : f.fmi === 31 ? "condition exists" : (LIB_FMI[f.fmi] || "FMI " + f.fmi);
  if(f.mid != null) return (row ? (row.mod ? row.mod + " · " : "") + row.title : "MID " + f.mid + " code") + (fm ? " — " + fm : "");
  var name = row ? row.title : (LIB_SPN[f.spn] || "SPN " + f.spn);
  return (row && row.mod ? row.mod + " · " : "") + name + (fm ? " — " + fm : "");
}
/* the symptoms the bulletin lists for this code and FTB, when it has them */
function libCodeSymptoms(f){
  var row = libCodeRow(f); if(!row || !row.ftb) return "";
  var ft = f && f.ftb != null ? row.ftb[String(f.ftb)] : null;
  return ft && ft.s ? ft.s : "";
}

/* ---------- finding codes inside a document's text ---------- */
/* every code a text mentions, as keys: ["P1050", "SPN 3226", "MID 128 PID 110"]; skip = the document's own number */
function libCodesIn(text, skip){
  var t = String(text || ""), seen = {}, out = [], add = function(k){ if(k && !seen[k] && k !== skip){ seen[k] = 1; out.push(k); } };
  t.replace(/\b([PCBU][0-9][0-9A-F]{3})\b/g, function(m, c){ if(/[0-9]{4}/.test(c.slice(1)) || /[A-F]/.test(c.slice(2))) add(c); return m; });
  t.replace(/\bSPN\s*:?\s*(\d{1,6})\b/gi, function(m, n){ add("SPN " + (+n)); return m; });
  t.replace(/\bMID\s*:?\s*(\d{1,3})\s*,?\s*(PID|PPID|PSID|SID)\s*:?\s*(\d{1,4})\b/gi, function(m, a, b, c){ add("MID " + (+a) + " " + b.toUpperCase() + " " + (+c)); return m; });
  return out;
}
