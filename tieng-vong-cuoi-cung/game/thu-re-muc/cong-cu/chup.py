#!/usr/bin/env python3
"""Chụp ảnh duyệt màn thử Rễ Mục (Chromium headless + Playwright) → game/thu-re-muc/xem-thu/:
  dau-man.png            đầu màn: sàn vào, điểm lưu, miệng giếng, tầng trên khối phải                 960×540
  tuong-muc.png          Lam đang bám tường mục trái giếng, tường đã nứt (đồng hồ ≈ 100/120)
  tuong-muc-gay.png      ngay sau khi gãy: mảnh rơi, hốc tối
  cuoi-man.png           cuối hành lang: bậc, bào tử nổ, chuông vỡ, quái, tường phải
  hanh-lang.png          giữa hành lang: kén, bệ ván treo dây, giọt nước + vũng, nấm, quái
  *-xam.png              bản XÁM của 3 ảnh chính (kiểm tương phản nền / sàn / Lam / quái)
  *-collider.png         3 ảnh chính + overlay collider (ô chặn vàng, cạnh lộ cam, bệ một chiều lục, tường mục khung xanh ngọc + đồng hồ bám)
  lop-gan-truoc.png / lop-gan-sau.png   cùng một góc giếng: lớp gần vẽ TRƯỚC gameplay (mặc định) / SAU gameplay (?gan=sau) – để chọn
  so-do.json             lỗi console / lỗi trang / tải hỏng, số đo nạp + bộ nhớ, toạ độ các góc chụp, trạng thái tường mục
Chạy: python3 -B game/thu-re-muc/cong-cu/chup.py"""
import asyncio, functools, http.server, json, os, socketserver, threading
from PIL import Image
from playwright.async_api import async_playwright

HERE = os.path.dirname(os.path.abspath(__file__))
TRM = os.path.normpath(os.path.join(HERE, '..'))
GAME = os.path.normpath(os.path.join(TRM, '..'))
GOC = os.path.normpath(os.path.join(GAME, '..'))
OUT = os.path.join(TRM, 'xem-thu')
os.makedirs(OUT, exist_ok=True)
RMX, T = 6272, 32


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


async def chup(pg, ten, hb=False, xam=False):
    if hb: await pg.evaluate('TVTHU.hb(1)')
    if xam: await pg.evaluate('TVTHU.xam(1)')
    await pg.evaluate('TVTHU.khung(1)')
    await pg.screenshot(path=os.path.join(OUT, ten + '.png'))
    if hb: await pg.evaluate('TVTHU.hb(0)')
    if xam: await pg.evaluate('TVTHU.xam(0)')


async def bo_anh(pg, ten, so):
    """ảnh thường + xám + collider ở cùng trạng thái"""
    await chup(pg, ten); await chup(pg, ten + '-xam', xam=True); await chup(pg, ten + '-collider', hb=True)
    so[ten] = await pg.evaluate('({x:pl.x,y:pl.y,camx:S.camx,camy:S.camy,room:S.room,muc:TVTHU.muc.seg.map(s=>[s.st,Math.round(s.t),s.tt])})')


