# Parsec 14.7 (A) — the RO page: pick parts on Parts on this RO too, Receive N / Install N for the picked parts (an operation's
# Parts tab or the whole RO — b9/rop1.js), and the Vehicle group's Build date, Warranty start, Opened and Closed (the RO details
# table, b9/v141.js). Here: the pick-box styles inside the RO page (b9/v147a.css → JC_CSS), and the New RO import reads
# Build date and Warranty start (b9/imp1.js stays as its generator writes it; patched in `js`). Runs inside build12.py.
_jc0 = js.index('var JC_CSS = "'); _jc1 = js.index('";\n', _jc0)
js = js[:_jc1] + json.dumps("\n" + b9("v147a.css"))[1:-1] + js[_jc1:]
for _a, _b in [
    (r'    ["engHours", /^engine\s*hours?(?=\s*:|\s*$|\s+\d)/i],',
     r'    ["built", /^(?:date\s*built|build\s*date|built(?:\s*(?:on|date))?|mfg\.?\s*date|manufactur(?:e|ed|ing)\s*date|production\s*date)(?=\s*[:#]|\s+\d|\s+[A-Z][a-z]{2}|\s*$)/i],   /* Parsec 14.7 */' + "\n"
     r'    ["warrStart", /^(?:warranty\s*(?:start|begin)s?(?:\s*date)?|in[\s-]*service(?:\s*date)?)(?=\s*[:#]|\s+\d|\s+[A-Z][a-z]{2}|\s*$)/i],' + "\n"
     r'    ["engHours", /^engine\s*hours?(?=\s*:|\s*$|\s+\d)/i],'),
    (r'|follow|created|case|tech)\b/i;', r'|follow|created|case|tech|build|built|date\s*built|mfg|manufactur\w*|production|warranty|in[\s-]*service)\b/i;'),
    (r'|Odometer|Mileage|Tag|Location|Department|Dept|Cust(?:omer)?)\s*(?:#|No\.?)?\s*:)/i;',
     r'|Odometer|Mileage|Tag|Location|Department|Dept|Build\s*Date|Date\s*Built|Mfg\.?\s*Date|Warranty\s*Start(?:\s*Date)?|In[\s-]*Service(?:\s*Date)?|Cust(?:omer)?)\s*(?:#|No\.?)?\s*:)/i;'),
    ('      case "location": case "dept": return v.replace(/\\s{2,}.*$/, "").slice(0, 30);\n      default: return v;',
     '      case "location": case "dept": return v.replace(/\\s{2,}.*$/, "").slice(0, 30);\n      case "built": case "warrStart": return mdyOf(v);   /* Parsec 14.7: kept MM-DD-YYYY, like the RO keeps them */\n      default: return v;'),
    ('  /* OCR reads 0 as O and 1 as I — a VIN has neither */',
     '''  /* Parsec 14.7: a day as the RO keeps it — MM-DD-YYYY — from 03/14/2020, 2020-03-14, Mar 14, 2020, 14 Mar 2020 or Mar 2020 */
  function mdyOf(v){ var s = String(v || "").trim(), m, M = { jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6, jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12 }, p2 = function(n){ return String(n).padStart(2, "0"); };
    var ok = function(y, mo, d){ y = +y; if(y < 100) y += 2000; mo = +mo; d = +d; return y >= 1980 && y <= new Date().getFullYear() + 2 && mo >= 1 && mo <= 12 && d >= 1 && d <= 31 ? p2(mo) + "-" + p2(d) + "-" + y : ""; };
    if((m = /\\b(\\d{4})[-\\/.](\\d{1,2})[-\\/.](\\d{1,2})\\b/.exec(s))) return ok(m[1], m[2], m[3]);
    if((m = /\\b(\\d{1,2})[-\\/.](\\d{1,2})[-\\/.](\\d{4}|\\d{2})\\b/.exec(s))) return ok(m[3], m[1], m[2]);
    if((m = /\\b([A-Za-z]{3})[a-z]*\\.?\\s+(\\d{1,2}),?\\s+(\\d{4})\\b/.exec(s)) && M[m[1].toLowerCase()]) return ok(m[3], M[m[1].toLowerCase()], m[2]);
    if((m = /\\b(\\d{1,2})\\s+([A-Za-z]{3})[a-z]*\\.?,?\\s+(\\d{4})\\b/.exec(s)) && M[m[2].toLowerCase()]) return ok(m[3], M[m[2].toLowerCase()], m[1]);
    if((m = /\\b([A-Za-z]{3})[a-z]*\\.?\\s+(\\d{4})\\b/.exec(s)) && M[m[1].toLowerCase()]) return ok(m[2], M[m[1].toLowerCase()], 1);
    return ""; }
  /* OCR reads 0 as O and 1 as I — a VIN has neither */'''),
    ('["engineHours", "Engine hours", G_TRUCK, "engHours", { num: 1 }],',
     '["engineHours", "Engine hours", G_TRUCK, "engHours", { num: 1 }], ["buildDate", "Build date", G_TRUCK, "built"], ["warrantyStart", "Warranty start", G_TRUCK, "warrStart"],'),
]:
    js = rep(js, _a, _b)
LOG.append("Parsec 14.7 (A): pick parts on the RO, Receive / Install them together; the Vehicle group's dates")
