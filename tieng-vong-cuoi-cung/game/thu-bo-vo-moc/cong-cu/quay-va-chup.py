#!/usr/bin/env python3
"""Quay video 60 hình/s (mỗi hình = đúng 1 bước logic) + chụp ảnh trang thử Bọ Vỏ Mộc → game/kiem-thu-bo-vo-moc/
Video H.264 (-preset veryfast). Ảnh 960×540 cỡ thật (không phóng).
Cần playwright + Chromium + ffmpeg.   Chạy: python3 -B game/thu-bo-vo-moc/cong-cu/quay-va-chup.py [video] [anh] | [video2] [so] | [pha]
   pha (bản 4): ảnh TỪNG PHA quay đầu / choáng (vỡ mai → sụp → dậy) / chết (sụp → tan vụn), cắt quanh Bọ, cỡ thật, ghi số bước."""
import asyncio, functools, http.server, io, json, os, socketserver, subprocess, sys, threading
from playwright.async_api import async_playwright
from PIL import Image, ImageDraw, ImageOps

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


async def chup_so(p, cong):
    # 2c) PH3/PH4: chém MAI (tia sắc trên mai, Lam dội nhẹ) và chém BỤNG (thân co + chớp ấm ngắn) – cùng một con, đứng yên, CÙNG KHUNG mọi bản
    b, pg, loi = await mo(p, cong, '&mot=1&mau=0')
    for f, ten, mai in ((-1, 'keng-tia-tren-mai', 4), (1, 'trung-bung-co-than', 4)):
        await pg.evaluate('''() => { const b = TVTHU.bo.DS[0]; TVTHU.datBo(0, b.sx, %d, 'di'); b.cd = 999; b.hp = 4; b.mai = %d; b.nam = false;
          TVTHU.datLam(b.sx - 92, 1); TVTHU.khung(3); TVTHU.bo.trung({x: b.x, y: b.y + 24, w: 30, h: 20}, 'p', 7000 + %d, 1, 1); TVTHU.khung(%d); }''' % (f, mai, f, 5 if f < 0 else 6))
        await pg.screenshot(path=os.path.join(OUT, ten + '.png'))
        await pg.evaluate('TVTHU.khung(80)')
    await b.close()


