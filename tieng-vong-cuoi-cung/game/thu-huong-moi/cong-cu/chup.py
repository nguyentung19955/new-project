#!/usr/bin/env python3
"""Chụp ảnh duyệt cảnh chuẩn "Cổ tích chuông tàn" (Chromium headless + Playwright) → game/thu-huong-moi/xem-thu/
  truoc.png / sau.png                 cùng góc camera (A1, camera x 192), Lam đứng trên bậc 2 dưới đèn – TRƯỚC = demo hiện tại (?hm=0)
  truoc-2.png / sau-chuong-tat.png    Lam đã đi qua, đứng dưới chuông làng (chuông đã tắt)
  *-xam.png                           bản xám (kiểm sáng–tối)
  ghep-truoc-sau.png, ghep-truoc-sau-xam.png, ghep-truoc-sau-2.png   ghép TRƯỚC | SAU 1920×540
  tung-lop.png                        6 ô: đủ lớp / tắt grade / tắt sáng / tắt sương / tắt vignette / tắt dịu vân đất (cùng góc)
  sau-khong-suong.png                 ?suong=0 (tiêu chí "không cần sương mới thấy chiều sâu")
  sau-co-quai.png                     ?quai=1: thêm 1 Chuông Gỗ sau vực (lóe đòn cam đỏ, rêu olive) – thử "nguy hiểm nổi nhất"
  iphone-844x390-truoc.png / -sau.png  iPhone ngang 844×390 (cảm ứng, có nút), cùng góc
  so-do.json                          thời gian vẽ mỗi khung TRƯỚC / SAU (Chromium headless, KHÔNG phải iPhone thật), thời gian tô màu lúc nạp, lỗi trang
Chạy: python3 -B game/thu-huong-moi/cong-cu/chup.py"""
import asyncio, functools, http.server, json, os, socketserver, threading
from PIL import Image, ImageOps
from playwright.async_api import async_playwright

HERE = os.path.dirname(os.path.abspath(__file__))
THM = os.path.normpath(os.path.join(HERE, '..'))
GOC = os.path.normpath(os.path.join(THM, '..', '..'))
OUT = os.path.join(THM, 'xem-thu')
os.makedirs(OUT, exist_ok=True)
CAMX = 192
GOC_1 = (500, 384)   # Lam (x giữa, y chân) trên bậc 2, dưới đèn
GOC_2 = (880, 448)   # Lam dưới chuông làng (đã đi qua)


