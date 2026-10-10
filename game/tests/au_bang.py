"""AUDIT bảng hành trang / lò rèn (phiên au-van-hanh-ui, mục 6.4). CHỈ CHỤP, không sửa game.
Chụp ở iPhone ngang 844x390: lò rèn (Mài, Nâng bậc), hành trang thẻ Vũ khí khi đang chọn một món trong rương (xem có so sánh với món đang mang không).
Chạy từ thư mục game:  python3 tests/au_bang.py"""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from ui_lib import ROOT, URL
from playwright.sync_api import sync_playwright

OUT = os.path.join(os.path.dirname(ROOT), 'docs', 'review', 'anh')
with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page(viewport={'width': 844, 'height': 390}, device_scale_factor=2, is_mobile=True, has_touch=True)
    errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto(URL); pg.wait_for_function('window.G && G.scene')
    pg.add_script_tag(path=os.path.join(ROOT, 'tests', 'setup.js')); pg.wait_for_timeout(300)
    pg.evaluate("""() => { G.testSave({ lvl: 12, tier: 1, sharpen: 2, gold: 3000 }); const sv = G.save; sv.ore = 40; sv.stones = 12; sv.mats = [30, 10, 0];
      G.newWeapon(sv, 'spear', 2); G.newWeapon(sv, 'hammer', 1); G.persist(); G.setScene(G.Village); }""")
    pg.wait_for_timeout(300)
    for ft in ('sharpen', 'tier'):
        pg.evaluate("(t) => { G.villageApi.open('ren'); G.villageApi.V.ftab = t; G.villageApi.V.sel = G.save.carry[0]; }", ft)
        pg.wait_for_timeout(500)
        pg.screenshot(path=os.path.join(OUT, f'bang-lo-ren-{ft}.png'), scale='css')
    pg.evaluate("() => { G.villageApi.V.tab = 'hub'; G.hanhTrang.openVillage(); G.hanhTrang.tab = 'weapon'; G.hanhTrang.sel = G.save.weapons[2].id; }")
    pg.wait_for_timeout(500)
    pg.screenshot(path=os.path.join(OUT, 'bang-hanh-trang-vu-khi.png'), scale='css')
    b.close()
print('lỗi JS:', errs or 'không có')
