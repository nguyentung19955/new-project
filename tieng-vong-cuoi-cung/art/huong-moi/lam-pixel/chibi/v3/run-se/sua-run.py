from PIL import Image
O=(13,20,30,255); S=(214,220,228,255); H=(250,252,255,255)
FORK=["O.O.O","OHOHO","OSOSO","OSSSO",".OSO."]
cut={0:2,3:3,4:2}      # frame: columns to trim from cape tip
fork={2:(42,37),3:(44,37),4:(41,34),5:(44,38)}
fs=[]
for i in range(6):
    f=Image.open(f'goc/run-se-{i}.png').convert('RGBA')
    if i in cut:
        left=min(x for y in range(64) for x in range(64) if f.getpixel((x,y))[3])
        c=left+cut[i]
        for y in range(64):
            for x in range(c): f.putpixel((x,y),(0,0,0,0))
            if f.getpixel((c,y))[3]: f.putpixel((c,y),O)
    if i in fork:
        ox,oy=fork[i]
        for dy,row in enumerate(FORK):
            for dx,ch in enumerate(row):
                if ch!='.': f.putpixel((ox+dx,oy+dy),{'O':O,'S':S,'H':H}[ch])
    f.save(f'run-se-{i}.png'); fs.append(f)
sh=Image.new('RGBA',(384,64))
for i,f in enumerate(fs): sh.paste(f,(i*64,0))
sh.save('run-se-sheet.png'); sh.resize((1536,256),Image.NEAREST).save('run-se-sheet-x4.png')
g=[]
for f in fs:
    b=Image.new('RGBA',(256,256),(58,63,68,255)); b.alpha_composite(f.resize((256,256),Image.NEAREST)); g.append(b.convert('P',palette=Image.ADAPTIVE))
g[0].save('run-se-x4.gif',save_all=True,append_images=g[1:],duration=100,loop=0)
