# Bộ "kiếm âm thanh": cầm fork chéo như kiếm khi nghỉ; khi chém lưỡi sáng bung ra + vệt mờ (theo bảng ChatGPT 30/10)
import sys,os; sys.path.insert(0,os.path.dirname(os.path.abspath(__file__))+'/..')
from lam_pixel_lib import *
from PIL import Image
K=B+'kiem/'
LIGHT=lambda p: p[3] and min(p[:3])>90 and max(p[:3])-min(p[:3])<45
def clear_light(f,box,keep=()):
    x0,y0,x1,y1=box
    for y in range(y0,y1+1):
        for x in range(x0,x1+1):
            if (x,y) in keep: continue
            p=f.getpixel((x,y))
            if LIGHT(p): f.putpixel((x,y),SD)
    # cắt viền đen thừa nhô ra phải
    for y in range(y0,y1+1):
        xs=[x for x in range(64) if f.getpixel((x,y))[3]]
        if not xs: continue
        x=max(xs)
        while x>x0 and f.getpixel((x,y))[:3]==(0,0,0) and f.getpixel((x-1,y))[:3] in [(0,0,0),SD[:3]] and x>=box[0]+2:
            # chỉ cắt khi cột bên trái cũng là viền/tối (phần nĩa cũ)
            if all(f.getpixel((x-1,yy))[3]==0 for yy in []): break
            f.putpixel((x,y),(0,0,0,0)); x-=1
            if f.getpixel((x,y))[:3]!=SD[:3]: break
def pad96(f):
    c=Image.new('RGBA',(96,96)); c.alpha_composite(f,(16,16)); return c
def body_shift(f,lean=0,squash=0):
    """lean: dịch thân trên sang phải (px); squash: ép thân xuống (px). Chân (y>50) giữ nguyên."""
    src=f.copy(); g=Image.new('RGBA',f.size)
    for y in range(64):
        for x in range(64):
            if y>50: p=src.getpixel((x,y))
            else:
                sy=y-squash; dx=lean if y<=44 else lean//2
                sx=x-dx
                p=src.getpixel((sx,sy)) if 0<=sx<64 and 0<=sy<64 else (0,0,0,0)
            if p[3]: g.putpixel((x,y),p)
    return g
def save(name,frames,durs,scale=4,bg=(58,63,68,255)):
    d=K+name+'/'; os.makedirs(d,exist_ok=True)
    W,Hh=frames[0].size
    sh=Image.new('RGBA',(W*len(frames),Hh))
    for i,f in enumerate(frames): f.save(d+f'{name}-{i}.png'); sh.paste(f,(i*W,0))
    sh.save(d+f'{name}-sheet.png')
    pv=Image.new('RGBA',sh.size,bg); pv.alpha_composite(sh); pv.resize((sh.width*scale,Hh*scale),Image.NEAREST).save(d+f'{name}-xem.png')
    g=[]
    for f in frames:
        b=Image.new('RGBA',(W,Hh),bg); b.alpha_composite(f); g.append(b.resize((W*scale,Hh*scale),Image.NEAREST).convert('P',palette=Image.ADAPTIVE))
    g[0].save(d+f'{name}.gif',save_all=True,append_images=g[1:],duration=durs,loop=0)
SH=(37,45)   # vai tay cầm kiếm
# ---------- Idle: fork chéo -55° bên hông ----------
idle=[]
for i in range(4):
    f=Image.open(B+f'idle-se/idle-se-{i}.png').convert('RGBA')
    clear_light(f,(39,40,44,51))
    glove(f,38,48); weapon(f,39,49,-55)
    idle.append(f)
save('dung',idle,[125]*4)
# ---------- Run: tay thật trong từng frame, fork -35° ±10 ----------
run_hands=[(34,45,-45),(34,45,-40),(43,41,-30),(45,41,-25),(42,38,-30),(45,42,-35)]
run=[]
for i,(hx,hy,a) in enumerate(run_hands):
    f=Image.open(B+f'run-se/run-se-{i}.png').convert('RGBA')   # bản đã sửa áo choàng (có nĩa dán) -> xoá nĩa dán
    clear_light(f,(38,32,52,47))
    glove(f,hx,hy); weapon(f,hx+1,hy+1,a)
    run.append(f)
