# AERIN Hurt + Death (SE) – pixel-exact theo Art Director
import os,json
from PIL import Image
D=os.path.dirname(os.path.abspath(__file__))+'/'
def ld(p): return Image.open(p).convert('RGBA')
B={k:ld(D+f'../phase2b/goc/hurt-{k}.png') for k in range(6)}
C={k:ld(D+f'../phase2b/goc/death-{k}.png') for k in range(7)}
# xoá con trỏ chuột lọt vào ảnh chụp death-4 (vùng trống phía trên-trái nhân vật)
for y in range(10,34):
    for x in range(20,44):
        p=C[4].getpixel((x,y))
        if p[3] and (min(p[:3])>200 or max(p[:3])<30): C[4].putpixel((x,y),(0,0,0,0))
run=ld(D+'../phase2/goc/chay-3.png')
W=112
def save_clip(name,fr,ms,extra):
    od=D+name+'/'; os.makedirs(od,exist_ok=True)
    for i,f in enumerate(fr): f.save(od+f'{name}-{i}.png')
    sh=Image.new('RGBA',(W*len(fr),W)); [sh.paste(f,(i*W,0)) for i,f in enumerate(fr)]; sh.save(od+f'{name}-sheet.png')
    bg=Image.new('RGBA',sh.size,(58,63,68,255)); bg.alpha_composite(sh); bg.resize((sh.width*3,W*3),Image.NEAREST).save(od+f'{name}-x3.png')
    g=[]
    for f in fr:
        b=Image.new('RGBA',(W,W),(58,63,68,255)); b.alpha_composite(f); g.append(b.resize((W*3,W*3),Image.NEAREST).convert('P',palette=Image.ADAPTIVE))
    g[0].save(od+f'{name}.gif',save_all=True,append_images=g[1:]+([g[-1]]*3 if name=='death' else []),duration=ms+([600]*3 if name=='death' else []),loop=0)
    json.dump(dict(frames=len(fr),ms=ms,canvas=W,**extra),open(od+f'{name}.json','w'))
# ---- HURT: B F1 → F2 → F6 (bỏ F3–F5 vì mất lưỡi); chớp sáng ở F2 do engine vẽ
save_clip('hurt',[B[0].copy(),B[1].copy(),B[5].copy()],[65,100,120],{'flash_frame':1,'flash_ms':60,'knockback_px':4})
# ---- DEATH
def is_blade(p): return p[3] and p[2]>190 and p[1]>160
def strip_sword(f,box):
    x0,y0,x1,y1=box
    S=set((x,y) for y in range(y0,y1) for x in range(x0,x1) if is_blade(f.getpixel((x,y))))
    for (x,y) in list(S):
        for dx in(-1,0,1):
            for dy in(-1,0,1):
                q=(x+dx,y+dy)
                if x0<=q[0]<x1 and y0<=q[1]<y1 and q not in S:
                    p=f.getpixel(q)
                    if p[3] and max(p[:3])<110: S.add(q)
    for q in S: f.putpixel(q,(0,0,0,0))
    # xoá nốt viền mảnh còn lại: hộp bao lưỡi nới 1px, chỉ phần trên tay (hàng thấp nhất của lưỡi)
    bl=[q for q in S]
    if bl:
        bx0=min(x for x,y in bl)-1; bx1=max(x for x,y in bl)+2; by0=min(y for x,y in bl)-1; by1=max(y for x,y in bl)-2
        for y in range(by0,by1):
            for x in range(bx0,bx1):
                if 0<=x<W and 0<=y<W: f.putpixel((x,y),(0,0,0,0))
# khối kiếm nằm ngang (chuôi + lưỡi) lấy nguyên từ Run F4
SW=[(x-82,y-54,run.getpixel((x,y))) for y in range(54,66) for x in range(82,108) if run.getpixel((x,y))[3]]
def lay_sword(f,ox,oy,fade=0):
    for x,y,p in SW:
        q=(ox+x,oy+y)
        if not(0<=q[0]<W and 0<=q[1]<W): continue
        if is_blade(p):
            if fade==1: p=(int(p[0]*.62),int(p[1]*.7),int(p[2]*.82),255)   # lưỡi tối dần (giữ sắc độ)
            elif fade==2: p=(int(p[0]*.3),int(p[1]*.38),int(p[2]*.55),255)  # lưỡi tắt hẳn, chuôi còn nguyên
        f.putpixel(q,p)
def clean_small(f,minsize=10):
    seen=set()
    for y in range(W):
        for x in range(W):
            if (x,y) in seen or not f.getpixel((x,y))[3]: continue
            st=[(x,y)]; comp=[]; seen.add((x,y))
            while st:
                a,b=st.pop(); comp.append((a,b))
                for dx in(-1,0,1):
                    for dy in(-1,0,1):
                        q=(a+dx,b+dy)
                        if 0<=q[0]<W and 0<=q[1]<W and q not in seen and f.getpixel(q)[3]: seen.add(q); st.append(q)
            if len(comp)<minsize:
                for q in comp: f.putpixel(q,(0,0,0,0))
GX,GY=74,79   # vị trí cố định của kiếm trên đất (world, theo canvas)
fr=[C[0].copy(),C[1].copy(),C[2].copy(),C[3].copy()]
for k,fade in ((4,0),(5,1),(6,2)):
    f=C[k].copy(); strip_sword(f,(60,30,112,90)); clean_small(f); lay_sword(f,GX,GY,fade); fr.append(f)
save_clip('death',fr,[80,80,90,90,110,120,180],{'hold_last':True,'sword_ground_xy':[GX,GY]})
print('ok')
