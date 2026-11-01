#!/bin/bash
cd /tmp/claude-0/-home-claude/febe01e4-e12e-554d-9dc2-ccfd769708e9/scratchpad/app
export TZ=Asia/Tokyo
if PG_TAG=_ea2 python3 build12.py > _bea2.log 2>&1; then F=t12_ea2.html; echo "built WITH EB"; else echo "EB build failed: $(grep -E 'Error|assert' _bea2.log | tail -1 | cut -c1-160)"; F=t12_ea.html; fi
for t in _t143a.py _t131r.py _t14c.py _t130b.py _t122.py; do echo "=== $t ($F)"; timeout 500 python3 $t $F > "_rea_$t.log" 2>&1; grep -E "^FAIL|FAILS|Traceback" "_rea_$t.log" | head -5; done
echo "=== DONE"
