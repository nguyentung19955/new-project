"""Chụp búa nện Zed: python3 chup.py out_prefix  (env EXTRA=&buakhop=0 ...)"""
import io, os, sys, subprocess, time, json, math
from PIL import Image, ImageDraw, ImageFont
from playwright.sync_api import sync_playwright
DIST='/home/claude/new-project/game/dist'; PORT=int(os.environ.get('PORT','8821'))
TESTS='/home/claude/new-project/game/tests'
OUT=sys.argv[1]
MARK=os.environ.get('MARK','1')=='1'
SCN=os.environ.get('SCN','huong')
srv = subprocess.Popen([sys.executable, '/home/claude/new-project/docs/review/kiem-thu-12-10/srv.py', DIST, str(PORT)], stderr=subprocess.DEVNULL)
time.sleep(0.8)
LIB=open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'lib.js')).read()
F = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 13)
INFO = r"""(() => {
 const P=T.P, K=G.fx.kit, S=K.S(), a=G.heroArgs(P), q=G.tinhLinh.tip(a), FA=G.fxAnh;
 const out={u:a.atk, x:P.x, y:P.y, face:P.face, aim:P.aimRel, cam:G.getWorld().cam, tip:q?{anim:q.anim,hx:q.gx+q.dx*q.L,hy:q.gy+q.dy*q.L,gx:q.gx,gy:q.gy}:null, E:[]};
 for(const o of S.E){ if((o.ty==='anh'&&/chem-bua|nen-dat/.test(o.ma))||o.ty==='crack') {
   const e={ty:o.ty,ma:o.ma,x:o.x,y:o.y,xg:o.xg,sc:o.sc,f:o.f,age:o.t0-o.t};
   if(o.xg!=null){ const A=FA.ds[o.ma], co=A.co||1; const th=o.theo; const X=(th?th.x:o.x-(o.tdx||0))+(o.tdx||0), Y=(th?th.y:o.y-(o.tdy||0))+(o.tdy||0);
     const pts=[[16,24],[3,-25]].map(([px,py])=>{ let lx=px*co*o.sc*(o.f<0?-1:1), ly=py*co*o.sc; return [X+lx*Math.cos(o.xg)-ly*Math.sin(o.xg), Y+lx*Math.sin(o.xg)+ly*Math.cos(o.xg)]; });
     e.ax=X; e.ay=Y; e.imp=pts[0]; e.top=pts[1]; }
   out.E.push(e);} }
 return out; })()"""
def setup(pg, dx, dy, cap, run, face):
    el = "" if cap == 0 else ", el:'fire', marksMoi:G.MARKS[%d]" % (cap-1)
    pg.evaluate("(() => { T.room({hero:'smith', melee:'hammer', face:%d, dum:[[%d,%d]] %s}); })()" % (face, dx, dy, el))
    if run:
        # chạy tại chỗ: giữ cần theo hướng mặt, quái gốc không bị đẩy xa
        pg.evaluate("T.hold({mx:%f,my:0},12)" % (0.9*face))
# kịch bản
DIRS=[('phải',40,0),('phải-dưới',30,26),('dưới',2,34),('trái-dưới',-30,26),('trái',-40,0),('trái-trên',-30,-26),('trên',2,-34),('phải-trên',30,-26)]
SC=[]
if SCN=='huong':
    for n,dx,dy in DIRS: SC.append(('thường '+n,dx,dy,0,False,'atk'))
elif SCN=='cap':
    for c in range(4):
        SC.append(('thường cấp%d phải'%c,40,0,c,False,'atk')); SC.append(('thường cấp%d trái-dưới'%c,-30,26,c,False,'atk'))
elif SCN=='chay':
    for n,dx,dy in DIRS[:5:2]+[DIRS[6]]: SC.append(('chạy '+n,dx,dy,1,True,'atk'))
    for n,dx,dy in [DIRS[0],DIRS[4]]: SC.append(('nện đất '+n,dx,dy,2,False,'nen'))
    for n,dx,dy in [DIRS[0],DIRS[3]]: SC.append(('Địa Chấn '+n,dx,dy,2,False,'sp'))