save('chay',run,[90]*6)
# ---------- Đòn chém (canvas 96x96, thân ở (16,16)) ----------
def attack(plan,name,durs,extra=None):
    out=[]
    for i,(h,a,bl,sm,lean,sq) in enumerate(plan):
        if bl==0 and sm is None and lean==0 and sq==0 and i in (0,len(plan)-1):
            f=pad96(idle[0]); out.append(f); continue
        b=base_clean(); b=body_shift(b,lean,sq)
        f=pad96(b)
        hx,hy=h[0]+16,h[1]+16; sx,sy=SH[0]+16+lean,SH[1]+16+sq
        if sm:
            a0,a1,R,th=sm[:4]; shr=sm[4] if len(sm)>4 else (0,0)      # a0 -> a1: từ góc bắt đầu vung tới góc lưỡi hiện tại
            Rt=math.hypot(hx-sx,hy-sy)+3+bl-1    # bán kính = đường đi của mũi kiếm
            smear2(f,sx,sy,Rt,a0,a1,thmax=th*2,shear=shr)
        bl_draw=bl
        if abs(hx-sx)+abs(hy-sy)>4: arm(f,sx,sy,hx,hy)
        glove(f,hx-1,hy-1); weapon(f,hx,hy,a,blade=bl_draw)
        if extra: extra(i,f)
        out.append(f)
    save(name,out,durs)
    return out
# Slash1 chéo xuống trước: 5 frame 12 FPS, impact F3
attack([((38,49),-55,0,None,0,0),((39,44),65,22,None,-1,1),((43,47),-35,24,(65,-35,26,4,(5,-2)),2,0),((44,50),-58,18,None,1,0),((38,49),-55,0,None,0,0)],
       'chem1',[83,83,120,83,83])
# Slash2 hất lên: 5 frame 12 FPS, impact F3
attack([((38,49),-55,0,None,0,0),((39,52),-65,22,None,0,2),((43,46),45,24,(-75,55,26,4,(-3,3)),1,-2),((42,43),75,18,None,0,-1),((38,49),-55,0,None,0,0)],
       'chem2',[83,83,120,83,83])
# Slash3 bổ mạnh qua đầu + chuông: 7 frame 10 FPS, impact F5, hitstop 50ms
FL={(252,214,120):(255,246,200),(216,151,67):(252,214,120),(184,118,54):(232,176,80),(206,142,58):(250,200,100),(110,60,22):(184,118,54)}
def bell(f,lvl):
    for y in range(55,63):
        for x in range(48,55):
            p=f.getpixel((x,y))[:3]; q=p
            for _ in range(lvl): q=FL.get(q,q)
            if q!=p: f.putpixel((x,y),q+(255,))
def s3(i,f):
    if i in (2,4): bell(f,1)
    if i==3: bell(f,2)
attack([((38,49),-55,0,None,0,0),((39,43),70,22,None,0,1),((40,39),90,26,None,0,2),((41,39),100,26,None,0,2),((45,48),-60,26,(100,-60,29,5,(3,-3)),3,2),((45,53),-80,16,None,4,3),((38,49),-55,0,None,0,0)],
       'chem3',[100,100,100,140,150,100,100],extra=s3)
# ---------- Bị đánh + Chết: frame đầu dùng tư thế cầm chéo mới ----------
hurt=[idle[0]]+[Image.open(B+f'hurt-se/hurt-{i}.png').convert('RGBA') for i in (1,2)]
save('bi-danh',hurt,[83,83,83])
d0=Image.new('RGBA',(80,72)); d0.alpha_composite(idle[0],(8,0))
death=[d0]+[Image.open(B+f'death-se/death-{i}.png').convert('RGBA') for i in range(1,6)]
save('chet',death,[100]*5+[1200])
