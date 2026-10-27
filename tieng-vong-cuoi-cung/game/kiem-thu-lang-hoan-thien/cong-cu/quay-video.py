#!/usr/bin/env python3
"""Quay video 60 fps ngắn bản kiểm thử làng hoàn thiện (kiem-thu.html?ghi=1&vao=quai&quai=gac – chỉ giữ quái gác cổng):
  1. màn Bắt đầu (tranh man-bat-dau) ~0,8 s → bấm Bắt đầu
  2. Sân chuông: Lam đi tới Trưởng làng → hộp thoại 4 câu → đi tới Thợ Rèn Hòn → 2 câu (búa gõ) → đóng
  3. đi tới quái gác cổng (bot tự nhảy qua khối đá), bấm Vọng – chém – Vọng, rồi chém CÙNG LÚC với bóng → Cộng hưởng → chuông lớn rung
Mỗi khung video = đúng 1 bước logic. Bước 3 thử trước (không quay) vài độ trễ chém để chắc Cộng hưởng xảy ra, rồi mới quay.
Đầu ra: game/kiem-thu-lang-hoan-thien/xem-thu/bat-dau-noi-chuyen-cong-huong-60fps.mp4. Cần playwright + Chromium + ffmpeg.
Chạy: python3 -B game/kiem-thu-lang-hoan-thien/cong-cu/quay-video.py"""
import asyncio, functools, http.server, os, socketserver, subprocess, threading, time
from playwright.async_api import async_playwright

HERE = os.path.dirname(os.path.abspath(__file__))
KT = os.path.normpath(os.path.join(HERE, '..'))
GOC = os.path.normpath(os.path.join(KT, '..', '..'))
OUT = os.path.join(KT, 'xem-thu')
TEP = os.path.join(OUT, 'bat-dau-noi-chuyen-cong-huong-60fps.mp4')


class Im(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass


class Quay:
    def __init__(self, pg, ff):
        self.pg, self.ff, self.n = pg, ff, 0

    async def anh(self):
        if self.ff:
            self.ff.stdin.write(await self.pg.screenshot(type='jpeg', quality=90)); self.n += 1

    async def k(self, n=1, phim=None):
        st = None
        for _ in range(n):
            st = await self.pg.evaluate('(p)=>TVTHU.khung(1,p)', phim); await self.anh()
        return st

    async def di_toi(self, x, toi_da=600):
        st = await self.k(1, 'phai')
        i = 0
        while st['x'] < x and i < toi_da:
            st = await self.k(1, 'phai'); i += 1
        st = await self.k(14)                   # dừng hẳn
        return st


async def canh_cong_huong(q, tre):
    """đứng trước quái gác, Vọng → chém → Vọng; chém lại sau `tre` bước kể từ lúc dừng ghi."""
    await q.k(1, {'v': 1}); await q.k(19)
    await q.k(1, {'a': 1}); await q.k(30)
    await q.k(1, {'v': 1}); await q.k(tre)
    await q.k(1, {'a': 1})
    st = await q.k(40)
    return st


async def mo(b, cong):
    pg = await b.new_page(viewport={'width': 960, 'height': 540}, device_scale_factor=1)
    loi = []
    pg.on('pageerror', lambda e: loi.append(str(e)))
    await pg.route('https://fonts.g*/**', lambda r: r.abort())
    await pg.goto('http://127.0.0.1:%d/game/kiem-thu-lang-hoan-thien/kiem-thu.html?ghi=1&vao=quai&quai=gac' % cong)
    await pg.wait_for_function('window.TVDEMO && (TVDEMO.ready || TVDEMO.err)', timeout=120000)
    err = await pg.evaluate('TVDEMO.err||""')
    if err: raise SystemExit('Lỗi nạp: ' + err)
    await pg.wait_for_function('!document.getElementById("start").hidden', timeout=30000)
    return pg, loi


async def main():
    s = socketserver.ThreadingTCPServer(('127.0.0.1', 0), functools.partial(Im, directory=GOC)); s.daemon_threads = True
    threading.Thread(target=s.serve_forever, daemon=True).start()
    cong = s.server_address[1]
    async with async_playwright() as p:
        b = await p.chromium.launch()
        # ---- thử trước độ trễ chém (không quay)
        tre_tot = None
        for tre in (0, 2, 4, 6, 8, 10, 1, 3, 5):
            pg, _ = await mo(b, cong)
            await pg.evaluate('TVTHU.batDau()')
            q = Quay(pg, None)
            await pg.evaluate('TVTHU.datCam(2978,2368)')
            await q.k(10)
            st = await canh_cong_huong(q, tre)
            await pg.close()
            print('thử trễ', tre, '→ Cộng hưởng', st['res'])
            if st['res'] > 0:
                tre_tot = tre; break
        if tre_tot is None:
            raise SystemExit('bot không tạo được Cộng hưởng')
        # ---- quay
        pg, loi = await mo(b, cong)
        ff = subprocess.Popen(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', '60', '-c:v', 'mjpeg', '-i', '-',
                               '-vf', 'format=yuv420p', '-c:v', 'libx264', '-preset', 'medium', '-crf', '21', '-r', '60', '-movflags', '+faststart', TEP],
                              stdin=subprocess.PIPE)
        q = Quay(pg, ff); t0 = time.time(); tom = []
        for _ in range(48): await q.anh()                         # màn Bắt đầu
        await pg.evaluate('TVTHU.batDau()')
        await pg.evaluate('TVTHU.hint(0)')
        st = await q.di_toi(2204); tom.append('tới Trưởng làng x %.0f, gần: %s' % (st['x'], st['gan']))
        await q.k(20)                                              # thấy nút "Nói chuyện" + bong bóng
        tom.append('mở thoại: %s' % await pg.evaluate('TVTHU.noi()'))
        for i in range(4):
            await q.k(80)
            await pg.evaluate('TVTHU.tiep()')
        st = await q.di_toi(2372); tom.append('tới Thợ rèn x %.0f, gần: %s' % (st['x'], st['gan']))
        await q.k(12)
        await pg.evaluate('TVTHU.noi()')
        await q.k(85); await pg.evaluate('TVTHU.tiep()'); await q.k(85); await pg.evaluate('TVTHU.dong()')
        st = await q.di_toi(2982, 900); tom.append('tới quái gác x %.0f' % st['x'])
        await q.k(10)
        st = await canh_cong_huong(q, tre_tot); tom.append('Cộng hưởng: %d lần (trễ %d)' % (st['res'], tre_tot))
        await q.k(110)                                             # chuông lớn còn rung
        ff.stdin.close(); ff.wait()
        await b.close()
    print('%s  %d khung (%.1f s)  quay %.0f s  lỗi trang: %d\n  %s' % (os.path.basename(TEP), q.n, q.n / 60, time.time() - t0, len(loi), '\n  '.join(tom)))

asyncio.run(main())
