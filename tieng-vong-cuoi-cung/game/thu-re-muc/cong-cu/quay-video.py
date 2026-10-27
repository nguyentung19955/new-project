#!/usr/bin/env python3
"""Quay video 60 fps màn thử Rễ Mục (bot kịch bản, mỗi khung video = đúng 1 bước logic) → game/thu-re-muc/xem-thu/lam-di-het-re-muc-60fps.mp4
  1. 'tha'      từ sàn vào chạy phải rơi xuống giếng, bám tường mục trái: nứt dần (rung) → GÃY sau 2 giây → rơi xuống hành lang
  2. 'leo'      (cắt cảnh, tường đã mọc lại) từ sàn vào nhảy xuống giếng, bám tường phải, nhảy qua lại 2 tường mục (mỗi lần bám ngắn →
                đồng hồ không tích đủ, KHÔNG gãy) và leo ngược lên sàn vào
  3. 'hanh-lang' chạy hết hành lang: nấm, bào tử nổ khi tới gần, kén, bệ ván treo (nhảy lên), giọt nước, bậc, 2 quái (?quai=0 → bỏ quái
                để bot không phải đánh), chuông vỡ cuối màn
Thêm "collider" ở dòng lệnh để quay thêm bản bật overlay collider. Cần playwright + Chromium + ffmpeg.
Chạy: python3 -B game/thu-re-muc/cong-cu/quay-video.py [collider]"""
import asyncio, functools, http.server, os, socketserver, subprocess, sys, threading, time
from playwright.async_api import async_playwright

HERE = os.path.dirname(os.path.abspath(__file__))
TRM = os.path.normpath(os.path.join(HERE, '..'))
GOC = os.path.normpath(os.path.join(TRM, '..', '..'))
OUT = os.path.join(TRM, 'xem-thu')
RMX, T = 6272, 32
# (đoạn, x đặt Lam, y chân, mốc x kết thúc, số khung tối đa)
DOAN = [('tha', RMX + 2 * T + 8, 14 * T, 0, 700), ('leo', RMX + 2 * T + 8, 14 * T, 0, 1100), ('hanh-lang', RMX + 10 * T, 32 * T, RMX + 39 * T, 900)]


class Im(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass


def ffmpeg(dst):
    return subprocess.Popen(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', '60', '-c:v', 'mjpeg', '-i', '-',
                             '-vf', 'format=yuv420p', '-c:v', 'libx264', '-preset', 'medium', '-crf', '21', '-r', '60', '-movflags', '+faststart', dst], stdin=subprocess.PIPE)


async def quay(p, cong, hb):
    b = await p.chromium.launch()
    pg = await b.new_page(viewport={'width': 960, 'height': 540}, device_scale_factor=1)
    loi = []
    pg.on('pageerror', lambda e: loi.append(str(e)))
    await pg.route('https://fonts.g*/**', lambda r: r.abort())
    await pg.goto('http://127.0.0.1:%d/game/thu-re-muc/thu-re-muc.html?ghi=1&vao=remuc&quai=0%s' % (cong, '&hitbox=1' if hb else ''))
    await pg.wait_for_function('window.TVDEMO && (TVDEMO.ready || TVDEMO.err)', timeout=120000)
    err = await pg.evaluate('TVDEMO.err||""')
    if err: raise SystemExit('Lỗi nạp: ' + err)
    await pg.evaluate('TVTHU.batDau()')
    await pg.evaluate('TVTHU.khung(40)')          # chờ chuyển nền Làng Chuông → Rễ Mục
    tep = os.path.join(OUT, 'lam-di-het-re-muc-60fps%s.mp4' % ('-collider' if hb else ''))
    ff = ffmpeg(tep); n = 0; t0 = time.time(); tom = []
    for s, x0, y0, moc, toi_da in DOAN:
        await pg.evaluate('(a)=>{ TVTHU.tocMau(); TVTHU.mocLai(); TVTHU.batBot(a[0],a[1],a[2],a[3]); }', [s, x0, y0, moc])
        k = 0; st = None; sau = None
        while k < toi_da:
            st = await pg.evaluate('TVTHU.khung(1)'); k += 1
            ff.stdin.write(await pg.screenshot(type='jpeg', quality=90)); n += 1
            if st['xong'] and sau is None: sau = 36
            if sau is not None:
                sau -= 1
                if sau <= 0: break
        tom.append('%s: %d khung, Lam x %.0f y %.0f, tường mục %s, %s' % (s, k, st['x'], st['y'], st['muc'], 'xong' if st['xong'] else 'HẾT GIỜ'))
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
