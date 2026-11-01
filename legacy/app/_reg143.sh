#!/bin/bash
cd /tmp/claude-0/-home-claude/febe01e4-e12e-554d-9dc2-ccfd769708e9/scratchpad/app
export TZ=Asia/Tokyo
lane(){ for t in "$@"; do n=$(basename ${t%% *} .py); timeout 500 python3 $t > "_r143_$n.log" 2>&1; echo "=== $t :: $(grep -E '^FAILS|FAILS ' _r143_$n.log | tail -1) $(grep -c Traceback _r143_$n.log) tb $(grep -E '^FAIL ' _r143_$n.log | head -3 | tr '\n' '|' | cut -c1-300)"; done; }
lane "_t143a.py t12.html" "_t143b.py t12.html" "_t142.py t12.html" "_t141.py t12.html" "_t14t.py t12.html" "_t14c.py t12.html" "_t14b.py t12.html" "_t132a.py t12.html" "_t132x.py t12.html" "_t131r.py t12.html" "_t131s.py t12.html" "_t130.py t12.html" "_t130a.py t12.html" > _reg143a.log 2>&1 &
lane "_t130b.py t12.html" "_t130c.py t12.html" "_t129.py t12.html" "_t128.py t12.html" "_t127t.py t12.html" "_t127p.py t12.html" "_t127f.py t12.html" "_t127e.py t12.html" "_t126.py t12.html" "_t125_127p.py t12.html" "_t124_127p.py t12.html" "_t125b_127p.py t12.html" "_t125c.py t12.html" "_t125d.py t12.html" "_c123/_t123c_day.py t12.html" "_t122.py" "_t121.py" "_int/_t12c.py" "_int/_t12d_127.py" > _reg143b.log 2>&1 &
wait; echo DONE >> _reg143a.log
