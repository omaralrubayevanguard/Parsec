import sys; sys.path.insert(0, sys.argv[1])
from palette import L, D
def lum(h):
    h=h.lstrip('#'); r,g,b=[int(h[i:i+2],16)/255 for i in (0,2,4)]
    f=lambda c: c/12.92 if c<=0.03928 else ((c+0.055)/1.055)**2.4
    return 0.2126*f(r)+0.7152*f(g)+0.0722*f(b)
def cr(a,b):
    la,lb=lum(a),lum(b); hi,lo=max(la,lb),min(la,lb); return (hi+0.05)/(lo+0.05)
grounds=['canvas','panel','raised','fill','selected']
checks=[]
for t in ['ink','ink2','ink3','accent_text']:
    for g in grounds: checks.append((t,g,4.5))
for s in ['hold','working','waiting','customer','support','problem']:
    for g in ['panel','raised','fill',s+'_t']: checks.append((s,g,4.5))
checks += [('accent_text','accent_tint',4.5),('on_accent','accent',4.5),('on_primary','primary',4.5),
           ('accent','panel',3),('accent','raised',3),('accent','fill',3),('accent','canvas',3),('border_strong','panel',3),('border_strong','raised',3),('ink4','panel',1)]
bad=0
for name,P in [('LIGHT',L),('DARK',D)]:
    print('==',name)
    for f,g,need in checks:
        c=cr(P[f],P[g]); flag='' if c>=need else '  <-- FAIL'
        if flag: bad+=1
        if flag or f in('ink3','accent_text','on_accent','accent','border_strong','waiting') : print(f"{f:12s} on {g:12s} {c:5.2f} (need {need}){flag}")
print('fails',bad)
