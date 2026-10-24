import numpy as np, random
from PIL import Image, ImageDraw, ImageFilter
OUT='public/img/'
def grad(w,h,a,b,vert=True):
    t=np.linspace(0,1,h if vert else w)
    g=a+(b-a)*t
    arr=np.tile(g[:,None],(1,w)) if vert else np.tile(g[None,:],(h,1))
    return arr
def figure(draw,cx,cy,s,col,pose=0):
    draw.ellipse([cx-0.10*s,cy-0.13*s,cx+0.10*s,cy+0.13*s],fill=col)
    draw.ellipse([cx-0.6*s+pose*0.05*s,cy+0.26*s,cx+0.6*s+pose*0.05*s,cy+1.9*s],fill=col)
def make(name,w,h,bg=(235,200),fg=30,figs=((0.5,0.35,0.5,0),),blur=6,vert=True,light_dir=0.3,seed=0):
    rng=np.random.default_rng(seed)
    base=grad(w,h,bg[0],bg[1],vert)
    # soft light pool
    yy,xx=np.mgrid[0:h,0:w]
    lx,ly=w*(0.5+light_dir*0.6),h*0.3
    pool=np.exp(-(((xx-lx)/(w*0.6))**2+((yy-ly)/(h*0.6))**2))
    base=base*0.85+pool*30
    img=Image.fromarray(np.clip(base,0,255).astype('uint8'),'L')
    layer=Image.new('L',(w,h),0); d=ImageDraw.Draw(layer)
    for (fx,fy,fs,pose) in figs:
        figure(d,fx*w,fy*h,fs*min(w,h),255,pose)
    layer=layer.filter(ImageFilter.GaussianBlur((blur*3+18)*min(w,h)/800))
    m=np.array(layer)/255.0
    arr=np.array(img,dtype=float)
    arr=arr*(1-m*0.92)+fg*m*0.92
    # vignette
    v=((xx-w/2)/(w*0.75))**2+((yy-h/2)/(h*0.75))**2
    arr=arr*(1-0.35*np.clip(v,0,1))
    arr+=rng.normal(0,2.5,arr.shape)
    out=Image.fromarray(np.clip(arr,0,255).astype('uint8'),'L')
    out.save(OUT+name+'.webp',quality=78,method=6)
    return out
hero=make('hero',1200,1500,bg=(70,20),fg=205,figs=((0.52,0.3,0.62,0),),blur=10,seed=1)
# motion-blurred layer (horizontal), small & upscaled by CSS
small=hero.resize((300,375),Image.LANCZOS)
a=np.array(small,dtype=float); k=41
pad=np.pad(a,((0,0),(k//2,k//2)),mode='edge')
cs=np.cumsum(pad,axis=1); cs=np.concatenate([np.zeros((a.shape[0],1)),cs],axis=1)
mb=(cs[:,k:]-cs[:,:-k])/k
Image.fromarray(np.clip(mb,0,255).astype('uint8')).filter(ImageFilter.GaussianBlur(2)).save(OUT+'hero-blur.webp',quality=70)
make('about',900,1200,bg=(240,215),fg=25,figs=((0.55,0.28,0.38,0.5),),blur=4,seed=2)
make('work-1',1000,1000,bg=(225,170),fg=20,figs=((0.42,0.3,0.45,1),),blur=5,seed=3)
make('work-2',1500,1000,bg=(60,30),fg=200,figs=((0.38,0.32,0.55,0),(0.66,0.3,0.55,-0.5)),blur=8,vert=False,seed=4)
make('work-3',1400,600,bg=(245,200),fg=120,figs=((0.7,0.75,0.12,0),),blur=14,vert=True,seed=5)
make('work-4',900,1200,bg=(200,140),fg=15,figs=((0.48,0.25,0.4,-1),),blur=4,seed=6)
make('work-5',800,1000,bg=(30,10),fg=225,figs=((0.5,0.3,0.5,0.5),),blur=9,seed=7)
make('svc-1',900,1125,bg=(235,190),fg=25,figs=((0.5,0.3,0.45,0),),blur=5,seed=8)
make('svc-2',900,1125,bg=(55,25),fg=210,figs=((0.36,0.32,0.4,0),(0.66,0.34,0.4,0)),blur=7,seed=9)
make('svc-3',900,1125,bg=(215,160),fg=20,figs=((0.28,0.36,0.32,0),(0.56,0.3,0.38,0),(0.8,0.5,0.22,0)),blur=6,seed=10)
make('svc-4',900,1125,bg=(90,40),fg=200,figs=((0.25,0.4,0.25,0),(0.5,0.35,0.3,0),(0.78,0.42,0.26,0)),blur=8,seed=11)
make('contact',1200,1500,bg=(240,205),fg=20,figs=((0.5,0.27,0.5,0.3),),blur=5,seed=12)
# grain tile
rng=np.random.default_rng(42); n=rng.integers(0,256,(128,128)).astype('uint8')
alpha=np.full((128,128),255,'uint8')
Image.fromarray(np.dstack([n,np.full_like(n,255)]),'LA').save(OUT+'grain.png',optimize=True)
print('ok')