rows=[];errs=[];data=[]
with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page(viewport={'width': 1440, 'height': 810})
    pg.on('pageerror', lambda e: errs.append('PAGEERROR ' + str(e)))
    pg.goto('http://127.0.0.1:%d/linh-khi-nhe.html?cloud=0%s' % (PORT, os.environ.get('EXTRA','')))
    pg.wait_for_function('window.G && G.scene', timeout=60000)
    for i in range(80):
        n = pg.evaluate("(() => { const A = G.fxAnh ? Object.values(G.fxAnh.ds) : []; return [A.length, A.filter(a => a.ready).length, !!(G.fxAnh && G.fxAnh.co('hu-chem-bua'))]; })()")
        if n[2] and n[0] == n[1]: break
        pg.wait_for_timeout(500)
    pg.wait_for_timeout(1500)
    pg.evaluate("window.requestAnimationFrame = () => 0")
    pg.add_script_tag(path=os.path.join(TESTS, 'bot.js'))
    pg.add_script_tag(path=os.path.join(TESTS, 'setup.js'))
    pg.evaluate(LIB)
    for name,dx,dy,cap,run,kind in SC:
        face = 1 if dx >= 0 else -1
        setup(pg,dx,dy,cap,run,face)
        inp = "{mx:%f,my:0,atkP:true,atk:true}"%(0.9*face) if run else "{atkP:true,atk:true}"
        hold = "{mx:%f,my:0}"%(0.9*face) if run else "{}"
        if kind=='atk':
            pg.evaluate("T.hold(%s,1)"%inp)
        elif kind=='nen':
            pg.evaluate("T.hold({atk:true},70)"); pg.evaluate("T.hold({},1)")
        else:
            pg.evaluate("T.hold({specialP:true},1)")
        # chờ tới khung chạm (có vết nứt hoặc vệt búa)
        for k in range(60):
            d=pg.evaluate(INFO)
            if any(e['ty']=='crack' or e['ma']=='hu-chem-bua' for e in d['E']): break
            pg.evaluate("T.hold(%s,1)"%hold)
        ims=[]
        for st in [0,3,6,9]:
            if st: pg.evaluate("T.hold(%s,3)"%hold)
            d=pg.evaluate(INFO); d['ten']=name; d['buoc']=st; data.append(d)
            box = pg.evaluate("(() => { const c = document.querySelector('canvas'); const r = c.getBoundingClientRect(); return [r.left, r.top, r.width / 480, G.getWorld().cam]; })()")
            hw,hh=48,36; cx,cy=d['x'],d['y']-12
            clip={'x': box[0]+(cx-box[3]-hw)*box[2], 'y': box[1]+(cy-hh)*box[2], 'width':2*hw*box[2], 'height':2*hh*box[2]}
            im=Image.open(io.BytesIO(pg.screenshot(clip=clip))).convert('RGB')
            if MARK:
                dr=ImageDraw.Draw(im); s=box[2]
                W2=lambda x,y:((x-(cx-hw))*s,(y-(cy-hh))*s)
                def dot(x,y,c,r=4):
                    X,Y=W2(x,y); dr.ellipse([X-r,Y-r,X+r,Y+r],outline=c,width=2)
                if d['tip']: dot(d['tip']['hx'],d['tip']['hy'],'#ff3030')
                for e in d['E']:
                    if e['ty']=='crack': X,Y=W2(e['x'],e['y']); dr.line([X-6,Y,X+6,Y],fill='#ffff00',width=2); dr.line([X,Y-6,X,Y+6],fill='#ffff00',width=2)
                    if e.get('imp'): dot(e['imp'][0],e['imp'][1],'#30c0ff',5)
            ims.append((im,'%s +%d'%(name,st)))
        rows.append(ims)
    errs += pg.evaluate('T.errs') + pg.evaluate('G.zedMoi.loi')
    b.close()
srv.kill()
json.dump(data,open(OUT+'.json','w'),indent=0)
w,h=rows[0][0][0].size
out=Image.new('RGB',(4*(w+4)+4,len(rows)*(h+20)+4),'#140f10'); dr=ImageDraw.Draw(out)
for r,ims in enumerate(rows):
    for i,(im,cap) in enumerate(ims):
        x,y=4+i*(w+4),4+r*(h+20); out.paste(im,(x,y)); dr.text((x+3,y+h+2),cap,font=F,fill='#ffd27a')
out.save(OUT+'.png'); print('saved',OUT,errs[:5])
