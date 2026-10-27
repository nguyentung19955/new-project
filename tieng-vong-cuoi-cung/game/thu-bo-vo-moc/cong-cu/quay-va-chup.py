#!/usr/bin/env python3
"""Quay video 60 hình/s (mỗi hình = đúng 1 bước logic) + chụp ảnh trang thử Bọ Vỏ Mộc → game/kiem-thu-bo-vo-moc/
Video H.264 (-preset veryfast). Ảnh 960×540 cỡ thật (không phóng).
Cần playwright + Chromium + ffmpeg.   Chạy: python3 -B game/thu-bo-vo-moc/cong-cu/quay-va-chup.py [video] [anh]"""
import asyncio, functools, http.server, io, json, os, socketserver, subprocess, sys, threading
from playwright.async_api import async_playwright
from PIL import Image, ImageOps

HERE = os.path.dirname(os.path.abspath(__file__))
GOC = os.path.normpath(os.path.join(HERE, '..', '..', '..'))
OUT = os.path.join(GOC, 'game', 'kiem-thu-bo-vo-moc'); os.makedirs(OUT, exist_ok=True)


class Im(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass


def ffmpeg(dst):
    return subprocess.Popen(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', '60', '-c:v', 'mjpeg', '-i', '-',
                             '-vf', 'format=yuv420p', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '21', '-r', '60', '-movflags', '+faststart', dst],
                            stdin=subprocess.PIPE)


async def mo(p, cong, q):
    b = await p.chromium.launch()
    pg = await b.new_page(viewport={'width': 960, 'height': 540}, device_scale_factor=1)
    loi = []; pg.on('pageerror', lambda e: loi.append(str(e)))
    await pg.route('https://fonts.g*/**', lambda r: r.abort())
    await pg.goto('http://127.0.0.1:%d/game/thu-bo-vo-moc/index.html?ghi=1%s' % (cong, q))
    await pg.wait_for_function('window.TVDEMO && TVDEMO.ready', timeout=120000)
    await pg.evaluate('TVTHU.batDau()'); await pg.evaluate('TVTHU.anUI(1)')
    return b, pg, loi


async def quay(p, cong, q, ten, bot=None, toi_da=1500, sau=90):
    b, pg, loi = await mo(p, cong, q)
    if bot: await pg.evaluate('TVTHU.batBot("%s")' % bot)
    ff = ffmpeg(os.path.join(OUT, ten)); n = 0; con = None; nhat = []
    for _ in range(toi_da):
        st = await pg.evaluate('TVTHU.khung(1)')
        ff.stdin.write(await pg.screenshot(type='jpeg', quality=90)); n += 1
        if st['bo'] and (not nhat or nhat[-1][1:] != [x[0] for x in st['bo']]): nhat.append([st['f']] + [x[0] for x in st['bo']])
        if con is None and bot and all(x[6] for x in st['bo']): con = sau
        if con is not None:
            con -= 1
            if con <= 0: break
    ff.stdin.close(); ff.wait(); await b.close()
    print('%s: %d khung (%.1f s), lỗi trang %d' % (ten, n, n / 60, len(loi)))
    return {'file': ten, 'khung': n, 'giay': round(n / 60, 2), 'trang_thai': nhat}


async def chup(p, cong):
    kq = {}
    # 1) màn chơi đầu: 2 con, Lam ở chuông lưu
    b, pg, loi = await mo(p, cong, '')
    await pg.evaluate('TVTHU.khung(20)'); await pg.screenshot(path=os.path.join(OUT, 'man-choi.png'))
    # 2) so cỡ: Lam đứng cạnh Bọ (đứng yên, chế độ xem clip)
    await b.close(); b, pg, loi = await mo(p, cong, '&xem=1&mot=1')
    st = await pg.evaluate('TVTHU.khung(1)'); x = st['bo'][0][5]
    await pg.evaluate('TVTHU.datLam(%f,1)' % (x - 120)); await pg.evaluate('TVTHU.khung(1)')
    await pg.screenshot(path=os.path.join(OUT, 'so-co-lam-112-bo-74.png'))
    for f, ten in ((150 + 12, 'bao-truoc-huc'), (470, 'nam-ngua-choang'), (690, 'chet-mai-roi')):
        cur = (await pg.evaluate('TVTHU.khung(0)'))['f']; await pg.evaluate('TVTHU.khung(%d)' % (f - cur))
        await pg.screenshot(path=os.path.join(OUT, ten + '.png'))
    await b.close()
    # 3) cảnh tối hướng mới vs màu demo hiện tại (?hm=0) + bản xám (kiểm Bọ không chìm nền)
    for q, ten in (('', 'canh-huong-moi'), ('&hm=0', 'canh-mau-demo-hien-tai')):
        b, pg, loi = await mo(p, cong, q)
        await pg.evaluate('TVTHU.khung(20)'); png = await pg.screenshot(); await b.close()
        Image.open(io.BytesIO(png)).save(os.path.join(OUT, ten + '.png'))
        ImageOps.grayscale(Image.open(io.BytesIO(png))).save(os.path.join(OUT, ten + '-xam.png'))
    # 4) hitbox: thân (xanh), phần bụng lộ (lục đứt), vùng húc (cam / đỏ)
    b, pg, loi = await mo(p, cong, '&hitbox=1&mot=1')
    for i in range(60):
        st = await pg.evaluate('TVTHU.khung(1)')
        if st['bo'][0][0] == 'bao' and st['bo'][0][1] >= 20: break
    await pg.screenshot(path=os.path.join(OUT, 'hitbox-bao-truoc.png')); await b.close()
    # 5) đo thời gian vẽ (máy chủ không GPU – chỉ để so tương đối)
    b, pg, loi = await mo(p, cong, '')
    kq['do_ve_600_khung'] = await pg.evaluate('TVTHU.doVe(600)'); kq['nap'] = await pg.evaluate('TVTHU.thongSo()')
    await b.close()
    print('chụp xong', kq['do_ve_600_khung'])
    return kq


async def main(lam):
    s = socketserver.ThreadingTCPServer(('127.0.0.1', 0), functools.partial(Im, directory=GOC)); s.daemon_threads = True
    threading.Thread(target=s.serve_forever, daemon=True).start()
    cong = s.server_address[1]; so = {}
    async with async_playwright() as p:
        if 'video' in lam:
            so['video'] = [await quay(p, cong, '&mot=1', 'vong-ra-sau-danh-bung-60fps.mp4', 'vong'),
                           await quay(p, cong, '&mot=1&battu=1', 'danh-mai-vo-lat-ngua-60fps.mp4', 'mai'),
                           await quay(p, cong, '&xem=1', 'cac-clip-60fps.mp4', None, toi_da=int(12.9 * 60) + 30)]
        if 'anh' in lam: so['anh'] = await chup(p, cong)
    p = os.path.join(OUT, 'so-lieu.json')
    cu = json.load(open(p)) if os.path.exists(p) else {}
    cu.update(so); json.dump(cu, open(p, 'w'), ensure_ascii=False, indent=1)

asyncio.run(main(sys.argv[1:] or ['video', 'anh']))
