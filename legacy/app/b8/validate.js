// Ask Chrome whether each overriding declaration is one it accepts: [[prop, value], ...] -> [true|false, ...]
const fs = require('fs');
const { chromium } = require('playwright');
(async () => {
  const pairs = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
  const b = await chromium.launch();
  const p = await b.newPage();
  const res = await p.evaluate(list => list.map(([k, v]) => {
    if (k.startsWith('--')) return true;
    try { return CSS.supports(k, v); } catch (e) { return false; }
  }), pairs);
  await b.close();
  process.stdout.write(JSON.stringify(res));
})().catch(e => { console.error(e); process.exit(1); });
