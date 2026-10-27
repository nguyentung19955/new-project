#!/usr/bin/env python3
"""Chụp ảnh duyệt trang trí địa hình 3 màn (Chromium headless + Playwright) → game/kiem-thu-trang-tri/xem-thu/:
  truoc-<góc>.png          bản kiểm thử với ?tt=0 (đúng gạch cũ, không trang trí)              960×540
  sau-<góc>.png            có trang trí                                                        960×540, CÙNG camera / cùng trạng thái
  sau-<góc>-collider.png   SAU + overlay collider (ô chặn, cạnh lộ cam, bệ một chiều, cổng, hitbox Lam / boss)
  ghep-truoc-sau.png       6 góc (2 góc × 3 màn), mỗi hàng TRƯỚC | SAU cạnh nhau (1920×3240)
  so-do.json               lỗi console / lỗi trang / tải hỏng, số đo nạp + bộ nhớ, kiểm file:// (demo.build.html), kiểm iPhone ngang 844×390
Góc chụp (camera thế giới, px logic):
  cong-lang-tuong 192 (bậc, hố, cột treo, khối tường) · cong-lang-be-cong 1152 (bệ ván treo, công tắc, cổng)
  san-chuong-dau 2112 (điểm lưu, quái, khối đá) · san-chuong-be-cong 2368 (khối đá, bệ ván treo, cột treo, cổng)
  phong-boss-vao 5312 (Lam vào, boss ngủ) · phong-boss-treo 5312 (boss pha 2 treo trần – chạy bot tới khi treo, cùng số bước ở cả 3 bản)
Chạy: python3 -B game/kiem-thu-trang-tri/cong-cu/chup.py"""
import asyncio, functools, http.server, json, os, socketserver, threading
from PIL import Image, ImageDraw, ImageFont
from playwright.async_api import async_playwright

HERE = os.path.dirname(os.path.abspath(__file__))
KT = os.path.normpath(os.path.join(HERE, '..'))
GAME = os.path.normpath(os.path.join(KT, '..'))
GOC = os.path.normpath(os.path.join(GAME, '..'))
OUT = os.path.join(KT, 'xem-thu')
os.makedirs(OUT, exist_ok=True)
# (tên, camx, x Lam, bot) – bot: (đoạn, x0, mốc) chạy tới khi boss treo + 30 khung
GOC_CHUP = [('cong-lang-tuong', 192, 830, None), ('cong-lang-be-cong', 1152, 1200, None),
            ('san-chuong-dau', 2112, 2200, None), ('san-chuong-be-cong', 2368, 2900, None),
            ('phong-boss-vao', 5312, 5400, None), ('phong-boss-treo', 5312, 5400, ('boss', 5400, 30))]
NHAN = {'cong-lang-tuong': 'Cổng làng – bậc, hố, khối tường (camera x=192)', 'cong-lang-be-cong': 'Cổng làng – bệ ván treo, cổng (x=1152)',
        'san-chuong-dau': 'Sân chuông – đầu sân, khối đá (x=2112)', 'san-chuong-be-cong': 'Sân chuông – khối đá, bệ ván treo, cổng (x=2368)',
        'phong-boss-vao': 'Phòng boss – vào phòng, boss ngủ', 'phong-boss-treo': 'Phòng boss – pha 2, boss treo trần'}