async def chup_pha(p, cong):
    """bản 4: từng pha động tác, cắt 300×170 quanh Bọ (cỡ thật), nhãn = trạng thái + bước. Lam đặt xa, không bot."""
    async def mot_day(dat, buoc, ten, tieu_de):
        b, pg, loi = await mo(p, cong, '&mot=1&mau=0')
        await pg.evaluate('TVTHU.datLam(TVTHU.bo.DS[0].sx - 330, 1); TVTHU.khung(2)')
        await pg.evaluate(dat); khung = []; da = 0
        for want in buoc:
            st = await pg.evaluate('TVTHU.khung(%d)' % (want - da)); da = want
            cx = await pg.evaluate('TVTHU.bo.DS[0].x + TVTHU.bo.DS[0].w / 2 - ox'); gy = await pg.evaluate('TVTHU.bo.DS[0].y + TVTHU.bo.DS[0].h - oy')
            im = Image.open(io.BytesIO(await pg.screenshot())).crop((int(cx) - 150, int(gy) - 140, int(cx) + 150, int(gy) + 30))
            khung.append((im, '%s t%d' % (st['bo'][0][0], st['bo'][0][1])))
        await b.close()
        W = 300; tam = Image.new('RGB', (W * len(khung), 170 + 36), (12, 15, 20)); g = ImageDraw.Draw(tam)
        g.text((4, 3), tieu_de, fill=(180, 170, 150))
        for i, (im, nh) in enumerate(khung): tam.paste(im, (i * W, 36)); g.text((i * W + 4, 21), nh, fill=(242, 214, 154)); g.line([(i * W, 18), (i * W, 206)], fill=(60, 60, 60))
        tam.save(os.path.join(OUT, ten)); print('ghi', ten)
    # QUAY ĐẦU: 24 bước, lật gương ở bước 12 (khung t11 → t12)
    await mot_day("TVTHU.datBo(0, TVTHU.bo.DS[0].sx, -1, 'quay')", [1, 5, 9, 11, 12, 13, 16, 20, 24], 'pha-quay-dau.png', 'quay dau: ham -> lat guong tuc thi (t12) -> buoc tai cho')
    # CHOÁNG: chém mai còn 1 nấc → vỡ ('lat' 30) → choáng ('choang' 120) → dậy ('day' 30) → đi tiếp, mai vẫn vỡ
    vo = ("(() => { const b = TVTHU.bo.DS[0]; TVTHU.datBo(0, b.sx, -1, 'di'); TVTHU.khung(1); b.cd = 999; b.mai = 1; "
          "TVTHU.bo.trung({x: b.x, y: b.y + 24, w: 30, h: 20}, 'p', 9100, 1, 1); })()")
    await mot_day(vo, [1, 4, 8, 14, 30, 90, 158, 166, 175, 182, 200], 'pha-vo-mai-choang-day.png', 'vo mai -> sup choang -> day (mai van vo)')
    # CHẾT khi đang đứng (mai còn): trúng bụng lúc còn 1 máu
    ch = ("(() => { const b = TVTHU.bo.DS[0]; TVTHU.datBo(0, b.sx, -1, 'di'); TVTHU.khung(1); b.cd = 999; b.hp = 1; "
          "TVTHU.bo.trung({x: b.x + b.w - 30, y: b.y + 24, w: 30, h: 20}, 'p', 9200, -1, 1); })()")
    await mot_day(ch, [1, 6, 12, 18, 24, 30, 44, 60, 150, 165, 180, 195, 205], 'pha-chet-sup-tan-vun.png', 'chet: khung, khuyu, do sup, mai tach, tan vun')
    # CHẾT khi mai đã vỡ (đứng dậy rồi bị giết)
    ch2 = ("(() => { const b = TVTHU.bo.DS[0]; TVTHU.datBo(0, b.sx, -1, 'di'); TVTHU.khung(1); b.cd = 999; b.hp = 1; b.mai = 0; b.maiVo = true; "
           "TVTHU.bo.trung({x: b.x + b.w - 30, y: b.y + 24, w: 30, h: 20}, 'p', 9300, -1, 1); })()")
    await mot_day(ch2, [1, 12, 24, 36, 60, 160, 185], 'pha-chet-mai-da-vo.png', 'chet khi mai da vo tu truoc')


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
    for f, ten in ((150 + 12, 'bao-truoc-huc'), (480, 'sup-choang-lo-bung'), (830, 'chet-sup-tan-vun')):   # bản 4: khung theo XEM mới
        cur = (await pg.evaluate('TVTHU.khung(0)'))['f']; await pg.evaluate('TVTHU.khung(%d)' % (f - cur))
        await pg.screenshot(path=os.path.join(OUT, ten + '.png'))
    await b.close()
    # 2b) PH3: cùng khung báo trước nhưng TẮT dấu "!" (?dauthan=0) để so
    b, pg, loi = await mo(p, cong, '&xem=1&mot=1&dauthan=0')
    await pg.evaluate('TVTHU.khung(%d)' % (150 + 12)); await pg.screenshot(path=os.path.join(OUT, 'bao-truoc-huc-tat-dau-than.png')); await b.close()
    await chup_so(p, cong)
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
        if 'video2' in lam:   # PH4: chỉ 2 video chính (cập nhật đúng 2 mục trong so-lieu.json, giữ mục cac-clip)
            moi = [await quay(p, cong, '&mot=1', 'vong-ra-sau-danh-bung-60fps.mp4', 'vong'),
                   await quay(p, cong, '&mot=1&battu=1', 'danh-mai-vo-sup-choang-60fps.mp4', 'mai')]
            cu_ = json.load(open(os.path.join(OUT, 'so-lieu.json'))).get('video', [])
            so['video'] = [next((m for m in moi if m['file'] == v['file']), v) for v in cu_] or moi
        if 'so' in lam: await chup_so(p, cong)
        if 'pha' in lam: await chup_pha(p, cong)   # PH4: chỉ 2 ảnh so mai / bụng
        if 'video' in lam:
            so['video'] = [await quay(p, cong, '&mot=1', 'vong-ra-sau-danh-bung-60fps.mp4', 'vong'),
                           await quay(p, cong, '&mot=1&battu=1', 'danh-mai-vo-sup-choang-60fps.mp4', 'mai'),
                           await quay(p, cong, '&xem=1', 'cac-clip-60fps.mp4', None, toi_da=int(14.7 * 60) + 30)]
        if 'anh' in lam: so['anh'] = await chup(p, cong)
    p = os.path.join(OUT, 'so-lieu.json')
    cu = json.load(open(p)) if os.path.exists(p) else {}
    cu.update(so); json.dump(cu, open(p, 'w'), ensure_ascii=False, indent=1)

asyncio.run(main(sys.argv[1:] or ['video', 'anh']))
