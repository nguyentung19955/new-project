#!/usr/bin/env python3
"""Chụp ảnh duyệt đợt "Làng hoàn thiện" (Chromium headless + Playwright) → game/kiem-thu-lang-hoan-thien/xem-thu/:
  truoc-<góc>.png / sau-<góc>.png   cùng camera, cùng trạng thái: TRƯỚC = demo.html ở commit trước đợt này (kiem-thu-truoc.html),
                                     SAU = demo.html hiện tại (kiem-thu.html). 960×540; riêng góc "iphone-*" là 844×390 (giả lập cảm ứng)
  ghep-truoc-sau.png                 mỗi hàng TRƯỚC | SAU
  so-do.json                         lỗi console / lỗi trang / tải hỏng (demo.html qua http, demo.build.html qua file://), số đo nạp,
                                     kiểm iPhone 844×390: nút Bắt đầu nằm trong màn + chạm được
Dòng gợi ý (#hint) ẨN trong ảnh góc nhìn địa hình (để thấy mép trên). Chạy: python3 -B game/kiem-thu-lang-hoan-thien/cong-cu/chup.py
(chạy tao-ban-thu.py trước)."""
import asyncio, functools, http.server, json, os, socketserver, threading
from PIL import Image, ImageDraw, ImageFont
from playwright.async_api import async_playwright

HERE = os.path.dirname(os.path.abspath(__file__))
KT = os.path.normpath(os.path.join(HERE, '..'))
GAME = os.path.normpath(os.path.join(KT, '..'))
GOC = os.path.normpath(os.path.join(GAME, '..'))
OUT = os.path.join(KT, 'xem-thu')
os.makedirs(OUT, exist_ok=True)

# (tên, mô tả, tham số URL, viewport, kịch bản JS sau khi vào game)
GOC_CHUP = [
    ('man-bat-dau', 'Màn Bắt đầu', '', (960, 540), 'START'),
    ('iphone-hud-nut', 'iPhone ngang 844×390 – HUD + nút cảm ứng (đang ghi Vọng)', '&vao=quai&quai=0', (844, 390),
     "TVTHU.datCam(2300,2150); TVTHU.khung(1,{v:1}); TVTHU.khung(40,{r:1});"),
    ('san-chuong', 'Sân chuông – chuông lớn, 2 NPC, quầy hàng, điểm lưu (bỏ quái để thấy rõ)', '&vao=quai&quai=0', (960, 540),
     "TVTHU.hint(1); TVTHU.datCam(2200,2150); TVTHU.khung(30);"),
    ('san-chuong-noi-chuyen', 'Sân chuông – nói chuyện Trưởng làng (hộp thoại)', '&vao=quai&quai=0', (960, 540),
     "TVTHU.hint(1); TVTHU.datCam(2250,2150); TVTHU.khung(4); TVTHU.moNPC('truong',1); TVTHU.khung(20);"),
    ('san-chuong-cong-huong', 'Sân chuông – chuông lớn đang RUNG (sau Cộng hưởng)', '&vao=quai&quai=gac', (960, 540),
     "TVTHU.hint(1); TVTHU.datCam(2980,2368); TVTHU.rung(150); TVTHU.khung(8);"),
    ('diem-luu-tat', 'Điểm lưu Sân chuông – chưa lưu', '&vao=quai&quai=0', (960, 540),
     "TVTHU.hint(1); TVTHU.datCam(2400,2112); TVTHU.luu(0,true,0); TVTHU.khung(2);"),
    ('diem-luu-sang', 'Điểm lưu Sân chuông – vừa lưu (chuông sáng, đang lắc)', '&vao=quai&quai=0', (960, 540),
     "TVTHU.hint(1); TVTHU.datCam(2400,2112); TVTHU.luu(1,true,60); TVTHU.khung(4);"),
    ('cong-lang-do-lang', 'Cổng làng – bảng nhiệm vụ, đèn treo thêm', '', (960, 540),
     "TVTHU.hint(1); TVTHU.datCam(150,0); TVTHU.khung(2);"),
    ('cong-lang-bien', 'Cổng làng 2 – biển chỉ đường (sau cổng)', '', (960, 540),
     "TVTHU.hint(1); TVTHU.datCam(1950,1700); TVTHU.khung(2);"),
    ('phong-boss-re-tran', 'Phòng boss – rễ trần (boss ngủ)', '&vao=boss', (960, 540),
     "TVTHU.hint(1); TVTHU.datCam(5420,5312); TVTHU.khung(2);"),
    ('phong-boss-treo', 'Phòng boss – boss treo trần (pha 2): chỗ boss treo dùng dải đá TRƠN', '&vao=boss', (960, 540),
     "TVTHU.hint(1); TVTHU.datCam(5420,5312); TVTHU.bossTreo();"),
    ('man-ket', 'Màn kết', '&vao=boss', (960, 540), "TVTHU.ket();"),
]


