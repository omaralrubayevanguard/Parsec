const fs=require('fs'),vm=require('vm'),D=__dirname;
const ctx={console,Date,Math,JSON,Promise,setTimeout};vm.createContext(ctx);
vm.runInContext(fs.readFileSync(D+'/helpers.js','utf8').replace(/module.exports=.*$/m,''),ctx);
ctx.document={addEventListener(){},documentElement:{classList:{add(){},remove(){}}}};
vm.runInContext(fs.readFileSync(D+'/../b9/imp1.js','utf8')+';this.IMPX=IMPX;',ctx);
const X=ctx.IMPX; let fails=0;
const ok=(c,m)=>{ if(!c){ fails++; console.log('FAIL',m);} };
for(const f of process.argv.slice(2)){
  const P=X.parse(fs.readFileSync(D+'/'+f,'utf8'));
  console.log('==',f, X.describe(P));
  console.log(JSON.stringify(P.f));
  P.ops.forEach(o=>console.log(' op',o.no,o.name,'|',o.hours,o.price,o.approval,'|',o.label,o.opCode,o.vmrs,o.skill,o.priceCode,'| story:',o.storyBy,o.story.slice(0,40),'| parts:',o.parts.map(p=>[p.pn,p.desc,p.qty,p.price,p.core,p.ext,p.salesman].join('/')).join(' ; ')));
  if(P.parts.length) console.log(' loose parts',JSON.stringify(P.parts));
  P.notes.forEach(n=>console.log(' note',n.kind,n.by,n.at,n.text));
  console.log(' totals',JSON.stringify(P.totals));
}
