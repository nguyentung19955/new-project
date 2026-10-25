from rap2 import *
F=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',24)
Fs=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',13)
def bg(size,s=20):
    im=Image.new('RGBA',size,(255,255,255,255)); d=ImageDraw.Draw(im)
    for y in range(0,size[1],s):
        for x in range(0,size[0],s):
            if (x//s+y//s)%2: d.rectangle([x,y,x+s-1,y+s-1],fill=(255,120,220,255))
    return im
def only(L,keep):  # lọc lớp theo tên ảnh
    return [l for l in L if any(l[0] is IM[k] for k in keep)]
def limb_view(kind,b):
    pose=dict(REST)
    if kind=='tay': pose['armA']=[95,95-b,95-b]; keep=['than','vat-sau','vat-truoc','dai','tay-tren-gan','cang-tay-gan','gang-gan','capelet-truoc']
    else:
        up=90-b*0.45; lo=up+b; pose['legA']=[up,lo,90+(lo-90)*0.5]; keep=['than','vat-sau','vat-truoc','dai','dui-gan','cang-chan-gan','ung-gan']
    L=only(lam(pose),keep); return render(L,(520,560)),pose
cells=[]
for kind in ('tay','chân'):
    row=[]
    for b,lab in [(0,'duỗi'),(50,'gập vừa'),(105,'gập mạnh')]:
        c,_=limb_view('tay' if kind=='tay' else 'chan',b); bb=c.getbbox(); c=c.crop((bb[0]-12,bb[1]-12,bb[2]+12,bb[3]+12))
        c=c.resize((c.width*3,c.height*3),Image.NEAREST); o=bg(c.size); o.alpha_composite(c)
        ImageDraw.Draw(o).text((8,6),f'{kind.upper()} – {lab} ({b}°) ×3',fill=(0,0,0),font=F); row.append(o)
    cells.append(row)
W=max(sum(c.width for c in r)+40 for r in cells); H=sum(max(c.height for c in r) for r in cells)+30
sh=Image.new('RGB',(W,H),'white'); y=10
for r in cells:
    x=10
    for c in r: sh.paste(c.convert('RGB'),(x,y)); x+=c.width+10
    y+=max(c.height for c in r)+10
sh.save('thu-khop-v5.png')
# cỡ 112 px: cả nhân vật, 7 tư thế (duỗi/vừa/mạnh tay + chân + chóp mũ lắc)
poses=[('chuẩn',REST)]
for b in (0,50,105):
    p=dict(REST); up=90-b*0.45; lo=up+b; p['legA']=[up,lo,90+(lo-90)*0.5]; p['armA']=[95,95-b,95-b]; poses.append((f'gập {b}°',p))
p=dict(REST); p['tip']=-10; poses.append(('chóp -10°',p)); p=dict(REST); p['tip']=10; poses.append(('chóp +10°',p))
row=[]
for lab,p in poses:
    c=render(lam(p)); bb=c.getbbox(); c=c.crop((bb[0]-6,0,bb[2]+6,480))
    k=112/470; g=c.resize((round(c.width*k),112),Image.LANCZOS)    # px logic
    dev=g.resize((round(g.width*2.17),round(112*2.17)),Image.LANCZOS) if False else c.resize((round(c.width*k*2.17),round(112*2.17)),Image.LANCZOS)  # px thật iPhone
    o=Image.new('RGBA',(dev.width+10,dev.height+30),(226,231,238,255)); o.alpha_composite(dev,(5,24))
    ImageDraw.Draw(o).text((4,4),lab,fill=(0,0,0),font=Fs); row.append(o)
W=sum(o.width for o in row)+10*len(row); sm=Image.new('RGB',(W,row[0].height),'white'); x=0
for o in row: sm.paste(o.convert('RGB'),(x,0)); x+=o.width+10
sm.save('thu-112px.png'); print(sm.size)
# phóng to vùng nối chóp mũ
c=render(lam(dict(REST,tip=10))).crop((0,0,260,260)).resize((780,780),Image.NEAREST); o=bg(c.size); o.alpha_composite(c); o.save('thu-chop.png')
