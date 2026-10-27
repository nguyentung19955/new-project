#!/usr/bin/env python3
"""Quay video 60 fps bản thử Cổng làng: Lam (bot kịch bản) chạy / nhảy bậc / qua hố ở nửa đầu, cắt cảnh sang nửa sau: nhảy lên bệ
rễ đỡ, đứng công tắc mở cổng, qua cổng. Mỗi khung video = đúng 1 bước logic (60 bước/giây).
Đầu ra: game/thu-cong-lang/xem-thu/lam-chay-cong-lang-60fps.mp4 (+ bản bật collider nếu truyền "collider").
Cần playwright + Chromium + ffmpeg. Chạy: python3 -B game/thu-cong-lang/cong-cu/quay-video.py [collider]"""
import asyncio, functools, http.server, os, socketserver, subprocess, sys, threading, time
from playwright.async_api import async_playwright

HERE = os.path.dirname(os.path.abspath(__file__))
THU = os.path.normpath(os.path.join(HERE, '..'))
GOC = os.path.normpath(os.path.join(THU, '..', '..'))
OUT = os.path.join(THU, 'xem-thu')


class Im(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass


def ffmpeg(dst):
    return subprocess.Popen(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', '60', '-c:v', 'mjpeg', '-i', '-',
                             '-vf', 'format=yuv420p', '-c:v', 'libx264', '-preset', 'medium', '-crf', '21',
                             '-r', '60', '-movflags', '+faststart', dst], stdin=subprocess.PIPE)


async def quay(p, cong, hb):
    b = await p.chromium.launch()
    pg = await b.new_page(viewport={'width': 960, 'height': 540}, device_scale_factor=1)
    loi = []
    pg.on('pageerror', lambda e: loi.append(str(e)))
    await pg.route('https://fonts.g*/**', lambda r: r.abort())
    await pg.goto('http://127.0.0.1:%d/game/thu-cong-lang/thu-cong-lang.html?ghi=1%s' % (cong, '&hitbox=1' if hb else ''))
    await pg.wait_for_function('window.TVDEMO && (TVDEMO.ready || TVDEMO.err)', timeout=90000)
    err = await pg.evaluate('TVDEMO.err||""')
    if err: raise SystemExit('Lỗi nạp: ' + err)
    await pg.evaluate('TVTHU.batDau()')
    await pg.evaluate('TVTHU.batBot()')
    tep = os.path.join(OUT, 'lam-chay-cong-lang-60fps%s.mp4' % ('-collider' if hb else ''))
    ff = ffmpeg(tep); n = 0; sau = None; t0 = time.time()
    for i in range(2400):
        st = await pg.evaluate('TVTHU.khung(1)')
        ff.stdin.write(await pg.screenshot(type='jpeg', quality=90)); n += 1
        if st['xong'] and sau is None: sau = 40
        if sau is not None:
            sau -= 1
            if sau <= 0: break
    ff.stdin.close(); ff.wait()
    await b.close()
    print('%s  %d khung (%.1f s)  quay %.0f s  lỗi trang: %d  %s' % (os.path.basename(tep), n, n / 60, time.time() - t0, len(loi), st))


async def main(hb):
    s = socketserver.ThreadingTCPServer(('127.0.0.1', 0), functools.partial(Im, directory=GOC)); s.daemon_threads = True
    threading.Thread(target=s.serve_forever, daemon=True).start()
    async with async_playwright() as p:
        await quay(p, s.server_address[1], False)
        if hb: await quay(p, s.server_address[1], True)

asyncio.run(main('collider' in sys.argv[1:]))
