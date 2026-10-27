#!/usr/bin/env python3
"""Kiểm nhanh demo.html sau khi ghép LÀNG CHUÔNG + clip CHẾT của Lam (27/10/2026) – không phải bộ kiểm thử tự động:
  1. nạp demo.html (DPR 2) + bản build tự chứa demo.build.html (file://): lỗi console / lỗi trang / yêu cầu hỏng, số đo nạp
  2. viewport iPhone ngang 844×390 (DPR 3, cảm ứng): nút "Bắt đầu" nằm trong màn và bấm được (elementFromPoint + click)
  3. ảnh chụp 960×540 (DPR 1) vài cảnh
  4. 1 video 60 fps TRONG demo.html (mỗi khung video = đúng 1 bước logic): chạy qua Cổng làng → cổng + công tắc →
     Sân chuông đánh quái (bot) → Lam chết 2 lần (đứng nhìn quái: ngã ngửa; quay lưng: ngã chúi).
Bot chỉ bấm phím (phần bot lấy từ game/thu-quai-boss/cong-cu/khoi-thu.js); để Lam chết, script đặt máu = 1 rồi đứng yên cho
quái đánh thật (gameplay không đổi). Giữa các đoạn có "cắt cảnh" (placePlayer) vì Cổng làng cần nhảy tường + Tiếng Vọng.
Đầu ra: game/kiem-thu-lang-chuong/ (lang-chuong-60fps.mp4, anh-*.png, so-do.json). Cần playwright + Chromium + ffmpeg.
Chạy: python3 -B game/tools/quay-lang-chuong.py [--khong-quay]"""
import asyncio, functools, http.server, json, os, socketserver, subprocess, sys, threading, time
from playwright.async_api import async_playwright

HERE = os.path.dirname(os.path.abspath(__file__))
GAME = os.path.dirname(HERE)
GOC = os.path.dirname(GAME)
OUT = os.path.join(GAME, 'kiem-thu-lang-chuong')
QUAY = '--khong-quay' not in sys.argv

kt = open(os.path.join(GAME, 'thu-quai-boss', 'cong-cu', 'khoi-thu.js'), encoding='utf-8').read()
BOT = kt[kt.index('/* ---------- bot'):kt.index('/* ---------- kiểm đòn')] + r"""
window.__KT={doan:'', n:0, chet:[]};
window.__batDau=function(doan){ const K=__KT; K.doan=doan; K.n=0; for(const k of KEYS){ kb[k]=0; } BOT.rel.length=0; BOT.hj=0;
  if(doan==='cong'){ placePlayer((A2.x0+3)*T, FLOOR-pl.h); }
  if(doan==='quai'){ placePlayer(RB.x0*T+56, FLOOR-pl.h); S.cp=BELLS[1]; for(const b of BELLS) b.on=false; BELLS[1].on=true; }
  if(doan==='chet-ngua'){ resetQuai(Q[0]); Q[0].x=(RB.x0+9)*T; placePlayer((RB.x0+4)*T, FLOOR-pl.h); pl.face=1; pl.hp=1; pl.iframes=0; }
  if(doan==='chet-chui'){ resetQuai(Q[0]); Q[0].x=(RB.x0+9)*T; placePlayer((RB.x0+7)*T, FLOOR-pl.h); pl.face=-1; pl.hp=1; pl.iframes=0; }
};
window.__buoc=function(){ const K=__KT; K.n++; tha();
  if(K.doan==='lang'){ if(pl.drawT<=0){ di(1); const ax=pl.x+pl.w/2+40, ay=pl.y+pl.h+8;
      if(pl.onGround && !solidPt(ax,ay)) nhayBot(22); } }
  else if(K.doan==='cong'){ if(pl.x<SW.g1.x+4) di(1); }
  else if(K.doan==='quai'){ botQuai(); }
  const daChet=pl.dead;
  savePrev(); step(); render(1);
  if(pl.dead && !daChet) K.chet.push({doan:K.doan, f:S.frame, huong:pl.hurtK<0?'ngửa (lực ngược hướng nhìn)':'chúi (đòn sau lưng)'});
  return {doan:K.doan, n:K.n, x:Math.round(pl.x/T), dead:pl.dead, deadT:pl.deadT, hp:pl.hp, quai:Q.map(q=>q.dead?'x':q.st), cong:+DOORS[0].open.toFixed(2)};
};"""


class Im(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass


def may_chu():
    s = socketserver.ThreadingTCPServer(('127.0.0.1', 0), functools.partial(Im, directory=GOC)); s.daemon_threads = True
    threading.Thread(target=s.serve_forever, daemon=True).start()
    return s.server_address[1]


async def mo(b, url, vp=(960, 540), dpr=2, touch=False):
    ctx = await b.new_context(viewport={'width': vp[0], 'height': vp[1]}, device_scale_factor=dpr, has_touch=touch, is_mobile=touch)
    pg = await ctx.new_page()
    log = {'console_loi': [], 'trang_loi': [], 'yeu_cau_loi': []}
    pg.on('console', lambda m: log['console_loi'].append(m.text) if m.type in ('error', 'warning') and 'fonts.g' not in str(m.location) else None)
    pg.on('pageerror', lambda e: log['trang_loi'].append(str(e)))
    pg.on('requestfailed', lambda r: log['yeu_cau_loi'].append(r.url[:120]) if 'fonts.g' not in r.url else None)
    pg.on('response', lambda r: log['yeu_cau_loi'].append('%d %s' % (r.status, r.url)) if r.status >= 400 else None)
    await pg.route('https://fonts.googleapis.com/**', lambda r: r.abort())
    await pg.route('https://fonts.gstatic.com/**', lambda r: r.abort())
    t0 = time.time()
    await pg.goto(url)
    await pg.wait_for_function('window.TVDEMO && (TVDEMO.ready || TVDEMO.err)', timeout=60000)
    log['giay_mo_den_san_sang'] = round(time.time() - t0, 2)
    log['tvdemo'] = await pg.evaluate('({ready:TVDEMO.ready, err:TVDEMO.err||"", gach:TVDEMO.gach, lc:TVDEMO.lc, hd:TVDEMO.lam&&TVDEMO.lam.hd})')
    return pg, log


def ffmpeg(dst):
    return subprocess.Popen(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', '60', '-c:v', 'mjpeg', '-i', '-',
                             '-vf', 'scale=1280:720:flags=lanczos,format=yuv420p', '-c:v', 'libx264', '-preset', 'medium', '-crf', '20',
                             '-r', '60', '-movflags', '+faststart', dst], stdin=subprocess.PIPE)


