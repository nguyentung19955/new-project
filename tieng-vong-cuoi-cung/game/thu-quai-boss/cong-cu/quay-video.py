#!/usr/bin/env python3
"""Quay video 60 fps bản thử quái + boss (Chromium headless + Playwright + ffmpeg) và ghi số đo.

Mỗi khung video = đúng 1 bước logic (60 bước/giây) → video 60 fps chính xác, không phụ thuộc tốc độ máy quay.
Trang mở ở chế độ ?ghi=1 (không tự chạy), mỗi khung gọi TVTHU.khung(): bot quyết định phím → step() → render(1) → chụp.

Đầu ra: game/thu-quai-boss/video/*.mp4 và game/thu-quai-boss/so-do/*.json
Chạy (từ thư mục gốc repo hoặc bất kỳ đâu):  python3 game/thu-quai-boss/cong-cu/quay-video.py [tên ...]
  tên: quai, boss, quai-hitbox, boss-hitbox, kiem, do-ve   (mặc định: tất cả)"""
import asyncio, functools, http.server, json, os, socketserver, subprocess, sys, threading, time
from playwright.async_api import async_playwright

HERE = os.path.dirname(os.path.abspath(__file__))
THU = os.path.normpath(os.path.join(HERE, '..'))
GOC = os.path.normpath(os.path.join(THU, '..', '..'))          # tieng-vong-cuoi-cung/
VID = os.path.join(THU, 'video'); SO = os.path.join(THU, 'so-do')
os.makedirs(VID, exist_ok=True); os.makedirs(SO, exist_ok=True)

class Im(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
def chay_may_chu():
    h = functools.partial(Im, directory=GOC)
    s = socketserver.ThreadingTCPServer(('127.0.0.1', 0), h); s.daemon_threads = True
    threading.Thread(target=s.serve_forever, daemon=True).start()
    return s.server_address[1]

VIEC = {
    # tên: (tham số, tệp video, khung tối đa, dpr, cỡ ra, cận cảnh?)
    'quai':        ('vao=quai&bot=quai&batTu=1',            '1-lam-danh-3-quai.mp4',               2400, 2, '1280:720',  False),
    'boss':        ('vao=boss&bot=boss&batTu=1',            '2-tran-boss-du-2-pha.mp4',            5400, 2, '1280:720',  False),
    'quai-hitbox': ('vao=quai&bot=quai&batTu=1&hitbox=1',   '3a-lam-danh-3-quai-hitbox.mp4',       2400, 2, '1920:1080', False),
    'boss-hitbox': ('vao=boss&bot=boss&batTu=1&hitbox=1',   '3b-tran-boss-2-pha-hitbox.mp4',       5400, 2, '1920:1080', False),
    'kiem':        ('kiem=1',                               '4-can-canh-kiem-don-2-huong.mp4',     3000, 3, '1920:1080', True),
}

def ffmpeg(dst, co):
    return subprocess.Popen(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', '60', '-c:v', 'mjpeg', '-i', '-',
                             '-vf', 'scale=%s:flags=lanczos,format=yuv420p' % co, '-c:v', 'libx264', '-preset', 'medium', '-crf', '20',
                             '-r', '60', '-movflags', '+faststart', dst], stdin=subprocess.PIPE)

async def mo(p, cong, ts, dpr):
    b = await p.chromium.launch()
    pg = await b.new_page(viewport={'width': 960, 'height': 540}, device_scale_factor=dpr)
    loi = []
    pg.on('pageerror', lambda e: loi.append(str(e)))
    t0 = time.time()
    await pg.goto('http://127.0.0.1:%d/game/thu-quai-boss/thu-quai-boss.html?%s' % (cong, ts))
    await pg.wait_for_function('window.TVDEMO && (TVDEMO.ready || TVDEMO.err)', timeout=60000)
    err = await pg.evaluate('TVDEMO.err||""')
    if err: raise SystemExit('Lỗi nạp: ' + err)
    return b, pg, loi, time.time() - t0

async def quay(p, cong, ten):
    ts, tep, nmax, dpr, co, can = VIEC[ten]
    b, pg, loi, tnap = await mo(p, cong, 'ghi=1&' + ts, dpr)
    await pg.evaluate('TVTHU.batDau()')
    ff = ffmpeg(os.path.join(VID, tep), co)
    sau = None; n = 0; t0 = time.time()
    for i in range(nmax):
        st = await pg.evaluate('TVTHU.khung(1)')
        if can:
            cx, cy = st['tam']; w, h = st['cat']
            x = min(max(cx - w / 2, 0), 960 - w); y = min(max(cy - h / 2 - 20, 0), 540 - h)
            img = await pg.screenshot(type='jpeg', quality=92, clip={'x': x, 'y': y, 'width': w, 'height': h})
        else:
            img = await pg.screenshot(type='jpeg', quality=92)
        ff.stdin.write(img); n += 1
        xong = st['ketThuc'] or st.get('kiemXong') or (ten.startswith('quai') and all(q == 'x' for q in st['quai']))
        if xong and sau is None: sau = 45 if st['ketThuc'] else 30
        if sau is not None:
            sau -= 1
            if sau <= 0: break
    ff.stdin.close(); ff.wait()
    so = await pg.evaluate('TVTHU.so()')
    so.update({'video': tep, 'so_khung_video': n, 'giay': round(n / 60, 2), 'tham_so': ts, 'dpr': dpr, 'loi_trang': loi,
               'giay_quay_thuc': round(time.time() - t0, 1), 'giay_mo_trang_den_san_sang': round(tnap, 2)})
    json.dump(so, open(os.path.join(SO, ten + '.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print('%-12s %s  %d khung (%.1f s)  lỗi trang: %d' % (ten, tep, n, n / 60, len(loi)))
    await b.close()

async def do_ve(p, cong):
    """Đo thời gian vẽ thật ở chế độ chạy thường (rAF), bộ đệm 1920×1080 (DPR 2 ≈ iPhone ngang BK 2,17): boss pha 1+2 do bot đánh."""
    kq = {}
    for ten, ts in (('quai', 'vao=quai&bot=quai&batTu=1'), ('boss', 'vao=boss&bot=boss&batTu=1')):
        b, pg, loi, tnap = await mo(p, cong, ts, 2)
        await pg.evaluate('TVTHU.batDau()')
        await pg.wait_for_timeout(1500); await pg.evaluate('TVTHU.datLai()')
        await pg.wait_for_timeout(12000)
        so = await pg.evaluate('TVTHU.so()')
        kq[ten] = {'ve': so['ve'], 'nap': so['nap'], 'giay_mo_trang_den_san_sang': round(tnap, 2), 'loi_trang': loi}
        await b.close()
    json.dump(kq, open(os.path.join(SO, 'do-ve.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print('do-ve', json.dumps({k: v['ve'] for k, v in kq.items()}, ensure_ascii=False))

async def main(ds):
    cong = chay_may_chu()
    async with async_playwright() as p:
        for ten in ds:
            if ten == 'do-ve': await do_ve(p, cong)
            else: await quay(p, cong, ten)

if __name__ == '__main__':
    ds = sys.argv[1:] or ['do-ve', 'kiem', 'quai', 'boss', 'quai-hitbox', 'boss-hitbox']
    asyncio.run(main(ds))
