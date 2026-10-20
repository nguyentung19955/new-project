#!/usr/bin/env python3
"""Chụp ảnh demo.build.html (headless Chromium, SwiftShader) ở 1280×720 và 844×390 @3x (iPhone ngang).
Không dùng thời gian thực: dừng vòng rAF rồi tự gọi step() từng khung logic (đúng 60 Hz) để ảnh lặp lại được.
Ra game/xem-thu/anh/demo-chibi-<cảnh>-<1280|iphone>.png và game/xem-thu/anh/lam-trong-game.gif (chạy + combo).
Chạy build-demo.py trước:  python3 game/build-demo.py && python3 game/tools/chup-demo-chibi.py"""
import io, os, sys
from PIL import Image
from playwright.sync_api import sync_playwright

HERE = os.path.dirname(os.path.abspath(__file__)); GAME = os.path.dirname(HERE)
URL = 'file://' + os.path.join(GAME, 'demo.build.html')
OUT = os.path.join(GAME, 'xem-thu', 'anh'); os.makedirs(OUT, exist_ok=True)
ARGS = ['--use-angle=swiftshader', '--use-gl=angle', '--enable-unsafe-swiftshader']

HELP = r"""
window.__rafStop=true; window.requestAnimationFrame=()=>0;
window.adv=(n,keys,once)=>{ keys=keys||''; for(let i=0;i<n;i++){ for(const k of KEYS) kb[k]=keys.includes(k)?1:0; if(i===0&&once) for(const k of once) latch[k]=1; savePrev(); step(); } render(1); return [pl.a2,pl.k2,pl.atkN,pl.atkT]; };
window.advUntil=(cond,keys,max,once)=>{ keys=keys||''; for(let i=0;i<(max||400);i++){ for(const k of KEYS) kb[k]=keys.includes(k)?1:0; if(i===0&&once) for(const k of once) latch[k]=1; savePrev(); step(); if(cond()) break; } render(1); return [pl.a2,pl.k2,pl.atkN,pl.atkT]; };
window.tele=(r,lx)=>{ placePlayer((r.x0+lx)*T, FLOOR-pl.h); pl.drawT=0; S.camx=S.pcx=clamp(pl.x+pl.w/2-W/2+48,r.x0*T,(r.x0+r.w)*T-W); };
1;
"""


