import sys
from PIL import Image, ImageDraw
from hang import hang
def bang(khung,cham,so):
    n=len(khung)
    if cham is None: return [(j/n,khung[j]) for j in range(n)]
    jc=khung.index(cham); t0=cham/so; b=[]
    for j in range(jc): b.append((j*t0/jc,khung[j]))
    for j in range(jc,n): b.append((t0+(j-jc)*(1-t0)/(n-jc),khung[j]))
    b[0]=(0,b[0][1]); return b
def chon(b,u):
    k=0
    for j in range(1,len(b)):
        if u+1e-6>=b[j][0]: k=j
    return b[k][1]
def gif(ma,k,khung,cham,s,out,cham_fr=None):
    fr,d,v=hang(ma,k); so=v['so']; W,H=fr[0].size; g=v['giay']
    sl=max(2.0, 1.0)  # chậm lại cho dễ nhìn
    B=bang(khung,cham,so)
    fps=30; N=int(g*sl*fps)+1; hold=10
    outs=[]
    w,h=int(W*s),int(H*s)
    for f in list(range(N))+[N-1]*hold:
        u=min(1,f/(N-1))
        a=min(so-1,int(u*so)); b=chon(B,u)
        im=Image.new('RGB',(w*2+30,h+18),(52,62,54))
        im.paste(fr[a].resize((w,h),Image.NEAREST),(0,18),fr[a].resize((w,h),Image.NEAREST))
        im.paste(fr[b].resize((w,h),Image.NEAREST),(w+30,18),fr[b].resize((w,h),Image.NEAREST))
        dr=ImageDraw.Draw(im); dr.text((4,3),'TRUOC c%d'%(a+1),fill=(255,220,150)); dr.text((w+34,3),'SAU c%d'%(b+1),fill=(160,255,160))
        outs.append(im.quantize(64))
    outs[0].save(out,save_all=True,append_images=outs[1:],duration=int(1000/fps),loop=0,optimize=True)
    print(out,B)
gif('socNo','atk',[0,2,3,4,5],4,2,'socNo-danh.gif')
gif('socNo','die',[0,2,3,4,6,7],None,2,'socNo-chet.gif')
gif('em-be-wrestler-bien','atk',[0,2,3,4,5],4,1,'culi-bien-danh.gif')
gif('hoTinh-p2','atk',[0,1,2,3,4],4,0.35,'hoTinh-p2-danh.gif')
gif('hoTinh-p2','atk',[0,1,2,3,4],None,0.35,'hoTinh-p2-danh-deu.gif')
