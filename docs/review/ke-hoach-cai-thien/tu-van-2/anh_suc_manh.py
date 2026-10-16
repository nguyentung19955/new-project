#!/usr/bin/env python3
"""Ảnh soát (headless, không chơi): một con số "Sức mạnh" + dòng nói rõ đổi gì sau nâng cấp (tư vấn 2, việc 2).
  python3 docs/review/ke-hoach-cai-thien/tu-van-2/anh_suc_manh.py
Chụp ở cỡ điện thoại ngang 844 × 390: (1) làng — thanh trên cùng; (2) làng ngay sau khi mài kiếm (dải "Sức mạnh … ▲" + dòng "Kiếm: đòn +N
sát thương"); (3) làng sau khi lên cấp (nhiều dòng đổi); (4) hành trang thẻ nhân vật; (5) như (2) nhưng ?gopsucmanh=0 (cũ: Lực chiến).
Ghi vào thư mục này: anh-*.png. Trả mã 1 nếu có lỗi JS."""
import os, sys
from playwright.sync_api import sync_playwright

HERE = os.path.dirname(os.path.abspath(__file__))
GAME = os.path.abspath(os.path.join(HERE, '..', '..', '..', '..', 'game'))
URL = 'file://' + GAME + '/index.html?cloud=0'
SZ = dict(viewport={'width': 844, 'height': 390}, is_mobile=True, has_touch=True, device_scale_factor=2)


def main():
    errs = []
    with sync_playwright() as p:
        b = p.chromium.launch()
        for co, hau in (('', ''), ('&gopsucmanh=0', '-cu')):
            pg = b.new_page(**SZ)
            pg.on('pageerror', lambda e: errs.append(str(e)))
            pg.goto(URL + co)
            pg.wait_for_function('window.G && G.scene')
            pg.wait_for_timeout(500)
            pg.add_script_tag(path=os.path.join(GAME, 'tests', 'bot.js'))
            pg.add_script_tag(path=os.path.join(GAME, 'tests', 'setup.js'))
            shot = lambda ten, cho=400: (pg.wait_for_timeout(cho), pg.screenshot(path=os.path.join(HERE, 'anh-' + ten + hau + '.png')))
            pg.evaluate("() => { G.testSave({ lvl: 6, tier: 1 }); G.save.sound = false; G.setScene(G.Village); }")
            pg.wait_for_timeout(700)
            if not hau:
                shot('lang')
            # mài kiếm +2 (đổi thật trên bản lưu → G.lucChienUI.kiem tự thấy và hiện dải)
            pg.evaluate("() => { const w = G.weaponById(G.save.carry[0]); w.sharpen = (w.sharpen || 0) + 2; }")
            shot('sau-mai', 900)
            if hau:
                pg.close(); continue
            pg.wait_for_timeout(3000)
            pg.evaluate("() => { G.save.heroes[G.save.hero].lvl += 1; }")
            shot('sau-len-cap', 900)
            pg.wait_for_timeout(3000)
            pg.evaluate("() => { G.hanhTrang.openVillage(); G.hanhTrang.tab = 'hero'; }")
            shot('hanh-trang', 600)
            pg.close()
        b.close()
    print('lỗi:', errs[:5] if errs else 'không')
    return 1 if errs else 0


sys.exit(main())
