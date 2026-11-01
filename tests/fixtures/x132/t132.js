// Parsec 14 (fork X) — the reader: every cost on an operation and a part, the engine serial, totals
const fs=require('fs'),vm=require('vm'),D=__dirname;
const ctx={console,Date,Math,JSON,Promise,setTimeout};vm.createContext(ctx);
vm.runInContext(fs.readFileSync(D+'/../imptest/helpers.js','utf8').replace(/module.exports=.*$/m,''),ctx);
ctx.document={addEventListener(){},documentElement:{classList:{add(){},remove(){}}}};
ctx.cleanOcrText = ctx.cleanOcrText || (t=>t);
vm.runInContext(fs.readFileSync(D+'/../b9/imp1.js','utf8')+';this.IMPX=IMPX;',ctx);
const X=ctx.IMPX; let fails=0, n=0;
const ok=(c,m)=>{ n++; console.log((c?'ok   ':'FAIL ')+m); if(!c) fails++; };
const R=f=>X.parse(fs.readFileSync(D+'/'+f,'utf8'));
const eq=(a,b)=>Math.abs((a||0)-(b||0))<.005;
// s1 — the case page with every money column
let P=R('s1_case.txt'), o=P.ops;
ok(P.f.engineSerial==='21987654', 'ESN: → engine serial ('+P.f.engineSerial+')');
ok(P.f.engine==='Volvo D13TC 455 HP', 'Engine stays the engine ('+P.f.engine+')');
ok(o.length===3, '3 operations ('+o.length+')');
ok(o[0].hours===6.2 && o[0].rate===210 && o[0].price===1302 && o[0].partsAmt===2100.4 && o[0].misc===35 && o[0].sublet==null && o[0].total===3437.4, 'op 1: hours, rate, labor, parts, misc, total — a blank Sublet cell skipped '+JSON.stringify([o[0].hours,o[0].rate,o[0].price,o[0].partsAmt,o[0].misc,o[0].sublet,o[0].total]));
ok(o[1].hours===1.3 && o[1].rate===165 && o[1].price===214.5 && o[1].total===762.5, 'op 2: its own labor rate '+JSON.stringify([o[1].hours,o[1].rate,o[1].price,o[1].total]));
ok(o[2].sublet===185 && o[2].total===290 && o[2].approval==='Pending', 'op 3: sublet '+JSON.stringify([o[2].sublet,o[2].total,o[2].approval]));
let p=o[0].parts[0], g=o[0].parts[1];
ok(p && p.pn==='VOL-23125678' && p.list===1980 && p.disc==='10%' && p.price===1782 && p.core===250 && p.ext===2032 && p.salesman==='Ryan Burke', 'part: list, disc, net, core, ext '+JSON.stringify(p));
ok(g && g.qty==='2' && g.price===34.2 && g.ext===68.4 && g.core===0, 'part qty 2 '+JSON.stringify(g));
ok(o[1].parts[0] && o[1].parts[0].price===548 && o[1].parts[0].list==null, 'list = net is just the price '+JSON.stringify(o[1].parts[0]));
let T=P.totals; ok(T && T.labor===1621.5 && T.parts===2398.4 && T.core===250 && eq(T.misc,232.5) && T.sublet===185 && T.tax===96.42 && T.total===4598.82, 'totals with tax on its own '+JSON.stringify(T));
// s2 — the amounts under each operation
P=R('s2_vertical.txt'); o=P.ops;
ok(o.length===2 && o[0].hours===3.5 && o[0].rate===210 && o[0].price===735 && o[0].partsAmt===1145 && o[0].misc===18 && o[0].total===1898, 'lines under an op: rate, parts, shop supplies, op total '+JSON.stringify(o[0]&&[o[0].hours,o[0].rate,o[0].price,o[0].partsAmt,o[0].misc,o[0].total]));
ok(o[0].parts.length===1 && o[0].parts[0].price===1145, 'its part');
ok(o[1] && o[1].sublet===95 && o[1].price===420 && o[1].approval==='Pending', 'op 2 sublet '+JSON.stringify(o[1]&&[o[1].sublet,o[1].price,o[1].approval]));
// s3 — no header: the sums decide
P=R('s3_noheader.txt'); o=P.ops;
ok(o.length===3, '3 ops ('+o.length+') '+o.map(x=>x.name).join(' | '));
ok(o[0] && o[0].hours===2 && o[0].price===420 && o[0].partsAmt===612 && o[0].total===1032, 'labor, parts, total with no header '+JSON.stringify(o[0]&&[o[0].hours,o[0].price,o[0].partsAmt,o[0].total]));
ok(o[1] && o[1].hours===.5 && o[1].price===105, 'hours and labor, no $ '+JSON.stringify(o[1]&&[o[1].hours,o[1].price,o[1].total]));
ok(o[2] && o[2].rate===210 && o[2].price===168 && o[2].partsAmt===96 && o[2].total===264 && o[2].name==='Replace air dryer cartridge', '"@ $210.00/hr" is the rate '+JSON.stringify(o[2]&&[o[2].name,o[2].hours,o[2].rate,o[2].price,o[2].partsAmt,o[2].total]));
ok(P.totals && P.totals.labor===693 && P.totals.parts===708 && P.totals.total===1401, 'inline "Totals: Labor … Parts … Total …" '+JSON.stringify(P.totals));
// the engine serial, every way it's labelled
const base='VIN: 4V4NC9EH7LN758560\nEngine: Volvo D13 455 HP\n';
for(const lb of ['Engine Serial: 79112233','Engine Serial Number: 79112233','Engine Serial #: 79112233','Engine S/N 79112233','Engine SN: 79112233','ESN: 79112233','ESN 79112233','Eng Serial #: 79112233','Eng. S/N: 79112233','Engine No.: 79112233','Engine Number: 79112233','Engine #: 79112233']){
  const f=X.parse(base+lb).f; ok(f.engineSerial==='79112233' && f.engine==='Volvo D13 455 HP', lb+' → '+f.engineSerial+' / '+f.engine); }
{ const f=X.parse('Engine: Volvo D13	Engine Serial #: 23116577	Engine Hours: 15,206').f; ok(f.engineSerial==='23116577' && f.engHours==='15206' && f.engine==='Volvo D13', 'on one line with Engine Hours '+JSON.stringify([f.engine,f.engineSerial,f.engHours])); }
{ const f=X.parse('Engine Volvo D13 455 HP   E5N 21987654').f; ok(f.engineSerial==='21987654', 'OCR "E5N" '+f.engineSerial); }
// the parts table reader the Parts list import uses
const Q=X.partsTable(fs.readFileSync(D+'/s4_quote.txt','utf8'));
ok(Q.length===4 && Q[3].pn==='' && Q[3].desc==='Shop rags (box)' && Q[3].list===12 && Q[3].price===9 && Q[0].list===48.5 && Q[0].price===36.38 && Q[0].ext===218.28 && Q[1].core===250 && Q[1].list===1980 && Q[1].price===1485 && Q[2].price===1782, 'quote: list, net, core, ext '+JSON.stringify(Q.map(x=>[x.pn,x.qty,x.list,x.price,x.core,x.ext])));
// money without $ or commas, core per unit
{ const Z=X.partsTable('Part #\tDescription\tQty\tUnit\tCore\tExt\nVOL-1234567\tInjector\t6\t412.50\t95.00\t3045.00'); ok(Z[0] && Z[0].price===412.5 && Z[0].core===95 && Z[0].ext===3045, 'core is per unit: 6 × (412.50 + 95.00) '+JSON.stringify(Z[0])); }
{ const Z=X.partsTable('Part #\tDescription\tQty\tUnit\tCore\tExt\nVOL-1234567\tInjector\t6\t412.50\t\t2475.00'); ok(Z[0] && Z[0].price===412.5 && Z[0].core===0 && Z[0].ext===2475, 'a blank Core cell '+JSON.stringify(Z[0])); }
console.log(fails ? 'FAILS '+fails+' of '+n : 'all '+n+' pass');
