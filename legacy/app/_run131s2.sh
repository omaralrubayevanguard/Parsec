#!/bin/sh
cd /tmp/claude-0/-home-claude/febe01e4-e12e-554d-9dc2-ccfd769708e9/scratchpad/app
PG_TAG=_s PG_PATCHES=build_fix12.py,build_imp.py,build_ocr.py,build_rop.py,build_rop123.py,build_tc123.py,build_tri.py,build_v122.py,build_v123.py,build_v124.py,build_v125b.py,build_v125c.py,build_v125d.py,build_v126.py,build_v127e.py,build_v127f.py,build_v127p.py,build_v128.py,build_v129.py,build_v130.py,build_v130a.py,build_v130b.py,build_v130c.py,build_v131s.py python3 build12.py > _b131s.log 2>&1 || { echo BUILD FAILED > _t131s.log; exit 1; }
timeout 100 python3 _dbg131s.py > _dbg131s.log 2>&1
timeout 600 python3 _t131s.py t12_s.html > _t131s.log 2>&1
echo DONE >> _t131s.log