class Im(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass


async def mo(b, url, vp=None, mobile=False):
    ctx = await b.new_context(viewport=vp or {'width': 960, 'height': 540}, device_scale_factor=1, is_mobile=mobile, has_touch=mobile)
    pg = await ctx.new_page()
    log = {'console_loi': [], 'trang_loi': []}
    pg.on('console', lambda m: log['console_loi'].append(m.text) if m.type == 'error' and 'ERR_' not in m.text else None)
    pg.on('pageerror', lambda e: log['trang_loi'].append(str(e)))
    await pg.route('https://fonts.g*/**', lambda r: r.abort())
    await pg.goto(url)
    await pg.wait_for_function('window.TVDEMO && (TVDEMO.ready || TVDEMO.err)', timeout=120000)
    await pg.evaluate('TVTHU.batDau()')
    return pg, ctx, log


async def dat(pg, goc, camy=0, tat=False):
    if tat: await pg.evaluate('TVTHU.hm.tatChuong()')
    await pg.evaluate('TVTHU.datCam(%d, %d, %d, %d, 1)' % (goc[0], goc[1], CAMX, camy))
    await pg.evaluate('TVTHU.khung(30, [%d, %d])' % (CAMX, camy))   # 0,5 s cho hạt bụi / sương chạy


async def do_ve(pg):
    """đo thời gian vẽ: (a) đứng yên trong cảnh 600 khung; (b) bot chạy qua cảnh (camera theo Lam)"""
    await pg.evaluate('TVTHU.datCam(%d, %d, %d, 0, 1)' % (GOC_1[0], GOC_1[1], CAMX))
    await pg.evaluate('TVTHU.doXoa()')
    for _ in range(6): await pg.evaluate('TVTHU.khung(1)')       # khởi động
    await pg.evaluate('TVTHU.doXoa()')
    for _ in range(600): await pg.evaluate('TVTHU.khung(1, [%d, 0])' % CAMX)
    dung = await pg.evaluate('TVTHU.doLay()')
    await pg.evaluate('TVTHU.hm.datLaiChuong(); TVTHU.batBot(250, 870)')
    await pg.evaluate('TVTHU.doXoa()')
    for _ in range(600):
        st = await pg.evaluate('TVTHU.khung(1)')
        if st['xong']: break
    chay = await pg.evaluate('TVTHU.doLay()')
    return {'dung_yen_600_khung': dung, 'bot_chay_qua_canh': chay}


def xam(ten):
    Image.open(os.path.join(OUT, ten + '.png')).convert('L').convert('RGB').save(os.path.join(OUT, ten + '-xam.png'))


def ghep(a, b, dst):
    A = Image.open(os.path.join(OUT, a)); B = Image.open(os.path.join(OUT, b))
    g = Image.new('RGB', (A.width + B.width + 8, max(A.height, B.height)), (255, 255, 255)); g.paste(A, (0, 0)); g.paste(B, (A.width + 8, 0)); g.save(os.path.join(OUT, dst))


async def main():
    s = socketserver.ThreadingTCPServer(('127.0.0.1', 0), functools.partial(Im, directory=GOC)); s.daemon_threads = True
    threading.Thread(target=s.serve_forever, daemon=True).start()
    url = 'http://127.0.0.1:%d/game/thu-huong-moi/thu-huong-moi.html?ghi=1' % s.server_address[1]
    so = {'ghi_chu': 'Chromium headless trên máy chủ Linux, KHÔNG GPU (vẽ bằng CPU) – chưa đo trên iPhone thật. ms = thời gian hàm render() mỗi khung.'}
    async with async_playwright() as p:
        b = await p.chromium.launch()
        for ten, q in (('truoc', '&hm=0'), ('sau', '')):
            pg, ctx, log = await mo(b, url + q)
            await pg.evaluate('TVTHU.anUI(1)')
            await dat(pg, GOC_1); await pg.screenshot(path=os.path.join(OUT, ten + '.png')); xam(ten)
            t2 = 'truoc-2' if ten == 'truoc' else 'sau-chuong-tat'
            await dat(pg, GOC_2, tat=True); await pg.screenshot(path=os.path.join(OUT, t2 + '.png')); xam(t2)
            so[ten] = {'do_ve_ms': await do_ve(pg), 'nap': await pg.evaluate('TVTHU.so()'), 'loi': log}
            await ctx.close()
        # từng lớp
        o = []
        for nhan, q in (('đủ lớp', ''), ('?grade=0', '&grade=0'), ('?sang=0', '&sang=0'), ('?suong=0', '&suong=0'), ('?vignette=0', '&vignette=0'), ('?dat=0', '&dat=0')):
            pg, ctx, log = await mo(b, url + q)
            await pg.evaluate('TVTHU.anUI(1)'); await dat(pg, GOC_1)
            f = os.path.join(OUT, '_lop.png'); await pg.screenshot(path=f); o.append((nhan, Image.open(f).copy()))
            if q == '&suong=0': await pg.screenshot(path=os.path.join(OUT, 'sau-khong-suong.png'))
            if log['trang_loi']: so.setdefault('loi_tung_lop', {})[nhan] = log['trang_loi']
            await ctx.close()
        os.remove(os.path.join(OUT, '_lop.png'))
        from PIL import ImageDraw
        g = Image.new('RGB', (3 * 480 + 16, 2 * 270 + 8), (255, 255, 255))
        for i, (nhan, im) in enumerate(o):
            t = im.resize((480, 270), Image.LANCZOS); d = ImageDraw.Draw(t); d.rectangle((0, 0, 8 + 7 * len(nhan), 18), fill=(0, 0, 0)); d.text((4, 3), nhan, fill=(255, 230, 160))
            g.paste(t, ((i % 3) * 488, (i // 3) * 278))
        g.save(os.path.join(OUT, 'tung-lop.png'))
        # có quái
        pg, ctx, log = await mo(b, url + '&quai=1')
        await pg.evaluate('TVTHU.anUI(1)'); await dat(pg, GOC_1)
        await pg.screenshot(path=os.path.join(OUT, 'sau-co-quai.png')); xam('sau-co-quai')
        so['co_quai_loi'] = log; await ctx.close()
        # iPhone ngang 844×390 (cảm ứng: camera lệch lên 28 như game)
        for ten, q in (('truoc', '&hm=0'), ('sau', '')):
            pg, ctx, log = await mo(b, url + q, {'width': 844, 'height': 390}, True)
            await dat(pg, GOC_1, camy=28)
            await pg.screenshot(path=os.path.join(OUT, 'iphone-844x390-%s.png' % ten))
            so['iphone_' + ten] = {'loi': log, 'bk': await pg.evaluate('BK'), 'cam_ung': await pg.evaluate('touchMode')}
            await ctx.close()
        await b.close()
    ghep('truoc.png', 'sau.png', 'ghep-truoc-sau.png'); ghep('truoc-xam.png', 'sau-xam.png', 'ghep-truoc-sau-xam.png')
    ghep('truoc-2.png', 'sau-chuong-tat.png', 'ghep-truoc-sau-2.png')
    json.dump(so, open(os.path.join(OUT, 'so-do.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    for k in ('truoc', 'sau'):
        print(k, json.dumps(so[k]['do_ve_ms'], ensure_ascii=False), '| nạp HM:', so[k]['nap']['hm'], '| lỗi:', so[k]['loi'])


asyncio.run(main())