class Im(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass


def bat_log(pg):
    log = {'console_loi': [], 'trang_loi': [], 'yeu_cau_loi': []}
    pg.on('console', lambda m: log['console_loi'].append(m.text) if m.type in ('error', 'warning') and 'fonts.g' not in str(m.location) and 'ERR_FAILED' not in m.text else None)
    pg.on('pageerror', lambda e: log['trang_loi'].append(str(e)))
    pg.on('requestfailed', lambda r: log['yeu_cau_loi'].append(r.url[:140]) if 'fonts.g' not in r.url else None)
    return log


async def mo(b, url, vp=(960, 540), mobile=False):
    ctx = await b.new_context(viewport={'width': vp[0], 'height': vp[1]}, device_scale_factor=1, is_mobile=mobile, has_touch=mobile)
    pg = await ctx.new_page()
    log = bat_log(pg)
    await pg.route('https://fonts.g*/**', lambda r: r.abort())
    await pg.goto(url)
    await pg.wait_for_function('window.TVDEMO && (TVDEMO.ready || TVDEMO.err)', timeout=120000)
    log['tvdemo'] = await pg.evaluate('({ready:TVDEMO.ready, err:TVDEMO.err||"", lht:TVDEMO.lht||null})')
    return pg, log


async def chup(b, base, tien_to):
    logs = {}
    for ten, _, q, vp, js in GOC_CHUP:
        mobile = ten.startswith('iphone')
        pg, log = await mo(b, base + '?ghi=1' + q, vp, mobile)
        await pg.wait_for_function('!document.getElementById("start").hidden', timeout=30000)
        if js != 'START':
            await pg.evaluate('TVTHU.batDau()')
            await pg.evaluate(js)
        await pg.wait_for_timeout(250)
        await pg.screenshot(path=os.path.join(OUT, '%s-%s.png' % (tien_to, ten)))
        logs[ten] = {k: v for k, v in log.items() if v}
        await pg.context.close()
    return logs


async def kiem_iphone(b, url):
    """iPhone ngang 844×390: nút Bắt đầu phải nằm trong màn và chạm (tap) được."""
    pg, log = await mo(b, url, (844, 390), True)
    await pg.wait_for_function('!document.getElementById("start").hidden', timeout=30000)
    await pg.wait_for_timeout(300)
    await pg.screenshot(path=os.path.join(OUT, 'iphone-844x390-man-bat-dau.png'))
    box = await pg.locator('#btn-start').bounding_box()
    trong = bool(box and box['y'] >= 0 and box['y'] + box['height'] <= 390 and box['x'] >= 0 and box['x'] + box['width'] <= 844)
    await pg.touchscreen.tap(box['x'] + box['width'] / 2, box['y'] + box['height'] / 2)
    await pg.wait_for_timeout(600)
    bat_dau = await pg.evaluate('document.getElementById("start").hidden && !S.paused')
    nut = await pg.evaluate('document.body.classList.contains("lht-nut")')
    await pg.screenshot(path=os.path.join(OUT, 'iphone-844x390-vao-game.png'))
    log.update({'nut_trong_man': trong, 'nut_bat_dau': box, 'bam_duoc': bool(bat_dau), 'nut_cam_ung_anh_gen': nut})
    await pg.context.close()
    return log


def ghep():
    f = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 20)
    W, H = 960, 540
    out = Image.new('RGB', (2 * W, len(GOC_CHUP) * H), (0, 0, 0))
    d = ImageDraw.Draw(out)
    for i, (ten, nhan, _, vp, _) in enumerate(GOC_CHUP):
        for j, (tt, chu) in enumerate((('truoc', 'TRƯỚC'), ('sau', 'SAU'))):
            im = Image.open(os.path.join(OUT, '%s-%s.png' % (tt, ten))).convert('RGB')
            out.paste(im, (j * W + (W - im.width) // 2, i * H + (H - im.height) // 2))
            s = '%s – %s' % (chu, nhan)
            d.rectangle((j * W + 6, i * H + H - 34, j * W + 20 + d.textlength(s, font=f), i * H + H - 6), fill=(0, 0, 0))
            d.text((j * W + 12, i * H + H - 30), s, fill=(255, 220, 120), font=f)
    out.save(os.path.join(OUT, 'ghep-truoc-sau.png'))


async def main():
    s = socketserver.ThreadingTCPServer(('127.0.0.1', 0), functools.partial(Im, directory=GOC)); s.daemon_threads = True
    threading.Thread(target=s.serve_forever, daemon=True).start()
    goc = 'http://127.0.0.1:%d/game/' % s.server_address[1]
    so = {}
    async with async_playwright() as p:
        b = await p.chromium.launch()
        so['truoc'] = await chup(b, goc + 'kiem-thu-lang-hoan-thien/kiem-thu-truoc.html', 'truoc')
        so['sau'] = await chup(b, goc + 'kiem-thu-lang-hoan-thien/kiem-thu.html', 'sau')
        pg, log = await mo(b, goc + 'demo.html'); await pg.context.close(); so['demo_http'] = log
        fp = os.path.join(GAME, 'demo.build.html')
        if os.path.isfile(fp):
            pg, log = await mo(b, 'file://' + fp)
            await pg.wait_for_function('!document.getElementById("start").hidden', timeout=30000)
            await pg.click('#btn-start'); await pg.wait_for_timeout(1500)
            log['vao_game'] = await pg.evaluate('!S.paused'); log['nut_anh_gen'] = await pg.evaluate('document.body.classList.contains("lht-nut")')
            await pg.context.close(); so['file_build'] = log
        else:
            so['file_build'] = {'bo_qua': 'chưa có demo.build.html (chạy python3 game/build-demo.py)'}
        so['iphone_844x390'] = await kiem_iphone(b, goc + 'demo.html')
        if os.path.isfile(fp):
            so['iphone_844x390_file_build'] = await kiem_iphone(b, 'file://' + fp)
        await b.close()
    ghep()
    json.dump(so, open(os.path.join(OUT, 'so-do.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print(json.dumps({k: ({kk: vv for kk, vv in v.items() if kk != 'tvdemo'} if isinstance(v, dict) else v) for k, v in so.items()}, ensure_ascii=False)[:4000])

asyncio.run(main())
