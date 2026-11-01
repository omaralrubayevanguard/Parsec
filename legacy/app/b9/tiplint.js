/* Parsec 14.9 (W): run every static tooltip through tipNorm and flag the ones that still break a writing rule.
   node tiplint.js v149w.js strings.json → JSON { n, flagged: [{ raw, out, why }] } */
const fs = require('fs'), vm = require('vm');
const ctx = {}; ctx.window = ctx; vm.createContext(ctx);
vm.runInContext(fs.readFileSync(process.argv[2], 'utf8'), ctx);
const norm = ctx.tipNorm, L = JSON.parse(fs.readFileSync(process.argv[3], 'utf8'));
const KEEP = /^(RO|ROs|VIN|ASIST|DTC|Decisiv|Parsec|Op|PIN|PDF|CSV|QR|KPI|KPIs|TV|ETA|QC|VMRS|SPN|FMI|ID|OK|Volvo|Triage|Foreman|Manager|Admin|Parts|Fixes|Assets|Inventory|Career|Warranty|Overview|Mobile|I|Esc|Ctrl|Alt|Tab|Enter|Save|PDF”|Pictures)$/;
function why(o, raw, label){ const W = [], t = o.t, all = [t].concat(o.d);
  if(t.length > 60) W.push('title over 60 characters (' + t.length + ')');
  if(all.some(x => /\b(click|tap|press)\s+(here\s+)?(to|for)\b/i.test(x))) W.push('“Click to …”');
  if(/\.\s*$/.test(t) && !/(\.\.\.|…)$/.test(t)) W.push('full stop on the title');
  if(/\(\s*(esc|enter|ctrl[^)]*|alt[^)]*|shift[^)]*|[a-z0-9]|\/|\[|\]|←|→|↑|↓|⇧[^)]*)\s*\)\s*$/i.test(t) || /\[\s*[^\]]{1,3}\s*\]\s*$/.test(t)) W.push('key in brackets');
  const w = t.split(/\s+/).filter(x => /^[A-Za-z]/.test(x)); if(w.length >= 3){ const c = w.slice(1).filter(x => /^[A-Z][a-z]/.test(x) && !KEEP.test(x.replace(/[^A-Za-z]/g, ''))).length; if(c >= Math.max(2, (w.length - 1) * 0.6)) W.push('Title Case'); }
  if(/^[A-Za-z’']+$/.test(t) && !o.d.length && !o.k.length) W.push('one word, nothing more');
  if(label && t.toLowerCase() === String(label).toLowerCase() && !o.d.length) W.push('repeats the label');
  return W; }
const flagged = []; let n = 0;
L.forEach(it => { const raw = typeof it === 'string' ? it : it.raw, label = typeof it === 'string' ? '' : it.label; const o = norm(raw, { label }); n++; if(!o) return; const W = why(o, raw, label); if(W.length) flagged.push({ raw, out: o.t + (o.d.length ? ' | ' + o.d.join(' | ') : '') + (o.k.length ? '  [' + o.k.join(' ') + ']' : ''), why: W }); });
process.stdout.write(JSON.stringify({ n, flagged }));
