#!/usr/bin/env python3
"""Kiểm nhanh demo.html sau khi ghép quái + boss vẽ từ mảnh: nạp (lỗi console, số đo QBR.so), bản build tự chứa, và quay
1 video 60 fps TRONG demo.html chính (mỗi khung video = đúng 1 bước logic): Lam đánh 3 quái (?vao=quai) rồi trận boss 2 pha (?vao=boss).

Bot (Lam tự đánh) KHÔNG nằm trong demo.html: script này lấy phần bot của game/thu-quai-boss/cong-cu/khoi-thu.js và chèn
vào trang lúc quay (add_script_tag). Bot chỉ bấm phím; gameplay không đổi, Lam không bất tử.
Đầu ra: game/kiem-thu-ghep-quai-boss/lam-quai-boss-60fps.mp4 + so-do.json
Cần: playwright (Python) + Chromium, ffmpeg. Chạy: python3 -B game/tools/quay-ghep-quai-boss.py [--khong-quay]"""
import asyncio, functools, http.server, json, os, socketserver, subprocess, sys, threading, time
from playwright.async_api import async_playwright

HERE = os.path.dirname(os.path.abspath(__file__))
GAME = os.path.dirname(HERE)
GOC = os.path.dirname(GAME)
OUT = os.path.join(GAME, 'kiem-thu-ghep-quai-boss')
QUAY = '--khong-quay' not in sys.argv

kt = open(os.path.join(GAME, 'thu-quai-boss', 'cong-cu', 'khoi-thu.js'), encoding='utf-8').read()
BOT = kt[kt.index('/* ---------- bot'):kt.index('/* ---------- kiểm đòn')] + """
window.__botBuoc=function(loai){ tha(); if(loai==='quai') botQuai(); else botBoss(); };"""

STEP = """(loai)=>{ __botBuoc(loai); savePrev(); step(); render(1);
  return {f:S.frame, ketThuc:!endEl.hidden, won:S.won, boss:{st:boss.st,hp:boss.hp,pha:boss.phase,dead:boss.dead},
    quai:Q.map(q=>q.dead?'x':q.st), lamHp:pl.hp, chet:S.deaths}; }"""


class Im(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass


def may_chu():
    s = socketserver.ThreadingTCPServer(('127.0.0.1', 0), functools.partial(Im, directory=GOC)); s.daemon_threads = True
    threading.Thread(target=s.serve_forever, daemon=True).start()
    return s.server_address[1]


async def mo(b, url, dpr=1):
    pg = await b.new_page(viewport={'width': 960, 'height': 540}, device_scale_factor=dpr)
    log = {'console_loi': [], 'trang_loi': [], 'yeu_cau_loi': []}
    pg.on('console', lambda m: log['console_loi'].append(m.text + ' ' + (m.location or {}).get('url', ''))
          if m.type in ('error', 'warning') and not (m.text.startswith('Failed to load resource') and 'fonts.g' in str(m.location)) else None)
    pg.on('pageerror', lambda e: log['trang_loi'].append(str(e)))
    pg.on('requestfailed', lambda r: log['yeu_cau_loi'].append(r.url[:120]) if 'fonts.g' not in r.url else None)
    pg.on('response', lambda r: log['yeu_cau_loi'].append('%d %s' % (r.status, r.url)) if r.status >= 400 else None)
    await pg.route('https://fonts.googleapis.com/**', lambda r: r.abort())
    await pg.route('https://fonts.gstatic.com/**', lambda r: r.abort())
    t0 = time.time()
    await pg.goto(url)
    await pg.wait_for_function('window.TVDEMO && (TVDEMO.ready || TVDEMO.err)', timeout=60000)
    log['giay_mo_den_san_sang'] = round(time.time() - t0, 2)
    log['tvdemo'] = await pg.evaluate('({ready:TVDEMO.ready, err:TVDEMO.err||"", qbr:TVDEMO.qbr})')
    return pg, log


def ffmpeg(dst):
    return subprocess.Popen(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', '60', '-c:v', 'mjpeg', '-i', '-',
                             '-vf', 'scale=1280:720:flags=lanczos,format=yuv420p', '-c:v', 'libx264', '-preset', 'medium', '-crf', '20',
                             '-r', '60', '-movflags', '+faststart', dst], stdin=subprocess.PIPE)


async def doan(b, cong, ts, loai, nmax, ff):
    pg, log = await mo(b, 'http://127.0.0.1:%d/game/demo.html?%s' % (cong, ts), 2)
    if not log['tvdemo']['ready']:
        raise SystemExit('Lỗi nạp: %s' % log['tvdemo'])
    await pg.add_script_tag(content=BOT)
    await pg.evaluate("()=>{ window.loop=function(){}; }")
    await pg.click('#btn-start')
    await pg.evaluate("()=>{ document.getElementById('warn').hidden=true; }")
    n = 0; sau = None; st = None
    for i in range(nmax):
        st = await pg.evaluate(STEP, loai)
        if ff:
            ff.stdin.write(await pg.screenshot(type='jpeg', quality=92))
        n += 1
        xong = st['ketThuc'] or (loai == 'quai' and all(q == 'x' for q in st['quai']))
        if xong and sau is None: sau = 45
        if sau is not None:
            sau -= 1
            if sau <= 0: break
    log['so_buoc'] = n; log['cuoi'] = st
    await pg.close()
    return log


async def main():
    os.makedirs(OUT, exist_ok=True)
    cong = may_chu()
    so = {}
    async with async_playwright() as p:
        b = await p.chromium.launch()
        # 1. nạp demo.html thường (DPR 2, như iPhone ngang)
        pg, so['nap_demo'] = await mo(b, 'http://127.0.0.1:%d/game/demo.html' % cong, 2); await pg.close()
        # 2. bản build tự chứa (file://, không mạng)
        bd = os.path.join(GAME, 'demo.build.html')
        subprocess.run([sys.executable, '-B', os.path.join(GAME, 'build-demo.py')], check=True)
        pg, so['nap_build'] = await mo(b, 'file://' + bd, 2); await pg.close()
        so['nap_build']['mb'] = round(os.path.getsize(bd) / 1048576, 2)
        # 3. video: quái rồi boss
        ff = ffmpeg(os.path.join(OUT, 'lam-quai-boss-60fps.mp4')) if QUAY else None
        so['quai'] = await doan(b, cong, 'vao=quai', 'quai', 2400, ff)
        so['boss'] = await doan(b, cong, 'vao=boss', 'boss', 5400, ff)
        if ff: ff.stdin.close(); ff.wait()
        await b.close()
    json.dump(so, open(os.path.join(OUT, 'so-do.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    for k, v in so.items():
        print(k, json.dumps({x: v[x] for x in v if x != 'tvdemo'}, ensure_ascii=False)[:600])

asyncio.run(main())
