#!/usr/bin/env python3
"""Quay video 60 fps bản kiểm thử trang trí địa hình: Lam (bot kịch bản, ?quai=0 → không có quái Sân chuông) đi qua 3 màn
  1. Cổng làng nửa đầu: chạy, nhảy bậc, bay qua hố → cắt cảnh nửa sau: nhảy lên bệ ván treo, ghi Tiếng Vọng giữ công tắc, qua cổng
  2. Sân chuông: chạy suốt sân (nhảy qua khối đá), qua cổng
  3. Phòng boss (?vao=boss): đi vào, boss thức, 1 cú đập, rồi ép sang pha 2 → boss treo trần (xem trần + tiền cảnh không che boss)
Mỗi khung video = đúng 1 bước logic (60 bước/giây). Đầu ra: game/kiem-thu-trang-tri/xem-thu/lam-di-qua-3-man-60fps.mp4
(+ bản bật collider nếu truyền "collider"). Cần playwright + Chromium + ffmpeg. Chạy: python3 -B game/kiem-thu-trang-tri/cong-cu/quay-video.py [collider]"""
import asyncio, functools, http.server, os, socketserver, subprocess, sys, threading, time
from playwright.async_api import async_playwright

HERE = os.path.dirname(os.path.abspath(__file__))
KT = os.path.normpath(os.path.join(HERE, '..'))
GOC = os.path.normpath(os.path.join(KT, '..', '..'))
OUT = os.path.join(KT, 'xem-thu')
# (đoạn bot, x đặt Lam, mốc kết thúc, số khung tối đa)
DOAN = [('a1', 134, 0, 480), ('a2', 1192, 0, 900), ('rb', 2168, 3300, 900), ('boss', 5400, 150, 900)]


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
    await pg.goto('http://127.0.0.1:%d/game/kiem-thu-trang-tri/kiem-thu.html?ghi=1&quai=0%s' % (cong, '&hitbox=1' if hb else ''))
    await pg.wait_for_function('window.TVDEMO && (TVDEMO.ready || TVDEMO.err)', timeout=120000)
    err = await pg.evaluate('TVDEMO.err||""')
    if err: raise SystemExit('Lỗi nạp: ' + err)
    await pg.evaluate('TVTHU.batDau()')
    tep = os.path.join(OUT, 'lam-di-qua-3-man-60fps%s.mp4' % ('-collider' if hb else ''))
    ff = ffmpeg(tep); n = 0; t0 = time.time(); tom = []
    for s, x0, moc, toi_da in DOAN:
        await pg.evaluate('(a)=>{ TVTHU.tocMau(); TVTHU.batBot(a[0],a[1],a[2]); }', [s, x0, moc])
        k = 0; st = None; sau = None
        while k < toi_da:
            st = await pg.evaluate('TVTHU.khung(1)'); k += 1
            ff.stdin.write(await pg.screenshot(type='jpeg', quality=90)); n += 1
            if st['xong'] and sau is None: sau = 30          # giữ thêm 0,5 s cuối đoạn
            if sau is not None:
                sau -= 1
                if sau <= 0: break
        tom.append('%s: %d khung, Lam x %.0f, %s' % (s, k, st['x'], 'xong' if st['xong'] else 'HẾT GIỜ'))
    ff.stdin.close(); ff.wait()
    await b.close()
    print('%s  %d khung (%.1f s)  quay %.0f s  lỗi trang: %d\n  %s' % (os.path.basename(tep), n, n / 60, time.time() - t0, len(loi), '\n  '.join(tom)))


async def main(hb):
    s = socketserver.ThreadingTCPServer(('127.0.0.1', 0), functools.partial(Im, directory=GOC)); s.daemon_threads = True
    threading.Thread(target=s.serve_forever, daemon=True).start()
    async with async_playwright() as p:
        await quay(p, s.server_address[1], False)
        if hb: await quay(p, s.server_address[1], True)

asyncio.run(main('collider' in sys.argv[1:]))
