from PIL import Image, ImageFilter
import numpy as np, scipy.ndimage as nd, sys
src='/root/.claude/uploads/febe01e4-e12e-554d-9dc2-ccfd769708e9/202f01ec-image.png'
im=Image.open(src).convert('RGB'); A=np.asarray(im).astype(int)
T=int(sys.argv[1]) if len(sys.argv)>1 else 22
boxes={'top_white':(95,40,380,715),'top_gray':(470,40,760,715),'top_blue':(840,80,1120,715),'top_red':(1225,85,1520,715),
       'side_white':(40,722,440,1020),'side_gray':(436,730,810,1020),'side_blue':(806,770,1180,1020),'side_red':(1176,760,1572,1020)}
for k,(x0,y0,x1,y1) in boxes.items():
    a=A[y0:y1,x0:x1]; r,g,b=a[...,0],a[...,1],a[...,2]; mx=a.max(axis=2)
    bgish=(mx<T) | ((b>r+14)&(b<90)&(r<48)&(g<62))
    lab,n=nd.label(bgish)
    border=set(np.unique(np.concatenate([lab[0,:],lab[-1,:],lab[:,0],lab[:,-1]])))-{0}
    fg=~np.isin(lab,list(border))
    l2,n2=nd.label(fg); sizes=nd.sum(fg,l2,range(1,n2+1))
    keep=np.zeros_like(fg)
    for i,sz in enumerate(sizes):
        if sz>0.015*sizes.max(): keep|=(l2==i+1)
    keep=nd.binary_fill_holes(keep)
    alpha=Image.fromarray((keep*255).astype('uint8')).filter(ImageFilter.GaussianBlur(0.7))
    out=Image.fromarray(a.astype('uint8')).convert('RGBA'); out.putalpha(alpha)
    out=out.crop(out.getbbox()); out.save(f'{k}.png')
ims=[Image.open(f'{k}.png') for k in boxes]
W=Image.new('RGB',(sum(i.width for i in ims)+20*len(ims),700),(242,240,234))
x=10
for i in ims: W.paste(i,(x,10),i); x+=i.width+20
W.resize((W.width//2,W.height//2)).save('preview_small.png')
