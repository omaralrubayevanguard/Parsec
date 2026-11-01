cd "$(dirname "$0")"
python3 build9.py > _build.log 2>&1
NOPHONE=1 python3 build9.py > _buildnp.log 2>&1
for t in "r9_smoke.py t9.html" "r9_pages.py" "r9old_old_t_app_5.py" "r9old_old_t_app2_5.py" "r9old_old_t_app3_5.py" "r9old_old_t5_flow.py" "r9old_old_t5_fm.py" "r9old__flow.py" "r9_mob.py" "r9_cam.py 0.1" "r9_visdiff.py t9_np.html t9.html"; do
  echo "===== $t" >> _regress3.log; timeout 900 python3 $t >> _regress3.log 2>&1; echo "===== exit $? $t" >> _regress3.log
done; echo ALLDONE >> _regress3.log