class Im(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass


def bat_log(pg):
    log = {'console_loi': [], 'trang_loi': [], 'yeu_cau_loi': []}
    pg.on('console', lambda m: log['console_loi'].append(m.text) if m.type in ('error', 'warning') and 'fonts.g' not in str(m.location) and 'ERR_FAILED' not in m.text else None)
    pg.on('pageerror', lambda e: log['trang_loi'].append(str(e)))
    pg.on('requestfailed', lambda r: log['yeu_cau_loi'].append(r.url[:140]) if 'fonts.g' not in r.url else None)
    return log


async def mo(b, url, vp=None, mobile=False):
    ctx = await b.new_context(viewport=vp or {'width': 960, 'height': 540}, device_scale_factor=1, is_mobile=mobile, has_touch=mobile)
    pg = await ctx.new_page()
    log = bat_log(pg)
    await pg.route('https://fonts.g*/**', lambda r: r.abort())
    await pg.goto(url)
    await pg.wait_for_function('window.TVDEMO && (TVDEMO.ready || TVDEMO.err)', timeout=120000)
    log['tvdemo'] = await pg.evaluate('({ready:TVDEMO.ready, err:TVDEMO.err||"", gach:TVDEMO.gach, tt:TVDEMO.tt})')
    return pg, log


async def chup_bo(b, url, tt, hb, tien_to):
    pg, log = await mo(b, url + '?ghi=1&tt=%d&hitbox=%d' % (1 if tt else 0, 1 if hb else 0))
    await pg.evaluate('TVTHU.batDau()')
    cams = {}
    for ten, camx, x, bot in GOC_CHUP:
        if bot:
            await pg.evaluate('(a)=>TVTHU.batBot(a[0],a[1],a[2])', list(bot))
            n = 0; st = None
            while n < 1500:
                st = await pg.evaluate('TVTHU.khung(1)'); n += 1
                if st['xong']: break
            cams[ten] = dict(st, buoc=n)
        else:
            cams[ten] = await pg.evaluate('(a)=>TVTHU.datCam(a[0],a[1])', [x, camx])
        await pg.screenshot(path=os.path.join(OUT, '%s-%s.png' % (tien_to, ten)))
    log['camera'] = cams
    log['so'] = await pg.evaluate('TVTHU.so()')
    await pg.close()
    return log


async def kiem_iphone(b, url):
    """iPhone ngang 844×390: màn Bắt đầu phải cuộn/thu gọn để nút Bắt đầu nằm trong màn và bấm (tap) được."""
    pg, log = await mo(b, url, {'width': 844, 'height': 390}, True)
    await pg.wait_for_function('!document.getElementById("start").hidden', timeout=30000)
    btn = pg.locator('#btn-start')
    await btn.scroll_into_view_if_needed()
    box = await btn.bounding_box()
    trong = bool(box and box['y'] >= 0 and box['y'] + box['height'] <= 390 and box['x'] >= 0 and box['x'] + box['width'] <= 844)
    await pg.touchscreen.tap(box['x'] + box['width'] / 2, box['y'] + box['height'] / 2)
    await pg.wait_for_timeout(300)
    bat_dau = await pg.evaluate('document.getElementById("start").hidden')
    await pg.screenshot(path=os.path.join(OUT, 'iphone-844x390.png'))
    log.update({'nut_trong_man': trong, 'nut_bat_dau': box, 'bam_duoc': bool(bat_dau)})
    await pg.close()
    return log


def ghep():
    f = None
    for p in ('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',):
        if os.path.exists(p): f = ImageFont.truetype(p, 20)
    W, H = 960, 540
    out = Image.new('RGB', (2 * W, len(GOC_CHUP) * H), (0, 0, 0))
    d = ImageDraw.Draw(out)
    for i, (ten, camx, _, _) in enumerate(GOC_CHUP):
        for j, (tien_to, nhan) in enumerate((('truoc', 'TRƯỚC'), ('sau', 'SAU'))):
            im = Image.open(os.path.join(OUT, '%s-%s.png' % (tien_to, ten))).convert('RGB')
            out.paste(im, (j * W, i * H))
            s = '%s – %s' % (nhan, NHAN[ten])
            d.rectangle((j * W + 6, i * H + H - 34, j * W + 20 + d.textlength(s, font=f), i * H + H - 6), fill=(0, 0, 0))
            d.text((j * W + 12, i * H + H - 30), s, fill=(255, 220, 120), font=f)
    out.save(os.path.join(OUT, 'ghep-truoc-sau.png'))


async def main():
    s = socketserver.ThreadingTCPServer(('127.0.0.1', 0), functools.partial(Im, directory=GOC)); s.daemon_threads = True
    threading.Thread(target=s.serve_forever, daemon=True).start()
    url = 'http://127.0.0.1:%d/game/kiem-thu-trang-tri/kiem-thu.html' % s.server_address[1]
    url_demo = 'http://127.0.0.1:%d/game/demo.html' % s.server_address[1]
    so = {}
    async with async_playwright() as p:
        b = await p.chromium.launch()
        so['truoc'] = await chup_bo(b, url, False, False, 'truoc')
        so['sau'] = await chup_bo(b, url, True, False, 'sau')
        so['sau_collider'] = await chup_bo(b, url, True, True, 'sau-collider')
        # demo.html chính qua http (không khối thử) và bản tự chứa qua file://
        pg, log = await mo(b, url_demo); await pg.close(); so['demo_http'] = log
        fp = os.path.join(GAME, 'demo.build.html')
        if os.path.isfile(fp):
            try:
                pg, log = await mo(b, 'file://' + fp); await pg.close(); so['file_build'] = log
            except Exception as e:
                so['file_build'] = {'loi': str(e)[:300]}
        else:
            so['file_build'] = {'bo_qua': 'chưa có demo.build.html (chạy python3 game/build-demo.py)'}
        so['iphone_844x390'] = await kiem_iphone(b, url_demo)
        await b.close()
    for ten, _, _, _ in GOC_CHUP:
        os.replace(os.path.join(OUT, 'sau-collider-%s.png' % ten), os.path.join(OUT, 'sau-%s-collider.png' % ten))
    ghep()
    json.dump(so, open(os.path.join(OUT, 'so-do.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    tom = {k: {kk: vv for kk, vv in v.items() if kk not in ('camera', 'so', 'tvdemo')} for k, v in so.items()}
    print(json.dumps(tom, ensure_ascii=False)[:3000])
    print('boss treo:', {k: so[k]['camera'].get('phong-boss-treo') for k in ('truoc', 'sau', 'sau_collider')})

asyncio.run(main())
