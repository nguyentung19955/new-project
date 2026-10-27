#!/usr/bin/env python3
"""Quay video 60 fps: Lam đi qua cảnh chuẩn (mỗi khung video = đúng 1 bước logic), bot chạy phải từ sau điểm lưu, nhảy 2 bậc, nhảy qua
vực, đi dưới chuông làng → chuông ngân trầm 1 lần, lắc, tắt dần; dừng trước khối tường, giữ thêm 1,5 s để thấy chuông đã tắt.
→ game/thu-huong-moi/xem-thu/lam-qua-canh-chuan-60fps.mp4   (thêm "truoc" ở dòng lệnh để quay thêm bản demo hiện tại ?hm=0)
Cần playwright + Chromium + ffmpeg.   Chạy: python3 -B game/thu-huong-moi/cong-cu/quay-video.py [truoc]"""
import asyncio, functools, http.server, os, socketserver, subprocess, sys, threading, time
from playwright.async_api import async_playwright

HERE = os.path.dirname(os.path.abspath(__file__))
THM = os.path.normpath(os.path.join(HERE, '..'))
GOC = os.path.normpath(os.path.join(THM, '..', '..'))
OUT = os.path.join(THM, 'xem-thu')


class Im(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass


def ffmpeg(dst):
    return subprocess.Popen(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', '60', '-c:v', 'mjpeg', '-i', '-',
                             '-vf', 'format=yuv420p', '-c:v', 'libx264', '-preset', 'medium', '-crf', '20', '-r', '60', '-movflags', '+faststart', dst], stdin=subprocess.PIPE)


async def quay(p, cong, q, ten):
    b = await p.chromium.launch()
    pg = await b.new_page(viewport={'width': 960, 'height': 540}, device_scale_factor=1)
    loi = []
    pg.on('pageerror', lambda e: loi.append(str(e)))
    await pg.route('https://fonts.g*/**', lambda r: r.abort())
    await pg.goto('http://127.0.0.1:%d/game/thu-huong-moi/thu-huong-moi.html?ghi=1%s' % (cong, q))
    await pg.wait_for_function('window.TVDEMO && (TVDEMO.ready || TVDEMO.err)', timeout=120000)
    await pg.evaluate('TVTHU.batDau()'); await pg.evaluate('TVTHU.anUI(1)')
    await pg.evaluate('TVTHU.batBot(250, 872)')
    tep = os.path.join(OUT, ten); ff = ffmpeg(tep); n = 0; t0 = time.time(); sau = None; tat_o = None
    for _ in range(1200):
        st = await pg.evaluate('TVTHU.khung(1)')
        ff.stdin.write(await pg.screenshot(type='jpeg', quality=90)); n += 1
        if st['tat'] and tat_o is None: tat_o = n
        if st['xong'] and sau is None: sau = 90
        if sau is not None:
            sau -= 1
            if sau <= 0: break
    ff.stdin.close(); ff.wait()
    await b.close()
    print('%s  %d khung (%.1f s)  chuông tắt ở khung %s  quay %.0f s  lỗi trang: %d' % (ten, n, n / 60, tat_o, time.time() - t0, len(loi)))


async def main(truoc):
    s = socketserver.ThreadingTCPServer(('127.0.0.1', 0), functools.partial(Im, directory=GOC)); s.daemon_threads = True
    threading.Thread(target=s.serve_forever, daemon=True).start()
    async with async_playwright() as p:
        await quay(p, s.server_address[1], '', 'lam-qua-canh-chuan-60fps.mp4')
        if truoc: await quay(p, s.server_address[1], '&hm=0', 'truoc-lam-qua-canh-60fps.mp4')

asyncio.run(main('truoc' in sys.argv[1:]))
