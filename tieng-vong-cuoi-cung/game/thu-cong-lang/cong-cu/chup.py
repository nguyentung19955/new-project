#!/usr/bin/env python3
"""Chụp ảnh duyệt bản thử Cổng làng (Chromium headless + Playwright) → game/thu-cong-lang/xem-thu/:
  truoc-<góc>.png   bản thử với ?tt=0 (y hệt demo.html hiện tại)            960×540
  sau-<góc>.png     bản thử có trang trí                                     960×540, CÙNG camera
  sau-<góc>-collider.png  bản SAU bật overlay collider (ô chặn, bệ một chiều, hitbox Lam)
  ghep-truoc-sau.png      3 góc, mỗi hàng TRƯỚC | SAU cạnh nhau (1920×1620)
  so-do.json              lỗi console / lỗi trang / tải hỏng, số đo nạp + bộ nhớ, kiểm file:// (bản build, nếu có)
Góc chụp (camera thế giới): dau 0 (đầu A1), tuong 192 (cuối A1: bậc, hố, khối tường), be-cong 1152 (A2: bệ rễ đỡ, công tắc, cổng).
Chạy: python3 -B game/thu-cong-lang/cong-cu/chup.py"""
import asyncio, functools, http.server, json, os, socketserver, threading
from PIL import Image, ImageDraw, ImageFont
from playwright.async_api import async_playwright

HERE = os.path.dirname(os.path.abspath(__file__))
THU = os.path.normpath(os.path.join(HERE, '..'))
GAME = os.path.normpath(os.path.join(THU, '..'))
GOC = os.path.normpath(os.path.join(GAME, '..'))
OUT = os.path.join(THU, 'xem-thu')
os.makedirs(OUT, exist_ok=True)
GOC_CHUP = [('dau', 0, 134), ('tuong', 192, 830), ('be-cong', 1152, 1200)]   # (tên, camx, x Lam)


class Im(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass


async def mo(b, url):
    ctx = await b.new_context(viewport={'width': 960, 'height': 540}, device_scale_factor=1)
    pg = await ctx.new_page()
    log = {'console_loi': [], 'trang_loi': [], 'yeu_cau_loi': []}
    pg.on('console', lambda m: log['console_loi'].append(m.text) if m.type in ('error', 'warning') and 'fonts.g' not in str(m.location) else None)
    pg.on('pageerror', lambda e: log['trang_loi'].append(str(e)))
    pg.on('requestfailed', lambda r: log['yeu_cau_loi'].append(r.url[:140]) if 'fonts.g' not in r.url else None)
    await pg.route('https://fonts.g*/**', lambda r: r.abort())
    await pg.goto(url)
    await pg.wait_for_function('window.TVDEMO && (TVDEMO.ready || TVDEMO.err)', timeout=90000)
    log['tvdemo'] = await pg.evaluate('({ready:TVDEMO.ready, err:TVDEMO.err||"", gach:TVDEMO.gach, lc:TVDEMO.lc, tt:TVDEMO.tt, re:RE_DAT.length})')
    return pg, log


async def chup_bo(b, url, tt, hb, tien_to):
    pg, log = await mo(b, url + '?ghi=1&tt=%d&hitbox=%d' % (1 if tt else 0, 1 if hb else 0))
    await pg.evaluate('TVTHU.batDau()')
    cams = {}
    for ten, camx, x in GOC_CHUP:
        cams[ten] = await pg.evaluate('(a)=>TVTHU.datCam(a[0],a[1])', [x, camx])
        await pg.screenshot(path=os.path.join(OUT, '%s-%s.png' % (tien_to, ten)))
    log['camera'] = cams
    await pg.close()
    return log


def ghep():
    f = None
    for p in ('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',):
        if os.path.exists(p): f = ImageFont.truetype(p, 20)
    W, H = 960, 540
    out = Image.new('RGB', (2 * W, 3 * H), (0, 0, 0))
    d = ImageDraw.Draw(out)
    for i, (ten, camx, _) in enumerate(GOC_CHUP):
        for j, (tien_to, nhan) in enumerate((('truoc', 'TRƯỚC (demo.html hiện tại)'), ('sau', 'SAU (trang trí địa hình v3)'))):
            im = Image.open(os.path.join(OUT, '%s-%s.png' % (tien_to, ten))).convert('RGB')
            out.paste(im, (j * W, i * H))
            s = '%s – góc "%s" (camera x=%d)' % (nhan, ten, camx)
            d.rectangle((j * W + 6, i * H + H - 34, j * W + 20 + d.textlength(s, font=f), i * H + H - 6), fill=(0, 0, 0))
            d.text((j * W + 12, i * H + H - 30), s, fill=(255, 220, 120), font=f)
    out.save(os.path.join(OUT, 'ghep-truoc-sau.png'))


async def main():
    s = socketserver.ThreadingTCPServer(('127.0.0.1', 0), functools.partial(Im, directory=GOC)); s.daemon_threads = True
    threading.Thread(target=s.serve_forever, daemon=True).start()
    url = 'http://127.0.0.1:%d/game/thu-cong-lang/thu-cong-lang.html' % s.server_address[1]
    so = {}
    async with async_playwright() as p:
        b = await p.chromium.launch()
        so['truoc'] = await chup_bo(b, url, False, False, 'truoc')
        so['sau'] = await chup_bo(b, url, True, False, 'sau')
        so['sau_collider'] = await chup_bo(b, url, True, True, 'sau-collider')
        # mở qua file:// (không máy chủ): bản thử thường (JSON qua fetch) và bản tự chứa nếu đã build
        for ten, tep in (('file_thu', 'thu-cong-lang.html'), ('file_build', 'thu-cong-lang.build.html')):
            fp = os.path.join(THU, tep)
            if not os.path.isfile(fp):
                so[ten] = {'bo_qua': 'chưa có ' + tep}; continue
            try:
                pg, log = await mo(b, 'file://' + fp); await pg.close()
                so[ten] = log
            except Exception as e:
                so[ten] = {'loi': str(e)[:300]}
        await b.close()
    # đổi tên bản collider cho đúng mẫu sau-<góc>-collider.png
    for ten, _, _ in GOC_CHUP:
        os.replace(os.path.join(OUT, 'sau-collider-%s.png' % ten), os.path.join(OUT, 'sau-%s-collider.png' % ten))
    ghep()
    json.dump(so, open(os.path.join(OUT, 'so-do.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print(json.dumps({k: {kk: vv for kk, vv in v.items() if kk != 'camera'} for k, v in so.items()}, ensure_ascii=False)[:3000])

asyncio.run(main())