async def main():
    os.makedirs(OUT, exist_ok=True)
    cong = may_chu()
    so = {}
    async with async_playwright() as p:
        b = await p.chromium.launch()
        base = 'http://127.0.0.1:%d/game/demo.html' % cong
        pg, so['nap_demo'] = await mo(b, base); await pg.close()
        bd = os.path.join(GAME, 'demo.build.html')
        subprocess.run([sys.executable, '-B', os.path.join(GAME, 'build-demo.py')], check=True)
        pg, so['nap_build'] = await mo(b, 'file://' + bd); await pg.close()
        so['nap_build']['mb'] = round(os.path.getsize(bd) / 1048576, 2)
        # iPhone ngang 844×390: nút Bắt đầu
        pg, lg = await mo(b, base, (844, 390), 3, True)
        await pg.wait_for_selector('#btn-start', state='visible', timeout=10000)
        bt = await pg.evaluate("""()=>{ const e=document.getElementById('btn-start'), r=e.getBoundingClientRect();
            const top=document.elementFromPoint(r.left+r.width/2, r.top+r.height/2);
            return {trai:+r.left.toFixed(1), tren:+r.top.toFixed(1), rong:+r.width.toFixed(1), cao:+r.height.toFixed(1),
                    trong_man: r.top>=0 && r.bottom<=innerHeight && r.left>=0 && r.right<=innerWidth, tren_cung: top===e}; }""")
        await pg.tap('#btn-start', timeout=5000)
        bt['sau_khi_cham_dang_choi'] = await pg.evaluate('!S.paused && document.getElementById("start").hidden')
        await pg.screenshot(path=os.path.join(OUT, 'anh-iphone-844x390.png'))
        lg['nut_bat_dau'] = bt; so['iphone_ngang'] = lg; await pg.close()
        # ảnh 960×540 (DPR 1)
        pg, _ = await mo(b, base, dpr=1)
        await pg.click('#btn-start'); await pg.evaluate("()=>{ window.loop=function(){}; document.getElementById('warn').hidden=true; }")
        for ten, cot in (('cong-lang', 'A1.x0+6'), ('cong-cong-tac', 'A2.x0+13'), ('san-chuong', 'RB.x0+11'), ('cau-do', 'RC.x0+20'), ('phong-boss', 'RE.x0+4')):
            await pg.evaluate("(c)=>{ placePlayer(eval(c)*T, FLOOR-pl.h); pl.drawT=0; for(let i=0;i<30;i++){ savePrev(); step(); } render(1); }", cot)
            await pg.screenshot(path=os.path.join(OUT, 'anh-960-%s.png' % ten))
        await pg.close()
        # video
        pg, so['quay'] = await mo(b, base)
        await pg.add_script_tag(content=BOT)
        await pg.evaluate("()=>{ window.loop=function(){}; }")
        await pg.click('#btn-start')
        await pg.evaluate("()=>{ document.getElementById('warn').hidden=true; }")
        ff = ffmpeg(os.path.join(OUT, 'lang-chuong-60fps.mp4')) if QUAY else None
        doan = {'lang': 420, 'cong': 170, 'quai': 1100, 'chet-ngua': 480, 'chet-chui': 480}
        dem = {}
        for d, nmax in doan.items():
            await pg.evaluate('(d)=>__batDau(d)', d)
            st = None
            for i in range(nmax):
                st = await pg.evaluate('()=>__buoc()')
                if ff:
                    ff.stdin.write(await pg.screenshot(type='jpeg', quality=90))
                if d == 'lang' and st['x'] >= 25 + 0: break
                if d == 'quai' and st['quai'][0] == 'x' and st['quai'][1] == 'x' and i > 60: break
                if d.startswith('chet') and not st['dead'] and i > 40 and dem.get(d + '_chet'): break
                if st['dead']: dem[d + '_chet'] = True
                if d.startswith('chet') and st['dead'] and st['deadT'] == 40:
                    await pg.screenshot(path=os.path.join(OUT, 'anh-960-%s.png' % d), scale='css')
            dem[d] = {'so_buoc': i + 1, 'cuoi': st}
        if ff: ff.stdin.close(); ff.wait()
        so['quay']['doan'] = dem
        so['quay']['lam_chet'] = await pg.evaluate('__KT.chet')
        await b.close()
    json.dump(so, open(os.path.join(OUT, 'so-do.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    for k, v in so.items():
        print(k, json.dumps({x: v[x] for x in v if x != 'tvdemo'}, ensure_ascii=False)[:900])

asyncio.run(main())