async def main():
    s = socketserver.ThreadingTCPServer(('127.0.0.1', 0), functools.partial(Im, directory=GOC)); s.daemon_threads = True
    threading.Thread(target=s.serve_forever, daemon=True).start()
    url = 'http://127.0.0.1:%d/game/thu-re-muc/thu-re-muc.html' % s.server_address[1]
    so = {}
    async with async_playwright() as p:
        b = await p.chromium.launch()
        pg, log = await mo(b, url + '?ghi=1&vao=remuc')
        await pg.evaluate('TVTHU.batDau()')
        await pg.evaluate('TVTHU.khung(40)')                                   # chờ chuyển nền xong
        # 1. đầu màn
        await pg.evaluate('TVTHU.datCam(%d, %d, %d, %d)' % (RMX + 3 * T, 14 * T, RMX, 113))
        await pg.evaluate('TVTHU.khung(40)')
        await bo_anh(pg, 'dau-man', so)
        # 2. tường mục: bot 'tha' tới khi đồng hồ ≥ 100 (nứt rộng)
        await pg.evaluate('TVTHU.batBot("tha", %d, %d, 0)' % (RMX + 2 * T + 8, 14 * T))
        st = None
        for i in range(600):
            st = await pg.evaluate('TVTHU.khung(1)')
            if st['muc'][0][1] >= 100: break
        await bo_anh(pg, 'tuong-muc', so)
        for i in range(200):
            st = await pg.evaluate('TVTHU.khung(1)')
            if st['muc'][0][0] == 'gay': break
        await pg.evaluate('TVTHU.khung(6)')
        await chup(pg, 'tuong-muc-gay')
        so['tuong-muc-gay'] = await pg.evaluate('({x:pl.x,y:pl.y,muc:TVTHU.muc.seg.map(s=>[s.st,Math.round(s.t),s.tt]),manh:TVTHU.rm.manh.length})')
        for i in range(400):
            st = await pg.evaluate('TVTHU.khung(1)')
            if st['xong']: break
        # 3. giữa hành lang (kén, bệ ván treo, giọt nước) + bào tử nổ
        await pg.evaluate('TVTHU.datCam(%d, %d, %d, %d)' % (RMX + 22 * T, 32 * T, RMX + 384, 612))
        await pg.evaluate('TVTHU.khung(60)')
        await chup(pg, 'hanh-lang')
        # 4. cuối màn
        await pg.evaluate('TVTHU.datCam(%d, %d, %d, %d)' % (RMX + 35 * T + 8, 32 * T, RMX + 384, 612))
        await pg.evaluate('TVTHU.khung(50)')
        await bo_anh(pg, 'cuoi-man', so)
        # 5. lớp gần trước / sau gameplay – cùng góc giếng (Lam bám tường phải cột 13)
        await pg.evaluate('TVTHU.mocLai()')
        await pg.evaluate('TVTHU.datCam(%d, %d, %d, %d)' % (RMX + 12 * T + 10, 20 * T, RMX, 250))
        await pg.evaluate('TVTHU.khung(2)')
        await chup(pg, 'lop-gan-truoc')
        log['so'] = await pg.evaluate('TVTHU.so()')
        await pg.close()
        pg2, log2 = await mo(b, url + '?ghi=1&vao=remuc&gan=sau')
        await pg2.evaluate('TVTHU.batDau()'); await pg2.evaluate('TVTHU.khung(40)')
        await pg2.evaluate('TVTHU.datCam(%d, %d, %d, %d)' % (RMX + 12 * T + 10, 20 * T, RMX, 250))
        await pg2.evaluate('TVTHU.khung(2)')
        await chup(pg2, 'lop-gan-sau')
        await pg2.close()
        # 6. iPhone ngang 844×390: màn Bắt đầu
        pg3, log3 = await mo(b, url + '?vao=remuc', {'width': 844, 'height': 390}, True)
        await pg3.wait_for_function('!document.getElementById("start").hidden', timeout=30000)
        btn = pg3.locator('#btn-start'); box = await btn.bounding_box()
        await pg3.screenshot(path=os.path.join(OUT, 'iphone-844x390.png'))
        await btn.tap(); await pg3.wait_for_timeout(600)
        vao = await pg3.evaluate('document.getElementById("start").hidden && !S.paused')
        log3['iphone'] = {'nut_bat_dau': box, 'trong_man': bool(box and box['x'] >= 0 and box['y'] >= 0 and box['x'] + box['width'] <= 844 and box['y'] + box['height'] <= 390), 'tap_vao_game': vao}
        await pg3.close()
        await b.close()
    # ghép xám cạnh thường cho 3 ảnh chính
    for ten in ('dau-man', 'tuong-muc', 'cuoi-man'):
        a = Image.open(os.path.join(OUT, ten + '.png')); x = Image.open(os.path.join(OUT, ten + '-xam.png'))
        g = Image.new('RGB', (1920, 540)); g.paste(a, (0, 0)); g.paste(x, (960, 0)); g.save(os.path.join(OUT, ten + '-ghep-xam.png'))
    json.dump({'thu_re_muc': log, 'gan_sau': {k: v for k, v in log2.items() if k != 'so'}, 'iphone': log3, 'goc': so},
              open(os.path.join(OUT, 'so-do.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print('lỗi console / trang / tải:', len(log['console_loi']), len(log['trang_loi']), len(log['yeu_cau_loi']), '| iPhone:', log3['iphone'])
    print('số đo Rễ Mục:', log['so']['rm'], '| trang trí:', {k: log['so']['tt'][k] for k in ('ms', 'mb_anh', 'mb_nuong', 'so_anh')})
    print(json.dumps(so, ensure_ascii=False)[:800])


asyncio.run(main())