def chay(p, w, h, ten, touch, gif=False):
    b = p.chromium.launch(executable_path='/opt/pw-browsers/chromium', args=ARGS)
    pg = b.new_page(viewport={'width': w, 'height': h}, device_scale_factor=3 if touch else 1, has_touch=touch)
    loi = []; pg.on('pageerror', lambda e: loi.append(str(e))); pg.on('console', lambda m: m.type == 'error' and loi.append(m.text))
    pg.goto(URL); pg.wait_for_function('window.TVDEMO && TVDEMO.ready', timeout=60000)
    print(ten, 'rút dao', pg.evaluate('TVDEMO.rut'), 'khung · mảnh', pg.evaluate('TVDEMO.manh'),
          '· ATK', pg.evaluate('JSON.stringify(Object.values(ATK).map(a=>[a.su,a.ac,a.re]))'))
    pg.click('#btn-start'); pg.wait_for_timeout(200)
    pg.evaluate(HELP)
    if touch:
        pg.evaluate('setMode(true)')
    ev = pg.evaluate

    def shot(n):
        pg.screenshot(path=os.path.join(OUT, 'demo-chibi-%s-%s.png' % (n, ten)))

    ev('adv(14)'); shot('rut-dao')
    ev('adv(70)'); shot('dung')
    ev("adv(24,'r')"); shot('chay')
    ev("adv(9,'rj',['j'])"); shot('nhay')
    ev("advUntil(()=>pl.onGround,'',120)"); ev('adv(20)')
    # combo dưới đất: đòn 1 → 2 → 3, chụp đúng khung chạm
    ev("advUntil(()=>pl.atkN===1&&pl.atkT===ATK[1].su+1,'',40,['a'])"); shot('don-1')
    ev("advUntil(()=>pl.atkN===1&&pl.atkT>=ATK[1].su+ATK[1].ac-4,'',40)")
    ev("advUntil(()=>pl.atkN===2&&pl.atkT===ATK[2].su+1,'',60,['a'])"); shot('don-2')
    ev("advUntil(()=>pl.atkN===2&&pl.atkT>=ATK[2].su+ATK[2].ac-4,'',40)")
    ev("advUntil(()=>pl.atkN===3&&pl.atkT===5,'',60,['a'])"); shot('don-3-bat')
    ev("advUntil(()=>pl.atkN===3&&pl.atkT===ATK[3].su+1,'',60)"); shot('don-3')
    ev("advUntil(()=>!pl.atkN,'',80)"); ev('adv(10)')
    # xoay trên không
    ev("adv(12,'j',['j'])"); ev("advUntil(()=>pl.atkN===6&&pl.atkT===ATK[6].su+1,'j',40,['a'])"); shot('xoay')
    ev("advUntil(()=>pl.onGround&&!pl.atkN,'',200)")
    # sân chuông: đánh quái
    ev("tele(RB,2); Q[0].x=Q[0].px=(RB.x0+6)*T; Q[0].face=-1; Q[0].cd=999"); ev('adv(20)')
    ev("advUntil(()=>pl.atkN===1&&pl.atkT===ATK[1].su+2,'',40,['a'])"); shot('danh-quai')
    ev("advUntil(()=>!pl.atkN,'',80)")
    ev("Q[0].cd=0; pl.iframes=999"); ev("advUntil(()=>Q[0].st==='strike'&&Q[0].t===6,'',200)"); shot('quai-dam')
    ev("Q[0].hp=1; advUntil(()=>Q[0].st==='rec'||Q[0].st==='walk','',80)")
    ev("advUntil(()=>pl.atkN===1&&pl.atkT===ATK[1].su+2,'',40,['a'])")
    ev("advUntil(()=>Q[0].st==='die'&&Q[0].t===30,'',120)"); shot('quai-chet')
    ev("advUntil(()=>Q[0].st==='die'&&Q[0].t===170,'',200)"); shot('quai-vun-mo')
    # cổng làng 2: công tắc + cổng, Tiếng Vọng
    ev("pl.iframes=0; tele(A2,8)"); ev('adv(10)')
    ev("advUntil(()=>SW.g1.byPl,'r',120)"); ev('adv(20)'); shot('cong-tac-cong')
    # ghi Vọng khi đứng trên công tắc → bóng giữ công tắc → Lam đi qua cổng
    ev("adv(1,'',['v'])"); ev("adv(50)"); ev("adv(1,'',['v'])")
    ev("advUntil(()=>echo&&echo.done,'',240)"); ev("advUntil(()=>pl.x>(A2.x0+19)*T,'r',200)"); ev('adv(4)'); shot('echo')
    # câu đố + điểm lưu
    ev("tele(RC,3)"); ev('adv(20)'); shot('cau-do')
    ev("tele(RD,11)"); ev("advUntil(()=>S.cp===BELLS[2],'r',80)"); ev('adv(16)'); shot('diem-luu')
    # boss
    ev("tele(RE,6)"); ev("advUntil(()=>boss.st==='walk','r',200)"); ev("pl.iframes=999; adv(30)"); shot('boss')
    ev("advUntil(()=>boss.st==='slamPrep'&&boss.t===20,'',400)"); shot('boss-lay-da')
    ev("boss.hp=9; boss.phase=1; advUntil(()=>boss.st==='hang','',600)"); ev('adv(30)'); shot('boss-treo')
    if gif:
        fr = []
        ev("tele(RB,1); for(const q of Q){ q.cd=999; } pl.iframes=9999; adv(10)")
        def cap():
            png = pg.screenshot(clip={'x': 0, 'y': 0, 'width': w, 'height': h})
            fr.append(Image.open(io.BytesIO(png)).convert('RGB').resize((480, 270), Image.LANCZOS))
        for i in range(30):
            ev("adv(2,'r')"); cap()
        ev("adv(4)")
        for n in range(3):
            ev("adv(1,'',['a'])")
            for i in range(14):
                ev("adv(2)"); cap()
        for i in range(10):
            ev("adv(2)"); cap()
        fr = fr[::2]                                   # 15 hình/giây, 1 bảng màu chung → GIF ~2,5 MB
        pal = fr[len(fr) // 2].quantize(colors=96, method=Image.MEDIANCUT)
        fr = [f.quantize(palette=pal, dither=Image.Dither.NONE) for f in fr]
        fr[0].save(os.path.join(OUT, 'lam-trong-game.gif'), save_all=True, append_images=fr[1:], duration=66, loop=0, optimize=True)
        print('GIF', len(fr), 'khung')
    b.close()
    loi = [x for x in loi if 'ERR_TUNNEL' not in x and 'ERR_PROXY' not in x and 'net::' not in x]   # Google Fonts bị chặn trong máy chụp
    if loi:
        print(ten, 'LỖI:', loi)
    return loi


with sync_playwright() as p:
    l = chay(p, 1280, 720, '1280', False, gif=True) + chay(p, 844, 390, 'iphone', True)
sys.exit(1 if l else 0)
